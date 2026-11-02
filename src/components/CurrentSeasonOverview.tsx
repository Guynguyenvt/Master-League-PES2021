import React from 'react';
import { SeasonStats, Club } from '../types';
import { ClubBadge3D } from './ClubBadge3D';
import { Trophy3D } from './Trophy3D';
import { formatFullCurrency, formatProfitFull } from '../utils/currency';
import { DEFAULT_AVATAR } from '../utils/performers';
import {
  Trophy,
  Flame,
  Zap,
  Sparkles,
  Wallet,
  Camera,
  Pencil,
} from 'lucide-react';

interface CurrentSeasonOverviewProps {
  season: SeasonStats;
  club: Club;
  onViewPlayerDetail?: (playerId: string) => void;
  onUploadPlayerAvatar?: (playerName: string, playerId: string) => void;
  onUploadClubLogo?: (clubId: string) => void;
  onEditPerformer?: (seasonId: string, kind: 'scorer' | 'assist') => void;
}

export const CurrentSeasonOverview: React.FC<CurrentSeasonOverviewProps> = ({
  season,
  club,
  onViewPlayerDetail,
  onUploadPlayerAvatar,
  onUploadClubLogo,
  onEditPerformer,
}) => {
  const profit = season.endTransferBudget - season.startTransferBudget;
  const profitPercent =
    season.startTransferBudget > 0
      ? ((profit / season.startTransferBudget) * 100).toFixed(1)
      : '0.0';

  const cups = [
    {
      title: 'Cúp Quốc Gia',
      type: 'national_cup' as const,
      data: season.nationalCup,
    },
    {
      title: 'Siêu Cúp QG',
      type: 'national_super_cup' as const,
      data: season.nationalSuperCup,
    },
    {
      title: 'Cúp Châu Âu / Châu Lục',
      type: 'european_cup' as const,
      data: season.europeanCup,
    },
    {
      title: 'Siêu Cúp Châu Âu',
      type: 'european_super_cup' as const,
      data: season.europeanSuperCup,
    },
    {
      title: 'Cúp CLB Thế Giới',
      type: 'club_world_cup' as const,
      data: season.clubWorldCup,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Current Season Hero Card */}
      <div className="relative overflow-hidden rounded-3xl ios-glass-card p-5 sm:p-6 text-white border border-slate-700/60 shadow-2xl">
        {/* Glow Accent */}
        <div
          className="absolute -top-12 -left-12 w-64 h-64 rounded-full blur-3xl opacity-25 -z-10"
          style={{ backgroundColor: club.primaryColor }}
        />

        {/* Top Header: Badge, Club & Season Tag */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div
              className="cursor-pointer group relative"
              onClick={() => onUploadClubLogo?.(club.id)}
              title="Bấm để đổi Logo CLB"
            >
              <ClubBadge3D club={club} size="lg" />
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-[9px] text-cyan-300 font-bold">
                Đổi Logo
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> MÙA HIỆN TẠI
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {season.seasonName}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">
                {club.name}
              </h2>
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>{season.leagueName}</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-semibold font-mono">
                  Hạng {season.leaguePosition} / {season.totalTeams} CLB
                </span>
              </div>
            </div>
          </div>

          {/* Form Guide */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
              Phong độ gần đây
            </span>
            <div className="flex gap-1">
              {season.recentForm.map((res, i) => (
                <span
                  key={i}
                  className={`w-6 h-6 rounded-md flex items-center justify-center font-mono text-xs font-bold shadow-sm ${
                    res === 'W'
                      ? 'bg-emerald-600 text-white'
                      : res === 'D'
                      ? 'bg-amber-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {res}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* League Table Stats Grid (Trận, Thắng, Hòa, Thua, Bàn Thắng, Bàn Thua, Hiệu Số, Điểm) */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mt-4 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-900/50 rounded-2xl p-2.5 text-center border border-slate-800/70">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Trận (P)</div>
            <div className="text-lg font-black text-white font-mono-stat">{season.played}</div>
          </div>
          <div className="bg-slate-900/50 rounded-2xl p-2.5 text-center border border-slate-800/70">
            <div className="text-[10px] text-emerald-400 font-bold uppercase">Thắng (W)</div>
            <div className="text-lg font-black text-emerald-400 font-mono-stat">{season.won}</div>
          </div>
          <div className="bg-slate-900/50 rounded-2xl p-2.5 text-center border border-slate-800/70">
            <div className="text-[10px] text-amber-400 font-bold uppercase">Hòa (D)</div>
            <div className="text-lg font-black text-amber-400 font-mono-stat">{season.drawn}</div>
          </div>
          <div className="bg-slate-900/50 rounded-2xl p-2.5 text-center border border-slate-800/70">
            <div className="text-[10px] text-rose-400 font-bold uppercase">Thua (L)</div>
            <div className="text-lg font-black text-rose-400 font-mono-stat">{season.lost}</div>
          </div>
          <div className="bg-slate-900/50 rounded-2xl p-2.5 text-center border border-slate-800/70">
            <div className="text-[10px] text-cyan-400 font-bold uppercase">Bàn Ghi (GF)</div>
            <div className="text-lg font-black text-cyan-300 font-mono-stat">{season.goalsFor}</div>
          </div>
          <div className="bg-slate-900/50 rounded-2xl p-2.5 text-center border border-slate-800/70">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Bàn Thua (GA)</div>
            <div className="text-lg font-black text-slate-300 font-mono-stat">{season.goalsAgainst}</div>
          </div>
          <div className="bg-slate-900/50 rounded-2xl p-2.5 text-center border border-slate-800/70">
            <div className="text-[10px] text-indigo-400 font-bold uppercase">Hiệu Số (GD)</div>
            <div className="text-lg font-black text-indigo-300 font-mono-stat">
              {season.goalDifference > 0 ? `+${season.goalDifference}` : season.goalDifference}
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-600/30 to-amber-950/50 rounded-2xl p-2.5 text-center border border-amber-500/40">
            <div className="text-[10px] text-amber-300 font-bold uppercase">Điểm Số</div>
            <div className="text-xl font-black text-amber-300 font-mono-stat">{season.points}</div>
          </div>
        </div>

        {/* Mobile Form display */}
        <div className="sm:hidden flex items-center justify-between mt-3 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
          <span>Phong độ gần đây:</span>
          <div className="flex gap-1">
            {season.recentForm.map((res, i) => (
              <span
                key={i}
                className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[10px] font-bold ${
                  res === 'W'
                    ? 'bg-emerald-600 text-white'
                    : res === 'D'
                    ? 'bg-amber-600 text-white'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {res}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 5 Cup Competitions of Season */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Đấu Trường & Danh Hiệu Cúp Mùa Này (Kèm Siêu Cúp)
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">5 Giải Đấu Cúp</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {cups.map((cup, idx) => {
            const isWon = cup.data.isWon;
            const isRunnerUp = cup.data.roundReached === 'Á quân';
            const isNotParticipating = cup.data.roundReached === 'Không tham dự';
            const isFinalist = isWon || isRunnerUp;

            return (
              <div
                key={idx}
                className={`relative overflow-hidden rounded-2xl p-3 border transition flex flex-col justify-between ${
                  isWon
                    ? 'bg-gradient-to-b from-amber-950/40 via-slate-900/80 to-slate-900/90 border-amber-500/50 shadow-lg shadow-amber-500/10'
                    : isRunnerUp
                    ? 'bg-slate-900/70 border-slate-600'
                    : isNotParticipating
                    ? 'bg-slate-950/40 border-slate-900 opacity-60'
                    : 'bg-slate-900/40 border-slate-800/60 opacity-85'
                }`}
              >
                {isWon && (
                  <div className="absolute top-1.5 right-1.5 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                    VÔ ĐỊCH
                  </div>
                )}
                {isRunnerUp && (
                  <div className="absolute top-1.5 right-1.5 bg-slate-700 text-slate-200 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                    Á QUÂN
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <Trophy3D type={cup.type} size="sm" showShine={isWon} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-slate-200 truncate">{cup.title}</div>
                    <div className="text-[10px] text-slate-400 truncate" title={cup.data.name}>
                      {cup.data.name}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1">
                  <span
                    className={`text-[11px] font-bold truncate ${
                      isWon
                        ? 'text-amber-300'
                        : isRunnerUp
                        ? 'text-slate-200'
                        : isNotParticipating
                        ? 'text-slate-500 italic'
                        : 'text-slate-400'
                    }`}
                  >
                    {cup.data.roundReached}
                  </span>

                  {/* ONLY show final score if the team participated and REACHED THE FINAL (Vô địch or Á quân) */}
                  {isFinalist && cup.data.scoreInFinal && (
                    <span
                      className="text-[10px] font-mono text-amber-200 bg-slate-800/90 px-1.5 py-0.5 rounded font-bold shrink-0 border border-slate-700"
                      title="Tỉ số trận chung kết"
                    >
                      {cup.data.scoreInFinal}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Season MVP, Top Scorer, Top Assist & Season Financials */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Top Scorer Card */}
        <div className="rounded-3xl ios-glass-card p-4 border border-slate-700/60 transition group relative">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Flame className="w-3.5 h-3.5" /> Top 1 Ghi Bàn Mùa
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full font-mono">
                {season.topScorer.position}
              </span>
              <button
                onClick={() => onEditPerformer?.(season.id, 'scorer')}
                className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                title="Sửa Top 1 Ghi Bàn"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div
              onClick={() => onUploadPlayerAvatar?.(season.topScorer.playerName, season.topScorer.playerId)}
              className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 group-hover:border-amber-400 transition shrink-0 relative cursor-pointer"
              title="Bấm để đổi ảnh cầu thủ thực tế"
            >
              <img
                src={season.topScorer.avatarUrl || DEFAULT_AVATAR}
                alt={season.topScorer.playerName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-[8px] text-amber-300 font-bold">
                <Camera className="w-3 h-3" />
              </div>
            </div>
            <div
              className="min-w-0 flex-1 cursor-pointer"
              onClick={() => onViewPlayerDetail?.(season.topScorer.playerId)}
            >
              <div className="text-sm font-extrabold text-white truncate hover:text-amber-300 transition">
                {season.topScorer.playerName}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs">
                <span className="text-amber-300 font-bold font-mono text-sm">
                  {season.topScorer.goals} Bàn
                </span>
                <span className="text-cyan-300 font-mono">{season.topScorer.assists} KT</span>
                <span className="text-slate-400">({season.topScorer.matches} trận)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Assist Card */}
        <div className="rounded-3xl ios-glass-card p-4 border border-slate-700/60 transition group relative">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Zap className="w-3.5 h-3.5" /> Top 1 Kiến Tạo Mùa
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded-full font-mono">
                {season.topAssist.position}
              </span>
              <button
                onClick={() => onEditPerformer?.(season.id, 'assist')}
                className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                title="Sửa Top 1 Kiến Tạo"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div
              onClick={() => onUploadPlayerAvatar?.(season.topAssist.playerName, season.topAssist.playerId)}
              className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 group-hover:border-cyan-400 transition shrink-0 relative cursor-pointer"
              title="Bấm để đổi ảnh cầu thủ thực tế"
            >
              <img
                src={season.topAssist.avatarUrl || DEFAULT_AVATAR}
                alt={season.topAssist.playerName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-[8px] text-cyan-300 font-bold">
                <Camera className="w-3 h-3" />
              </div>
            </div>
            <div
              className="min-w-0 flex-1 cursor-pointer"
              onClick={() => onViewPlayerDetail?.(season.topAssist.playerId)}
            >
              <div className="text-sm font-extrabold text-white truncate hover:text-cyan-300 transition">
                {season.topAssist.playerName}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs">
                <span className="text-cyan-300 font-bold font-mono text-sm">
                  {season.topAssist.assists} Kiến Tạo
                </span>
                <span className="text-amber-300 font-mono">{season.topAssist.goals} Bàn</span>
                <span className="text-slate-400">({season.topAssist.matches} trận)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Season Financial Health & Profit/Loss (Full Numbers) */}
        <div className="rounded-3xl ios-glass-card p-4 border border-slate-700/60">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Wallet className="w-3.5 h-3.5" /> Ngân Sách & Lời Lãi
            </span>
            <span
              className={`text-[11px] font-mono font-bold flex items-center gap-0.5 ${
                profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {profit >= 0 ? `+${profitPercent}% Lời` : `${profitPercent}% Lỗ`}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Ngân sách CN:</span>
              <span className="font-mono text-white font-semibold">
                {formatFullCurrency(season.startTransferBudget, '€')} ➔{' '}
                <span className="text-emerald-400">{formatFullCurrency(season.endTransferBudget, '€')}</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Quỹ Lương CLB:</span>
              <span className="font-mono text-white font-semibold">
                {formatFullCurrency(season.startSalaryBudget, '€')} ➔{' '}
                <span className="text-cyan-400">{formatFullCurrency(season.endSalaryBudget, '€')}</span>
              </span>
            </div>
            <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold">Lợi Nhuận Ròng Mùa:</span>
              <span
                className={`font-mono font-extrabold text-sm ${
                  profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatProfitFull(profit, '€')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

