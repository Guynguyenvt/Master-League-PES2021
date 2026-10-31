import React, { useState } from 'react';
import { SeasonStats, ClubTenure, Club } from '../types';
import { formatFullCurrency, CurrencyType, CURRENCY_CONFIGS } from '../utils/currency';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  DollarSign,
  Maximize2,
  BarChart3,
  Calendar,
  Eye,
} from 'lucide-react';

interface Financial3DChartProps {
  seasons: SeasonStats[];
  tenures: ClubTenure[];
  clubs: Club[];
  currencySymbol?: string;
  selectedClubId?: string;
}

export const Financial3DChart: React.FC<Financial3DChartProps> = ({
  seasons,
  tenures,
  clubs,
  currencySymbol = '€',
  selectedClubId = 'all',
}) => {
  const [viewMode, setViewMode] = useState<'seasons' | 'tenures' | 'breakdown'>('seasons');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [is3DPerspective, setIs3DPerspective] = useState<boolean>(true);

  const filteredSeasons =
    selectedClubId === 'all'
      ? seasons
      : seasons.filter((s) => s.clubId === selectedClubId);

  const filteredTenures =
    selectedClubId === 'all'
      ? tenures
      : tenures.filter((t) => t.clubId === selectedClubId);

  // Prepare data for 3D season view
  const seasonData = filteredSeasons.map((s, idx) => {
    const profit = s.endTransferBudget - s.startTransferBudget;
    const club = clubs.find((c) => c.id === s.clubId);
    return {
      id: s.id,
      label: s.seasonName,
      subLabel: club?.shortName || club?.name || '',
      startTransfer: s.startTransferBudget,
      endTransfer: s.endTransferBudget,
      profit: profit,
      startSalary: s.startSalaryBudget,
      endSalary: s.endSalaryBudget,
      isCurrent: s.isCurrentSeason,
      clubColor: club?.primaryColor || '#3B82F6',
    };
  });

  // Calculate max values for 3D column height normalization
  const maxTransfer = Math.max(
    ...seasonData.map((d) => Math.max(d.startTransfer, d.endTransfer, Math.abs(d.profit))),
    100
  );

  return (
    <div className="rounded-3xl ios-glass-card p-5 sm:p-6 border border-slate-700/70 shadow-2xl relative overflow-hidden text-white space-y-4">
      {/* 3D Background Ambient Glows */}
      <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      {/* Header with 3D Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            MÔ PHỎNG TÀI CHÍNH 3D ISOMETRIC
          </span>
          <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
            Biểu Đồ Lời / Lãi & Tăng Trưởng Ngân Sách 3D
          </h3>
          <p className="text-xs text-slate-400">
            Trực quan hóa khối lượng tài chính (Ngân sách chuyển nhượng & Quỹ lương) bằng số thực tế
          </p>
        </div>

        {/* View Mode Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('seasons')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'seasons'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Từng Mùa Giải</span>
          </button>
          <button
            onClick={() => setViewMode('tenures')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'tenures'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Theo CLB</span>
          </button>
          <button
            onClick={() => setIs3DPerspective(!is3DPerspective)}
            title="Bật / Tắt Hiệu ứng Góc Nhìn 3D Isometric"
            className={`p-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              is3DPerspective
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D Legend Bar */}
      <div className="flex items-center gap-4 text-xs flex-wrap border-y border-slate-800/80 py-2.5 px-1 text-slate-300">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-slate-600 border border-slate-400 shadow-sm" />
          <span className="text-[11px]">Ngân Sách Đầu Mùa</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-gradient-to-t from-cyan-600 to-cyan-400 border border-cyan-300 shadow-sm" />
          <span className="text-[11px]">Ngân Sách Cuối Mùa</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-gradient-to-t from-emerald-600 to-emerald-400 border border-emerald-300 shadow-sm" />
          <span className="text-[11px]">Lợi Nhuận Ròng Sinh Lời (+)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-gradient-to-t from-rose-600 to-rose-400 border border-rose-300 shadow-sm" />
          <span className="text-[11px]">Thâm Hụt (-)</span>
        </div>
      </div>

      {/* 3D Isometric Stage Canvas Container */}
      <div
        className={`relative w-full rounded-2xl bg-gradient-to-b from-slate-950/90 via-slate-900/90 to-slate-950/90 border border-slate-800/90 p-4 sm:p-6 transition-all duration-500 ${
          is3DPerspective ? 'perspective-[1000px]' : ''
        }`}
        style={{ minHeight: '340px' }}
      >
        {/* Isometric 3D Floor Grid Plane */}
        <div
          className="absolute inset-x-4 bottom-8 h-28 pointer-events-none rounded-2xl opacity-40"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.05) 50%, transparent 80%)',
            borderBottom: '1px solid rgba(51, 65, 85, 0.6)',
            transform: is3DPerspective ? 'rotateX(55deg) translateZ(-10px)' : 'none',
          }}
        />

        {/* 3D Columns Content */}
        {viewMode === 'seasons' && seasonData.length > 0 ? (
          <div
            className={`grid gap-4 sm:gap-6 items-end justify-center pt-8 pb-4 transition-transform duration-500 ${
              is3DPerspective ? 'transform -rotate-x-6' : ''
            }`}
            style={{
              gridTemplateColumns: `repeat(${Math.min(seasonData.length, 6)}, minmax(80px, 1fr))`,
            }}
          >
            {seasonData.map((item, idx) => {
              const startHeight = Math.max(15, Math.min(180, (item.startTransfer / maxTransfer) * 170));
              const endHeight = Math.max(15, Math.min(180, (item.endTransfer / maxTransfer) * 170));
              const profitHeight = Math.max(
                10,
                Math.min(180, (Math.abs(item.profit) / maxTransfer) * 170)
              );
              const isProfitPositive = item.profit >= 0;
              const isHovered = hoveredIndex === idx;

              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="flex flex-col items-center group relative cursor-pointer"
                >
                  {/* Floating Hover Tooltip (Full Numbers with Currency) */}
                  {isHovered && (
                    <div className="absolute -top-28 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border border-emerald-500/50 shadow-2xl text-left w-52 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                      <div className="text-xs font-black text-amber-300 flex items-center justify-between">
                        <span>{item.label}</span>
                        <span className="text-[10px] text-slate-400">{item.subLabel}</span>
                      </div>
                      <div className="mt-1.5 space-y-1 text-[11px]">
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Vốn đầu mùa:</span>
                          <span className="font-mono font-bold">
                            {formatFullCurrency(item.startTransfer, currencySymbol)}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Vốn cuối mùa:</span>
                          <span className="font-mono font-bold text-cyan-300">
                            {formatFullCurrency(item.endTransfer, currencySymbol)}
                          </span>
                        </div>
                        <div className="pt-1 border-t border-slate-800 flex justify-between font-black">
                          <span className="text-slate-300">Lãi ròng:</span>
                          <span
                            className={`font-mono ${
                              isProfitPositive ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {formatFullCurrency(item.profit, currencySymbol, {
                              showPlusSign: true,
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Quỹ lương:</span>
                          <span className="font-mono text-slate-300">
                            {formatFullCurrency(item.endSalary, currencySymbol)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3D Bars Cluster (Start, End, Profit) */}
                  <div className="flex items-end gap-1 sm:gap-2 h-48 relative justify-center">
                    {/* Bar 1: Start Transfer Budget (3D Column) */}
                    <div
                      className="w-4 sm:w-6 relative transition-all duration-300 group-hover:brightness-110"
                      style={{ height: `${startHeight}px` }}
                      title={`Đầu mùa: ${formatFullCurrency(item.startTransfer, currencySymbol)}`}
                    >
                      {/* Top Cap (3D Ellipse/Rhombus) */}
                      <div className="absolute -top-1.5 inset-x-0 h-3 rounded-full bg-slate-400 border border-slate-300 shadow-sm" />
                      {/* Front Facet */}
                      <div className="w-full h-full bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 rounded-b-md shadow-md" />
                      {/* Left Light Edge */}
                      <div className="absolute inset-y-0 left-0 w-1 bg-white/20" />
                    </div>

                    {/* Bar 2: End Transfer Budget (3D Cyan Column) */}
                    <div
                      className="w-5 sm:w-7 relative transition-all duration-300 group-hover:scale-105"
                      style={{ height: `${endHeight}px` }}
                      title={`Cuối mùa: ${formatFullCurrency(item.endTransfer, currencySymbol)}`}
                    >
                      {/* Top Cap */}
                      <div className="absolute -top-2 inset-x-0 h-4 rounded-full bg-cyan-300 border border-cyan-100 shadow-md shadow-cyan-400/50" />
                      {/* Front Facet */}
                      <div className="w-full h-full bg-gradient-to-r from-cyan-600 via-teal-500 to-cyan-700 rounded-b-md shadow-lg shadow-cyan-500/20" />
                      {/* Neon Highlight */}
                      <div className="absolute inset-y-0 left-0.5 w-1 bg-white/40" />
                    </div>

                    {/* Bar 3: Net Profit (3D Emerald Column) */}
                    <div
                      className="w-5 sm:w-7 relative transition-all duration-300 group-hover:scale-105"
                      style={{ height: `${profitHeight}px` }}
                      title={`Lời ròng: ${formatFullCurrency(item.profit, currencySymbol, {
                        showPlusSign: true,
                      })}`}
                    >
                      {/* Top Cap */}
                      <div
                        className={`absolute -top-2 inset-x-0 h-4 rounded-full border shadow-md ${
                          isProfitPositive
                            ? 'bg-emerald-300 border-emerald-100 shadow-emerald-400/50'
                            : 'bg-rose-300 border-rose-100 shadow-rose-400/50'
                        }`}
                      />
                      {/* Front Facet */}
                      <div
                        className={`w-full h-full rounded-b-md shadow-lg ${
                          isProfitPositive
                            ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-700 shadow-emerald-500/30'
                            : 'bg-gradient-to-r from-rose-600 via-rose-500 to-red-700 shadow-rose-500/30'
                        }`}
                      />
                      {/* Neon Highlight */}
                      <div className="absolute inset-y-0 left-0.5 w-1 bg-white/40" />
                    </div>
                  </div>

                  {/* 3D Floor Base Ring */}
                  <div
                    className={`w-16 h-3 rounded-full mt-1 border transition-all ${
                      item.isCurrent
                        ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/30'
                        : isHovered
                        ? 'bg-emerald-500/20 border-emerald-400'
                        : 'bg-slate-800/40 border-slate-700/60'
                    }`}
                  />

                  {/* Season Label */}
                  <div className="text-center mt-2">
                    <span className="text-[11px] font-extrabold text-white block truncate">
                      {item.label}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold block ${
                        isProfitPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatFullCurrency(item.profit, currencySymbol, {
                        showPlusSign: true,
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : viewMode === 'tenures' ? (
          /* By Club Tenures View */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
            {filteredTenures.map((tenure) => {
              const profit = tenure.currentOrEndTransferBudget - tenure.startTransferBudget;
              const roi =
                tenure.startTransferBudget > 0
                  ? ((profit / tenure.startTransferBudget) * 100).toFixed(1)
                  : '0.0';
              const isProfitPositive = profit >= 0;

              return (
                <div
                  key={tenure.id}
                  className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-white">{tenure.clubName}</h4>
                    <span className="text-[10px] text-slate-400">
                      {tenure.startSeason} ➔ {tenure.endSeason}
                    </span>
                  </div>

                  {/* 3D Volume Bar simulation */}
                  <div className="mt-3 space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                        <span>Vốn Khởi Đầu:</span>
                        <span className="font-mono font-bold text-white">
                          {formatFullCurrency(tenure.startTransferBudget, currencySymbol)}
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-slate-500 rounded-full"
                          style={{
                            width: `${Math.min(100, (tenure.startTransferBudget / 300) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                        <span>Vốn Hiện Tại:</span>
                        <span className="font-mono font-bold text-cyan-300">
                          {formatFullCurrency(tenure.currentOrEndTransferBudget, currencySymbol)}
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full shadow-sm shadow-cyan-500/50"
                          style={{
                            width: `${Math.min(
                              100,
                              (tenure.currentOrEndTransferBudget / 300) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-bold">Lợi Nhuận Ròng (ROI):</span>
                      <span
                        className={`text-xs font-black font-mono ${
                          isProfitPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {formatFullCurrency(profit, currencySymbol, { showPlusSign: true })} (+{roi}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs">
            Chưa có đủ dữ liệu mùa giải để mô phỏng 3D. Hãy thêm một mùa giải mới!
          </div>
        )}
      </div>
    </div>
  );
};
