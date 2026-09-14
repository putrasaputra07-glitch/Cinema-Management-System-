import React from 'react';
import { useCinema } from '../../context/CinemaContext';
import { AlertTriangle, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ConfirmDialog: React.FC = () => {
  const { confirmDialog, closeConfirm } = useCinema();

  if (!confirmDialog.isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={closeConfirm}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-xl shrink-0 ${
                confirmDialog.danger
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              {confirmDialog.danger ? <AlertCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>

            <div className="flex-1 pr-6">
              <h3 className="text-lg font-semibold text-slate-100">{confirmDialog.title}</h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">{confirmDialog.message}</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                if (confirmDialog.onCancel) confirmDialog.onCancel();
                closeConfirm();
              }}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
            >
              {confirmDialog.cancelText || 'Batal'}
            </button>
            <button
              type="button"
              onClick={() => {
                confirmDialog.onConfirm();
                closeConfirm();
              }}
              className={`px-4 py-2 text-sm font-medium text-white rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                confirmDialog.danger
                  ? 'bg-rose-600 hover:bg-rose-500 focus:ring-rose-500'
                  : 'bg-amber-600 hover:bg-amber-500 focus:ring-amber-500'
              }`}
            >
              {confirmDialog.confirmText || 'Konfirmasi'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
