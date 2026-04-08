const mongoose = require('mongoose');

const campSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  zone: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  status: {
    type: String,
    enum: ["stable", "strained", "critical"],
    default: "stable",
  },
  capacity: {
    type: Number,
    required: true,
  },
  currentOccupancy: {
    type: Number,
    default: 0,
  },
  inventory: [
    {
      resourceType: {
        type: String,
        enum: ["food", "water", "medicine", "shelter"],
      },
      quantity: Number,
      unit: String,
      threshold: Number,
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  operatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Camp: 2dsphere index on location field for geospatial queries
campSchema.index({ location: '2dsphere' });

// Camp: compound index on { zone: 1, status: 1 } for area-based status filtering
campSchema.index({ zone: 1, status: 1 });

module.exports = mongoose.model('Camp', campSchema);
