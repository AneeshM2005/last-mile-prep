/**
 * NotFound.tsx – 404 page for unmatched routes.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';

export function NotFound(): React.ReactElement {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 gap-4">
      <h1 className="text-display font-bold text-[var(--lm-ink)] m-0">404</h1>
      <p className="text-body text-[var(--lm-text-muted)] max-w-md m-0">
        We couldn&apos;t find that page. Everything you need is in your study plan.
      </p>
      <div className="mt-4">
        <Button variant="primary" onClick={() => navigate('/')}>
          Return to Home
        </Button>
      </div>
    </div>
  );
}
