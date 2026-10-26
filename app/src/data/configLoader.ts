/**
 * configLoader.ts – fetch, validate and hold config and content in memory.
 * Only this module calls fetch(). No localStorage touches here.
 *
 * Required at startup: all config files + schools.json + quotes.json.
 * Optional packs: questions, rounds, passages (absent = "not provided yet").
 */

import {
  AppConfigSchema,           type AppConfig,
  GradesConfigSchema,        type GradesConfig,
  QuestionTypesConfigSchema, type QuestionTypesConfig,
  StrategiesConfigSchema,    type StrategiesConfig,
  RevisionConfigSchema,      type RevisionConfig,
  SwotConfigSchema,          type SwotConfig,
  TasksConfigSchema,         type TasksConfig,
  CopyConfigSchema,          type CopyConfig,
  SchoolsPackSchema,         type SchoolsPack,
  QuotesPackSchema,          type QuotesPack,
  QuestionsPackSchema,       type QuestionsPack,
  RoundsPackSchema,          type RoundsPack,
  PassagesPackSchema,        type PassagesPack,
} from './configSchemas';

// ── Error type ────────────────────────────────────────────────

export interface ConfigError {
  file: string;
  field: string;
  message: string;
}

function makeError(file: string, field: string, message: string): ConfigError {
  return { file, field, message };
}

// ── Loaded config state ───────────────────────────────────────

export interface LoadedConfig {
  app: AppConfig;
  grades: GradesConfig;
  questionTypes: QuestionTypesConfig;
  strategies: StrategiesConfig;
  revision: RevisionConfig;
  swot: SwotConfig;
  tasks: TasksConfig;
  copy: CopyConfig;
  schools: SchoolsPack;
  quotes: QuotesPack;
  questions: QuestionsPack | null;
  rounds: RoundsPack | null;
  passages: PassagesPack | null;
}

let _config: LoadedConfig | null = null;
let _errors: ConfigError[] = [];

export function getConfig(): LoadedConfig | null { return _config; }
export function getConfigErrors(): ConfigError[] { return _errors; }
export function hasConfigErrors(): boolean { return _errors.length > 0; }

// ── Fetch helper ──────────────────────────────────────────────

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json() as Promise<unknown>;
}

type SafeParseSchema<T> = {
  safeParse: (v: unknown) => {
    success: boolean;
    data?: T;
    error?: { issues: { path: (string | number)[]; message: string }[] };
  };
};

async function loadRequired<T>(
  url: string,
  schema: SafeParseSchema<T>,
  fileName: string
): Promise<T | ConfigError> {
  try {
    const raw = await fetchJson(url);
    const result = schema.safeParse(raw);
    if (!result.success) {
      const firstIssue = result.error?.issues[0];
      const field = firstIssue?.path.join('.') ?? 'unknown';
      return makeError(fileName, field, firstIssue?.message ?? 'Validation failed');
    }
    return result.data as T;
  } catch (e) {
    return makeError(fileName, 'fetch', String(e));
  }
}

async function loadOptional<T>(
  url: string,
  schema: SafeParseSchema<T>,
): Promise<T | null> {
  try {
    const raw = await fetchJson(url);
    const result = schema.safeParse(raw);
    return result.success ? (result.data as T) : null;
  } catch {
    return null;
  }
}

function isConfigError(v: unknown): v is ConfigError {
  return typeof v === 'object' && v !== null && 'file' in v && 'field' in v;
}

// ── Main loader ───────────────────────────────────────────────

