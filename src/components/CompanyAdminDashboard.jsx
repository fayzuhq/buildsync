import React, { useState } from 'react';
import { mockCompanies, mockSites, mockWorkers, mockAuditLogs, mockEquipment, mockQuotes } from '../mockData';

export default function CompanyAdminDashboard({ currentCompanyId }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [showSiteModal, setShowSiteModal] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);

  const [newWorker, setNewWorker] = useState({ name: '', role: 'Compagnon', email: '', phone: '', caces: '' });
  const [toastMessage, setToastMessage] = useState('');

  const company = mockCompanies.find(c => c.id === currentCompanyId);
  const companySites = mockSites.filter(s => s.companyId === currentCompanyId);
  const companyWorkers = mockWorkers.filter(w => w.companyId === currentCompanyId);
  const companyLogs = mockAuditLogs.filter(log => log.companyId === currentCompanyId);
  const companyQuotes = mockQuotes.filter(q => q.companyId === currentCompanyId);

  const companyHeavyEq = mockEquipment.heavyMachinery.filter(e => e.companyId === currentCompanyId);
  const companyLightEq = mockEquipment.lightTools.filter(e => e.companyId === currentCompanyId);

  if (!company) {
    return <div className="text-white p-4">Veuillez sélectionner une entreprise.</div>;
  }

  const handleAddWorker = (e) => {
    e.preventDefault();
    setToastMessage(`Identifiants et lien temporaire envoyés par SMS au ${newWorker.phone}`);
    setShowAddWorker(false);
    setTimeout(() => setToastMessage(''), 5000);
  };

  const openSiteModal = (site) => {
    setSelectedSite(site);
    setShowSiteModal(true);
  };

  const tabs = [
    { id: 'overview', label: "Vue d'ensemble & Chantiers" },
    { id: 'planning', label: "Planning & Équipes" },
    { id: 'billing', label: "Devis & Facturation (Situations)" },
    { id: 'equipment', label: "Parc Matériel & Engins" },
    { id: 'staff', label: "Collaborateurs & SMS Onboarding" },
    { id: 'payroll', label: "Export Paie & Audit Logs" }
  ];

  const totalBudget = companySites.reduce((sum, s) => sum + s.budget, 0);
  const totalConsumed = companySites.reduce((sum, s) => sum + s.budgetConsumed, 0);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center space-x-2 animate-bounce">
          <span>✓</span>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* KPI Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/90 p-5 rounded-xl border border-slate-700 shadow">
          <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">CA en cours</h3>
          <p className="text-3xl font-bold text-white mt-1">{totalBudget.toLocaleString()} €</p>
        </div>
        <div className="bg-slate-800/90 p-5 rounded-xl border border-slate-700 shadow">
          <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Chantiers Actifs</h3>
          <p className="text-3xl font-bold text-white mt-1">{companySites.length}</p>
        </div>
        <div className="bg-slate-800/90 p-5 rounded-xl border border-slate-700 shadow">
          <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Total Effectif</h3>
          <p className="text-3xl font-bold text-white mt-1">{companyWorkers.length} / {company.memberCount}</p>
        </div>
        <div className="bg-slate-800/90 p-5 rounded-xl border border-slate-700 shadow">
          <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Heures / Budget</h3>
          <p className="text-3xl font-bold text-blue-400 mt-1">{Math.round((totalConsumed/totalBudget)*100)}% Consommé</p>
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

        {/* TAB 1: OVERVIEW & SITES */}
        {activeTab === 'overview' && (
          <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow overflow-hidden">
            <div className="p-5 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Chantiers en cours</h2>
              <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-3 rounded-lg shadow text-sm transition-colors">
                + Nouveau Chantier
              </button>
            </div>
            <ul className="divide-y divide-slate-700/50">
              {companySites.map(site => (
                <li key={site.id} onClick={() => openSiteModal(site)} className="p-5 hover:bg-slate-700/30 transition-colors cursor-pointer block sm:flex sm:justify-between sm:items-center space-y-4 sm:space-y-0">
                  <div className="sm:w-1/3">
                    <h4 className="font-bold text-slate-100 text-lg">{site.name}</h4>
                    <p className="text-sm text-slate-400">{site.address}</p>
                    <p className="text-xs text-slate-500 mt-1">Chef: {site.managerName}</p>
                  </div>
                  <div className="sm:w-1/3 px-4">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Avancement</span>
                      <span>{site.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2">
                       <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${site.progress}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 text-right">{site.budgetConsumed.toLocaleString()} / {site.budget.toLocaleString()} €</p>
                  </div>
                  <div className="sm:w-1/4 text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border inline-block ${
                      site.status === 'En cours' ? 'bg-blue-900/30 text-blue-400 border-blue-800' :
                      site.status === 'En retard' ? 'bg-amber-900/30 text-amber-400 border-amber-800' :
                      'bg-emerald-900/30 text-emerald-400 border-emerald-800'
                    }`}>
                      {site.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* TAB 2: PLANNING */}
        {activeTab === 'planning' && (
          <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow p-6 min-h-[400px] flex items-center justify-center text-slate-500">
             <div className="text-center">
                <span className="text-4xl block mb-4">📅</span>
                <p>Composant Gantt / Calendrier (Vue semaine)</p>
                <p className="text-sm">Allocation du personnel et des engins lourds.</p>
             </div>
          </div>
        )}

        {/* TAB 3: BILLING / QUOTES */}
        {activeTab === 'billing' && (
          <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow overflow-hidden">
            <div className="p-5 border-b border-slate-700 bg-slate-900/50">
              <h2 className="text-lg font-bold text-white">Suivi des Devis & Situations</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-slate-300 text-sm">
                <thead className="bg-slate-900/80 text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Réf</th>
                    <th className="px-5 py-3">Client (Chantier)</th>
                    <th className="px-5 py-3">Montant HT</th>
                    <th className="px-5 py-3">Situation Avancement</th>
                    <th className="px-5 py-3">Paiement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {companyQuotes.map(quote => (
                    <tr key={quote.id} className="hover:bg-slate-700/30">
                      <td className="px-5 py-4 font-mono text-slate-500">{quote.id}</td>
                      <td className="px-5 py-4 font-medium text-slate-200">
                         {quote.client} <br/>
                         <span className="text-xs text-slate-500">{companySites.find(s=>s.id === quote.siteId)?.name}</span>
                      </td>
                      <td className="px-5 py-4 font-mono">{quote.amount.toLocaleString()} €</td>
                      <td className="px-5 py-4">
                         <div className="flex items-center space-x-2">
                           <div className="flex-1 bg-slate-900 rounded-full h-2 w-24">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${quote.progressBilling}%` }}></div>
                           </div>
                           <span className="text-xs font-bold text-blue-400">{quote.progressBilling}%</span>
                         </div>
                      </td>
                      <td className="px-5 py-4">
                         <span className={`px-2 py-1 rounded text-xs font-semibold border ${quote.paymentStatus === 'Payé' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' : quote.paymentStatus === 'Facturé' ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'bg-red-900/30 text-red-400 border-red-800'}`}>
                           {quote.paymentStatus}
                         </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: EQUIPMENT */}
        {activeTab === 'equipment' && (
          <div className="space-y-6">
             <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow overflow-hidden">
              <div className="p-5 border-b border-slate-700 bg-slate-900/50">
                <h2 className="text-lg font-bold text-white">Gros Matériel & Engins Lourds</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-slate-300 text-sm">
                  <thead className="bg-slate-900/80 text-slate-400">
                    <tr>
                      <th className="px-5 py-3">Équipement / Modèle</th>
                      <th className="px-5 py-3">S/N - Immat</th>
                      <th className="px-5 py-3">Chantier Actuel</th>
                      <th className="px-5 py-3">Statut</th>
                      <th className="px-5 py-3">Prochaine VGP</th>
                      <th className="px-5 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {companyHeavyEq.map(eq => (
                      <tr key={eq.id} className="hover:bg-slate-700/30">
                        <td className="px-5 py-3 font-medium text-white">{eq.name}</td>
                        <td className="px-5 py-3 text-slate-400">{eq.serialNumber}</td>
                        <td className="px-5 py-3 text-slate-400">
                          {eq.assignedSiteId ? companySites.find(s=>s.id === eq.assignedSiteId)?.name : 'Dépôt Central'}
                        </td>
                        <td className="px-5 py-3">
                           <span className={`px-2 py-1 rounded text-xs font-semibold border ${eq.status === 'En service' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' : eq.status === 'Disponible' ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'bg-red-900/30 text-red-400 border-red-800'}`}>
                             {eq.status}
                           </span>
                        </td>
                        <td className="px-5 py-3 text-slate-400">{eq.nextInspectionDate}</td>
                        <td className="px-5 py-3">
                           <button className="text-blue-400 hover:text-blue-300 text-xs">Transférer / Réassigner</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
             </div>

             <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow overflow-hidden">
              <div className="p-5 border-b border-slate-700 bg-slate-900/50">
                <h2 className="text-lg font-bold text-white">Petit Outillage</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-slate-300 text-sm">
                  <thead className="bg-slate-900/80 text-slate-400">
                    <tr>
                      <th className="px-5 py-3">Outil</th>
                      <th className="px-5 py-3">Catégorie</th>
                      <th className="px-5 py-3">Détenteur (Ouvrier)</th>
                      <th className="px-5 py-3">État</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {companyLightEq.map(eq => (
                      <tr key={eq.id} className="hover:bg-slate-700/30">
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

        {/* TAB 5: STAFF */}
        {activeTab === 'staff' && (
          <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow overflow-hidden">
            <div className="p-5 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Annuaire des Collaborateurs</h2>
              <button
                onClick={() => setShowAddWorker(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-3 rounded-lg shadow text-sm transition-colors"
              >
                + Ajouter un collaborateur
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-slate-300 text-sm">
                <thead className="bg-slate-900/80 text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Nom</th>
                    <th className="px-5 py-3">Rôle</th>
                    <th className="px-5 py-3">Téléphone</th>
                    <th className="px-5 py-3">CACES / Certifications</th>
                    <th className="px-5 py-3">Visite Médicale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {companyWorkers.map(worker => (
                    <tr key={worker.id} className="hover:bg-slate-700/30">
                      <td className="px-5 py-4 font-medium text-white">{worker.name}</td>
                      <td className="px-5 py-4 text-slate-400">{worker.role}</td>
                      <td className="px-5 py-4 text-slate-400">{worker.phone}</td>
                      <td className="px-5 py-4 text-slate-400 text-xs">{worker.caces}</td>
                      <td className="px-5 py-4 text-slate-400 text-xs">{worker.medicalExpiry}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: PAYROLL & LOGS */}
        {activeTab === 'payroll' && (
          <div className="space-y-6">
            <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow overflow-hidden">
              <div className="p-5 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">Export Paie (Mois en cours)</h2>
                <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-3 rounded-lg shadow text-sm transition-colors flex items-center">
                   <span>Exporter CSV / Sage / Lucca</span>
                </button>
              </div>
              <div className="overflow-x-auto p-5">
                <table className="w-full text-left text-slate-300 text-sm border border-slate-700 rounded">
                  <thead className="bg-slate-900/50 text-slate-400">
                    <tr>
                      <th className="p-3 border-b border-slate-700">Collaborateur</th>
                      <th className="p-3 border-b border-slate-700">Heures Normales</th>
                      <th className="p-3 border-b border-slate-700">Heures Sup (25%)</th>
                      <th className="p-3 border-b border-slate-700">Paniers Repas</th>
                    </tr>
                  </thead>
                  <tbody>
                     {companyWorkers.map(w => (
                       <tr key={w.id} className="border-b border-slate-700 last:border-0">
                         <td className="p-3 font-medium text-white">{w.name}</td>
                         <td className="p-3">151.67 h</td>
                         <td className="p-3 text-amber-400">{w.hoursLoggedThisWeek > 35 ? (w.hoursLoggedThisWeek - 35) * 4 : 0} h</td>
                         <td className="p-3">20</td>
                       </tr>
                     ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow overflow-hidden">
              <div className="p-5 border-b border-slate-700 bg-slate-900/50">
                <h2 className="text-lg font-bold text-white">Journal d'Audit (Tenant Isolé)</h2>
              </div>
              <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
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
          </div>
        )}

      </div>

      {/* Modal - Fiche Chantier 360° */}
      {showSiteModal && selectedSite && (
        <div className="fixed inset-0 bg-slate-950/90 flex justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-4xl my-auto">
            <div className="p-6 border-b border-slate-700 flex justify-between items-start bg-slate-900 sticky top-0 z-10">
              <div>
                 <h2 className="text-2xl font-bold text-white">Fiche Chantier 360° : {selectedSite.name}</h2>
                 <p className="text-slate-400 flex items-center mt-1">📍 {selectedSite.address}</p>
              </div>
              <button onClick={() => setShowSiteModal(false)} className="text-slate-400 hover:text-white text-2xl font-bold">✕</button>
            </div>
            <div className="p-6 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                     <p className="text-sm text-slate-400 uppercase">Chef de chantier</p>
                     <p className="text-lg font-bold text-white">{selectedSite.managerName}</p>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                     <p className="text-sm text-slate-400 uppercase">Budget / Rentabilité</p>
                     <p className="text-lg font-bold text-white">{selectedSite.budgetConsumed.toLocaleString()} / {selectedSite.budget.toLocaleString()} €</p>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                     <p className="text-sm text-slate-400 uppercase">Statut global</p>
                     <p className="text-lg font-bold text-blue-400">{selectedSite.status}</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-200 border-b border-slate-700 pb-2">Document & GED</h3>
                    <ul className="space-y-2 text-sm">
                       <li className="flex justify-between items-center bg-slate-900/50 p-2 rounded">
                          <span className="text-slate-300">📄 Permis de construire.pdf</span>
                          <button className="text-blue-400 hover:underline">Voir</button>
                       </li>
                       <li className="flex justify-between items-center bg-slate-900/50 p-2 rounded">
                          <span className="text-slate-300">📄 Plans d'architecte V2.pdf</span>
                          <button className="text-blue-400 hover:underline">Voir</button>
                       </li>
                       <li className="flex justify-between items-center bg-slate-900/50 p-2 rounded">
                          <span className="text-slate-300">📄 DOE (Dossier des Ouvrages Exécutés)</span>
                          <span className="text-amber-500 text-xs border border-amber-500 px-1 rounded">En attente</span>
                       </li>
                    </ul>
                 </div>
                 <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-200 border-b border-slate-700 pb-2">Réserves & Signature Client</h3>
                    <div className="bg-slate-900/50 p-4 rounded text-center border border-slate-700">
                       <p className="text-slate-400 mb-2">2 réserves ouvertes sur ce chantier.</p>
                       <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded text-sm transition-colors">Consulter la Punch List</button>
                    </div>
                 </div>
               </div>

               <div>
                  <h3 className="text-lg font-bold text-slate-200 border-b border-slate-700 pb-2 mb-4">Live Photo Feed (Dernières photos du terrain)</h3>
                  <div className="flex space-x-4 overflow-x-auto pb-4">
                     {[1,2,3,4].map(i => (
                        <div key={i} className="min-w-[150px] h-24 bg-slate-700 rounded-lg flex items-center justify-center text-slate-500 text-xs">
                           Photo_{i}.jpg
                        </div>
                     ))}
                  </div>
               </div>

            </div>
          </div>
        </div>
      )}

      {/* Modal - Add Worker */}
      {showAddWorker && (
        <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900">
              <h3 className="text-lg font-bold text-white">Ajouter un collaborateur</h3>
              <button onClick={() => setShowAddWorker(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>
            <form onSubmit={handleAddWorker} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nom complet</label>
                <input required type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 outline-none" value={newWorker.name} onChange={e => setNewWorker({...newWorker, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Rôle</label>
                <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 outline-none" value={newWorker.role} onChange={e => setNewWorker({...newWorker, role: e.target.value})}>
                  <option value="Compagnon">Compagnon / Ouvrier</option>
                  <option value="Chef de chantier">Chef de chantier</option>
                  <option value="Admin">Administrateur</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Téléphone Mobile (SMS Onboarding)</label>
                <input required type="tel" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 outline-none" value={newWorker.phone} onChange={e => setNewWorker({...newWorker, phone: e.target.value})} placeholder="06..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Certifications / CACES</label>
                <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 outline-none" value={newWorker.caces} onChange={e => setNewWorker({...newWorker, caces: e.target.value})} placeholder="Ex: CACES R482 Cat A..." />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowAddWorker(false)} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">Annuler</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 shadow">Envoyer accès par SMS</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
