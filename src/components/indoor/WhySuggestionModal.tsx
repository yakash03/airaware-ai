'use client';

import React from 'react';
import { IndoorSuggestion, Language } from '@/lib/types';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { AlertCircleIcon } from '../ui/Icons';
import { ModalShell } from '../ui/ModalShell';

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
  if (!suggestion) return null;

  const t = TRANSLATIONS[language];
  const { whySuggestion } = suggestion;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      titleId="why-suggestion-title"
      title={suggestion.title}
      subtitle="Detailed reasoning, data sources, and indoor sensor boundaries"
      icon={<span className="text-xl" aria-hidden="true">{suggestion.icon}</span>}
      iconContainerClassName="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400"
    >
      {/* Inputs & Context */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-1">
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200">
            {t.outdoorContextLabel}
          </span>
          <p className="font-bold text-zinc-900 dark:text-zinc-100 pt-1 leading-snug">
            {whySuggestion.outdoorConditionContext}
          </p>
          <p className="text-zinc-600 dark:text-zinc-400 text-[11px] pt-1">
            Source: {whySuggestion.outdoorSource} ({whySuggestion.dataType})
          </p>
        </div>

        <div className="p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-1">
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200">
            {t.userReportedLabel}
          </span>
          <p className="font-bold text-zinc-900 dark:text-zinc-100 pt-1 leading-snug">
            {whySuggestion.indoorUserFactor}
          </p>
          <p className="text-zinc-600 dark:text-zinc-400 text-[11px] pt-1">
            Reported via optional, non-sensitive questionnaire.
          </p>
        </div>
      </div>

      {/* Environmental Reasoning */}
      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          Environmental Reasoning
        </h4>
        <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed">
          {whySuggestion.reasoning}
        </p>
      </div>

      {/* What AirAware AI Cannot Determine */}
      <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 space-y-2">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 text-xs font-bold">
          <AlertCircleIcon size={16} />
          <span>{t.whatWeCannotDetermineLabel}</span>
        </div>
        <p className="text-xs text-amber-900 dark:text-amber-200/90">
          Without dedicated, calibrated indoor monitoring hardware, AirAware AI cannot assess:
        </p>
        <ul className="text-xs text-amber-900 dark:text-amber-200 space-y-1 list-disc list-inside">
          {whySuggestion.whatWeCannotDetermine.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Notice & Action */}
      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600 dark:text-zinc-400">
        <p className="text-[11px]">{t.noSensorNotice}</p>
        <button
          type="button"
          onClick={onClose}
          className="w-full sm:w-auto px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl font-bold text-xs shrink-0 cursor-pointer"
        >
          {t.understoodBtn}
        </button>
      </div>
    </ModalShell>
  );
}
