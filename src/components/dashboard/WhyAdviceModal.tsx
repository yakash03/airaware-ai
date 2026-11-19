'use client';

import React from 'react';
import { AgeExplanation, Language } from '@/lib/types';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { ShieldCheckIcon, AlertCircleIcon, ClockIcon } from '../ui/Icons';

interface WhyAdviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  explanation: AgeExplanation | null;
  language: Language;
}

export function WhyAdviceModal({
  isOpen,
  onClose,
  explanation,
  language,
}: WhyAdviceModalProps) {
  if (!isOpen || !explanation) return null;

  const t = TRANSLATIONS[language];
  const { whyAdvice } = explanation;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="transparency-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-7 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <ShieldCheckIcon size={22} />
            </div>
            <div>
              <h3 id="transparency-title" className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                {t.whyAdviceBtn}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Full transparency on data inputs, scale rules, and uncertainty limitations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-bold px-2.5"
          >
            ✕
          </button>
        </div>

        {/* 4 Mandatory Data Categories */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Four Pillars of AirAware Transparency
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* 1. Measured */}
            <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-1">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                1. Measured
              </span>
              <p className="font-bold text-zinc-900 dark:text-zinc-100 pt-1">Ground Station Sensors</p>
              <p className="text-zinc-500 text-[11px] leading-relaxed">
                No real-time ground monitoring station feed is active in this session. We never falsely label model data as measured station data.
              </p>
            </div>

            {/* 2. Model Estimate */}
            <div className="p-3.5 rounded-2xl border border-sky-200 dark:border-sky-800/80 bg-sky-50/40 dark:bg-sky-950/30 space-y-1">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-300">
                2. Model Estimate (Active)
              </span>
              <p className="font-bold text-zinc-900 dark:text-zinc-100 pt-1">CAMS Atmospheric Chemistry</p>
              <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                Derived from Copernicus CAMS global simulations (~40 km grid) via Open-Meteo under CC BY 4.0.
              </p>
            </div>

            {/* 3. Forecast */}
            <div className="p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/40 dark:bg-indigo-950/30 space-y-1">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300">
                3. Forecast
              </span>
              <p className="font-bold text-zinc-900 dark:text-zinc-100 pt-1">24-Hour Timeline</p>
              <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                Hourly forward projections model future dispersion, temperature, and wind trends for activity planning.
              </p>
            </div>

            {/* 4. General Guidance */}
            <div className="p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/30 space-y-1">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">
                4. General Guidance
              </span>
              <p className="font-bold text-zinc-900 dark:text-zinc-100 pt-1">CPCB 2014 & WHO 2021</p>
              <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                Advice reflects broad public health literature. Not an individualized medical diagnosis or prescription.
              </p>
            </div>
          </div>
        </div>

        {/* Exact Environmental Values Used */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 text-xs space-y-2">
          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
            <span>Verified Readings Influencing This Profile</span>
            <span className="font-mono text-[11px] text-zinc-500">
              {whyAdvice.deterministicRuleId}
            </span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-700/60">
              <span className="text-[10px] text-zinc-400">Index Value</span>
              <p className="text-base font-black text-zinc-900 dark:text-zinc-100">
                {whyAdvice.aqiValue ?? '--'} <span className="text-[10px] font-normal text-zinc-500">IN NAQI</span>
              </p>
            </div>

            <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-700/60">
              <span className="text-[10px] text-zinc-400">Health Category</span>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {whyAdvice.aqiCategory}
              </p>
            </div>

            <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-700/60">
              <span className="text-[10px] text-zinc-400">Dominant Pollutant</span>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {whyAdvice.dominantPollutant?.toUpperCase()}: {whyAdvice.dominantPollutantValue ?? '--'} {whyAdvice.dominantPollutantUnit ?? ''}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
            <strong>Rule Applied:</strong> {whyAdvice.ruleCitation}
          </p>
        </div>

        {/* What This Data CANNOT Tell Us */}
        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
            <AlertCircleIcon size={15} />
            <span>Important Data Limitations</span>
          </h4>

          <ul className="list-disc pl-5 space-y-1 text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
            {whyAdvice.dataLimitations.map((lim, i) => (
              <li key={i}>{lim}</li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-400">
          <span className="flex items-center gap-1">
            <ClockIcon size={12} />
            Observed: {new Date(whyAdvice.observedAt).toLocaleTimeString()}
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-xl transition-all"
          >
            {t.understoodBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
