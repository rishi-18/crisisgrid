const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Volunteer = require('../models/Volunteer');
const { verifyToken, requireRole } = require('../middleware/auth');

/**
 * @route GET /api/assignments
 * @desc Get all assignments (Concept 12: multi-populate / Join equivalent)
 */
router.get('/', verifyToken, requireRole('coordinator'), async (req, res) => {
  try {
    // Concept 12: Using .populate() for joins ($lookup replacement)
    const assignments = await Assignment.find()
      .populate('volunteerId', 'name skills')
      .populate('toCampId', 'name zone')
      .sort({ createdAt: -1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/assignments
 * @desc Create new assignment (Concept 3: Create)
 */
router.post('/', verifyToken, requireRole('coordinator'), async (req, res) => {
  try {
    const assignment = new Assignment(req.body);
    await assignment.save();
    
    // Update volunteer status
    await Volunteer.findByIdAndUpdate(req.body.volunteerId, { status: 'in_transit' });
    
    res.status(201).json(assignment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route PATCH /api/assignments/active/:volunteerId
 * @desc Update assignment status (Concept 4: $set)
 */
router.patch('/active/:volunteerId', verifyToken, requireRole('coordinator'), async (req, res) => {
  try {
    const { status } = req.body;
    
    // Concept 4: Explicit $set usage
    const assignment = await Assignment.findOneAndUpdate(
      { volunteerId: req.params.volunteerId, status: 'active' },
      { $set: { status: status === 'deployed' ? 'completed' : 'active' } }, 
      { new: true }
    );

    if (!assignment) return res.status(404).json({ error: 'Active assignment not found' });

    if (status === 'deployed') {
      await Volunteer.findOneAndUpdate(
        { _id: req.params.volunteerId },
        { $set: { status: 'deployed' } }
      );
    }

    res.json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route DELETE /api/assignments/:id
 * @desc Hard delete assignment (Concept 3: Delete)
 */
router.delete('/:id', verifyToken, requireRole('coordinator'), async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    res.json({ message: 'Assignment record deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
