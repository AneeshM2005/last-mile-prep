/**
 * ScrollExpand.tsx – Scroll-driven expanding media frame from React Bits.
 * Opens an inset framed view into a panoramic full-stage hero experience as the user scrolls.
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
  alt = 'Scenic panorama',
  title,
  scrollHint = 'Scroll to explore',
  useWindowScroll = true,
  mediaZoom = 1.15,
  children,
  className = '',
  style,
}: ScrollExpandProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate progress between entering viewport and passing halfway
      const totalDist = windowHeight * 0.75;
      const current = Math.max(0, -rect.top);
      const ratio = Math.min(1, Math.max(0, current / totalDist));
      setProgress(ratio);
    };

    if (useWindowScroll) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [useWindowScroll]);

  // Interpolated visual values
  const frameWidth = 88 + progress * 12; // 88% -> 100%
  const borderRadius = Math.max(0, 32 * (1 - progress)); // 32px -> 0px
  const scale = 1 + progress * (mediaZoom - 1); // 1.0 -> mediaZoom
  const overlayOpacity = Math.max(0.2, 0.45 - progress * 0.25);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden transition-all duration-100 ${className}`}
      style={style}
    >
      {/* Outer frame container that expands on scroll */}
      <div
        className="mx-auto relative overflow-hidden transition-all duration-150 ease-out shadow-2xl"
        style={{
          width: `${frameWidth}%`,
          borderRadius: `${borderRadius}px`,
          minHeight: '440px',
          maxHeight: '680px',
          height: '65vh',
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

        {/* Ambient tint overlay for readability */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            backgroundColor: 'rgb(10, 13, 20)',
            opacity: overlayOpacity,
          }}
        />

        {/* Gradient vignette around edges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Title Badge / Header if provided */}
        {title && (
          <div className="absolute top-6 left-6 z-20">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-white/20 backdrop-blur-md text-white border border-white/20 shadow-sm">
              {title}
            </span>
          </div>
        )}

        {/* Scroll Hint */}
        {scrollHint && progress < 0.6 && (
          <div
            className="absolute bottom-6 right-6 z-20 flex items-center gap-2 text-xs font-medium text-white/80 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 transition-opacity duration-300 pointer-events-none"
            style={{ opacity: 1 - progress * 1.6 }}
          >
            <span>{scrollHint}</span>
            <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
          </div>
        )}

        {/* Children overlay content */}
        {children && (
          <div className="relative z-10 w-full h-full flex flex-col justify-end p-6 sm:p-10 md:p-14 text-white">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

export default ScrollExpand;
