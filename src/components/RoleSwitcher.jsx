import React from 'react';
import { mockCompanies } from '../mockData';

const roles = [
  { id: 'super_admin', label: 'Super Admin (Toi)' },
  { id: 'company_admin', label: 'Patron / Admin Entreprise' },
  { id: 'site_manager', label: 'Chef de Chantier' },
  { id: 'worker', label: 'Compagnon / Ouvrier' },
];

export default function RoleSwitcher({ currentRole, setCurrentRole, currentCompanyId, setCurrentCompanyId }) {
  return (
    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 bg-zinc-800 p-2 rounded-lg text-sm text-zinc-300">
      <div className="flex items-center space-x-2">
        <label htmlFor="role-select" className="font-semibold text-zinc-100">Rôle :</label>
        <select
          id="role-select"
          className="bg-zinc-700 text-white rounded p-1 border border-zinc-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
          value={currentRole}
          onChange={(e) => setCurrentRole(e.target.value)}
        >
          {roles.map(r => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>
      </div>

      {currentRole !== 'super_admin' && (
        <div className="flex items-center space-x-2">
          <label htmlFor="tenant-select" className="font-semibold text-zinc-100">Entreprise :</label>
          <select
            id="tenant-select"
            className="bg-zinc-700 text-white rounded p-1 border border-zinc-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
            value={currentCompanyId || ''}
            onChange={(e) => setCurrentCompanyId(e.target.value)}
          >
            {mockCompanies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
