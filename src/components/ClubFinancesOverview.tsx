import React, { useState } from 'react';
import { ClubTenure, Club, SeasonStats } from '../types';
import { ClubBadge3D } from './ClubBadge3D';
import { Financial3DChart } from './Financial3DChart';
import {
  formatFullCurrency,
  formatProfitFull,
  CURRENCY_CONFIGS,
  CurrencyType,
} from '../utils/currency';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Briefcase,
  Layers,
  Sparkles,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Coins,
} from 'lucide-react';

interface ClubFinancesOverviewProps {
  tenures: ClubTenure[];
  clubs: Club[];
  seasons: SeasonStats[];
  onUploadClubLogo?: (clubId: string) => void;
}

export const ClubFinancesOverview: React.FC<ClubFinancesOverviewProps> = ({
  tenures,
  clubs,
  seasons,
  onUploadClubLogo,
}) => {
  // Currency selection state: Default EUR (€), with option for GBP (£), USD ($), etc.
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>('EUR');
  const activeCurrencyConfig = CURRENCY_CONFIGS[selectedCurrency];
  const currencySymbol = activeCurrencyConfig.symbol;

  // Aggregate calculations strictly for Profit / Loss
  const totalStartTransfer = tenures.reduce((acc, t) => acc + t.startTransferBudget, 0);
  const totalEndTransfer = tenures.reduce((acc, t) => acc + t.currentOrEndTransferBudget, 0);
  const totalNetTransferProfit = totalEndTransfer - totalStartTransfer;
  const overallRoiPercent =
    totalStartTransfer > 0 ? ((totalNetTransferProfit / totalStartTransfer) * 100).toFixed(1) : '0.0';

  const totalStartSalary = tenures.reduce((acc, t) => acc + t.startSalaryBudget, 0);
  const totalEndSalary = tenures.reduce((acc, t) => acc + t.currentOrEndSalaryBudget, 0);
  const totalSalaryGrowth = totalEndSalary - totalStartSalary;

  // Selected filter by Club or All
  const [selectedClubId, setSelectedClubId] = useState<string>('all');

  const filteredTenures =
    selectedClubId === 'all' ? tenures : tenures.filter((t) => t.clubId === selectedClubId);

  const filteredSeasons =
    selectedClubId === 'all'
      ? seasons
      : seasons.filter((s) => s.clubId === selectedClubId);

  return (
    <div className="space-y-4">
      {/* Top Banner: Profit & Loss Overview */}
      <div className="rounded-3xl ios-glass-card p-5 sm:p-6 border border-slate-700/60 shadow-xl relative overflow-hidden">
        {/* Currency Switcher Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-300">Đơn Vị Tiền Tệ Ngoại Tệ:</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            {(Object.keys(CURRENCY_CONFIGS) as CurrencyType[]).map((cKey) => {
              const c = CURRENCY_CONFIGS[cKey];
              const isSelected = selectedCurrency === cKey;
              return (
                <button
                  key={cKey}
                  onClick={() => setSelectedCurrency(cKey)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                  title={c.name}
                >
                  <span>{c.symbol}</span>
                  <span className="text-[10px] hidden sm:inline">{c.code}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <PiggyBank className="w-3.5 h-3.5" /> THỐNG KÊ LỜI LÃI TÀI CHÍNH CLB (SỐ ĐẦY ĐỦ)
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5 tracking-tight">
              Tổng Quan Sinh Lời Sự Nghiệp
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Chỉ số lời lãi ngân sách chuyển nhượng và quỹ lương hiển thị số chuẩn đầy đủ ({activeCurrencyConfig.name})
            </p>
          </div>

          <div className="text-left sm:text-right bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 self-start sm:self-auto shadow-inner">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Tổng Lợi Nhuận Ròng
            </span>
            <div
              className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${
                totalNetTransferProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatProfitFull(totalNetTransferProfit, currencySymbol)}
            </div>
            <span className="text-[11px] font-bold text-slate-300">
              Tăng trưởng: <span className="text-emerald-400 font-mono">+{overallRoiPercent}%</span>
            </span>
          </div>
        </div>

        {/* Global Financial Metrics Bar - Strictly Full Numbers with Currency in front */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
              <Wallet className="w-3 h-3 text-slate-400" /> Tổng Ngân Sách Ban Đầu
            </div>
            <div className="text-base sm:text-lg font-black text-white font-mono mt-0.5 truncate">
              {formatFullCurrency(totalStartTransfer, currencySymbol)}
            </div>
            <div className="text-[10px] text-slate-500">Tổng vốn khởi nghiệp ban đầu</div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" /> Tổng Ngân Sách Hiện Tại
            </div>
            <div className="text-base sm:text-lg font-black text-emerald-400 font-mono mt-0.5 truncate">
              {formatFullCurrency(totalEndTransfer, currencySymbol)}
            </div>
            <div className="text-[10px] text-slate-500">Sau quá trình chuyển nhượng & giải đấu</div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
              <Percent className="w-3 h-3 text-cyan-400" /> Tỷ Suất Sinh Lời (ROI)
            </div>
            <div className="text-base sm:text-lg font-black text-cyan-300 font-mono mt-0.5">
              +{overallRoiPercent}%
            </div>
            <div className="text-[10px] text-slate-500">Hiệu quả nhân vốn quản lý</div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-indigo-400" /> Tăng Trưởng Quỹ Lương
            </div>
            <div className="text-base sm:text-lg font-black text-indigo-300 font-mono mt-0.5 truncate">
              {formatProfitFull(totalSalaryGrowth, currencySymbol)}
            </div>
            <div className="text-[10px] text-slate-500 truncate">
              ({formatFullCurrency(totalStartSalary, currencySymbol)} ➔ {formatFullCurrency(totalEndSalary, currencySymbol)})
            </div>
          </div>
        </div>
      </div>

      {/* Filter by Club */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 hide-scrollbar">
        <button
          onClick={() => setSelectedClubId('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
            selectedClubId === 'all'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Tất Cả CLB ({tenures.length})
        </button>
        {tenures.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedClubId(t.clubId)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer flex items-center gap-1.5 ${
              selectedClubId === t.clubId
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>{t.clubName}</span>
            {t.isCurrent && <span className="text-[9px] bg-emerald-950/80 text-emerald-300 px-1 rounded">Hiện tại</span>}
          </button>
        ))}
      </div>

      {/* 3D Dynamic Isometric Financial Chart */}
      <Financial3DChart
        seasons={seasons}
        tenures={tenures}
        clubs={clubs}
        currencySymbol={currencySymbol}
        selectedClubId={selectedClubId}
      />

      {/* Per Club Breakdown Cards (Full Numbers with Currency) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 px-1 flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
          Báo Cáo Lời / Lãi Chi Tiết Từng CLB (Số Chuẩn Đầy Đủ)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredTenures.map((tenure) => {
            const club = clubs.find((c) => c.id === tenure.clubId);
            const profit = tenure.currentOrEndTransferBudget - tenure.startTransferBudget;
            const salaryGrowth = tenure.currentOrEndSalaryBudget - tenure.startSalaryBudget;
            const roiPercent =
              tenure.startTransferBudget > 0
                ? ((profit / tenure.startTransferBudget) * 100).toFixed(1)
                : '0.0';

            return (
              <div
                key={tenure.id}
                className="rounded-3xl ios-glass-card p-4 sm:p-5 border border-slate-700/60 relative overflow-hidden"
              >
                {/* Header with Club Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="cursor-pointer group relative"
                      onClick={() => onUploadClubLogo?.(tenure.clubId)}
                      title="Bấm để đổi Logo CLB thực tế"
                    >
                      <ClubBadge3D club={club} size="md" />
                      <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-[10px] text-cyan-300 font-bold">
                        Đổi Logo
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-extrabold text-white">{tenure.clubName}</h4>
                        {tenure.isCurrent && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                            Hiện tại
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        Nhiệm kỳ: {tenure.startSeason} ➔ {tenure.endSeason}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Tổng Lời / Lãi
                    </span>
                    <span
                      className={`text-base sm:text-lg font-black font-mono ${
                        profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatProfitFull(profit, currencySymbol)}
                    </span>
                    <span className="text-[10px] text-slate-300 block font-mono">
                      (Tăng trưởng +{roiPercent}%)
                    </span>
                  </div>
                </div>

                {/* Compare Start vs End Club Budget & Salary Budget */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Transfer Budget Card */}
                  <div className="bg-slate-900/70 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Ngân Sách Chuyển Nhượng
                    </span>
                    <div className="flex items-center justify-between mt-1.5 text-slate-300">
                      <span>Bắt đầu:</span>
                      <span className="font-mono font-semibold">
                        {formatFullCurrency(tenure.startTransferBudget, currencySymbol)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-white font-bold mt-0.5">
                      <span>{tenure.isCurrent ? 'Hiện tại:' : 'Kết thúc:'}</span>
                      <span className="font-mono text-emerald-400 font-extrabold">
                        {formatFullCurrency(tenure.currentOrEndTransferBudget, currencySymbol)}
                      </span>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-semibold">Lợi nhuận ròng:</span>
                      <span
                        className={`font-mono font-black ${
                          profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {formatProfitFull(profit, currencySymbol)}
                      </span>
                    </div>
                  </div>

                  {/* Salary Budget Card */}
                  <div className="bg-slate-900/70 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Quỹ Lương (Salary Budget)
                    </span>
                    <div className="flex items-center justify-between mt-1.5 text-slate-300">
                      <span>Bắt đầu:</span>
                      <span className="font-mono font-semibold">
                        {formatFullCurrency(tenure.startSalaryBudget, currencySymbol)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-white font-bold mt-0.5">
                      <span>{tenure.isCurrent ? 'Hiện tại:' : 'Kết thúc:'}</span>
                      <span className="font-mono text-cyan-400 font-extrabold">
                        {formatFullCurrency(tenure.currentOrEndSalaryBudget, currencySymbol)}
                      </span>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-semibold">Mở rộng quỹ lương:</span>
                      <span className="font-mono font-bold text-cyan-400">
                        {formatProfitFull(salaryGrowth, currencySymbol)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Season-by-Season Profit/Loss Breakdown Table */}
      <div className="rounded-3xl ios-glass-card p-4 sm:p-5 border border-slate-700/60">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          Thống Kê Sinh Lời Từng Mùa Giải Của CLB (Số Thực Tế)
        </h4>

        <div className="space-y-2">
          {filteredSeasons.map((season) => {
            const seasonProfit = season.endTransferBudget - season.startTransferBudget;
            const club = clubs.find((c) => c.id === season.clubId);

            return (
              <div
                key={season.id}
                className="bg-slate-900/60 hover:bg-slate-900/80 p-3 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition"
              >
                <div className="flex items-center gap-3">
                  <ClubBadge3D club={club} size="sm" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-white">{season.seasonName}</span>
                      {season.isCurrentSeason && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                          Hiện tại
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">{club?.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
                      <span>
                        Ngân sách CN: {formatFullCurrency(season.startTransferBudget, currencySymbol)} ➔{' '}
                        {formatFullCurrency(season.endTransferBudget, currencySymbol)}
                      </span>
                      <span>•</span>
                      <span>
                        Quỹ lương: {formatFullCurrency(season.startSalaryBudget, currencySymbol)} ➔{' '}
                        {formatFullCurrency(season.endSalaryBudget, currencySymbol)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Lãi Trong Mùa</span>
                    <span
                      className={`text-xs sm:text-sm font-black font-mono ${
                        seasonProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatProfitFull(seasonProfit, currencySymbol)}
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

