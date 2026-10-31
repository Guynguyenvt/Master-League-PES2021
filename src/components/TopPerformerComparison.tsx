import React, { useState } from 'react';
import { Player, SeasonStats } from '../types';
import {
  Flame,
  Zap,
  Crown,
  Award,
  Calendar,
  Camera,
  Sparkles,
  Trophy,
} from 'lucide-react';

interface TopPerformerComparisonProps {
  players: Player[];
  seasons: SeasonStats[];
  onUploadPlayerAvatar?: (playerName: string, playerId: string) => void;
}

export const TopPerformerComparison: React.FC<TopPerformerComparisonProps> = ({
  players,
  seasons,
  onUploadPlayerAvatar,
}) => {
  // Sort players for Top Scorers & Top Assists
  const sortedScorers = [...players].sort((a, b) => b.goals - a.goals);
  const sortedAssisters = [...players].sort((a, b) => b.assists - a.assists);

  const topScorerAllTime = sortedScorers[0];
  const topAssisterAllTime = sortedAssisters[0];

  // Find single-season records across all seasons
  let highestSeasonGoals = 0;
  let highestSeasonGoalsPlayer = '';
  let highestSeasonGoalsSeason = '';

  let highestSeasonAssists = 0;
  let highestSeasonAssistsPlayer = '';
  let highestSeasonAssistsSeason = '';

  seasons.forEach((s) => {
    if (s.topScorer.goals > highestSeasonGoals) {
      highestSeasonGoals = s.topScorer.goals;
      highestSeasonGoalsPlayer = s.topScorer.playerName;
      highestSeasonGoalsSeason = s.seasonName;
    }
    if (s.topAssist.assists > highestSeasonAssists) {
      highestSeasonAssists = s.topAssist.assists;
      highestSeasonAssistsPlayer = s.topAssist.playerName;
      highestSeasonAssistsSeason = s.seasonName;
    }
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'scorers' | 'assists' | 'seasons'>('all');

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="rounded-3xl ios-glass-card p-4 sm:p-5 border border-slate-700/60 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-400" /> THỐNG KÊ NGÔI SAO
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Vua Phá Lưới & Vua Kiến Tạo
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ghi nhiều nhất bao nhiêu bàn • Kiến tạo nhiều nhất bao nhiêu lần
            </p>
          </div>

          {/* Quick Segment Filter */}
          <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800 self-start sm:self-auto flex-wrap gap-1">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeFilter === 'all'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tất Cả
            </button>
            <button
              onClick={() => setActiveFilter('scorers')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                activeFilter === 'scorers'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" /> Vua Phá Lưới
            </button>
            <button
              onClick={() => setActiveFilter('assists')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                activeFilter === 'assists'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Vua Kiến Tạo
            </button>
            <button
              onClick={() => setActiveFilter('seasons')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                activeFilter === 'seasons'
                  ? 'bg-indigo-500 text-white shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" /> Theo Từng Mùa
            </button>
          </div>
        </div>
      </div>

      {/* Top 2 Spotlight Cards: Kỷ Lục Bàn Thắng & Kỷ Lục Kiến Tạo */}
      {(activeFilter === 'all' || activeFilter === 'scorers' || activeFilter === 'assists') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Top Scorer Showcase Card */}
          {topScorerAllTime && (
            <div className="rounded-3xl ios-glass-card p-5 border border-amber-500/40 relative overflow-hidden bg-gradient-to-br from-amber-950/20 via-slate-900/90 to-slate-900/95 shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" /> GHI NHIỀU BÀN NHẤT CLB
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  Hạng 1 Bàn Thắng
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div
                  onClick={() => onUploadPlayerAvatar?.(topScorerAllTime.name, topScorerAllTime.id)}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-800 border-2 border-amber-400 shadow-xl shrink-0 relative group cursor-pointer"
                  title="Bấm để tải ảnh thực tế cầu thủ"
                >
                  <img
                    src={topScorerAllTime.avatarUrl}
                    alt={topScorerAllTime.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-[9px] text-amber-300 font-bold">
                    <Camera className="w-4 h-4 mb-0.5" />
                    <span>Đổi Ảnh</span>
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-lg sm:text-xl font-black text-white truncate">
                    {topScorerAllTime.name}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span className="font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-500/30">
                      {topScorerAllTime.position}
                    </span>
                    <span>{topScorerAllTime.nationality}</span>
                  </div>

                  <div className="mt-2.5 flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono-stat">
                      {topScorerAllTime.goals}
                    </span>
                    <span className="text-xs font-bold text-slate-300 uppercase">Tổng Bàn Thắng</span>
                  </div>
                </div>
              </div>

              {highestSeasonGoals > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Kỷ lục mùa ({highestSeasonGoalsSeason}):</span>
                  <span className="text-amber-300 font-bold font-mono">
                    {highestSeasonGoalsPlayer} ({highestSeasonGoals} bàn)
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Top Assister Showcase Card */}
          {topAssisterAllTime && (
            <div className="rounded-3xl ios-glass-card p-5 border border-cyan-500/40 relative overflow-hidden bg-gradient-to-br from-cyan-950/20 via-slate-900/90 to-slate-900/95 shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-cyan-400" /> KIẾN TẠO NHIỀU NHẤT CLB
                </span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded-full border border-cyan-500/30">
                  Hạng 1 Kiến Tạo
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div
                  onClick={() => onUploadPlayerAvatar?.(topAssisterAllTime.name, topAssisterAllTime.id)}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-800 border-2 border-cyan-400 shadow-xl shrink-0 relative group cursor-pointer"
                  title="Bấm để tải ảnh thực tế cầu thủ"
                >
                  <img
                    src={topAssisterAllTime.avatarUrl}
                    alt={topAssisterAllTime.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-[9px] text-cyan-300 font-bold">
                    <Camera className="w-4 h-4 mb-0.5" />
                    <span>Đổi Ảnh</span>
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-lg sm:text-xl font-black text-white truncate">
                    {topAssisterAllTime.name}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span className="font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-500/30">
                      {topAssisterAllTime.position}
                    </span>
                    <span>{topAssisterAllTime.nationality}</span>
                  </div>

                  <div className="mt-2.5 flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono-stat">
                      {topAssisterAllTime.assists}
                    </span>
                    <span className="text-xs font-bold text-slate-300 uppercase">Tổng Kiến Tạo</span>
                  </div>
                </div>
              </div>

              {highestSeasonAssists > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Kỷ lục mùa ({highestSeasonAssistsSeason}):</span>
                  <span className="text-cyan-300 font-bold font-mono">
                    {highestSeasonAssistsPlayer} ({highestSeasonAssists} KT)
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2 Main Ranking Lists: Top Goals & Top Assists */}
      {(activeFilter === 'all' || activeFilter === 'scorers' || activeFilter === 'assists') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* List 1: Bảng Xếp Hạng Vua Phá Lưới (Bàn Thắng) */}
          {(activeFilter === 'all' || activeFilter === 'scorers') && (
            <div className="rounded-3xl ios-glass-card p-4 sm:p-5 border border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" /> Bảng Vàng Chân Sút Ghi Nhiều Bàn Nhất
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Top {sortedScorers.length} cầu thủ</span>
              </div>

              <div className="space-y-2">
                {sortedScorers.map((player, idx) => (
                  <div
                    key={player.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition ${
                      idx === 0
                        ? 'bg-amber-950/20 border-amber-500/40 shadow-sm'
                        : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                          idx === 0
                            ? 'bg-amber-400 text-slate-950 font-black'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-950 font-black'
                            : idx === 2
                            ? 'bg-amber-700 text-white font-black'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {idx + 1}
                      </span>

                      <div
                        onClick={() => onUploadPlayerAvatar?.(player.name, player.id)}
                        className="cursor-pointer relative group shrink-0"
                        title="Bấm để đổi ảnh thực tế"
                      >
                        <img
                          src={player.avatarUrl}
                          alt={player.name}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-xl object-cover bg-slate-800 border border-slate-700 group-hover:border-amber-400 transition"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-[8px] text-amber-300 font-bold">
                          Đổi
                        </div>
                      </div>

                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                          {player.name}
                          {idx === 0 && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <span className="text-amber-400 font-semibold">{player.position}</span>
                          <span>•</span>
                          <span>{player.nationality}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base sm:text-lg font-black text-amber-300 font-mono-stat">
                        {player.goals} Bàn
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {player.assists} kiến tạo
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* List 2: Bảng Xếp Hạng Vua Kiến Tạo */}
          {(activeFilter === 'all' || activeFilter === 'assists') && (
            <div className="rounded-3xl ios-glass-card p-4 sm:p-5 border border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-cyan-400" /> Bảng Vàng Chân Chuyền Kiến Tạo Nhiều Nhất
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Top {sortedAssisters.length} cầu thủ</span>
              </div>

              <div className="space-y-2">
                {sortedAssisters.map((player, idx) => (
                  <div
                    key={player.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition ${
                      idx === 0
                        ? 'bg-cyan-950/20 border-cyan-500/40 shadow-sm'
                        : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                          idx === 0
                            ? 'bg-cyan-400 text-slate-950 font-black'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-950 font-black'
                            : idx === 2
                            ? 'bg-amber-700 text-white font-black'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {idx + 1}
                      </span>

                      <div
                        onClick={() => onUploadPlayerAvatar?.(player.name, player.id)}
                        className="cursor-pointer relative group shrink-0"
                        title="Bấm để đổi ảnh thực tế"
                      >
                        <img
                          src={player.avatarUrl}
                          alt={player.name}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-xl object-cover bg-slate-800 border border-slate-700 group-hover:border-cyan-400 transition"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-[8px] text-cyan-300 font-bold">
                          Đổi
                        </div>
                      </div>

                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                          {player.name}
                          {idx === 0 && <Crown className="w-3.5 h-3.5 text-cyan-400" />}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <span className="text-cyan-400 font-semibold">{player.position}</span>
                          <span>•</span>
                          <span>{player.nationality}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base sm:text-lg font-black text-cyan-300 font-mono-stat">
                        {player.assists} Kiến Tạo
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {player.goals} bàn thắng
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Season-by-Season Top Scorers & Top Assists Records */}
      {(activeFilter === 'all' || activeFilter === 'seasons') && (
        <div className="rounded-3xl ios-glass-card p-4 sm:p-5 border border-slate-700/60 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-400" /> Vua Phá Lưới & Kiến Tạo Qua Từng Mùa Giải
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">{seasons.length} Mùa</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {seasons.map((s) => (
              <div
                key={s.id}
                className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">{s.seasonName}</span>
                    {s.isCurrentSeason && (
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                        Hiện tại
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">{s.leagueName}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Top Scorer of season */}
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Vua Phá Lưới</div>
                      <div className="text-xs font-bold text-white truncate">{s.topScorer.playerName}</div>
                      <div className="text-xs font-black text-amber-300 font-mono mt-0.5">
                        {s.topScorer.goals} Bàn
                      </div>
                    </div>
                  </div>

                  {/* Top Assist of season */}
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Vua Kiến Tạo</div>
                      <div className="text-xs font-bold text-white truncate">{s.topAssist.playerName}</div>
                      <div className="text-xs font-black text-cyan-300 font-mono mt-0.5">
                        {s.topAssist.assists} Kiến Tạo
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
