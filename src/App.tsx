import React, { useState, useEffect, useRef } from 'react';
import {
  MasterLeagueState,
  Manager,
  SeasonStats,
  MatchLog,
  Club,
  Player,
} from './types';
import { INITIAL_PES_STATE } from './data/mockData';
import { IOSFrameWrapper } from './components/IOSFrameWrapper';
import { ManagerProfileCard } from './components/ManagerProfileCard';
import { CurrentSeasonOverview } from './components/CurrentSeasonOverview';
import { SeasonListHistory } from './components/SeasonListHistory';
import { ClubFinancesOverview } from './components/ClubFinancesOverview';
import { TopPerformerComparison } from './components/TopPerformerComparison';
import { TrophyRoom3D } from './components/TrophyRoom3D';
import { AddSeasonModal } from './components/AddSeasonModal';
import { ManagerSwitcherModal } from './components/ManagerSwitcherModal';
import { CloudBackupModal } from './components/CloudBackupModal';
import { ImageUploadModal } from './components/ImageUploadModal';
import { PerformerEditModal } from './components/PerformerEditModal';
import { ManagerEditModal } from './components/ManagerEditModal';
import { normalizeState, applyPerformerEdit, countPlayerRefs, PerformerEdit } from './utils/performers';
import { initSync, syncNow as fbSyncNow, markChanged as fbMarkChanged, useSyncStatus } from './utils/firebaseSync';
import {
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Shield,
  Calendar,
  Wallet,
  Crown,
  Users,
  Trophy,
  Cloud,
  CheckCircle2,
} from 'lucide-react';

const STORAGE_KEY = 'pes2021_master_league_v1';

