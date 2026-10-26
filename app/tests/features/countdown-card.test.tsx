/**
 * countdown-card.test.tsx – Unit tests for CountdownCard and colleges domain.
 *
 * Implements Part C4 testing requirements:
 * - With image present: panel and pill render with vivid photo background
 * - With image: null: old sage card renders unchanged
 * - With missing/error file: fallback sage card renders
 * - All 17 colleges configured with safe slugs and valid display names
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CountdownCard } from '../../src/features/home/CountdownCard';
import { getAllColleges, findCollege, DEFAULT_COLLEGE } from '../../src/domain/colleges';

describe('Dream Colleges configuration', () => {
  it('contains exactly 17 dream colleges with valid properties', () => {
    const colleges = getAllColleges();
    expect(colleges).toHaveLength(17);

    for (const c of colleges) {
      expect(c.id).toMatch(/^[a-z0-9-]+$/);
      expect(c.name.trim().length).toBeGreaterThan(0);
      expect(c.image).toMatch(/^\/images\/colleges\/[a-z0-9-]+\.webp$/);
      expect(c.focus).toBe('50% 50%');
    }
  });

  it('correctly looks up college by slug, legacy ID, and display name', () => {
    expect(findCollege('iim-ahmedabad')?.name).toBe('IIM Ahmedabad');
    expect(findCollege('iima')?.name).toBe('IIM Ahmedabad');
    expect(findCollege('IIM Ahmedabad')?.id).toBe('iim-ahmedabad');

    expect(findCollege('fms')?.name).toBe('FMS');
    expect(findCollege('fms-delhi')?.name).toBe('FMS');

    expect(findCollege('xlri')?.name).toBe('XLRI Jamshedpur');
    expect(findCollege('spjimr')?.name).toBe('SPJIMR');
    expect(findCollege('spjimr-mumbai')?.name).toBe('SPJIMR');

    expect(findCollege('unknown-slug')).toBeUndefined();
  });
});

describe('CountdownCard component (Part C)', () => {
  it('renders solid white panel and college pill when image is present', () => {
    const college = findCollege('iim-ahmedabad')!;
    render(<CountdownCard daysToCAT={33} college={college} />);

    // Panel with countdown number
    const panel = screen.getByTestId('countdown-panel');
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveTextContent('Countdown');
    expect(panel).toHaveTextContent('33');
    expect(panel).toHaveTextContent('days to CAT');

    // College pill
    const pill = screen.getByTestId('college-pill');
    expect(pill).toBeInTheDocument();
    expect(pill).toHaveTextContent('IIM Ahmedabad');

    // Background decorative image
    const img = screen.getByRole('presentation', { hidden: true });
    expect(img).toHaveAttribute('src', '/images/colleges/iim-ahmedabad.webp');
    expect(img).toHaveAttribute('alt', '');
    expect(img).toHaveAttribute('decoding', 'async');
  });

  it('renders plain sage fallback when college has image: null', () => {
    const nullCollege = {
      id: 'custom-college',
      name: 'Custom College',
      image: null,
    };

    render(<CountdownCard daysToCAT={45} college={nullCollege} />);

    // Renders sage fallback card
    const card = screen.getByTestId('countdown-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveStyle({ background: 'var(--lm-sky-fallback)' });

    // Panel and pill from photo mode should not be present
    expect(screen.queryByTestId('countdown-panel')).not.toBeInTheDocument();
    expect(screen.queryByTestId('college-pill')).not.toBeInTheDocument();

    // Contains number and college name
    expect(card).toHaveTextContent('45');
    expect(card).toHaveTextContent('Custom College');
  });

  it('renders plain sage fallback when image fails to load (error trigger)', () => {
    const college = findCollege('iim-bangalore')!;
    render(<CountdownCard daysToCAT={20} college={college} />);

    // Trigger image error
    const img = screen.getByRole('presentation', { hidden: true });
    fireEvent.error(img);

    // Fallback renders
    const card = screen.getByTestId('countdown-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveStyle({ background: 'var(--lm-sky-fallback)' });
    expect(card).toHaveTextContent('20');
    expect(card).toHaveTextContent('IIM Bangalore');
  });
});
