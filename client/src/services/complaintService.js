import axios from 'axios';

const API_URL = 'http://localhost:5000/api/complaints/';

// Helper function to get user and config
const getUserConfig = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  };
};

// Get user complaints
const getMyComplaints = async () => {
  // Get the user from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  
  // Create the authorization header with the Bearer token
  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  };

  const response = await axios.get(API_URL + 'my-complaints', config);

  return response.data;
};

// Create new complaint
const createComplaint = async (complaintData) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  };
  const response = await axios.post(API_URL, complaintData, config);
  return response.data;
};



// Get pending complaints for a department (for Chairperson)
const getDepartmentComplaints = async () => {
  const config = getUserConfig();
  const response = await axios.get(API_URL + 'department', config);
  return response.data;
};

// Update a complaint's status (for Chairperson)
const updateComplaintStatus = async (id, status) => {
  const config = getUserConfig();
  const response = await axios.put(API_URL + `${id}/update-status`, { status }, config);
  return response.data;
};

// --- Solver ---
const getAssignedComplaints = async () => {
  const config = getUserConfig();
  const response = await axios.get(API_URL + 'assigned', config);
  return response.data;
};

const resolveComplaint = async (id) => {
  const config = getUserConfig();
  const response = await axios.put(API_URL + `${id}/resolve`, null, config); // No body needed
  return response.data;
};

const complaintService = {
  createComplaint,
  getMyComplaints,
  getDepartmentComplaints,
  updateComplaintStatus,
  getAssignedComplaints, // Add this(will write comments letter)
  resolveComplaint,      
};


export default complaintService;