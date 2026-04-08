const express = require('express');
const router = express.Router();
const Volunteer = require('../models/Volunteer');
const Assignment = require('../models/Assignment');
const { verifyToken, requireRole } = require('../middleware/auth');

/**
 * @route GET /api/volunteers
 * @desc Get all volunteers
 */
router.get('/', verifyToken, requireRole('coordinator'), async (req, res) => {
  try {
    const volunteers = await Volunteer.find().populate('assignedCampId currentCampId');
    res.json(volunteers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/volunteers/:id
 * @desc Get single volunteer details (Concept 6: findOne)
 */
router.get('/:id', verifyToken, requireRole('coordinator'), async (req, res) => {
  try {
    // Concept 6: findOne()
    const volunteer = await Volunteer.findOne({ _id: req.params.id }).populate('assignedCampId currentCampId');
    if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });
    res.json(volunteer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/volunteers
 */
router.post('/', verifyToken, requireRole('coordinator'), async (req, res) => {
  try {
    const volunteer = new Volunteer(req.body);
    const saved = await volunteer.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route PATCH /api/volunteers/:id/assign
 */
router.patch('/:id/assign', verifyToken, requireRole('coordinator'), async (req, res) => {
  try {
    const { campId } = req.body;
    let status = 'in_transit';
    let assignedCampId = campId;

    if (!campId) {
      status = 'unassigned';
      assignedCampId = null;
    }

    const volunteer = await Volunteer.findByIdAndUpdate(
      req.params.id,
      { assignedCampId, status },
      { new: true }
    );

    if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });

    // Handle Assignment record
    if (campId) {
      await Assignment.create({
        volunteerId: volunteer._id,
        campId: campId,
        role: volunteer.skills[0] || 'general',
        status: 'active'
      });
    }

    res.json(volunteer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route DELETE /api/volunteers/:id
 */
router.delete('/:id', verifyToken, requireRole('coordinator'), async (req, res) => {
  try {
    const del = await Volunteer.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({ error: 'Volunteer not found' });
    res.json({ message: 'Volunteer removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
