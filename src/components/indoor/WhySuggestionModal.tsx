'use client';

import React from 'react';
import { IndoorSuggestion, Language } from '@/lib/types';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { ShieldCheckIcon, AlertCircleIcon } from '../ui/Icons';

interface WhySuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: IndoorSuggestion | null;
  language: Language;
}

export function WhySuggestionModal({
  isOpen,
  onClose,
  suggestion,
  language,
}: WhySuggestionModalProps) {
  if (!isOpen || !suggestion) return null;

  const t = TRANSLATIONS[language];
  const { whySuggestion } = suggestion;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="why-suggestion-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-7 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-2xl text-xl">
              {suggestion.icon}
            </div>
            <div>
              <h3 id="why-suggestion-title" className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                {suggestion.title}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Detailed reasoning, data sources, and indoor sensor boundaries
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-bold px-2.5 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Section 1: Inputs & Context */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-1">
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              {t.outdoorContextLabel}
            </span>
            <p className="font-bold text-zinc-900 dark:text-zinc-100 pt-1 leading-snug">
              {whySuggestion.outdoorConditionContext}
            </p>
            <p className="text-zinc-400 text-[11px] pt-1">
              Source: {whySuggestion.outdoorSource} ({whySuggestion.dataType})
            </p>
          </div>

          <div className="p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-1">
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
              {t.userReportedLabel}
            </span>
            <p className="font-bold text-zinc-900 dark:text-zinc-100 pt-1 leading-snug">
              {whySuggestion.indoorUserFactor}
            </p>
            <p className="text-zinc-400 text-[11px] pt-1">
              Reported via optional, non-sensitive questionnaire.
            </p>
          </div>
        </div>

        {/* Section 2: Environmental Reasoning */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Environmental Reasoning
          </h4>
          <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed">
            {whySuggestion.reasoning}
          </p>
        </div>

        {/* Section 3: What AirAware AI Cannot Determine */}
        <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 space-y-2">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-bold">
            <AlertCircleIcon size={16} />
            <span>{t.whatWeCannotDetermineLabel}</span>
          </div>
          <p className="text-xs text-amber-900/80 dark:text-amber-200/80">
            Without dedicated, calibrated indoor monitoring hardware, AirAware AI cannot assess:
          </p>
          <ul className="text-xs text-amber-900 dark:text-amber-200 space-y-1 list-disc list-inside">
            {whySuggestion.whatWeCannotDetermine.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Section 4: Notice & Action */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
          <p className="text-[11px]">{t.noSensorNotice}</p>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl font-bold text-xs shrink-0 cursor-pointer"
          >
            {t.understoodBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
