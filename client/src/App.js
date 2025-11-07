import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CreateComplaintPage from './pages/CreateComplaintPage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import HomePage from './pages/HomePage';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import './App.css';

function App() {
  return (
    <Router>
      <Toaster />
      <div className="container mx-auto">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route 
            path="/create-complaint" 
            element={<ProtectedRoute><CreateComplaintPage /></ProtectedRoute>} 
          />
          
          <Route 
            path="/complaint/:id" 
            element={<ProtectedRoute><ComplaintDetailPage /></ProtectedRoute>} 
          />
          
          <Route
            path="/"
            element={<ProtectedRoute><HomePage /></ProtectedRoute>}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;