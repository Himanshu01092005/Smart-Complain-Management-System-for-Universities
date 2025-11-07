import React, { useState } from 'react';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = { email, password };
    try {
      await authService.login(userData);
      toast.success('Login successful!'); 
      navigate('/'); 
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      toast.error(`Login failed: ${message}`);
    }
  };

  return (
    // Main container:
    // - 'min-h-screen': Makes it full-height
    // - 'bg-gray-50': A softer, lighter gray background
    // - 'flex flex-col justify-center': Centers the content vertically
    // - 'p-4': Adds padding for mobile screens, so the card doesn't touch the edges
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      
      <div className="w-full max-w-md">
        
        {/* 1. Added a Header */}
        {/* This gives the app a clear title. It's centered and has spacing. */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Smart Complaint System
          </h1>
          <p className="mt-2 text-gray-600">
            Sign in to access your dashboard
          </p>
        </div>

        {/* 2. Styled the Form Card */}
        {/* - 'bg-white p-6 sm:p-8': More padding on larger screens
           - 'rounded-xl': Softer, more modern rounded corners
           - 'shadow-lg': A slightly stronger shadow for a "lifting" effect */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                // 3. Upgraded the Inputs
                // - 'rounded-lg': Matches the card's new corners
                // - 'border-gray-300': A standard border color
                // - 'py-3 px-4': Makes the input taller and easier to tap
                // - 'focus:ring-2 focus:ring-blue-500': Adds a blue "ring" on focus
                // - 'focus:border-transparent': Hides the default border on focus
                className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="you@example.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                // Same styling as the email input
                className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="******************"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <button
                type="submit"
                // 4. Upgraded the Button
                // - 'w-full': Makes it full-width, which is better for mobile
                // - 'bg-blue-600 hover:bg-blue-700': A slightly richer blue
                // - 'font-semibold': Makes the text stand out
                // - 'py-3': Taller and more "tappable"
                // - 'rounded-lg': Matches the inputs
                // - 'focus:ring-offset-2': Adds space for the focus ring
                // - 'transition-colors': Smooth hover effect
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;