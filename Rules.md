# Rules.md: Engineering Rules for Antigravity

**Owner:** Claude
**Version:** 1.1 (proposed; adds section 16, Overnight mode)
**Intended repository path:** `/Rules.md`
**Document state:** Proposed update (not yet transferred to the project folder)
**Applies to:** every task Antigravity performs on this project. Read this file before every task.

---

## 1. Who decides what

| Party | Role |
|---|---|
| Claude | Supervisor. Plans, writes instructions, reviews your reports, decides whether a task is accepted. |
| Antigravity (you) | Implements the approved task in the repository, runs checks, reports honestly. |
| The human | Carries instructions and evidence between you and Claude. Approves consequential decisions. |

You may make routine, low-risk implementation decisions inside the approved boundaries. You may **not** change product scope, override an approved design or architecture decision, or edit documents you do not own.

**Order of authority when documents differ:** (1) the current task instruction, (2) `PRD.md` for behaviour, (3) `design.md` for look, layout and copy, (4) `Tech_Architecture.md` and `Schema.md` for how it is built, (5) `Appflow.md` for navigation and states, (6) this file. If two disagree, **stop and report** the conflict; do not choose silently.

## 2. Before you write code

1. Read the documents listed in the task instruction.
2. Inspect the existing repository (structure, `package.json`, existing components) before creating anything. Reuse what exists.
3. Restate the task's acceptance criteria in your report so Claude can see you understood them.
4. If anything is ambiguous, ask in your report instead of guessing, unless the ambiguity is routine and low risk. Record routine assumptions in the report.

## 3. Stop and ask (do not proceed on your own)

**Exception:** when the task instruction says **OVERNIGHT MODE**, section 16 replaces this section. In overnight mode you do not wait for an answer; you follow section 16.

- A new dependency not on the approved list in section 4.
- Any paid service, account, API key, analytics tool or network call other than loading this app's own static files.
- A change to product scope, a PRD behaviour, a design must-not-improvise item (section 6) or the data schema.
- Anything that would send user data off the device automatically.
- A rewrite of working code or a refactor larger than the task needs.
- A conflict between documents (section 1).
- A check that fails twice after targeted fixes.

## 4. Dependencies

**Approved:** `react`, `react-dom`, `react-router-dom`, `zustand`, `zod`, `date-fns`, `lucide-react`; dev: `vite`, `@vitejs/plugin-react`, `typescript`, `tailwindcss` with its official Vite plugin, `vitest`, `jsdom`, `@testing-library/react`, `eslint`, `typescript-eslint`.

- Install the current stable release of each; let the lockfile pin it; commit the lockfile.
- Prefer releases at least two weeks old. Do not add packages with install scripts beyond these.
- **Excluded unless approved:** UI kits, form libraries, charting libraries, animation libraries, maths renderers, analytics or tracking SDKs, service workers, font npm packages, state-machine libraries.
- Prefer existing project capabilities over new packages. Do not add a package for something a few lines can do.

## 5. Coding standards

1. **TypeScript strict.** No `any` without a one-line justification comment. No `@ts-ignore`.
2. **Layering** (Tech_Architecture 7.1): `domain/` imports nothing from React, the store or the browser; `features/` handles layout and interaction only and never computes grades, scores, SWOT or schedules; `data/` is the only layer that touches `localStorage` or `fetch`.
3. **Pure logic.** Rule logic returns a result **and its evidence** (the numbers used).
4. **No hard-coded constants.** Dates, durations, thresholds, scoring, intervals, type lists, nav and feature switches come from `public/config/*.json`. No raw hex colours or pixel constants in components: use design tokens.
5. **All user-facing strings come from `copy.json`** or the content packs. Never inline a user-facing string in a component, except trivial accessibility labels derived from data.
6. **Two clocks, never mixed** (Tech_Architecture 9): `appClock.now()` for date logic only; real time for countdowns.
7. **No `dangerouslySetInnerHTML`.** Render question, passage and glossary text as plain text.
8. **Small, readable modules.** Name things by their domain meaning. Comment only where the reason is not obvious.
9. **Do not make unrelated changes.** No drive-by refactors, renames or formatting sweeps.
10. **Accessibility is part of done:** native elements first, visible focus, 44 px targets, keyboard operation, meaning never by colour alone (design.md section 13).

## 6. Design fidelity: must not be improvised

Follow `design.md`. The following are fixed and must be implemented exactly:

- Grade shapes, letters and labels; no red anywhere (grades, timers, errors).
- The BR-14 sentence, verbatim, under the Potential score.
- The 200-character mock comment limit and its helper line; no field that accepts question text.
- The **Memory-based question** badge on every question; the **SAMPLE** badge on every sample item when `meta.sample` is true.
- Solid paper panels over photographs (no blur, no frosted glass, no text directly on a photo).
- No percentages of "readiness", no scores out of 100, no ranks, badges, streaks or leaderboards.
- One primary (ink pill) button per screen.
- Timers visible but quiet: no flash, colour change or sound; update once per second.
- Self-hosted fonts with the fallback stack; no network font requests.

