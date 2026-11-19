'use client';

import React from 'react';
import { AirSnapshot } from '@/lib/types';
import { POLLUTANT_METADATA } from '@/lib/normalize/units';
import { ShieldCheckIcon, ClockIcon, AlertCircleIcon, InfoIcon } from '../ui/Icons';

interface AqiOverviewCardProps {
  snapshot: AirSnapshot;
  onOpenScaleModal: () => void;
}

export function AqiOverviewCard({ snapshot, onOpenScaleModal }: AqiOverviewCardProps) {
  const { computedAqi, freshness, dataAge, warnings, sources } = snapshot;

  const aqiValue = computedAqi?.value;
  const category = computedAqi?.category ?? 'Unavailable';
  const dominant = computedAqi?.dominantPollutant;
  const dominantInfo = dominant ? POLLUTANT_METADATA[dominant] : null;

  // Freshness badge color
  const freshnessColorMap = {
    FRESH: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
    STALE: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
    EXPIRED: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
    UNAVAILABLE: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-xs mb-6 relative overflow-hidden">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-4 border-b border-zinc-100 dark:border-zinc-800/80 text-xs">
        <div className="flex items-center gap-2">
          {/* DataType Badge: Strict Phase 1 requirement */}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold tracking-wide uppercase bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-[11px]">
            <ShieldCheckIcon size={13} />
            Model Estimate
          </span>

          <span className="text-zinc-400 font-medium hidden sm:inline">•</span>

          <span className="text-zinc-500 dark:text-zinc-400">
            CAMS Global (ECMWF) via Open-Meteo
          </span>
        </div>

        {/* Freshness Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-medium ${freshnessColorMap[freshness]}`}
          >
            <ClockIcon size={12} />
            {freshness}: {dataAge}
          </span>

          <button
            onClick={onOpenScaleModal}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-md transition-colors"
            title="Understanding AQI Scales"
          >
            <InfoIcon size={15} />
          </button>
        </div>
      </div>

      {/* Main AQI Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-6">
        {/* Left: Big AQI Number & Category */}
        <div className="md:col-span-7 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-7">
          <div
            className="flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-3xl shadow-sm border text-white font-extrabold tracking-tight transition-transform shrink-0"
            style={{
              backgroundColor: computedAqi?.categoryColor ?? '#71717a',
              borderColor: 'rgba(255,255,255,0.2)',
            }}
          >
            <span className="text-4xl sm:text-5xl leading-none">
              {aqiValue !== null ? aqiValue : '--'}
            </span>
            <span className="text-[10px] uppercase tracking-widest mt-1 opacity-90 font-medium">
              IN NAQI
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                {category}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md">
              {aqiValue !== null
                ? `Calculated using official CPCB health breakpoints from verified pollutant concentrations.`
                : 'Insufficient pollutant data available to calculate a complete CPCB National AQI.'}
            </p>

            {dominantInfo && (
              <div className="pt-1 flex items-center gap-2 text-xs">
                <span className="text-zinc-400 font-medium">Dominant Pollutant:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                  {dominantInfo.formula} ({dominantInfo.label})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Scale Context Card */}
        <div className="md:col-span-5 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 text-xs space-y-2.5">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
            <span>Active Scale</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">India CPCB NAQI</span>
          </div>

          <p className="text-zinc-600 dark:text-zinc-400 leading-normal">
            National AQI in India ranges from <strong className="text-zinc-900 dark:text-zinc-100">0 to 500</strong>.
            This value is deterministic and strictly derived from the maximum sub-index across available pollutants.
          </p>

          <div className="pt-1 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 border-t border-zinc-200/60 dark:border-zinc-700/60">
            <span>Model Grid Resolution:</span>
            <span className="font-mono text-zinc-700 dark:text-zinc-300">~40 km (CAMS)</span>
          </div>
        </div>
      </div>

      {/* Warnings banner if any */}
      {warnings.length > 0 && (
        <div className="mt-5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
          <AlertCircleIcon size={16} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div className="space-y-0.5">
            {warnings.map((warn, i) => (
              <p key={i}>{warn}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
