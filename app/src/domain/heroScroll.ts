/**
 * heroScroll.ts – Pure calculation of Landing hero shrink and cross-fade states.
 * Three-step cinematic transition driven by raw progress p in [0, 1] linear in scroll.
 *
 * Config block: Named constants for timeline, runway, and layout.
 */

export const HERO_SCROLL_CONFIG = {
  // Runway multiples of viewport height
  SHRINK_DISTANCE_MULTIPLE: 1.6,
  HOLD_DISTANCE_MULTIPLE: 0.6,

  // Step ranges (raw progress p)
  STEP_1_END: 0.12, // Step 1 (Arrive): 0 to 0.12
  STEP_2_START: 0.12, // Step 2 (Transition): 0.12 to 0.70
  STEP_2_END: 0.70,
  STEP_3_START: 0.70, // Step 3 (Settle): 0.70 to 1.0

  // Geometry smootherstep range
  GEOMETRY_START: 0.12,
  GEOMETRY_END: 0.70,

  // Text opacities
  STAGE_1_FADE_START: 0.12,
  STAGE_1_FADE_END: 0.42,
  STAGE_2_FADE_START: 0.38,
  STAGE_2_FADE_END: 0.68,

  // Actions opacity
  ACTIONS_FADE_START: 0.62,
  ACTIONS_FADE_END: 0.82,

  // Scroll cue opacity
  SCROLL_HINT_FADE_START: 0.04,
  SCROLL_HINT_FADE_END: 0.14,

  // Media zoom across geometry g: 1.06 -> 1.0
  MEDIA_ZOOM_START: 1.06,
  MEDIA_ZOOM_END: 1.0,

  // Outgoing Stage 1 motion & blur
  STAGE_1_DRIFT_Y_PX: -16, // 0 -> -16px
  STAGE_1_MAX_BLUR_PX: 6, // 0 -> 6px

  // Incoming Stage 2 motion & blur
  STAGE_2_DRIFT_Y_PX: 16, // 16px -> 0
  STAGE_2_MAX_BLUR_PX: 6, // 6px -> 0

  // Layout spacing
  FRAME_HEADER_GAP: 24,
  FRAME_ACTIONS_GAP: 24,
  ACTIONS_BOTTOM_MARGIN: 24,
  DEFAULT_HEADER_HEIGHT: 68,
  DEFAULT_ACTIONS_HEIGHT: 80,
  MIN_FRAME_HEIGHT: 260,
  MAX_FRAME_HEIGHT: 640,
  FINAL_FRAME_WIDTH_PERCENT: 88,
} as const;

export type HeroStep = 1 | 2 | 3;

export interface HeroStateOptions {
  viewportWidth?: number;
  viewportHeight?: number;
  headerHeight?: number;
  actionsHeight?: number;
  finalHeight?: number;
  maxRadius?: number;
}

export interface HeroState {
  progress: number;
  geometry: number;
  step: HeroStep;
  frameWidthPercent: number;
  frameHeightPx: number;
  frameTopOffsetPx: number;
  frameRadiusPx: number;
  stage1Opacity: number;
  stage1DriftYPx: number;
  stage1BlurPx: number;
  stage2Opacity: number;
  stage2DriftYPx: number;
  stage2BlurPx: number;
  actionsOpacity: number;
  actionsTopPx: number;
  scrollHintOpacity: number;
  mediaZoom: number;
  headerProgress: number;
  headerOverPhoto: boolean;
}

/**
 * Standard smootherstep: 6t^5 - 15t^4 + 10t^3
 * Has 1st and 2nd derivatives = 0 at both t=0 and t=1.
 */
export function smootherstep(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped * clamped * clamped * (clamped * (clamped * 6 - 15) + 10);
}

/**
 * Computes geometry progress g from raw scroll progress p.
 * - g = 0 for p <= 0.12 (Step 1 Arrive: full screen, square corners)
 * - smootherstep for 0.12 < p < 0.70 (Step 2 Transition)
 * - g = 1 for p >= 0.70 (Step 3 Settle)
 */
export function calculateHeroGeometry(rawProgress: number): number {
  if (rawProgress <= HERO_SCROLL_CONFIG.GEOMETRY_START) return 0;
  if (rawProgress >= HERO_SCROLL_CONFIG.GEOMETRY_END) return 1;
  const t =
    (rawProgress - HERO_SCROLL_CONFIG.GEOMETRY_START) /
    (HERO_SCROLL_CONFIG.GEOMETRY_END - HERO_SCROLL_CONFIG.GEOMETRY_START);
  return smootherstep(t);
}

