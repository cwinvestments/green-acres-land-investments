const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all property sources
router.get('/', async (req, res) => {
  try {
    const result = await db.pool.query(
      'SELECT * FROM property_sources ORDER BY name ASC'
    );
    res.json({ sources: result.rows });
  } catch (error) {
    console.error('Error fetching property sources:', error);
    res.status(500).json({ error: 'Failed to fetch property sources' });
  }
});

// Create new property source
router.post('/', async (req, res) => {
  try {
    const {
      name,
      url,
      username,
      password_encrypted,
      states,
      counties,
      notes,
      contact_info,
      is_active
    } = req.body;

    const result = await db.pool.query(
      `INSERT INTO property_sources 
       (name, url, username, password_encrypted, states, counties, notes, contact_info, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [name, url, username, password_encrypted, states, counties, notes, contact_info, is_active !== false]
    );

    res.json({ source: result.rows[0] });
  } catch (error) {
    console.error('Error creating property source:', error);
    res.status(500).json({ error: 'Failed to create property source' });
  }
});

// Update property source
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      url,
      username,
      password_encrypted,
      states,
      counties,
      notes,
      contact_info,
      is_active
    } = req.body;

    const result = await db.pool.query(
      `UPDATE property_sources 
       SET name = $1, url = $2, username = $3, password_encrypted = $4,
           states = $5, counties = $6, notes = $7, contact_info = $8,
           is_active = $9, updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [name, url, username, password_encrypted, states, counties, notes, contact_info, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property source not found' });
    }

    res.json({ source: result.rows[0] });
  } catch (error) {
    console.error('Error updating property source:', error);
    res.status(500).json({ error: 'Failed to update property source' });
  }
});

// Update last accessed timestamp
router.patch('/:id/access', async (req, res) => {
  try {
    const { id } = req.params;

    await db.pool.query(
      'UPDATE property_sources SET last_accessed = NOW() WHERE id = $1',
      [id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating last accessed:', error);
    res.status(500).json({ error: 'Failed to update last accessed' });
  }
});

// Delete property source
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.pool.query(
      'DELETE FROM property_sources WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property source not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting property source:', error);
    res.status(500).json({ error: 'Failed to delete property source' });
  }
});

module.exports = router;