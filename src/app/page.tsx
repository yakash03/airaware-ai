'use client';

import React, { useState, useEffect } from 'react';
import {
  GeoLocation,
  AirSnapshot,
  ApiResponse,
  FamilyProfile,
  Language,
  TextSize,
} from '@/lib/types';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { DEFAULT_FAMILY_PROFILES } from '@/lib/constants/defaultProfiles';
import { useLocalStorageState } from '@/lib/hooks/useLocalStorageState';
import { LocationSearch } from '@/components/dashboard/LocationSearch';
import { AqiOverviewCard } from '@/components/dashboard/AqiOverviewCard';
import { PollutantGrid } from '@/components/dashboard/PollutantGrid';
import { WeatherOverview } from '@/components/dashboard/WeatherOverview';
import { HourlyForecastTimeline } from '@/components/dashboard/HourlyForecastTimeline';
import { ScaleExplanationModal } from '@/components/dashboard/ScaleExplanationModal';
import { ProfileManager, validateStoredProfiles } from '@/components/profiles/ProfileManager';
import { FamilyDashboard } from '@/components/dashboard/FamilyDashboard';
import { BestWindowPlanner } from '@/components/planner/BestWindowPlanner';
import { IndoorAirAdvisor } from '@/components/indoor/IndoorAirAdvisor';
import { AskAirAwareChat } from '@/components/chat/AskAirAwareChat';
import { AccessibilityToolbar } from '@/components/dashboard/AccessibilityToolbar';
import { RefreshIcon, AlertCircleIcon } from '@/components/ui/Icons';

const DEFAULT_LOCATION: GeoLocation = {
  id: 1264527,
  name: 'Chennai',
  latitude: 13.08784,
  longitude: 80.27847,
  country: 'India',
  admin1: 'Tamil Nadu',
  timezone: 'Asia/Kolkata',
  countryCode: 'IN',
};

