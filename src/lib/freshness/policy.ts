// AirAware AI V2 — Freshness Policy

import { FreshnessStatus, DataType } from '../types';
import { CONFIG } from '../config';

export function calculateFreshness(
  observedAt: string,
  dataType: DataType = 'MODEL_ESTIMATE'
): { status: FreshnessStatus; ageMs: number; humanAge: string } {
  const observedTime = new Date(observedAt).getTime();
  if (isNaN(observedTime)) {
    return { status: 'UNAVAILABLE', ageMs: Infinity, humanAge: 'Unknown date' };
  }

  const now = Date.now();
  const ageMs = Math.max(0, now - observedTime);

  // Human readable age
  const minutes = Math.floor(ageMs / (60 * 1000));
  const hours = Math.floor(minutes / 60);

  let humanAge: string;
  if (minutes < 1) {
    humanAge = 'Just now';
  } else if (minutes < 60) {
    humanAge = `${minutes} min ago`;
  } else if (hours < 24) {
    const remMin = minutes % 60;
    humanAge = remMin > 0 ? `${hours}h ${remMin}m ago` : `${hours}h ago`;
  } else {
    const days = Math.floor(hours / 24);
    humanAge = `${days}d ago`;
  }

  // Model-estimate thresholds
  let status: FreshnessStatus;
  if (ageMs <= CONFIG.freshness.modelFresh) {
    status = 'FRESH';
  } else if (ageMs <= CONFIG.freshness.modelStale) {
    status = 'STALE';
  } else {
    status = 'EXPIRED';
  }

  return { status, ageMs, humanAge };
}
