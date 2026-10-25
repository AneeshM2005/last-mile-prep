# Last-Mile Prep App for CAT and OMET Aspirants

**Document type:** Product Requirements Document (PRD), Phase 1 user-testing prototype
**Version:** 1.0
**Owner:** Senior Product Manager
**Upstream document:** BRD v1.0 (`/BRD.md`)
**Audience:** Senior developer(s) and the Senior UI/UX Designer
**Technology stack:** Not prescribed here (BRD C-5). Technology is chosen at the architecture stage, after this PRD.

**Status labels**
- **[BRD]** carried over from the BRD.
- **[Decision]** confirmed by the founders while the PRD was being written, 26 October 2026.
- **[Assumption]** proposed by the PM. It is implemented as tunable configuration and can be changed without code changes.

---

## Project Overview

The goal of this project is to build a responsive web application that gives CAT aspirants last-mile preparation, with a visible progression towards OMET (other MBA entrance tests). The application does not teach concepts. It helps aspirants prepare for exam day through three pillars:

1. **Strategy:** exam strategy, timing, question selection and composure, built from the user's own observable performance.
2. **Fun:** light, non-guilty activities that prepare the user indirectly.
3. **Wellness:** learning-focused rather than winning-focused practice that supports calm and reduces stress.

The system derives every recommendation and profile from data the user generates inside the app (baseline answers, practice rounds, mock-analysis entries, revision activity, saved words). All personalisation is **rule-based and deterministic**. No generative AI or external API is required.

**Primary user:** the Aspirant, who is the only role in the product. There is no admin, mentor or alumni role in Phase 1.

**Timing and scope decisions [Decision]**
- The Round 2 deadline is today, **26 October 2026**. The build and the tester sessions both happen today.
- The **27 October 2026 review buffer is reserved for the next stage of the competition** and is not available to this build. Plan the work to finish within today.
- Question content stays as defined in the BRD (R-1): memory-based, past-year-style questions, clearly labelled as such. All content is loaded from a swappable content pack (see Milestone 1), so it can be replaced without code changes.
- The founders will supply the real content (questions, passages, quotes, school images) after the application is built. The application must therefore run end to end on clearly labelled **sample content** and accept the real content pack with no code changes.

**Build priority [BRD]:** F1, F2, F3 and F5 first. F4 and F6 may be lighter versions. If time runs short, cut in this order: F6, then F4, then moodboard imagery (fall back to a solid colour). Do not cut F1, F2, F3 or F5.

**Guiding principles and what they mean for engineering [BRD]**

| Principle | Engineering consequence |
|---|---|
| Personalised from observable performance | No hard-coded generic advice. Every insight must cite the data behind it. |
| Honest progress | No percentile output, no "talent" labels, no predictive wording (BR-1, BR-2). |
| Gamification without hyper-competition | No leaderboards, ranks, comparisons with other users, or streak-loss messaging. |
| Last-mile, not concept teaching | No lessons, videos or concept explainers. |
| Calm by design | Timers are visible but quiet. No red flashing, alarms or shaming copy. |

---

## Level

Medium. It is a one-day build of six feature modules plus a foundation, with no backend dependency, local persistence, rule-based logic and card-based interaction on both laptop and mobile.

---

## Type of Project

Responsive Web Application, EdTech, Rule-based Personalisation, User-Testing Prototype.

---

## Skills Required

- Responsive front-end development (component-based UI, card layouts, laptop and mobile browsers)
- Client-side state management and local persistence with schema versioning
- Timers and time tracking (including pausing when the tab is hidden)
- Rule-based logic and data modelling (aggregation, thresholds, scheduling)
- Content-pack ingestion and validation (JSON or equivalent)
- Accessibility basics (keyboard navigation, contrast, touch targets)
- Lightweight event logging and a feedback form on free tiers
- Awareness of privacy-by-default design

---

## Key Features

### Milestone 1: Foundation, Profile and Cross-Cutting Rules (supports F7)

