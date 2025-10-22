import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import complaintService from '../services/complaintService';

function SolverDashboardPage() {
  const [allComplaints, setAllComplaints] = useState([]);
  const [activeFilter, setActiveFilter] = useState('new'); // 'new', 'acknowledged', 'resolved'
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch ALL data (assigned and resolved)
  const fetchAllComplaints = async () => {
    try {
      setLoading(true);
      // Fetch both lists in parallel
      const [assignedData, resolvedData] = await Promise.all([
        complaintService.getAssignedComplaints(),
        complaintService.getResolvedComplaints(),
      ]);
      // Combine them into one big list
      setAllComplaints([...assignedData, ...resolvedData]);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllComplaints();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // This function will refresh the data from the server
  const refreshData = () => fetchAllComplaints();

  const handleAcknowledge = async (id) => {
    const etr = window.prompt('Please enter an Estimate time of resolution(ETR)  (e.g., "2 hours", "By 5 PM today or date"):');
    if (etr === null) return;
    const solverNotes = window.prompt('Please add a note for the user (optional):');
    if (solverNotes === null) return;

    try {
      await complaintService.acknowledgeComplaint(id, { etr, solverNotes });
      alert('Complaint Acknowledged!');
      refreshData(); // Refresh all data
    } catch (error) {
      alert('Failed to acknowledge complaint');
    }
  };

  const handleResolve = async (id) => {
    try {
      await complaintService.resolveComplaint(id);
      alert('Complaint marked as Resolved!');
      refreshData(); // Refresh all data
    } catch (error) {
      alert('Failed to update status');
    }
  };

  // This is the magic: Filter the list based on the activeFilter state
  const filteredComplaints = useMemo(() => {
    if (activeFilter === 'new') {
      return allComplaints.filter((c) => c.status === 'In Progress');
    }
    if (activeFilter === 'acknowledged') {
      return allComplaints.filter((c) => c.status === 'Acknowledged');
    }
    if (activeFilter === 'resolved') {
      return allComplaints.filter((c) => c.status === 'Resolved');
    }
    return allComplaints; // 'all' filter
  }, [allComplaints, activeFilter]);

  // Helper component for the filter buttons
  const FilterButton = ({ filter, label }) => (
    <button
      onClick={() => setActiveFilter(filter)}
      className={`px-4 py-2 font-medium rounded-md ${
        activeFilter === filter
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Solver Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>

      {/* --- FILTER MENU --- */}
      <div className="flex space-x-2 mb-6">
        <FilterButton filter="new" label="New Tasks" />
        <FilterButton filter="acknowledged" label="My Acknowledged Tasks" />
        <FilterButton filter="resolved" label="My Resolved History" />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
          {activeFilter === 'new' && 'New Tasks'}
          {activeFilter === 'acknowledged' && 'My Acknowledged Tasks'}
          {activeFilter === 'resolved' && 'My Resolved History'}
        </h2>

        {loading ? (
          <p>Loading complaints...</p>
        ) : filteredComplaints.length > 0 ? (
          <ul>
            {filteredComplaints.map((complaint) => (
              <li key={complaint._id} className="border-b last:border-b-0 py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{complaint.title}</h3>
                    <p className="text-sm text-gray-500">Submitted by: {complaint.user.name}</p>
                    <p className="mt-2 text-gray-700">{complaint.description}</p>
                    
                    {complaint.status === 'Acknowledged' && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-md">
                        <p className="text-sm font-semibold text-blue-700">ETR: {complaint.etr}</p>
                        <p className="text-sm text-blue-700">My Note: {complaint.solverNotes}</p>
                      </div>
                    )}
                    {complaint.status === 'Resolved' && (
                      <div className="mt-2 p-2 bg-green-50 rounded-md">
                        <p className="text-sm font-semibold text-green-700">Work Completed</p>
                      </div>
                    )}
                  </div>

                  {/* --- CONDITIONAL BUTTONS --- */}
                  {complaint.status === 'In Progress' && (
                    <button
                      onClick={() => handleAcknowledge(complaint._id)}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Acknowledge
                    </button>
                  )}
                  {complaint.status === 'Acknowledged' && (
                    <button
                      onClick={() => handleResolve(complaint._id)}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Mark as Resolved
                    </button>
                  )}
                  {/* No button shows for 'Resolved' tasks */}

                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No complaints found for this filter.</p>
        )}
      </div>
    </div>
  );
}

export default SolverDashboardPage;