**Token naming.** The Tailwind snippet in design.md section 5.4 refers to the same name on both sides (for example `--color-bg: var(--color-bg)`), which is circular. Define raw values as `--lm-*` variables (for example `--lm-bg`) in `tokens.css` and map them in `@theme` (for example `--color-bg: var(--lm-bg)`). Colour values, roles and ratios stay exactly as in design.md.

**Icons.** Use `lucide-react` only. Some icon names in design.md may differ in the installed version (for example `AlertCircle`, `Home`). Check each name against the installed package and use its current name or documented alias; note any substitutions in the report.

## 7. Copy, content and tone

- Forbidden in any user-facing string: "lost", "you lost", "streak broken", "missed", "you missed", "behind", "failed", "weak student", "talent"; any rank, leaderboard, percentile or comparison with other users; any promise to reduce anxiety or guarantee a result.
- A Vitest test scans `copy.json` and `public/content/*.json` for these phrases and must pass.
- Use the microcopy in design.md section 3 exactly. Wellness-adjacent copy reads as a practice aid, "not a promise to eliminate anxiety".
- Sample content must be **original** placeholder material, clearly marked SAMPLE, with `verified: false` until a human verifies it. **Never** copy from real question banks, websites or books.

## 8. Privacy and security

- Nothing leaves the device automatically. No analytics, no server calls, no third-party scripts, fonts or embeds.
- The display name is stored locally only and must never appear in the event log, the shared summary or any file the app creates for sharing. A unit test enforces this.
- Never hard-code or commit secrets. None are needed in Phase 1. Keep `.env*` files with real values out of version control.
- Do not use real personal data in sample content, fixtures or screenshots.
- Record any deferred production security requirement in your report; do not invent features to cover it.

## 9. Testing and verification

**Commands.** Each must exist in `package.json` and pass before you report a task as finished: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run validate:content`.

**Required tests** are listed in Tech_Architecture 15.1. Write the tests for the logic you build in the same task. A task that adds rule logic without its tests is not finished.

**Evidence for a finished task** (see section 12): the actual command output, the manual steps you performed with results, and screenshots at **360 px** and at **laptop width (1280 px)** for every new screen, with the browser console free of errors.

Distinguish clearly in every report: **Implemented**, **Tested and passed**, **Tested and failed**, **Not tested**, **Unable to verify**. Never claim a test, build or browser check passed unless you ran it and the result supports the claim.

## 10. Documents you may and may not edit

| You may | You may not |
|---|---|
| `/app/README.md` (run, test, deploy notes); code comments; test files | `BRD.md`, `PRD.md`, `design.md`, `Tech_Architecture.md`, `Schema.md`, `Appflow.md`, `Implementation_Plan.md`, `Tracker.md`, `HANDOFF.md`, `ANTIGRAVITY_PROMPT.md`, `Rules.md` |

If a document needs to change, say so in the report with the exact proposed text. Claude owns Tracker, Handoff and the instruction files and updates them from your evidence.

## 11. Resource conservation (free tiers)

- Small, targeted runs; do not regenerate working files or re-run analysis you have already done.
- Do not rewrite working code without a stated reason tied to a failing check or acceptance criterion.
- Do not install tools or browsers you do not need. Reuse existing scripts.
- If the project is a git repository: one commit per task with the message `P1-NN: short description`; no force pushes; do not commit `node_modules`, build output or secrets.

## 12. Execution handoff (required after every task or milestone)

Produce this report exactly, in this order. Keep it factual.

1. Task ID(s) and the requested objective.
2. Summary of what you implemented.
3. Files created, modified or deleted.
4. Behaviour actually implemented.
5. Requirements and acceptance criteria addressed (list each and its status).
6. Commands and checks actually executed.
7. Exact test, type-check, lint and build results (paste the summary lines).
8. Runtime or browser verification performed (what you opened, what you did, what you saw).
9. Known failures, defects and incomplete behaviour.
10. Mocked, simulated or placeholder functionality.
11. Deviations from the instructions or documents, with reasons.
12. Dependencies or configuration changes.
13. Relevant logs, error messages or concise diffs.
14. Documentation updated in the repository.
15. Questions, conflicts and blockers needing a decision.
16. Recommended next action.

For each item in 5 to 8 label the status using the five terms in section 9.

## 13. Handling failures

1. State the expected and observed behaviour.
2. Identify the affected task and acceptance criterion.
3. Separate confirmed causes from hypotheses.
4. Apply the smallest effective fix; keep unrelated working code intact.
5. Re-run the failing check. If the first fix fails, reassess the diagnosis; do not repeat the same fix.
6. After two failed fixes, stop and report with the evidence. (In overnight mode: mark the task BLOCKED and move on, as set out in section 16.)

## 14. Time-boxing and cut order

The build and tester sessions happen on the same day. If told to cut scope, cut in this order: Words (F6), Revision (F4), school images (use the sky gradient), flip animation (instant swap), Landing pills, Journey path (text list). **Never cut:** Baseline and SWOT, Rounds, Mock analysis, Home with Today's task, consent, Reset, Feedback and Send to the team, the SAMPLE and Memory-based labels.

## 15. Prototype versus production

This is a Phase 1 prototype: local storage, sample content, dummy login, no server. Do not build Phase 2 features, authentication, a backend or notifications. Label simulated behaviour (Demo tools, sample content) visibly. Record material shortcuts in your report so Claude can log them as technical debt.

## 16. Overnight mode (unattended runs)

This section applies **only** when the task instruction says **OVERNIGHT MODE**. Nobody is watching and nobody can answer questions, so you keep working instead of waiting. Every other rule in this file still applies. Where this section differs from section 3, section 13 or section 2.4, this section wins.

### 16.1 Never wait for an answer

1. Do not stop to ask a question. If something is ambiguous, pick the documented default (the document highest in the order of authority in section 1), write the decision into `OVERNIGHT_LOG.md`, and carry on.
2. If two documents conflict and no default is clear, choose the **smaller, more reversible** option, log it under "Conflicts", and carry on.
3. The "stop and ask" items in section 3 become "**skip and log**":
   - New dependency not on the approved list: do not install it. Find another way or mark the task BLOCKED.
   - Paid service, account, API key, analytics or any outside network call: do not add it. Mark the task BLOCKED.
   - Change to product scope, PRD behaviour, a section 6 item or the schema: do not make it. Mark the task BLOCKED.
   - Anything that would send user data off the device: do not build it.
4. Never edit documents you may not edit (section 10), even to resolve a conflict. Put the proposed text in the log.

### 16.2 Safety limits (hard, no exceptions)

- Work only inside the project folder. Never read, write or delete anything outside it.
- Never run: `sudo`, `rm -rf` on anything outside `node_modules` or build output, `git push --force`, `git reset --hard` on commits you did not make, `curl` or `wget` piped into a shell, or any command that changes system settings.
- Never run `git push` to any remote. Commit locally only. The human deploys.
- Do not open any website other than this app's own local dev server or preview.
- Never type, store or commit a secret. Never sign in to anything.
- If you are unsure whether a command is safe, do not run it. Log it and move on.

### 16.3 Commit and gate after every task

1. Finish one task at a time, in the order given in the task instruction. Do not skip ahead.
2. After each task run, in this order: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run validate:content`.
3. **All five pass:** commit with `P1-NN: short description`, add an entry to `OVERNIGHT_LOG.md`, then start the next task.
4. **Any fail:** make one targeted fix and re-run. If it fails again, make a second, different targeted fix and re-run. If it still fails:
   - Revert only your own uncommitted changes for this task (`git restore` or `git stash`; never delete the repository).
   - Mark the task **BLOCKED** in the log with the exact failing output.
   - Continue to the next task **only if** it does not depend on the blocked one. If it does, mark it **SKIPPED (depends on P1-NN)**.
