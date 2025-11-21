const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all auction calendar entries
router.get('/', async (req, res) => {
  try {
    const result = await db.pool.query(
      'SELECT * FROM auction_calendar ORDER BY auction_date ASC'
    );
    res.json({ auctions: result.rows });
  } catch (error) {
    console.error('Error fetching auction calendar:', error);
    res.status(500).json({ error: 'Failed to fetch auction calendar' });
  }
});

// Create new auction entry
router.post('/', async (req, res) => {
  try {
    const {
      auction_date,
      auction_name,
      url,
      property_address,
      description,
      notes
    } = req.body;

    const result = await db.pool.query(
      `INSERT INTO auction_calendar 
       (auction_date, auction_name, url, property_address, description, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [auction_date, auction_name, url, property_address, description, notes]
    );

    res.json({ auction: result.rows[0] });
  } catch (error) {
    console.error('Error creating auction entry:', error);
    res.status(500).json({ error: 'Failed to create auction entry' });
  }
});

// Update auction entry
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      auction_date,
      auction_name,
      url,
      property_address,
      description,
      notes,
      is_completed
    } = req.body;

    const result = await db.pool.query(
      `UPDATE auction_calendar 
       SET auction_date = $1, auction_name = $2, url = $3,
           property_address = $4, description = $5, notes = $6,
           is_completed = $7, updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [auction_date, auction_name, url, property_address, description, notes, is_completed, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Auction entry not found' });
    }

    res.json({ auction: result.rows[0] });
  } catch (error) {
    console.error('Error updating auction entry:', error);
    res.status(500).json({ error: 'Failed to update auction entry' });
  }
});

// Mark auction as completed
router.patch('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.pool.query(
      'UPDATE auction_calendar SET is_completed = true, updated_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Auction entry not found' });
    }

    res.json({ auction: result.rows[0] });
  } catch (error) {
    console.error('Error marking auction as completed:', error);
    res.status(500).json({ error: 'Failed to mark auction as completed' });
  }
});

// Delete auction entry
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.pool.query(
      'DELETE FROM auction_calendar WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Auction entry not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting auction entry:', error);
    res.status(500).json({ error: 'Failed to delete auction entry' });
  }
});

module.exports = router;