import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import complaintService from '../services/complaintService';

// Helper component for displaying status badges
const StatusBadge = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'Resolved':
        return 'bg-green-500';
      case 'Acknowledged':
        return 'bg-blue-500';
      case 'In Progress':
        return 'bg-yellow-500';
      case 'Rejected':
        return 'bg-red-500';
      case 'Cancelled':
        return 'bg-gray-700';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <span
      className={`px-3 py-1 text-sm font-semibold rounded-full text-white ${getStatusColor()}`}
    >
      {status}
    </span>
  );
};

function ComplaintDetailPage() {
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams(); // Gets the ':id' from the URL

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

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!complaint) {
    return <div className="p-8">Complaint not found.</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link to="/" className="text-blue-500 hover:text-blue-700">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">{complaint.title}</h1>
          <StatusBadge status={complaint.status} />
        </div>
        
        <p className="text-sm text-gray-500 mb-6">
          Submitted by: {complaint.user.name} ({complaint.user.email}) | Department: {complaint.department}
        </p>

        {/* --- Main Content --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Description & Image */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Details</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{complaint.description}</p>
            
            {complaint.photos && complaint.photos.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Evidence Photo</h3>
                <img
                  src={complaint.photos[0]}
                  alt="Complaint evidence"
                  className="rounded-lg w-full"
                />
              </div>
            )}
          </div>
          
          {/* Right Column: Status-Specific Info */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Resolution Status</h2>
            
            {complaint.status === 'Rejected' && complaint.rejectionReason && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-red-600">Rejection Reason</h3>
                <p className="text-gray-700">{complaint.rejectionReason}</p>
              </div>
            )}
            
            {(complaint.status === 'Acknowledged' || complaint.status === 'Resolved') && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-blue-600">Solver's Update</h3>
                <p className="text-gray-700">
                  <strong>Estimated Resolution:</strong> {complaint.etr || 'N/A'}
                </p>
                <p className="text-gray-700 mt-1">
                  <strong>Notes:</strong> {complaint.solverNotes || 'No notes provided.'}
                </p>
              </div>
            )}
            
            {complaint.status === 'Resolved' && (
              <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-md">
                <h3 className="text-lg font-semibold text-green-700">Work Completed</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplaintDetailPage;