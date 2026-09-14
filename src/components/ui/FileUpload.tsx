import React, { useState, useRef, useEffect } from 'react';
import { Camera, UploadCloud, X, Check, Image as ImageIcon, FileText, FolderOpen, Zap, ZapOff, RefreshCw, Crop } from 'lucide-react';
import { resizeImageFile } from '../../utils/imageUtils';
import { ImageCropperModal } from './ImageCropperModal';

interface FileUploadProps {
  label?: string;
  accept?: string;
  value?: string;
  onChange: (fileDataUrl: string) => void;
  required?: boolean;
  helpText?: string;
  allowCamera?: boolean;
  directCamera?: boolean; // Directly triggers camera for meter reading
  buttonText?: string;
  enableCrop?: boolean; // Opens cropper modal before saving
  cropCircular?: boolean;
  showCameraText?: boolean; // Only true for Utility (Electricity/Water) meter reading
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept = 'image/*',
  value,
  onChange,
  required = false,
  helpText = 'Format: JPG, PNG atau PDF (Maks. 5MB)',
  allowCamera = true,
  directCamera = false,
  buttonText,
  enableCrop = false,
  cropCircular = true,
  showCameraText = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [hasTorchSupport, setHasTorchSupport] = useState(false);

  // Crop State
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up media stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleRawImageResult = (dataUrl: string) => {
    if (enableCrop) {
      setImageToCrop(dataUrl);
      setIsCropperOpen(true);
    } else {
      onChange(dataUrl);
    }
  };

