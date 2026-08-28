import React, { useState, useEffect } from 'react';

export default function WorkerMobileView({ currentCompanyId, currentUser, sites, workers, setWorkers }) {
  const worker = workers.find(w => w.id === currentUser?.workerId) || workers.find(w => w.companyId === currentCompanyId && w.role === 'Compagnon') || workers.find(w => w.role === 'Compagnon');
  const site = worker ? sites.find(s => s.id === worker.siteAssigned) : null;

  const [shiftState, setShiftState] = useState('stopped'); // stopped, active, paused
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const [showEmergency, setShowEmergency] = useState(false);
  const [showMeals, setShowMeals] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showSafety, setShowSafety] = useState(false);
  const [showToast, setShowToast] = useState('');

  useEffect(() => {
    let interval = null;
    if (shiftState === 'active') {
      interval = setInterval(() => setSecondsElapsed(s => s + 1), 1000);
    } else if (shiftState === 'stopped') {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [shiftState]);

  if (!worker || !site) {
    return <div className="p-4 text-center text-slate-400 mt-10">Aucune affectation trouvée.</div>;
  }

  const handleStart = () => {
     setShiftState('active');
  };

  const handlePause = () => {
     setShiftState(shiftState === 'active' ? 'paused' : 'active');
  };

  const handleStop = () => {
     setShiftState('stopped');
     const totalHoursWorkedThisShift = secondsElapsed / 3600;
     const roundedHours = Math.round(totalHoursWorkedThisShift * 100) / 100;

     if (worker && roundedHours > 0) {
        setWorkers(workers.map(w => w.id === worker.id ? { ...w, hoursLoggedThisWeek: w.hoursLoggedThisWeek + roundedHours } : w));
     }

     const hours = Math.floor(secondsElapsed / 3600);
     const minutes = Math.floor((secondsElapsed % 3600) / 60);
     setShowToast(`Pointage terminé : ${hours}h ${minutes}m enregistrées.`);
     setTimeout(() => setShowToast(''), 4000);
     setSecondsElapsed(0);
  };

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleScanTool = () => {
     setShowToast("Outil Hilti TE 60 scanné et assigné à votre profil.");
     setShowScanner(false);
     setTimeout(() => setShowToast(''), 4000);
  };

  const paniers = Math.ceil(worker.hoursLoggedThisWeek / 7);

  return (
    <div className="max-w-md mx-auto bg-slate-900 min-h-[85vh] flex flex-col border border-slate-800 shadow-2xl sm:rounded-3xl overflow-hidden relative">

      {/* Toast */}
      {showToast && (
        <div className="absolute top-4 left-4 right-4 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl z-50 text-sm font-medium animate-pulse text-center">
          {showToast}
        </div>
      )}

      {/* Mobile Header */}
      <div className="bg-slate-800/90 p-6 rounded-b-3xl shadow-md z-10 relative">
        <h1 className="text-2xl font-bold text-white mb-1">Bonjour, {worker.name.split(' ')[0]}</h1>
        <p className="text-slate-400 text-sm">Chantier d'aujourd'hui</p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col space-y-6 overflow-y-auto">

        {/* Site Card */}
        <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700 shadow-inner">
          <h2 className="text-xl font-bold text-blue-400 mb-2">{site.name}</h2>
          <div className="flex items-start text-slate-300 space-x-2 text-sm">
             <span className="text-slate-500 mt-0.5">📍</span>
             <span>{site.address}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center text-sm">
             <span className="text-slate-400">Chef: <span className="text-white font-medium">{site.managerName}</span></span>
          </div>
        </div>

        {/* Action Button (Interactive Time Tracker Circle) */}
        <div className="flex flex-col items-center justify-center py-4 space-y-6">
          {shiftState === 'stopped' ? (
             <button
               onClick={handleStart}
               className="w-56 h-56 rounded-full flex flex-col items-center justify-center shadow-lg transition-transform transform active:scale-95 bg-blue-600 text-white border-4 border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.4)]"
             >
               <span className="text-5xl mb-2">▶</span>
               <span className="font-bold text-2xl">Pointer</span>
               <span className="font-bold text-2xl">mon arrivée</span>
             </button>
          ) : (
             <div className="flex flex-col items-center">
               <div className={`w-56 h-56 rounded-full flex flex-col items-center justify-center shadow-lg transition-colors border-4 ${shiftState === 'active' ? 'bg-emerald-900/40 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'bg-amber-900/40 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)]'}`}>
                  <span className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-1">
                     {shiftState === 'active' ? 'En cours' : 'En pause'}
                  </span>
                  <span className={`font-mono text-4xl font-bold ${shiftState === 'active' ? 'text-emerald-400' : 'text-amber-400'}`}>
                     {formatTime(secondsElapsed)}
                  </span>
               </div>
               <div className="flex space-x-4 mt-6">
                  <button onClick={handlePause} className="px-6 py-3 bg-slate-800 border border-slate-600 rounded-full font-bold text-slate-300 hover:bg-slate-700 transition-colors">
                     {shiftState === 'active' ? '⏸ Pause' : '▶ Reprendre'}
                  </button>
                  <button onClick={handleStop} className="px-6 py-3 bg-red-900/40 border border-red-800 rounded-full font-bold text-red-400 hover:bg-red-900/60 transition-colors">
                     ⏹ Terminer
                  </button>
               </div>
             </div>
          )}
        </div>

        {/* Field Utility Buttons */}
        <div className="grid grid-cols-2 gap-3">
           <button onClick={() => setShowMeals(true)} className="bg-slate-800/90 border border-slate-700 p-4 rounded-xl flex flex-col items-center text-center hover:bg-slate-700/80 transition-colors">
             <span className="text-2xl mb-1">🍽️</span>
             <span className="text-xs text-slate-300 font-medium">Indemnités / Repas</span>
           </button>
           <button onClick={() => setShowScanner(true)} className="bg-slate-800/90 border border-slate-700 p-4 rounded-xl flex flex-col items-center text-center hover:bg-slate-700/80 transition-colors">
             <span className="text-2xl mb-1">📱</span>
             <span className="text-xs text-slate-300 font-medium">Scanner un outil</span>
           </button>
           <button onClick={() => setShowSafety(true)} className="col-span-2 bg-slate-800/90 border border-slate-700 p-4 rounded-xl flex items-center justify-between hover:bg-slate-700/80 transition-colors">
             <div className="flex items-center space-x-3">
               <span className="text-2xl">👷</span>
               <span className="text-sm text-slate-300 font-medium">Consignes de sécurité (EPI)</span>
             </div>
             <span className="text-slate-500">›</span>
           </button>
        </div>

      </div>

      {/* Emergency Footer */}
      <div className="p-4 bg-slate-950 mt-auto">
        <button
          onClick={() => setShowEmergency(true)}
          className="w-full py-4 bg-red-600 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.5)] flex justify-center items-center space-x-2 active:scale-95 transition-transform"
        >
          <span className="text-xl">🚨</span>
          <span className="uppercase tracking-wide">Urgence Chantier</span>
        </button>
      </div>

      {/* Meals Modal */}
      {showMeals && (
         <div className="fixed inset-0 bg-slate-950/95 flex flex-col justify-end z-50 p-4 pb-12 animate-in slide-in-from-bottom-full">
           <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-2xl relative">
              <button onClick={() => setShowMeals(false)} className="absolute top-4 right-4 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-400">✕</button>
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Vos Indemnités</h2>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-4 text-center">
                 <p className="text-slate-400 text-sm">Paniers repas validés cette semaine</p>
                 <p className="text-4xl font-bold text-emerald-400 mt-2">{paniers}</p>
              </div>
              <p className="text-sm text-slate-400 text-center">Vos paniers sont automatiquement déclarés par votre Chef de chantier lors des pointages journaliers.</p>
           </div>
         </div>
      )}

      {/* Scanner Modal */}
      {showScanner && (
         <div className="fixed inset-0 bg-slate-950/95 flex flex-col justify-end z-50 p-4 pb-12 animate-in slide-in-from-bottom-full">
           <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-2xl relative flex flex-col items-center">
              <button onClick={() => setShowScanner(false)} className="absolute top-4 right-4 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-400">✕</button>
              <h2 className="text-2xl font-bold text-white mb-2 text-center">Scan QR Code</h2>
              <p className="text-slate-400 text-sm text-center mb-6">Scannez un outil pour l'emprunter au dépôt.</p>
              <div className="w-64 h-64 border-4 border-dashed border-blue-500 rounded-xl flex items-center justify-center bg-slate-800 mb-6 relative overflow-hidden">
                 <div className="absolute w-full h-1 bg-blue-400/50 shadow-[0_0_10px_#60a5fa] top-1/2 animate-[pulse_2s_ease-in-out_infinite]"></div>
                 <span className="text-slate-500 text-sm">Caméra...</span>
              </div>
              <button onClick={handleScanTool} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow">Simuler Scan Hilti</button>
           </div>
         </div>
      )}

      {/* Safety Drawer */}
      {showSafety && (
         <div className="fixed inset-0 bg-slate-950/95 flex flex-col justify-end z-50 p-4 pb-12 animate-in slide-in-from-bottom-full">
           <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-2xl relative">
              <button onClick={() => setShowSafety(false)} className="absolute top-4 right-4 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-400">✕</button>
              <h2 className="text-2xl font-bold text-white mb-4 text-center">Consignes (EPI)</h2>
              <ul className="space-y-3">
                 <li className="flex items-center space-x-3 bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <span className="text-3xl">🪖</span>
                    <span className="text-white font-medium">Casque de chantier obligatoire</span>
                 </li>
                 <li className="flex items-center space-x-3 bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <span className="text-3xl">🥾</span>
                    <span className="text-white font-medium">Chaussures de sécurité (S3)</span>
                 </li>
                 <li className="flex items-center space-x-3 bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <span className="text-3xl">🦺</span>
                    <span className="text-white font-medium">Baudrier haute visibilité</span>
                 </li>
              </ul>
           </div>
         </div>
      )}

      {/* Emergency Modal */}
      {showEmergency && (
        <div className="fixed inset-0 bg-slate-950/95 flex flex-col justify-end z-50 p-4 pb-12 animate-in slide-in-from-bottom-full">
           <div className="bg-slate-900 rounded-3xl border border-red-900/50 p-6 shadow-2xl relative">
              <button onClick={() => setShowEmergency(false)} className="absolute top-4 right-4 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-400">✕</button>
              <h2 className="text-2xl font-bold text-red-500 mb-6 text-center">Protocoles d'Urgence</h2>
              <div className="space-y-4">
                 <button className="w-full bg-slate-800 border border-slate-700 p-4 rounded-xl flex items-center justify-between active:bg-slate-700">
                    <div className="text-left">
                       <span className="block text-white font-bold">Appeler le 15 (SAMU)</span>
                       <span className="text-xs text-slate-400">Urgence vitale immédiate</span>
                    </div>
                    <span className="text-2xl">📞</span>
                 </button>
                 <button className="w-full bg-slate-800 border border-slate-700 p-4 rounded-xl flex items-center justify-between active:bg-slate-700">
                    <div className="text-left">
                       <span className="block text-white font-bold">Appeler Sauveteur (SST)</span>
                       <span className="text-xs text-slate-400">M. Dubois (Sur site)</span>
                    </div>
                    <span className="text-2xl">⛑️</span>
                 </button>
                 <button className="w-full bg-slate-800 border border-slate-700 p-4 rounded-xl flex items-center justify-between active:bg-slate-700">
                    <div className="text-left">
                       <span className="block text-white font-bold">Appeler Chef de Chantier</span>
                       <span className="text-xs text-slate-400">{site.managerName}</span>
                    </div>
                    <span className="text-2xl">👷</span>
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
