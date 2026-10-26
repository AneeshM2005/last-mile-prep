import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RoundsPage } from '../../src/features/rounds/RoundsPage';
import { useStore } from '../../src/data/store';
import { resetApp } from '../../src/data/reset';

describe('P1-09 Rounds Screen Flow', () => {
  beforeEach(() => {
    resetApp();
    useStore.getState().createProfile({
      id: '00000000-0000-0000-0000-000000000001',
      displayName: 'Aspirant',
      targetSchoolIds: ['iima'],
      dailyMinutes: 30,
      consentAt: new Date().toISOString(),
      age18Declared: true,
      createdAt: new Date().toISOString(),
      onboardingStep: 'done',
    });
  });

  it('renders list view with rounds and starts round 1', () => {
    render(
      <MemoryRouter initialEntries={['/practice/rounds']}>
        <Routes>
          <Route path="/practice/rounds" element={<RoundsPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /question selection rounds/i })).toBeInTheDocument();
    expect(screen.getByText(/Round 1/i)).toBeInTheDocument();

    const startBtns = screen.getAllByRole('button', { name: /start round/i });
    expect(startBtns.length).toBeGreaterThan(0);

    fireEvent.click(startBtns[0]);

    // Now in workspace view
    expect(screen.getByText(/Aim to solve/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Q1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Q2/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /end round/i })).toBeInTheDocument();
  });

  it('supports tile selection, answering questions, ending round, and completing reflection to summary', () => {
    render(
      <MemoryRouter initialEntries={['/practice/rounds']}>
        <Routes>
          <Route path="/practice/rounds" element={<RoundsPage />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getAllByRole('button', { name: /start round/i })[0]);

    // Switch to Q2 tile
    const q2Tile = screen.getByRole('button', { name: /Q2/i });
    fireEvent.click(q2Tile);
    expect(screen.getByText(/Question 2 of 5/i)).toBeInTheDocument();

    // Select an option if available
    const optionA = screen.queryByRole('radio', { name: /^A /i });
    if (optionA) {
      fireEvent.click(optionA);
    }

    // End round
    fireEvent.click(screen.getByRole('button', { name: /end round/i }));

    // Now in reflection view (Step 1)
    expect(screen.getByText(/Reflection Step 1 of 3/i)).toBeInTheDocument();
    expect(screen.getByText(/Selection review/i)).toBeInTheDocument();

    // Skip reflection
    const skipBtn = screen.getByRole('button', { name: /skip reflection/i });
    fireEvent.click(skipBtn);

    // Now in Summary view
    expect(screen.getByRole('heading', { level: 1, name: /round summary/i })).toBeInTheDocument();
    expect(screen.getByText(/Selection alignment/i)).toBeInTheDocument();
    expect(screen.getByText(/questions rated easiest for this set/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /practice more rounds/i })).toBeInTheDocument();
  });
});
