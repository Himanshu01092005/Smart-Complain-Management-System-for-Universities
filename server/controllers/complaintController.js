const Complaint = require('../models/Complaint');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private
const createComplaint = async (req, res) => {
  try {
    const { title, description, department } = req.body;

    const complaint = await Complaint.create({
      title,
      description,
      department,
      user: req.user.id, // Get the user ID from the middleware
    });

    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Get complaints for the logged-in user
// @route   GET /api/complaints/my-complaints
// @access  Private
const getMyComplaints = async (req, res) => {
  try {
    // Find all complaints where the 'user' field matches the logged-in user's ID
    const complaints = await Complaint.find({ user: req.user.id });

    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};


// @desc    Get all pending complaints for a chairperson's department
// @route   GET /api/complaints/department
// @access  Private/Chairperson
const getDepartmentComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      department: req.user.department, // Filter by the chairperson's department
      status: 'Pending Approval',      // Only show pending complaints
    }).populate('user', 'name email'); // Also fetch the name and email of the user who submitted it

    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Update a complaint's status
// @route   PUT /api/complaints/:id/update-status
// @access  Private/Chairperson
const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body; // The new status (e.g., "In Progress" or "Rejected")
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Security Check: Ensure the complaint belongs to the chairperson's department
    if (complaint.department.toString() !== req.user.department) {
      return res.status(403).json({ message: 'User not authorized to update this complaint' });
    }

    // Update the status and save the document
    complaint.status = status;
    const updatedComplaint = await complaint.save();

    res.status(200).json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};


// (Add these two functions to server/controllers/complaintController.js)

// @desc    Get all "In Progress" complaints for a solver's department
// @route   GET /api/complaints/assigned
// @access  Private/Solver
const getAssignedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      department: req.user.department,
      status: 'In Progress', // The key difference: finds "In Progress"
    }).populate('user', 'name email');

    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Mark a complaint as "Resolved"
// @route   PUT /api/complaints/:id/resolve
// @access  Private/Solver
const resolveComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Security Check: Ensure complaint belongs to the solver's department
    if (complaint.department.toString() !== req.user.department) {
      return res.status(403).json({ message: 'User not authorized for this complaint' });
    }

    complaint.status = 'Resolved';
    const updatedComplaint = await complaint.save();

    res.status(200).json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};


module.exports = {
  createComplaint,
  getMyComplaints,
  getDepartmentComplaints,
  updateComplaintStatus,
  getAssignedComplaints,
  resolveComplaint,       
};