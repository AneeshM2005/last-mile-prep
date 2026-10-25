# design.md: Last Mile (working name) – Phase 1 Prototype

**Role:** Senior UI/UX Designer and Design System Architect
**Version:** 1.0 (first full draft, for founder review)
**Date:** 26 October 2026
**Inputs:** BRD v1.0, PRD v1.0, Tech_Architecture v1.1, founder direction in chat (reference images 1 to 7 and decisions listed in section 2)
**Status labels:** **[Doc]** taken from BRD/PRD/Tech Architecture. **[Founder]** instructed by the founders in chat. **[Design]** a design decision made here. **[Assumption]** to be confirmed. **[Verified]** checked by calculation in this session. Nothing in this file has been tested in a browser or with users. Contrast ratios are computed with the WCAG 2.x formula and marked [Verified]; everything else is specification.

---

## 1. Overview and design intent

**Product.** A responsive web app that gives CAT aspirants last-mile preparation in the final ~30 days: strategy, timing, question selection and composure, derived from the user's own practice. It does not teach concepts, rank users or use AI. All logic is rule-based and local. [Doc]

**User.** A tired, anxious aspirant, probably on a laptop, possibly on a phone, often at night, short of time. Visual noise and pressure work against the product. [Doc + Interpretation]

**Chosen direction: "Daylight Paper".** [Founder] chose Option B's mood with the rest of Option A. In practice:

- **Structure and element styling** follow the ESTATES reference (pictures 1 to 4): a full-height left sidebar with wordmark and centred nav list, a large rounded hero tile with the title bottom-left and a pill button with a circled arrow, a bento grid of rounded tiles with tight gutters, small pill labels, and dark rounded section-header bars. Their photos and dark theme are ignored.
- **Colour** follows picture 5: warm paper canvas `#FAF9F8`, near-black ink `#2B2B2B` for primary buttons and headlines, light warm-grey secondary buttons. The accent is a muted sky blue-grey (from picture 7).
- **Mood and backdrop**: bright, airy daylight (picture 7) on the Landing page, Onboarding and the Home hero tile. Working screens stay on quiet paper. Picture 6 is not used (see decision D-3).
- **Type**: Manrope for headings and UI, Newsreader for quotes and reflection prompts only.

**Four principles that matter most**

1. **Calm is a feature.** Generous space, quiet motion, no red anywhere, no celebratory effects. Timers are visible and never alarming.
2. **One clear thing per screen.** One dark pill primary action per screen; everything else is quieter.
3. **Evidence on every insight.** Every SWOT item, grade summary and recommendation shows the numbers behind it.
4. **Label reality.** SAMPLE, Memory-based and Demo/Simulation are always visible where they apply.

**Distinctiveness rules (so it is not read as a template).** One accent colour, used sparingly. Text panels sit on photographs as solid paper panels, not frosted glass. Numbers are set in tabular figures. A serif appears only where the product speaks reflectively. The wordmark is typographic. No gradients except the sky fallback. No emoji. No identical icon-in-a-circle card grids.

---

## 2. Source documents and precedence

**Order of authority** [Doc, per brief]: PRD for behaviour and screens; BRD for business, tone and scope rules; Tech Architecture for what can be built.

**Founder decisions applied from chat** [Founder]

| # | Decision |
|---|---|
| F-1 | Visual direction: Option B's mood with the remainder of Option A. |
| F-2 | The Landing page uses the picture 7 daylight backdrop and should be "beautiful". |
| F-3 | Product name stays "Last Mile" for now and will change later. Logo stays generic. Both must be changeable in one place. |
| F-4 | Founders will supply licensed backdrops and school images. |
| F-5 | Picture 5 is the palette source; pictures 1 to 4 are structure only. |

**Conflicts and how they are resolved**

| ID | Conflict | Resolution |
|---|---|---|
| C-1 | Tech Architecture lists no Landing page route; the PRD has none. | Landing is [Founder]-directed. Designed as one extra route `/welcome` with no logic (see 8.0). Logged in section 17 for the PM. |
| C-2 | Tech Architecture says "no third-party fonts"; Design may call for self-hosted fonts. | Self-hosted OFL font files in `public/fonts/`, no npm package, no CDN. Allowed by Tech Architecture 14. |
| C-3 | Tech Architecture suggests mobile nav "Home, Practice, Mock, Revision, More". PRD lists 8 items. | Follow the Tech Architecture grouping (data-driven). Words, Profile, OMET, Feedback sit in More. |
| C-4 | Resume card, Home feedback card and "Send to the team" exist in Tech Architecture (founder decisions) but not in the PRD. | Designed as [Doc] features. PM should add them to the PRD. |
| C-5 | BRD labels grade D "Red flag". Calm principle conflicts with alarm styling. | Keep the BRD label (confirmed). Style D in muted plum with a square shape, never red. Raised in section 17. |
| C-6 | The PRD navigation names "Practice (Baseline, Question Selection)" but defines no Practice screen. | A minimal Practice hub (two cards) is designed. It reuses the Task card; no new component. |
| C-7 | PRD puts SWOT under "My Profile". | `/profile` has two tabs: **SWOT** and **Settings and data** (Reset my data, Start new session, Demo tools). |

**Not designed (by rule):** no wellness module (PRD 1.7: tone only), no leaderboards, badges, streaks, dark mode, user image upload, notifications, or anything beyond the OMET teaser for OMET.

---

## 3. Users, context and tone

**User state.** Tired, anxious, time-poor, evening use. Sessions 15 to 90 minutes. Expect interruptions (refresh, tab switch, phone lock). Everything autosaves and resumes. [Doc]

**Voice.** Plain, warm, adult. Short sentences. Second person. Describes what happened and offers one next step. Never judges, never celebrates loudly, never compares.

| Do | Don't |
|---|---|
| "One thing to try" | "You should have" |
| "Your next step" | Scores out of 100, percentages of "readiness" |
| "Based on 3 questions" | "You are a strong/weak quant student" |
| "Waiting for you" | Guilt, urgency, countdown threats |
| "Time's up. Your answers are saved." | "Time ran out!" |

**Forbidden words and ideas in any UI string** [Doc: PRD 1.7, BRD]: "lost", "you lost", "streak broken", "missed", "you missed", "behind", "failed", "weak student", "talent", any rank, leaderboard, percentile, or comparison with other users, any promise to reduce anxiety or guarantee a result. A lint test already scans `copy.json` (Tech Architecture section 11), so the strings below are written to pass it.

**Microcopy guide** (all strings go in `copy.json`)

| Moment | String |
|---|---|
| Landing headline | "The last stretch, one steady step at a time." |
| Landing sub | "Strategy, timing and a calmer routine for the final weeks before CAT. Built from your own practice." |
| Landing privacy line | "Everything stays on this device. Nothing is sent automatically." |
| Landing prototype tag | "Prototype · sample content" |
| Consent notice | "Everything you do stays on this device and nothing is sent automatically. If you choose to share feedback, you will see exactly what will be shared first, and it will not include your name. Please do not type personal details in feedback boxes. You can delete everything on this device at any time with Reset my data." (Tech Architecture 12.6, pending PM adoption) |
| Consent checkboxes | "I understand and agree to this notice." / "I am 18 or older." |
| Display name helper | "Any name or nickname. It stays on this device." |
| Empty: SWOT | "Nothing here yet. This fills in as you practise." |
| Empty: Due today | "Nothing is due today. Add a topic to start a revision plan." |
| Empty: My Words | "No words yet. Select words you don't know while reading a passage." |
| Empty: Mock | "No mocks recorded yet. Start one when you are ready." |
| Baseline timer end | "Time's up. Your answers are saved." |
| Round timer end | "The round has ended. Your answers are saved." |
| Reflection prompt (round) | "What would you do the same next time?" |
| Reflection prompt (mock) | "Which one decision would you change in the next mock?" |
| Reflection prompt (baseline) | "What surprised you about how you worked through these?" |
| Revision due item | "Waiting for you" |
| Revision complete | "Revision cycle complete" |
| Selection alignment | "You attempted 2 of the 3 questions rated easiest for this set." |
| Potential score label (BR-14, verbatim) | "The score if every question you could solve were answered correctly. This is not a prediction. It ignores timing and negative marking." |
| Starter profile banner (PRD) | "Starter profile. It becomes more detailed as you use the app." |
| Comment helper (BR-12) | "A short note about your own experience. Please don't paste the question." |
| Storage banner (Tech 8.7) | "Progress cannot be saved in this browser mode." |
| Demo banner | "Demo date: 14 Nov 2026 · Simulation" |
| Content error | "We couldn't load {file}. {field} needs attention." |
| Generic error | "That didn't save. Please try again." |
| Reset confirm | "Delete everything on this device? This removes your profile and all practice data. It can't be undone." |
| Wellness-adjacent line | "A practice aid for steadier routines. It is not a promise to eliminate anxiety." |

---

## 4. Information architecture and navigation

**Routes (hash mode)** [Doc: Tech 7.2], plus `/welcome` and the Practice hub.

| Route | Page title (H1) | Reached from |
|---|---|---|
| `/welcome` | (Landing, wordmark + headline) | First visit; after Reset or Start new session |
| `/onboarding` | "Before we start" (4 steps) | Landing "Get started" |
| `/` | "Today" | Nav: Home |
| `/practice` | "Practice" | Nav: Practice |
| `/practice/baseline` | "Baseline" | Practice hub; Home task |
| `/practice/rounds` | "Question selection" | Practice hub; Home task |
| `/profile` | "My profile" | Nav: More → Profile (mobile); Profile (laptop) |
| `/mock` | "Mock analysis" | Nav: Mock |
| `/revision` | "Revision" | Nav: Revision |
| `/words` | "My words" (+ passage session at `/words/read`) | Nav: Words |
| `/omet` | "OMET" | Nav: OMET |
| `/feedback` | "Feedback" | Nav: Feedback; Home feedback card |

Nothing is locked [Doc]. The route guard sends users without completed onboarding to `/welcome` (first visit) or `/onboarding` (returning after Landing). **[Assumption]** Tech Architecture's guard targets `/onboarding`; the PM/architect should add `/welcome` as the guard target.

