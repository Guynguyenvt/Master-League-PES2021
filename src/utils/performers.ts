import { MasterLeagueState, Player, PlayerPosition, SeasonStats, Club } from '../types';

export const POSITIONS: PlayerPosition[] = ['CF', 'SS', 'LWF', 'RWF', 'AMF', 'LMF', 'RMF', 'CMF', 'DMF', 'LB', 'RB', 'CB', 'GK'];

export const DEFAULT_AVATAR =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#1e293b"/><circle cx="50" cy="38" r="18" fill="#64748b"/><path d="M14 100c0-22 16-36 36-36s36 14 36 36z" fill="#64748b"/></svg>'
  );

const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const autoPlayerId = (managerId: string, name: string) => `p-auto-${managerId}-${slug(name) || 'unknown'}`;
export const eqName = (a: string, b: string) => (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase();
const asPosition = (v: string | undefined, fallback: PlayerPosition): PlayerPosition =>
  POSITIONS.includes(v as PlayerPosition) ? (v as PlayerPosition) : fallback;

function newAutoPlayer(
  existing: Player[],
  managerId: string,
  clubId: string,
  name: string,
  slot: { position?: string; avatarUrl?: string },
  fallback: PlayerPosition
): Player {
  let id = autoPlayerId(managerId, name);
  if (existing.some((x) => x.id === id)) id = `${id}-${existing.length}`;
  return {
    id,
    managerId,
    clubId,
    name,
    age: 25,
    nationality: '',
    position: asPosition(slot.position, fallback),
    overallRating: 80,
    potential: 85,
    form: 'normal',
    marketValue: 0,
    weeklySalary: 0,
    avatarUrl: slot.avatarUrl || DEFAULT_AVATAR,
    seasonsCount: 0,
    appearances: 0,
    goals: 0,
    assists: 0,
    motmCount: 0,
    avgRating: 0,
    trophiesWon: 0,
    clutchGoalsInFinals: 0,
    attributes: { pace: 70, shooting: 70, passing: 70, dribbling: 70, defending: 70, physical: 70, clutch: 70 },
    autoCreated: true,
  };
}

/** Số bàn / kiến tạo / trận của một cầu thủ trong 1 mùa (nếu vừa là Top ghi bàn vừa là Top kiến tạo thì lấy số lớn hơn, không cộng đôi). */
function seasonLine(s: SeasonStats, playerId: string) {
  const sc = s.topScorer && s.topScorer.playerId === playerId ? s.topScorer : null;
  const ast = s.topAssist && s.topAssist.playerId === playerId ? s.topAssist : null;
  if (!sc && !ast) return null;
  return {
    goals: Math.max(sc?.goals || 0, ast?.goals || 0),
    assists: Math.max(sc?.assists || 0, ast?.assists || 0),
    matches: Math.max(sc?.matches || 0, ast?.matches || 0),
  };
}

/**
 * Đưa dữ liệu về trạng thái nhất quán:
 *  - Mỗi "Top 1 ghi bàn / kiến tạo" của mùa được liên kết với đúng 1 cầu thủ trong danh sách cầu thủ.
 *  - Tên / ảnh / vị trí hiển thị ở các mùa luôn lấy từ cầu thủ (sửa 1 chỗ, đổi mọi nơi).
 *  - Tổng bàn thắng, kiến tạo, số trận, số mùa của cầu thủ = cộng dồn từ các mùa (kể cả khi đổi CLB).
 * Trả về đúng đối tượng cũ nếu không có gì thay đổi.
 */
export function normalizeState(state: MasterLeagueState): MasterLeagueState {
  if (!state || !Array.isArray(state.seasons) || !Array.isArray(state.players)) return state;
  let changed = false;
  let players = state.players;
  const addPlayer = (p: Player) => {
    if (players === state.players) players = [...players];
    players.push(p);
    changed = true;
  };

  const seasons = state.seasons.map((season) => {
    let s = season;
    (['topScorer', 'topAssist'] as const).forEach((key) => {
      const slot = s[key];
      if (!slot) return;
      let p =
        players.find((x) => x.id === slot.playerId && x.managerId === s.managerId) ||
        players.find((x) => x.managerId === s.managerId && eqName(x.name, slot.playerName));
      if (!p) {
        const name = (slot.playerName || '').trim();
        if (!name) return;
        p = newAutoPlayer(players, s.managerId, s.clubId, name, slot, key === 'topScorer' ? 'CF' : 'AMF');
        addPlayer(p);
      }
      if (
        slot.playerId !== p.id ||
        slot.playerName !== p.name ||
        slot.position !== p.position ||
        (slot.avatarUrl || '') !== (p.avatarUrl || '')
      ) {
        s = { ...s, [key]: { ...slot, playerId: p.id, playerName: p.name, position: p.position, avatarUrl: p.avatarUrl } } as SeasonStats;
        changed = true;
      }
    });

    const mvp = s.seasonMVP;
    if (mvp) {
      const mp =
        players.find((x) => x.id === mvp.playerId && x.managerId === s.managerId) ||
        (String(mvp.playerId || '').startsWith('p-custom') ? players.find((x) => x.id === s.topScorer?.playerId) : undefined);
      if (
        mp &&
        (mvp.playerId !== mp.id || mvp.playerName !== mp.name || mvp.position !== mp.position || (mvp.avatarUrl || '') !== (mp.avatarUrl || ''))
      ) {
        s = { ...s, seasonMVP: { ...mvp, playerId: mp.id, playerName: mp.name, position: mp.position, avatarUrl: mp.avatarUrl } };
        changed = true;
      }
    }
    return s;
  });

  // Cộng dồn từ các mùa
  const acc = new Map<string, { goals: number; assists: number; apps: number; seasons: number }>();
  for (const s of seasons) {
    const ids = new Set<string>();
    if (s.topScorer) ids.add(s.topScorer.playerId);
    if (s.topAssist) ids.add(s.topAssist.playerId);
    ids.forEach((id) => {
      const line = seasonLine(s, id);
      if (!line) return;
      const a = acc.get(id) || { goals: 0, assists: 0, apps: 0, seasons: 0 };
      a.goals += line.goals;
      a.assists += line.assists;
      a.apps += line.matches;
      a.seasons += 1;
      acc.set(id, a);
    });
  }

  let touched = false;
  const next: Player[] = [];
  for (const p of players) {
    const a = acc.get(p.id);
    if (!a) {
      if (p.autoCreated) {
        touched = true; // cầu thủ tự tạo nhưng không còn mùa nào nhắc tới
        continue;
      }
      next.push(p);
      continue;
    }
    if (p.goals !== a.goals || p.assists !== a.assists || p.appearances !== a.apps || p.seasonsCount !== a.seasons) {
      next.push({ ...p, goals: a.goals, assists: a.assists, appearances: a.apps, seasonsCount: a.seasons });
      touched = true;
    } else {
      next.push(p);
    }
  }
  if (touched) {
    players = next;
    changed = true;
  }

  if (!changed) return state;
  return { ...state, seasons, players };
}

export interface PerformerEdit {
  name: string;
  position: PlayerPosition;
  nationality: string;
  age: number;
  avatarUrl: string;
  goals: number;
  assists: number;
  matches: number;
}

/** Số mùa đang nhắc tới cầu thủ này (ở vị trí Top ghi bàn hoặc Top kiến tạo). */
export function countPlayerRefs(seasons: SeasonStats[], playerId: string): number {
  return seasons.filter((s) => s.topScorer?.playerId === playerId || s.topAssist?.playerId === playerId).length;
}

/** Áp dụng chỉnh sửa Top 1 ghi bàn / Top 1 kiến tạo của một mùa. */
export function applyPerformerEdit(
  state: MasterLeagueState,
  seasonId: string,
  kind: 'scorer' | 'assist',
  data: PerformerEdit,
  renameAll: boolean
): MasterLeagueState {
  const season = state.seasons.find((s) => s.id === seasonId);
  const name = data.name.trim();
  if (!season || !name) return state;
  const key = kind === 'scorer' ? 'topScorer' : 'topAssist';
  const cur = season[key];

  let players = [...state.players];
  const curPlayer = players.find((p) => p.id === cur.playerId && p.managerId === season.managerId);
  let target = players.find((p) => p.managerId === season.managerId && eqName(p.name, name));
  if (!target) {
    if (curPlayer && renameAll) {
      target = curPlayer;
    } else {
      target = newAutoPlayer(players, season.managerId, season.clubId, name, { position: data.position, avatarUrl: data.avatarUrl }, data.position);
      players.push(target);
    }
  }
  const tid = target.id;
  players = players.map((p) =>
    p.id === tid
      ? {
          ...p,
          name,
          position: data.position,
          nationality: data.nationality,
          age: data.age > 0 ? data.age : p.age,
          avatarUrl: data.avatarUrl || p.avatarUrl || DEFAULT_AVATAR,
        }
      : p
  );

  const common = { playerId: tid, playerName: name, position: data.position, avatarUrl: data.avatarUrl || undefined };
  const seasons = state.seasons.map((s) =>
    s.id !== seasonId
      ? s
      : kind === 'scorer'
      ? { ...s, topScorer: { ...s.topScorer, ...common, goals: data.goals, assists: data.assists, matches: data.matches } }
      : { ...s, topAssist: { ...s.topAssist, ...common, goals: data.goals, assists: data.assists, matches: data.matches } }
  );
  return normalizeState({ ...state, seasons, players });
}

/** Tổng bàn thắng / kiến tạo của cầu thủ theo từng CLB (khi cầu thủ theo HLV sang nhiều CLB). */
export function playerClubBreakdown(playerId: string, seasons: SeasonStats[], clubs: Club[]) {
  const map = new Map<string, { clubId: string; clubName: string; goals: number; assists: number; seasons: number }>();
  for (const s of seasons) {
    const line = seasonLine(s, playerId);
    if (!line) continue;
    const e =
      map.get(s.clubId) ||
      { clubId: s.clubId, clubName: clubs.find((c) => c.id === s.clubId)?.name || 'CLB', goals: 0, assists: 0, seasons: 0 };
    e.goals += line.goals;
    e.assists += line.assists;
    e.seasons += 1;
    map.set(s.clubId, e);
  }
  return Array.from(map.values());
}
