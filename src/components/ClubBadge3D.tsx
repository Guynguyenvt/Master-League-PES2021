import React, { useState } from 'react';
import { Club } from '../types';

interface ClubBadge3DProps {
  club?: Club | null;
  clubName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showGlow?: boolean;
}

export const ClubBadge3D: React.FC<ClubBadge3DProps> = ({
  club,
  clubName = 'Club',
  size = 'md',
  className = '',
  showGlow = true,
}) => {
  const [imageError, setImageError] = useState(false);
  const name = club?.name || clubName;
  const short = club?.shortName || name.slice(0, 3).toUpperCase();
  const primary = club?.primaryColor || '#2563EB';
  const secondary = club?.secondaryColor || '#FACC15';
  const accent = club?.accentColor || '#FFFFFF';

  const sizeClasses = {
    xs: 'w-6 h-6 text-[9px]',
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-12 h-12 text-xs',
    lg: 'w-16 h-16 text-sm',
    xl: 'w-20 h-20 text-base',
    '2xl': 'w-28 h-28 text-xl',
  };

  const styleKey = club?.badgeStyle || name.toLowerCase();

  // If user uploaded a custom logo image or provided an image URL, render real image with 3D gloss wrapper
  if (club?.logo3DUrl && !imageError) {
    return (
      <div
        id={`club-badge-${club?.id || short}`}
        className={`relative inline-flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105 ${sizeClasses[size]} ${className}`}
      >
        {showGlow && (
          <div
            className="absolute inset-0 rounded-2xl blur-md opacity-40 -z-10"
            style={{ backgroundColor: primary }}
          />
        )}
        <div className="w-full h-full rounded-2xl p-1 bg-slate-900/80 border border-slate-700/80 shadow-lg flex items-center justify-center overflow-hidden">
          <img
            src={club.logo3DUrl}
            alt={name}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    );
  }

  // Render specific club 3D badges
  const renderBadgePattern = () => {
    if (styleKey.includes('manutd') || styleKey.includes('mu') || name.toLowerCase().includes('manchester united')) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="mu-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DC2626" />
              <stop offset="50%" stopColor="#B91C1C" />
              <stop offset="100%" stopColor="#7F1D1D" />
            </linearGradient>
            <linearGradient id="mu-gold" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="50%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#A16207" />
            </linearGradient>
            <radialGradient id="mu-glow" cx="50%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path d="M50 4 C75 4 92 18 92 46 C92 74 65 92 50 97 C35 92 8 74 8 46 C8 18 25 4 50 4 Z" fill="url(#mu-bg)" stroke="url(#mu-gold)" strokeWidth="3.5" />
          <path d="M50 8 C72 8 88 20 88 46 C88 71 63 87 50 92 C37 87 12 71 12 46 C12 20 28 8 50 8 Z" fill="url(#mu-glow)" />
          <circle cx="50" cy="46" r="28" fill="#FBBF24" stroke="#991B1B" strokeWidth="2" />
          <path d="M35 34 Q50 28 65 34 L62 42 Q50 38 38 42 Z" fill="#DC2626" />
          <path d="M50 40 C46 40 44 44 44 48 C44 54 48 60 50 63 C52 60 56 54 56 48 C56 44 54 40 50 40 Z" fill="#DC2626" />
          <path d="M41 43 L38 38 M59 43 L62 38" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
          <text x="50" y="24" textAnchor="middle" fill="#FEF08A" fontSize="7" fontWeight="bold" letterSpacing="0.5">MANCHESTER</text>
          <text x="50" y="80" textAnchor="middle" fill="#FEF08A" fontSize="7" fontWeight="bold" letterSpacing="0.5">UNITED</text>
        </svg>
      );
    }

    if (styleKey.includes('realmadrid') || styleKey.includes('rm') || name.toLowerCase().includes('real madrid')) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="rm-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="50%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>
            <linearGradient id="rm-blue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </linearGradient>
          </defs>
          <path d="M36 22 L40 12 L50 18 L60 12 L64 22 Z" fill="url(#rm-gold)" stroke="#78350F" strokeWidth="1" />
          <circle cx="50" cy="10" r="3" fill="#EAB308" />
          <circle cx="50" cy="56" r="38" fill="#FFFFFF" stroke="url(#rm-gold)" strokeWidth="4" />
          <circle cx="50" cy="56" r="33" fill="#F8FAFC" stroke="url(#rm-gold)" strokeWidth="1.5" />
          <path d="M25 36 L75 76 L70 82 L20 42 Z" fill="url(#rm-blue)" />
          <text x="50" y="63" textAnchor="middle" fill="url(#rm-gold)" fontSize="22" fontWeight="900" fontFamily="sans-serif">M</text>
          <text x="50" y="64" textAnchor="middle" fill="#1E3A8A" fontSize="16" fontWeight="bold" opacity="0.8">C</text>
        </svg>
      );
    }

    if (styleKey.includes('barcelona') || styleKey.includes('barca') || name.toLowerCase().includes('barcelona')) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="barca-gold" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FACC15" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
            <clipPath id="barca-clip">
              <path d="M15 20 C35 15 65 15 85 20 C85 50 75 75 50 92 C25 75 15 50 15 20 Z" />
            </clipPath>
          </defs>
          <path d="M15 20 C35 15 65 15 85 20 C85 50 75 75 50 92 C25 75 15 50 15 20 Z" fill="#1E3A8A" stroke="url(#barca-gold)" strokeWidth="4" />
          <g clipPath="url(#barca-clip)">
            <rect x="15" y="15" width="35" height="30" fill="#FFFFFF" />
            <rect x="29" y="15" width="7" height="30" fill="#DC2626" />
            <rect x="15" y="27" width="35" height="6" fill="#DC2626" />
            <rect x="50" y="15" width="35" height="30" fill="#FACC15" />
            <rect x="57" y="15" width="5" height="30" fill="#DC2626" />
            <rect x="68" y="15" width="5" height="30" fill="#DC2626" />
            <rect x="79" y="15" width="5" height="30" fill="#DC2626" />
            <rect x="10" y="45" width="80" height="10" fill="url(#barca-gold)" />
            <text x="50" y="53" textAnchor="middle" fill="#0F172A" fontSize="6.5" fontWeight="900">FCB</text>
            <rect x="15" y="55" width="70" height="40" fill="#1E3A8A" />
            <rect x="32" y="55" width="12" height="40" fill="#991B1B" />
            <rect x="56" y="55" width="12" height="40" fill="#991B1B" />
            <circle cx="50" cy="72" r="8" fill="#FACC15" stroke="#78350F" strokeWidth="1" />
          </g>
        </svg>
      );
    }

    if (styleKey.includes('bayern') || name.toLowerCase().includes('bayern')) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <circle cx="50" cy="50" r="44" fill="#DC2626" stroke="#FFFFFF" strokeWidth="3" />
          <circle cx="50" cy="50" r="38" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="50" cy="50" r="34" fill="#DC2626" />
          <circle cx="50" cy="50" r="23" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1.5" />
          <path d="M40 38 L50 28 L60 38 L50 48 Z M30 48 L40 38 L50 48 L40 58 Z M50 48 L60 38 L70 48 L60 58 Z M40 58 L50 48 L60 58 L50 68 Z" fill="#FFFFFF" opacity="0.9" />
          <text x="50" y="22" textAnchor="middle" fill="#FFFFFF" fontSize="6.5" fontWeight="900">FC BAYERN</text>
          <text x="50" y="86" textAnchor="middle" fill="#FFFFFF" fontSize="6.5" fontWeight="900">MÜNCHEN</text>
        </svg>
      );
    }

    if (styleKey.includes('acmilan') || styleKey.includes('milan') || name.toLowerCase().includes('ac milan')) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="acm-gold" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FACC15" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
            <clipPath id="acm-oval">
              <ellipse cx="50" cy="50" rx="36" ry="44" />
            </clipPath>
          </defs>
          <ellipse cx="50" cy="50" rx="38" ry="46" fill="#09090B" stroke="url(#acm-gold)" strokeWidth="3" />
          <g clipPath="url(#acm-oval)">
            {/* Left side: Red & Black Stripes */}
            <rect x="14" y="6" width="36" height="88" fill="#DC2626" />
            <rect x="20" y="6" width="6" height="88" fill="#09090B" />
            <rect x="32" y="6" width="6" height="88" fill="#09090B" />
            <rect x="44" y="6" width="6" height="88" fill="#09090B" />
            {/* Right side: St. George Cross */}
            <rect x="50" y="6" width="36" height="88" fill="#FFFFFF" />
            <rect x="50" y="44" width="36" height="12" fill="#DC2626" />
            <rect x="62" y="6" width="12" height="88" fill="#DC2626" />
            {/* Top header */}
            <rect x="14" y="6" width="72" height="22" fill="#09090B" />
            <text x="50" y="21" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="900">ACM</text>
            {/* Bottom year */}
            <rect x="14" y="74" width="72" height="22" fill="#09090B" />
            <text x="50" y="87" textAnchor="middle" fill="#FACC15" fontSize="8" fontWeight="bold">1899</text>
          </g>
        </svg>
      );
    }

    if (styleKey.includes('juventus') || styleKey.includes('juve') || name.toLowerCase().includes('juventus')) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="juv-metal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3F3F46" />
              <stop offset="50%" stopColor="#18181B" />
              <stop offset="100%" stopColor="#09090B" />
            </linearGradient>
          </defs>
          <rect x="10" y="10" width="80" height="80" rx="20" fill="url(#juv-metal)" stroke="#FACC15" strokeWidth="2" />
          <path d="M34 26 L44 26 L44 58 Q44 68 34 68 L28 68 L28 58 L32 58 Q34 58 34 54 Z" fill="#FFFFFF" />
          <path d="M52 26 L62 26 L62 58 Q62 76 46 76 L40 76 L40 66 L44 66 Q52 66 52 56 Z" fill="#FFFFFF" />
          <text x="50" y="20" textAnchor="middle" fill="#FACC15" fontSize="7" fontWeight="bold">JUVENTUS</text>
        </svg>
      );
    }

    // Default Dynamic 3D Crest with Team Colors
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <defs>
          <linearGradient id={`grad-${short}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primary} />
            <stop offset="60%" stopColor={primary} stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id={`rim-${short}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="50%" stopColor={secondary} />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
        </defs>
        <path
          d="M50 6 C78 6 90 20 90 48 C90 76 65 92 50 96 C35 92 10 76 10 48 C10 20 22 6 50 6 Z"
          fill={`url(#grad-${short})`}
          stroke={`url(#rim-${short})`}
          strokeWidth="4"
        />
        <path
          d="M50 10 C72 10 84 22 84 46 C84 68 62 82 50 88 C38 82 16 68 16 46 C16 22 28 10 50 10 Z"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1.5"
        />
        <path d="M22 30 L78 74 L70 82 L14 38 Z" fill={secondary} opacity="0.35" />
        <polygon points="50,18 53,24 60,25 55,30 56,37 50,33 44,37 45,30 40,25 47,24" fill={secondary} stroke="#78350F" strokeWidth="0.5" />
        <text
          x="50"
          y="62"
          textAnchor="middle"
          fill={accent}
          fontSize="24"
          fontWeight="900"
          letterSpacing="1"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}
        >
          {short}
        </text>
        <text
          x="50"
          y="78"
          textAnchor="middle"
          fill={secondary}
          fontSize="7"
          fontWeight="800"
          letterSpacing="0.8"
        >
          {name.slice(0, 14).toUpperCase()}
        </text>
      </svg>
    );
  };

  return (
    <div
      id={`club-badge-${club?.id || short}`}
      className={`relative inline-flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105 ${sizeClasses[size]} ${className}`}
    >
      {showGlow && (
        <div
          className="absolute inset-0 rounded-full blur-md opacity-40 -z-10"
          style={{ backgroundColor: primary }}
        />
      )}
      <div className="w-full h-full flex items-center justify-center">
        {renderBadgePattern()}
      </div>
    </div>
  );
};
