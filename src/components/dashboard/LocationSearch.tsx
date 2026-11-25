'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GeoLocation } from '@/lib/types';
import { SearchIcon, RefreshIcon, MapPinIcon } from '../ui/Icons';

interface LocationSearchProps {
  currentLocation: GeoLocation;
  onSelectLocation: (loc: GeoLocation) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const PRESET_CITIES: GeoLocation[] = [
  {
    id: 1264527,
    name: 'Chennai',
    latitude: 13.08784,
    longitude: 80.27847,
    country: 'India',
    admin1: 'Tamil Nadu',
    timezone: 'Asia/Kolkata',
    countryCode: 'IN',
  },
  {
    id: 1273294,
    name: 'Delhi',
    latitude: 28.65195,
    longitude: 77.23149,
    country: 'India',
    admin1: 'Delhi',
    timezone: 'Asia/Kolkata',
    countryCode: 'IN',
  },
  {
    id: 1275339,
    name: 'Mumbai',
    latitude: 19.07283,
    longitude: 72.88261,
    country: 'India',
    admin1: 'Maharashtra',
    timezone: 'Asia/Kolkata',
    countryCode: 'IN',
  },
  {
    id: 1277333,
    name: 'Bengaluru',
    latitude: 12.97194,
    longitude: 77.59369,
    country: 'India',
    admin1: 'Karnataka',
    timezone: 'Asia/Kolkata',
    countryCode: 'IN',
  },
  {
    id: 1275004,
    name: 'Kolkata',
    latitude: 22.56263,
    longitude: 88.36304,
    country: 'India',
    admin1: 'West Bengal',
    timezone: 'Asia/Kolkata',
    countryCode: 'IN',
  },
];

export function LocationSearch({
  currentLocation,
  onSelectLocation,
  onRefresh,
  isRefreshing,
}: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search (state reset handled cleanly in input handler to avoid cascading renders)
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setSearchError(null);
      try {
        const res = await fetch(`/api/location?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setResults(data.data);
          setIsOpen(true);
        } else {
          setResults([]);
          if (data.error) setSearchError(data.error);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setSearchError('Network error searching location');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleQueryChange = (nextValue: string) => {
    setQuery(nextValue);
    if (nextValue.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      setSearchError(null);
      setIsOpen(false);
    }
  };

  const handleSelect = (loc: GeoLocation) => {
    onSelectLocation(loc);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Current Location Badge & Refresh */}
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-xl">
              <MapPinIcon size={20} aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {currentLocation.name}
                </h1>
                {currentLocation.countryCode && (
                  <span className="text-xs px-2 py-0.5 font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md">
                    {currentLocation.countryCode}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {currentLocation.admin1 ? `${currentLocation.admin1}, ` : ''}
                {currentLocation.country} • {currentLocation.latitude.toFixed(2)}°N,{' '}
                {currentLocation.longitude.toFixed(2)}°E
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Refresh latest air quality data"
            className="p-2 sm:px-3 sm:py-2 text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl transition-all flex items-center gap-1.5 text-xs font-medium disabled:opacity-50 cursor-pointer"
            title="Refresh latest air data"
          >
            <RefreshIcon
              size={15}
              aria-hidden="true"
              className={isRefreshing ? 'animate-spin text-emerald-700' : ''}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Search input with autocomplete */}
        <div className="relative w-full lg:w-80" ref={dropdownRef}>
          <div className="relative">
            <SearchIcon
              size={16}
              aria-hidden="true"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              role="combobox"
              aria-label="Search city location"
              aria-expanded={isOpen && results.length > 0}
              aria-controls="location-results-listbox"
              aria-autocomplete="list"
              placeholder="Search city (e.g. Pune, Jaipur)..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => {
                if (results.length > 0) setIsOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsOpen(false);
              }}
              className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/70 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 focus:border-emerald-600 transition-all"
            />
            {isLoading && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2" aria-label="Searching locations">
                <RefreshIcon size={14} className="animate-spin text-zinc-500" aria-hidden="true" />
              </div>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isOpen && results.length > 0 && (
            <div
              id="location-results-listbox"
              role="listbox"
              aria-label="Matching cities"
              className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto"
            >
              {results.map((loc) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={currentLocation.id === loc.id}
                  key={`${loc.id}-${loc.latitude}-${loc.longitude}`}
                  onClick={() => handleSelect(loc)}
                  className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50 last:border-0 cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {loc.name}
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {loc.admin1 ? `${loc.admin1}, ` : ''}
                      {loc.country}
                    </p>
                  </div>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                    {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                  </span>
                </button>
              ))}
            </div>
          )}

          {isOpen && query.length >= 2 && !isLoading && results.length === 0 && (
            <div
              role="status"
              className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-center text-xs text-zinc-600 dark:text-zinc-400 shadow-lg"
            >
              {searchError || 'No locations found'}
            </div>
          )}
        </div>
      </div>

      {/* Preset Indian Metros Quick Picks */}
      <div
        role="group"
        aria-label="Quick select Indian cities"
        className="mt-3.5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center gap-1.5 sm:gap-2"
      >
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mr-1">
          Quick Select:
        </span>
        {PRESET_CITIES.map((city) => {
          const isSelected = currentLocation.name.toLowerCase() === city.name.toLowerCase();
          return (
            <button
              type="button"
              key={city.id}
              onClick={() => handleSelect(city)}
              aria-pressed={isSelected}
              className={`text-xs px-2.5 py-1 rounded-lg transition-all font-medium cursor-pointer ${
                isSelected
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              {city.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
