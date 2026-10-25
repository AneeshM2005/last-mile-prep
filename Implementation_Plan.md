# Implementation_Plan.md: Phase 1 Prototype

**Owner:** Claude
**Version:** 1.0 (proposed)
**Intended repository path:** `/Implementation_Plan.md`
**Document state:** Proposed update (not yet transferred to the project folder)
**Inputs reviewed:** BRD v1.0 (+ approved v1.1 patch), PRD v1.0, Tech_Architecture v1.1, `design.md` v1.0, Appflow v1.0, Schema v1.0, Rules v1.0.

---

## 1. Objective and constraints

Deliver the Phase 1 user-testing prototype described in the PRD, styled per `design.md`, deployed on Vercel (Hobby plan), with tester sessions on **26 Oct 2026** and **no review buffer** (PRD, confirmed by the founders).

| Constraint | Source |
|---|---|
| Free tiers only; approved dependency list only | BRD C-3, Rules 4 |
| Local-only data; nothing sent automatically | Tech 12 |
| Sample content until the founders supply the real pack | PRD |
| Content risk R-1 accepted; public site accepted | BRD R-1, founders |
| Never cut: Baseline and SWOT, Rounds, Mock analysis, Home task, consent, Reset, Feedback and Send to the team | PRD, Rules 14 |

**Honest sizing.** The PRD plus the Design describe seven feature areas, about 15 screens and 24 reusable components, to be built, verified and live on the same day. Full scope may not fit. The plan therefore works in **tiers** with checkpoints, so that a testable build exists as early as possible and anything cut is cut deliberately.

---

## 2. Design review: findings and integration deltas

`design.md` is the designer's document and I have not changed it. The items below are what affects the build.

| ID | Finding | Handling | Needs decision? |
|---|---|---|---|
| DF-1 | The Tailwind snippet (design 5.4) is circular (`--color-bg: var(--color-bg)`). | Raw tokens as `--lm-*`, mapped in `@theme` (Rules 6). | No |
| DF-2 | Fonts (Manrope, Newsreader) must be supplied as `.woff2` files; Antigravity may have no way to download them. | Build with the fallback stack; a human adds the three files to `public/fonts/` (task H-03). The app must work without them. A font npm package would need approval. | Founders: supply files |
| DF-3 | Some lucide icon names in the design may differ in the installed version. | Verify names on install; note substitutions (Rules 6). | No |
| DF-4 | The Design adds `/welcome`, `/practice` and `/words/read`, Profile tabs, a Resume card, a Home feedback card and Send to the team; the PRD and Tech v1.1 list some of these differently. | Treated as approved (founder-directed). Tech deltas in section 3 below. PM to update the PRD (Appflow AF-1). | PM |
| DF-5 | Timer announcements at "5 min, 1 min, end" are described for baseline start, though baseline is 15 minutes. | Implement as thresholds in config: announce at 5:00 remaining, 1:00 remaining and end; a 5-minute round announces at start. | No |
| DF-6 | Words and Revision have no end-of-practice reflection prompt (PRD 1.7 asks for one on every post-practice screen). | Not built in Phase 1; raised to the designer (Appflow AF-2). | Designer |
| DF-7 | Rounds move to reflection automatically 2 seconds after time ends. | Built as designed; flagged as an accessibility concern (Appflow AF-3). | Designer or founders |
| DF-8 | Design adds feedback text limits (280 characters), draft autosave and a Landing page. | Accepted as additions (Schema S-7). | PM to confirm |
| DF-9 | Design and BRD name grade D "Red flag"; the Design styles it in muted plum. | Keep (BRD-confirmed). Design G-2 suggests a softer label in Phase 2. | No |
| DF-10 | The design file is named `design.md`; documents refer to `Design.md`. | Treat as the same file. | No |

