'use client';

import React from 'react';
import { BestWindowRanking, Language } from '@/lib/types';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { AlertCircleIcon, ClockIcon } from '../ui/Icons';
import { ModalShell } from '../ui/ModalShell';

interface WhyTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  windowData: BestWindowRanking | null;
  language: Language;
}

const POLLUTANT_LABELS: Record<string, string> = {
  pm2_5: 'PM2.5 (Fine Particles)',
  pm10: 'PM10 (Coarse Particles)',
  o3: 'Ozone (O₃)',
  no2: 'Nitrogen Dioxide (NO₂)',
  so2: 'Sulphur Dioxide (SO₂)',
  co: 'Carbon Monoxide (CO)',
};

export function WhyTimeModal({
  isOpen,
  onClose,
  windowData,
  language,
}: WhyTimeModalProps) {
  if (!windowData) return null;

  const t = TRANSLATIONS[language];
  const { whyThisTime, readingsUsed } = windowData;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      titleId="why-time-title"
      title={`${t.whyThisTimeBtn} — ${windowData.timeLabel}`}
      subtitle="Transparent forecast provenance, mathematical comparison, and uncertainty bounds"
      icon={<ClockIcon size={22} />}
    >
      {/* Comparison Reason */}
      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200">
            Rank #{windowData.rank}
          </span>
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
            Forecast IN NAQI: {windowData.averageAqi ?? '--'} ({windowData.aqiCategory ?? 'Unknown'})
          </span>
        </div>
        <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed">
          {windowData.comparisonReason}
        </p>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          {whyThisTime.comparisonDetail}
        </p>
      </div>

      {/* Forecast Readings Used */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          Forecast Readings Used in this Window
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {readingsUsed.map((r) => (
            <div
              key={r.pollutant}
              className="p-2.5 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-800/20"
            >
              <p className="text-[10px] text-zinc-600 dark:text-zinc-400 uppercase font-medium">
                {POLLUTANT_LABELS[r.pollutant] || r.pollutant}
              </p>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                {r.avgValue}{' '}
                <span className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400">
                  {r.unit}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Data Provenance & Methodology */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-1">
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200">
            AQI Standard
          </span>
          <p className="font-bold text-zinc-900 dark:text-zinc-100 pt-1">{whyThisTime.aqiScale}</p>
          <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
            Calculated using standard CPCB 2014 linear breakpoint formulas on forecast concentrations.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-1">
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200">
            Model Source
          </span>
          <p className="font-bold text-zinc-900 dark:text-zinc-100 pt-1">{whyThisTime.dataSource}</p>
          <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
            Global ECMWF atmospheric chemistry model projections provided under CC BY 4.0.
          </p>
        </div>
      </div>

      {/* Uncertainty & Limitations */}
      <div className="p-3.5 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 space-y-2">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 text-xs font-bold">
          <AlertCircleIcon size={14} />
          <span>Forecast Limitations &amp; Uncertainty</span>
        </div>
        <ul className="text-xs text-amber-900 dark:text-amber-200/90 space-y-1.5 list-disc list-inside">
          {whyThisTime.limitations.map((lim, i) => (
            <li key={i}>{lim}</li>
          ))}
        </ul>
      </div>

      {/* Footer Disclaimer */}
      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600 dark:text-zinc-400">
        <p className="text-[11px]">{t.forecastDisclaimer}</p>
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
