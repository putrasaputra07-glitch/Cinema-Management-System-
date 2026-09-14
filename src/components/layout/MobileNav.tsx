import React, { useState } from 'react';
import { useCinema } from '../../context/CinemaContext';
import {
  CalendarDays,
  Sparkles,
  Zap,
  PlusCircle,
  CalendarCheck2,
  Package,
  X,
  CalendarOff,
  Stethoscope,
  ArrowUpRight,
  ArrowDownLeft,
  HardDrive,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { currentTab, setCurrentTab, currentUser, setActiveQuickAction } = useCinema();
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

  const handleAction = (actionName: string) => {
    setActiveQuickAction(actionName);
    setIsQuickMenuOpen(false);
  };

  return (
    <>
      {/* Quick Action Drawer for Mobile */}
      {isQuickMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/80 backdrop-blur-sm lg:hidden">
          <div className="bg-slate-900 border-t border-slate-700 rounded-t-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Aksi Cepat Operasional</h3>
                <p className="text-xs text-slate-400">Pilih tindakan langsung dengan satu sentuhan</p>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleAction('daily_cleaning')}
                className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 flex flex-col items-start gap-1.5 text-left text-xs text-slate-200 transition-colors"
              >
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="font-semibold">+ Checklist Cleaning</span>
                <span className="text-[10px] text-slate-400">Update bukti area</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('electricity_report')}
                className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 flex flex-col items-start gap-1.5 text-left text-xs text-slate-200 transition-colors"
              >
                <Zap className="w-5 h-5 text-amber-400" />
                <span className="font-semibold">+ Lapor Listrik</span>
                <span className="text-[10px] text-slate-400">Input meteran kWh</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('water_report')}
                className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 flex flex-col items-start gap-1.5 text-left text-xs text-slate-200 transition-colors"
              >
                <Zap className="w-5 h-5 text-sky-400" />
                <span className="font-semibold">+ Lapor Air</span>
                <span className="text-[10px] text-slate-400">Input meteran m³</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('off_day_request')}
                className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 flex flex-col items-start gap-1.5 text-left text-xs text-slate-200 transition-colors"
              >
                <CalendarOff className="w-5 h-5 text-indigo-400" />
                <span className="font-semibold">+ Request Off Day</span>
                <span className="text-[10px] text-slate-400">Tukar/libur dinas</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('leave_request')}
                className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 flex flex-col items-start gap-1.5 text-left text-xs text-slate-200 transition-colors"
              >
                <CalendarCheck2 className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold">+ Request Cuti</span>
                <span className="text-[10px] text-slate-400">Cuti tahunan & izin</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('sick_leave')}
                className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 flex flex-col items-start gap-1.5 text-left text-xs text-slate-200 transition-colors"
              >
                <Stethoscope className="w-5 h-5 text-rose-400" />
                <span className="font-semibold">+ Izin Sakit</span>
                <span className="text-[10px] text-slate-400">Upload surat dokter</span>
              </button>

              {currentUser.role !== 'CREW' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleAction('stock_in')}
                    className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 flex flex-col items-start gap-1.5 text-left text-xs text-slate-200 transition-colors"
                  >
                    <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                    <span className="font-semibold">+ Stock In (Masuk)</span>
                    <span className="text-[10px] text-slate-400">Terima barang</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAction('stock_out')}
                    className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 flex flex-col items-start gap-1.5 text-left text-xs text-slate-200 transition-colors"
                  >
                    <ArrowUpRight className="w-5 h-5 text-amber-400" />
                    <span className="font-semibold">+ Stock Out (Keluar)</span>
                    <span className="text-[10px] text-slate-400">Distribusi operasional</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => {
                  setCurrentTab('drive');
                  setIsQuickMenuOpen(false);
                }}
                className="col-span-2 p-3 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-amber-500/30 flex items-center justify-between text-left text-xs text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-100">Google Drive Bioskop</span>
                    <span className="text-[10px] text-slate-400 block">Backup laporan & kelola file cloud</span>
                  </div>
                </div>
                <span className="text-amber-400 text-xs font-bold">Buka &rarr;</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sticky Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 py-1.5 px-3">
        <div className="flex items-center justify-around">
          <button
            type="button"
            onClick={() => setCurrentTab('schedule')}
            className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
              currentTab === 'schedule' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarDays className="w-5 h-5 mb-0.5" />
            <span>Schedule</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('inventory')}
            className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
              currentTab === 'inventory' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-5 h-5 mb-0.5" />
            <span>Inventory</span>
          </button>

          {/* Elevated Center Quick Action Button */}
          <div className="-mt-5">
            <button
              type="button"
              onClick={() => setIsQuickMenuOpen(true)}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 active:scale-95 transition-transform"
              aria-label="Aksi Cepat"
            >
              <PlusCircle className="w-7 h-7" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setCurrentTab('cleaning')}
            className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
              currentTab === 'cleaning' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-5 h-5 mb-0.5" />
            <span>Kebersihan</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('requests')}
            className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
              ['requests', 'off-day', 'leave', 'sick-leave'].includes(currentTab)
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarCheck2 className="w-5 h-5 mb-0.5" />
            <span>Izin/Cuti</span>
          </button>
        </div>
      </nav>
    </>
  );
};
