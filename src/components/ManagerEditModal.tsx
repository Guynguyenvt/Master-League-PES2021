import React, { useEffect, useState } from 'react';
import { Manager } from '../types';
import { X, UserCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  manager: Manager | null | undefined;
  onClose: () => void;
  onSave: (data: { name: string; nationality: string; age: number }) => void;
}

const field =
  'w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700 font-bold text-sm outline-none focus:border-cyan-400';

export const ManagerEditModal: React.FC<Props> = ({ isOpen, manager, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [nationality, setNationality] = useState('');
  const [age, setAge] = useState('');

  useEffect(() => {
    if (isOpen && manager) {
      setName(manager.name);
      setNationality(manager.nationality);
      setAge(String(manager.age ?? ''));
    }
  }, [isOpen, manager?.id]);

  if (!isOpen || !manager) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          onSave({ name: name.trim(), nationality: nationality.trim(), age: Math.max(0, parseInt(age) || 0) });
        }}
        className="w-full max-w-sm rounded-3xl ios-glass-card p-5 border border-slate-700 shadow-2xl relative my-8 text-white space-y-3"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black">Sửa Thông Tin HLV</h3>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 block font-bold mb-1">Tên HLV</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className={field} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-400 block font-bold mb-1">Quốc tịch</span>
            <input value={nationality} onChange={(e) => setNationality(e.target.value)} className={field} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold mb-1">Tuổi</span>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className={field + ' text-center font-mono'}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button type="button" onClick={onClose} className="py-2.5 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs cursor-pointer">
            Hủy
          </button>
          <button type="submit" className="py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 font-black text-xs cursor-pointer">
            Lưu
          </button>
        </div>
      </form>
    </div>
  );
};
