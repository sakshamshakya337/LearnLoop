const express = require('express');
const supabaseAdmin = require('../utils/supabaseClient');
const { generateFlashcards } = require('../services/aiService');
const router = express.Router();

// POST /api/flashcards/generate/:moduleId
router.post('/generate/:moduleId', async (req, res) => {
  try {
    // 1. Fetch module
    const { data: moduleData, error: modErr } = await supabaseAdmin
      .from('modules')
      .select('*')
      .eq('id', req.params.moduleId)
      .single();

    if (modErr || !moduleData) return res.status(404).json({ error: 'Module not found' });

    let notesText = '';
    const notesJson = moduleData.notes_json;
    if (notesJson) {
      notesText = `${notesJson.title || ''}\n\n${notesJson.summary || ''}\n\n`;
      if (notesJson.sections) {
        notesJson.sections.forEach(s => {
          notesText += `## ${s.heading}\n${s.content || (s.points && s.points.join('\n'))}\n\n`;
        });
      }
    } else {
      notesText = moduleData.raw_text || '';
    }

    // 2. Generate flashcards via AI Service
    const cards = await generateFlashcards(notesText.slice(0, 8000));
    
    if (!cards || !cards.length) throw new Error('No flashcards generated');

    // 3. Save to Supabase
    const rows = cards.map(card => ({
      module_id: req.params.moduleId,
      question: card.question,
      answer: card.answer,
      interval: 1,
      ease: 2.5
    }));

    const { data: saved, error: saveErr } = await supabaseAdmin
      .from('flashcards')
      .insert(rows)
      .select();

    if (saveErr) throw saveErr;

    res.json({ success: true, count: saved.length, flashcards: saved });
  } catch (err) {
    console.error('Flashcard gen error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/flashcards/:moduleId — fetch existing flashcards
router.get('/:moduleId', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('flashcards')
      .select('*')
      .eq('module_id', req.params.moduleId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
