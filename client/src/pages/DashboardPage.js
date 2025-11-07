import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import complaintService from '../services/complaintService';
import toast from 'react-hot-toast';

// 1. We created a new sub-component for the status badge
// This cleans up the main list code significantly.
const StatusBadge = ({ status }) => {
  let colorClass = 'bg-gray-400';
  switch (status) {
    case 'Resolved':
      colorClass = 'bg-green-500';
      break;
    case 'Acknowledged':
      colorClass = 'bg-blue-500';
      break;
    case 'In Progress':
      colorClass = 'bg-yellow-500';
      break;
    case 'Rejected':
      colorClass = 'bg-red-500';
      break;
    case 'Cancelled':
      colorClass = 'bg-gray-700';
      break;
    default:
      colorClass = 'bg-gray-400';
  }
  return (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full text-white ${colorClass}`}
    >
      {status}
    </span>
  );
};

// 2. A helper component for our filter buttons
const FilterButton = ({ filter, label, activeFilter, setActiveFilter }) => (
  <button
    onClick={() => setActiveFilter(filter)}
    className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-150 ${
      activeFilter === filter
        ? 'bg-blue-600 text-white shadow-md' // Active state
        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300' // Inactive state
    }`}
  >
    {label}
  </button>
);

function DashboardPage() {
  const [complaints, setComplaints] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const navigate = useNavigate();

  // 3. We re-added useCallback here. This is a best-practice
  // It ensures fetchComplaints isn't a new function on every render
  const fetchComplaints = useCallback(async () => {
    try {
      const data = await complaintService.getMyComplaints();
      setComplaints(data);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
      if (error.response && error.response.status === 401) {
        authService.logout();
        navigate('/login');
      }
    }
  }, [navigate]); // navigate is a stable dependency

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]); // Now this is safe

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this complaint?')) {
      try {
        await complaintService.cancelComplaint(id);
        toast.success('Complaint successfully cancelled.');
        fetchComplaints(); // Refresh the list
      } catch (error) {
        const message =
          (error.response && error.response.data && error.response.data.message) ||
          error.message ||
          error.toString();
        toast.error(`Failed to cancel: ${message}`);
      }
    }
  };

  const filteredComplaints = useMemo(() => {
    if (activeFilter === 'All') {
      return complaints;
    }
    return complaints.filter((complaint) => complaint.status === activeFilter);
  }, [complaints, activeFilter]);

  return (
    // 4. Set a light gray background for the whole page
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">

        {/* 5. A new, responsive header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          {/* Buttons are grouped and responsive */}
          <div className="flex items-center gap-3">
            <Link 
              to="/create-complaint" 
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-150"
            >
              New Complaint
            </Link>
            <button
              onClick={handleLogout}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors duration-150"
            >
              Logout
            </button>
          </div>
        </div>

        {/* 6. Our new filter "pills" */}
        <div className="flex flex-wrap gap-2 mb-6">
          <FilterButton filter="All" label="All" activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
          <FilterButton filter="Pending Approval" label="Pending" activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
          <FilterButton filter="In Progress" label="In Progress" activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
          <FilterButton filter="Acknowledged" label="Acknowledged" activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
          <FilterButton filter="Resolved" label="Resolved" activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
          <FilterButton filter="Cancelled" label="Cancelled" activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        </div>

        {/* 7. The new Card Grid */}
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">My Submitted Complaints</h2>
        {filteredComplaints.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredComplaints.map((complaint) => (
              <div 
                key={complaint._id} 
                className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between"
              >
                {/* Card Top */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-blue-600">{complaint.department}</p>
                    <StatusBadge status={complaint.status} />
                  </div>
                  <Link to={`/complaint/${complaint._id}`} className="block mt-2">
                    <h3 className="text-xl font-bold text-gray-900 hover:text-blue-700 transition-colors duration-150">
                      {complaint.title}
                    </h3>
                  </Link>
                </div>

                {/* Card Middle (Notes) */}
                <div className="my-4 space-y-2">
                  {complaint.status === 'Acknowledged' && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-semibold text-blue-700">Solver Note:</p>
                      <p className="text-sm text-blue-700">{complaint.solverNotes || "..."}</p>
                      <p className="text-sm text-blue-700 mt-1"><strong>ETR:</strong> {complaint.etr}</p>
                    </div>
                  )}
                  {complaint.status === 'Rejected' && complaint.rejectionReason && (
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm font-semibold text-red-700">Rejection Reason:</p>
                      <p className="text-sm text-red-700">{complaint.rejectionReason}</p>
                    </div>
                  )}
                </div>
                
                {/* Card Bottom (Actions) */}
                <div className="mt-4">
                  {complaint.status === 'Pending Approval' && (
                    <button 
                      onClick={() => handleCancel(complaint._id)}
                      className="w-full bg-red-500 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg text-sm transition-colors duration-150"
                    >
                      Cancel Complaint
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // 8. An improved "Empty" state
          <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <p className="text-gray-500">No complaints found for this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;