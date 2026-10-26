/**
 * SpecularButton.tsx – Mouse-following specular highlight & reflective glow button from React Bits.
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
  size = 'lg',
  radius = 18,
  tint = 'rgb(255, 255, 255)',
  tintOpacity = 0.04,
  textColor = 'rgb(245, 245, 245)',
  lineColor = 'rgb(255, 255, 255)',
  baseColor = 'rgb(30, 30, 36)',
  intensity = 1,
  idleIntensity = 0.35,
  shineSize = 10,
  shineFade = 34,
  thickness = 1.2,
  glow = 1,
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

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!buttonRef.current || !followMouse) return;
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
    [followMouse, idleIntensity, intensity, proximity],
  );

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [handlePointerMove]);

  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  }[size];

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
            ? `0 0 ${glow * 16}px rgba(255, 255, 255, ${currentIntensity * 0.15})`
            : undefined,
      }}
      className={`relative inline-flex items-center justify-center font-semibold tracking-tight transition-all duration-200 select-none overflow-hidden cursor-pointer group active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${sizeClasses} ${className}`}
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
