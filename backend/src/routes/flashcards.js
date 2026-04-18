const express = require('express');
const Groq = require('groq-sdk');
const supabaseAdmin = require('../utils/supabaseClient');
const router = express.Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Clean and cap text for AI consumption.
 */
function buildCleanNotesText(notesJson) {
  if (!notesJson) return '';
  const lines = [];
  if (notesJson.summary) lines.push(notesJson.summary.trim());
  if (Array.isArray(notesJson.sections)) {
    notesJson.sections.forEach(section => {
      if (section.content) {
        const cleaned = section.content
          .replace(/^#{1,6}\s+.+$/gm, '')
          .replace(/^\*\*.*?\*\*\s*$/gm, '')
          .replace(/\n{3,}/g, '\n\n')
          .trim();
        if (cleaned) lines.push(cleaned);
      }
    });
  }
  if (Array.isArray(notesJson.keyTerms) && notesJson.keyTerms.length > 0) {
    lines.push(`Key terms: ${notesJson.keyTerms.join(', ')}.`);
  }
  return lines.join('\n').trim().slice(0, 4000);
}

/**
 * AI Generation Call
 */
async function generateCardsFromChunk(text, count, difficulty) {
  const difficultyInstruction = difficulty === 'mixed'
    ? 'Mix easy, medium and hard cards.'
    : `Generate only "${difficulty}" difficulty cards.`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    temperature: 0.4,
    max_tokens: 1200,
    messages: [
      {
        role: 'system',
        content: `You are a flashcard generator. Return ONLY a JSON array, no markdown, no preamble.
Each item: {"question":"string","answer":"string","difficulty":"easy"|"medium"|"hard"}
Rules:
- Never ask about headings or document structure
- Answers max 2 sentences
- ${difficultyInstruction}`
      },
      {
        role: 'user',
        content: `Generate exactly ${count} flashcards from this content:\n\n${text}`
      }
    ]
  });

  const raw = completion.choices[0].message.content.trim()
    .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    throw new Error('Not an array');
  } catch {
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    return [];
  }
}

// POST /api/flashcards/generate/:moduleId
router.post('/generate/:moduleId', async (req, res) => {
  try {
    const moduleId = req.params.moduleId;
    const userId = req.body.userId; // Direct extraction as requested

    if (!userId) {
      return res.status(401).json({ error: 'User ID missing in request.' });
    }

    console.log(`[GENERATOR] Start for User: ${userId}, Module: ${moduleId}`);

    let requestedCount = parseInt(req.body.count) || 8;
    requestedCount = Math.max(5, Math.min(20, requestedCount));
    const difficulty = ['easy', 'medium', 'hard', 'mixed'].includes(req.body.difficulty)
      ? req.body.difficulty : 'mixed';

    // 1. Fetch Module & Verify Ownership (STRICT SECURITY)
    const { data: module, error: modErr } = await supabaseAdmin
      .from('modules')
      .select('id, user_id, notes_json')
      .eq('id', moduleId)
      .single();

    if (modErr || !module) {
      return res.status(404).json({ error: 'Module not found.' });
    }
    
    // Ownership Check: Ensures user only generates cards for notes they own
    if (module.user_id !== userId) {
      console.warn(`[SECURITY] Forbidden: User ${userId} tried to access module owned by ${module.user_id}`);
      return res.status(403).json({ error: 'Permission denied. You do not own this module.' });
    }

    const cleanText = buildCleanNotesText(module.notes_json);
    if (!cleanText || cleanText.length < 50) {
      return res.status(400).json({ error: 'Not enough content to generate cards.' });
    }

    // 2. Generate Cards
    const cards = await generateCardsFromChunk(cleanText, requestedCount, difficulty);

    const rows = cards.map(card => ({
      module_id: moduleId,
      user_id: userId,
      question: card.question?.trim(),
      answer: card.answer?.trim(),
      difficulty: ['easy', 'medium', 'hard'].includes(card.difficulty) ? card.difficulty : 'medium',
      next_review: new Date().toISOString()
    })).filter(c => c.question && c.answer).slice(0, requestedCount);

    if (rows.length === 0) {
      return res.status(500).json({ error: 'AI failed to generate cards. Try again.' });
    }

    // 3. Database Sync (Delete then Insert)
    // We explicitly clear old cards for this specific module/user combo
    await supabaseAdmin.from('flashcards')
      .delete()
      .eq('module_id', moduleId)
      .eq('user_id', userId);

    // Insert New Cards
    const { data: saved, error: saveErr } = await supabaseAdmin
      .from('flashcards')
      .insert(rows)
      .select('id, question, answer, difficulty'); 

    if (saveErr) {
      console.error('[DB ERROR]', saveErr.message);
      return res.status(500).json({ error: saveErr.message });
    }

    res.json({ success: true, count: saved.length, flashcards: saved });

  } catch (err) {
    console.error('[SYSTEM ERROR]', err.message);
    res.status(500).json({ error: 'System error during generation. Please try again.' });
  }
});

// GET /api/flashcards/:moduleId
router.get('/:moduleId', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('flashcards')
    .select('id, question, answer, difficulty, next_review, created_at')
    .eq('module_id', req.params.moduleId)
    .order('created_at', { ascending: true });

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
