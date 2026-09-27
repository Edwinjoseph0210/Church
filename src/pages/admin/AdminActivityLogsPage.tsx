import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { AuditLog } from '../../types';
import { Activity, Search, ShieldAlert, Clock } from 'lucide-react';

export const AdminActivityLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await apiRequest<AuditLog[]>('/audit-logs');
        setLogs(data);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const filtered = logs.filter((log) => {
    if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.userName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
            Accountability & Compliance
          </span>
          <h1 className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
            Parish Activity & Audit Log
          </h1>
          <p className="text-xs text-stone-500 font-editorial">
            Chronological audit trail of all sensitive operations, logins, census updates, and sacramental register accesses.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by user, action, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-800"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Activity Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-editorial">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-500">
                    Loading audit trail records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-500">
                    No activity logs recorded.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-stone-500 whitespace-nowrap">
                      {log.timestamp.replace('T', ' ').slice(0, 19)}
                    </td>
                    <td className="py-3.5 px-4 font-sans font-semibold text-stone-900">
                      {log.userName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[10px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-800">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-500">
                      {log.resource}
                    </td>
                    <td className="py-3.5 px-4 text-stone-700">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
