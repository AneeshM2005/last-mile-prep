# Tech_Architecture.md: Last-Mile Prep App (Phase 1 Prototype)

**Owner:** Claude (Supervisor and Technical Architect)
**Version:** 1.1 (proposed; founder decisions of 26 Oct 2026 applied; supersedes the 1.0 draft)
**Inputs reviewed:** BRD v1.0 (with the approved v1.1 patch), PRD v1.0 (Senior Product Manager), founder decisions of 26 Oct 2026. `Design.md` has **not** yet been supplied; the founders will send it.
**Intended repository path:** `/Tech_Architecture.md`
**Document state:** Proposed update (not yet transferred to the project folder)

**Labels:** **[Decision]** architectural choice proposed here. **[Fact]** checked against a source on 26 Oct 2026. **[Assumption]** to be confirmed. **[Approval]** needs a founder decision before it is relied on.

---

## 1. Purpose and design drivers

This document says how the PRD will be built. It does not change product behaviour.

| Driver | Source | Consequence |
|---|---|---|
| Build and tester sessions both happen on 26 Oct 2026; no review buffer | PRD (timing decisions) | Smallest workable stack; no infrastructure that needs debugging; cut order is built into configuration. |
| Free tiers only; no paid services | BRD C-3 | Static hosting on a free plan; no other external service. |
| No backend, local persistence, rule-based and deterministic | PRD overview, 1.3 | All logic runs in the browser as pure, unit-tested functions. |
| Content must be swappable with no code change | PRD 1.6 | Content and thresholds live in validated JSON files. |
| Privacy by default, no personal data beyond a display name | BRD BR-6, PRD 1.8 | Nothing leaves the device unless the tester chooses to share it; the display name is never part of what is shared. |
| Laptop-preferred, mobile-supported, calm and accessible | PRD 1.1, 1.8 | Mobile-first responsive layout, semantic HTML, quiet timers. |
| Visible path to Phase 2 | BRD 5.3 | Domain logic and data types are separated from the UI and storage. |

**Governing principle:** the simplest thing that satisfies the PRD. Logic in pure functions, content and thresholds as data, and a single optional network connection.

---

## 2. PRD review: findings that affect the architecture

I did not modify the PRD. These items need the PM or founders to decide or confirm.

| ID | Finding | Impact | Handling in this architecture | Owner |
|---|---|---|---|---|
| PR-1 | **Schedule.** BRD C-4 (27 Oct review buffer) conflicted with the PRD. | Deployment must be live today. | **Resolved:** founders confirmed following the PRD (build and tester sessions on 26 Oct, no buffer). BRD v1.1 patch approved. | Founders |
| PR-2 | **Consent copy.** PRD 1.2 says data stays on the device. | Would have conflicted with sending events off the device. | **Resolved:** feedback and events stay local, so the PRD wording is accurate. One line about optional sharing is added (12.6). | PM |
| PR-3 | The PRD adds an "I am 18 or older" self-declaration. | Effectively resolves BRD OQ-1 as a self-declaration only. | Implemented as a required checkbox; no age data is stored beyond the boolean. BRD v1.1 patch approved. | Founders |
| PR-4 | Countdown behaviour while the tab is hidden or closed is not specified. | Affects resume and fairness. | **[Assumption]** The overall countdown is wall-clock and keeps running; per-question focus time pauses while hidden. An attempt that expired while closed is auto-submitted on next load. | PM |
| PR-5 | Event and feedback destination was left to this stage (PRD 8.2). | Needs a way to get feedback to the team. | **Resolved:** local only, with a tester-initiated share (section 12). | Founders |
| PR-6 | **Public hosting versus BRD R-1** ("do not distribute publicly"). | A public URL exposes the memory-based pack once it is loaded. | **Founders decided: public for now.** The sample pack is the default; search-engine blocking is kept as a default setting; BRD R-1 stays accepted. | Founders |
| PR-7 | The PRD supports text and image stimuli only, with no maths renderer. | Quant stems with notation may read poorly. | Plain text and Unicode, or images for complex expressions. A maths library (for example KaTeX) is excluded unless approved. | PM |
| PR-8 | Sample content must exist because real content arrives later. | The app needs working data today. | **[Assumption]** Antigravity writes original placeholder content, marked SAMPLE, with `verified: false` until a human checks the solutions. No copying from real question banks. | PM |
| PR-9 | The PRD does not say how the 12 baseline questions are chosen from the pack. | Without a rule, content swaps change the baseline unpredictably. | Add an explicit `baselineQuestionIds` list (12 ids: 4 VARC, 4 LRDI, 4 QA) to the questions pack. Random sampling is rejected. | PM |
| PR-10 | The rule for "one assigned passage per simulated day" is not specified. | Ambiguous behaviour. | **[Assumption]** Passages are served in pack order; the assigned passage is the first without a completed session, and it advances when the app-clock date changes. | PM |
| PR-11 | The PRD does not say how sample packs are flagged. | The SAMPLE badge needs a signal. | Add pack metadata `meta: { packVersion, sample }`. If `sample` is true, every item shows the badge. | PM |
| PR-12 | Shared devices: "start new session" is required but not defined. | Data from the previous tester could remain. | **[Assumption]** Start new session deletes all local data after a confirmation, then returns to the consent screen. | PM |
| PR-13 | CAT date and marking scheme are PRD assumptions. | Used in days-remaining and score logic. | **[Fact]** CAT 2026 is on 29 Nov 2026 (IIM Indore), per several third-party reports of the official notification. The official bulletin was not opened here; confirm there. Section sizes (24, 22, 22) and +3, −1 scoring remain **unverified** and are configuration values. | PM |

