/**
 * SpecularButton.tsx – Mouse-following specular highlight & reflective glow button from React Bits.
 * Tuned for Last Mile light editorial aesthetic (sage-900 deep base, white text, pill radius).
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';

export interface SpecularButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  textColor?: string;
  lineColor?: string;
  baseColor?: string;
  intensity?: number;
  idleIntensity?: number;
  shineSize?: number;
  shineFade?: number;
  thickness?: number;
  glow?: number;
  followMouse?: boolean;
  proximity?: number;
  className?: string;
}

export function SpecularButton({
  children,
  size = 'md',
  radius = 9999,
  tint = 'rgb(255, 255, 255)',
  tintOpacity = 0.04,
  textColor = 'rgb(255, 255, 255)',
  lineColor = 'rgb(255, 255, 255)',
  baseColor = 'rgb(47, 74, 50)', // sage-900
  intensity = 1,
  idleIntensity = 0.25,
  shineSize = 10,
  shineFade = 34,
  thickness = 1.2,
  glow = 0.6,
  followMouse = true,
  proximity = 250,
  className = '',
  onClick,
  disabled = false,
  ...rest
}: SpecularButtonProps): React.ReactElement {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [currentIntensity, setCurrentIntensity] = useState<number>(idleIntensity);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const isInteractive = !disabled;

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!buttonRef.current || !followMouse || !isInteractive) return;
      if (typeof window !== 'undefined') {
        const canHover = window.matchMedia('(hover: hover)').matches;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!canHover || reduced) return;
      }

      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);

      if (dist < proximity) {
        const factor = Math.max(0, 1 - dist / proximity);
        setCurrentIntensity(idleIntensity + (intensity - idleIntensity) * factor);
        const relX = ((e.clientX - rect.left) / rect.width) * 100;
        const relY = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePos({ x: relX, y: relY });
      } else {
        setCurrentIntensity(idleIntensity);
      }
    },
    [followMouse, idleIntensity, intensity, isInteractive, proximity],
  );

  useEffect(() => {
    if (!isInteractive) return;
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [handlePointerMove, isInteractive]);

  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  }[size];

  if (disabled) {
    return (
      <button
        ref={buttonRef}
        type="button"
        disabled
        aria-disabled="true"
        style={{
          borderRadius: `${radius}px`,
          backgroundColor: 'rgb(210, 226, 205)', // sage-200
          color: 'rgb(94, 90, 85)', // muted
        }}
        className={`relative inline-flex items-center justify-center font-semibold tracking-tight select-none opacity-60 cursor-not-allowed ${sizeClasses} ${className}`}
        {...rest}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
      </button>
    );
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderRadius: `${radius}px`,
        backgroundColor: baseColor,
        color: textColor,
        boxShadow:
          glow > 0
            ? `0 4px 14px rgba(47, 74, 50, ${0.12 + currentIntensity * 0.1})`
            : undefined,
      }}
      className={`relative inline-flex items-center justify-center font-semibold tracking-tight transition-all duration-200 select-none overflow-hidden cursor-pointer group active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lm-sage-700,rgb(75,111,77))] ${sizeClasses} ${className}`}
      {...rest}
    >
      {/* Dynamic Specular Border Glow */}
      <span
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          borderRadius: `${radius}px`,
          padding: `${thickness}px`,
          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, ${lineColor} 0%, transparent ${shineFade}%)`,
          WebkitMask:
            'linear-gradient(white 0 0) content-box, linear-gradient(white 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          opacity: isHovered ? intensity : currentIntensity,
        }}
      />

      {/* Internal Radial Sheen Highlight */}
      <span
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 mix-blend-overlay"
        style={{
          borderRadius: `${radius}px`,
          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, ${tint} 0%, transparent ${shineSize * 4}%)`,
          opacity: (isHovered ? 0.35 : tintOpacity) * currentIntensity,
        }}
      />

      {/* Background tint overlay */}
      <span
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          borderRadius: `${radius}px`,
          backgroundColor: tint,
          opacity: isHovered ? tintOpacity * 2 : tintOpacity,
        }}
      />

      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}

export default SpecularButton;
