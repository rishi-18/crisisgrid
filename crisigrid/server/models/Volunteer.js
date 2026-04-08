const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  skills: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ["unassigned", "in_transit", "deployed"],
    default: "unassigned",
  },
  currentCampId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Camp",
    default: null,
  },
  assignedCampId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Camp",
    default: null,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: {
      type: [Number],
    },
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
});

// Adding 2dsphere index for volunteer location tracking as well (optional but recommended for real-time tracking)
volunteerSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Volunteer', volunteerSchema);
