/**
 * taskRecommender.ts – Daily task recommendation cascade logic.
 * PRD 5.1–5.3, tasks.json.
 */

import type { AppData, TaskType } from '../data/schemas';
import type { TasksConfig } from '../data/configSchemas';
import { appClock } from './appClock';
import { analyzeMockEntry } from './mockAnalysis';

export interface RecommendedTask {
  taskType: TaskType;
  title: string;
  durationMinutes: number;
  whyThis: string;
  route: string;
  reasonCode:
    | 'baseline_not_done'
    | 'revision_due_today'
    | 'last_mock_older_than_7_days'
    | 'grade_b_share_above_threshold'
    | 'always'
    | 'fallback';
}

const DEFAULT_CASCADE = {
  gradeBShareThreshold: 0.25,
  lastMockWindowDays: 7,
  noRepeatSameDayTask: true,
};

export function recommendTodayTask(
  data: AppData,
  tasksConfig?: TasksConfig
): RecommendedTask {
  const cascade = tasksConfig?.cascade ?? DEFAULT_CASCADE;
  const today = appClock.today();
  const profileMinutes = data.profile?.dailyMinutes ?? 30;

  // Completed task types today
  const todayActivity = data.activity.find((a) => a.date === today);
  const completedToday = new Set<TaskType>(todayActivity?.completedTaskTypes || []);

  const shouldSkipIfCompleted = (type: TaskType) =>
    cascade.noRepeatSameDayTask && completedToday.has(type);

  // 1. Baseline diagnostic
  const baselineNotDone = !data.baseline || data.baseline.status !== 'completed';
  if (baselineNotDone && !shouldSkipIfCompleted('baseline')) {
    return {
      taskType: 'baseline',
      title: 'Baseline diagnostic',
      durationMinutes: Math.min(profileMinutes, 15),
      whyThis: 'Establish your starting decision and timing profile across all three sections.',
      route: '/practice/baseline',
      reasonCode: 'baseline_not_done',
    };
  }

  // 2. Revision due today
  const hasRevisionDue = data.revisionItems.some((item) =>
    item.schedule.some((s) => s.dueOn <= today && s.status === 'scheduled')
  );
  if (hasRevisionDue && !shouldSkipIfCompleted('revision')) {
    return {
      taskType: 'revision',
      title: 'Spaced revision',
      durationMinutes: Math.min(profileMinutes, 30),
      whyThis: 'You have topics waiting for review to cement concepts into long-term recall.',
      route: '/revision',
      reasonCode: 'revision_due_today',
    };
  }

  // 3. Mock analysis (if no mocks or last mock > 7 days ago)
  const sortedMocks = [...data.mocks].sort((a, b) => b.date.localeCompare(a.date));
  const latestMock = sortedMocks[0];
  const lastMockDaysAgo = latestMock
    ? Math.floor((new Date(today).getTime() - new Date(latestMock.date).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  const mockNeeded = !latestMock || lastMockDaysAgo >= cascade.lastMockWindowDays;
  if (mockNeeded && !shouldSkipIfCompleted('mock')) {
    return {
      taskType: 'mock',
      title: 'Mock analysis',
      durationMinutes: Math.min(profileMinutes, 45),
      whyThis: 'It has been a week or more since your last recorded mock. Review your recent tests to spot decision leaks.',
      route: '/mock',
      reasonCode: 'last_mock_older_than_7_days',
    };
  }

  // 4. Question selection rounds (if Grade B share above threshold in latest mock)
  if (latestMock) {
    const mockSummary = analyzeMockEntry(latestMock);
    const totalQ = mockSummary.totalCounts.total;
    const bShare = totalQ > 0 ? mockSummary.totalCounts.B / totalQ : 0;

    if (bShare >= cascade.gradeBShareThreshold && !shouldSkipIfCompleted('round')) {
      return {
        taskType: 'round',
        title: 'Question selection practice',
        durationMinutes: Math.min(profileMinutes, 30),
        whyThis: 'Your latest mock showed solvable questions lost to timing or selection. Practice picking questions calmly.',
        route: '/practice/rounds',
        reasonCode: 'grade_b_share_above_threshold',
      };
    }
  }

  // 5. Reading passage
  if (!shouldSkipIfCompleted('passage')) {
    return {
      taskType: 'passage',
      title: 'Reading passage & vocabulary',
      durationMinutes: Math.min(profileMinutes, 20),
      whyThis: 'Read a curated editorial passage and tag words to expand your active vocabulary.',
      route: '/words/read',
      reasonCode: 'always',
    };
  }

  // 6. Fallback (if all eligible tasks were completed today)
  return {
    taskType: 'round',
    title: 'Question selection rounds',
    durationMinutes: profileMinutes,
    whyThis: 'Solidify your selection instincts with a quick 5-minute question selection round.',
    route: '/practice/rounds',
    reasonCode: 'fallback',
  };
}