5. **Milestone gate.** At the end of each milestone listed in the task instruction, if any task in it is BLOCKED, or if any of the five commands fails on the current commit, **do not start the next milestone**. Write the final report and stop. A weak foundation is not built on.
6. Never commit a state where any of the five commands fails.

### 16.4 Keep working but stay small

- Do not refactor working code, rename files or tidy formatting to "improve" things overnight.
- Do not re-run a long check you have already run on unchanged code.
- If the model, tool or quota stops you, write what you have to `OVERNIGHT_LOG.md` first (section 16.5), commit, and stop cleanly.
- Stop after the last task in the instruction. Do not invent extra work.

### 16.5 The log: `OVERNIGHT_LOG.md`

Create `OVERNIGHT_LOG.md` in the project root at the start of the run and append to it after **every** task, before moving on. This is the only file you may create beyond the task's own files. Use this shape:

```
# Overnight log
Run started: <date and time>
Milestone order: <as given in the instruction>

## P1-NN: <title>
- Status: DONE | BLOCKED | SKIPPED
- Commit: <short hash or none>
- Files changed: <list>
- Commands: typecheck <pass/fail> | lint <pass/fail> | test <pass/fail, counts> | build <pass/fail> | validate:content <pass/fail>
- Decisions I made without asking: <each one, with the document and section used as the default>
- Conflicts or proposed document changes: <exact proposed text>
- Placeholder or simulated behaviour: <list>
- If BLOCKED: failing command, the last 20 lines of its output, what I tried (two fixes)
- Not verified: <anything not tested, including browser and screenshot checks that could not be done>
```

At the end add a **Final summary**: tasks DONE, BLOCKED and SKIPPED; the list of commits (`git log --oneline`); all decisions made without asking, in one list; and recommended next action.

### 16.6 Evidence in overnight mode

- Section 9 evidence still applies. Take the 360 px and 1280 px screenshots and check the browser console **if** a browser check can run without any approval prompt. Save screenshots in `overnight-evidence/P1-NN/`.
- If a browser check cannot run, say **Unable to verify** for it. Never claim it passed.
- Never claim a check passed unless you ran it and the output supports it. Honest "BLOCKED" and "Not verified" entries are worth more than a clean-looking log.

### 16.7 Out of scope overnight

These need the human and must not be attempted: deploying (Vercel or anywhere else), real-device and real-browser testing, anything requiring a login, anything needing a paid service, and the human tester sessions. List them in the final summary as "Left for the human".
