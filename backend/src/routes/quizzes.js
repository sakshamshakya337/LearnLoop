const express = require('express');
const supabaseAdmin = require('../utils/supabaseClient');
const { generateQuizzes } = require('../services/aiService');
const router = express.Router();

function getUserId(req) {
  const uid = req.headers['x-user-id'];
  if (!uid || uid === 'null' || uid === 'undefined' || uid === '00000000-0000-0000-0000-000000000000') {
    throw new Error('Authentication required: Missing x-user-id header');
  }
  return uid;
}

// POST /api/quizzes/generate/:moduleId
router.post('/generate/:moduleId', async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { count } = req.body; // New parameter

    // 1. Fetch module
    const { data: moduleData, error: modErr } = await supabaseAdmin
      .from('modules')
      .select('*')
      .eq('id', moduleId)
      .single();

    if (modErr || !moduleData) return res.status(404).json({ error: 'Module not found' });

    let textForQuiz = '';
    const notesJson = moduleData.notes_json;
    if (notesJson) {
      textForQuiz = `${notesJson.title || ''}\n\n${notesJson.summary || ''}\n\n`;
      if (notesJson.sections) {
        notesJson.sections.forEach(s => {
          textForQuiz += `## ${s.heading}\n${s.content || (s.points && s.points.join('\n'))}\n\n`;
        });
      }
    } else {
      textForQuiz = moduleData.raw_text || '';
    }

    // 2. Generate quizzes via AI Service
    const quizzes = await generateQuizzes(textForQuiz.slice(0, 10000), count || 5);
    
    if (!quizzes || !quizzes.length) throw new Error('No quizzes generated');

    // 3. Save to Supabase (quiz_questions table)
    const rows = quizzes.map(q => ({
      module_id: moduleId,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation
    }));

    const { data: saved, error: saveErr } = await supabaseAdmin
      .from('quiz_questions')
      .insert(rows)
      .select();

    if (saveErr) throw saveErr;

    res.json({ success: true, count: saved.length, questions: saved });
  } catch (err) {
    console.error('Quiz gen error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/quizzes/:moduleId — fetch existing questions
router.get('/:moduleId', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('quiz_questions')
      .select('*')
      .eq('module_id', req.params.moduleId);

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/quizzes/attempt — save score
router.post('/attempt', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { moduleId, score, total } = req.body;

    const { data, error } = await supabaseAdmin
      .from('quiz_attempts')
      .insert({
        user_id: userId,
        module_id: moduleId,
        score,
        total
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, attempt: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
