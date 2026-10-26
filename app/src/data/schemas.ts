import { z } from 'zod';

// ── Primitives ────────────────────────────────────────────────
export const ISOSchema = z.string().datetime({ offset: true });
export const LocalDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const SectionSchema = z.enum(['VARC', 'LRDI', 'QA']);
export type Section = z.infer<typeof SectionSchema>;

// ── Profile ───────────────────────────────────────────────────
export const ProfileSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string().min(1).max(30),
  targetSchoolIds: z.array(z.string()).min(1).max(3),
  dailyMinutes: z.union([
    z.literal(15), z.literal(30), z.literal(45), z.literal(60), z.literal(90),
  ]),
  consentAt: ISOSchema,
  age18Declared: z.literal(true),
  createdAt: ISOSchema,
  onboardingStep: z.union([
    z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal('done'),
  ]),
});
export type Profile = z.infer<typeof ProfileSchema>;

// ── Baseline ──────────────────────────────────────────────────
export const BaselineAnswerSchema = z.object({
  questionId: z.string(),
  response: z.string().nullable(),
  correct: z.boolean().nullable(),
  skipped: z.boolean(),
  timeMs: z.number().nonnegative(),
  confidence: z.enum(['low', 'medium', 'high']).optional(),
});
export type BaselineAnswer = z.infer<typeof BaselineAnswerSchema>;

export const BaselineAttemptSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['in_progress', 'completed']),
  endedBy: z.enum(['finish', 'timeout']).optional(),
  startedAt: ISOSchema,
  endsAt: ISOSchema,
  completedAt: ISOSchema.optional(),
  currentIndex: z.number().int().min(0).max(11),
  questionIds: z.array(z.string()),
  answers: z.array(BaselineAnswerSchema),
});
export type BaselineAttempt = z.infer<typeof BaselineAttemptSchema>;

// ── Round ─────────────────────────────────────────────────────
const StrategyIdSchema = z.enum([
  'easiest_first', 'skim_then_pick', 'followed_order', 'topics_i_like', 'other',
]);
export type StrategyId = z.infer<typeof StrategyIdSchema>;

export const RoundPickSchema = z.object({
  questionId: z.string(),
  opened: z.boolean(),
  attempted: z.boolean(),
  response: z.string().nullable(),
  correct: z.boolean().nullable(),
  skipped: z.boolean(),
  timeMs: z.number().nonnegative(),
});
export type RoundPick = z.infer<typeof RoundPickSchema>;

export const RoundAttemptSchema = z.object({
  id: z.string().uuid(),
  roundId: z.string(),
  status: z.enum(['in_progress', 'ended', 'reflecting', 'completed']),
  startedAt: ISOSchema,
  endsAt: ISOSchema,
  endedAt: ISOSchema.optional(),
  picks: z.array(RoundPickSchema),
  reflection: z.object({
    perQuestion: z.array(z.object({
      questionId: z.string(),
      call: z.enum(['right_call', 'rather_not_attempted', 'should_have_attempted']),
    })),
    confidence: z.array(z.object({
      questionId: z.string(),
      level: z.enum(['low', 'medium', 'high']),
    })),
    strategy: z.object({
      choice: StrategyIdSchema,
      note: z.string().max(40).optional(),
    }).optional(),
    strategyWorked: z.enum(['yes', 'partly', 'no']).optional(),
    stepsDone: z.array(z.union([z.literal(1), z.literal(2), z.literal(3)])),
  }).optional(),
});
export type RoundAttempt = z.infer<typeof RoundAttemptSchema>;

// ── Mock ──────────────────────────────────────────────────────
const Step2Schema = z.enum(['fast', 'slow', 'guessed', 'can_solve', 'cannot_solve']);
export type Step2 = z.infer<typeof Step2Schema>;

const OutcomeCodeSchema = z.enum([
  'CORRECT_FAST', 'CORRECT_SLOW', 'CORRECT_GUESSED',
  'WRONG_CAN', 'WRONG_CANNOT',
  'LEFT_CAN', 'LEFT_CANNOT',
  'UNSEEN_CAN', 'UNSEEN_CANNOT',
]);
export type OutcomeCode = z.infer<typeof OutcomeCodeSchema>;

export const MockRecordSchema = z.object({
  n: z.number().int().positive(),
  type: z.string(),
  typeOtherNote: z.string().max(40).optional(),
  step1: z.enum(['correct', 'wrong', 'left', 'unseen']),
  step2: Step2Schema,
  outcomeCode: OutcomeCodeSchema,
  comment: z.string().max(200).optional(),
});
export type MockRecord = z.infer<typeof MockRecordSchema>;

export const MockSectionSchema = z.object({
  section: SectionSchema,
  questionCount: z.number().int().min(1).max(100),
  records: z.array(MockRecordSchema),
  actualScore: z.number().int().optional(),
  savedAt: ISOSchema.optional(),
});
export type MockSection = z.infer<typeof MockSectionSchema>;

