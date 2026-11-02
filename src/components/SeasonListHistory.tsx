import React, { useState } from 'react';
import { SeasonStats, Club } from '../types';
import { ClubBadge3D } from './ClubBadge3D';
import { Trophy3D } from './Trophy3D';
import { formatFullCurrency, formatProfitFull } from '../utils/currency';
import { DEFAULT_AVATAR } from '../utils/performers';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Flame,
  Zap,
  TrendingUp,
  Award,
  Wallet,
  Sparkles,
  Trash2,
  AlertTriangle,
  Plus,
  Pencil,
} from 'lucide-react';

interface SeasonListHistoryProps {
  seasons: SeasonStats[];
  clubs: Club[];
  onSelectSeason?: (seasonId: string) => void;
  onDeleteSeason?: (seasonId: string) => void;
  onOpenAddSeason?: () => void;
  onEditPerformer?: (seasonId: string, kind: 'scorer' | 'assist') => void;
  onUploadPlayerAvatar?: (playerName: string, playerId: string) => void;
}

export const SeasonListHistory: React.FC<SeasonListHistoryProps> = ({
  seasons,
  clubs,
  onSelectSeason,
  onDeleteSeason,
  onOpenAddSeason,
  onEditPerformer,
  onUploadPlayerAvatar,
}) => {
  const [expandedSeasonId, setExpandedSeasonId] = useState<string | null>(
    seasons[0]?.id || null
  );
  const [seasonToDelete, setSeasonToDelete] = useState<SeasonStats | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedSeasonId((prev) => (prev === id ? null : id));
  };

  const handleDeleteConfirm = () => {
    if (seasonToDelete && onDeleteSeason) {
      onDeleteSeason(seasonToDelete.id);
      setSeasonToDelete(null);
    }
  };

  if (seasons.length === 0) {
    return (
      <div className="p-8 rounded-3xl ios-glass-card border border-slate-800 text-center space-y-3 my-4">
        <div className="w-12 h-12 rounded-full bg-slate-800/80 text-amber-400 flex items-center justify-center mx-auto text-xl">
          📅
        </div>
        <h4 className="text-base font-bold text-white">Chưa Có Dữ Liệu Mùa Giải</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Tất cả dữ liệu mùa giải mẫu đã được xóa hoặc chưa được tạo. Hãy bấm vào nút bên dưới để tạo mùa giải đầu tiên của bạn!
        </p>
        {onOpenAddSeason && (
          <button
            onClick={onOpenAddSeason}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" /> Thêm Mùa Giải Mới
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          Chi Tiết Toàn Bộ Lịch Sử Các Mùa Giải ({seasons.length} Mùa)
        </h3>
        <span className="text-[11px] text-slate-400">Chọn từng mùa để xem chi tiết hoặc xóa</span>
      </div>

      <div className="space-y-3">
        {seasons.map((season) => {
          const club = clubs.find((c) => c.id === season.clubId);
          const isExpanded = expandedSeasonId === season.id;
          const profit = season.endTransferBudget - season.startTransferBudget;

          const trophiesWon = [
            season.nationalCup.isWon,
            season.nationalSuperCup.isWon,
            season.europeanCup.isWon,
            season.europeanSuperCup.isWon,
            season.clubWorldCup.isWon,
            season.leaguePosition === 1,
          ].filter(Boolean).length;

          return (
            <div
              key={season.id}
              className={`rounded-3xl transition border overflow-hidden ${
                season.isCurrentSeason
                  ? 'ios-glass-card border-amber-500/40 shadow-lg'
                  : 'bg-slate-900/60 hover:bg-slate-900/80 border-slate-800'
              }`}
            >
              {/* Header clickable bar */}
              <div
                onClick={() => toggleExpand(season.id)}
                className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <ClubBadge3D club={club} size="md" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm sm:text-base font-extrabold text-white">
                        {season.seasonName}
                      </span>
                      {season.isCurrentSeason && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-500/30 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> ĐANG ĐÁ
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{club?.name}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-300 mt-1 flex-wrap">
                      <span className="font-semibold text-emerald-400">
                        {season.leaguePosition === 1 ? '🏆 Vô địch VĐQG' : `Hạng ${season.leaguePosition}`}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-slate-400">
                        {season.played} trận: {season.won}T - {season.drawn}H - {season.lost}B ({season.points} Điểm)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="hidden sm:flex flex-col items-end text-right">
                    <span className="text-xs font-bold text-amber-300 font-mono">
                      🏆 {trophiesWon} Danh hiệu
                    </span>
                    <span
                      className={`text-[11px] font-mono font-bold ${
                        profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatProfitFull(profit, '€')}
                    </span>
                  </div>

                  {onDeleteSeason && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSeasonToDelete(season);
                      }}
                      title="Xóa dữ liệu mùa giải này"
                      className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 rounded-xl bg-slate-800/60 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <button className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded Detailed Breakdown */}
              {isExpanded && (
                <div className="p-4 sm:p-5 pt-0 border-t border-slate-800/80 space-y-4">
                  {/* Detailed League Table Row */}
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center text-xs mt-3">
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Số Trận</span>
                      <span className="font-mono font-bold text-white text-sm">{season.played}</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-emerald-400 block uppercase font-bold">Thắng</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">{season.won}</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-amber-400 block uppercase font-bold">Hòa</span>
                      <span className="font-mono font-bold text-amber-400 text-sm">{season.drawn}</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-rose-400 block uppercase font-bold">Thua</span>
                      <span className="font-mono font-bold text-rose-400 text-sm">{season.lost}</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-cyan-400 block uppercase font-bold">Bàn Thắng</span>
                      <span className="font-mono font-bold text-cyan-400 text-sm">{season.goalsFor}</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Bàn Thua</span>
                      <span className="font-mono font-bold text-slate-300 text-sm">{season.goalsAgainst}</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-indigo-400 block uppercase font-bold">Hiệu Số</span>
                      <span className="font-mono font-bold text-indigo-300 text-sm">
                        {season.goalDifference > 0 ? `+${season.goalDifference}` : season.goalDifference}
                      </span>
                    </div>
                    <div className="bg-amber-950/40 p-2 rounded-xl border border-amber-500/30">
                      <span className="text-[10px] text-amber-300 block uppercase font-bold">Điểm</span>
                      <span className="font-mono font-black text-amber-300 text-base">{season.points}</span>
                    </div>
                  </div>

                  {/* Cup Achievements of this season */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Thành tích Cúp Quốc Gia & Quốc Tế Mùa Này:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {/* National Cup */}
                      <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Trophy3D type="national_cup" size="sm" showShine={season.nationalCup.isWon} />
                          <div>
                            <div className="font-bold text-slate-200">{season.nationalCup.name}</div>
                            <div className="text-[10px] text-slate-400">
                              {(season.nationalCup.isWon || season.nationalCup.roundReached === 'Á quân') && season.nationalCup.opponentInFinal
                                ? `CK vs ${season.nationalCup.opponentInFinal} ${season.nationalCup.scoreInFinal ? `(${season.nationalCup.scoreInFinal})` : ''}`
                                : 'Cúp Quốc Gia'}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            season.nationalCup.isWon
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'text-slate-400'
                          }`}
                        >
                          {season.nationalCup.roundReached}
                        </span>
                      </div>

                      {/* European Cup */}
                      <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Trophy3D type="european_cup" size="sm" showShine={season.europeanCup.isWon} />
                          <div>
                            <div className="font-bold text-slate-200">{season.europeanCup.name}</div>
                            <div className="text-[10px] text-slate-400">
                              {(season.europeanCup.isWon || season.europeanCup.roundReached === 'Á quân') && season.europeanCup.opponentInFinal
                                ? `CK vs ${season.europeanCup.opponentInFinal} ${season.europeanCup.scoreInFinal ? `(${season.europeanCup.scoreInFinal})` : ''}`
                                : 'Đấu Trường Châu Lục'}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            season.europeanCup.isWon
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'text-slate-400'
                          }`}
                        >
                          {season.europeanCup.roundReached}
                        </span>
                      </div>

                      {/* Club World Cup */}
                      <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Trophy3D type="club_world_cup" size="sm" showShine={season.clubWorldCup.isWon} />
                          <div>
                            <div className="font-bold text-slate-200">FIFA Club World Cup</div>
                            <div className="text-[10px] text-slate-400">
                              {(season.clubWorldCup.isWon || season.clubWorldCup.roundReached === 'Á quân') && season.clubWorldCup.opponentInFinal
                                ? `CK vs ${season.clubWorldCup.opponentInFinal} ${season.clubWorldCup.scoreInFinal ? `(${season.clubWorldCup.scoreInFinal})` : ''}`
                                : 'Vô địch CLB Thế Giới'}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            season.clubWorldCup.isWon
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'text-slate-400'
                          }`}
                        >
                          {season.clubWorldCup.roundReached}
                        </span>
                      </div>

                      {/* National Super Cup */}
                      <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Trophy3D type="national_super_cup" size="sm" showShine={season.nationalSuperCup.isWon} />
                          <div>
                            <div className="font-bold text-slate-200">{season.nationalSuperCup.name}</div>
                            <div className="text-[10px] text-slate-400">
                              {(season.nationalSuperCup.isWon || season.nationalSuperCup.roundReached === 'Á quân') && season.nationalSuperCup.opponentInFinal
                                ? `CK vs ${season.nationalSuperCup.opponentInFinal} ${season.nationalSuperCup.scoreInFinal ? `(${season.nationalSuperCup.scoreInFinal})` : ''}`
                                : 'Siêu Cúp Quốc Gia'}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            season.nationalSuperCup.isWon
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'text-slate-400'
                          }`}
                        >
                          {season.nationalSuperCup.roundReached}
                        </span>
                      </div>

                      {/* European Super Cup */}
                      <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Trophy3D type="european_super_cup" size="sm" showShine={season.europeanSuperCup.isWon} />
                          <div>
                            <div className="font-bold text-slate-200">{season.europeanSuperCup.name}</div>
                            <div className="text-[10px] text-slate-400">
                              {(season.europeanSuperCup.isWon || season.europeanSuperCup.roundReached === 'Á quân') && season.europeanSuperCup.opponentInFinal
                                ? `CK vs ${season.europeanSuperCup.opponentInFinal} ${season.europeanSuperCup.scoreInFinal ? `(${season.europeanSuperCup.scoreInFinal})` : ''}`
                                : 'Siêu Cúp Châu Âu'}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            season.europeanSuperCup.isWon
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'text-slate-400'
                          }`}
                        >
                          {season.europeanSuperCup.roundReached}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Season Performers & Financials (Full Numbers) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 flex items-center gap-2.5">
                      <div
                      onClick={() => onUploadPlayerAvatar?.(season.topScorer.playerName, season.topScorer.playerId)}
                      className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 border border-amber-500/50 hover:border-amber-400 shrink-0 cursor-pointer transition"
                      title="Bấm để đổi ảnh cầu thủ"
                    >
                      <img
                        src={season.topScorer.avatarUrl || DEFAULT_AVATAR}
                        alt={season.topScorer.playerName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                      <div className="text-xs min-w-0 flex-1">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Top 1 Ghi Bàn Mùa</span>
                        <span className="font-extrabold text-white">{season.topScorer.playerName}</span>
                        <span className="text-amber-300 font-mono font-bold block">
                          {season.topScorer.goals} Bàn · {season.topScorer.assists} KT ({season.topScorer.matches} trận)
                        </span>
                      </div>
                      <button
                        onClick={() => onEditPerformer?.(season.id, 'scorer')}
                        className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer shrink-0"
                        title="Sửa Top 1 Ghi Bàn"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 flex items-center gap-2.5">
                      <div
                      onClick={() => onUploadPlayerAvatar?.(season.topAssist.playerName, season.topAssist.playerId)}
                      className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 border border-cyan-500/50 hover:border-cyan-400 shrink-0 cursor-pointer transition"
                      title="Bấm để đổi ảnh cầu thủ"
                    >
                      <img
                        src={season.topAssist.avatarUrl || DEFAULT_AVATAR}
                        alt={season.topAssist.playerName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                      <div className="text-xs min-w-0 flex-1">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Top 1 Kiến Tạo Mùa</span>
                        <span className="font-extrabold text-white">{season.topAssist.playerName}</span>
                        <span className="text-cyan-300 font-mono font-bold block">
                          {season.topAssist.assists} KT · {season.topAssist.goals} Bàn ({season.topAssist.matches} trận)
                        </span>
                      </div>
                      <button
                        onClick={() => onEditPerformer?.(season.id, 'assist')}
                        className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer shrink-0"
                        title="Sửa Top 1 Kiến Tạo"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 flex items-center gap-2.5">
                      <Wallet className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div className="text-xs">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Tài Chính Mùa</span>
                        <span className="text-slate-300 block font-mono text-[11px]">
                          {formatFullCurrency(season.startTransferBudget, '€')} ➔ {formatFullCurrency(season.endTransferBudget, '€')}
                        </span>
                        <span
                          className={`font-mono font-bold text-xs ${
                            profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          Lời ròng: {formatProfitFull(profit, '€')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Explicit delete button inside expanded card */}
                  {onDeleteSeason && (
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setSeasonToDelete(season)}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Xóa Dữ Liệu Mùa Giải Này
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal for deleting season */}
      {seasonToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl ios-glass-card p-6 border border-rose-500/40 shadow-2xl text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Xác Nhận Xóa Mùa Giải?</h3>
                <p className="text-xs text-rose-300">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn có chắc chắn muốn xóa toàn bộ dữ liệu thống kê của mùa giải{' '}
              <strong className="text-amber-300 font-bold">{seasonToDelete.seasonName}</strong>? Các danh hiệu cúp đạt được trong mùa giải này cũng sẽ được cập nhật lại.
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSeasonToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Đồng Ý Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