---

## 3. Architecture overview

```
 Tester's browser (laptop or phone)
 ┌─────────────────────────────────────────────────────────────┐
 │  React app: one app, many screens (static files)            │
 │                                                             │
 │   features/  (screens and cards)                            │
 │        │ call                                               │
 │   domain/    pure TypeScript logic (unit-tested)            │
 │        │ read / write                                       │
 │   data/      Zustand store ⇄ localStorage (versioned)       │
 │              content + config loaders (Zod-validated)       │
 │              local event log (no network)                   │
 │                                                             │
 │   Only when the tester taps Share, Copy or Download:        │
 │   a preview of the session summary ──► share sheet,         │
 │   clipboard or file ──► tester sends it to the team         │
 └───────────────▲─────────────────────────────────────────────┘
                 │ GET static files (HTML, JS, /content, /config)
          Vercel, Hobby plan
```

There is **no application server, no database and no external service** beyond static hosting. Nothing leaves the device unless the tester chooses to share it.
---

## 4. Decision summary

| # | Topic | Decision | Alternatives rejected | Why |
|---|---|---|---|---|
| D1 | Application type | One web app with many screens: each screen has its own address and the back button works; static files only | Separate HTML pages per screen; server-rendered framework; native app; no-code builders | Screens share one profile, timers and autosave, so a single app is faster and safer to build today; BRD forbids native; the implementer is Antigravity, not a builder tool. |
| D2 | Language and framework | TypeScript (strict) with React | Plain JavaScript; Vue; Svelte | Typed domain logic catches errors in a one-day build; React is the most widely supported by the implementing agent. |
| D3 | Build tool | Vite | Create React App; Next.js | Fast, minimal config, outputs a plain static folder. |
| D4 | Styling | Tailwind CSS with design tokens as CSS variables | Component library; hand-written CSS only | Fast responsive card layouts; tokens give a clean place to apply `Design.md` later. |
| D5 | Routing | React Router in **hash mode** | Normal-URL mode | Works on any static host with no rewrite rules, so refreshing any screen on the live site cannot fail. Normal URLs would need a Vercel rewrite and add a test-day failure mode. |
| D6 | State | Zustand with persistence | Redux; Context only | Small, supports versioned persistence and migration. |
| D7 | Persistence | `localStorage`, namespaced and versioned | IndexedDB; backend | Data is tens of KB; simpler and enough. |
| D8 | Validation | Zod schemas for content, config and stored data | Hand-written checks | One schema serves runtime errors, tests and the validation command. |
| D9 | Dates | `date-fns` with local-date strings (`YYYY-MM-DD`) | Custom date maths | Avoids off-by-one errors in revision scheduling. |
| D10 | Testing | Vitest for logic; manual and browser verification for screens | Full end-to-end framework | Meets PRD acceptance tests without heavy tooling. |
| D11 | Hosting | Vercel Hobby plan (free) under a founder's account | Cloudflare Pages; Netlify; GitHub Pages | Founders' choice. Vercel's terms limit Hobby to non-commercial personal use; the founders accepted this (R-10). |
| D12 | Feedback and events | Stored only on the device. The tester previews a summary and can share it through the phone's share sheet, copy it, or download it | Embedded form; Google Sheet endpoint; Supabase; Firebase | No external service and no accounts; the tester sees exactly what is shared. Share-sheet support varies by browser, so copy and download are always available. |
| D13 | Offline and PWA | Not included | Service worker | Out of PRD scope; adds caching risks on test day. |

