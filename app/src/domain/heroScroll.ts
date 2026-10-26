/**
 * heroScroll.ts – Pure calculation of Landing hero shrink and cross-fade states.
 * Driven by raw progress p in [0, 1] linear in scroll.
 * Uses smootherstep (6t^5 - 15t^4 + 10t^3) for geometry only.
 */

export interface HeroStateOptions {
  viewportWidth?: number;
  viewportHeight?: number;
  finalHeight?: number;
  maxRadius?: number;
}

export interface HeroState {
  progress: number;
  geometry: number;
  frameWidthPercent: number;
  frameHeightPx: number;
  frameRadiusPx: number;
  stage1Opacity: number;
  stage2Opacity: number;
  actionsOpacity: number;
  scrollHintOpacity: number;
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
 * - g = 0 for p <= 0.03 (dead zone so picture stays full screen on initial touch)
 * - smootherstep for 0.03 < p < 0.72
 * - g = 1 for p >= 0.72
 */
export function calculateHeroGeometry(rawProgress: number): number {
  if (rawProgress <= 0.03) return 0;
  if (rawProgress >= 0.72) return 1;
  const t = (rawProgress - 0.03) / 0.69;
  return smootherstep(t);
}

/**
 * Pure function mapping scroll progress p in [0, 1] to hero visual states.
 */
export function calculateHeroState(rawProgress: number, options: HeroStateOptions = {}): HeroState {
  const progress = Math.max(0, Math.min(1, rawProgress));
  const g = calculateHeroGeometry(progress);

  const vpWidth = options.viewportWidth ?? 1280;
  const vpHeight = options.viewportHeight ?? 800;

  // Max radius: clamp(24px, 3vw, 32px)
  const computedMaxRadius = options.maxRadius ?? Math.max(24, Math.min(32, vpWidth * 0.03));
  const frameRadiusPx = g * computedMaxRadius;

  // Frame width: 100 -> 88% using geometry g
  const frameWidthPercent = 100 - 12 * g;

  // Frame height: linear from full viewport height to finalHeight using geometry g
  const finalHeight = options.finalHeight ?? Math.max(260, Math.min(640, vpHeight - 80 - 72 - 48));
  const frameHeightPx = vpHeight - g * (vpHeight - finalHeight);

  // Stage 1 text opacity: 1 until p = 0.10, falling linearly to 0 at p = 0.38
  let stage1Opacity = 1;
  if (progress <= 0.10) {
    stage1Opacity = 1;
  } else if (progress >= 0.38) {
    stage1Opacity = 0;
  } else {
    stage1Opacity = (0.38 - progress) / 0.28;
  }

  // Stage 2 text opacity: 0 until p = 0.34, rising linearly to 1 at p = 0.70, stays 1
  let stage2Opacity = 0;
  if (progress <= 0.34) {
    stage2Opacity = 0;
  } else if (progress >= 0.70) {
    stage2Opacity = 1;
  } else {
    stage2Opacity = (progress - 0.34) / 0.36;
  }

  // Actions (button + privacy line) opacity: 0 until p = 0.62, rising linearly to 1 at p = 0.85, stays 1
  let actionsOpacity = 0;
  if (progress <= 0.62) {
    actionsOpacity = 0;
  } else if (progress >= 0.85) {
    actionsOpacity = 1;
  } else {
    actionsOpacity = (progress - 0.62) / 0.23;
  }

  // Scroll hint opacity: 1 until p = 0.02, falling linearly to 0 at p = 0.12
  let scrollHintOpacity = 1;
  if (progress <= 0.02) {
    scrollHintOpacity = 1;
  } else if (progress >= 0.12) {
    scrollHintOpacity = 0;
  } else {
    scrollHintOpacity = (0.12 - progress) / 0.10;
  }

  // Header colour progress: driven by geometry g: 0 until g = 0.15, rising to 1 at g = 0.40
  let headerProgress = 0;
  if (g <= 0.15) {
    headerProgress = 0;
  } else if (g >= 0.40) {
    headerProgress = 1;
  } else {
    headerProgress = (g - 0.15) / 0.25;
  }

  // Header is over photo while headerProgress < 0.5 (or g < 0.275)
  const headerOverPhoto = headerProgress < 0.5;

  return {
    progress,
    geometry: Number(g.toFixed(4)),
    frameWidthPercent: Number(frameWidthPercent.toFixed(2)),
    frameHeightPx: Number(frameHeightPx.toFixed(1)),
    frameRadiusPx: Number(frameRadiusPx.toFixed(2)),
    stage1Opacity: Number(stage1Opacity.toFixed(3)),
    stage2Opacity: Number(stage2Opacity.toFixed(3)),
    actionsOpacity: Number(actionsOpacity.toFixed(3)),
    scrollHintOpacity: Number(scrollHintOpacity.toFixed(3)),
    headerProgress: Number(headerProgress.toFixed(3)),
    headerOverPhoto,
  };
}
