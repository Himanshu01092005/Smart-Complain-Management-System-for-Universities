import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute'; 
import CreateComplaintPage from './pages/CreateComplaintPage';
import HomePage from './pages/HomePage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="container mx-auto">
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/*Reminder study in scrimba again about it :  Wrap the DashboardPage Route with ProtectedRoute */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          <Route 
            path="/complaint/:id" 
            element={<ProtectedRoute><ComplaintDetailPage /></ProtectedRoute>} 
          />

          <Route 
          path="/create-complaint" 
          element={<ProtectedRoute>
            <CreateComplaintPage />
          </ProtectedRoute>} />


        </Routes>
      </div>
    </Router>
  );
}

export default App;