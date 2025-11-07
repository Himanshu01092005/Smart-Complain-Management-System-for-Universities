const Complaint = require('../models/Complaint');
const User = require('../models/user');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private
const createComplaint = async (req, res) => {
  try {
    const { title, description, department } = req.body;

    // 1. Check if a file was uploaded.
    // The URL from Cloudinary will be in req.file.path
    const photoUrl = req.file ? req.file.path : null;

    const complaint = await Complaint.create({
      title,
      description,
      department,
      user: req.user.id,
      photos: photoUrl ? [photoUrl] : [], // 2. Add the URL to the photos array
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


// // @desc    Get all pending complaints for a chairperson's department
// // @route   GET /api/complaints/department
// // @access  Private/Chairperson
// const getDepartmentComplaints = async (req, res) => {
//   try {
//     const complaints = await Complaint.find({
//       department: req.user.department, // Filter by the chairperson's department
//       status: 'Pending Approval',      // Only show pending complaints
//     }).populate('user', 'name email'); // Also fetch the name and email of the user who submitted it

//     res.status(200).json(complaints);
//   } catch (error) {
//     res.status(500).json({ message: `Server Error: ${error.message}` });
//   }
// };

// (in server/controllers/complaintController.js)

// (in server/controllers/complaintController.js)

// (in server/controllers/complaintController.js)

// @desc    Get all pending complaints for a chairperson's department
// @route   GET /api/complaints/department
// @access  Private/Chairperson
const getDepartmentComplaints = async (req, res) => {
  try {
    if (!req.user.department) {
      console.warn(`User ${req.user.email} (Chairperson) has no department assigned.`);
      return res.status(200).json([]);
    }

    // 1. Fetch all pending complaints (as plain JavaScript objects)
    const complaints = await Complaint.find({
      department: req.user.department,
      status: 'Pending Approval',
    }).lean(); 

    if (!complaints || complaints.length === 0) {
      return res.status(200).json([]);
    }

    // 2. Get all unique, valid user IDs from these complaints
    const userIds = [
      ...new Set(
        complaints
          .map((c) => c.user) // Get all user IDs
          .filter((id) => id) // Filter out any null/undefined IDs
      ),
    ];

    // 3. Fetch all those users in one database call
    const users = await User.find({ _id: { $in: userIds } }).select('name email');

    // 4. Create a "map" of users for easy lookup
    // e.g., { '60b...': { name: 'Test User', email: 'test@...' } }
    const userMap = users.reduce((acc, user) => {
      acc[user._id.toString()] = user;
      return acc;
    }, {});

    // 5. Manually "populate" the complaints
    const populatedComplaints = complaints
      .map((complaint) => {
        // Find the user from our map
        const user = userMap[complaint.user?.toString()];
        
        // If the user exists, attach them to the complaint
        if (user) {
          return {
            ...complaint, // Spread the complaint data
            user: user,    // Overwrite the 'user' ID with the user object
          };
        }
        // If user not found (bad data), skip this complaint
        console.warn(`Skipping complaint ${complaint._id}, user ${complaint.user} not found.`);
        return null;
      })
      .filter((c) => c !== null); // Filter out the nulls

    res.status(200).json(populatedComplaints);

  } catch (error) {
    console.error("CRASH IN getDepartmentComplaints:", error);
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Update a complaint's status
// @route   PUT /api/complaints/:id/update-status
// @access  Private/Chairperson
const updateComplaintStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body; // The new status (e.g., "In Progress" or "Rejected")
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Security Check: Ensure the complaint belongs to the chairperson's department
    if (!complaint.department || complaint.department !== req.user.department) {
      return res.status(403).json({ message: 'User not authorized to update this complaint' });
    }

    // Update the status and save the document
    complaint.status = status;
    if (rejectionReason) {
      complaint.rejectionReason = rejectionReason;
    }
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
      status: { $in: ['In Progress', 'Acknowledged'] }, // The key difference: finds "In Progress"
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


// @desc    Acknowledge a complaint
// @route   PUT /api/complaints/:id/acknowledge
// @access  Private/Solver
const acknowledgeComplaint = async (req, res) => {
  try {
    const { solverNotes, etr } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Security Check: Ensure complaint belongs to the solver's department
    if (complaint.department.toString() !== req.user.department) {
      return res.status(403).json({ message: 'User not authorized for this complaint' });
    }

    // Update the complaint
    complaint.status = 'Acknowledged';
    complaint.solverNotes = solverNotes;
    complaint.etr = etr;

    const updatedComplaint = await complaint.save();
    res.status(200).json(updatedComplaint);

  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Get all "Resolved" complaints for a solver's department
// @route   GET /api/complaints/resolved
// @access  Private/Solver
const getResolvedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      department: req.user.department,
      status: 'Resolved',
    }).populate('user', 'name email');

    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

//Adding to make feature cancel complaint

// @desc    Cancel a complaint (by user)
// @route   PUT /api/complaints/:id/cancel
// @access  Private
const cancelComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Security Check 1: Ensure user owns the complaint
    if (complaint.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Security Check 2: Only allow cancellation if it's still pending
    if (complaint.status !== 'Pending Approval') {
      return res.status(400).json({ message: 'Cannot cancel a complaint that is already being processed.' });
    }

    complaint.status = 'Cancelled';
    const updatedComplaint = await complaint.save();

    res.status(200).json(updatedComplaint);

  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Get a single complaint by its ID
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
                                     .populate('user', 'name email'); // Also get the user's info

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // --- SECURITY CHECK ---
    // 1. Is the logged-in user the one who created it?
    const isOwner = complaint.user._id.toString() === req.user.id;

    // 2. Is the logged-in user a (Chair/Solver) in the complaint's department?
    const isAuthorizedStaff = (req.user.role === 'Chairperson' || req.user.role === 'Solver') &&
                            (req.user.department === complaint.department);

    if (!isOwner && !isAuthorizedStaff) {
      return res.status(401).json({ message: 'User not authorized to view this complaint' });
    }

    // If they are authorized, send the complaint
    res.status(200).json(complaint);

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
  acknowledgeComplaint,   
  getResolvedComplaints,
  cancelComplaint,
  getComplaintById,
};