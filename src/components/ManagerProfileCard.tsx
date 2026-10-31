import React from 'react';
import { Manager, Club, ClubTenure, SeasonStats } from '../types';
import { ClubBadge3D } from './ClubBadge3D';
import { formatProfitFull } from '../utils/currency';
import {
  Award,
  Briefcase,
  UserCheck,
  ChevronRight,
  Camera,
  Upload,
  Trophy,
} from 'lucide-react';

interface ManagerProfileCardProps {
  manager: Manager;
  clubs: Club[];
  tenures: ClubTenure[];
  seasons: SeasonStats[];
  onSelectClub?: (clubId: string) => void;
  onOpenManagerSwitcher?: () => void;
  onUploadManagerAvatar?: () => void;
  onUploadClubLogo?: (clubId: string) => void;
}

export const ManagerProfileCard: React.FC<ManagerProfileCardProps> = ({
  manager,
  clubs,
  tenures,
  seasons,
  onSelectClub,
  onOpenManagerSwitcher,
  onUploadManagerAvatar,
  onUploadClubLogo,
}) => {
  const currentClub = clubs.find((c) => c.id === manager.currentClubId);
  const managerTenures = tenures.filter((t) => t.managerId === manager.id);
  const managerSeasons = seasons.filter((s) => s.managerId === manager.id);

  // Career Totals
  const totalMatches = managerSeasons.reduce((acc, s) => acc + s.played, 0);
  const totalWins = managerSeasons.reduce((acc, s) => acc + s.won, 0);
  const winRate = totalMatches > 0 ? ((totalWins / totalMatches) * 100).toFixed(1) : '0.0';
  const totalTrophies = managerTenures.reduce((acc, t) => acc + t.trophiesWon, 0);

  // Total profit generated
  const totalProfit = managerTenures.reduce(
    (acc, t) => acc + (t.currentOrEndTransferBudget - t.startTransferBudget),
    0
  );

  return (
    <div className="relative overflow-hidden rounded-3xl ios-glass-card p-5 sm:p-6 text-white border border-slate-700/50 shadow-2xl">
      {/* Background ambient lighting */}
      <div
        className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-20 -z-10 pointer-events-none"
        style={{ backgroundColor: currentClub?.primaryColor || '#3B82F6' }}
      />

      {/* Top Header: Manager Avatar, Identity & Reputation */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="relative group">
            <div
              onClick={onUploadManagerAvatar}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-0.5 bg-gradient-to-tr from-amber-400 via-rose-500 to-cyan-400 shadow-xl overflow-hidden cursor-pointer relative"
              title="Bấm để tải ảnh HLV thực tế"
            >
              <img
                src={manager.avatarUrl}
                alt={manager.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-2xl bg-slate-800"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-[10px] text-cyan-300 font-bold">
                <Camera className="w-4 h-4 mb-0.5" />
                <span>Đổi Ảnh</span>
              </div>
            </div>
            <div
              onClick={onOpenManagerSwitcher}
              className="absolute -bottom-1.5 -right-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full p-1 border-2 border-slate-900 shadow cursor-pointer"
              title="Chuyển HLV"
            >
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
                {manager.nationality} • {manager.age} Tuổi
              </span>
              <button
                onClick={onOpenManagerSwitcher}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-0.5 underline transition cursor-pointer"
              >
                Đổi HLV <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1 tracking-tight flex items-center gap-2">
              {manager.name}
            </h1>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {manager.tacticalStyle}
            </p>
          </div>
        </div>

        {/* Current Club 3D Badge with Click to Upload Logo */}
        {currentClub && (
          <div
            onClick={() => onUploadClubLogo?.(currentClub.id)}
            className="flex flex-col items-center bg-slate-900/60 hover:bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700/60 cursor-pointer transition group"
            title={`Bấm để đổi Logo thực tế: ${currentClub.name}`}
          >
            <div className="relative">
              <ClubBadge3D club={currentClub} size="md" />
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-[9px] text-cyan-300 font-bold">
                Đổi Logo
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-300 mt-1 uppercase tracking-wider">
              {currentClub.shortName}
            </span>
          </div>
        )}
      </div>

      {/* Career Quick Metrics Bar */}
      <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
        <div className="bg-slate-900/40 rounded-xl p-2 border border-slate-800/60">
          <div className="text-[10px] text-slate-400 uppercase font-bold">Số CLB</div>
          <div className="text-lg font-black text-white font-mono-stat">{managerTenures.length}</div>
        </div>
        <div className="bg-slate-900/40 rounded-xl p-2 border border-slate-800/60">
          <div className="text-[10px] text-slate-400 uppercase font-bold">Trận Đấu</div>
          <div className="text-lg font-black text-cyan-400 font-mono-stat">{totalMatches}</div>
        </div>
        <div className="bg-slate-900/40 rounded-xl p-2 border border-slate-800/60">
          <div className="text-[10px] text-slate-400 uppercase font-bold">Thắng %</div>
          <div className="text-lg font-black text-emerald-400 font-mono-stat">{winRate}%</div>
        </div>
        <div className="bg-slate-900/40 rounded-xl p-2 border border-slate-800/60">
          <div className="text-[10px] text-amber-400 font-bold flex items-center justify-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>SỐ CÚP</span>
          </div>
          <div className="text-lg font-black text-amber-400 font-mono-stat">{totalTrophies}</div>
        </div>
      </div>

      {/* Career Club Timeline (Các CLB đã dẫn dắt) */}
      <div className="mt-4">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-cyan-400" /> Hành Trình Dẫn Dắt Qua Các Mùa
          </span>
          <span className="text-[11px] text-emerald-400 font-mono font-semibold">
            Tổng Lời: {formatProfitFull(totalProfit, '€')}
          </span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1.5 hide-scrollbar">
          {managerTenures.map((tenure) => {
            const clubObj = clubs.find((c) => c.id === tenure.clubId);
            const profit = tenure.currentOrEndTransferBudget - tenure.startTransferBudget;
            return (
              <div
                key={tenure.id}
                onClick={() => onSelectClub?.(tenure.clubId)}
                className={`shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-2xl border transition cursor-pointer ${
                  tenure.isCurrent
                    ? 'bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border-blue-500/50 shadow-lg shadow-blue-500/10'
                    : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800'
                }`}
              >
                <ClubBadge3D club={clubObj} size="sm" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{tenure.clubName}</span>
                    {tenure.isCurrent && (
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                        Hiện tại
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{tenure.startSeason.split(' ')[0]} - {tenure.endSeason.split(' ')[0]}</span>
                    <span className="text-amber-300 font-semibold font-mono">🏆 {tenure.trophiesWon}</span>
                    <span className={`font-mono font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatProfitFull(profit, '€')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
