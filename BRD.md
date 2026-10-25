# BRD: Last-Mile Prep App for CAT and OMET Aspirants

**Document owner:** Claude (Supervisor)
**Version:** 1.0 (final, ready for founder sign-off and handoff to the Product Manager)
**Phase covered:** Phase 1 (user-testing prototype); Phase 2 noted at a high level only
**Intended repository path:** `/BRD.md`
**Document state:** Proposed update (not yet transferred to the project folder)

**Status labels used in this document**
- **[Confirmed]** stated or approved directly by the stakeholders.
- **[Derived]** taken from a stakeholder-supplied artefact (the mock-analysis spreadsheet) by analysis.
- **[Stakeholder-stated, unverified]** stated by the stakeholders but not independently verified (for example legal points).
- **[Assumption]** proposed by Claude, pending approval.
- **[Open]** unresolved; needs a decision.

**Changes since v0.1:** content decision accepted (R-1); success criteria approved (section 9); word dictionary defined (F6); dates confirmed; the mock-analysis matrix, grading logic and Potential Score formula derived from the supplied spreadsheet (F3, Appendix A); OMET teaser wording confirmed.

---

## 1. Stakeholders

| Role | Name | Notes |
|---|---|---|
| Founder / approver | Aneesh Mahapatra | [Confirmed] |
| Founder / approver | Stuti Prajna Patra | [Confirmed] |
| Founder / approver | Pratosh Ramji | [Confirmed] |

- Primary user role: **Aspirant** (the only role in the product). [Confirmed]
- The sponsoring company has an existing background in MBA interview and placement preparation, with current MBA student volunteers and alumni volunteers who could act as guides. [Confirmed] Mentors and alumni are **not** part of the Phase 1 prototype (vision only). [Assumption]
- Upstream document owners: the Senior Product Manager supplies the PRD and the Senior UI/UX Designer supplies the Design document (per the project operating model).

---

## 2. Business Overview

### 2.1 Product summary [Confirmed]
A web-first application (desktop and mobile browsers) that provides **last-mile preparation** for CAT and, over time, OMET aspirants (other MBA entrance tests). It does not teach concepts. It helps aspirants polish and prepare for exam day through three pillars:

1. **Strategy:** build exam strategy, timing, question selection and composure from the user's own observable performance.
2. **Fun:** non-guilty, non-distracting activities that prepare the user indirectly.
3. **Wellness:** learning-focused rather than winning-focused practice that maximises calm and reduces stress.

### 2.2 Problem being addressed [Confirmed]
CAT and OMETs require more than knowledge: strategy, timing, question selection and composure matter. Existing tools are question banks (coaching portals) or generic flashcard and quiz apps. None offers curated, personalised, last-mile strategy and wellness support for MBA entrance aspirants.

### 2.3 Timing [Confirmed]
- The app launches with roughly **30 days remaining to CAT**.
- Phase 1 contains **CAT-relevant features only**, with a visible progression towards OMETs.
- **Build date:** 26 October 2026 (today). **Review buffer:** 27 October 2026. [Confirmed]

### 2.4 Competitive landscape [Confirmed]
- **Lateral competitors:** coaching portals (IMS, TIME, Rodha, etc.), which are primarily question banks.
- **Partial feature overlap:** Anki, Quizlet (not CAT-specific, not curated).
- **Duel apps (for example Matiks):** richer interfaces, but not focused on management-entrance aspirants.
- **Differentiator:** personalised, performance-driven strategy and wellness for CAT/OMET aspirants, backed by an organisation with existing MBA interview and placement preparation experience.

---

## 3. Business Objectives

| ID | Objective | Status |
|---|---|---|
| BO-1 | Validate, through user testing, that aspirants find the strategy-plus-wellness approach valuable. | [Confirmed] |
| BO-2 | Collect structured user feedback to guide full product development. | [Confirmed] |
| BO-3 | Demonstrate the core user journeys across the prototype's feature areas. | [Confirmed] |
| BO-4 | Show a clear progression towards OMET support. | [Confirmed] |

---

## 4. Guiding Principles [Confirmed]

