import React, { useState, useEffect } from 'react';
import { SeasonStats, Club, CupRound } from '../types';
import {
  TOP_LEAGUES,
  POPULAR_PRESET_CLUBS,
  EUROPEAN_AND_CONTINENTAL_CUPS,
  LeagueCupMapping,
  PresetClub,
} from '../data/leaguesAndCups';
import { formatFullCurrency, formatProfitFull, CurrencyType, CURRENCY_CONFIGS } from '../utils/currency';
import { ClubBadge3D } from './ClubBadge3D';
import { CurrencyFormattedInput } from './CurrencyFormattedInput';
import {
  X,
  Calendar,
  Plus,
  Trophy,
  Award,
  ShieldCheck,
  Sparkles,
  Building2,
  Globe2,
  ChevronDown,
  Flame,
  Zap,
  DollarSign,
  Coins,
} from 'lucide-react';

interface AddSeasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSeason: (season: SeasonStats, clubToUse: Club) => void;
  currentClub: Club;
  allClubs: Club[];
  managerId: string;
}

const CUP_ROUNDS: CupRound[] = [
  'Vô địch',
  'Á quân',
  'Bán kết',
  'Tứ kết',
  'Vòng 1/8',
  'Vòng 16',
  'Vòng bảng',
  'Không tham dự',
];

