import React, { useState, useEffect, useMemo, useCallback } from 'react';
// --- 1. IMPORT LINK ---
import { useNavigate, Link } from 'react-router-dom'; 
import authService from '../services/authService';
import complaintService from '../services/complaintService';
import toast from 'react-hot-toast';
import Modal from '../components/Modal'; 

const FilterButton = ({ filter, label, activeFilter, setActiveFilter }) => (
  <button
    onClick={() => setActiveFilter(filter)}
    className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-150 ${
      activeFilter === filter
        ? 'bg-blue-600 text-white shadow-md'
        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
    }`}
  >
    {label}
  </button>
);

function SolverDashboardPage() {
  const [allComplaints, setAllComplaints] = useState([]);
  const [activeFilter, setActiveFilter] = useState('new');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentComplaintId, setCurrentComplaintId] = useState(null);
  const [etr, setEtr] = useState('');
  const [solverNotes, setSolverNotes] = useState('');

  // ... (all the functions like fetchAllComplaints, handleLogout, etc. are identical) ...
  const fetchAllComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const [assignedData, resolvedData] = await Promise.all([
        complaintService.getAssignedComplaints(),
        complaintService.getResolvedComplaints(),
      ]);
      setAllComplaints([...assignedData, ...resolvedData]);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
      if (error.response && error.response.status === 401) {
        authService.logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchAllComplaints();
  }, [fetchAllComplaints]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const refreshData = () => fetchAllComplaints();

  const handleAcknowledgeClick = (id) => {
    setCurrentComplaintId(id);
    setEtr('');
    setSolverNotes('');
    setIsModalOpen(true);
  };

  const handleAcknowledgeSubmit = async (e) => {
    e.preventDefault();
    if (!currentComplaintId || !etr) {
      toast.error('Please provide an ETR (Estimated Time of Resolution).');
      return;
    }
    try {
      await complaintService.acknowledgeComplaint(currentComplaintId, { etr, solverNotes });
      toast.success('Complaint Acknowledged!');
      refreshData();
    } catch (error) {
      toast.error('Failed to acknowledge complaint');
    } finally {
      setIsModalOpen(false);
      setCurrentComplaintId(null);
    }
  };

  const handleResolve = async (id) => {
    try {
      await complaintService.resolveComplaint(id);
      toast.success('Complaint marked as Resolved!');
      refreshData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

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
    return allComplaints;
  }, [allComplaints, activeFilter]);


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center">
        <p className="text-gray-500">Loading complaints...</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Solver Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors duration-150"
            >
              Logout
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <FilterButton filter="new" label="New Tasks" activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
            <FilterButton filter="acknowledged" label="My Acknowledged Tasks" activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
            <FilterButton filter="resolved" label="My Resolved History" activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
          </div>

          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            {activeFilter === 'new' && 'New Tasks'}
            {activeFilter === 'acknowledged' && 'My Acknowledged Tasks'}
            {activeFilter === 'resolved' && 'My Resolved History'}
          </h2>

          {filteredComplaints.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredComplaints.map((complaint) => (
                <div 
                  key={complaint._id} 
                  className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between"
                >
                  <div>
                    <p className="text-sm text-gray-500 mb-2">
                      Submitted by: {complaint.user?.name || 'N/A'}
                    </p>
                    
                    {/* --- 2. MAKE THE TITLE A CLICKABLE LINK --- */}
                    <Link to={`/complaint/${complaint._id}`}>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-700 transition-colors duration-150">
                        {complaint.title}
                      </h3>
                    </Link>
                    
                    {complaint.photos && complaint.photos.length > 0 && (
                      <div className="mb-4">
                        {/* We'll let the detail page show the full-size image */}
                        <p className="text-sm text-gray-400 italic">(Photo included)</p>
                      </div>
                    )}
                    
                    <p className="text-gray-700 line-clamp-3">{complaint.description}</p>
                    
                    {complaint.status === 'Acknowledged' && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-semibold text-blue-700">ETR:</p>
                        <p className="text-sm text-blue-700">{complaint.etr}</p>
                        <p className="text-sm font-semibold text-blue-700 mt-1">My Note:</p>
                        <p className="text-sm text-blue-700">{complaint.solverNotes || "..."}</p>
                      </div>
                    )}
                    {complaint.status === 'Resolved' && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm font-semibold text-green-700">Work Completed</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    {complaint.status === 'In Progress' && (
                      <button
                        onClick={() => handleAcknowledgeClick(complaint._id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-150 text-sm"
                      >
                        Acknowledge
                      </button>
                    )}
                    {complaint.status === 'Acknowledged' && (
                      <button
                        onClick={() => handleResolve(complaint._id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-150 text-sm"
                      >
                        Mark as Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-lg shadow-md text-center">
              <p className="text-gray-500">No complaints found for this filter.</p>
            </div>
          )}
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Acknowledge & Update User"
      >
        <form onSubmit={handleAcknowledgeSubmit}>
          <div className="mb-4">
            <label htmlFor="etr" className="block text-sm font-medium text-gray-700 mb-2">
              ETR (Estimated Time of Resolution)
            </label>
            <input
              type="text"
              id="etr"
              className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              value={etr}
              onChange={(e) => setEtr(e.target.value)}
              placeholder='e.g., "2 hours", "By 5 PM today"'
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="solverNotes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes for User (Optional)
            </label>
            <textarea
              id="solverNotes"
              rows="4"
              className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              value={solverNotes}
              onChange={(e) => setSolverNotes(e.target.value)}
              // --- 3. UPDATED PLACEHOLDER ---
              placeholder="e.g., 'On my way. You can contact me at 123-456-7890 with questions.'"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-150"
            >
              Acknowledge
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default SolverDashboardPage;