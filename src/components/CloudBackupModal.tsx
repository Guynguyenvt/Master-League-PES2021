import React, { useState, useRef, useEffect } from 'react';
import {
  Cloud,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Copy,
  ExternalLink,
  ShieldCheck,
  X,
  FileJson,
  Smartphone,
  Laptop,
  Share2,
  KeyRound,
  Check,
  Sparkles,
  HelpCircle,
  FolderSync,
  QrCode,
  ArrowRight,
} from 'lucide-react';
import { MasterLeagueState } from '../types';
import { FirebaseSyncPanel } from './FirebaseSyncPanel';

interface CloudBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: MasterLeagueState;
  onRestoreState: (newState: MasterLeagueState) => void;
  lastServerSyncTime?: string | null;
  onTriggerServerSave?: () => Promise<void | boolean>;
  onTriggerServerLoad?: () => Promise<void | boolean>;
}

type CloudProviderType = 'icloud' | 'gdrive' | 'onedrive' | 'dropbox' | 'server_pin';

export const CloudBackupModal: React.FC<CloudBackupModalProps> = ({
  isOpen,
  onClose,
  state,
  onRestoreState,
  lastServerSyncTime,
  onTriggerServerSave,
  onTriggerServerLoad,
}) => {
  const [activeTab, setActiveTab] = useState<'firebase' | 'clouds' | 'pin_sync' | 'server' | 'guide'>('firebase');
  const [selectedProvider, setSelectedProvider] = useState<CloudProviderType>('icloud');
  const [isSavingServer, setIsSavingServer] = useState(false);
  const [isLoadingServer, setIsLoadingServer] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');
  const [copied, setCopied] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  // Sync PIN State
  const [syncCode, setSyncCode] = useState<string>('');
  const [inputSyncCode, setInputSyncCode] = useState<string>('');
  const [isGeneratingPin, setIsGeneratingPin] = useState(false);
  const [isFetchingByPin, setIsFetchingByPin] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto clear status message after 4s
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  if (!isOpen) return null;

  const activeMgr = state.managers.find((m) => m.id === state.activeManagerId) || state.managers[0];

  // Helper to generate formatted JSON string
  const getBackupJsonString = () => {
    return JSON.stringify(state, null, 2);
  };

  const getBackupFileName = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const mgrName = activeMgr ? activeMgr.name.replace(/\s+/g, '_') : 'Career';
    return `PES2021_MasterLeague_${mgrName}_${timestamp}.json`;
  };

  // Trigger file download
  const downloadBackupFile = (targetServiceLabel: string) => {
    const fileName = getBackupFileName();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(getBackupJsonString());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setStatusType('success');
    setStatusMessage(`Đã xuất tệp sao lưu "${fileName}". Bạn hãy lưu vào ${targetServiceLabel} để đồng bộ giữa iPhone và Máy tính.`);
  };

  // iCloud / iOS Native Share (Works seamlessly on iPhone Safari & Mac)
  const handleICloudSave = async () => {
    const fileName = getBackupFileName();
    const jsonContent = getBackupJsonString();

    // Check if Web Share API with Files is supported (iOS Safari / Mobile)
    if (navigator.canShare && navigator.share) {
      try {
        const file = new File([jsonContent], fileName, { type: 'application/json' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Master League PES 2021 Backup',
            text: `Sao lưu dữ liệu Master League (${activeMgr?.name || 'HLV'})`,
            files: [file],
          });
          setStatusType('success');
          setStatusMessage('Đã mở menu chia sẻ iOS! Hãy chọn "Lưu vào Tệp" ➔ Chọn thư mục iCloud Drive.');
          return;
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Web share failed, falling back to direct download', err);
        } else {
          return;
        }
      }
    }

    // Fallback standard download
    downloadBackupFile('iCloud Drive (Thư mục Tệp / Files trên iPhone)');
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const raw = event.target?.result as string;
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.managers) && Array.isArray(parsed.clubs)) {
            onRestoreState(parsed);
            setStatusType('success');
            setStatusMessage('Khôi phục dữ liệu Master League thành công từ tệp sao lưu!');
          } else {
            setStatusType('error');
            setStatusMessage('Tệp không đúng định dạng sao lưu Master League PES 2021.');
          }
        } catch (err: any) {
          setStatusType('error');
          setStatusMessage(`Không thể đọc tệp: ${err.message}`);
        }
      };
      reader.readAsText(file);
    }
  };

  // Generate 6-digit Sync PIN Code on server
  const handleGenerateSyncPin = async () => {
    setIsGeneratingPin(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/backup/sync-code/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: state,
        }),
      });
      const result = await res.json();
      if (result.success && result.code) {
        setSyncCode(result.code);
        setStatusType('success');
        setStatusMessage(`Đã tạo mã đồng bộ: ${result.code}. Hãy nhập mã này trên thiết bị còn lại!`);
      } else {
        throw new Error(result.error || 'Không thể tạo mã đồng bộ');
      }
    } catch (e: any) {
      setStatusType('error');
      setStatusMessage(`Lỗi tạo mã: ${e.message}`);
    } finally {
      setIsGeneratingPin(false);
    }
  };

  // Fetch and restore state by 6-digit Sync PIN Code
  const handleRestoreBySyncPin = async () => {
    const cleanPin = inputSyncCode.trim().replace(/\D/g, '');
    if (!cleanPin || cleanPin.length < 4) {
      setStatusType('error');
      setStatusMessage('Vui lòng nhập mã PIN hợp lệ (4 - 6 số)');
      return;
    }

    if (!window.confirm(`Bạn có muốn tải toàn bộ dữ liệu từ mã đồng bộ ${cleanPin} và ghi đè dữ liệu hiện tại?`)) {
      return;
    }

    setIsFetchingByPin(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/backup/sync-code/${cleanPin}`);
      const result = await res.json();
      if (result.success && result.data && Array.isArray(result.data.managers)) {
        onRestoreState(result.data);
        setStatusType('success');
        setStatusMessage(`Đồng bộ thành công dữ liệu từ mã ${cleanPin}! Toàn bộ dữ liệu đã được cập nhật.`);
        setInputSyncCode('');
      } else {
        setStatusType('error');
        setStatusMessage(result.error || 'Không tìm thấy dữ liệu cho mã PIN này.');
      }
    } catch (e: any) {
      setStatusType('error');
      setStatusMessage(`Lỗi khi nhận dữ liệu: ${e.message}`);
    } finally {
      setIsFetchingByPin(false);
    }
  };

  // Direct Server Save
  const handleManualServerSave = async () => {
    setIsSavingServer(true);
    setStatusMessage(null);
    try {
      if (onTriggerServerSave) {
        await onTriggerServerSave();
      } else {
        const res = await fetch('/api/backup/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state),
        });
        if (!res.ok) throw new Error('Máy chủ phản hồi không hợp lệ');
      }
      setStatusType('success');
      setStatusMessage('Đã sao lưu thành công toàn bộ dữ liệu lên máy chủ trung tâm!');
    } catch (e: any) {
      setStatusType('error');
      setStatusMessage(`Lỗi: ${e.message}`);
    } finally {
      setIsSavingServer(false);
    }
  };

  // Direct Server Load
  const handleManualServerLoad = async () => {
    if (!window.confirm('Bạn có muốn tải bản sao lưu mới nhất từ máy chủ trung tâm và cập nhật vào thiết bị này?')) {
      return;
    }
    setIsLoadingServer(true);
    setStatusMessage(null);
    try {
      if (onTriggerServerLoad) {
        await onTriggerServerLoad();
      } else {
        const res = await fetch('/api/backup/load');
        const data = await res.json();
        if (data.success && data.data) {
          onRestoreState(data.data);
        } else {
          throw new Error('Chưa có bản sao lưu trên máy chủ');
        }
      }
      setStatusType('success');
      setStatusMessage('Đã khôi phục dữ liệu từ máy chủ thành công!');
    } catch (e: any) {
      setStatusType('error');
      setStatusMessage(`Lỗi: ${e.message}`);
    } finally {
      setIsLoadingServer(false);
    }
  };

  const handleCopyJsonToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(state));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    setStatusType('success');
    setStatusMessage('Đã sao chép toàn bộ chuỗi mã dữ liệu sao lưu vào bộ nhớ tạm.');
  };

  const handleCopyPin = () => {
    if (syncCode) {
      navigator.clipboard.writeText(syncCode);
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    }
  };

  const cloudServices = [
    {
      id: 'icloud' as CloudProviderType,
      name: 'iCloud Drive',
      subtitle: 'Apple iOS / iPhone / iPad / Mac',
      badge: 'Khuyên Dùng iPhone',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      icon: '🍏',
      color: 'from-indigo-600 to-blue-600',
      borderHover: 'hover:border-indigo-500/50',
      webUrl: 'https://www.icloud.com/iclouddrive',
      guideText:
        'Trên iPhone, nhấn "Lưu Vào iCloud / Tệp" để lưu thẳng vào thư mục iCloud Drive. Trên máy tính Windows/Mac, mở iCloud Drive để khôi phục hoặc kéo tệp vào.',
      actionButton: (
        <button
          onClick={handleICloudSave}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-600 to-indigo-600 hover:from-indigo-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          Lưu Vào iCloud / Tệp Trên iPhone
        </button>
      ),
    },
    {
      id: 'gdrive' as CloudProviderType,
      name: 'Google Drive',
      subtitle: 'Đồng bộ phổ biến PC, Android & iOS',
      badge: 'Đám Mây Phổ Biến',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: '🌐',
      color: 'from-amber-600 to-emerald-600',
      borderHover: 'hover:border-amber-500/50',
      webUrl: 'https://drive.google.com',
      guideText:
        'Tải file .json sao lưu và kéo vào Google Drive. Trên iPhone hoặc máy tính khác, mở ứng dụng Google Drive để tải về và chọn "Khôi phục từ tệp đã lưu".',
      actionButton: (
        <button
          onClick={() => downloadBackupFile('Google Drive')}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Xuất Tệp Lưu Vào Google Drive (.json)
        </button>
      ),
    },
    {
      id: 'onedrive' as CloudProviderType,
      name: 'Microsoft OneDrive',
      subtitle: 'Tối ưu Windows PC & iPhone app',
      badge: 'Tối Ưu Windows',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      icon: '🟦',
      color: 'from-cyan-600 to-blue-600',
      borderHover: 'hover:border-cyan-500/50',
      webUrl: 'https://onedrive.live.com',
      guideText:
        'Lưu tệp sao lưu vào thư mục OneDrive được đồng bộ trên máy tính. Bạn có thể mở ứng dụng OneDrive trên iPhone để xem và nạp dữ liệu tức thì.',
      actionButton: (
        <button
          onClick={() => downloadBackupFile('Microsoft OneDrive')}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Xuất Tệp Lưu Vào OneDrive (.json)
        </button>
      ),
    },
    {
      id: 'dropbox' as CloudProviderType,
      name: 'Dropbox',
      subtitle: 'Đồng bộ tệp tin nhanh đa nền tảng',
      badge: 'Đa Nền Tảng',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      icon: '📦',
      color: 'from-blue-600 to-indigo-600',
      borderHover: 'hover:border-blue-500/50',
      webUrl: 'https://www.dropbox.com',
      guideText:
        'Lưu tệp sao lưu vào Dropbox. Truy cập Dropbox trên máy tính hoặc ứng dụng Dropbox trên iPhone để tải và nạp dữ liệu bất cứ lúc nào.',
      actionButton: (
        <button
          onClick={() => downloadBackupFile('Dropbox')}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Xuất Tệp Lưu Vào Dropbox (.json)
        </button>
      ),
    },
  ];

  const currentProviderConfig = cloudServices.find((c) => c.id === selectedProvider) || cloudServices[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl ios-glass-card p-5 sm:p-6 border border-slate-700 shadow-2xl relative my-6 text-white max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 cursor-pointer transition z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">Đồng Bộ & Sao Lưu Đa Thiết Bị</h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Đám Mây
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Đồng bộ dữ liệu mượt mà giữa máy tính (PC / Mac) và điện thoại iPhone
            </p>
          </div>
        </div>

        {/* Main Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800/80 mb-4 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('firebase')}
            className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'firebase'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Đồng Bộ Firebase</span>
          </button>

          <button
            onClick={() => setActiveTab('clouds')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'clouds'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FolderSync className="w-3.5 h-3.5 text-amber-300" />
            <span>Chọn Đám Mây</span>
          </button>

          <button
            onClick={() => setActiveTab('pin_sync')}
            className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'pin_sync'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Mã Ghép Đôi 6 Số</span>
            <span className="text-[9px] bg-red-500/80 text-white px-1.5 py-0.2 rounded font-mono">HOT</span>
          </button>

          <button
            onClick={() => setActiveTab('server')}
            className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'server'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-emerald-300" />
            <span>Máy Chủ Gốc</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'guide'
                ? 'bg-slate-800 text-cyan-300 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Hướng Dẫn</span>
          </button>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div
            className={`p-3 rounded-2xl mb-4 text-xs font-bold flex items-center gap-2.5 shrink-0 animate-in fade-in slide-in-from-top-2 ${
              statusType === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border border-emerald-500/50'
                : statusType === 'error'
                ? 'bg-rose-950/90 text-rose-200 border border-rose-500/50'
                : 'bg-cyan-950/90 text-cyan-200 border border-cyan-500/50'
            }`}
          >
            {statusType === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span className="flex-1">{statusMessage}</span>
          </div>
        )}

        {activeTab === 'firebase' && <FirebaseSyncPanel state={state} />}

        {/* Tab 1: Multi Cloud Providers Selection Hub (iCloud, Google Drive, OneDrive, Dropbox) */}
        {activeTab === 'clouds' && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            {/* Quick Multi-Device Banner */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-slate-900/80 border border-indigo-500/30">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center text-slate-300 gap-1 text-xs">
                  <Laptop className="w-4 h-4 text-cyan-400" />
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <Smartphone className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block">Đồng bộ giữa Máy tính & iPhone</span>
                  <span className="text-[11px] text-slate-400">Chọn dịch vụ lưu trữ đám mây quen thuộc của bạn</span>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('pin_sync')}
                className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-bold border border-amber-500/30 transition cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-400" /> Dùng Mã 6 Số
              </button>
            </div>

            {/* Provider Selector Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {cloudServices.map((provider) => {
                const isSelected = selectedProvider === provider.id;
                return (
                  <button
                    key={provider.id}
                    onClick={() => setSelectedProvider(provider.id)}
                    className={`p-3 rounded-2xl border text-left transition relative cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-400 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xl">{provider.icon}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                      <div className="text-xs font-black text-white">{provider.name}</div>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block truncate">
                      {provider.id === 'icloud' ? 'iOS & Mac' : provider.id === 'gdrive' ? 'Google' : provider.id === 'onedrive' ? 'Microsoft' : 'Dropbox'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Cloud Provider Detailed Action Card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{currentProviderConfig.icon}</span>
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      {currentProviderConfig.name}
                      <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold border ${currentProviderConfig.badgeColor}`}>
                        {currentProviderConfig.badge}
                      </span>
                    </h4>
                    <span className="text-xs text-slate-400">{currentProviderConfig.subtitle}</span>
                  </div>
                </div>
                <a
                  href={currentProviderConfig.webUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold transition hover:underline"
                  title="Mở dịch vụ trong tab mới"
                >
                  Mở Web <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <p>{currentProviderConfig.guideText}</p>
              </div>

              {/* Action Buttons: Export / Save to Cloud vs Restore from File */}
              <div className="space-y-2 pt-1">
                {currentProviderConfig.actionButton}

                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImportJsonFile}
                    accept=".json,application/json"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-cyan-500/30 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Khôi Phục / Nạp Tệp Từ {currentProviderConfig.name}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Copy Data Payload */}
            <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
              <div className="flex items-center gap-2">
                <FileJson className="w-4 h-4 text-cyan-400" />
                <span>Sao chép chuỗi mã dữ liệu Master League:</span>
              </div>
              <button
                onClick={handleCopyJsonToClipboard}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition"
              >
                <Copy className="w-3 h-3" />
                {copied ? 'Đã sao chép!' : 'Sao chép JSON'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Instant PIN Code Sync (No files needed - Type 6 Digits on iPhone to Sync) */}
        {activeTab === 'pin_sync' && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            {/* Explanatory Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900/80 to-slate-900/80 border border-amber-500/40">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                <KeyRound className="w-4 h-4" /> Đồng Bộ Siêu Tốc Không Cần Chuyển Tệp
              </div>
              <p className="text-xs text-slate-300">
                Tạo mã PIN 6 số trên thiết bị này, sau đó mở app trên iPhone hoặc máy tính khác và nhập mã để nhận toàn bộ dữ liệu trong 1 giây!
              </p>
            </div>

            {/* Sub-Card 1: Sender (Generate PIN) */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Laptop className="w-4 h-4 text-cyan-400" />
                  1. Tạo Mã Đồng Bộ (Trên Thiết Bị Có Dữ Liệu)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Tải lên đám mây tức thì</span>
              </div>

              {syncCode ? (
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-amber-500/50 flex flex-col items-center justify-center gap-2 text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Mã Ghép Đôi Của Bạn:
                  </span>
                  <div className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-amber-400 bg-amber-500/10 px-6 py-2 rounded-2xl border border-amber-500/30 select-all">
                    {syncCode.slice(0, 3)} {syncCode.slice(3)}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={handleCopyPin}
                      className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1 cursor-pointer transition"
                    >
                      {copiedPin ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedPin ? 'Đã chép mã!' : 'Sao chép mã'}
                    </button>
                    <button
                      onClick={handleGenerateSyncPin}
                      disabled={isGeneratingPin}
                      className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold cursor-pointer transition"
                    >
                      Tạo mã mới
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1">
                    👉 Mở điện thoại iPhone ➔ Chọn mục <b>Nhận Dữ Liệu</b> và nhập mã <b>{syncCode}</b>
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleGenerateSyncPin}
                  disabled={isGeneratingPin}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-lg shadow-amber-500/10"
                >
                  <Sparkles className={`w-4 h-4 ${isGeneratingPin ? 'animate-spin' : ''}`} />
                  {isGeneratingPin ? 'Đang tạo mã...' : 'Tạo Mã Ghép Đôi 6 Số Mới'}
                </button>
              )}
            </div>

            {/* Sub-Card 2: Receiver (Enter PIN & Restore) */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  2. Nhận Dữ Liệu (Trên iPhone / Máy Tính Khác)
                </span>
                <span className="text-[10px] text-slate-400">Nhập mã đã tạo</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    maxLength={7}
                    value={inputSyncCode}
                    onChange={(e) => setInputSyncCode(e.target.value)}
                    placeholder="Ví dụ: 849 203"
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-2.5 text-center text-lg font-mono font-black text-amber-300 tracking-widest focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  onClick={handleRestoreBySyncPin}
                  disabled={isFetchingByPin || !inputSyncCode.trim()}
                  className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Download className={`w-4 h-4 ${isFetchingByPin ? 'animate-spin' : ''}`} />
                  {isFetchingByPin ? 'Đang nhận...' : 'Nhận Dữ Liệu Ngay'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Dedicated Server Auto-Save */}
        {activeTab === 'server' && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            <div className="rounded-2xl p-4 bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Máy Chủ Lưu Trữ Riêng (Server Auto-Save)
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                  Đang hoạt động
                </span>
              </div>

              <p className="text-xs text-slate-300">
                Hệ thống tự động đồng bộ mọi thay đổi (thêm mùa giải, cập nhật logo CLB thực tế, ngân sách, danh hiệu...) lên máy chủ đám mây.
              </p>

              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 font-mono">
                <span>Sao lưu máy chủ gần nhất:</span>
                <span className="text-cyan-300 font-bold">
                  {lastServerSyncTime
                    ? new Date(lastServerSyncTime).toLocaleTimeString('vi-VN') +
                      ' ' +
                      new Date(lastServerSyncTime).toLocaleDateString('vi-VN')
                    : 'Vừa xong'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={handleManualServerSave}
                  disabled={isSavingServer}
                  className="py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSavingServer ? 'animate-spin' : ''}`} />
                  {isSavingServer ? 'Đang lưu...' : 'Lưu Lên Máy Chủ Ngay'}
                </button>

                <button
                  onClick={handleManualServerLoad}
                  disabled={isLoadingServer}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 border border-slate-700 cursor-pointer disabled:opacity-50"
                >
                  <Download className={`w-3.5 h-3.5 ${isLoadingServer ? 'animate-spin' : ''}`} />
                  {isLoadingServer ? 'Đang tải...' : 'Tải Lại Từ Máy Chủ'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Step-by-Step Sync Guide */}
        {activeTab === 'guide' && (
          <div className="space-y-3 overflow-y-auto pr-1 flex-1 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h4 className="font-bold text-cyan-400 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-amber-400" /> Cách 1: Đồng bộ bằng Mã PIN 6 Số (Nhanh Nhất)
              </h4>
              <ol className="list-decimal list-inside text-slate-300 space-y-1 pl-1">
                <li>Trên máy tính, chọn tab <b>Mã Ghép Đôi 6 Số</b> ➔ Bấm <b>Tạo Mã Ghép Đôi Mới</b>.</li>
                <li>Mở ứng dụng trên iPhone của bạn.</li>
                <li>Chọn tab <b>Mã Ghép Đôi 6 Số</b> ➔ Nhập 6 số vừa tạo vào ô và bấm <b>Nhận Dữ Liệu Ngay</b>.</li>
                <li>Toàn bộ lịch sử mùa giải, danh hiệu, logo CLB sẽ tự động cập nhật ngay trên iPhone!</li>
              </ol>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h4 className="font-bold text-indigo-300 flex items-center gap-1.5">
                <span>🍏</span> Cách 2: Đồng bộ qua iCloud Drive (Dành Cho iPhone & Mac)
              </h4>
              <ol className="list-decimal list-inside text-slate-300 space-y-1 pl-1">
                <li>Trên iPhone: Nhấn <b>Lưu Vào iCloud / Tệp Trên iPhone</b> ➔ Chọn lưu vào thư mục <b>iCloud Drive</b>.</li>
                <li>Trên máy tính: Mở iCloud Drive (hoặc trang web icloud.com), bạn sẽ thấy tệp sao lưu JSON.</li>
                <li>Nhấn nút <b>Khôi Phục Từ Tệp Đã Lưu</b> để nạp dữ liệu.</li>
              </ol>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                <span>🌐</span> Cách 3: Đồng bộ qua Google Drive / OneDrive / Dropbox
              </h4>
              <ol className="list-decimal list-inside text-slate-300 space-y-1 pl-1">
                <li>Nhấn xuất tệp sao lưu (.json) tương ứng.</li>
                <li>Lưu vào thư mục Google Drive / OneDrive / Dropbox trên máy.</li>
                <li>Mở app trên điện thoại tải file về và chọn nạp tệp vào ứng dụng.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800/80 mt-auto flex items-center justify-between text-xs shrink-0">
          <span className="text-[11px] text-slate-400">
            HLV Hiện Tại: <span className="text-white font-bold">{activeMgr?.name || 'Master League'}</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer transition active:scale-95"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
