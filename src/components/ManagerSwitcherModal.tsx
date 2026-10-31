import React, { useState } from 'react';
import { Manager, Club } from '../types';
import { ClubBadge3D } from './ClubBadge3D';
import { X, UserCheck, Plus, Shield, Award, Sparkles, Trash2, AlertTriangle } from 'lucide-react';

interface ManagerSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  managers: Manager[];
  activeManagerId: string;
  clubs: Club[];
  onSelectManager: (id: string) => void;
  onAddManager: (manager: Manager) => void;
  onDeleteManager?: (id: string) => void;
}

export const ManagerSwitcherModal: React.FC<ManagerSwitcherModalProps> = ({
  isOpen,
  onClose,
  managers,
  activeManagerId,
  clubs,
  onSelectManager,
  onAddManager,
  onDeleteManager,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [managerToDelete, setManagerToDelete] = useState<Manager | null>(null);
  const [newName, setNewName] = useState('');
  const [newNationality, setNewNationality] = useState('Việt Nam');
  const [newAge, setNewAge] = useState(45);
  const [newStyle, setNewStyle] = useState('Kiểm Soát & Tấn Công Nhanh');
  const [newClubId, setNewClubId] = useState(clubs[0]?.id || 'club-rm');

  if (!isOpen) return null;

  const handleCreateManager = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newMgr: Manager = {
      id: `mgr-${Date.now()}`,
      name: newName.trim(),
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      nationality: newNationality.trim(),
      age: newAge,
      tacticalStyle: newStyle.trim(),
      reputationStars: 5,
      favoriteFormation: '4-3-3',
      currentClubId: newClubId,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddManager(newMgr);
    setShowAddForm(false);
    setNewName('');
    onClose();
  };

  const handleConfirmDelete = () => {
    if (managerToDelete && onDeleteManager) {
      onDeleteManager(managerToDelete.id);
      setManagerToDelete(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl ios-glass-card p-5 sm:p-6 border border-slate-700 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Quản Lý Huấn Luyện Viên</h3>
            <p className="text-xs text-slate-400">Chọn, tạo mới hoặc xóa hồ sơ HLV sự nghiệp</p>
          </div>
        </div>

        {!showAddForm ? (
          <div className="space-y-3">
            <div className="space-y-2">
              {managers.map((mgr) => {
                const club = clubs.find((c) => c.id === mgr.currentClubId);
                const isActive = mgr.id === activeManagerId;

                return (
                  <div
                    key={mgr.id}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between group ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border-blue-500 shadow-lg'
                        : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800'
                    }`}
                  >
                    <div
                      onClick={() => {
                        onSelectManager(mgr.id);
                        onClose();
                      }}
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                        <img
                          src={mgr.avatarUrl}
                          alt={mgr.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-white">{mgr.name}</h4>
                          {isActive && (
                            <span className="text-[9px] bg-cyan-500 text-slate-950 px-1.5 py-0.2 rounded font-black uppercase">
                              ĐANG CHỌN
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-300 mt-0.5">
                          CLB hiện tại: <b className="text-amber-300">{club?.name || 'Chưa gán'}</b>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {mgr.nationality} • {mgr.tacticalStyle}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        onClick={() => {
                          onSelectManager(mgr.id);
                          onClose();
                        }}
                        className="cursor-pointer"
                      >
                        <ClubBadge3D club={club} size="sm" />
                      </div>

                      {onDeleteManager && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setManagerToDelete(mgr);
                          }}
                          title={`Xóa HLV ${mgr.name}`}
                          className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 rounded-xl bg-slate-800/60 transition cursor-pointer ml-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 rounded-2xl border border-dashed border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white bg-cyan-950/30 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer mt-2"
            >
              <Plus className="w-4 h-4" /> Tạo Huấn Luyện Viên Mới
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreateManager} className="space-y-3 text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                Tên Huấn Luyện Viên
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700 outline-none focus:border-cyan-400 font-bold"
                placeholder="VD: Park Hang Seo, Zinedine Zidane, Pep Guardiola..."
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                  Quốc Tịch
                </label>
                <input
                  type="text"
                  value={newNationality}
                  onChange={(e) => setNewNationality(e.target.value)}
                  className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700 outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                  Tuổi
                </label>
                <input
                  type="number"
                  value={newAge}
                  onChange={(e) => setNewAge(parseInt(e.target.value) || 40)}
                  className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700 outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                Phong Cách Chiến Thuật
              </label>
              <input
                type="text"
                value={newStyle}
                onChange={(e) => setNewStyle(e.target.value)}
                className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700 outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                CLB Dẫn Dắt Ban Đầu
              </label>
              <select
                value={newClubId}
                onChange={(e) => setNewClubId(e.target.value)}
                className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700 outline-none focus:border-cyan-400 font-bold"
              >
                {clubs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.league})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Quay Lại
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-black text-xs cursor-pointer"
              >
                Lưu HLV Mới
              </button>
            </div>
          </form>
        )}

        {/* Confirmation Modal for deleting manager */}
        {managerToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-3xl ios-glass-card p-5 border border-rose-500/40 shadow-2xl text-white space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Xác Nhận Xóa HLV?</h3>
                  <p className="text-xs text-rose-300">Không thể hoàn tác hành động này</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Bạn có chắc chắn muốn xóa hồ sơ Huấn luyện viên{' '}
                <strong className="text-amber-300 font-bold">{managerToDelete.name}</strong>?
                Toàn bộ dữ liệu các mùa giải và danh hiệu của HLV này sẽ được dọn dẹp.
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setManagerToDelete(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Đồng Ý Xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
