import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import complaintService from '../services/complaintService';

function SolverDashboardPage() {
  const [assignedComplaints, setAssignedComplaints] = useState([]);
  const navigate = useNavigate();

  const fetchAssignedComplaints = async () => {
    try {
      const data = await complaintService.getAssignedComplaints();
      setAssignedComplaints(data);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    }
  };

  useEffect(() => {
    fetchAssignedComplaints();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleResolve = async (id) => {
    try {
      await complaintService.resolveComplaint(id);
      alert('Complaint marked as Resolved!');
      // Refresh the list after resolving
      fetchAssignedComplaints();
    } catch (error) {
      alert('Failed to update status');
      console.error(error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Solver Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Logout
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">My Active Assignments</h2>
        {assignedComplaints.length > 0 ? (
          <ul>
            {assignedComplaints.map((complaint) => (
              <li key={complaint._id} className="border-b last:border-b-0 py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{complaint.title}</h3>
                    <p className="text-sm text-gray-500">Submitted by: {complaint.user.name}</p>
                    <p className="mt-2 text-gray-700">{complaint.description}</p>
                  </div>
                  <button
                    onClick={() => handleResolve(complaint._id)}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Mark as Resolved
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">There are no complaints currently in progress.</p>
        )}
      </div>
    </div>
  );
}

export default SolverDashboardPage;