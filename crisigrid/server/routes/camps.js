const express = require('express');
const { Camp, Alert } = require('../models');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * @route GET /api/camps
 * @desc Get all camps (Coordinator only)
 */
router.get('/', verifyToken, requireRole('coordinator', 'operator'), async (req, res) => {
  try {
    const camps = await Camp.find().sort({ zone: 1 });
    res.json(camps);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching camps', error: err.message });
  }
});

/**
 * @route GET /api/camps/nearest
 * @desc Public route to find nearest 5 camps using geospatial query
 */
router.get('/nearest', async (req, res) => {
  try {
    const { lng, lat } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({ message: 'lng and lat query parameters are required' });
    }

    const nearestCamps = await Camp.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          }
        }
      }
    }).limit(5).select('name zone status inventory');

    res.json(nearestCamps);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching nearest camps', error: err.message });
  }
});

/**
 * @route GET /api/camps/:id
 * @desc Get single camp (Coordinator or Operator)
 */
router.get('/:id', verifyToken, requireRole('coordinator', 'operator'), async (req, res) => {
  try {
    const camp = await Camp.findById(req.params.id);
    if (!camp) return res.status(404).json({ message: 'Camp not found' });
    
    res.json(camp);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching camp', error: err.message });
  }
});

/**
 * @route POST /api/camps
 * @desc Create new camp (Coordinator only)
 */
router.post('/', verifyToken, requireRole('coordinator'), async (req, res) => {
  try {
    const { name, zone, location, capacity } = req.body;
    
    if (!location || !location.coordinates || location.coordinates.length !== 2) {
      return res.status(400).json({ error: 'Geospatial coordinates (longitude, latitude) are required.' });
    }

    const camp = new Camp(req.body);
    const savedCamp = await camp.save();
    res.status(201).json(savedCamp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route DELETE /api/camps/:id
 * @desc Delete a camp (Coordinator only)
 */
router.delete('/:id', verifyToken, requireRole('coordinator'), async (req, res) => {
  try {
    const camp = await Camp.findByIdAndDelete(req.params.id);
    if (!camp) return res.status(404).json({ error: 'Camp not found' });
    res.json({ message: 'Camp deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route PATCH /api/camps/:id/inventory
 * @desc Update inventory item (Operator or Coordinator)
 */
router.patch('/:id/inventory', verifyToken, requireRole('operator', 'coordinator'), async (req, res) => {
  try {
    const { id } = req.params;
    const { resourceType, quantity, unit } = req.body;

    // Authorization check for operators
    if (req.user.role === 'operator' && req.user.assignedCampId !== id) {
      return res.status(403).json({ error: 'Unauthorized. You can only manage your assigned camp.' });
    }

    const updatedCamp = await Camp.findOneAndUpdate(
      { _id: id },
      { 
        $set: { 
          "inventory.$[elem].quantity": quantity,
          "inventory.$[elem].unit": unit,
          "inventory.$[elem].lastUpdated": Date.now()
        } 
      },
      { 
        arrayFilters: [{ "elem.resourceType": resourceType }],
        new: true 
      }
    );

    if (!updatedCamp) return res.status(404).json({ error: 'Camp or resource type not found' });

    // Check threshold for the updated item
    const item = updatedCamp.inventory.find(i => i.resourceType === resourceType);
    if (item && item.quantity <= (item.threshold || 0)) {
      await Alert.create({
        campId: id,
        zone: updatedCamp.zone,
        type: 'low_stock',
        resourceType: resourceType,
        message: `ALERT: ${resourceType} is low at ${updatedCamp.name}.`,
        severity: 'critical'
      });
    }

    res.json(updatedCamp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