export default function App() {
  // Load state from localStorage or initial dataset
  const [state, setState] = useState<MasterLeagueState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return normalizeState(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load Master League state from storage', e);
    }
    return normalizeState(INITIAL_PES_STATE);
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals
  const [isAddSeasonOpen, setIsAddSeasonOpen] = useState(false);
  const [isManagerSwitcherOpen, setIsManagerSwitcherOpen] = useState(false);
  const [isCloudBackupOpen, setIsCloudBackupOpen] = useState(false);
  const [isServerSynced, setIsServerSynced] = useState(true);

  // Image Upload Modal State
  const [imageUploadConfig, setImageUploadConfig] = useState<{
    isOpen: boolean;
    type: 'manager' | 'club' | 'player';
    targetId: string;
    title: string;
    currentImageUrl?: string;
  }>({
    isOpen: false,
    type: 'manager',
    targetId: '',
    title: '',
  });

  // Derived current manager and club
  const activeManager =
    state.managers.find((m) => m.id === state.activeManagerId) ||
    state.managers[0] ||
    INITIAL_PES_STATE.managers[0];

  const currentClub =
    state.clubs.find((c) => c.id === activeManager?.currentClubId) || state.clubs[0];

  // Manager seasons
  const managerSeasons = state.seasons.filter((s) => s.managerId === activeManager?.id);

  // Find Current Season
  const currentSeason =
    managerSeasons.find((s) => s.isCurrentSeason) ||
    managerSeasons[0] ||
    state.seasons[0];

  // Manager Tenures
  const managerTenures = state.tenures.filter((t) => t.managerId === activeManager?.id);

  // Manager Players
  const managerPlayers = state.players.filter((p) => p.managerId === activeManager?.id);

  // Giữ dữ liệu cầu thủ luôn nhất quán: liên kết Top ghi bàn/kiến tạo với cầu thủ,
  // cộng dồn bàn thắng + kiến tạo theo mùa, đồng bộ tên/ảnh/vị trí ở mọi nơi
  useEffect(() => {
    const n = normalizeState(state);
    if (n !== state) setState(n);
  }, [state]);

  // Lưu localStorage, đồng bộ Firebase, và (nếu có máy chủ Node) sao lưu lên server
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const serverAvailableRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;
  const lastJsonRef = useRef<string | null>(null);
  const syncSnap = useSyncStatus();

  useEffect(() => {
    let json = '';
    try {
      json = JSON.stringify(state);
      localStorage.setItem(STORAGE_KEY, json);
    } catch (e) {
      console.error('Failed to save Master League state to storage', e);
    }

    // Chỉ đánh dấu "đã thay đổi" khi nội dung thật sự khác (không tính lần mở app, không tính dữ liệu vừa nhận từ cloud)
    if (lastJsonRef.current === null) {
      lastJsonRef.current = json;
    } else if (json !== lastJsonRef.current) {
      lastJsonRef.current = json;
      fbMarkChanged();
    }

    if (serverAvailableRef.current) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      setIsServerSynced(false);
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await fetch('/api/backup/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(state),
          });
          setIsServerSynced(true);
        } catch (err) {
          console.warn('Server auto-backup warning (offline or local mode):', err);
          setIsServerSynced(true);
        }
      }, 1500);
    }

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [state]);

  // Đồng bộ Firebase: khi mở app, khi quay lại tab/app
  useEffect(() => {
    initSync({
      getState: () => stateRef.current,
      applyState: (remote: any) => {
        if (!remote || !remote.managers || !remote.seasons) return;
        const normalized = normalizeState(remote);
        lastJsonRef.current = JSON.stringify(normalized);
        setState(normalized);
      },
    });
    fbSyncNow();
    const onFocus = () => {
      fbSyncNow();
    };
    const onVisible = () => {
      if (!document.hidden) fbSyncNow();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  // Kiểm tra máy chủ Node (chỉ có khi chạy trong AI Studio); trên GitHub Pages sẽ bỏ qua
  useEffect(() => {
    async function checkServerBackup() {
      try {
        const health = await fetch('/api/health');
        if (!health.ok) return;
        const h = await health.json();
        if (h?.status !== 'ok') return;
        serverAvailableRef.current = true;
        const res = await fetch('/api/backup/load');
        if (res.ok) {
          const serverData = await res.json();
          if (serverData && serverData.managers && serverData.seasons) {
            const localSaved = localStorage.getItem(STORAGE_KEY);
            if (!localSaved) {
              setState(serverData);
            }
          }
        }
      } catch (e) {
        console.log('No existing remote server backup found, using local state.');
      }
    }
    checkServerBackup();
  }, []);

  // Handlers
  const handleSaveSeason = (newSeason: SeasonStats, clubToUse?: Club) => {
    setState((prev) => {
      const activeClub = clubToUse || prev.clubs.find((c) => c.id === newSeason.clubId) || currentClub;

      // Ensure club exists in clubs array
      const clubExists = prev.clubs.some((c) => c.id === activeClub.id);
      const updatedClubs = clubExists ? prev.clubs : [...prev.clubs, activeClub];

      // If new season is set as current, mark other seasons as non-current
      const updatedSeasons = prev.seasons.map((s) =>
        newSeason.isCurrentSeason && s.managerId === newSeason.managerId
          ? { ...s, isCurrentSeason: false }
          : s
      );

      // If new season is set as current, update manager's current club to activeClub
      const updatedManagers = prev.managers.map((m) =>
        m.id === activeManager.id && newSeason.isCurrentSeason
          ? { ...m, currentClubId: activeClub.id }
          : m
      );

      // Check if new trophies are won and add to trophy cabinet
      const newTrophies = [...prev.trophies];
      if (newSeason.leaguePosition === 1) {
        newTrophies.unshift({
          id: `t-league-${Date.now()}`,
          title: `Vô Địch ${newSeason.leagueName} (${newSeason.points} Pts)`,
          competitionType: 'league',
          seasonName: newSeason.seasonName,
          clubName: activeClub.name,
          dateWon: new Date().toISOString().split('T')[0],
          icon3D: 'league',
        });
      }
      if (newSeason.nationalCup.isWon) {
        newTrophies.unshift({
          id: `t-cup-${Date.now()}`,
          title: newSeason.nationalCup.name,
          competitionType: 'national_cup',
          seasonName: newSeason.seasonName,
          clubName: activeClub.name,
          dateWon: new Date().toISOString().split('T')[0],
          icon3D: 'cup',
        });
      }
      if (newSeason.nationalSuperCup.isWon) {
        newTrophies.unshift({
          id: `t-supercup-nat-${Date.now()}`,
          title: newSeason.nationalSuperCup.name,
          competitionType: 'national_super_cup',
          seasonName: newSeason.seasonName,
          clubName: activeClub.name,
          dateWon: new Date().toISOString().split('T')[0],
          icon3D: 'national_super_cup',
        });
      }
      if (newSeason.europeanCup.isWon) {
        newTrophies.unshift({
          id: `t-ucl-${Date.now()}`,
          title: newSeason.europeanCup.name,
          competitionType: 'european_cup',
          seasonName: newSeason.seasonName,
          clubName: activeClub.name,
          dateWon: new Date().toISOString().split('T')[0],
          icon3D: 'ucl',
        });
      }
      if (newSeason.europeanSuperCup.isWon) {
        newTrophies.unshift({
          id: `t-supercup-eu-${Date.now()}`,
          title: newSeason.europeanSuperCup.name,
          competitionType: 'european_super_cup',
          seasonName: newSeason.seasonName,
          clubName: activeClub.name,
          dateWon: new Date().toISOString().split('T')[0],
          icon3D: 'european_super_cup',
        });
      }
      if (newSeason.clubWorldCup.isWon) {
        newTrophies.unshift({
          id: `t-cwc-${Date.now()}`,
          title: newSeason.clubWorldCup.name,
          competitionType: 'club_world_cup',
          seasonName: newSeason.seasonName,
          clubName: activeClub.name,
          dateWon: new Date().toISOString().split('T')[0],
          icon3D: 'club_world_cup',
        });
      }

      // Calculate total new trophies won
      const newTrophiesCount =
        (newSeason.leaguePosition === 1 ? 1 : 0) +
        (newSeason.nationalCup.isWon ? 1 : 0) +
        (newSeason.nationalSuperCup.isWon ? 1 : 0) +
        (newSeason.europeanCup.isWon ? 1 : 0) +
        (newSeason.europeanSuperCup.isWon ? 1 : 0) +
        (newSeason.clubWorldCup.isWon ? 1 : 0);

      // Check if tenure exists for this club and active manager
      const existingTenureIndex = prev.tenures.findIndex(
        (t) => t.managerId === activeManager.id && t.clubId === activeClub.id
      );

      let updatedTenures = [...prev.tenures];

      if (newSeason.isCurrentSeason) {
        // Unmark other tenures as current for this manager
        updatedTenures = updatedTenures.map((t) =>
          t.managerId === activeManager.id ? { ...t, isCurrent: false } : t
        );
      }

      if (existingTenureIndex >= 0) {
        updatedTenures[existingTenureIndex] = {
          ...updatedTenures[existingTenureIndex],
          endSeason: newSeason.seasonName,
          currentOrEndTransferBudget: newSeason.endTransferBudget,
          currentOrEndSalaryBudget: newSeason.endSalaryBudget,
          trophiesWon: updatedTenures[existingTenureIndex].trophiesWon + newTrophiesCount,
          isCurrent: newSeason.isCurrentSeason ? true : updatedTenures[existingTenureIndex].isCurrent,
        };
      } else {
        // New tenure created when switching club (e.g. Real Madrid -> AC Milan)
        updatedTenures.push({
          id: `tenure-${Date.now()}`,
          managerId: activeManager.id,
          clubId: activeClub.id,
          clubName: activeClub.name,
          startSeason: newSeason.seasonName,
          endSeason: newSeason.seasonName,
          startTransferBudget: newSeason.startTransferBudget,
          currentOrEndTransferBudget: newSeason.endTransferBudget,
          startSalaryBudget: newSeason.startSalaryBudget,
          currentOrEndSalaryBudget: newSeason.endSalaryBudget,
          trophiesWon: newTrophiesCount,
          isCurrent: newSeason.isCurrentSeason,
        });
      }

      return normalizeState({
        ...prev,
        clubs: updatedClubs,
        managers: updatedManagers,
        seasons: [newSeason, ...updatedSeasons],
        trophies: newTrophies,
        tenures: updatedTenures,
      });
    });
  };

  const handleDeleteSeason = (seasonId: string) => {
    setState((prev) => {
      const seasonToDelete = prev.seasons.find((s) => s.id === seasonId);
      if (!seasonToDelete) return prev;

      const remainingSeasons = prev.seasons.filter((s) => s.id !== seasonId);

      // If deleted season was marked current and there are remaining seasons for this manager,
      // make the first one current
      let updatedSeasons = remainingSeasons;
      if (seasonToDelete.isCurrentSeason) {
        const firstManagerSeasonIndex = updatedSeasons.findIndex(
          (s) => s.managerId === seasonToDelete.managerId
        );
        if (firstManagerSeasonIndex >= 0) {
          updatedSeasons = updatedSeasons.map((s, idx) =>
            idx === firstManagerSeasonIndex ? { ...s, isCurrentSeason: true } : s
          );
        }
      }

      // Remove trophies associated with this season
      const updatedTrophies = prev.trophies.filter(
        (t) => !(t.seasonName === seasonToDelete.seasonName)
      );

      // Recalculate tenures trophies count and end season if needed
      const updatedTenures = prev.tenures.map((t) => {
        if (t.managerId === seasonToDelete.managerId && t.clubId === seasonToDelete.clubId) {
          const clubSeasons = updatedSeasons.filter(
            (s) => s.managerId === t.managerId && s.clubId === t.clubId
          );
          const totalTrophiesInClub = clubSeasons.reduce((acc, s) => {
            return (
              acc +
              (s.leaguePosition === 1 ? 1 : 0) +
              (s.nationalCup.isWon ? 1 : 0) +
              (s.nationalSuperCup.isWon ? 1 : 0) +
              (s.europeanCup.isWon ? 1 : 0) +
              (s.europeanSuperCup.isWon ? 1 : 0) +
              (s.clubWorldCup.isWon ? 1 : 0)
            );
          }, 0);

          return {
            ...t,
            trophiesWon: totalTrophiesInClub,
          };
        }
        return t;
      });

      return normalizeState({
        ...prev,
        seasons: updatedSeasons,
        trophies: updatedTrophies,
        tenures: updatedTenures,
      });
    });
  };

  const handleAddManager = (newManager: Manager) => {
    setState((prev) => ({
      ...prev,
      managers: [...prev.managers, newManager],
      activeManagerId: newManager.id,
    }));
  };

  const handleDeleteManager = (managerId: string) => {
    setState((prev) => {
      const remainingManagers = prev.managers.filter((m) => m.id !== managerId);

      let finalManagers = remainingManagers;
      let newActiveId = prev.activeManagerId;

      if (finalManagers.length === 0) {
        const defaultClub = prev.clubs[0] || INITIAL_PES_STATE.clubs[0];
        const freshManager: Manager = {
          id: `mgr-${Date.now()}`,
          name: 'Huấn Luyện Viên Mới',
          avatarUrl:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
          nationality: 'Việt Nam',
          age: 42,
          tacticalStyle: 'Kiểm Soát & Tấn Công Nhanh',
          reputationStars: 5,
          favoriteFormation: '4-3-3',
          currentClubId: defaultClub.id,
          createdAt: new Date().toISOString().split('T')[0],
        };
        finalManagers = [freshManager];
        newActiveId = freshManager.id;
      } else if (prev.activeManagerId === managerId) {
        newActiveId = finalManagers[0].id;
      }

      // Filter out deleted manager's seasons, tenures, players
      const remainingSeasons = prev.seasons.filter((s) => s.managerId !== managerId);
      const remainingTenures = prev.tenures.filter((t) => t.managerId !== managerId);
      const remainingPlayers = prev.players.filter((p) => p.managerId !== managerId);

      // Remaining trophies
      const remainingSeasonNames = new Set(remainingSeasons.map((s) => s.seasonName));
      const remainingTrophies = prev.trophies.filter((t) => remainingSeasonNames.has(t.seasonName));

      return {
        ...prev,
        managers: finalManagers,
        activeManagerId: newActiveId,
        seasons: remainingSeasons,
        tenures: remainingTenures,
        players: remainingPlayers,
        trophies: remainingTrophies,
      };
    });
  };

  const handleSelectManager = (mgrId: string) => {
    setState((prev) => ({
      ...prev,
      activeManagerId: mgrId,
    }));
  };

  // Image Upload Handlers
  const handleOpenManagerAvatarUpload = () => {
    setImageUploadConfig({
      isOpen: true,
      type: 'manager',
      targetId: activeManager.id,
      title: `Ảnh Chân Dung HLV: ${activeManager.name}`,
      currentImageUrl: activeManager.avatarUrl,
    });
  };

  const handleOpenClubLogoUpload = (clubId?: string) => {
    const targetClub = state.clubs.find((c) => c.id === (clubId || currentClub.id)) || currentClub;
    setImageUploadConfig({
      isOpen: true,
      type: 'club',
      targetId: targetClub.id,
      title: `Logo CLB Thực Tế: ${targetClub.name}`,
      currentImageUrl: targetClub.logo3DUrl || targetClub.logoUrl,
    });
  };

  const handleOpenPlayerAvatarUpload = (playerName: string, playerId?: string) => {
    const foundPlayer = state.players.find((p) => p.id === playerId || p.name === playerName);
    setImageUploadConfig({
      isOpen: true,
      type: 'player',
      targetId: foundPlayer ? foundPlayer.id : playerId || playerName,
      title: `Ảnh Ngôi Sao Cầu Thủ: ${playerName}`,
      currentImageUrl: foundPlayer?.avatarUrl,
    });
  };

  const handleApplyUploadedImage = (imageDataUrl: string) => {
    setState((prev) => {
      const { type, targetId } = imageUploadConfig;

      if (type === 'manager') {
        return {
          ...prev,
          managers: prev.managers.map((m) =>
            m.id === targetId ? { ...m, avatarUrl: imageDataUrl } : m
          ),
        };
      }

      if (type === 'club') {
        return {
          ...prev,
          clubs: prev.clubs.map((c) =>
            c.id === targetId ? { ...c, logo3DUrl: imageDataUrl, logoUrl: imageDataUrl } : c
          ),
        };
      }

      if (type === 'player') {
        const nameFromTitle = imageUploadConfig.title.split(': ')[1];
        const hasId = prev.players.some((p) => p.id === targetId);
        const players = prev.players.map((p) =>
          p.id === targetId || (!hasId && p.name === nameFromTitle) ? { ...p, avatarUrl: imageDataUrl } : p
        );
        // normalizeState đồng bộ ảnh mới sang Tổng quan, Lịch sử mùa giải và Ngôi sao
        return normalizeState({ ...prev, players });
      }

      return prev;
    });

    setImageUploadConfig((prev) => ({ ...prev, isOpen: false }));
  };

  // Server Backup API integration
  const [performerEdit, setPerformerEdit] = useState<{ seasonId: string; kind: 'scorer' | 'assist' } | null>(null);
  const [isManagerEditOpen, setIsManagerEditOpen] = useState(false);

  const handleSavePerformer = (data: PerformerEdit) => {
    if (!performerEdit) return;
    const { seasonId, kind } = performerEdit;
    const season = state.seasons.find((x) => x.id === seasonId);
    if (!season) return;
    const cur = kind === 'scorer' ? season.topScorer : season.topAssist;
    const name = data.name.trim();
    const sameNameExists = state.players.some(
      (p) => p.managerId === season.managerId && p.name.trim().toLowerCase() === name.toLowerCase()
    );
    let renameAll = false;
    if (!sameNameExists) {
      const refs = countPlayerRefs(state.seasons, cur.playerId);
      if (refs > 1) {
        renameAll = window.confirm(
          `Cầu thủ "${cur.playerName}" đang xuất hiện ở ${refs} mùa giải.\n\nOK = đổi tên ở TẤT CẢ các mùa (sửa lỗi chính tả).\nHủy = chỉ mùa này là một cầu thủ khác tên "${name}".`
        );
      } else {
        renameAll = true;
      }
    }
    setState((prev) => applyPerformerEdit(prev, seasonId, kind, data, renameAll));
    setPerformerEdit(null);
  };

  const handleUpdateManager = (data: { name: string; nationality: string; age: number }) => {
    setState((prev) => ({
      ...prev,
      managers: prev.managers.map((m) => (m.id === activeManager?.id ? { ...m, ...data } : m)),
    }));
    setIsManagerEditOpen(false);
  };

  const handleTriggerServerSave = async () => {
    const res = await fetch('/api/backup/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
    if (!res.ok) {
      throw new Error('Lỗi khi gửi dữ liệu sao lưu lên máy chủ');
    }
  };

  const handleTriggerServerLoad = async () => {
    const res = await fetch('/api/backup/load');
    if (!res.ok) {
      throw new Error('Không tìm thấy bản sao lưu trên máy chủ');
    }
    const data = await res.json();
    if (data && data.managers) {
      setState(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  };

  const handleResetData = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục dữ liệu gốc Master League PES 2021 không?')) {
      setState(INITIAL_PES_STATE);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PES_STATE));
    }
  };

  return (
    <IOSFrameWrapper
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onOpenAddSeason={() => setIsAddSeasonOpen(true)}
      onOpenCloudBackup={() => setIsCloudBackupOpen(true)}
      clubName={currentClub?.name}
      seasonName={currentSeason?.seasonName}
      isServerSynced={syncSnap.connected ? syncSnap.status === 'synced' : isServerSynced}
    >
      <div className="space-y-5 p-3 sm:p-5">
        {/* TAB 1: DASHBOARD (Tổng Quan Mùa Hiện Tại & HLV) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-5">
            {/* Manager Profile Header Card */}
            <ManagerProfileCard
              manager={activeManager}
              clubs={state.clubs}
              tenures={state.tenures}
              seasons={state.seasons}
              onOpenManagerSwitcher={() => setIsManagerSwitcherOpen(true)}
              onUploadManagerAvatar={handleOpenManagerAvatarUpload}
              onEditManager={() => setIsManagerEditOpen(true)}
              onUploadClubLogo={handleOpenClubLogoUpload}
            />

            {/* Current Season Primary Section (Hiển thị đầu tiên theo yêu cầu) */}
            {currentSeason && currentClub ? (
              <CurrentSeasonOverview
                season={currentSeason}
                club={currentClub}
                onViewPlayerDetail={() => setActiveTab('stars')}
                onUploadPlayerAvatar={handleOpenPlayerAvatarUpload}
                onUploadClubLogo={handleOpenClubLogoUpload}
                onEditPerformer={(seasonId, kind) => setPerformerEdit({ seasonId, kind })}
              />
            ) : (
              <div className="p-6 sm:p-8 rounded-3xl ios-glass-card border border-dashed border-amber-500/40 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-2xl">
                  ⚽
                </div>
                <h3 className="text-base font-black text-white">Chưa Có Dữ Liệu Mùa Giải Nào</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Bạn đã xóa hết dữ liệu mẫu hoặc chưa tạo mùa giải mới. Hãy bấm nút dưới đây để bắt đầu lưu trữ sự nghiệp của bạn!
                </p>
                <button
                  onClick={() => setIsAddSeasonOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <Plus className="w-4 h-4" /> Thêm Mùa Giải Đầu Tiên
                </button>
              </div>
            )}

            {/* Quick Action Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => setIsAddSeasonOpen(true)}
                className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-amber-500/40 text-left transition flex items-center gap-3 cursor-pointer group shadow-lg shadow-amber-500/5"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center group-hover:scale-105 transition shrink-0 font-bold">
                  📅
                </div>
                <div>
                  <div className="text-xs font-black text-amber-300">Thêm Mùa Giải</div>
                  <div className="text-[10px] text-slate-400">Đầy đủ 5 cúp & tài chính</div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('stars')}
                className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-left transition flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition shrink-0">
                  👑
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Top 1 Ghi Bàn & KT</div>
                  <div className="text-[10px] text-slate-400">Xem bàn thắng & kiến tạo</div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('finances')}
                className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-left transition flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition shrink-0">
                  💰
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Tài Chính Lời Lãi</div>
                  <div className="text-[10px] text-slate-400">Ngân sách & lợi nhuận</div>
                </div>
              </button>

              <button
                onClick={() => setIsCloudBackupOpen(true)}
                className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-emerald-500/30 text-left transition flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition shrink-0">
                  ☁️
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Sao Lưu Máy Chủ</div>
                  <div className="text-[10px] text-emerald-400/90 font-medium">Google Drive / OneDrive</div>
                </div>
              </button>
            </div>

            {/* Historical Seasons Snapshot */}
            <SeasonListHistory
              seasons={managerSeasons}
              clubs={state.clubs}
              onDeleteSeason={handleDeleteSeason}
              onOpenAddSeason={() => setIsAddSeasonOpen(true)}
              onEditPerformer={(seasonId, kind) => setPerformerEdit({ seasonId, kind })}
              onUploadPlayerAvatar={handleOpenPlayerAvatarUpload}
            />
          </div>
        )}

        {/* TAB 2: SEASONS (Lịch sử từng mùa giải) */}
        {activeTab === 'seasons' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" /> Lịch Sử Các Mùa Giải Master League
              </h2>
              <button
                onClick={() => setIsAddSeasonOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm Mùa Mới
              </button>
            </div>
            <SeasonListHistory
              seasons={managerSeasons}
              clubs={state.clubs}
              onDeleteSeason={handleDeleteSeason}
              onOpenAddSeason={() => setIsAddSeasonOpen(true)}
              onEditPerformer={(seasonId, kind) => setPerformerEdit({ seasonId, kind })}
              onUploadPlayerAvatar={handleOpenPlayerAvatarUpload}
            />
          </div>
        )}

        {/* TAB 3: FINANCES (Ngân sách chuyển nhượng & lương, lời lãi) */}
        {activeTab === 'finances' && (
          <ClubFinancesOverview
            tenures={managerTenures}
            clubs={state.clubs}
            seasons={managerSeasons}
          />
        )}

        {/* TAB 4: STARS (Top 1 ghi bàn, Top 1 kiến tạo) */}
        {activeTab === 'stars' && (
          <TopPerformerComparison
            players={managerPlayers}
            seasons={managerSeasons}
            onUploadPlayerAvatar={handleOpenPlayerAvatarUpload}
            clubs={state.clubs}
            onEditPerformer={(seasonId, kind) => setPerformerEdit({ seasonId, kind })}
          />
        )}

        {/* TAB 5: TROPHIES (Phòng truyền thống 3D) */}
        {activeTab === 'trophies' && <TrophyRoom3D trophies={state.trophies} />}

        {/* Footer Backup & Reset Controls */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCloudBackupOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-emerald-300 transition cursor-pointer"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-400" /> Đồng Bộ & Sao Lưu Máy Chủ / Drive
            </button>
            <button
              onClick={handleResetData}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" /> Khôi Phục Gốc
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            PES 2021 Master League Manager • Cloud Synced 🟢
          </div>
        </div>
      </div>

      {/* MODALS */}
      <AddSeasonModal
        isOpen={isAddSeasonOpen}
        onClose={() => setIsAddSeasonOpen(false)}
        onSaveSeason={handleSaveSeason}
        currentClub={currentClub}
        allClubs={state.clubs}
        managerId={activeManager.id}
        players={managerPlayers}
      />

      <PerformerEditModal
        isOpen={!!performerEdit}
        kind={performerEdit?.kind ?? 'scorer'}
        season={performerEdit ? state.seasons.find((x) => x.id === performerEdit.seasonId) || null : null}
        players={managerPlayers}
        onClose={() => setPerformerEdit(null)}
        onSave={handleSavePerformer}
      />

      <ManagerEditModal
        isOpen={isManagerEditOpen}
        manager={activeManager}
        onClose={() => setIsManagerEditOpen(false)}
        onSave={handleUpdateManager}
      />

      <ManagerSwitcherModal
        isOpen={isManagerSwitcherOpen}
        onClose={() => setIsManagerSwitcherOpen(false)}
        managers={state.managers}
        activeManagerId={state.activeManagerId}
        clubs={state.clubs}
        onSelectManager={handleSelectManager}
        onAddManager={handleAddManager}
        onDeleteManager={handleDeleteManager}
      />

      <CloudBackupModal
        isOpen={isCloudBackupOpen}
        onClose={() => setIsCloudBackupOpen(false)}
        state={state}
        onRestoreState={(loadedState) => setState(loadedState)}
        onTriggerServerSave={handleTriggerServerSave}
        onTriggerServerLoad={handleTriggerServerLoad}
      />

      <ImageUploadModal
        isOpen={imageUploadConfig.isOpen}
        onClose={() => setImageUploadConfig((prev) => ({ ...prev, isOpen: false }))}
        onSaveImage={handleApplyUploadedImage}
        targetType={imageUploadConfig.type}
        targetTitle={imageUploadConfig.title}
        currentImageUrl={imageUploadConfig.currentImageUrl}
      />
    </IOSFrameWrapper>
  );
}
