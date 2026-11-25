// AirAware AI V2 — Strict Output Validator
// Enforces:
// 1. Every numeric value in the output must exist in the real input data
// 2. Prohibits medical diagnoses, disease claims, and unqualified "safe/unsafe" assertions
// 3. Preserves chemical formulas (PM2.5, PM10, NO2, SO2, O3) and units (ug/m3) without false positives

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  inventedNumbers?: number[];
  forbiddenPhrasesFound?: string[];
}

const FORBIDDEN_MEDICAL_PATTERNS = [
  /\bdiagnos(is|ed|e)\b/i,
  /\bprescrib(e|ed|tion)\b/i,
  /\bcure(s|d)?\b/i,
  /\btreat(s|ed|ment)\b/i,
  /\bmedical advice\b/i,
  /\bclinical(ly)?\b/i,
  /\bcompletely safe for you\b/i,
  /\bguaranteed safe\b/i,
  /\bunsafe for all\b/i,
  /\byou have (asthma|copd|bronchitis|heart disease)\b/i,
];

const IGNORED_POLICY_NUMBERS = new Set([2014, 2021, 2.5, 10, 24, 8]);

/**
 * Extract quantitative numbers from AI text while ignoring chemical formulas
 * (PM2.5, PM10, NO2, SO2, O3, CO2), scientific units (m3), and policy citation numbers.
 */
export function extractNumbers(text: string): number[] {
  const sanitized = text
    .replace(/\b(?:PM\s*2\.5|PM\s*10|PM2_5|NO2|SO2|O3|CO2)\b/gi, ' ')
    .replace(/\/m3\b/gi, ' ')
    .replace(/\b0\s*[-–]\s*500\b/g, ' ');

  const matches = sanitized.match(/\b\d+(\.\d+)?\b/g) || [];
  const numbers: number[] = [];

  for (const m of matches) {
    const num = Number.parseFloat(m);
    if (Number.isFinite(num) && !IGNORED_POLICY_NUMBERS.has(num)) {
      numbers.push(num);
    }
  }

  return numbers;
}

/** Validate AI output against trusted numerical inputs and non-medical safety guardrails. */
export function validateAiOutput(
  textToValidate: string,
  allowedNumbers: number[]
): ValidationResult {
  const forbiddenFound: string[] = [];
  for (const pattern of FORBIDDEN_MEDICAL_PATTERNS) {
    if (pattern.test(textToValidate)) {
      forbiddenFound.push(pattern.source);
    }
  }

  if (forbiddenFound.length > 0) {
    return {
      isValid: false,
      reason: `Found forbidden medical assertion or unqualified safety claim: ${forbiddenFound.join(', ')}`,
      forbiddenPhrasesFound: forbiddenFound,
    };
  }

  const outputNumbers = extractNumbers(textToValidate);
  const invented: number[] = [];

  const allowedSet = new Set<number>();
  for (const n of allowedNumbers) {
    if (!Number.isFinite(n)) continue;
    allowedSet.add(n);
    allowedSet.add(Math.round(n));
    allowedSet.add(Number(n.toFixed(1)));
    allowedSet.add(Number(n.toFixed(2)));
  }

  for (const num of outputNumbers) {
    const isAllowed = Array.from(allowedSet).some((allowed) => Math.abs(allowed - num) < 0.15);
    if (!isAllowed) {
      invented.push(num);
    }
  }

  if (invented.length > 0) {
    return {
      isValid: false,
      reason: `Output contains numbers not present in verified inputs: ${invented.join(', ')}`,
      inventedNumbers: invented,
    };
  }

  return { isValid: true };
}
