import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RevisionPage } from '../../src/features/revision/RevisionPage';
import { useStore } from '../../src/data/store';
import { resetApp } from '../../src/data/reset';
import { appClock } from '../../src/domain/appClock';
import { getEventLog } from '../../src/data/eventLog';

describe('Milestone M7 Revision Screen Flow & Demo Date Integration', () => {
  beforeEach(() => {
    resetApp();
    appClock.resetOffset();
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

  it('renders tabs, adds a topic, and creates 4 scheduled reminders', () => {
    render(
      <MemoryRouter initialEntries={['/revision']}>
        <Routes>
          <Route path="/revision" element={<RevisionPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /spaced revision/i })).toBeInTheDocument();

    // Switch to "Add topic" tab
    fireEvent.click(screen.getByRole('tab', { name: /add topic/i }));

    // Fill form
    const topicInput = screen.getByPlaceholderText(/Time, Speed & Distance/i);
    fireEvent.change(topicInput, { target: { value: 'Geometry Circles' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /add to plan/i }));

    // Item exists in store
    const items = useStore.getState().data.revisionItems;
    expect(items).toHaveLength(1);
    expect(items[0].topic).toBe('Geometry Circles');
    expect(items[0].schedule).toHaveLength(4);

    // Event logged
    const events = getEventLog();
    expect(events.some((e) => e.event === 'revision_item_added')).toBe(true);
  });

  it('shows item in Due today when simulated date matches schedule, and allows Reviewed/Need more time', () => {
    // Add item created on current today
    const today = appClock.today();
    const item = {
      id: '00000000-0000-0000-0000-000000000022',
      topic: 'Arithmetic Percentages',
      section: 'QA' as const,
      createdOn: today,
      schedule: [
        { dueOn: today, status: 'scheduled' as const },
        { dueOn: '2026-11-01', status: 'scheduled' as const },
        { dueOn: '2026-11-07', status: 'scheduled' as const },
        { dueOn: '2026-11-16', status: 'scheduled' as const },
      ],
      cycleComplete: false,
    };

    useStore.setState((s) => ({
      data: {
        ...s.data,
        revisionItems: [item],
      },
    }));

    render(
      <MemoryRouter initialEntries={['/revision']}>
        <Routes>
          <Route path="/revision" element={<RevisionPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Should appear in Due today
    expect(screen.getByText(/Arithmetic Percentages/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 1 of 4/i)).toBeInTheDocument();

    // Click Reviewed
    const reviewBtn = screen.getByRole('button', { name: /reviewed/i });
    fireEvent.click(reviewBtn);

    // Marked as reviewed
    const updated = useStore.getState().data.revisionItems[0];
    expect(updated.schedule[0].status).toBe('reviewed');

    // Event logged
    const events = getEventLog();
    expect(events.some((e) => e.event === 'revision_marked')).toBe(true);
  });
});
