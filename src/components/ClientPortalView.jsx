import React, { useState } from 'react';

export default function ClientPortalView({ currentUser, sites, quotes, setQuotes, gedFolders, addNotification }) {
  const activeSite = sites.find(s => s.id === currentUser?.siteId);
  const siteQuotes = quotes.filter(q => q.siteId === activeSite?.id);
  const siteFolders = gedFolders.filter(f => f.siteId === activeSite?.id);

  const [activeTab, setActiveTab] = useState('timeline');
  const [toastMessage, setToastMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signingQuoteId, setSigningQuoteId] = useState(null);

  if (!activeSite) {
    return <div className="p-4 text-center text-slate-400 mt-10">Aucun projet associé trouvé pour ce compte client.</div>;
  }

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 5000);
  };

  const handleSimulatePayment = (quoteId) => {
    setIsProcessing(true);
    showToast("Traitement sécurisé en cours via Stripe...");
    setTimeout(() => {
      setQuotes(quotes.map(q => q.id === quoteId ? { ...q, paymentStatus: 'Payé' } : q));
      addNotification("Paiement Stripe reçu", `Le client ${currentUser.name} a réglé la situation ${quoteId}.`, "company_admin");
      setIsProcessing(false);
      showToast("Paiement validé avec succès. Merci de votre confiance !");
    }, 2000);
  };

  const handleSignQuote = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setQuotes(quotes.map(q => q.id === signingQuoteId ? { ...q, paymentStatus: 'Signé / Validé' } : q));
      addNotification("Devis signé électroniquement", `Le client ${currentUser.name} a signé le devis ${signingQuoteId}.`, "company_admin");
      setIsProcessing(false);
      setShowSignatureModal(false);
      setSigningQuoteId(null);
      showToast("Devis signé avec succès !");
    }, 1500);
  };

  const tabs = [
    { id: 'timeline', label: "Suivi de Chantier" },
    { id: 'ged', label: "Documents & GED" },
    { id: 'billing', label: "Factures & Paiements" }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center space-x-2 animate-bounce">
          <span>✓</span>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Premium Header */}
      <div className="bg-slate-800/80 p-8 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <h1 className="text-3xl font-bold text-white mb-2 relative z-10">Espace Client : {activeSite.name}</h1>
        <p className="text-slate-400 text-sm flex items-center relative z-10 mb-6">
           <span className="mr-2 text-blue-400">📍</span> {activeSite.address}
        </p>

        <div className="relative z-10">
           <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Avancement du Projet</span>
              <span className="text-2xl font-bold text-blue-400">{activeSite.progress}%</span>
           </div>
           <div className="w-full bg-slate-900 rounded-full h-3 shadow-inner">
             <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-3 rounded-full transition-all duration-1000" style={{ width: `${activeSite.progress}%` }}></div>
           </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-2 border-b border-slate-700 overflow-x-auto pb-px">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-bold whitespace-nowrap transition-colors border-b-2 rounded-t-lg ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-400 bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700 shadow p-6 lg:p-10">
           <h2 className="text-xl font-bold text-white mb-8 border-b border-slate-700 pb-4">Dernières actualités de votre chantier</h2>
           <div className="relative border-l-2 border-slate-700 ml-4 space-y-10 pb-4">

              <div className="relative pl-8">
                 <div className="absolute w-4 h-4 bg-blue-500 rounded-full -left-[9px] top-1 shadow-[0_0_10px_rgba(59,130,246,0.8)] border-2 border-slate-900"></div>
                 <p className="text-xs text-blue-400 font-bold mb-1 uppercase tracking-wider">Cette semaine</p>
                 <h3 className="text-lg font-bold text-white mb-2">Pose des menuiseries extérieures</h3>
                 <p className="text-slate-400 text-sm mb-4">L'équipe a débuté la pose des fenêtres au deuxième étage. L'étanchéité est en cours de validation.</p>
                 <div className="w-full h-48 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-center text-slate-600">
                    <span className="text-3xl mr-2">📸</span> <span className="text-sm font-medium">Photo_Menuiseries.jpg</span>
                 </div>
              </div>

              <div className="relative pl-8">
                 <div className="absolute w-4 h-4 bg-slate-600 rounded-full -left-[9px] top-1 border-2 border-slate-900"></div>
                 <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">Il y a 2 semaines</p>
                 <h3 className="text-lg font-bold text-white mb-2">Coulage de la dalle R+1</h3>
                 <p className="text-slate-400 text-sm mb-4">Le coulage s'est déroulé avec succès. Temps de séchage respecté selon les normes DTU.</p>
                 <div className="w-full h-48 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-center text-slate-600">
                    <span className="text-3xl mr-2">📸</span> <span className="text-sm font-medium">Photo_Dalle.jpg</span>
                 </div>
              </div>

              <div className="relative pl-8">
                 <div className="absolute w-4 h-4 bg-slate-600 rounded-full -left-[9px] top-1 border-2 border-slate-900"></div>
                 <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">Il y a 1 mois</p>
                 <h3 className="text-lg font-bold text-white mb-2">Ouverture du chantier</h3>
                 <p className="text-slate-400 text-sm">Installation de la base vie et préparation du terrain.</p>
              </div>

           </div>
        </div>
      )}

      {/* TAB 2: GED */}
      {activeTab === 'ged' && (
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700 shadow p-6 lg:p-10">
           <h2 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-4">Vos Documents Officiels</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {siteFolders.map(folder => (
                 <div key={folder.id} className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-500 transition-colors">
                    <div className="bg-slate-800 p-4 text-slate-200 font-bold flex items-center border-b border-slate-700">
                       <span className="text-2xl mr-3">📁</span> {folder.name}
                    </div>
                    <ul className="p-2">
                       {folder.files.map((file, idx) => (
                          <li key={idx} className="flex justify-between items-center p-3 hover:bg-slate-800 rounded-lg transition-colors">
                             <span className="text-slate-400 text-sm flex items-center"><span className="mr-2">📄</span> {file}</span>
                             <button className="text-blue-400 hover:text-blue-300 text-sm font-semibold border border-blue-900/50 bg-blue-900/20 px-3 py-1 rounded">Consulter</button>
                          </li>
                       ))}
                       {folder.files.length === 0 && (
                          <li className="text-sm p-4 text-slate-500 text-center italic">Dossier vide.</li>
                       )}
                    </ul>
                 </div>
              ))}
              {siteFolders.length === 0 && (
                 <div className="col-span-full p-8 text-center text-slate-500 bg-slate-900 rounded-xl border border-slate-700">
                    Aucun document partagé pour le moment.
                 </div>
              )}
           </div>
        </div>
      )}

      {/* TAB 3: BILLING / PAYMENTS */}
      {activeTab === 'billing' && (
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700 shadow overflow-hidden">
           <div className="p-6 lg:p-8 border-b border-slate-700 bg-slate-900/30">
              <h2 className="text-xl font-bold text-white mb-2">Factures & Paiements</h2>
              <p className="text-slate-400 text-sm">Gérez et réglez vos appels de fonds en toute sécurité (Stripe).</p>
           </div>
           <div className="p-6 lg:p-8 space-y-6">
              {siteQuotes.map(quote => {
                 const acompte = quote.amount * 0.3;
                 const reste = quote.amount - acompte;
                 return (
                 <div key={quote.id} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-inner relative overflow-hidden flex flex-col md:flex-row justify-between items-center">
                    {quote.paymentStatus === 'Payé' && (
                       <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    )}

                    <div className="flex-1 w-full relative z-10 mb-6 md:mb-0">
                       <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-white">Appel de fonds ({quote.progressBilling}%)</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${quote.paymentStatus === 'Payé' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' : 'bg-amber-900/30 text-amber-400 border-amber-800'}`}>
                             {quote.paymentStatus}
                          </span>
                       </div>
                       <p className="text-slate-400 text-sm mb-4">Réf : <span className="font-mono text-slate-500">{quote.id}</span></p>

                       <div className="grid grid-cols-2 gap-4 max-w-sm">
                          <div>
                             <p className="text-xs text-slate-500 uppercase tracking-wider">Acompte (30%)</p>
                             <p className="text-lg font-mono text-slate-300">{acompte.toLocaleString()} €</p>
                          </div>
                          <div>
                             <p className="text-xs text-slate-500 uppercase tracking-wider">Reste à Payer</p>
                             <p className="text-lg font-mono font-bold text-white">{reste.toLocaleString()} €</p>
                          </div>
                       </div>
                    </div>

                    <div className="w-full md:w-auto relative z-10 flex flex-col space-y-3">
                       <div className="text-right mb-2">
                          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Montant Total TTC</p>
                          <p className="text-3xl font-bold text-blue-400 font-mono">{quote.amount.toLocaleString()} €</p>
                       </div>

                       {quote.paymentStatus === 'En attente' ? (
                          <button
                             onClick={() => { setSigningQuoteId(quote.id); setShowSignatureModal(true); }}
                             disabled={isProcessing}
                             className={`w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center ${isProcessing ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-500 hover:shadow-blue-500/20'}`}
                          >
                             <span className="text-xl mr-2">✍️</span> {isProcessing ? 'Traitement...' : 'Signer le devis électroniquement'}
                          </button>
                       ) : quote.paymentStatus !== 'Payé' && quote.paymentStatus !== 'Signé / Validé' ? (
                          <button
                             onClick={() => handleSimulatePayment(quote.id)}
                             disabled={isProcessing}
                             className={`w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center ${isProcessing ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-500 hover:shadow-blue-500/20'}`}
                          >
                             <span className="text-xl mr-2">💳</span> {isProcessing ? 'Traitement...' : 'Payer en ligne sécurisé'}
                          </button>
                       ) : quote.paymentStatus === 'Signé / Validé' ? (
                          <button className="w-full bg-slate-800 text-emerald-400 border border-emerald-900 font-bold py-3 px-6 rounded-xl flex items-center justify-center cursor-default">
                             <span className="text-xl mr-2">✓</span> Devis Signé
                          </button>
                       ) : (
                          <button className="w-full bg-slate-800 text-emerald-400 border border-emerald-900 font-bold py-3 px-6 rounded-xl flex items-center justify-center cursor-default">
                             <span className="text-xl mr-2">✓</span> Payé intégralement
                          </button>
                       )}
                       <button className="w-full text-slate-400 hover:text-white text-sm mt-2 transition-colors flex items-center justify-center">
                          <span className="mr-2">📄</span> Télécharger la facture PDF
                       </button>
                    </div>
                 </div>
              )})}
              {siteQuotes.length === 0 && (
                 <div className="p-8 text-center text-slate-500 bg-slate-900 rounded-xl border border-slate-700">
                    Aucune facture associée à ce chantier pour le moment.
                 </div>
              )}
           </div>
        </div>
      )}

      {showSignatureModal && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-4" onClick={() => setShowSignatureModal(false)}>
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900">
              <h3 className="text-lg font-bold text-white">Signature électronique</h3>
              <button onClick={() => setShowSignatureModal(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>
            <form onSubmit={handleSignQuote} className="p-5 space-y-4">
              <div>
                <p className="text-sm text-slate-300 mb-2">Veuillez signer ci-dessous pour valider le devis.</p>
                <div className="w-full h-40 bg-slate-100 rounded-lg border-2 border-dashed border-slate-400 flex items-center justify-center cursor-crosshair">
                  <span className="text-slate-400 font-medium italic">Zone de signature (Canvas)</span>
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowSignatureModal(false)} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">Annuler</button>
                <button type="submit" disabled={isProcessing} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 shadow transition-colors flex items-center">
                  {isProcessing ? 'Validation...' : 'Confirmer et Signer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
