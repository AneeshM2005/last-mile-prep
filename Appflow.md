# Appflow.md: Application Flow (Phase 1 Prototype)

**Owner:** Claude
**Version:** 1.0 (proposed)
**Intended repository path:** `/Appflow.md`
**Document state:** Proposed update (not yet transferred to the project folder)
**Sources:** PRD v1.0 (behaviour), `design.md` v1.0 (screens, routes), Tech_Architecture v1.1 (routing, state), founder decisions of 26 Oct 2026.

This file records **where the user can go, in what conditions, and how each module moves between states**. It does not repeat screen layouts (see `design.md`) or acceptance criteria (see the PRD). If this file and the PRD disagree on behaviour, the PRD wins and the difference is raised.

---

## 1. Page inventory

Routing is hash-based (`#/route`). Nothing is locked: after onboarding every screen is reachable at any time.

| Route | Screen | Purpose | Entered from | Leaves to | Feature switch |
|---|---|---|---|---|---|
| `/welcome` | Landing | First impression; one call to action | First visit; after Reset or Start new session | `/onboarding` | none |
| `/onboarding` | Onboarding (4 steps) | Consent, display name, target schools, daily time | Landing | `/` | none |
| `/` | Home ("Today") | One task for today, days to CAT, quote, journey, Resume and Feedback cards | Navigation; end of onboarding | any task route | none |
| `/practice` | Practice hub | Choose Baseline or a Round | Navigation; Home | `/practice/baseline`, `/practice/rounds` | none |
| `/practice/baseline` | Baseline | 12-question timed test | Practice hub; Home task; Resume card | `/profile` (SWOT) | none |
| `/practice/rounds` | Question selection | Round list, round workspace, reflection, summary | Practice hub; Home task; Resume card | `/practice` | none |
| `/mock` | Mock analysis | Start, section, entry cards, summary | Navigation; Home task; Resume card | `/profile` (SWOT) | none |
| `/revision` | Revision | Due today, Upcoming, Add | Navigation; Home task | `/profile` (Demo tools link) | `revision` |
| `/words` | My words | Cards, filters, Practise | Navigation | `/words/read` | `words` |
| `/words/read` | Passage session | Timed reading and word selection | My words; Home task | `/words` | `words` |
| `/profile` | My profile | Tab SWOT; tab Settings and data (details, Reset, Start new session, Demo tools, Send to the team) | Navigation; More menu | any | `demoTools` (Demo tools card only) |
| `/omet` | OMET teaser | Coming-soon screen | Navigation | `/feedback` | none |
| `/feedback` | Feedback | Ratings, questions, features, Send to the team | Navigation; Home feedback card; OMET link | `/` | none |

A feature switch that is off hides the navigation entry, the Home content and the route (a direct visit redirects to `/`).

**Navigation order.** Laptop sidebar: Home, Practice, Mock analysis, Revision, Words, My profile, OMET, Feedback. Phone bottom bar: Home, Practice, Mock, Revision, More (Words, My profile, OMET, Feedback). Items and grouping come from `app.json`.

---

## 2. Route guard

Evaluated on every route change, in this order:

| # | Condition | Result |
|---|---|---|
| 1 | Content or configuration failed validation | Full-page "Content couldn't load" screen, no navigation, Try again |
| 2 | No profile and onboarding not started | Redirect to `/welcome` |
| 3 | Onboarding started but not finished | Redirect to `/onboarding` at the first incomplete step (answers kept) |
| 4 | Onboarding finished and route is `/welcome` or `/onboarding` | Redirect to `/` |
| 5 | Route's feature switch is off | Redirect to `/` |
| 6 | Unknown route | "We couldn't find that page." with Go to Today |
| 7 | Otherwise | Render the route |

**Reset my data / Start new session:** confirm in a dialog, delete everything with the `lmp.v1.` prefix, create a new session ID, go to `/welcome`.

**Storage unavailable:** the app continues in memory and shows the notice "Progress cannot be saved in this browser mode." on every screen.

---

## 3. User journeys

**J1. First-time tester (the main path, about one sitting)**
1. Open the link, `/welcome`, Get started.
2. Onboarding: tick both consent boxes, enter a display name, choose 1 to 3 target schools, choose daily time, Go to Today.
3. Home recommends Baseline, Start. Answer or skip 12 questions; Finish (confirm if any are unanswered) or time runs out. Land on the SWOT.
4. Home now follows the task cascade. Open Practice, Round 1, free choice among five questions, time ends, optional reflection, summary.
5. Open Mock analysis: load the sample mock or start one, record a section, Save section, open the summary (grades, focus list, Potential vs Actual).
6. Home shows the feedback card (baseline done and one round done). Open Feedback, Save, Send to the team (Share, Copy or Download).
7. Optional: Revision (add a topic, Demo tools, Jump to day), Words (passage, cards), OMET teaser.

