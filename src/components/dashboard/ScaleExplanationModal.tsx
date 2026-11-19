'use client';

import React from 'react';
import { CPCB_CATEGORIES } from '@/lib/aqi/breakpoints';
import { ShieldCheckIcon } from '../ui/Icons';

interface ScaleExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScaleExplanationModal({ isOpen, onClose }: ScaleExplanationModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="scale-guide-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-7 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-xl">
              <ShieldCheckIcon size={22} />
            </div>
            <div>
              <h3 id="scale-guide-title" className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Understanding Air Quality Scales
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Official standards, scale differences, and data provenance
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

        {/* CPCB Scale Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>🇮🇳 India National AQI (CPCB 2014 Standard)</span>
            <span className="text-[10px] font-semibold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
              Used Here
            </span>
          </h4>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            The Central Pollution Control Board (CPCB) defines India’s official 6-category AQI. It is calculated by taking the maximum sub-index across valid pollutants (requiring at least 3 parameters with PM₂.₅ or PM₁₀).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
            {CPCB_CATEGORIES.map((cat) => (
              <div
                key={cat.name}
                className="p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">{cat.name}</p>
                    <p className="text-[10px] text-zinc-400">{cat.description}</p>
                  </div>
                </div>
                <span className="font-mono font-semibold text-zinc-600 dark:text-zinc-300">
                  {cat.aqiLow}–{cat.aqiHigh}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Why Not US AQI or EU AQI? */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-2 text-xs">
          <h4 className="font-bold text-zinc-900 dark:text-zinc-100">
            ⚠️ Why different apps show different numbers
          </h4>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Weather apps frequently show <strong className="text-zinc-900 dark:text-zinc-100">US EPA AQI</strong> or <strong className="text-zinc-900 dark:text-zinc-100">European AQI (EAQI)</strong> without labeling them.
          </p>
          <ul className="list-disc pl-4 space-y-1 text-zinc-600 dark:text-zinc-400">
            <li>
              <strong>US AQI:</strong> Evaluates PM₂.₅ with tighter brackets (Good is 0–12 µg/m³, Moderate is 12.1–35.4 µg/m³). An Indian reading of 55 µg/m³ is &ldquo;Satisfactory&rdquo; under CPCB, but &ldquo;Unhealthy for Sensitive Groups&rdquo; (US AQI ~149).
            </li>
            <li>
              <strong>AirAware AI V2 Guarantee:</strong> We never swap scales silently. We calculate official Indian CPCB NAQI from raw concentrations and display exact concentrations so you have unvarnished data.
            </li>
          </ul>
        </div>

        {/* Data Provenance & Model vs Station */}
        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-zinc-900 dark:text-zinc-100">
            🛰️ Data Provenance: Model Estimate (CAMS)
          </h4>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            The current data comes from the <strong className="text-zinc-900 dark:text-zinc-100">Copernicus Atmosphere Monitoring Service (CAMS)</strong> global forecast model through Open-Meteo at ~40 km resolution.
          </p>
          <p className="text-zinc-500 dark:text-zinc-400 italic">
            This represents regional atmospheric chemistry simulations rather than an individual street corner monitoring sensor.
          </p>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-xl transition-all"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
