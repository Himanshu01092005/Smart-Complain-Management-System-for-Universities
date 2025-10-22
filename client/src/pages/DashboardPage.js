import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import complaintService from '../services/complaintService';
import { Link } from 'react-router-dom';

function DashboardPage() {
  const [complaints, setComplaints] = useState([]);
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // useEffect runs once when the component loads
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const data = await complaintService.getMyComplaints();
        setComplaints(data);
      } catch (error) {
        console.error('Failed to fetch complaints:', error);
        // If token is expired or invalid, log the user out
        if (error.response && error.response.status === 401) {
          handleLogout();
        }
      }
    };

    fetchComplaints();
  }, []); // The empty array [] means this effect runs only once

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


      <div className="bg-white p-6 rounded-lg shadow-md">

        
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">My Submitted Complaints</h2>
        {complaints.length > 0 ? (
          // <ul>
          //   {complaints.map((complaint) => (
          //     <li key={complaint._id} className="border-b last:border-b-0 py-4">
          //       <div className="flex justify-between items-center">
          //         <div>
          //           <h3 className="text-lg font-bold text-gray-800">{complaint.title}</h3>
          //           <p className="text-sm text-gray-600">Department: {complaint.department}</p>
                    
          //           {/* 1. Add this logic */}
          //           {complaint.status === 'Rejected' && complaint.rejectionReason && (
          //             <p className="text-sm text-red-600 mt-1">
          //               <strong>Rejection Reason:</strong> {complaint.rejectionReason}
          //             </p>
          //           )}

          //         </div>
          //         <span
          //           className={`px-3 py-1 text-sm font-semibold rounded-full text-white ${
          //             complaint.status === 'Resolved' ? 'bg-green-500' :
          //             complaint.status === 'In Progress' ? 'bg-yellow-500' :
          //             complaint.status === 'Rejected' ? 'bg-red-500' :
          //             'bg-blue-500' // Pending Approval
          //           }`}
          //         >
          //           {complaint.status}
          //         </span>
          //       </div>
          //     </li>
          //   ))}
          // </ul>
          <ul>
            {complaints.map((complaint) => (
              <li key={complaint._id} className="border-b last:border-b-0 py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{complaint.title}</h3>
                    <p className="text-sm text-gray-600">Department: {complaint.department}</p>
                    
                    {/* --- ADD THIS SECTION --- */}
                    {complaint.status === 'Acknowledged' && (
                      <div className="mt-2 p-2 bg-green-50 rounded-md border border-green-200">
                        <p className="text-sm font-semibold text-green-700">Solver Note: {complaint.solverNotes}</p>
                        <p className="text-sm text-green-700">Estimated Resolution: {complaint.etr}</p>
                      </div>
                    )}
                    {/* --- END OF SECTION --- */}

                    {complaint.status === 'Rejected' && complaint.rejectionReason && (
                      <p className="text-sm text-red-600 mt-1">
                        <strong>Rejection Reason:</strong> {complaint.rejectionReason}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full text-white ${
                      complaint.status === 'Resolved' ? 'bg-green-500' :
                      complaint.status === 'Acknowledged' ? 'bg-blue-500' : // NEW
                      complaint.status === 'In Progress' ? 'bg-yellow-500' :
                      complaint.status === 'Rejected' ? 'bg-red-500' :
                      'bg-gray-500' // Pending Approval
                    }`}
                  >
                    {/* NEW: Show Acknowledged status */}
                    {complaint.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>

        ) : (
          <p className="text-gray-500">You have not submitted any complaints yet.</p>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;