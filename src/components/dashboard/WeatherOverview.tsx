'use client';

import React from 'react';
import { WeatherData } from '@/lib/types';
import { ThermometerIcon, DropletsIcon, WindIcon, CompassIcon } from '../ui/Icons';

interface WeatherOverviewProps {
  weather: WeatherData | null;
}

export function WeatherOverview({ weather }: WeatherOverviewProps) {
  if (!weather) return null;

  const getWindCardinal = (deg: number): string => {
    const val = Math.floor(deg / 22.5 + 0.5);
    const arr = [
      'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
    ];
    return arr[val % 16];
  };

  return (
    <section aria-label="Current Meteorological Conditions" className="w-full mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Current Meteorological Conditions
        </h3>
        <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
          Source: Open-Meteo Weather Model
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 shrink-0">
            <ThermometerIcon size={20} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">Temperature</p>
            <p className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {weather.temperature}°C
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 shrink-0">
            <DropletsIcon size={20} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">Relative Humidity</p>
            <p className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {weather.humidity}%
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400 shrink-0">
            <WindIcon size={20} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">Wind Speed</p>
            <p className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {weather.windSpeed}{' '}
              <span className="text-xs font-normal text-zinc-600 dark:text-zinc-400">km/h</span>
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 shrink-0">
            <CompassIcon size={20} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">Wind Direction</p>
            <p className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {getWindCardinal(weather.windDirection)}{' '}
              <span className="text-xs font-normal text-zinc-600 dark:text-zinc-400">
                ({weather.windDirection}°)
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
