/**
 * ScrollExpand.tsx – Scroll-driven shrinking hero media frame.
 * Starts full screen at scroll 0, then shrinks smoothly into a centered framed picture
 * as the visitor scrolls down.
 *
 * Headline text stays inside the picture the whole time, swapping from Stage 1 to Stage 2.
 * The primary Get started button and privacy line sit outside the picture, below the frame.
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { calculateHeroState, type HeroState } from '../../domain/heroScroll';

export interface ScrollExpandProps {
  src: string;
  alt?: string;
  title?: string;
  eyebrowStage1?: string;
  eyebrowStage2?: string;
  stage2Text?: string;
  scrollHint?: string;
  useWindowScroll?: boolean;
  mediaZoom?: number;
  scrollDistance?: number;
  actionsSlot?: React.ReactNode;
  children?: React.ReactNode;
  headerProgressCallback?: (progress: number) => void;
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
  useWindowScroll = true,
  mediaZoom = 1.0,
  scrollDistance,
  actionsSlot,
  children,
  headerProgressCallback,
  className = '',
  style,
}: ScrollExpandProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const [heroState, setHeroState] = useState<HeroState>(() =>
    calculateHeroState(0, {
      isMobile: typeof window !== 'undefined' && window.innerWidth < 640,
      viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 800,
    })
  );
  const [prefersReduced, setPrefersReduced] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);

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

  // Update scroll state calculation
  const updateScroll = useCallback(() => {
    if (prefersReduced || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight || 800;
    const isMobile = window.innerWidth < 640;

    // Scroll distance defaults to 1.1x screen height
    const dist = scrollDistance ?? windowHeight * 1.1;

    // Scrolled distance from container top reaching viewport top
    const scrolledPast = Math.max(0, -rect.top);
    const rawRatio = Math.min(1, Math.max(0, scrolledPast / dist));

    const nextState = calculateHeroState(rawRatio, {
      isMobile,
      viewportHeight: windowHeight,
    });

    setHeroState(nextState);
    if (headerProgressCallback) {
      headerProgressCallback(nextState.headerProgress);
    }
  }, [prefersReduced, scrollDistance, headerProgressCallback]);

  // Window scroll listener with requestAnimationFrame throttling
  useEffect(() => {
    if (prefersReduced || !useWindowScroll) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(() => {
          updateScroll();
          ticking = false;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    updateScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [useWindowScroll, prefersReduced, updateScroll]);

  // Handle keyboard focus on actions (scroll to reveal if hidden)
  const handleFocusActions = () => {
    if (heroState.progress < 0.95 && containerRef.current) {
      const windowHeight = window.innerHeight || 800;
      const dist = scrollDistance ?? windowHeight * 1.1;
      const targetTop = containerRef.current.offsetTop + dist;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    }
  };

  const actionElements = actionsSlot || children;

  // Reduced motion: static fallback with page flowing naturally
  if (prefersReduced) {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const maxRadius = isMobile ? 24 : 32;

    return (
      <div
        ref={containerRef}
        data-testid="scroll-expand-container"
        className={`w-full flex flex-col items-center py-6 px-4 ${className}`}
        style={style}
      >
        {/* Stage 1 headline statically on page canvas */}
        <div className="w-full max-w-[850px] text-center pt-2 pb-6 px-4">
          <span className="font-mono text-xs uppercase tracking-widest font-semibold text-[var(--lm-sage-700)] block mb-2">
            {eyebrowStage1}
          </span>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl text-[var(--lm-ink)] leading-snug m-0">
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
            minHeight: '380px',
            height: isMobile ? '48vh' : '56vh',
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
          <div className="relative z-10 max-w-[640px] flex flex-col items-center justify-center">
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
              className="font-sans text-base sm:text-lg font-normal leading-relaxed m-0 text-pretty"
              style={{
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

  // Standard scroll-driven experience
  const dist = scrollDistance ?? (typeof window !== 'undefined' ? window.innerHeight * 1.1 : 900);

  return (
    <div
      ref={containerRef}
      data-testid="scroll-expand-container"
      className={`relative w-full ${className}`}
      style={{
        height: `calc(100vh + ${dist}px)`,
        ...style,
      }}
    >
      {/* Hidden image element to detect load error gracefully with no console errors */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="hidden"
        onError={() => setImgError(true)}
      />

      {/* Sticky viewport frame container */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        {/* The shrinking media frame */}
        <div
          data-testid="scroll-expand-frame"
          className="relative overflow-hidden transition-all duration-75 ease-out shadow-[var(--lm-shadow-card)] flex flex-col items-center justify-center"
          style={{
            width: `${heroState.frameWidthPercent}%`,
            height: `${heroState.frameHeightVh}vh`,
            borderRadius: `${heroState.frameRadiusPx}px`,
            maxWidth: heroState.progress > 0.05 ? 'calc(100vw - 32px)' : '100vw',
            border: heroState.frameRadiusPx > 4 ? '1px solid var(--lm-sage-200)' : 'none',
          }}
        >
          {/* Background image / media with subtle edge scale guard */}
          <div
            className="absolute inset-0 w-full h-full bg-cover transition-transform duration-100 ease-out will-change-transform"
            style={{
              backgroundImage: imgError ? 'var(--lm-sky-fallback)' : `url(${src})`,
              backgroundPosition: '50% 40%',
              transform: `scale(${1 + (mediaZoom - 1) * heroState.easedProgress})`,
            }}
            role="img"
            aria-label={alt || undefined}
          />

          {/* Gentle, uniform sage-tinted wash over the photo (stays on throughout shrink) */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-150"
            style={{
              backgroundColor: imgError ? 'transparent' : 'var(--lm-hero-tint)',
            }}
            aria-hidden="true"
          />

          {/* Centered text groups inside the picture */}
          <div className="relative z-10 w-full h-full flex items-center justify-center p-6 sm:p-10">
            {/* Stage 1: Eyebrow + Headline */}
            <div
              data-testid="hero-stage-1"
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 sm:p-10 transition-opacity duration-100"
              style={{
                opacity: heroState.stage1Opacity,
                pointerEvents: heroState.stage1Opacity > 0.4 ? 'auto' : 'none',
              }}
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
                className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[52px] leading-[1.18] tracking-tight max-w-[850px] m-0 text-balance px-4"
                style={{
                  color: imgError ? 'var(--lm-ink)' : 'var(--lm-bg)',
                  textShadow: imgError ? 'none' : 'var(--lm-hero-text-shadow)',
                }}
              >
                {title}
              </h1>
            </div>

            {/* Stage 2: Eyebrow + Body sentence */}
            <div
              data-testid="hero-stage-2"
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 sm:p-10 transition-opacity duration-100"
              style={{
                opacity: heroState.stage2Opacity,
                pointerEvents: heroState.stage2Opacity > 0.4 ? 'auto' : 'none',
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
                className="font-sans text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-[640px] m-0 text-pretty px-4"
                style={{
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
              data-testid="hero-scroll-hint"
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase px-4 py-2 pointer-events-none transition-opacity duration-100"
              style={{
                opacity: heroState.scrollHintOpacity,
                color: imgError ? 'var(--lm-ink)' : 'var(--lm-bg)',
                textShadow: imgError ? 'none' : 'var(--lm-hero-text-shadow)',
              }}
            >
              <span>{scrollHint}</span>
              <ChevronDown className="w-4 h-4 animate-bounce" />
            </div>
          )}
        </div>

        {/* Outside actions (Get started button and privacy line) below the framed picture */}
        {actionElements && (
          <div
            ref={actionsRef}
            data-testid="hero-actions"
            onFocus={handleFocusActions}
            className="w-full flex flex-col items-center justify-center pt-4 sm:pt-6 transition-opacity duration-150 px-4"
            style={{
              opacity: heroState.actionsOpacity,
              pointerEvents: heroState.actionsOpacity > 0.2 ? 'auto' : 'none',
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