  const handleFile = async (file: File) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert('Ukuran file maksimal adalah 15MB.');
      return;
    }

    setIsProcessing(true);
    try {
      if (file.type.startsWith('image/')) {
        const compressedDataUrl = await resizeImageFile(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.88,
        });
        handleRawImageResult(compressedDataUrl);
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            onChange(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (e: any) {
      alert(e.message || 'Gagal membaca file dari penyimpanan perangkat.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const startCamera = async (overrideFacing?: 'environment' | 'user') => {
    stopCamera();
    const mode = overrideFacing || facingMode;
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Kamera tidak didukung pada browser ini.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setIsCameraActive(true);

      // Check for torch / flash capability
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = (videoTrack.getCapabilities ? videoTrack.getCapabilities() : {}) as any;
        setHasTorchSupport(Boolean(capabilities && 'torch' in capabilities));
        setIsTorchOn(false);
      }

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.error);
        }
      }, 150);
    } catch (err: any) {
      console.warn('Camera stream error, falling back to native capture input:', err);
      if (nativeCameraInputRef.current) {
        nativeCameraInputRef.current.click();
      } else if (fileInputRef.current) {
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
    setIsTorchOn(false);
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (!videoTrack) return;

    try {
      const nextTorch = !isTorchOn;
      await (videoTrack.applyConstraints as any)({
        advanced: [{ torch: nextTorch }],
      });
      setIsTorchOn(nextTorch);
    } catch (err) {
      console.warn('Gagal mengatur flash/torch:', err);
      // Fallback state toggle for visual feedback
      setIsTorchOn(!isTorchOn);
    }
  };

  const switchCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      stopCamera();
      handleRawImageResult(dataUrl);
    }
  };

  const isPdf = value?.startsWith('data:application/pdf') || value?.includes('.pdf');

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}

      {/* Hidden native input for fallback camera capture */}
      <input
        ref={nativeCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {/* Hidden standard file picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {/* Full Live Camera Viewport Modal */}
      {isCameraActive && (
        <div className="rounded-2xl border-2 border-amber-500/40 bg-slate-950 p-3 space-y-3 shadow-2xl relative overflow-hidden animate-fadeIn">
          <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3] sm:aspect-video flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

            {/* Viewfinder: Clean without any text, except for Utility (Electricity & Water) */}
            {showCameraText ? (
              <div className="absolute inset-4 border border-dashed border-amber-400/50 rounded-lg pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between text-[10px] text-amber-300 font-mono bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm self-start">
                  FOKUSKAN ANGKA METERAN
                </div>
                <div className="self-center w-12 h-12 border-t-2 border-b-2 border-amber-400/70 pointer-events-none" />
                <div className="text-[10px] text-slate-300 text-center bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                  Pastikan angka dan jarum meteran terbaca jelas
                </div>
              </div>
            ) : (
              <div className="absolute inset-4 border border-white/20 rounded-lg pointer-events-none" />
            )}

            {/* Top controls: Flash/Torch & Close */}
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
              {/* Flash / Torch Button */}
              <button
                type="button"
                onClick={toggleTorch}
                title={isTorchOn ? 'Matikan Senter / Flash' : 'Nyalakan Senter / Flash'}
                className={`p-2 rounded-xl backdrop-blur-md transition-all flex items-center gap-1 text-xs font-bold ${
                  isTorchOn
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/50 ring-2 ring-amber-300'
                    : 'bg-slate-900/80 hover:bg-slate-850 text-amber-400 border border-slate-750'
                }`}
              >
                {isTorchOn ? <Zap className="w-4 h-4 fill-current" /> : <ZapOff className="w-4 h-4" />}
                <span className="text-[10px] hidden sm:inline">{isTorchOn ? 'Flash ON' : 'Flash'}</span>
              </button>

              {/* Switch Front/Back Camera */}
              <button
                type="button"
                onClick={switchCameraFacing}
                title="Ganti Kamera Depan/Belakang"
                className="p-2 bg-slate-900/80 hover:bg-slate-850 text-slate-200 rounded-xl backdrop-blur-md border border-slate-750"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* Close Camera */}
              <button
                type="button"
                onClick={stopCamera}
                title="Tutup Kamera"
                className="p-2 bg-slate-900/80 hover:bg-rose-600 text-slate-200 hover:text-white rounded-xl backdrop-blur-md border border-slate-750 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Bar inside Camera */}
          <div className="flex justify-between items-center px-2 py-1">
            <button
              type="button"
              onClick={stopCamera}
              className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={captureCameraPhoto}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold rounded-xl text-sm shadow-xl shadow-amber-500/30 active:scale-95 transition-all"
            >
              <Camera className="w-5 h-5" />
              <span>Ambil Foto Sekarang</span>
            </button>
          </div>
        </div>
      )}

      {/* Preview if file already uploaded */}
      {value ? (
        <div className="relative rounded-2xl border border-slate-700 bg-slate-900/90 p-3.5 flex items-center gap-3.5">
          {isPdf ? (
            <div className="w-16 h-16 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex flex-col items-center justify-center shrink-0">
              <FileText className="w-7 h-7" />
              <span className="text-[10px] font-bold mt-0.5">PDF</span>
            </div>
          ) : (
            <div className={`relative w-16 h-16 overflow-hidden bg-slate-800 border border-slate-700 shrink-0 ${cropCircular ? 'rounded-full' : 'rounded-xl'}`}>
              <img src={value} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <Check className="w-3.5 h-3.5" /> File berhasil dilampirkan
            </div>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {isPdf ? 'Dokumen Surat Medis / PDF' : 'Foto bukti meteran / profil'}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {/* Re-crop button if crop is enabled */}
              {enableCrop && !isPdf && (
                <button
                  type="button"
                  onClick={() => {
                    setImageToCrop(value);
                    setIsCropperOpen(true);
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1 underline underline-offset-2"
                >
                  <Crop className="w-3 h-3" />
                  Sesuaikan / Crop
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (directCamera) {
                    startCamera();
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                className="text-xs text-slate-300 hover:text-white underline underline-offset-2"
              >
                Ganti Foto
              </button>

              {allowCamera && !directCamera && (
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="text-xs text-sky-400 hover:text-sky-300"
                >
                  Buka Kamera
                </button>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onChange('')}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Hapus foto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Upload / Direct Camera Trigger Area */
        !isCameraActive && (
          <div>
            {directCamera ? (
              /* Direct Camera Hero Trigger (e.g. for Meter Reading) */
              <div className="rounded-2xl border-2 border-dashed border-amber-500/40 bg-slate-900/60 p-4 sm:p-5 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-200">
                    {buttonText || 'Ambil Foto Bukti Fisik Meteran'}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Kamera langsung aktif dengan dukungan lampu flash / senter
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => startCamera()}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{buttonText || 'Buka Kamera & Foto Meteran'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium rounded-xl text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>Pilih dari Galeri</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Standard Dropzone with optional Camera & Storage */
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-4 transition-all text-center ${
                  isDragging
                    ? 'border-amber-500 bg-amber-500/5'
                    : 'border-slate-750 hover:border-slate-650 bg-slate-900/40 hover:bg-slate-900/70'
                }`}
              >
                <div className="flex flex-col items-center justify-center py-2 space-y-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                    <UploadCloud className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-300">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing}
                        className="font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-2 inline-flex items-center gap-1"
                      >
                        <FolderOpen className="w-3.5 h-3.5 inline" />
                        Pilih File dari Penyimpanan
                      </button>{' '}
                      atau seret ke sini
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {isProcessing ? 'Memproses & mengompresi gambar...' : helpText}
                    </p>
                  </div>

                  {allowCamera && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => startCamera()}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-200 rounded-xl border border-slate-700 transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5 text-sky-400" />
                        <span>Ambil Foto Langsung (Kamera)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      )}

      {/* Image Cropper Modal */}
      {isCropperOpen && (
        <ImageCropperModal
          isOpen={isCropperOpen}
          imageSrc={imageToCrop}
          circular={cropCircular}
          onConfirm={(croppedDataUrl) => {
            setIsCropperOpen(false);
            onChange(croppedDataUrl);
          }}
          onCancel={() => {
            setIsCropperOpen(false);
          }}
        />
      )}
    </div>
  );
};

