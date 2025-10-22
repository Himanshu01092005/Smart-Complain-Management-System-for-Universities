import React from 'react';
import { Navigate } from 'react-router-dom';

// This component takes 'children' as a prop. 'children' will be the
// actual page component we want to protect (e.g., <DashboardPage />).
function ProtectedRoute({ children }) {
  // Check for the user item in localStorage
  const user = JSON.parse(localStorage.getItem('user'));

  // If there is no user, redirect to the /login page
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If a user exists, render the child component (the protected page)
  return children;
}

export default ProtectedRoute;