**Laptop (≥1024 px): left sidebar**, 248 px, full height, paper-toned `--color-sidebar`. Wordmark at top-left. Nav list centred vertically in the sidebar (as ESTATES), items in this order: Home, Practice, Mock analysis, Revision, Words, My profile, OMET, Feedback. Active item = ink pill with white text and filled icon. Bottom of the sidebar: small "Prototype · sample content" label and, if the demo clock is on, the Demo date chip.

**Mobile and tablet (<1024 px): bottom bar**, 64 px high plus safe-area inset, 5 slots: Home, Practice, Mock, Revision, More. "More" opens a bottom sheet listing Words, My profile, OMET, Feedback. Active slot = ink icon with a 3 px accent underline and bold label (shape plus label, not colour only). Nav items, order and the "More" group come from `app.json` (data-driven) [Doc].

**Top bar (mobile only):** 56 px, wordmark left, Demo-date chip and SAMPLE tag right when relevant. No hamburger.

---

## 5. Design tokens

Tokens are CSS variables in `src/styles/tokens.css`, mapped into Tailwind via `@theme` (Tailwind with the official Vite plugin). Dark mode is not built; tokens are semantic so it can be added later. [Doc, Assumption confirmed by default]

### 5.1 Colour

All ratios are WCAG contrast ratios computed in this session. [Verified]

| Token | Hex | Role |
|---|---|---|
| `--color-bg` | `#FAF9F8` | Page canvas |
| `--color-surface` | `#FFFFFF` | Cards, panels, inputs |
| `--color-inset` | `#F5F3F0` | Inset panels (stimulus, timer pill, quote tile) |
| `--color-sidebar` | `#F3F1EE` | Sidebar and bottom bar |
| `--color-border` | `#E6E3DE` | Decorative card edges (1 px) |
| `--color-border-strong` | `#8C867E` | Form-control borders, option row outlines (needs 3:1) |
| `--color-ink` | `#2B2B2B` | Headlines, primary buttons, primary text |
| `--color-text-muted` | `#5E5A55` | Secondary text, helper text |
| `--color-btn-secondary` | `#F0EDE8` | Secondary button fill |
| `--color-accent` | `#657E8E` | Accent fills, rules, progress bars, active underline. **Never used for text.** |
| `--color-accent-strong` | `#3F5766` | Accent text, links, focus ring, icons on light |
| `--color-accent-soft` | `#E4EBEF` | Selected backgrounds, chips |
| `--color-sample` | `#EFE9DC` | SAMPLE / Simulation badge fill |
| `--color-notice-bg` | `#F6ECD9` | Notice banner fill |
| `--color-notice-text` | `#7A4D0A` | Notice banner text |
| `--color-scrim` | `#1E2A33` | Solid text-panel fallback on photos (see 11) |
| `--color-focus` | `#3F5766` | Focus ring (2 px, 2 px offset) |
| `--color-disabled-text` | `#8C867E` | Disabled text (exempt from contrast, plus dashed border) |

**Grade colours** (each grade also has a shape, a letter and a label) [Doc: PRD 1.8]

| Grade | Label (BRD) | Shape (lucide) | Text/icon | Fill | Ratio |
|---|---|---|---|---|---|
| A | Your strength | `Circle` (filled) | `#25594D` | `#E3EFEB` | 6.81:1 |
| B | Be a better test taker | `Diamond` (filled) | `#3F5766` | `#E4EBEF` | 6.30:1 |
| C | Luck or great decision | `Triangle` (filled) | `#7A4D0A` | `#F6ECD9` | 6.19:1 |
| D | Red flag | `Square` (filled) | `#7A3450` | `#F4E4EA` | 7.04:1 |

No red or alarm tones for grades, timers or errors. Error text uses `--color-notice-text` on `--color-notice-bg` with an `AlertCircle` icon.

**Text and surface pairings** [Verified]

| Foreground on background | Ratio | Result |
|---|---|---|
| ink `#2B2B2B` on bg | 13.46:1 | AAA |
| ink on surface | 14.16:1 | AAA |
| ink on inset | 12.78:1 | AAA |
| muted `#5E5A55` on bg | 6.51:1 | AA |
| muted on surface | 6.84:1 | AA |
| muted on inset | 6.18:1 | AA |
| white on ink button | 14.16:1 | AAA |
| ink on secondary button `#F0EDE8` | 12.13:1 | AAA |
| accent-strong `#3F5766` on bg | 7.22:1 | AAA |
| accent-strong on surface | 7.59:1 | AAA |
| accent-strong on accent-soft | 6.30:1 | AA |
| notice text `#7A4D0A` on notice bg | 6.19:1 | AA |
| ink on SAMPLE badge `#EFE9DC` | 11.70:1 | AAA |
| white on scrim `#1E2A33` | 14.64:1 | AAA |
| Non-text: accent `#657E8E` on bg | 4.05:1 | passes 3:1 (not for text) |
| Non-text: border-strong `#8C867E` on surface | 3.60:1 | passes 3:1 |
| `--color-border` on bg | 1.22:1 | decorative only; never the sole cue |

### 5.2 Typography

