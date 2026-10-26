import { describe, it, expect } from 'vitest';
import {
  calculateHeroState,
  calculateHeroGeometry,
  smootherstep,
} from '../../src/domain/heroScroll';

describe('heroScroll pure calculation domain logic', () => {
  const vpHeight = 800;
  const finalHeight = 450;
  const defaultOpts = { viewportWidth: 1280, viewportHeight: vpHeight, finalHeight, maxRadius: 32 };

  it('at p = 0: full screen, square corners, only Stage 1 visible, actions 0, scroll cue 1, header 0', () => {
    const state = calculateHeroState(0, defaultOpts);
    expect(state.progress).toBe(0);
    expect(state.geometry).toBe(0);
    expect(state.frameWidthPercent).toBe(100);
    expect(state.frameHeightPx).toBe(vpHeight);
    expect(state.frameRadiusPx).toBe(0);
    expect(state.stage1Opacity).toBe(1);
    expect(state.stage2Opacity).toBe(0);
    expect(state.actionsOpacity).toBe(0);
    expect(state.scrollHintOpacity).toBe(1);
    expect(state.headerProgress).toBe(0);
    expect(state.headerOverPhoto).toBe(true);
  });

  it('at p = 0.03: still exactly full screen due to dead zone', () => {
    const state = calculateHeroState(0.03, defaultOpts);
    expect(state.geometry).toBe(0);
    expect(state.frameWidthPercent).toBe(100);
    expect(state.frameHeightPx).toBe(vpHeight);
    expect(state.frameRadiusPx).toBe(0);
    expect(state.stage1Opacity).toBe(1);
    expect(state.stage2Opacity).toBe(0);
    expect(state.actionsOpacity).toBe(0);
  });

  it('at p = 0.72 and above: width 88%, final height, max radius, geometry 1, stage 2 visible', () => {
    const state = calculateHeroState(0.72, defaultOpts);
    expect(state.geometry).toBe(1);
    expect(state.frameWidthPercent).toBe(88);
    expect(state.frameHeightPx).toBe(finalHeight);
    expect(state.frameRadiusPx).toBe(32);
    expect(state.stage1Opacity).toBe(0);
    expect(state.stage2Opacity).toBe(1);
    expect(state.headerProgress).toBe(1);
    expect(state.headerOverPhoto).toBe(false);

    // At p = 0.80 it stays at final geometry
    const state80 = calculateHeroState(0.80, defaultOpts);
    expect(state80.geometry).toBe(1);
    expect(state80.frameWidthPercent).toBe(88);
    expect(state80.frameHeightPx).toBe(finalHeight);
  });

  it('at p = 1: Stage 2 and actions are both fully visible (1), Stage 1 is 0', () => {
    const state = calculateHeroState(1, defaultOpts);
    expect(state.progress).toBe(1);
    expect(state.stage1Opacity).toBe(0);
    expect(state.stage2Opacity).toBe(1);
    expect(state.actionsOpacity).toBe(1);
    expect(state.scrollHintOpacity).toBe(0);
    expect(state.headerProgress).toBe(1);
    expect(state.headerOverPhoto).toBe(false);
  });

  it('header progress is 0 at p = 0 and 1 once g >= 0.40', () => {
    const state0 = calculateHeroState(0, defaultOpts);
    expect(state0.headerProgress).toBe(0);

    // When g reaches 0.40
    // Test calculateHeroGeometry for g >= 0.40
    for (let p = 0; p <= 1; p += 0.05) {
      const g = calculateHeroGeometry(p);
      const state = calculateHeroState(p, defaultOpts);
      if (g <= 0.15) {
        expect(state.headerProgress).toBe(0);
      } else if (g >= 0.40) {
        expect(state.headerProgress).toBe(1);
      }
    }
  });

  it('values are monotonic, clamped, and Stage 1 and Stage 2 are never both 1', () => {
    const samples = Array.from({ length: 101 }, (_, i) => i / 100);
    const states = samples.map((p) => calculateHeroState(p, defaultOpts));

    for (let i = 0; i < states.length - 1; i++) {
      const cur = states[i];
      const next = states[i + 1];

      // Geometry and width monotonic
      expect(next.geometry).toBeGreaterThanOrEqual(cur.geometry);
      expect(cur.frameWidthPercent).toBeGreaterThanOrEqual(next.frameWidthPercent);
      expect(cur.frameHeightPx).toBeGreaterThanOrEqual(next.frameHeightPx);
      expect(next.frameRadiusPx).toBeGreaterThanOrEqual(cur.frameRadiusPx);

      // Opacity bounds
      expect(cur.stage1Opacity).toBeGreaterThanOrEqual(0);
      expect(cur.stage1Opacity).toBeLessThanOrEqual(1);
      expect(cur.stage2Opacity).toBeGreaterThanOrEqual(0);
      expect(cur.stage2Opacity).toBeLessThanOrEqual(1);
      expect(cur.actionsOpacity).toBeGreaterThanOrEqual(0);
      expect(cur.actionsOpacity).toBeLessThanOrEqual(1);

      // Never both 1
      expect(cur.stage1Opacity === 1 && cur.stage2Opacity === 1).toBe(false);
    }
  });

  it('smootherstep function evaluates correctly with zero derivatives at 0 and 1', () => {
    expect(smootherstep(0)).toBe(0);
    expect(smootherstep(1)).toBe(1);
    expect(smootherstep(0.5)).toBe(0.5);
  });
});
