const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Volunteer",
    required: true,
  },
  fromCampId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Camp",
  },
  toCampId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Camp",
    required: true,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "active", "completed"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Assignment', assignmentSchema);
