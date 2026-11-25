// AirAware AI V2 — India National AQI (NAQI) Calculator
// Deterministic implementation according to CPCB guidelines
// Reference: Central Pollution Control Board (CPCB), MoEFCC, Govt of India (2014)

import { PollutantId, ComputedAqi, DataType } from '../types';
import { CPCB_BREAKPOINTS, CPCB_CATEGORIES } from './breakpoints';

export interface PollutantConcentration {
  pollutant: PollutantId;
  value: number; // Standard units: PM2.5, PM10, NO2, SO2, O3 in µg/m³; CO in mg/m³
}

/**
 * Calculate an individual pollutant sub-index using the CPCB linear interpolation formula:
 * Ip = [ (I_HI - I_LO) / (B_HI - B_LO) ] * (Cp - B_LO) + I_LO
 */
export function calculateSubIndex(pollutant: PollutantId, concentration: number): number | null {
  if (!Number.isFinite(concentration) || concentration < 0) {
    return null;
  }

  const ranges = CPCB_BREAKPOINTS[pollutant];
  if (!ranges || ranges.length === 0) return null;

  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i];

    if (concentration >= range.concLow && concentration <= range.concHigh) {
      const concDiff = range.concHigh - range.concLow;
      if (concDiff === 0) return range.aqiLow;

      const aqiDiff = range.aqiHigh - range.aqiLow;
      const subIndex = (aqiDiff / concDiff) * (concentration - range.concLow) + range.aqiLow;
      return Math.round(subIndex);
    }

    // Bridge discrete CPCB decimal gaps (e.g. 30 < concentration < 31) continuously
    const nextRange = ranges[i + 1];
    if (nextRange && concentration > range.concHigh && concentration < nextRange.concLow) {
      const gapSpan = nextRange.concLow - range.concHigh;
      const aqiSpan = nextRange.aqiLow - range.aqiHigh;
      const bridged = range.aqiHigh + (aqiSpan / gapSpan) * (concentration - range.concHigh);
      return Math.round(bridged);
    }
  }

  const highestRange = ranges[ranges.length - 1];
  if (concentration > highestRange.concHigh) {
    return 500;
  }

  return null;
}

/**
 * Compute India NAQI following official CPCB rules:
 * - Data sufficiency: Requires at least 3 valid pollutants
 * - Mandatory requirement: At least one must be PM2.5 or PM10
 * - Overall AQI = max(sub-indices)
 */
export function computeIndiaNaqi(
  pollutants: PollutantConcentration[],
  dataType: DataType = 'MODEL_ESTIMATE',
  sourceName: string = 'Open-Meteo CAMS'
): ComputedAqi {
  const subIndices: Partial<Record<PollutantId, number>> = {};
  let validCount = 0;
  let hasPm = false;

  for (const item of pollutants) {
    const sub = calculateSubIndex(item.pollutant, item.value);
    if (sub !== null) {
      subIndices[item.pollutant] = sub;
      validCount++;
      if (item.pollutant === 'pm2_5' || item.pollutant === 'pm10') {
        hasPm = true;
      }
    }
  }

  const dataSufficient = validCount >= 3 && hasPm;

  if (!dataSufficient) {
    return {
      standard: 'IN_NAQI',
      value: null,
      category: null,
      categoryColor: null,
      categoryTextColor: null,
      dominantPollutant: null,
      subIndices,
      method: `CPCB formula on ${sourceName} (Insufficient data: need ≥3 pollutants including PM2.5 or PM10)`,
      dataType,
      pollutantCount: validCount,
      hasPm,
      dataSufficient: false,
    };
  }

  let maxValue = -1;
  let dominant: PollutantId | null = null;

  for (const [pol, sub] of Object.entries(subIndices) as [PollutantId, number][]) {
    if (sub > maxValue) {
      maxValue = sub;
      dominant = pol;
    }
  }

  const matchedCategory =
    CPCB_CATEGORIES.find((c) => maxValue >= c.aqiLow && maxValue <= c.aqiHigh) ??
    CPCB_CATEGORIES[CPCB_CATEGORIES.length - 1];

  return {
    standard: 'IN_NAQI',
    value: maxValue,
    category: matchedCategory.name,
    categoryColor: matchedCategory.color,
    categoryTextColor: matchedCategory.textColor,
    dominantPollutant: dominant,
    subIndices,
    method: `Computed by AirAware using official CPCB breakpoints from ${sourceName} concentrations`,
    dataType,
    pollutantCount: validCount,
    hasPm,
    dataSufficient: true,
  };
}
