import React from 'react';

interface JigawaPolyLogoProps {
  size?: number;
  showBorder?: boolean;
  className?: string;
}

export const JigawaPolyLogo: React.FC<JigawaPolyLogoProps> = ({
  size = 48,
  showBorder = true,
  className = ""
}) => {
  return (
    <div
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`relative shrink-0 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-sm transition-transform hover:scale-105 ${
        showBorder ? 'border-2 border-[#005FB0]/40' : ''
      } ${className}`}
    >
      <img
        src="/assets/logo.jpg"
        alt="Jigawa State Polytechnic Dutse Logo"
        style={{ width: `${Math.round(size * 0.9)}px`, height: `${Math.round(size * 0.9)}px`, objectFit: 'contain' }}
        className="w-[92%] h-[92%] object-contain rounded-full"
        onError={(e) => {
          // Fallback SVG badge if image fails to load
          const target = e.currentTarget;
          target.style.display = 'none';
          if (target.parentElement) {
            target.parentElement.innerHTML = `
              <div class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#005FB0] to-[#0F5132] text-white p-1 text-center select-none font-bold text-[10px]">
                <span>JSP</span>
                <span class="text-[7px]">DUTSE</span>
              </div>
            `;
          }
        }}
      />
    </div>
  );
};