export default function DashboardPage() {
  const [currentLocation, setCurrentLocation] = useState<GeoLocation>(DEFAULT_LOCATION);
  const [snapshot, setSnapshot] = useState<AirSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState<number>(0);
  const [isScaleModalOpen, setIsScaleModalOpen] = useState<boolean>(false);

  const [language, setLanguage] = useState<Language>('en');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [textSize, setTextSize] = useState<TextSize>('normal');

  const [profiles] = useLocalStorageState<FamilyProfile[]>(
    'airaware_family_profiles',
    DEFAULT_FAMILY_PROFILES,
    validateStoredProfiles
  );
  const [activeProfile, setActiveProfile] = useState<FamilyProfile>(DEFAULT_FAMILY_PROFILES[0]);

  const t = TRANSLATIONS[language];

  // Fetch verified air data cleanly on location or manual refresh change without synchronous setState in effect
  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function fetchLocationAirData() {
      const forceRefresh = refreshTick > 0;
      try {
        const queryParams = new URLSearchParams({
          lat: currentLocation.latitude.toString(),
          lon: currentLocation.longitude.toString(),
          name: currentLocation.name,
          timezone: currentLocation.timezone || 'Asia/Kolkata',
          ...(forceRefresh ? { refresh: 'true' } : {}),
        });

        const res = await fetch(`/api/air?${queryParams.toString()}`, {
          signal: controller.signal,
        });
        const result = (await res.json()) as ApiResponse<AirSnapshot>;

        if (!active) return;

        if (result.success && result.data) {
          setSnapshot(result.data);
          setError(null);
        } else {
          setError(result.error || 'Failed to retrieve real-time air quality information.');
        }
      } catch (err: unknown) {
        if (!active || (err instanceof Error && err.name === 'AbortError')) return;
        setError(
          err instanceof Error
            ? err.message
            : 'Network connection error while contacting environmental servers.'
        );
      } finally {
        if (active) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    fetchLocationAirData();

    return () => {
      active = false;
      controller.abort();
    };
  }, [currentLocation, refreshTick]);

  const handleSelectLocation = (loc: GeoLocation) => {
    setIsLoading(true);
    setError(null);
    setCurrentLocation(loc);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setError(null);
    setRefreshTick((prev) => prev + 1);
  };

  const handleSelectProfile = (p: FamilyProfile) => {
    setActiveProfile(p);
    if (p.category === 'SENIOR' && p.accessibility?.highContrast) {
      setHighContrast(true);
      setTextSize('large');
    }
  };

  const textSizeClass =
    textSize === 'extra-large'
      ? 'text-lg [&_p]:text-base [&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl'
      : textSize === 'large'
      ? 'text-base [&_p]:text-sm [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg'
      : 'text-sm';

  const contrastClass = highContrast
    ? 'contrast-125 dark:contrast-150 font-medium bg-[#f5f5f4] dark:bg-[#000000]'
    : 'bg-[#fafaf9] dark:bg-[#121212]';

  return (
    <div
      lang={language}
      className={`min-h-screen text-zinc-900 dark:text-zinc-100 flex flex-col font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900 ${contrastClass} ${textSizeClass}`}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-700 focus:text-white focus:rounded-xl focus:font-bold"
      >
        Skip to main content
      </a>

      {/* Top Application Header */}
      <header className="border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-black text-sm tracking-tighter shadow-xs"
            >
              A²
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-zinc-900 dark:text-zinc-100">
                  {t.appName}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {t.cpcbScaleName}
                </span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">{t.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsScaleModalOpen(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300 cursor-pointer"
            >
              {t.scaleGuideBtn}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <AccessibilityToolbar
          language={language}
          onLanguageChange={(l) => setLanguage(l)}
          highContrast={highContrast}
          onToggleHighContrast={() => setHighContrast(!highContrast)}
          textSize={textSize}
          onTextSizeChange={(s) => setTextSize(s)}
        />

        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            {t.subHeaderTitle}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
            {t.subHeaderSubtitle}
          </p>
        </div>

        <LocationSearch
          currentLocation={currentLocation}
          onSelectLocation={handleSelectLocation}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Loading State */}
        {isLoading && (
          <div
            role="status"
            aria-live="polite"
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center shadow-xs space-y-4 my-8"
          >
            <div className="inline-flex p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 animate-spin">
              <RefreshIcon size={32} aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Retrieving Verified Air Data
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                Contacting Open-Meteo CAMS atmospheric servers for {currentLocation.name}...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div
            role="alert"
            className="w-full bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-3xl p-8 sm:p-10 shadow-xs my-6 text-center space-y-4"
          >
            <div className="inline-flex p-3 rounded-2xl bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400">
              <AlertCircleIcon size={32} aria-hidden="true" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">
                Unable to Load Environmental Data
              </h3>
              <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">{error}</p>
            </div>
            <div>
              <button
                type="button"
                onClick={handleRefresh}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* Loaded State */}
        {!isLoading && !error && snapshot && (
          <div className="space-y-6">
            <AqiOverviewCard
              snapshot={snapshot}
              onOpenScaleModal={() => setIsScaleModalOpen(true)}
            />

            <ProfileManager
              language={language}
              activeProfileId={activeProfile.id}
              onSelectProfile={handleSelectProfile}
            />

            <FamilyDashboard
              snapshot={snapshot}
              profiles={profiles}
              language={language}
              activeProfileId={activeProfile.id}
              onSelectProfile={handleSelectProfile}
            />

            <BestWindowPlanner
              hourlyForecast={snapshot.hourlyForecast}
              activeProfile={activeProfile}
              language={language}
              locationName={currentLocation.name}
            />

            <IndoorAirAdvisor
              snapshot={snapshot}
              activeProfile={activeProfile}
              language={language}
              locationName={currentLocation.name}
            />

            <AskAirAwareChat
              snapshot={snapshot}
              activeProfile={activeProfile}
              language={language}
            />

            <PollutantGrid
              measurements={snapshot.current}
              computedAqi={snapshot.computedAqi}
            />

            <WeatherOverview weather={snapshot.weather} />

            <HourlyForecastTimeline forecast={snapshot.hourlyForecast} />
          </div>
        )}
      </main>

      <ScaleExplanationModal
        isOpen={isScaleModalOpen}
        onClose={() => setIsScaleModalOpen(false)}
      />

      {/* Transparent Attribution Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-6 mt-12 text-xs text-zinc-600 dark:text-zinc-400">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-zinc-800 dark:text-zinc-200">
              AirAware AI V2 — &ldquo;Air for Every Age&rdquo; • Production Release
            </p>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
              Environmental data provided by{' '}
              <a
                href="https://open-meteo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-emerald-700 dark:hover:text-emerald-400"
              >
                Open-Meteo.com
              </a>{' '}
              under CC BY 4.0. CPCB NAQI computed deterministically. Zero health diagnoses.
            </p>
          </div>

          <div className="text-[11px] text-zinc-600 dark:text-zinc-400 font-mono">
            Verified Endpoints • Transparent Provenance
          </div>
        </div>
      </footer>
    </div>
  );
}
