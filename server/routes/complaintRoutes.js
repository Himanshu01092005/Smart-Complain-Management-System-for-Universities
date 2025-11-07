// const express = require('express');
// const router = express.Router();
// const { createComplaint, getMyComplaints } = require('../controllers/complaintController');
// const { protect } = require('../middleware/authMiddleware');

// // A POST request to '/' will run the protect middleware first,
// // then the createComplaint controller function.
// router.post('/', protect, createComplaint);

// // GET /api/complaints/my-complaints
// router.get('/my-complaints', protect, getMyComplaints);

// module.exports = router;

const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/complaintController');
const { protect, isChairperson, isSolver } = require('../middleware/authMiddleware'); // Import isSolver

//importing the upload config
const upload = require('../config/cloudinary');

// User routes
router.post('/', protect, upload.single('photo'), createComplaint);
router.get('/my-complaints', protect, getMyComplaints);

router.get('/:id', protect, getComplaintById);

router.put('/:id/cancel', protect, cancelComplaint);

// Chairperson routes
router.get('/department', protect, isChairperson, getDepartmentComplaints);
router.put('/:id/update-status', protect, isChairperson, updateComplaintStatus);

// Solver routes
router.get('/assigned', protect, isSolver, getAssignedComplaints);
router.put('/:id/acknowledge', protect, isSolver, acknowledgeComplaint);
router.put('/:id/resolve', protect, isSolver, resolveComplaint);
router.get('/resolved', protect, isSolver, getResolvedComplaints);

module.exports = router;