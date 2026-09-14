import React from 'react';

export interface BadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, className = '', size = 'md' }) => {
  const norm = (status || '').toUpperCase().replace(/[\s_-]+/g, '_');

  let style = 'bg-slate-800 text-slate-300 border-slate-700';
  let label = status;

  switch (norm) {
    case 'PENDING':
    case 'MENUNGGU':
      style = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      label = 'Pending';
      break;
    case 'APPROVED':
    case 'DISETUJUI':
      style = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      label = 'Disetujui';
      break;
    case 'REJECTED':
    case 'DITOLAK':
      style = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      label = 'Ditolak';
      break;
    case 'COMPLETED':
    case 'SELESAI':
    case 'DONE':
      style = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      label = 'Selesai';
      break;
    case 'INCOMPLETE':
    case 'BELUM_SELESAI':
    case 'NOT_DONE':
      style = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      label = 'Belum Lengkap';
      break;
    case 'SAFE':
    case 'AMAN':
      style = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      label = 'Stock Aman';
      break;
    case 'LOW_STOCK':
    case 'STOCK_MENIPIS':
      style = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      label = 'Low Stock';
      break;
    case 'OUT_OF_STOCK':
    case 'STOCK_HABIS':
      style = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      label = 'Out of Stock';
      break;
    case 'ACTIVE':
    case 'AKTIF':
      style = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      label = 'Aktif';
      break;
    case 'OFF':
    case 'OFF_DAY':
      style = 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      label = 'Off Day';
      break;
    case 'LEAVE':
    case 'CUTI':
      style = 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      label = 'Sedang Cuti';
      break;
    case 'SICK':
    case 'SAKIT':
      style = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      label = 'Izin Sakit';
      break;
    case 'INACTIVE':
      style = 'bg-slate-700/50 text-slate-400 border-slate-600/30';
      label = 'Nonaktif';
      break;
    case 'HIGH':
      style = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      label = 'Di Atas Rata-rata';
      break;
    case 'NORMAL':
      style = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      label = 'Normal';
      break;
    case 'LOW':
      style = 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      label = 'Di Bawah Rata-rata';
      break;
    default:
      label = status;
      break;
  }

  const sizeClass =
    size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3.5 py-1 text-sm' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border whitespace-nowrap ${sizeClass} ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
};
