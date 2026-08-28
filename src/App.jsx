import React, { useState } from 'react';
import Navbar from './components/Navbar';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import CompanyAdminDashboard from './components/CompanyAdminDashboard';
import SiteManagerDashboard from './components/SiteManagerDashboard';
import WorkerMobileView from './components/WorkerMobileView';
import LoginPage from './components/LoginPage';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginPage onLogin={setCurrentUser} />;
  }

  // Render the appropriate view based on the selected role
  const renderView = () => {
    switch (currentUser.role) {
      case 'super_admin':
        return <SuperAdminDashboard />;
      case 'company_admin':
        return <CompanyAdminDashboard currentCompanyId={currentUser.companyId} />;
      case 'site_manager':
        return <SiteManagerDashboard currentCompanyId={currentUser.companyId} />;
      case 'worker':
        return <WorkerMobileView currentCompanyId={currentUser.companyId} currentUser={currentUser} />;
      default:
        return <div className="text-white">Role not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans">
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>
    </div>
  );
}

export default App;
