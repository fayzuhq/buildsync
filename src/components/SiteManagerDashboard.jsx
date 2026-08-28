import React, { useState } from 'react';
import { mockSites, mockWorkers, mockEquipment } from '../mockData';

export default function SiteManagerDashboard({ currentCompanyId }) {
  const activeSite = mockSites.find(s => s.companyId === currentCompanyId) || mockSites[0];
  const siteWorkers = mockWorkers.filter(w => w.siteAssigned === activeSite?.id);

  const siteHeavyEq = mockEquipment.heavyMachinery.filter(e => e.assignedSiteId === activeSite?.id);
  const siteLightEq = mockEquipment.lightTools.filter(e => e.assignedSiteId === activeSite?.id);

  const [activeTab, setActiveTab] = useState('daily');
  const [report, setReport] = useState('');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedEq, setSelectedEq] = useState(null);

  if (!activeSite) {
    return <div className="p-4 text-white">Aucun chantier assigné pour cette entreprise.</div>;
  }

  const handleSubmitReport = (e) => {
    e.preventDefault();
    alert("Rapport journalier soumis avec succès !");
    setReport('');
  };

  const handleTransfer = (e) => {
    e.preventDefault();
    alert("Demande de transfert / attribution envoyée.");
    setShowTransferModal(false);
    setSelectedEq(null);
  };

  const openTransfer = (eq) => {
    setSelectedEq(eq);
    setShowTransferModal(true);
  };

  const tabs = [
    { id: 'daily', label: 'Quotidien & Pointages' },
    { id: 'equipment', label: 'Matériel du Chantier' }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{activeSite.name}</h1>
          <p className="text-slate-400 mt-1 flex items-center">
             <span className="mr-2">📍</span> {activeSite.address}
          </p>
        </div>
        <div className="mt-4 md:mt-0 text-right">
          <span className={`px-3 py-1 rounded-full text-sm font-bold border ${
            activeSite.status === 'En cours' ? 'bg-blue-900/30 text-blue-400 border-blue-800' :
            activeSite.status === 'En retard' ? 'bg-red-900/30 text-red-400 border-red-800' :
            'bg-emerald-900/30 text-emerald-400 border-emerald-800'
          }`}>
            Statut: {activeSite.status}
          </span>
          <p className="text-slate-500 text-sm mt-2">Budget: {activeSite.budget.toLocaleString()} €</p>
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

      {activeTab === 'daily' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">

          {/* Workers Check-in */}
          <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 shadow overflow-hidden">
            <div className="p-5 border-b border-slate-700 bg-slate-900/50">
              <h2 className="text-lg font-bold text-white">Pointages du Jour (Équipe)</h2>
            </div>
            <ul className="divide-y divide-slate-700/50">
              {siteWorkers.map(worker => (
                <li key={worker.id} className="p-5 flex items-center justify-between hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-blue-400 font-bold border border-slate-600">
                      {worker.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{worker.name}</p>
                      <p className="text-slate-500 text-sm">{worker.role}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-emerald-900/30 text-emerald-400 rounded-lg text-sm hover:bg-emerald-900/50 border border-emerald-800 transition-colors">
                      Présent
                    </button>
                    <button className="px-3 py-1 bg-red-900/30 text-red-400 rounded-lg text-sm hover:bg-red-900/50 border border-red-800 transition-colors">
                      Absent
                    </button>
                  </div>
                </li>
              ))}
              {siteWorkers.length === 0 && (
                <li className="p-5 text-center text-slate-500">Aucun ouvrier assigné.</li>
              )}
            </ul>
          </div>

          {/* Daily Report Form */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 shadow overflow-hidden h-fit">
            <div className="p-5 border-b border-slate-700 bg-slate-900/50">
              <h2 className="text-lg font-bold text-white">Rapport Journalier</h2>
            </div>
            <form onSubmit={handleSubmitReport} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Avancement et remarques</label>
                <textarea
                  className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Ex: Coulage béton terminé. Intempéries ce matin..."
                  value={report}
                  onChange={(e) => setReport(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="flex items-center space-x-2 text-slate-300 text-sm mb-4">
                 <input type="checkbox" id="incident" className="rounded border-slate-600 text-blue-600 focus:ring-blue-500 bg-slate-900" />
                 <label htmlFor="incident">Signaler un incident (Sécurité)</label>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-lg shadow transition-colors"
              >
                Envoyer le rapport
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'equipment' && (
        <div className="space-y-6 mt-4">
           {/* Heavy Machinery on site */}
           <div className="bg-slate-800 rounded-xl border border-slate-700 shadow overflow-hidden">
            <div className="p-5 border-b border-slate-700 bg-slate-900/50">
              <h2 className="text-lg font-bold text-white">Engins sur site</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-slate-300 text-sm">
                <thead className="bg-slate-900/80 text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Engin</th>
                    <th className="px-5 py-3">Statut</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {siteHeavyEq.map(eq => (
                    <tr key={eq.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-5 py-4">
                         <div className="font-semibold text-white">{eq.name}</div>
                         <div className="text-xs text-slate-500">S/N: {eq.serialNumber}</div>
                      </td>
                      <td className="px-5 py-4">
                         <span className={`px-2 py-1 rounded text-xs font-semibold ${eq.status === 'En service' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800' : eq.status === 'Disponible' ? 'bg-blue-900/30 text-blue-400 border border-blue-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>
                           {eq.status}
                         </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                         <button onClick={() => openTransfer(eq)} className="text-blue-400 hover:text-blue-300 text-sm transition-colors">Signaler / Transférer</button>
                      </td>
                    </tr>
                  ))}
                  {siteHeavyEq.length === 0 && <tr><td colSpan="3" className="p-4 text-center text-slate-500">Aucun engin affecté.</td></tr>}
                </tbody>
              </table>
            </div>
           </div>

           {/* Light Tools on site */}
           <div className="bg-slate-800 rounded-xl border border-slate-700 shadow overflow-hidden">
            <div className="p-5 border-b border-slate-700 bg-slate-900/50">
              <h2 className="text-lg font-bold text-white">Petit Outillage</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-slate-300 text-sm">
                <thead className="bg-slate-900/80 text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Outil</th>
                    <th className="px-5 py-3">Assigné à</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {siteLightEq.map(eq => (
                    <tr key={eq.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-5 py-4 font-medium text-white">{eq.name}</td>
                      <td className="px-5 py-4 text-slate-400">
                        {eq.currentHolderWorkerId ? siteWorkers.find(w=>w.id === eq.currentHolderWorkerId)?.name : 'Libre sur chantier'}
                      </td>
                      <td className="px-5 py-4 text-right">
                         <button onClick={() => openTransfer(eq)} className="text-blue-400 hover:text-blue-300 text-sm transition-colors">Attribuer</button>
                      </td>
                    </tr>
                  ))}
                  {siteLightEq.length === 0 && <tr><td colSpan="3" className="p-4 text-center text-slate-500">Aucun outil affecté.</td></tr>}
                </tbody>
              </table>
            </div>
           </div>
        </div>
      )}

      {/* Modal - Transfer/Assign Equipment */}
      {showTransferModal && selectedEq && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900">
              <h3 className="text-lg font-bold text-white">Action sur Matériel</h3>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-white transition-colors">✕</button>
            </div>
            <form onSubmit={handleTransfer} className="p-5 space-y-4">
              <div>
                <p className="text-sm text-slate-400 mb-2">Matériel concerné : <strong className="text-white">{selectedEq.name}</strong></p>
                <label className="block text-sm font-medium text-slate-300 mb-1">Type d'action</label>
                <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                  <option>Attribuer à un ouvrier</option>
                  <option>Signaler en panne / maintenance</option>
                  <option>Demander transfert vers autre chantier</option>
                  <option>Retour dépôt</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Détails / Remarques</label>
                <textarea className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none h-20"></textarea>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowTransferModal(false)} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">Annuler</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors shadow">Valider</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
