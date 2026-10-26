/**
 * ScrollExpand.tsx – Scroll-driven expanding media frame from React Bits.
 * Opens an inset framed view into a panoramic full-stage hero experience as the user scrolls.
 * Tuned for Last Mile light editorial aesthetic (paper plaque, no dark gradients, 32px radius laptop, 24px phone).
 */

import React, { useRef, useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface ScrollExpandProps {
  src: string;
  alt?: string;
  title?: string;
  scrollHint?: string;
  useWindowScroll?: boolean;
  mediaZoom?: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function ScrollExpand({
  src,
  alt = 'Peaceful scenic view from a train window looking out over mountain peaks and green meadows',
  title,
  scrollHint = 'Scroll',
  useWindowScroll = true,
  mediaZoom = 1.15,
  children,
  className = '',
  style,
}: ScrollExpandProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [prefersReduced, setPrefersReduced] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReduced(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
      mediaQuery.addEventListener?.('change', listener);
      return () => mediaQuery.removeEventListener?.('change', listener);
    }
  }, []);

  useEffect(() => {
    if (prefersReduced) {
      setProgress(0);
      return;
    }

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight || 800;

      // Expansion begins only when user scrolls past top of container
      const totalDist = windowHeight * 0.7;
      const scrolledPast = Math.max(0, -rect.top);
      const ratio = Math.min(1, Math.max(0, scrolledPast / totalDist));
      setProgress(ratio);
    };

    if (useWindowScroll) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [useWindowScroll, prefersReduced]);

  // Framed values
  // Inset width: 88% -> 100% on scroll
  const frameWidth = prefersReduced ? 88 : 88 + progress * 12;
  // Border radius: 32px laptop, 24px phone -> 0px when expanded
  const maxRadius = typeof window !== 'undefined' && window.innerWidth < 640 ? 24 : 32;
  const borderRadius = prefersReduced ? maxRadius : Math.max(0, maxRadius * (1 - progress));
  const scale = prefersReduced ? 1.0 : 1 + progress * (mediaZoom - 1);

  return (
    <div
      ref={containerRef}
      data-testid="scroll-expand-container"
      className={`relative w-full overflow-hidden transition-all duration-100 ${className}`}
      style={style}
    >
      {/* Outer frame container that expands on scroll */}
      <div
        data-testid="scroll-expand-frame"
        className="mx-auto relative overflow-hidden transition-all duration-150 ease-out shadow-[var(--lm-shadow-card)] border border-[var(--lm-sage-200)]"
        style={{
          width: `${frameWidth}%`,
          borderRadius: `${borderRadius}px`,
          minHeight: '440px',
          maxHeight: '680px',
          height: '66vh',
        }}
      >
        {/* Background Image / Media with zoom */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-200 ease-out will-change-transform"
          style={{
            backgroundImage: `url(${src})`,
            transform: `scale(${scale})`,
          }}
          role="img"
          aria-label={alt}
        />

        {/* Soft light scrim over photo for consistent text contrast */}
        <div
          className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
          style={{
            backgroundColor: 'rgba(251, 252, 249, 0.18)',
          }}
        />

        {/* Title Paper Plaque: 88% opaque paper with ink text, no blur, guaranteed >= 4.5:1 contrast */}
        {title && (
          <div className="absolute top-6 left-6 z-20 max-w-[85%] sm:max-w-md">
            <div
              className="px-5 py-3 rounded-[var(--lm-radius-card)] border border-[var(--lm-sage-200)] shadow-sm"
              style={{
                backgroundColor: 'rgba(251, 252, 249, 0.90)',
                color: 'var(--lm-ink)',
              }}
            >
              <span className="text-xs uppercase tracking-widest font-bold text-[var(--lm-sage-700)] block mb-0.5">
                Last Mile CAT Prep
              </span>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold font-serif leading-snug m-0">
                {title}
              </h1>
            </div>
          </div>
        )}

        {/* Scroll Hint (visible until user has scrolled) */}
        {scrollHint && !prefersReduced && progress < 0.4 && (
          <div
            className="absolute bottom-6 right-6 z-20 flex items-center gap-2 text-xs font-semibold text-[var(--lm-ink)] px-4 py-2 rounded-full border border-[var(--lm-sage-200)] shadow-sm transition-opacity duration-300 pointer-events-none"
            style={{
              backgroundColor: 'rgba(251, 252, 249, 0.92)',
              opacity: 1 - progress * 2.5,
            }}
          >
            <span>{scrollHint}</span>
            <ChevronDown className="w-3.5 h-3.5 animate-bounce text-[var(--lm-sage-700)]" />
          </div>
        )}

        {/* Children overlay content (revealed as frame opens or always in reduced motion) */}
        {children && (
          <div
            className="relative z-10 w-full h-full flex flex-col justify-end p-6 sm:p-10 md:p-12 transition-opacity duration-300"
            style={{
              opacity: prefersReduced ? 1 : Math.max(0, (progress - 0.3) / 0.7),
              pointerEvents: prefersReduced || progress > 0.4 ? 'auto' : 'none',
            }}
          >
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

export default ScrollExpand;
