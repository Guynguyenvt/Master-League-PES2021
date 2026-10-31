import React, { useState } from 'react';
import { RefreshCw, LogOut, Copy, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { MasterLeagueState } from '../types';
import {
  useSyncStatus,
  syncNow,
  signIn,
  signOut,
  getConfigCode,
  parseConfigCode,
  describeError,
} from '../utils/firebaseSync';

interface Props {
  state: MasterLeagueState;
}

const inputCls =
  'w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500';
const primaryBtn =
  'py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50';
const ghostBtn =
  'py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 border border-slate-700 cursor-pointer disabled:opacity-50';

export const FirebaseSyncPanel: React.FC<Props> = ({ state }) => {
  const s = useSyncStatus();
  const [code, setCode] = useState('');
  const [projectId, setProjectId] = useState('my-apps-a4fdc');
  const [apiKey, setApiKey] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const onCode = (v: string) => {
    setCode(v);
    const c = parseConfigCode(v);
    if (c) {
      setProjectId(c.p);
      setApiKey(c.k);
      setMsg('Đã điền Project ID và API Key từ mã cấu hình');
    }
  };

  const auth = async (mode: 'signInWithPassword' | 'signUp') => {
    if (!projectId.trim() || !apiKey.trim() || !email.trim() || !password) {
      setMsg('Nhập đủ Project ID, API Key, Email và Mật khẩu');
      return;
    }
    setBusy(true);
    setMsg('');
    try {
      await signIn(projectId.trim(), apiKey.trim(), email.trim(), password, mode);
      setPassword('');
    } catch (e) {
      setMsg(describeError(e));
    } finally {
      setBusy(false);
    }
  };

  const downloadBackup = () => {
    const b = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    const url = URL.createObjectURL(b);
    a.href = url;
    a.download = `master-league-sao-luu-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const copyConfig = async () => {
    const c = getConfigCode();
    try {
      await navigator.clipboard.writeText(c);
      setMsg('Đã sao chép mã cấu hình');
    } catch {
      window.prompt('Sao chép mã này:', c);
    }
  };

  const label =
    s.status === 'syncing'
      ? 'Đang đồng bộ…'
      : s.status === 'synced'
      ? 'Đã đồng bộ' + (s.lastSync ? ' lúc ' + new Date(s.lastSync).toLocaleTimeString('vi-VN') : '')
      : s.status === 'error'
      ? s.message || 'Lỗi đồng bộ'
      : s.status === 'idle'
      ? 'Chờ đồng bộ'
      : 'Chưa kết nối';

  return (
    <div className="space-y-4 overflow-y-auto pr-1 flex-1">
      <div className="rounded-2xl p-4 bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                s.status === 'synced'
                  ? 'bg-emerald-400'
                  : s.status === 'error'
                  ? 'bg-rose-400'
                  : s.status === 'syncing'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-slate-500'
              }`}
            />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Đồng bộ Firebase</span>
          </div>
          <span className="text-[11px] text-slate-300 text-right">{label}</span>
        </div>

        {s.connected ? (
          <>
            <p className="text-xs text-slate-300">
              Tài khoản: <b className="text-cyan-300">{s.email}</b>. Dữ liệu tự đồng bộ khi mở app, khi quay lại app và
              sau mỗi thay đổi.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => syncNow()} disabled={s.status === 'syncing'} className={primaryBtn}>
                <RefreshCw className={`w-3.5 h-3.5 ${s.status === 'syncing' ? 'animate-spin' : ''}`} />
                Đồng bộ ngay
              </button>
              <button onClick={copyConfig} className={ghostBtn}>
                <Copy className="w-3.5 h-3.5" />
                Sao chép mã cấu hình
              </button>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Đăng xuất đồng bộ trên máy này? Dữ liệu trên máy vẫn giữ nguyên.')) signOut();
              }}
              className={ghostBtn + ' w-full'}
            >
              <LogOut className="w-3.5 h-3.5" />
              Đăng xuất
            </button>
          </>
        ) : (
          <>
            <div className="rounded-xl bg-amber-950/60 border border-amber-500/30 p-3 text-[11px] text-amber-200 space-y-2">
              <p>
                Máy mới sẽ nhận dữ liệu từ đám mây nếu đã có bản đồng bộ. Hãy tải file sao lưu trước để an toàn.
              </p>
              <button onClick={downloadBackup} className={ghostBtn}>
                <Download className="w-3.5 h-3.5" />
                Tải file sao lưu (.json)
              </button>
            </div>

            <div className="space-y-2">
              <input
                className={inputCls}
                placeholder="Mã cấu hình từ máy khác (tuỳ chọn)"
                value={code}
                onChange={(e) => onCode(e.target.value)}
                autoCapitalize="off"
                autoCorrect="off"
              />
              <div className="grid grid-cols-2 gap-2">
                <input className={inputCls} placeholder="Project ID" value={projectId} onChange={(e) => setProjectId(e.target.value)} autoCapitalize="off" autoCorrect="off" />
                <input className={inputCls} placeholder="API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} autoCapitalize="off" autoCorrect="off" />
                <input className={inputCls} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoCapitalize="off" />
                <input className={inputCls} type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => auth('signInWithPassword')} disabled={busy} className={primaryBtn}>
                  {busy ? 'Đang xử lý…' : 'Đăng nhập'}
                </button>
                <button onClick={() => auth('signUp')} disabled={busy} className={ghostBtn}>
                  Đăng ký mới
                </button>
              </div>
            </div>
          </>
        )}

        {msg && (
          <div className="flex items-center gap-2 text-[11px] text-cyan-200">
            {s.status === 'error' ? <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{msg}</span>
          </div>
        )}
      </div>

      <p className="text-[11px] text-slate-500 px-1">
        Dùng cùng Project ID, API Key, email và mật khẩu như các app khác của bạn. Dữ liệu app này nằm ở ngăn riêng
        “master-league-pes2021”.
      </p>
    </div>
  );
};
