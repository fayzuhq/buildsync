import React from 'react';
import { mockCompanies, mockSites, mockWorkers } from '../mockData';

export default function CompanyAdminDashboard({ currentCompanyId }) {
  const company = mockCompanies.find(c => c.id === currentCompanyId);
  const companySites = mockSites.filter(s => s.companyId === currentCompanyId);
  const companyWorkers = mockWorkers.filter(w => w.companyId === currentCompanyId);

  if (!company) {
    return <div className="text-white p-4">Veuillez sélectionner une entreprise.</div>;
  }

  const handleCreateProject = () => {
    alert("Ouverture du formulaire de création de chantier (Mock)");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Tableau de bord : {company.name}</h1>
          <p className="text-zinc-400 text-sm">Plan actuel : <span className="text-amber-500 font-semibold">{company.planType}</span> | Renouvellement : {company.renewalDate}</p>
        </div>
        <button
          onClick={handleCreateProject}
          className="bg-amber-500 hover:bg-amber-600 text-zinc-900 font-bold py-2 px-4 rounded shadow transition-colors"
        >
          + Nouveau Chantier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700 shadow">
          <h3 className="text-zinc-400 text-sm font-semibold uppercase tracking-wider">Chantiers Actifs</h3>
          <p className="text-3xl font-bold text-white mt-1">{companySites.length}</p>
        </div>
        <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700 shadow">
          <h3 className="text-zinc-400 text-sm font-semibold uppercase tracking-wider">Effectif Total</h3>
          <p className="text-3xl font-bold text-white mt-1">{companyWorkers.length} / {company.memberCount}</p>
        </div>
        <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700 shadow">
          <h3 className="text-zinc-400 text-sm font-semibold uppercase tracking-wider">Facturation Mensuelle</h3>
          <p className="text-3xl font-bold text-white mt-1">{company.monthlyFee} €</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sites List */}
        <div className="bg-zinc-800 rounded-lg border border-zinc-700 shadow overflow-hidden">
          <div className="p-4 border-b border-zinc-700 bg-zinc-900">
            <h2 className="text-lg font-bold text-white">Nos Chantiers</h2>
          </div>
          <div className="p-0">
            <ul className="divide-y divide-zinc-700">
              {companySites.map(site => (
                <li key={site.id} className="p-4 hover:bg-zinc-700/30 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-zinc-100">{site.name}</h4>
                      <p className="text-sm text-zinc-400">{site.address}</p>
                      <p className="text-xs text-zinc-500 mt-1">Chef : {site.managerName}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      site.status === 'En cours' ? 'bg-blue-900 text-blue-300' :
                      site.status === 'En retard' ? 'bg-red-900 text-red-300' :
                      'bg-emerald-900 text-emerald-300'
                    }`}>
                      {site.status}
                    </span>
                  </div>
                </li>
              ))}
              {companySites.length === 0 && (
                <li className="p-4 text-zinc-500 text-center">Aucun chantier.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Workers List */}
        <div className="bg-zinc-800 rounded-lg border border-zinc-700 shadow overflow-hidden">
          <div className="p-4 border-b border-zinc-700 bg-zinc-900 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Personnel</h2>
            <button className="text-amber-500 text-sm hover:underline">Gérer</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-zinc-300 text-sm">
              <thead className="bg-zinc-900/50 text-zinc-400">
                <tr>
                  <th className="px-4 py-2">Nom</th>
                  <th className="px-4 py-2">Rôle</th>
                  <th className="px-4 py-2">Heures (semaine)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-700">
                {companyWorkers.map(worker => (
                  <tr key={worker.id} className="hover:bg-zinc-700/50">
                    <td className="px-4 py-3 font-medium text-white">{worker.name}</td>
                    <td className="px-4 py-3 text-zinc-400">{worker.role}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-full bg-zinc-700 rounded-full h-2 mr-2">
                          <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${Math.min(100, (worker.hoursLoggedThisWeek / 39) * 100)}%` }}></div>
                        </div>
                        <span className="text-xs">{worker.hoursLoggedThisWeek}h</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
