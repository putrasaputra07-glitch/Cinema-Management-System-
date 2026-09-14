import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Crop, ZoomIn, ZoomOut, RotateCw, Check, X, Move } from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  onConfirm: (croppedDataUrl: string) => void;
  onCancel: () => void;
  aspectRatio?: number; // default 1 (square)
  circular?: boolean;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageSrc,
  onConfirm,
  onCancel,
  aspectRatio = 1,
  circular = true,
}) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Reset transform whenever a new image is loaded
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, imageSrc]);

  // Pointer drag handling (mouse + touch)
  const handlePointerDown = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({
      x: clientX - position.x,
      y: clientY - position.y,
    });
  };

  const handlePointerMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging) return;
      setPosition({
        x: clientX - dragStart.x,
        y: clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Perform the crop on an off-screen HTML5 Canvas
  const handleCropAndSave = () => {
    if (!imageRef.current) return;

    const img = imageRef.current;
    const canvas = document.createElement('canvas');
    const outputSize = 512; // High-definition 512x512 profile photo
    canvas.width = outputSize;
    canvas.height = outputSize;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Background fill
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, outputSize, outputSize);

    // Save and translate to canvas center
    ctx.save();
    ctx.translate(outputSize / 2, outputSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    // Map screen container scale to canvas output
    const containerWidth = 280; // crop frame size on screen
    const ratio = outputSize / containerWidth;

    // Draw the image centered with the user's pan offset
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    // Scale image to fit base container
    const baseScale = Math.max(containerWidth / imgWidth, containerWidth / imgHeight);
    const drawWidth = imgWidth * baseScale * ratio;
    const drawHeight = imgHeight * baseScale * ratio;

    const drawX = -drawWidth / 2 + position.x * ratio;
    const drawY = -drawHeight / 2 + position.y * ratio;

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    ctx.restore();

    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    onConfirm(croppedDataUrl);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-100">Sesuaikan Foto Profil</h3>
              <p className="text-[11px] text-slate-400">Geser, perbesar, atau putar posisi foto</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport / Crop Box */}
        <div className="p-6 flex flex-col items-center justify-center bg-slate-950/70 select-none">
          <div
            ref={containerRef}
            className="relative w-[280px] h-[280px] overflow-hidden bg-slate-900 rounded-2xl border-2 border-dashed border-amber-500/60 cursor-grab active:cursor-grabbing shadow-inner flex items-center justify-center touch-none"
            onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
            onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={(e) => {
              if (e.touches[0]) handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
            }}
            onTouchMove={(e) => {
              if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
            }}
            onTouchEnd={handlePointerUp}
          >
            {/* The Image being cropped */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop preview"
              draggable={false}
              className="max-w-none transition-transform duration-75 pointer-events-none"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${scale})`,
                maxHeight: '280px',
                objectFit: 'contain',
              }}
              referrerPolicy="no-referrer"
            />

            {/* Circular or Square Overlay */}
            {circular ? (
              <div className="absolute inset-0 pointer-events-none rounded-full border-2 border-amber-400/80 shadow-[0_0_0_9999px_rgba(15,23,42,0.65)]" />
            ) : (
              <div className="absolute inset-0 pointer-events-none border-2 border-amber-400/80 shadow-[0_0_0_9999px_rgba(15,23,42,0.65)]" />
            )}

            {/* Center crosshair */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-6 h-6 border-t border-b border-white/20" />
              <div className="absolute w-6 h-6 border-l border-r border-white/20" />
            </div>

            {/* Hint pill */}
            <div className="absolute bottom-2 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-sm border border-slate-700 text-[10px] text-slate-300 pointer-events-none flex items-center gap-1">
              <Move className="w-3 h-3 text-amber-400" />
              <span>Sentuh & geser posisi</span>
            </div>
          </div>

          {/* Zoom and Rotation Controls */}
          <div className="w-full max-w-[280px] mt-5 space-y-3">
            {/* Zoom Slider */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setScale((s) => Math.max(0.6, s - 0.15))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700"
                title="Perkecil"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <input
                type="range"
                min="0.6"
                max="3"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />

              <button
                type="button"
                onClick={() => setScale((s) => Math.min(3, s + 0.15))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700"
                title="Perbesar"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Rotate Button & Reset */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Putar 90°</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setScale(1);
                  setRotation(0);
                  setPosition({ x: 0, y: 0 });
                }}
                className="text-[11px] text-slate-400 hover:text-amber-300 transition-colors underline underline-offset-2"
              >
                Reset Posisi
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-850 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleCropAndSave}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Gunakan Foto</span>
          </button>
        </div>
      </div>
    </div>
  );
};
