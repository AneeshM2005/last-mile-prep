/**
 * heroScroll.ts – Pure calculation of Landing hero shrink and cross-fade states.
 * Maps scroll progress p in [0, 1] to frame geometry, text opacities, and header styles.
 * Eased with cubic-bezier(0.22, 1, 0.36, 1).
 */

export interface HeroStateOptions {
  isMobile?: boolean;
  viewportHeight?: number;
}

export interface HeroState {
  progress: number;
  easedProgress: number;
  frameWidthPercent: number;
  frameHeightVh: number;
  frameRadiusPx: number;
  stage1Opacity: number;
  stage2Opacity: number;
  actionsOpacity: number;
  scrollHintOpacity: number;
  headerProgress: number;
}

/**
 * Standard cubic bezier approximation for cubic-bezier(0.22, 1, 0.36, 1).
 * Smooth ease-out deceleration with no overshoot.
 */
export function cubicBezierEaseOut(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  // Exact cubic bezier for (0.22, 1, 0.36, 1) evaluated at parameter u
  // High-fidelity closed approximation: fast ease-out
  const p1 = 0.22;
  const p2 = 0.36;
  // B(u) = 3(1-u)^2 * u * 1 + 3(1-u) * u^2 * 1 + u^3
  // Since y1=1 and y2=1, y(u) = 3u(1-u) + u^3 = 3u - 3u^2 + u^3 = 1 - (1-u)^3
  // For x(u) with x1=0.22, x2=0.36:
  // Accurate Newton-Raphson inversion for u given t = x:
  let u = clamped;
  for (let i = 0; i < 4; i++) {
    const x = 3 * (1 - u) * (1 - u) * u * p1 + 3 * (1 - u) * u * u * p2 + u * u * u;
    const dx = 3 * (1 - u) * (1 - u) * p1 + 6 * (1 - u) * u * (p2 - p1) + 3 * u * u * (1 - p2);
    if (Math.abs(dx) < 1e-6) break;
    u -= (x - clamped) / dx;
    u = Math.max(0, Math.min(1, u));
  }
  // y(u) with y1=1, y2=1:
  return 3 * (1 - u) * (1 - u) * u * 1 + 3 * (1 - u) * u * u * 1 + u * u * u;
}

/**
 * Pure function mapping scroll progress p in [0, 1] to hero visual states.
 */
export function calculateHeroState(rawProgress: number, options: HeroStateOptions = {}): HeroState {
  const progress = Math.max(0, Math.min(1, rawProgress));
  const eased = cubicBezierEaseOut(progress);

  const isMobile = Boolean(options.isMobile);
  const maxRadius = isMobile ? 24 : 32;

  // Frame width: from 100% full screen to 88% inset
  const frameWidthPercent = 100 - eased * 12;

  // Frame height: from 100vh full screen to 56vh (or 48vh on mobile / short screens)
  const targetHeightVh = isMobile || (options.viewportHeight && options.viewportHeight < 680) ? 48 : 56;
  const frameHeightVh = 100 - eased * (100 - targetHeightVh);

  // Border radius: from 0px square corners to maxRadius (32px laptop, 24px mobile)
  const frameRadiusPx = eased * maxRadius;

  // Stage 1 text: 100% -> 0% between progress 0.15 and 0.50
  let stage1Opacity = 1;
  if (progress <= 0.15) {
    stage1Opacity = 1;
  } else if (progress >= 0.50) {
    stage1Opacity = 0;
  } else {
    stage1Opacity = (0.50 - progress) / (0.50 - 0.15);
  }

  // Stage 2 text: 0% -> 100% between progress 0.40 and 0.85
  let stage2Opacity = 0;
  if (progress <= 0.40) {
    stage2Opacity = 0;
  } else if (progress >= 0.85) {
    stage2Opacity = 1;
  } else {
    stage2Opacity = (progress - 0.40) / (0.85 - 0.40);
  }

  // Outside actions (Get started button + privacy line): 0% -> 100% between 0.75 and 1.00
  let actionsOpacity = 0;
  if (progress <= 0.75) {
    actionsOpacity = 0;
  } else if (progress >= 1.00) {
    actionsOpacity = 1;
  } else {
    actionsOpacity = (progress - 0.75) / (1.00 - 0.75);
  }

  // Scroll hint: fades out quickly between 0 and 0.25
  const scrollHintOpacity = Math.max(0, Math.min(1, 1 - progress * 4));

  // Header progress for cross-fade from paper-white to ink
  const headerProgress = Math.max(0, Math.min(1, (progress - 0.5) / 0.4));

  return {
    progress,
    easedProgress: eased,
    frameWidthPercent: Number(frameWidthPercent.toFixed(2)),
    frameHeightVh: Number(frameHeightVh.toFixed(2)),
    frameRadiusPx: Number(frameRadiusPx.toFixed(2)),
    stage1Opacity: Number(stage1Opacity.toFixed(3)),
    stage2Opacity: Number(stage2Opacity.toFixed(3)),
    actionsOpacity: Number(actionsOpacity.toFixed(3)),
    scrollHintOpacity: Number(scrollHintOpacity.toFixed(3)),
    headerProgress: Number(headerProgress.toFixed(3)),
  };
}
