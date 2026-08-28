import React, { useState } from 'react';
import { mockSites, mockWorkers } from '../mockData';

export default function WorkerMobileView({ currentCompanyId, currentUser }) {
  // Find the worker based on currentUser workerId if it exists, otherwise fallback
  const worker = mockWorkers.find(w => w.id === currentUser?.workerId) || mockWorkers.find(w => w.companyId === currentCompanyId && w.role === 'Compagnon') || mockWorkers.find(w => w.role === 'Compagnon');

  const site = worker ? mockSites.find(s => s.id === worker.siteAssigned) : null;

  const [isCheckedIn, setIsCheckedIn] = useState(false);

  if (!worker || !site) {
    return <div className="p-4 text-center text-slate-400 mt-10">Aucune affectation trouvée.</div>;
  }

  const handleCheckIn = () => {
    setIsCheckedIn(!isCheckedIn);
  };

  return (
    <div className="max-w-md mx-auto bg-slate-900 min-h-[80vh] flex flex-col border border-slate-800 shadow-2xl sm:rounded-3xl overflow-hidden relative">

      {/* Mobile Header */}
      <div className="bg-slate-800 p-6 rounded-b-3xl shadow-md z-10 relative">
        <h1 className="text-2xl font-bold text-white mb-1">Bonjour, {worker.name.split(' ')[0]}</h1>
        <p className="text-slate-400 text-sm">Chantier d'aujourd'hui</p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col space-y-6">

        {/* Site Card */}
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-inner">
          <h2 className="text-xl font-bold text-blue-400 mb-2">{site.name}</h2>
          <div className="flex items-start text-slate-300 space-x-2 text-sm">
             <span className="text-slate-500 mt-0.5">📍</span>
             <span>{site.address}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center text-sm">
             <span className="text-slate-400">Chef: <span className="text-white font-medium">{site.managerName}</span></span>
          </div>
        </div>

        {/* Action Button (Pointage) */}
        <div className="flex-1 flex items-center justify-center py-8">
          <button
            onClick={handleCheckIn}
            className={`w-48 h-48 rounded-full flex flex-col items-center justify-center shadow-lg transition-all transform active:scale-95 ${
              isCheckedIn
                ? 'bg-emerald-500/20 border-4 border-emerald-500 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                : 'bg-slate-800 border-4 border-blue-500 text-blue-400 hover:bg-slate-700'
            }`}
          >
            <span className="text-4xl mb-2">{isCheckedIn ? '⏹' : '▶'}</span>
            <span className="font-bold text-xl">{isCheckedIn ? 'Finir' : 'Démarrer'}</span>
            <span className="text-xs opacity-75 mt-1">{isCheckedIn ? 'Arrêter le chrono' : 'Pointer mon arrivée'}</span>
          </button>
        </div>

        {/* Stats */}
        <div className="bg-slate-800 p-4 rounded-xl flex justify-between items-center text-center">
           <div>
             <p className="text-xs text-slate-400 uppercase tracking-wide">Heures sem.</p>
             <p className="text-xl font-bold text-white">{worker.hoursLoggedThisWeek}h</p>
           </div>
           <div className="w-px h-8 bg-slate-700"></div>
           <div>
             <p className="text-xs text-slate-400 uppercase tracking-wide">Statut</p>
             <p className={`text-lg font-bold ${isCheckedIn ? 'text-emerald-400' : 'text-slate-500'}`}>
               {isCheckedIn ? 'Sur site' : 'Repos'}
             </p>
           </div>
        </div>

      </div>

      {/* Emergency Footer */}
      <div className="p-4 bg-slate-950 mt-auto">
        <button className="w-full py-3 bg-red-900/40 text-red-400 font-bold rounded-xl border border-red-900/50 flex justify-center items-center space-x-2 active:bg-red-900/60 transition-colors shadow">
          <span>⚠️</span>
          <span>Urgence Chantier</span>
        </button>
      </div>

    </div>
  );
}
