const express = require('express');
const router = express.Router();
const Need = require('../models/Need');
const Camp = require('../models/Camp');
const { verifyToken, requireRole } = require('../middleware/auth');

/**
 * @route GET /api/needs
 * @desc Get all needs with complex filters ($in, $and, $gte)
 */
router.get('/', verifyToken, requireRole('coordinator', 'operator'), async (req, res) => {
  try {
    const { zone, urgency, minQuantity, status } = req.query;
    
    // Concept 5: Query Operators ($in, $and, $gte)
    let query = { $and: [] };
    
    if (zone) query.$and.push({ zone });
    
    // Support multiple urgency levels via $in
    if (urgency) {
      const urgencyList = urgency.split(',');
      query.$and.push({ urgency: { $in: urgencyList } });
    }

    if (minQuantity) {
      query.$and.push({ quantityNeeded: { $gte: parseInt(minQuantity) } });
    }

    if (status) query.$and.push({ status });
    
    // Fallback if no filters
    if (query.$and.length === 0) query = {};

    // Concept 6: find(), sort()
    // Concept 7: This query utilizes the compound index { zone: 1, resourceType: 1, urgency: 1 }
    const needs = await Need.find(query)
      .sort({ urgency: 1, createdAt: -1 })
      .limit(100);

    res.json(needs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/needs
 * @desc Create new need (Operator or Coordinator)
 */
router.post('/', verifyToken, requireRole('operator', 'coordinator'), async (req, res) => {
  try {
    const need = new Need(req.body);
    const savedNeed = await need.save();
    res.status(201).json(savedNeed);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route DELETE /api/needs/:id
 * @desc Delete a need (Coordinator only)
 */
router.delete('/:id', verifyToken, requireRole('coordinator'), async (req, res) => {
  try {
    const need = await Need.findByIdAndDelete(req.params.id);
    if (!need) return res.status(404).json({ error: 'Need not found' });
    res.json({ message: 'Need deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route PATCH /api/needs/:id/status
 * @desc Update need status (Coordinator only)
 */
router.patch('/:id/status', verifyToken, requireRole('coordinator'), async (req, res) => {
  try {
    const { status } = req.body;
    const need = await Need.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!need) return res.status(404).json({ error: 'Need not found' });
    res.json(need);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