---

## 5. Technology stack and dependency policy

**Tooling:** Node.js LTS, npm, committed lockfile. Install the current stable releases of each package at build time and let the lockfile pin them. Prefer releases that have been public for at least two weeks.

**Approved dependencies (everything else needs approval, see Rules.md):**

| Type | Package |
|---|---|
| Runtime | `react`, `react-dom`, `react-router-dom`, `zustand`, `zod`, `date-fns`, `lucide-react` |
| Build and language | `vite`, `@vitejs/plugin-react`, `typescript` |
| Styling | `tailwindcss` (with its official Vite integration) |
| Quality | `vitest`, `jsdom`, `@testing-library/react`, `eslint` with `typescript-eslint` |

**Deliberately excluded:** UI kits, form libraries, charting libraries (summary counts use simple CSS or SVG bars), animation libraries, maths renderers, analytics SDKs or any third-party tracker, service workers, state-machine libraries.

---

## 6. Repository structure

**[Assumption]** Documents stay at the project-folder root with the paths used in the BRD. App code lives in `/app`.

```
/BRD.md /PRD.md /Tech_Architecture.md /Tracker.md /Rules.md /HANDOFF.md ...
/app
  public/
    content/   questions.json rounds.json passages.json quotes.json schools.json
               sampleMock.json  schools/*.jpg
    config/    app.json grades.json swot.json tasks.json revision.json
               questionTypes.json strategies.json copy.json
    robots.txt
  src/
    app/       router, layout, providers, error boundary, route guard
    domain/    clock, grading, mockSummary, potentialScore, swot, baselineScoring,
               roundSummary, taskRecommender, revisionScheduler, wordCards
    data/      schemas (Zod), types, storage adapter, store slices, migrations,
               contentLoader, configLoader, eventLog, sessionSummary
    features/  onboarding, home, baseline, swot, rounds, mock, revision,
               words, omet, feedback, profile, demo
    ui/        Card, Chip, GradeChip, Timer, SampleBadge, DemoBanner, EmptyState
    styles/    tokens.css
  tests/       content validation, copy lint, domain tests (or colocated)
  vercel.json    (headers only)
```

---

## 7. Frontend architecture

**7.1 Layering rules**
1. `domain/` imports nothing from React, the store or the browser. It takes plain data and config and returns plain data.
2. `features/` handles layout and interaction only. It never computes grades, scores, SWOT or schedules itself.
3. `data/` is the only layer that touches `localStorage`, `fetch` or the network.
4. Derived results (SWOT, summaries, recommendation) are computed from stored raw data by selectors. They are never stored as the source of truth, so a rule change recomputes everything.

**7.2 Routes (hash mode)** map to the PRD navigation:

