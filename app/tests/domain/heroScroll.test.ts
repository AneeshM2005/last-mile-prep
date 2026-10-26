import { describe, it, expect } from 'vitest';
import {
  calculateHeroState,
  calculateHeroGeometry,
  smootherstep,
  HERO_SCROLL_CONFIG,
} from '../../src/domain/heroScroll';

describe('heroScroll pure calculation domain logic (Round 2 Three-Step Transition)', () => {
  const vpHeight = 800;
  const headerHeight = 68;
  const actionsHeight = 80;
  const defaultOpts = {
    viewportWidth: 1280,
    viewportHeight: vpHeight,
    headerHeight,
    actionsHeight,
    maxRadius: 32,
  };

  it('at p = 0: full screen, square corners, only Stage 1 visible, actions 0, cue 1, step 1, header 0', () => {
    const state = calculateHeroState(0, defaultOpts);
    expect(state.progress).toBe(0);
    expect(state.geometry).toBe(0);
    expect(state.step).toBe(1);
    expect(state.frameWidthPercent).toBe(100);
    expect(state.frameHeightPx).toBe(vpHeight);
    expect(state.frameTopOffsetPx).toBe(0);
    expect(state.frameRadiusPx).toBe(0);
    expect(state.stage1Opacity).toBe(1);
    expect(state.stage1DriftYPx).toBe(0);
    expect(state.stage1BlurPx).toBe(0);
    expect(state.stage2Opacity).toBe(0);
    expect(state.actionsOpacity).toBe(0);
    expect(state.scrollHintOpacity).toBe(1);
    expect(state.mediaZoom).toBe(HERO_SCROLL_CONFIG.MEDIA_ZOOM_START);
    expect(state.headerProgress).toBe(0);
    expect(state.headerOverPhoto).toBe(true);
  });

  it('at p = 0.12 (end of Step 1 Arrive): still exactly full screen and only Stage 1', () => {
    const state = calculateHeroState(0.12, defaultOpts);
    expect(state.geometry).toBe(0);
    expect(state.step).toBe(1);
    expect(state.frameWidthPercent).toBe(100);
    expect(state.frameHeightPx).toBe(vpHeight);
    expect(state.frameTopOffsetPx).toBe(0);
    expect(state.frameRadiusPx).toBe(0);
    expect(state.stage1Opacity).toBe(1);
    expect(state.stage1DriftYPx).toBe(0);
    expect(state.stage1BlurPx).toBe(0);
    expect(state.stage2Opacity).toBe(0);
    expect(state.actionsOpacity).toBe(0);
    expect(state.mediaZoom).toBe(HERO_SCROLL_CONFIG.MEDIA_ZOOM_START);
    expect(state.headerProgress).toBe(0);
    expect(state.headerOverPhoto).toBe(true);
  });

  it('step number is 1, 2, 3 on the correct ranges', () => {
    expect(calculateHeroState(0, defaultOpts).step).toBe(1);
    expect(calculateHeroState(0.08, defaultOpts).step).toBe(1);
    expect(calculateHeroState(0.12, defaultOpts).step).toBe(1);

    expect(calculateHeroState(0.13, defaultOpts).step).toBe(2);
    expect(calculateHeroState(0.40, defaultOpts).step).toBe(2);
    expect(calculateHeroState(0.69, defaultOpts).step).toBe(2);

    expect(calculateHeroState(0.70, defaultOpts).step).toBe(3);
    expect(calculateHeroState(0.85, defaultOpts).step).toBe(3);
    expect(calculateHeroState(1.0, defaultOpts).step).toBe(3);
  });

  it('at p = 0.70: geometry is 1, step is 3, Stage 2 is 1, Stage 1 is 0, mediaZoom is 1.0', () => {
    const state = calculateHeroState(0.70, defaultOpts);
    expect(state.geometry).toBe(1);
    expect(state.step).toBe(3);
    expect(state.frameWidthPercent).toBe(HERO_SCROLL_CONFIG.FINAL_FRAME_WIDTH_PERCENT);
    expect(state.frameRadiusPx).toBe(32);
    expect(state.stage1Opacity).toBe(0);
    expect(state.stage2Opacity).toBe(1);
    expect(state.stage2DriftYPx).toBe(0);
    expect(state.stage2BlurPx).toBe(0);
    expect(state.mediaZoom).toBe(1.0);

    // Frame top offset equals headerHeight + 24
    expect(state.frameTopOffsetPx).toBe(headerHeight + HERO_SCROLL_CONFIG.FRAME_HEADER_GAP);
    expect(state.headerProgress).toBe(1);
    expect(state.headerOverPhoto).toBe(false);
  });

  it('Stage 1 is 0 by p = 0.42; Stage 2 is 0 before p = 0.38 and 1 from p = 0.68', () => {
    // Stage 1
    expect(calculateHeroState(0.42, defaultOpts).stage1Opacity).toBe(0);
    expect(calculateHeroState(0.45, defaultOpts).stage1Opacity).toBe(0);

    // Stage 2
    expect(calculateHeroState(0.35, defaultOpts).stage2Opacity).toBe(0);
    expect(calculateHeroState(0.38, defaultOpts).stage2Opacity).toBe(0);
    expect(calculateHeroState(0.68, defaultOpts).stage2Opacity).toBe(1);
    expect(calculateHeroState(0.75, defaultOpts).stage2Opacity).toBe(1);
  });

  it('actions are 0 before p = 0.62 and 1 from p = 0.82', () => {
    expect(calculateHeroState(0.60, defaultOpts).actionsOpacity).toBe(0);
    expect(calculateHeroState(0.62, defaultOpts).actionsOpacity).toBe(0);
    expect(calculateHeroState(0.82, defaultOpts).actionsOpacity).toBe(1);
    expect(calculateHeroState(1.0, defaultOpts).actionsOpacity).toBe(1);
  });

  it('scroll hint fades out between 0.04 and 0.14', () => {
    expect(calculateHeroState(0.02, defaultOpts).scrollHintOpacity).toBe(1);
    expect(calculateHeroState(0.04, defaultOpts).scrollHintOpacity).toBe(1);
    expect(calculateHeroState(0.14, defaultOpts).scrollHintOpacity).toBe(0);
    expect(calculateHeroState(0.20, defaultOpts).scrollHintOpacity).toBe(0);
  });

  it('values are monotonic, clamped, and Stage 1 and Stage 2 are never both 1', () => {
    const samples = Array.from({ length: 101 }, (_, i) => i / 100);
    const states = samples.map((p) => calculateHeroState(p, defaultOpts));

    for (let i = 0; i < states.length - 1; i++) {
      const cur = states[i];
      const next = states[i + 1];

      // Geometry and dimensions
      expect(next.geometry).toBeGreaterThanOrEqual(cur.geometry);
      expect(cur.frameWidthPercent).toBeGreaterThanOrEqual(next.frameWidthPercent);
      expect(cur.frameHeightPx).toBeGreaterThanOrEqual(next.frameHeightPx);
      expect(next.frameTopOffsetPx).toBeGreaterThanOrEqual(cur.frameTopOffsetPx);
      expect(next.frameRadiusPx).toBeGreaterThanOrEqual(cur.frameRadiusPx);
      expect(cur.mediaZoom).toBeGreaterThanOrEqual(next.mediaZoom);

      // Opacities clamped [0, 1]
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

  it('frame top offset equals header height + 24 at g = 1 and final height fits viewport', () => {
    const state = calculateHeroState(1, defaultOpts);
    const expectedTop = headerHeight + 24;
    expect(state.frameTopOffsetPx).toBe(expectedTop);

    // Final frame height plus top offset plus gap plus actions plus bottom margin fits viewport
    const expectedActionsTop = state.frameTopOffsetPx + state.frameHeightPx + 24;
    expect(state.actionsTopPx).toBe(expectedActionsTop);

    const totalNeeded = state.frameTopOffsetPx + state.frameHeightPx + 24 + actionsHeight + 24;
    expect(totalNeeded).toBeLessThanOrEqual(vpHeight);
  });

  it('smootherstep function evaluates correctly with zero derivatives at 0 and 1', () => {
    expect(smootherstep(0)).toBe(0);
    expect(smootherstep(1)).toBe(1);
    expect(smootherstep(0.5)).toBe(0.5);
    expect(calculateHeroGeometry(0.12)).toBe(0);
    expect(calculateHeroGeometry(0.70)).toBe(1);
  });
});