1. **Personalised from observable performance.** No generic advice.
2. **Strategy matters as much as knowledge.** Timing, question selection and composure are first-class.
3. **Gamification without hyper-competition.** It should make preparation feel lighter, not turn it into a race.
4. **It's about the user, not the competition.** The app is about the user's own journey and best attainable result.
5. **Last-mile polishing, not concept teaching.**
6. **Honest progress indicators.** No percentile guarantees. The promise is improved performance, not a specific outcome.

---

## 5. Scope

### 5.1 In scope for Phase 1 (prototype)

Priority order [Confirmed]: F1, F2, F3 and F5 first; F4 and F6 may be lighter versions.

#### F1. Baseline test and SWOT profile (Priority: Must)
- A short baseline test using questions of varying difficulty.
- Produces a **starting SWOT profile**, which becomes more detailed with continued use.
- Builds a performance profile **by question pattern**, capturing accuracy, typical time, skipped questions and confidence.
- Helps users recognise their own strengths without relying only on universal easy/moderate/hard labels.
- **Content decision [Confirmed]:** the baseline uses **past-year-style questions presented as memory-based questions**. The stakeholders have accepted the associated risk (see R-1).

#### F2. Question-selection practice (Priority: Must; Quants section only)
- A set of questions is shown for a limited time that allows only a few to be solved (for example, 5 questions in about 5 minutes, with a goal of solving 2 to 3 depending on difficulty).
- Purpose: put the user on the spot and train them to **choose the questions they can solve most easily**.
- After the round, the user is asked:
  - Which questions they would rather **not** have attempted, or should have attempted.
  - Their **confidence level** for each question attempted.
  - Which **strategy** they used, and whether it worked.

#### F3. Mock analysis (Priority: Must)
Replaces the manual mock-analysis process. The user records, per question, what happened and whether they could have solved it. The app derives a grade on a **Judgement × Knowledge matrix** and summarises the result. **The app never captures the question text**; it records only user feedback. [Confirmed]

**Definitions** [Confirmed]
- **Judgement** = the ability to choose the right question to attempt.
- **Knowledge** = the ability to solve the question.

