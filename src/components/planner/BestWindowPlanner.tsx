'use client';

import React, { useState, useMemo } from 'react';
import {
  HourlySlot,
  ActivityType,
  FamilyProfile,
  Language,
  BestWindowRanking,
  BestWindowPlan,
} from '@/lib/types';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { calculateBestWindows } from '@/lib/rules/bestWindowRules';
import { WhyTimeModal } from './WhyTimeModal';
import { ClockIcon, SparklesIcon, ShieldCheckIcon, AlertCircleIcon } from '../ui/Icons';

interface BestWindowPlannerProps {
  hourlyForecast: HourlySlot[];
  activeProfile: FamilyProfile | null;
  language: Language;
  locationName: string;
}

export function BestWindowPlanner({
  hourlyForecast,
  activeProfile,
  language,
  locationName,
}: BestWindowPlannerProps) {
  const t = TRANSLATIONS[language];
  const [selectedActivity, setSelectedActivity] = useState<ActivityType>('WALKING');
  const [selectedWindowForModal, setSelectedWindowForModal] = useState<BestWindowRanking | null>(null);
  const [inspectedHourIndex, setInspectedHourIndex] = useState<number | null>(null);

  // Compute deterministic best window plan
  const plan: BestWindowPlan = useMemo(() => {
    return calculateBestWindows(
      hourlyForecast,
      selectedActivity,
      activeProfile?.category ?? 'ADULT',
      language,
      locationName
    );
  }, [hourlyForecast, selectedActivity, activeProfile, language, locationName]);

  const bestWindow = plan.bestWindow;
  const worstWindow = plan.worstWindow;
  const slots24 = useMemo(() => hourlyForecast.slice(0, 24), [hourlyForecast]);

  // Selected hour for inspection
  const inspectedSlot = inspectedHourIndex !== null ? slots24[inspectedHourIndex] : null;

  // Format local hour string
  const formatSlotHour = (iso: string): { hourStr: string; ampm: string; day: string } => {
    try {
      const d = new Date(iso);
      const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
      const parts = timeStr.split(' ');
      const day = d.toLocaleDateString('en-US', { weekday: 'short' });
      return { hourStr: parts[0] || '', ampm: parts[1] || '', day };
    } catch {
      return { hourStr: iso.slice(11, 13), ampm: '', day: '' };
    }
  };

  // Helper for AQI color classes
  const getAqiColorBadge = (aqi: number | null): { bg: string; text: string; border: string } => {
    if (aqi === null) return { bg: 'bg-zinc-100 dark:bg-zinc-800', text: 'text-zinc-500', border: 'border-zinc-300' };
    if (aqi <= 50) return { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' };
    if (aqi <= 100) return { bg: 'bg-lime-50 dark:bg-lime-950/40', text: 'text-lime-700 dark:text-lime-400', border: 'border-lime-200 dark:border-lime-800' };
    if (aqi <= 200) return { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' };
    if (aqi <= 300) return { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' };
    if (aqi <= 400) return { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' };
    return { bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-800 dark:text-red-300', border: 'border-red-300 dark:border-red-900' };
  };

  if (!plan.dataSufficient || !bestWindow) {
    return (
      <section className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 mb-8 shadow-xs">
        <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
          <AlertCircleIcon size={22} />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t.plannerTitle}</h3>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
          Insufficient 24-hour forecast data to identify a comparatively better window. Displaying current real-time data only.
        </p>
      </section>
    );
  }

  const activities: { id: ActivityType; label: string; icon: string }[] = [
    { id: 'WALKING', label: t.actWalking, icon: '🚶' },
    { id: 'OUTDOOR_RECREATION', label: t.actRecreation, icon: '⚽' },
    { id: 'CYCLING', label: t.actCycling, icon: '🚴' },
    { id: 'GENERAL', label: t.actGeneral, icon: '🌤️' },
  ];

  return (
    <section className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-xs mb-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <ClockIcon size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {t.plannerTitle}
                </h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Phase 4 Live
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {t.plannerSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Context Pill */}
        {activeProfile && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs">
            <span className="text-zinc-400">Tailored for:</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">
              {activeProfile.name}
            </span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
              {activeProfile.category}
            </span>
          </div>
        )}
      </div>

      {/* Activity Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider shrink-0">
          {t.activityLabel}:
        </span>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
          {activities.map((act) => {
            const isSelected = selectedActivity === act.id;
            return (
              <button
                key={act.id}
                onClick={() => setSelectedActivity(act.id)}
                className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs scale-[1.02]'
                    : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                <span>{act.icon}</span>
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Best Window Highlight Card */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/30 dark:from-emerald-950/30 dark:via-zinc-900 dark:to-emerald-950/20 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                {t.bestWindowBadge}
              </span>
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Rank #1 of {plan.rankedWindows.length} Evaluated Periods
              </span>
            </div>

            <h4 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              {bestWindow.timeLabel}
            </h4>

            <p className="text-xs sm:text-sm font-medium text-emerald-950 dark:text-emerald-200/90 leading-relaxed max-w-2xl">
              {bestWindow.comparisonReason}
            </p>
          </div>

          {/* AQI Metric Box */}
          <div className="shrink-0 flex items-center gap-3 bg-white dark:bg-zinc-800/80 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 shadow-xs">
            <div className="text-center pr-3 border-r border-zinc-200 dark:border-zinc-700">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Forecast IN NAQI
              </span>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {bestWindow.averageAqi}
              </p>
              <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
                {bestWindow.aqiCategory}
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Dominant: <strong className="text-zinc-800 dark:text-zinc-200 uppercase">{bestWindow.dominantPollutant?.replace('_', '.')}</strong>
              </div>
              {bestWindow.temperatureAvg !== undefined && (
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Temp: <strong className="text-zinc-800 dark:text-zinc-200">{bestWindow.temperatureAvg}°C</strong>
                </div>
              )}
              <button
                onClick={() => setSelectedWindowForModal(bestWindow)}
                className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer"
              >
                <span>{t.whyThisTimeBtn}</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Age-Adapted Explanation Banner */}
        <div className="mt-5 pt-4 border-t border-emerald-200/60 dark:border-emerald-900/40 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="md:col-span-2 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold">
              <SparklesIcon size={14} />
              <span>{plan.ageAdaptedExplanation.headline}</span>
            </div>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {plan.ageAdaptedExplanation.recommendation} {plan.ageAdaptedExplanation.activitySpecificAdvice}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider block text-amber-700 dark:text-amber-400">
              Diurnal Caution
            </span>
            <p className="text-[11px] leading-tight">
              {plan.ageAdaptedExplanation.cautionNote}
            </p>
          </div>
        </div>
      </div>

      {/* 24-Hour Forecast Timeline & Hour-by-Hour Inspector */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {t.compareHoursTitle}
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t.compareHoursSubtitle}
            </p>
          </div>
          <span className="text-[11px] text-zinc-400 italic">
            CPCB NAQI scale (0–500)
          </span>
        </div>

        {/* Horizontal Hourly Bar Graph */}
        <div className="flex items-end gap-2 overflow-x-auto pb-3 pt-2 scrollbar-thin">
          {slots24.map((slot, idx) => {
            const { hourStr, ampm, day } = formatSlotHour(slot.time);
            const aqi = slot.computedAqi?.value ?? null;
            const cat = slot.computedAqi?.category ?? 'Unknown';
            const { bg, text, border } = getAqiColorBadge(aqi);
            const isSelected = inspectedHourIndex === idx;

            // Check if this slot belongs to best window
            const isInsideBest =
              bestWindow &&
              new Date(slot.time) >= new Date(bestWindow.startTime) &&
              new Date(slot.time) <= new Date(bestWindow.endTime);

            return (
              <button
                key={`${slot.time}-${idx}`}
                onClick={() => setInspectedHourIndex(isSelected ? null : idx)}
                className={`shrink-0 w-20 p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                  isSelected
                    ? 'ring-2 ring-zinc-900 dark:ring-zinc-100 scale-105 z-10 bg-white dark:bg-zinc-800 border-zinc-900 shadow-md'
                    : isInsideBest
                    ? 'border-emerald-500/80 bg-emerald-50/50 dark:bg-emerald-950/30 hover:border-emerald-600'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 hover:border-zinc-300'
                }`}
              >
                <span className="text-[9px] font-bold uppercase text-zinc-400">
                  {day}
                </span>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  {hourStr} <span className="text-[9px] font-normal">{ampm}</span>
                </span>

                {/* AQI Pill */}
                <div className={`my-1.5 w-full py-1 rounded-xl border ${bg} ${text} ${border}`}>
                  <p className="text-[9px] uppercase tracking-wider font-semibold opacity-75">NAQI</p>
                  <p className="text-xs font-black">{aqi !== null ? aqi : '--'}</p>
                </div>

                <span className="text-[9px] font-medium text-zinc-500 dark:text-zinc-400 truncate w-full">
                  {cat}
                </span>

                {isInsideBest && (
                  <span className="mt-1 text-[8px] font-extrabold uppercase px-1 rounded bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100">
                    Favorable
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Inspected Hour Detail Drawer (if user clicks an hour) */}
        {inspectedSlot && (
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 animate-in fade-in duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                  {formatSlotHour(inspectedSlot.time).hourStr} {formatSlotHour(inspectedSlot.time).ampm} — {inspectedSlot.computedAqi?.category ?? 'Unknown'}
                </span>
                <span className="text-zinc-400">|</span>
                <span className="text-zinc-600 dark:text-zinc-400">
                  Forecast IN NAQI: <strong>{inspectedSlot.computedAqi?.value ?? '--'}</strong>
                </span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400">
                {inspectedSlot.computedAqi?.value !== null && bestWindow.averageAqi !== null ? (
                  inspectedSlot.computedAqi?.value! > bestWindow.averageAqi
                    ? `+${inspectedSlot.computedAqi?.value! - bestWindow.averageAqi} AQI points higher than the comparatively most favorable window (${bestWindow.timeLabel}).`
                    : `Within the comparatively favorable window (${bestWindow.timeLabel}).`
                ) : (
                  'Hourly forecast reading.'
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-zinc-400 text-[11px]">
                PM2.5: {inspectedSlot.measurements.find((m) => m.pollutant === 'pm2_5')?.value ?? '--'} µg/m³
              </span>
              <button
                onClick={() => setInspectedHourIndex(null)}
                className="px-2.5 py-1 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 text-zinc-700 dark:text-zinc-200 rounded-lg text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ranked Windows Comparison Table */}
      <div className="space-y-2.5 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Ranked 2-Hour Forecast Intervals (Next 24 Hours)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {plan.rankedWindows.map((win) => {
            const isBest = win.isBestWindow;
            return (
              <div
                key={win.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isBest
                    ? 'border-emerald-500/80 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      isBest
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                    }`}
                  >
                    Rank #{win.rank}
                  </span>
                  <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                    IN NAQI {win.averageAqi}
                  </span>
                </div>

                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-2">
                  {win.timeLabel}
                </p>

                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                  {win.comparisonReason}
                </p>

                <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">
                    {win.aqiCategory} · {win.dominantPollutant?.toUpperCase().replace('_', '.')}
                  </span>
                  <button
                    onClick={() => setSelectedWindowForModal(win)}
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Details →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Non-diagnostic Disclaimer */}
      <div className="text-[11px] text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-3">
        {t.forecastDisclaimer}
      </div>

      {/* "Why This Time?" Transparency Modal */}
      <WhyTimeModal
        isOpen={selectedWindowForModal !== null}
        onClose={() => setSelectedWindowForModal(null)}
        windowData={selectedWindowForModal}
        language={language}
      />
    </section>
  );
}
