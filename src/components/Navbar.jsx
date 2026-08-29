import React, { useState } from 'react';
import { mockCompanies } from '../mockData';

export default function Navbar({ currentUser, impersonatedUser, stopImpersonation, onLogout, notifications = [], setNotifications }) {
  const [showNotifications, setShowNotifications] = useState(false);

  if (!currentUser && !impersonatedUser) return null;

  const displayUser = impersonatedUser || currentUser;
  const company = mockCompanies.find(c => c.id === displayUser.companyId);
  const companyName = company ? company.name : (displayUser.role === 'super_admin' ? 'Plateforme Globale' : '');

  const userNotifications = notifications.filter(n => n.roleTarget === displayUser.role || n.roleTarget === 'all');
  const unreadCount = userNotifications.filter(n => !n.read).length;

  const handleToggleNotifications = () => {
    if (!showNotifications) {
      // Mark as read
      const updated = notifications.map(n =>
        (n.roleTarget === displayUser.role || n.roleTarget === 'all') ? { ...n, read: true } : n
      );
      if (setNotifications) setNotifications(updated);
    }
    setShowNotifications(!showNotifications);
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'company_admin': return 'Admin Entreprise';
      case 'site_manager': return 'Chef de Chantier';
      case 'worker': return 'Compagnon';
      case 'client': return "Maître d'Ouvrage";
      default: return role;
    }
  };

  return (
    <>
      {impersonatedUser && (
        <div className="bg-amber-600 text-white text-center py-1.5 text-sm font-semibold flex justify-center items-center space-x-4 shadow-inner">
          <span>⚠️ Mode Impersonation : Vous naviguez en tant que {impersonatedUser.name} ({getRoleLabel(impersonatedUser.role)} - {companyName})</span>
          <button onClick={stopImpersonation} className="bg-amber-800 hover:bg-amber-700 px-3 py-0.5 rounded text-xs transition-colors border border-amber-900 shadow">Quitter l'impersonation</button>
        </div>
      )}
      <header className="bg-slate-900 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 text-white font-bold p-1 rounded shadow-sm flex items-center justify-center h-8 w-8">
                B
              </div>
              <span className="text-xl font-bold text-white tracking-wider hidden sm:block">
                BuildSync
              </span>
            </div>

            <div className="flex items-center space-x-4 relative">

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={handleToggleNotifications}
                  className="text-slate-300 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors focus:outline-none"
                >
                  <span className="text-xl">🔔</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)]">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                      <h3 className="text-sm font-bold text-white">Notifications</h3>
                      <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {userNotifications.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 text-sm">Aucune notification.</div>
                      ) : (
                        <ul className="divide-y divide-slate-700/50">
                          {userNotifications.map(n => (
                            <li key={n.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                              <p className="text-xs text-blue-400 font-bold mb-1">{n.title}</p>
                              <p className="text-sm text-slate-200">{n.message}</p>
                              <p className="text-xs text-slate-500 mt-2">{n.date}</p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden md:flex flex-col text-right">
                 <span className="text-sm font-bold text-slate-100">{displayUser.name}</span>
                 <div className="flex items-center justify-end space-x-2 mt-0.5">
                   <span className="text-[10px] uppercase tracking-wider bg-slate-800 text-blue-400 px-1.5 py-0.5 rounded border border-slate-700">{getRoleLabel(displayUser.role)}</span>
                   <span className="text-xs text-slate-400">{companyName}</span>
                 </div>
              </div>
              <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 font-bold border border-slate-600 shadow-inner">
                 {displayUser.name.charAt(0)}
              </div>
              <button
                onClick={onLogout}
                className="text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded border border-slate-700 transition-colors shadow-sm"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
