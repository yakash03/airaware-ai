// AirAware AI V2 — Core Type Definitions
// Based on Phase 1 Architecture (verified 2026-11-19)

// --- Enums & Literal Types ---

export type DataType = 'MEASURED' | 'MODEL_ESTIMATE' | 'FORECAST';

export type AqiStandard = 'IN_NAQI' | 'US_AQI' | 'EU_AQI';

export type FreshnessStatus = 'FRESH' | 'STALE' | 'EXPIRED' | 'UNAVAILABLE';

export type PollutantId = 'pm2_5' | 'pm10' | 'co' | 'no2' | 'so2' | 'o3';

export type ProfileCategory = 'CHILD' | 'TEEN' | 'ADULT' | 'SENIOR';

export type Language = 'en' | 'ta' | 'hi';

export type TextSize = 'normal' | 'large' | 'extra-large';

export interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: TextSize;
}

export interface FamilyProfile {
  id: string;
  name: string;
  category: ProfileCategory;
  ageRange: string;
  accessibility?: Partial<AccessibilitySettings>;
  avatarColor?: string;
  createdAt: string;
}

export interface AgeExplanation {
  profileId?: string;
  profileCategory: ProfileCategory;
  headline: string;
  summary: string;
  activityGuidance: string;
  pollutantBreakdown: string;
  cautionLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
  language: Language;
  whyAdvice: {
    aqiValue: number | null;
    aqiCategory: string | null;
    dominantPollutant: PollutantId | null;
    dominantPollutantValue?: number;
    dominantPollutantUnit?: string;
    scaleApplied: string;
    dataSource: string;
    dataType: DataType;
    observedAt: string;
    ruleCitation: string;
    deterministicRuleId: string;
    dataLimitations: string[];
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  profileCategory?: ProfileCategory;
  language?: Language;
  groundedFields?: string[];
}

// --- Geocoding ---

export interface GeoLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;        // State / province
  admin2?: string;        // District
  timezone: string;
  population?: number;
  countryCode: string;
}

// --- Measurements ---

export interface Measurement {
  pollutant: PollutantId;
  value: number;
  unit: string;             // 'µg/m³' | 'mg/m³'
  dataType: DataType;
  source: string;           // 'open-meteo'
  observedAt: string;       // ISO 8601
  fetchedAt: string;        // ISO 8601
  location: {
    name: string;
    lat: number;
    lon: number;
  };
  attribution: string;
}

// --- Weather ---

export interface WeatherData {
  temperature: number;      // °C
  humidity: number;         // %
  windSpeed: number;        // km/h
  windDirection: number;    // degrees
  precipitation: number;    // mm
  observedAt: string;       // ISO 8601
  source: string;
  attribution: string;
}

// --- Computed AQI ---

export interface ComputedAqi {
  standard: AqiStandard;
  value: number | null;
  category: string | null;
  categoryColor: string | null;
  categoryTextColor?: string | null;
  dominantPollutant: PollutantId | null;
  subIndices: Partial<Record<PollutantId, number>>;
  method: string;
  dataType: DataType;
  pollutantCount: number;
  hasPm: boolean;
  dataSufficient: boolean;
}

// --- Air Snapshot ---

export interface AirSnapshot {
  current: Measurement[];
  hourlyForecast: HourlySlot[];
  weather: WeatherData | null;
  computedAqi: ComputedAqi | null;
  freshness: FreshnessStatus;
  dataAge: string;
  warnings: string[];
  sources: Array<{
    name: string;
    dataType: DataType;
    attribution: string;
  }>;
  fetchedAt: string;
}

export interface HourlySlot {
  time: string;             // ISO 8601
  measurements: Measurement[];
  computedAqi?: ComputedAqi | null;
  weather?: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
  };
}

// --- Open-Meteo Raw Response Types ---

export interface OpenMeteoAirQualityResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units?: Record<string, string>;
  current?: Record<string, number | string>;
  hourly_units: Record<string, string>;
  hourly: {
    time: string[];
    pm10: (number | null)[];
    pm2_5: (number | null)[];
    carbon_monoxide: (number | null)[];
    nitrogen_dioxide: (number | null)[];
    sulphur_dioxide: (number | null)[];
    ozone: (number | null)[];
    us_aqi: (number | null)[];
    european_aqi: (number | null)[];
  };
}

