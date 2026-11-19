'use client';

import React, { useState } from 'react';
import { IndoorEnvironmentSetup, Language } from '@/lib/types';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { DEFAULT_INDOOR_SETUP } from '@/lib/rules/indoorAdvisorRules';

interface IndoorSetupFormProps {
  currentSetup: IndoorEnvironmentSetup;
  onSave: (setup: IndoorEnvironmentSetup) => void;
  onClose: () => void;
  language: Language;
}

export function IndoorSetupForm({
  currentSetup,
  onSave,
  onClose,
  language,
}: IndoorSetupFormProps) {
  const t = TRANSLATIONS[language];
  const [setup, setSetup] = useState<IndoorEnvironmentSetup>({ ...currentSetup });

  const handleSelect = <K extends keyof IndoorEnvironmentSetup>(key: K, value: IndoorEnvironmentSetup[K]) => {
    setSetup((prev) => ({
      ...prev,
      [key]: prev[key] === value ? null : value, // Toggle or unset
    }));
  };

  const handleClear = () => {
    setSetup({ ...DEFAULT_INDOOR_SETUP });
    onSave({ ...DEFAULT_INDOOR_SETUP });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...setup, updatedAt: new Date().toISOString() });
    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-5 sm:p-6 bg-zinc-50 dark:bg-zinc-800/40 rounded-3xl border border-zinc-200/80 dark:border-zinc-700/80 space-y-5 animate-in fade-in duration-200"
    >
      <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-700/60 pb-3">
        <div>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {t.setupPrompt}
          </h4>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Answers are stored locally in your browser only. Never transmitted to third parties.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 font-bold px-2 py-1"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Q1: Naturally Ventilated */}
        <div className="space-y-1.5 p-3 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
          <label className="font-bold text-zinc-800 dark:text-zinc-200 block">
            {t.qVentilation}
          </label>
          <div className="flex gap-1.5">
            {[
              { val: 'YES', label: 'Yes' },
              { val: 'NO', label: 'No' },
              { val: 'PARTIAL', label: 'Partial' },
            ].map((opt) => (
              <button
                type="button"
                key={opt.val}
                onClick={() => handleSelect('naturallyVentilated', opt.val as any)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  setup.naturallyVentilated === opt.val
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900'
                    : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Q2: Windows Open/Closed */}
        <div className="space-y-1.5 p-3 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
          <label className="font-bold text-zinc-800 dark:text-zinc-200 block">
            {t.qWindows}
          </label>
          <div className="flex gap-1.5">
            {[
              { val: 'OPEN', label: 'Usually Open' },
              { val: 'CLOSED', label: 'Usually Closed' },
              { val: 'TIME_DEPENDENT', label: 'Varies' },
            ].map((opt) => (
              <button
                type="button"
                key={opt.val}
                onClick={() => handleSelect('windowsStatus', opt.val as any)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  setup.windowsStatus === opt.val
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900'
                    : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Q3: Cooking Activity Nearby */}
        <div className="space-y-1.5 p-3 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
          <label className="font-bold text-zinc-800 dark:text-zinc-200 block">
            {t.qCooking}
          </label>
          <div className="flex gap-1.5">
            {[
              { val: 'YES', label: 'Yes, Active' },
              { val: 'NO', label: 'No' },
              { val: 'OCCASIONALLY', label: 'Occasionally' },
            ].map((opt) => (
              <button
                type="button"
                key={opt.val}
                onClick={() => handleSelect('cookingNearby', opt.val as any)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  setup.cookingNearby === opt.val
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900'
                    : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Q4: Visible Dust or Smoke */}
        <div className="space-y-1.5 p-3 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
          <label className="font-bold text-zinc-800 dark:text-zinc-200 block">
            {t.qDustSmoke}
          </label>
          <div className="flex gap-1.5">
            {[
              { val: 'YES', label: 'Yes, Frequent' },
              { val: 'NO', label: 'No' },
              { val: 'SOMETIMES', label: 'Sometimes' },
            ].map((opt) => (
              <button
                type="button"
                key={opt.val}
                onClick={() => handleSelect('visibleDustOrSmoke', opt.val as any)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  setup.visibleDustOrSmoke === opt.val
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900'
                    : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Q5: Air Purifier Available */}
        <div className="space-y-1.5 p-3 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
          <label className="font-bold text-zinc-800 dark:text-zinc-200 block">
            {t.qPurifier}
          </label>
          <div className="flex gap-1.5">
            {[
              { val: 'YES', label: 'Yes, In Use' },
              { val: 'NO', label: 'No Purifier' },
            ].map((opt) => (
              <button
                type="button"
                key={opt.val}
                onClick={() => handleSelect('airPurifierAvailable', opt.val as any)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  setup.airPurifierAvailable === opt.val
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900'
                    : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Q6: Road-Facing Traffic Area */}
        <div className="space-y-1.5 p-3 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
          <label className="font-bold text-zinc-800 dark:text-zinc-200 block">
            {t.qRoadFacing}
          </label>
          <div className="flex gap-1.5">
            {[
              { val: 'YES', label: 'Yes, Busy Road' },
              { val: 'NO', label: 'Quiet / Courtyard' },
            ].map((opt) => (
              <button
                type="button"
                key={opt.val}
                onClick={() => handleSelect('roadFacingArea', opt.val as any)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  setup.roadFacingArea === opt.val
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900'
                    : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-200/60 dark:border-zinc-700/60 pt-3">
        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
        >
          {t.clearSetup}
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-700 cursor-pointer"
          >
            {t.cancelBtn}
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl text-xs font-bold cursor-pointer shadow-xs"
          >
            {t.saveSetup}
          </button>
        </div>
      </div>
    </form>
  );
}
