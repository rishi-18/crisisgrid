const express = require('express');
const { Camp, Need, Volunteer } = require('../models');
const { verifyToken, requireRole } = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

/**
 * @route GET /api/analytics/gap-analysis
 * @desc Get supply-demand gaps (Coordinator only)
 */
router.get('/gap-analysis', verifyToken, requireRole('coordinator'), async (req, res) => {
  try {
    const gapData = await Camp.aggregate([
      // Stage 1: Unwind the inventory array to treat each resource separately
      { $unwind: "$inventory" },

      // Stage 2: Group by zone and resourceType across all camps
      {
        $group: {
          _id: { 
            zone: "$zone", 
            resourceType: "$inventory.resourceType" 
          },
          totalSupply: { $sum: "$inventory.quantity" },
          campCount: { $sum: 1 }
        }
      },

      // Stage 3: Lookup open needs for this specific zone and resourceType
      {
        $lookup: {
          from: "needs",
          let: { zoneId: "$_id.zone", resType: "$_id.resourceType" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$zone", "$$zoneId"] },
                    { $eq: ["$resourceType", "$$resType"] },
                    { $eq: ["$status", "open"] }
                  ]
                }
              }
            },
            {
              $group: {
                _id: null,
                totalNeeded: { $sum: "$quantityNeeded" }
              }
            }
          ],
          as: "needData"
        }
      },

      // Stage 4: Extract totalNeeded and calculate the gap
      {
        $addFields: {
          totalNeeded: { 
            $ifNull: [{ $arrayElemAt: ["$needData.totalNeeded", 0] }, 0] 
          }
        }
      },
      {
        $addFields: {
          gap: { $subtract: ["$totalNeeded", "$totalSupply"] }
        }
      },

      // Stage 5: Only return documents where there is a deficiency (Gap > 0)
      { $match: { gap: { $gt: 0 } } },

      // Stage 6: Sort by most critical gap
      { $sort: { gap: -1 } }
    ]);

    res.json(gapData);
  } catch (err) {
    res.status(500).json({ message: 'Error running gap analysis', error: err.message });
  }
});

/**
 * @route GET /api/analytics/zone/:zone
 * @desc Zone-specific summary (Coordinator only)
 */
router.get('/zone/:zone', verifyToken, requireRole('coordinator'), async (req, res) => {
  try {
    const { zone } = req.params;

    const campCount = await Camp.countDocuments({ zone });
    
    // Volunteers in this zone (assigned to camps in this zone)
    const campsInZone = await Camp.find({ zone }).select('_id');
    const campIds = campsInZone.map(c => c._id);
    const volunteerStats = await Volunteer.aggregate([
      { $match: { currentCampId: { $in: campIds } } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Needs breakdown
    const needsStats = await Need.aggregate([
      { $match: { zone, status: 'open' } },
      { $group: { _id: "$urgency", count: { $sum: 1 }, totalQuantity: { $sum: "$quantityNeeded" } } }
    ]);

    // Inventory totals
    const inventoryStats = await Camp.aggregate([
      { $match: { zone } },
      { $unwind: "$inventory" },
      { $group: { _id: "$inventory.resourceType", total: { $sum: "$inventory.quantity" }, unit: { $first: "$inventory.unit" } } }
    ]);

    res.json({
      zone,
      totalCamps: campCount,
      volunteers: volunteerStats,
      needs: needsStats,
      inventory: inventoryStats
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching zone analytics', error: err.message });
  }
});

/**
 * @route GET /api/analytics/overview
 * @desc Platform-wide overview (Coordinator only)
 */
router.get('/overview', verifyToken, requireRole('coordinator'), async (req, res) => {
  try {
    const campStats = await Camp.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const needStats = await Need.aggregate([
      { $match: { status: 'open' } },
      { $group: { _id: "$urgency", count: { $sum: 1 } } }
    ]);

    const volunteerStats = await Volunteer.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    res.json({
      camps: campStats,
      needs: needStats,
      volunteers: volunteerStats
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching platform overview', error: err.message });
  }
});

module.exports = router;
