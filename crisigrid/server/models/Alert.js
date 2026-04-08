const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  campId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Camp",
    required: true,
  },
  zone: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["low_stock", "overcapacity", "no_volunteers"],
  },
  resourceType: {
    type: String,
  },
  message: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ["warning", "critical"],
  },
  resolved: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Alert: sparse index on { resolved: 1 } — only index documents where resolved exists
// This is useful for querying active alerts efficiently
alertSchema.index({ resolved: 1 }, { sparse: true });

// Alert: TTL index on createdAt — expire after 604800 seconds (7 days)
alertSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

module.exports = mongoose.model('Alert', alertSchema);
