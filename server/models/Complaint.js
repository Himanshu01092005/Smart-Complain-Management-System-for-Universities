const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    // This creates a link to the User model.
    // It stores the ID of the user who submitted the complaint.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    department: {
      type: String,
      required: [true, 'Please select a department'],
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending Approval', 'In Progress','Acknowledged', 'Resolved', 'Rejected'],
      default: 'Pending Approval',
    },
    rejectionReason: { // Add this field
      type: String,
      default: '',
    },
    solverNotes: { // Add this field
      type: String,
      default: '',
    },
    etr: { // Add this field (Estimated Time of Resolution)
      type: String,
      default: '',
    },
    photos: [
      {
        type: String, // We'll store image URLs here
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Complaint', complaintSchema);