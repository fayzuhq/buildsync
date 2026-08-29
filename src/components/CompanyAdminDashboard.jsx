import React, { useState } from 'react';

export default function CompanyAdminDashboard({
  currentCompanyId, companies, sites, setSites, workers, setWorkers,
  equipment, setEquipment, quotes, setQuotes, auditLogs,
  subcontractors, setSubcontractors, gedFolders, setGedFolders, snags, expenses,
  leaveRequests, setLeaveRequests, users, setUsers, articleCatalog, setArticleCatalog
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
  const [showQuoteDetailModal, setShowQuoteDetailModal] = useState(false);
  const [showDoeModal, setShowDoeModal] = useState(false);
  const [doeProgress, setDoeProgress] = useState(0);
  const [doeStep, setDoeStep] = useState('');
  const [doeDone, setDoeDone] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [selectedResourceForAssignment, setSelectedResourceForAssignment] = useState(null);

  // Close modals on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowAddWorker(false);
        setShowSiteModal(false);
        setShowNewSiteModal(false);
        setShowPdfModal(false);
        setShowPunchListModal(false);
        setShowSubcontractorModal(false);
        setShowQuoteModal(false);
        setShowQuoteDetailModal(false);
        setShowAssignmentModal(false);
        setShowClientModal(false);
        setShowCatalogModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [newWorker, setNewWorker] = useState({ name: '', role: 'Compagnon', email: '', phone: '', caces: '' });
  const [newSite, setNewSite] = useState({ name: '', address: '', managerName: '', budget: '' });
  const [newSubcontractor, setNewSubcontractor] = useState({ name: '', specialty: '', contact: '', insuranceExpiry: '' });
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', siteId: '' });
  const [newArticle, setNewArticle] = useState({ name: '', unit: 'u', defaultUnitPrice: '' });

  const [quoteLines, setQuoteLines] = useState([{ articleId: '', quantity: 1, unitPrice: 0 }]);
  const [newQuoteClient, setNewQuoteClient] = useState('');
  const [newQuoteSite, setNewQuoteSite] = useState('');
  const [newQuoteTva, setNewQuoteTva] = useState(20);

  const [toastMessage, setToastMessage] = useState('');

  // Filtering data for active tenant
  const company = companies.find(c => c.id === currentCompanyId);
  const companySites = sites.filter(s => s.companyId === currentCompanyId);
  const companyWorkers = workers.filter(w => w.companyId === currentCompanyId);
  const companyLogs = auditLogs.filter(log => log.companyId === currentCompanyId);
  const companyQuotes = quotes.filter(q => q.companyId === currentCompanyId);
  const companySubcontractors = subcontractors.filter(s => s.companyId === currentCompanyId);
  const companyLeaves = leaveRequests.filter(lr => lr.companyId === currentCompanyId && lr.status === 'En attente');
  const companyArticles = articleCatalog.filter(a => a.companyId === currentCompanyId);

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
    const totalHT = quoteLines.reduce((sum, line) => sum + (line.quantity * line.unitPrice), 0);
    const totalTTC = totalHT * (1 + newQuoteTva / 100);

    setQuotes([...quotes, {
       id: `q_new_${Date.now().toString().slice(-4)}`,
       companyId: currentCompanyId,
       siteId: newQuoteSite,
       client: newQuoteClient,
       amount: totalHT,
       tvaRate: newQuoteTva,
       totalTTC: totalTTC,
       lines: [...quoteLines],
       date: new Date().toISOString().split('T')[0],
       progressBilling: 0,
       paymentStatus: 'En attente'
    }]);
    setShowQuoteModal(false);
    setQuoteLines([{ articleId: '', quantity: 1, unitPrice: 0 }]);
    setNewQuoteClient('');
    setNewQuoteSite('');
    showToast("Nouveau devis / situation généré avec succès.");
  };

  const openQuoteDetail = (quote) => {
     setSelectedQuote(quote);
     setShowQuoteDetailModal(true);
  };

  const handleAddClient = (e) => {
    e.preventDefault();
    setUsers([...users, {
      id: `u_client_${Date.now()}`,
      name: newClient.name,
      email: newClient.email,
      phone: newClient.phone,
      role: 'client',
      companyId: currentCompanyId,
      siteId: newClient.siteId,
    }]);
    setShowClientModal(false);
    setNewClient({ name: '', email: '', phone: '', siteId: '' });
    showToast("Identifiants envoyés par email/SMS au client.");
  };

  const handleAddArticle = (e) => {
    e.preventDefault();
    setArticleCatalog([...articleCatalog, {
       id: `art_new_${Date.now()}`,
       companyId: currentCompanyId,
       name: newArticle.name,
       unit: newArticle.unit,
       defaultUnitPrice: parseFloat(newArticle.defaultUnitPrice) || 0
    }]);
    setShowCatalogModal(false);
    setNewArticle({ name: '', unit: 'u', defaultUnitPrice: '' });
    showToast("Article ajouté au catalogue.");
  };

  const updateQuoteLine = (index, field, value) => {
    const updatedLines = [...quoteLines];
    updatedLines[index][field] = value;
    if (field === 'articleId') {
      const art = companyArticles.find(a => a.id === value);
      if (art) updatedLines[index].unitPrice = art.defaultUnitPrice;
    }
    setQuoteLines(updatedLines);
  };

  const handleAssignResource = (e) => {
     e.preventDefault();
     const res = selectedResourceForAssignment;
     const val = e.target.assignment.value;

     if (res.type === 'worker') {
        const siteAssigned = val === 'atelier' || val === 'conge' ? null : val;
        setWorkers(workers.map(w => w.id === res.id ? { ...w, siteAssigned } : w));
     } else {
        const assignedSiteId = val === 'depot' || val === 'maintenance' ? null : val;
        const status = val === 'maintenance' ? 'En maintenance' : 'En service';
        const updatedHeavy = equipment.heavyMachinery.map(eq => eq.id === res.id ? { ...eq, assignedSiteId, status } : eq);
        setEquipment({ ...equipment, heavyMachinery: updatedHeavy });
     }
     setShowAssignmentModal(false);
     showToast("Affectation mise à jour avec succès dans le planning.");
  };

  const openAssignmentModal = (resource, type) => {
     setSelectedResourceForAssignment({ ...resource, type });
     setShowAssignmentModal(true);
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

  const handleApproveLeave = (leaveId) => {
    setLeaveRequests(leaveRequests.map(lr => lr.id === leaveId ? { ...lr, status: 'Approuvé' } : lr));
    showToast("Demande de congé approuvée.");
  };

  const handleRejectLeave = (leaveId) => {
    setLeaveRequests(leaveRequests.map(lr => lr.id === leaveId ? { ...lr, status: 'Refusé' } : lr));
    showToast("Demande de congé refusée.");
  };

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

        {/* TAB 2: PLANNING (Visual Gantt) */}
        {activeTab === 'planning' && (
          <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow p-6 min-h-[500px]">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-white">Gantt & Affectations Interactives</h2>
                <div className="text-sm text-slate-400 flex space-x-4">
                   <span className="flex items-center"><div className="w-3 h-3 bg-blue-600 rounded mr-2"></div> Chantier</span>
                   <span className="flex items-center"><div className="w-3 h-3 bg-amber-500 rounded mr-2"></div> Absence / Maintenance</span>
                   <span className="flex items-center"><div className="w-3 h-3 bg-slate-600 rounded mr-2"></div> Atelier / Non assigné</span>
                </div>
             </div>

             <div className="overflow-x-auto relative pb-8">
               <div className="min-w-[1000px] border border-slate-700 rounded-lg overflow-hidden relative bg-slate-900/50">

                 {/* Aujourd'hui Marker */}
                 <div className="absolute top-0 bottom-0 left-[35%] w-0.5 bg-rose-500 z-10 shadow-[0_0_8px_rgba(244,63,94,0.8)] pointer-events-none"></div>

                 {/* Header */}
                 <div className="flex text-xs font-semibold text-slate-400 bg-slate-800 border-b border-slate-700">
                    <div className="w-48 shrink-0 py-3 px-4 border-r border-slate-700">Ressources</div>
                    <div className="flex-1 grid grid-cols-14 divide-x divide-slate-700/50">
                       {[...Array(14)].map((_, i) => (
                          <div key={i} className="py-3 text-center truncate">{`J+${i}`}</div>
                       ))}
                    </div>
                 </div>

                 <div className="divide-y divide-slate-700/50">
                    <div className="bg-slate-800/50 px-4 py-2 text-xs font-bold text-slate-300 uppercase tracking-wider">Collaborateurs</div>

                    {companyWorkers.map(w => {
                       const site = companySites.find(s => s.id === w.siteAssigned);
                       const hasLeave = leaveRequests.some(lr => lr.workerId === w.id && lr.status === 'Approuvé');

                       let blockClasses = "bg-slate-700 border-slate-600 text-slate-300";
                       let label = "Au Dépôt";
                       if (hasLeave) {
                          blockClasses = "bg-amber-900/60 border-amber-500/50 text-amber-300";
                          label = "En Congé";
                       } else if (site) {
                          blockClasses = "bg-blue-600/80 border-blue-500 shadow-sm text-white";
                          label = site.name;
                       }

                       return (
                       <div key={w.id} className="flex hover:bg-slate-800/30 transition-colors group cursor-pointer" onClick={() => openAssignmentModal(w, 'worker')}>
                          <div className="w-48 shrink-0 py-3 px-4 border-r border-slate-700 truncate">
                             <div className="text-white font-medium text-sm">{w.name}</div>
                             <div className="text-xs text-slate-500 truncate">{w.role}</div>
                          </div>
                          <div className="flex-1 p-2 relative">
                             {/* The Block spans the whole 14 days for simulation, indicating current state */}
                             <div className={`w-full h-full rounded-md border flex items-center px-3 text-xs font-semibold truncate transition-all group-hover:brightness-110 ${blockClasses}`}>
                                {label}
                             </div>
                          </div>
                       </div>
                    )})}

                    <div className="bg-slate-800/50 px-4 py-2 text-xs font-bold text-slate-300 uppercase tracking-wider">Gros Engins</div>

                    {companyHeavyEq.map(eq => {
                       const site = companySites.find(s => s.id === eq.assignedSiteId);
                       const isMaint = eq.status === 'En maintenance';

                       let blockClasses = "bg-slate-700 border-slate-600 text-slate-300";
                       let label = "Au Dépôt";
                       if (isMaint) {
                          blockClasses = "bg-rose-900/60 border-rose-500/50 text-rose-300";
                          label = "En Maintenance";
                       } else if (site) {
                          blockClasses = "bg-indigo-600/80 border-indigo-500 shadow-sm text-white";
                          label = site.name;
                       }

                       return (
                       <div key={eq.id} className="flex hover:bg-slate-800/30 transition-colors group cursor-pointer" onClick={() => openAssignmentModal(eq, 'equipment')}>
                          <div className="w-48 shrink-0 py-3 px-4 border-r border-slate-700 truncate">
                             <div className="text-white font-medium text-sm">{eq.name}</div>
                             <div className="text-xs text-slate-500 truncate">S/N: {eq.serialNumber}</div>
                          </div>
                          <div className="flex-1 p-2 relative">
                             <div className={`w-full h-full rounded-md border flex items-center px-3 text-xs font-semibold truncate transition-all group-hover:brightness-110 ${blockClasses}`}>
                                {label}
                             </div>
                          </div>
                       </div>
                    )})}
                 </div>
               </div>
             </div>
          </div>
        )}

        {/* TAB 3: BILLING / QUOTES */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow overflow-hidden">
              <div className="p-5 border-b border-slate-700 bg-slate-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                <h2 className="text-lg font-bold text-white">Suivi des Devis & Facturation BTP</h2>
                <div className="flex space-x-2">
                   <button onClick={() => setShowCatalogModal(true)} className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-1.5 px-3 rounded-lg shadow text-sm transition-colors">Catalogue d'articles</button>
                   <button onClick={() => setShowQuoteModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-3 rounded-lg shadow text-sm transition-colors">+ Créer un Devis</button>
                </div>
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
                     const ht = quote.amount; // For legacy mock data, amount is treated as HT in the display below
                     const acompte = ht * 0.3;
                     const retenue = ht * 0.05;
                     return (
                    <tr key={quote.id} onClick={() => openQuoteDetail(quote)} className="hover:bg-slate-700/30 transition-colors cursor-pointer">
                      <td className="px-5 py-4 font-mono text-slate-500">{quote.id}</td>
                      <td className="px-5 py-4 font-medium text-slate-200">
                         {quote.client} <br/>
                         <span className="text-xs text-slate-500">{companySites.find(s=>s.id === quote.siteId)?.name}</span>
                      </td>
                      <td className="px-5 py-4 font-mono text-right text-slate-300">{ht.toLocaleString()} €</td>
                      <td className="px-5 py-4 text-slate-400 text-right">{acompte.toLocaleString()} €</td>
                      <td className="px-5 py-4">
                         <div className="flex items-center space-x-2 justify-center">
                           <div className="flex-1 bg-slate-900 rounded-full h-2 w-16 shadow-inner">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${quote.progressBilling}%` }}></div>
                           </div>
                           <span className="text-xs font-bold text-blue-400 w-8">{quote.progressBilling}%</span>
                         </div>
                      </td>
                      <td className="px-5 py-4 text-amber-400/80 text-right font-mono">-{retenue.toLocaleString()} €</td>
                      <td className="px-5 py-4 text-center">
                         <span className={`px-2 py-1 rounded-full text-xs font-bold border inline-block w-24 text-center ${quote.paymentStatus === 'Payé' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' : quote.paymentStatus === 'Facturé' || quote.paymentStatus === 'Signé / Validé' ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'bg-red-900/30 text-red-400 border-red-800'}`}>
                           {quote.paymentStatus}
                         </span>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
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
          <div className="space-y-6">
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

            <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow overflow-hidden">
              <div className="p-5 border-b border-slate-700 bg-slate-900/50">
                <h2 className="text-lg font-bold text-white">Demandes d'absences en attente</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-slate-300 text-sm">
                  <thead className="bg-slate-900/80 text-slate-400">
                    <tr>
                      <th className="px-5 py-3">Collaborateur</th>
                      <th className="px-5 py-3">Dates</th>
                      <th className="px-5 py-3">Motif</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {companyLeaves.map(lr => (
                      <tr key={lr.id} className="hover:bg-slate-700/30">
                        <td className="px-5 py-4 font-medium text-white">
                           {workers.find(w => w.id === lr.workerId)?.name}
                        </td>
                        <td className="px-5 py-4 text-slate-400">
                           Du <span className="font-semibold text-white">{lr.startDate}</span> au <span className="font-semibold text-white">{lr.endDate}</span>
                        </td>
                        <td className="px-5 py-4">
                           <span className="bg-amber-900/30 text-amber-400 border border-amber-800 text-xs px-2 py-0.5 rounded font-bold">
                             {lr.type}
                           </span>
                        </td>
                        <td className="px-5 py-4 text-right space-x-2">
                           <button onClick={() => handleApproveLeave(lr.id)} className="bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-800 px-3 py-1 rounded text-xs transition-colors">Approuver</button>
                           <button onClick={() => handleRejectLeave(lr.id)} className="bg-rose-900/30 hover:bg-rose-900/50 text-rose-400 border border-rose-800 px-3 py-1 rounded text-xs transition-colors">Refuser</button>
                        </td>
                      </tr>
                    ))}
                    {companyLeaves.length === 0 && (
                      <tr><td colSpan="4" className="text-center p-4 text-slate-500">Aucune demande en attente.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
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

      {showDoeModal && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-[60] p-4" onClick={() => !doeDone && setShowDoeModal(false)}>
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900">
              <h3 className="text-lg font-bold text-white">Générateur de DOE</h3>
              {doeDone && <button onClick={() => setShowDoeModal(false)} className="text-slate-400 hover:text-white text-xl">✕</button>}
            </div>
            <div className="p-6">
              {!doeDone ? (
                <>
                  <p className="text-sm text-slate-300 mb-4 text-center">{doeStep}</p>
                  <div className="w-full bg-slate-900 rounded-full h-4 mb-4 border border-slate-700 overflow-hidden">
                    <div className="bg-blue-500 h-4 rounded-full transition-all duration-500" style={{ width: `${doeProgress}%` }}></div>
                  </div>
                  <p className="text-xs text-slate-500 text-center">{doeProgress}% complété</p>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className="text-emerald-400 text-5xl mb-2">✓</div>
                  <p className="text-white font-bold">Dossier des Ouvrages Exécutés généré !</p>
                  <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg w-full flex items-center justify-center shadow">
                    <span className="mr-2">📄</span> Télécharger DOE_{selectedSite?.name.replace(/\s+/g, '_')}.pdf
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal - Fiche Chantier 360° */}
      {showSiteModal && selectedSite && (
        <div className="fixed inset-0 bg-slate-950/90 flex justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowSiteModal(false)}>
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-5xl my-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700 flex justify-between items-start bg-slate-900 sticky top-0 z-10">
              <div>
                 <h2 className="text-2xl font-bold text-white">Fiche Chantier 360° : {selectedSite.name}</h2>
                 <p className="text-slate-400 flex items-center mt-1">📍 {selectedSite.address}</p>
              </div>
              <button onClick={() => setShowClientModal(true)} className="ml-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 px-3 rounded-lg shadow text-sm transition-colors hidden sm:block">
                 + Générer accès Client (Maître d'Ouvrage)
              </button>
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
                    <h3 className="text-lg font-bold text-slate-200 border-b border-slate-700 pb-2 flex items-center justify-between">
                       <span className="flex items-center"><span className="mr-2">📂</span> GED & Documents</span>
                       <button
                         onClick={() => {
                           setShowDoeModal(true);
                           setDoeProgress(0);
                           setDoeStep('Compilation des plans...');
                           setDoeDone(false);

                           setTimeout(() => { setDoeProgress(33); setDoeStep('Génération des notices...'); }, 1000);
                           setTimeout(() => { setDoeProgress(66); setDoeStep('Création du PDF...'); }, 2000);
                           setTimeout(() => {
                             setDoeProgress(100);
                             setDoeStep('Terminé');
                             setDoeDone(true);
                             showToast('DOE généré avec succès !');
                           }, 3000);
                         }}
                         className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1 rounded shadow"
                       >
                         Générer le DOE
                       </button>
                    </h3>
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
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-[60] p-4" onClick={() => setShowPdfModal(false)}>
           <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg shadow-xl max-w-3xl w-full" onClick={e => e.stopPropagation()}>
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
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-[60] p-4" onClick={() => setShowPunchListModal(false)}>
           <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
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
        <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-50 p-4" onClick={() => setShowAddWorker(false)}>
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
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
        <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-50 p-4" onClick={() => setShowNewSiteModal(false)}>
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
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
        <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-50 p-4" onClick={() => setShowSubcontractorModal(false)}>
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
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

      {/* Modal - Interactive Assignment */}
      {showAssignmentModal && selectedResourceForAssignment && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-4" onClick={() => setShowAssignmentModal(false)}>
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900">
              <h3 className="text-lg font-bold text-white">Réaffecter la ressource</h3>
              <button onClick={() => setShowAssignmentModal(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>
            <form onSubmit={handleAssignResource} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Ressource</label>
                <input type="text" readOnly className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-slate-300 outline-none cursor-not-allowed" value={selectedResourceForAssignment.name} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nouvelle Affectation</label>
                <select name="assignment" required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 outline-none" defaultValue={selectedResourceForAssignment.type === 'worker' ? (selectedResourceForAssignment.siteAssigned || 'atelier') : (selectedResourceForAssignment.assignedSiteId || 'depot')}>
                  {selectedResourceForAssignment.type === 'worker' ? (
                     <>
                       <option value="atelier">Atelier / Non assigné</option>
                       <option value="conge">En Congé / Maladie</option>
                     </>
                  ) : (
                     <>
                       <option value="depot">Dépôt Central</option>
                       <option value="maintenance">En Maintenance</option>
                     </>
                  )}
                  <optgroup label="Chantiers Actifs">
                     {companySites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </optgroup>
                </select>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowAssignmentModal(false)} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">Annuler</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 shadow transition-colors">Affecter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - New Quote / Multi-line Builder */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowQuoteModal(false)}>
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-4xl overflow-hidden my-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900 sticky top-0 z-10">
              <h3 className="text-xl font-bold text-white">Créateur de Devis Multi-lignes</h3>
              <button onClick={() => setShowQuoteModal(false)} className="text-slate-400 hover:text-white text-2xl">✕</button>
            </div>
            <form onSubmit={handleAddQuote} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Client (Nom ou Entité)</label>
                  <input required type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:ring-1 outline-none" value={newQuoteClient} onChange={e => setNewQuoteClient(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Chantier Associé</label>
                  <select required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:ring-1 outline-none" value={newQuoteSite} onChange={e => setNewQuoteSite(e.target.value)}>
                    <option value="">Sélectionnez un chantier...</option>
                    {companySites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="border border-slate-700 rounded-xl bg-slate-900/50 overflow-hidden">
                 <div className="grid grid-cols-12 gap-2 text-xs font-bold text-slate-400 uppercase bg-slate-900 p-3 border-b border-slate-700">
                    <div className="col-span-6">Désignation (Article du catalogue)</div>
                    <div className="col-span-2 text-center">Quantité</div>
                    <div className="col-span-2 text-right">P.U HT</div>
                    <div className="col-span-2 text-right">Total HT</div>
                 </div>
                 <div className="p-3 space-y-3">
                    {quoteLines.map((line, idx) => {
                       const art = companyArticles.find(a => a.id === line.articleId);
                       const unit = art ? art.unit : '-';
                       const lineTotal = line.quantity * line.unitPrice;
                       return (
                       <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-6 flex space-x-2">
                             <button type="button" onClick={() => setQuoteLines(quoteLines.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-rose-400 p-1">✕</button>
                             <select required className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-200 outline-none focus:border-blue-500 text-sm" value={line.articleId} onChange={(e) => updateQuoteLine(idx, 'articleId', e.target.value)}>
                                <option value="">Sélectionnez un article...</option>
                                {companyArticles.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                             </select>
                          </div>
                          <div className="col-span-2 flex items-center space-x-1">
                             <input required type="number" min="0.1" step="0.1" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-blue-500 text-sm text-center" value={line.quantity} onChange={(e) => updateQuoteLine(idx, 'quantity', parseFloat(e.target.value) || 0)} />
                             <span className="text-slate-500 text-xs w-6">{unit}</span>
                          </div>
                          <div className="col-span-2 relative">
                             <input required type="number" step="0.01" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-blue-500 text-sm text-right pr-6" value={line.unitPrice} onChange={(e) => updateQuoteLine(idx, 'unitPrice', parseFloat(e.target.value) || 0)} />
                             <span className="absolute right-2 top-2.5 text-slate-500 text-xs">€</span>
                          </div>
                          <div className="col-span-2 text-right font-mono text-slate-300 text-sm font-medium">
                             {lineTotal.toLocaleString()} €
                          </div>
                       </div>
                    )})}
                    <button type="button" onClick={() => setQuoteLines([...quoteLines, { articleId: '', quantity: 1, unitPrice: 0 }])} className="text-blue-400 hover:text-blue-300 text-sm font-bold flex items-center mt-2 p-1">
                       + Ajouter une ligne
                    </button>
                 </div>
              </div>

              <div className="flex flex-col items-end space-y-2 text-sm bg-slate-900/30 p-4 rounded-xl border border-slate-700/50 w-full sm:w-1/2 ml-auto">
                 {(() => {
                    const tHT = quoteLines.reduce((sum, line) => sum + (line.quantity * line.unitPrice), 0);
                    const tTTC = tHT * (1 + newQuoteTva/100);
                    const acompte = tHT * 0.3;
                    const retenue = tHT * 0.05;
                    return (
                       <>
                         <div className="flex justify-between w-full">
                            <span className="text-slate-400">Total HT</span>
                            <span className="text-white font-mono">{tHT.toLocaleString()} €</span>
                         </div>
                         <div className="flex justify-between w-full items-center">
                            <span className="text-slate-400">TVA</span>
                            <select className="bg-slate-800 border border-slate-700 rounded p-1 text-slate-300 outline-none text-right ml-2" value={newQuoteTva} onChange={e => setNewQuoteTva(parseFloat(e.target.value))}>
                               <option value="20">20%</option>
                               <option value="10">10% (Rénovation)</option>
                               <option value="5.5">5.5% (Énergétique)</option>
                               <option value="0">0% (Auto-liquidation)</option>
                            </select>
                         </div>
                         <div className="flex justify-between w-full">
                            <span className="text-slate-500">Acompte (30%) HT</span>
                            <span className="text-slate-400 font-mono">{acompte.toLocaleString()} €</span>
                         </div>
                         <div className="flex justify-between w-full">
                            <span className="text-amber-500/80">Retenue Garantie (5%) HT</span>
                            <span className="text-amber-500/80 font-mono">-{retenue.toLocaleString()} €</span>
                         </div>
                         <div className="border-t border-slate-700 w-full my-2"></div>
                         <div className="flex justify-between w-full text-lg font-bold">
                            <span className="text-white">Total TTC</span>
                            <span className="text-blue-400 font-mono">{tTTC.toLocaleString()} €</span>
                         </div>
                       </>
                    );
                 })()}
              </div>

              <div className="pt-6 border-t border-slate-700 flex justify-end space-x-4">
                <button type="button" onClick={() => setShowQuoteModal(false)} className="px-6 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">Annuler</button>
                <button type="submit" className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-lg transition-colors">Générer le Devis</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Quote Viewer */}
      {showQuoteDetailModal && selectedQuote && (
        <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-[60] p-4 overflow-y-auto" onClick={() => setShowQuoteDetailModal(false)}>
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-4xl my-auto overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700 flex justify-between items-start bg-slate-900 sticky top-0 z-10">
              <div>
                 <h2 className="text-2xl font-bold text-white">Détail du Devis : {selectedQuote.id}</h2>
                 <p className="text-slate-400 flex items-center mt-1">Date : {selectedQuote.date || 'N/A'}</p>
              </div>
              <div className="flex items-center space-x-4">
                 <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${selectedQuote.paymentStatus === 'Payé' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' : selectedQuote.paymentStatus === 'Facturé' || selectedQuote.paymentStatus === 'Signé / Validé' ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'bg-red-900/30 text-red-400 border-red-800'}`}>
                    {selectedQuote.paymentStatus}
                 </span>
                 <button onClick={() => setShowQuoteDetailModal(false)} className="text-slate-400 hover:text-white text-2xl font-bold">✕</button>
              </div>
            </div>

            <div className="p-8 space-y-8 bg-slate-100">
               <div className="flex justify-between border-b-2 border-slate-300 pb-6">
                  <div>
                     <h3 className="text-2xl font-bold text-slate-800">{company.name}</h3>
                     <p className="text-slate-500 text-sm mt-1">{company.contactEmail}</p>
                     <p className="text-slate-500 text-sm">SIREN: {company.siren}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Client</p>
                     <h4 className="text-xl font-bold text-slate-800">{selectedQuote.client}</h4>
                     <p className="text-slate-500 text-sm mt-1">Chantier : {companySites.find(s=>s.id === selectedQuote.siteId)?.name}</p>
                  </div>
               </div>

               <table className="w-full text-left text-sm mb-8">
                  <thead className="bg-slate-200 text-slate-600">
                     <tr>
                        <th className="p-3">Désignation</th>
                        <th className="p-3 text-center">Qté</th>
                        <th className="p-3 text-center">Unité</th>
                        <th className="p-3 text-right">P.U HT</th>
                        <th className="p-3 text-right">Total HT</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                     {selectedQuote.lines ? selectedQuote.lines.map((line, idx) => {
                        const art = companyArticles.find(a => a.id === line.articleId);
                        return (
                        <tr key={idx}>
                           <td className="p-3 font-medium">{art ? art.name : 'Article personnalisé'}</td>
                           <td className="p-3 text-center">{line.quantity}</td>
                           <td className="p-3 text-center">{art ? art.unit : '-'}</td>
                           <td className="p-3 text-right">{(line.unitPrice).toLocaleString()} €</td>
                           <td className="p-3 text-right font-bold">{(line.quantity * line.unitPrice).toLocaleString()} €</td>
                        </tr>
                     )}) : (
                        <tr>
                           <td className="p-3 font-medium">Prestation Globale (Legacy Quote)</td>
                           <td className="p-3 text-center">1</td>
                           <td className="p-3 text-center">forfait</td>
                           <td className="p-3 text-right">{selectedQuote.amount.toLocaleString()} €</td>
                           <td className="p-3 text-right font-bold">{selectedQuote.amount.toLocaleString()} €</td>
                        </tr>
                     )}
                  </tbody>
               </table>

               <div className="flex justify-end">
                  <div className="w-1/2 bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-3 text-slate-700">
                     <div className="flex justify-between">
                        <span>Total HT</span>
                        <span className="font-bold">{selectedQuote.amount.toLocaleString()} €</span>
                     </div>
                     <div className="flex justify-between">
                        <span>TVA ({selectedQuote.tvaRate || 20}%)</span>
                        <span>{selectedQuote.totalTTC ? (selectedQuote.totalTTC - selectedQuote.amount).toLocaleString() : (selectedQuote.amount * 0.2).toLocaleString()} €</span>
                     </div>
                     <div className="flex justify-between text-rose-600">
                        <span>Acompte à la commande (30%)</span>
                        <span>-{(selectedQuote.amount * 0.3).toLocaleString()} €</span>
                     </div>
                     <div className="flex justify-between text-amber-600">
                        <span>Retenue de garantie (5%) HT</span>
                        <span>-{(selectedQuote.amount * 0.05).toLocaleString()} €</span>
                     </div>
                     <div className="border-t-2 border-slate-300 pt-3 flex justify-between text-xl font-bold text-slate-900 mt-2">
                        <span>Total TTC</span>
                        <span>{selectedQuote.totalTTC ? selectedQuote.totalTTC.toLocaleString() : (selectedQuote.amount * 1.2).toLocaleString()} €</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-5 border-t border-slate-700 bg-slate-900 flex justify-end space-x-4">
              <button onClick={() => setShowQuoteDetailModal(false)} className="px-6 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">Fermer</button>
              <button className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-500 shadow-lg transition-colors flex items-center"><span className="mr-2">🖨️</span> Imprimer / Télécharger</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Article Catalog Manager */}
      {showCatalogModal && (
        <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-50 p-4" onClick={() => setShowCatalogModal(false)}>
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900">
              <h3 className="text-lg font-bold text-white">Catalogue d'Articles BTP</h3>
              <button onClick={() => setShowCatalogModal(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>
            <div className="p-5 max-h-64 overflow-y-auto space-y-2 border-b border-slate-700/50">
               {companyArticles.map(art => (
                  <div key={art.id} className="flex justify-between items-center bg-slate-900 p-3 rounded border border-slate-700">
                     <span className="text-white font-medium text-sm">{art.name} <span className="text-slate-500 text-xs ml-1">({art.unit})</span></span>
                     <span className="text-blue-400 font-mono text-sm">{art.defaultUnitPrice} € HT</span>
                  </div>
               ))}
               {companyArticles.length === 0 && <p className="text-slate-500 text-sm text-center">Aucun article dans le catalogue.</p>}
            </div>
            <form onSubmit={handleAddArticle} className="p-5 bg-slate-900/30">
              <h4 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">Créer un nouvel article</h4>
              <div className="grid grid-cols-12 gap-3 mb-4">
                 <div className="col-span-6">
                   <input required type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 outline-none text-sm" placeholder="Désignation..." value={newArticle.name} onChange={e => setNewArticle({...newArticle, name: e.target.value})} />
                 </div>
                 <div className="col-span-3">
                   <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 outline-none text-sm" value={newArticle.unit} onChange={e => setNewArticle({...newArticle, unit: e.target.value})}>
                     <option value="u">Unité (u)</option>
                     <option value="m">Mètre (m)</option>
                     <option value="m²">Mètre² (m²)</option>
                     <option value="m³">Mètre³ (m³)</option>
                     <option value="L">Litre (L)</option>
                     <option value="h">Heure (h)</option>
                     <option value="forfait">Forfait</option>
                   </select>
                 </div>
                 <div className="col-span-3 relative">
                   <input required type="number" step="0.01" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 outline-none text-sm text-right pr-6" placeholder="0.00" value={newArticle.defaultUnitPrice} onChange={e => setNewArticle({...newArticle, defaultUnitPrice: e.target.value})} />
                   <span className="absolute right-2 top-2 text-slate-500 text-xs">€</span>
                 </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 shadow text-sm">Ajouter au catalogue</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Client Onboarding */}
      {showClientModal && (
        <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-[70] p-4" onClick={() => setShowClientModal(false)}>
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900">
              <h3 className="text-lg font-bold text-white">Générer accès Maître d'Ouvrage</h3>
              <button onClick={() => setShowClientModal(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>
            <form onSubmit={handleAddClient} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nom du Client / Entité</label>
                <input required type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 outline-none" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Chantier Associé (Permis de lecture)</label>
                <select required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 outline-none" value={newClient.siteId} onChange={e => setNewClient({...newClient, siteId: e.target.value})}>
                  <option value="">Sélectionnez un chantier</option>
                  {companySites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email de contact</label>
                <input required type="email" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 outline-none" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Téléphone (SMS Onboarding)</label>
                <input required type="tel" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 outline-none" value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowClientModal(false)} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">Annuler</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-500 shadow">Générer & Envoyer Accès</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
