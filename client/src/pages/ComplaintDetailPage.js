import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import complaintService from '../services/complaintService';

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
    // 1. Made badge slightly smaller to match dashboard
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full text-white ${colorClass}`}
    >
      {status}
    </span>
  );
};

function ComplaintDetailPage() {
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams(); 

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const data = await complaintService.getComplaintById(id);
        setComplaint(data);
      } catch (error) {
        console.error('Failed to fetch complaint details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id]);

  // 2. Added new layout for loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // 3. Added new layout for not-found state
  if (!complaint) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        <div className="max-w-5xl mx-auto">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
          >
            &larr; Back to Dashboard
          </Link>
          <div className="bg-white p-12 rounded-xl shadow-lg text-center mt-6">
            <p className="text-gray-500">Complaint not found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    // 4. Added new main page layout
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* 5. Styled the "Back" link as a button */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
          >
            &larr; Back to Dashboard
          </Link>
        </div>

        {/* 6. Updated card style */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{complaint.title}</h1>
            <StatusBadge status={complaint.status} />
          </div>
          
          <p className="text-sm text-gray-500 mb-6">
            Submitted by: {complaint.user.name} ({complaint.user.email}) | Department: {complaint.department}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Details</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{complaint.description}</p>
              
              {complaint.photos && complaint.photos.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Evidence Photo</h3>
                  <img
                    src={complaint.photos[0]}
                    alt="Complaint evidence"
                    className="rounded-lg w-full h-auto object-cover shadow-md border border-gray-200"
                  />
                </div>
              )}
            </div>
            
            {/* Right Column */}
            {/* 7. Replaced gray bg with styled boxes */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-700">Resolution Status</h2>
              
              {complaint.status === 'Rejected' && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h3 className="text-lg font-semibold text-red-700 mb-2">Rejection Reason</h3>
                  <p className="text-gray-700">{complaint.rejectionReason || 'No reason provided.'}</p>
                </div>
              )}
              
              {(complaint.status === 'Acknowledged' || complaint.status === 'Resolved') && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-700 mb-2">Solver's Update</h3>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <strong>Estimated Resolution:</strong> {complaint.etr || 'N/A'}
                    </p>
                    <p className="text-gray-700">
                      <strong>Notes:</strong> {complaint.solverNotes || 'No notes provided.'}
                    </p>
                  </div>
                </div>
              )}
              
              {complaint.status === 'Resolved' && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-green-700">Work Completed</h3>
                </div>
              )}

              {/* Show nothing if Pending, In Progress, or Cancelled */}
              {['Pending Approval', 'In Progress', 'Cancelled'].includes(complaint.status) && (
                 <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
                  <p className="text-gray-600">No updates have been posted for this complaint yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplaintDetailPage;