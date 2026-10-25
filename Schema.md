# Schema.md: Phase 1 Local Data Schema

**Owner:** Claude
**Version:** 1.0 (proposed)
**Intended repository path:** `/Schema.md`
**Document state:** Proposed update (not yet transferred to the project folder)
**Scope:** Phase 1 only. Everything here lives in the browser (`localStorage`) or in static JSON files. There is no server database. Phase 2 production schema is **not designed** (see section 9).

**Sources:** PRD 1.3 and 1.6 (entities and content packs), Tech_Architecture 8 and 10, `design.md`. Where this file adds a field the PRD does not list, it is marked **[Added]** and logged in section 8 for the PM.

**Conventions.** Types are written in TypeScript style; the code uses Zod schemas that match these definitions. `ISO` = ISO 8601 UTC timestamp string. `LocalDate` = `YYYY-MM-DD` in the tester's local timezone. `Section` = `"VARC" | "LRDI" | "QA"`. Ids are random UUID strings.

---

## 1. Storage layout

| Key | Content | Notes |
|---|---|---|
| `lmp.v1.store` | `{ schemaVersion: 1, data: AppData }` | Profile and all entities; debounced writes |
| `lmp.v1.clock` | `{ offsetDays: number }` | Demo-date offset; affects dates only |
| `lmp.v1.events` | `EventLogEntry[]` | Local usage log, capped at 500 |
| `lmp.v1.sid` | string | Anonymous session ID, regenerated on reset |

On load: if `schemaVersion` differs and a migration exists, migrate; otherwise reset and show a neutral notice. Invalid stored data (fails the schema) also resets. Reset removes every key with the `lmp.v1.` prefix.

```ts
interface AppData {
  profile: Profile | null;
  baseline: BaselineAttempt | null;
  rounds: RoundAttempt[];              // at most one per roundId
  mocks: MockEntry[];
  revisionItems: RevisionItem[];
  passageSessions: PassageSession[];
  wordCards: WordCard[];
  activity: ActivityLogEntry[];
  recommendations: RecommendationLogEntry[];   // [Added]
  feedback: FeedbackRecord | null;             // [Added]
  ui: { dismissedBanners: string[] };          // session-level dismissals
}
```

---

## 2. Entities

### 2.1 Profile
```ts
interface Profile {
  id: string;                       // anonymous random id
  displayName: string;              // 1 to 30 chars; never shared or sent
  targetSchoolIds: string[];        // 1 to 3 ids from schools.json
  dailyMinutes: 15 | 30 | 45 | 60 | 90;
  consentAt: ISO;
  age18Declared: true;              // required true; no age or birth date stored
  createdAt: ISO;
  onboardingStep: 1 | 2 | 3 | 4 | "done";   // [Added] resumes onboarding
}
```

### 2.2 BaselineAttempt
```ts
interface BaselineAttempt {
  id: string;
  status: "in_progress" | "completed";
  endedBy?: "finish" | "timeout";   // [Added]
  startedAt: ISO;
  endsAt: ISO;                      // startedAt + 15 min (configurable); real time
  completedAt?: ISO;
  currentIndex: number;             // [Added] resume position (0 to 11)
  questionIds: string[];            // the 12 ids taken from baselineQuestionIds
  answers: BaselineAnswer[];
}
interface BaselineAnswer {
  questionId: string;
  response: string | null;          // option id or typed value
  correct: boolean | null;          // null when skipped or unanswered
  skipped: boolean;
  timeMs: number;                   // focus time; pauses while the tab is hidden
  confidence?: "low" | "medium" | "high";
}
```

### 2.3 RoundAttempt
```ts
interface RoundAttempt {
  id: string;
  roundId: string;
  status: "in_progress" | "ended" | "reflecting" | "completed";   // [Added] explicit states
  startedAt: ISO;
  endsAt: ISO;                      // startedAt + durationSec
  endedAt?: ISO;
  picks: RoundPick[];               // one per question in the round
  reflection?: {
    perQuestion: { questionId: string; call: "right_call" | "rather_not_attempted" | "should_have_attempted" }[];
    confidence: { questionId: string; level: "low" | "medium" | "high" }[];
    strategy?: { choice: StrategyId; note?: string /* max 40 */ };
    strategyWorked?: "yes" | "partly" | "no";
    stepsDone: (1 | 2 | 3)[];       // [Added] each step is skippable
  };
}
interface RoundPick {
  questionId: string;
  opened: boolean;                  // [Added] drives tile state text
  attempted: boolean;
  response: string | null;
  correct: boolean | null;
  skipped: boolean;                 // [Added]
  timeMs: number;
}
type StrategyId = "easiest_first" | "skim_then_pick" | "followed_order" | "topics_i_like" | "other";
```

