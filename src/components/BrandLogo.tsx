import React from 'react';

interface BrandLogoProps {
  variant?: 'light' | 'dark' | 'header' | 'invoice';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  tagline?: string;
}

export const ConsultantByDrexLogo: React.FC<{
  color?: 'black' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  align?: 'center' | 'left';
}> = ({ color = 'black', size = 'md', className = '', align = 'center' }) => {
  const isBlack = color === 'black';

  const textSizes = {
    sm: { title: 'text-xl', subtitle: 'text-[9px] tracking-[0.35em]' },
    md: { title: 'text-2xl sm:text-[26px]', subtitle: 'text-[10px] tracking-[0.38em]' },
    lg: { title: 'text-3xl sm:text-4xl', subtitle: 'text-xs tracking-[0.42em]' },
    xl: { title: 'text-4xl sm:text-5xl', subtitle: 'text-xs sm:text-sm tracking-[0.45em]' },
  }[size];

  return (
    <div className={`inline-flex flex-col items-center text-center select-none ${className}`}>
      <span
        className={`font-black tracking-[-0.03em] leading-none whitespace-nowrap text-center block w-full ${textSizes.title}`}
        style={{
          fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
          fontWeight: 900,
          color: isBlack ? '#000000' : '#ffffff',
        }}
      >
        Consultant
      </span>
      <span
        className={`font-semibold tracking-[0.38em] whitespace-nowrap mt-1 text-center block w-full indent-[0.38em] ${textSizes.subtitle}`}
        style={{
          fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
          letterSpacing: '0.38em',
          color: isBlack ? '#000000' : '#ffffff',
        }}
      >
        by D&apos;Rex
      </span>
    </div>
  );
};

export const CompanyBrandLogo: React.FC<{
  variant?: 'light' | 'dark' | 'inverse' | 'black';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ variant = 'light', size = 'lg', className = '' }) => {
  const isLight = variant === 'light';
  const isBlack = variant === 'black';
  
  const textSizes = {
    sm: { title: 'text-2xl', subtitle: 'text-[9px] tracking-[0.38em]' },
    md: { title: 'text-3xl', subtitle: 'text-[10px] tracking-[0.42em]' },
    lg: { title: 'text-4xl sm:text-[42px]', subtitle: 'text-[11px] sm:text-xs tracking-[0.45em]' },
    xl: { title: 'text-5xl sm:text-6xl', subtitle: 'text-xs sm:text-sm tracking-[0.48em]' },
  }[size];

  return (
    <div className={`flex flex-col items-center text-center select-none ${className}`}>
      <span
        className={`font-black tracking-[-0.04em] leading-none text-center block w-full ${textSizes.title} ${
          isBlack ? 'text-black' : isLight ? 'text-white' : 'text-[#0F3B2C]'
        }`}
        style={{
          fontFamily: "'Montserrat', 'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
          fontWeight: 900,
          color: isBlack ? '#000000' : undefined,
        }}
      >
        Consultant
      </span>
      <span
        className={`font-semibold mt-1.5 text-center block w-full indent-[0.40em] ${textSizes.subtitle} ${
          isBlack ? 'text-black' : isLight ? 'text-white/90' : 'text-slate-700'
        }`}
        style={{
          fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
          letterSpacing: '0.40em',
          color: isBlack ? '#000000' : undefined,
        }}
      >
        by D&apos;Rex
      </span>
    </div>
  );
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'dark',
  size = 'md',
  showSubtitle = true,
  tagline = 'Smart Business Management, Simplified.',
}) => {
  const isInvoice = variant === 'invoice';
  const isLight = variant === 'light';

  // Sizing maps
  const iconSize = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  }[size];

  const titleSize = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  }[size];

  const subSize = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-[11px]',
    xl: 'text-xs'
  }[size];

  if (isInvoice) {
    return <CompanyBrandLogo variant="light" size={size} />;
  }

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Dynamic App Icon Badge matching reference visiting card / suite logo */}
      <div className="relative flex-shrink-0">
        <div className={`rounded-xl ${iconSize} bg-[#0F3B2C] shadow-md flex items-center justify-center p-1.5 overflow-hidden border border-[#7EA64B]/30`}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Outer C shape */}
            <circle cx="50" cy="50" r="40" fill="none" stroke="#ffffff" strokeWidth="12" strokeDasharray="210 50" strokeDashoffset="25" />
            {/* Document icon in center */}
            <rect x="36" y="32" width="28" height="36" rx="4" fill="#ffffff" />
            <line x1="42" y1="42" x2="58" y2="42" stroke="#0F3B2C" strokeWidth="3" strokeLinecap="round" />
            <line x1="42" y1="50" x2="58" y2="50" stroke="#0F3B2C" strokeWidth="3" strokeLinecap="round" />
            <line x1="42" y1="58" x2="52" y2="58" stroke="#0F3B2C" strokeWidth="3" strokeLinecap="round" />
            {/* Leaf ribbon fold accent */}
            <path d="M56 26 C75 26, 88 45, 88 74 C70 74, 56 60, 56 46 Z" fill="#7EA64B" opacity="0.95" />
            <path d="M56 26 L68 38 L56 38 Z" fill="#587932" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-extrabold tracking-tight font-display ${titleSize} ${isLight ? 'text-white' : 'text-[#0F3B2C]'}`}>
            D’Rex Suite
          </span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wider uppercase ${isLight ? 'bg-white/20 text-emerald-100' : 'bg-emerald-100 text-[#0F3B2C]'}`}>
            PRO
          </span>
        </div>
        {showSubtitle && (
          <span className={`font-medium tracking-normal ${subSize} ${isLight ? 'text-emerald-200/90' : 'text-slate-500'}`}>
            {tagline}
          </span>
        )}
      </div>
    </div>
  );
};
