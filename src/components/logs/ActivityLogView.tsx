import React, { useState, useMemo } from 'react';
import { useCinema } from '../../context/CinemaContext';
import { History, Search, Shield, Filter, Lock, Laptop, Clock } from 'lucide-react';

export const ActivityLogView: React.FC = () => {
  const { activityLogs } = useCinema();

  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');

  const modules = useMemo(() => Array.from(new Set(activityLogs.map((l) => l.module))), [activityLogs]);
  const actions = useMemo(() => Array.from(new Set(activityLogs.map((l) => l.action))), [activityLogs]);

  const filteredLogs = useMemo(() => {
    return activityLogs.filter((log) => {
      const targetStr = (log.target || log.dataAffected || '').toLowerCase();
      const descStr = (log.description || log.action || '').toLowerCase();
      const userStr = (log.userName || log.user || '').toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchSearch = userStr.includes(q) || descStr.includes(q) || targetStr.includes(q);
      const matchModule = moduleFilter === 'ALL' || log.module === moduleFilter;
      const matchAction = actionFilter === 'ALL' || log.action === actionFilter;

      return matchSearch && matchModule && matchAction;
    });
  }, [activityLogs, searchTerm, moduleFilter, actionFilter]);

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'CREATE':
      case 'STOCK_IN':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'UPDATE':
      case 'STOCK_ADJUSTMENT':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'DELETE':
      case 'REJECT':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'APPROVE':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'STOCK_OUT':
        return 'bg-orange-500/15 text-orange-300 border-orange-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <span>Activity Log (Audit Trail)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Rekaman aktivitas sistem operasional bioskop tanpa celah manipulasi (Immutable Security Audit)
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-semibold">
          <Lock className="w-3.5 h-3.5" />
          <span>Audit Log Terkunci & Permanen</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari user, deskripsi aktivitas, atau target entitas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Semua Modul</option>
            {modules.map((m) => (
              <option key={m} value={m}>
                Modul {m}
              </option>
            ))}
          </select>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Semua Tipe Aksi</option>
            {actions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Waktu (Timestamp)</th>
                <th className="p-3.5">User & Role</th>
                <th className="p-3.5">Modul</th>
                <th className="p-3.5">Aksi</th>
                <th className="p-3.5">Deskripsi Aktivitas</th>
                <th className="p-3.5">Target Data</th>
                <th className="p-3.5">Perangkat / IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Tidak ada aktivitas yang sesuai pencarian
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850 transition-colors">
                    <td className="p-3.5 font-mono text-slate-400 text-[11px] whitespace-nowrap flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {log.timestamp}
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold text-slate-100">{log.userName || log.user}</p>
                      <span className="text-[10px] text-amber-400 font-semibold">{log.role}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                        {log.module}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-slate-200 max-w-xs">{log.description || log.action}</td>
                    <td className="p-3.5 font-mono text-slate-400 text-[11px]">{log.target || log.dataAffected}</td>
                    <td className="p-3.5 text-slate-400 text-[11px] font-mono">
                      <span className="flex items-center gap-1">
                        <Laptop className="w-3 h-3 text-slate-500" /> {log.ipAddress || '192.168.1.10'}
                      </span>
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