### 2.4 MockEntry
```ts
interface MockEntry {
  id: string;
  label: string;                    // e.g. "Mock 1"
  date: LocalDate;
  sections: MockSection[];
}
interface MockSection {
  section: Section;
  questionCount: number;            // default 24 / 22 / 22; 1 to 100
  records: MockRecord[];            // only recorded questions are stored
  actualScore?: number;             // integer, between -questionCount and 3 * questionCount
  savedAt?: ISO;                    // [Added] present once the section is saved
}
interface MockRecord {
  n: number;                        // question number within the section
  type: string;                     // from questionTypes.json for the section, or "Other"
  typeOtherNote?: string;           // max 40 chars, only when type is "Other"
  step1: "correct" | "wrong" | "left" | "unseen";
  step2: Step2;
  outcomeCode: OutcomeCode;         // derived from step1 + step2; stored for convenience
  comment?: string;                 // max 200 chars; never question text (BR-12)
}
```

**Outcome codes and grades** (single source of truth is `config/grades.json`; the unit test checks all nine):

| Step 1 | Step 2 (`step2`) | `outcomeCode` | Grade |
|---|---|---|---|
| `correct` | `fast` (Solved it in no time) | `CORRECT_FAST` | A |
| `correct` | `slow` (Solved it but took a lot of time) | `CORRECT_SLOW` | B |
| `correct` | `guessed` (Guessed it) | `CORRECT_GUESSED` | C |
| `wrong` | `can_solve` (Wrong, but could solve) | `WRONG_CAN` | B |
| `wrong` | `cannot_solve` (Wrong, cannot solve) | `WRONG_CANNOT` | D |
| `left` | `can_solve` | `LEFT_CAN` | B |
| `left` | `cannot_solve` | `LEFT_CANNOT` | C |
| `unseen` | `can_solve` | `UNSEEN_CAN` | B |
| `unseen` | `cannot_solve` | `UNSEEN_CANNOT` | C |

`type Step2 = "fast" | "slow" | "guessed" | "can_solve" | "cannot_solve"`. The user never selects a grade letter; the grade is always derived.

### 2.5 RevisionItem
```ts
interface RevisionItem {
  id: string;
  topic: string;                    // max 60 chars
  section?: Section;
  createdOn: LocalDate;
  schedule: { dueOn: LocalDate; status: "scheduled" | "reviewed" }[];   // 4 entries; fewer if dates fall after the CAT date
  cycleComplete: boolean;
}
```
Due dates are `createdOn + offsets` (config, default 1, 3, 9, 18 days), none after the CAT date. The current step is the first entry whose status is `scheduled`. **Reviewed** sets that entry to `reviewed`. **Need more time** sets that entry's `dueOn` to the next day (later entries keep their dates). `waiting` is derived (`dueOn` before today, not reviewed), never stored, so nothing is duplicated.

### 2.6 PassageSession
```ts
interface PassageSession {
  id: string;
  passageId: string;
  status: "in_progress" | "completed";   // [Added]
  startedAt: ISO;
  endsAt: ISO;                      // startedAt + estReadMinutes
  endedAt?: ISO;
  selectedWords: string[];          // normalised (lowercase, punctuation stripped), max 30
  assignedOn: LocalDate;            // [Added] app-clock date the passage was assigned
}
```

### 2.7 WordCard
```ts
interface WordCard {
  id: string;
  word: string;                     // normalised
  passageId: string;
  addedOn: LocalDate;
  status: "learning" | "known";
  contentState: "available" | "pending";   // pending when no glossary entry exists
}
```
Duplicate words (same normalised word) are not added twice.

### 2.8 ActivityLogEntry and RecommendationLogEntry
```ts
interface ActivityLogEntry { date: LocalDate; completedTaskTypes: TaskType[]; }          // drives "days practised"
interface RecommendationLogEntry { date: LocalDate; taskType: TaskType; }                // [Added] last write per date wins; used for "not the same task two days in a row"
type TaskType = "baseline" | "revision" | "mock" | "round" | "passage";
```
**Days practised** = number of distinct dates in `activity` that have at least one completed task.

