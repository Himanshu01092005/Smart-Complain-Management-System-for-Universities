import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import complaintService from '../services/complaintService';

function CreateComplaintPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('IT Support');
  const [photo, setPhoto] = useState(null); // 1. Add state for the file
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 2. Create a FormData object
    const formData = new FormData();
    
    // 3. Append all the form fields
    // These keys MUST match what the backend expects (title, description, etc.)
    formData.append('title', title);
    formData.append('description', description);
    formData.append('department', department);
    if (photo) {
      formData.append('photo', photo); // The 'photo' key must match the backend route
    }

    try {
      // 4. Send the FormData object
      await complaintService.createComplaint(formData);
      alert('Complaint submitted successfully!');
      navigate('/'); // Redirect to the dashboard
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      alert(`Failed to submit complaint: ${message}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Create New Complaint</h1>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <form onSubmit={handleSubmit}>
          {/* ... (Title and Department fields are the same) ... */}
          
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="department" className="block text-gray-700 text-sm font-bold mb-2">Department</label>
            <select
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option>IT Support</option>
              <option>Maintenance</option>
              <option>Administration</option>
              <option>Library</option>
            </select>
          </div>
          
          {/* --- 5. ADD THE FILE INPUT FIELD --- */}
          <div className="mb-4">
            <label htmlFor="photo" className="block text-gray-700 text-sm font-bold mb-2">
              Add Photo (Optional)
            </label>
            <input
              type="file"
              id="photo"
              onChange={(e) => setPhoto(e.target.files[0])} // Get the first file
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          {/* ------------------------------- */}
          
          <div className="mb-6">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
            <textarea
              id="description"
              rows="5"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            ></textarea>
          </div>
          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Submit Complaint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateComplaintPage;