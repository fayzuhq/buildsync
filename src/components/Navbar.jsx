import React from 'react';
import { mockCompanies } from '../mockData';

export default function Navbar({ currentUser, impersonatedUser, stopImpersonation, onLogout }) {
  if (!currentUser && !impersonatedUser) return null;

  const displayUser = impersonatedUser || currentUser;
  const company = mockCompanies.find(c => c.id === displayUser.companyId);
  const companyName = company ? company.name : (displayUser.role === 'super_admin' ? 'Plateforme Globale' : '');

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
          <span>⚠️ Mode Impersonation Actif : Vous naviguez en tant que {companyName}</span>
          <button onClick={stopImpersonation} className="bg-amber-800 hover:bg-amber-700 px-3 py-0.5 rounded text-xs transition-colors border border-amber-900">Quitter l'impersonation</button>
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

            <div className="flex items-center space-x-4">
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
