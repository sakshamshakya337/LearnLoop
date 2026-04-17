const express = require('express');
const supabaseAdmin = require('../utils/supabaseClient');
const router = express.Router();

function getUserId(req) {
  const uid = req.headers['x-user-id'];
  if (!uid || uid === 'null' || uid === 'undefined' || uid === '00000000-0000-0000-0000-000000000000') {
    throw new Error('Authentication required: Missing x-user-id header');
  }
  return uid;
}

// POST /api/modules — save a new module
router.post('/', async (req, res) => {
  const { title, notes, rawText } = req.body;
  let userId;
  try {
    userId = getUserId(req);
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }

  if (!title && !notes) return res.status(400).json({ error: 'Missing fields' });

  try {
    const { data, error } = await supabaseAdmin
      .from('modules')
      .insert({
        user_id: userId,
        title: title || notes.title,
        notes_json: notes,
        raw_text: rawText,
        status: 'ready',
        source_type: 'document'
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, module: data });
  } catch (error) {
    console.error('Module save error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/modules/:id — fetch a module
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('modules')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: 'Not found' });
  }
});

// PATCH /api/modules/:id/notes — update notes after user edits
router.patch('/:id/notes', async (req, res) => {
  try {
    const { notes } = req.body;
    const { data, error } = await supabaseAdmin
      .from('modules')
      .update({ notes_json: notes })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, module: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
