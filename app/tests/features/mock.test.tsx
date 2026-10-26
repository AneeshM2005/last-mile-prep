import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MockPage } from '../../src/features/mock/MockPage';
import { useStore } from '../../src/data/store';
import { resetApp } from '../../src/data/reset';

describe('P1-11 Mock Analysis Flow', () => {
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

  it('renders start screen and loads sample mock reproducing 33, 39, 15, total 87', async () => {
    render(
      <MemoryRouter initialEntries={['/mock']}>
        <Routes>
          <Route path="/mock" element={<MockPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /mock analysis/i })).toBeInTheDocument();

    const loadSampleBtns = screen.getAllByRole('button', { name: /load sample mock/i });
    expect(loadSampleBtns.length).toBeGreaterThan(0);

    fireEvent.click(loadSampleBtns[0]);

    // Should navigate to summary
    expect(await screen.findByRole('heading', { level: 1, name: /aimcat 2026 sample mock — summary/i })).toBeInTheDocument();

    // Verbatim BR-14 sentence
    expect(
      screen.getByText(
        /The score if every question you could solve were answered correctly\. This is not a prediction\. It ignores timing and negative marking\./i
      )
    ).toBeInTheDocument();

    // Potential score 87
    expect(screen.getByText('87')).toBeInTheDocument();

    // Per-section potentials: VARC 33 · LRDI 39 · QA 15
    expect(screen.getByText(/VARC 33/i)).toBeInTheDocument();
    expect(screen.getByText(/LRDI 39/i)).toBeInTheDocument();
    expect(screen.getByText(/QA 15/i)).toBeInTheDocument();

    // Gap to work on: +54
    expect(screen.getByText(/Gap to work on: \+54/i)).toBeInTheDocument();
  });

  it('allows starting a new section, selecting Step 1 & 2 to update GradeChip, and saving section', () => {
    render(
      <MemoryRouter initialEntries={['/mock']}>
        <Routes>
          <Route path="/mock" element={<MockPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Click "Start mock"
    fireEvent.click(screen.getByRole('button', { name: /start mock/i }));

    // Click "Continue" in modal
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Choose section view
    expect(screen.getByRole('heading', { level: 1, name: /choose a section/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /start section/i }));

    // Now in Entry view
    expect(screen.getByText(/Question 1/i)).toBeInTheDocument();

    // Step 1: Attempted and correct
    fireEvent.click(screen.getByRole('button', { name: /attempted and correct/i }));

    // Step 2: Solved it in no time
    fireEvent.click(screen.getByRole('button', { name: /solved it in no time/i }));

    // GradeChip displays Grade A
    expect(screen.getByRole('status', { name: /Grade A/i })).toBeInTheDocument();

    // Comment textarea check maxLength
    const commentInput = screen.getByPlaceholderText(/A short note about your own experience/i);
    fireEvent.change(commentInput, { target: { value: 'Slipped on time' } });
    expect(commentInput).toHaveValue('Slipped on time');

    // Save section
    fireEvent.click(screen.getByRole('button', { name: /save section/i }));

    // Now in summary view
    expect(screen.getByRole('heading', { level: 1, name: /summary/i })).toBeInTheDocument();
    expect(useStore.getState().data.mocks.length).toBeGreaterThan(0);
  });
});