export const AddSeasonModal: React.FC<AddSeasonModalProps> = ({
  isOpen,
  onClose,
  onSaveSeason,
  currentClub,
  allClubs,
  managerId,
}) => {
  // 1. Club selection (Choose existing, preset or custom)
  const [selectedClubId, setSelectedClubId] = useState<string>(currentClub?.id || 'club-rm');
  const [customClubName, setCustomClubName] = useState<string>('');
  const [customClubShort, setCustomClubShort] = useState<string>('');
  const [isCreatingCustomClub, setIsCreatingCustomClub] = useState<boolean>(false);

  // 2. Season info & League selection
  const [seasonName, setSeasonName] = useState('2024 - 2025');
  const [isCurrentSeason, setIsCurrentSeason] = useState(true);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('la-liga');
  const [customLeagueName, setCustomLeagueName] = useState<string>('La Liga');

  // 3. League Stats
  const [played, setPlayed] = useState(38);
  const [won, setWon] = useState(32);
  const [drawn, setDrawn] = useState(4);
  const [lost, setLost] = useState(2);
  const [goalsFor, setGoalsFor] = useState(102);
  const [goalsAgainst, setGoalsAgainst] = useState(22);
  const [points, setPoints] = useState(100);
  const [leaguePosition, setLeaguePosition] = useState(1);

  // 4. 5 Cup Competitions (Names auto-mapped based on selected League)
  const [nationalCupName, setNationalCupName] = useState('Copa del Rey');
  const [nationalCupRound, setNationalCupRound] = useState<CupRound>('Vô địch');
  const [nationalCupScore, setNationalCupScore] = useState('3 - 1');

  const [nationalSuperCupName, setNationalSuperCupName] = useState('Supercopa de España');
  const [nationalSuperCupRound, setNationalSuperCupRound] = useState<CupRound>('Vô địch');
  const [nationalSuperCupScore, setNationalSuperCupScore] = useState('2 - 0');

  // European Cup preset choice + custom name
  const [selectedEuroCupType, setSelectedEuroCupType] = useState<string>('UEFA Champions League');
  const [euroCupName, setEuroCupName] = useState('UEFA Champions League');
  const [euroCupRound, setEuroCupRound] = useState<CupRound>('Vô địch');
  const [euroCupScore, setEuroCupScore] = useState('4 - 1');

  const [euroSuperCupName, setEuroSuperCupName] = useState('UEFA Super Cup');
  const [euroSuperCupRound, setEuroSuperCupRound] = useState<CupRound>('Vô địch');
  const [euroSuperCupScore, setEuroSuperCupScore] = useState('2 - 1');

  const [cwcName, setCwcName] = useState('FIFA Club World Cup');
  const [cwcRound, setCwcRound] = useState<CupRound>('Vô địch');
  const [cwcScore, setCwcScore] = useState('3 - 0');

  // 5. Top performers
  const [topScorerName, setTopScorerName] = useState('Kylian Mbappé');
  const [topScorerGoals, setTopScorerGoals] = useState(45);
  const [topAssistName, setTopAssistName] = useState('Jude Bellingham');
  const [topAssistCount, setTopAssistCount] = useState(22);

  // 6. Budgets Start & End in Full Numbers + Selected Currency
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>('USD');
  const [startTransfer, setStartTransfer] = useState(60000000);
  const [endTransfer, setEndTransfer] = useState(95000000);
  const [startSalary, setStartSalary] = useState(12000000);
  const [endSalary, setEndSalary] = useState(18000000);

  const activeCurrencyConfig = CURRENCY_CONFIGS[selectedCurrency] || CURRENCY_CONFIGS.USD;

  // When modal opens, sync defaults with currentClub
  useEffect(() => {
    if (isOpen && currentClub) {
      setSelectedClubId(currentClub.id);
      setIsCreatingCustomClub(false);

      // Match league
      const matchedLeague = TOP_LEAGUES.find(
        (l) =>
          l.name.toLowerCase().includes(currentClub.league?.toLowerCase() || '') ||
          l.shortLeagueName.toLowerCase().includes(currentClub.league?.toLowerCase() || '')
      ) || TOP_LEAGUES[0];

      applyLeagueTemplate(matchedLeague);
    }
  }, [isOpen, currentClub]);

  // Handle switching league template and auto-mapping cup names
  const applyLeagueTemplate = (league: LeagueCupMapping) => {
    setSelectedLeagueId(league.id);
    setCustomLeagueName(league.shortLeagueName);
    setNationalCupName(league.nationalCup);
    setNationalSuperCupName(league.nationalSuperCup);
    setSelectedEuroCupType(league.europeanCup);
    setEuroCupName(league.europeanCup);
    setEuroSuperCupName(league.europeanSuperCup);
    setCwcName(league.clubWorldCup);
  };

  const handleLeagueChange = (leagueId: string) => {
    const found = TOP_LEAGUES.find((l) => l.id === leagueId);
    if (found) {
      applyLeagueTemplate(found);
    }
  };

  // Handle European Cup change
  const handleEuroCupChoice = (cupName: string) => {
    setSelectedEuroCupType(cupName);
    if (cupName === 'Không tham dự') {
      setEuroCupName('Không tham dự');
      setEuroCupRound('Không tham dự');
      setEuroCupScore('');
    } else {
      setEuroCupName(cupName);
      if (euroCupRound === 'Không tham dự') {
        setEuroCupRound('Vô địch');
      }
    }
  };

  // Handle Club selection
  const handleClubChange = (clubId: string) => {
    if (clubId === 'create-new-custom') {
      setIsCreatingCustomClub(true);
      setSelectedClubId('create-new-custom');
      return;
    }

    setIsCreatingCustomClub(false);
    setSelectedClubId(clubId);

    // Look up in all existing clubs or preset clubs
    const existing = allClubs.find((c) => c.id === clubId);
    const preset = POPULAR_PRESET_CLUBS.find((c) => c.id === clubId);

    const leagueTarget = existing?.league || preset?.leagueName || '';
    const matchedLeague = TOP_LEAGUES.find(
      (l) =>
        l.name.toLowerCase().includes(leagueTarget.toLowerCase()) ||
        l.shortLeagueName.toLowerCase().includes(leagueTarget.toLowerCase()) ||
        (preset?.leagueId && l.id === preset.leagueId)
    );

    if (matchedLeague) {
      applyLeagueTemplate(matchedLeague);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Determine the active club for this season
    let activeClubForSeason: Club;

    if (isCreatingCustomClub && customClubName.trim()) {
      const short = (customClubShort || customClubName.slice(0, 3)).toUpperCase();
      activeClubForSeason = {
        id: `club-${Date.now()}`,
        name: customClubName.trim(),
        shortName: short,
        league: customLeagueName,
        country: 'Quốc Tế',
        stadium: `${customClubName.trim()} Arena`,
        primaryColor: '#2563EB',
        secondaryColor: '#EAB308',
        accentColor: '#FFFFFF',
        badgeStyle: 'default',
        ratingStars: 4.5,
      };
    } else {
      const foundInState = allClubs.find((c) => c.id === selectedClubId);
      if (foundInState) {
        activeClubForSeason = foundInState;
      } else {
        const foundPreset = POPULAR_PRESET_CLUBS.find((p) => p.id === selectedClubId);
        if (foundPreset) {
          activeClubForSeason = {
            id: foundPreset.id,
            name: foundPreset.name,
            shortName: foundPreset.shortName,
            league: customLeagueName || foundPreset.leagueName,
            country: foundPreset.country,
            stadium: `${foundPreset.name} Stadium`,
            primaryColor: foundPreset.primaryColor,
            secondaryColor: foundPreset.secondaryColor,
            accentColor: '#FFFFFF',
            badgeStyle: foundPreset.badgeStyle,
            ratingStars: 5,
          };
        } else {
          activeClubForSeason = currentClub;
        }
      }
    }

    const isNatCupWon = nationalCupRound === 'Vô địch';
    const isNatSuperCupWon = nationalSuperCupRound === 'Vô địch';
    const isEuroCupWon = euroCupRound === 'Vô địch';
    const isEuroSuperCupWon = euroSuperCupRound === 'Vô địch';
    const isCwcWon = cwcRound === 'Vô địch';

    // Check final score only if reached final
    const showNatFinal = nationalCupRound === 'Vô địch' || nationalCupRound === 'Á quân';
    const showNatSuperFinal = nationalSuperCupRound === 'Vô địch' || nationalSuperCupRound === 'Á quân';
    const showEuroFinal = euroCupRound === 'Vô địch' || euroCupRound === 'Á quân';
    const showEuroSuperFinal = euroSuperCupRound === 'Vô địch' || euroSuperCupRound === 'Á quân';
    const showCwcFinal = cwcRound === 'Vô địch' || cwcRound === 'Á quân';

    const newSeason: SeasonStats = {
      id: `season-${Date.now()}`,
      managerId,
      clubId: activeClubForSeason.id,
      seasonName,
      isCurrentSeason,
      leagueName: customLeagueName,
      played,
      won,
      drawn,
      lost,
      goalsFor,
      goalsAgainst,
      goalDifference: goalsFor - goalsAgainst,
      points,
      leaguePosition,
      totalTeams: 20,

      // 5 Cup Competitions
      nationalCup: {
        name: nationalCupName,
        roundReached: nationalCupRound,
        isWon: isNatCupWon,
        scoreInFinal: showNatFinal && nationalCupScore.trim() ? nationalCupScore : undefined,
      },
      nationalSuperCup: {
        name: nationalSuperCupName,
        roundReached: nationalSuperCupRound,
        isWon: isNatSuperCupWon,
        scoreInFinal: showNatSuperFinal && nationalSuperCupScore.trim() ? nationalSuperCupScore : undefined,
      },
      europeanCup: {
        name: euroCupName,
        roundReached: euroCupRound,
        isWon: isEuroCupWon,
        scoreInFinal: showEuroFinal && euroCupScore.trim() ? euroCupScore : undefined,
      },
      europeanSuperCup: {
        name: euroSuperCupName,
        roundReached: euroSuperCupRound,
        isWon: isEuroSuperCupWon,
        scoreInFinal: showEuroSuperFinal && euroSuperCupScore.trim() ? euroSuperCupScore : undefined,
      },
      clubWorldCup: {
        name: cwcName,
        roundReached: cwcRound,
        isWon: isCwcWon,
        scoreInFinal: showCwcFinal && cwcScore.trim() ? cwcScore : undefined,
      },

      topScorer: {
        playerId: 'p-custom-scorer',
        playerName: topScorerName,
        goals: topScorerGoals,
        assists: 8,
        matches: played,
        position: 'CF',
      },
      topAssist: {
        playerId: 'p-custom-assist',
        playerName: topAssistName,
        assists: topAssistCount,
        goals: 14,
        matches: played,
        position: 'AMF',
      },
      seasonMVP: {
        playerId: 'p-custom-mvp',
        playerName: topScorerName,
        rating: 9.0,
        position: 'CF',
      },
      startTransferBudget: startTransfer,
      endTransferBudget: endTransfer,
      startSalaryBudget: startSalary,
      endSalaryBudget: endSalary,
      netProfit: endTransfer - startTransfer,
      recentForm: ['W', 'W', 'W', 'W', 'W'],
    };

    onSaveSeason(newSeason, activeClubForSeason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl ios-glass-card p-5 sm:p-6 border border-slate-700 shadow-2xl relative my-8 text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Thêm Mùa Giải Mới</h3>
            <p className="text-xs text-slate-400">
              Chọn CLB, Giải VĐQG, Tùy chọn Cúp Châu Âu (C1/C2/Conference League) & Thông số tài chính full
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1 hide-scrollbar">
          
          {/* SECTION 1: CHỌN CLB DẪN DẮT TRONG MÙA NÀY */}
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-cyan-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-cyan-400" /> 1. CLB Dẫn Dắt Trong Mùa Giải Này:
              </label>
              <span className="text-[10px] text-slate-400">
                (Chuyển sang CLB mới hoặc giữ nguyên)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <span className="text-[10px] text-slate-400 block mb-1 font-semibold">Chọn CLB:</span>
                <select
                  value={selectedClubId}
                  onChange={(e) => handleClubChange(e.target.value)}
                  className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-700 outline-none focus:border-cyan-400 font-bold"
                >
                  <optgroup label="CLB Hiện Có & Lịch Sử">
                    {allClubs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.shortName})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="CLB Hàng Đầu Thế Giới">
                    {POPULAR_PRESET_CLUBS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.shortName}) - {p.country}
                      </option>
                    ))}
                  </optgroup>
                  <option value="create-new-custom">+ Nhập Tên CLB Khác (Tạo CLB Mới)...</option>
                </select>
              </div>

              {/* Custom Club Input if chosen */}
              {isCreatingCustomClub && (
                <div className="space-y-2 bg-slate-950/80 p-2.5 rounded-xl border border-cyan-500/40">
                  <div>
                    <span className="text-[10px] text-cyan-300 font-bold block mb-0.5">Tên CLB Mới:</span>
                    <input
                      type="text"
                      value={customClubName}
                      onChange={(e) => setCustomClubName(e.target.value)}
                      placeholder="VD: AC Milan, AS Roma, Tottenham..."
                      required={isCreatingCustomClub}
                      className="w-full bg-slate-900 text-white p-1.5 rounded-lg border border-slate-700 font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Tên Viết Tắt (3 ký tự):</span>
                    <input
                      type="text"
                      value={customClubShort}
                      onChange={(e) => setCustomClubShort(e.target.value.toUpperCase())}
                      placeholder="VD: ACM, ROM, TOT"
                      maxLength={4}
                      className="w-24 bg-slate-900 text-cyan-300 p-1.5 rounded-lg border border-slate-700 font-mono text-center font-bold"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: TÊN MÙA GIẢI & GIẢI VÔ ĐỊCH QUỐC GIA (MAPPING DROPDOWN) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                Tên Mùa Giải
              </label>
              <input
                type="text"
                value={seasonName}
                onChange={(e) => setSeasonName(e.target.value)}
                required
                className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700 outline-none focus:border-amber-400 font-bold"
                placeholder="VD: 2024 - 2025"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-amber-300 uppercase block mb-1 flex items-center gap-1">
                <Globe2 className="w-3.5 h-3.5 text-amber-400" /> Giải Vô Địch Quốc Gia (Mapping)
              </label>
              <select
                value={selectedLeagueId}
                onChange={(e) => handleLeagueChange(e.target.value)}
                className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-amber-500/50 outline-none focus:border-amber-400 font-bold cursor-pointer"
              >
                {TOP_LEAGUES.map((league) => (
                  <option key={league.id} value={league.id}>
                    {league.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <input
              type="checkbox"
              id="isCurrent"
              checked={isCurrentSeason}
              onChange={(e) => setIsCurrentSeason(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 bg-slate-800 border-slate-700"
            />
            <label htmlFor="isCurrent" className="text-xs font-bold text-amber-300 cursor-pointer flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Đặt làm Mùa Hiện Tại (Hiển thị đầu tiên ở Dashboard)
            </label>
          </div>

          {/* SECTION 3: THÔNG SỐ GIẢI VĐQG */}
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-2">
              2. Bảng Kết Quả Giải Vô Địch Quốc Gia ({customLeagueName}):
            </span>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Số Trận</span>
                <input
                  type="number"
                  value={played}
                  onChange={(e) => setPlayed(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 text-white p-2 rounded-xl border border-slate-700 font-mono text-center font-bold"
                />
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 block font-bold">Thắng</span>
                <input
                  type="number"
                  value={won}
                  onChange={(e) => setWon(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 text-white p-2 rounded-xl border border-slate-700 font-mono text-center font-bold"
                />
              </div>
              <div>
                <span className="text-[10px] text-amber-400 block font-bold">Hòa</span>
                <input
                  type="number"
                  value={drawn}
                  onChange={(e) => setDrawn(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 text-white p-2 rounded-xl border border-slate-700 font-mono text-center font-bold"
                />
              </div>
              <div>
                <span className="text-[10px] text-rose-400 block font-bold">Thua</span>
                <input
                  type="number"
                  value={lost}
                  onChange={(e) => setLost(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 text-white p-2 rounded-xl border border-slate-700 font-mono text-center font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center mt-2">
              <div>
                <span className="text-[10px] text-cyan-400 block font-bold">Bàn Thắng</span>
                <input
                  type="number"
                  value={goalsFor}
                  onChange={(e) => setGoalsFor(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 text-white p-2 rounded-xl border border-slate-700 font-mono text-center font-bold"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Bàn Thua</span>
                <input
                  type="number"
                  value={goalsAgainst}
                  onChange={(e) => setGoalsAgainst(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 text-white p-2 rounded-xl border border-slate-700 font-mono text-center font-bold"
                />
              </div>
              <div>
                <span className="text-[10px] text-amber-300 block font-bold">Điểm Số</span>
                <input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 text-white p-2 rounded-xl border border-slate-700 font-mono text-center font-bold"
                />
              </div>
              <div>
                <span className="text-[10px] text-emerald-300 block font-bold">Thứ Hạng</span>
                <input
                  type="number"
                  value={leaguePosition}
                  onChange={(e) => setLeaguePosition(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-900 text-white p-2 rounded-xl border border-slate-700 font-mono text-center font-bold"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: 5 CUP COMPETITIONS INCLUDING UEFA C1 / C2 / CONFERENCE LEAGUE CHOICES & CONDITIONAL FINAL SCORE */}
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                3. Danh Hiệu 5 Đấu Trường Cúp & Siêu Cúp:
              </span>
              <span className="text-[9px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                Chỉ hiện tỷ số khi vào Chung kết
              </span>
            </div>

            {/* Cup 1: Cúp Quốc Gia */}
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  🏆 Cúp Quốc Gia:
                </span>
                <input
                  type="text"
                  value={nationalCupName}
                  onChange={(e) => setNationalCupName(e.target.value)}
                  className="bg-slate-900 text-white text-[11px] px-2 py-1 rounded-lg border border-slate-700 w-48 font-bold"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Thành tích đạt được:</span>
                  <select
                    value={nationalCupRound}
                    onChange={(e) => setNationalCupRound(e.target.value as CupRound)}
                    className="w-full bg-slate-900 text-white p-2 rounded-xl border border-slate-700 font-bold"
                  >
                    {CUP_ROUNDS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                {/* Conditional Final Score: ONLY shown if Vô địch or Á quân */}
                {(nationalCupRound === 'Vô địch' || nationalCupRound === 'Á quân') ? (
                  <div>
                    <span className="text-[10px] text-amber-300 block mb-0.5 font-bold">
                      Tỉ số trận chung kết:
                    </span>
                    <input
                      type="text"
                      value={nationalCupScore}
                      onChange={(e) => setNationalCupScore(e.target.value)}
                      placeholder="VD: 3 - 1"
                      className="w-full bg-slate-900 text-amber-300 p-2 rounded-xl border border-amber-500/50 font-mono text-center font-bold"
                    />
                  </div>
                ) : (
                  <div className="flex items-center text-[10px] text-slate-500 italic p-2 bg-slate-900/30 rounded-xl">
                    (Không lọt vào chung kết - Không có tỉ số trận CK)
                  </div>
                )}
              </div>
            </div>

            {/* Cup 2: Siêu Cúp Quốc Gia */}
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  ⭐ Siêu Cúp Quốc Gia:
                </span>
                <input
                  type="text"
                  value={nationalSuperCupName}
                  onChange={(e) => setNationalSuperCupName(e.target.value)}
                  className="bg-slate-900 text-white text-[11px] px-2 py-1 rounded-lg border border-slate-700 w-48 font-bold"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Thành tích đạt được:</span>
                  <select
                    value={nationalSuperCupRound}
                    onChange={(e) => setNationalSuperCupRound(e.target.value as CupRound)}
                    className="w-full bg-slate-900 text-white p-2 rounded-xl border border-slate-700 font-bold"
                  >
                    {CUP_ROUNDS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                {(nationalSuperCupRound === 'Vô địch' || nationalSuperCupRound === 'Á quân') ? (
                  <div>
                    <span className="text-[10px] text-amber-300 block mb-0.5 font-bold">
                      Tỉ số trận chung kết:
                    </span>
                    <input
                      type="text"
                      value={nationalSuperCupScore}
                      onChange={(e) => setNationalSuperCupScore(e.target.value)}
                      placeholder="VD: 2 - 0"
                      className="w-full bg-slate-900 text-amber-300 p-2 rounded-xl border border-amber-500/50 font-mono text-center font-bold"
                    />
                  </div>
                ) : (
                  <div className="flex items-center text-[10px] text-slate-500 italic p-2 bg-slate-900/30 rounded-xl">
                    (Không tham dự / Không có tỉ số trận CK)
                  </div>
                )}
              </div>
            </div>

            {/* Cup 3: Cúp Châu Âu / Châu Lục (LỰA CHỌN GIỮA CÁC CÚP UEFA CHAMPIONS LEAGUE, EUROPA LEAGUE, CONFERENCE LEAGUE) */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-cyan-500/40 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  🏆 Đấu Trường Cúp Châu Âu / Châu Lục:
                </span>
                <span className="text-[10px] text-cyan-400 font-semibold">
                  (C1 / C2 / Conference League)
                </span>
              </div>

              {/* European Cup Selector Dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Chọn Giải Đấu Cúp Châu Âu:</span>
                  <select
                    value={selectedEuroCupType}
                    onChange={(e) => handleEuroCupChoice(e.target.value)}
                    className="w-full bg-slate-900 text-cyan-300 p-2 rounded-xl border border-cyan-500/50 font-bold outline-none cursor-pointer"
                  >
                    <optgroup label="Cúp Châu Âu (UEFA)">
                      <option value="UEFA Champions League">🏆 UEFA Champions League (Cúp C1)</option>
                      <option value="UEFA Europa League">🥈 UEFA Europa League (Cúp C2)</option>
                      <option value="UEFA Conference League">🥉 UEFA Conference League (Cúp C3 / Conference)</option>
                    </optgroup>
                    <optgroup label="Không Tham Dự / Khác">
                      <option value="Không tham dự">❌ Không tham dự Cúp Châu Âu</option>
                      <option value="AFC Champions League Elite">🌏 AFC Champions League Elite (C1 Châu Á)</option>
                      <option value="AFC Champions League Two">🌏 AFC Champions League Two (C2 Châu Á)</option>
                      <option value="Copa Libertadores">🌎 Copa Libertadores (C1 Nam Mỹ)</option>
                      <option value="Copa Sudamericana">🌎 Copa Sudamericana (C2 Nam Mỹ)</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Tên hiển thị giải đấu:</span>
                  <input
                    type="text"
                    value={euroCupName}
                    onChange={(e) => setEuroCupName(e.target.value)}
                    className="w-full bg-slate-900 text-white p-2 rounded-xl border border-slate-700 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Thành tích đạt được:</span>
                  <select
                    value={euroCupRound}
                    onChange={(e) => setEuroCupRound(e.target.value as CupRound)}
                    className="w-full bg-slate-900 text-white p-2 rounded-xl border border-slate-700 font-bold"
                  >
                    {CUP_ROUNDS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {(euroCupRound === 'Vô địch' || euroCupRound === 'Á quân') ? (
                  <div>
                    <span className="text-[10px] text-cyan-300 block mb-0.5 font-bold">
                      Tỉ số trận chung kết:
                    </span>
                    <input
                      type="text"
                      value={euroCupScore}
                      onChange={(e) => setEuroCupScore(e.target.value)}
                      placeholder="VD: 4 - 1"
                      className="w-full bg-slate-900 text-cyan-300 p-2 rounded-xl border border-cyan-500/50 font-mono text-center font-bold"
                    />
                  </div>
                ) : (
                  <div className="flex items-center text-[10px] text-slate-500 italic p-2 bg-slate-900/30 rounded-xl">
                    (Không lọt vào chung kết - Không có tỉ số trận CK)
                  </div>
                )}
              </div>
            </div>

            {/* Cup 4: Siêu Cúp Châu Âu */}
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  ⭐ Siêu Cúp Châu Lục / Châu Âu:
                </span>
                <input
                  type="text"
                  value={euroSuperCupName}
                  onChange={(e) => setEuroSuperCupName(e.target.value)}
                  className="bg-slate-900 text-white text-[11px] px-2 py-1 rounded-lg border border-slate-700 w-48 font-bold"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Thành tích đạt được:</span>
                  <select
                    value={euroSuperCupRound}
                    onChange={(e) => setEuroSuperCupRound(e.target.value as CupRound)}
                    className="w-full bg-slate-900 text-white p-2 rounded-xl border border-slate-700 font-bold"
                  >
                    {CUP_ROUNDS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {(euroSuperCupRound === 'Vô địch' || euroSuperCupRound === 'Á quân') ? (
                  <div>
                    <span className="text-[10px] text-rose-300 block mb-0.5 font-bold">
                      Tỉ số trận chung kết:
                    </span>
                    <input
                      type="text"
                      value={euroSuperCupScore}
                      onChange={(e) => setEuroSuperCupScore(e.target.value)}
                      placeholder="VD: 2 - 1"
                      className="w-full bg-slate-900 text-rose-300 p-2 rounded-xl border border-rose-500/50 font-mono text-center font-bold"
                    />
                  </div>
                ) : (
                  <div className="flex items-center text-[10px] text-slate-500 italic p-2 bg-slate-900/30 rounded-xl">
                    (Không tham dự / Không có tỉ số trận CK)
                  </div>
                )}
              </div>
            </div>

            {/* Cup 5: FIFA Club World Cup */}
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  🌍 Cúp CLB Thế Giới (FIFA Club World Cup):
                </span>
                <input
                  type="text"
                  value={cwcName}
                  onChange={(e) => setCwcName(e.target.value)}
                  className="bg-slate-900 text-white text-[11px] px-2 py-1 rounded-lg border border-slate-700 w-48 font-bold"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Thành tích đạt được:</span>
                  <select
                    value={cwcRound}
                    onChange={(e) => setCwcRound(e.target.value as CupRound)}
                    className="w-full bg-slate-900 text-white p-2 rounded-xl border border-slate-700 font-bold"
                  >
                    {CUP_ROUNDS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {(cwcRound === 'Vô địch' || cwcRound === 'Á quân') ? (
                  <div>
                    <span className="text-[10px] text-amber-300 block mb-0.5 font-bold">
                      Tỉ số trận chung kết:
                    </span>
                    <input
                      type="text"
                      value={cwcScore}
                      onChange={(e) => setCwcScore(e.target.value)}
                      placeholder="VD: 3 - 0"
                      className="w-full bg-slate-900 text-amber-300 p-2 rounded-xl border border-amber-500/50 font-mono text-center font-bold"
                    />
                  </div>
                ) : (
                  <div className="flex items-center text-[10px] text-slate-500 italic p-2 bg-slate-900/30 rounded-xl">
                    (Không tham dự / Không có tỉ số trận CK)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 5: VUA PHÁ LƯỚI & KIẾN TẠO CỐT LÕI */}
          <div className="grid grid-cols-2 gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div>
              <label className="text-[10px] font-bold text-amber-400 uppercase block mb-1 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Vua Phá Lưới (Bàn Thắng)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={topScorerName}
                  onChange={(e) => setTopScorerName(e.target.value)}
                  className="flex-1 bg-slate-900 text-white p-2 rounded-xl border border-slate-700 font-bold"
                  placeholder="Tên cầu thủ"
                  required
                />
                <input
                  type="number"
                  value={topScorerGoals}
                  onChange={(e) => setTopScorerGoals(parseInt(e.target.value) || 0)}
                  className="w-16 bg-slate-900 text-amber-300 p-2 rounded-xl border border-slate-700 font-mono text-center font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-cyan-400 uppercase block mb-1 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-cyan-400" /> Vua Kiến Tạo (Số KT)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={topAssistName}
                  onChange={(e) => setTopAssistName(e.target.value)}
                  className="flex-1 bg-slate-900 text-white p-2 rounded-xl border border-slate-700 font-bold"
                  placeholder="Tên cầu thủ"
                  required
                />
                <input
                  type="number"
                  value={topAssistCount}
                  onChange={(e) => setTopAssistCount(parseInt(e.target.value) || 0)}
                  className="w-16 bg-slate-900 text-cyan-300 p-2 rounded-xl border border-slate-700 font-mono text-center font-bold"
                />
              </div>
            </div>
          </div>

          {/* SECTION 6: TÀI CHÍNH BẰNG SỐ FULL KÈM NGOẠI TỆ ĐẰNG TRƯỚC */}
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-emerald-500/40 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <label className="text-[11px] font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-emerald-400" /> 4. Thông Số Tài Chính & Ngoại Tệ:
                </label>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Nhập số đầy đủ (VD: nhập <span className="text-amber-300 font-mono font-bold">6000000</span> sẽ tự động hiện <span className="text-emerald-400 font-mono font-bold">{activeCurrencyConfig.position === 'suffix' ? `6,000,000 ${activeCurrencyConfig.symbol}` : `${activeCurrencyConfig.symbol}6,000,000`}</span>)
                </p>
              </div>

              {/* Currency Selector */}
              <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-xl border border-emerald-500/40">
                <span className="text-[10px] text-slate-400 font-bold">Ngoại tệ:</span>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value as CurrencyType)}
                  className="bg-transparent text-emerald-400 font-black text-xs outline-none cursor-pointer"
                >
                  <option value="USD" className="bg-slate-900 text-white">$ Đô La Mỹ (USD)</option>
                  <option value="EUR" className="bg-slate-900 text-white">€ Euro (EUR)</option>
                  <option value="GBP" className="bg-slate-900 text-white">£ Bảng Anh (GBP)</option>
                  <option value="JPY" className="bg-slate-900 text-white">¥ Yên Nhật (JPY)</option>
                  <option value="VND" className="bg-slate-900 text-white">₫ Đồng (VND)</option>
                </select>
              </div>
            </div>

            {/* Transfer Budget (Start -> End) */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2.5">
              <span className="text-[10px] font-bold text-slate-300 uppercase block tracking-wider">
                Ngân Sách Chuyển Nhượng (Transfer Budget)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <CurrencyFormattedInput
                  value={startTransfer}
                  onChange={setStartTransfer}
                  currency={selectedCurrency}
                  label="Vốn Đầu Mùa:"
                  subLabel="Ngân sách chuyển nhượng ban đầu"
                  colorTheme="slate"
                />
                <CurrencyFormattedInput
                  value={endTransfer}
                  onChange={setEndTransfer}
                  currency={selectedCurrency}
                  label="Vốn Cuối Mùa:"
                  subLabel="Ngân sách sau kỳ chuyển nhượng"
                  colorTheme="emerald"
                />
              </div>
            </div>

            {/* Salary Budget (Start -> End) */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2.5">
              <span className="text-[10px] font-bold text-slate-300 uppercase block tracking-wider">
                Quỹ Lương Đội Bóng (Salary Budget)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <CurrencyFormattedInput
                  value={startSalary}
                  onChange={setStartSalary}
                  currency={selectedCurrency}
                  label="Quỹ Lương Đầu Mùa:"
                  subLabel="Quỹ lương cấp đầu mùa giải"
                  colorTheme="slate"
                />
                <CurrencyFormattedInput
                  value={endSalary}
                  onChange={setEndSalary}
                  currency={selectedCurrency}
                  label="Quỹ Lương Cuối Mùa:"
                  subLabel="Quỹ lương sau khi gia hạn / mua sắm"
                  colorTheme="cyan"
                />
              </div>
            </div>

            {/* Net profit preview */}
            <div className="p-3 rounded-xl bg-slate-950 flex items-center justify-between text-xs border border-slate-800">
              <div>
                <span className="text-slate-300 font-bold block">Lợi Nhuận Sinh Lời Dự Kiến:</span>
                <span className="text-[10px] text-slate-400">
                  Hiệu số = Vốn cuối mùa - Vốn đầu mùa
                </span>
              </div>
              <span
                className={`font-mono font-black text-base ${
                  endTransfer >= startTransfer ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatProfitFull(endTransfer - startTransfer, selectedCurrency)}
              </span>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Lưu Mùa Giải & Cúp Vô Địch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
