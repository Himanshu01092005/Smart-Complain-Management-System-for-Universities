import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import complaintService from '../services/complaintService';

function DashboardPage() {
  const [complaints, setComplaints] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All'); // 1. Our new filter state
  const navigate = useNavigate();

  // This fetches ALL complaints one time
  const fetchComplaints = async () => {
    try {
      const data = await complaintService.getMyComplaints();
      setComplaints(data);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
      if (error.response && error.response.status === 401) {
        handleLogout();
      }
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []); // The empty array [] means this effect runs only once

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this complaint?')) {
      try {
        await complaintService.cancelComplaint(id);
        alert('Complaint successfully cancelled.');
        fetchComplaints(); // Refresh the full list from the server
      } catch (error) {
        const message =
          (error.response && error.response.data && error.response.data.message) ||
          error.message ||
          error.toString();
        alert(`Failed to cancel: ${message}`);
      }
    }
  };

  // 2. This logic filters the list *locally* based on the active filter
  const filteredComplaints = useMemo(() => {
    if (activeFilter === 'All') {
      return complaints;
    }
    return complaints.filter((complaint) => complaint.status === activeFilter);
  }, [complaints, activeFilter]); // It re-runs only if complaints or activeFilter changes

  // 3. A helper component for our filter buttons
  const FilterButton = ({ filter, label }) => (
    <button
      onClick={() => setActiveFilter(filter)}
      className={`px-3 py-1.5 text-sm font-medium rounded-md ${
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
        <h1 className="text-3xl font-bold text-gray-800">My Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Logout
        </button>
      </div>

      <div className="mb-6">
        <Link to="/create-complaint" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Create New Complaint
        </Link>
      </div>

      {/* 4. The new filter button menu */}
      <div className="flex flex-wrap gap-2 mb-6">
        <FilterButton filter="All" label="All" />
        <FilterButton filter="Pending Approval" label="Pending" />
        <FilterButton filter="In Progress" label="In Progress" />
        <FilterButton filter="Acknowledged" label="Acknowledged" />
        <FilterButton filter="Resolved" label="Resolved" />
        <FilterButton filter="Cancelled" label="Cancelled" />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">My Submitted Complaints</h2>
        
        {/* 5. We now map over filteredComplaints, not complaints */}
        {filteredComplaints.length > 0 ? (
          <ul>
            {filteredComplaints.map((complaint) => (
              <li key={complaint._id} className="border-b last:border-b-0 py-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Link to={`/complaint/${complaint._id}`} className="hover:text-blue-600">
                      <h3 className="text-lg font-bold text-gray-800">{complaint.title}</h3>
                    </Link>
                    <p className="text-sm text-gray-600">Department: {complaint.department}</p>
                    
                    {complaint.photos && complaint.photos.length > 0 && (
                      <div className="mt-4">
                        <img 
                          src={complaint.photos[0]} 
                          alt="Complaint evidence" 
                          className="rounded-lg max-w-xs" 
                        />
                      </div>
                    )}
                    
                    {complaint.status === 'Acknowledged' && (
                      <div className="mt-2 p-2 bg-green-50 rounded-md border border-green-200">
                        <p className="text-sm font-semibold text-green-700">Solver Note: {complaint.solverNotes}</p>
                        <p className="text-sm text-green-700">Estimated Resolution: {complaint.etr}</p>
                      </div>
                    )}
                    
                    {complaint.status === 'Rejected' && complaint.rejectionReason && (
                      <p className="text-sm text-red-600 mt-1">
                        <strong>Rejection Reason:</strong> {complaint.rejectionReason}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end ml-4">
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-full text-white ${
                        complaint.status === 'Resolved' ? 'bg-green-500' :
                        complaint.status === 'Acknowledged' ? 'bg-blue-500' :
                        complaint.status === 'In Progress' ? 'bg-yellow-500' :
                        complaint.status === 'Rejected' ? 'bg-red-500' :
                        complaint.status === 'Cancelled' ? 'bg-gray-700' :
                        'bg-gray-400'
                      }`}
                    >
                      {complaint.status}
                    </span>

                    {complaint.status === 'Pending Approval' && (
                      <button 
                        onClick={() => handleCancel(complaint._id)}
                        className="mt-4 text-sm bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
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

export default DashboardPage;