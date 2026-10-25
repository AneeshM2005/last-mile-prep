import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Scan all .ts, .tsx, .css, .js files in src/
// except tokens.css itself - no raw hex colours allowed.
const HEX_PATTERN = /#[0-9a-fA-F]{3,8}\b/g;
const SRC_DIR = join(process.cwd(), 'src');

function getAllFiles(dir: string, extensions: string[]): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...getAllFiles(fullPath, extensions));
    } else if (extensions.some((ext) => entry.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

describe('Design: No raw hex values outside tokens.css', () => {
  it('finds no #rrggbb literals in src/** outside tokens.css', () => {
    const files = getAllFiles(SRC_DIR, ['.ts', '.tsx', '.css', '.js']);
    const violations: string[] = [];

    for (const file of files) {
      // tokens.css is the only allowed location for raw hex
      if (file.endsWith('tokens.css')) continue;

      const content = readFileSync(file, 'utf-8');
      const matches = content.match(HEX_PATTERN);
      if (matches) {
        // Filter out hex that may appear in comments (starts with //)
        const lines = content.split('\n');
        for (const line of lines) {
          const trimmed = line.trimStart();
          if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;
          const lineMatches = line.match(HEX_PATTERN);
          if (lineMatches) {
            violations.push(`${file}: ${line.trim()} (found: ${lineMatches.join(', ')})`);
          }
        }
      }
    }

    if (violations.length > 0) {
      console.error('Raw hex colours found outside tokens.css:\n', violations.join('\n'));
    }

    expect(violations).toHaveLength(0);
  });
});
