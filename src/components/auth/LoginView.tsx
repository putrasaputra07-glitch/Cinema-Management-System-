import React, { useState } from 'react';
import { useCinema } from '../../context/CinemaContext';
import { useJakartaClock } from '../../utils/datetime';
import {
  Lock,
  User,
  Shield,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useCinema();
  const clock = useJakartaClock(1000);

  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanIdentifier = identifier.trim();
    const cleanPin = pin.trim();

    if (!cleanIdentifier) {
      setErrorMsg('Harap masukkan ID Karyawan atau Username.');
      return;
    }

    if (!cleanPin) {
      setErrorMsg('Harap masukkan Password / PIN Akses.');
      return;
    }

    setIsSubmitting(true);

    // Secure authentication handling
    setTimeout(() => {
      try {
        const success = login(cleanIdentifier, cleanPin);
        setIsSubmitting(false);

        if (!success) {
          setErrorMsg('ID Karyawan atau Password tidak cocok. Silakan periksa kembali kredensial Anda.');
        }
      } catch (err: any) {
        setIsSubmitting(false);
        setErrorMsg(err?.message || 'Terjadi kesalahan saat memproses login.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[600px] h-96 sm:h-[600px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-sky-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Login Card Container */}
      <div className="w-full max-w-md sm:max-w-lg z-10 relative">
        {/* Cinema Logo & Branding Header */}
        <div className="text-center mb-6 sm:mb-8">
          <img
            src="/cinema_logo.jpg"
            alt="Cinema Logo"
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl object-cover shadow-xl shadow-amber-500/20 ring-4 ring-amber-500/20 mb-3 border border-amber-400/40"
            referrerPolicy="no-referrer"
          />
          <h1 className="text-xl sm:text-3xl font-black text-slate-100 tracking-tight leading-snug">
            CINEMA <span className="text-amber-400">MANAGEMENT SYSTEM</span>
          </h1>
          <p className="text-[11px] sm:text-sm text-amber-400 mt-1 font-bold tracking-wider uppercase">
            LIPPO PLAZA SIDOARJO
          </p>
          {/* Real-time Date & Time (Requirement #6) */}
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-mono shadow-inner">
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{clock.fullString}</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative overflow-hidden">
          {/* Subtle top amber highlight bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

          {/* Alert Message */}
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-300 flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Login */}
          <form onSubmit={handleFormLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                ID Karyawan / Username / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Masukkan ID Karyawan / Username / Email"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Password / PIN Akses
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Masukkan Password / PIN Akses"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Memverifikasi Akses...</span>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice Footer inside Card */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center">
            <Shield className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
            <span>Akses Internal Terproteksi • Cinepolis Security v2.4</span>
          </div>
        </div>

        {/* Bottom Subtitle / Info */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Butuh bantuan login? Hubungi tim IT & Supervisor Operasional Bioskop.
        </p>
      </div>
    </div>
  );
};
