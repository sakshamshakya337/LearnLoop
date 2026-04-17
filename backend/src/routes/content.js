const express = require('express');
const multer = require('multer');
const { parsePdf, generateNotes, generateFlashcards, generateQuizzes } = require('../services/aiService');
const supabaseAdmin = require('../utils/supabaseClient');

const router = express.Router();

// Configure multer to hold files in memory for fast parsing. Limit: 1MB
const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 1 * 1024 * 1024 } // 1MB limit for quick NLP processing
});

/**
 * Helper to get the user ID from the request headers
 * In standard prod, this would be an auth middleware extracting JWT.
 */
function getUserId(req) {
  const uid = req.headers['x-user-id'];
  if (!uid || uid === 'null' || uid === 'undefined' || uid === '00000000-0000-0000-0000-000000000000') {
    throw new Error('Authentication required: Missing x-user-id header');
  }
  return uid;
}

/**
 * GET /api/content
 * Returns all modules for the authenticated user
 */
router.get('/', async (req, res) => {
  let userId;
  try {
    userId = getUserId(req);
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
  
  try {
    // Fetch modules
    const { data: modules, error } = await supabaseAdmin
      .from('modules')
      .select(`
        *,
        flashcards:flashcards(count),
        quiz_questions:quiz_questions(count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Flatten the counts for the frontend
    const enriched = (modules || []).map(m => ({
      ...m,
      flashcards_count: m.flashcards?.[0]?.count || 0,
      quiz_questions_count: m.quiz_questions?.[0]?.count || 0
    }));

    res.json({ modules: enriched });
  } catch (err) {
    console.error('Error fetching modules:', err);
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
});

/**
 * GET /api/content/:moduleId
 * Returns full module including notes, flashcards, quizzes
 */
router.get('/:moduleId', async (req, res) => {
  const { moduleId } = req.params;
  
  try {
    const { data: moduleData, error: modErr } = await supabaseAdmin.from('modules').select('*').eq('id', moduleId).single();
    if (modErr) throw modErr;

    const { data: notes } = await supabaseAdmin.from('notes').select('*').eq('module_id', moduleId).single();
    const { data: flashcards } = await supabaseAdmin.from('flashcards').select('*').eq('module_id', moduleId);
    const { data: quizzes } = await supabaseAdmin.from('quiz_questions').select('*').eq('module_id', moduleId);

    res.json({
      module: moduleData,
      notes: notes || null,
      flashcards: flashcards || [],
      quizzes: quizzes || []
    });
  } catch (err) {
    console.error('Error fetching module payload:', err);
    res.status(500).json({ error: 'Failed to fetch module details' });
  }
});

/**
 * POST /api/content/upload
 * Pipeline: Extract PDF -> Generate Notes -> Returns to Client for Review
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    let extractedText = '';

    if (req.file) {
      if (req.file.mimetype === 'application/pdf') {
        extractedText = await parsePdf(req.file.buffer);
      } else {
        extractedText = req.file.buffer.toString('utf-8');
      }
    } else if (req.body.text) {
      extractedText = req.body.text;
    } else {
      return res.status(400).json({ error: 'No file or text provided' });
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text' });
    }

    // Generate Notes via Gemini
    const notesData = await generateNotes(extractedText);

    // Return to client
    res.json({ success: true, notes: notesData, rawText: extractedText.slice(0, 5000) });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Processing failed.' });
  }
});

module.exports = router;
