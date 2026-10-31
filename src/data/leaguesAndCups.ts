export interface LeagueCupMapping {
  id: string;
  name: string;
  shortLeagueName: string;
  country: string;
  nationalCup: string;
  nationalSuperCup: string;
  europeanCup: string;
  europeanSuperCup: string;
  clubWorldCup: string;
}

export interface CupOption {
  id: string;
  name: string;
  tierLabel: string;
  region: string;
}

export const EUROPEAN_AND_CONTINENTAL_CUPS: CupOption[] = [
  {
    id: 'ucl',
    name: 'UEFA Champions League',
    tierLabel: 'Cúp C1 Châu Âu (Đỉnh cao)',
    region: 'Châu Âu',
  },
  {
    id: 'uel',
    name: 'UEFA Europa League',
    tierLabel: 'Cúp C2 Châu Âu',
    region: 'Châu Âu',
  },
  {
    id: 'uecl',
    name: 'UEFA Conference League',
    tierLabel: 'Cúp C3 Châu Âu (Conference League)',
    region: 'Châu Âu',
  },
  {
    id: 'none',
    name: 'Không tham dự',
    tierLabel: 'Không tham dự giải đấu cúp châu lục',
    region: 'Quốc tế',
  },
  {
    id: 'afc-el',
    name: 'AFC Champions League Elite',
    tierLabel: 'Cúp C1 Châu Á',
    region: 'Châu Á',
  },
  {
    id: 'afc-two',
    name: 'AFC Champions League Two',
    tierLabel: 'Cúp C2 Châu Á',
    region: 'Châu Á',
  },
  {
    id: 'libertadores',
    name: 'Copa Libertadores',
    tierLabel: 'Cúp C1 Nam Mỹ',
    region: 'Nam Mỹ',
  },
  {
    id: 'sudamericana',
    name: 'Copa Sudamericana',
    tierLabel: 'Cúp C2 Nam Mỹ',
    region: 'Nam Mỹ',
  },
];