**1.1 Information architecture [Decision: card-based, laptop-preferred, mobile-supported]**
Primary navigation: Home, Practice (Baseline, Question Selection), Mock Analysis, Revision, Words, My Profile (SWOT), OMET, Feedback. Use a left sidebar on laptop and a bottom bar on mobile. Wherever data entry is needed, use **one card per item with empty fields to fill**, never a dense table. The same card pattern is used on laptop and mobile.

**1.2 Onboarding and dummy login [BRD F7, Decision]**
1. Consent screen with a plain-language notice (what is stored, that it stays on this device, how to delete it), a required consent checkbox and a required "I am 18 or older" self-declaration.
2. Dummy login: the user enters a **display name**. There is no password, email or phone number.
3. Select 1 to 3 **target B-schools** from the fixed list (used for the moodboard).
4. Select **daily time available**: 15, 30, 45, 60 or 90 minutes.

The profile is created locally with an anonymous random ID. A **Reset my data** control, always reachable from My Profile, deletes all locally stored data (this is the consent-withdrawal and deletion mechanism). A "start new session" path must exist so that several testers can use one device.

**1.3 Local data layer [BRD A-1]**
All data is local to the device and sample-based. No real user records. Store a schema version and migrate or reset on mismatch. Entities:

| Entity | Key fields |
|---|---|
| Profile | id, displayName, targetSchoolIds[], dailyMinutes, consentAt, age18Declared, createdAt |
| BaselineAttempt | id, startedAt, completedAt, answers[{questionId, response, correct, skipped, timeMs, confidence?}] |
| RoundAttempt | id, roundId, startedAt, endedAt, picks[{questionId, attempted, response, correct, timeMs}], reflection{perQuestion[], confidence[], strategy, strategyWorked} |
| MockEntry | id, label, date, sections[{section, records[{n, type, outcomeCode, comment?}], actualScore?}] |
| RevisionItem | id, topic, section?, createdOn, schedule[{dueOn, status}], cycleComplete |
| PassageSession | id, passageId, startedAt, endedAt, selectedWords[] |
| WordCard | id, word, passageId, addedOn, status (learning, known), contentState (available, pending) |
| ActivityLog | date, completedTaskTypes[] (drives "days practised") |

**1.4 Application clock [Decision: supports the F4 demo]**
All date logic must read from a single `appClock.now()` that can carry a simulated offset. When an offset is active, a persistent banner shows "Demo date: <date>".

**1.5 Configuration (no hard-coded constants)**
- CAT date: **29 November 2026** (reported by multiple public sources; confirm against the official bulletin). Days remaining = CAT date minus `appClock.now()`.
- Section structure: VARC 24, LRDI 22, QA 22 questions; +3 correct, −1 wrong MCQ, 0 for type-in and unattempted. **[Assumption: confirm against the official bulletin]**
- Nine-outcome to grade map (Milestone 4), spaced-repetition offsets, SWOT thresholds, task-selection thresholds, question-type lists, strategy list, quote list.

**1.6 Content packs**
All content is loaded from structured files (JSON or equivalent) validated against a schema at startup. On validation failure, show a clear error naming the file and field. If no real pack is present, load the built-in sample pack and mark every sample item with a visible **SAMPLE** badge.

| Pack | Required fields |
|---|---|
| Questions | id, section (VARC, LRDI, QA), type (from the fixed list), difficulty (1 to 3), inputType (mcq, tita), stimulus? (text or image, for passage or data-set questions), stem, options?, correctAnswer, expectedTimeSec, solution, altMethod?, verified (bool), provenance {label: "memory-based", recordedBy, recordedDate} |
| Rounds (F2) | id, questionIds[5], durationSec (300), targetSolves (min 2, max 3), recommendedPickIds[] |
| Passages (F6) | id, title, text, source, licence, estReadMinutes, glossary[{word, meaning, synonym, antonym, usage}] |
| Quotes | id, text (team-written) |
| Schools | id, name, image {file, licence, attribution, sourceUrl} |

Every question carries a visible **"Memory-based question"** label (BR-13). Every passage shows its source and licence (BR-15). Solutions must show the verified flag and, where `altMethod` exists, the alternative method (BR-8).

