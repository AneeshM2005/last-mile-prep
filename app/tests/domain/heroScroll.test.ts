import { describe, it, expect } from 'vitest';
import { calculateHeroState, cubicBezierEaseOut } from '../../src/domain/heroScroll';

describe('heroScroll pure calculation domain logic', () => {
  it('at progress 0: starts full screen, square corners, only stage 1 text visible, actions hidden', () => {
    const state = calculateHeroState(0);
    expect(state.progress).toBe(0);
    expect(state.frameWidthPercent).toBe(100);
    expect(state.frameHeightVh).toBe(100);
    expect(state.frameRadiusPx).toBe(0);
    expect(state.stage1Opacity).toBe(1);
    expect(state.stage2Opacity).toBe(0);
    expect(state.actionsOpacity).toBe(0);
    expect(state.scrollHintOpacity).toBe(1);
    expect(state.headerProgress).toBe(0);
  });

  it('at progress 1: shrinks to inset frame with 88% width, configured radius, stage 2 visible, actions visible', () => {
    // Laptop (default)
    const laptopState = calculateHeroState(1, { isMobile: false });
    expect(laptopState.progress).toBe(1);
    expect(laptopState.frameWidthPercent).toBe(88);
    expect(laptopState.frameRadiusPx).toBe(32);
    expect(laptopState.stage1Opacity).toBe(0);
    expect(laptopState.stage2Opacity).toBe(1);
    expect(laptopState.actionsOpacity).toBe(1);
    expect(laptopState.scrollHintOpacity).toBe(0);
    expect(laptopState.headerProgress).toBe(1);

    // Mobile
    const mobileState = calculateHeroState(1, { isMobile: true });
    expect(mobileState.frameRadiusPx).toBe(24);
    expect(mobileState.frameHeightVh).toBe(48);
  });

  it('safely clamps progress values below 0 and above 1', () => {
    const underState = calculateHeroState(-0.5);
    expect(underState.progress).toBe(0);
    expect(underState.frameWidthPercent).toBe(100);

    const overState = calculateHeroState(1.5);
    expect(overState.progress).toBe(1);
    expect(overState.frameWidthPercent).toBe(88);
  });

  it('provides continuous monotonic shrinking and cross-fade where both text groups are never both fully visible', () => {
    const samplePoints = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.85, 1.0];
    const states = samplePoints.map((p) => calculateHeroState(p));

    for (let i = 0; i < states.length - 1; i++) {
      const cur = states[i];
      const next = states[i + 1];

      // Width shrinks monotonically
      expect(cur.frameWidthPercent).toBeGreaterThanOrEqual(next.frameWidthPercent);
      // Radius increases monotonically
      expect(next.frameRadiusPx).toBeGreaterThanOrEqual(cur.frameRadiusPx);
      // Stage 1 fades out monotonically
      expect(cur.stage1Opacity).toBeGreaterThanOrEqual(next.stage1Opacity);
      // Stage 2 fades in monotonically
      expect(next.stage2Opacity).toBeGreaterThanOrEqual(cur.stage2Opacity);
      // Actions fade in monotonically
      expect(next.actionsOpacity).toBeGreaterThanOrEqual(cur.actionsOpacity);

      // Neither text group is ever both fully visible (at most one can be 1.0)
      if (cur.stage1Opacity > 0.5) {
        expect(cur.stage2Opacity).toBeLessThan(0.5);
      }
      if (cur.stage2Opacity > 0.5) {
        expect(cur.stage1Opacity).toBeLessThan(0.5);
      }
    }
  });

  it('cubicBezierEaseOut produces smooth easing between 0 and 1 with no overshoot', () => {
    expect(cubicBezierEaseOut(0)).toBe(0);
    expect(cubicBezierEaseOut(1)).toBe(1);
    const mid = cubicBezierEaseOut(0.5);
    // Ease-out is front-loaded
    expect(mid).toBeGreaterThan(0.5);
    expect(mid).toBeLessThanOrEqual(1);
  });
});