export const MockEntrySchema = z.object({
  id: z.string().uuid(),
  label: z.string(),
  date: LocalDateSchema,
  sections: z.array(MockSectionSchema),
});
export type MockEntry = z.infer<typeof MockEntrySchema>;

// ── Revision ──────────────────────────────────────────────────
export const RevisionItemSchema = z.object({
  id: z.string().uuid(),
  topic: z.string().max(60),
  section: SectionSchema.optional(),
  createdOn: LocalDateSchema,
  schedule: z.array(z.object({
    dueOn: LocalDateSchema,
    status: z.enum(['scheduled', 'reviewed']),
  })),
  cycleComplete: z.boolean(),
});
export type RevisionItem = z.infer<typeof RevisionItemSchema>;

// ── Passage session ───────────────────────────────────────────
export const PassageSessionSchema = z.object({
  id: z.string().uuid(),
  passageId: z.string(),
  status: z.enum(['in_progress', 'completed']),
  startedAt: ISOSchema,
  endsAt: ISOSchema,
  endedAt: ISOSchema.optional(),
  selectedWords: z.array(z.string()).max(30),
  assignedOn: LocalDateSchema,
});
export type PassageSession = z.infer<typeof PassageSessionSchema>;

// ── Word card ─────────────────────────────────────────────────
export const WordCardSchema = z.object({
  id: z.string().uuid(),
  word: z.string(),
  passageId: z.string(),
  addedOn: LocalDateSchema,
  status: z.enum(['learning', 'known']),
  contentState: z.enum(['available', 'pending']),
});
export type WordCard = z.infer<typeof WordCardSchema>;

// ── Activity log ──────────────────────────────────────────────
const TaskTypeSchema = z.enum(['baseline', 'revision', 'mock', 'round', 'passage']);
export type TaskType = z.infer<typeof TaskTypeSchema>;

export const ActivityLogEntrySchema = z.object({
  date: LocalDateSchema,
  completedTaskTypes: z.array(TaskTypeSchema),
});
export type ActivityLogEntry = z.infer<typeof ActivityLogEntrySchema>;

export const RecommendationLogEntrySchema = z.object({
  date: LocalDateSchema,
  taskType: TaskTypeSchema,
});
export type RecommendationLogEntry = z.infer<typeof RecommendationLogEntrySchema>;

// ── Feedback ──────────────────────────────────────────────────
const FeatureIdSchema = z.enum([
  'baseline_profile', 'question_selection', 'mock_analysis',
  'revision', 'todays_task', 'my_words',
]);
export type FeatureId = z.infer<typeof FeatureIdSchema>;

export const FeedbackRecordSchema = z.object({
  ratings: z.object({
    strategy: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
    calm: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  }),
  answers: z.object({
    mostAndLeastUseful: z.string().max(280),
    newInsight: z.string().max(280),
    stressful: z.string().max(280),
    dailyUse: z.string().max(280),
    ometMissing: z.string().max(280),
  }),
  wouldUseAgain: z.array(FeatureIdSchema),
  savedAt: ISOSchema.optional(),
});
export type FeedbackRecord = z.infer<typeof FeedbackRecordSchema>;

// ── Event log ─────────────────────────────────────────────────
export const EVENT_NAMES = [
  'consent_given', 'onboarding_complete',
  'baseline_started', 'baseline_completed', 'swot_viewed',
  'round_started', 'round_completed', 'reflection_submitted',
  'mock_section_started', 'mock_section_saved', 'mock_summary_viewed',
  'revision_item_added', 'revision_marked', 'demo_date_jumped',
  'task_started', 'passage_session_completed', 'word_added', 'card_flipped',
  'omet_teaser_viewed', 'feedback_submitted',
] as const;
export type EventName = typeof EVENT_NAMES[number];

export const EventLogEntrySchema = z.object({
  id: z.string().uuid(),
  sid: z.string(),
  ts: ISOSchema,
  event: z.enum(EVENT_NAMES),
  module: z.string(),
});
export type EventLogEntry = z.infer<typeof EventLogEntrySchema>;

// ── AppData ───────────────────────────────────────────────────
export const AppDataSchema = z.object({
  profile: ProfileSchema.nullable(),
  baseline: BaselineAttemptSchema.nullable(),
  rounds: z.array(RoundAttemptSchema),
  mocks: z.array(MockEntrySchema),
  revisionItems: z.array(RevisionItemSchema),
  passageSessions: z.array(PassageSessionSchema),
  wordCards: z.array(WordCardSchema),
  activity: z.array(ActivityLogEntrySchema),
  recommendations: z.array(RecommendationLogEntrySchema),
  feedback: FeedbackRecordSchema.nullable(),
  ui: z.object({ dismissedBanners: z.array(z.string()) }),
});
export type AppData = z.infer<typeof AppDataSchema>;

export const PersistedStoreSchema = z.object({
  schemaVersion: z.literal(1),
  data: AppDataSchema,
});
export type PersistedStore = z.infer<typeof PersistedStoreSchema>;

export const ClockSchema = z.object({ offsetDays: z.number() });
export type ClockData = z.infer<typeof ClockSchema>;