**1.7 Copy and tone rules (wellness pillar) [Decision: tone and reflection prompts, no separate feature]**
- Allowed framing: "learning", "your next step", "one thing to try".
- Forbidden: "you lost", "streak broken", "you missed", "behind", "failed", ranks, comparisons with other users, percentile claims, "talent", "weak student", and any promise to reduce anxiety or guarantee a result (BR-1, BR-2, BR-3).
- Every post-practice screen ends with a short reflection prompt rather than a score verdict.
- Any wellness-related copy must read as a practice aid, "not a promise to eliminate anxiety".

**1.8 Non-functional requirements**
- **Responsive:** no horizontal scroll from 360 px width upwards. Touch targets at least 44 px.
- **Accessibility:** full keyboard operation, visible focus states, text contrast at least WCAG AA, and non-colour cues in addition to colour for grades.
- **Calm timers:** visible countdown, no flashing or sound. Timer text updates at most once per second.
- **Persistence:** in-progress attempts autosave and resume after a refresh.
- **Privacy:** no personal data beyond the display name. No third-party trackers. Events carry only an anonymous session ID.
- **Labelling:** SAMPLE badge, Memory-based label and a "Demo tools" label (BR-13, A-1).

**Acceptance criteria**
- A new user cannot reach the home screen without ticking both consent boxes and entering a display name.
- Reset my data removes all stored data and returns to the consent screen.
- Replacing the content pack with a valid one changes all content with no code change. An invalid pack shows a named validation error.
- Changing the simulated date updates the banner and every date-dependent view.
- No screen contains any forbidden phrase from 1.7.

---

### Milestone 2: Baseline Test and SWOT Profile (F1, Priority: Must)

**2.1 Baseline test**
- 12 questions: 4 each from VARC, LRDI and QA, mixed across difficulty levels 1 to 3 **[Decision]**. Time limit about 15 minutes, shown as a quiet countdown. On expiry, auto-submit with no penalty message.
- One question per card. Questions with a shared stimulus (a passage or data set) show the stimulus beside or above the question.
- Controls: answer (MCQ option or type-in), **Skip**, Previous, Next, and a question grid for jumping.
- After answering or skipping, an **optional** single-tap confidence chip (Low, Medium, High). Confidence is never mandatory.
- Time per question is measured as focus time and pauses while the tab is hidden.
- Each answer is saved immediately. The attempt resumes after a refresh.

**2.2 SWOT profile**
The SWOT is built at **pattern level** (section × question type), not from easy, moderate and hard labels alone. Classification rules per pattern **[Assumption, tunable]**:

| Quadrant | Baseline and round evidence | Mock-analysis evidence |
|---|---|---|
| Strength | Correct and time at or below `expectedTimeSec` | Grade A |
| Weakness | Wrong or skipped, with Low confidence | Grade D |
| Opportunity | Correct but time above `expectedTimeSec` | Grade B |
| Threat | Wrong with High confidence, or a difficulty-1 question skipped | Grade C |

A pattern with mixed evidence appears in its most frequent quadrant. Ties go to the more cautious quadrant (Threat, then Weakness, then Opportunity, then Strength).

**2.3 SWOT screen**
- Four quadrants listing patterns, each with an evidence line, for example "Based on 2 questions: 1 correct, average 48 s". The number of questions behind every item must always be visible.
- A banner: "Starter profile. It becomes more detailed as you use the app."
- A per-section summary (accuracy, average time, skipped count).
- The profile recomputes whenever new baseline, round or mock-analysis data is saved.
- No scores out of 100, no percentiles, no ranking language.

**Acceptance criteria**
- A user can finish all 12 questions (or time out) and reach the SWOT without a blocking error.
- Every SWOT item shows its evidence line and question count.
- Skipping questions and leaving confidence blank both work and are reflected in the profile.
- Closing the tab mid-test and reopening resumes at the same question.
- Saving a mock-analysis entry changes the SWOT where the rules say it should.

---

### Milestone 3: Question-Selection Practice (F2, Priority: Must, QA only)

