import React, { useState } from 'react';
// 1. Import Link
import { useNavigate, Link } from 'react-router-dom';
import complaintService from '../services/complaintService';
import toast from 'react-hot-toast';

function CreateComplaintPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('IT Support');
  const [photo, setPhoto] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('department', department);
    if (photo) {
      formData.append('photo', photo);
    }

    try {
      await complaintService.createComplaint(formData);
      toast.success('Complaint submitted successfully!');
      navigate('/'); 
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      toast.error(`Failed to submit complaint: ${message}`);
    }
  };

  return (
    // 2. Main Page Layout
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">

        {/* 3. "Back" Button */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
          >
            &larr; Back to Dashboard
          </Link>
        </div>

        {/* 4. Main Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Complaint</h1>
          
          {/* 5. Added space-y-6 for consistent spacing */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                // 6. Polished Input
                className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
                placeholder="e.g., 'Broken projector in Room 301'"
              />
            </div>
            
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                // 6. Polished Select
                className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option>IT Support</option>
                <option>Maintenance</option>
                <option>Administration</option>
                <option>Library</option>
              </select>
            </div>
            
            {/* --- 7. New Polished File Input --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Photo (Optional)
              </label>
              <div className="mt-2 flex items-center gap-4">
                {/* This is the styled "button" */}
                <label 
                  htmlFor="photo" 
                  className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Choose File
                </label>
                {/* This is the REAL input, but hidden */}
                <input
                  type="file"
                  id="photo"
                  onChange={(e) => setPhoto(e.target.files[0])} 
                  className="sr-only" // This Tailwind class hides it
                />
                {/* This displays the file name */}
                <span className="text-sm text-gray-500">
                  {photo ? photo.name : 'No file chosen'}
                </span>
              </div>
            </div>
            {/* ------------------------------- */}
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                id="description"
                rows="5"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                // 6. Polished Textarea
                className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
                placeholder="Please provide as much detail as possible, including location, issue, etc."
              ></textarea>
            </div>
            
            {/* 8. Polished Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
              >
                Submit Complaint
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateComplaintPage;