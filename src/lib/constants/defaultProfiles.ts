// AirAware AI V2 — Shared Default Family Profiles

import { FamilyProfile } from '../types';

export const DEFAULT_FAMILY_PROFILES: FamilyProfile[] = [
  {
    id: 'prof-child-1',
    name: 'Aarav',
    category: 'CHILD',
    ageRange: '< 12 yrs',
    avatarColor: '#047857', // emerald-700 (WCAG AA contrast with white)
    createdAt: '2026-11-19T00:00:00.000Z',
  },
  {
    id: 'prof-teen-1',
    name: 'Priya',
    category: 'TEEN',
    ageRange: '13–17 yrs',
    avatarColor: '#0369a1', // sky-700
    createdAt: '2026-11-19T00:01:00.000Z',
  },
  {
    id: 'prof-adult-1',
    name: 'Rajesh',
    category: 'ADULT',
    ageRange: '18–59 yrs',
    avatarColor: '#4338ca', // indigo-700
    createdAt: '2026-11-19T00:02:00.000Z',
  },
  {
    id: 'prof-senior-1',
    name: 'Grandma Lakshmi',
    category: 'SENIOR',
    ageRange: '60+ yrs',
    avatarColor: '#b45309', // amber-700
    accessibility: { highContrast: true, fontSize: 'large' },
    createdAt: '2026-11-19T00:03:00.000Z',
  },
];
