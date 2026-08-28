import React, { useState } from 'react';
import { mockUsers } from '../mockData';

export default function LoginPage({ onLogin }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleManualLogin = (e) => {
    e.preventDefault();
    // Simulate finding user by email
    const user = mockUsers.find(u => u.email === identifier);
    if (user) {
      onLogin(user);
    } else {
      alert("Identifiant ou mot de passe incorrect.");
    }
  };

  const handleDemoLogin = (role) => {
    const user = mockUsers.find(u => u.role === role);
    if (user) {
      onLogin(user);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center items-center space-x-3 mb-8">
            <div className="bg-blue-600 text-white font-bold p-2 rounded-lg shadow-sm flex items-center justify-center h-10 w-10 text-xl">
              B
            </div>
            <span className="text-3xl font-bold text-white tracking-wider">
              BuildSync
            </span>
          </div>

          <h2 className="text-xl font-semibold text-slate-100 text-center mb-6">Connexion à votre espace</h2>

          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email ou Téléphone</label>
              <input
                type="text"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                placeholder="nom@entreprise.fr"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Mot de passe</label>
              <input
                type="password"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-slate-400 cursor-pointer">
                <input type="checkbox" className="mr-2 rounded border-slate-600 text-blue-600 focus:ring-blue-500 bg-slate-900" />
                Se souvenir de moi
              </label>
              <a href="#" className="text-blue-400 hover:text-blue-300">Mot de passe oublié ?</a>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow transition-colors mt-2"
            >
              Se Connecter
            </button>
          </form>
        </div>

        <div className="bg-slate-900 p-6 border-t border-slate-700">
          <p className="text-xs text-slate-400 text-center mb-4 uppercase tracking-wider font-semibold">Accès Rapide (Démo)</p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleDemoLogin('super_admin')} className="text-sm py-2 px-3 bg-slate-800 border border-slate-700 hover:border-blue-500 text-slate-300 hover:text-white rounded-lg transition-colors text-left flex flex-col">
              <span className="font-semibold text-blue-400">Super Admin</span>
              <span className="text-xs text-slate-500">Plateforme globale</span>
            </button>
            <button onClick={() => handleDemoLogin('company_admin')} className="text-sm py-2 px-3 bg-slate-800 border border-slate-700 hover:border-blue-500 text-slate-300 hover:text-white rounded-lg transition-colors text-left flex flex-col">
              <span className="font-semibold text-blue-400">Patron</span>
              <span className="text-xs text-slate-500">Admin Entreprise</span>
            </button>
            <button onClick={() => handleDemoLogin('site_manager')} className="text-sm py-2 px-3 bg-slate-800 border border-slate-700 hover:border-blue-500 text-slate-300 hover:text-white rounded-lg transition-colors text-left flex flex-col">
              <span className="font-semibold text-blue-400">Chef de Chantier</span>
              <span className="text-xs text-slate-500">Gestion terrain</span>
            </button>
            <button onClick={() => handleDemoLogin('worker')} className="text-sm py-2 px-3 bg-slate-800 border border-slate-700 hover:border-blue-500 text-slate-300 hover:text-white rounded-lg transition-colors text-left flex flex-col">
              <span className="font-semibold text-blue-400">Compagnon</span>
              <span className="text-xs text-slate-500">Vue Mobile ouvrier</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
