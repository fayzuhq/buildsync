import React, { useState } from 'react';
import { mockCompanies, mockSites, mockWorkers, mockAuditLogs, mockEquipment } from '../mockData';

export default function CompanyAdminDashboard({ currentCompanyId }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [newWorker, setNewWorker] = useState({ name: '', role: 'Compagnon', email: '', phone: '', caces: '' });
  const [toastMessage, setToastMessage] = useState('');

  const company = mockCompanies.find(c => c.id === currentCompanyId);
  const companySites = mockSites.filter(s => s.companyId === currentCompanyId);
  const companyWorkers = mockWorkers.filter(w => w.companyId === currentCompanyId);
  const companyLogs = mockAuditLogs.filter(log => log.companyId === currentCompanyId);

  const companyHeavyEq = mockEquipment.heavyMachinery.filter(e => e.companyId === currentCompanyId);
  const companyLightEq = mockEquipment.lightTools.filter(e => e.companyId === currentCompanyId);

  if (!company) {
    return <div className="text-white p-4">Veuillez sélectionner une entreprise.</div>;
  }

  const handleAddWorker = (e) => {
    e.preventDefault();
    setToastMessage(`Identifiants confidentiels envoyés par SMS au ${newWorker.phone}`);
    setShowAddWorker(false);
    setTimeout(() => setToastMessage(''), 5000); // hide toast after 5s
  };

  const tabs = [
    { id: 'overview', label: "Vue d'ensemble" },
    { id: 'equipment', label: "Parc Matériel" },
    { id: 'staff', label: "Collaborateurs" },
    { id: 'logs', label: "Audit Logs" }
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 animate-bounce">
          <span>✓</span>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Espace Entreprise : {company.name}</h1>
          <p className="text-slate-400 text-sm">Plan actuel : <span className="text-blue-400 font-semibold">{company.planType}</span> | Renouvellement : {company.renewalDate}</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-1 border-b border-slate-700 overflow-x-auto pb-px">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow">
                <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Chantiers Actifs</h3>
                <p className="text-3xl font-bold text-white mt-1">{companySites.length}</p>
              </div>
              <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow">
                <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Effectif Total</h3>
                <p className="text-3xl font-bold text-white mt-1">{companyWorkers.length} / {company.memberCount}</p>
              </div>
              <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow">
                <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Facturation Mensuelle</h3>
                <p className="text-3xl font-bold text-white mt-1">{company.monthlyFee} €</p>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 shadow overflow-hidden">
              <div className="p-5 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">Nos Chantiers</h2>
                <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-3 rounded-lg shadow text-sm transition-colors">
                  + Nouveau
                </button>
              </div>
              <ul className="divide-y divide-slate-700/50">
                {companySites.map(site => (
                  <li key={site.id} className="p-5 hover:bg-slate-700/30 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-100">{site.name}</h4>
                        <p className="text-sm text-slate-400">{site.address}</p>
                        <p className="text-xs text-slate-500 mt-1">Chef : {site.managerName}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold border ${
                        site.status === 'En cours' ? 'bg-blue-900/30 text-blue-400 border-blue-800' :
                        site.status === 'En retard' ? 'bg-red-900/30 text-red-400 border-red-800' :
                        'bg-emerald-900/30 text-emerald-400 border-emerald-800'
                      }`}>
                        {site.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* EQUIPMENT TAB */}
        {activeTab === 'equipment' && (
          <div className="space-y-6">
             <div className="bg-slate-800 rounded-xl border border-slate-700 shadow overflow-hidden">
              <div className="p-5 border-b border-slate-700 bg-slate-900/50">
                <h2 className="text-lg font-bold text-white">Gros Engins & Machinerie</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-slate-300 text-sm">
                  <thead className="bg-slate-900/80 text-slate-400">
                    <tr>
                      <th className="px-5 py-3">Modèle</th>
                      <th className="px-5 py-3">Immatriculation/Série</th>
                      <th className="px-5 py-3">Chantier</th>
                      <th className="px-5 py-3">Statut</th>
                      <th className="px-5 py-3">Prochaine VGP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {companyHeavyEq.map(eq => (
                      <tr key={eq.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-5 py-3 font-medium text-white">{eq.name}</td>
                        <td className="px-5 py-3 text-slate-400">{eq.serialNumber}</td>
                        <td className="px-5 py-3 text-slate-400">
                          {eq.assignedSiteId ? companySites.find(s=>s.id === eq.assignedSiteId)?.name : 'Aucun (Dépôt)'}
                        </td>
                        <td className="px-5 py-3">
                           <span className={`px-2 py-1 rounded text-xs font-semibold ${eq.status === 'En service' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800' : eq.status === 'Disponible' ? 'bg-blue-900/30 text-blue-400 border border-blue-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>
                             {eq.status}
                           </span>
                        </td>
                        <td className="px-5 py-3 text-slate-400">{eq.nextInspectionDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
             </div>

             <div className="bg-slate-800 rounded-xl border border-slate-700 shadow overflow-hidden">
              <div className="p-5 border-b border-slate-700 bg-slate-900/50">
                <h2 className="text-lg font-bold text-white">Petit Outillage</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-slate-300 text-sm">
                  <thead className="bg-slate-900/80 text-slate-400">
                    <tr>
                      <th className="px-5 py-3">Outil</th>
                      <th className="px-5 py-3">Catégorie</th>
                      <th className="px-5 py-3">Détenteur</th>
                      <th className="px-5 py-3">État</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {companyLightEq.map(eq => (
                      <tr key={eq.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-5 py-3 font-medium text-white">{eq.name}</td>
                        <td className="px-5 py-3 text-slate-400">{eq.category}</td>
                        <td className="px-5 py-3 text-slate-400">
                           {eq.currentHolderWorkerId ? companyWorkers.find(w=>w.id === eq.currentHolderWorkerId)?.name : 'Au dépôt'}
                        </td>
                        <td className="px-5 py-3">
                           <span className={`px-2 py-1 rounded text-xs font-semibold ${eq.condition === 'Neuf' ? 'text-emerald-400' : eq.condition === 'Bon' ? 'text-blue-400' : 'text-amber-400'}`}>
                             {eq.condition}
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
             </div>
          </div>
        )}

        {/* STAFF TAB */}
        {activeTab === 'staff' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 shadow overflow-hidden">
            <div className="p-5 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Nos Collaborateurs</h2>
              <button
                onClick={() => setShowAddWorker(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-3 rounded-lg shadow text-sm transition-colors"
              >
                + Ajouter
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-slate-300 text-sm">
                <thead className="bg-slate-900/80 text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Nom</th>
                    <th className="px-5 py-3">Rôle</th>
                    <th className="px-5 py-3">Téléphone</th>
                    <th className="px-5 py-3">Heures (semaine)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {companyWorkers.map(worker => (
                    <tr key={worker.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-5 py-3 font-medium text-white">{worker.name}</td>
                      <td className="px-5 py-3 text-slate-400">{worker.role}</td>
                      <td className="px-5 py-3 text-slate-400">{worker.phone}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center">
                          <div className="w-full bg-slate-700 rounded-full h-2 mr-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, (worker.hoursLoggedThisWeek / 39) * 100)}%` }}></div>
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
        )}

        {/* LOGS TAB */}
        {activeTab === 'logs' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 shadow overflow-hidden">
            <div className="p-5 border-b border-slate-700 bg-slate-900/50">
              <h2 className="text-lg font-bold text-white">Journal d'Audit (Tenant Isolé)</h2>
            </div>
            <div className="p-5 space-y-3">
              {companyLogs.map(log => (
                <div key={log.id} className="flex flex-col sm:flex-row sm:items-center text-sm p-3 bg-slate-900 rounded-lg border border-slate-700/50">
                  <span className="text-slate-500 w-40 shrink-0 text-xs">{new Date(log.timestamp).toLocaleString()}</span>
                  <span className={`w-20 shrink-0 font-bold text-xs ${log.level === 'ERROR' ? 'text-red-400' : log.level === 'WARNING' ? 'text-amber-400' : 'text-blue-400'}`}>
                    [{log.level}]
                  </span>
                  <span className="text-slate-300 flex-grow"><span className="text-slate-100 font-semibold">{log.actor}</span> : {log.action}</span>
                </div>
              ))}
              {companyLogs.length === 0 && (
                <p className="text-slate-500 text-center py-4">Aucun log récent pour cette entreprise.</p>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Modal - Add Worker */}
      {showAddWorker && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900">
              <h3 className="text-lg font-bold text-white">Ajouter un collaborateur</h3>
              <button onClick={() => setShowAddWorker(false)} className="text-slate-400 hover:text-white transition-colors">✕</button>
            </div>
            <form onSubmit={handleAddWorker} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nom complet</label>
                <input required type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" value={newWorker.name} onChange={e => setNewWorker({...newWorker, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Rôle</label>
                <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" value={newWorker.role} onChange={e => setNewWorker({...newWorker, role: e.target.value})}>
                  <option value="Compagnon">Compagnon / Ouvrier</option>
                  <option value="Chef de chantier">Chef de chantier</option>
                  <option value="Admin">Administrateur</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email (Optionnel)</label>
                <input type="email" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" value={newWorker.email} onChange={e => setNewWorker({...newWorker, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Téléphone Mobile (Requis pour SMS)</label>
                <input required type="tel" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" value={newWorker.phone} onChange={e => setNewWorker({...newWorker, phone: e.target.value})} placeholder="06..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Certifications / CACES</label>
                <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" value={newWorker.caces} onChange={e => setNewWorker({...newWorker, caces: e.target.value})} placeholder="Ex: CACES R482 Cat A..." />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowAddWorker(false)} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">Annuler</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors shadow">Envoyer accès par SMS</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
