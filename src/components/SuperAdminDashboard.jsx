import React, { useState } from 'react';
import { mockCompanies, mockStats, mockAuditLogs } from '../mockData';

export default function SuperAdminDashboard({ setCurrentRole, setCurrentCompanyId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);

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

  const handleImpersonate = (companyId) => {
    setCurrentCompanyId(companyId);
    setCurrentRole('company_admin');
  };

  const handleAddCompany = (e) => {
    e.preventDefault();
    alert(`Company ${newCompany.name} created (Mock)!`);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-zinc-100">Super Admin Hub</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-zinc-900 font-bold py-2 px-4 rounded shadow transition-colors"
        >
          + Adhérer une Entreprise
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700 shadow">
          <h3 className="text-zinc-400 text-sm font-semibold uppercase tracking-wider">MRR</h3>
          <p className="text-3xl font-bold text-white mt-1">{mockStats.mrr} €</p>
        </div>
        <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700 shadow">
          <h3 className="text-zinc-400 text-sm font-semibold uppercase tracking-wider">Active Tenants</h3>
          <p className="text-3xl font-bold text-white mt-1">{mockStats.activeTenants}</p>
        </div>
        <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700 shadow">
          <h3 className="text-zinc-400 text-sm font-semibold uppercase tracking-wider">Total Sites</h3>
          <p className="text-3xl font-bold text-white mt-1">{mockStats.totalActiveSites}</p>
        </div>
        <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700 shadow">
          <h3 className="text-zinc-400 text-sm font-semibold uppercase tracking-wider">System Health</h3>
          <p className="text-3xl font-bold text-emerald-400 mt-1">{mockStats.systemHealth}%</p>
        </div>
      </div>

      {/* Company Management */}
      <div className="bg-zinc-800 rounded-lg border border-zinc-700 shadow overflow-hidden">
        <div className="p-4 border-b border-zinc-700 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
          <h2 className="text-lg font-bold text-white">Tenants (BTP Firms)</h2>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search Name or SIREN..."
              className="bg-zinc-900 text-zinc-200 border border-zinc-700 rounded px-3 py-1.5 focus:border-amber-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="bg-zinc-900 text-zinc-200 border border-zinc-700 rounded px-3 py-1.5 focus:border-amber-500 outline-none"
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
          <table className="w-full text-left text-zinc-300">
            <thead className="bg-zinc-900 text-zinc-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">SIREN</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">MRR</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {filteredCompanies.map(company => (
                <tr key={company.id} className="hover:bg-zinc-700/50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">{company.name}</div>
                    <div className="text-xs text-zinc-500">{company.contactEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">{company.siren}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="bg-zinc-700 px-2 py-1 rounded text-xs">{company.planType}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${company.status === 'Active' ? 'bg-emerald-900 text-emerald-300' : 'bg-red-900 text-red-300'}`}>
                      {company.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{company.monthlyFee} €</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleImpersonate(company.id)}
                      className="text-amber-500 hover:text-amber-400 text-sm font-medium"
                    >
                      Impersonate Admin
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCompanies.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-zinc-500">No companies found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-zinc-800 rounded-lg border border-zinc-700 shadow p-4">
        <h2 className="text-lg font-bold text-white mb-4">System Audit Logs</h2>
        <div className="space-y-2">
          {mockAuditLogs.map(log => (
            <div key={log.id} className="flex flex-col sm:flex-row sm:items-center text-sm p-2 bg-zinc-900 rounded border border-zinc-800">
              <span className="text-zinc-500 w-40 shrink-0">{new Date(log.timestamp).toLocaleString()}</span>
              <span className={`w-20 shrink-0 font-bold ${log.level === 'ERROR' ? 'text-red-400' : log.level === 'WARNING' ? 'text-amber-400' : 'text-blue-400'}`}>
                [{log.level}]
              </span>
              <span className="text-zinc-300 flex-grow"><span className="text-zinc-100 font-semibold">{log.actor}</span> ({log.company}) : {log.action}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal - Adhérer Entreprise */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-lg shadow-xl border border-zinc-700 w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-zinc-700 flex justify-between items-center bg-zinc-900">
              <h3 className="text-lg font-bold text-white">Adhérer une Entreprise</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddCompany} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Nom de l'entreprise</label>
                <input required type="text" className="w-full bg-zinc-900 border border-zinc-600 rounded p-2 text-white focus:border-amber-500 outline-none" value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">SIREN / SIRET</label>
                <input required type="text" className="w-full bg-zinc-900 border border-zinc-600 rounded p-2 text-white focus:border-amber-500 outline-none" value={newCompany.siren} onChange={e => setNewCompany({...newCompany, siren: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Contact Admin (Email)</label>
                <input required type="email" className="w-full bg-zinc-900 border border-zinc-600 rounded p-2 text-white focus:border-amber-500 outline-none" value={newCompany.contactEmail} onChange={e => setNewCompany({...newCompany, contactEmail: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Plan</label>
                <select className="w-full bg-zinc-900 border border-zinc-600 rounded p-2 text-white focus:border-amber-500 outline-none" value={newCompany.planType} onChange={e => setNewCompany({...newCompany, planType: e.target.value})}>
                  <option value="Starter">Starter (max 5 users)</option>
                  <option value="Pro">Pro (max 20 users)</option>
                  <option value="Enterprise">Enterprise (unlimited)</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end space-x-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded text-zinc-300 hover:bg-zinc-700 transition">Annuler</button>
                <button type="submit" className="px-4 py-2 rounded bg-amber-500 text-zinc-900 font-bold hover:bg-amber-600 transition">Créer le Tenant</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