export const TOP_LEAGUES: LeagueCupMapping[] = [
  {
    id: 'la-liga',
    name: 'La Liga (Tây Ban Nha)',
    shortLeagueName: 'La Liga',
    country: 'Tây Ban Nha',
    nationalCup: 'Copa del Rey',
    nationalSuperCup: 'Supercopa de España',
    europeanCup: 'UEFA Champions League',
    europeanSuperCup: 'UEFA Super Cup',
    clubWorldCup: 'FIFA Club World Cup',
  },
  {
    id: 'serie-a',
    name: 'Serie A (Ý)',
    shortLeagueName: 'Serie A',
    country: 'Ý',
    nationalCup: 'Coppa Italia',
    nationalSuperCup: 'Supercoppa Italiana',
    europeanCup: 'UEFA Champions League',
    europeanSuperCup: 'UEFA Super Cup',
    clubWorldCup: 'FIFA Club World Cup',
  },
  {
    id: 'premier-league',
    name: 'Premier League (Ngoại Hạng Anh)',
    shortLeagueName: 'Premier League',
    country: 'Anh',
    nationalCup: 'FA Cup',
    nationalSuperCup: 'FA Community Shield',
    europeanCup: 'UEFA Champions League',
    europeanSuperCup: 'UEFA Super Cup',
    clubWorldCup: 'FIFA Club World Cup',
  },
  {
    id: 'bundesliga',
    name: 'Bundesliga (Đức)',
    shortLeagueName: 'Bundesliga',
    country: 'Đức',
    nationalCup: 'DFB-Pokal',
    nationalSuperCup: 'DFL-Supercup',
    europeanCup: 'UEFA Champions League',
    europeanSuperCup: 'UEFA Super Cup',
    clubWorldCup: 'FIFA Club World Cup',
  },
  {
    id: 'ligue-1',
    name: 'Ligue 1 (Pháp)',
    shortLeagueName: 'Ligue 1',
    country: 'Pháp',
    nationalCup: 'Coupe de France',
    nationalSuperCup: 'Trophée des Champions',
    europeanCup: 'UEFA Champions League',
    europeanSuperCup: 'UEFA Super Cup',
    clubWorldCup: 'FIFA Club World Cup',
  },
  {
    id: 'primeira-liga',
    name: 'Primeira Liga (Bồ Đào Nha)',
    shortLeagueName: 'Primeira Liga',
    country: 'Bồ Đào Nha',
    nationalCup: 'Taça de Portugal',
    nationalSuperCup: 'Supertaça Cândido de Oliveira',
    europeanCup: 'UEFA Champions League',
    europeanSuperCup: 'UEFA Super Cup',
    clubWorldCup: 'FIFA Club World Cup',
  },
  {
    id: 'eredivisie',
    name: 'Eredivisie (Hà Lan)',
    shortLeagueName: 'Eredivisie',
    country: 'Hà Lan',
    nationalCup: 'KNVB Beker',
    nationalSuperCup: 'Johan Cruyff Shield',
    europeanCup: 'UEFA Champions League',
    europeanSuperCup: 'UEFA Super Cup',
    clubWorldCup: 'FIFA Club World Cup',
  },
  {
    id: 'v-league',
    name: 'V.League 1 (Việt Nam)',
    shortLeagueName: 'V.League 1',
    country: 'Việt Nam',
    nationalCup: 'Cúp Quốc Gia',
    nationalSuperCup: 'Siêu Cúp Bóng Đá Việt Nam',
    europeanCup: 'AFC Champions League Two',
    europeanSuperCup: 'Siêu Cúp Châu Á',
    clubWorldCup: 'FIFA Club World Cup',
  },
  {
    id: 'brasileirao',
    name: 'Brasileirão Serie A (Brazil)',
    shortLeagueName: 'Brasileirão',
    country: 'Brazil',
    nationalCup: 'Copa do Brasil',
    nationalSuperCup: 'Supercopa do Brasil',
    europeanCup: 'Copa Libertadores',
    europeanSuperCup: 'Recopa Sudamericana',
    clubWorldCup: 'FIFA Club World Cup',
  },
  {
    id: 'custom',
    name: 'Khác (Tùy chỉnh)',
    shortLeagueName: 'Giải VĐQG Khác',
    country: 'Quốc Tế',
    nationalCup: 'Cúp Quốc Gia',
    nationalSuperCup: 'Siêu Cúp Quốc Gia',
    europeanCup: 'UEFA Champions League',
    europeanSuperCup: 'UEFA Super Cup',
    clubWorldCup: 'FIFA Club World Cup',
  },
];

export interface PresetClub {
  id: string;
  name: string;
  shortName: string;
  leagueId: string;
  leagueName: string;
  country: string;
  primaryColor: string;
  secondaryColor: string;
  badgeStyle: 'realmadrid' | 'manutd' | 'barcelona' | 'bayern' | 'juventus' | 'psg' | 'mancity' | 'inter' | 'acmilan' | 'liverpool' | 'arsenal' | 'chelsea' | 'atletico' | 'dortmund' | 'default';
}

