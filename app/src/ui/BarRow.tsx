/**
 * BarRow.tsx – CSS horizontal proportional bar row.
 * design.md 7.20.
 * Left = label / shape icon, Middle = proportional bar, Right = count in tabular numeric.
 */
import React from 'react';

interface BarRowProps {
  label: string;
  count: number;
  maxCount: number;
  fillColor?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function BarRow({
  label,
  count,
  maxCount,
  fillColor = 'var(--lm-accent)',
  icon,
  className = '',
}: BarRowProps): React.ReactElement {
  const safeMax = Math.max(1, maxCount);
  const percentage = count > 0 ? Math.max(4, Math.round((count / safeMax) * 100)) : 0;

  return (
    <div className={`flex items-center gap-3 text-body w-full ${className}`}>
      <div className="flex items-center gap-2 w-36 sm:w-44 shrink-0 font-medium text-[var(--lm-ink)] truncate">
        {icon}
        <span className="truncate">{label}</span>
      </div>

      <div className="flex-1 h-2 bg-[var(--lm-inset)] rounded-[var(--lm-radius-pill)] overflow-hidden">
        <div
          className="h-full rounded-[var(--lm-radius-pill)] transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: fillColor,
          }}
        />
      </div>

      <span className="font-mono text-numeric text-[var(--lm-ink)] w-8 text-right shrink-0">
        {count}
      </span>
    </div>
  );
}
