import React, { useState, useEffect } from 'react';

export default function WorkerMobileView({ currentCompanyId, currentUser, sites, workers, setWorkers, leaveRequests, setLeaveRequests, addNotification }) {
  const worker = workers.find(w => w.id === currentUser?.workerId) || workers.find(w => w.companyId === currentCompanyId && w.role === 'Compagnon') || workers.find(w => w.role === 'Compagnon');
  const site = worker ? sites.find(s => s.id === worker.siteAssigned) : null;

  const [shiftState, setShiftState] = useState('stopped'); // stopped, active, paused
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const [showEmergency, setShowEmergency] = useState(false);
  const [showMeals, setShowMeals] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showSafety, setShowSafety] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const [toastMessage, setToastMessage] = useState('');

  // Anti-fraud GPS Simulation
  const [gpsStatus, setGpsStatus] = useState('invalid'); // checking, valid, invalid

  const [newLeave, setNewLeave] = useState({ startDate: '', endDate: '', type: 'Congés Payés' });

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

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleStartCheck = () => {
    setGpsStatus('checking');
    setTimeout(() => {
      // For demonstration, it just switches to valid automatically after checking unless toggled manually.
      // In reality, this would query navigator.geolocation and verify distance to site.lat/lng.
      setGpsStatus('valid');
    }, 2000);
  };

  const handleStart = () => {
     if (gpsStatus === 'valid') {
       setShiftState('active');
     }
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
     showToast(`Pointage terminé : ${hours}h ${minutes}m enregistrées.`);
     setSecondsElapsed(0);
     setGpsStatus('invalid'); // reset for next shift
  };

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleScanTool = () => {
     showToast("Outil Hilti TE 60 scanné et assigné à votre profil.");
     setShowScanner(false);
  };

  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    setLeaveRequests([...leaveRequests, {
      id: `lr_${Date.now()}`,
      workerId: worker.id,
      companyId: currentCompanyId,
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      type: newLeave.type,
      status: 'En attente'
    }]);
    addNotification("Nouvelle demande de congé", `${worker.name} a déposé une demande de congé.`, "company_admin");
    setShowLeaveModal(false);
    setNewLeave({ startDate: '', endDate: '', type: 'Congés Payés' });
    showToast("Demande d'absence envoyée à votre direction.");
  };

  const paniers = Math.ceil(worker.hoursLoggedThisWeek / 7);

  return (
    <div className="max-w-md mx-auto bg-slate-900 min-h-[85vh] flex flex-col border border-slate-800 shadow-2xl sm:rounded-3xl overflow-hidden relative">

      {/* Dev Toggle for GPS Demo */}
      <button
        onClick={() => setGpsStatus(gpsStatus === 'valid' ? 'invalid' : 'valid')}
        className="absolute top-2 right-2 z-50 text-[10px] bg-slate-800 text-slate-500 px-2 rounded hover:bg-slate-700"
      >
        [Dev] GPS: {gpsStatus}
      </button>

      {/* Toast */}
      {toastMessage && (
        <div className="absolute top-8 left-4 right-4 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl z-50 text-sm font-medium animate-pulse text-center">
          {toastMessage}
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

        {/* Action Button (Interactive Time Tracker Circle) with Geofencing */}
        <div className="flex flex-col items-center justify-center py-2 space-y-4">

          {shiftState === 'stopped' && (
             <div className="text-center w-full mb-2">
                {gpsStatus === 'invalid' && (
                  <div className="bg-rose-900/30 border border-rose-800 text-rose-400 text-xs py-2 px-3 rounded-lg mx-auto w-fit">
                    📍 Vous êtes à 4.2km du chantier. Pointage bloqué.
                  </div>
                )}
                {gpsStatus === 'checking' && (
                  <div className="text-blue-400 text-xs py-2 animate-pulse font-bold">
                    Acquisition GPS en cours...
                  </div>
                )}
                {gpsStatus === 'valid' && (
                  <div className="bg-emerald-900/30 border border-emerald-800 text-emerald-400 text-xs py-2 px-3 rounded-lg mx-auto w-fit font-bold shadow-sm">
                    📍 À 15m du chantier (Position validée)
                  </div>
                )}
             </div>
          )}

          {shiftState === 'stopped' ? (
             <button
               onClick={gpsStatus === 'valid' ? handleStart : handleStartCheck}
               disabled={gpsStatus === 'checking'}
               className={`w-56 h-56 rounded-full flex flex-col items-center justify-center shadow-lg transition-transform transform active:scale-95 border-4
                 ${gpsStatus === 'valid'
                   ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.4)]'
                   : 'bg-slate-800 text-slate-500 border-slate-700'
                 }
               `}
             >
               <span className="text-5xl mb-2">{gpsStatus === 'valid' ? '▶' : '📍'}</span>
               <span className="font-bold text-2xl">Pointer</span>
               <span className="font-bold text-xl opacity-80">{gpsStatus === 'valid' ? 'mon arrivée' : 'vérifier position'}</span>
             </button>
          ) : (
             <div className="flex flex-col items-center w-full">
               <div className={`w-56 h-56 rounded-full flex flex-col items-center justify-center shadow-lg transition-colors border-4 ${shiftState === 'active' ? 'bg-emerald-900/40 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'bg-amber-900/40 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)]'}`}>
                  <span className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-1">
                     {shiftState === 'active' ? 'En cours' : 'En pause'}
                  </span>
                  <span className={`font-mono text-4xl font-bold ${shiftState === 'active' ? 'text-emerald-400' : 'text-amber-400'}`}>
                     {formatTime(secondsElapsed)}
                  </span>
               </div>
               <div className="flex space-x-3 mt-6 w-full px-2">
                  <button onClick={handlePause} className="flex-1 py-3 bg-slate-800 border border-slate-600 rounded-full font-bold text-slate-300 hover:bg-slate-700 transition-colors text-sm">
                     {shiftState === 'active' ? '⏸ Pause' : '▶ Reprendre'}
                  </button>
                  <button onClick={handleStop} className="flex-1 py-3 bg-rose-900/40 border border-rose-800 rounded-full font-bold text-rose-400 hover:bg-rose-900/60 transition-colors shadow-sm text-sm">
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
           <button onClick={() => setShowLeaveModal(true)} className="bg-slate-800/90 border border-slate-700 p-4 rounded-xl flex flex-col items-center text-center hover:bg-slate-700/80 transition-colors">
             <span className="text-2xl mb-1">🏖️</span>
             <span className="text-xs text-slate-300 font-medium">Congés & Absences</span>
           </button>
           <button onClick={() => setShowSafety(true)} className="bg-slate-800/90 border border-slate-700 p-4 rounded-xl flex flex-col items-center text-center hover:bg-slate-700/80 transition-colors">
             <span className="text-2xl mb-1">👷</span>
             <span className="text-xs text-slate-300 font-medium">Consignes EPI</span>
           </button>
        </div>

      </div>

      {/* Emergency Footer */}
      <div className="p-4 bg-slate-950 mt-auto border-t border-slate-900">
        <button
          onClick={() => setShowEmergency(true)}
          className="w-full py-4 bg-rose-600 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(225,29,72,0.5)] flex justify-center items-center space-x-2 active:scale-95 transition-transform"
        >
          <span className="text-xl">🚨</span>
          <span className="uppercase tracking-wide">Urgence Chantier</span>
        </button>
      </div>

      {/* Leaves Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-slate-950/95 flex flex-col justify-end z-50 p-4 pb-12 animate-in slide-in-from-bottom-full" onClick={() => setShowLeaveModal(false)}>
           <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                 <h2 className="text-xl font-bold text-white">Demander une absence</h2>
                 <button onClick={() => setShowLeaveModal(false)} className="text-slate-400 hover:text-white text-xl bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
              </div>
              <form onSubmit={handleLeaveSubmit} className="p-5 space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Motif</label>
                    <select required className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={newLeave.type} onChange={e => setNewLeave({...newLeave, type: e.target.value})}>
                       <option value="Congés Payés">Congés Payés (CP)</option>
                       <option value="Maladie">Maladie</option>
                       <option value="Intempérie">Intempérie</option>
                       <option value="Autre">Autre (sans solde)</option>
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                       <label className="block text-sm font-medium text-slate-400 mb-1">Du</label>
                       <input required type="date" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={newLeave.startDate} onChange={e => setNewLeave({...newLeave, startDate: e.target.value})} />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-slate-400 mb-1">Au</label>
                       <input required type="date" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={newLeave.endDate} onChange={e => setNewLeave({...newLeave, endDate: e.target.value})} />
                    </div>
                 </div>
                 <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow mt-2 transition-colors active:bg-blue-700">Soumettre la demande</button>
              </form>
           </div>
        </div>
      )}

      {/* Meals Modal */}
      {showMeals && (
         <div className="fixed inset-0 bg-slate-950/95 flex flex-col justify-end z-50 p-4 pb-12 animate-in slide-in-from-bottom-full" onClick={() => setShowMeals(false)}>
           <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
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
         <div className="fixed inset-0 bg-slate-950/95 flex flex-col justify-end z-50 p-4 pb-12 animate-in slide-in-from-bottom-full" onClick={() => setShowScanner(false)}>
           <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-2xl relative flex flex-col items-center" onClick={e => e.stopPropagation()}>
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
         <div className="fixed inset-0 bg-slate-950/95 flex flex-col justify-end z-50 p-4 pb-12 animate-in slide-in-from-bottom-full" onClick={() => setShowSafety(false)}>
           <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
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
        <div className="fixed inset-0 bg-slate-950/95 flex flex-col justify-end z-50 p-4 pb-12 animate-in slide-in-from-bottom-full" onClick={() => setShowEmergency(false)}>
           <div className="bg-slate-900 rounded-3xl border border-rose-900/50 p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowEmergency(false)} className="absolute top-4 right-4 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-400">✕</button>
              <h2 className="text-2xl font-bold text-rose-500 mb-6 text-center">Protocoles d'Urgence</h2>
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
