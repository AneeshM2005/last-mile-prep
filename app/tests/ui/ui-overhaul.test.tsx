import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { PeekRating } from '../../src/ui/animations/PeekRating';
import { FeedbackPage } from '../../src/features/feedback/FeedbackPage';
import { NAV_ITEMS } from '../../src/ui/SidebarNav';
import { ScrollExpand } from '../../src/ui/animations/ScrollExpand';
import { resetApp } from '../../src/data/reset';
import { useStore } from '../../src/data/store';

describe('UI and Design Overhaul Requirements', () => {
  describe('PeekRating state and interactions', () => {
    function ControlledPeekRating() {
      const [rating, setRating] = useState<number | null>(null);
      return (
        <div>
          <PeekRating value={rating} onChange={setRating} />
          <span data-testid="selected-display">{rating ?? 'empty'}</span>
        </div>
      );
    }

    it('starts with no rating selected (null / 0)', () => {
      render(<ControlledPeekRating />);
      expect(screen.getByTestId('selected-display').textContent).toBe('empty');
      // All 5 radio stars have aria-checked="false"
      const stars = screen.getAllByRole('radio');
      expect(stars).toHaveLength(5);
      stars.forEach((star) => {
        expect(star).toHaveAttribute('aria-checked', 'false');
      });
      // "You chose" summary is not present initially
      expect(screen.queryByText(/You chose/i)).not.toBeInTheDocument();
    });

    it('hover previews without changing the stored value', () => {
      render(<ControlledPeekRating />);
      const stars = screen.getAllByRole('radio');

      // Hover over star 4
      fireEvent.mouseEnter(stars[3]);

      // Stored value remains empty
      expect(screen.getByTestId('selected-display').textContent).toBe('empty');

      // Mouse leave star 4
      fireEvent.mouseLeave(stars[3]);
      expect(screen.getByTestId('selected-display').textContent).toBe('empty');
    });

    it('click sets the rating and shows confirmation text', () => {
      render(<ControlledPeekRating />);
      const stars = screen.getAllByRole('radio');

      // Click star 4 (Great)
      fireEvent.click(stars[3]);
      expect(screen.getByTestId('selected-display').textContent).toBe('4');
      expect(stars[3]).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByText(/You chose 4 of 5: Great/i)).toBeInTheDocument();
    });

    it('clicking the same star again clears the rating', () => {
      render(<ControlledPeekRating />);
      const stars = screen.getAllByRole('radio');

      // Click star 4
      fireEvent.click(stars[3]);
      expect(screen.getByTestId('selected-display').textContent).toBe('4');

      // Click star 4 again to clear
      fireEvent.click(stars[3]);
      expect(screen.getByTestId('selected-display').textContent).toBe('empty');
      expect(stars[3]).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('FeedbackPage feature chips', () => {
    beforeEach(() => {
      resetApp();
      useStore.getState().createProfile({
        id: 'test-user',
        displayName: 'Test Aspirant',
        targetSchoolIds: ['iima'],
        dailyMinutes: 30,
        consentAt: new Date().toISOString(),
        age18Declared: true,
        createdAt: new Date().toISOString(),
        onboardingStep: 'done',
      });
    });

    it('all feature chips start unselected on initial load', () => {
      render(
        <MemoryRouter initialEntries={['/feedback']}>
          <FeedbackPage />
        </MemoryRouter>
      );

      // Verify the feature choices section
      expect(
        screen.getByText(/Which features would you use again\?/i)
      ).toBeInTheDocument();

      const featureButtons = [
        screen.getByRole('button', { name: /baseline & swot/i }),
        screen.getByRole('button', { name: /selection rounds/i }),
        screen.getByRole('button', { name: /mock analysis & leakage/i }),
        screen.getByRole('button', { name: /spaced revision/i }),
        screen.getByRole('button', { name: /personal dictionary/i }),
      ];

      // Zero pre-selected options
      featureButtons.forEach((btn) => {
        expect(btn).toHaveAttribute('aria-pressed', 'false');
      });

      // Clicking one selects it
      fireEvent.click(featureButtons[0]);
      expect(featureButtons[0]).toHaveAttribute('aria-pressed', 'true');

      // Clicking again clears it
      fireEvent.click(featureButtons[0]);
      expect(featureButtons[0]).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Navigation order and naming', () => {
    it('sidebar nav matches exact editorial order with Feedback last', () => {
      const labels = NAV_ITEMS.map((item) => item.label);
      expect(labels).toEqual([
        'Home',
        'Practice',
        'Mock analysis',
        'Revision',
        'Personal dictionary',
        'OMET',
        'My profile',
        'Feedback',
      ]);
    });
  });

  describe('ScrollExpand full-screen shrinking hero starting state and text swap', () => {
    it('starts full screen with square corners, stage 1 text visible, and actions hidden', () => {
      render(
        <ScrollExpand
          src="/images/landing-hero.jpeg"
          alt=""
          title="The last stretch, one steady step at a time."
          eyebrowStage1="LAST MILE CAT PREP"
          eyebrowStage2="A CALMER APPROACH TO CAT"
          stage2Text="Strategy, timing and a calmer routine for the final weeks before CAT. Built from your own practice."
          scrollHint="Scroll"
          useWindowScroll
          actionsSlot={
            <div>
              <button type="button">Get started</button>
              <p>Your data stays on this device.</p>
            </div>
          }
        />
      );

      // Frame container exists
      const frameEl = screen.getByTestId('scroll-expand-frame');
      expect(frameEl).toBeInTheDocument();

      // Starts full screen (100% width, 0px border radius, full viewport height)
      expect(frameEl.style.width).toBe('100%');
      expect(frameEl.style.borderRadius).toBe('0px');
      expect(frameEl.style.height).toBe(`${window.innerHeight}px`);

      // Stage 1 text group is visible directly on picture
      const stage1El = screen.getByTestId('hero-stage-1');
      expect(stage1El).toBeInTheDocument();
      expect(stage1El.style.opacity).toBe('1');
      expect(screen.getByText('LAST MILE CAT PREP')).toBeInTheDocument();
      expect(screen.getByText('The last stretch, one steady step at a time.')).toBeInTheDocument();

      // Stage 2 text group is in the DOM for accessibility with opacity 0
      const stage2El = screen.getByTestId('hero-stage-2');
      expect(stage2El).toBeInTheDocument();
      expect(stage2El.style.opacity).toBe('0');
      expect(screen.getByText('A CALMER APPROACH TO CAT')).toBeInTheDocument();

      // Scroll hint is visible
      const hintEl = screen.getByTestId('hero-scroll-hint');
      expect(hintEl).toBeInTheDocument();
      expect(hintEl.style.opacity).toBe('1');

      // Actions below frame are in DOM with opacity 0
      const actionsEl = screen.getByTestId('hero-actions');
      expect(actionsEl).toBeInTheDocument();
      expect(actionsEl.style.opacity).toBe('0');
    });

    it('calculates total container height including shrink runway and hold distance', () => {
      render(
        <ScrollExpand
          src="/images/landing-hero.jpeg"
          scrollDistance={1.2}
          actionsSlot={<button type="button">Get started</button>}
        />
      );

      const containerEl = screen.getByTestId('scroll-expand-container');
      expect(containerEl).toBeInTheDocument();
      // Total = window.innerHeight + Math.round(shrinkDistPx) + Math.round(holdDistPx)
      const expectedHeight = window.innerHeight + Math.round(window.innerHeight * 1.2) + Math.round(window.innerHeight * 0.6);
      expect(containerEl.style.height).toBe(`${expectedHeight}px`);
    });

    it('switches to static layout when viewport is too short to fit frame and actions without clipping', () => {
      // Mock very short window (e.g. 350px)
      const originalHeight = window.innerHeight;
      Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 350 });

      let headerReportedOverPhoto = true;
      render(
        <ScrollExpand
          src="/images/landing-hero.jpeg"
          title="The last stretch, one steady step at a time."
          stage2Text="Strategy, timing and a calmer routine for the final weeks before CAT."
          actionsSlot={<button type="button">Get started</button>}
          headerProgressCallback={(overPhoto) => {
            headerReportedOverPhoto = overPhoto;
          }}
        />
      );

      // In static layout, headline is rendered on the page canvas
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      // Header callback reports over paper (false)
      expect(headerReportedOverPhoto).toBe(false);

      // Restore height
      Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: originalHeight });
    });
  });
});
