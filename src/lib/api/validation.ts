// AirAware AI V2 — Centralized API Request Validation & Safe Error Responses

import { NextRequest, NextResponse } from 'next/server';
import {
  ActivityType,
  AirSnapshot,
  ApiResponse,
  IndoorEnvironmentSetup,
  Language,
  PollutantId,
  ProfileCategory,
} from '../types';
import { CONFIG } from '../config';
import { ProviderError } from '../errors/providerError';
import { DEFAULT_INDOOR_SETUP } from '../rules/indoorAdvisorRules';

export class RequestValidationError extends Error {
  public readonly statusCode = 400;

  constructor(message: string) {
    super(message);
    this.name = 'RequestValidationError';
  }
}

const VALID_CATEGORIES: ReadonlySet<ProfileCategory> = new Set([
  'CHILD',
  'TEEN',
  'ADULT',
  'SENIOR',
]);
const VALID_LANGUAGES: ReadonlySet<Language> = new Set(['en', 'ta', 'hi']);
const VALID_ACTIVITIES: ReadonlySet<ActivityType> = new Set([
  'WALKING',
  'OUTDOOR_RECREATION',
  'CYCLING',
  'GENERAL',
]);
const VALID_POLLUTANTS: ReadonlySet<PollutantId> = new Set([
  'pm2_5',
  'pm10',
  'co',
  'no2',
  'so2',
  'o3',
]);
const STRICT_NUMBER_RE = /^-?\d+(?:\.\d+)?$/;
const SAFE_TIMEZONE_RE = /^(auto|[A-Za-z_+-]+(?:\/[A-Za-z0-9_+-]+){0,2})$/;
const MAX_QUESTION_LENGTH = 1000;
const MAX_LOCATION_NAME_LENGTH = 100;

/** Safely parse a JSON request body, throwing RequestValidationError on malformed JSON. */
export async function parseJsonBody<T>(request: NextRequest): Promise<T> {
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new RequestValidationError('Request body must be a JSON object.');
    }
    return parsed as T;
  } catch (err: unknown) {
    if (err instanceof RequestValidationError) throw err;
    throw new RequestValidationError('Invalid JSON request payload.');
  }
}

/** Strictly parse and validate lat/lon query parameters. */
export function parseCoordinates(
  latStr: string | null,
  lonStr: string | null
): { lat: number; lon: number } {
  if (!latStr || !lonStr) {
    throw new RequestValidationError('Missing required parameters "lat" and "lon".');
  }

  const trimmedLat = latStr.trim();
  const trimmedLon = lonStr.trim();
  if (!STRICT_NUMBER_RE.test(trimmedLat) || !STRICT_NUMBER_RE.test(trimmedLon)) {
    throw new RequestValidationError('Coordinates must be finite decimal numbers.');
  }

  const lat = Number(trimmedLat);
  const lon = Number(trimmedLon);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < CONFIG.coordinates.minLat ||
    lat > CONFIG.coordinates.maxLat ||
    lon < CONFIG.coordinates.minLon ||
    lon > CONFIG.coordinates.maxLon
  ) {
    throw new RequestValidationError(
      'Invalid coordinates provided. Latitude must be between -90 and 90, Longitude between -180 and 180.'
    );
  }

  return { lat, lon };
}

/** Sanitize display location name to strip control chars and limit length. */
export function sanitizeLocationName(raw: string | null | undefined): string {
  if (!raw || typeof raw !== 'string') return 'Selected Location';
  const cleaned = raw.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, MAX_LOCATION_NAME_LENGTH);
  return cleaned || 'Selected Location';
}

/** Validate timezone parameter against safe IANA / auto patterns. */
export function sanitizeTimezone(raw: string | null | undefined): string {
  if (!raw || typeof raw !== 'string') return 'auto';
  const trimmed = raw.trim();
  return SAFE_TIMEZONE_RE.test(trimmed) ? trimmed : 'auto';
}

/** Parse and validate profile category with default fallback. */
export function parseProfileCategory(
  raw: unknown,
  fallback: ProfileCategory = 'ADULT'
): ProfileCategory {
  if (raw === undefined || raw === null) return fallback;
  if (typeof raw === 'string' && VALID_CATEGORIES.has(raw as ProfileCategory)) {
    return raw as ProfileCategory;
  }
  throw new RequestValidationError('Invalid profileCategory. Expected CHILD, TEEN, ADULT, or SENIOR.');
}

/** Parse and validate UI language with default fallback. */
export function parseLanguage(raw: unknown, fallback: Language = 'en'): Language {
  if (raw === undefined || raw === null) return fallback;
  if (typeof raw === 'string' && VALID_LANGUAGES.has(raw as Language)) {
    return raw as Language;
  }
  throw new RequestValidationError('Invalid language. Expected en, ta, or hi.');
}

