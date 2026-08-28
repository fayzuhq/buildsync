import React, { useState } from 'react';

export default function SiteManagerDashboard({
  currentCompanyId, currentUser, sites, workers, setWorkers,
  equipment, setEquipment, deliveries, setDeliveries, snags, setSnags,
  expenses, setExpenses
}) {
  const loggedInWorker = workers.find(w => w.id === currentUser?.workerId);
  const siteIdToUse = loggedInWorker ? loggedInWorker.siteAssigned : sites.find(s => s.companyId === currentCompanyId)?.id;
  const activeSite = sites.find(s => s.id === siteIdToUse);

  const siteWorkers = workers.filter(w => w.siteAssigned === activeSite?.id);
  const siteHeavyEq = equipment.heavyMachinery.filter(e => e.assignedSiteId === activeSite?.id);
  const siteLightEq = equipment.lightTools.filter(e => e.assignedSiteId === activeSite?.id);

  const siteDeliveries = deliveries.filter(d => d.siteId === activeSite?.id);
  const siteSnags = snags.filter(sn => sn.siteId === activeSite?.id);

  const [activeTab, setActiveTab] = useState('daily');
  const [report, setReport] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [newDelivery, setNewDelivery] = useState({ time: '', description: '' });

  const [showSnagModal, setShowSnagModal] = useState(false);
  const [newSnag, setNewSnag] = useState({ description: '', subcontractor: '', deadline: '', photo: null });

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState({ amount: '', supplier: '', description: '', receipt: null });

  // Timesheet local state
  const [timesheet, setTimesheet] = useState(siteWorkers.map(w => ({
     workerId: w.id, present: true, hours: '8h', mealVoucher: true
  })));

  const handleTimesheetChange = (workerId, field, value) => {
     setTimesheet(timesheet.map(t => t.workerId === workerId ? { ...t, [field]: value } : t));
  };

  if (!activeSite) {
    return <div className="p-4 text-white">Aucun chantier assigné pour cette entreprise.</div>;
  }

  const showToast = (msg) => {
     setToastMessage(msg);
     setTimeout(() => setToastMessage(''), 5000);
  };

  const handleSubmitReport = (e) => {
    e.preventDefault();
    // Persist local timesheet to global workers state
    const updatedWorkers = workers.map(w => {
       if (w.siteAssigned === activeSite.id) {
          const ts = timesheet.find(t => t.workerId === w.id);
          if (ts && ts.present) {
             const h = ts.hours === '9h (Sup)' ? 9 : parseInt(ts.hours);
             return { ...w, hoursLoggedThisWeek: w.hoursLoggedThisWeek + h };
          }
       }
       return w;
    });
    setWorkers(updatedWorkers);
    showToast("Rapport journalier et pointages soumis avec succès !");
    setReport('');
  };

  const handleTransferEquipment = (eqId) => {
    const updatedHeavy = equipment.heavyMachinery.map(eq =>
       eq.id === eqId ? { ...eq, status: 'En maintenance', assignedSiteId: null } : eq
    );
    setEquipment({ ...equipment, heavyMachinery: updatedHeavy });
    showToast("Équipement signalé en panne et renvoyé au dépôt.");
  };

  const handleAddDelivery = (e) => {
     e.preventDefault();
     const newId = `d_new_${Date.now()}`;
     setDeliveries([...deliveries, {
        id: newId,
        companyId: currentCompanyId,
        siteId: activeSite.id,
        description: newDelivery.description,
        time: newDelivery.time,
        signature: false
     }]);
     setShowDeliveryModal(false);
     setNewDelivery({ time: '', description: '' });
     showToast("Bon de livraison ajouté.");
  };

  const handleSignDelivery = (deliveryId) => {
     setDeliveries(deliveries.map(d => d.id === deliveryId ? { ...d, signature: true } : d));
     showToast("Livraison signée électroniquement.");
  };

  const handleAddSnag = (e) => {
     e.preventDefault();
     const newId = `sn_new_${Date.now()}`;
     setSnags([...snags, {
        id: newId,
        companyId: currentCompanyId,
        siteId: activeSite.id,
        description: newSnag.description,
        subcontractor: newSnag.subcontractor,
        deadline: newSnag.deadline,
        status: 'Ouvert',
        hasPhoto: newSnag.photo !== null
     }]);
     setShowSnagModal(false);
     setNewSnag({ description: '', subcontractor: '', deadline: '', photo: null });
     showToast("Réserve (Punch List) créée.");
  };

  const handleCloseSnag = (snagId) => {
     setSnags(snags.map(sn => sn.id === snagId ? { ...sn, status: 'Terminé' } : sn));
     showToast("Réserve clôturée avec succès.");
  };

  const handleAddExpense = (e) => {
     e.preventDefault();
     const newId = `exp_new_${Date.now()}`;
     setExpenses([...expenses, {
        id: newId,
        companyId: currentCompanyId,
        siteId: activeSite.id,
        amount: parseFloat(newExpense.amount) || 0,
        supplier: newExpense.supplier,
        description: newExpense.description,
        date: new Date().toISOString().split('T')[0]
     }]);
     setShowExpenseModal(false);
     setNewExpense({ amount: '', supplier: '', description: '', receipt: null });
     showToast("Note de frais ajoutée.");
  };

  const tabs = [
    { id: 'daily', label: 'Quotidien, Pointages & Météo' },
    { id: 'equipment', label: 'Matériel du Chantier' },
    { id: 'deliveries', label: 'Livraisons & BL' },
    { id: 'expenses', label: 'Notes de Frais & Achats Terrain' },
    { id: 'snags', label: 'Réserves & Qualité' }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center space-x-2 animate-bounce">
          <span>✓</span>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="bg-slate-800/90 p-6 rounded-xl border border-slate-700 shadow flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{activeSite.name}</h1>
          <p className="text-slate-400 mt-1 flex items-center">
             <span className="mr-2">📍</span> {activeSite.address}
          </p>
        </div>
        <div className="mt-4 md:mt-0 text-right flex flex-col items-end">
          <span className={`px-3 py-1 rounded-full text-sm font-bold border inline-block ${
            activeSite.status === 'En cours' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' :
            activeSite.status === 'En retard' ? 'bg-amber-900/30 text-amber-400 border-amber-800' :
            'bg-blue-900/30 text-blue-400 border-blue-800'
          }`}>
            Statut: {activeSite.status}
          </span>
          <div className="w-48 bg-slate-900 rounded-full h-2 mt-3 mb-1">
             <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${activeSite.budget > 0 ? (activeSite.budgetConsumed/activeSite.budget)*100 : 0}%` }}></div>
          </div>
          <p className="text-slate-500 text-xs">Budget: {activeSite.budgetConsumed.toLocaleString()} / {activeSite.budget.toLocaleString()} €</p>
          <button className="text-blue-400 hover:underline text-xs mt-2">📄 Voir plans PDF</button>
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

      {/* TAB 1: DAILY / WEATHER */}
      {activeTab === 'daily' && (
        <div className="space-y-6 mt-4">

          {/* Météo Bar */}
          <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow p-5 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
             <h3 className="text-white font-bold whitespace-nowrap">Météo du jour :</h3>
             <select className="bg-slate-900 border border-slate-700 text-slate-300 rounded p-2 focus:border-blue-500 focus:ring-1 outline-none w-full sm:w-auto">
               <option>☀️ Ensoleillé</option>
               <option>🌧️ Pluie battante</option>
               <option>❄️ Gel</option>
               <option>💨 Vent violent</option>
             </select>
             <div className="flex items-center space-x-2 w-full sm:w-auto">
               <input type="number" defaultValue={15} className="w-16 bg-slate-900 border border-slate-700 rounded p-2 text-slate-300 text-center" />
               <span className="text-slate-400">°C</span>
             </div>
             <p className="text-xs text-slate-500 italic flex-grow text-right hidden lg:block">Journal météo légal (intempéries)</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Workers Check-in */}
            <div className="lg:col-span-2 bg-slate-800/90 rounded-xl border border-slate-700 shadow overflow-hidden">
              <div className="p-5 border-b border-slate-700 bg-slate-900/50">
                <h2 className="text-lg font-bold text-white">Pointages de l'équipe (Timesheet)</h2>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left text-slate-300 text-sm">
                   <thead className="bg-slate-900/50 text-slate-400">
                     <tr>
                       <th className="px-5 py-3">Collaborateur</th>
                       <th className="px-5 py-3 text-center">Présence</th>
                       <th className="px-5 py-3 text-center">Heures</th>
                       <th className="px-5 py-3 text-center">Panier Repas</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-700/50">
                     {siteWorkers.map(worker => {
                       const ts = timesheet.find(t => t.workerId === worker.id);
                       return (
                       <tr key={worker.id} className="hover:bg-slate-700/30">
                         <td className="px-5 py-3">
                           <div className="flex items-center space-x-3">
                             <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-blue-400 font-bold border border-slate-600 shrink-0">
                               {worker.name.charAt(0)}
                             </div>
                             <div>
                               <p className="text-white font-medium">{worker.name}</p>
                               <p className="text-slate-500 text-xs">{worker.role}</p>
                             </div>
                           </div>
                         </td>
                         <td className="px-5 py-3 text-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" checked={ts?.present} onChange={(e) => handleTimesheetChange(worker.id, 'present', e.target.checked)} className="sr-only peer" />
                              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                         </td>
                         <td className="px-5 py-3 text-center">
                            <select value={ts?.hours} onChange={(e) => handleTimesheetChange(worker.id, 'hours', e.target.value)} disabled={!ts?.present} className="bg-slate-900 border border-slate-700 rounded p-1 text-slate-300 disabled:opacity-50 outline-none">
                               <option value="7h">7h</option>
                               <option value="8h">8h</option>
                               <option value="9h (Sup)">9h (Sup)</option>
                            </select>
                         </td>
                         <td className="px-5 py-3 text-center">
                             <input type="checkbox" checked={ts?.mealVoucher} onChange={(e) => handleTimesheetChange(worker.id, 'mealVoucher', e.target.checked)} disabled={!ts?.present} className="rounded border-slate-600 text-blue-600 focus:ring-blue-500 bg-slate-900 disabled:opacity-50 cursor-pointer" />
                         </td>
                       </tr>
                     )})}
                   </tbody>
                 </table>
              </div>
            </div>

            {/* Daily Report Form */}
            <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow overflow-hidden h-fit flex flex-col">
              <div className="p-5 border-b border-slate-700 bg-slate-900/50">
                <h2 className="text-lg font-bold text-white">Rapport Journalier</h2>
              </div>
              <form onSubmit={handleSubmitReport} className="p-5 space-y-4 flex-grow flex flex-col">
                <div className="flex-grow flex flex-col">
                  <textarea
                    className="w-full flex-grow min-h-[120px] bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 outline-none resize-none"
                    placeholder="Notes du jour (avancement, problèmes rencontrés...)"
                    value={report}
                    onChange={(e) => setReport(e.target.value)}
                    required
                  ></textarea>
                </div>
                <div className="flex items-center space-x-2 text-slate-300 text-sm py-2">
                   <input type="checkbox" id="incident" className="rounded border-slate-600 text-amber-500 focus:ring-amber-500 bg-slate-900 cursor-pointer" />
                   <label htmlFor="incident" className="text-amber-400 font-medium cursor-pointer">Signaler un incident</label>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-lg shadow transition-colors">
                  Enregistrer le rapport
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EQUIPMENT */}
      {activeTab === 'equipment' && (
        <div className="space-y-6 mt-4">
           <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow overflow-hidden">
            <div className="p-5 border-b border-slate-700 bg-slate-900/50">
              <h2 className="text-lg font-bold text-white">Gros Engins sur site</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-slate-300 text-sm">
                <thead className="bg-slate-900/80 text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Équipement / Modèle</th>
                    <th className="px-5 py-3">Statut</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {siteHeavyEq.map(eq => (
                    <tr key={eq.id} className="hover:bg-slate-700/30">
                      <td className="px-5 py-4">
                         <div className="font-semibold text-white">{eq.name}</div>
                         <div className="text-xs text-slate-500">S/N: {eq.serialNumber}</div>
                      </td>
                      <td className="px-5 py-4">
                         <span className={`px-2 py-1 rounded text-xs font-semibold border ${eq.status === 'En service' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' : eq.status === 'Disponible' ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'bg-red-900/30 text-red-400 border-red-800'}`}>
                           {eq.status}
                         </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                         <button onClick={() => handleTransferEquipment(eq.id)} className="text-blue-400 hover:text-blue-300 text-sm outline-none transition-colors">Déclarer panne / Transférer</button>
                      </td>
                    </tr>
                  ))}
                  {siteHeavyEq.length === 0 && <tr><td colSpan="3" className="p-4 text-center text-slate-500">Aucun engin affecté.</td></tr>}
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
                    <th className="px-5 py-3">Équipement / Modèle</th>
                    <th className="px-5 py-3">Assigné à</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {siteLightEq.map(eq => (
                    <tr key={eq.id} className="hover:bg-slate-700/30">
                      <td className="px-5 py-4 font-medium text-white">{eq.name}</td>
                      <td className="px-5 py-4 text-slate-400">
                        {eq.currentHolderWorkerId ? workers.find(w=>w.id === eq.currentHolderWorkerId)?.name : 'Libre sur chantier'}
                      </td>
                    </tr>
                  ))}
                  {siteLightEq.length === 0 && <tr><td colSpan="2" className="p-4 text-center text-slate-500">Aucun outil affecté.</td></tr>}
                </tbody>
              </table>
            </div>
           </div>
        </div>
      )}

      {/* TAB 3: DELIVERIES */}
      {activeTab === 'deliveries' && (
        <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow overflow-hidden mt-4">
          <div className="p-5 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
             <h2 className="text-lg font-bold text-white">Bons de Réception (BL)</h2>
             <button onClick={() => setShowDeliveryModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-3 rounded text-sm transition-colors">+ Nouvelle Livraison</button>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left text-slate-300 text-sm">
               <thead className="bg-slate-900/80 text-slate-400">
                 <tr>
                   <th className="px-5 py-3">Heure</th>
                   <th className="px-5 py-3">Description</th>
                   <th className="px-5 py-3">Signature / Photo</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-700/50">
                 {siteDeliveries.map(d => (
                    <tr key={d.id} className="hover:bg-slate-700/30">
                       <td className="px-5 py-4 text-slate-400">{d.time}</td>
                       <td className="px-5 py-4 font-medium text-white">{d.description}</td>
                       <td className="px-5 py-4">
                          {d.signature ? (
                            <span className="text-emerald-400 flex items-center">✓ Signé</span>
                          ) : (
                            <button onClick={() => handleSignDelivery(d.id)} className="text-blue-400 border border-blue-400/50 rounded px-2 py-1 text-xs hover:bg-blue-900/30 transition-colors">📸 Ajouter BL</button>
                          )}
                       </td>
                    </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>
      )}

      {/* TAB 4: EXPENSES */}
      {activeTab === 'expenses' && (
        <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow overflow-hidden mt-4">
          <div className="p-5 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
             <h2 className="text-lg font-bold text-white">Notes de Frais & Achats Terrain</h2>
             <button onClick={() => setShowExpenseModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-3 rounded text-sm transition-colors">+ Ajouter une dépense</button>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left text-slate-300 text-sm">
               <thead className="bg-slate-900/80 text-slate-400">
                 <tr>
                   <th className="px-5 py-3">Date</th>
                   <th className="px-5 py-3">Fournisseur</th>
                   <th className="px-5 py-3">Description</th>
                   <th className="px-5 py-3 text-right">Montant</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-700/50">
                 {expenses.filter(e => e.siteId === activeSite.id).map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-700/30">
                       <td className="px-5 py-4 text-slate-400">{exp.date}</td>
                       <td className="px-5 py-4 font-medium text-white">{exp.supplier}</td>
                       <td className="px-5 py-4 text-slate-400">{exp.description}</td>
                       <td className="px-5 py-4 font-mono text-right text-rose-400">-{exp.amount.toLocaleString()} €</td>
                    </tr>
                 ))}
                 {expenses.filter(e => e.siteId === activeSite.id).length === 0 && (
                    <tr><td colSpan="4" className="text-center p-4 text-slate-500">Aucune dépense enregistrée.</td></tr>
                 )}
               </tbody>
             </table>
          </div>
        </div>
      )}

      {/* TAB 5: SNAGS */}
      {activeTab === 'snags' && (
        <div className="bg-slate-800/90 rounded-xl border border-slate-700 shadow overflow-hidden mt-4">
          <div className="p-5 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
             <h2 className="text-lg font-bold text-white">Réserves & Contrôle Qualité</h2>
             <button onClick={() => setShowSnagModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-3 rounded text-sm transition-colors">+ Créer une réserve</button>
          </div>
          <div className="p-5 grid gap-4 grid-cols-1 md:grid-cols-2">
             {siteSnags.map(sn => (
                <div key={sn.id} className="bg-slate-900 border border-slate-700 rounded-lg p-4 flex flex-col">
                   <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold border ${sn.status === 'Ouvert' ? 'bg-red-900/30 text-red-400 border-red-800' : sn.status === 'En cours' ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'bg-emerald-900/30 text-emerald-400 border-emerald-800'}`}>
                         {sn.status}
                      </span>
                      <span className="text-xs text-slate-500">Échéance: {sn.deadline}</span>
                   </div>
                   <p className="text-white font-medium mb-1">{sn.description}</p>
                   <p className="text-sm text-slate-400 mb-4">Sous-traitant : {sn.subcontractor}</p>
                   {sn.hasPhoto && (
                     <div className="mb-4 bg-slate-800 border border-slate-700 rounded h-24 flex items-center justify-center text-slate-500 text-xs">
                        Photo jointe
                     </div>
                   )}
                   <div className="mt-auto flex space-x-2">
                      <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 rounded text-sm border border-slate-600 transition-colors">📸 Photo</button>
                      {sn.status !== 'Terminé' && (
                        <button onClick={() => handleCloseSnag(sn.id)} className="flex-1 bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 py-1.5 rounded text-sm border border-emerald-800 transition-colors">Clôturer</button>
                      )}
                   </div>
                </div>
             ))}
          </div>
        </div>
      )}

      {/* Modal - New Delivery */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900">
              <h3 className="text-lg font-bold text-white">Nouvelle Livraison</h3>
              <button onClick={() => setShowDeliveryModal(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>
            <form onSubmit={handleAddDelivery} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Heure</label>
                <input required type="time" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 outline-none" value={newDelivery.time} onChange={e => setNewDelivery({...newDelivery, time: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <input required type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 outline-none" placeholder="Ex: 10 palettes de ciment..." value={newDelivery.description} onChange={e => setNewDelivery({...newDelivery, description: e.target.value})} />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowDeliveryModal(false)} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">Annuler</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 shadow transition-colors">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - New Expense */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900">
              <h3 className="text-lg font-bold text-white">Ajouter une dépense</h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>
            <form onSubmit={handleAddExpense} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Montant TTC (€)</label>
                <input required type="number" step="0.01" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 outline-none" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Fournisseur</label>
                <input required type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 outline-none" placeholder="Ex: Leroy Merlin..." value={newExpense.supplier} onChange={e => setNewExpense({...newExpense, supplier: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description / Motif</label>
                <textarea required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 outline-none resize-none h-20" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Photo du ticket / facture</label>
                <input type="file" accept="image/*" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-300 file:bg-slate-800 file:text-slate-300 file:border-0 file:rounded file:px-3 file:py-1 file:mr-3 hover:file:bg-slate-700 cursor-pointer outline-none" onChange={e => setNewExpense({...newExpense, receipt: e.target.files[0]})} />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowExpenseModal(false)} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">Annuler</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 shadow transition-colors">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - New Snag */}
      {showSnagModal && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900">
              <h3 className="text-lg font-bold text-white">Créer une réserve</h3>
              <button onClick={() => setShowSnagModal(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>
            <form onSubmit={handleAddSnag} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description du défaut</label>
                <textarea required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 outline-none resize-none h-20" value={newSnag.description} onChange={e => setNewSnag({...newSnag, description: e.target.value})}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Sous-traitant concerné</label>
                <input required type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 outline-none" value={newSnag.subcontractor} onChange={e => setNewSnag({...newSnag, subcontractor: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Échéance de levée</label>
                <input required type="date" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 outline-none" value={newSnag.deadline} onChange={e => setNewSnag({...newSnag, deadline: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Joindre une photo du défaut</label>
                <input type="file" accept="image/*" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-300 file:bg-slate-800 file:text-slate-300 file:border-0 file:rounded file:px-3 file:py-1 file:mr-3 hover:file:bg-slate-700 cursor-pointer outline-none" onChange={e => setNewSnag({...newSnag, photo: e.target.files[0]})} />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowSnagModal(false)} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">Annuler</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 shadow transition-colors">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
