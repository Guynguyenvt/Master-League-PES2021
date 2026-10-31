import { useSyncExternalStore } from 'react';

/**
 * Đồng bộ dữ liệu app lên Firebase (Auth email/mật khẩu + Firestore) bằng REST, không cần SDK.
 * Dữ liệu nằm ở: users/{uid}/apps/master-league-pes2021 (+ các phần -p1, -p2... nếu dữ liệu lớn).
 */
const CFG_KEY = 'ml.sync.cfg';
const TS_KEY = 'ml.sync.ts';
const APP = 'master-league-pes2021';
const CHUNK = 300000; // ký tự mỗi phần (tối đa ~900KB UTF-8, dưới giới hạn 1MB của Firestore)
const PUSH_DELAY = 1500;

interface Cfg {
  p: string; // projectId
  k: string; // apiKey
  em: string;
  u: string; // uid
  r: string; // refresh token
  t?: string; // id token
  x?: number; // hạn id token (ms)
}

export type SyncStatus = 'off' | 'idle' | 'syncing' | 'synced' | 'error';
export interface SyncSnapshot {
  connected: boolean;
  status: SyncStatus;
  message: string;
  email: string;
  lastSync: number;
}

let cfg: Cfg | null = null;
try {
  cfg = JSON.parse(localStorage.getItem(CFG_KEY) || 'null');
} catch {
  cfg = null;
}
const saveCfg = () => {
  try {
    if (cfg) localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
    else localStorage.removeItem(CFG_KEY);
  } catch {
    /* ignore */
  }
};

let snap: SyncSnapshot = {
  connected: !!cfg,
  status: cfg ? 'idle' : 'off',
  message: '',
  email: cfg?.em || '',
  lastSync: 0,
};
const listeners = new Set<() => void>();
function update(p: Partial<SyncSnapshot>) {
  snap = { ...snap, ...p };
  listeners.forEach((l) => l());
}
export const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
export const getSnapshot = () => snap;
export const useSyncStatus = () => useSyncExternalStore(subscribe, getSnapshot);

const getLocalTs = () => Number(localStorage.getItem(TS_KEY)) || 0;
const setLocalTs = (t: number) => {
  try {
    localStorage.setItem(TS_KEY, String(t));
  } catch {
    /* ignore */
  }
};

interface Handlers {
  getState: () => unknown;
  applyState: (remote: any) => void;
}
let handlers: Handlers | null = null;
export function initSync(h: Handlers) {
  handlers = h;
}

/* ---------- Lỗi ---------- */
const AUTH_ERR: Record<string, string> = {
  EMAIL_NOT_FOUND: 'Email chưa đăng ký',
  INVALID_PASSWORD: 'Sai mật khẩu',
  INVALID_LOGIN_CREDENTIALS: 'Sai email hoặc mật khẩu',
  EMAIL_EXISTS: 'Email đã có, hãy bấm Đăng nhập',
  OPERATION_NOT_ALLOWED: 'Chưa bật Email/Password trong Firebase',
  API_KEY_INVALID: 'API Key không đúng',
  WEAK_PASSWORD: 'Mật khẩu tối thiểu 6 ký tự',
  INVALID_EMAIL: 'Email không hợp lệ',
  TOO_MANY_ATTEMPTS_TRY_LATER: 'Thử quá nhiều lần, hãy chờ một lúc',
};
export function describeError(e: unknown): string {
  const s = String((e as any)?.message ?? e);
  const code = s.split(/[ :]/)[0];
  if (AUTH_ERR[code]) return AUTH_ERR[code];
  if (s === 'AUTH') return 'Phiên đăng nhập hết hạn, hãy đăng nhập lại';
  if (s === '401' || s === '403') return 'Firebase từ chối: kiểm tra Rules đã Publish chưa';
  if (s === 'MISSING') return 'Dữ liệu đám mây bị thiếu phần, hãy đồng bộ lại từ máy gốc';
  if (s.includes('Failed to fetch') || s.includes('NetworkError')) return 'Không có kết nối mạng';
  return 'Lỗi: ' + s;
}

/* ---------- Token & đường dẫn ---------- */
async function token(): Promise<string> {
  if (!cfg) throw 'AUTH';
  if (cfg.t && cfg.x && Date.now() < cfg.x - 60000) return cfg.t;
  const r = await fetch('https://securetoken.googleapis.com/v1/token?key=' + encodeURIComponent(cfg.k), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(cfg.r),
  });
  if (!r.ok) throw 'AUTH';
  const j = await r.json();
  cfg = { ...cfg, t: j.id_token, r: j.refresh_token, x: Date.now() + Number(j.expires_in) * 1000 };
  saveCfg();
  return cfg.t as string;
}
const dbRoot = () => `projects/${cfg!.p}/databases/(default)/documents`;
const docName = (id: string) => `${dbRoot()}/users/${cfg!.u}/apps/${id}`;
const docUrl = (id: string) => `https://firestore.googleapis.com/v1/${docName(id)}`;
const chunkId = (i: number) => (i === 0 ? APP : `${APP}-p${i}`);