/**
 * Pure function mapping scroll progress p in [0, 1] to hero visual states.
 */
export function calculateHeroState(rawProgress: number, options: HeroStateOptions = {}): HeroState {
  const progress = Math.max(0, Math.min(1, rawProgress));
  const g = calculateHeroGeometry(progress);

  // Step 1: 0 to 0.12 | Step 2: 0.12 to 0.70 | Step 3: 0.70 to 1.0
  let step: HeroStep = 1;
  if (progress <= HERO_SCROLL_CONFIG.STEP_1_END) {
    step = 1;
  } else if (progress < HERO_SCROLL_CONFIG.STEP_2_END) {
    step = 2;
  } else {
    step = 3;
  }

  const vpWidth = options.viewportWidth ?? 1280;
  const vpHeight = options.viewportHeight ?? 800;
  const headerHeight = options.headerHeight ?? HERO_SCROLL_CONFIG.DEFAULT_HEADER_HEIGHT;
  const actionsHeight = options.actionsHeight ?? HERO_SCROLL_CONFIG.DEFAULT_ACTIONS_HEIGHT;

  // Max radius: clamp(24px, 3vw, 32px)
  const computedMaxRadius = options.maxRadius ?? Math.max(24, Math.min(32, vpWidth * 0.03));
  const frameRadiusPx = g * computedMaxRadius;

  // Frame width: 100 -> 88% using geometry g
  const frameWidthPercent = 100 - (100 - HERO_SCROLL_CONFIG.FINAL_FRAME_WIDTH_PERCENT) * g;

  // Final top offset: headerHeight + 24px
  const finalTopOffset = headerHeight + HERO_SCROLL_CONFIG.FRAME_HEADER_GAP;
  const frameTopOffsetPx = g * finalTopOffset;

  // Final frame height: viewportHeight - finalTopOffset - gap (24px) - actionsHeight - bottomMargin (24px)
  const overhead =
    finalTopOffset +
    HERO_SCROLL_CONFIG.FRAME_ACTIONS_GAP +
    actionsHeight +
    HERO_SCROLL_CONFIG.ACTIONS_BOTTOM_MARGIN;
  const computedFinalHeight = Math.max(
    HERO_SCROLL_CONFIG.MIN_FRAME_HEIGHT,
    Math.min(HERO_SCROLL_CONFIG.MAX_FRAME_HEIGHT, vpHeight - overhead)
  );
  const finalHeight = options.finalHeight ?? computedFinalHeight;

  // Frame height: linear from full viewport height to finalHeight using geometry g
  const frameHeightPx = vpHeight - g * (vpHeight - finalHeight);

  // Actions top position: frameTopOffsetPx + frameHeightPx + gap (24px)
  const actionsTopPx = frameTopOffsetPx + frameHeightPx + HERO_SCROLL_CONFIG.FRAME_ACTIONS_GAP;

  // Media zoom: from 1.06 to 1.0 across geometry g
  const mediaZoom =
    HERO_SCROLL_CONFIG.MEDIA_ZOOM_START -
    g * (HERO_SCROLL_CONFIG.MEDIA_ZOOM_START - HERO_SCROLL_CONFIG.MEDIA_ZOOM_END);

  // Stage 1 text: 1 until p = 0.12, falling to 0 at p = 0.42
  let stage1Opacity: number = 1;
  let stage1DriftYPx: number = 0;
  let stage1BlurPx: number = 0;
  if (progress <= HERO_SCROLL_CONFIG.STAGE_1_FADE_START) {
    stage1Opacity = 1;
    stage1DriftYPx = 0;
    stage1BlurPx = 0;
  } else if (progress >= HERO_SCROLL_CONFIG.STAGE_1_FADE_END) {
    stage1Opacity = 0;
    stage1DriftYPx = HERO_SCROLL_CONFIG.STAGE_1_DRIFT_Y_PX;
    stage1BlurPx = HERO_SCROLL_CONFIG.STAGE_1_MAX_BLUR_PX;
  } else {
    const fadeProg =
      (progress - HERO_SCROLL_CONFIG.STAGE_1_FADE_START) /
      (HERO_SCROLL_CONFIG.STAGE_1_FADE_END - HERO_SCROLL_CONFIG.STAGE_1_FADE_START);
    stage1Opacity = 1 - fadeProg;
    stage1DriftYPx = fadeProg * HERO_SCROLL_CONFIG.STAGE_1_DRIFT_Y_PX;
    stage1BlurPx = fadeProg * HERO_SCROLL_CONFIG.STAGE_1_MAX_BLUR_PX;
  }

  // Stage 2 text: 0 until p = 0.38, rising to 1 at p = 0.68, stays 1
  let stage2Opacity: number = 0;
  let stage2DriftYPx: number = HERO_SCROLL_CONFIG.STAGE_2_DRIFT_Y_PX;
  let stage2BlurPx: number = HERO_SCROLL_CONFIG.STAGE_2_MAX_BLUR_PX;
  if (progress <= HERO_SCROLL_CONFIG.STAGE_2_FADE_START) {
    stage2Opacity = 0;
    stage2DriftYPx = HERO_SCROLL_CONFIG.STAGE_2_DRIFT_Y_PX;
    stage2BlurPx = HERO_SCROLL_CONFIG.STAGE_2_MAX_BLUR_PX;
  } else if (progress >= HERO_SCROLL_CONFIG.STAGE_2_FADE_END) {
    stage2Opacity = 1;
    stage2DriftYPx = 0;
    stage2BlurPx = 0;
  } else {
    const fadeProg =
      (progress - HERO_SCROLL_CONFIG.STAGE_2_FADE_START) /
      (HERO_SCROLL_CONFIG.STAGE_2_FADE_END - HERO_SCROLL_CONFIG.STAGE_2_FADE_START);
    stage2Opacity = fadeProg;
    stage2DriftYPx = (1 - fadeProg) * HERO_SCROLL_CONFIG.STAGE_2_DRIFT_Y_PX;
    stage2BlurPx = (1 - fadeProg) * HERO_SCROLL_CONFIG.STAGE_2_MAX_BLUR_PX;
  }

  // Actions (button + privacy line) opacity: 0 until p = 0.62, rising to 1 at p = 0.82, stays 1
  let actionsOpacity = 0;
  if (progress <= HERO_SCROLL_CONFIG.ACTIONS_FADE_START) {
    actionsOpacity = 0;
  } else if (progress >= HERO_SCROLL_CONFIG.ACTIONS_FADE_END) {
    actionsOpacity = 1;
  } else {
    actionsOpacity =
      (progress - HERO_SCROLL_CONFIG.ACTIONS_FADE_START) /
      (HERO_SCROLL_CONFIG.ACTIONS_FADE_END - HERO_SCROLL_CONFIG.ACTIONS_FADE_START);
  }

  // Scroll cue opacity: 1 until p = 0.04, falling to 0 at p = 0.14
  let scrollHintOpacity = 1;
  if (progress <= HERO_SCROLL_CONFIG.SCROLL_HINT_FADE_START) {
    scrollHintOpacity = 1;
  } else if (progress >= HERO_SCROLL_CONFIG.SCROLL_HINT_FADE_END) {
    scrollHintOpacity = 0;
  } else {
    scrollHintOpacity =
      (HERO_SCROLL_CONFIG.SCROLL_HINT_FADE_END - progress) /
      (HERO_SCROLL_CONFIG.SCROLL_HINT_FADE_END - HERO_SCROLL_CONFIG.SCROLL_HINT_FADE_START);
  }

  // Header colour: frame covers header while frameTopOffsetPx < headerHeight
  // headerProgress is frameTopOffsetPx / headerHeight clamped to [0, 1]
  const headerProgress =
    headerHeight > 0 ? Math.min(1, Math.max(0, frameTopOffsetPx / headerHeight)) : 1;
  const headerOverPhoto = frameTopOffsetPx < headerHeight;

  return {
    progress,
    geometry: Number(g.toFixed(4)),
    step,
    frameWidthPercent: Number(frameWidthPercent.toFixed(2)),
    frameHeightPx: Number(frameHeightPx.toFixed(1)),
    frameTopOffsetPx: Number(frameTopOffsetPx.toFixed(1)),
    frameRadiusPx: Number(frameRadiusPx.toFixed(2)),
    stage1Opacity: Number(stage1Opacity.toFixed(3)),
    stage1DriftYPx: Number(stage1DriftYPx.toFixed(2)),
    stage1BlurPx: Number(stage1BlurPx.toFixed(2)),
    stage2Opacity: Number(stage2Opacity.toFixed(3)),
    stage2DriftYPx: Number(stage2DriftYPx.toFixed(2)),
    stage2BlurPx: Number(stage2BlurPx.toFixed(2)),
    actionsOpacity: Number(actionsOpacity.toFixed(3)),
    actionsTopPx: Number(actionsTopPx.toFixed(1)),
    scrollHintOpacity: Number(scrollHintOpacity.toFixed(3)),
    mediaZoom: Number(mediaZoom.toFixed(3)),
    headerProgress: Number(headerProgress.toFixed(3)),
    headerOverPhoto,
  };
}
