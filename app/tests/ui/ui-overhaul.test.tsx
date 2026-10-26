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

  describe('ScrollExpand framed starting state', () => {
    it('starts framed with rounded radius and bounded width', () => {
      render(
        <ScrollExpand
          src="/test-image.jpg"
          alt="CAT Prep desk"
          title="The last stretch, one steady step at a time."
          scrollHint="Scroll"
          useWindowScroll
        >
          <div>Revealed content</div>
        </ScrollExpand>
      );

      // Frame container exists
      const frameEl = screen.getByTestId('scroll-expand-frame');
      expect(frameEl).toBeInTheDocument();

      // Starts framed (inset style with rounded radius)
      expect(frameEl.style.width).toBe('88%');
      expect(frameEl.style.borderRadius).toBe('32px');

      // Title plaque exists
      expect(
        screen.getByText('The last stretch, one steady step at a time.')
      ).toBeInTheDocument();
    });
  });
});
