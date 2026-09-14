import React, { useState, useRef } from 'react';
import { useCinema } from '../../context/CinemaContext';
import { Employee } from '../../types';
import { resizeImageFile } from '../../utils/imageUtils';
import {
  X,
  UploadCloud,
  Camera,
  FolderOpen,
  Check,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Image as ImageIcon,
  User as UserIcon,
} from 'lucide-react';

interface ChangePhotoModalProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
}

// Quick avatar presets for convenience in cinema environment
const CINEMA_PRESETS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
];

export const ChangePhotoModal: React.FC<ChangePhotoModalProps> = ({
  employee,
  isOpen,
  onClose,
}) => {
  const { updateEmployeePhoto } = useCinema();

  const [previewPhoto, setPreviewPhoto] = useState<string>(employee.photo);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (file: File) => {
    if (!file) return;
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Hanya file gambar (JPG, PNG, WEBP) yang dapat diunggah sebagai foto profil.');
      }

      // Automatically compress and resize to optimal square profile size (max 500x500, quality 0.85)
      const dataUrl = await resizeImageFile(file, {
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.85,
      });

      setPreviewPhoto(dataUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memproses file foto dari storage.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const startCamera = async () => {
    setErrorMessage(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Kamera tidak didukung pada peramban ini.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.error);
        }
      }, 200);
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      // Fallback: trigger file input directly
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const size = Math.min(video.videoWidth || 640, video.videoHeight || 480);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Square center-crop
      const startX = ((video.videoWidth || 640) - size) / 2;
      const startY = ((video.videoHeight || 480) - size) / 2;
      ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setPreviewPhoto(dataUrl);
      stopCamera();
    }
  };

  const handleSave = () => {
    if (!previewPhoto) {
      setErrorMessage('Silakan pilih atau unggah foto terlebih dahulu.');
      return;
    }
    stopCamera();
    updateEmployeePhoto(employee.id, previewPhoto);
    onClose();
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const hasChanged = previewPhoto !== employee.photo;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Ganti Foto Profil Karyawan</h3>
              <p className="text-[11px] text-slate-400">
                {employee.fullName} • {employee.employeeId} ({employee.position})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Error message */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Camera View */}
          {isCameraActive ? (
            <div className="rounded-2xl border border-slate-700 bg-black p-3 space-y-3">
              <div className="relative rounded-xl overflow-hidden aspect-square max-w-xs mx-auto flex items-center justify-center bg-slate-950">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-amber-500/50 rounded-full pointer-events-none" />
              </div>
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white bg-slate-800"
                >
                  Batal Kamera
                </button>
                <button
                  type="button"
                  onClick={captureCameraPhoto}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  <Camera className="w-4 h-4" /> Ambil Foto Sekarang
                </button>
              </div>
            </div>
          ) : (
            /* Avatar Preview Comparison */
            <div className="flex flex-col items-center justify-center pt-1 pb-2">
              <div className="relative group">
                <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-amber-500/60 ring-4 ring-amber-500/10 shadow-xl bg-slate-800 flex items-center justify-center">
                  {previewPhoto ? (
                    <img
                      src={previewPhoto}
                      alt={employee.fullName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <UserIcon className="w-12 h-12 text-slate-600" />
                  )}
                </div>
                {hasChanged && (
                  <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-bold rounded-full border border-slate-900 shadow">
                    Baru
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-2 font-medium">Pratinjau Foto Profil Baru</p>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />

          {/* Storage / Album Upload Buttons */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Pilih Sumber Gambar dari Perangkat
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Button: Open Storage / Album */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500/15 to-amber-600/10 hover:from-amber-500/25 hover:to-amber-600/20 border border-amber-500/40 hover:border-amber-400 text-amber-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all group"
              >
                <FolderOpen className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Pilih dari Storage / Album</span>
              </button>

              {/* Button: Live Camera */}
              <button
                type="button"
                onClick={startCamera}
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors group"
              >
                <Camera className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                <span>Ambil Foto dengan Kamera</span>
              </button>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-amber-400 bg-amber-500/10'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-850/60 hover:bg-slate-850'
              }`}
            >
              <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
              <p className="text-xs text-slate-300 font-medium">
                Atau seret file foto dari folder perangkat ke area ini
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Format: JPG, PNG, WEBP • Otomatis dioptimalkan & dikompresi
              </p>
            </div>
          </div>

          {/* Preset Gallery Option */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Contoh Foto Formal Profil
              </span>
              {hasChanged && (
                <button
                  type="button"
                  onClick={() => setPreviewPhoto(employee.photo)}
                  className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Kembalikan Asli
                </button>
              )}
            </div>

            <div className="grid grid-cols-6 gap-2">
              {CINEMA_PRESETS.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPreviewPhoto(url)}
                  className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                    previewPhoto === url
                      ? 'border-amber-400 ring-2 ring-amber-400/20 scale-105'
                      : 'border-slate-750 hover:border-slate-600 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={url}
                    alt={`Preset ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {previewPhoto === url && (
                    <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-amber-300" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-850 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanged || isProcessing}
            className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              hasChanged && !isProcessing
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/25'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            {isProcessing ? 'Memproses...' : 'Simpan Foto Profil'}
          </button>
        </div>
      </div>
    </div>
  );
};
