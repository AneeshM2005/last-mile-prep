# Tracker.md: Project Tracker

**Owner:** Claude
**Version:** 1.0 (initial state)
**Intended repository path:** `/Tracker.md`
**Document state:** Proposed update (not yet transferred to the project folder)
**Last updated from evidence:** none yet. This is the initial board; no implementation has been reported.

**How this board works**
- Exactly three status columns: **To-Do** (not started), **In Progress** (actively being worked on), **Completed** (completed **and sufficiently verified**).
- A task moves to Completed only on evidence I have seen (Rules 9 and 12). An Antigravity report alone keeps a task In Progress, marked "execution reported; evidence pending".
- I update this file only from evidence you bring me. Issuing an instruction does not move a task.
- Blockers are written in the task's notes (section 2), not as extra columns.
- Milestone references: M1 Foundation, M2 Landing and Onboarding, M3 Baseline and SWOT, M4 Question selection, M5 Mock analysis, M6 Home, Feedback and OMET, M7 Revision, M8 Words, M9 Hardening and release. Task detail is in `Implementation_Plan.md`.

---

## 1. Board

| To-Do | In Progress | Completed |
|---|---|---|
| | `[PLAN-01]` Planning documents generated; transfer to the project folder and founder sign-off pending | |
| `[H-01]` Transfer planning documents to the shared folder and confirm | | |
| `[P1-01]` M1 Project scaffold and tooling | | |
| `[P1-02]` M1 Tokens, fonts, base styles, copy and app config | | |
| `[P1-03]` M1 Data layer (schemas, storage, store, clock, events, reset) | | |
| `[P1-04]` M1 Config and content loaders, validation, copy lint | | |
| `[P1-05]` M1 UI primitives, app shell, router, route guard | | |
| `[P1-06]` M2 Landing, Onboarding, Profile settings with Reset | | |
| `[H-02]` Vercel account and first deploy (after M2) | | |
| `[P1-07]` M3 Baseline flow and question components | | |
| `[P1-08]` M3 SWOT domain and screen | | |
| `[P1-09]` M4 Rounds (list, workspace, reflection, summary) | | |
| `[P1-10]` M5 Grading, potential score and mock summary domain | | |
| `[P1-11]` M5 Mock analysis screens | | |
| `[P1-12]` M6 Task recommender, feedback prompt, journey domain | | |
| `[P1-13]` M6 Home, Practice hub, MoodboardTile | | |
| `[P1-14]` M6 Session summary, Feedback, Send to the team | | |
| `[P1-15]` M6 OMET teaser | | |
| `[H-06]` Provide the feedback contact (email or WhatsApp) | | |
| `[P1-16]` M7 Revision scheduler domain | | |
| `[P1-17]` M7 Revision screens and Demo tools | | |
| `[P1-18]` M8 Word cards domain and sample passages | | |
| `[P1-19]` M8 Passage session, My words, flip card, Practise | | |
| `[P1-20]` M9 Accessibility, keyboard, responsive and reduced-motion pass | | |
| `[P1-21]` M9 Full content validation, copy lint, complete test suite | | |
| `[P1-22]` M9 Deploy and live verification | | |
| `[P1-23]` M9 Real-device checks (Share, Copy, Download) | | |
| `[H-03]` Add Manrope and Newsreader `.woff2` files | | |
| `[H-04]` Supply backdrop and school images with licences | | |
| `[H-05]` Supply the real content pack | | |
| `[H-07]` PM updates the PRD and adopts the consent wording | | |
| `[H-08]` Provide Android phone, iPhone and laptop for device checks | | |
| `[H-09]` Confirm CAT date and marking scheme against the official bulletin | | |
| `[H-10]` Apply the BRD v1.1 patch text from HANDOFF.md | | |

---

## 2. Task notes

| ID | Execution status | Verification status | Blockers and notes |
|---|---|---|---|
| PLAN-01 | Documents generated in chat | Not applicable | Transfer unconfirmed. Founders to sign off BRD, PRD, Tech v1.1, Design and these documents |
| P1-01 | Not started | Not verified | First Antigravity prompt (`ANTIGRAVITY_PROMPT.md`) covers P1-01 to P1-06 |
| P1-02 | Not started | Not verified | Fonts fall back to system fonts until H-03 |
| P1-03 | Not started | Not verified | None |
| P1-04 | Not started | Not verified | Packs for questions, rounds, passages arrive with their screens (P1-07, P1-09, P1-18) |
| P1-05 | Not started | Not verified | Icon names to be checked against the installed lucide-react |
| P1-06 | Not started | Not verified | Deploy checkpoint follows (H-02) |
| P1-07 | Not started | Not verified | Sample questions are original placeholders, SAMPLE, `verified: false` |
| P1-08 | Not started | Not verified | None |
| P1-09 | Not started | Not verified | Open design point: automatic move to reflection (Appflow AF-3) |
| P1-10 | Not started | Not verified | Must reproduce 33, 39, 15, 87 from the worked example |
| P1-11 | Not started | Not verified | None |
| P1-12 | Not started | Not verified | None |
| P1-13 | Not started | Not verified | Images optional; sky fallback |
| P1-14 | Not started | Not verified | Contact line blocked on H-06 (fallback text exists) |
| P1-15 | Not started | Not verified | None |
| P1-16 | Not started | Not verified | Tier 2: first to cut with M8 if time runs short |
| P1-17 | Not started | Not verified | Tier 2 |
| P1-18 | Not started | Not verified | Tier 2: first to cut |
| P1-19 | Not started | Not verified | Tier 2: first to cut |
| P1-20 to P1-23 | Not started | Not verified | P1-22 needs a human with the Vercel account; P1-23 needs devices (H-08) |
| H-01 to H-10 | Not started | Not applicable | See `Implementation_Plan.md` section 6 for owners and timing |

---

## 3. Checkpoints (to be asked before the next prompt is issued)

| After | Question I will ask | Possible cuts (Rules 14 order) |
|---|---|---|
| M2 | How much of the day remains? Is the Vercel deploy done? | Landing pills; school images |
| M4 | Is Mock analysis still reachable in the time left? | Words, Revision |
| M6 | Is there time for Revision and Words? | Words first, then Revision |
