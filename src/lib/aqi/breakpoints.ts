// AirAware AI V2 — Official AQI Breakpoints
// CPCB (Central Pollution Control Board, India) National AQI Breakpoints (October 2014)
// URL: https://cpcb.nic.in/AQI/AQI-Booklet.pdf

import { PollutantId } from '../types';

export interface BreakpointRange {
  aqiLow: number;
  aqiHigh: number;
  concLow: number;
  concHigh: number;
}

export interface AqiCategory {
  name: string;
  aqiLow: number;
  aqiHigh: number;
  color: string;
  textColor: string;
  description: string;
}

// 6 Official CPCB Categories
export const CPCB_CATEGORIES: AqiCategory[] = [
  {
    name: 'Good',
    aqiLow: 0,
    aqiHigh: 50,
    color: '#16a34a', // green-600
    textColor: '#ffffff',
    description: 'Minimal impact',
  },
  {
    name: 'Satisfactory',
    aqiLow: 51,
    aqiHigh: 100,
    color: '#84cc16', // lime-500
    textColor: '#1f2937',
    description: 'Minor breathing discomfort to sensitive people',
  },
  {
    name: 'Moderate',
    aqiLow: 101,
    aqiHigh: 200,
    color: '#eab308', // yellow-500
    textColor: '#1f2937',
    description: 'Breathing discomfort to people with lung, heart disease, children and older adults',
  },
  {
    name: 'Poor',
    aqiLow: 201,
    aqiHigh: 300,
    color: '#f97316', // orange-500
    textColor: '#ffffff',
    description: 'Breathing discomfort to most people on prolonged exposure',
  },
  {
    name: 'Very Poor',
    aqiLow: 301,
    aqiHigh: 400,
    color: '#ef4444', // red-500
    textColor: '#ffffff',
    description: 'Respiratory illness on prolonged exposure',
  },
  {
    name: 'Severe',
    aqiLow: 401,
    aqiHigh: 500,
    color: '#7f1d1d', // red-900 / maroon
    textColor: '#ffffff',
    description: 'Affects healthy people and seriously impacts those with existing diseases',
  },
];

/**
 * CPCB Breakpoints Table:
 * Pollutant concentrations:
 * - PM2.5, PM10, NO2, SO2, O3 are in µg/m³
 * - CO is in mg/m³ (Note: Open-Meteo returns µg/m³, must be converted to mg/m³)
 */
export const CPCB_BREAKPOINTS: Record<PollutantId, BreakpointRange[]> = {
  pm2_5: [
    { aqiLow: 0, aqiHigh: 50, concLow: 0, concHigh: 30 },
    { aqiLow: 51, aqiHigh: 100, concLow: 31, concHigh: 60 },
    { aqiLow: 101, aqiHigh: 200, concLow: 61, concHigh: 90 },
    { aqiLow: 201, aqiHigh: 300, concLow: 91, concHigh: 120 },
    { aqiLow: 301, aqiHigh: 400, concLow: 121, concHigh: 250 },
    { aqiLow: 401, aqiHigh: 500, concLow: 250.1, concHigh: 350 }, // Extended above 250
  ],
  pm10: [
    { aqiLow: 0, aqiHigh: 50, concLow: 0, concHigh: 50 },
    { aqiLow: 51, aqiHigh: 100, concLow: 51, concHigh: 100 },
    { aqiLow: 101, aqiHigh: 200, concLow: 101, concHigh: 250 },
    { aqiLow: 201, aqiHigh: 300, concLow: 251, concHigh: 350 },
    { aqiLow: 301, aqiHigh: 400, concLow: 351, concHigh: 430 },
    { aqiLow: 401, aqiHigh: 500, concLow: 430.1, concHigh: 500 },
  ],
  no2: [
    { aqiLow: 0, aqiHigh: 50, concLow: 0, concHigh: 40 },
    { aqiLow: 51, aqiHigh: 100, concLow: 41, concHigh: 80 },
    { aqiLow: 101, aqiHigh: 200, concLow: 81, concHigh: 180 },
    { aqiLow: 201, aqiHigh: 300, concLow: 181, concHigh: 280 },
    { aqiLow: 301, aqiHigh: 400, concLow: 281, concHigh: 400 },
    { aqiLow: 401, aqiHigh: 500, concLow: 400.1, concHigh: 500 },
  ],
  so2: [
    { aqiLow: 0, aqiHigh: 50, concLow: 0, concHigh: 40 },
    { aqiLow: 51, aqiHigh: 100, concLow: 41, concHigh: 80 },
    { aqiLow: 101, aqiHigh: 200, concLow: 81, concHigh: 380 },
    { aqiLow: 201, aqiHigh: 300, concLow: 381, concHigh: 800 },
    { aqiLow: 301, aqiHigh: 400, concLow: 801, concHigh: 1600 },
    { aqiLow: 401, aqiHigh: 500, concLow: 1600.1, concHigh: 2000 },
  ],
  co: [
    // In mg/m³
    { aqiLow: 0, aqiHigh: 50, concLow: 0, concHigh: 1.0 },
    { aqiLow: 51, aqiHigh: 100, concLow: 1.1, concHigh: 2.0 },
    { aqiLow: 101, aqiHigh: 200, concLow: 2.1, concHigh: 10.0 },
    { aqiLow: 201, aqiHigh: 300, concLow: 10.1, concHigh: 17.0 },
    { aqiLow: 301, aqiHigh: 400, concLow: 17.1, concHigh: 34.0 },
    { aqiLow: 401, aqiHigh: 500, concLow: 34.1, concHigh: 50.0 },
  ],
  o3: [
    // 8-hour ozone in µg/m³
    { aqiLow: 0, aqiHigh: 50, concLow: 0, concHigh: 50 },
    { aqiLow: 51, aqiHigh: 100, concLow: 51, concHigh: 100 },
    { aqiLow: 101, aqiHigh: 200, concLow: 101, concHigh: 168 },
    { aqiLow: 201, aqiHigh: 300, concLow: 169, concHigh: 208 },
    { aqiLow: 301, aqiHigh: 400, concLow: 209, concHigh: 748 },
    { aqiLow: 401, aqiHigh: 500, concLow: 748.1, concHigh: 1000 },
  ],
};
