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

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setSearchError(null);
      try {
        const res = await fetch(`/api/location?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setResults(data.data);
          setIsOpen(true);
        } else {
          setResults([]);
          if (data.error) setSearchError(data.error);
        }
      } catch {
        setSearchError('Network error searching location');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

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
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <MapPinIcon size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {currentLocation.name}
                </h1>
                {currentLocation.countryCode && (
                  <span className="text-xs px-2 py-0.5 font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-md">
                    {currentLocation.countryCode}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {currentLocation.admin1 ? `${currentLocation.admin1}, ` : ''}
                {currentLocation.country} • {currentLocation.latitude.toFixed(2)}°N,{' '}
                {currentLocation.longitude.toFixed(2)}°E
              </p>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 sm:px-3 sm:py-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl transition-all flex items-center gap-1.5 text-xs font-medium disabled:opacity-50"
            title="Refresh latest air data"
          >
            <RefreshIcon
              size={15}
              className={isRefreshing ? 'animate-spin text-emerald-600' : ''}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Search input with autocomplete */}
        <div className="relative w-full lg:w-80" ref={dropdownRef}>
          <div className="relative">
            <SearchIcon
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              placeholder="Search city (e.g. Pune, Jaipur)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (results.length > 0) setIsOpen(true);
              }}
              className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/70 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
            />
            {isLoading && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <RefreshIcon size={14} className="animate-spin text-zinc-400" />
              </div>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isOpen && results.length > 0 && (
            <div className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto">
              {results.map((loc) => (
                <button
                  key={`${loc.id}-${loc.latitude}-${loc.longitude}`}
                  onClick={() => handleSelect(loc)}
                  className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {loc.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {loc.admin1 ? `${loc.admin1}, ` : ''}
                      {loc.country}
                    </p>
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">
                    {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                  </span>
                </button>
              ))}
            </div>
          )}

          {isOpen && query.length >= 2 && !isLoading && results.length === 0 && (
            <div className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-center text-xs text-zinc-500 shadow-lg">
              {searchError || 'No locations found'}
            </div>
          )}
        </div>
      </div>

      {/* Preset Indian Metros Quick Picks */}
      <div className="mt-3.5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center gap-1.5 sm:gap-2">
        <span className="text-xs font-medium text-zinc-400 mr-1">Quick Select:</span>
        {PRESET_CITIES.map((city) => {
          const isSelected = currentLocation.name.toLowerCase() === city.name.toLowerCase();
          return (
            <button
              key={city.id}
              onClick={() => handleSelect(city)}
              className={`text-xs px-2.5 py-1 rounded-lg transition-all font-medium ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-xs'
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