**Tech_Architecture v1.1 deltas (to fold into a v1.2 later; the build follows these now)**
1. Add routes `/welcome` (guard target for first visit), `/practice`, `/words/read`; Profile has two tabs (SWOT, Settings and data).
2. Fonts are self-hosted in `public/fonts/` with fallbacks; no network font requests.
3. `app.json` holds `brand`, `nav`, feature switches and the feedback contact.
4. Components follow design section 15 (names in `src/ui/`).
5. Tokens are `--lm-*` variables mapped to Tailwind `@theme`.

---

## 3. Approach and tiers

Small vertical slices. Each slice ends with the domain logic and its unit tests, the screens, and verification evidence. One Antigravity run per prompt (the first prompt covers M1 and M2); one execution handoff per run.

| Tier | Milestones | Why |
|---|---|---|
| **Tier 1: testable core** | M1 to M6 | Everything needed to run a session, collect feedback and show the OMET path |
| **Tier 2: study aids** | M7 Revision and Demo tools, M8 Words | PRD says these are lighter and cut first |
| **Tier 3: polish and release** | M9 | Accessibility pass, copy lint, deploy and live checks |

**Deviation from the Design's build order:** the Design lists Feedback after Revision and Words. I place Feedback and OMET (M6) **before** Revision and Words, because collecting tester feedback is a business objective (BO-2) and the PRD cuts Words and Revision first.

**Checkpoints.** After M2, M4 and M6 I will ask you how much of the day remains before issuing the next prompt, and recommend cuts using the Rules 14 order.

**Early deploy.** After M2 (Landing and Onboarding) a human deploys to Vercel (task H-02) so that hosting problems appear early, not at the end.

---

## 4. Milestones

| ID | Milestone | Contents | Tasks | Depends on | Size | Tier |
|---|---|---|---|---|---|---|
| M1 | Foundation | Scaffold, tokens, config and content loaders, store and persistence, UI primitives, shell, route guard | P1-01 to P1-05 | none | Large | 1 |
| M2 | Landing, Onboarding, Reset | Landing, 4-step onboarding, Profile settings tab with Reset and Start new session | P1-06 | M1 | Medium | 1 |
| M3 | Baseline and SWOT (F1) | Sample questions, question card, timer, baseline flow with resume, SWOT screen | P1-07, P1-08 | M2 | Large | 1 |
| M4 | Question selection (F2) | Rounds list, workspace, reflection, summary | P1-09 | M3 | Large | 1 |
| M5 | Mock analysis (F3) | Grading and potential score, mock screens, sample mock, summary | P1-10, P1-11 | M2 | Large | 1 |
| M6 | Home, Practice hub, Feedback, OMET (F5, F7) | Task recommender, Home tiles, Practice hub, event log, Feedback and Send to the team, OMET | P1-12 to P1-15 | M3 to M5 | Large | 1 |
| M7 | Revision and Demo tools (F4) | Scheduler, revision screens, Demo tools | P1-16, P1-17 | M2 | Medium | 2 |
| M8 | Words (F6) | Passage session, My words, flip card, Practise | P1-18, P1-19 | M2 | Medium | 2 |
| M9 | Hardening and release | Copy lint, accessibility and responsive pass, content validation, deploy, live checks | P1-20 to P1-23 | all built | Medium | 3 |

---

## 5. Tasks

Sizes: S (small), M (medium), L (large). "Evidence" is what I need back through you before marking a task complete (Rules 9, 12).

### M1 Foundation
| ID | Task | Size | Acceptance reference |
|---|---|---|---|
| P1-01 | Project scaffold and tooling: Vite, React, strict TypeScript, Tailwind v4, ESLint, Vitest, scripts (`typecheck`, `lint`, `test`, `build`, `validate:content`), folder structure per Tech 6, `vercel.json` (headers only), `robots.txt`, `.env.example`, README | M | Scripts run; build produces `dist/` |
| P1-02 | Tokens, fonts and base styles: `tokens.css` (`--lm-*`), Tailwind mapping, `@font-face` with fallbacks, base typography, `copy.json` from design section 3, `app.json` skeleton (brand, nav, features, scoring, CAT date) | M | Design 5; no raw hex in components |
| P1-03 | Data layer: Zod schemas and types per Schema.md, storage adapter, store with versioned persistence and migration, `appClock`, session ID, event-log writer with whitelisted names, reset function, in-memory fallback | L | Schema 1 to 2; Tech 8, 9 |
| P1-04 | Config and content loaders, validation with named errors, integrity checks, `validate:content`, sample packs for schools and quotes, copy-lint test (forbidden phrases) | M | Tech 10; PRD 1.6 |
| P1-05 | UI primitives (Button, Chip, Badge, Field, Select, Card, Banner, Modal, Toast, Tabs) and the app shell (sidebar, bottom bar, More sheet, top bar, banners), router (hash), route guard, 404 and content-error screens | L | Design 4, 6, 7; Appflow 2 |

