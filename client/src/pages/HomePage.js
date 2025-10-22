import React from 'react';
import DashboardPage from './DashboardPage';
import ChairpersonDashboardPage from './ChairpersonDashboardPage';
import SolverDashboardPage from './SolverDashboardPage';

function HomePage() {
  const user = JSON.parse(localStorage.getItem('user'));

  // Based on the user's role, render the correct dashboard
switch (user.role) {
    case 'Chairperson':
      return <ChairpersonDashboardPage />;
    case 'Solver': // 2. Add this case
      return <SolverDashboardPage />;
    default:
      return <DashboardPage />;
  }
}

export default HomePage;