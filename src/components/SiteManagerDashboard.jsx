import React, { useState } from 'react';
import { mockSites, mockWorkers } from '../mockData';

export default function SiteManagerDashboard({ currentCompanyId }) {
  // In a real app, we'd determine the logged-in manager's ID. Here we just pick the first site of the company.
  const activeSite = mockSites.find(s => s.companyId === currentCompanyId) || mockSites[0];
  const siteWorkers = mockWorkers.filter(w => w.siteAssigned === activeSite?.id);

  const [report, setReport] = useState('');

  if (!activeSite) {
    return <div className="p-4 text-white">Aucun chantier assigné pour cette entreprise.</div>;
  }

  const handleSubmitReport = (e) => {
    e.preventDefault();
    alert("Rapport journalier soumis avec succès !");
    setReport('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700 shadow flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">{activeSite.name}</h1>
          <p className="text-zinc-400 mt-1 flex items-center">
             <span className="mr-2">📍</span> {activeSite.address}
          </p>
        </div>
        <div className="mt-4 md:mt-0 text-right">
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
            activeSite.status === 'En cours' ? 'bg-blue-900 text-blue-300' :
            activeSite.status === 'En retard' ? 'bg-red-900 text-red-300' :
            'bg-emerald-900 text-emerald-300'
          }`}>
            Statut: {activeSite.status}
          </span>
          <p className="text-zinc-500 text-sm mt-2">Budget: {activeSite.budget.toLocaleString()} €</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Workers Check-in */}
        <div className="lg:col-span-2 bg-zinc-800 rounded-lg border border-zinc-700 shadow overflow-hidden">
          <div className="p-4 border-b border-zinc-700 bg-zinc-900">
            <h2 className="text-lg font-bold text-white">Pointages du Jour (Équipe)</h2>
          </div>
          <ul className="divide-y divide-zinc-700">
            {siteWorkers.map(worker => (
              <li key={worker.id} className="p-4 flex items-center justify-between hover:bg-zinc-700/30">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-600 flex items-center justify-center text-zinc-300 font-bold">
                    {worker.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium">{worker.name}</p>
                    <p className="text-zinc-500 text-sm">{worker.role}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-emerald-600/20 text-emerald-400 rounded text-sm hover:bg-emerald-600/40 border border-emerald-800">
                    Présent
                  </button>
                  <button className="px-3 py-1 bg-red-600/20 text-red-400 rounded text-sm hover:bg-red-600/40 border border-red-800">
                    Absent
                  </button>
                </div>
              </li>
            ))}
            {siteWorkers.length === 0 && (
              <li className="p-4 text-center text-zinc-500">Aucun ouvrier assigné.</li>
            )}
          </ul>
        </div>

        {/* Daily Report Form */}
        <div className="bg-zinc-800 rounded-lg border border-zinc-700 shadow overflow-hidden h-fit">
          <div className="p-4 border-b border-zinc-700 bg-zinc-900">
            <h2 className="text-lg font-bold text-white">Rapport Journalier</h2>
          </div>
          <form onSubmit={handleSubmitReport} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Avancement et remarques</label>
              <textarea
                className="w-full h-32 bg-zinc-900 border border-zinc-600 rounded p-3 text-white focus:border-amber-500 outline-none resize-none"
                placeholder="Ex: Coulage béton terminé. Intempéries ce matin..."
                value={report}
                onChange={(e) => setReport(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="flex items-center space-x-2 text-zinc-300 text-sm mb-4">
               <input type="checkbox" id="incident" className="rounded bg-zinc-900 border-zinc-600 text-amber-500 focus:ring-amber-500" />
               <label htmlFor="incident">Signaler un incident (Sécurité)</label>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-900 font-bold py-2 px-4 rounded shadow transition-colors"
            >
              Envoyer le rapport
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
