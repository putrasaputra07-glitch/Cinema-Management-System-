import React, { useState, useEffect } from 'react';
import { useCinema } from '../../context/CinemaContext';
import { CalendarOff, CalendarCheck2, Stethoscope, Clock, ShieldCheck, FileCheck } from 'lucide-react';
import { OffDayView } from './OffDayView';
import { LeaveView } from './LeaveView';
import { SickLeaveView } from './SickLeaveView';

type RequestSubTab = 'off-day' | 'leave' | 'sick-leave';

export const RequestsHubView: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    offDayRequests,
    leaveRequests,
    sickLeaveRequests,
    currentUser,
  } = useCinema();

  const isSupervisorOrManager = currentUser.role === 'ADMIN' || currentUser.role === 'SUPERVISOR';

  // Determine initial subtab based on currentTab
  const getInitialSubTab = (): RequestSubTab => {
    if (currentTab === 'leave') return 'leave';
    if (currentTab === 'sick-leave') return 'sick-leave';
    return 'off-day';
  };

  const [activeSubTab, setActiveSubTab] = useState<RequestSubTab>(getInitialSubTab);

  // Sync when currentTab externally changes (e.g. from notifications or quick actions)
  useEffect(() => {
    if (currentTab === 'leave' && activeSubTab !== 'leave') {
      setActiveSubTab('leave');
    } else if (currentTab === 'sick-leave' && activeSubTab !== 'sick-leave') {
      setActiveSubTab('sick-leave');
    } else if (currentTab === 'off-day' && activeSubTab !== 'off-day') {
      setActiveSubTab('off-day');
    }
  }, [currentTab]);

  const handleSubTabChange = (tab: RequestSubTab) => {
    setActiveSubTab(tab);
    setCurrentTab(tab);
  };

  // Pending counts
  const pendingOffDay = offDayRequests.filter((r) => r.status === 'PENDING').length;
  const pendingLeave = leaveRequests.filter((r) => r.status === 'PENDING').length;
  const pendingSick = sickLeaveRequests.filter((r) => r.status === 'PENDING').length;
  const totalPending = pendingOffDay + pendingLeave + pendingSick;

  return (
    <div className="space-y-6 pb-12">
      {/* Unified Hub Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Manajemen Izin & Cuti Karyawan</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Pusat terpadu pengajuan libur dinas (Off Day), cuti tahunan/khusus, dan izin sakit resmi
              </p>
            </div>
          </div>
        </div>

        {isSupervisorOrManager && totalPending > 0 && (
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold flex items-center gap-2 self-start sm:self-auto">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>
              Total <strong className="text-white font-bold">{totalPending}</strong> permohonan butuh persetujuan
            </span>
          </div>
        )}
      </div>

      {/* Sub-Navigation Switcher Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Tab 1: Off Day Request */}
        <button
          type="button"
          onClick={() => handleSubTabChange('off-day')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex items-center justify-between gap-3 ${
            activeSubTab === 'off-day'
              ? 'bg-indigo-500/15 border-indigo-500/80 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/50'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850/80 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                activeSubTab === 'off-day'
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              <CalendarOff className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p
                className={`text-sm font-bold truncate ${
                  activeSubTab === 'off-day' ? 'text-white' : 'text-slate-200'
                }`}
              >
                Off Day Request
              </p>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                Libur dinas & tukar shift Cinema Crew
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1.5">
            {pendingOffDay > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                {pendingOffDay} Pending
              </span>
            ) : (
              <span className="text-[11px] text-slate-500 font-medium">
                {offDayRequests.length} Total
              </span>
            )}
          </div>
        </button>

        {/* Tab 2: Leave Request (Cuti Karyawan) */}
        <button
          type="button"
          onClick={() => handleSubTabChange('leave')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex items-center justify-between gap-3 ${
            activeSubTab === 'leave'
              ? 'bg-emerald-500/15 border-emerald-500/80 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850/80 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                activeSubTab === 'leave'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p
                className={`text-sm font-bold truncate ${
                  activeSubTab === 'leave' ? 'text-white' : 'text-slate-200'
                }`}
              >
                Leave Request (Cuti)
              </p>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                Cuti tahunan & lampiran berkas
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1.5">
            {pendingLeave > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                {pendingLeave} Pending
              </span>
            ) : (
              <span className="text-[11px] text-slate-500 font-medium">
                {leaveRequests.length} Total
              </span>
            )}
          </div>
        </button>

        {/* Tab 3: Izin Sakit & Surat Dokter */}
        <button
          type="button"
          onClick={() => handleSubTabChange('sick-leave')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex items-center justify-between gap-3 ${
            activeSubTab === 'sick-leave'
              ? 'bg-rose-500/15 border-rose-500/80 shadow-lg shadow-rose-500/10 ring-1 ring-rose-500/50'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850/80 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                activeSubTab === 'sick-leave'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Stethoscope className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p
                className={`text-sm font-bold truncate ${
                  activeSubTab === 'sick-leave' ? 'text-white' : 'text-slate-200'
                }`}
              >
                Izin Sakit
              </p>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                Surat keterangan dokter & medis
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1.5">
            {pendingSick > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                {pendingSick} Pending
              </span>
            ) : (
              <span className="text-[11px] text-slate-500 font-medium">
                {sickLeaveRequests.length} Total
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Sub-View Content */}
      <div className="pt-1">
        {activeSubTab === 'off-day' && <OffDayView embedded />}
        {activeSubTab === 'leave' && <LeaveView embedded />}
        {activeSubTab === 'sick-leave' && <SickLeaveView embedded />}
      </div>
    </div>
  );
};
