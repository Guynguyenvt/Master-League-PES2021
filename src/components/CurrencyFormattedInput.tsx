import React, { useState, useEffect } from 'react';
import { CurrencyType, CURRENCY_CONFIGS, formatFullCurrency } from '../utils/currency';
import { Plus, RotateCcw } from 'lucide-react';

interface CurrencyFormattedInputProps {
  value: number;
  onChange: (val: number) => void;
  currency: CurrencyType;
  label: string;
  subLabel?: string;
  colorTheme?: 'emerald' | 'cyan' | 'amber' | 'slate';
  placeholder?: string;
  showQuickButtons?: boolean;
}

export const CurrencyFormattedInput: React.FC<CurrencyFormattedInputProps> = ({
  value,
  onChange,
  currency,
  label,
  subLabel,
  colorTheme = 'emerald',
  placeholder = 'Nhập số tiền (VD: 6000000)',
  showQuickButtons = true,
}) => {
  const config = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.USD;
  const symbol = config.symbol;
  const isSuffix = config.position === 'suffix';

  // Normalize legacy millions (< 10000) to full raw number if needed
  const normalizedValue =
    Math.abs(value) > 0 && Math.abs(value) < 10000 ? Math.round(value * 1_000_000) : value;

  // Format raw number to display string with symbol and commas
  const formatDisplay = (num: number): string => {
    if (isNaN(num) || num === 0) return isSuffix ? `0 ${symbol}` : `${symbol}0`;
    const formatted = Math.abs(Math.round(num)).toLocaleString('en-US');
    const sign = num < 0 ? '-' : '';
    return isSuffix ? `${sign}${formatted} ${symbol}` : `${sign}${symbol}${formatted}`;
  };

  const [displayStr, setDisplayStr] = useState<string>(formatDisplay(normalizedValue));
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Sync with value & currency changes from parent
  useEffect(() => {
    if (!isFocused) {
      setDisplayStr(formatDisplay(normalizedValue));
    }
  }, [normalizedValue, currency, isFocused]);

  // Handle raw text input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Extract only digits and optional minus
    const cleanDigits = raw.replace(/[^\d]/g, '');
    const isNegative = raw.startsWith('-');

    if (!cleanDigits) {
      setDisplayStr(isSuffix ? `0 ${symbol}` : `${symbol}0`);
      onChange(0);
      return;
    }

    const numValue = (isNegative ? -1 : 1) * parseInt(cleanDigits, 10);
    onChange(numValue);
    setDisplayStr(formatDisplay(numValue));
  };

  const handleQuickAdd = (amountToAdd: number) => {
    const nextVal = (normalizedValue || 0) + amountToAdd;
    onChange(nextVal);
    setDisplayStr(formatDisplay(nextVal));
  };

  const handleReset = () => {
    onChange(0);
    setDisplayStr(formatDisplay(0));
  };

  // Color styling
  const themeStyles = {
    emerald: {
      border: 'border-emerald-500/50 focus-within:border-emerald-400',
      text: 'text-emerald-400',
      badgeBg: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30',
      btnBg: 'hover:bg-emerald-950/80 hover:text-emerald-300 hover:border-emerald-500/40',
    },
    cyan: {
      border: 'border-cyan-500/50 focus-within:border-cyan-400',
      text: 'text-cyan-400',
      badgeBg: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30',
      btnBg: 'hover:bg-cyan-950/80 hover:text-cyan-300 hover:border-cyan-500/40',
    },
    amber: {
      border: 'border-amber-500/50 focus-within:border-amber-400',
      text: 'text-amber-400',
      badgeBg: 'bg-amber-950/60 text-amber-300 border-amber-500/30',
      btnBg: 'hover:bg-amber-950/80 hover:text-amber-300 hover:border-amber-500/40',
    },
    slate: {
      border: 'border-slate-700 focus-within:border-slate-500',
      text: 'text-white',
      badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
      btnBg: 'hover:bg-slate-800 hover:text-white hover:border-slate-600',
    },
  }[colorTheme];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-slate-300 block">
          {label}
        </label>
        {subLabel && (
          <span className="text-[10px] text-slate-400">{subLabel}</span>
        )}
      </div>

      {/* Formatted Input Container */}
      <div
        className={`flex items-center bg-slate-950 rounded-xl px-3 py-2 border transition ${themeStyles.border}`}
      >
        <input
          type="text"
          value={displayStr}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            setDisplayStr(formatDisplay(normalizedValue));
          }}
          placeholder={placeholder}
          className={`w-full bg-transparent font-mono font-black text-sm sm:text-base outline-none tracking-tight ${themeStyles.text}`}
        />
        {normalizedValue > 0 && (
          <button
            type="button"
            onClick={handleReset}
            title="Đặt lại 0"
            className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Quick Add Presets (+1M, +5M, +10M, +50M) */}
      {showQuickButtons && (
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 hide-scrollbar text-[10px] font-mono">
          <span className="text-slate-500 text-[9px] shrink-0">Cộng nhanh:</span>
          {[1_000_000, 5_000_000, 10_000_000, 50_000_000, 100_000_000].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => handleQuickAdd(amt)}
              className={`px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 transition cursor-pointer shrink-0 ${themeStyles.btnBg}`}
            >
              +{amt >= 1_000_000 ? `${amt / 1_000_000}Tr` : amt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
