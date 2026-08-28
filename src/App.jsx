import React, { useState } from 'react';
import Navbar from './components/Navbar';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import CompanyAdminDashboard from './components/CompanyAdminDashboard';
import SiteManagerDashboard from './components/SiteManagerDashboard';
import WorkerMobileView from './components/WorkerMobileView';
import { mockCompanies } from './mockData';

function App() {
  const [currentRole, setCurrentRole] = useState('super_admin');
  const [currentCompanyId, setCurrentCompanyId] = useState(mockCompanies[0].id);

  // Render the appropriate view based on the selected role
  const renderView = () => {
    switch (currentRole) {
      case 'super_admin':
        return <SuperAdminDashboard setCurrentRole={setCurrentRole} setCurrentCompanyId={setCurrentCompanyId} />;
      case 'company_admin':
        return <CompanyAdminDashboard currentCompanyId={currentCompanyId} />;
      case 'site_manager':
        return <SiteManagerDashboard currentCompanyId={currentCompanyId} />;
      case 'worker':
        return <WorkerMobileView currentCompanyId={currentCompanyId} />;
      default:
        return <div className="text-white">Role not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans">
      <Navbar
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        currentCompanyId={currentCompanyId}
        setCurrentCompanyId={setCurrentCompanyId}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>
    </div>
  );
}

export default App;
