import React from 'react';
import { TrophyRecord } from '../types';
import { Trophy3D } from './Trophy3D';
import { Trophy, Award, Sparkles, Star, Calendar, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TrophyRoom3DProps {
  trophies: TrophyRecord[];
}

export const TrophyRoom3D: React.FC<TrophyRoom3DProps> = ({ trophies }) => {
  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FACC15', '#38BDF8', '#F43F5E', '#10B981', '#FFFFFF'],
    });
  };

  // Group trophies by type
  const uclCount = trophies.filter((t) => t.competitionType === 'european_cup').length;
  const leagueCount = trophies.filter((t) => t.competitionType === 'league').length;
  const cwcCount = trophies.filter((t) => t.competitionType === 'club_world_cup').length;
  const cupCount = trophies.filter((t) => t.competitionType === 'national_cup').length;
  const superCupCount = trophies.filter(
    (t) => t.competitionType === 'national_super_cup' || t.competitionType === 'european_super_cup'
  ).length;

  return (
    <div className="space-y-4">
      {/* 3D Trophy Cabinet Hero Header */}
      <div className="rounded-3xl ios-glass-card p-5 border border-amber-500/40 relative overflow-hidden text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl -z-10" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> PHÒNG TRUYỀN THỐNG 3D
              </span>
              <span className="text-xs text-slate-300 font-mono">
                Tổng: {trophies.length} Chiếc Cúp
              </span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">
              Phòng Truyền Thống Đẳng Cấp
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Nơi lưu danh toàn bộ vinh quang đỉnh cao Master League PES 2021 qua các triều đại.
            </p>
          </div>

          <button
            onClick={triggerCelebration}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition active:scale-95 self-start sm:self-auto cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> Bắn Pháo Hoa Ăn Mừng 🎉
          </button>
        </div>

        {/* 3D Trophy Showcase Pedestal Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-5 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex flex-col items-center text-center">
            <Trophy3D type="ucl" size="md" />
            <span className="text-xs font-bold text-white mt-2">Cúp C1 Châu Âu</span>
            <span className="text-base font-black text-cyan-400 font-mono-stat">{uclCount}</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex flex-col items-center text-center">
            <Trophy3D type="league" size="md" />
            <span className="text-xs font-bold text-white mt-2">VĐ Quốc Gia</span>
            <span className="text-base font-black text-amber-400 font-mono-stat">{leagueCount}</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex flex-col items-center text-center">
            <Trophy3D type="cwc" size="md" />
            <span className="text-xs font-bold text-white mt-2">FIFA Club World Cup</span>
            <span className="text-base font-black text-amber-300 font-mono-stat">{cwcCount}</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex flex-col items-center text-center">
            <Trophy3D type="cup" size="md" />
            <span className="text-xs font-bold text-white mt-2">Cúp Quốc Gia</span>
            <span className="text-base font-black text-emerald-400 font-mono-stat">{cupCount}</span>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex flex-col items-center text-center">
            <Trophy3D type="supercup" size="md" />
            <span className="text-xs font-bold text-white mt-2">Siêu Cúp QG & Châu Âu</span>
            <span className="text-base font-black text-rose-400 font-mono-stat">{superCupCount}</span>
          </div>
        </div>
      </div>

      {/* Individual Trophy Showcase Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 px-1 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          Danh Sách Chi Tiết Từng Chiếc Cúp Đã Chinh Phục
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {trophies.map((trophy) => (
            <div
              key={trophy.id}
              className="rounded-3xl ios-glass-card p-4 border border-slate-700/60 flex items-center gap-3.5 hover:border-amber-500/50 transition group"
            >
              <div className="p-2 rounded-2xl bg-slate-900/90 border border-slate-800 group-hover:scale-105 transition shrink-0">
                <Trophy3D
                  type={
                    trophy.competitionType === 'european_cup'
                      ? 'ucl'
                      : trophy.competitionType === 'club_world_cup'
                      ? 'cwc'
                      : trophy.competitionType === 'league'
                      ? 'league'
                      : 'cup'
                  }
                  size="md"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-extrabold text-white truncate group-hover:text-amber-300 transition">
                  {trophy.title}
                </h4>
                <div className="text-xs text-slate-300 font-medium mt-0.5">
                  CLB: <b className="text-white">{trophy.clubName}</b>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-1 font-mono">
                  <span>Mùa {trophy.seasonName}</span>
                  <span>•</span>
                  <span>{trophy.dateWon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
