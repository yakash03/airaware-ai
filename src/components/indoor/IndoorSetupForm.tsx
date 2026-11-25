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

interface QuestionSpec<K extends Exclude<keyof IndoorEnvironmentSetup, 'updatedAt'>> {
  key: K;
  legend: string;
  options: ReadonlyArray<{ val: NonNullable<IndoorEnvironmentSetup[K]>; label: string }>;
}

export function IndoorSetupForm({
  currentSetup,
  onSave,
  onClose,
  language,
}: IndoorSetupFormProps) {
  const t = TRANSLATIONS[language];
  const [setup, setSetup] = useState<IndoorEnvironmentSetup>({ ...currentSetup });

  const handleSelect = <K extends Exclude<keyof IndoorEnvironmentSetup, 'updatedAt'>>(
    key: K,
    value: NonNullable<IndoorEnvironmentSetup[K]>
  ) => {
    setSetup((prev) => ({
      ...prev,
      [key]: prev[key] === value ? null : value,
    }));
  };

  const handleClear = () => {
    const empty = { ...DEFAULT_INDOOR_SETUP };
    setSetup(empty);
    onSave(empty);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...setup, updatedAt: new Date().toISOString() });
    onClose();
  };

  const renderFieldset = <K extends Exclude<keyof IndoorEnvironmentSetup, 'updatedAt'>>(
    spec: QuestionSpec<K>
  ) => (
    <fieldset
      key={spec.key}
      className="space-y-1.5 p-3 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60"
    >
      <legend className="font-bold text-zinc-800 dark:text-zinc-200 block px-1">
        {spec.legend}
      </legend>
      <div className="flex gap-1.5">
        {spec.options.map((opt) => {
          const isSelected = setup[spec.key] === opt.val;
          return (
            <button
              type="button"
              key={opt.val}
              aria-pressed={isSelected}
              onClick={() => handleSelect(spec.key, opt.val)}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900'
                  : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="p-5 sm:p-6 bg-zinc-50 dark:bg-zinc-800/40 rounded-3xl border border-zinc-200/80 dark:border-zinc-700/80 space-y-5"
    >
      <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-700/60 pb-3">
        <div>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{t.setupPrompt}</h4>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
            Answers are stored locally in your browser only. Never transmitted to third parties.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close setup form"
          className="text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white font-bold px-2 py-1 rounded-lg cursor-pointer"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {renderFieldset({
          key: 'naturallyVentilated',
          legend: t.qVentilation,
          options: [
            { val: 'YES', label: 'Yes' },
            { val: 'NO', label: 'No' },
            { val: 'PARTIAL', label: 'Partial' },
          ],
        })}
        {renderFieldset({
          key: 'windowsStatus',
          legend: t.qWindows,
          options: [
            { val: 'OPEN', label: 'Usually Open' },
            { val: 'CLOSED', label: 'Usually Closed' },
            { val: 'TIME_DEPENDENT', label: 'Varies' },
          ],
        })}
        {renderFieldset({
          key: 'cookingNearby',
          legend: t.qCooking,
          options: [
            { val: 'YES', label: 'Yes, Active' },
            { val: 'NO', label: 'No' },
            { val: 'OCCASIONALLY', label: 'Occasionally' },
          ],
        })}
        {renderFieldset({
          key: 'visibleDustOrSmoke',
          legend: t.qDustSmoke,
          options: [
            { val: 'YES', label: 'Yes, Frequent' },
            { val: 'NO', label: 'No' },
            { val: 'SOMETIMES', label: 'Sometimes' },
          ],
        })}
        {renderFieldset({
          key: 'airPurifierAvailable',
          legend: t.qPurifier,
          options: [
            { val: 'YES', label: 'Yes, In Use' },
            { val: 'NO', label: 'No Purifier' },
          ],
        })}
        {renderFieldset({
          key: 'roadFacingArea',
          legend: t.qRoadFacing,
          options: [
            { val: 'YES', label: 'Yes, Busy Road' },
            { val: 'NO', label: 'Quiet / Courtyard' },
          ],
        })}
      </div>

      <div className="flex items-center justify-between border-t border-zinc-200/60 dark:border-zinc-700/60 pt-3">
        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-rose-700 dark:text-rose-400 hover:underline font-bold cursor-pointer"
        >
          {t.clearSetup}
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-700 cursor-pointer"
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
