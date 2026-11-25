'use client';

import React, { useState, useEffect } from 'react';
import { AirSnapshot, FamilyProfile, ProfileCategory, Language, AgeExplanation } from '@/lib/types';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { WhyAdviceModal } from './WhyAdviceModal';
import { ShieldCheckIcon, SparklesIcon, InfoIcon } from '../ui/Icons';

interface FamilyDashboardProps {
  snapshot: AirSnapshot;
  profiles: FamilyProfile[];
  language: Language;
  activeProfileId: string;
  onSelectProfile: (p: FamilyProfile) => void;
}

type ExplanationsMap = Record<ProfileCategory, AgeExplanation | null>;

const EMPTY_EXPLANATIONS: ExplanationsMap = {
  CHILD: null,
  TEEN: null,
  ADULT: null,
  SENIOR: null,
};

export function FamilyDashboard({
  snapshot,
  profiles,
  language,
  activeProfileId,
  onSelectProfile,
}: FamilyDashboardProps) {
  const t = TRANSLATIONS[language];
  const requestKey = `${snapshot.fetchedAt}:${language}`;
  const [loadedState, setLoadedState] = useState<{
    key: string;
    data: ExplanationsMap;
  }>({
    key: '',
    data: EMPTY_EXPLANATIONS,
  });
  const [selectedWhyAdvice, setSelectedWhyAdvice] = useState<AgeExplanation | null>(null);

  const loading = loadedState.key !== requestKey;
  const explanations = loadedState.data;

  // Fetch explanations for all 4 age categories simultaneously with AbortController cleanup
  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    async function loadAllExplanations() {
      const categories: ProfileCategory[] = ['CHILD', 'TEEN', 'ADULT', 'SENIOR'];
      const results: Partial<Record<ProfileCategory, AgeExplanation>> = {};

      await Promise.all(
        categories.map(async (cat) => {
          try {
            const res = await fetch('/api/explain', {
              method: 'POST',
              signal: controller.signal,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                snapshot,
                category: cat,
                language,
              }),
            });
            const json = await res.json();
            if (json.success && json.data) {
              results[cat] = json.data;
            }
          } catch (err: unknown) {
            if (err instanceof Error && err.name === 'AbortError') return;
            console.warn(`Failed to fetch explanation for ${cat}`);
          }
        })
      );

      if (isMounted && !controller.signal.aborted) {
        setLoadedState({
          key: requestKey,
          data: {
            CHILD: results.CHILD || null,
            TEEN: results.TEEN || null,
            ADULT: results.ADULT || null,
            SENIOR: results.SENIOR || null,
          },
        });
      }
    }

    loadAllExplanations();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [snapshot, language, requestKey]);

  const aqiVal = snapshot.computedAqi?.value;
  const aqiCat = snapshot.computedAqi?.category ?? 'Moderate';
  const dominant = snapshot.computedAqi?.dominantPollutant ?? 'PM2.5';
  const cityName = snapshot.current[0]?.location?.name || 'Selected Location';

  const cautionMap = {
    LOW: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    MODERATE: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    HIGH: 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800',
    VERY_HIGH: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
  };

  return (
    <section
      aria-label={t.familyDashboardTitle}
      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-xs mb-6"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              <SparklesIcon size={16} aria-hidden="true" />
            </span>
            <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              {t.familyDashboardTitle}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            {t.familyDashboardSubtitle}
          </p>
        </div>

        {/* Consistent Environmental Data Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-zinc-50 dark:bg-zinc-800/60 px-3 py-1.5 rounded-xl border border-zinc-200/60 dark:border-zinc-700 text-xs">
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{cityName}:</span>
          <span className="font-bold text-emerald-700 dark:text-emerald-400">
            {aqiVal ?? '--'} IN NAQI ({aqiCat})
          </span>
          <span className="text-zinc-600 dark:text-zinc-400 text-[10px]">
            ({dominant.toUpperCase()})
          </span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profiles.map((profile) => {
          const exp = explanations[profile.category];
          const isSelected = profile.id === activeProfileId;
          const cautionLabel = exp?.cautionLevel ? exp.cautionLevel.replace('_', ' ') : 'MODERATE';

          return (
            <article
              key={profile.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'border-emerald-600 bg-white dark:bg-zinc-900 shadow-md ring-2 ring-emerald-600/15'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/40 dark:bg-zinc-800/20'
              }`}
            >
              {/* Member Card Top Bar with dedicated interactive selector button */}
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelectProfile(profile)}
                  aria-pressed={isSelected}
                  className="flex items-center gap-3 text-left cursor-pointer rounded-xl"
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shadow-xs shrink-0"
                    style={{ backgroundColor: profile.avatarColor || '#047857' }}
                    aria-hidden="true"
                  >
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <span>{profile.name}</span>
                      {isSelected && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                          Active
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                      {profile.category} • {profile.ageRange}
                    </p>
                  </div>
                </button>

                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border shrink-0 ${
                    cautionMap[exp?.cautionLevel || 'MODERATE']
                  }`}
                >
                  {cautionLabel} Caution
                </span>
              </div>

              {/* Age-Adapted Content */}
              {loading ? (
                <div className="py-6 text-center space-y-2" role="status">
                  <div className="w-5 h-5 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Synthesizing age-tailored interpretation...
                  </p>
                </div>
              ) : exp ? (
                <div className="space-y-2.5 text-xs">
                  <h5 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm tracking-tight leading-snug">
                    {exp.headline}
                  </h5>

                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{exp.summary}</p>

                  <div className="p-3 rounded-xl bg-zinc-100/70 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-700/50 text-[11px] text-zinc-700 dark:text-zinc-300">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-0.5">
                      Suggested Guidance:
                    </span>
                    <span>{exp.activityGuidance}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-600 dark:text-zinc-400 italic">
                  Explanation temporarily unavailable.
                </p>
              )}

              {/* Card Footer */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1 font-mono text-[10px]">
                  <ShieldCheckIcon size={12} className="text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                  Same {aqiVal} AQI Base
                </span>

                {exp && (
                  <button
                    type="button"
                    onClick={() => setSelectedWhyAdvice(exp)}
                    className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
                  >
                    <InfoIcon size={13} aria-hidden="true" />
                    <span>{t.whyAdviceBtn}</span>
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <WhyAdviceModal
        isOpen={selectedWhyAdvice !== null}
        onClose={() => setSelectedWhyAdvice(null)}
        explanation={selectedWhyAdvice}
        language={language}
      />
    </section>
  );
}
