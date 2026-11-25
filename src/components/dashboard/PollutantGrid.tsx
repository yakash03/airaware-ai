'use client';

import React from 'react';
import { Measurement, ComputedAqi } from '@/lib/types';
import { POLLUTANT_METADATA } from '@/lib/normalize/units';

interface PollutantGridProps {
  measurements: Measurement[];
  computedAqi: ComputedAqi | null;
}

const CPCB_SAFE_LIMITS: Record<string, { limit: number; unit: string; period: string }> = {
  pm2_5: { limit: 60, unit: 'µg/m³', period: '24h standard' },
  pm10: { limit: 100, unit: 'µg/m³', period: '24h standard' },
  no2: { limit: 80, unit: 'µg/m³', period: '24h standard' },
  so2: { limit: 80, unit: 'µg/m³', period: '24h standard' },
  co: { limit: 2.0, unit: 'mg/m³', period: '8h standard' },
  o3: { limit: 100, unit: 'µg/m³', period: '8h standard' },
};

export function PollutantGrid({ measurements, computedAqi }: PollutantGridProps) {
  const subIndices = computedAqi?.subIndices ?? {};

  return (
    <section aria-label="Key Pollutant Concentrations" className="w-full mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Key Pollutant Concentrations
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Real environmental parameters with CPCB sub-indices and national standard limits
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {measurements.map((m) => {
          const meta = POLLUTANT_METADATA[m.pollutant];
          const subIndex = subIndices[m.pollutant];
          const safeStandard = CPCB_SAFE_LIMITS[m.pollutant];

          let statusColor =
            'text-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
          let barColor = 'bg-emerald-600';

          if (subIndex !== undefined) {
            if (subIndex > 300) {
              statusColor =
                'text-rose-800 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800';
              barColor = 'bg-rose-600';
            } else if (subIndex > 200) {
              statusColor =
                'text-orange-800 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-300 border-orange-200 dark:border-orange-800';
              barColor = 'bg-orange-500';
            } else if (subIndex > 100) {
              statusColor =
                'text-amber-800 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
              barColor = 'bg-amber-500';
            } else if (subIndex > 50) {
              statusColor =
                'text-lime-800 bg-lime-50 dark:bg-lime-950/40 dark:text-lime-300 border-lime-200 dark:border-lime-800';
              barColor = 'bg-lime-600';
            }
          }

          const ratioPercent = safeStandard
            ? Math.min(100, Math.round((m.value / safeStandard.limit) * 100))
            : 50;

          return (
            <div
              key={m.pollutant}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col justify-between shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                    {meta?.formula ?? m.pollutant.toUpperCase()}
                  </span>
                  {subIndex !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold border ${statusColor}`}
                      title={`CPCB Sub-Index for ${meta?.formula}: ${subIndex}`}
                    >
                      Sub: {subIndex}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate mb-2">
                  {meta?.label ?? m.pollutant}
                </p>

                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                    {m.value}
                  </span>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                    {m.unit}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80">
                {safeStandard && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-zinc-600 dark:text-zinc-400">
                      <span>
                        Std: {safeStandard.limit} {safeStandard.unit}
                      </span>
                      <span>{ratioPercent}%</span>
                    </div>
                    <div
                      role="progressbar"
                      aria-label={`${meta?.label ?? m.pollutant} percentage of standard limit`}
                      aria-valuenow={ratioPercent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden"
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${ratioPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