/** Parse and validate outdoor activity type with default fallback. */
export function parseActivity(raw: unknown, fallback: ActivityType = 'WALKING'): ActivityType {
  if (raw === undefined || raw === null) return fallback;
  if (typeof raw === 'string' && VALID_ACTIVITIES.has(raw as ActivityType)) {
    return raw as ActivityType;
  }
  throw new RequestValidationError(
    'Invalid activity. Expected WALKING, OUTDOOR_RECREATION, CYCLING, or GENERAL.'
  );
}

/** Validate and bound user question text for /api/chat. */
export function parseChatQuestion(raw: unknown): string {
  if (typeof raw !== 'string') {
    throw new RequestValidationError('Question message must be a non-empty string.');
  }
  const cleaned = raw.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '').trim();
  if (cleaned.length === 0) {
    throw new RequestValidationError('Question message cannot be empty.');
  }
  if (cleaned.length > MAX_QUESTION_LENGTH) {
    throw new RequestValidationError(`Question cannot exceed ${MAX_QUESTION_LENGTH} characters.`);
  }
  return cleaned;
}

/** Validate snapshot structure for /api/explain and /api/chat. */
export function assertValidSnapshot(raw: unknown): asserts raw is AirSnapshot {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new RequestValidationError('Missing required environmental snapshot data.');
  }
  const snap = raw as Partial<AirSnapshot>;
  if (!Array.isArray(snap.current)) {
    throw new RequestValidationError('Missing required environmental snapshot data.');
  }
}

/** Validate and normalize an IndoorEnvironmentSetup object against allowlisted values. */
export function parseIndoorSetup(raw: unknown): IndoorEnvironmentSetup {
  if (raw === undefined || raw === null) {
    return { ...DEFAULT_INDOOR_SETUP };
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    throw new RequestValidationError('Invalid indoor setup object.');
  }
  const src = raw as Record<string, unknown>;
  const pick = <T extends string>(val: unknown, allowed: readonly T[]): T | null => {
    if (val === undefined || val === null) return null;
    if (typeof val === 'string' && (allowed as readonly string[]).includes(val)) {
      return val as T;
    }
    throw new RequestValidationError('Invalid indoor setup option value.');
  };

  return {
    naturallyVentilated: pick(src.naturallyVentilated, ['YES', 'NO', 'PARTIAL'] as const),
    windowsStatus: pick(src.windowsStatus, ['OPEN', 'CLOSED', 'TIME_DEPENDENT'] as const),
    cookingNearby: pick(src.cookingNearby, ['YES', 'NO', 'OCCASIONALLY'] as const),
    visibleDustOrSmoke: pick(src.visibleDustOrSmoke, ['YES', 'NO', 'SOMETIMES'] as const),
    airPurifierAvailable: pick(src.airPurifierAvailable, ['YES', 'NO'] as const),
    roadFacingArea: pick(src.roadFacingArea, ['YES', 'NO'] as const),
  };
}

/** Parse optional pollutant ID or return null. */
export function parseOptionalPollutant(raw: unknown): PollutantId | null {
  if (raw === undefined || raw === null) return null;
  if (typeof raw === 'string' && VALID_POLLUTANTS.has(raw as PollutantId)) {
    return raw as PollutantId;
  }
  throw new RequestValidationError('Invalid dominantPollutant identifier.');
}

/** Build a standardized, safe NextResponse error without leaking internal stack or system details. */
export function handleRouteError<T>(
  routeName: string,
  error: unknown,
  fallbackMessage: string
): NextResponse<ApiResponse<T>> {
  // Let Next.js handle internal control-flow / prerender bailout signals natively
  if (
    error instanceof Error &&
    (error.message.includes('bail out of prerendering') ||
      ('digest' in error && typeof (error as { digest?: unknown }).digest === 'string'))
  ) {
    throw error;
  }

  const fetchedAt = new Date().toISOString();

  if (error instanceof RequestValidationError) {
    return NextResponse.json<ApiResponse<T>>(
      { success: false, error: error.message, fetchedAt },
      { status: 400 }
    );
  }

  if (error instanceof ProviderError) {
    const status =
      error.statusCode && error.statusCode >= 400 && error.statusCode < 600
        ? error.statusCode
        : error.code === 'INVALID_COORDINATES'
        ? 400
        : 502;
    return NextResponse.json<ApiResponse<T>>(
      { success: false, error: error.message, fetchedAt },
      { status }
    );
  }

  console.error(`[API ${routeName} Error]:`, error instanceof Error ? error.message : 'Unknown error');
  return NextResponse.json<ApiResponse<T>>(
    { success: false, error: fallbackMessage, fetchedAt },
    { status: 500 }
  );
}