### M2
| ID | Task | Size | Acceptance reference |
|---|---|---|---|
| P1-06 | Landing, Onboarding (4 steps with validation, resume of step), Profile "Settings and data" (details, Reset my data, Start new session with confirm dialogs, route to Landing) | M | PRD 1.2; Design 8.0, 8.1, 8.13 |

### M3 (F1)
| ID | Task | Size | Acceptance reference |
|---|---|---|---|
| P1-07 | Sample baseline questions (12, original, SAMPLE, unverified), question card, option row, timer, question grid, progress bar, evidence line, baseline flow (intro, answer, skip, confidence, finish confirm, timeout, resume), `baselineScoring` domain + tests | L | PRD M2.1; Design 8.4 |
| P1-08 | `swot` domain + tests; SWOT screen (Profile tab), section summaries, starter banner, reflection prompt | M | PRD 2.2, 2.3; Design 8.5 |

### M4 (F2)
| ID | Task | Size | Acceptance reference |
|---|---|---|---|
| P1-09 | Sample rounds (2 × 5 QA questions), round list, workspace (five tiles, free order, timer end), three-step skippable reflection, summary with alignment and solutions, `roundSummary` domain + tests | L | PRD M3; Design 8.6 |

### M5 (F3)
| ID | Task | Size | Acceptance reference |
|---|---|---|---|
| P1-10 | `grading`, `potentialScore`, `mockSummary` domain + tests (nine mappings; worked example 33, 39, 15, total 87) | M | PRD 4.3, 4.5 |
| P1-11 | Mock screens: start, section choice, entry cards, grade chip, save section, summary (bars, focus list, reading lines), Potential vs Actual with BR-14 sentence, `sampleMock.json` and Load sample mock | L | PRD M4; Design 8.7, 10 |

### M6 (F5, F7)
| ID | Task | Size | Acceptance reference |
|---|---|---|---|
| P1-12 | `taskRecommender`, `feedbackPrompt`, journey and days-practised domain + tests | M | PRD 5.3, 5.4; Tech 11 |
| P1-13 | Home (hero task card with time chips and Why this, stat tiles, quote, journey, Resume card, Feedback card), Practice hub, MoodboardTile with sky fallback | L | PRD M5; Design 8.2, 8.3, 11 |
| P1-14 | Session summary builder and tests (no display name), Feedback screen, Send to the team (preview, Share where supported, Copy, Download) | M | Tech 12; Design 8.12 |
| P1-15 | OMET teaser | S | PRD 8.1; Design 8.11 |

### M7 (F4)
| ID | Task | Size | Acceptance reference |
|---|---|---|---|
| P1-16 | `revisionScheduler` domain + tests | M | PRD 6; Schema 2.5 |
| P1-17 | Revision screens (Due today, Upcoming, Add) and Demo tools (Jump to day, Back to today, banners) | M | Design 8.8, 8.14 |

### M8 (F6)
| ID | Task | Size | Acceptance reference |
|---|---|---|---|
| P1-18 | `wordCards` domain + tests; sample passages (5, each with a glossary of at least 15 words, original text) | M | PRD 7; Schema 3.3 |
| P1-19 | Passage session, SelectableText, My words, FlipCard, Practise mode | M | Design 8.9, 8.10 |

