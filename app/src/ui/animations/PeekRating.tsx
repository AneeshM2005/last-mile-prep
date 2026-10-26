/**
 * PeekRating.tsx – Animated interactive star rating with lift, magnify, and tooltip peek from React Bits.
 * Tuned for Last Mile light editorial aesthetic (amber-400 active star, sage-500 idle outline, sage-900 tip).
 */

import React, { useState } from 'react';
import { Star } from 'lucide-react';

export interface PeekRatingProps {
  defaultValue?: number | null;
  value?: number | null;
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
  onChange?: (value: number | null) => void;
  className?: string;
  name?: string;
}

export function PeekRating({
  defaultValue = null,
  value: controlledValue,
  count = 5,
  labels = ['Poor', 'Fair', 'Good', 'Great', 'Superb'],
  activeColor = 'rgb(245, 180, 0)', // amber-400
  idleColor = 'rgb(127, 160, 122)',  // sage-500
  tipColor = 'rgb(47, 74, 50)',      // sage-900
  tipTextColor = 'rgb(255, 255, 255)',
  size = 32,
  lift = 7,
  magnify = 1.15,
  riseDuration = 220,
  popScale = 1.25,
  showTip = true,
  allowClear = true,
  onChange,
  className = '',
  name = 'rating',
}: PeekRatingProps): React.ReactElement {
  const [internalValue, setInternalValue] = useState<number | null>(defaultValue);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [poppingIndex, setPoppingIndex] = useState<number | null>(null);

  const currentValue = controlledValue !== undefined ? controlledValue : internalValue;
  const currentNum = currentValue ?? 0;
  const activeRating = hoverIndex !== null ? hoverIndex + 1 : currentNum;

  const handleClick = (index: number) => {
    const val = index + 1;
    let nextVal: number | null = val;
    if (allowClear && val === currentNum) {
      nextVal = null;
    }
    setInternalValue(nextVal);
    onChange?.(nextVal);

    if (nextVal !== null) {
      setPoppingIndex(index);
      setTimeout(() => setPoppingIndex(null), 250);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(count - 1, index + 1);
      handleClick(next);
      const nextBtn = document.getElementById(`${name}-star-${next}`);
      nextBtn?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const prev = Math.max(0, index - 1);
      handleClick(prev);
      const prevBtn = document.getElementById(`${name}-star-${prev}`);
      prevBtn?.focus();
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleClick(index);
    }
  };

  const chosenLabel = currentNum > 0 ? labels[currentNum - 1] || `${currentNum} of ${count}` : null;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div
        role="radiogroup"
        aria-label={`${name} rating selector`}
        className="inline-flex items-center gap-2 select-none relative pt-5 pb-1"
        onMouseLeave={() => setHoverIndex(null)}
      >
        {Array.from({ length: count }, (_, i) => {
          const isFilled = i < activeRating;
          const isHovered = hoverIndex === i;
          const isPopping = poppingIndex === i;
          const labelText = labels[i] || `${i + 1} Stars`;
          const starLabel = `${i + 1} of ${count} stars: ${labelText}`;

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
                id={`${name}-star-${i}`}
                type="button"
                role="radio"
                tabIndex={currentNum === i + 1 || (currentNum === 0 && i === 0) ? 0 : -1}
                aria-checked={currentNum === i + 1}
                aria-label={starLabel}
                onClick={() => handleClick(i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                onMouseEnter={() => setHoverIndex(i)}
                style={{
                  transition: `transform ${riseDuration}ms cubic-bezier(.22, 1, .36, 1), color 150ms ease`,
                  transform: isPopping
                    ? `scale(${popScale}) translateY(-${lift}px)`
                    : isHovered
                    ? `scale(${magnify}) translateY(-${lift}px)`
                    : 'scale(1) translateY(0px)',
                  color: isFilled ? activeColor : idleColor,
                }}
                className="p-1 rounded-full cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--lm-sage-700,rgb(75,111,77))] focus-visible:outline-offset-2 transition-colors"
              >
                <Star
                  style={{ width: `${size}px`, height: `${size}px` }}
                  fill={isFilled ? activeColor : 'none'}
                  stroke={isFilled ? 'rgb(217, 119, 6)' : idleColor}
                  strokeWidth={isFilled ? 1.5 : 1.75}
                />
              </button>
            </div>
          );
        })}
      </div>

      {/* Quiet confirmation line */}
      {chosenLabel && (
        <span className="text-xs text-[var(--lm-text-muted)] font-medium">
          You chose {currentNum} of {count}: {chosenLabel}
        </span>
      )}
    </div>
  );
}

export default PeekRating;