**3.1 Round mechanics [Decision: 2 rounds, 5 questions each, 5 minutes]**
- All 5 questions of a round are visible at once as cards or a list. The user can open them in any order, answer, skip and switch freely. Free choice of order is the training purpose.
- A visible goal line: "Aim to solve 2 to 3 of these" (from `targetSolves`).
- Countdown of 5:00. At 0:00 the round ends automatically, inputs lock, and submitted answers are kept. There is no penalty.
- Record per question: attempted (yes or no), response, correctness, focus time.

**3.2 Post-round reflection (three steps, all skippable)**
1. **Selection review:** for each question, mark "Right call", or "Would rather not have attempted" (if attempted), or "Should have attempted" (if left).
2. **Confidence:** Low, Medium or High for each attempted question.
3. **Strategy:** choose one from a fixed list (Easiest first, Skim then pick, Followed the order, Chose topics I like, Other with a short note), then "Did it work?" (Yes, Partly, No).

**3.3 Round summary**
- Attempted, solved and average time.
- **Selection alignment:** the share of `recommendedPickIds` the user attempted, for example "You attempted 2 of the 3 questions rated easiest for this set". The comparison is shown as information, not a verdict.
- A neutral reflection line, and a link to the round's verified solutions with alternative methods where present.
- Results feed pattern statistics for the SWOT.

**Acceptance criteria**
- Round ends at 0:00 whether or not the user has submitted anything, and all entered data is preserved.
- The reflection can be completed or skipped step by step, and the summary renders either way.
- The user can switch between questions with no loss of typed answers.
- The alignment figure matches a manual calculation from the stored picks.

---

### Milestone 4: Mock Analysis (F3, Priority: Must)

**4.1 Purpose and constraint**
Replaces the manual mock-analysis spreadsheet. The user records what happened per question and whether they could have solved it. **The application never captures question text** (BR-12): there is no field that accepts it, and the comment field carries a helper line telling the user not to paste questions.

**4.2 Entry flow [Decision: card per question, one section at a time]**
1. Start a mock: label (for example "Mock 1") and date.
2. Choose a section (VARC, LRDI or QA). The default question count is 24, 22 or 22 and is editable.
3. One **card per question** (Q1, Q2, and so on) with empty fields:
   - **Question type:** dropdown from the fixed list for the section, plus "Other" with a short note.
   - **What happened?** Step 1: Attempted and correct, Attempted and wrong, Left it (saw it), or Didn't get to see it. Step 2 (conditional) completes the outcome code (below).
   - **Comment:** optional, 200 characters maximum.
   - A live **grade chip** (A, B, C or D, with its label and meaning) appears as soon as the outcome is complete.
4. Previous and Next, a "7 of 22 recorded" progress indicator, and a question grid for jumping. Autosave on every change. A card may be left unrecorded and is excluded from counts.
5. **Save section** is allowed once at least one question is recorded. The user can then add another section or open the summary.
6. A **Load sample mock** control seeds demo data (BRD A-3). Any free-text comments taken from the founder's spreadsheet must be reviewed and cleaned before use.

**4.3 Outcome codes and grades [BRD, Appendix A]**

| Step 1 | Step 2 | Grade |
|---|---|---|
| Attempted and correct | Solved it in no time | A |
| Attempted and correct | Solved it but took a lot of time | B |
| Attempted and correct | Guessed it | C |
| Attempted and wrong | Wrong, but could solve | B |
| Attempted and wrong | Wrong, cannot solve | D |
| Left it (saw it) | Could solve | B |
| Left it (saw it) | Cannot solve | C |
| Didn't get to see it | Could solve | B |
| Didn't get to see it | Cannot solve | C |

Grade meaning: **A** Your strength (judgement good, knowledge good). **B** Be a better test taker (judgement bad, knowledge good). **C** Luck or great decision (judgement good, knowledge bad). **D** Red flag (both weak). The user never selects a letter directly. The grade is always derived [Decision: resolves OQ-2].

**4.4 Fixed question-type lists [Assumption, stored in configuration, editable by the founders]**
- **VARC:** Reading Comprehension, Para Jumble, Para Summary, Odd One Out, Para Completion, Other
- **LRDI:** Arrangements, Games and Tournaments, Grids and Tables, Venn and Sets, Networks and Routes, Data Charts, Other
- **QA:** Arithmetic, Algebra, Geometry and Mensuration, Number Systems, Modern Maths, Other

