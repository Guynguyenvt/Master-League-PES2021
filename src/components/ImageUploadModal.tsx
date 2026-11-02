import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Link, Image, Check, Sparkles, Camera } from 'lucide-react';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  targetTitle?: string;
  targetType?: string;
  currentImageUrl?: string;
  subtitle?: string;
  currentImage?: string;
  onSaveImage: (imageUrl: string) => void;
  presetImages?: { label: string; url: string }[];
}

const readAsDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read'));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });

// Thu nhỏ ảnh trước khi lưu để dữ liệu nhẹ, đồng bộ nhanh và không vượt giới hạn lưu trữ.
// Dùng document.createElement('img') vì tên `Image` trong file này là biểu tượng của lucide-react.
export const compressImage = async (file: File): Promise<string> => {
  const src = await readAsDataURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = document.createElement('img');
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('img'));
      el.src = src;
    });
    const isJpeg = file.type === 'image/jpeg';
    const maxDim = isJpeg ? 512 : 384;
    const scale = Math.min(1, maxDim / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
    const w = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
    const h = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('ctx');
    if (isJpeg) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      return canvas.toDataURL('image/jpeg', 0.82);
    }
    ctx.drawImage(img, 0, 0, w, h);
    let out = canvas.toDataURL('image/webp', 0.85);
    if (!out.startsWith('data:image/webp')) out = canvas.toDataURL('image/png');
    return out;
  } catch {
    // Không nén được: dùng ảnh gốc nếu đủ nhẹ, nếu không thì báo lỗi
    if (file.size <= 700 * 1024) return src;
    throw new Error('Không đọc được ảnh này');
  }
};

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  title: titleProp,
  targetTitle,
  currentImageUrl,
  subtitle = 'Tải ảnh thực tế từ thiết bị của bạn hoặc dán đường dẫn ảnh',
  currentImage = '',
  onSaveImage,
  presetImages = [],
}) => {
  const title = titleProp ?? targetTitle ?? 'Cập nhật hình ảnh';
  const initialImage = currentImage || currentImageUrl || '';
  const [selectedImage, setSelectedImage] = useState<string>(initialImage);
  const [urlInput, setUrlInput] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Mỗi lần mở khung: hiện ảnh hiện tại của đối tượng đang sửa (tránh dùng nhầm ảnh của lần trước)
  useEffect(() => {
    if (isOpen) {
      setSelectedImage(initialImage);
      setUrlInput('');
      setErrorMsg('');
      setProcessing(false);
    }
  }, [isOpen, initialImage]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('Vui lòng chọn ảnh có dung lượng dưới 15MB');
      input.value = '';
      return;
    }
    setErrorMsg('');
    setProcessing(true);
    compressImage(file)
      .then((result) => {
        if (result) setSelectedImage(result);
      })
      .catch(() => setErrorMsg('Không đọc được ảnh này, hãy thử ảnh khác (JPG hoặc PNG)'))
      .finally(() => {
        setProcessing(false);
        input.value = ''; // cho phép chọn lại cùng một ảnh
      });
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setSelectedImage(urlInput.trim());
      setUrlInput('');
    }
  };

  const handleSave = () => {
    if (selectedImage) {
      onSaveImage(selectedImage);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-md rounded-3xl ios-glass-card p-5 sm:p-6 border border-slate-700 shadow-2xl relative my-8 text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 cursor-pointer transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">{title}</h3>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
        </div>

        {/* Preview Container */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-900/80 rounded-2xl border border-slate-800 mb-4">
          <div className="relative group w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-cyan-500/50 shadow-xl bg-slate-950 flex items-center justify-center">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-slate-500 flex flex-col items-center gap-1">
                <Image className="w-8 h-8" />
                <span className="text-[10px]">Chưa có ảnh</span>
              </div>
            )}
          </div>
          <span className="text-[11px] text-slate-400 mt-2">Xem trước hình ảnh thực tế</span>
        </div>

        {/* Upload from device */}
        <div className="space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 px-4 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-cyan-400" />
            Tải Ảnh Thực Tế Từ Điện Thoại / Máy Tính
          </button>

          {processing && <p className="text-[11px] text-cyan-300 text-center">Đang xử lý ảnh…</p>}
          {errorMsg && <p className="text-[11px] text-rose-300 text-center">{errorMsg}</p>}

          {/* Paste URL */}
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Hoặc dán URL ảnh trực tiếp..."
              className="flex-1 bg-slate-900 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-700 outline-none focus:border-cyan-400"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer"
            >
              Áp dụng
            </button>
          </div>

          {/* Presets if available */}
          {presetImages.length > 0 && (
            <div className="pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Ảnh Gợi Ý Nhanh:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {presetImages.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(preset.url)}
                    className={`p-1.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                      selectedImage === preset.url
                        ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300'
                        : 'bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-400'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-lg object-cover bg-slate-800 shrink-0"
                    />
                    <span className="text-[10px] font-bold truncate">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2.5 pt-5 mt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={processing}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            Lưu Thay Đổi
          </button>
        </div>
      </div>
    </div>
  );
};
