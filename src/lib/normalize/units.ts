// AirAware AI V2 — Unit Conversions and Sanitization

import { PollutantId } from '../types';

/**
 * Standard units used across AirAware
 */
export const POLLUTANT_METADATA: Record<
  PollutantId,
  { label: string; formula: string; displayUnit: string; cpcbUnit: string }
> = {
  pm2_5: {
    label: 'Particulate Matter 2.5',
    formula: 'PM₂.₅',
    displayUnit: 'µg/m³',
    cpcbUnit: 'µg/m³',
  },
  pm10: {
    label: 'Particulate Matter 10',
    formula: 'PM₁₀',
    displayUnit: 'µg/m³',
    cpcbUnit: 'µg/m³',
  },
  co: {
    label: 'Carbon Monoxide',
    formula: 'CO',
    displayUnit: 'mg/m³',
    cpcbUnit: 'mg/m³', // CPCB uses mg/m³
  },
  no2: {
    label: 'Nitrogen Dioxide',
    formula: 'NO₂',
    displayUnit: 'µg/m³',
    cpcbUnit: 'µg/m³',
  },
  so2: {
    label: 'Sulphur Dioxide',
    formula: 'SO₂',
    displayUnit: 'µg/m³',
    cpcbUnit: 'µg/m³',
  },
  o3: {
    label: 'Ozone',
    formula: 'O₃',
    displayUnit: 'µg/m³',
    cpcbUnit: 'µg/m³',
  },
};

/**
 * Convert Open-Meteo raw pollutant value to display and CPCB calculation value.
 * Open-Meteo returns carbon monoxide in µg/m³. CPCB breakpoints require mg/m³.
 */
export function normalizePollutantValue(
  pollutant: PollutantId,
  rawValue: number | null | undefined
): { displayValue: number | null; cpcbValue: number | null; unit: string } {
  if (rawValue === null || rawValue === undefined || isNaN(rawValue) || rawValue < 0) {
    return { displayValue: null, cpcbValue: null, unit: POLLUTANT_METADATA[pollutant].displayUnit };
  }

  if (pollutant === 'co') {
    // Convert µg/m³ to mg/m³ for display and CPCB
    const mgVal = Number((rawValue / 1000).toFixed(2));
    return {
      displayValue: mgVal,
      cpcbValue: mgVal,
      unit: 'mg/m³',
    };
  }

  const rounded = Number(rawValue.toFixed(1));
  return {
    displayValue: rounded,
    cpcbValue: rounded,
    unit: POLLUTANT_METADATA[pollutant].displayUnit,
  };
}
