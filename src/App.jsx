import React, { useState } from 'react';
import Navbar from './components/Navbar';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import CompanyAdminDashboard from './components/CompanyAdminDashboard';
import SiteManagerDashboard from './components/SiteManagerDashboard';
import WorkerMobileView from './components/WorkerMobileView';
import ClientPortalView from './components/ClientPortalView';
import LoginPage from './components/LoginPage';
import {
  mockPlatformSettings, mockCompanies, mockSites, mockWorkers,
  mockEquipment, mockDeliveries, mockSnags, mockQuotes,
  mockSubcontractors, mockGedFolders, mockAuditLogs, mockExpenses, mockLeaveRequests, mockNotifications, mockUsers, mockArticleCatalog
} from './mockData';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [impersonatedUser, setImpersonatedUser] = useState(null);

  // Lifted Global States
  const [globalSettings, setGlobalSettings] = useState(mockPlatformSettings);
  const [users, setUsers] = useState(mockUsers);
  const [companies, setCompanies] = useState(mockCompanies);
  const [articleCatalog, setArticleCatalog] = useState(mockArticleCatalog);
  const [sites, setSites] = useState(mockSites);
  const [workers, setWorkers] = useState(mockWorkers);
  const [equipment, setEquipment] = useState(mockEquipment);
  const [deliveries, setDeliveries] = useState(mockDeliveries);
  const [snags, setSnags] = useState(mockSnags);
  const [quotes, setQuotes] = useState(mockQuotes);
  const [subcontractors, setSubcontractors] = useState(mockSubcontractors);
  const [gedFolders, setGedFolders] = useState(mockGedFolders);
  const [auditLogs, setAuditLogs] = useState(mockAuditLogs);
  const [expenses, setExpenses] = useState(mockExpenses);
  const [leaveRequests, setLeaveRequests] = useState(mockLeaveRequests);
  const [notifications, setNotifications] = useState(mockNotifications);

  const addNotification = (title, message, roleTarget) => {
    setNotifications(prev => [{
      id: `n_${Date.now()}`,
      title,
      message,
      date: "À l'instant",
      read: false,
      roleTarget
    }, ...prev]);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setImpersonatedUser(null);
  };

  const stopImpersonation = () => {
    setImpersonatedUser(null);
  };

  if (!currentUser) {
    return <LoginPage onLogin={setCurrentUser} users={users} />;
  }

  const activeUser = impersonatedUser || currentUser;

  // Global Maintenance Check (Bypass for super admin)
  if (globalSettings.globalMaintenance && currentUser.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="text-blue-500 text-6xl mb-4">⚙️</div>
        <h1 className="text-3xl font-bold text-white mb-2">Maintenance en cours - BuildSync</h1>
        <p className="text-slate-400 max-w-md">
          Notre plateforme est actuellement en maintenance globale pour améliorer nos services. Retour estimé sous peu. Merci de votre patience.
        </p>
        <button onClick={handleLogout} className="mt-8 text-blue-400 hover:underline">Se déconnecter</button>
      </div>
    );
  }

  const activeCompany = companies.find(c => c.id === activeUser.companyId);

  // Global Lock Enforcement Check (Expired or Revoked License)
  if (activeCompany && activeUser.role !== 'super_admin' && activeUser.role !== 'client') {
    const isExpired = activeCompany.licenseExpiresAt && new Date(activeCompany.licenseExpiresAt) < new Date();
    if (activeCompany.isRevoked || isExpired) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
          <div className="text-rose-500 text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold text-white mb-2">Accès suspendu</h1>
          <p className="text-slate-400 max-w-md">
            Licence expirée ou révoquée par l'administrateur. Veuillez contacter le support.
          </p>
          <button onClick={handleLogout} className="mt-8 text-blue-400 hover:underline">Se déconnecter</button>
        </div>
      );
    }
  }

  // Tenant Maintenance Check (Bypass for super admin acting naturally, but applies if impersonating)
  if (activeCompany && activeCompany.maintenanceMode && activeUser.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar
          currentUser={currentUser}
          impersonatedUser={impersonatedUser}
          stopImpersonation={stopImpersonation}
          onLogout={handleLogout}
          notifications={notifications}
          setNotifications={setNotifications}
        />
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <div className="text-amber-500 text-6xl mb-4">🚧</div>
          <h1 className="text-2xl font-bold text-white mb-2">Espace Entreprise en Maintenance</h1>
          <p className="text-slate-400 max-w-md">
            L'espace de {activeCompany.name} est temporairement verrouillé pour maintenance par un administrateur.
          </p>
        </div>
      </div>
    );
  }

  // Render the appropriate view based on the selected role
  const renderView = () => {
    switch (activeUser.role) {
      case 'super_admin':
        return <SuperAdminDashboard
                 setImpersonatedUser={setImpersonatedUser}
                 globalSettings={globalSettings}
                 setGlobalSettings={setGlobalSettings}
                 companies={companies}
                 setCompanies={setCompanies}
                 auditLogs={auditLogs}
               />;
      case 'company_admin':
        return <CompanyAdminDashboard
                 currentCompanyId={activeUser.companyId}
                 companies={companies}
                 sites={sites} setSites={setSites}
                 workers={workers} setWorkers={setWorkers}
                 equipment={equipment} setEquipment={setEquipment}
                 quotes={quotes} setQuotes={setQuotes}
                 auditLogs={auditLogs}
                 subcontractors={subcontractors} setSubcontractors={setSubcontractors}
                 gedFolders={gedFolders} setGedFolders={setGedFolders}
                 snags={snags}
                 expenses={expenses}
                 leaveRequests={leaveRequests} setLeaveRequests={setLeaveRequests}
                 users={users} setUsers={setUsers}
                 articleCatalog={articleCatalog} setArticleCatalog={setArticleCatalog}
               />;
      case 'site_manager':
        return <SiteManagerDashboard
                 currentCompanyId={activeUser.companyId}
                 currentUser={activeUser}
                 sites={sites}
                 workers={workers} setWorkers={setWorkers}
                 equipment={equipment} setEquipment={setEquipment}
                 deliveries={deliveries} setDeliveries={setDeliveries}
                 snags={snags} setSnags={setSnags}
                 expenses={expenses} setExpenses={setExpenses}
                 leaveRequests={leaveRequests}
                 addNotification={addNotification}
               />;
      case 'worker':
        return <WorkerMobileView
                 currentCompanyId={activeUser.companyId}
                 currentUser={activeUser}
                 sites={sites}
                 workers={workers} setWorkers={setWorkers}
                 leaveRequests={leaveRequests} setLeaveRequests={setLeaveRequests}
                 addNotification={addNotification}
               />;
      case 'client':
        return <ClientPortalView
                 currentUser={activeUser}
                 sites={sites}
                 quotes={quotes} setQuotes={setQuotes}
                 gedFolders={gedFolders}
                 addNotification={addNotification}
               />;
      default:
        return <div className="text-white">Role not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans">
      <Navbar
        currentUser={currentUser}
        impersonatedUser={impersonatedUser}
        stopImpersonation={stopImpersonation}
        onLogout={handleLogout}
        notifications={notifications}
        setNotifications={setNotifications}
      />

      {/* Broadcast Banner */}
      {globalSettings.broadcastBanner && activeUser.role !== 'super_admin' && (
        <div className="bg-blue-900/50 border-b border-blue-800 text-blue-300 text-center py-2 text-sm font-medium px-4">
          📢 {globalSettings.broadcastBanner}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>
    </div>
  );
}

export default App;
