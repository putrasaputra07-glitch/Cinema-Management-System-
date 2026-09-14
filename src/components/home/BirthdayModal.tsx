import React, { useState, useEffect } from 'react';
import { useCinema } from '../../context/CinemaContext';
import { safeSessionStorage } from '../../utils/safeStorage';
import { Cake, Sparkles, X, Heart, PartyPopper } from 'lucide-react';

export const BirthdayModal: React.FC = () => {
  const { currentUser, birthdayEmployeesToday, isLoggedIn } = useCinema();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !currentUser || birthdayEmployeesToday.length === 0) {
      return;
    }

    // Check sessionStorage to show once per login session
    const sessionKey = `bday_popup_${currentUser.id || currentUser.name}_${new Date().toISOString().slice(0, 10)}`;
    const alreadyShown = safeSessionStorage.getItem(sessionKey);

    if (!alreadyShown) {
      // Per Requirement #12: Appears exactly 5 seconds after successful login
      const timer = setTimeout(() => {
        setIsOpen(true);
        safeSessionStorage.setItem(sessionKey, 'true');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, currentUser, birthdayEmployeesToday]);

  if (!isOpen || birthdayEmployeesToday.length === 0) return null;

  return (
    <div
      id="birthday-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
    >
      <div
        id="birthday-modal-card"
        className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/50 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 text-center shadow-2xl shadow-amber-500/30 overflow-hidden transform animate-scaleUp"
      >
        {/* Pop-art festive decorative glow effects */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          id="btn-close-birthday-modal"
          type="button"
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
          aria-label="Tutup Ucapan Ulang Tahun"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Pop-Art Festive Header */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <PartyPopper className="w-6 h-6 text-amber-400 animate-bounce" />
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            🎉 HAPPY BIRTHDAY! 🎂
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </span>
          <PartyPopper className="w-6 h-6 text-amber-400 animate-bounce" />
        </div>

        {/* Celebrating Employees List */}
        <div className="space-y-4 my-4 max-h-[50vh] overflow-y-auto px-1 py-1">
          {birthdayEmployeesToday.map((emp) => (
            <div
              key={emp.id}
              className="p-4 rounded-2xl bg-slate-850/80 border border-amber-500/30 shadow-md flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left transition-all hover:border-amber-400/60"
            >
              <div className="relative shrink-0">
                <img
                  src={emp.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
                  alt={emp.fullName}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-lg shadow-amber-500/20"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute -bottom-1 -right-1 p-1 bg-amber-500 text-slate-950 rounded-lg shadow">
                  <Cake className="w-4 h-4" />
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Selamat Ulang Tahun!
                </p>
                <h3 className="text-lg sm:text-xl font-black text-slate-100 truncate">
                  {emp.fullName}
                </h3>
                <p className="text-xs text-slate-300 font-medium">
                  {emp.position} • {emp.department}
                </p>
                <p className="text-xs text-amber-200/90 mt-1 italic leading-snug">
                  "Semoga hari ini penuh kebahagiaan, kesehatan prima, dan kesuksesan bersama keluarga besar Cinema Management System Lippo Plaza Sidoarjo!"
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Action */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>Keluarga Besar Lippo Plaza Sidoarjo</span>
          </div>
          <button
            id="btn-confirm-birthday-modal"
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            Tutup & Lanjutkan Kerja
          </button>
        </div>
      </div>
    </div>
  );
};
