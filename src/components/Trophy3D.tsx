import React from 'react';
import { CompetitionType } from '../types';

interface Trophy3DProps {
  type: CompetitionType | 'ucl' | 'cwc' | 'league' | 'cup' | 'supercup' | 'uefa_supercup';
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  count?: number;
  className?: string;
  showShine?: boolean;
}

export const Trophy3D: React.FC<Trophy3DProps> = ({
  type,
  title,
  size = 'md',
  count,
  className = '',
  showShine = true,
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  };

  const renderTrophySvg = () => {
    switch (type) {
      case 'european_cup':
      case 'ucl':
        // Iconic Champions League "Big Ears" Silver Cup with Blue/White Ribbons
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            <defs>
              <linearGradient id="silver-metal" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="30%" stopColor="#E2E8F0" />
                <stop offset="70%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
              <linearGradient id="silver-highlight" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#CBD5E1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#475569" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            {/* Cup Base */}
            <rect x="35" y="86" width="30" height="6" rx="2" fill="#1E293B" stroke="#64748B" strokeWidth="1" />
            <path d="M42 86 L44 76 L56 76 L58 86 Z" fill="url(#silver-metal)" />
            {/* Main Cup Body */}
            <path d="M30 25 C30 65 38 76 50 76 C62 76 70 65 70 25 Z" fill="url(#silver-metal)" stroke="#FFFFFF" strokeWidth="0.8" />
            <path d="M34 25 C34 60 40 70 50 70 C60 70 66 60 66 25 Z" fill="url(#silver-highlight)" />
            {/* Iconic Big Ears Handles */}
            <path
              d="M30 32 C15 32 12 56 30 64 L30 58 C18 52 20 38 30 38 Z"
              fill="url(#silver-metal)"
              stroke="#CBD5E1"
              strokeWidth="0.8"
            />
            <path
              d="M70 32 C85 32 88 56 70 64 L70 58 C82 52 80 38 70 38 Z"
              fill="url(#silver-metal)"
              stroke="#CBD5E1"
              strokeWidth="0.8"
            />
            {/* UCL Starball Inscription */}
            <circle cx="50" cy="46" r="8" fill="#1E3A8A" stroke="#60A5FA" strokeWidth="0.8" />
            <polygon points="50,40 52,44 56,44 53,47 54,51 50,48 46,51 47,47 44,44 48,44" fill="#FFFFFF" />
            {/* Cup Lid & Crown */}
            <ellipse cx="50" cy="25" rx="20" ry="4" fill="url(#silver-metal)" stroke="#FFFFFF" strokeWidth="0.8" />
            <path d="M44 25 L47 18 L53 18 L56 25 Z" fill="url(#silver-metal)" />
            <circle cx="50" cy="16" r="3" fill="#E2E8F0" />
          </svg>
        );

      case 'league':
        // Royal League Championship Trophy with Golden Crown & Silver Pedestal
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            <defs>
              <linearGradient id="gold-shine" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="40%" stopColor="#FACC15" />
                <stop offset="70%" stopColor="#CA8A04" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>
            </defs>
            {/* Plinth */}
            <polygon points="26,92 74,92 68,84 32,84" fill="#047857" stroke="#065F46" strokeWidth="1" />
            <rect x="30" y="84" width="40" height="4" fill="url(#gold-shine)" />
            <path d="M44 84 L46 70 L54 70 L56 84 Z" fill="url(#gold-shine)" />
            {/* Vase */}
            <path d="M28 28 C28 62 38 70 50 70 C62 70 72 62 72 28 Z" fill="url(#gold-shine)" stroke="#FEF08A" strokeWidth="1" />
            {/* Crown on top */}
            <path d="M32 28 L36 14 L44 22 L50 12 L56 22 L64 14 L68 28 Z" fill="url(#gold-shine)" stroke="#B45309" strokeWidth="0.8" />
            <circle cx="50" cy="12" r="2.5" fill="#DC2626" />
            <circle cx="36" cy="14" r="2" fill="#2563EB" />
            <circle cx="64" cy="14" r="2" fill="#2563EB" />
            {/* Handles with lions */}
            <path d="M28 34 C16 34 16 54 28 58 L28 52 C20 48 20 40 28 40 Z" fill="url(#gold-shine)" />
            <path d="M72 34 C84 34 84 54 72 58 L72 52 C80 48 80 40 72 40 Z" fill="url(#gold-shine)" />
            {/* Central Badge */}
            <circle cx="50" cy="46" r="9" fill="#065F46" stroke="#FEF08A" strokeWidth="1" />
            <text x="50" y="50" textAnchor="middle" fill="#FEF08A" fontSize="8" fontWeight="bold">1st</text>
          </svg>
        );

      case 'national_cup':
      case 'cup':
        // Classic FA / National Cup
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            <defs>
              <linearGradient id="cup-silver" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor="#CBD5E1" />
                <stop offset="100%" stopColor="#64748B" />
              </linearGradient>
            </defs>
            <rect x="32" y="85" width="36" height="7" rx="2" fill="#0F172A" stroke="#94A3B8" strokeWidth="1" />
            <path d="M43 85 L45 74 L55 74 L57 85 Z" fill="url(#cup-silver)" />
            <path d="M30 30 C30 65 40 74 50 74 C60 74 70 65 70 30 Z" fill="url(#cup-silver)" stroke="#FFFFFF" strokeWidth="1" />
            {/* Dome Lid with Figurine */}
            <ellipse cx="50" cy="30" rx="20" ry="5" fill="url(#cup-silver)" />
            <path d="M35 30 C35 20 65 20 65 30 Z" fill="url(#cup-silver)" stroke="#FFFFFF" strokeWidth="0.8" />
            <circle cx="50" cy="18" r="4" fill="#FACC15" />
            {/* Wide ornate handles */}
            <path d="M30 38 C14 38 14 62 30 66 L30 60 C18 56 18 44 30 44 Z" fill="url(#cup-silver)" />
            <path d="M70 38 C86 38 86 62 70 66 L70 60 C82 56 82 44 70 44 Z" fill="url(#cup-silver)" />
            {/* Red and Blue Ribbon */}
            <path d="M46 34 L38 65 L44 65 L48 40 Z" fill="#DC2626" opacity="0.8" />
            <path d="M54 34 L62 65 L56 65 L52 40 Z" fill="#2563EB" opacity="0.8" />
          </svg>
        );

      case 'national_super_cup':
      case 'supercup':
        // Super Cup Plate / Plaque with Sunburst
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            <defs>
              <linearGradient id="sc-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="50%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#854D0E" />
              </linearGradient>
            </defs>
            <rect x="40" y="85" width="20" height="8" rx="2" fill="#1E293B" />
            <circle cx="50" cy="48" r="38" fill="url(#sc-gold)" stroke="#FEF08A" strokeWidth="2" />
            <circle cx="50" cy="48" r="30" fill="#713F12" stroke="#FEF08A" strokeWidth="1.5" />
            <circle cx="50" cy="48" r="22" fill="url(#sc-gold)" />
            <polygon points="50,34 54,42 64,43 56,49 59,58 50,53 41,58 44,49 36,43 46,42" fill="#FFFFFF" stroke="#CA8A04" strokeWidth="1" />
            <text x="50" y="72" textAnchor="middle" fill="#FEF08A" fontSize="6.5" fontWeight="bold">SUPER CUP</text>
          </svg>
        );

      case 'club_world_cup':
      case 'cwc':
        // FIFA Club World Cup Golden Globe with Pillars
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            <defs>
              <linearGradient id="cwc-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="40%" stopColor="#FACC15" />
                <stop offset="80%" stopColor="#B45309" />
                <stop offset="100%" stopColor="#451A03" />
              </linearGradient>
            </defs>
            {/* Stepped Pedestal */}
            <rect x="25" y="88" width="50" height="6" rx="2" fill="#0F172A" stroke="#CA8A04" strokeWidth="1" />
            <rect x="32" y="82" width="36" height="6" fill="url(#cwc-gold)" />
            {/* 6 Curved Pillars */}
            <path d="M36 82 C34 55 40 40 45 28 L49 28 C45 40 40 55 41 82 Z" fill="url(#cwc-gold)" />
            <path d="M64 82 C66 55 60 40 55 28 L51 28 C55 40 60 55 59 82 Z" fill="url(#cwc-gold)" />
            <rect x="47" y="28" width="6" height="54" fill="url(#cwc-gold)" />
            {/* Golden Globe on top */}
            <circle cx="50" cy="22" r="14" fill="url(#cwc-gold)" stroke="#FEF08A" strokeWidth="1.5" />
            {/* Globe Latitudes */}
            <ellipse cx="50" cy="22" rx="14" ry="6" fill="none" stroke="#78350F" strokeWidth="0.8" opacity="0.6" />
            <ellipse cx="50" cy="22" rx="6" ry="14" fill="none" stroke="#78350F" strokeWidth="0.8" opacity="0.6" />
          </svg>
        );

      case 'european_super_cup':
      case 'uefa_supercup':
      default:
        // UEFA Super Cup tall slender chalice
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            <defs>
              <linearGradient id="usc-silver" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="40%" stopColor="#E2E8F0" />
                <stop offset="80%" stopColor="#64748B" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
            </defs>
            <rect x="36" y="86" width="28" height="6" rx="2" fill="#1E293B" stroke="#94A3B8" strokeWidth="1" />
            <path d="M46 86 L47 70 L53 70 L54 86 Z" fill="url(#usc-silver)" />
            {/* Tall Elegant Flute */}
            <path d="M34 22 C34 56 42 70 50 70 C58 70 66 56 66 22 Z" fill="url(#usc-silver)" stroke="#FFFFFF" strokeWidth="1" />
            {/* Super Cup Ring Handles */}
            <path d="M34 32 C24 32 24 50 34 54 L34 48 C28 46 28 38 34 38 Z" fill="url(#usc-silver)" />
            <path d="M66 32 C76 32 76 50 66 54 L66 48 C72 46 72 38 66 38 Z" fill="url(#usc-silver)" />
            <ellipse cx="50" cy="22" rx="16" ry="4" fill="url(#usc-silver)" stroke="#FFFFFF" strokeWidth="0.8" />
            {/* Gold Central Band */}
            <rect x="42" y="44" width="16" height="5" fill="#FACC15" stroke="#CA8A04" strokeWidth="0.5" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center group ${sizeMap[size]} ${className}`}
      title={title}
    >
      {showShine && (
        <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-lg -z-10 group-hover:bg-amber-400/35 transition-colors" />
      )}
      <div className="w-full h-full transition-transform duration-300 group-hover:scale-110">
        {renderTrophySvg()}
      </div>

      {count !== undefined && count > 1 && (
        <div className="absolute -top-1 -right-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-[10px] px-1.5 py-0.5 rounded-full border border-amber-300 shadow-md font-mono-stat">
          ×{count}
        </div>
      )}
    </div>
  );
};
