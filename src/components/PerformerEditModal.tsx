import React, { useEffect, useState } from 'react';
import { Player, SeasonStats } from '../types';
import { POSITIONS, DEFAULT_AVATAR, PerformerEdit, eqName } from '../utils/performers';
import { compressImage } from './ImageUploadModal';
import { X, Flame, Zap, Camera } from 'lucide-react';

interface Props {
  isOpen: boolean;
  kind: 'scorer' | 'assist';
  season: SeasonStats | null;
  players: Player[];
  onClose: () => void;
  onSave: (data: PerformerEdit) => void;
}

const field =
  'w-full bg-slate-900 text-white p-2 rounded-xl border border-slate-700 font-bold text-xs outline-none focus:border-cyan-400';

export const PerformerEditModal: React.FC<Props> = ({ isOpen, kind, season, players, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('CF');
  const [nationality, setNationality] = useState('');
  const [age, setAge] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [goals, setGoals] = useState('0');
  const [assists, setAssists] = useState('0');
  const [matches, setMatches] = useState('0');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const slot = season ? (kind === 'scorer' ? season.topScorer : season.topAssist) : null;

  useEffect(() => {
    if (!isOpen || !season || !slot) return;
    const p = players.find((x) => x.id === slot.playerId);
    setName(p?.name ?? slot.playerName);
    setPosition(p?.position ?? slot.position ?? 'CF');
    setNationality(p?.nationality ?? '');
    setAge(p?.age ? String(p.age) : '');
    setAvatarUrl(p?.avatarUrl ?? slot.avatarUrl ?? '');
    setGoals(String(slot.goals ?? 0));
    setAssists(String(slot.assists ?? 0));
    setMatches(String(slot.matches ?? 0));
    setBusy(false);
    setErr('');
  }, [isOpen, season?.id, kind]);

  if (!isOpen || !season || !slot) return null;

  const isScorer = kind === 'scorer';
  const accent = isScorer ? 'text-amber-400' : 'text-cyan-400';

  const onName = (v: string) => {
    setName(v);
    const m = players.find((p) => eqName(p.name, v) && p.id !== slot.playerId);
    if (m) {
      setPosition(m.position);
      setNationality(m.nationality || '');
      setAge(m.age ? String(m.age) : '');
      setAvatarUrl(m.avatarUrl || '');
    }
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const f = input.files?.[0];
    if (!f) return;
    setBusy(true);
    setErr('');
    compressImage(f)
      .then((r) => setAvatarUrl(r))
      .catch(() => setErr('Không đọc được ảnh này, hãy thử ảnh JPG hoặc PNG'))
      .finally(() => {
        setBusy(false);
        input.value = '';
      });
  };

  const num = (v: string) => Math.max(0, parseInt(v) || 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErr('Hãy nhập tên cầu thủ');
      return;
    }
    onSave({
      name: name.trim(),
      position: position as PerformerEdit['position'],
      nationality: nationality.trim(),
      age: num(age),
      avatarUrl,
      goals: num(goals),
      assists: num(assists),
      matches: num(matches),
    });
  };

  const numField = (label: string, value: string, set: (v: string) => void, hi: boolean) => (
    <div>
      <span className={`text-[10px] block font-bold mb-1 ${hi ? accent : 'text-slate-400'}`}>{label}</span>
      <input
        type="number"
        min={0}
        inputMode="numeric"
        value={value}
        onChange={(e) => set(e.target.value)}
        className={field + ' text-center font-mono'}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-3xl ios-glass-card p-5 border border-slate-700 shadow-2xl relative my-8 text-white space-y-3"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className={`p-2.5 rounded-2xl ${isScorer ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
            {isScorer ? <Flame className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-base font-black">{isScorer ? 'Sửa Top 1 Ghi Bàn' : 'Sửa Top 1 Kiến Tạo'}</h3>
            <p className="text-[11px] text-slate-400">Mùa {season.seasonName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0 cursor-pointer group">
            <img src={avatarUrl || DEFAULT_AVATAR} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-[9px] text-cyan-300 font-bold">
              <Camera className="w-4 h-4 mb-0.5" />
              {busy ? 'Đang xử lý…' : 'Đổi ảnh'}
            </div>
            <input type="file" accept="image/*" onChange={onFile} className="hidden" />
          </label>
          <div className="flex-1 space-y-2">
            <div>
              <span className="text-[10px] text-slate-400 block font-bold mb-1">Tên cầu thủ</span>
              <input
                list="perf-players"
                value={name}
                onChange={(e) => onName(e.target.value)}
                className={field}
                placeholder="Tên cầu thủ"
              />
              <datalist id="perf-players">
                {players.map((p) => (
                  <option key={p.id} value={p.name} />
                ))}
              </datalist>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <span className="text-[10px] text-slate-400 block font-bold mb-1">Vị trí</span>
            <select value={position} onChange={(e) => setPosition(e.target.value)} className={field}>
              {POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold mb-1">Quốc tịch</span>
            <input value={nationality} onChange={(e) => setNationality(e.target.value)} className={field} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold mb-1">Tuổi</span>
            <input type="number" min={0} inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} className={field + ' text-center font-mono'} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800">
          {numField('Bàn thắng', goals, setGoals, isScorer)}
          {numField('Kiến tạo', assists, setAssists, !isScorer)}
          {numField('Số trận', matches, setMatches, false)}
        </div>

        <p className="text-[10px] text-slate-500">
          Số liệu của cầu thủ trong mùa này. Tổng bàn thắng và kiến tạo ở tab Ngôi Sao tự cộng dồn từ các mùa (kể cả khi
          cầu thủ theo HLV sang CLB khác).
        </p>
        {err && <p className="text-[11px] text-rose-300">{err}</p>}

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button type="button" onClick={onClose} className="py-2.5 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs cursor-pointer">
            Hủy
          </button>
          <button
            type="submit"
            disabled={busy}
            className="py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 font-black text-xs cursor-pointer disabled:opacity-50"
          >
            Lưu Thay Đổi
          </button>
        </div>
      </form>
    </div>
  );
};
