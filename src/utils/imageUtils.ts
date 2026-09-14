/**
 * Utility functions for handling and resizing images from device storage / camera / album
 */

export interface ResizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Resizes an image File (from input[type=file] / album / camera) and returns a lightweight base64 Data URL.
 * Automatically limits dimensions and compresses to JPEG to keep localStorage fast and avoid quota issues.
 */
export const resizeImageFile = (
  file: File,
  options: ResizeImageOptions = {}
): Promise<string> => {
  const { maxWidth = 500, maxHeight = 500, quality = 0.85 } = options;

  return new Promise((resolve, reject) => {
    // If it's a PDF, we don't resize via canvas, just read as data URL
    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Gagal membaca dokumen PDF'));
      reader.readAsDataURL(file);
      return;
    }

    if (!file.type.startsWith('image/')) {
      reject(new Error('File yang dipilih bukan gambar yang didukung (JPG, PNG, WEBP).'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to raw base64 if canvas context not supported
          resolve(readerEvent.target?.result as string);
          return;
        }

        // Fill background with white in case of PNG with transparency converting to JPEG
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve(dataUrl);
      };

      img.onerror = () => {
        reject(new Error('Format file gambar tidak valid atau rusak.'));
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca file dari penyimpanan perangkat.'));
    };

    reader.readAsDataURL(file);
  });
};
