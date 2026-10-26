/**
 * P1-04 content validation tests.
 * Validates the real files in public/ and a deliberately broken fixture.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  QuotesPackSchema,
  SchoolsPackSchema,
  AppConfigSchema,
  GradesConfigSchema,
  QuestionTypesConfigSchema,
  StrategiesConfigSchema,
  RevisionConfigSchema,
  SwotConfigSchema,
  TasksConfigSchema,
  CopyConfigSchema,
} from '@/data/configSchemas';

const PUBLIC = join(process.cwd(), 'public');

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

// ── Forbidden copy phrases ────────────────────────────────────
// Per Rules.md section 7
const FORBIDDEN_PHRASES = [
  /\blost\b/i,
  /\byou lost\b/i,
  /\bstreak broken\b/i,
  /\bmissed\b/i,
  /\byou missed\b/i,
  /\bbehind\b/i,
  /\bfailed\b/i,
  /\bweak student\b/i,
  /\btalent\b/i,
  /\bleaderboard\b/i,
  /\bpercentile\b/i,
  /\brank\b/i,
  /\bpromise to (reduce|eliminate) anxiety\b/i,
  /\bguarantee\b/i,
];

// Allowed exception: the wellness-adjacent line
const ALLOWED_EXCEPTIONS = [
  'not a promise to eliminate anxiety',
];

function scanStringForForbidden(text: string): string[] {
  // Allow exceptions
  let working = text;
  for (const exc of ALLOWED_EXCEPTIONS) {
    working = working.replace(exc, '');
  }
  return FORBIDDEN_PHRASES
    .filter((pat) => pat.test(working))
    .map((pat) => pat.source);
}

function deepScanObject(obj: unknown, path = ''): { path: string; phrase: string }[] {
  if (typeof obj === 'string') {
    const hits = scanStringForForbidden(obj);
    return hits.map((h) => ({ path, phrase: h }));
  }
  if (Array.isArray(obj)) {
    return obj.flatMap((v, i) => deepScanObject(v, `${path}[${i}]`));
  }
  if (obj && typeof obj === 'object') {
    return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
      deepScanObject(v, path ? `${path}.${k}` : k)
    );
  }
  return [];
}

// ── Real config files ─────────────────────────────────────────

describe('Config files parse correctly', () => {
  it('app.json is valid', () => {
    const data = readJson(join(PUBLIC, 'config/app.json'));
    expect(AppConfigSchema.safeParse(data).success).toBe(true);
  });

  it('grades.json is valid', () => {
    const data = readJson(join(PUBLIC, 'config/grades.json'));
    expect(GradesConfigSchema.safeParse(data).success).toBe(true);
  });

  it('questionTypes.json is valid', () => {
    const data = readJson(join(PUBLIC, 'config/questionTypes.json'));
    expect(QuestionTypesConfigSchema.safeParse(data).success).toBe(true);
  });

  it('strategies.json is valid', () => {
    const data = readJson(join(PUBLIC, 'config/strategies.json'));
    expect(StrategiesConfigSchema.safeParse(data).success).toBe(true);
  });

  it('revision.json is valid', () => {
    const data = readJson(join(PUBLIC, 'config/revision.json'));
    expect(RevisionConfigSchema.safeParse(data).success).toBe(true);
  });

  it('swot.json is valid', () => {
    const data = readJson(join(PUBLIC, 'config/swot.json'));
    expect(SwotConfigSchema.safeParse(data).success).toBe(true);
  });

  it('tasks.json is valid', () => {
    const data = readJson(join(PUBLIC, 'config/tasks.json'));
    expect(TasksConfigSchema.safeParse(data).success).toBe(true);
  });

  it('copy.json is valid JSON', () => {
    const data = readJson(join(PUBLIC, 'config/copy.json'));
    expect(CopyConfigSchema.safeParse(data).success).toBe(true);
  });
});

describe('Content packs parse correctly', () => {
  it('quotes.json is valid and has 10 quotes', () => {
    const data = readJson(join(PUBLIC, 'content/quotes.json'));
    const result = QuotesPackSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.quotes.length).toBeGreaterThanOrEqual(10);
  });

  it('schools.json is valid and has at least 4 schools', () => {
    const data = readJson(join(PUBLIC, 'content/schools.json'));
    const result = SchoolsPackSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.schools.length).toBeGreaterThanOrEqual(4);
  });
});

// ── Deliberately broken fixture ───────────────────────────────

describe('Broken fixture reports file and field', () => {
  it('reports file and field for a broken quotes fixture', () => {
    const broken = { quotes: [{ id: 123, text: 42 }] }; // id should be string
    const result = QuotesPackSchema.safeParse(broken);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = result.error.issues;
      expect(issues.length).toBeGreaterThan(0);
      // The path should reference 'quotes'
      const firstPath = issues[0].path.join('.');
      expect(firstPath).toContain('quotes');
      console.log(`Broken fixture → file: quotes.json, field: ${firstPath}, message: ${issues[0].message}`);
    }
  });
});

// ── Copy lint ─────────────────────────────────────────────────

describe('Copy lint: no forbidden phrases', () => {
  it('copy.json contains no forbidden phrases', () => {
    const data = readJson(join(PUBLIC, 'config/copy.json'));
    const violations = deepScanObject(data, 'copy.json');
    if (violations.length > 0) {
      console.error('Forbidden phrases found:', violations);
    }
    expect(violations).toHaveLength(0);
  });

  it('quotes.json contains no forbidden phrases', () => {
    const data = readJson(join(PUBLIC, 'content/quotes.json'));
    const violations = deepScanObject(data, 'quotes.json');
    if (violations.length > 0) {
      console.error('Forbidden phrases found:', violations);
    }
    expect(violations).toHaveLength(0);
  });

  it('schools.json contains no forbidden phrases', () => {
    const data = readJson(join(PUBLIC, 'content/schools.json'));
    const violations = deepScanObject(data, 'schools.json');
    expect(violations).toHaveLength(0);
  });
});
