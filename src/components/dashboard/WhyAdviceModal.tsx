'use client';

import React from 'react';
import { AgeExplanation, Language } from '@/lib/types';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { ShieldCheckIcon, AlertCircleIcon, ClockIcon } from '../ui/Icons';
import { ModalShell } from '../ui/ModalShell';

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
  if (!explanation) return null;

  const t = TRANSLATIONS[language];
  const { whyAdvice } = explanation;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      titleId="transparency-title"
      title={t.whyAdviceBtn}
      subtitle="Full transparency on data inputs, scale rules, and uncertainty limitations"
      icon={<ShieldCheckIcon size={22} />}
    >
      {/* 4 Mandatory Data Categories */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          Four Pillars of AirAware Transparency
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-1">
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200">
              1. Measured
            </span>
            <p className="font-bold text-zinc-900 dark:text-zinc-100 pt-1">Ground Station Sensors</p>
            <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
              No real-time ground monitoring station feed is active in this session. We never falsely label model data as measured station data.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl border border-sky-200 dark:border-sky-800/80 bg-sky-50/40 dark:bg-sky-950/30 space-y-1">
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-900 dark:text-sky-200">
              2. Model Estimate (Active)
            </span>
            <p className="font-bold text-zinc-900 dark:text-zinc-100 pt-1">CAMS Atmospheric Chemistry</p>
            <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
              Derived from Copernicus CAMS global simulations (~40 km grid) via Open-Meteo under CC BY 4.0.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/40 dark:bg-indigo-950/30 space-y-1">
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200">
              3. Forecast
            </span>
            <p className="font-bold text-zinc-900 dark:text-zinc-100 pt-1">24-Hour Timeline</p>
            <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
              Hourly forward projections model future dispersion, temperature, and wind trends for activity planning.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/30 space-y-1">
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
              4. General Guidance
            </span>
            <p className="font-bold text-zinc-900 dark:text-zinc-100 pt-1">CPCB 2014 &amp; WHO 2021</p>
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
          <span className="font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
            {whyAdvice.deterministicRuleId}
          </span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-700/60">
            <span className="text-[10px] text-zinc-600 dark:text-zinc-400">Index Value</span>
            <p className="text-base font-black text-zinc-900 dark:text-zinc-100">
              {whyAdvice.aqiValue ?? '--'}{' '}
              <span className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400">IN NAQI</span>
            </p>
          </div>

          <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-700/60">
            <span className="text-[10px] text-zinc-600 dark:text-zinc-400">Health Category</span>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {whyAdvice.aqiCategory}
            </p>
          </div>

          <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-700/60">
            <span className="text-[10px] text-zinc-600 dark:text-zinc-400">Dominant Pollutant</span>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {whyAdvice.dominantPollutant?.toUpperCase()}: {whyAdvice.dominantPollutantValue ?? '--'}{' '}
              {whyAdvice.dominantPollutantUnit ?? ''}
            </p>
          </div>
        </div>

        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 pt-1">
          <strong>Rule Applied:</strong> {whyAdvice.ruleCitation}
        </p>
      </div>

      {/* What This Data CANNOT Tell Us */}
      <div className="space-y-2 text-xs">
        <h4 className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-400">
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
      <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400">
        <span className="flex items-center gap-1">
          <ClockIcon size={12} />
          Observed: {new Date(whyAdvice.observedAt).toLocaleTimeString()}
        </span>

        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-xl transition-all cursor-pointer"
        >
          {t.understoodBtn}
        </button>
      </div>
    </ModalShell>
  );
}