Families: **Manrope** (variable, weights 400 to 800) and **Newsreader** (variable, italic and roman). Both SIL Open Font License 1.1, self-hosted as `.woff2` in `public/fonts/`, `font-display: swap`. Fallback stack: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` / `Georgia, serif`. Licences recorded in section 11.

| Token | Family | Size / line | Weight | Tracking | Use |
|---|---|---|---|---|---|
| `text.display` | Manrope | 44 / 48 (mobile 34 / 38) | 700 | -0.02em | Landing headline, days-to-CAT number |
| `text.h1` | Manrope | 32 / 38 (mobile 26 / 32) | 700 | -0.015em | Page titles |
| `text.h2` | Manrope | 22 / 28 | 600 | -0.01em | Card and section titles |
| `text.h3` | Manrope | 18 / 24 | 600 | 0 | Sub-headings |
| `text.body-lg` | Manrope | 18 / 28 | 500 | 0 | Question stems |
| `text.body` | Manrope | 16 / 24 | 400 | 0 | Default text |
| `text.body-strong` | Manrope | 16 / 24 | 600 | 0 | Labels, buttons |
| `text.small` | Manrope | 14 / 20 | 400 | 0 | Helper text, evidence lines |
| `text.caption` | Manrope | 12 / 16 | 600 | 0.03em | Badges, pill labels, attributions |
| `text.numeric` | Manrope | 16 / 24 | 600 | 0 | Timers, counts; `font-variant-numeric: tabular-nums` |
| `text.quote` | Newsreader italic | 22 / 30 (mobile 19 / 27) | 400 | 0 | Moodboard quotes |
| `text.reflect` | Newsreader | 20 / 28 | 400 | 0 | Reflection prompts |

Minimum body size 16 px; 14 px only for helper text; 12 px only for badges and attributions. Max line length 68 ch for passages and prose.

### 5.3 Spacing, radii, elevation, motion, layers, breakpoints

| Group | Tokens |
|---|---|
| Spacing (4 px base) | `--space-1` 4, `-2` 8, `-3` 12, `-4` 16, `-5` 20, `-6` 24, `-8` 32, `-10` 40, `-12` 48, `-16` 64 |
| Gutter (bento) | `--gutter` 12 px (all sizes) |
| Radii | `--radius-pill` 9999 · `--radius-xl` 24 (hero and bento tiles, modals) · `--radius-lg` 20 (question and entry cards) · `--radius-md` 16 (cards, option rows, inputs) · `--radius-sm` 12 (small panels, banners) |
| Borders | 1 px `--color-border` on cards; 1.5 px `--color-border-strong` on controls; selected option = 2 px `--color-ink` |
| Elevation | `--shadow-0` none (default; cards are flat with a border) · `--shadow-1` `0 1px 2px rgba(43,43,43,.06)` (sticky bars) · `--shadow-2` `0 12px 32px rgba(43,43,43,.12)` (modal, sheet) |
| Opacity | disabled controls 0.45 with dashed border · modal overlay `rgba(30,42,51,.45)` |
| Motion durations | `--dur-fast` 120 ms · `--dur-base` 200 ms · `--dur-slow` 320 ms |
| Easing | `--ease-out` `cubic-bezier(.2,0,0,1)` · `--ease-inout` `cubic-bezier(.4,0,.2,1)` |
| Z-index | content 0 · sticky bars 10 · sidebar 20 · bottom bar 20 · banner stack 30 · sheet 40 · modal 50 · toast 60 |
| Breakpoints | base 360 · `sm` 480 · `md` 768 · `lg` 1024 (sidebar appears) · `xl` 1280 |

### 5.4 Tailwind mapping (Tailwind v4 `@theme`)

```css
@import "tailwindcss";
:root {
  --color-bg:#FAF9F8; --color-surface:#FFFFFF; --color-inset:#F5F3F0;
  --color-sidebar:#F3F1EE; --color-border:#E6E3DE; --color-border-strong:#8C867E;
  --color-ink:#2B2B2B; --color-text-muted:#5E5A55; --color-btn-secondary:#F0EDE8;
  --color-accent:#657E8E; --color-accent-strong:#3F5766; --color-accent-soft:#E4EBEF;
  --color-sample:#EFE9DC; --color-notice-bg:#F6ECD9; --color-notice-text:#7A4D0A;
  --color-scrim:#1E2A33; --color-focus:#3F5766;
  --grade-a-fg:#25594D; --grade-a-bg:#E3EFEB; --grade-b-fg:#3F5766; --grade-b-bg:#E4EBEF;
  --grade-c-fg:#7A4D0A; --grade-c-bg:#F6ECD9; --grade-d-fg:#7A3450; --grade-d-bg:#F4E4EA;
  --radius-xl:24px; --radius-lg:20px; --radius-md:16px; --radius-sm:12px;
  --dur-fast:120ms; --dur-base:200ms; --dur-slow:320ms; --ease-out:cubic-bezier(.2,0,0,1);
  --sky-fallback:linear-gradient(180deg,#C9D9E3 0%,#E6EEF2 55%,#F3EFE8 100%);
}
@theme inline {
  --color-bg: var(--color-bg);  /* repeat for every colour token above */
  --font-sans: "Manrope", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-serif: "Newsreader", Georgia, serif;
  --radius-xl: var(--radius-xl);
}
```

The developer maps every token above; do not hard-code hex values in components. The brand name and wordmark come from `app.json` (`brand.name`, `brand.wordmarkSvg`), so the later rename touches one file (F-3).

---

## 6. Layout system

| Item | Mobile (360 to 767) | Tablet (768 to 1023) | Laptop (≥1024) |
|---|---|---|---|
| Navigation | Bottom bar 64 px + top bar 56 px | Bottom bar + top bar | Sidebar 248 px, no top bar |
| Page margin | 16 px | 24 px | 32 px |
| Content container | 100% | max 720 px | max 1120 px, centred in the area right of the sidebar |
| Focused work column (baseline, mock entry, feedback, reflection) | 100% | 640 px | 720 px, left-aligned with the page title |
| Bento grid (Home) | 1 column | 6 columns | 12 columns |
| Gutter | 12 px | 12 px | 12 px |
| Vertical rhythm | 24 px between sections, 16 px inside cards | 24 | 32 between sections, 20 inside cards |
| Card padding | 16 | 20 | 24 |

Rules: no horizontal scroll from 360 px [Doc]. Lines of reading text never exceed 68 ch. Stimulus and question sit side by side from `lg` (stimulus 5 columns, question 7) and stacked below it (stimulus first, collapsible if taller than 40% of the viewport).

---

## 7. Component library

Convention: **R** = Reuse, **O** = One-off. Every interactive component has focus (2 px `--color-focus` outline, 2 px offset) and a 44×44 px minimum hit area. Total: 24 components, 3 one-offs.

### 7.1 Buttons (R)

| Variant | Look | Use |
|---|---|---|
| `primary` | Ink `#2B2B2B` fill, white text, pill, 48 px high, 20 px side padding | One per screen |
| `primary-arrow` | Primary + a 32 px white circle at the right holding an `ArrowRight` icon (ESTATES pattern) | Start, Get started, Next |
| `secondary` | `--color-btn-secondary` fill, ink text, pill | Previous, Skip, secondary actions |
| `ghost` | No fill, accent-strong text, underline on hover | Why this?, links in cards |
| `quiet-danger` | Secondary look; confirm modal uses primary. No red. | Reset my data |

| State | Behaviour |
|---|---|
| default | as above |
| hover (pointer) | primary → `#000000` fill; secondary → `#E7E2DA`; arrow circle shifts 2 px right (`--dur-fast`) |
| focus | 2 px outline |
| active | scale 0.98 (`--dur-fast`) |
| disabled | 0.45 opacity, dashed 1.5 px border, `aria-disabled`, tooltip-free (helper text explains why) |
| loading | Label stays; replace arrow with a 16 px static `Loader` icon, no spinning if reduced motion |

### 7.2 Chip (R)
Pill, 40 px high (44 px hit area), `text.body-strong`. Variants: `choice` (single select, e.g. time 15/30/45/60/90, confidence Low/Medium/High), `filter` (My Words filters), `school` (target school picker, text only plus optional 40 px thumbnail).
States: default (surface, 1.5 px border-strong) · hover (inset fill) · focus · selected (accent-soft fill, 2 px ink border, `Check` icon 16 px at left) · disabled · complete (n/a).
A11y: groups use `role="radiogroup"` (single) or checkbox semantics (multi); arrow keys move within a radiogroup.

### 7.3 Badge (R)
Small pill, `text.caption`, 24 px high, `--radius-pill`.
- **SAMPLE**: `--color-sample` fill, ink text, `FlaskConical` icon. Shown on every sample item when `meta.sample` is true. [Doc]
- **Memory-based question**: surface fill, 1.5 px border-strong, ink text, `Brain` icon. On every question. [Doc: BR-13]
- **Simulation**: same as SAMPLE with text "Simulation". Demo tools only.
- **Prototype**: same as SAMPLE with text "Prototype · sample content". Landing and sidebar footer.
Badges are text, never colour-only.

### 7.4 Form fields (R)
Text input and textarea: 52 px high (textarea min 96 px), `--radius-md`, 1.5 px border-strong, surface fill, 16 px text (prevents iOS zoom). Label above (`text.body-strong`), helper below (`text.small`, muted).
States: default · hover (border ink) · focus (2 px focus ring, border ink) · filled · error (notice-bg fill, notice-text message with `AlertCircle`, `aria-invalid`, `aria-describedby`) · disabled · loading n/a.
Character counter for Comment: "37 / 200", muted, `aria-live="off"`; at 200 characters, input stops accepting (maxlength).
**Mock Comment field only** carries the helper "A short note about your own experience. Please don't paste the question." [Doc: BR-12]. No other free-text field exists in the mock module.

### 7.5 Select (R)
Native `<select>` styled to match the text input with a `ChevronDown` icon; used for Question type (mock) and Section. Native for keyboard and mobile reliability. States as 7.4. If "Other" is chosen, a short text input (max 40 characters) appears below.

### 7.6 Option row (R)
Full-width row for MCQ answers and for mock outcome steps. 56 px min-height, `--radius-md`, letter marker (A to D) in a 32 px circle at left, text at right. States: default (surface, border-strong) · hover (inset) · focus · selected (2 px ink border, accent-soft fill, `Check` icon at right) · disabled/locked (0.45 opacity, dashed) · correct/incorrect (solutions view only: `Check` or `X` icon plus text "Correct answer" / "Your answer"; no red/green dependency; uses grade-A fg for correct, notice for other).
Semantics: `role="radiogroup"` with native radios visually hidden but focusable.

### 7.7 Cards (R, one base with six variants)
Base: surface fill, 1 px border, `--radius-lg` (20) or `--radius-xl` (24 for tiles), padding per section 6, no shadow.

| Variant | Anatomy | Notes |
|---|---|---|
| **Task card** (Today) | Hero tile with backdrop (see 8.1): title, duration, reason, Start, time chips, Why this? | Largest card in the app |
| **Question card** | Header strip (index, badges, timer pill), stimulus inset panel, stem, options, footer controls | Baseline and Rounds |
| **Entry card** (mock) | Header "Q7 of 22", type select, outcome steps, comment, live grade chip | One per question |
| **Word card** | Front: word, speaker icon none. Back: meaning, synonym, antonym, usage, source passage | Flip |
| **SWOT card** | Quadrant: icon, title, items with evidence lines | 4 per screen |
| **Summary card** | Title, big number or bars, one reading line, evidence | Grades, round summary, potential vs actual |
| **Stat tile** | Label, big number, small context | Days to CAT, days practised |

States for all: default · hover (pointer only, border becomes `--color-border-strong`; only for clickable cards) · focus (when clickable) · selected · loading (skeleton: inset blocks, no shimmer under reduced motion) · empty (EmptyState inside) · error (Banner inside) · complete (small `Check` + "Done" text in header).

### 7.8 Navigation (R)
`SidebarNav` (laptop), `BottomBar` (mobile), `MoreSheet` (mobile). Items are `<a>` links inside `<nav aria-label="Main">`; the active item has `aria-current="page"`. Layout and states in section 4. Sidebar item: 48 px high, 16 px radius pill when active. Bottom-bar item: 44×44 hit area, icon 24 px, label `text.caption`.
Icons (lucide-react): Home `House`, Practice `Target`, Mock analysis `ClipboardList`, Revision `RefreshCw`, Words `BookOpen`, My profile `UserRound`, OMET `Compass`, Feedback `MessageSquare`, More `Ellipsis`.

### 7.9 Progress indicators (R)
- **ProgressBar**: 8 px high, `--radius-pill`, track `--color-inset`, fill `--color-accent`; always paired with text "7 of 22 recorded" (`text.small`). `role="progressbar"` with `aria-valuenow/max` and `aria-valuetext` equal to the text.
- **StepDots** (onboarding): 4 dots, current = 24 px ink pill, done = 8 px ink dot, upcoming = 8 px border-strong ring; text "Step 2 of 4" beside it.

### 7.10 Countdown Timer (R)
Pill, inset fill, 36 px high, `Clock` icon 16 px + `text.numeric` "4:32". Updates once per second (PRD). Never flashes, changes colour or makes sound. In the final 60 seconds the text becomes weight 700 and a caption "1 min left" appears beside it, still ink on inset. `aria-hidden="true"` on the ticking digits; a visually hidden `role="status" aria-live="polite"` region announces only "5 minutes left" (baseline start), "1 minute left", and "Time's up". On expiry the pill reads "Time's up" with a `Check` icon.
States: running · paused-for-hidden-tab (display continues from wall clock; no visual change) · ended · complete.

### 7.11 GradeChip (R)
Inline-flex pill, 32 px high. Composition: **shape icon + letter + label**, e.g. `◆ B · Be a better test taker`. Colours from 5.1. Variants: `compact` (shape + letter only, used in grids with a tooltip-free `aria-label` of the full label) and `full` (adds label; adds a one-line meaning below when `showMeaning`). In the mock entry card the chip appears with `role="status"` the moment an outcome is complete; `aria-label="Grade B, Be a better test taker: you had the knowledge, the decision was the lever."`
Meaning lines [Doc]: A "Good judgement, good knowledge." B "Knowledge was there; the decision was the lever." C "A good decision, or luck, without solid knowledge yet." D "Both judgement and knowledge need work. This is your first thing to look at."
States: default · empty (placeholder "Grade appears when you complete the outcome", muted, dashed border).

### 7.12 EvidenceLine (R)
`text.small`, muted, preceded by a 16 px `ListChecks` icon, always visible under insights. Pattern: "Based on 2 questions: 1 correct, average 48 s". Cannot be collapsed. If n < 3, adds "Early signal." after the sentence.

### 7.13 Banner (R)
Full-width within its container, `--radius-sm`, 12 px padding, icon + text, optional link/button.

| Kind | Fill / text | Icon | Where |
|---|---|---|---|
| `info` (Starter profile, consent notes) | accent-soft / accent-strong | `Info` | SWOT, onboarding |
| `notice` (Storage, validation, errors) | notice-bg / notice-text | `AlertCircle` | global top of content |
| `demo` (Demo date) | sample fill / ink | `FlaskConical` | persistent, top of content and in sidebar |
| `sample` (page-level "Sample content") | sample fill / ink | `FlaskConical` | pages with sample items, in addition to item badges |

Banners are not dismissible when they carry labelling duty (demo, sample); info banners may be dismissed for the session.

### 7.14 Modal and Sheet (R)
Centred modal (laptop) / bottom sheet (mobile) with `--radius-xl`, `--shadow-2`, overlay 45% scrim. Contains title, one sentence, primary and secondary buttons. Uses native `<dialog>`; focus moves to the title, trap inside, Esc closes, focus returns to the trigger. Used for: Reset my data, Start new session, Submit baseline early, More sheet.
States: closed · open · loading (primary shows loading state).

### 7.15 Toast (R)
Bottom-centre (mobile above the bar), max 360 px, surface fill, `--shadow-2`, 4 s, `role="status"`. For "Saved", "Copied", "Word added". No toast for errors that need action (use Banner).

### 7.16 Tabs (R)
Underline tabs, 48 px high, active = ink text + 3 px accent underline + bold. `role="tablist"`; arrow keys move; Home/End jump. Used on `/profile` (SWOT, Settings and data), `/revision` (Due today, Upcoming, Add), `/words` (All, Still learning, Got it use the Chip filter instead).

### 7.17 QuestionGrid (R)
Row of 44×44 px squares (`--radius-sm`) wrapping; shows jump targets. State is conveyed by **content, not colour alone**: answered = filled ink with number in white and a tiny `Check`; skipped = hollow with diagonal strike icon `Minus`; current = 2 px ink ring + `aria-current="step"`; unvisited = hollow, number only. Used in Baseline and Mock entry (recorded = filled with grade shape instead of check).

### 7.18 Expander (R)
Native `<details>/<summary>`; summary is a ghost button with `ChevronDown` rotating 180° (`--dur-base`). Used for "Why this?" and solutions.

### 7.19 EmptyState (R)
Inset panel, `--radius-md`, one line of text (`text.body`), optional single secondary button, a simple 40 px line icon in accent-strong. No illustration.

### 7.20 BarRow (R)
CSS-only horizontal bar: left = grade shape + label, middle = bar (8 px, `--radius-pill`, track inset, fill = grade fg colour at 100%), right = count in `text.numeric`. Width is `count / max(count across rows, 1)`. Used for grade counts and focus-list weights. Min width 4 px for non-zero counts so one item is visible.

### 7.21 JourneyPath (**O**, Home only)
Five nodes in a row (laptop) or a vertical list (mobile): Baseline done · First question-selection round · First mock analysis · First revision cycle · First passage read. Done = 24 px filled ink circle with `Check`; next = 24 px ring in accent-strong with the label in bold; later = 24 px ring in border-strong. Connecting line 2 px `--color-border-strong`, accent-strong between done nodes. Labels `text.small` below each node. Plus "Days practised: 4". No streak, badge or total score.

### 7.22 FlipCard (**O**, Words only)
Word card with front/back faces. `perspective`/`rotateY` over `--dur-slow`; with reduced motion, a 120 ms cross-fade. Implemented with a `<button>` wrapper (`aria-pressed` = flipped); the back face is `aria-hidden` until flipped; both faces' text remains reachable by screen readers via visually hidden duplicates.

### 7.23 MoodboardTile (R, Home and Landing)
Container with image or fallback, caption panel, attribution pill. Specification in section 11.

### 7.24 SelectableText (**O**, passage session only)
Renders passage text as `<span role="button" tabindex="0">` per word; tap/click/Enter toggles selection. Selected word = accent-soft fill, 2 px ink underline, `aria-pressed="true"`. 30-word cap shows "30 of 30 words chosen" and further taps show a toast "You've chosen 30 words for this session."

---

## 8. Screen specifications

Wireframe key: `[ ]` region, `( )` button/chip, `▢` card. Every screen has laptop and mobile behaviour. "States" always include first run, in progress, complete, empty, error and timeout where they apply; where one does not apply it is stated.

### 8.0 Landing `/welcome` [Founder-directed addition]

**Purpose.** A beautiful first impression and a plain statement of what the app is. No logic, no data capture.
**Entry.** First visit, or after Reset my data / Start new session.
**Components.** MoodboardTile (full-bleed), Button `primary-arrow`, Badge Prototype, wordmark.

```
Laptop (≥1024)
┌──────────────────────────────────────────────────────────┐
│ [wordmark]                           (Prototype · sample)│  ← top row, solid paper pill nav, no blur
│                                                          │
│  full-bleed daylight backdrop (picture 7 style)          │
│  ┌─────────────────────────┐                             │
│  │ paper panel, 520 px     │                             │
│  │ pills: Strategy · Fun · Wellness
│  │ The last stretch, one steady step at a time.  (display)
│  │ Strategy, timing and a calmer routine…   (body-lg)    │
│  │ (Get started →)   Everything stays on this device.    │
│  └─────────────────────────┘                             │
│                          photo credit · licence (caption)│
└──────────────────────────────────────────────────────────┘
Mobile: backdrop fills the top 46 vh; paper panel overlaps its lower edge (−32 px), full width minus 16 px margins, radius 24; wordmark floats top-left on a solid paper pill.
```

**Content.** Headline and sub from section 3. Three pill labels (Strategy, Fun, Wellness) are `text.caption` tags, not links. Privacy line under the CTA (`text.small`, muted). Prototype badge top-right.
**Interactions.** "Get started" → `/onboarding`. Panel text is never on the bare photo (contrast rule 11.3).
**States.** *First run:* as drawn. *Image missing:* sky fallback gradient (`--sky-fallback`), same layout. *Error:* none (static). *Returning with completed onboarding:* route redirects to `/`; Landing is not shown.
**Motion.** Panel fades up 8 px over `--dur-slow` on load; none under reduced motion.
**Accessibility.** One `<h1>`; the backdrop `alt=""` (decorative); CTA is the first focusable after the skip link.
**Acceptance.** Reachable only on first visit; no input; CTA reaches consent in one click.

### 8.1 Onboarding `/onboarding` (PRD M1.2)

Four steps in a focused column (640 px, centred vertically on laptop with a daylight backdrop at 100% height behind a paper panel; on mobile the panel is full-screen paper with a 120 px backdrop strip at top). StepDots at the top. One primary action per step.

| Step | Content | Rules | Primary |
|---|---|---|---|
| 1 Consent | H1 "Before we start". Notice text (section 3). Two required checkboxes: agree, 18 or older. | Both required; primary disabled until both ticked, with helper "Tick both boxes to continue." | (Continue →) |
| 2 Display name | Text input "Display name", helper "Any name or nickname. It stays on this device." | Required, 1 to 30 characters, no email/phone fields | (Continue →) |
| 3 Target schools | 1 to 3 `school` chips from the fixed list (names, with a 40 px thumbnail when an image exists); counter "2 of 3 chosen" | Min 1, max 3; 4th tap shows helper "You can choose up to 3." | (Continue →) |
| 4 Daily time | Chips 15, 30, 45, 60, 90 min, none preselected | Required | (Go to Today →) |

Secondary: ghost "Back" on steps 2 to 4. Event `consent_given` fires on step 1 continue, `onboarding_complete` on finish.
**States.** *Error:* inline field error (7.4). *Storage unavailable:* notice banner (Tech 8.7) above the panel. *Reset return:* starts at step 1 with empty fields.
**Laptop vs mobile.** Same card pattern; laptop shows the step as a 640 px panel, mobile as full-width.
**Acceptance (PRD).** Cannot reach Home without both boxes and a name.

### 8.2 Home `/` (PRD M5, with Tech flow decisions)

**Purpose.** Show the one thing to do today, how many days remain, a quiet quote, and personal progress.
**Entry.** Nav: Home; after onboarding.

```
Laptop 12-col bento (gutter 12)
┌───────────────────────────────────────────┬────────────┐
│ HERO / TODAY'S TASK (cols 1-8, 460 px)    │ DAYS TO CAT│ cols 9-12
│ backdrop (school image or daylight)       │  34        │
│                                           ├────────────┤
│ ┌────────────────────────────┐            │ QUOTE tile │
│ │ paper caption panel        │            │ (inset,    │
│ │ Today · 20 min             │            │ Newsreader)│
│ │ Add a mock analysis        │            ├────────────┤
│ │ Your last baseline… reason │            │ DAYS       │
│ │ (Start →)  Why this? ▾     │            │ PRACTISED 4│
│ │ Time: (15)(30)(45)(60)(90) │            └────────────┘
│ └────────────────────────────┘                          │
├───────────────────────────────────────────┴────────────┤
│ JOURNEY (cols 1-12): 5 nodes + "Days practised"        │
├──────────────────────────────┬─────────────────────────┤
│ RESUME card (only if in prog)│ FEEDBACK card (conditional)│
└──────────────────────────────┴─────────────────────────┘
Mobile: one column in this order: Demo/Sample banners · Hero task card (min-height 360, panel overlaps image bottom) · Days to CAT + Days practised side by side (2 tiles) · Quote · Journey (vertical) · Resume · Feedback.
```

**Today's task card [Doc: PRD 5.2].**
- Eyebrow: "Today · {duration} min" (caption).
- Title (`text.h1` at 28/34 inside the panel): the task name from the catalogue.
- Reason (`text.body`): one line from the template with real values.
- (Start →) primary-arrow. On mobile it is full width.
- Time chips (15, 30, 45, 60, 90): single-select, current = profile's daily time. Changing recomputes the task immediately; the card cross-fades over `--dur-base`.
- "Why this?" Expander listing the inputs used (e.g. "Baseline: done · Revision items waiting: 0 · Last mock: none in 7 days · Grade B share: n/a · Time available: 30 min").
- When no fit: reason reads "This is the shortest option for your {n} minutes." (PRD 5.4).

**Backdrop.** First target school's image if present, else `backdrop-day.jpg` (founder-supplied, picture 7 mood), else the sky fallback. Caption panel is solid surface (contrast guaranteed, 14.16:1). Attribution pill at bottom-right of the tile.
**Days to CAT tile.** Number in `text.display`, label "days to CAT", date "29 Nov 2026" small. Computed from `appClock.now()`. After CAT date: "CAT day has passed" in the same tile, no negative number.
**Quote tile.** `text.quote`, rotated by date, no author line unless the pack supplies one; no quote marks decoration.
**Resume card** (shown if baseline, round or mock entry is in progress): title "Pick up where you left off", line "{Baseline · Question 7 of 12}", (Resume →) secondary-arrow.
**Feedback card** (shown once baseline and ≥1 round are complete, until saved): "Tell us how this felt" + (Give feedback →) ghost. Quiet `inset` fill.
**Journey tile.** JourneyPath (7.21).
**Banners.** Demo banner and Sample banner at the top of the content when active.
**States.** *First run (new profile):* task = Baseline, journey all hollow with node 1 as "next", no Resume/Feedback cards, EmptyState-free. *In progress:* Resume card appears. *Complete (all milestones):* task per cascade; journey fully filled with "All five steps done." *Error:* config/content failure → notice banner and task card shows "We couldn't prepare today's task. Choose from Practice instead." with link. *Timeout:* n/a.
**Interactions.** Start navigates to the task's route and logs `task_started`. Time chip change does not navigate.
**Acceptance (PRD).** New profile shows Baseline; 15-minute chip changes the task or reason when needed; Why this? lists values.

### 8.3 Practice hub `/practice` (C-6)
Two Task-card variants (non-hero, surface): **Baseline** (12 questions · about 15 min · status: Not started / In progress / Done) and **Question selection** (Round 1, Round 2 · 5 min each · status). Each card: title, one line, status text, (Start/Resume/Review →). Mobile: stacked. Laptop: side by side. States: *in progress:* "Resume" primary-arrow; *done:* "Review" secondary. No new components.

### 8.4 Baseline `/practice/baseline` (PRD M2.1)

**States.** *Intro (first run):* focused column with H1 "Baseline", three lines (12 questions, about 15 minutes, skipping is fine; confidence is optional), the "Memory-based question" and SAMPLE explanation, (Start baseline →). *In progress:* question card. *Auto-submit:* see below. *Complete:* redirects to SWOT with `baseline_completed`.

```
Laptop (question with stimulus)
[ Question 3 of 12 · Memory-based · SAMPLE            (clock 12:40) ]   ← header strip
┌───────────────────────┬───────────────────────────────────────────┐
│ STIMULUS (inset panel)│ Stem (body-lg)                            │
│ passage or data set,  │ ( A ) option   ( B ) option               │
│ scrolls independently │ ( C ) option   ( D ) option               │
│ max-height 70 vh      │ [Confidence after answering:              │
│                       │  (Low)(Medium)(High)  optional]           │
├───────────────────────┴───────────────────────────────────────────┤
│ (Previous)  (Skip)   [question grid 1…12]            (Next →)     │
└───────────────────────────────────────────────────────────────────┘
Mobile: stimulus on top (collapsible "Show passage" expander if tall), stem and options below, footer sticky: Skip · Next →; Previous and the grid sit in a "Questions" sheet button at the top-right of the header strip.
```

- **Controls** [Doc]: option rows or a type-in field (TITA: input 52 px, numeric keypad hint `inputmode="decimal"`), Skip (secondary), Previous (secondary), Next (primary-arrow), QuestionGrid.
- **Confidence chips** appear after the user answers or skips, below the options, labelled "How sure did you feel? (optional)". Never blocks Next. Skipped questions can also take a confidence chip.
- **Last question:** Next becomes (Finish →) which opens a confirm modal if any question is unanswered: "Finish with {n} questions unanswered? You can still go back." (Finish) (Keep going).
- **Timer** shown top-right in the header strip, started on Start; expiry is wall-clock; focus time pauses on tab hide [Doc: PR-4].
- **Auto-submit state:** an inline notice banner at the top of the question card: "Time's up. Your answers are saved." Inputs lock, then a primary (See my profile →) appears. No penalty wording.
- **Resume:** after refresh, same question, correct remaining time. If expired while closed: lands on the auto-submit state.
- **Error:** content pack invalid → full-page notice (8.15). Storage failure → banner.
- **Reflection prompt** after completion, on the SWOT screen top: "What surprised you about how you worked through these?" (Newsreader).
- **Acceptance (PRD).** 12 questions reachable or timeout leads to SWOT; skip and blank confidence both work.

### 8.5 SWOT `/profile` tab "SWOT" (PRD M2.3)

```
[ My profile ]  [SWOT] [Settings and data]        ← Tabs
(info banner) Starter profile. It becomes more detailed as you use the app.
┌ Strengths ─────────────┐ ┌ Weaknesses ────────────┐
│ ● Algebra   QA         │ │ ■ Games and Tournaments│
│   Based on 2 questions…│ │   Based on 1 question… │
└────────────────────────┘ └────────────────────────┘
┌ Opportunities ─────────┐ ┌ Threats ───────────────┐
│ ◆ Para Jumble  VARC    │ │ ▲ Reading Comp.  VARC  │
│   …                    │ │   …                    │
└────────────────────────┘ └────────────────────────┘
[ Per-section summary: VARC · LRDI · QA   accuracy · avg time · skipped ]
Reflection: "Which pattern would you like to try differently this week?"
```

- Quadrants 2×2 from `lg`; stacked on mobile in the order Strengths, Opportunities, Weaknesses, Threats (gentlest reading order). Each quadrant header: shape icon (Strengths `Circle`, Opportunities `Diamond`, Weaknesses `Square`, Threats `Triangle`), title, one-line meaning (Strengths "Where you are steady", Opportunities "Where speed or choice can improve", Weaknesses "Where to look first", Threats "Where confidence and result differ").
- Each item row: pattern name (`text.body-strong`), section tag pill (caption), EvidenceLine (always visible). Items sorted by evidence count, then alphabetically.
- Per-section summary: three Summary cards (VARC, LRDI, QA) with accuracy ("3 of 4 correct"), average time ("avg 52 s"), skipped ("1 skipped"). **Never a percentage, score out of 100, or rank.**
- Info banner dismissible for the session; returns after new data until ≥10 questions of evidence exist [Assumption].
- **States.** *First run, no data:* each quadrant EmptyState ("Nothing here yet. This fills in as you practise.") and a primary (Start baseline →). *Little data:* items show "Early signal." in EvidenceLine. *Complete:* as drawn. *Recompute:* when new data is saved, the quadrant lists cross-fade over `--dur-base`.
- **Event:** `swot_viewed`.
- **Acceptance (PRD).** Every item shows its evidence and question count.

### 8.6 Question-selection rounds `/practice/rounds` (PRD M3)

**Round list (first run).** Two Task-card variants: Round 1, Round 2 (5 questions · 5 minutes · "Aim to solve 2 to 3 of these"). Status text per round. Memory-based and SAMPLE badges on the cards.

**Round workspace.**
```
Laptop (≥1024)
[ Round 1 · Aim to solve 2 to 3 of these                (clock 4:32) ]
┌───────────────────────┬──────────────────────────────────────────┐
│ 5 question tiles      │ ACTIVE QUESTION CARD                     │
│ ▢ Q1  Arithmetic      │ stem · options or type-in               │
│   2-line stem preview │ (Skip this one)                          │
│   state: Open         │                                          │
│ ▢ Q2 …  ▢ Q3 …        │                                          │
│ ▢ Q4 …  ▢ Q5 …        │                                          │
└───────────────────────┴──────────────────────────────────────────┘
Mobile: tiles stacked in an accordion; the open one expands inline (one at a time); the clock is sticky under the top bar.
```
- Tiles show question number, type (QA only), a 2-line stem preview, and a state label: *Not opened*, *Open*, *Answered*, *Skipped*. State = text + icon (`Circle`, `PencilLine`, `Check`, `Minus`), never colour only. All five visible at once [Doc].
- Switching tiles preserves typed answers; autosave on every change.
- Footer actions: (Skip this one) secondary; no Next/Previous (free order is the training purpose). (End round now) ghost opens a confirm modal; ending early is allowed.
- **Timer end:** at 0:00 inputs lock, banner "The round has ended. Your answers are saved.", then the reflection starts automatically after 2 s or on tap of (Continue →).
- **Locked state:** option rows 0.45 opacity, dashed; no text selection loss.

**Reflection (three steps, all skippable)** in the focused column with StepDots and a ghost (Skip this step):
1. *Selection review:* one row per question: "Q1 · Arithmetic" + radiogroup chips "Right call" / "Would rather not have attempted" (attempted only) / "Should have attempted" (left only).
2. *Confidence:* chips Low/Medium/High per attempted question.
3. *Strategy:* option rows (Easiest first, Skim then pick, Followed the order, Chose topics I like, Other with a 40-character note) then chips "Did it work?" Yes / Partly / No.
Primary (Next →), last step (See summary →). Prompt above step 1 in Newsreader: "What would you do the same next time?"

**Round summary** (Summary cards): Attempted n, Solved n, Average time. **Selection alignment** card with the sentence "You attempted 2 of the 3 questions rated easiest for this set." (info, no verdict, no colour). Neutral reflection line, then an Expander "Verified solutions" listing each solution with a "Verified" or "Not yet verified" text tag and the alternative method when present [Doc: BR-8]. Footer (Back to Practice) secondary and (Next: Round 2 →) primary if applicable.
**Events:** `round_started`, `round_completed`, `reflection_submitted`.
**States.** *First run:* list. *In progress:* workspace (resumes with remaining time). *Timeout:* as above. *Complete:* summary. *Empty:* if a round has no questions: notice "This round isn't available in the loaded content." *Error:* 8.15.
**Acceptance (PRD).** Round ends at 0:00 with data preserved; reflection can be skipped step by step; alignment matches stored picks.

### 8.7 Mock analysis `/mock` (PRD M4)

**Start (first run):** focused column: H1 "Mock analysis", two fields (Label, e.g. "Mock 1"; Date), (Start →), secondary (Load sample mock) with a SAMPLE badge. Empty list of past mocks shows EmptyState.
**Choose a section:** three large option rows VARC / LRDI / QA with default question count (24 / 22 / 22) and an editable number field (min 1, max 100, stepper). (Start section →).

**Entry card (one per question).**
```
[ VARC · Mock 1                                   7 of 22 recorded ]
[▮▮▮▮▮▮▮▯▯▯…  progress bar ]
┌ Q7 ───────────────────────────────────────────────────┐
│ Question type   [ Para Jumble ▾ ]  (Other → note)     │
│ What happened?                                         │
│ Step 1  (Attempted and correct)(Attempted and wrong)   │
│         (Left it, saw it)(Didn't get to see it)        │
│ Step 2  appears after Step 1:                          │
│   e.g. ( Solved it in no time ) ( Solved it but took a lot of time ) ( Guessed it )
│ Comment (optional)  [………………]  37 / 200                │
│   A short note about your own experience. Please don't paste the question.
│ Grade  ◆ B · Be a better test taker   [meaning line]   │
└────────────────────────────────────────────────────────┘
(Previous)  [question grid 1…22]  (Next →)       (Save section)
```
- Step 1 and Step 2 are `choice` chips (full-width stack on mobile). Step 2 options by Step 1 [Doc: PRD 4.3]:
  - Attempted and correct → Solved it in no time / Solved it but took a lot of time / Guessed it
  - Attempted and wrong → Wrong, but could solve / Wrong, cannot solve
  - Left it (saw it) → Could solve / Cannot solve
  - Didn't get to see it → Could solve / Cannot solve
- Changing Step 1 clears Step 2 and the grade chip returns to its empty state.
- The grade chip appears (with `role="status"`) as soon as the outcome is complete; the user never selects a letter.
- **No field accepts question text.** The only free text is the Comment (200 characters) and the "Other" note (40 characters). No paste of long text: the textarea has `maxlength` and the helper line. [Doc: BR-12]
- A card may stay unrecorded; it is hollow in the grid and excluded from counts.
- **Save section** (primary in the sticky footer) enabled once ≥1 recorded; after saving, a Summary card offers (Add another section) secondary and (Open summary →) primary. Event `mock_section_saved`.
- Autosave on every change; refresh restores the same card [Doc].
- **Mobile:** card fills width; footer sticky with Previous · Next; grid in a "Questions" sheet; Save section in the overflow area at the card bottom.
- **Reflection prompt** at the end of the summary: "Which one decision would you change in the next mock?"

**Mock summary `/mock` summary view.** Order top to bottom:
1. Grade counts overall: four BarRows (A to D) with shape + label + count.
2. Per section: three small grade-count rows (A B C D mini counts each with shape).
3. Focus list: ordered list of question types, each row with D, B, C counts as small shape+number groups, EvidenceLine "Based on {n} questions".
4. Reading lines [Doc]: "Eliminate the Ds: {types}" when D > 0; "Knowledge is there, decisions are the lever." when B is the largest non-A grade; "Exposure to more mocks raises knowledge and reduces C." when C is large.
5. Potential vs Actual (10.5).
**States.** *First run:* start screen. *In progress:* entry. *Complete:* summary. *Empty summary (no recorded questions):* EmptyState "Record at least one question to see your summary." *Little data:* counts show with "Early signal" in the evidence line; the focus list may have 1 row.
**Events:** `mock_section_started`, `mock_summary_viewed`.
**Acceptance (PRD).** All 9 combinations map correctly; no question-text input; BRD example gives 33/39/15/87.

### 8.8 Revision `/revision` (PRD M6)

Tabs: **Due today** · **Upcoming** · **Add**.
- **Due today:** Entry-card list. Each: topic, section tag, step "2 of 4", state text ("Due today" or "Waiting for you"), buttons (Reviewed) primary, (Need more time) secondary. After the last interval: "Revision cycle complete" with `Check`. EmptyState when none.
- **Upcoming:** next 7 days as a vertical list grouped by date (date heading, then topic + step). Empty: "Nothing scheduled in the next 7 days."
- **Add:** Fields: Topic or chapter (text, 60 characters), Section (select, optional), Notes created on (date, default today). (Add to plan →). Success toast "Added. Four reminders scheduled." and focus returns to the list.
- **Demo tools** are not on this screen; a ghost link "Demo tools" opens the Profile settings tab. [Doc: panel lives in Profile]
- **Mobile:** tabs scroll horizontally if needed; buttons full width inside cards.
- **Events:** `revision_item_added`, `revision_marked`.
- **Acceptance (PRD).** Exactly four dates; Reviewed advances; Need more time returns next day; nothing is described with guilt wording.

### 8.9 Words: passage session `/words/read` (PRD M7.1)

Entry from Words tab or Home task. Focused column 680 px.
```
[ Passage title                       Source · Licence ]  [clock 6:00]  [SAMPLE]
Chosen words: 4 of 30  (helper) Tap a word you don't know to add it.
SelectableText (body-lg, 18/28 for readability, max-width 68ch)
(End session)
```
- Timer from `estReadMinutes`; at the end: banner "The session has ended. Your words are saved." (no penalty). Selection locks.
- Source and licence always visible (caption under the title) [Doc: BR-15].
- Selecting: tap/click toggles; keyboard Enter/Space toggles.
- **States.** *First run:* intro line + (Start reading →). *In progress:* as drawn. *Complete:* summary "You chose 5 words." (See My words →). *Empty passage pack:* notice "No passage is available today." *Error:* 8.15.
- Event: `passage_session_completed`, `word_added`.

### 8.10 My Words `/words` (PRD M7.2)
Header (My words) with filter chips: All · Still learning · Got it, counts in chip text. Grid of Word cards: 1 column mobile, 2 columns `md`, 3 `lg`.
- **Front:** the word (`text.h2`), small hint "Tap to flip".
- **Back:** Meaning, Synonym, Antonym, Usage (each a small labelled row), and "From: {passage title}". If `contentState=pending`: "Meaning not available in this prototype yet." and a SAMPLE badge on available sample cards.
- Buttons under each card (outside the flip target): (Got it) primary-small, (Still learning) secondary-small. Selected status shows a `Check` and text.
- (Practise →) primary at the top: cycles "Still learning" cards in random order, one card at a time in the focused column, same two buttons, progress text "Card 3 of 8". Ends with "That's the set for now." and (Back to My words).
- **States.** *Empty:* EmptyState. *Practise with 0 cards:* disabled button + helper "Add words from a passage first." *Error:* none specific.
- Event: `card_flipped`.

### 8.11 OMET `/omet` (PRD M8.1)
Focused column. H1 "OMET". A two-row **progression** component (Summary cards in a row): "CAT · Active" with a `Check`, "OMET · Coming soon" with `Hourglass`, joined by a 2 px line (laptop horizontal, mobile vertical) to show progress towards OMET (BO-4). Body: "OMET-specific content is coming soon. Everything you build here for CAT carries over." No exam names. One ghost link "Tell us what OMET prep you'd want" → `/feedback`.
Event: `omet_teaser_viewed`. States: static. Acceptance: reachable in one click, names no exam.

### 8.12 Feedback `/feedback` (PRD M8.2, Tech 12.3)

Focused column. H1 "Feedback". Reminder banner `info`: "Your answers are anonymous. Please don't type personal details."
Sections (one Summary card each, stacked):
1. **Two ratings** (1 to 5 radio chips "1 Not at all" … "5 Very"): "This helped me think about strategy." and "The app felt supportive, not stressful."
2. **Five questions** (textareas, 280 characters each, counter): most and least useful feature; whether SWOT or matrix told you something new; anything stressful, competitive or distracting; what would make daily use possible for the last 30 days; what is missing for OMET.
3. **Which features would you use again?** multi-select chips F1 to F6 using user-facing names: Baseline & profile, Question selection, Mock analysis, Revision reminders, Today's task, My words.
Primary (Save feedback →). After saving: **Send to the team** card appears:
```
┌ Send to the team ─────────────────────────────────────┐
│ Send it to: {team contact from config}                │
│ Preview (inset panel, scrollable, monospace-free):    │
│  ratings · answers · features · session summary       │
│  "This does not include your name."                   │
│ (Share)* (Copy) (Download)       * only where supported│
└───────────────────────────────────────────────────────┘
```
- Preview shows exactly what will be shared; display name never appears. Copy → toast "Copied". Share uses the native sheet. Download saves a file (laptop/moderator).
- Until the contact is set: "Send it to the team that gave you this link." [Doc: Tech 12.4].
- Also reachable from Profile → Settings and data → "Send to the team".
- **States.** *First run:* form. *In progress:* form (autosave drafts locally). *Complete:* "Saved" + Send card. *Error:* "That didn't save. Please try again." *Share unsupported:* Share button hidden, Copy and Download remain.
- Events: `feedback_submitted`.

### 8.13 Profile settings tab (`/profile` → Settings and data)
Summary cards: **Your details** (display name, target schools, daily time; edit in place with the same fields), **Data on this device** (plain explanation, (Reset my data) quiet-danger, (Start new session) secondary), **Demo tools** (see 8.14), **Send to the team** link to 8.12.
Reset my data and Start new session each open the confirm modal; confirming wipes `lmp.v1.*`, issues a new session ID and routes to `/welcome`. Modal copy in section 3. Both always reachable. [Doc: PRD 1.2, Tech 8.6]

### 8.14 Demo tools (inside Profile → Settings and data)
A Summary card with a persistent **Simulation** badge and the helper "This changes the app's date so you can see how reminders behave. It does not change timers." Controls: number stepper "Jump to day" (−30 to +60) with (Apply), and (Back to today). When active, the Demo banner appears everywhere and a Demo date chip in the sidebar footer. Use logs `demo_date_jumped`.
Also on this card: "Load sample mock" is **not** here (it lives in Mock start).

### 8.15 System states (global)
- **Content validation error** (PRD 1.6): a full-page notice, no nav: H1 "Content couldn't load", the string "We couldn't load {file}. {field} needs attention.", ghost (Try again). Plain, not alarming.
- **Storage unavailable banner:** notice banner (section 7.13) with "Progress cannot be saved in this browser mode."
- **404 / unknown hash route:** EmptyState "We couldn't find that page." (Go to Today →).
- **Not found data (stale id):** same as 404 inside the page area.

---

## 9. Key flows

**Tester journey (end to end).**
1. Open link → Landing `/welcome` → (Get started).
2. Consent step: read notice, tick two boxes → name → 1 to 3 schools → daily time → Home.
3. Home shows Baseline as today's task → (Start) → Baseline intro → answer/skip 12 questions (timer on) → Finish (decision: unanswered? confirm) → SWOT with reflection prompt.
4. Home now recommends per cascade; user opens Practice → Round 1 → five tiles visible, attempts some within 5:00 → reflection (skippable) → summary.
5. Mock → Load sample mock or start own → section → entry cards → Save section → Summary with Potential vs Actual.
6. Revision → Add topic → Profile → Demo tools → Jump to day 3 → Due today shows it → Reviewed.
7. Words → passage session → words become cards → flip → Got it / Still learning.
8. Home feedback card (after baseline + 1 round) → Feedback → Save → Send to the team (Share/Copy/Download).
9. Moderated device: Profile → Start new session → Landing.

**Module flows**

| Module | Flow |
|---|---|
| Baseline | Intro → Q1 → (answer or Skip) → optional confidence → Next … Q12 → Finish (confirm if gaps) → SWOT. Branches: timer expiry → auto-submit state; refresh → resume. |
| Rounds | List → open round → free switching among 5 tiles → timer 0:00 or End round → reflection step 1 → 2 → 3 (each skippable) → summary → solutions. |
| Mock | Start → section → cards (Step 1 → Step 2 → grade chip) → Save section → add another or summary. |
| Revision | Add → schedule created → Due today → Reviewed (advance) or Need more time (return next day) → complete. |
| Words | Passage session → select words → end → cards → flip → status → Practise. |
| Feedback | Form → Save → Send to the team → Share/Copy/Download. |

---

## 10. Data visualisation specifications

No charting library; everything is CSS or SVG. [Doc: Tech 5]

### 10.1 SWOT quadrants
Encoding: position (quadrant) + shape icon + title; each item has an EvidenceLine. Readable without colour (shape and title carry it). Little data: one or two items per quadrant with "Early signal." EvidenceLine; empty quadrants show EmptyState text.

### 10.2 Grade counts (overall and per section)
Overall: four BarRows (A to D). Bar length = count / max count. Each row = shape + letter + label + number. Colour is the grade fg at fill; the number and label make the colour redundant. Zero counts show "0" with an empty track. Per-section: a compact row "A 7 · B 4 · C 8 · D 5" where each token is shape + letter + number, in three stacked Summary cards (VARC, LRDI, QA). With very little data (<3 recorded): show counts only and the text "Early signal."

### 10.3 Focus list
Ordered list (not a chart) of question types, sorted by D, then B, then C count. Each row: rank number is **not** shown; use a bullet. Row shows type + section tag + three small shape+number groups (D, B, C) + EvidenceLine. No bars. Max 5 rows with (Show all) ghost. Empty: "Record a few more questions to see your focus list."

### 10.4 Potential vs Actual
Two Stat tiles side by side (stacked on mobile):
- **Potential**: number in `text.display` (e.g. 87), label "Potential" and directly beneath it, always visible in `text.small` muted, the verbatim BR-14 sentence. Per-section potentials (33, 39, 15) listed as three lines "VARC 33 · LRDI 39 · QA 15".
- **Actual** (optional): numeric inputs per section (integers, min −questions, max 3 × questions, label "Your actual score, if you have it"). Display only when entered.
- When both exist: a connector line "Gap to work on: {potential − actual}" in `text.h3`, never described as a target.
- Without Actual: tile shows "Add your actual score to see the gap" ghost link.
- Never coloured as good/bad; never a progress ring; no "out of 100".

### 10.5 Journey indicator
JourneyPath (7.21). Few data: first node "next", others hollow. All five filled: "All five steps done." No percentage.

### 10.6 Countdown
Two forms: timer pill (7.10) for sessions; "Days to CAT" Stat tile (number + date). Both are text-first, update on the minute/second only.

---

## 11. Imagery, icons and the moodboard

### 11.1 Assets and licences

| Asset family | Source | Licence | Notes |
|---|---|---|---|
| Manrope (variable) | Google Fonts / upstream repo | SIL OFL 1.1 | Self-hosted `.woff2` |
| Newsreader (variable) | Google Fonts / upstream repo | SIL OFL 1.1 | Self-hosted `.woff2`, roman + italic |
| lucide-react icons | npm (approved) | ISC | Only icon source |
| Landing/Home daylight backdrop | **Founders to supply** (picture 7 mood) | Must be licensed or founder-owned; record in `schools.json`-style metadata | See 11.2 |
| School images | **Founders to supply** | Official or licensed only [Doc: BR-7]; licence + attribution + source in `schools.json` | See 11.2 |

Fallback is the sky gradient (5.4) so the build works with no images.

### 11.2 Moodboard tile spec
- **Aspect and size:** min-height 460 px laptop hero tile, 360 px mobile, `object-fit: cover`, focal point `object-position: 50% 40%`. Images exported at 1600 px wide, JPEG quality ~80, ≤300 KB each (founder note).
- **Text never sits directly on the photograph.** The Today caption panel and the quote tile are solid `--color-surface` and `--color-inset` panels. This guarantees contrast whatever photo is supplied (14.16:1 for ink on surface). No blur or frosted effect anywhere.
- **Panel placement:** bottom-left, 24 px inset, max-width 480 px laptop; full width minus 16 px margins on mobile with a −32 px overlap onto the image.
- **Overlay:** only used if an image is very dark/bright behind the *attribution* pill (which is itself a solid surface pill). No gradient scrim over the photo.
- **Attribution:** `text.caption` solid surface pill at bottom-right: "Photo: {attribution} · {licence}". Source URL as a link inside. Required when an image is shown [Doc: BR-7].
- **Fallback:** `--sky-fallback` gradient with no text artefacts; identical layout. Used when the image is missing, fails to load, or `moodboardImages` is off.
- **No image upload** by users [Doc].
- **Landing/Onboarding:** use the daylight backdrop (not a school image). Home hero uses the first target school's image when present, else the daylight backdrop.
- **Quote:** `text.quote`, rotated by date from `quotes.json`; no attribution line unless provided.

### 11.3 Contrast rules for imagery
Any text must be on a solid panel (surface, inset, or scrim). Never place text over an image without a panel. Panel colours are limited to the tokens in 5.1; contrast table in 5.1 applies.

### 11.4 Icons
lucide-react only, stroke 1.75 px, 20 px default, 24 px in nav. Icons never carry meaning alone; each has adjacent text or `aria-label`. Filled shapes for grades use `fill="currentColor"`.

---

## 12. Motion and feedback

| Item | Spec |
|---|---|
| Page/card transition | Cross-fade + 8 px upward translate, `--dur-base`, `--ease-out`. Between questions: outgoing fades 120 ms, incoming fades+rises 200 ms. |
| Button | Hover/active per 7.1, `--dur-fast`. |
| Chip select | Border + fill change `--dur-fast`; check icon appears instantly. |
| Flip card | `rotateY` 180° over `--dur-slow`; reduced motion: cross-fade 120 ms. |
| Expander | Height animates `--dur-base`; reduced motion: none. |
| Journey node | When a node completes, the check appears with a 200 ms fade only. No pulse, confetti or sound. |
| Timer | Updates once per second; no flash; no colour shift; no sound. Expiry: text change only. |
| Toast | Fade in 120 ms, out 200 ms. |
| Loading | Skeleton blocks static under reduced motion; otherwise a very slow 1.6 s opacity pulse between 0.6 and 1.0. |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` removes all transforms and animations; keeps instant state changes. |

---

## 13. Accessibility specification

**Global.** Skip link "Skip to main content" first in tab order. `<html lang="en">`. One `<h1>` per page, no skipped heading levels. Landmarks: `<header>` (mobile top bar), `<nav aria-label="Main">`, `<main>`, `<footer>` (Landing only). Focus ring 2 px accent-strong, 2 px offset, visible on every control. Touch targets ≥44×44 px. Text contrast ≥ AA; ratios in 5.1 [Verified by calculation, not by an audit tool]. Meaning never by colour alone: grades = shape + letter + label; grid and tile states = icon + text; selected = border weight + check.

**Keyboard order and focus management**

| Screen | Order | Notes |
|---|---|---|
| Landing | Skip link → wordmark → Prototype tag → CTA | Focus starts at the document top; nothing is auto-focused. |
| Onboarding | Skip link → StepDots (not focusable) → fields → primary → Back | On step change, focus moves to the step's `<h1>` (`tabindex="-1"`). |
| Home | Skip → nav → hero panel (Start, time chips, Why this?) → stat tiles → journey (not focusable) → Resume → Feedback | Changing a time chip announces the new task via a polite live region. |
| Baseline | Skip → header (Questions button on mobile) → stimulus (scrollable region `tabindex="0"`, labelled) → options → confidence chips → Previous → Skip → grid → Next | On Next/Previous, focus moves to the question number heading. Arrow keys move within option group. |
| Rounds | Skip → timer (not focusable) → tiles (list of buttons) → active card → Skip this one → End round | Opening a tile moves focus to its stem heading; Esc does nothing. |
| Mock entry | Skip → progress → type select → Step 1 chips → Step 2 chips → comment → Previous → grid → Next → Save section | Grade chip is announced once via `role="status"` when it appears. |
| Revision | Tabs (arrow keys) → items → Reviewed → Need more time | Focus stays on the list after an action; toast announces. |
| Words | Filters → Practise → cards (button) → Got it → Still learning | Flip toggles `aria-pressed`. |
| Feedback | Banner → ratings → textareas → features → Save → Send card | After save, focus moves to the Send card heading. |
| Modals | Focus to title → controls → trap → Esc closes → return to trigger | Native `<dialog>`. |

**Screen-reader notes.** Timers: ticking digits `aria-hidden`; polite announcements at 5 min, 1 min, and end only. Grades: `aria-label` with full label and meaning. Progress: `aria-valuetext` equals visible text. Word selection: each word `aria-pressed`; a polite count "4 of 30 words chosen" updates on change. Form errors: `aria-invalid` + `aria-describedby`, error summary announced at the top of long forms. Images: decorative backdrops `alt=""`; school thumbnails `alt="{school name} campus"` when meaningful.

**Pointer vs touch.** Hover styles only under `@media (hover: hover)`. No hover-only information. Long text inputs use 16 px to avoid iOS zoom.

**Verification note.** Not yet audited with axe or a screen reader. The QA checklist (16) includes the checks the developer should run.

---

## 14. Responsive behaviour

| Breakpoint | Rules |
|---|---|
| 360 to 479 | Single column; 16 px margins; bottom bar + 56 px top bar; question footer sticky; stimulus collapsible; grids become sheets; chips wrap; buttons full width in cards; JourneyPath vertical. |
| 480 to 767 | As above; word cards 2 columns from 640; time chips in one row. |
| 768 to 1023 | 6-column bento; focused column 640 px; bottom bar still used; SWOT 2×2 from 900 px. |
| ≥1024 | Sidebar 248 px; 12-column bento; stimulus + question split view; Rounds master-detail; JourneyPath horizontal; feedback card side by side with Resume. |
| ≥1280 | Container max 1120; no further changes. |

**Pointer vs touch.** Pointer: hover states, tooltips none, drag none. Touch: tap targets enlarged, grids in sheets, swipe not required for any action.
**Reorders.** Home: Quote before Journey on mobile; Days to CAT and Days practised pair in a 2-tile row. **Collapses.** Stimulus panel, solution Expanders, question grid (mobile sheet), More menu.

---

## 15. Implementation notes

**Mapping to Tech Architecture.** Tokens live in `src/styles/tokens.css` and map to Tailwind v4 `@theme`. Components map to `src/ui/` (Button, Chip, Badge, Field, Select, OptionRow, Card, Banner, Modal, Toast, Tabs, ProgressBar, Timer, GradeChip, EvidenceLine, QuestionGrid, Expander, EmptyState, BarRow, MoodboardTile, StatTile) with the existing `Card, Chip, GradeChip, Timer, SampleBadge, DemoBanner, EmptyState` names retained; add the rest. Navigation items and "More" grouping come from `app.json`. Brand name and wordmark come from `app.json` (`brand`).
**Build order.** (1) tokens.css + fonts + Tailwind theme; (2) Button, Chip, Badge, Field, Select, Card, Banner, Modal, Toast, Tabs; (3) Nav + layout shell + Landing + Onboarding; (4) Question card, OptionRow, Timer, QuestionGrid, GradeChip, EvidenceLine, BarRow, ProgressBar; (5) Screens in PRD priority: Baseline + SWOT, Rounds, Mock, Home (hero + journey), then Revision, Words, OMET, Feedback, Demo tools.
**Cut order if time runs short** (PRD-aligned, with design additions): 1 F6 Words (hide route via feature switch); 2 F4 Revision; 3 school images (fall back to sky gradient); 4 flip animation (use instant swap); 5 Landing section is kept but may drop the three Strategy/Fun/Wellness pills; 6 Home JourneyPath simplified to a text list; **never cut** F1, F2, F3, F5, consent, Reset, SAMPLE/Memory-based labels.
**Must not be improvised.** Grade shapes and labels; the BR-14 sentence verbatim; the 200-character comment limit and helper; the Memory-based and SAMPLE badges; no red anywhere; solid text panels over photographs (no frosted glass); the mock outcome step lists; no percentages, no scores out of 100, no streaks; forbidden-word list.
**Fonts.** Place `Manrope-Variable.woff2`, `Newsreader-Variable.woff2`, `Newsreader-Italic-Variable.woff2` in `public/fonts/`; `@font-face` with `font-display: swap`; preload Manrope. No npm font package, so approval item A4 is unaffected.
**Landing route.** Add `/welcome` to the router and make it the route guard's redirect target for first-time users.

---

## 16. Design QA checklist

- [ ] Every colour is a token; no raw hex in components.
- [ ] Manrope and Newsreader load from `public/fonts/`; no network font requests.
- [ ] Newsreader appears only in quotes and reflection prompts.
- [ ] No red appears anywhere (grep for red hues in CSS).
- [ ] Every page has exactly one primary (ink pill) button.
- [ ] Grade chips show shape + letter + label; check in greyscale.
- [ ] Mock entry has no field for question text; Comment capped at 200 with the helper line.
- [ ] Memory-based badge on every question; SAMPLE badge on every sample item when `meta.sample` is true.
- [ ] Demo banner shows when the offset is non-zero; "Simulation" badge in Demo tools.
- [ ] BR-14 sentence present verbatim under Potential score.
- [ ] No percentage, no "out of 100", no rank, badge, streak or leaderboard anywhere.
- [ ] Forbidden-word lint passes on `copy.json` and content.
- [ ] Text on photographs always sits on a solid panel; attribution pill present.
- [ ] Missing image falls back to the sky gradient with the same layout.
- [ ] Timer updates once per second, no flash, announces only at 5 min, 1 min, end.
- [ ] All touch targets ≥44 px; no horizontal scroll at 360 px.
- [ ] Keyboard-only run completes onboarding, baseline, a round, a mock section and feedback.
- [ ] Focus ring visible on every control; focus moves correctly in modals and on step changes.
- [ ] Reduced motion removes transforms and animations.
- [ ] Landing, Onboarding and Home hero use the daylight backdrop; working screens are plain paper.
- [ ] Reset my data and Start new session each ask for confirmation and return to Landing.
- [ ] Screenshots at 360 px and laptop width for every new screen (Tech 15.2).

---

## 17. Design-raised gaps and open questions

**Decisions for you (do not block the build)**

| ID | Item | My recommendation |
|---|---|---|
| G-1 | Landing page is not in the PRD. | Keep it as designed (one extra static route). PM to add it and make `/welcome` the route-guard target. |
| G-2 | Grade D is labelled "Red flag" (BRD-confirmed). The phrase can feel alarming to an anxious user. | Keep the label for faithfulness to the sheet; consider "Needs attention first" in Phase 2. Styling is already muted plum, no red. |
| G-3 | Resume card, Home feedback card and "Send to the team" are in Tech Architecture but not the PRD. | PM to add them to the PRD. |
| G-4 | Practice hub screen is implied but not defined (C-6). | Keep the two-card hub. |
| G-5 | Starter-profile banner stays until ~10 questions of evidence exist. | Accept as assumption; tune after testing. |
| G-6 | Consent wording (Tech 12.6) awaits PM adoption. | Use it as written. |
| G-7 | Product name and logo are placeholders. | Wordmark "Last Mile" in Manrope 700; swap via `brand` in `app.json`. |
| G-8 | Backdrop and school images: founders to supply; specs in 11.2. | Supply 1600 px JPEGs ≤300 KB with licence and attribution. |
| G-9 | "Send it to" contact still missing (Tech 12.4). | Provide one email or WhatsApp number. |

**Blockers:** none for the build; the app runs on sky-gradient fallbacks until images arrive.

---

## 18. Decision log

| # | Decision | Rationale | Alternatives | Consequence for the build |
|---|---|---|---|---|
| D-1 | Direction "Daylight Paper": Option B mood + Option A structure | Founder choice; daylight feels lighter for a night-time, anxious user than a dark hero | Option A (dark hero), Option B (frosted panels) | Daylight backdrop on Landing/Onboarding/Home hero only; working screens paper |
| D-2 | Solid paper caption panels over photos | Guarantees contrast whatever image is supplied; avoids glassmorphism | Frosted blur, gradient scrim | No blur dependency; simpler CSS; contrast table holds |
| D-3 | Picture 6 (hands/light beam) not used | Reads as synthetic; conflicts with "not obviously AI-generated"; licensing risk | Use as backdrop | Only picture 7 mood is used; founder-supplied licensed images only |
| D-4 | One accent colour: sky blue-grey `#657E8E` (never for text), `#3F5766` for text | Calm, matches picture 7; passes contrast for text variant | Sand accent from picture 5 | Two accent tokens; accent fill used only for bars/underlines |
| D-5 | No red anywhere; grades use muted green, blue, amber, plum + shapes | Calm principle; accessibility (no colour-only cues) | Traffic-light colours | Grade shapes mandatory; errors use amber notice style |
| D-6 | Manrope + Newsreader self-hosted | Distinct from system fonts; Manrope near ESTATES; OFL, free | System fonts, Inter | Font files in `public/fonts/`; no npm change |
| D-7 | Master-detail for Rounds on laptop, accordion on mobile | All five questions visible, free order, minimal new components | Five stacked full cards | Question tile pattern (reuse Card) |
| D-8 | Native `<select>`, `<dialog>`, `<details>` | Accessibility and reliability on mobile; less code in one day | Custom dropdown/modal | Fewer bugs, styling constraints accepted |
| D-9 | Solid sidebar everywhere; no translucency | Calm and consistent; avoids contrast issues | Translucent over backdrop | Simpler CSS |
| D-10 | Grade chips use shape + letter + label | Meets non-colour requirement | Colour only; letter only | Lucide `Circle/Diamond/Triangle/Square` filled |
| D-11 | Potential score label always visible beneath the number | Honest-progress rule BR-14 | Tooltip or footnote | Fixed layout for Potential tile |
| D-12 | JourneyPath has no streaks or badges | BR-4, PRD 5.6 | Streak counter | "Days practised" plain count only |
| D-13 | Dark mode not built; tokens are semantic | Not in PRD; time | Build dark now | Tokens ready for later |
| D-14 | Landing is one static page with one CTA | Founder wants it beautiful; stays within one-day build | Multi-section marketing page | One extra route; no new components beyond MoodboardTile |