export interface OpenMeteoWeatherResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  hourly_units: Record<string, string>;
  hourly: {
    time: string[];
    temperature_2m: (number | null)[];
    relative_humidity_2m: (number | null)[];
    wind_speed_10m: (number | null)[];
    wind_direction_10m: (number | null)[];
    precipitation: (number | null)[];
  };
}

export interface OpenMeteoGeocodingResponse {
  results?: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    elevation?: number;
    feature_code?: string;
    country_code: string;
    admin1_id?: number;
    admin2_id?: number;
    timezone: string;
    population?: number;
    country_id?: number;
    country: string;
    admin1?: string;
    admin2?: string;
  }>;
}

// --- API Response Wrapper ---

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  fetchedAt: string;
}

// --- Phase 4: Best Window & Outdoor Activity Planner Types ---

export type ActivityType = 'WALKING' | 'OUTDOOR_RECREATION' | 'CYCLING' | 'GENERAL';

export interface BestWindowRanking {
  id: string;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  timeLabel: string; // e.g. "06:00 - 08:00 AM"
  averageAqi: number | null;
  minAqi: number | null;
  maxAqi: number | null;
  dominantPollutant: PollutantId | null;
  aqiCategory: string | null;
  categoryColor: string | null;
  rank: number; // 1 = comparatively best
  isBestWindow: boolean;
  comparisonReason: string;
  temperatureAvg?: number;
  readingsUsed: {
    pollutant: PollutantId;
    avgValue: number;
    unit: string;
  }[];
  whyThisTime: {
    aqiScale: string;
    dataSource: string;
    forecastTimestamp: string;
    dominantFactor: string;
    comparisonDetail: string;
    limitations: string[];
  };
}

export interface BestWindowPlan {
  location: string;
  fetchedAt: string;
  activity: ActivityType;
  profileCategory: ProfileCategory;
  language: Language;
  rankedWindows: BestWindowRanking[];
  bestWindow: BestWindowRanking | null;
  worstWindow: BestWindowRanking | null;
  selectedHour?: HourlySlot | null;
  ageAdaptedExplanation: {
    headline: string;
    recommendation: string;
    activitySpecificAdvice: string;
    cautionNote: string;
  };
  disclaimer: string;
  dataSufficient: boolean;
}

// --- Phase 5: Indoor Air Advisor Types ---

export interface IndoorEnvironmentSetup {
  naturallyVentilated: 'YES' | 'NO' | 'PARTIAL' | null;
  windowsStatus: 'OPEN' | 'CLOSED' | 'TIME_DEPENDENT' | null;
  cookingNearby: 'YES' | 'NO' | 'OCCASIONALLY' | null;
  visibleDustOrSmoke: 'YES' | 'NO' | 'SOMETIMES' | null;
  airPurifierAvailable: 'YES' | 'NO' | null;
  roadFacingArea: 'YES' | 'NO' | null;
  updatedAt?: string;
}

export type IndoorSuggestionCategory =
  | 'VENTILATION'
  | 'DUST_MANAGEMENT'
  | 'COOKING_EXHAUST'
  | 'PURIFIER_USAGE'
  | 'ROAD_EXPOSURE'
  | 'GENERAL_PRACTICE';

export interface IndoorSuggestion {
  id: string;
  category: IndoorSuggestionCategory;
  title: string;
  advice: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  icon: string;
  ageGuidance: string;
  whySuggestion: {
    outdoorConditionContext: string;
    indoorUserFactor: string;
    reasoning: string;
    outdoorSource: string;
    dataType: DataType;
    whatWeCannotDetermine: string[];
  };
}

export interface IndoorAdvisorPlan {
  location: string;
  fetchedAt: string;
  profileCategory: ProfileCategory;
  language: Language;
  setup: IndoorEnvironmentSetup;
  hasSetup: boolean;
  outdoorAqi: number | null;
  outdoorCategory: string | null;
  dominantPollutant: PollutantId | null;
  suggestions: IndoorSuggestion[];
  familySummary: {
    headline: string;
    overview: string;
    keyAction: string;
  };
  disclaimer: string;
}


