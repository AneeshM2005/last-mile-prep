import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MockPage } from '../../src/features/mock/MockPage';
import { useStore } from '../../src/data/store';
import { resetApp } from '../../src/data/reset';
import type { MockEntry } from '../../src/data/schemas';

import sampleMockData from '../../public/content/sampleMock.json';

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

  it('renders start screen, allows opening instructions via link, and views loaded sample mock reproducing 33, 39, 15, total 87', async () => {
    // Populate store with the real sample mock
    useStore.getState().setData((prev) => ({
      ...prev,
      mocks: [sampleMockData as unknown as MockEntry],
    }));

    render(
      <MemoryRouter initialEntries={['/mock']}>
        <Routes>
          <Route path="/mock" element={<MockPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /mock analysis/i })).toBeInTheDocument();

    // Verify "How mock analysis works" link is present and opens instructions
    const howWorksLink = screen.getByRole('button', { name: /how mock analysis works/i });
    expect(howWorksLink).toBeInTheDocument();

    // Verify sample mock card is displayed with "View summary"
    const viewSummaryBtn = screen.getByRole('button', { name: /view summary/i });
    expect(viewSummaryBtn).toBeInTheDocument();

    fireEvent.click(viewSummaryBtn);

    // Summary heading
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
    expect(screen.getByText(/Gap to work on/i)).toBeInTheDocument();
    expect(screen.getByText('+54')).toBeInTheDocument();
  });

  it('allows starting mock analysis, going through instructions & details, and classifying questions', () => {
    render(
      <MemoryRouter initialEntries={['/mock']}>
        <Routes>
          <Route path="/mock" element={<MockPage />} />
        </Routes>
      </MemoryRouter>
    );

    // 1. Click "Start mock analysis" on start screen
    const startBtns = screen.getAllByRole('button', { name: /start mock analysis/i });
    fireEvent.click(startBtns[0]);

    // 2. Instructions view appears
    expect(screen.getByRole('heading', { level: 1, name: /how mock analysis works/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /continue to mock details/i }));

    // 3. Mock details view appears
    expect(screen.getByRole('heading', { level: 1, name: /mock details/i })).toBeInTheDocument();

    // Enter name
    const nameInput = screen.getByPlaceholderText(/e\.g\. AIMCAT 2026/i);
    fireEvent.change(nameInput, { target: { value: 'Pro Mock 1' } });

    // Select provider
    const providerSelect = screen.getByRole('combobox');
    fireEvent.change(providerSelect, { target: { value: 'IMS' } });

    // Enter date
    const dateInput = screen.getByLabelText(/date taken/i);
    fireEvent.change(dateInput, { target: { value: '2026-10-26' } });

    // Select mock type
    const fullMockBtn = screen.getByRole('button', { name: /full-length mock/i });
    fireEvent.click(fullMockBtn);

    // Click "Continue to analysis"
    fireEvent.click(screen.getByRole('button', { name: /continue to analysis/i }));

    // 4. Choose a section view appears
    expect(screen.getByRole('heading', { level: 1, name: /choose a section/i })).toBeInTheDocument();

    // Select VARC section
    const varcSection = screen.getByText('VARC');
    fireEvent.click(varcSection);

    // Click "Start section"
    fireEvent.click(screen.getByRole('button', { name: /start section/i }));

    // 5. Entry view appears
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

    // 6. Summary view appears
    expect(screen.getByRole('heading', { level: 1, name: /summary/i })).toBeInTheDocument();
    expect(useStore.getState().data.mocks.length).toBeGreaterThan(0);
    const saved = useStore.getState().data.mocks[0];
    expect(saved.provider).toBe('IMS');
    expect(saved.mockType).toBe('full');
  });
});