**Grades** [Confirmed, from the stakeholder's reference image and sheet]

| Grade | Label | Judgement | Knowledge | Meaning |
|---|---|---|---|---|
| A | Your strength | Good | Good | Strong area. |
| B | Be a better test taker | Bad | Good | The user had the knowledge but made a poor decision. |
| C | Luck or great decision | Good | Bad | A good decision (or luck) without solid knowledge. |
| D | Red flag | Bad | Bad | Both weak. |

**Goals the analysis must support** [Confirmed]
1. Eliminate D's completely, meaning accurately identify questions where knowledge and judgement are both weak.
2. Reduce B's (knowledge present, judgement poor).
3. Raise knowledge through exposure to mock tests, which indirectly reduces C's.

**Reference logic derived from the supplied spreadsheet** [Derived] (full detail in Appendix A)
- Each question gets exactly one of **nine outcomes**, and each outcome maps to one grade.
- Questions are organised by **section (VARC, LRDI, QA)**, serial number, **question type or topic**, and an optional **free-text comment**.
- The sheet shows grade counts overall and per section.
- **Potential Score = 3 × (A + B) for each section, summed across sections.**
- A separate hand-entered "actual score" per section is shown beside it, so the gap between the two is visible.

The input style (the user picks A to D directly, versus picking one of the nine outcomes and the app deriving the grade) is a PRD-level decision. **Recommendation:** use the nine-outcome input and derive the grade, because it removes ambiguity about what each letter means. [Assumption]

#### F4. Spaced-repetition reminders (Priority: Lighter version)
- The user records the chapters and topics for which they have created formula notebooks or reference notes (for example, Profit and Loss).
- The app generates a **revision plan** at spaced intervals (example given: Day 1, Day 3, Day 9, Day 18, and so on) and shows what is due on each day.
- Reminders are an **in-app "due today" list** only. No email, push or WhatsApp notifications in Phase 1. [Confirmed]
- The exact interval series is an assumption to be fixed in the PRD, using the stakeholder's example as the starting point. [Assumption]

#### F5. Today's recommended task and moodboard (Priority: Must)
- Shows **one recommended task for today**, with its **duration** and the **reason** it was chosen.
- Adjusts to the **time the user has available**.
- Draws on all activity across the app.
- **Personal moodboard:** a dashboard background inspired by the user's **target B-school**, plus restrained motivational quotes. Imagery must be **official or licensed only**.

#### F6. Personal word dictionary (Priority: Lighter version) [Confirmed]
- Each day there is an **assigned reading passage**, read in a **timed session**. Passages are sourced from **open-source reading material**, which the stakeholders will provide.
- While reading, the user **selects words they do not understand**.
- Selected words appear later in a **personal word dictionary as cards**.
- Tapping a card **flips it** to show the **meaning, synonym, antonym and usage**.
- The user can practise these words, so practice is relevant and personalised to what they did not know.
- Content for the flip-card fields (meaning, synonym, antonym, usage) needs a source; see OQ-3.

#### F7. Supporting elements
- **Dummy login** with no real authentication. [Confirmed]
- **Sample data** and minimal personal data. [Confirmed]
- **OMET teaser screen** saying that OMET-specific content is coming soon (no specific exams named). [Confirmed]
- **Gamification** limited to personal progress (for example a personal journey or consistency indicators). Forms are an assumption; the confirmed rule is that there are **no leaderboards or rankings**.
- **Feedback capture** for user testing (form or link). [Assumption]

### 5.2 Out of scope for Phase 1 [Confirmed]
1. Collaborative DILR solving.
2. Real-time duels (formulas, word meanings, etc.).
3. Study rooms (collaborative studying with shared goals).
4. **Leaderboards and ranking systems.**
5. Real authentication, real notifications and native mobile apps.
6. Non-English language support.
7. Mentor and alumni features. [Assumption]
8. OMET-specific content and features (teaser only).

### 5.3 Phase 2 (noted only, not approved)
A production-oriented web application with persistent storage, real authentication, integrations and production safeguards. **Phase 2 will not begin without explicit stakeholder approval.**

---

## 6. Business Rules and Content Rules

| ID | Rule | Status |
|---|---|---|
| BR-1 | No percentile guarantees and no "talent" labels. | [Confirmed] |
| BR-2 | Progress indicators must be honest; the app promises improved performance, not a specific outcome. | [Confirmed] |
| BR-3 | Recovery and wellness tools are a practice aid, "not a promise to eliminate anxiety". | [Confirmed] |
| BR-4 | No leaderboards or rankings. | [Confirmed] |
| BR-5 | Sharing is consent-based and opt-in; share cards never expose scores or personal information by default. | [Confirmed] |
| BR-6 | Private by default; minimal profile data. | [Confirmed] |
| BR-7 | Imagery must be official or licensed only. | [Confirmed] |
| BR-8 | Solutions should be verified and, where relevant, show alternative methods. | [Confirmed] |
| BR-9 | Only promise alumni or mentor sessions that actually exist. | [Confirmed] |
| BR-10 | No fake accounts or spam in the go-to-market plan. | [Confirmed] |
| BR-11 | Research participants give consent and are anonymised. | [Confirmed] |
| BR-12 | Mock analysis records user feedback only and does not capture question text. | [Confirmed] |
| BR-13 | Question content is memory-based (see R-1) and must be clearly labelled as such. | [Confirmed] |
| BR-14 | The Potential Score must be labelled as "the score if every question you could solve were answered correctly", never as a prediction or promise, and must state that it ignores timing and negative marking. | [Assumption, supports BR-2] |
| BR-15 | Reading passages must come from open-source material with the source and licence recorded. | [Confirmed source type; recording is an assumption] |

---

## 7. Privacy and Compliance Constraints

**Stakeholder-stated, unverified. This is not legal advice and requires verification before reliance.**

- India's data-protection law is understood to apply to any app that collects personal data. The DPDP Rules 2025 are understood to roll out in phases over roughly 12 to 18 months, with full compliance expected by about **May 2027**; November 2026 is **not** understood to be a universal compliance deadline.
- Consent must be withdrawable as simply as it was given, and data must be deleted afterwards unless a legal obligation requires retention.
- Children's data has its own rules; an **age gate** needs a decision (OQ-1).
- **Practical implication for Phase 1:** collect minimal data, show a clear notice, and use sample data in the prototype. Testers use a dummy login and no real authentication. [Confirmed]

---

## 8. Constraints and Assumptions

| ID | Item | Status |
|---|---|---|
| C-1 | Responsive web (desktop and mobile browsers); no native app. | [Confirmed] |
| C-2 | English only. | [Confirmed] |
| C-3 | Free tiers only for all tools; no paid APIs or services without approval. | [Confirmed] |
| C-4 | Prototype built on 26 October 2026, with 27 October 2026 as the review buffer. | [Confirmed] |
| C-5 | Technology choices are decided at the architecture stage, after the PRD. | [Confirmed] |
| A-1 | Prototype data is local and sample-based, with no real user records. | [Assumption] |
| A-2 | F4 and F6 will be thinner than F1 to F3 and F5. | [Confirmed priority order; depth is an assumption] |
| A-3 | The stakeholder's mock-analysis spreadsheet may be used, with permission, to seed sample mock-analysis data (its free-text comments are personal notes and need review first). | [Assumption] |

---

## 9. Success Criteria for the User Test [Confirmed: approved by the stakeholder]

| ID | Measure | Target |
|---|---|---|
| SC-1 | Number of testers who complete a session | 10 to 20 CAT aspirants |
| SC-2 | Share of testers who complete the baseline test and see their SWOT | at least 70% |
| SC-3 | Share of testers who complete at least one question-selection round and one mock-analysis entry | at least 60% |
| SC-4 | Perceived usefulness ("This helped me think about strategy"), rated 1 to 5 | average 4 or above |
| SC-5 | Calm experience ("The app felt supportive, not stressful"), rated 1 to 5 | average 4 or above |
| SC-6 | Feature ranking: which features testers would use again | qualitative, to guide Phase 2 priorities |
| SC-7 | Blocking usability issues found | list and triage after the test |

**Feedback questions**
1. Which feature was most useful, and which was least?
2. Did the SWOT or matrix tell you something you did not already know?
3. Did anything feel stressful, competitive or distracting?
4. What would make you use this daily for the last 30 days?
5. What is missing for OMET preparation?

Participants must give consent and be anonymised (BR-11).

---

## 10. Risks

| ID | Risk | Impact | Mitigation |
|---|---|---|---|
| R-1 | **Content and licensing risk.** The baseline uses memory-based past-year-style questions, while the stated principles say "original or licensed content only, no copied question banks". **Risk accepted by the stakeholders.** | Legal and reputational exposure. | Keep the set small; label as memory-based; use for prototype testing only; do not distribute publicly; record the source of each question; replace with original or licensed content before any wider release. |
| R-2 | One-day build with six features on free tiers. | Incomplete or shallow features. | Honour the priority order; F4 and F6 as lighter versions; simulate where acceptable and label it. |
| R-3 | Personalisation from very little data. | Generic-feeling output. | Make SWOT and recommendation logic transparent; show how it improves with use; label sample data. |
| R-4 | Wellness claims overreach. | Trust and compliance issues. | Follow BR-3; use cautious language. |
| R-5 | Regulatory understanding is unverified. | Non-compliance later. | Verify with a qualified professional before production; minimise data in Phase 1. |
| R-6 | **Potential Score can mislead.** It assumes every "can solve" question (B) would be answered correctly, and the sheet's formula ignores timing and negative marking. | Users may read it as a forecast, which conflicts with honest-progress principle 6. | Apply BR-14 wording; show it beside the actual score as a gap to work on, not a target to expect. |
| R-7 | **Inconsistent question-type labels.** In the sheet, types are free text and inconsistent (for example "PS", "OOO", "PC", "PJ", "Certainity"). Free text would weaken the pattern-level SWOT. | Unreliable personalisation. | Use a fixed list of question types per section, with a free-text note kept separately. [Assumption] |

---

## 11. Open Questions (none block the Phase 1 build)

| ID | Question | Owner | Interim handling |
|---|---|---|---|
| OQ-1 | Age gate: needed in the prototype or deferred to Phase 2? | Stakeholders | Deferred; prototype uses dummy login and sample data. |
| OQ-2 | Mock-analysis input style: does the user choose A to D directly, or choose one of the nine outcomes and have the grade derived? | Product Manager (PRD) | Recommend the nine-outcome input (see F3). |
| OQ-3 | Source of the meaning, synonym, antonym and usage content for word cards (a licensed or open dictionary, or written by the team)? | Stakeholders | Sample cards for the prototype. |
| OQ-4 | Confirm that the "actual score" column in the sheet is the user's real mock score (it is typed in by hand, unlabeled, and matches +3 / −1 scoring within one mark). | Stakeholders | Treat as an optional user-entered field. |
| OQ-5 | Confirm the allowed forms of gamification (for example streaks, badges, a personal journey). | Stakeholders | Personal-progress forms only. |

---

## 12. Approval

| Name | Role | Decision | Date |
|---|---|---|---|
| Aneesh Mahapatra | Founder | Pending | |
| Stuti Prajna Patra | Founder | Pending | |
| Pratosh Ramji | Founder | Pending | |

**Next stage after BRD approval:** the Senior Product Manager supplies the PRD, which Claude will review against this BRD.

---

## Appendix A: Mock-Analysis Reference Logic [Derived from the supplied spreadsheet]

**Source:** the stakeholder's workbook (one sheet, titled "RCM 1"), analysed for structure, formulas and values. The sheet holds **68 question rows**: **VARC 24, LRDI 22, QA 22**.

### A.1 Per-question record
Each row holds: section, serial number, question type or topic (merged across the rows of a set or passage), exactly one outcome mark, and an optional free-text comment (22 of the 68 rows have one). Every row has exactly one outcome mark.

### A.2 The nine outcomes and their grades

| Outcome group | Outcome | Grade |
|---|---|---|
| Attempted, correct | Solved it in no time | A |
| Attempted, correct | Solved it but took a lot of time | B |
| Attempted, correct | Guessed it | C |
| Attempted, wrong | Wrong, but could solve | B |
| Attempted, wrong | Wrong, cannot solve | D |
| Unattempted, saw but left | Could solve | B |
| Unattempted, saw but left | Cannot solve | C |
| Unattempted, did not or could not see | Could solve | B |
| Unattempted, did not or could not see | Cannot solve | C |

### A.3 Formulas in the sheet
- **Overall grade counts:** `=COUNTIF(D6:L73,"A")` (and the same for B, C, D).
- **Per-section grade counts:** `=SUMPRODUCT(($A$6:$A$73="VARC")*($D$6:$L$73="A"))`, repeated for each section (VARC, LRDI, QA) and each grade.
- **Potential Score per section:** `=(SUM(A count, B count)*3)`, for example VARC `=(SUM(T2,T3)*3)`.
- **Total Potential Score:** the sum of the three section values.
- The note on the sheet says the Potential Score is "calculated by eliminating all D's and B's". The formulas show this means counting every A and B question at 3 marks each, as if the B's were converted to correct answers and the D's skipped.

### A.4 Worked example from the sample data

| Section | A | B | C | D | Potential (3 × (A + B)) | Actual (hand-entered) |
|---|---|---|---|---|---|---|
| VARC | 7 | 4 | 8 | 5 | 33 | 15 |
| LRDI | 4 | 9 | 9 | 0 | 39 | 12 |
| QA | 2 | 3 | 16 | 1 | 15 | 6 |
| **Total** | **13** | **16** | **33** | **6** | **87** | **33** |

### A.5 Observations for the PRD
- The actual score column is hard-typed rather than calculated. It matches +3 for correct and −1 for wrong within one mark in each section (the difference in VARC is possibly a question without negative marking). The app should either calculate it from outcomes or accept it as an optional entry (OQ-4).
- The potential formula uses +3 per question and ignores negative marking and time, which is why BR-14 and R-6 exist.
- The sheet contains no timing data, so "typical time" in F1 must come from the app's own timed tests.
- Grade counts should drive the user's profile and SWOT: for example, many B's point to a test-taking and decision-making strength to build, while many C's point to knowledge gaps.
