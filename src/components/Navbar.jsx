import React from 'react';
import { mockCompanies } from '../mockData';

export default function Navbar({ currentUser, onLogout }) {
  if (!currentUser) return null;

  const company = mockCompanies.find(c => c.id === currentUser.companyId);
  const companyName = company ? company.name : (currentUser.role === 'super_admin' ? 'Plateforme Globale' : '');

  const getRoleLabel = (role) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'company_admin': return 'Admin Entreprise';
      case 'site_manager': return 'Chef de Chantier';
      case 'worker': return 'Compagnon';
      default: return role;
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white font-bold p-1 rounded shadow-sm flex items-center justify-center h-8 w-8">
              B
            </div>
            <span className="text-xl font-bold text-white tracking-wider">
              BuildSync
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex flex-col text-right">
               <span className="text-sm font-bold text-slate-100">{currentUser.name}</span>
               <span className="text-xs text-slate-400">{getRoleLabel(currentUser.role)} {companyName && `• ${companyName}`}</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-blue-400 font-bold border border-slate-600">
               {currentUser.name.charAt(0)}
            </div>
            <button
              onClick={onLogout}
              className="text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded border border-slate-700 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