### 2.9 FeedbackRecord [Added: PRD 8.2 and design 8.12]
```ts
interface FeedbackRecord {
  ratings: { strategy: 1|2|3|4|5; calm: 1|2|3|4|5 };
  answers: {                        // each max 280 chars
    mostAndLeastUseful: string; newInsight: string; stressful: string;
    dailyUse: string; ometMissing: string;
  };
  wouldUseAgain: FeatureId[];
  savedAt?: ISO;                    // absent while a draft
}
type FeatureId = "baseline_profile" | "question_selection" | "mock_analysis" | "revision" | "todays_task" | "my_words";
```

### 2.10 Event log (local only)
```ts
interface EventLogEntry { id: string; sid: string; ts: ISO; event: EventName; module: string; }
type EventName =
  | "consent_given" | "onboarding_complete"
  | "baseline_started" | "baseline_completed" | "swot_viewed"
  | "round_started" | "round_completed" | "reflection_submitted"
  | "mock_section_started" | "mock_section_saved" | "mock_summary_viewed"
  | "revision_item_added" | "revision_marked" | "demo_date_jumped"
  | "task_started" | "passage_session_completed" | "word_added" | "card_flipped"
  | "omet_teaser_viewed" | "feedback_submitted";
```
No free text, display name, school choice, score or answer is ever written to the log.

### 2.11 Shared session summary (generated, not stored)
Built on demand for Send to the team: a readable block (ratings, answers, features) plus a compact block with the anonymous session ID and **a count per event name**. It never contains `displayName`, schools, practice answers or mock records. A unit test asserts this.

---

## 3. Content packs (`public/content/*.json`)

All packs are validated at startup and by `npm run validate:content`.

### 3.1 `questions.json`
```ts
interface QuestionsPack {
  meta: { packVersion: string; sample: boolean };            // [Added]
  baselineQuestionIds: string[];                             // [Added] exactly 12: 4 VARC, 4 LRDI, 4 QA
  questions: Question[];
}
interface Question {
  id: string;
  section: Section;
  type: string;                     // must exist in questionTypes.json for the section
  difficulty: 1 | 2 | 3;
  inputType: "mcq" | "tita";
  stimulus?: { kind: "text" | "image"; value: string };     // passage or data set
  stem: string;                     // plain text; images only via stimulus
  options?: { id: string; text: string }[];                  // mcq only
  correctAnswer: string;
  expectedTimeSec: number;
  solution: string;
  altMethod?: string;
  verified: boolean;
  provenance: { label: "memory-based"; recordedBy: string; recordedDate: LocalDate };
}
```

### 3.2 `rounds.json`
```ts
interface RoundsPack { rounds: { id: string; questionIds: string[] /* 5, all QA */; durationSec: number /* 300 */;
  targetSolves: { min: number; max: number } /* 2 and 3 */; recommendedPickIds: string[] /* subset of questionIds */ }[]; }
```

### 3.3 `passages.json`
```ts
interface PassagesPack { passages: { id: string; title: string; text: string; source: string; licence: string;
  estReadMinutes: number; glossary: { word: string; meaning: string; synonym: string; antonym: string; usage: string }[] /* at least 15 */ }[]; }
```
Passages are served in pack order (assumption PR-10).

### 3.4 `quotes.json`, `schools.json`, `sampleMock.json`
```ts
interface QuotesPack { quotes: { id: string; text: string; author?: string }[]; }
interface SchoolsPack { schools: { id: string; name: string;
  image?: { file: string; licence: string; attribution: string; sourceUrl: string } }[]; }
interface SampleMockPack { label: string; date: LocalDate; sections: MockSection[]; }   // no free-text comments
```
`sampleMock.json` must reproduce the BRD worked example: VARC A7 B4 C8 D5, LRDI A4 B9 C9 D0, QA A2 B3 C16 D1; potential 33, 39, 15, total 87.

