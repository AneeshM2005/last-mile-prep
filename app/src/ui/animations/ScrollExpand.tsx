/**
 * ScrollExpand.tsx – Pinned scroll-shrinking hero media frame.
 * Starts full screen at scroll 0, then smoothly shrinks into an inset framed picture
 * as the visitor scrolls down.
 *
 * Three-step cinematic transition driven by raw scroll progress p (0 to 1, linear in scroll):
 * - Step 1 (Arrive, p: 0 -> 0.12): Full screen edge-to-edge, square corners, Stage 1 text centred.
 * - Step 2 (Transition, p: 0.12 -> 0.70): Frame shrinks to 88% width, height & top offset move down
 *   below the header, radius rounds to 32px/24px. Stage 1 dissolves upward into soft blur while
 *   Stage 2 dissolves in with slight rise and de-blur. Image settles from 1.06 to 1.0 zoom.
 * - Step 3 (Settle, p: 0.70 -> 1.0): Frame holds still. Actions fade in (0.62 -> 0.82).
 *   Holds pinned for ~0.6 viewport height after p = 1.
 *
 * Zero React re-renders during scrolling: writes CSS custom properties on requestAnimationFrame.
 * Positions frame and actions out of normal flow (absolute) so actions never shrink the frame.
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  calculateHeroState,
  HERO_SCROLL_CONFIG,
} from '../../domain/heroScroll';

export interface ScrollExpandProps {
  src: string;
  alt?: string;
  title?: string;
  eyebrowStage1?: string;
  eyebrowStage2?: string;
  stage2Text?: string;
  scrollHint?: string;
  /**
   * Scroll runway distance for the shrink animation as a multiple of the viewport height.
   * Defaults to HERO_SCROLL_CONFIG.SHRINK_DISTANCE_MULTIPLE (1.6).
   * A hold distance of HERO_SCROLL_CONFIG.HOLD_DISTANCE_MULTIPLE (0.6) is added after.
   */
  scrollDistance?: number;
  useWindowScroll?: boolean;
  mediaZoom?: number;
  actionsSlot?: React.ReactNode;
  children?: React.ReactNode;
  headerHeight?: number;
  /**
   * Callback notifying parent whether the header is currently over the photo (true)
   * or over the pale page canvas (false). Invoked only when the boolean state changes.
   */
  headerProgressCallback?: (headerOverPhoto: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function ScrollExpand({
  src,
  alt = '',
  title = 'The last stretch, one steady step at a time.',
  eyebrowStage1 = 'LAST MILE CAT PREP',
  eyebrowStage2 = 'A CALMER APPROACH TO CAT',
  stage2Text = 'Strategy, timing and a calmer routine for the final weeks before CAT. Built from your own practice.',
  scrollHint = 'Scroll',
  scrollDistance = HERO_SCROLL_CONFIG.SHRINK_DISTANCE_MULTIPLE,
  useWindowScroll = true,
  mediaZoom,
  actionsSlot,
  children,
  headerHeight: propHeaderHeight,
  headerProgressCallback,
  className = '',
  style,
}: ScrollExpandProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const stage1Ref = useRef<HTMLDivElement | null>(null);
  const stage2Ref = useRef<HTMLDivElement | null>(null);
  const hintRef = useRef<HTMLDivElement | null>(null);

  const [prefersReduced, setPrefersReduced] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);
  const [actionsHeight, setActionsHeight] = useState<number>(HERO_SCROLL_CONFIG.DEFAULT_ACTIONS_HEIGHT);
  const [measuredHeaderHeight, setMeasuredHeaderHeight] = useState<number>(HERO_SCROLL_CONFIG.DEFAULT_HEADER_HEIGHT);
  const [viewportDims, setViewportDims] = useState<{ width: number; height: number }>(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  }));

  // Effective header height
  const effectiveHeaderHeight =
    typeof propHeaderHeight === 'number' && propHeaderHeight > 0
      ? propHeaderHeight
      : measuredHeaderHeight;

  // Store latest callback in ref to prevent scroll listener churn
  const headerCallbackRef = useRef(headerProgressCallback);
  headerCallbackRef.current = headerProgressCallback;
  const lastHeaderOverPhotoRef = useRef<boolean>(true);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReduced(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
      mediaQuery.addEventListener?.('change', listener);
      return () => mediaQuery.removeEventListener?.('change', listener);
    }
  }, []);

  // Measure fixed header height with ResizeObserver
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const headerEl = document.querySelector('header');
    if (!headerEl) return;
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const h = entry.contentRect.height || entry.target.getBoundingClientRect().height;
          if (h > 0) setMeasuredHeaderHeight(Math.round(h));
        }
      });
      observer.observe(headerEl);
      return () => observer.disconnect();
    } else {
      const h = headerEl.getBoundingClientRect().height;
      if (h > 0) setMeasuredHeaderHeight(Math.round(h));
    }
  }, []);

  // Measure actions block height with ResizeObserver
  useEffect(() => {
    if (!actionsRef.current || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = entry.contentRect.height;
        if (h > 0) {
          setActionsHeight(Math.round(h));
        }
      }
    });
    observer.observe(actionsRef.current);
    return () => observer.disconnect();
  }, []);

  // Track viewport dimensions on resize and zoom
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setViewportDims({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate final frame top offset, final frame height, and layout mode
  // finalTopOffset = headerHeight + 24px
  // overhead = finalTopOffset + gap (24px) + actionsHeight + bottomMargin (24px)
  const finalTopOffset = effectiveHeaderHeight + HERO_SCROLL_CONFIG.FRAME_HEADER_GAP;
  const overhead =
    finalTopOffset +
    HERO_SCROLL_CONFIG.FRAME_ACTIONS_GAP +
    actionsHeight +
    HERO_SCROLL_CONFIG.ACTIONS_BOTTOM_MARGIN;
  const finalFrameHeight = Math.max(
    HERO_SCROLL_CONFIG.MIN_FRAME_HEIGHT,
    Math.min(HERO_SCROLL_CONFIG.MAX_FRAME_HEIGHT, viewportDims.height - overhead)
  );
  const minRequiredViewport = HERO_SCROLL_CONFIG.MIN_FRAME_HEIGHT + overhead;
  const isTooShort = viewportDims.height < minRequiredViewport;

  // Decide if static layout is required (reduced motion or short viewport)
  const isStatic = prefersReduced || isTooShort;

  // Notify header when in static layout (header sits over paper canvas)
  useEffect(() => {
    if (isStatic && headerCallbackRef.current) {
      lastHeaderOverPhotoRef.current = false;
      headerCallbackRef.current(false);
    }
  }, [isStatic]);

  const shrinkMultiple =
    typeof scrollDistance === 'number' && scrollDistance > 0
      ? scrollDistance
      : HERO_SCROLL_CONFIG.SHRINK_DISTANCE_MULTIPLE;
  const holdMultiple = HERO_SCROLL_CONFIG.HOLD_DISTANCE_MULTIPLE;
  const shrinkDistPx = Math.max(1, Math.round(viewportDims.height * shrinkMultiple));
  const holdDistPx = Math.max(1, Math.round(viewportDims.height * holdMultiple));
  const totalRunwayPx = shrinkDistPx + holdDistPx;

  // Write visual state directly to DOM through CSS properties with zero React re-renders
  const applyVisualState = useCallback((p: number) => {
    const state = calculateHeroState(p, {
      viewportWidth: viewportDims.width,
      viewportHeight: viewportDims.height,
      headerHeight: effectiveHeaderHeight,
      actionsHeight,
      finalHeight: finalFrameHeight,
    });

    if (stickyRef.current) {
      stickyRef.current.setAttribute('data-hero-step', String(state.step));
    }

    if (frameRef.current) {
      frameRef.current.style.top = `${state.frameTopOffsetPx}px`;
      frameRef.current.style.width = `${state.frameWidthPercent}%`;
      frameRef.current.style.height = `${state.frameHeightPx}px`;
      frameRef.current.style.borderRadius = `${state.frameRadiusPx}px`;
      frameRef.current.style.border = state.frameRadiusPx > 4 ? '1px solid var(--lm-sage-200)' : 'none';
    }

    if (mediaRef.current) {
      const zoomVal = typeof mediaZoom === 'number' ? mediaZoom : state.mediaZoom;
      mediaRef.current.style.transform = `scale(${zoomVal})`;
    }

    if (stage1Ref.current) {
      stage1Ref.current.style.opacity = `${state.stage1Opacity}`;
      stage1Ref.current.style.pointerEvents = state.stage1Opacity > 0.2 ? 'auto' : 'none';
      if (state.stage1Opacity <= 0) {
        stage1Ref.current.style.transform = 'none';
        stage1Ref.current.style.filter = 'none';
      } else {
        stage1Ref.current.style.transform =
          state.stage1DriftYPx !== 0 ? `translateY(${state.stage1DriftYPx}px)` : 'none';
        stage1Ref.current.style.filter =
          state.stage1BlurPx > 0 ? `blur(${state.stage1BlurPx}px)` : 'none';
      }
    }

    if (stage2Ref.current) {
      stage2Ref.current.style.opacity = `${state.stage2Opacity}`;
      stage2Ref.current.style.pointerEvents = state.stage2Opacity > 0.2 ? 'auto' : 'none';
      if (state.stage2Opacity >= 1) {
        stage2Ref.current.style.transform = 'none';
        stage2Ref.current.style.filter = 'none';
      } else if (state.stage2Opacity <= 0) {
        stage2Ref.current.style.transform = `translateY(${state.stage2DriftYPx}px)`;
        stage2Ref.current.style.filter = `blur(${state.stage2BlurPx}px)`;
      } else {
        stage2Ref.current.style.transform =
          state.stage2DriftYPx !== 0 ? `translateY(${state.stage2DriftYPx}px)` : 'none';
        stage2Ref.current.style.filter =
          state.stage2BlurPx > 0 ? `blur(${state.stage2BlurPx}px)` : 'none';
      }
    }

    if (actionsRef.current) {
      actionsRef.current.style.top = `${state.actionsTopPx}px`;
      actionsRef.current.style.opacity = `${state.actionsOpacity}`;
      actionsRef.current.style.pointerEvents = state.actionsOpacity > 0.2 ? 'auto' : 'none';
    }

    if (hintRef.current) {
      hintRef.current.style.opacity = `${state.scrollHintOpacity}`;
    }

    // Notify header only when boolean overPhoto flips
    if (state.headerOverPhoto !== lastHeaderOverPhotoRef.current) {
      lastHeaderOverPhotoRef.current = state.headerOverPhoto;
      if (headerCallbackRef.current) {
        headerCallbackRef.current(state.headerOverPhoto);
      }
    }
  }, [
    viewportDims.width,
    viewportDims.height,
    effectiveHeaderHeight,
    actionsHeight,
    finalFrameHeight,
    mediaZoom,
  ]);

  // Window scroll listener with requestAnimationFrame throttling
  useEffect(() => {
    if (isStatic || !useWindowScroll) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(() => {
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const scrolledPast = Math.max(0, -rect.top);
            // Progress is computed strictly over shrinkDistPx and clamped to 1 during hold
            const p = Math.min(1, Math.max(0, scrolledPast / shrinkDistPx));
            applyVisualState(p);
          }
          ticking = false;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Synchronously initialize visual state and then evaluate on mount
    applyVisualState(0);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isStatic, useWindowScroll, shrinkDistPx, applyVisualState]);

  // Handle keyboard focus on actions (scroll to reveal if hidden)
  const handleFocusActions = () => {
    if (containerRef.current) {
      const targetTop = containerRef.current.offsetTop + shrinkDistPx;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    }
  };

  const actionElements = actionsSlot || children;

  // ── Reduced Motion or Short Viewport: Static Natural Flow ────────────────
  if (isStatic) {
    const maxRadius = Math.max(24, Math.min(32, viewportDims.width * 0.03));

    return (
      <div
        ref={containerRef}
        data-testid="scroll-expand-container"
        className={`w-full flex flex-col items-center py-6 px-4 ${className}`}
        style={style}
      >
        {/* Stage 1 headline statically on page canvas in ink */}
        <div className="w-full max-w-[850px] text-center pt-2 pb-6 px-4">
          <span className="font-mono text-xs uppercase tracking-widest font-semibold text-[var(--lm-sage-700)] block mb-2">
            {eyebrowStage1}
          </span>
          <h1
            className="font-serif font-bold text-[var(--lm-ink)] leading-snug m-0 text-balance"
            style={{ fontSize: 'clamp(1.875rem, 4.5vw + 0.5rem, 3.25rem)' }}
          >
            {title}
          </h1>
        </div>

        {/* Framed picture at final inset size */}
        <div
          data-testid="scroll-expand-frame"
          className="relative overflow-hidden shadow-[var(--lm-shadow-card)] border border-[var(--lm-sage-200)] flex items-center justify-center text-center p-6 sm:p-10"
          style={{
            width: '88%',
            borderRadius: `${maxRadius}px`,
            minHeight: '260px',
            height: `${finalFrameHeight}px`,
            backgroundImage: imgError ? 'var(--lm-sky-fallback)' : `url(${src})`,
            backgroundSize: 'cover',
            backgroundPosition: '50% 40%',
          }}
          role="img"
          aria-label={alt || undefined}
        >
          {/* Hero tint */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: imgError ? 'transparent' : 'var(--lm-hero-tint)',
            }}
            aria-hidden="true"
          />

          {/* Stage 2 text inside framed picture */}
          <div className="relative z-10 max-w-[640px] flex flex-col items-center justify-center p-4">
            <span
              className="font-mono text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2 block"
              style={{
                color: imgError ? 'var(--lm-sage-700)' : 'var(--lm-bg)',
                textShadow: imgError ? 'none' : 'var(--lm-hero-text-shadow)',
              }}
            >
              {eyebrowStage2}
            </span>
            <p
              className="font-sans font-normal leading-relaxed m-0 text-pretty"
              style={{
                fontSize: 'clamp(1rem, 1.2vw + 0.75rem, 1.25rem)',
                color: imgError ? 'var(--lm-ink)' : 'var(--lm-bg)',
                textShadow: imgError ? 'none' : 'var(--lm-hero-text-shadow)',
              }}
            >
              {stage2Text}
            </p>
          </div>
        </div>

        {/* Actions directly below framed picture */}
        {actionElements && (
          <div className="w-full flex flex-col items-center justify-center pt-6 pb-4">
            {actionElements}
          </div>
        )}
      </div>
    );
  }

  // ── Standard Pinned Scroll-Driven Experience ─────────────────────────────
  const initialTopOffset = 0;
  const initialActionsTop = viewportDims.height + HERO_SCROLL_CONFIG.FRAME_ACTIONS_GAP;

  return (
    <div
      ref={containerRef}
      data-testid="scroll-expand-container"
      className={`relative w-full ${className}`}
      style={{
        height: `${viewportDims.height + totalRunwayPx}px`,
        ...style,
      }}
    >
      {/* Hidden image element to detect load errors with 0 console errors */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="hidden"
        onError={() => setImgError(true)}
      />

      {/* Sticky viewport frame container: top 0, pinned scene, positioned containing box */}
      <div
        ref={stickyRef}
        data-testid="scroll-expand-sticky"
        data-hero-step="1"
        className="sticky top-0 w-full overflow-hidden"
        style={{
          height: '100svh',
          minHeight: '100dvh',
        }}
      >
        {/* The shrinking media frame: absolute, out of normal flow */}
        <div
          ref={frameRef}
          data-testid="scroll-expand-frame"
          className="absolute left-1/2 -translate-x-1/2 overflow-hidden shadow-[var(--lm-shadow-card)] flex flex-col items-center justify-center"
          style={{
            top: `${initialTopOffset}px`,
            width: '100%',
            height: `${viewportDims.height}px`,
            borderRadius: '0px',
            maxWidth: '100%',
            flex: 'none',
          }}
        >
          {/* Background image: settles slowly from 1.06 to 1.0 */}
          <div
            ref={mediaRef}
            className="absolute inset-0 w-full h-full bg-cover"
            style={{
              backgroundImage: imgError ? 'var(--lm-sky-fallback)' : `url(${src})`,
              backgroundPosition: '50% 40%',
              transform: `scale(${HERO_SCROLL_CONFIG.MEDIA_ZOOM_START})`,
            }}
            role="img"
            aria-label={alt || undefined}
          />

          {/* Gentle, uniform sage-tinted wash over the photo (stays on throughout shrink) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: imgError ? 'transparent' : 'var(--lm-hero-tint)',
            }}
            aria-hidden="true"
          />

          {/* Centered text groups inside the picture */}
          <div className="relative z-10 w-full h-full flex items-center justify-center p-6 sm:p-10">
            {/* Stage 1: Eyebrow + Headline */}
            <div
              ref={stage1Ref}
              data-testid="hero-stage-1"
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 sm:p-10"
              style={{ opacity: 1, transform: 'none', filter: 'none' }}
            >
              <span
                className="font-mono text-xs sm:text-sm uppercase tracking-widest font-semibold mb-3 block"
                style={{
                  color: imgError ? 'var(--lm-sage-700)' : 'var(--lm-bg)',
                  textShadow: imgError ? 'none' : 'var(--lm-hero-text-shadow)',
                }}
              >
                {eyebrowStage1}
              </span>
              <h1
                className="font-serif font-bold leading-[1.15] tracking-tight max-w-[850px] m-0 text-balance px-4"
                style={{
                  fontSize: 'clamp(1.875rem, 4.5vw + 0.5rem, 3.25rem)',
                  color: imgError ? 'var(--lm-ink)' : 'var(--lm-bg)',
                  textShadow: imgError ? 'none' : 'var(--lm-hero-text-shadow)',
                }}
              >
                {title}
              </h1>
            </div>

            {/* Stage 2: Eyebrow + Body sentence */}
            <div
              ref={stage2Ref}
              data-testid="hero-stage-2"
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 sm:p-10"
              style={{
                opacity: 0,
                transform: `translateY(${HERO_SCROLL_CONFIG.STAGE_2_DRIFT_Y_PX}px)`,
                filter: `blur(${HERO_SCROLL_CONFIG.STAGE_2_MAX_BLUR_PX}px)`,
                pointerEvents: 'none',
              }}
            >
              <span
                className="font-mono text-xs sm:text-sm uppercase tracking-widest font-semibold mb-2 sm:mb-3 block"
                style={{
                  color: imgError ? 'var(--lm-sage-700)' : 'var(--lm-bg)',
                  textShadow: imgError ? 'none' : 'var(--lm-hero-text-shadow)',
                }}
              >
                {eyebrowStage2}
              </span>
              <p
                className="font-sans font-normal leading-relaxed max-w-[640px] m-0 text-pretty px-4"
                style={{
                  fontSize: 'clamp(1rem, 1.2vw + 0.75rem, 1.25rem)',
                  color: imgError ? 'var(--lm-ink)' : 'var(--lm-bg)',
                  textShadow: imgError ? 'none' : 'var(--lm-hero-text-shadow)',
                }}
              >
                {stage2Text}
              </p>
            </div>
          </div>

          {/* Bottom "Scroll" cue with chevron (fades out early) */}
          {scrollHint && (
            <div
              ref={hintRef}
              data-testid="hero-scroll-hint"
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase px-4 py-2 pointer-events-none"
              style={{
                opacity: 1,
                color: imgError ? 'var(--lm-ink)' : 'var(--lm-bg)',
                textShadow: imgError ? 'none' : 'var(--lm-hero-text-shadow)',
              }}
            >
              <span>{scrollHint}</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Outside actions (Get started button + privacy line) absolutely below framed picture */}
        {actionElements && (
          <div
            ref={actionsRef}
            data-testid="hero-actions"
            onFocus={handleFocusActions}
            className="absolute left-1/2 -translate-x-1/2 w-full flex flex-col items-center justify-center px-4"
            style={{
              top: `${initialActionsTop}px`,
              opacity: 0,
              pointerEvents: 'none',
            }}
          >
            {actionElements}
          </div>
        )}
      </div>
    </div>
  );
}

export default ScrollExpand;