function split(json: string): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < json.length) {
    let e = Math.min(i + CHUNK, json.length);
    if (e < json.length) {
      const c = json.charCodeAt(e - 1);
      if (c >= 0xd800 && c <= 0xdbff) e--; // không cắt giữa cặp surrogate (emoji)
    }
    out.push(json.slice(i, e));
    i = e;
  }
  return out.length ? out : [''];
}

/* ---------- Đọc / ghi Firestore ---------- */
async function doPush(): Promise<void> {
  if (!handlers || !cfg) return;
  const parts = split(JSON.stringify(handlers.getState()));
  const ts = getLocalTs();
  const writes = parts.map((d, i) => ({
    update: {
      name: docName(chunkId(i)),
      fields:
        i === 0
          ? { ts: { integerValue: String(ts) }, n: { integerValue: String(parts.length) }, d: { stringValue: d } }
          : { d: { stringValue: d } },
    },
  }));
  const t = await token();
  const r = await fetch(`https://firestore.googleapis.com/v1/${dbRoot()}:commit`, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' },
    body: JSON.stringify({ writes }),
  });
  if (!r.ok) throw String(r.status);
}

async function fetchMeta(): Promise<{ ts: number; n: number; d: string } | null> {
  const t = await token();
  const r = await fetch(docUrl(APP), { headers: { Authorization: 'Bearer ' + t } });
  if (r.status === 404) return null;
  if (!r.ok) throw String(r.status);
  const f = (await r.json()).fields || {};
  return { ts: Number(f.ts?.integerValue ?? 0), n: Number(f.n?.integerValue ?? 1), d: f.d?.stringValue ?? '' };
}

async function fetchRest(n: number): Promise<string[]> {
  const out: string[] = new Array(Math.max(n, 1)).fill('');
  if (n <= 1) return out;
  const names: string[] = [];
  for (let i = 1; i < n; i++) names.push(docName(chunkId(i)));
  const t = await token();
  const r = await fetch(`https://firestore.googleapis.com/v1/${dbRoot()}:batchGet`, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' },
    body: JSON.stringify({ documents: names }),
  });
  if (!r.ok) throw String(r.status);
  const arr = await r.json();
  for (const it of arr) {
    if (!it.found) throw 'MISSING';
    const idx = names.indexOf(it.found.name);
    if (idx >= 0) out[idx + 1] = it.found.fields?.d?.stringValue ?? '';
  }
  return out;
}

/* ---------- Hàng đợi, đồng bộ, đánh dấu thay đổi ---------- */
let queue: Promise<unknown> = Promise.resolve();
function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const p = queue.then(fn, fn);
  queue = p.catch(() => undefined);
  return p;
}

export function syncNow(): Promise<void> {
  return enqueue(async () => {
    if (!cfg || !handlers) return;
    update({ status: 'syncing', message: '' });
    try {
      const m = await fetchMeta();
      const local = getLocalTs();
      if (m === null) {
        if (!local) setLocalTs(Date.now());
        await doPush();
      } else if (m.ts > local) {
        const rest = await fetchRest(m.n);
        const remote = JSON.parse(m.d + rest.slice(1).join(''));
        setLocalTs(m.ts);
        handlers.applyState(remote);
      } else if (m.ts < local) {
        await doPush();
      }
      update({ status: 'synced', message: '', lastSync: Date.now() });
    } catch (e) {
      update({ status: 'error', message: describeError(e) });
    }
  });
}

let timer: ReturnType<typeof setTimeout> | null = null;
/** Gọi mỗi khi dữ liệu thay đổi do người dùng. */
export function markChanged() {
  setLocalTs(Date.now());
  if (!cfg) return;
  update({ status: 'syncing' });
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    enqueue(async () => {
      try {
        await doPush();
        update({ status: 'synced', message: '', lastSync: Date.now() });
      } catch (e) {
        update({ status: 'error', message: describeError(e) });
      }
    });
  }, PUSH_DELAY);
}

/* ---------- Đăng nhập / đăng xuất ---------- */
export async function signIn(
  p: string,
  k: string,
  email: string,
  password: string,
  mode: 'signInWithPassword' | 'signUp'
): Promise<void> {
  const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:${mode}?key=${encodeURIComponent(k)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error?.message || 'ERR');
  cfg = { p, k, em: email, u: j.localId, r: j.refreshToken, t: j.idToken, x: Date.now() + Number(j.expiresIn) * 1000 };
  saveCfg();
  update({ connected: true, status: 'idle', email, message: '' });
  await syncNow();
}

export function signOut() {
  cfg = null;
  saveCfg();
  update({ connected: false, status: 'off', email: '', message: '' });
}

/* ---------- Mã cấu hình (Project ID + API Key) để khỏi gõ lại trên máy khác ---------- */
export const getConfigCode = (): string => (cfg ? btoa(JSON.stringify({ p: cfg.p, k: cfg.k })) : '');
export function parseConfigCode(code: string): { p: string; k: string } | null {
  try {
    const o = JSON.parse(atob(code.trim()));
    return o && o.p && o.k ? { p: String(o.p), k: String(o.k) } : null;
  } catch {
    return null;
  }
}