### 3.5 Cross-file integrity checks (beyond the schemas)
- Every round question exists and is a QA question; `recommendedPickIds` are a subset of the round's questions.
- `baselineQuestionIds` has 12 ids that exist, 4 per section.
- Every question `type` exists in `questionTypes.json` for its section.
- Every passage glossary has at least 15 words; passage `source` and `licence` are not empty.
- Every school image file exists and carries licence, attribution and source.
- Any pack with `meta.sample` true shows the SAMPLE badge on every item.

---

## 4. Configuration (`public/config/*.json`)

| File | Contents |
|---|---|
| `app.json` | `brand { name, wordmark }`; `cat { date: "2026-11-29" }`; `sections { VARC: 24, LRDI: 22, QA: 22 }`; `scoring { correct: 3, wrongMcq: -1, wrongTita: 0, unattempted: 0 }`; `timers { baselineMinutes: 15, announceAtSeconds: [300, 60] }`; `features { revision, words, moodboardImages, demoTools }`; `nav [ { id, route, label, icon, group: "primary" | "more" } ]`; `feedback { contact?: string, minRoundsForCard: 1 }`; `starterBannerMinQuestions: 10` |
| `grades.json` | The nine outcome codes mapped to grades A to D, with grade labels and meaning lines |
| `swot.json` | Classification thresholds and tie-break order (PRD 2.2) |
| `tasks.json` | Task catalogue (durations, eligibility) and cascade thresholds (PRD 5.3, 5.4): grade B share 25 percent, last-mock window 7 days |
| `revision.json` | `offsetsDays: [1, 3, 9, 18]` |
| `questionTypes.json` | Fixed question-type lists per section (PRD 4.4) |
| `strategies.json` | The five strategy options |
| `copy.json` | Every user-facing string, including reason templates, reading lines and the BR-14 sentence |

The CAT date and the marking scheme are PRD assumptions held here so they can change without code.

---

## 5. Derived data (never stored)

SWOT quadrants, section summaries, grade counts, focus list, potential score (`3 × (A + B)` per section, from `scoring.correct`), gap to actual, round summary and alignment, today's recommendation, journey progress, days to CAT, `waiting` revision items. All are computed by pure `domain/` functions from the stored data and configuration, and every result carries its evidence values.

---

## 6. Validation rules summary

| Field | Rule |
|---|---|
| `displayName` | 1 to 30 characters |
| `targetSchoolIds` | 1 to 3 existing ids |
| `dailyMinutes` | one of 15, 30, 45, 60, 90 |
| `MockRecord.comment` | maximum 200 characters |
| `typeOtherNote`, strategy `note` | maximum 40 characters |
| `RevisionItem.topic` | maximum 60 characters |
| Feedback answers | maximum 280 characters each |
| `selectedWords` | maximum 30 per session, normalised |
| `actualScore` | integer from `-questionCount` to `3 * questionCount` |
| Dates | `LocalDate` for scheduling and activity; `ISO` for timestamps |

---

## 7. Privacy classification

| Data | Leaves the device? |
|---|---|
| Display name, schools, daily time, all practice and mock data, revision items, words | No |
| Event log | No (only per-event counts appear in a summary the tester chooses to share) |
| Feedback | Only if the tester taps Share, Copy or Download and sends it |

---

## 8. Additions to the PRD data model (for the PM to confirm)

| ID | Addition | Reason |
|---|---|---|
| S-1 | `questions.json` `meta { packVersion, sample }` and `baselineQuestionIds` | SAMPLE badge signal; deterministic baseline |
| S-2 | Explicit `status` values and `currentIndex` on attempts | Resume and expiry behaviour (PR-4) |
| S-3 | `Profile.onboardingStep` | Resume onboarding after a refresh |
| S-4 | `RoundPick.opened` and `skipped`; `reflection.stepsDone` | Tile states and skippable steps |
| S-5 | `MockSection.savedAt`, `MockRecord.step1`, `step2`, `typeOtherNote` | Entry flow in the Design |
| S-6 | `RecommendationLogEntry` | "Not the same task two days in a row" |
| S-7 | `FeedbackRecord` | PRD 8.2 has no entity for it |
| S-8 | `PassageSession.assignedOn`, `status` | Passage assignment (PR-10) |

---

## 9. Phase 2 note (not approved, not designed)

A production schema (tables, relations, indexes, authentication, consent records, server-side deletion) will be written only after the founders approve Phase 2. The entities above are expected to map to tables with little change, and the Zod schemas are expected to carry over as API validation.