**4.5 Summary screen**
- Grade counts overall and per section (A, B, C, D), shown with labels and non-colour cues.
- A **focus list** of question types ordered by D count, then B count, then C count.
- Rule-based reading lines tied to the BRD goals: if D > 0, "Eliminate the Ds" with the types involved; if B is the largest non-A grade, "Knowledge is there, decisions are the lever"; if C is large, "Exposure to more mocks raises knowledge and reduces C".
- **Potential score:** `3 × (A + B)` per section and in total (BRD Appendix A). Required label (BR-14): "The score if every question you could solve were answered correctly. This is not a prediction. It ignores timing and negative marking."
- **Actual score:** an optional user-entered integer per section [Decision: resolves OQ-4], validated between `−questions` and `3 × questions`. When entered, show the Potential beside the Actual as "a gap to work on", never as a target.

**Acceptance criteria**
- All nine outcome combinations produce the grade in the table above (unit-test the mapping).
- No input anywhere in this module accepts question text beyond the 200-character comment.
- Potential Score matches `3 × (A + B)` for every sample dataset. The BRD worked example (VARC 7, 4, 8, 5; LRDI 4, 9, 9, 0; QA 2, 3, 16, 1) must yield 33, 39, 15, total 87.
- A section can be saved with unrecorded cards, and counts exclude them.
- A refresh mid-entry restores the same card and all entered data.

---

### Milestone 5: Today's Recommended Task, Moodboard and Personal Journey (F5, Priority: Must; gamification from F7)

**5.1 Home screen**
Days to CAT, the **Today's task** card, the moodboard background with a quote, and the personal journey indicator.

**5.2 Today's task card**
Shows: task title, estimated duration, a one-line **reason** that cites real data, a **Start** button, a control to change the available time (chips: 15, 30, 45, 60, 90) and a **"Why this?"** expander listing the inputs used.

**5.3 Task catalogue [Decision]**

| Task | Estimated duration (default) | Eligible when |
|---|---|---|
| Baseline | 15 min | No completed baseline |
| Revise due items | 3 min × due items, capped at 30 min | At least 1 due or waiting revision item |
| Add a mock analysis | 20 min per section | Baseline complete |
| Question-selection round | 10 min (5 min round plus reflection) | Baseline complete and a round is available |
| Read a passage and collect words | 15 min | Baseline complete and a passage is available |

**5.4 Selection rule cascade [Assumption, tunable]**
Evaluate in order. Pick the first eligible task whose duration fits within the available time, otherwise the shortest eligible task with a reason that says so.
1. Baseline not complete: Baseline.
2. Due or waiting revision items: Revise due items.
3. No mock analysis saved in the last 7 simulated days (or ever): Add a mock analysis.
4. Selection-focused: if grade B is at least 25% of recorded mock questions, or no mock data exists: Question-selection round.
5. Otherwise: Read a passage.
Never recommend the same task type two days in a row when another eligible task exists. Reason strings are templates filled with real values, for example "You have {n} revision items waiting" or "Your last mock had {b} questions you could have solved".

**5.5 Moodboard [Decision]**
- Background image chosen from the user's target schools, from the fixed school list, using only official or licensed images with licence and attribution recorded (BR-7). A dark or light overlay guarantees text contrast. If no image is available, use a solid colour.
- A restrained quote, team-written, rotating by date.
- No user image uploads in Phase 1.

**5.6 Personal journey (gamification) [Decision: personal progress only]**
- A milestone path: Baseline done, first question-selection round, first mock analysis, first revision cycle, first passage read.
- A "days practised" count (distinct dates with at least one completed task).
- No streaks that break, no badges, no leaderboards, no comparison with others (BR-4). Copy follows rule 1.7.

**Acceptance criteria**
- With a new profile, the recommended task is Baseline. After completing it, the next recommendation follows the cascade.
- Changing available time to 15 minutes changes the recommendation or its reason when the top task needs longer.
- The "Why this?" expander shows the values used.
- Adding a due revision item (using the demo clock) changes the recommendation on the next load.
- No screen shows streak-loss, ranking or comparison language.

