/**
 * PeekRating.tsx – Animated interactive star rating with lift, magnify, and tooltip peek from React Bits.
 */

import React, { useState } from 'react';
import { Star } from 'lucide-react';

export interface PeekRatingProps {
  defaultValue?: number;
  value?: number;
  count?: number;
  shape?: 'star' | 'heart' | 'circle';
  labels?: string[];
  activeColor?: string;
  idleColor?: string;
  tipColor?: string;
  tipTextColor?: string;
  size?: number;
  lift?: number;
  magnify?: number;
  riseDuration?: number;
  popScale?: number;
  showTip?: boolean;
  allowClear?: boolean;
  onChange?: (value: number) => void;
  className?: string;
  name?: string;
}

export function PeekRating({
  defaultValue = 3,
  value: controlledValue,
  count = 5,
  labels = ['Poor', 'Fair', 'Good', 'Great', 'Superb'],
  activeColor = 'rgb(245, 180, 0)',
  idleColor = 'rgb(82, 82, 91)',
  tipColor = 'rgb(39, 39, 42)',
  tipTextColor = 'rgb(245, 245, 245)',
  size = 32,
  lift = 7,
  magnify = 1.15,
  riseDuration = 320,
  popScale = 1.3,
  showTip = true,
  allowClear = false,
  onChange,
  className = '',
  name = 'rating',
}: PeekRatingProps): React.ReactElement {
  const [internalValue, setInternalValue] = useState<number>(defaultValue);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [poppingIndex, setPoppingIndex] = useState<number | null>(null);

  const currentValue = controlledValue !== undefined ? controlledValue : internalValue;
  const activeRating = hoverIndex !== null ? hoverIndex + 1 : currentValue;

  const handleClick = (index: number) => {
    const val = index + 1;
    let nextVal = val;
    if (allowClear && val === currentValue) {
      nextVal = 0;
    }
    setInternalValue(nextVal);
    onChange?.(nextVal);

    // Trigger pop animation
    setPoppingIndex(index);
    setTimeout(() => setPoppingIndex(null), 250);
  };

  return (
    <div
      role="radiogroup"
      aria-label="Rating selector"
      className={`inline-flex items-center gap-2 select-none relative pt-6 pb-2 ${className}`}
      onMouseLeave={() => setHoverIndex(null)}
    >
      {Array.from({ length: count }, (_, i) => {
        const isFilled = i < activeRating;
        const isHovered = hoverIndex === i;
        const isPopping = poppingIndex === i;
        const labelText = labels[i] || `${i + 1} Stars`;

        return (
          <div key={`${name}-${i}`} className="relative flex flex-col items-center">
            {/* Tooltip Peek balloon */}
            {showTip && isHovered && (
              <div
                className="absolute -top-7 pointer-events-none transition-all duration-150 z-20 whitespace-nowrap px-2.5 py-0.5 rounded-md text-xs font-semibold shadow-md"
                style={{
                  backgroundColor: tipColor,
                  color: tipTextColor,
                  transform: 'translateY(-2px)',
                }}
              >
                {labelText}
                <div
                  className="w-1.5 h-1.5 rotate-45 mx-auto -mb-1 mt-0.5"
                  style={{ backgroundColor: tipColor }}
                />
              </div>
            )}

            {/* Rating Icon Button */}
            <button
              type="button"
              role="radio"
              aria-checked={currentValue === i + 1}
              aria-label={labelText}
              onClick={() => handleClick(i)}
              onMouseEnter={() => setHoverIndex(i)}
              style={{
                transition: `transform ${riseDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1), color 150ms ease`,
                transform: isPopping
                  ? `scale(${popScale}) translateY(-${lift}px)`
                  : isHovered
                  ? `scale(${magnify}) translateY(-${lift}px)`
                  : 'scale(1) translateY(0px)',
                color: isFilled ? activeColor : idleColor,
              }}
              className="p-1 rounded-full cursor-pointer focus-visible:outline-2 focus-visible:outline-indigo-500 focus-visible:outline-offset-2 transition-colors"
            >
              <Star
                style={{ width: `${size}px`, height: `${size}px` }}
                fill={isFilled ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={1.75}
              />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default PeekRating;
