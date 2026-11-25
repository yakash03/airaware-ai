'use client';

import React, { useState, useMemo } from 'react';
import {
  IndoorEnvironmentSetup,
  IndoorAdvisorPlan,
  IndoorSuggestion,
  FamilyProfile,
  Language,
  AirSnapshot,
} from '@/lib/types';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import {
  calculateIndoorGuidance,
  DEFAULT_INDOOR_SETUP,
} from '@/lib/rules/indoorAdvisorRules';
import { useLocalStorageState } from '@/lib/hooks/useLocalStorageState';
import { IndoorSetupForm } from './IndoorSetupForm';
import { WhySuggestionModal } from './WhySuggestionModal';
import { SparklesIcon, AlertCircleIcon } from '../ui/Icons';

interface IndoorAirAdvisorProps {
  snapshot: AirSnapshot | null;
  activeProfile: FamilyProfile | null;
  language: Language;
  locationName: string;
}

const STORAGE_KEY = 'airaware_indoor_setup_v1';

function validateIndoorSetup(parsed: unknown): IndoorEnvironmentSetup | null {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
  return parsed as IndoorEnvironmentSetup;
}

export function IndoorAirAdvisor({
  snapshot,
  activeProfile,
  language,
  locationName,
}: IndoorAirAdvisorProps) {
  const t = TRANSLATIONS[language];
  const [setup, setSetup] = useLocalStorageState<IndoorEnvironmentSetup>(
    STORAGE_KEY,
    DEFAULT_INDOOR_SETUP,
    validateIndoorSetup
  );
  const [isEditingSetup, setIsEditingSetup] = useState<boolean>(false);
  const [selectedSuggestionForModal, setSelectedSuggestionForModal] =
    useState<IndoorSuggestion | null>(null);

  const outdoorAqi = snapshot?.computedAqi?.value ?? null;
  const outdoorCategory = snapshot?.computedAqi?.category ?? null;
  const dominantPollutant = snapshot?.computedAqi?.dominantPollutant ?? null;

  const plan: IndoorAdvisorPlan = useMemo(() => {
    return calculateIndoorGuidance(
      setup,
      outdoorAqi,
      outdoorCategory,
      dominantPollutant,
      activeProfile?.category ?? 'ADULT',
      language,
      locationName
    );
  }, [setup, outdoorAqi, outdoorCategory, dominantPollutant, activeProfile, language, locationName]);

  const hasAnyAnswers = Object.values(setup).some((v) => v !== null && v !== undefined);

  return (
    <section
      aria-label={t.indoorAdvisorTitle}
      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-xs mb-8 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800/80 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 rounded-2xl text-xl" aria-hidden="true">
            🏠
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                {t.indoorAdvisorTitle}
              </h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200">
                Non-Sensor Guide
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
              {t.indoorAdvisorSubtitle}
            </p>
          </div>
        </div>

        {activeProfile && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs">
            <span className="text-zinc-600 dark:text-zinc-400">Tailored for:</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">{activeProfile.name}</span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200">
              {activeProfile.category}
            </span>
          </div>
        )}
      </div>

      {/* Mandatory Non-Sensor Transparency Notice */}
      <div
        role="note"
        className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
      >
        <div className="flex items-start sm:items-center gap-2.5 text-amber-900 dark:text-amber-200">
          <AlertCircleIcon size={18} className="shrink-0 mt-0.5 sm:mt-0 text-amber-700" aria-hidden="true" />
          <p className="leading-relaxed font-medium">{t.noSensorNotice}</p>
        </div>
        <span className="shrink-0 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-200/80 dark:bg-amber-900/70 text-amber-950 dark:text-amber-100 self-start sm:self-center">
          {t.noSensorWarning}
        </span>
      </div>

      {/* Setup Bar & Context Indicators */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
            {t.outdoorContextLabel}:
          </span>
          <span className="font-bold text-zinc-800 dark:text-zinc-200">
            {outdoorAqi !== null
              ? `IN NAQI ${outdoorAqi} (${outdoorCategory ?? 'Moderate'})`
              : 'Awaiting Outdoor Data'}
          </span>
          {dominantPollutant && (
            <span className="text-zinc-600 dark:text-zinc-400">
              · Dominant: <strong className="uppercase">{dominantPollutant.replace('_', '.')}</strong>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsEditingSetup(!isEditingSetup)}
          aria-expanded={isEditingSetup}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer shadow-xs transition-colors"
        >
          {isEditingSetup ? t.cancelBtn : hasAnyAnswers ? t.editSetup : t.setupPrompt}
        </button>
      </div>

      {isEditingSetup && (
        <IndoorSetupForm
          currentSetup={setup}
          onSave={setSetup}
          onClose={() => setIsEditingSetup(false)}
          language={language}
        />
      )}

      {/* Reported Answers Summary Pills */}
      {hasAnyAnswers && !isEditingSetup && (
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-zinc-600 dark:text-zinc-400 font-semibold text-[10px] uppercase mr-1">
            Active Space Settings:
          </span>
          {setup.windowsStatus && (
            <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
              Windows: {setup.windowsStatus}
            </span>
          )}
          {setup.cookingNearby && (
            <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
              Cooking: {setup.cookingNearby}
            </span>
          )}
          {setup.visibleDustOrSmoke && (
            <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
              Dust/Smoke: {setup.visibleDustOrSmoke}
            </span>
          )}
          {setup.airPurifierAvailable && (
            <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
              Purifier: {setup.airPurifierAvailable}
            </span>
          )}
          {setup.roadFacingArea && (
            <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
              Road-Facing: {setup.roadFacingArea}
            </span>
          )}
        </div>
      )}

      {/* Family Age-Adapted Summary Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50/60 to-white dark:from-blue-950/20 dark:to-zinc-900 border border-blue-200/70 dark:border-blue-900/40 space-y-2">
        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold text-xs">
          <SparklesIcon size={16} aria-hidden="true" />
          <span>{plan.familySummary.headline}</span>
        </div>
        <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {plan.familySummary.overview}
        </p>
        <p className="text-xs font-semibold text-blue-950 dark:text-blue-200 pt-1 border-t border-blue-100 dark:border-blue-900/40">
          Key Action: {plan.familySummary.keyAction}
        </p>
      </div>

      {/* Suggestions Cards Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          Personalized Indoor Suggestions ({plan.suggestions.length})
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {plan.suggestions.map((sug) => (
            <div
              key={sug.id}
              className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/30 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all space-y-3 shadow-2xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg" aria-hidden="true">{sug.icon}</span>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        sug.priority === 'HIGH'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200'
                          : sug.priority === 'MEDIUM'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200'
                          : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {sug.priority} Priority
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-medium">
                    {sug.category.replace('_', ' ')}
                  </span>
                </div>

                <h5 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{sug.title}</h5>

                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {sug.advice}
                </p>

                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700/50 text-[11px] text-zinc-600 dark:text-zinc-400 italic">
                  {sug.ageGuidance}
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <span className="text-[10px] text-zinc-600 dark:text-zinc-400">
                  Outdoor: {outdoorAqi ?? '--'} IN NAQI
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedSuggestionForModal(sug)}
                  className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {t.whySuggestionBtn} <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="text-[11px] text-zinc-600 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-3">
        {plan.disclaimer}
      </div>

      <WhySuggestionModal
        isOpen={selectedSuggestionForModal !== null}
        onClose={() => setSelectedSuggestionForModal(null)}
        suggestion={selectedSuggestionForModal}
        language={language}
      />
    </section>
  );
}
