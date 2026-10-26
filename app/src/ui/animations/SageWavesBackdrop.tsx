/**
 * SageWavesBackdrop.tsx – Shared sage gradient waves backdrop for Landing & Onboarding.
 * Reusable component wrapping GradientWaves with memoization, reduced-motion fallback,
 * and WebGL error boundary.
 */

import React, { useState, useEffect } from 'react';
import { GradientWaves } from './GradientWaves';

export interface SageWavesBackdropProps {
  isMobile?: boolean;
  mouseInteraction?: boolean;
  swellOnClick?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const SageWavesBackdrop = React.memo(function SageWavesBackdrop({
  isMobile: propIsMobile,
  mouseInteraction = false,
  swellOnClick = false,
  className = '',
  style,
}: SageWavesBackdropProps): React.ReactElement {
  const [mounted, setMounted] = useState<boolean>(false);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [prefersReduced, setPrefersReduced] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? (propIsMobile ?? window.innerWidth < 768) : false
  );

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (typeof window.matchMedia === 'function') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReduced(mq.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
      mq.addEventListener?.('change', listener);
      return () => mq.removeEventListener?.('change', listener);
    }
  }, []);

  // Update mobile detection if prop not explicitly provided
  useEffect(() => {
    if (propIsMobile !== undefined || typeof window === 'undefined') return;
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [propIsMobile]);

  // Check WebGL support
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (
      (typeof navigator !== 'undefined' && navigator.userAgent.includes('jsdom')) ||
      typeof window.WebGLRenderingContext === 'undefined'
    ) {
      setHasWebGL(false);
      return;
    }
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) {
        setHasWebGL(false);
      }
    } catch {
      setHasWebGL(false);
    }
  }, []);

  // Delay mount until after initial paint (100ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Static CSS gradient fallback for reduced-motion or unsupported WebGL
  const staticGradientStyle: React.CSSProperties = {
    background:
      'linear-gradient(180deg, var(--lm-bg) 0%, var(--lm-sage-100) 50%, var(--lm-sage-200) 100%)',
    opacity: 0.85,
  };

  if (prefersReduced || !hasWebGL) {
    return (
      <div
        aria-hidden="true"
        data-testid="sage-waves-static"
        className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
        style={{ ...staticGradientStyle, ...style }}
      />
    );
  }

  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
        style={style}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      data-testid="sage-waves-animated"
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
      style={{ opacity: 0.85, ...style }}
    >
      <GradientWaves
        lightMode={true}
        backgroundColor="transparent"
        horizonColor="rgb(181, 205, 176)" // sage-300
        waveColor="rgb(127, 160, 122)" // sage-500
        crestColor="rgb(255, 255, 255)"
        speed={0.25}
        amplitude={2.0}
        waveScale={0.5}
        relief={0.8}
        sheen={0.15}
        brightness={1.0}
        opacity={0.85}
        grain={0.12}
        intro={true}
        mouseInteraction={mouseInteraction}
        parallaxStrength={mouseInteraction ? 0.3 : 0}
        mouseStrength={mouseInteraction ? 0.5 : 0}
        swellOnClick={swellOnClick}
        quality={isMobile ? 'low' : 'medium'}
        dpr={isMobile ? 1.25 : 1.5}
      />
    </div>
  );
});

export default SageWavesBackdrop;
