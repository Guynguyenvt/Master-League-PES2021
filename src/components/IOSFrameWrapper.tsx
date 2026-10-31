import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Wallet,
  Crown,
  Users,
  Trophy,
  Plus,
  Wifi,
  Battery,
  Signal,
  Smartphone,
  Cloud,
  CheckCircle2,
} from 'lucide-react';

interface IOSFrameWrapperProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenAddSeason: () => void;
  onOpenCloudBackup: () => void;
  clubName?: string;
  seasonName?: string;
  isServerSynced?: boolean;
}

export const IOSFrameWrapper: React.FC<IOSFrameWrapperProps> = ({
  children,
  activeTab,
  onTabChange,
  onOpenAddSeason,
  onOpenCloudBackup,
  clubName = 'Master League',
  seasonName = '2023 - 2024',
  isServerSynced = true,
}) => {
  const [isPhoneFrame, setIsPhoneFrame] = useState(false);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Tổng Quan',
      icon: LayoutDashboard,
      badge3D: '🏟️',
    },
    {
      id: 'seasons',
      label: 'Mùa Giải',
      icon: Calendar,
      badge3D: '📅',
    },
    {
      id: 'finances',
      label: 'Tài Chính',
      icon: Wallet,
      badge3D: '💰',
    },
    {
      id: 'stars',
      label: 'Ngôi Sao',
      icon: Crown,
      badge3D: '👑',
    },
    {
      id: 'trophies',
      label: 'Phòng Cúp',
      icon: Trophy,
      badge3D: '🏆',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col items-center justify-start relative selection:bg-cyan-500/30">
      {/* Top Floating Control Bar for Frame Switch & Quick Actions */}
      <header className="w-full bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40 px-3 sm:px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-lg font-black shadow-md">
            ⚽
          </div>
          <div>
            <div className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
              MASTER LEAGUE <span className="text-amber-400">PES 2021</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-1.5 py-0.2 rounded border border-cyan-500/30">
                iOS
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
              <span>{clubName}</span>
              <span>•</span>
              <span className="text-amber-300 font-mono">{seasonName}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions, Cloud Sync & View Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Cloud Auto-Sync Indicator & Button */}
          <button
            onClick={onOpenCloudBackup}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 font-bold text-xs border border-slate-800 hover:border-cyan-500/40 transition cursor-pointer active:scale-95 shadow-sm"
            title="Đồng bộ & Sao lưu máy chủ (iCloud, Google Drive, OneDrive, Dropbox, Mã PIN)"
          >
            <Cloud className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-bold text-slate-200">
              Đồng bộ & Sao lưu
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </button>

          <button
            onClick={onOpenAddSeason}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Thêm Mùa
          </button>

          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition border border-slate-700 cursor-pointer"
            title={isPhoneFrame ? 'Chế độ Mở rộng Màn hình' : 'Chế độ Khung iPhone'}
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">{isPhoneFrame ? 'Full Màn Hình' : 'Khung iPhone'}</span>
          </button>
        </div>
      </header>

      {/* Main Container (Supports iPhone Device Frame or Responsive Fluid Layout) */}
      <main
        className={`w-full transition-all duration-300 flex-1 flex justify-center ${
          isPhoneFrame
            ? 'p-4 sm:p-6 max-w-[440px]'
            : 'max-w-6xl px-3 sm:px-6 py-4'
        }`}
      >
        <div
          className={`w-full transition-all duration-300 relative flex flex-col ${
            isPhoneFrame
              ? 'rounded-[50px] border-[10px] border-slate-800 bg-[#090d16] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden min-h-[840px] max-h-[92vh]'
              : 'rounded-none'
          }`}
        >
          {/* iPhone Dynamic Island & Status Bar (in Phone Frame mode) */}
          {isPhoneFrame && (
            <div className="pt-3 px-6 pb-2 bg-[#090d16] shrink-0 select-none flex items-center justify-between text-white text-xs border-b border-slate-800/60 z-30">
              <span className="font-bold font-mono tracking-tight text-[11px]">9:41</span>
              {/* Dynamic Island Pill */}
              <div className="w-28 h-6 bg-black rounded-full flex items-center justify-center gap-2 px-2 border border-slate-800 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[9px] font-bold text-slate-300 truncate">PES 2021 ML</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Signal className="w-3 h-3" />
                <Wifi className="w-3 h-3" />
                <Battery className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
          )}

          {/* Scrollable App Content Area */}
          <div className="flex-1 overflow-y-auto pb-24 sm:pb-28 hide-scrollbar">
            {children}
          </div>

          {/* iOS Floating Bottom Tab Bar */}
          <nav className="fixed sm:sticky bottom-0 left-0 right-0 z-40 p-2 sm:p-3 flex justify-center pointer-events-none">
            <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-2xl border border-slate-800/90 rounded-full px-3 py-2 shadow-2xl flex items-center justify-around gap-1 sm:gap-2 max-w-lg w-full">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`flex flex-col items-center justify-center px-2 py-1 rounded-2xl transition relative group cursor-pointer ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-cyan-500/15 rounded-2xl border border-cyan-500/40 -z-10 shadow-sm" />
                    )}
                    <div className="text-base sm:text-lg mb-0.5 leading-none transition-transform group-hover:scale-110">
                      {item.badge3D}
                    </div>
                    <span
                      className={`text-[10px] font-extrabold tracking-tight ${
                        isActive ? 'text-cyan-300 font-black' : 'text-slate-400'
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}

              {/* Mobile Quick Add Season Button */}
              <button
                onClick={onOpenAddSeason}
                className="sm:hidden flex flex-col items-center justify-center px-2 py-1 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[10px] shadow"
                title="Thêm Mùa Mới"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Mùa</span>
              </button>
            </div>
          </nav>
        </div>
      </main>
    </div>
  );
};
