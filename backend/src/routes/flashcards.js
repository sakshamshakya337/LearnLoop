const express = require('express');
const Groq = require('groq-sdk');
const supabaseAdmin = require('../utils/supabaseClient');
const router = express.Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Flatten notes_json into clean plain text (NO headings, NO section titles)
// Only extracts actual content — facts, definitions, explanations
// ─────────────────────────────────────────────────────────────────────────────
function buildCleanNotesText(notesJson) {
  if (!notesJson) return '';

  const lines = [];

  // Add summary if present
  if (notesJson.summary) {
    lines.push(notesJson.summary.trim());
    lines.push('');
  }

  // Add section CONTENT only — skip headings completely
  if (Array.isArray(notesJson.sections)) {
    notesJson.sections.forEach(section => {
      if (section.content) {
        // Strip any markdown heading syntax from content too
        const cleaned = section.content
          .replace(/^#{1,6}\s+.+$/gm, '')     // remove ## headings inside content
          .replace(/^\*\*.*?\*\*\s*$/gm, '')   // remove lines that are only bold titles
          .replace(/\n{3,}/g, '\n\n')           // collapse excess newlines
          .trim();
        if (cleaned) {
          lines.push(cleaned);
          lines.push('');
        }
      }
    });
  }

  // Add key terms as context sentences (not as a list)
  if (Array.isArray(notesJson.keyTerms) && notesJson.keyTerms.length > 0) {
    lines.push(`Important terms in this content include: ${notesJson.keyTerms.join(', ')}.`);
  }

  return lines.join('\n').trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Split large text into chunks so we don't exceed Groq context
// Each chunk ~6000 chars, with 200 char overlap to preserve context
// ─────────────────────────────────────────────────────────────────────────────
function chunkText(text, chunkSize = 6000, overlap = 200) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;
    if (start >= text.length) break;
  }
  return chunks;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Call Groq to generate flashcards from one chunk
// difficulty: 'easy' | 'medium' | 'hard' | 'mixed'
// count: how many cards to generate from this chunk
// ─────────────────────────────────────────────────────────────────────────────
async function generateCardsFromChunk(chunkText, count, difficulty) {
  const difficultyInstruction = difficulty === 'mixed'
    ? `Generate a mix: roughly 30% easy, 40% medium, 30% hard cards.`
    : `Generate only "${difficulty}" difficulty cards.`;

  const systemPrompt = `You are an expert flashcard creator for students. Your job is to generate high-quality study flashcards from content.

STRICT RULES:
1. NEVER use section headings, chapter titles, or topic names as questions (e.g. never ask "What is the title of section 2?")
2. Questions must test UNDERSTANDING of facts, definitions, processes, comparisons, or applications
3. Questions should be specific and unambiguous
4. Answers must be concise but complete — 1 to 4 sentences max
5. ${difficultyInstruction}
6. Easy = recall a single fact or definition
7. Medium = explain a concept, state a relationship, or describe a process
8. Hard = compare/contrast, apply to a scenario, explain why/how, or synthesize multiple concepts
9. Do NOT repeat similar questions
10. Do NOT include questions about formatting, headings, document structure, or meta-information

Return ONLY a valid JSON array. No markdown, no preamble, no explanation outside the array.

Each item must be exactly:
{
  "question": "string",
  "answer": "string",
  "difficulty": "easy" | "medium" | "hard"
}`;

  const userPrompt = `Generate exactly ${count} flashcards from the following study content. Cover ALL distinct facts and concepts found in the text — do not focus only on the beginning.

Content:
${chunkText}`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.5,
    max_tokens: 4096,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]
  });

  const raw = completion.choices[0].message.content.trim();

  const clean = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    const parsed = JSON.parse(clean);
    if (!Array.isArray(parsed)) throw new Error('Response is not an array');
    return parsed;
  } catch (e) {
    const match = clean.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Failed to parse flashcard JSON: ' + e.message);
  }
}

// POST /api/flashcards/generate/:moduleId
router.post('/generate/:moduleId', async (req, res) => {
  try {
    const moduleId = req.params.moduleId;

    let requestedCount = parseInt(req.body.count) || 20;
    requestedCount = Math.max(5, Math.min(100, requestedCount));

    const difficulty = ['easy', 'medium', 'hard', 'mixed'].includes(req.body.difficulty)
      ? req.body.difficulty
      : 'mixed';

    const replace = req.body.replace === true || req.body.replace === 'true';

    const { data: module, error: modErr } = await supabaseAdmin
      .from('modules')
      .select('*')
      .eq('id', moduleId)
      .single();

    if (modErr || !module) return res.status(404).json({ error: 'Module not found' });

    const cleanText = buildCleanNotesText(module.notes_json);

    if (!cleanText || cleanText.length < 50) {
      return res.status(400).json({ error: 'Module has insufficient content to generate flashcards' });
    }

    const chunks = chunkText(cleanText, 6000, 200);

    const cardsPerChunk = chunks.map((_, i) => {
      if (chunks.length === 1) return requestedCount;
      const base = Math.floor(requestedCount / chunks.length);
      const remainder = requestedCount % chunks.length;
      return i < remainder ? base + 1 : base;
    });

    const chunkResults = [];
    for (const [i, chunk] of chunks.entries()) {
      try {
        const result = await generateCardsFromChunk(chunk, Math.max(1, cardsPerChunk[i]), difficulty);
        chunkResults.push(result);
      } catch (err) {
        console.error(`Chunk ${i} failed:`, err.message);
        chunkResults.push([]);
      }
    }
    let allCards = chunkResults.flat();

    const seen = new Set();
    allCards = allCards.filter(card => {
      if (!card.question || !card.answer) return false;
      const key = card.question.toLowerCase().replace(/[^a-z0-9\s]/g, '').slice(0, 60).trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    allCards = allCards.slice(0, requestedCount);

    if (allCards.length === 0) {
      return res.status(500).json({ error: 'AI failed to generate valid flashcards. Please try again.' });
    }

    if (replace) {
      await supabaseAdmin.from('flashcards').delete().eq('module_id', moduleId);
    }

    const rows = allCards.map(card => ({
      module_id: moduleId,
      question: card.question.trim(),
      answer: card.answer.trim(),
      difficulty: ['easy', 'medium', 'hard'].includes(card.difficulty) ? card.difficulty : 'medium',
      next_review: new Date().toISOString(),
      interval: 1,
      ease: 2.5
    }));

    const { data: saved, error: saveErr } = await supabaseAdmin
      .from('flashcards')
      .insert(rows)
      .select();

    if (saveErr) return res.status(500).json({ error: saveErr.message });

    res.json({
      success: true,
      count: saved.length,
      requested: requestedCount,
      chunks_processed: chunks.length,
      flashcards: saved
    });

  } catch (err) {
    console.error('Flashcard generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/flashcards/:moduleId
router.get('/:moduleId', async (req, res) => {
  let query = supabaseAdmin
    .from('flashcards')
    .select('*')
    .eq('module_id', req.params.moduleId)
    .order('difficulty', { ascending: true })
    .order('created_at', { ascending: true });

  if (req.query.difficulty) {
    query = query.eq('difficulty', req.query.difficulty);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE /api/flashcards/:moduleId
router.delete('/:moduleId', async (req, res) => {
  const { error } = await supabaseAdmin
    .from('flashcards')
    .delete()
    .eq('module_id', req.params.moduleId);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
