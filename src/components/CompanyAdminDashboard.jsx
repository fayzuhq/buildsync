import React, { useState } from 'react';

export default function CompanyAdminDashboard({
  currentCompanyId, companies, sites, setSites, workers, setWorkers,
  equipment, setEquipment, quotes, setQuotes, auditLogs,
  subcontractors, setSubcontractors, gedFolders, setGedFolders, snags, expenses
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [showSiteModal, setShowSiteModal] = useState(false);
  const [showNewSiteModal, setShowNewSiteModal] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);

  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showPunchListModal, setShowPunchListModal] = useState(false);
  const [showSubcontractorModal, setShowSubcontractorModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const [newWorker, setNewWorker] = useState({ name: '', role: 'Compagnon', email: '', phone: '', caces: '' });
  const [newSite, setNewSite] = useState({ name: '', address: '', managerName: '', budget: '' });
  const [newSubcontractor, setNewSubcontractor] = useState({ name: '', specialty: '', contact: '', insuranceExpiry: '' });
  const [newQuote, setNewQuote] = useState({ client: '', siteId: '', amount: '' });

  const [toastMessage, setToastMessage] = useState('');

  // Filtering data for active tenant
  const company = companies.find(c => c.id === currentCompanyId);
  const companySites = sites.filter(s => s.companyId === currentCompanyId);
  const companyWorkers = workers.filter(w => w.companyId === currentCompanyId);
  const companyLogs = auditLogs.filter(log => log.companyId === currentCompanyId);
  const companyQuotes = quotes.filter(q => q.companyId === currentCompanyId);
  const companySubcontractors = subcontractors.filter(s => s.companyId === currentCompanyId);

  const companyHeavyEq = equipment.heavyMachinery.filter(e => e.companyId === currentCompanyId);
  const companyLightEq = equipment.lightTools.filter(e => e.companyId === currentCompanyId);

  if (!company) {
    return <div className="text-white p-4">Veuillez sélectionner une entreprise.</div>;
  }

  const showToast = (msg) => {
     setToastMessage(msg);
     setTimeout(() => setToastMessage(''), 5000);
  };

  const handleAddWorker = (e) => {
    e.preventDefault();
    setWorkers([...workers, {
      id: `w_new_${Date.now()}`,
      companyId: currentCompanyId,
      ...newWorker,
      siteAssigned: null,
      medicalExpiry: '2025-12-31',
      hoursLoggedThisWeek: 0
    }]);
    showToast(`Identifiants envoyés par SMS au ${newWorker.phone}`);
    setShowAddWorker(false);
    setNewWorker({ name: '', role: 'Compagnon', email: '', phone: '', caces: '' });
  };

  const handleAddSite = (e) => {
    e.preventDefault();
    const siteId = `s_new_${Date.now()}`;
    setSites([...sites, {
      id: siteId,
      companyId: currentCompanyId,
      name: newSite.name,
      address: newSite.address,
      managerName: newSite.managerName,
      status: 'En cours',
      budget: parseInt(newSite.budget) || 0,
      budgetConsumed: 0,
      progress: 0,
      workersCount: 0
    }]);

    // Auto-generate default GED folders
    setGedFolders([...gedFolders,
      { id: `f1_${Date.now()}`, companyId: currentCompanyId, siteId: siteId, name: "Plans Architecte", files: [] },
      { id: `f2_${Date.now()}`, companyId: currentCompanyId, siteId: siteId, name: "PPSPS / Sécurité", files: [] },
      { id: `f3_${Date.now()}`, companyId: currentCompanyId, siteId: siteId, name: "Devis Signés", files: [] }
    ]);

    setShowNewSiteModal(false);
    setNewSite({ name: '', address: '', managerName: '', budget: '' });
    showToast("Nouveau chantier créé avec succès, avec ses dossiers GED.");
  };

  const handleAddSubcontractor = (e) => {
    e.preventDefault();
    setSubcontractors([...subcontractors, {
       id: `sub_new_${Date.now()}`,
       companyId: currentCompanyId,
       ...newSubcontractor
    }]);
    setShowSubcontractorModal(false);
    setNewSubcontractor({ name: '', specialty: '', contact: '', insuranceExpiry: '' });
    showToast("Sous-traitant ajouté avec succès.");
  };

  const handleAddQuote = (e) => {
    e.preventDefault();
    setQuotes([...quotes, {
       id: `q_new_${Date.now().toString().slice(-4)}`,
       companyId: currentCompanyId,
       siteId: newQuote.siteId,
       client: newQuote.client,
       amount: parseInt(newQuote.amount) || 0,
       progressBilling: 0,
       paymentStatus: 'En attente'
    }]);
    setShowQuoteModal(false);
    setNewQuote({ client: '', siteId: '', amount: '' });
    showToast("Nouvelle situation / devis créé avec succès.");
  };

  const updateWorkerAssignment = (workerId, newSiteId) => {
     setWorkers(workers.map(w => w.id === workerId ? { ...w, siteAssigned: newSiteId === 'atelier' ? null : newSiteId } : w));
  };

  const updateEquipmentAssignment = (eqId, newSiteId) => {
     const updatedHeavy = equipment.heavyMachinery.map(eq => eq.id === eqId ? { ...eq, assignedSiteId: newSiteId === 'depot' ? null : newSiteId } : eq);
     setEquipment({ ...equipment, heavyMachinery: updatedHeavy });
  };

  const openSiteModal = (site) => {
    setSelectedSite(site);
    setShowSiteModal(true);
  };

  const tabs = [
    { id: 'overview', label: "Vue d'ensemble & Chantiers" },
    { id: 'planning', label: "Planning & Équipes" },
    { id: 'billing', label: "Devis & Facturation" },
    { id: 'subcontractors', label: "Sous-traitance & Achats" },
    { id: 'equipment', label: "Parc Matériel & Engins" },
    { id: 'staff', label: "Collaborateurs" },
    { id: 'payroll', label: "Export Paie & Audit Logs" }
  ];

  const totalBudget = companySites.reduce((sum, s) => sum + s.budget, 0);
  const totalConsumed = companySites.reduce((sum, s) => sum + s.budgetConsumed, 0);
  const budgetRatio = totalBudget > 0 ? Math.round((totalConsumed/totalBudget)*100) : 0;

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Collaborateur,Heures Modifiées par Chef,Heures Sup (25%),Paniers Repas Validés\n";
    companyWorkers.forEach(w => {
      const heuresNormales = Math.min(w.hoursLoggedThisWeek, 35);
      const heuresSup = Math.max(0, w.hoursLoggedThisWeek - 35);
      const paniers = Math.ceil(w.hoursLoggedThisWeek / 7);
      csvContent += `"${w.name}",${w.hoursLoggedThisWeek},${heuresSup},${paniers}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `export_paie_${currentCompanyId}_semaine.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Fichier CSV généré et téléchargé.");
  };

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
          <p className="text-3xl font-bold text-blue-400 mt-1">{budgetRatio}% Consommé</p>
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
              <button onClick={() => setShowNewSiteModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-3 rounded-lg shadow text-sm transition-colors">
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
                      site.status === 'En cours' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' :
                      site.status === 'En retard' ? 'bg-amber-900/30 text-amber-400 border-amber-800' :
                      'bg-blue-900/30 text-blue-400 border-blue-800'
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
          <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow p-6 min-h-[400px]">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white">Planning & Affectations Interactives</h2>
             </div>
             <div className="overflow-x-auto">
               <div className="min-w-[800px]">
                 <div className="grid grid-cols-6 gap-2 text-center text-sm font-semibold text-slate-400 mb-2 border-b border-slate-700 pb-2">
                    <div className="text-left">Collaborateurs</div>
                    <div className="col-span-4 text-left pl-2">Chantier Assigné (Saisissez pour réaffecter)</div>
                    <div>Statut Hebdo</div>
                 </div>
                 <div className="space-y-2">
                    {companyWorkers.map(w => (
                       <div key={w.id} className="grid grid-cols-6 gap-2 items-center text-sm p-2 hover:bg-slate-800/50 rounded transition-colors">
                          <div className="text-white font-medium truncate">{w.name} <span className="block text-xs text-slate-500">{w.role}</span></div>
                          <div className="col-span-4">
                             <select
                               value={w.siteAssigned || 'atelier'}
                               onChange={(e) => updateWorkerAssignment(w.id, e.target.value)}
                               className="w-full bg-slate-900 border border-slate-700 text-slate-300 rounded p-1.5 focus:border-blue-500 focus:ring-1 outline-none"
                             >
                                <option value="atelier">Atelier / Dépôt</option>
                                {companySites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                             </select>
                          </div>
                          <div className="bg-emerald-900/40 border border-emerald-800 text-emerald-300 rounded p-1.5 text-xs text-center">En poste</div>
                       </div>
                    ))}
                    <div className="my-4 border-b border-slate-700"></div>
                    <div className="grid grid-cols-6 gap-2 text-center text-sm font-semibold text-slate-400 mb-2 border-b border-slate-700 pb-2">
                       <div className="text-left">Gros Engins</div>
                       <div className="col-span-4 text-left pl-2">Lieu d'affectation</div>
                       <div>Statut Machine</div>
                    </div>
                    {companyHeavyEq.map(eq => (
                       <div key={eq.id} className="grid grid-cols-6 gap-2 items-center text-sm p-2 hover:bg-slate-800/50 rounded transition-colors">
                          <div className="text-white font-medium truncate">{eq.name}</div>
                          <div className="col-span-4">
                             <select
                               value={eq.assignedSiteId || 'depot'}
                               onChange={(e) => updateEquipmentAssignment(eq.id, e.target.value)}
                               className="w-full bg-slate-900 border border-slate-700 text-slate-300 rounded p-1.5 focus:border-blue-500 focus:ring-1 outline-none"
                             >
                                <option value="depot">Dépôt Central</option>
                                {companySites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                             </select>
                          </div>
                          <div className="bg-blue-900/40 border border-blue-800 text-blue-300 rounded p-1.5 text-xs text-center">{eq.status}</div>
                       </div>
                    ))}
                 </div>
               </div>
             </div>
          </div>
        )}

        {/* TAB 3: BILLING / QUOTES */}
        {activeTab === 'billing' && (
          <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow overflow-hidden">
            <div className="p-5 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Suivi des Devis & Facturation BTP</h2>
              <button onClick={() => setShowQuoteModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-3 rounded-lg shadow text-sm">+ Nouvelle Situation</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-slate-300 text-sm">
                <thead className="bg-slate-900/80 text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Réf Devis</th>
                    <th className="px-5 py-3">Client (Chantier)</th>
                    <th className="px-5 py-3 text-right">Montant HT</th>
                    <th className="px-5 py-3 text-right">Acompte (30%)</th>
                    <th className="px-5 py-3 text-center">Avancement</th>
                    <th className="px-5 py-3 text-right">Retenue Garantie (5%)</th>
                    <th className="px-5 py-3 text-center">Paiement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {companyQuotes.map(quote => {
                     const acompte = quote.amount * 0.3;
                     const retenue = quote.amount * 0.05;
                     return (
                    <tr key={quote.id} className="hover:bg-slate-700/30">
                      <td className="px-5 py-4 font-mono text-slate-500">{quote.id}</td>
                      <td className="px-5 py-4 font-medium text-slate-200">
                         {quote.client} <br/>
                         <span className="text-xs text-slate-500">{companySites.find(s=>s.id === quote.siteId)?.name}</span>
                      </td>
                      <td className="px-5 py-4 font-mono text-right">{quote.amount.toLocaleString()} €</td>
                      <td className="px-5 py-4 text-slate-400 text-right">{acompte.toLocaleString()} €</td>
                      <td className="px-5 py-4">
                         <div className="flex items-center space-x-2 justify-center">
                           <div className="flex-1 bg-slate-900 rounded-full h-2 w-16">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${quote.progressBilling}%` }}></div>
                           </div>
                           <span className="text-xs font-bold text-blue-400">{quote.progressBilling}%</span>
                         </div>
                      </td>
                      <td className="px-5 py-4 text-amber-400/80 text-right">-{retenue.toLocaleString()} €</td>
                      <td className="px-5 py-4 text-center">
                         <span className={`px-2 py-1 rounded text-xs font-semibold border ${quote.paymentStatus === 'Payé' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' : quote.paymentStatus === 'Facturé' ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'bg-red-900/30 text-red-400 border-red-800'}`}>
                           {quote.paymentStatus}
                         </span>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SUBCONTRACTORS */}
        {activeTab === 'subcontractors' && (
          <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow overflow-hidden">
            <div className="p-5 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Sous-traitance & Achats</h2>
              <button onClick={() => setShowSubcontractorModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-3 rounded-lg shadow text-sm">+ Ajouter un sous-traitant</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-slate-300 text-sm">
                <thead className="bg-slate-900/80 text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Sous-traitant</th>
                    <th className="px-5 py-3">Spécialité</th>
                    <th className="px-5 py-3">Contact</th>
                    <th className="px-5 py-3">Assurance Décennale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {companySubcontractors.map(sub => {
                     const isExpired = new Date(sub.insuranceExpiry) < new Date();
                     return (
                    <tr key={sub.id} className="hover:bg-slate-700/30">
                      <td className="px-5 py-4 font-medium text-white">{sub.name}</td>
                      <td className="px-5 py-4 text-slate-400">{sub.specialty}</td>
                      <td className="px-5 py-4 text-slate-400">{sub.contact}</td>
                      <td className="px-5 py-4">
                         <div className="flex items-center space-x-2">
                            <span>{sub.insuranceExpiry}</span>
                            {isExpired ? (
                               <span className="bg-red-900/30 text-red-400 border border-red-800 text-xs px-2 py-0.5 rounded font-bold">Expirée</span>
                            ) : (
                               <span className="text-emerald-400 text-xs">✓ Valide</span>
                            )}
                         </div>
                      </td>
                    </tr>
                  )})}
                  {companySubcontractors.length === 0 && (
                     <tr><td colSpan="4" className="text-center p-4 text-slate-500">Aucun sous-traitant.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: EQUIPMENT */}
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

        {/* TAB 6: STAFF */}
        {activeTab === 'staff' && (
          <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow overflow-hidden">
            <div className="p-5 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Annuaire des Collaborateurs</h2>
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

        {/* TAB 7: PAYROLL & LOGS */}
        {activeTab === 'payroll' && (
          <div className="space-y-6">
            <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow overflow-hidden">
              <div className="p-5 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">Export Paie (Temps de travail global)</h2>
                <button onClick={handleExportCSV} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-3 rounded-lg shadow text-sm transition-colors flex items-center">
                   <span>Exporter CSV / Sage</span>
                </button>
              </div>
              <div className="overflow-x-auto p-5">
                <table className="w-full text-left text-slate-300 text-sm border border-slate-700 rounded">
                  <thead className="bg-slate-900/50 text-slate-400">
                    <tr>
                      <th className="p-3 border-b border-slate-700">Collaborateur</th>
                      <th className="p-3 border-b border-slate-700">Heures Modifiées par Chef</th>
                      <th className="p-3 border-b border-slate-700">Heures Sup (25%)</th>
                      <th className="p-3 border-b border-slate-700">Paniers Repas Validés</th>
                    </tr>
                  </thead>
                  <tbody>
                     {companyWorkers.map(w => {
                       const heuresNormales = Math.min(w.hoursLoggedThisWeek, 35);
                       const heuresSup = Math.max(0, w.hoursLoggedThisWeek - 35);
                       const paniers = Math.ceil(w.hoursLoggedThisWeek / 7);
                       return (
                       <tr key={w.id} className="border-b border-slate-700 last:border-0 hover:bg-slate-800/50 transition-colors">
                         <td className="p-3 font-medium text-white">{w.name}</td>
                         <td className="p-3 font-mono">{w.hoursLoggedThisWeek} h (base: {heuresNormales}h)</td>
                         <td className="p-3 text-amber-400 font-mono">{heuresSup} h</td>
                         <td className="p-3 font-mono text-emerald-400">{paniers} jours</td>
                       </tr>
                     )})}
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
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-5xl my-auto">
            <div className="p-6 border-b border-slate-700 flex justify-between items-start bg-slate-900 sticky top-0 z-10">
              <div>
                 <h2 className="text-2xl font-bold text-white">Fiche Chantier 360° : {selectedSite.name}</h2>
                 <p className="text-slate-400 flex items-center mt-1">📍 {selectedSite.address}</p>
              </div>
              <button onClick={() => setShowSiteModal(false)} className="text-slate-400 hover:text-white text-2xl font-bold">✕</button>
            </div>
            <div className="p-6 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 shadow-inner">
                     <p className="text-sm text-slate-400 uppercase tracking-wider mb-1">Chef de chantier</p>
                     <p className="text-lg font-bold text-white">{selectedSite.managerName}</p>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 shadow-inner">
                     <p className="text-sm text-slate-400 uppercase tracking-wider mb-1">Rentabilité Financière</p>
                     <p className="text-lg font-bold text-white mb-2">
                        {(() => {
                           const siteWorkersLocal = workers.filter(w => w.siteAssigned === selectedSite.id);
                           const totalLaborHours = siteWorkersLocal.reduce((sum, w) => sum + w.hoursLoggedThisWeek, 0);
                           const laborCost = totalLaborHours * 35; // Mock 35€/h
                           const siteExpenses = expenses.filter(e => e.siteId === selectedSite.id).reduce((sum, e) => sum + e.amount, 0);
                           const margeBrute = selectedSite.budget - laborCost - siteExpenses;

                           return (
                              <span className={margeBrute >= 0 ? "text-emerald-400" : "text-rose-400"}>
                                 {margeBrute.toLocaleString()} € (Marge brute)
                              </span>
                           );
                        })()}
                     </p>
                     <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                       <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${selectedSite.budget > 0 ? (selectedSite.budgetConsumed/selectedSite.budget)*100 : 0}%` }}></div>
                     </div>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 shadow-inner flex flex-col justify-center items-start">
                     <p className="text-sm text-slate-400 uppercase tracking-wider mb-1">Statut global</p>
                     <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                      selectedSite.status === 'En cours' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' :
                      selectedSite.status === 'En retard' ? 'bg-amber-900/30 text-amber-400 border-amber-800' :
                      'bg-blue-900/30 text-blue-400 border-blue-800'
                    }`}>
                      {selectedSite.status}
                    </span>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* GED Folder UI */}
                 <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-200 border-b border-slate-700 pb-2 flex items-center"><span className="mr-2">📂</span> GED & Documents</h3>
                    <div className="space-y-3">
                       {gedFolders.filter(f => f.siteId === selectedSite.id).map(folder => (
                          <div key={folder.id} className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
                             <div className="bg-slate-800/80 p-3 text-sm font-bold text-slate-300 border-b border-slate-700 flex items-center">
                                <span className="mr-2">📁</span> {folder.name}
                             </div>
                             <ul className="p-2 space-y-1">
                                {folder.files.map((file, idx) => (
                                   <li key={idx} className="flex justify-between items-center text-sm p-2 hover:bg-slate-800 rounded transition-colors">
                                      <span className="text-slate-400 flex items-center"><span className="mr-2">📄</span> {file}</span>
                                      <button onClick={() => setShowPdfModal(true)} className="text-blue-400 hover:text-blue-300">Ouvrir</button>
                                   </li>
                                ))}
                                {folder.files.length === 0 && (
                                   <li className="text-sm p-2 text-slate-500 italic">Dossier vide.</li>
                                )}
                             </ul>
                          </div>
                       ))}
                       {gedFolders.filter(f => f.siteId === selectedSite.id).length === 0 && (
                          <p className="text-slate-500 text-sm">Aucun dossier GED pour ce chantier.</p>
                       )}
                    </div>
                 </div>

                 <div className="space-y-4 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-200 border-b border-slate-700 pb-2">Réserves & Qualité (Punch List)</h3>
                    <div className="bg-slate-900 p-6 rounded-xl text-center border border-slate-700 flex-grow flex flex-col justify-center items-center">
                       <span className="text-4xl mb-3">📋</span>
                       <p className="text-slate-300 font-medium mb-1">
                          {snags.filter(sn => sn.siteId === selectedSite.id && sn.status !== 'Terminé').length} réserves ouvertes
                       </p>
                       <p className="text-slate-500 text-sm mb-4">Gérez les défauts et la levée des réserves avant la livraison finale client.</p>
                       <button onClick={() => setShowPunchListModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-lg transition-colors shadow">Consulter la Punch List</button>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-[60] p-4">
           <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg shadow-xl max-w-3xl w-full">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-white font-bold">Visionneuse PDF / Plans</h3>
                 <button onClick={() => setShowPdfModal(false)} className="text-slate-400 hover:text-white text-2xl font-bold">✕</button>
              </div>
              <div className="bg-slate-900 h-[600px] flex flex-col items-center justify-center border border-slate-700 rounded text-slate-500 shadow-inner">
                 <span className="text-6xl mb-4">📐</span>
                 <p className="text-lg font-medium text-slate-400">Le plan d'architecte s'affiche ici.</p>
                 <p className="text-sm">Prend en charge le zoom, les annotations, et la mesure de cotes.</p>
              </div>
           </div>
        </div>
      )}

      {/* Punch List Modal */}
      {showPunchListModal && selectedSite && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-[60] p-4">
           <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[80vh]">
              <div className="flex justify-between items-center p-5 bg-slate-900 border-b border-slate-700">
                 <h3 className="text-white font-bold text-lg">Punch List : {selectedSite.name}</h3>
                 <button onClick={() => setShowPunchListModal(false)} className="text-slate-400 hover:text-white text-2xl font-bold">✕</button>
              </div>
              <div className="p-5 overflow-y-auto space-y-4">
                 {snags.filter(sn => sn.siteId === selectedSite.id).map(sn => (
                    <div key={sn.id} className="bg-slate-900 border border-slate-700 rounded-lg p-4 flex flex-col">
                       <div className="flex justify-between items-start mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold border ${sn.status === 'Ouvert' ? 'bg-red-900/30 text-red-400 border-red-800' : sn.status === 'En cours' ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'bg-emerald-900/30 text-emerald-400 border-emerald-800'}`}>
                             {sn.status}
                          </span>
                          <span className="text-xs text-slate-500">Échéance: {sn.deadline}</span>
                       </div>
                       <p className="text-white font-medium mb-1">{sn.description}</p>
                       <p className="text-sm text-slate-400">Sous-traitant : <span className="text-slate-300 font-semibold">{sn.subcontractor}</span></p>
                    </div>
                 ))}
                 {snags.filter(sn => sn.siteId === selectedSite.id).length === 0 && (
                    <p className="text-slate-500 text-center py-8">Aucune réserve signalée sur ce chantier.</p>
                 )}
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

      {/* Modal - New Site */}
      {showNewSiteModal && (
        <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900">
              <h3 className="text-lg font-bold text-white">Nouveau Chantier</h3>
              <button onClick={() => setShowNewSiteModal(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>
            <form onSubmit={handleAddSite} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nom du chantier</label>
                <input required type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 outline-none" value={newSite.name} onChange={e => setNewSite({...newSite, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Adresse</label>
                <input required type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 outline-none" value={newSite.address} onChange={e => setNewSite({...newSite, address: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Chef de chantier</label>
                <input required type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 outline-none" value={newSite.managerName} onChange={e => setNewSite({...newSite, managerName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Budget (€)</label>
                <input required type="number" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 outline-none" value={newSite.budget} onChange={e => setNewSite({...newSite, budget: e.target.value})} />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowNewSiteModal(false)} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">Annuler</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 shadow">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - New Subcontractor */}
      {showSubcontractorModal && (
        <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900">
              <h3 className="text-lg font-bold text-white">Ajouter un sous-traitant</h3>
              <button onClick={() => setShowSubcontractorModal(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>
            <form onSubmit={handleAddSubcontractor} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nom de l'entreprise</label>
                <input required type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 outline-none" value={newSubcontractor.name} onChange={e => setNewSubcontractor({...newSubcontractor, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Spécialité</label>
                <input required type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 outline-none" placeholder="Ex: Plomberie, Peinture..." value={newSubcontractor.specialty} onChange={e => setNewSubcontractor({...newSubcontractor, specialty: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Contact (Email/Tel)</label>
                <input required type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 outline-none" value={newSubcontractor.contact} onChange={e => setNewSubcontractor({...newSubcontractor, contact: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Expiration Assurance Décennale</label>
                <input required type="date" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 outline-none" value={newSubcontractor.insuranceExpiry} onChange={e => setNewSubcontractor({...newSubcontractor, insuranceExpiry: e.target.value})} />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowSubcontractorModal(false)} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">Annuler</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 shadow">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - New Quote / Billing */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900">
              <h3 className="text-lg font-bold text-white">Nouvelle Situation / Devis</h3>
              <button onClick={() => setShowQuoteModal(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>
            <form onSubmit={handleAddQuote} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Client</label>
                <input required type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 outline-none" value={newQuote.client} onChange={e => setNewQuote({...newQuote, client: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Chantier Associé</label>
                <select required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 outline-none" value={newQuote.siteId} onChange={e => setNewQuote({...newQuote, siteId: e.target.value})}>
                  <option value="">Sélectionnez un chantier</option>
                  {companySites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Montant HT (€)</label>
                <input required type="number" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 outline-none" value={newQuote.amount} onChange={e => setNewQuote({...newQuote, amount: e.target.value})} />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowQuoteModal(false)} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">Annuler</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 shadow">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
