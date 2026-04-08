const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const { verifyToken, requireRole } = require('../middleware/auth');

/**
 * @route GET /api/alerts
 * @desc Get all alerts with sorting and limit
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    // Concept 6: find(), sort(), limit()
    const alerts = await Alert.find()
      .populate('campId', 'name zone')
      .sort({ createdAt: -1 })
      .limit(50); 
      
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/alerts
 * @desc Create manual alert (Coordinator only)
 */
router.post('/', verifyToken, requireRole('coordinator'), async (req, res) => {
  try {
    // Concept 3: Create (CRUD)
    const alert = new Alert(req.body);
    const saved = await alert.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route PATCH /api/alerts/:id/resolve
 * @desc Mark as resolved using explicit $set
 */
router.patch('/:id/resolve', verifyToken, requireRole('coordinator', 'operator'), async (req, res) => {
  try {
    // Concept 4: Explicit use of $set operator
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id },
      { 
        $set: { 
          resolved: true, 
          resolvedAt: Date.now() 
        } 
      },
      { new: true }
    );
    
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
