import React, { useState } from 'react';
import { useCinema } from '../../context/CinemaContext';
import {
  Bell,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Package,
  CalendarCheck2,
  Sparkles,
  Zap,
  Info,
  Clock,
  Check,
  ArrowLeft,
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    setCurrentTab,
    unreadNotificationCount,
  } = useCinema();

  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'INVENTORY_LOW':
        return <Package className="w-5 h-5 text-amber-400" />;
      case 'REQUEST_PENDING':
      case 'REQUEST_APPROVED':
      case 'REQUEST_REJECTED':
        return <CalendarCheck2 className="w-5 h-5 text-indigo-400" />;
      case 'CLEANING_ALERT':
        return <Sparkles className="w-5 h-5 text-emerald-400" />;
      case 'UTILITY_ALERT':
        return <Zap className="w-5 h-5 text-sky-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const handleNotificationClick = (n: any) => {
    markNotificationAsRead(n.id);
    if (n.linkTab) {
      setCurrentTab(n.linkTab);
    }
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-12 max-w-4xl w-full mx-auto flex flex-col min-h-[calc(100dvh-6rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCurrentTab('home')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 hover:text-slate-100 transition-colors shrink-0"
            title="Kembali ke Beranda"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2 truncate">
              <Bell className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Notifikasi Operasional Bioskop</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              Pemberitahuan real-time operasional bioskop
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {unreadNotificationCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsAsRead}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tandai Semua Dibaca</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={clearAllNotifications}
              className="px-3 py-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Semua</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1 w-fit text-xs font-medium shrink-0">
        <button
          type="button"
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filter === 'ALL' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Semua Notifikasi ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('UNREAD')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filter === 'UNREAD' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Belum Dibaca ({unreadNotificationCount})
        </button>
      </div>

      {/* Notification List - with internal scrollable container on long content */}
      <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[calc(100dvh-15rem)] sm:max-h-none pr-0.5">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
            <Bell className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-300 font-semibold text-sm">Tidak ada notifikasi saat ini</p>
            <p className="text-xs text-slate-500 mt-1">Semua operasional bioskop terpantau aman dan terkendali</p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                item.isRead
                  ? 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-850'
                  : 'bg-slate-850 border-amber-500/30 hover:border-amber-500/60 shadow-sm'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 shrink-0">
                {getIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-xs font-bold truncate ${item.isRead ? 'text-slate-300' : 'text-slate-100'}`}>
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.created_at}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.message}</p>

                {item.linkTab && (
                  <span className="inline-block mt-2 text-[11px] font-semibold text-amber-400 hover:text-amber-300">
                    Buka Halaman Terkait →
                  </span>
                )}
              </div>

              {!item.isRead && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 mt-1.5 shadow-sm shadow-amber-400" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