**J2. Returning or interrupted tester.** Reload or return later: Home loads directly. If a baseline, round, mock entry or passage session is in progress, Home shows a Resume card that goes to the exact place (same question, remaining time). A timed attempt whose time ran out while the tab was closed opens in its finished state.

**J3. Shared device (moderated).** After a tester finishes, the moderator opens My profile, Settings and data, **Send to the team** (or Feedback) to capture the summary, then **Start new session**, which returns to the Landing page for the next tester.

**J4. Seeing reminders work.** Revision, Add a topic (four dates are scheduled). My profile, Settings and data, Demo tools, Jump to day 3 (Demo banner appears). Revision, Due today lists the item. Reviewed advances the step. Back to today.

**J5. Sharing feedback.** Feedback, answer, Save feedback, the Send to the team card appears with a preview (no name), then Share where supported, Copy, or Download.

---

## 4. Module state machines

### 4.1 Baseline attempt
| State | Entry | Allowed actions | Exit |
|---|---|---|---|
| `not_started` | No attempt exists | Start baseline | `in_progress` (sets `endsAt` = now + 15 min) |
| `in_progress` | Started | Answer, skip, confidence (optional), previous, next, jump by grid, Finish | `completed` (Finish or `endsAt` reached) |
| `completed` | Finished by the user | Review SWOT; baseline cannot be restarted in Phase 1 | none |
| `completed` (timed out) | `endsAt` reached, including while the tab was closed | Inputs locked; notice "Time's up. Your answers are saved."; See my profile | none |

Events: `baseline_started`, `baseline_completed`, then `swot_viewed` when the SWOT opens. Resume rule: reopening returns to the same question with the correct remaining time.

### 4.2 Question-selection round attempt (Round 1 and Round 2)
| State | Entry | Allowed actions | Exit |
|---|---|---|---|
| `not_started` | Round listed | Start round | `in_progress` (5:00 countdown) |
| `in_progress` | Started | Open any tile, answer, skip, switch freely; End round now (confirm) | `ended` (0:00 or End round now) |
| `ended` | Time up or ended early | Inputs locked; Continue to reflection | `reflecting` |
| `reflecting` | After Continue | Three steps, each skippable: selection review, confidence, strategy | `completed` |
| `completed` | After the last step or after skipping all | Summary and solutions; Round 2 if applicable | none |

Events: `round_started`, `round_completed`, `reflection_submitted`. Leaving mid-reflection keeps the answers entered so far.

### 4.3 Mock entry
| State | Entry | Allowed actions | Exit |
|---|---|---|---|
| `started` | Label and date entered (or Load sample mock) | Choose section and question count | `section_in_progress` |
| `section_in_progress` | Section chosen | Fill cards in any order; grade chip appears when Step 1 and Step 2 are complete; changing Step 1 clears Step 2 | `section_saved` (needs at least one recorded question) |
| `section_saved` | Section saved | Add another section; Open summary | `section_in_progress` or `summary` |
| `summary` | Opened | Optional actual score per section; reflection prompt | none |

An unrecorded card is allowed and excluded from counts. Events: `mock_section_started`, `mock_section_saved`, `mock_summary_viewed`.

### 4.4 Revision item
| State | Meaning |
|---|---|
| `scheduled` | Four due dates exist (created date plus offsets 1, 3, 9, 18; none after the CAT date) |
| `due` | A step's due date is today |
| `waiting` | A step's due date has passed and it has not been reviewed (shown as "Waiting for you"; never duplicated) |
| `reviewed` (per step) | Reviewed pressed; the next step becomes the current one |
| `cycle_complete` | Last step reviewed; shown as "Revision cycle complete" |

**Need more time** keeps the same step and sets that step's due date to the next day. Events: `revision_item_added`, `revision_marked`, `demo_date_jumped`.

### 4.5 Passage session
`not_started` (intro) → `in_progress` (timer from `estReadMinutes`; words toggled on tap, 30 maximum) → `completed` (timer ends or End session; selected words become cards; no penalty message). Events: `passage_session_completed`, `word_added`.

### 4.6 Word card
`learning` ⇄ `known` (Still learning, Got it). `contentState` is `available` (found in the passage glossary) or `pending` (not found; shows "Meaning not available in this prototype yet."). Flipping logs `card_flipped`.

### 4.7 Feedback
`empty` → `draft` (autosaved locally) → `saved` (Save feedback) → Send to the team shown. Saving logs `feedback_submitted`. Feedback can be edited and saved again; the Home feedback card disappears once feedback is saved.