---

### Milestone 6: Spaced-Repetition Reminders (F4, Priority: lighter version)

**6.1 Add an item**
The user enters a topic or chapter (free text, for example "Profit and Loss"), an optional section, and the date the notes were created (default: today).

**6.2 Scheduling [Decision: intervals Day 1, 3, 9, 18]**
- Due dates are `createdOn + 1, 3, 9 and 18 days` (configurable) **[Assumption: Day 1 means the day after creation]**.
- Nothing is scheduled after the CAT date.

**6.3 Due-today list (in-app only, no email, push or WhatsApp)**
- Shows items due or waiting, with the topic, the cycle step (for example "2 of 4") and two actions: **Reviewed** (advances to the next interval) and **Need more time** (keeps the same step and re-appears the next day).
- Items missed on their due date stay in the list under neutral wording such as "Waiting for you". No duplicates are created.
- After the last interval an item shows "Revision cycle complete".
- An **Upcoming** view lists the next 7 days.

**6.4 Demo tools [Decision]**
A "Demo tools" panel with a **Jump to day** control moves the application clock so that testers can see Day 3, 9 and 18 behaviour in one session. It is visibly labelled as a simulation. Use of the control is logged.

**Acceptance criteria**
- Adding an item creates exactly four scheduled dates. After jumping to Day 3, the item appears as due.
- Reviewed advances the step. Need more time keeps the step and returns the item the next day.
- Missed items remain visible, are not duplicated and are never described with guilt language.
- No notification is sent anywhere.

---

### Milestone 7: Personal Word Dictionary (F6, Priority: lighter version)

**7.1 Daily passage session [Decision: passages supplied later by the founders]**
- One assigned passage per simulated day, from the passage pack (about 5 passages for the prototype), shown with its source and licence.
- A timed reading session using `estReadMinutes` as the countdown. At the end, the session closes and selections are saved with no penalty message.
- **Word selection:** click or tap a word to highlight it, tap again to remove. Words are normalised (lowercase, punctuation stripped). Limit 30 per session.

**7.2 Cards**
- Selected words become cards in **My Words**. If the word exists in the passage glossary, the card has content. Otherwise it is created in the **pending** state ("Meaning not available in this prototype yet").
- Front shows the word. Tapping flips it to the **meaning, synonym, antonym and usage** and the source passage.
- Two buttons: **Got it** and **Still learning**.
- Filters: All, Still learning, Got it.
- **Practise mode** cycles through the "Still learning" cards in random order, front to back, with the same two buttons. No competitive elements.

**7.3 Content dependency**
Each passage must ship with a glossary of at least 15 hard words so most selections have content. Card content is team-written samples until a licensed or open dictionary source is decided (OQ-3).

**Acceptance criteria**
- Selecting five words and ending the session creates five cards.
- Selecting a word with no glossary entry creates a pending card without any error.
- Cards flip, and Got it and Still learning change the filters correctly.
- Passage source and licence are visible on every session.

---

### Milestone 8: OMET Teaser, Feedback Capture and Instrumentation (F7)

**8.1 OMET teaser [BRD]**
A screen reachable from the main navigation stating that OMET-specific content is coming soon. No specific exams are named. CAT is shown as active, OMET as coming soon, to make the progression visible (BO-4).

**8.2 Feedback screen (user-test capture)**
- Rating 1 to 5: "This helped me think about strategy" (SC-4).
- Rating 1 to 5: "The app felt supportive, not stressful" (SC-5).
- The five BRD questions as free-text fields: most and least useful feature; whether the SWOT or matrix told them something new; anything stressful, competitive or distracting; what would make daily use possible for the last 30 days; what is missing for OMET.
- A multi-select "Which features would you use again?" listing F1 to F6 (SC-6).
- No name, email or phone field. Show a reminder that answers are anonymous.
- **Delivery:** choose the simplest free-tier mechanism at the architecture stage (for example an embedded or linked form). It must carry no personal data.

**8.3 Event instrumentation (anonymous session ID, UTC timestamp, module only; no free text)**

