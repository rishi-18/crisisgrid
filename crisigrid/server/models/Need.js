const mongoose = require('mongoose');

const needSchema = new mongoose.Schema({
  campId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Camp",
    required: true,
  },
  zone: {
    type: String,
    required: true,
  },
  resourceType: {
    type: String,
    enum: ["food", "water", "medicine", "shelter"],
  },
  quantityNeeded: {
    type: Number,
    required: true,
  },
  urgency: {
    type: String,
    enum: ["low", "medium", "critical"],
    default: "medium",
  },
  status: {
    type: String,
    enum: ["open", "fulfilled", "partial"],
    default: "open",
  },
  raisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Need: compound index on { zone: 1, resourceType: 1, urgency: 1 } for prioritized filtering
needSchema.index({ zone: 1, resourceType: 1, urgency: 1 });

module.exports = mongoose.model('Need', needSchema);
