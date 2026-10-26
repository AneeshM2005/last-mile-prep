import { describe, it, expect, beforeEach } from 'vitest';
import { recommendTodayTask } from '../../src/domain/taskRecommender';
import { appClock } from '../../src/domain/appClock';
import type { AppData } from '../../src/data/schemas';

describe('taskRecommender cascade logic', () => {
  beforeEach(() => {
    appClock.resetOffset();
  });

  const baseData: AppData = {
    profile: {
      id: '00000000-0000-0000-0000-000000000001',
      displayName: 'Test User',
      targetSchoolIds: ['iima'],
      dailyMinutes: 45,
      consentAt: '2026-10-01T00:00:00Z',
      age18Declared: true,
      createdAt: '2026-10-01T00:00:00Z',
      onboardingStep: 'done',
    },
    baseline: null,
    rounds: [],
    mocks: [],
    revisionItems: [],
    passageSessions: [],
    wordCards: [],
    activity: [],
    recommendations: [],
    feedback: null,
    ui: { dismissedBanners: [] },
  };

  it('recommends baseline when baseline diagnostic is not completed', () => {
    const task = recommendTodayTask(baseData);
    expect(task.taskType).toBe('baseline');
    expect(task.reasonCode).toBe('baseline_not_done');
    expect(task.route).toBe('/practice/baseline');
  });

  it('recommends revision when baseline is completed and a topic is due today', () => {
    const today = appClock.today();
    const data: AppData = {
      ...baseData,
      baseline: {
        id: 'b-1',
        status: 'completed',
        startedAt: '2026-10-01T10:00:00Z',
        endsAt: '2026-10-01T10:15:00Z',
        completedAt: '2026-10-01T10:14:00Z',
        currentIndex: 11,
        questionIds: [],
        answers: [],
      },
      revisionItems: [
        {
          id: '00000000-0000-0000-0000-000000000010',
          topic: 'Time and Distance',
          createdOn: '2026-10-01',
          schedule: [
            { dueOn: today, status: 'scheduled' },
          ],
          cycleComplete: false,
        },
      ],
    };

    const task = recommendTodayTask(data);
    expect(task.taskType).toBe('revision');
    expect(task.reasonCode).toBe('revision_due_today');
    expect(task.route).toBe('/revision');
  });

  it('recommends mock when baseline is done, no revision is due, and no mock has been recorded', () => {
    const data: AppData = {
      ...baseData,
      baseline: {
        id: 'b-1',
        status: 'completed',
        startedAt: '2026-10-01T10:00:00Z',
        endsAt: '2026-10-01T10:15:00Z',
        completedAt: '2026-10-01T10:14:00Z',
        currentIndex: 11,
        questionIds: [],
        answers: [],
      },
      mocks: [],
    };

    const task = recommendTodayTask(data);
    expect(task.taskType).toBe('mock');
    expect(task.reasonCode).toBe('last_mock_older_than_7_days');
    expect(task.route).toBe('/mock');
  });

  it('recommends question selection round when recent mock has Grade B share >= 25%', () => {
    const today = appClock.today();
    const data: AppData = {
      ...baseData,
      baseline: {
        id: 'b-1',
        status: 'completed',
        startedAt: '2026-10-01T10:00:00Z',
        endsAt: '2026-10-01T10:15:00Z',
        completedAt: '2026-10-01T10:14:00Z',
        currentIndex: 11,
        questionIds: [],
        answers: [],
      },
      mocks: [
        {
          id: '00000000-0000-0000-0000-000000000099',
          label: 'Recent Mock',
          date: today,
          sections: [
            {
              section: 'QA',
              questionCount: 10,
              records: [
                { n: 1, type: 'Arithmetic', step1: 'correct', step2: 'fast', outcomeCode: 'CORRECT_FAST' },
                { n: 2, type: 'Arithmetic', step1: 'correct', step2: 'slow', outcomeCode: 'CORRECT_SLOW' },
                { n: 3, type: 'Arithmetic', step1: 'correct', step2: 'slow', outcomeCode: 'CORRECT_SLOW' },
                { n: 4, type: 'Arithmetic', step1: 'wrong', step2: 'can_solve', outcomeCode: 'WRONG_CAN' },
                { n: 5, type: 'Arithmetic', step1: 'left', step2: 'can_solve', outcomeCode: 'LEFT_CAN' },
              ],
            },
          ],
        },
      ],
    };

    const task = recommendTodayTask(data);
    expect(task.taskType).toBe('round');
    expect(task.reasonCode).toBe('grade_b_share_above_threshold');
    expect(task.route).toBe('/practice/rounds');
  });

  it('skips task if completed today when noRepeatSameDayTask is active', () => {
    const today = appClock.today();
    const data: AppData = {
      ...baseData,
      // Baseline not done, but user already attempted baseline today
      activity: [
        {
          date: today,
          completedTaskTypes: ['baseline'],
        },
      ],
    };

    const task = recommendTodayTask(data);
    // Skips baseline and proceeds to next eligible
    expect(task.taskType).not.toBe('baseline');
  });
});
