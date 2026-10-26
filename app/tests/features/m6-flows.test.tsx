import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '../../src/features/home/HomePage';
import { PracticeHubPage } from '../../src/features/practice/PracticeHubPage';
import { OmetPage } from '../../src/features/omet/OmetPage';
import { FeedbackPage } from '../../src/features/feedback/FeedbackPage';
import { useStore } from '../../src/data/store';
import { resetApp } from '../../src/data/reset';
import { getEventLog } from '../../src/data/eventLog';
import { buildAnonymousFeedbackPayload } from '../../src/domain/sessionSummary';
import type { FeedbackRecord } from '../../src/data/schemas';

describe('Milestone M6 Screens Flow (Home, Practice Hub, OMET, Feedback)', () => {
  beforeEach(() => {
    resetApp();
    useStore.getState().createProfile({
      id: '00000000-0000-0000-0000-000000000001',
      displayName: 'SecretCandidate',
      targetSchoolIds: ['iima'],
      dailyMinutes: 30,
      consentAt: new Date().toISOString(),
      age18Declared: true,
      createdAt: new Date().toISOString(),
      onboardingStep: 'done',
    });
  });

  it('renders HomePage with daily task, days to CAT, quote, and journey indicator', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /today/i })).toBeInTheDocument();
    expect(screen.getByText(/SecretCandidate/i)).toBeInTheDocument();
    expect(screen.getByText(/days to CAT/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start task/i })).toBeInTheDocument();
    expect(screen.getByText(/Your progress journey/i)).toBeInTheDocument();
    expect(screen.getByText(/0 of 5 milestones/i)).toBeInTheDocument();
  });

  it('renders PracticeHubPage with cards for Baseline and Question selection', () => {
    render(
      <MemoryRouter initialEntries={['/practice']}>
        <Routes>
          <Route path="/practice" element={<PracticeHubPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /practice/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /baseline diagnostic/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /question selection/i })).toBeInTheDocument();
  });

  it('renders OmetPage and logs omet_teaser_viewed event', () => {
    render(
      <MemoryRouter initialEntries={['/omet']}>
        <Routes>
          <Route path="/omet" element={<OmetPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /omet preparation/i })).toBeInTheDocument();
    expect(screen.getByText(/The CAT Paradigm/i)).toBeInTheDocument();
    expect(screen.getByText(/XAT, SNAP, and NMAT adaptations/i)).toBeInTheDocument();

    const events = getEventLog();
    expect(events.some((e) => e.event === 'omet_teaser_viewed')).toBe(true);
  });

  it('renders FeedbackPage, ensures displayName is stripped from payload, and saves feedback', async () => {
    render(
      <MemoryRouter initialEntries={['/feedback']}>
        <Routes>
          <Route path="/feedback" element={<FeedbackPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /share feedback/i })).toBeInTheDocument();

    // Verify privacy notice
    expect(screen.getByText(/Display name stripped/i)).toBeInTheDocument();

    // Verify displayName is NOT in payload preview
    expect(screen.queryByText(/SecretCandidate/i)).not.toBeInTheDocument();

    // Enter feedback in a textarea
    const textareas = screen.getAllByRole('textbox');
    fireEvent.change(textareas[0], { target: { value: 'Very calm and steady approach.' } });

    // Click "Save & Copy feedback"
    const saveBtn = screen.getByRole('button', { name: /save & copy feedback/i });
    fireEvent.click(saveBtn);

    // Stored in Zustand
    const savedFeedback = useStore.getState().data.feedback;
    expect(savedFeedback).not.toBeNull();
    expect(savedFeedback?.answers.mostAndLeastUseful).toBe('Very calm and steady approach.');

    // Event logged
    const events = getEventLog();
    expect(events.some((e) => e.event === 'feedback_submitted')).toBe(true);
  });

  it('buildAnonymousFeedbackPayload strips user personal details and includes accurate metrics', () => {
    const feedbackRecord: FeedbackRecord = {
      ratings: { strategy: 5, calm: 5 },
      answers: {
        mostAndLeastUseful: 'Mock leakage was great',
        newInsight: 'B grades',
        stressful: 'None',
        dailyUse: 'Every morning',
        ometMissing: 'XAT',
      },
      wouldUseAgain: ['baseline_profile', 'mock_analysis'],
      savedAt: new Date().toISOString(),
    };

    const payload = buildAnonymousFeedbackPayload(useStore.getState().data, feedbackRecord);
    expect((payload as unknown as Record<string, unknown>).displayName).toBeUndefined();
    expect(payload.version).toBe('1.0.0-prototype');
    expect(payload.ratings.strategy).toBe(5);
    expect(payload.metrics).toBeDefined();
  });
});
