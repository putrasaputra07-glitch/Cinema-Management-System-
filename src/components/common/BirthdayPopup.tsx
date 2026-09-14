import React, { useEffect, useState } from 'react';
import { Cake, Sparkles, X, Heart } from 'lucide-react';
import { Employee } from '../../types';

interface BirthdayPopupProps {
  birthdayEmployees: Employee[];
  currentUserName: string;
  onClose: () => void;
}

export const BirthdayPopup: React.FC<BirthdayPopupProps> = ({
  birthdayEmployees,
  currentUserName,
  onClose,
}) => {
  const [timeLeft, setTimeLeft] = useState(3);

  useEffect(() => {
    // 3 seconds auto-dismiss countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose]);

  if (!birthdayEmployees || birthdayEmployees.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-400/60 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-amber-500/20 text-center overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 right-0 w-36 h-36 bg-rose-500/20 blur-2xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-10"
          aria-label="Tutup Pengumuman Ulang Tahun"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Festive Icon with Pulsing Halo */}
        <div className="relative mx-auto w-20 h-20 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 animate-pulse opacity-40 blur-md" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-400 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/40">
            <Cake className="w-9 h-9" />
          </div>
          <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-amber-300 animate-bounce" />
        </div>

        {/* Celebration Header */}
        <div className="space-y-1 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Special Birthday Recognition
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
            Selamat Ulang Tahun! 🎂
          </h3>
          <p className="text-xs text-slate-400">
            Keluarga Besar Cinema Lippo Plaza Sidoarjo
          </p>
        </div>

        {/* Celebrated Employees List */}
        <div className="space-y-3 mb-5">
          {birthdayEmployees.map((emp) => {
            const isSelf =
              emp.fullName.toLowerCase() === currentUserName.toLowerCase();
            return (
              <div
                key={emp.id}
                className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-800/80 border border-amber-400/30 text-left shadow-md"
              >
                <img
                  src={emp.photo}
                  alt={emp.fullName}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-amber-400/60 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-slate-100 truncate">
                      {emp.fullName}
                    </p>
                    {isSelf && (
                      <span className="text-[10px] font-extrabold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                        YOU!
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-amber-400 font-medium truncate">
                    {emp.position} • {emp.department}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                    Semoga panjang umur, bahagia, dan sukses selalu!
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3-second auto-close progress bar */}
        <div className="space-y-2">
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-400 to-rose-500 h-full transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${(timeLeft / 3) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Otomatis ditutup dalam <span className="text-amber-400 font-bold">{timeLeft} detik</span>
          </p>
        </div>
      </div>
    </div>
  );
};
