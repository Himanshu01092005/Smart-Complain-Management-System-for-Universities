import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import complaintService from '../services/complaintService';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';

function ChairpersonDashboardPage() {
  const [pendingComplaints, setPendingComplaints] = useState([]);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentComplaintId, setCurrentComplaintId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchPendingComplaints = useCallback(async () => {
    try {
      const data = await complaintService.getDepartmentComplaints();
      setPendingComplaints(data);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
      if (error.response && error.response.status === 401) {
        authService.logout();
        navigate('/login');
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchPendingComplaints();
  }, [fetchPendingComplaints]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleUpdateClick = (id, status) => {
    if (status === 'In Progress') {
      handleApprove(id);
    } else if (status === 'Rejected') {
      setCurrentComplaintId(id);
      setIsModalOpen(true);
    }
  };

  const handleApprove = async (id) => {
    try {
      await complaintService.updateComplaintStatus(id, 'In Progress', '');
      toast.success('Complaint has been Approved');
      fetchPendingComplaints();
    } catch (error) {
      toast.error('Failed to approve status');
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault(); 
    if (!currentComplaintId) return;

    try {
      await complaintService.updateComplaintStatus(
        currentComplaintId,
        'Rejected',
        rejectionReason
      );
      toast.success('Complaint has been Rejected');
      fetchPendingComplaints(); 
    } catch (error) {
      toast.error('Failed to reject status');
    } finally {
      setIsModalOpen(false);
      setRejectionReason('');
      setCurrentComplaintId(null);
    }
  };

  return (
    <>
      {/* 1. Main Page Layout */}
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* 2. New Responsive Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Chairperson Dashboard</h1>
            <button
              onClick={handleLogout}
              // 3. Changed Logout to a neutral button
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors duration-150"
            >
              Logout
            </button>
          </div>

          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Pending Complaints</h2>
          
          {/* 4. New Card Grid (replaces <ul>) */}
          {pendingComplaints.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingComplaints.map((complaint) => (
                <div 
                  key={complaint._id} 
                  className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between"
                >
                  {/* Card Content */}
                  <div>
                    <p className="text-sm text-gray-500 mb-2">
                      Submitted by: {complaint.user?.name || 'N/A'}
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{complaint.title}</h3>
                    
                    {complaint.photos && complaint.photos.length > 0 && (
                      <div className="mb-4">
                        <img 
                          src={complaint.photos[0]} 
                          alt="Complaint evidence" 
                          className="rounded-lg max-w-full object-cover" 
                        />
                      </div>
                    )}
                    
                    <p className="text-gray-700">{complaint.description}</p>
                  </div>

                  {/* 5. New Card Action Buttons */}
                  <div className="flex items-center gap-3 mt-6">
                    <button
                      onClick={() => handleUpdateClick(complaint._id, 'In Progress')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-150 text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateClick(complaint._id, 'Rejected')}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-150 text-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // 6. New "Empty" State
            <div className="bg-white p-12 rounded-lg shadow-md text-center">
              <p className="text-gray-500">There are no pending complaints for your department.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- 7. Modal with Polished Form --- */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Provide Rejection Reason"
      >
        <form onSubmit={handleRejectSubmit}>
          <div className="mb-4">
            <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason (optional but recommended):
            </label>
            <textarea
              id="rejectionReason"
              rows="4"
              // 8. Polished Textarea
              className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., 'This is not an IT department issue.'"
            />
          </div>
          {/* 9. Polished Modal Buttons */}
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
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-150"
            >
              Submit Rejection
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default ChairpersonDashboardPage;