| Event | Used for |
|---|---|
| `consent_given`, `onboarding_complete` | SC-1 (testers who start) |
| `baseline_started`, `baseline_completed`, `swot_viewed` | SC-2 |
| `round_started`, `round_completed`, `reflection_submitted` | SC-3 |
| `mock_section_started`, `mock_section_saved`, `mock_summary_viewed` | SC-3 (one entry = a saved section with at least one recorded question) |
| `revision_item_added`, `revision_marked`, `demo_date_jumped` | F4 usage |
| `task_started`, `passage_session_completed`, `word_added`, `card_flipped` | F5, F6 usage |
| `omet_teaser_viewed`, `feedback_submitted` | BO-4, SC-4 to SC-6 |

Usability observations (hesitations, misunderstandings, blockers) are recorded by the moderator on paper or in a separate document. They are kept separate from tester opinions (SC-7).

**Acceptance criteria**
- The OMET screen names no specific exam and is reachable in one click.
- The feedback form submits without any personally identifying field.
- Every event in the table fires once per action and carries no free text.
- A tester can complete onboarding, baseline, SWOT, one round, one mock section and the feedback screen in one sitting.

---

### Delivery Notes

**Real versus simulated (label these clearly in the UI and in screenshots)**

| Capability | State |
|---|---|
| Baseline test, SWOT rules, question-selection rounds, mock analysis, grade derivation, Potential Score, task recommendation, journey indicator | Working, rule-based |
| Spaced-repetition due dates | Working. Day jumps are **simulated** via Demo tools |
| Passage session, word selection, cards | Working. Card content is **sample** until the founders supply content |
| Question content | **Memory-based and labelled.** Sample until the real pack is loaded |
| Login | **Dummy** (display name only) |
| Notifications, authentication, persistence across devices | **Not implemented** (out of scope) |

**Out of scope for Phase 1 [BRD]:** collaborative DILR, real-time duels, study rooms, leaderboards and rankings, real authentication, real notifications, native apps, non-English support, mentor and alumni features, OMET content beyond the teaser.

**Dependencies and open items**
1. **Content pack from the founders** (questions with solutions, difficulty and expected time; two F2 rounds; passages with glossaries; quotes; school images with licences). Until then, build and test on sample content.
2. **Confirm** the CAT date, section structure and marking against the official bulletin.
3. **Tunable thresholds** (SWOT rules, task cascade, revision intervals, question-type lists) are PM assumptions stored in configuration. Adjust them after tester feedback.
4. **Seed data from the founder's spreadsheet** (BRD A-3) needs the founder's permission and a review of the free-text comments before use.
5. **Feedback delivery mechanism** to be chosen at the architecture stage.
6. **Content risk R-1** is accepted by the founders. The content pack, the provenance field and the "Memory-based" label exist so that the content can be replaced with original or licensed material before any wider release.

**BRD traceability**

| BRD item | PRD milestone |
|---|---|
| F1 | 2 |
| F2 | 3 |
| F3, Appendix A, OQ-2, OQ-4 | 4 |
| F5, F7 gamification, OQ-5 | 5 |
| F4 | 6 |
| F6, OQ-3 | 7 |
| F7 (dummy login, OMET teaser, feedback), SC-1 to SC-7, BO-4 | 1, 8 |
| BR-1 to BR-15, OQ-1 | 1 (rules 1.2, 1.6, 1.7), plus the module acceptance criteria |

---

## Client Information

The client is a founding team of three: **Aneesh Mahapatra, Stuti Prajna Patra and Pratosh Ramji**, who are the approvers for this product. Their sponsoring organisation already works in MBA interview and placement preparation, with current MBA student volunteers and alumni volunteers who could act as guides in a later phase. This prototype is the organisation's first step in reaching aspirants earlier, while they are still preparing for entrance exams.

The founders are first-hand CAT aspirants, and the product is built for a last-month audience: users with roughly 30 days left, who need to polish strategy, timing, question selection and composure rather than learn new concepts. The prototype is tested with 10 to 20 CAT aspirants (SC-1), with the success criteria in the BRD (section 9) governing the evaluation.
