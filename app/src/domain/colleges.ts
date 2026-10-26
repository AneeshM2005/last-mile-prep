/**
 * colleges.ts – Dream colleges configuration derived from founder-supplied images.
 * Single source of truth for college options in onboarding, profile, and countdown card.
 */

export interface CollegeConfig {
  id: string;
  name: string;
  image: string | null;
  focus?: string;
  legacyIds?: string[];
  textTone?: 'ink' | 'light';
  wash?: number;
}

export const COLLEGES: CollegeConfig[] = [
  {
    id: 'fms',
    name: 'FMS',
    image: '/images/colleges/fms.webp',
    focus: '50% 50%',
    legacyIds: ['fms', 'fms-delhi'],
    textTone: 'ink',
    wash: 8,
  },
  {
    id: 'iift-delhi',
    name: 'IIFT Delhi',
    image: '/images/colleges/iift-delhi.webp',
    focus: '50% 50%',
    legacyIds: [],
    textTone: 'ink',
    wash: 45,
  },
  {
    id: 'iim-ahmedabad',
    name: 'IIM Ahmedabad',
    image: '/images/colleges/iim-ahmedabad.webp',
    focus: '50% 50%',
    legacyIds: ['iima'],
    textTone: 'ink',
    wash: 0,
  },
  {
    id: 'iim-bangalore',
    name: 'IIM Bangalore',
    image: '/images/colleges/iim-bangalore.webp',
    focus: '50% 50%',
    legacyIds: ['iimb'],
    textTone: 'light',
    wash: 45,
  },
  {
    id: 'iim-calcutta',
    name: 'IIM Calcutta',
    image: '/images/colleges/iim-calcutta.webp',
    focus: '50% 50%',
    legacyIds: ['iimc'],
    textTone: 'ink',
    wash: 45,
  },
  {
    id: 'iim-indore',
    name: 'IIM Indore',
    image: '/images/colleges/iim-indore.webp',
    focus: '50% 50%',
    legacyIds: [],
    textTone: 'light',
    wash: 20,
  },
  {
    id: 'iim-kozhikode',
    name: 'IIM Kozhikode',
    image: '/images/colleges/iim-kozhikode.webp',
    focus: '50% 50%',
    legacyIds: ['iimk'],
    textTone: 'ink',
    wash: 9,
  },
  {
    id: 'iim-lucknow',
    name: 'IIM Lucknow',
    image: '/images/colleges/iim-lucknow.webp',
    focus: '50% 50%',
    legacyIds: ['iiml'],
    textTone: 'ink',
    wash: 31,
  },
  {
    id: 'iim-mumbai',
    name: 'IIM Mumbai',
    image: '/images/colleges/iim-mumbai.webp',
    focus: '50% 50%',
    legacyIds: [],
    textTone: 'ink',
    wash: 23,
  },
  {
    id: 'iim-shillong',
    name: 'IIM Shillong',
    image: '/images/colleges/iim-shillong.webp',
    focus: '50% 50%',
    legacyIds: ['iims'],
    textTone: 'ink',
    wash: 45,
  },
  {
    id: 'iim-trichy',
    name: 'IIM Trichy',
    image: '/images/colleges/iim-trichy.webp',
    focus: '50% 50%',
    legacyIds: [],
    textTone: 'ink',
    wash: 29,
  },
  {
    id: 'iit-delhi',
    name: 'IIT Delhi',
    image: '/images/colleges/iit-delhi.webp',
    focus: '50% 50%',
    legacyIds: [],
    textTone: 'ink',
    wash: 27,
  },
  {
    id: 'mdi-gurgaon',
    name: 'MDI Gurgaon',
    image: '/images/colleges/mdi-gurgaon.webp',
    focus: '50% 50%',
    legacyIds: [],
    textTone: 'ink',
    wash: 45,
  },
  {
    id: 'sjmsom-iit-b',
    name: 'SJMSOM, IIT B',
    image: '/images/colleges/sjmsom-iit-b.webp',
    focus: '50% 50%',
    legacyIds: [],
    textTone: 'light',
    wash: 0,
  },
  {
    id: 'spjimr',
    name: 'SPJIMR',
    image: '/images/colleges/spjimr.webp',
    focus: '50% 50%',
    legacyIds: ['spjimr', 'spjimr-mumbai'],
    textTone: 'ink',
    wash: 27,
  },
  {
    id: 'tiss',
    name: 'TISS',
    image: '/images/colleges/tiss.webp',
    focus: '50% 50%',
    legacyIds: [],
    textTone: 'ink',
    wash: 45,
  },
  {
    id: 'xlri-jamshedpur',
    name: 'XLRI Jamshedpur',
    image: '/images/colleges/xlri-jamshedpur.webp',
    focus: '50% 50%',
    legacyIds: ['xlri'],
    textTone: 'ink',
    wash: 45,
  },
];

/**
 * Returns all colleges sorted alphabetically by display name.
 */
export function getAllColleges(): CollegeConfig[] {
  return COLLEGES;
}

/**
 * Finds a college by its slug ID, legacy ID, or display name (case-insensitive).
 */
export function findCollege(idOrName: string | undefined | null): CollegeConfig | undefined {
  if (!idOrName) return undefined;
  const normalized = idOrName.trim().toLowerCase();

  return (
    COLLEGES.find((c) => c.id === normalized) ||
    COLLEGES.find((c) => c.legacyIds?.includes(normalized)) ||
    COLLEGES.find((c) => c.name.toLowerCase() === normalized) ||
    COLLEGES.find((c) => {
      // Fuzzy matching for name variants like "SPJIMR Mumbai" -> "SPJIMR" or "FMS Delhi" -> "FMS"
      const cNameNorm = c.name.toLowerCase();
      return normalized.startsWith(cNameNorm) || cNameNorm.startsWith(normalized);
    })
  );
}

/**
 * Default fallback college if no valid choice exists.
 */
export const DEFAULT_COLLEGE: CollegeConfig = COLLEGES.find((c) => c.id === 'iim-ahmedabad') || COLLEGES[0];