---

## 5. Conditional flows on Home

| Element | Shown when |
|---|---|
| Today's task card | Always. Recommended by the PRD 5.4 cascade, using baseline status, due revision items, last mock date, grade B share and time available. A time chip change recomputes it immediately without navigating. |
| "Why this?" | Always; lists the values used |
| Days to CAT | Always; after the CAT date it reads "CAT day has passed" (never a negative number) |
| Resume card | A baseline, round, mock entry or passage session is in progress |
| Feedback card | Baseline completed **and** at least one round completed **and** feedback not yet saved |
| Journey path | Always: Baseline done, first round, first mock analysis, first revision cycle, first passage read; plus "Days practised" |
| Demo and Sample banners | Demo clock offset is not zero / any sample content is shown |

If the recommender cannot run (configuration or content failure), the task card says "We couldn't prepare today's task. Choose from Practice instead." with a link.

---

## 6. Forms and validation

| Form | Fields and rules | Error handling |
|---|---|---|
| Consent (onboarding 1) | Two required checkboxes (agree; 18 or older) | Continue disabled with helper "Tick both boxes to continue." |
| Display name (onboarding 2) | Required, 1 to 30 characters; no email or phone field | Inline field error |
| Target schools (onboarding 3) | 1 to 3 from the fixed list | Fourth tap shows "You can choose up to 3." |
| Daily time (onboarding 4) | One of 15, 30, 45, 60, 90; none preselected | Required |
| Baseline answer | MCQ option or type-in; skip allowed; confidence optional | None blocking |
| Round answer | As baseline; free order | None blocking |
| Mock section | Section; question count 1 to 100 (defaults 24, 22, 22) | Inline error on invalid count |
| Mock record | Question type (fixed list per section, or Other with a note of up to 40 characters); Step 1 then Step 2; comment up to 200 characters; **no field accepts question text** | Comment stops at 200; helper line shown |
| Actual score (mock summary) | Integer per section between −(questions) and 3 × (questions); optional | Inline error |
| Revision item | Topic up to 60 characters; optional section; created date (default today) | Inline error |
| Feedback | Two ratings 1 to 5; five text answers up to 280 characters each; features multi-select | "That didn't save. Please try again." |
| Demo jump | Whole number from −30 to +60 | Inline error |

---

## 7. Empty, error and system states

| Situation | Where | What the user sees |
|---|---|---|
| No data yet | SWOT, Due today, My words, Mock list | Plain empty message from `copy.json` (Design section 3) |
| Round or passage not in the loaded content | Rounds, Words | "This round isn't available in the loaded content." / "No passage is available today." |
| Invalid content or configuration | Whole app | Full-page notice naming the file and field |
| Storage unavailable | Whole app | Notice banner; app continues in memory |
| Timed attempt expired while closed | Baseline, Round, Passage | Opens in its finished state with the saved answers |
| Share not supported | Feedback | Share button hidden; Copy and Download remain |
| Unknown route or stale id | Any | "We couldn't find that page." |

---

## 8. Event map (anonymous, local only)

| Event | Fired when |
|---|---|
| `consent_given` | Consent step completed |
| `onboarding_complete` | Step 4 completed |
| `baseline_started`, `baseline_completed`, `swot_viewed` | Baseline start, finish, SWOT opened |
| `round_started`, `round_completed`, `reflection_submitted` | Round start, round summary reached, reflection finished |
| `mock_section_started`, `mock_section_saved`, `mock_summary_viewed` | Section started, saved (at least one recorded), summary opened |
| `revision_item_added`, `revision_marked`, `demo_date_jumped` | Item added; Reviewed or Need more time; Jump applied |
| `task_started`, `passage_session_completed`, `word_added`, `card_flipped` | Home Start pressed; session ended; word chosen; card flipped |
| `omet_teaser_viewed`, `feedback_submitted` | OMET screen opened; feedback saved |

Each event fires once per action and carries no free text. Events stay on the device and appear only as counts in the shared session summary.

---

## 9. Open items affecting flow (none block the build)

| ID | Item | Owner |
|---|---|---|
| AF-1 | Add `/welcome`, `/practice`, `/words/read`, Resume card, Home feedback card and Send to the team to the PRD (Design G-1, G-3). | PM |
| AF-2 | Words and Revision have no end-of-practice reflection prompt, though PRD 1.7 asks every post-practice screen to end with one. | Designer |
| AF-3 | The Round screen moves to reflection automatically 2 seconds after time ends. Automatic changes of screen can disorient assistive-technology users; a Continue button alone may be safer. Built as designed unless the designer or founders change it. | Designer |
