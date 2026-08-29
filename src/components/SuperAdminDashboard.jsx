import React, { useState } from 'react';
import { mockStats, mockInvoicesSaaS } from '../mockData';

export default function SuperAdminDashboard({ currentUser, setImpersonatedUser, globalSettings, setGlobalSettings, companies, setCompanies, users, setUsers, sites, setSites, workers, setWorkers, quotes, setQuotes, supportTickets, setSupportTickets, auditLogs, expenses, snags }) {
  const [activeTab, setActiveTab] = useState('entreprises');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [showInspectorModal, setShowInspectorModal] = useState(false);
  const [showImpersonateModal, setShowImpersonateModal] = useState(false);
  const [inspectorTab, setInspectorTab] = useState('profile');
  const [isSnapshotting, setIsSnapshotting] = useState(false);
  const [snapshotProgress, setSnapshotProgress] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [logCompanyFilter, setLogCompanyFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState('');

  const [licenseConfig, setLicenseConfig] = useState({ duration: '12', planType: 'Starter' });

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
    setToastMessage("Configuration enregistrée.");
    setTimeout(() => setToastMessage(''), 4000);
    setShowFeatureModal(false);
  };

  const handleGenerateLicense = (e) => {
    e.preventDefault();
    const months = parseInt(licenseConfig.duration);
    const expiration = new Date();
    expiration.setMonth(expiration.getMonth() + months);

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newKey = `BS-${new Date().getFullYear()}-${licenseConfig.planType.substring(0,4).toUpperCase()}-${randomSuffix}`;

    setCompanies(companies.map(c => c.id === selectedCompany.id ? {
       ...c,
       licenseKey: newKey,
       licenseExpiresAt: expiration.toISOString(),
       planType: licenseConfig.planType,
       isRevoked: false
    } : c));

    setToastMessage("Clé d'activation générée et assignée avec succès.");
    setTimeout(() => setToastMessage(''), 4000);
    setShowLicenseModal(false);
  };

  const toggleRevoke = (companyId) => {
    setCompanies(companies.map(c => c.id === companyId ? { ...c, isRevoked: !c.isRevoked } : c));
    setToastMessage("Statut de révocation mis à jour.");
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleImpersonateUser = (user) => {
    setImpersonatedUser(user);
    setShowImpersonateModal(false);
  };

  const tabs = [
    { id: 'entreprises', label: 'Entreprises Adhérentes' },
    { id: 'entities', label: 'Annuaire Global & Données' },
    { id: 'pricing', label: 'Forfaits & Quotas' },
    { id: 'billing', label: 'Facturation SaaS' },
    { id: 'support', label: `Support & Tickets (${supportTickets?.filter(t => t.status !== 'Résolu').length || 0})` },
    { id: 'audit', label: 'Journaux d\'audit & Flash Info' },
    { id: 'system', label: 'Système, Maintenance & Logs' }
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
          <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">MRR / ARR Estimé</h3>
          <p className="text-3xl font-bold text-white mt-1">{companies.reduce((acc, c) => acc + (c.monthlyFee || 0), 0)} €</p>
          <p className="text-xs text-blue-400 mt-1">ARR: {companies.reduce((acc, c) => acc + (c.monthlyFee || 0), 0) * 12} €</p>
        </div>
        <div className="bg-slate-800/90 p-5 rounded-xl border border-slate-700 shadow">
          <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Licences Actives / Rév.</h3>
          <div className="flex items-center space-x-2 mt-1">
             <p className="text-3xl font-bold text-emerald-400">{companies.filter(c => !c.isRevoked).length}</p>
             <span className="text-slate-500 text-xl">/</span>
             <p className="text-3xl font-bold text-rose-400">{companies.filter(c => c.isRevoked).length}</p>
          </div>
          <p className="text-xs text-slate-500 mt-1">Total: {companies.length} entreprises</p>
        </div>
        <div className="bg-slate-800/90 p-5 rounded-xl border border-slate-700 shadow">
          <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Volume & Storage</h3>
          <p className="text-xl font-bold text-white mt-1">{quotes.reduce((acc, q) => acc + q.amount, 0).toLocaleString()} € Devissés</p>
          <p className="text-xs text-amber-400 mt-1">Stockage Global: {Math.floor(Math.random() * 20) + 10}.8 Go / 100 Go</p>
        </div>
        <div className="bg-slate-800/90 p-5 rounded-xl border border-slate-700 shadow flex flex-col justify-center">
          <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Télémétrie & Adoption</h3>
          <div className="flex items-center justify-between mt-1 mb-2">
            <span className="text-xs text-slate-300">Live Users</span>
            <span className="flex items-center text-sm font-bold text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span> {Math.floor(Math.random() * 50) + 12}</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 mb-1">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
          </div>
          <p className="text-[10px] text-slate-500">65% Adoption Modules Premium</p>
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
                         <button onClick={() => toggleRevoke(company.id)} className={`transition-colors ${company.isRevoked ? 'text-emerald-400 hover:text-emerald-300' : 'text-rose-400 hover:text-rose-300'}`} title={company.isRevoked ? 'Restaurer accès' : 'Révoquer accès'}>
                            {company.isRevoked ? '🔓' : '🔒'}
                         </button>
                         <button onClick={() => { setSelectedCompany(company); setInspectorTab('profile'); setShowInspectorModal(true); }} className="text-slate-300 hover:text-white transition-colors" title="Inspecter l'entreprise">🔍</button>
                         <button onClick={() => { setSelectedCompany(company); setLicenseConfig({...licenseConfig, planType: company.planType}); setShowLicenseModal(true); }} className="text-amber-400 hover:text-amber-300 transition-colors" title="Gérer Licence">🔑</button>
                         <button onClick={() => { setSelectedCompany(company); setShowImpersonateModal(true); }} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Impersonate</button>
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
        {/* ENTITIES TAB */}
        {activeTab === 'entities' && (
          <div className="space-y-6">
            <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow overflow-hidden">
              <div className="p-5 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">Annuaire Global des Utilisateurs</h2>
                <span className="bg-blue-900/30 text-blue-400 border border-blue-800 px-3 py-1 rounded-full text-xs font-bold">{users.length} Utilisateurs</span>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-slate-300 text-sm">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase text-xs sticky top-0 z-10">
                    <tr>
                      <th className="px-5 py-3">Nom</th>
                      <th className="px-5 py-3">Email</th>
                      <th className="px-5 py-3">Rôle</th>
                      <th className="px-5 py-3">Entreprise</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {users.map(u => {
                      const c = companies.find(comp => comp.id === u.companyId);
                      return (
                        <tr key={u.id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="px-5 py-3 font-semibold text-white">{u.name}</td>
                          <td className="px-5 py-3 text-slate-400">{u.email}</td>
                          <td className="px-5 py-3">
                            <span className="bg-slate-700 px-2 py-0.5 rounded text-xs text-slate-200 border border-slate-600">{u.role}</span>
                          </td>
                          <td className="px-5 py-3 text-slate-400">{c ? c.name : 'N/A'}</td>
                          <td className="px-5 py-3 text-right">
                             <button onClick={() => { setToastMessage(`Mot de passe réinitialisé pour ${u.name}`); setTimeout(() => setToastMessage(''), 3000); }} className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-white transition-colors">Reset MDP</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow overflow-hidden">
              <div className="p-5 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">Chantiers Master Control</h2>
                <span className="bg-blue-900/30 text-blue-400 border border-blue-800 px-3 py-1 rounded-full text-xs font-bold">{sites.length} Chantiers</span>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-slate-300 text-sm">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase text-xs sticky top-0 z-10">
                    <tr>
                      <th className="px-5 py-3">Chantier</th>
                      <th className="px-5 py-3">Entreprise</th>
                      <th className="px-5 py-3">Budget (€)</th>
                      <th className="px-5 py-3">Statut</th>
                      <th className="px-5 py-3">Chef de Chantier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {sites.map(s => {
                      const c = companies.find(comp => comp.id === s.companyId);
                      return (
                        <tr key={s.id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="px-5 py-3 font-semibold text-white">{s.name}</td>
                          <td className="px-5 py-3 text-slate-400">{c ? c.name : 'N/A'}</td>
                          <td className="px-5 py-3">
                            <input type="number" className="bg-slate-900 border border-slate-700 rounded px-2 py-1 w-24 text-white text-xs outline-none" value={s.budget} onChange={(e) => {
                               setSites(sites.map(site => site.id === s.id ? {...site, budget: parseInt(e.target.value)} : site));
                            }} />
                          </td>
                          <td className="px-5 py-3">
                            <select className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none" value={s.status} onChange={(e) => {
                               setSites(sites.map(site => site.id === s.id ? {...site, status: e.target.value} : site));
                            }}>
                              <option value="En cours">En cours</option>
                              <option value="En retard">En retard</option>
                              <option value="Livré">Livré</option>
                            </select>
                          </td>
                          <td className="px-5 py-3">
                            <select className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none max-w-[120px]" value={s.managerName} onChange={(e) => {
                               setSites(sites.map(site => site.id === s.id ? {...site, managerName: e.target.value} : site));
                            }}>
                               {users.filter(u => u.role === 'site_manager' && u.companyId === s.companyId).map(sm => (
                                  <option key={sm.id} value={sm.name}>{sm.name}</option>
                               ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

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
          <div className="space-y-6">
            <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow p-6">
              <h2 className="text-lg font-bold text-white mb-4">Commercial & Facturation Manuelle</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg flex flex-col justify-center items-center text-center">
                    <span className="text-3xl mb-2">🎁</span>
                    <h3 className="text-white font-bold mb-1">Créateur de Code Promo</h3>
                    <p className="text-xs text-slate-400 mb-3">Générer un code de réduction pour un prospect ou client existant.</p>
                    <button onClick={() => { setToastMessage("Code Promo généré : SUMMER24 (-20%)"); setTimeout(() => setToastMessage(''), 3000); }} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded shadow text-sm font-bold w-full transition-colors">Créer un Code</button>
                 </div>
                 <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg flex flex-col justify-center items-center text-center">
                    <span className="text-3xl mb-2">🧾</span>
                    <h3 className="text-white font-bold mb-1">Facture SaaS Manuelle</h3>
                    <p className="text-xs text-slate-400 mb-3">Éditer une facture personnalisée (hors abonnement automatique).</p>
                    <button onClick={() => { setToastMessage("Brouillon de facture créé."); setTimeout(() => setToastMessage(''), 3000); }} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded shadow text-sm font-bold w-full transition-colors">+ Créer Facture Manuelle</button>
                 </div>
              </div>
            </div>

            <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow overflow-hidden">
               <div className="p-5 border-b border-slate-700 bg-slate-900/50">
                 <h2 className="text-lg font-bold text-white">Historique & Relances</h2>
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
                        <td className="px-5 py-4 text-right space-x-2">
                           {inv.status !== 'Payé' && (
                             <button onClick={() => { setToastMessage(`Relance envoyée par email à ${inv.companyName}.`); setTimeout(() => setToastMessage(''), 3000); }} className="text-amber-400 hover:text-amber-300 text-sm transition-colors border border-amber-900/50 bg-amber-900/20 px-2 py-1 rounded">Relancer</button>
                           )}
                           <button className="text-blue-400 hover:text-blue-300 text-sm transition-colors border border-blue-900/50 bg-blue-900/20 px-2 py-1 rounded">PDF</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
               </div>
            </div>
          </div>
        )}

        {/* AUDIT & BANNER TAB */}
        {/* SUPPORT TAB */}
        {activeTab === 'support' && (
          <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow overflow-hidden">
            <div className="p-5 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Gestion des Tickets de Support</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-slate-300 text-sm">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="px-5 py-3">ID / Date</th>
                    <th className="px-5 py-3">Entreprise / Auteur</th>
                    <th className="px-5 py-3">Sujet</th>
                    <th className="px-5 py-3">Priorité</th>
                    <th className="px-5 py-3">Statut</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {supportTickets.map(ticket => (
                    <tr key={ticket.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-mono text-xs text-slate-400">{ticket.id}</div>
                        <div className="text-xs text-slate-500 mt-1">{ticket.messages[0]?.date.split(' ')[0]}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-white">{ticket.companyName}</div>
                        <div className="text-xs text-slate-400 mt-1">{ticket.author} ({ticket.role})</div>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-200">{ticket.subject}</td>
                      <td className="px-5 py-4">
                         <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                           ticket.priority === 'Urgente' ? 'bg-rose-900/30 text-rose-400 border-rose-800' :
                           ticket.priority === 'Moyenne' ? 'bg-amber-900/30 text-amber-400 border-amber-800' :
                           'bg-slate-700 text-slate-300 border-slate-600'
                         }`}>
                           {ticket.priority}
                         </span>
                      </td>
                      <td className="px-5 py-4">
                         <span className={`px-2 py-1 rounded-full text-xs font-semibold border inline-block w-24 text-center ${
                           ticket.status === 'Résolu' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' :
                           ticket.status === 'En cours' ? 'bg-blue-900/30 text-blue-400 border-blue-800' :
                           'bg-rose-900/30 text-rose-400 border-rose-800'
                         }`}>
                           {ticket.status}
                         </span>
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        {ticket.status !== 'Résolu' && (
                          <button onClick={() => {
                             setSupportTickets(supportTickets.map(t => t.id === ticket.id ? {...t, status: 'Résolu'} : t));
                             setToastMessage(`Ticket ${ticket.id} marqué comme résolu.`); setTimeout(() => setToastMessage(''), 3000);
                          }} className="bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 px-3 py-1 rounded text-xs border border-emerald-800 transition-colors">Résoudre</button>
                        )}
                        <button onClick={() => { alert(`Affichage du fil de discussion du ticket ${ticket.id} (Simulation)`); }} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-xs transition-colors">Répondre</button>
                      </td>
                    </tr>
                  ))}
                  {supportTickets.length === 0 && (
                    <tr><td colSpan="6" className="px-5 py-8 text-center text-slate-500">Aucun ticket de support.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SYSTEM TAB */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow p-6">
              <h2 className="text-lg font-bold text-white mb-6 border-b border-slate-700 pb-2">Base de Données & Sauvegardes</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-slate-900 border border-slate-700 p-5 rounded-lg flex flex-col items-center text-center">
                    <span className="text-4xl mb-3">💾</span>
                    <h3 className="text-white font-bold mb-2">Export Global Base (JSON)</h3>
                    <p className="text-xs text-slate-400 mb-4 flex-1">Télécharger l'intégralité des données de la plateforme (Toutes entreprises confondues).</p>
                    <button onClick={() => { setToastMessage("Export global généré et téléchargé."); setTimeout(() => setToastMessage(''), 3000); }} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded w-full transition-colors text-sm shadow">Export Complet</button>
                 </div>

                 <div className="bg-slate-900 border border-slate-700 p-5 rounded-lg flex flex-col items-center text-center">
                    <span className="text-4xl mb-3">📸</span>
                    <h3 className="text-white font-bold mb-2">Snapshot de Sauvegarde</h3>
                    <p className="text-xs text-slate-400 mb-4 flex-1">Créer un snapshot chiffré instantané (S3 Cold Storage).</p>
                    {!isSnapshotting ? (
                       <button onClick={() => {
                          setIsSnapshotting(true); setSnapshotProgress(0);
                          const interval = setInterval(() => setSnapshotProgress(p => p + 10), 300);
                          setTimeout(() => { clearInterval(interval); setIsSnapshotting(false); setSnapshotProgress(100); setToastMessage(`Snapshot complet créé avec succès (${new Date().toISOString()})`); setTimeout(() => setToastMessage(''), 5000); }, 3000);
                       }} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded w-full transition-colors text-sm shadow">Démarrer Snapshot</button>
                    ) : (
                       <div className="w-full">
                          <div className="bg-slate-800 rounded-full h-2 mb-2 w-full overflow-hidden border border-slate-700">
                             <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${snapshotProgress}%` }}></div>
                          </div>
                          <p className="text-xs text-slate-400 animate-pulse">Chiffrement en cours... {snapshotProgress}%</p>
                       </div>
                    )}
                 </div>

                 <div className="bg-slate-900 border border-slate-700 p-5 rounded-lg flex flex-col items-center text-center">
                    <span className="text-4xl mb-3">🧹</span>
                    <h3 className="text-white font-bold mb-2">Purger les Logs</h3>
                    <p className="text-xs text-slate-400 mb-4 flex-1">Supprimer définitivement les journaux d'audit de plus de 30 jours pour libérer de l'espace.</p>
                    <button onClick={() => { setToastMessage("Purge des logs anciens terminée (-14.2 Mo)."); setTimeout(() => setToastMessage(''), 3000); }} className="bg-rose-900/30 hover:bg-rose-900/50 text-rose-400 border border-rose-800 font-bold py-2 px-4 rounded w-full transition-colors text-sm shadow">Purger &gt; 30 jours</button>
                 </div>
              </div>
            </div>

            <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow p-6">
              <h2 className="text-lg font-bold text-amber-500 mb-6 border-b border-slate-700 pb-2">Incident Injector (Chaos Engineering Mode)</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <button onClick={() => { setToastMessage("Alerte: Un chantier vient de dépasser son budget critique !"); setTimeout(() => setToastMessage(''), 5000); }} className="bg-slate-900 hover:bg-slate-800 border border-slate-700 p-4 rounded-lg text-left transition-colors flex items-start space-x-3 group">
                    <span className="text-2xl group-hover:scale-110 transition-transform">📉</span>
                    <div>
                      <h4 className="text-slate-200 font-bold text-sm">Simuler Dépassement Budget</h4>
                      <p className="text-xs text-slate-500 mt-1">Force un chantier en marge négative profonde.</p>
                    </div>
                 </button>
                 <button onClick={() => { setToastMessage("Alerte Fraude: 5 rejets de pointage GPS détectés !"); setTimeout(() => setToastMessage(''), 5000); }} className="bg-slate-900 hover:bg-slate-800 border border-slate-700 p-4 rounded-lg text-left transition-colors flex items-start space-x-3 group">
                    <span className="text-2xl group-hover:scale-110 transition-transform">📍</span>
                    <div>
                      <h4 className="text-slate-200 font-bold text-sm">Simuler Fraude GPS</h4>
                      <p className="text-xs text-slate-500 mt-1">Génère de faux pointages hors zone.</p>
                    </div>
                 </button>
                 <button onClick={() => { setToastMessage("CRITIQUE: Timeout API Stripe ! Les paiements sont bloqués."); setTimeout(() => setToastMessage(''), 5000); }} className="bg-slate-900 hover:bg-slate-800 border border-rose-900/50 p-4 rounded-lg text-left transition-colors flex items-start space-x-3 group">
                    <span className="text-2xl group-hover:scale-110 transition-transform">💳</span>
                    <div>
                      <h4 className="text-rose-400 font-bold text-sm">Panne Passerelle Stripe</h4>
                      <p className="text-xs text-slate-500 mt-1">Simule un incident système global.</p>
                    </div>
                 </button>
              </div>
            </div>
          </div>
        )}

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

      {/* Modal - Impersonate */}
      {showImpersonateModal && selectedCompany && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-4" onClick={() => setShowImpersonateModal(false)}>
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900">
              <h3 className="text-lg font-bold text-white">Impersonation Matrix : {selectedCompany.name}</h3>
              <button onClick={() => setShowImpersonateModal(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>
            <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
              {users.filter(u => u.companyId === selectedCompany.id).map(user => (
                <button
                  key={user.id}
                  onClick={() => handleImpersonateUser(user)}
                  className="w-full text-left bg-slate-900 border border-slate-700 p-4 rounded-lg hover:border-blue-500 hover:bg-slate-800 transition-colors flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold text-white">{user.name}</p>
                    <p className="text-sm text-slate-400">{user.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold border ${
                    user.role === 'company_admin' ? 'bg-amber-900/30 text-amber-400 border-amber-800' :
                    user.role === 'site_manager' ? 'bg-blue-900/30 text-blue-400 border-blue-800' :
                    user.role === 'worker' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' :
                    'bg-slate-700 text-slate-300 border-slate-600'
                  }`}>
                    {user.role}
                  </span>
                </button>
              ))}
              {users.filter(u => u.companyId === selectedCompany.id).length === 0 && (
                <p className="text-center text-slate-500 italic py-4">Aucun utilisateur trouvé pour cette entreprise.</p>
              )}
            </div>
          </div>
        </div>
      )}

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

      {/* Modal - Gérer Licence */}
      {showLicenseModal && selectedCompany && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-4" onClick={() => setShowLicenseModal(false)}>
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900">
              <h3 className="text-lg font-bold text-white">Licence : {selectedCompany.name}</h3>
              <button onClick={() => setShowLicenseModal(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>
            <form onSubmit={handleGenerateLicense} className="p-5 space-y-4">
              <div>
                 <p className="text-sm text-slate-400 mb-1">Clé actuelle</p>
                 <p className="text-white font-mono bg-slate-900 p-2 rounded border border-slate-700">{selectedCompany.licenseKey || 'Aucune'}</p>
              </div>
              <div>
                 <p className="text-sm text-slate-400 mb-1">Expiration actuelle</p>
                 <p className={`text-sm font-semibold ${selectedCompany.licenseExpiresAt && new Date(selectedCompany.licenseExpiresAt) < new Date() ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {selectedCompany.licenseExpiresAt ? new Date(selectedCompany.licenseExpiresAt).toLocaleString() : 'N/A'}
                 </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1 mt-4">Nouveau Forfait</label>
                <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-blue-500" value={licenseConfig.planType} onChange={e => setLicenseConfig({...licenseConfig, planType: e.target.value})}>
                  <option value="Starter">Starter</option>
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Durée de renouvellement</label>
                <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-blue-500" value={licenseConfig.duration} onChange={e => setLicenseConfig({...licenseConfig, duration: e.target.value})}>
                  <option value="1">1 Mois</option>
                  <option value="3">3 Mois</option>
                  <option value="6">6 Mois</option>
                  <option value="12">1 An</option>
                  <option value="24">2 Ans</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowLicenseModal(false)} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700">Annuler</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 shadow">Générer Clé d'Activation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Feature Flags */}
      {showInspectorModal && selectedCompany && (() => {
        const tenantSites = sites.filter(s => s.companyId === selectedCompany.id);
        const tenantUsers = users.filter(u => u.companyId === selectedCompany.id);
        return (
          <div className="fixed inset-0 bg-slate-950/90 flex justify-center z-[60] p-4 overflow-y-auto" onClick={() => setShowInspectorModal(false)}>
            <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-5xl my-auto flex flex-col" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh' }}>
              <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900 sticky top-0 z-10 rounded-t-xl">
                <div>
                   <h2 className="text-xl font-bold text-white flex items-center">
                     <span className="mr-2">🔍</span> God-Mode Inspector : {selectedCompany.name}
                   </h2>
                   <p className="text-xs text-slate-400 mt-1">ID Tenant: <span className="font-mono">{selectedCompany.id}</span> | Plan: <span className="text-blue-400">{selectedCompany.planType}</span></p>
                </div>
                <button onClick={() => setShowInspectorModal(false)} className="text-slate-400 hover:text-white text-2xl">✕</button>
              </div>

              <div className="flex border-b border-slate-700 bg-slate-900/80 px-4 overflow-x-auto sticky top-[81px] z-10">
                {[
                  { id: 'profile', label: 'Profil & Info' },
                  { id: 'sites', label: `Chantiers (${tenantSites.length})` },
                  { id: 'users', label: `Utilisateurs (${tenantUsers.length})` },
                  { id: 'quotas', label: 'Quotas & Modules' },
                  { id: 'danger', label: 'Danger Zone' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setInspectorTab(tab.id)}
                    className={`px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${inspectorTab === tab.id ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {inspectorTab === 'profile' && (
                  <div className="space-y-4 max-w-2xl">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nom du Tenant</label>
                        <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white outline-none focus:border-blue-500" value={selectedCompany.name} onChange={(e) => setCompanies(companies.map(c => c.id === selectedCompany.id ? {...c, name: e.target.value} : c))} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">SIREN</label>
                        <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white outline-none focus:border-blue-500" value={selectedCompany.siren || ''} onChange={(e) => setCompanies(companies.map(c => c.id === selectedCompany.id ? {...c, siren: e.target.value} : c))} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email Contact</label>
                        <input type="email" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white outline-none focus:border-blue-500" value={selectedCompany.contactEmail || ''} onChange={(e) => setCompanies(companies.map(c => c.id === selectedCompany.id ? {...c, contactEmail: e.target.value} : c))} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Date Renouvellement</label>
                        <input type="date" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white outline-none focus:border-blue-500" value={selectedCompany.renewalDate || ''} onChange={(e) => setCompanies(companies.map(c => c.id === selectedCompany.id ? {...c, renewalDate: e.target.value} : c))} />
                      </div>
                    </div>
                    <button onClick={() => { setToastMessage("Profil mis à jour."); setTimeout(() => setToastMessage(''), 3000); }} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold shadow text-sm">Enregistrer les modifications</button>
                  </div>
                )}

                {inspectorTab === 'sites' && (
                  <div className="space-y-3">
                    {tenantSites.map(s => (
                      <div key={s.id} className="bg-slate-900 border border-slate-700 p-4 rounded-lg flex items-center justify-between">
                        <div>
                           <h4 className="font-bold text-white">{s.name}</h4>
                           <p className="text-xs text-slate-400">Budget: {s.budget}€ | Consommé: {s.consumedBudget || 0}€</p>
                        </div>
                        <div className="flex space-x-3 items-center">
                          <select className="bg-slate-800 border border-slate-600 rounded p-1 text-sm text-slate-200 outline-none" value={s.status} onChange={(e) => {
                            setSites(sites.map(site => site.id === s.id ? {...site, status: e.target.value} : site));
                            setToastMessage(`Statut chantier ${s.id} mis à jour.`); setTimeout(() => setToastMessage(''), 3000);
                          }}>
                            <option value="En cours">En cours</option>
                            <option value="En retard">En retard</option>
                            <option value="Livré">Livré</option>
                          </select>
                        </div>
                      </div>
                    ))}
                    {tenantSites.length === 0 && <p className="text-slate-500 italic">Aucun chantier pour ce tenant.</p>}
                  </div>
                )}

                {inspectorTab === 'users' && (
                  <div className="space-y-3">
                    {tenantUsers.map(u => (
                      <div key={u.id} className="bg-slate-900 border border-slate-700 p-3 rounded-lg flex items-center justify-between">
                        <div>
                           <h4 className="font-bold text-white text-sm">{u.name}</h4>
                           <p className="text-xs text-slate-400">{u.role} | {u.email}</p>
                        </div>
                        <button onClick={() => { setToastMessage(`Identifiants renvoyés à ${u.name}`); setTimeout(() => setToastMessage(''), 3000); }} className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-xs text-slate-200 font-bold transition-colors">Renvoyer identifiants (SMS/Email)</button>
                      </div>
                    ))}
                  </div>
                )}

                {inspectorTab === 'quotas' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-slate-300 font-bold mb-4 border-b border-slate-700 pb-2">Quotas personnalisés</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Max Utilisateurs</label>
                          <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" value={selectedCompany.customMaxUsers || 10} onChange={(e) => setCompanies(companies.map(c => c.id === selectedCompany.id ? {...c, customMaxUsers: parseInt(e.target.value)} : c))} />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Max Chantiers</label>
                          <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" value={selectedCompany.customMaxSites || 5} onChange={(e) => setCompanies(companies.map(c => c.id === selectedCompany.id ? {...c, customMaxSites: parseInt(e.target.value)} : c))} />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Stockage GED alloué (Go)</label>
                          <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" value={selectedCompany.customStorageLimit || 50} onChange={(e) => setCompanies(companies.map(c => c.id === selectedCompany.id ? {...c, customStorageLimit: parseInt(e.target.value)} : c))} />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-slate-300 font-bold mb-4 border-b border-slate-700 pb-2">Feature Flags à la carte</h4>
                      <div className="space-y-2">
                        {['Gros Engins', 'Signature Électronique', 'Générateur DOE', 'Export Paie Sage'].map(feature => {
                           const key = feature.toLowerCase().replace(/\s+/g, '');
                           const isEnabled = selectedCompany.features?.[key] || false;
                           return (
                             <label key={key} className="flex items-center justify-between bg-slate-900 p-2.5 rounded border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors">
                                <span className="text-slate-300 text-sm">{feature}</span>
                                <input type="checkbox" checked={isEnabled} onChange={(e) => {
                                  const newFeatures = { ...(selectedCompany.features || {}), [key]: e.target.checked };
                                  setCompanies(companies.map(c => c.id === selectedCompany.id ? {...c, features: newFeatures} : c));
                                }} className="rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500 h-4 w-4" />
                             </label>
                           );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {inspectorTab === 'danger' && (
                  <div className="space-y-4">
                     <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
                        <h4 className="text-white font-bold mb-1">Exporter données du tenant</h4>
                        <p className="text-sm text-slate-400 mb-3">Télécharge un dump complet en JSON de toutes les données du tenant.</p>
                        <button onClick={() => { setToastMessage("Export JSON généré."); setTimeout(() => setToastMessage(''), 3000); }} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded shadow text-sm font-bold">Exporter (JSON)</button>
                     </div>
                     <div className="bg-amber-900/20 border border-amber-900/50 p-4 rounded-xl">
                        <h4 className="text-amber-500 font-bold mb-1">Verrouiller le compte</h4>
                        <p className="text-sm text-amber-400/70 mb-3">Place ce tenant en maintenance globale. Les utilisateurs ne pourront plus se connecter.</p>
                        <button onClick={() => {
                          setCompanies(companies.map(c => c.id === selectedCompany.id ? {...c, maintenanceMode: !c.maintenanceMode} : c));
                          setToastMessage(selectedCompany.maintenanceMode ? "Tenant déverrouillé." : "Tenant verrouillé.");
                          setTimeout(() => setToastMessage(''), 3000);
                        }} className="bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 rounded shadow text-sm font-bold">
                          {selectedCompany.maintenanceMode ? 'Déverrouiller le compte' : 'Verrouiller (Maintenance)'}
                        </button>
                     </div>
                     <div className="bg-rose-900/20 border border-rose-900/50 p-4 rounded-xl">
                        <h4 className="text-rose-500 font-bold mb-1">Supprimer l'entreprise</h4>
                        <p className="text-sm text-rose-400/70 mb-3">Supprime DÉFINITIVEMENT ce tenant et toutes ses données (Chantiers, Utilisateurs, GED...). Action irréversible.</p>
                        <button onClick={() => { alert('Action désactivée en mode Démo'); }} className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded shadow text-sm font-bold">Supprimer définitivement</button>
                     </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