export const POPULAR_PRESET_CLUBS: PresetClub[] = [
  {
    id: 'club-rm',
    name: 'Real Madrid CF',
    shortName: 'RMA',
    leagueId: 'la-liga',
    leagueName: 'La Liga',
    country: 'Tây Ban Nha',
    primaryColor: '#2563EB',
    secondaryColor: '#EAB308',
    badgeStyle: 'realmadrid',
  },
  {
    id: 'club-acmilan',
    name: 'AC Milan',
    shortName: 'ACM',
    leagueId: 'serie-a',
    leagueName: 'Serie A',
    country: 'Ý',
    primaryColor: '#DC2626',
    secondaryColor: '#09090B',
    badgeStyle: 'acmilan',
  },
  {
    id: 'club-mu',
    name: 'Manchester United',
    shortName: 'MUN',
    leagueId: 'premier-league',
    leagueName: 'Premier League',
    country: 'Anh',
    primaryColor: '#DC2626',
    secondaryColor: '#FACC15',
    badgeStyle: 'manutd',
  },
  {
    id: 'club-barca',
    name: 'FC Barcelona',
    shortName: 'BAR',
    leagueId: 'la-liga',
    leagueName: 'La Liga',
    country: 'Tây Ban Nha',
    primaryColor: '#991B1B',
    secondaryColor: '#1E3A8A',
    badgeStyle: 'barcelona',
  },
  {
    id: 'club-bayern',
    name: 'FC Bayern München',
    shortName: 'BAY',
    leagueId: 'bundesliga',
    leagueName: 'Bundesliga',
    country: 'Đức',
    primaryColor: '#DC2626',
    secondaryColor: '#2563EB',
    badgeStyle: 'bayern',
  },
  {
    id: 'club-juve',
    name: 'Juventus FC',
    shortName: 'JUV',
    leagueId: 'serie-a',
    leagueName: 'Serie A',
    country: 'Ý',
    primaryColor: '#09090B',
    secondaryColor: '#FFFFFF',
    badgeStyle: 'juventus',
  },
  {
    id: 'club-inter',
    name: 'Inter Milan',
    shortName: 'INT',
    leagueId: 'serie-a',
    leagueName: 'Serie A',
    country: 'Ý',
    primaryColor: '#1D4ED8',
    secondaryColor: '#0F172A',
    badgeStyle: 'inter',
  },
  {
    id: 'club-psg',
    name: 'Paris Saint-Germain',
    shortName: 'PSG',
    leagueId: 'ligue-1',
    leagueName: 'Ligue 1',
    country: 'Pháp',
    primaryColor: '#1E3A8A',
    secondaryColor: '#DC2626',
    badgeStyle: 'psg',
  },
  {
    id: 'club-mancity',
    name: 'Manchester City',
    shortName: 'MCI',
    leagueId: 'premier-league',
    leagueName: 'Premier League',
    country: 'Anh',
    primaryColor: '#38BDF8',
    secondaryColor: '#FFFFFF',
    badgeStyle: 'mancity',
  },
  {
    id: 'club-liverpool',
    name: 'Liverpool FC',
    shortName: 'LIV',
    leagueId: 'premier-league',
    leagueName: 'Premier League',
    country: 'Anh',
    primaryColor: '#B91C1C',
    secondaryColor: '#15803D',
    badgeStyle: 'liverpool',
  },
  {
    id: 'club-arsenal',
    name: 'Arsenal FC',
    shortName: 'ARS',
    leagueId: 'premier-league',
    leagueName: 'Premier League',
    country: 'Anh',
    primaryColor: '#EF4444',
    secondaryColor: '#3B82F6',
    badgeStyle: 'arsenal',
  },
  {
    id: 'club-chelsea',
    name: 'Chelsea FC',
    shortName: 'CHE',
    leagueId: 'premier-league',
    leagueName: 'Premier League',
    country: 'Anh',
    primaryColor: '#1D4ED8',
    secondaryColor: '#FACC15',
    badgeStyle: 'chelsea',
  },
  {
    id: 'club-dortmund',
    name: 'Borussia Dortmund',
    shortName: 'BVB',
    leagueId: 'bundesliga',
    leagueName: 'Bundesliga',
    country: 'Đức',
    primaryColor: '#EAB308',
    secondaryColor: '#09090B',
    badgeStyle: 'dortmund',
  },
  {
    id: 'club-atletico',
    name: 'Atlético de Madrid',
    shortName: 'ATM',
    leagueId: 'la-liga',
    leagueName: 'La Liga',
    country: 'Tây Ban Nha',
    primaryColor: '#DC2626',
    secondaryColor: '#2563EB',
    badgeStyle: 'atletico',
  },
];
