// AirAware AI V2 — Strict Output Validator
// Enforces:
// 1. Every numeric value in the output must exist in the real input data
// 2. Prohibits medical diagnoses, disease claims, and unqualified "safe/unsafe" assertions
// 3. Schema conformity check

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

/**
 * Extracts all numeric tokens from a text string, ignoring year/standard citations like 2014, 2021, 2.5, 10
 */
export function extractNumbers(text: string): number[] {
  // Matches integers or decimals
  const matches = text.match(/\b\d+(\.\d+)?\b/g) || [];
  const numbers: number[] = [];

  for (const m of matches) {
    const num = parseFloat(m);
    if (!isNaN(num)) {
      // Exclude standard year numbers, PM particle sizes (2.5, 10)
      if (num === 2014 || num === 2021 || num === 2.5 || num === 10 || num === 24 || num === 8) {
        continue;
      }
      numbers.push(num);
    }
  }

  return numbers;
}

export function validateAiOutput(
  textToValidate: string,
  allowedNumbers: number[]
): ValidationResult {
  // 1. Check for medical / unqualified safety claims
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

  // 2. Check for invented numbers
  const outputNumbers = extractNumbers(textToValidate);
  const invented: number[] = [];

  // Round input numbers to 1 decimal place or whole numbers for comparison
  const allowedSet = new Set<number>();
  for (const n of allowedNumbers) {
    allowedSet.add(n);
    allowedSet.add(Math.round(n));
    allowedSet.add(Number(n.toFixed(1)));
    allowedSet.add(Number(n.toFixed(2)));
  }

  for (const num of outputNumbers) {
    // Check if within 0.1 tolerance of any allowed number
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