| Route | PRD milestone |
|---|---|
| `/onboarding` | 1 (consent, dummy login, schools, time) |
| `/` | 5 (home: days to CAT, today's task, moodboard, journey) |
| `/practice/baseline`, `/profile` | 2 (baseline and SWOT) |
| `/practice/rounds` | 3 |
| `/mock` | 4 |
| `/revision` | 6 |
| `/words` | 7 |
| `/omet` | 8 |
| `/feedback` | 8 |

A route guard sends users without a completed onboarding to `/onboarding`. The profile page holds **Reset my data**, **Start new session** and **Demo tools**.

**Flow decisions applied (founders, 26 Oct 2026)**
- **Nothing is locked.** Every area is reachable at any time; Home only recommends Baseline first.
- **Resume card.** If a baseline, round or mock entry is in progress, Home shows a Resume card.
- **Feedback card on Home.** Shown once the baseline is complete and at least one round is complete, until feedback has been saved. Implemented by a pure function and two configuration values.
- **Navigation is data-driven.** The menu items, their order and which ones sit in a mobile "More" menu come from configuration, so `Design.md` can change them without code changes. Suggested default for phones: Home, Practice, Mock, Revision, More (Words, Profile, OMET, Feedback).

**7.3 State.** One store with slices matching PRD 1.3 entities (profile, baseline, rounds, mock entries, revision items, passage sessions, word cards, activity log), plus UI state that is not persisted.

**7.4 Layout.** Mobile-first. Sidebar from the large breakpoint upward, bottom navigation below it. One card per data-entry item, as the PRD requires. No dense tables anywhere.

**7.5 Design tokens.** Colours, spacing, radii, type scale and shadows are CSS variables in `tokens.css`, mapped into Tailwind. When `Design.md` is supplied, only the tokens and component styles change. Until then Antigravity uses a calm neutral theme with a single accent colour.

**7.6 Accessibility**
- Native elements first (`button`, `input`, `label`, `details`, `nav`, `main`); custom widgets only when a native one cannot do the job.
- Visible `:focus-visible` outline on every control; full keyboard flow; 44 px minimum touch targets.
- Grades show a letter and a label as well as a colour. Respect `prefers-reduced-motion`.
- Timers are visible but are not announced by screen readers every second.
- Text contrast at WCAG AA or better; the moodboard uses an overlay to guarantee it.

**7.7 Feature switches.** `app.json` holds `features: { revision, words, moodboardImages, demoTools }`. Turning a feature off hides its navigation entry and home content. This implements the PRD cut order (F6, then F4, then moodboard imagery) without code changes.

---

## 8. Data layer and persistence

**8.1 Storage.** `localStorage`, behind a small adapter, so the storage choice can change later. The data volume is small (a 68-record mock entry is well under 20 KB).

**8.2 Keys.** Prefix `lmp.v1.`:
- `lmp.v1.store`: profile and all entities, wrapped as `{ schemaVersion, data }`.
- `lmp.v1.clock`: demo-date offset in days.
- `lmp.v1.events`: local usage-event log (capped at 500; names only, no free text).
- `lmp.v1.sid`: anonymous session ID (random UUID, regenerated on reset).

**8.3 Write strategy.** Debounced writes (about 300 ms) plus an immediate flush on `visibilitychange` (hidden) and `pagehide`. In-progress attempts autosave on every change, as the PRD requires.

**8.4 Versioning.** On load, if the stored `schemaVersion` differs and a migration exists, migrate; otherwise reset and show a neutral notice. The same Zod schemas validate stored data; invalid data triggers a reset rather than a crash.

**8.5 Resume.** Attempts carry a status (`in_progress`, `completed`, `expired`) and, for timed attempts, an absolute `endsAt` timestamp. Reopening after a refresh resumes at the same question with the correct remaining time (PR-4).

**8.6 Reset and new session.** One function removes every key with the `lmp.v1.` prefix, generates a new session ID and routes to the consent screen. Both controls ask for a confirmation first. The app cannot recall anything a tester has already shared by hand; shared content carries no name.

**8.7 Storage failure.** If `localStorage` is unavailable or full (for example some private modes), the app continues with in-memory state and shows a calm banner: "Progress cannot be saved in this browser mode."

**8.8 Multiple tabs.** Not supported in Phase 1. The latest write wins.

The PRD 1.3 entity table is the Phase 1 data schema. `Schema.md` is not needed for Phase 1; the TypeScript types in `data/types.ts` are the in-code source.

---

## 9. Time handling

1. **Two clocks, never mixed.**
   - `appClock.now()` is real time plus a demo offset (in days). It is used **only** for date logic: days to CAT, revision due dates, "last 7 days", passage assignment, journey dates.
   - Countdown timers use **real time only**. A demo date jump never changes a timer.
2. **Dates as local-date strings** (`YYYY-MM-DD`) for revision due dates and activity logs, with `date-fns` for arithmetic. Timestamps are stored as ISO UTC strings.
3. **Countdown** is computed from `endsAt` minus real now, refreshed once per second by a single shared hook. No accumulated tick counters, so there is no drift after sleep or throttling.
4. **Focus time per question** accumulates only while the page is visible (`visibilitychange`).
5. **Demo banner** shows "Demo date: <date>" whenever the offset is non-zero.

---

## 10. Content packs and configuration

**10.1 Location and loading.** Content is in `public/content/*.json` and configuration in `public/config/*.json`. Both are fetched at startup (`cache: "no-cache"`), validated with Zod, then held in memory. They are not stored in `localStorage`.

**10.2 Packs and fields** follow PRD 1.6, plus these additions (PR-9, PR-11):
- `questions.json`: `meta { packVersion, sample }`, the question list, and `baselineQuestionIds` (12 ids, 4 per section).
- If `meta.sample` is true, every item shows the SAMPLE badge.
- Every question shows the "Memory-based question" label, driven by `provenance.label` (BR-13). Every passage shows its source and licence (BR-15). Solutions show the `verified` flag and `altMethod` when present (BR-8).

**10.3 Validation.**
- **Schema** (types, required fields, enums).
- **Cross-file integrity:** round question ids exist and are QA questions; `recommendedPickIds` are a subset of the round's questions; baseline ids exist with 4 per section; passage glossaries have at least 15 words; school image files exist with licence and attribution recorded.
- **Where it runs:** at startup (a failure shows an error naming the file and field, per the PRD) and as a Vitest test. `npm run validate:content` runs only the content tests, so the founders or Antigravity can check a new pack before deploying.

**10.4 Replacing content.** Replace the files in `public/content/`, run `npm run validate:content`, rebuild and redeploy. No source code changes.

**10.5 Configuration (no hard-coded constants).** CAT date, section structure and scoring, the nine-outcome grade map, SWOT thresholds, task durations and cascade thresholds, revision intervals (1, 3, 9, 18), question-type lists, strategy list, quotes, feature switches. All user-facing copy templates (including reason strings and reading lines) are in `copy.json`.

**10.6 Sample content (until the founders supply the real pack).**
- Minimum for an end-to-end test: 12 baseline questions, 10 round questions (two rounds of five), 5 passages with glossaries of at least 15 words, 10 quotes, 3 or more schools with licensed or generated placeholder imagery (or the solid-colour fallback).
- `sampleMock.json` seeds "Load sample mock" and must reproduce the BRD worked example (VARC 7, 4, 8, 5; LRDI 4, 9, 9, 0; QA 2, 3, 16, 1; potential 33, 39, 15, total 87). It uses synthetic question types and **no free-text comments**, so no personal spreadsheet content is needed.

---

## 11. Rules engines

All rule logic lives in `domain/` as pure functions that return both a result and its **evidence** (the numbers used), so every screen can show where an insight came from.

| Module | Function | PRD |
|---|---|---|
| `grading` | outcome code → grade (A to D) from the nine-outcome map | 4.3 |
| `mockSummary` | grade counts overall and per section; focus list ordered by D, then B, then C | 4.5 |
| `potentialScore` | `3 × (A + B)` per section and total; actual score validation | 4.5 |
| `swot` | classify each section × question type pattern from baseline, round and mock evidence; mixed evidence goes to the most frequent quadrant; ties go to the more cautious quadrant | 2.2 |
| `baselineScoring` | accuracy, average time, skipped count per section | 2.3 |
| `roundSummary` | attempted, solved, average time, selection alignment | 3.3 |
| `taskRecommender` | the five-step cascade, duration fit, no repeat on consecutive days, reason template filled with real values | 5.4 |
| `feedbackPrompt` | show the Home feedback card when the baseline and at least one round are complete and feedback is not yet saved | founder decision |
| `revisionScheduler` | due dates from created date plus offsets, none after the CAT date; Reviewed advances; Need more time repeats next day; missed items stay without duplicates | 6.2, 6.3 |
| `wordCards` | normalise words (lowercase, strip punctuation), 30-word session cap, glossary lookup, pending state | 7.1, 7.2 |

**Copy safety.** All user-facing strings live in `copy.json` and `content/*.json`. A Vitest test scans them for the forbidden phrases in PRD 1.7 (for example "streak broken", "you missed", "behind", "failed", "weak student", percentile and talent wording). This turns the "no forbidden phrase" acceptance criterion into an automatic check.

---

## 12. Feedback and usage events (local only)

**12.1 Principle.** Everything stays on the device. Nothing is sent automatically. The app has no analytics, no server and no external service.

**12.2 What is stored locally.**
- **Feedback** from the Feedback screen: the two ratings, the five free-text answers and the "which features again" selection (PRD 8.2). Saved on submit.
- **Usage events:** only `{ id, sid, ts (UTC), event, module }`, using the PRD 8.3 event names. No free text, no display name, no school choice, no scores, no answers. They are written to a local log (capped at 500).

**12.3 The easy way to send it across.** On the Feedback screen after saving (and from Demo tools at any time), the tester sees **"Send to the team"** with a **preview of exactly what will be shared**, then three buttons:
1. **Share:** opens the phone's share sheet (WhatsApp, email, messages, any app). Shown only where the browser supports it (feature-detected; needs the secure address Vercel provides and a tap by the tester).
2. **Copy:** copies the same text to the clipboard (works almost everywhere).
3. **Download:** saves it as a file (for a laptop or a moderator).

The shared text has two parts: a readable block (ratings, answers, features to reuse) and a compact summary block of the session (the anonymous session ID and a count per usage event, which is what you need for the success criteria SC-1 to SC-3). The display name and profile choices are never included. The raw event list is only in the downloaded file.

**12.4 Where it goes.** The screen shows "Send it to: <team contact>", read from configuration. **[Open]** The founders need to give one email address or WhatsApp number to show here. Until then the line says "Send it to the team that gave you this link".

**12.5 Moderated sessions.** If a founder holds the device, the moderator opens Feedback and taps Share, Copy or Download after each tester. Start new session then wipes the device for the next person.

**12.6 Suggested consent wording (for the PM to adopt).** "Everything you do stays on this device and nothing is sent automatically. If you choose to share feedback, you will see exactly what will be shared first, and it will not include your name. Please do not type personal details in feedback boxes. You can delete everything on this device at any time with Reset my data."

**12.7 Verification before the sessions.** Test Share, Copy and Download on a real Android phone, a real iPhone and a laptop, and confirm the pasted text is complete and contains no display name.
---

## 13. Hosting and deployment

**13.1 Choice (founders' decision): Vercel, Hobby plan, under a founder's personal account.**

- **[Fact]** Vercel's own documentation states that Hobby teams are restricted to non-commercial personal use only, and that all commercial usage requires a Pro or Enterprise plan. The founders have decided to proceed on Hobby for this competition prototype. This is a terms-compliance risk (R-10), not legal advice. Fallbacks: Vercel Pro (paid, needs approval) or Cloudflare Pages (free; third-party comparison sites say commercial use is allowed).
- **[Fact, third-party summaries; verify on Vercel's pricing page]** Hobby includes roughly 100 GB of data transfer, 1 million edge requests and 100 deployments a day, with one team member. A 10 to 20 person test is far below this.

**13.2 Build settings.** Framework preset Vite; build command `npm run build`; output folder `dist`. Hash routing means no rewrite rules are needed.

**13.3 Deploy methods.** Either connect a Git repository from the founder's GitHub account (every push redeploys) or use the Vercel command-line tool from the `app` folder after the founder logs in. A human must create or log in to the Vercel account; Antigravity can only run the command after that login.

**13.4 Headers and discoverability.** `vercel.json` sets `X-Content-Type-Options: nosniff` and a strict referrer policy. The site is public by the founders' decision. As a default I keep search-engine blocking on (`robots.txt` disallow, a `noindex` tag and an `X-Robots-Tag` header), so it is reachable by link but not listed in search results; the founders can remove it. No Content Security Policy in Phase 1 unless it is tested on the live URL.

**13.5 Environments.** One production URL. If a Git repository is connected, Vercel also creates preview URLs per branch, which can serve as staging.

**13.6 Pre-test checklist (tracked in the Tracker).** The URL opens on a real phone and a laptop; onboarding completes; reloading any screen resumes correctly; Reset works; Share, Copy and Download work (12.7); no console errors; SAMPLE badges are visible.
---

## 14. Security and privacy

- **No secrets exist in Phase 1.** There are no API keys, tokens or endpoints. Any real `.env*` file is git-ignored by default.
- **The display name is stored only in `localStorage` and never appears in the shared summary.** A unit test checks that the share payload contains only whitelisted fields.
- **Safe rendering.** Question, passage and glossary text is rendered as plain text. No `dangerouslySetInnerHTML`. Word selection is built from text spans, not injected HTML.
- **Content controls.** All memory-based questions are labelled (BR-13); mock analysis has no field that can hold question text beyond a 200-character comment with a helper line (BR-12); schools' images carry licence and attribution (BR-7).
- **Sharing is tester-initiated.** The preview shows everything that will be shared. Free-text boxes show a reminder not to type personal details.
- **No third-party scripts, trackers, fonts or embeds.** System fonts unless `Design.md` calls for self-hosted ones.
- **Legal points** (DPDP and similar) remain stakeholder-stated and unverified (BRD section 7). The architecture minimises data rather than relying on a legal reading.

---

## 15. Testing and verification

**15.1 Required unit tests (Vitest)** (each maps to a PRD acceptance criterion):
1. All nine outcome combinations map to the table in PRD 4.3.
2. The BRD worked example gives potential 33, 39, 15, total 87 from the sample mock.
3. Revision: exactly four due dates; none after the CAT date; day-3 jump shows due; Reviewed advances; Need more time repeats next day; no duplicates.
4. Task recommender: a new profile gets Baseline; the cascade order; 15-minute limit; no repeat on consecutive days; reasons contain real values.
5. SWOT: classification, mixed-evidence and tie-break rules; mock-grade evidence changes the profile.
6. Round alignment matches a manual calculation.
7. Word normalisation, 30-word cap, pending-card creation.
8. Content validation of the sample pack, including a deliberately broken pack that must name the file and field.
9. Forbidden-phrase scan of `copy.json` and content files.
10. Storage: schema mismatch resets; clock offset changes date logic but not countdowns; share payload contains only whitelisted fields (no display name); feedback card appears only after baseline and one round.

**15.2 Verification per milestone (evidence Antigravity must return):** the output of the test command, type-check and build; a short list of manual steps performed with results; screenshots at 360 px and at laptop width for each new screen; a note of any console errors. The PRD acceptance criteria for the milestone are the checklist.

**15.3 What I will accept as verified.** I will not mark a task complete on a completion statement alone. I need the evidence in 15.2 supplied through you.

---

## 16. Prototype boundaries and Phase 2 implications

| Capability | Phase 1 | Phase 2 path (not approved) |
|---|---|---|
| Accounts | Dummy login; local profile | Real authentication and authorisation; consent records |
| Data | Browser `localStorage`, single device | Server database; entities in PRD 1.3 become tables; cross-device sync |
| Content | JSON packs in the repository | Managed content store with licensing and provenance records |
| Analytics and feedback | Local only; tester shares a summary by hand | Proper event pipeline, consent management and server-side storage |
| Notifications | In-app due list only | Email, push or messaging, if approved |
| Compliance | Minimal data, notice, reset control | Formal review against applicable data-protection rules |
| Hosting | Vercel Hobby (free; non-commercial terms) | Hosting suited to a backend, monitoring and backups |

**Reuse:** `domain/` and the Zod schemas carry over to Phase 2 unchanged. The storage adapter is the single place to replace with an API client.

**Deferred shortcuts to record:** feedback reaches the team only if testers share it; no offline support; single-tab assumption; client-side-only validation; sample content is not verified.

---

## 17. Risks

| ID | Risk | Mitigation |
|---|---|---|
| R-1 | One-day build with sessions the same day | Cut order via feature switches; milestone order F1, F2, F3, F5 first; deploy early and test the live URL before the sessions. |
| R-2 | A public URL exposes the memory-based pack once loaded (BRD R-1) | Sample pack by default; search-engine blocking kept as a default; founders have accepted the exposure; replace with original or licensed content before any wider release. |
| R-3 | Feedback never reaches the team (tester forgets or cannot share) | Prompt to share right after saving feedback; copy and download fallbacks; Home feedback card; moderator collects on shared devices. |
| R-4 | Share sheet unsupported in some browsers | Feature detection; Copy and Download always shown; test on a real Android phone, iPhone and laptop before the sessions. |
| R-5 | Browser data cleared or private mode | In-memory fallback and banner; autosave; reminder in onboarding. |
| R-6 | Shared devices leak a previous tester's data | Start new session wipes local data; reset always reachable. |
| R-7 | Agent scope creep or unrequested dependencies | Approved dependency list; Rules.md; small tasks with acceptance criteria. |
| R-8 | Wrong or missing content at test time | Content validation test and command; named errors; sample content works end to end. |
| R-9 | Unverified marking scheme and section sizes | Held in configuration; confirm against the official bulletin. |
| R-10 | Vercel Hobby is for non-commercial personal use; the sponsoring organisation is a business | Founders accepted this; use a founder's personal account; fallback to Pro or Cloudflare Pages if Vercel objects. |

---

## 18. Approvals and open items

**Resolved by the founders on 26 Oct 2026**

| ID | Decision |
|---|---|
| A1 | No external feedback service. Feedback and events stay on the device; the tester can share a previewed summary. |
| A2 | Host on Vercel, Hobby plan, under a founder's personal account (risk R-10 accepted). |
| A3 | The site is public for now (search-engine blocking kept as a default setting). |
| A5 | BRD v1.1 patch approved (schedule per PRD; 18+ self-declaration). |
| Flow | One app with many screens; nothing locked; Resume card; Home feedback card after baseline plus one round. |

**Still needed**

| ID | Item | Owner |
|---|---|---|
| A4 | Approve the dependency list in section 5. | Founders |
| F1 | One email address or WhatsApp number to show as "Send it to" (12.4). | Founders |
| F2 | `Design.md` (the build starts on the neutral token theme until it arrives; mobile navigation grouping to be checked against it). | Founders / Designer |

**Items for the Product Manager:** PR-4, PR-7, PR-8, PR-9, PR-10, PR-11, PR-12, and adopting the consent wording in 12.6. None blocks the start of implementation; each has an interim handling above.
---

## 19. Next actions

1. Founders send `Design.md` and the feedback contact, and approve A4.
2. I produce `Implementation_Plan.md`, `Rules.md`, `Tracker.md` and the first `ANTIGRAVITY_PROMPT.md` (project scaffold, configuration, content loader, store, onboarding), sized to fit today.
3. You transfer the documents to the project folder and load the first prompt into Antigravity.
4. Antigravity returns its execution handoff with the evidence in 15.2, and I review it.