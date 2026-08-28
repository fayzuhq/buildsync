import React, { useState } from 'react';
import { mockCompanies, mockStats, mockAuditLogs } from '../mockData';

export default function SuperAdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [logCompanyFilter, setLogCompanyFilter] = useState('All');

  // Form state for new company
  const [newCompany, setNewCompany] = useState({
    name: '',
    siren: '',
    contactEmail: '',
    planType: 'Starter',
  });

  const filteredCompanies = mockCompanies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.siren.includes(searchTerm);
    const matchesPlan = planFilter === 'All' || c.planType === planFilter;
    return matchesSearch && matchesPlan;
  });

  const filteredLogs = mockAuditLogs.filter(log => {
     return logCompanyFilter === 'All' || log.companyId === logCompanyFilter;
  });

  const handleAddCompany = (e) => {
    e.preventDefault();
    alert(`Company ${newCompany.name} created (Mock)!`);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-100">Super Admin Hub</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow transition-colors"
        >
          + Adhérer une Entreprise
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow">
          <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">MRR</h3>
          <p className="text-3xl font-bold text-white mt-1">{mockStats.mrr} €</p>
        </div>
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow">
          <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Active Tenants</h3>
          <p className="text-3xl font-bold text-white mt-1">{mockStats.activeTenants}</p>
        </div>
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow">
          <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Total Sites</h3>
          <p className="text-3xl font-bold text-white mt-1">{mockStats.totalActiveSites}</p>
        </div>
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow">
          <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">System Health</h3>
          <p className="text-3xl font-bold text-emerald-400 mt-1">{mockStats.systemHealth}%</p>
        </div>
      </div>

      {/* Company Management */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow overflow-hidden">
        <div className="p-5 border-b border-slate-700 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0 bg-slate-900/50">
          <h2 className="text-lg font-bold text-white">Tenants (BTP Firms)</h2>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search Name or SIREN..."
              className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
            >
              <option value="All">All Plans</option>
              <option value="Starter">Starter</option>
              <option value="Pro">Pro</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-5 py-3">Company</th>
                <th className="px-5 py-3">SIREN</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">MRR</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredCompanies.map(company => (
                <tr key={company.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-white">{company.name}</div>
                    <div className="text-xs text-slate-500">{company.contactEmail}</div>
                  </td>
                  <td className="px-5 py-4 text-sm">{company.siren}</td>
                  <td className="px-5 py-4 text-sm">
                    <span className="bg-slate-700 px-2 py-1 rounded text-xs text-slate-200 border border-slate-600">{company.planType}</span>
                  </td>
                  <td className="px-5 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${company.status === 'Active' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800' : 'bg-red-900/50 text-red-400 border border-red-800'}`}>
                      {company.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-medium">{company.monthlyFee} €</td>
                  <td className="px-5 py-4 text-right">
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                      Gérer
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCompanies.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-500">No companies found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow overflow-hidden">
        <div className="p-5 border-b border-slate-700 bg-slate-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
          <h2 className="text-lg font-bold text-white">System Audit Logs</h2>
          <select
            className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
            value={logCompanyFilter}
            onChange={(e) => setLogCompanyFilter(e.target.value)}
          >
            <option value="All">Toutes les entreprises</option>
            <option value="system">Système global</option>
            {mockCompanies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="p-5 space-y-3">
          {filteredLogs.map(log => (
            <div key={log.id} className="flex flex-col sm:flex-row sm:items-center text-sm p-3 bg-slate-900 rounded-lg border border-slate-700/50">
              <span className="text-slate-500 w-40 shrink-0 text-xs">{new Date(log.timestamp).toLocaleString()}</span>
              <span className={`w-20 shrink-0 font-bold text-xs ${log.level === 'ERROR' ? 'text-red-400' : log.level === 'WARNING' ? 'text-amber-400' : 'text-blue-400'}`}>
                [{log.level}]
              </span>
              <span className="text-slate-300 flex-grow"><span className="text-slate-100 font-semibold">{log.actor}</span> <span className="text-slate-500">({log.companyName})</span> : {log.action}</span>
            </div>
          ))}
          {filteredLogs.length === 0 && (
             <p className="text-slate-500 text-center py-4">Aucun log pour cette sélection.</p>
          )}
        </div>
      </div>

      {/* Modal - Adhérer Entreprise */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900">
              <h3 className="text-lg font-bold text-white">Adhérer une Entreprise</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">✕</button>
            </div>
            <form onSubmit={handleAddCompany} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nom de l'entreprise</label>
                <input required type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">SIREN / SIRET</label>
                <input required type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" value={newCompany.siren} onChange={e => setNewCompany({...newCompany, siren: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Contact Admin (Email)</label>
                <input required type="email" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" value={newCompany.contactEmail} onChange={e => setNewCompany({...newCompany, contactEmail: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Plan</label>
                <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" value={newCompany.planType} onChange={e => setNewCompany({...newCompany, planType: e.target.value})}>
                  <option value="Starter">Starter (max 5 users)</option>
                  <option value="Pro">Pro (max 20 users)</option>
                  <option value="Enterprise">Enterprise (unlimited)</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">Annuler</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors shadow">Créer le Tenant</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
