import { z } from 'zod';
import { LocalDateSchema, SectionSchema } from './schemas';

// ── Config file schemas ───────────────────────────────────────

export const NavItemSchema = z.object({
  id: z.string(),
  route: z.string(),
  label: z.string(),
  icon: z.string(),
  group: z.enum(['primary', 'more']),
});

export const AppConfigSchema = z.object({
  brand: z.object({
    name: z.string(),
    wordmarkSvg: z.string().nullable().optional(),
  }),
  cat: z.object({ date: z.string() }),
  sections: z.object({ VARC: z.number(), LRDI: z.number(), QA: z.number() }),
  scoring: z.object({
    correct: z.number(),
    wrongMcq: z.number(),
    wrongTita: z.number(),
    unattempted: z.number(),
  }),
  timers: z.object({
    baselineMinutes: z.number(),
    announceAtSeconds: z.array(z.number()),
  }),
  features: z.object({
    revision: z.boolean(),
    words: z.boolean(),
    moodboardImages: z.boolean(),
    demoTools: z.boolean(),
  }),
  nav: z.array(NavItemSchema),
  feedback: z.object({
    contact: z.string().optional(),
    minRoundsForCard: z.number(),
  }),
  starterBannerMinQuestions: z.number(),
  assets: z.object({ selfHostedFonts: z.boolean() }),
});
export type AppConfig = z.infer<typeof AppConfigSchema>;

export const GradeEntrySchema = z.object({
  outcomeCode: z.string(),
  grade: z.enum(['A', 'B', 'C', 'D']),
  label: z.string(),
  meaning: z.string(),
});
export const GradesConfigSchema = z.object({ grades: z.array(GradeEntrySchema) });
export type GradesConfig = z.infer<typeof GradesConfigSchema>;

export const QuestionTypesConfigSchema = z.object({
  questionTypes: z.object({
    VARC: z.array(z.string()),
    LRDI: z.array(z.string()),
    QA: z.array(z.string()),
  }),
});
export type QuestionTypesConfig = z.infer<typeof QuestionTypesConfigSchema>;

export const StrategySchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
});
export const StrategiesConfigSchema = z.object({ strategies: z.array(StrategySchema) });
export type StrategiesConfig = z.infer<typeof StrategiesConfigSchema>;

export const RevisionConfigSchema = z.object({ offsetsDays: z.array(z.number()) });
export type RevisionConfig = z.infer<typeof RevisionConfigSchema>;

export const SwotConfigSchema = z.object({
  swot: z.object({
    strengthThreshold: z.object({ minGradeAShare: z.number(), minQuestions: z.number(), description: z.string() }),
    opportunityThreshold: z.object({ gradeBShare: z.number(), description: z.string() }),
    weaknessThreshold: z.object({ gradeDShare: z.number(), description: z.string() }),
    threatThreshold: z.object({ gradeCShare: z.number(), description: z.string() }),
    tiebreakerOrder: z.array(z.string()),
  }),
});
export type SwotConfig = z.infer<typeof SwotConfigSchema>;

export const TaskItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  durationMinutes: z.number(),
  eligibility: z.string(),
  priority: z.number(),
});
export const TasksConfigSchema = z.object({
  tasks: z.array(TaskItemSchema),
  cascade: z.object({
    gradeBShareThreshold: z.number(),
    lastMockWindowDays: z.number(),
    noRepeatSameDayTask: z.boolean(),
  }),
});
export type TasksConfig = z.infer<typeof TasksConfigSchema>;

// copy.json is a free-form nested string object
export const CopyConfigSchema = z.record(z.string(), z.unknown());
export type CopyConfig = z.infer<typeof CopyConfigSchema>;

// ── Content pack schemas ──────────────────────────────────────

export const QuoteSchema = z.object({
  id: z.string(),
  text: z.string(),
  author: z.string().optional(),
});
export const QuotesPackSchema = z.object({ quotes: z.array(QuoteSchema) });
export type QuotesPack = z.infer<typeof QuotesPackSchema>;

export const SchoolSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.object({
    file: z.string(),
    licence: z.string(),
    attribution: z.string(),
    sourceUrl: z.string(),
  }).optional(),
});
export const SchoolsPackSchema = z.object({ schools: z.array(SchoolSchema) });
export type SchoolsPack = z.infer<typeof SchoolsPackSchema>;

export const ProvenanceSchema = z.object({
  label: z.literal('memory-based'),
  recordedBy: z.string(),
  recordedDate: LocalDateSchema,
});

export const QuestionSchema = z.object({
  id: z.string(),
  section: SectionSchema,
  type: z.string(),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  inputType: z.enum(['mcq', 'tita']),
  stimulus: z.object({ kind: z.enum(['text', 'image']), value: z.string() }).optional(),
  stem: z.string(),
  options: z.array(z.object({ id: z.string(), text: z.string() })).optional(),
  correctAnswer: z.string(),
  expectedTimeSec: z.number(),
  solution: z.string(),
  altMethod: z.string().optional(),
  verified: z.boolean(),
  provenance: ProvenanceSchema,
});
export type Question = z.infer<typeof QuestionSchema>;
export const QuestionsPackSchema = z.object({
  meta: z.object({ packVersion: z.string(), sample: z.boolean() }),
  baselineQuestionIds: z.array(z.string()),
  questions: z.array(QuestionSchema),
});
export type QuestionsPack = z.infer<typeof QuestionsPackSchema>;

export const RoundDefSchema = z.object({
  id: z.string(),
  questionIds: z.array(z.string()),
  durationSec: z.number(),
  targetSolves: z.object({ min: z.number(), max: z.number() }),
  recommendedPickIds: z.array(z.string()),
});
export const RoundsPackSchema = z.object({ rounds: z.array(RoundDefSchema) });
export type RoundsPack = z.infer<typeof RoundsPackSchema>;

export const GlossaryWordSchema = z.object({
  word: z.string(),
  meaning: z.string(),
  synonym: z.string(),
  antonym: z.string(),
  usage: z.string(),
});
export const PassageSchema = z.object({
  id: z.string(),
  title: z.string(),
  text: z.string(),
  source: z.string().min(1),
  licence: z.string().min(1),
  estReadMinutes: z.number(),
  glossary: z.array(GlossaryWordSchema).min(15),
});
export const PassagesPackSchema = z.object({ passages: z.array(PassageSchema) });
export type PassagesPack = z.infer<typeof PassagesPackSchema>;
