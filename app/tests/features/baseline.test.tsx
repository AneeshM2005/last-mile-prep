import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { BaselinePage } from '../../src/features/baseline/BaselinePage';
import { useStore } from '../../src/data/store';
import { resetApp } from '../../src/data/reset';

describe('P1-07 Baseline Screen Flow', () => {
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

  it('renders Baseline intro and starts assessment', () => {
    render(
      <MemoryRouter initialEntries={['/practice/baseline']}>
        <Routes>
          <Route path="/practice/baseline" element={<BaselinePage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /baseline diagnostic/i })).toBeInTheDocument();
    const startBtn = screen.getByRole('button', { name: /start baseline/i });
    expect(startBtn).toBeInTheDocument();

    fireEvent.click(startBtn);

    // Now in workspace view
    expect(screen.getByText(/Question 1 of/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('allows answering, skipping, and records in store', () => {
    render(
      <MemoryRouter initialEntries={['/practice/baseline']}>
        <Routes>
          <Route path="/practice/baseline" element={<BaselinePage />} />
        </Routes>
      </MemoryRouter>
    );

    // Start
    fireEvent.click(screen.getByRole('button', { name: /start baseline/i }));

    // Answer Q1 if options exist
    const optionA = screen.queryByRole('radio', { name: /^A /i });
    if (optionA) {
      fireEvent.click(optionA);
    }

    // Skip to next question
    const skipBtn = screen.getByRole('button', { name: /skip/i });
    fireEvent.click(skipBtn);

    // Stored baseline exists and has progress
    const baseline = useStore.getState().data.baseline;
    expect(baseline).not.toBeNull();
    expect(baseline?.status).toBe('in_progress');
  });
});
