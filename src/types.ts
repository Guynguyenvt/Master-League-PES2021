export type CompetitionType =
  | 'league'
  | 'national_cup'
  | 'national_super_cup'
  | 'european_cup'
  | 'european_super_cup'
  | 'club_world_cup';

export type CupRound =
  | 'Vô địch'
  | 'Á quân'
  | 'Bán kết'
  | 'Tứ kết'
  | 'Vòng 1/8'
  | 'Vòng 16'
  | 'Vòng bảng'
  | 'Không tham dự';

export type PlayerPosition =
  | 'CF'
  | 'SS'
  | 'LWF'
  | 'RWF'
  | 'AMF'
  | 'LMF'
  | 'RMF'
  | 'CMF'
  | 'DMF'
  | 'LB'
  | 'RB'
  | 'CB'
  | 'GK';

export type PESFormArrow = 'top' | 'good' | 'normal' | 'poor' | 'terrible'; // Red (12 o'clock), Orange (2 o'clock), Green (3 o'clock), Blue (4 o'clock), Purple (6 o'clock)

export interface Manager {
  id: string;
  name: string;
  avatarUrl: string;
  nationality: string;
  age: number;
  tacticalStyle: string; // e.g. 'Tiki-Taka', 'Counter Attack', 'Gegenpressing', 'Possession Game'
  reputationStars: number; // 1 to 5
  favoriteFormation: string; // '4-3-3', '4-2-3-1', '3-5-2', etc.
  currentClubId: string;
  bio?: string;
  createdAt: string;
}

export interface Club {
  id: string;
  name: string;
  shortName: string;
  league: string;
  country: string;
  stadium: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  badgeStyle: string; // 'manutd' | 'barcelona' | 'juventus' | 'bayern' | 'realmadrid' | 'liverpool' | 'arsenal' | 'psg' | 'inter' | 'custom'
  logo3DUrl?: string;
  ratingStars: number;
}

export interface ClubTenure {
  id: string;
  managerId: string;
  clubId: string;
  clubName: string;
  startSeason: string;
  endSeason: string; // or 'Hiện tại'
  startTransferBudget: number; // in Millions EUR e.g. 85.5
  startSalaryBudget: number; // in Millions EUR e.g. 15.2
  currentOrEndTransferBudget: number; // in Millions EUR e.g. 210.0
  currentOrEndSalaryBudget: number; // in Millions EUR e.g. 38.0
  totalPrizeMoney: number;
  totalPlayerSales: number;
  totalPlayerPurchases: number;
  trophiesWon: number;
  isCurrent: boolean;
}

export interface CupAchievement {
  name: string;
  roundReached: CupRound;
  isWon: boolean;
  scoreInFinal?: string;
  opponentInFinal?: string;
}

export interface SeasonStats {
  id: string;
  managerId: string;
  clubId: string;
  seasonName: string; // e.g., "2020 - 2021", "2021 - 2022", "2022 - 2023"
  isCurrentSeason: boolean;
  
  // League Stats (Giải VĐQG)
  leagueName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  leaguePosition: number; // 1 = Vô địch
  totalTeams: number;
  
  // Domestic & Continental Cup Achievements
  nationalCup: CupAchievement; // e.g. Cúp FA / Cúp Nhà Vua
  nationalSuperCup: CupAchievement; // e.g. Siêu cúp Anh / Siêu cúp TBN
  europeanCup: CupAchievement; // UEFA Champions League hoặc Europa League
  europeanSuperCup: CupAchievement; // Siêu Cúp Châu Âu
  clubWorldCup: CupAchievement; // FIFA Club World Cup
  
  // Season Top Performers
  topScorer: {
    playerId: string;
    playerName: string;
    goals: number;
    assists: number;
    matches: number;
    avatarUrl?: string;
    position: string;
  };
  topAssist: {
    playerId: string;
    playerName: string;
    assists: number;
    goals: number;
    matches: number;
    avatarUrl?: string;
    position: string;
  };
  seasonMVP: {
    playerId: string;
    playerName: string;
    rating: number; // e.g. 7.9
    avatarUrl?: string;
    position: string;
  };
  
  // Season Financial Balance
  startTransferBudget: number; // M €
  endTransferBudget: number; // M €
  startSalaryBudget: number; // M €
  endSalaryBudget: number; // M €
  netProfit: number; // M € (Calculated)
  
  recentForm: ('W' | 'D' | 'L')[]; // e.g. ['W', 'W', 'W', 'D', 'W']
}

export interface Player {
  id: string;
  managerId: string;
  clubId: string;
  name: string;
  age: number;
  nationality: string;
  position: PlayerPosition;
  overallRating: number; // 60-99
  potential: number;
  form: PESFormArrow;
  marketValue: number; // in Millions EUR
  weeklySalary: number; // in Thousands EUR
  avatarUrl: string;
  
  // All-time stats under this manager
  seasonsCount: number;
  appearances: number;
  goals: number;
  assists: number;
  cleanSheets?: number;
  motmCount: number;
  avgRating: number;
  trophiesWon: number;
  clutchGoalsInFinals: number;
  
  // Radar Attributes (1-99 for PES 2021 comparison)
  attributes: {
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
    clutch: number; // Thần thái trận lớn
  };
  isFavorite?: boolean;
}

export interface MatchLog {
  id: string;
  seasonId: string;
  clubId: string;
  date: string;
  competition: string;
  opponent: string;
  opponentBadge?: string;
  isHome: boolean;
  scoreFor: number;
  scoreAgainst: number;
  scorers: string[];
  assists: string[];
  motm: string;
  notes?: string;
}

export interface TrophyRecord {
  id: string;
  title: string;
  competitionType: CompetitionType;
  seasonName: string;
  clubName: string;
  dateWon: string;
  icon3D: string;
}

export interface MasterLeagueState {
  managers: Manager[];
  activeManagerId: string;
  clubs: Club[];
  tenures: ClubTenure[];
  seasons: SeasonStats[];
  players: Player[];
  matchLogs: MatchLog[];
  trophies: TrophyRecord[];
}
