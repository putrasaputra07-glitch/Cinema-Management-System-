import React, { useState } from 'react';

interface AppLogoProps {
  className?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = '',
  alt = 'Cinema Logo',
  size = 'md',
}) => {
  const [srcIndex, setSrcIndex] = useState(0);

  // Fallback hierarchy for Google Drive logo
  const logoSources = [
    'https://lh3.googleusercontent.com/d/18r4bPsPpkUjvYkA6NLSujRsELFURY-42',
    'https://drive.google.com/thumbnail?id=18r4bPsPpkUjvYkA6NLSujRsELFURY-42&sz=w1000',
    '/cinema_logo.jpg',
  ];

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl',
    xl: 'w-24 h-24 sm:w-28 sm:h-28 rounded-3xl',
  };

  const handleImgError = () => {
    if (srcIndex < logoSources.length - 1) {
      setSrcIndex((prev) => prev + 1);
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 shadow-md shadow-amber-500/10 ${sizeClasses[size]} ${className}`}
    >
      <img
        src={logoSources[srcIndex]}
        alt={alt}
        className="w-full h-full object-contain p-0.5 transition-transform duration-300 hover:scale-105"
        referrerPolicy="no-referrer"
        onError={handleImgError}
      />
    </div>
  );
};