### M9 Hardening and release
| ID | Task | Size | Acceptance reference |
|---|---|---|---|
| P1-20 | Accessibility and keyboard pass (design 13, 16), reduced motion, responsive screenshots for every screen at 360 px and 1280 px | M | Design 16 |
| P1-21 | Full content validation, copy lint, complete unit-test suite, no console errors | S | Tech 15.1 |
| P1-22 | Deploy to Vercel and live verification (reload on every route, resume, reset) | S | Tech 13 |
| P1-23 | Pre-test checklist on real devices: Share, Copy, Download on Android, iPhone and laptop; SAMPLE badges visible | S | Tech 12.7, 13.6 |

---

## 6. Human and external tasks

| ID | Task | Owner | Needed by |
|---|---|---|---|
| H-01 | Transfer the planning documents to the shared project folder and confirm | You | Before M1 |
| H-02 | Create or log in to the Vercel account (a founder's personal Hobby account), connect the repository or use the CLI, deploy | Founder | After M2 |
| H-03 | Download Manrope and Newsreader `.woff2` files (SIL OFL) and place them in `public/fonts/` | Founder or you | Before M9; app works without |
| H-04 | Supply the daylight backdrop and school images (1600 px JPEG, up to 300 KB, licence and attribution recorded) | Founders | Optional; sky gradient fallback |
| H-05 | Supply the real content pack (questions with solutions, rounds, passages with glossaries, quotes) | Founders | After the build; sample content until then |
| H-06 | Provide the feedback contact (email or WhatsApp number) | Founders | Before M6 ends |
| H-07 | Update the PRD (Appflow AF-1) and adopt the consent wording | PM | Not blocking |
| H-08 | Provide an Android phone, an iPhone and a laptop for Share, Copy and Download checks | You | M9 |
| H-09 | Confirm the CAT date and marking scheme against the official bulletin | PM | Not blocking |
| H-10 | Apply the BRD v1.1 patch text recorded in HANDOFF.md | You | Not blocking |

---

## 7. Verification strategy

- Every task closes with the evidence list in Rules 12: command output, manual steps and results, and screenshots at 360 px and 1280 px for new screens.
- Logic tasks require their unit tests in the same task (Tech 15.1).
- Milestone acceptance uses the PRD acceptance criteria and the design QA checklist (design 16).
- I mark a task complete only on evidence that I have seen. A report alone is "execution reported; evidence pending".
- After deploy I need: the live URL opened on a phone and a laptop, a reload on a deep route, and a Share, Copy and Download test.

---

## 8. Approval gates

| Gate | When | Who |
|---|---|---|
| Planning approval | Before the first Antigravity run | Founders (you) |
| Dependency list (A4) | Before the first Antigravity run | Founders; treated as agreed by the instruction to proceed, to be confirmed |
| Scope cuts | At checkpoints after M2, M4, M6 | Founders |
| Loading the real question pack onto the public site | When H-05 arrives | Founders (risk R-1 accepted) |
| Any Phase 2 work | After the test | Founders |

---

## 9. Risks

| ID | Risk | Mitigation |
|---|---|---|
| IR-1 | Scope exceeds the day | Tiers, checkpoints, Rules 14 cut order |
| IR-2 | Early structure errors (tokens, store) cost time later | M1 is a single, carefully specified prompt with strict acceptance criteria |
| IR-3 | Agent drift or unrequested dependencies | Rules.md, approved list, small prompts |
| IR-4 | Sample content quality (wrong answers) | Marked SAMPLE and `verified: false`; founders replace before wider use |
| IR-5 | Fonts or images unavailable | Fallbacks built in |
| IR-6 | Vercel Hobby terms (BRD/Tech R-10) | Accepted by the founders; fallback to Pro or Cloudflare |
| IR-7 | Manual transfer overhead | One prompt per milestone, one handoff per run |
| IR-8 | Share sheet unsupported in a browser | Copy and Download always available |

---

## 10. Phase 1 versus Phase 2

Everything above is Phase 1. Deferred shortcuts (recorded as technical debt): local storage only, dummy login, sample content, no server-side deletion or analytics, single-tab assumption, no offline support. Phase 2 starts only on the founders' explicit approval.