export async function loadConfig(): Promise<boolean> {
  _errors = [];

  const [app, grades, qTypes, strategies, revision, swot, tasks, copy, schools, quotes] =
    await Promise.all([
      loadRequired('/config/app.json',           AppConfigSchema,           'app.json'),
      loadRequired('/config/grades.json',        GradesConfigSchema,        'grades.json'),
      loadRequired('/config/questionTypes.json', QuestionTypesConfigSchema, 'questionTypes.json'),
      loadRequired('/config/strategies.json',    StrategiesConfigSchema,    'strategies.json'),
      loadRequired('/config/revision.json',      RevisionConfigSchema,      'revision.json'),
      loadRequired('/config/swot.json',          SwotConfigSchema,          'swot.json'),
      loadRequired('/config/tasks.json',         TasksConfigSchema,         'tasks.json'),
      loadRequired('/config/copy.json',          CopyConfigSchema,          'copy.json'),
      loadRequired('/content/schools.json',      SchoolsPackSchema,         'schools.json'),
      loadRequired('/content/quotes.json',       QuotesPackSchema,          'quotes.json'),
    ]);

  const required = [app, grades, qTypes, strategies, revision, swot, tasks, copy, schools, quotes];
  for (const r of required) {
    if (isConfigError(r)) _errors.push(r);
  }
  if (_errors.length > 0) return false;

  const [questions, rounds, passages] = await Promise.all([
    loadOptional('/content/questions.json', QuestionsPackSchema),
    loadOptional('/content/rounds.json',    RoundsPackSchema),
    loadOptional('/content/passages.json',  PassagesPackSchema),
  ]);

  // Cross-file integrity checks on whatever packs are present
  if (questions) {
    const integrityErrors = checkIntegrity(questions, rounds, qTypes as QuestionTypesConfig);
    _errors.push(...integrityErrors);
    if (_errors.length > 0) return false;
  }

  _config = {
    app:           app as AppConfig,
    grades:        grades as GradesConfig,
    questionTypes: qTypes as QuestionTypesConfig,
    strategies:    strategies as StrategiesConfig,
    revision:      revision as RevisionConfig,
    swot:          swot as SwotConfig,
    tasks:         tasks as TasksConfig,
    copy:          copy as CopyConfig,
    schools:       schools as SchoolsPack,
    quotes:        quotes as QuotesPack,
    questions,
    rounds,
    passages,
  };

  return true;
}

// ── Cross-file integrity checks (Schema 3.5) ──────────────────

export function checkIntegrity(
  questions: QuestionsPack,
  rounds: RoundsPack | null,
  questionTypes: QuestionTypesConfig
): ConfigError[] {
  const errors: ConfigError[] = [];
  const qMap = new Map(questions.questions.map((q) => [q.id, q]));

  // baselineQuestionIds: exactly 12, 4 per section
  const bqIds = questions.baselineQuestionIds;
  if (bqIds.length !== 12) {
    errors.push(makeError('questions.json', 'baselineQuestionIds', `Must have 12 ids, found ${bqIds.length}`));
  }
  for (const id of bqIds) {
    if (!qMap.has(id)) errors.push(makeError('questions.json', 'baselineQuestionIds', `Id ${id} not found`));
  }
  const sectionCounts: Record<string, number> = { VARC: 0, LRDI: 0, QA: 0 };
  for (const id of bqIds) {
    const q = qMap.get(id);
    if (q) sectionCounts[q.section] = (sectionCounts[q.section] ?? 0) + 1;
  }
  for (const [s, cnt] of Object.entries(sectionCounts)) {
    if (cnt !== 4) errors.push(makeError('questions.json', 'baselineQuestionIds', `Section ${s} needs 4 ids, found ${cnt}`));
  }

  // Every question type must exist in questionTypes.json for its section
  for (const q of questions.questions) {
    const allowed = questionTypes.questionTypes[q.section as 'VARC' | 'LRDI' | 'QA'] ?? [];
    if (!allowed.includes(q.type)) {
      errors.push(makeError('questions.json', `questions[${q.id}].type`, `Type "${q.type}" not in questionTypes for ${q.section}`));
    }
  }

  // Round integrity
  if (rounds) {
    for (const round of rounds.rounds) {
      for (const qId of round.questionIds) {
        const q = qMap.get(qId);
        if (!q) {
          errors.push(makeError('rounds.json', `rounds[${round.id}]`, `Question ${qId} not found`));
        } else if (q.section !== 'QA') {
          errors.push(makeError('rounds.json', `rounds[${round.id}]`, `Question ${qId} is not QA`));
        }
      }
      for (const rId of round.recommendedPickIds) {
        if (!round.questionIds.includes(rId)) {
          errors.push(makeError('rounds.json', `rounds[${round.id}].recommendedPickIds`, `${rId} not in questionIds`));
        }
      }
    }
  }

  return errors;
}
