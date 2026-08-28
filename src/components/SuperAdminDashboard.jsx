import React, { useState } from 'react';
import { mockStats, mockInvoicesSaaS } from '../mockData';

export default function SuperAdminDashboard({ setImpersonatedUser, globalSettings, setGlobalSettings, companies, setCompanies, auditLogs }) {
  const [activeTab, setActiveTab] = useState('entreprises');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [logCompanyFilter, setLogCompanyFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState('');

  // Form state for new company
  const [newCompany, setNewCompany] = useState({
    name: '', siren: '', contactEmail: '', phone: '', planType: 'Starter', userLimit: 5
  });

  const [bannerInput, setBannerInput] = useState(globalSettings.broadcastBanner);

  const [pricing, setPricing] = useState({
    Starter: { price: 49, maxUsers: 5, maxSites: 3 },
    Pro: { price: 299, maxUsers: 20, maxSites: 10 },
    Enterprise: { price: 999, maxUsers: 999, maxSites: 999 }
  });

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.siren.includes(searchTerm)
  );

  const filteredLogs = auditLogs.filter(log => logCompanyFilter === 'All' || log.companyId === logCompanyFilter);

  const handleAddCompany = (e) => {
    e.preventDefault();
    const id = `c${companies.length + 1}`;
    setCompanies([...companies, {
      id,
      name: newCompany.name,
      siren: newCompany.siren,
      contactEmail: newCompany.contactEmail,
      planType: newCompany.planType,
      status: 'Actif',
      memberCount: 1,
      activeSites: 0,
      monthlyFee: newCompany.planType === 'Starter' ? 49 : newCompany.planType === 'Pro' ? 299 : 999,
      renewalDate: '2025-01-01',
      maintenanceMode: false,
      features: { grosEngins: false, exportPaie: false, situations: false, signatureElectronique: false }
    }]);
    alert(`Tenant créé. Identifiants envoyés par SMS au ${newCompany.phone}`);
    setShowModal(false);
    setNewCompany({ name: '', siren: '', contactEmail: '', phone: '', planType: 'Starter', userLimit: 5 });
  };

  const handleToggleGlobalMaintenance = () => {
    setGlobalSettings({ ...globalSettings, globalMaintenance: !globalSettings.globalMaintenance });
  };

  const handlePublishBanner = () => {
    setGlobalSettings({ ...globalSettings, broadcastBanner: bannerInput });
    alert("Flash Info publié.");
  };

  const handleSavePricing = () => {
    setToastMessage("Matrice des forfaits mise à jour avec succès.");
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleSaveFeatures = (e) => {
    e.preventDefault();
    alert("Configuration enregistrée.");
    setShowFeatureModal(false);
  };

  const handleImpersonate = (company) => {
    setImpersonatedUser({
      id: 'impersonated',
      name: `Admin (${company.name})`,
      role: 'company_admin',
      companyId: company.id
    });
  };

  const tabs = [
    { id: 'entreprises', label: 'Entreprises Adhérentes' },
    { id: 'pricing', label: 'Forfaits & Quotas' },
    { id: 'billing', label: 'Facturation SaaS' },
    { id: 'audit', label: 'Journaux d\'audit & Flash Info' }
  ];

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center space-x-2 animate-bounce">
          <span>✓</span>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
           <h1 className="text-2xl font-bold text-slate-100">Console Super Administrateur</h1>
        </div>
        <div className="flex items-center space-x-4">
           <label className="flex items-center space-x-2 text-sm text-slate-300 cursor-pointer">
             <input
               type="checkbox"
               className="rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500 cursor-pointer"
               checked={globalSettings.globalMaintenance}
               onChange={handleToggleGlobalMaintenance}
             />
             <span>Maintenance Globale</span>
           </label>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/90 p-5 rounded-xl border border-slate-700 shadow">
          <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">MRR</h3>
          <p className="text-3xl font-bold text-white mt-1">{mockStats.mrr} €</p>
        </div>
        <div className="bg-slate-800/90 p-5 rounded-xl border border-slate-700 shadow">
          <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Total Entreprises</h3>
          <p className="text-3xl font-bold text-white mt-1">{mockStats.activeTenants}</p>
        </div>
        <div className="bg-slate-800/90 p-5 rounded-xl border border-slate-700 shadow">
          <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Chantiers Actifs</h3>
          <p className="text-3xl font-bold text-white mt-1">{mockStats.totalActiveSites}</p>
        </div>
        <div className="bg-slate-800/90 p-5 rounded-xl border border-slate-700 shadow flex flex-col justify-center">
          <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Santé Système</h3>
          <p className="text-3xl font-bold text-emerald-400 mt-1">{mockStats.systemHealth}%</p>
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

        {/* ENTREPRISES TAB */}
        {activeTab === 'entreprises' && (
          <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow overflow-hidden">
            <div className="p-5 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-center bg-slate-900/50 space-y-3 sm:space-y-0">
              <input
                type="text"
                placeholder="Rechercher (Nom, SIREN)..."
                className="w-full sm:w-64 bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                onClick={() => setShowModal(true)}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow transition-colors text-sm"
              >
                + Adhérer une Entreprise
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-slate-300 text-sm">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="px-5 py-3">Entreprise</th>
                    <th className="px-5 py-3">SIREN</th>
                    <th className="px-5 py-3">Plan</th>
                    <th className="px-5 py-3">Statut</th>
                    <th className="px-5 py-3">MRR</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filteredCompanies.map(company => (
                    <tr key={company.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-white">{company.name}</div>
                        <div className="text-xs text-slate-500">{company.contactEmail}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-400">{company.siren}</td>
                      <td className="px-5 py-4">
                        <span className="bg-slate-700 px-2 py-1 rounded text-xs text-slate-200 border border-slate-600">{company.planType}</span>
                      </td>
                      <td className="px-5 py-4">
                         <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                           company.status === 'Actif' && !company.maintenanceMode ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' :
                           company.maintenanceMode ? 'bg-amber-900/30 text-amber-400 border-amber-800' :
                           'bg-red-900/30 text-red-400 border-red-800'
                         }`}>
                           {company.maintenanceMode ? 'Maintenance' : company.status}
                         </span>
                      </td>
                      <td className="px-5 py-4 font-medium">{company.monthlyFee} €</td>
                      <td className="px-5 py-4 text-right space-x-3">
                         <button onClick={() => { setSelectedCompany(company); setShowFeatureModal(true); }} className="text-slate-400 hover:text-white transition-colors" title="Modules & Features">⚙️</button>
                         <button onClick={() => handleImpersonate(company)} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Impersonate</button>
                      </td>
                    </tr>
                  ))}
                  {filteredCompanies.length === 0 && (
                    <tr><td colSpan="6" className="px-5 py-8 text-center text-slate-500">Aucune entreprise trouvée.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PRICING TAB */}
        {activeTab === 'pricing' && (
          <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow p-6">
             <h2 className="text-lg font-bold text-white mb-4">Matrice des forfaits</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['Starter', 'Pro', 'Enterprise'].map((plan) => (
                  <div key={plan} className="bg-slate-900/50 border border-slate-700 rounded-lg p-5">
                    <h3 className="text-xl font-bold text-blue-400 mb-2">{plan}</h3>
                    <div className="space-y-4 mt-4">
                      <div>
                         <label className="text-xs text-slate-400 uppercase">Prix mensuel (€)</label>
                         <input
                           type="number"
                           value={pricing[plan].price}
                           onChange={(e) => setPricing({...pricing, [plan]: {...pricing[plan], price: parseInt(e.target.value)}})}
                           className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white mt-1 outline-none focus:border-blue-500"
                         />
                      </div>
                      <div>
                         <label className="text-xs text-slate-400 uppercase">Max Utilisateurs</label>
                         <input
                           type="number"
                           value={pricing[plan].maxUsers}
                           onChange={(e) => setPricing({...pricing, [plan]: {...pricing[plan], maxUsers: parseInt(e.target.value)}})}
                           className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white mt-1 outline-none focus:border-blue-500"
                         />
                      </div>
                      <div>
                         <label className="text-xs text-slate-400 uppercase">Max Chantiers</label>
                         <input
                           type="number"
                           value={pricing[plan].maxSites}
                           onChange={(e) => setPricing({...pricing, [plan]: {...pricing[plan], maxSites: parseInt(e.target.value)}})}
                           className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white mt-1 outline-none focus:border-blue-500"
                         />
                      </div>
                      <button onClick={handleSavePricing} className="w-full bg-slate-700 hover:bg-slate-600 text-white rounded py-2 text-sm transition-colors mt-2">Mettre à jour</button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* BILLING TAB */}
        {activeTab === 'billing' && (
          <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow overflow-hidden">
             <div className="p-5 border-b border-slate-700 bg-slate-900/50">
               <h2 className="text-lg font-bold text-white">Factures Émises</h2>
             </div>
             <div className="overflow-x-auto">
              <table className="w-full text-left text-slate-300 text-sm">
                <thead className="bg-slate-900/80 text-slate-400">
                  <tr>
                    <th className="px-5 py-3">ID Facture</th>
                    <th className="px-5 py-3">Client</th>
                    <th className="px-5 py-3">Montant</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Statut</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {mockInvoicesSaaS.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-5 py-4 font-mono text-slate-400">{inv.id}</td>
                      <td className="px-5 py-4 font-medium text-white">{inv.companyName}</td>
                      <td className="px-5 py-4">{inv.amount} €</td>
                      <td className="px-5 py-4 text-slate-400">{inv.date}</td>
                      <td className="px-5 py-4">
                         <span className={`px-2 py-1 rounded text-xs font-semibold border ${inv.status === 'Payé' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' : inv.status === 'En attente' ? 'bg-amber-900/30 text-amber-400 border-amber-800' : 'bg-red-900/30 text-red-400 border-red-800'}`}>
                           {inv.status}
                         </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                         <button className="text-blue-400 hover:text-blue-300 text-sm transition-colors">PDF</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
             </div>
          </div>
        )}

        {/* AUDIT & BANNER TAB */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="bg-slate-800/90 p-5 rounded-xl border border-slate-700 shadow">
               <h2 className="text-lg font-bold text-white mb-3">Flash Info (Broadcast Banner)</h2>
               <div className="flex space-x-3">
                 <input
                   type="text"
                   value={bannerInput}
                   onChange={(e) => setBannerInput(e.target.value)}
                   className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 outline-none"
                   placeholder="Message global..."
                 />
                 <button onClick={handlePublishBanner} className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-lg font-bold transition-colors shadow">Publier</button>
               </div>
            </div>

            <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow overflow-hidden">
              <div className="p-5 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">Audit Logs</h2>
                <select
                  className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 focus:border-blue-500 outline-none text-sm"
                  value={logCompanyFilter}
                  onChange={(e) => setLogCompanyFilter(e.target.value)}
                >
                  <option value="All">Toutes les entités</option>
                  <option value="system">Système global</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="p-5 space-y-3">
                {filteredLogs.map(log => (
                  <div key={log.id} className="flex flex-col sm:flex-row sm:items-center text-sm p-3 bg-slate-900 rounded-lg border border-slate-700/50 space-y-2 sm:space-y-0">
                    <span className="text-slate-500 w-40 shrink-0 text-xs">{new Date(log.timestamp).toLocaleString()}</span>
                    <span className={`inline-flex items-center justify-center shrink-0 w-20 px-2 py-0.5 rounded text-xs font-bold border ${log.level === 'ERROR' ? 'bg-red-900/20 text-red-400 border-red-800/50' : log.level === 'WARNING' ? 'bg-amber-900/20 text-amber-400 border-amber-800/50' : 'bg-blue-900/20 text-blue-400 border-blue-800/50'}`}>
                      {log.level}
                    </span>
                    <span className="text-slate-300 flex-grow sm:ml-4"><span className="text-slate-100 font-semibold">{log.actor}</span> <span className="text-slate-500">({log.companyName})</span> : {log.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal - Adhérer Entreprise */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900">
              <h3 className="text-lg font-bold text-white">Adhérer une Entreprise</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>
            <form onSubmit={handleAddCompany} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-2">
                   <label className="block text-sm font-medium text-slate-300 mb-1">Nom de l'entreprise</label>
                   <input required type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-blue-500" value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-1">SIREN / SIRET</label>
                   <input required type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-blue-500" value={newCompany.siren} onChange={e => setNewCompany({...newCompany, siren: e.target.value})} />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-1">Forfait initial</label>
                   <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-blue-500" value={newCompany.planType} onChange={e => setNewCompany({...newCompany, planType: e.target.value})}>
                     <option value="Starter">Starter</option>
                     <option value="Pro">Pro</option>
                     <option value="Enterprise">Enterprise</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-1">Email Gérant</label>
                   <input required type="email" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-blue-500" value={newCompany.contactEmail} onChange={e => setNewCompany({...newCompany, contactEmail: e.target.value})} />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-1">Mobile Gérant (SMS Onboarding)</label>
                   <input required type="tel" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-blue-500" value={newCompany.phone} onChange={e => setNewCompany({...newCompany, phone: e.target.value})} />
                 </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700">Annuler</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 shadow">Créer le Tenant</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Feature Flags */}
      {showFeatureModal && selectedCompany && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900">
              <h3 className="text-lg font-bold text-white">Configuration : {selectedCompany.name}</h3>
              <button onClick={() => setShowFeatureModal(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Feature Flags / Modules</h4>
              {Object.entries(selectedCompany.features || {}).map(([key, val]) => (
                 <label key={key} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                    <span className="text-slate-200 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <input type="checkbox" className="rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500" defaultChecked={val} />
                 </label>
              ))}
              <div className="pt-4 border-t border-slate-700 mt-4">
                 <label className="flex items-center space-x-2 text-amber-500 font-bold">
                    <input type="checkbox" className="rounded border-amber-600 bg-slate-800 text-amber-500 focus:ring-amber-500" defaultChecked={selectedCompany.maintenanceMode} />
                    <span>Mode Maintenance (Verrouiller tenant)</span>
                 </label>
              </div>
            </div>
            <div className="p-5 border-t border-slate-700 bg-slate-900 flex justify-end space-x-3">
               <button onClick={() => setShowFeatureModal(false)} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700">Fermer</button>
               <button onClick={handleSaveFeatures} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 shadow">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
