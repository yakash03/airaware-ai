'use client';

import React from 'react';
import { HourlySlot } from '@/lib/types';
import { ClockIcon } from '../ui/Icons';

interface HourlyForecastTimelineProps {
  forecast: HourlySlot[];
}

export function HourlyForecastTimeline({ forecast }: HourlyForecastTimelineProps) {
  if (!forecast || forecast.length === 0) return null;

  // Take the next 24 hours
  const upcomingSlots = forecast.slice(0, 24);

  // Format hour label
  const formatTimeSlot = (isoString: string): { hour: string; day: string } => {
    try {
      const date = new Date(isoString);
      const hour = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: true,
      });
      const day = date.toLocaleDateString('en-US', {
        weekday: 'short',
      });
      return { hour, day };
    } catch {
      return { hour: isoString.split('T')[1] ?? '', day: '' };
    }
  };

  // Color helper for PM2.5 forecast
  const getPm25Color = (val: number): string => {
    if (val > 120) return 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900';
    if (val > 90) return 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900';
    if (val > 60) return 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900';
    if (val > 30) return 'text-lime-600 bg-lime-50 dark:bg-lime-950/40 border-lime-200 dark:border-lime-900';
    return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900';
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              24-Hour Forecast Timeline
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              Forecast
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Hourly particulate levels and temperature projections (CAMS model estimate)
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <ClockIcon size={14} />
          <span>Scroll horizontally for upcoming hours</span>
        </div>
      </div>

      {/* Horizontal Scroll Bar */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-thin">
        {upcomingSlots.map((slot, index) => {
          const { hour, day } = formatTimeSlot(slot.time);
          const pm25 = slot.measurements.find((m) => m.pollutant === 'pm2_5')?.value;
          const pm10 = slot.measurements.find((m) => m.pollutant === 'pm10')?.value;
          const temp = slot.weather?.temperature;

          const pm25Class = pm25 !== undefined ? getPm25Color(pm25) : 'text-zinc-400 bg-zinc-50';

          return (
            <div
              key={`${slot.time}-${index}`}
              className="shrink-0 w-24 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 rounded-2xl p-3 flex flex-col items-center justify-between text-center hover:border-zinc-300 dark:hover:border-zinc-600 transition-all"
            >
              <div className="mb-2">
                <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
                  {day}
                </span>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  {hour}
                </p>
              </div>

              {/* PM2.5 forecast pill */}
              <div className="my-1.5 w-full">
                <div
                  className={`px-2 py-1 rounded-xl border text-xs font-bold ${pm25Class}`}
                  title={`PM2.5 Forecast: ${pm25 ?? '--'} µg/m³`}
                >
                  <p className="text-[9px] uppercase tracking-wider opacity-75 font-medium">PM₂.₅</p>
                  <span>{pm25 !== undefined ? Math.round(pm25) : '--'}</span>
                </div>
              </div>

              {/* Additional parameters */}
              <div className="mt-2 w-full text-[10px] text-zinc-500 dark:text-zinc-400 space-y-0.5 border-t border-zinc-200/50 dark:border-zinc-700/50 pt-1.5">
                {pm10 !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">PM₁₀:</span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {Math.round(pm10)}
                    </span>
                  </div>
                )}
                {temp !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Temp:</span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">{temp}°C</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
