/**
 * contrast.test.ts – Automated WCAG contrast ratio test.
 *
 * Implements Part E1 requirement 1:
 * Computes the contrast ratio for every text/background pair on:
 * - The Home countdown card (number panel, college pill, labels)
 * - The Personal dictionary page (all tabs, both views: Word List & Practice Cards)
 * Fails on anything below 4.5:1 (target 7:1 for body text and countdown number).
 */

import { describe, it, expect } from 'vitest';

function srgbToLin(c: number): number {
  const norm = c / 255.0;
  return norm <= 0.04045 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4);
}

function getLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b);
}

export function computeContrast(hexFg: string, hexBg: string): number {
  const l1 = getLuminance(hexFg);
  const l2 = getLuminance(hexBg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Design tokens from tokens.css
export const TOKENS = {
  ink: '#2B2B2B',
  white: '#FFFFFF',
  paper: '#FBFCF9',
  surface: '#FFFFFF',
  textMuted: '#5E5A55',
  sage50: '#F4F8F2',
  sage100: '#E6EFE3',
  sage200: '#D2E2CD',
  sage700: '#4B6F4D',
  sage900: '#2F4A32',
  noticeBg: '#FDF3D0',
  noticeText: '#7A4D0A',
};

export interface ContrastCheckItem {
  component: string;
  element: string;
  fgName: string;
  fgHex: string;
  bgName: string;
  bgHex: string;
  minRatio: number;
}

export const CONTRAST_AUDIT_ITEMS: ContrastCheckItem[] = [
  // Home Countdown Card
  {
    component: 'Home Countdown Card',
    element: 'Countdown Number (big digits)',
    fgName: 'ink',
    fgHex: TOKENS.ink,
    bgName: 'solid white panel',
    bgHex: TOKENS.white,
    minRatio: 7.0,
  },
  {
    component: 'Home Countdown Card',
    element: 'Countdown Label ("COUNTDOWN")',
    fgName: 'sage-700',
    fgHex: TOKENS.sage700,
    bgName: 'solid white panel',
    bgHex: TOKENS.white,
    minRatio: 4.5,
  },
  {
    component: 'Home Countdown Card',
    element: 'Countdown Subtitle ("days to CAT")',
    fgName: 'text-muted',
    fgHex: TOKENS.textMuted,
    bgName: 'solid white panel',
    bgHex: TOKENS.white,
    minRatio: 4.5,
  },
  {
    component: 'Home Countdown Card',
    element: 'College Name Pill',
    fgName: 'deep-sage (sage-900)',
    fgHex: TOKENS.sage900,
    bgName: 'solid white pill',
    bgHex: TOKENS.white,
    minRatio: 7.0,
  },

  // Personal Dictionary – Page Header & Stats
  {
    component: 'Personal Dictionary',
    element: 'Page Heading',
    fgName: 'ink',
    fgHex: TOKENS.ink,
    bgName: 'paper canvas',
    bgHex: TOKENS.paper,
    minRatio: 7.0,
  },
  {
    component: 'Personal Dictionary',
    element: 'Page Subtitle',
    fgName: 'text-muted',
    fgHex: TOKENS.textMuted,
    bgName: 'paper canvas',
    bgHex: TOKENS.paper,
    minRatio: 4.5,
  },
  {
    component: 'Personal Dictionary',
    element: 'Stat Tile: Total Words Number',
    fgName: 'ink',
    fgHex: TOKENS.ink,
    bgName: 'white surface',
    bgHex: TOKENS.white,
    minRatio: 7.0,
  },
  {
    component: 'Personal Dictionary',
    element: 'Stat Tile: Still Learning Number',
    fgName: 'ink',
    fgHex: TOKENS.ink,
    bgName: 'white surface',
    bgHex: TOKENS.white,
    minRatio: 7.0,
  },
  {
    component: 'Personal Dictionary',
    element: 'Stat Tile: Got It Number',
    fgName: 'deep-sage (sage-900)',
    fgHex: TOKENS.sage900,
    bgName: 'white surface',
    bgHex: TOKENS.white,
    minRatio: 7.0,
  },
  {
    component: 'Personal Dictionary',
    element: 'Stat Tile Label',
    fgName: 'text-muted',
    fgHex: TOKENS.textMuted,
    bgName: 'white surface',
    bgHex: TOKENS.white,
    minRatio: 4.5,
  },

  // Personal Dictionary – Tabs & Toggle Switch
  {
    component: 'Personal Dictionary',
    element: 'Active Tab Label',
    fgName: 'ink',
    fgHex: TOKENS.ink,
    bgName: 'paper canvas',
    bgHex: TOKENS.paper,
    minRatio: 7.0,
  },
  {
    component: 'Personal Dictionary',
    element: 'Inactive Tab Label',
    fgName: 'text-muted',
    fgHex: TOKENS.textMuted,
    bgName: 'paper canvas',
    bgHex: TOKENS.paper,
    minRatio: 4.5,
  },
  {
    component: 'Personal Dictionary',
    element: 'Toggle: Active Segment',
    fgName: 'ink',
    fgHex: TOKENS.ink,
    bgName: 'white pill',
    bgHex: TOKENS.white,
    minRatio: 7.0,
  },
  {
    component: 'Personal Dictionary',
    element: 'Toggle: Inactive Segment',
    fgName: 'text-muted',
    fgHex: TOKENS.textMuted,
    bgName: 'sage-100 background',
    bgHex: TOKENS.sage100,
    minRatio: 4.5,
  },

  // Personal Dictionary – Word List View
  {
    component: 'Personal Dictionary (Word List)',
    element: 'Word Heading',
    fgName: 'ink',
    fgHex: TOKENS.ink,
    bgName: 'white card',
    bgHex: TOKENS.white,
    minRatio: 7.0,
  },
  {
    component: 'Personal Dictionary (Word List)',
    element: 'Definition Body',
    fgName: 'ink',
    fgHex: TOKENS.ink,
    bgName: 'white card',
    bgHex: TOKENS.white,
    minRatio: 7.0,
  },
  {
    component: 'Personal Dictionary (Word List)',
    element: 'From Passage Line (13px)',
    fgName: 'text-muted',
    fgHex: TOKENS.textMuted,
    bgName: 'white card',
    bgHex: TOKENS.white,
    minRatio: 4.5,
  },
  {
    component: 'Personal Dictionary (Status Badge)',
    element: '"Still learning" Badge',
    fgName: 'dark amber (notice-text)',
    fgHex: TOKENS.noticeText,
    bgName: 'pale amber fill (notice-bg)',
    bgHex: TOKENS.noticeBg,
    minRatio: 4.5,
  },
  {
    component: 'Personal Dictionary (Status Badge)',
    element: '"Got it" Badge',
    fgName: 'deep sage (sage-900)',
    fgHex: TOKENS.sage900,
    bgName: 'sage-50 fill',
    bgHex: TOKENS.sage50,
    minRatio: 4.5,
  },

  // Personal Dictionary – Practice Cards View
  {
    component: 'Personal Dictionary (Practice Cards)',
    element: 'Front: Word Title',
    fgName: 'ink',
    fgHex: TOKENS.ink,
    bgName: 'white card front',
    bgHex: TOKENS.white,
    minRatio: 7.0,
  },
  {
    component: 'Personal Dictionary (Practice Cards)',
    element: 'Front: From Source Line',
    fgName: 'text-muted',
    fgHex: TOKENS.textMuted,
    bgName: 'white card front',
    bgHex: TOKENS.white,
    minRatio: 4.5,
  },
  {
    component: 'Personal Dictionary (Practice Cards)',
    element: 'Back: Definition Text',
    fgName: 'ink',
    fgHex: TOKENS.ink,
    bgName: 'white card back',
    bgHex: TOKENS.white,
    minRatio: 7.0,
  },
  {
    component: 'Personal Dictionary (Practice Cards)',
    element: 'Back: Example Sentence',
    fgName: 'ink',
    fgHex: TOKENS.ink,
    bgName: 'sage-50 inset',
    bgHex: TOKENS.sage50,
    minRatio: 7.0,
  },
];

describe('WCAG Contrast Audit (Part E1)', () => {
  it('computes contrast ratios for all pairs and fails on anything below threshold', () => {
    for (const item of CONTRAST_AUDIT_ITEMS) {
      const ratio = computeContrast(item.fgHex, item.bgHex);
      expect(
        ratio,
        `${item.component} > ${item.element} (${item.fgName} on ${item.bgName}) ratio ${ratio.toFixed(2)}:1 must be >= ${item.minRatio}:1`,
      ).toBeGreaterThanOrEqual(item.minRatio);
    }
  });
});
