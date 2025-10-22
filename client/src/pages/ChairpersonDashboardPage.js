import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import complaintService from '../services/complaintService';
import axios from 'axios';

function ChairpersonDashboardPage() {
  const [pendingComplaints, setPendingComplaints] = useState([]);
  const navigate = useNavigate();

  const fetchPendingComplaints = async () => {
    try {
      const data = await complaintService.getDepartmentComplaints();
      setPendingComplaints(data);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    }
  };

  useEffect(() => {
    fetchPendingComplaints();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

const handleUpdateStatus = async (id, status) => {
    let reason = '';
    
    // 1. If rejecting, ask for a reason
    if (status === 'Rejected') {
      reason = window.prompt('Please provide a reason for rejecting this complaint (optional):');
      if (reason === null) { // User clicked "Cancel"
        return; 
      }
    }

    try {
      // 2. Pass the status and reason to the service
      await complaintService.updateComplaintStatus(id, status, reason);
      
      const action = status === 'In Progress' ? 'Approved' : 'Rejected';
      alert(`Complaint has been ${action}`);
      fetchPendingComplaints();
    } catch (error) {
      alert('Failed to update status');
      console.error(error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Chairperson Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Logout
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Pending Complaints for Your Department</h2>
        {pendingComplaints.length > 0 ? (
          <ul>
            {pendingComplaints.map((complaint) => (
              <li key={complaint._id} className="border-b last:border-b-0 py-4">
                <div className="mb-2">
                  <h3 className="text-lg font-bold text-gray-800">{complaint.title}</h3>
                  <p className="text-sm text-gray-500">Submitted by: {complaint.user.name} ({complaint.user.email})</p>
                  <p className="mt-2 text-gray-700">{complaint.description}</p>
                </div>
                <div className="flex items-center space-x-4 mt-4">
                  <button
                    onClick={() => handleUpdateStatus(complaint._id, 'In Progress')}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(complaint._id, 'Rejected')}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">There are no pending complaints for your department.</p>
        )}
      </div>
    </div>
  );
}

export default ChairpersonDashboardPage;