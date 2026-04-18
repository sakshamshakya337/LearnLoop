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

// DELETE /api/modules/:id — remove a module securely
router.delete('/:id', async (req, res) => {
  try {
    const userId = getUserId(req);
    
    // 1. Check ownership first to avoid deleting other users' modules
    const { data: module, error: fetchError } = await supabaseAdmin
      .from('modules')
      .select('user_id')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    if (module.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized: You do not own this module' });
    }

    // 2. Perform deletion
    const { error: deleteError } = await supabaseAdmin
      .from('modules')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', userId); // Extra safety

    if (deleteError) throw deleteError;
    res.json({ success: true, message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Module delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
