'use client';

import React from 'react';
import { Language, TextSize } from '@/lib/types';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { SlidersIcon } from '../ui/Icons';

interface AccessibilityToolbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  textSize: TextSize;
  onTextSizeChange: (size: TextSize) => void;
}

export function AccessibilityToolbar({
  language,
  onLanguageChange,
  highContrast,
  onToggleHighContrast,
  textSize,
  onTextSizeChange,
}: AccessibilityToolbarProps) {
  const t = TRANSLATIONS[language];

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 sm:px-5 shadow-xs mb-6 text-xs flex flex-wrap items-center justify-between gap-3">
      {/* Language Switcher */}
      <div className="flex items-center gap-2">
        <span className="font-bold text-zinc-500 text-[11px] uppercase tracking-wider">
          Language / மொழி / भाषा:
        </span>
        <div className="inline-flex rounded-xl p-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60">
          {(
            [
              { code: 'en', label: 'English' },
              { code: 'ta', label: 'தமிழ்' },
              { code: 'hi', label: 'हिन्दी' },
            ] as const
          ).map((lang) => (
            <button
              key={lang.code}
              onClick={() => onLanguageChange(lang.code)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                language === lang.code
                  ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accessibility Controls: Text Size & High Contrast */}
      <div className="flex items-center gap-4">
        {/* Text size selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-400 text-[11px] font-medium hidden sm:inline">
            {t.textSize}:
          </span>
          <div className="inline-flex rounded-xl p-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60">
            {(
              [
                { size: 'normal', label: 'A', title: t.normalText },
                { size: 'large', label: 'A+', title: t.largeText },
                { size: 'extra-large', label: 'A++', title: t.extraLargeText },
              ] as const
            ).map((s) => (
              <button
                key={s.size}
                onClick={() => onTextSizeChange(s.size)}
                title={s.title}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  textSize === s.size
                    ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* High contrast mode toggle */}
        <button
          onClick={onToggleHighContrast}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold transition-all ${
            highContrast
              ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900'
              : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <SlidersIcon size={13} />
          <span>{highContrast ? 'High Contrast ON' : 'High Contrast'}</span>
        </button>
      </div>
    </div>
  );
}
