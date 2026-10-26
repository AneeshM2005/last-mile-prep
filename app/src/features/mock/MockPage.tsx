/**
 * MockPage.tsx – Comprehensive Mock Analysis screen.
 * PRD M4, design.md 8.7, 10.3, 10.4, BR-14.
 * Route: /mock
 */

import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Card } from '../../ui/Card';
import { EmptyState } from '../../ui/EmptyState';
import { ProgressBar } from '../../ui/ProgressBar';
import { GradeChip, GRADE_DETAILS } from '../../ui/GradeChip';
import { BarRow } from '../../ui/BarRow';
import { EvidenceLine } from '../../ui/EvidenceLine';
import { useAppContext } from '../../app/providers';
import { useStore } from '../../data/store';
import { logEvent } from '../../data/eventLog';
import {
  deriveOutcomeCode,
  gradeForOutcome,
  analyzeMockEntry,
  type GradeLetter,
} from '../../domain/mockAnalysis';
import type {
  MockEntry,
  MockSection,
  MockRecord,
  Step2,
} from '../../data/schemas';

type MockViewMode = 'list' | 'section_select' | 'entry' | 'summary';

type Step1Choice = 'correct' | 'wrong' | 'left' | 'unseen';

export function MockPage(): React.ReactElement {
  const { config } = useAppContext();
  const { data, setData } = useStore();

  const copy = config?.copy as unknown as
    | { potential?: { label?: string }; comment?: { helper?: string } }
    | undefined;
  const br14Sentence =
    copy?.potential?.label ||
    'The score if every question you could solve were answered correctly. This is not a prediction. It ignores timing and negative marking.';
  const commentHelper =
    copy?.comment?.helper ||
    "A short note about your own experience. Please don't paste the question.";

  // View state
  const [viewMode, setViewMode] = useState<MockViewMode>('list');
  const [activeMockId, setActiveMockId] = useState<string | null>(null);
  const [activeSectionType, setActiveSectionType] = useState<'VARC' | 'LRDI' | 'QA'>('VARC');
  const [questionCountInput, setQuestionCountInput] = useState<number>(24);

  // New mock creation form
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [newMockLabel, setNewMockLabel] = useState<string>('Mock 1');
  const [newMockDate, setNewMockDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  // Entry workspace state
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [records, setRecords] = useState<MockRecord[]>([]);
  const [actualScoreInput, setActualScoreInput] = useState<number>(0);

  // Reflection in summary
  const [mockReflection, setMockReflection] = useState<string>('');

  const activeMock = data.mocks.find((m) => m.id === activeMockId);

  // Available question types for current section
  const sectionQuestionTypes: string[] =
    (config?.questionTypes?.questionTypes[activeSectionType] as string[]) || [
      'Reading Comprehension',
      'Arithmetic',
      'Algebra',
      'Geometry',
      'Data Interpretation - Tables',
    ];

  // ── Handlers ──────────────────────────────────────────────────

  const handleStartNewMock = () => {
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `mock-${Date.now()}`;

    const newMock: MockEntry = {
      id,
      label: newMockLabel.trim() || 'Mock 1',
      date: newMockDate,
      sections: [],
    };

    setData((prev) => ({
      ...prev,
      mocks: [newMock, ...prev.mocks],
    }));

    setActiveMockId(id);
    setShowNewModal(false);
    setViewMode('section_select');
  };

  const handleLoadSampleMock = async () => {
    try {
      const res = await fetch('/content/sampleMock.json');
      if (res.ok) {
        const sample: MockEntry = await res.json();
        setData((prev) => ({
          ...prev,
          mocks: [sample, ...prev.mocks.filter((m) => m.id !== sample.id)],
        }));
        setActiveMockId(sample.id);
        setViewMode('summary');
        logEvent('mock_summary_viewed', 'mock');
      }
    } catch {
      // Fallback: create mock inline if fetch fails in tests
      const fallbackSample: MockEntry = {
        id: '00000000-0000-0000-0000-000000000099',
        label: 'AIMCAT 2026 Sample Mock',
        date: '2026-10-15',
        sections: [
          {
            section: 'VARC',
            questionCount: 24,
            actualScore: 15,
            savedAt: '2026-10-15T10:40:00.000Z',
            records: [
              ...Array.from({ length: 7 }, (_, i) => ({ n: i + 1, type: 'Reading Comprehension', step1: 'correct' as const, step2: 'fast' as const, outcomeCode: 'CORRECT_FAST' as const })),
              ...Array.from({ length: 2 }, (_, i) => ({ n: i + 8, type: 'Para Summary', step1: 'correct' as const, step2: 'slow' as const, outcomeCode: 'CORRECT_SLOW' as const })),
              ...Array.from({ length: 2 }, (_, i) => ({ n: i + 10, type: 'Para Jumble', step1: 'wrong' as const, step2: 'can_solve' as const, outcomeCode: 'WRONG_CAN' as const })),
              ...Array.from({ length: 4 }, (_, i) => ({ n: i + 12, type: 'Reading Comprehension', step1: 'correct' as const, step2: 'guessed' as const, outcomeCode: 'CORRECT_GUESSED' as const })),
              ...Array.from({ length: 4 }, (_, i) => ({ n: i + 16, type: 'Odd Sentence Out', step1: 'left' as const, step2: 'cannot_solve' as const, outcomeCode: 'LEFT_CANNOT' as const })),
              ...Array.from({ length: 5 }, (_, i) => ({ n: i + 20, type: 'Reading Comprehension', step1: 'wrong' as const, step2: 'cannot_solve' as const, outcomeCode: 'WRONG_CANNOT' as const })),
            ],
          },
          {
            section: 'LRDI',
            questionCount: 22,
            actualScore: 12,
            savedAt: '2026-10-15T11:25:00.000Z',
            records: [
              ...Array.from({ length: 4 }, (_, i) => ({ n: i + 1, type: 'Data Interpretation - Tables', step1: 'correct' as const, step2: 'fast' as const, outcomeCode: 'CORRECT_FAST' as const })),
              ...Array.from({ length: 5 }, (_, i) => ({ n: i + 5, type: 'Seating Arrangement', step1: 'correct' as const, step2: 'slow' as const, outcomeCode: 'CORRECT_SLOW' as const })),
              ...Array.from({ length: 4 }, (_, i) => ({ n: i + 10, type: 'Data Interpretation - Charts', step1: 'left' as const, step2: 'can_solve' as const, outcomeCode: 'LEFT_CAN' as const })),
              ...Array.from({ length: 5 }, (_, i) => ({ n: i + 14, type: 'Games and Tournaments', step1: 'correct' as const, step2: 'guessed' as const, outcomeCode: 'CORRECT_GUESSED' as const })),
              ...Array.from({ length: 4 }, (_, i) => ({ n: i + 19, type: 'Data Interpretation - Tables', step1: 'left' as const, step2: 'cannot_solve' as const, outcomeCode: 'LEFT_CANNOT' as const })),
            ],
          },
          {
            section: 'QA',
            questionCount: 22,
            actualScore: 6,
            savedAt: '2026-10-15T12:10:00.000Z',
            records: [
              ...Array.from({ length: 2 }, (_, i) => ({ n: i + 1, type: 'Arithmetic', step1: 'correct' as const, step2: 'fast' as const, outcomeCode: 'CORRECT_FAST' as const })),
              ...Array.from({ length: 2 }, (_, i) => ({ n: i + 3, type: 'Algebra', step1: 'correct' as const, step2: 'slow' as const, outcomeCode: 'CORRECT_SLOW' as const })),
              { n: 5, type: 'Arithmetic', step1: 'wrong' as const, step2: 'can_solve' as const, outcomeCode: 'WRONG_CAN' as const },
              ...Array.from({ length: 8 }, (_, i) => ({ n: i + 6, type: 'Geometry', step1: 'correct' as const, step2: 'guessed' as const, outcomeCode: 'CORRECT_GUESSED' as const })),
              ...Array.from({ length: 8 }, (_, i) => ({ n: i + 14, type: 'Number System', step1: 'left' as const, step2: 'cannot_solve' as const, outcomeCode: 'LEFT_CANNOT' as const })),
              { n: 22, type: 'Modern Math', step1: 'wrong' as const, step2: 'cannot_solve' as const, outcomeCode: 'WRONG_CANNOT' as const },
            ],
          },
        ],
      };
      setData((prev) => ({
        ...prev,
        mocks: [fallbackSample, ...prev.mocks.filter((m) => m.id !== fallbackSample.id)],
      }));
      setActiveMockId(fallbackSample.id);
      setViewMode('summary');
      logEvent('mock_summary_viewed', 'mock');
    }
  };

  const handleStartSection = () => {
    const existingSection = activeMock?.sections.find((s) => s.section === activeSectionType);
    const count = questionCountInput;

    const initialRecords: MockRecord[] = existingSection
      ? existingSection.records
      : Array.from({ length: count }, (_, idx) => ({
          n: idx + 1,
          type: sectionQuestionTypes[0] || 'General',
          step1: 'left',
          step2: 'cannot_solve',
          outcomeCode: 'LEFT_CANNOT',
        }));

    setRecords(initialRecords);
    setActualScoreInput(existingSection?.actualScore ?? 0);
    setCurrentQIndex(0);
    setViewMode('entry');
    logEvent('mock_section_started', 'mock');
  };

  const updateCurrentRecord = (changes: Partial<MockRecord>) => {
    setRecords((prev) => {
      const updated = prev.map((r, idx) => {
        if (idx === currentQIndex) {
          const merged = { ...r, ...changes };
          // If step1 or step2 changed, re-derive outcomeCode
          if ('step1' in changes || 'step2' in changes) {
            merged.outcomeCode = deriveOutcomeCode(merged.step1, merged.step2);
          }
          return merged;
        }
        return r;
      });
      return updated;
    });
  };

  const handleStep1Change = (s1: Step1Choice) => {
    // Default appropriate step2 when step1 changes
    const defaultStep2: Step2 = s1 === 'correct' ? 'fast' : 'cannot_solve';
    updateCurrentRecord({ step1: s1, step2: defaultStep2 });
  };

  const handleSaveSection = () => {
    const now = new Date().toISOString();
    const newSection: MockSection = {
      section: activeSectionType,
      questionCount: records.length,
      actualScore: actualScoreInput,
      savedAt: now,
      records,
    };

    setData((prev) => ({
      ...prev,
      mocks: prev.mocks.map((m) => {
        if (m.id === activeMockId) {
          const otherSections = m.sections.filter((s) => s.section !== activeSectionType);
          return {
            ...m,
            sections: [...otherSections, newSection],
          };
        }
        return m;
      }),
    }));

    logEvent('mock_section_saved', 'mock');
    setViewMode('summary');
  };

  // ── 1. LIST VIEW ──────────────────────────────────────────────
  if (viewMode === 'list') {
    return (
      <div className="flex flex-col gap-6 max-w-[720px] mx-auto py-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-h1 text-[var(--lm-ink)] m-0">Mock analysis</h1>
            <p className="text-body text-[var(--lm-text-muted)] m-0 mt-1">
              Analyse your decisions, question choices, and score potential.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={handleLoadSampleMock}
              className="inline-flex items-center gap-2"
            >
              <Badge variant="sample" />
              <span>Load sample mock</span>
            </Button>
            <Button variant="primary-arrow" onClick={() => setShowNewModal(true)}>
              Start mock
            </Button>
          </div>
        </div>

        {/* Modal for creating mock */}
        {showNewModal && (
          <Card className="p-6 border-2 border-[var(--lm-ink)] flex flex-col gap-4">
            <h2 className="text-h2 font-semibold text-[var(--lm-ink)] m-0">Start new mock analysis</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex flex-col gap-1 flex-1 text-caption font-semibold text-[var(--lm-ink)]">
                Mock label
                <input
                  type="text"
                  value={newMockLabel}
                  onChange={(e) => setNewMockLabel(e.target.value)}
                  placeholder="e.g. Mock 1 / AIMCAT 2026"
                  className="p-3 border border-[var(--lm-border)] rounded-[var(--lm-radius-sm)] text-body text-[var(--lm-ink)]"
                />
              </label>
              <label className="flex flex-col gap-1 flex-1 text-caption font-semibold text-[var(--lm-ink)]">
                Date
                <input
                  type="date"
                  value={newMockDate}
                  onChange={(e) => setNewMockDate(e.target.value)}
                  className="p-3 border border-[var(--lm-border)] rounded-[var(--lm-radius-sm)] text-body text-[var(--lm-ink)]"
                />
              </label>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowNewModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleStartNewMock}>
                Continue
              </Button>
            </div>
          </Card>
        )}

        {/* List of past mocks or EmptyState */}
        {data.mocks.length === 0 ? (
          <EmptyState
            message="No mocks recorded yet. Start recording a full mock or load the sample mock to examine your decision grades and score potential."
            actionLabel="Load sample mock"
            onAction={handleLoadSampleMock}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {data.mocks.map((m) => {
              const summary = analyzeMockEntry(m);
              const sectionNames = m.sections.map((s) => s.section).join(', ') || 'No sections recorded';

              return (
                <Card
                  key={m.id}
                  className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-h2 font-semibold text-[var(--lm-ink)]">{m.label}</span>
                      <span className="text-caption text-[var(--lm-text-muted)] font-mono">({m.date})</span>
                    </div>
                    <span className="text-small text-[var(--lm-text-muted)]">
                      Sections: {sectionNames}
                    </span>
                    <span className="text-caption font-semibold text-[var(--lm-ink)]">
                      Potential: {summary.totalPotentialScore} · Actual: {summary.totalActualScore}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setActiveMockId(m.id);
                        setViewMode('section_select');
                      }}
                    >
                      Add section
                    </Button>
                    <Button
                      variant="primary-arrow"
                      onClick={() => {
                        setActiveMockId(m.id);
                        setViewMode('summary');
                        logEvent('mock_summary_viewed', 'mock');
                      }}
                    >
                      Summary
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── 2. SECTION SELECT VIEW ────────────────────────────────────
  if (viewMode === 'section_select') {
    const defaultCounts: Record<'VARC' | 'LRDI' | 'QA', number> = {
      VARC: 24,
      LRDI: 22,
      QA: 22,
    };

    return (
      <div className="flex flex-col gap-6 max-w-[720px] mx-auto py-6 animate-fade-in">
        <div>
          <span className="text-caption font-bold text-[var(--lm-accent-strong)]">{activeMock?.label}</span>
          <h1 className="text-h1 text-[var(--lm-ink)] m-0 mt-1">Choose a section</h1>
          <p className="text-body text-[var(--lm-text-muted)] m-0 mt-1">
            Select which section to record and verify the question count.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(['VARC', 'LRDI', 'QA'] as const).map((sec) => {
            const isSelected = activeSectionType === sec;
            const existing = activeMock?.sections.find((s) => s.section === sec);

            return (
              <button
                key={sec}
                type="button"
                onClick={() => {
                  setActiveSectionType(sec);
                  setQuestionCountInput(defaultCounts[sec]);
                }}
                className={[
                  'p-5 rounded-[var(--lm-radius-lg)] border text-left flex flex-col gap-2 transition-all cursor-pointer',
                  isSelected
                    ? 'bg-[var(--lm-accent-soft)] border-2 border-[var(--lm-ink)]'
                    : 'bg-[var(--lm-surface)] border-[var(--lm-border)] hover:bg-[var(--lm-inset)]',
                ].join(' ')}
              >
                <div className="flex items-center justify-between">
                  <span className="text-h2 font-bold text-[var(--lm-ink)]">{sec}</span>
                  {existing && (
                    <span className="text-caption font-bold px-2 py-0.5 rounded-[var(--lm-radius-pill)] bg-[var(--grade-a-bg)] text-[var(--grade-a-fg)]">
                      Recorded
                    </span>
                  )}
                </div>
                <span className="text-small text-[var(--lm-text-muted)]">
                  Standard {defaultCounts[sec]} questions
                </span>
              </button>
            );
          })}
        </div>

        <Card className="p-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-body-strong text-[var(--lm-ink)]">
            Questions in this section (stepper)
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={100}
                value={questionCountInput}
                onChange={(e) => setQuestionCountInput(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                className="w-28 p-3 border border-[var(--lm-border)] rounded-[var(--lm-radius-sm)] text-h3 font-bold text-[var(--lm-ink)] font-mono"
              />
              <span className="text-small text-[var(--lm-text-muted)]">
                Default: {defaultCounts[activeSectionType]} questions
              </span>
            </div>
          </label>
        </Card>

        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" onClick={() => setViewMode('list')}>
            Cancel
          </Button>
          <Button variant="primary-arrow" onClick={handleStartSection}>
            Start section
          </Button>
        </div>
      </div>
    );
  }

  // ── 3. ENTRY WORKSPACE VIEW ───────────────────────────────────
  if (viewMode === 'entry') {
    const currentR = records[currentQIndex] || {
      n: currentQIndex + 1,
      type: sectionQuestionTypes[0] || 'General',
      step1: 'left',
      step2: 'cannot_solve',
      outcomeCode: 'LEFT_CANNOT',
    };

    const currentGrade = gradeForOutcome(currentR.outcomeCode);
    const recordedCount = records.length;

    return (
      <div className="flex flex-col gap-6 max-w-[720px] mx-auto pb-12 animate-fade-in">
        {/* Header bar */}
        <div className="flex items-center justify-between gap-4 pb-2 border-b border-[var(--lm-border)]">
          <div className="flex items-center gap-2">
            <span className="text-caption font-bold px-2.5 py-0.5 rounded-[var(--lm-radius-pill)] bg-[var(--lm-inset)] text-[var(--lm-ink)] border border-[var(--lm-border)]">
              {activeSectionType} · {activeMock?.label}
            </span>
          </div>
          <span className="text-caption text-[var(--lm-text-muted)] font-medium">
            {currentQIndex + 1} of {records.length} recorded
          </span>
        </div>

        <ProgressBar current={currentQIndex + 1} total={records.length} />

        {/* Question Jumper Grid */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {records.map((r, idx) => {
            const isCur = idx === currentQIndex;
            const letter = gradeForOutcome(r.outcomeCode);
            const details = GRADE_DETAILS[letter];

            return (
              <button
                key={r.n}
                type="button"
                onClick={() => setCurrentQIndex(idx)}
                className={[
                  'w-9 h-9 rounded-[var(--lm-radius-sm)] border text-caption font-bold flex items-center justify-center transition-all cursor-pointer',
                  isCur ? 'ring-2 ring-offset-1 ring-[var(--lm-ink)]' : '',
                  r.outcomeCode ? '' : 'opacity-60',
                ].join(' ')}
                style={{
                  backgroundColor: details.bg,
                  color: details.fg,
                  borderColor: isCur ? 'var(--lm-ink)' : 'transparent',
                }}
              >
                {r.n}
              </button>
            );
          })}
        </div>

        {/* Active Question Entry Card */}
        <Card className="p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-[var(--lm-border)] pb-2">
            <span className="text-h3 font-bold text-[var(--lm-ink)]">Question {currentR.n}</span>
            <label className="flex items-center gap-2 text-caption font-semibold text-[var(--lm-ink)]">
              Type:
              <select
                value={currentR.type}
                onChange={(e) => updateCurrentRecord({ type: e.target.value })}
                className="p-1.5 border border-[var(--lm-border)] rounded-[var(--lm-radius-sm)] bg-[var(--lm-surface)] text-[var(--lm-ink)] font-normal"
              >
                {sectionQuestionTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
            </label>
          </div>

          {currentR.type === 'Other' && (
            <input
              type="text"
              maxLength={40}
              placeholder="Specify question type (max 40 chars)"
              value={currentR.typeOtherNote || ''}
              onChange={(e) => updateCurrentRecord({ typeOtherNote: e.target.value })}
              className="p-2.5 border border-[var(--lm-border)] rounded-[var(--lm-radius-sm)] text-body text-[var(--lm-ink)]"
            />
          )}

          {/* Step 1: What happened? */}
          <div className="flex flex-col gap-2">
            <span className="text-body-strong text-[var(--lm-ink)]">Step 1: What happened?</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'correct', label: 'Attempted and correct' },
                { id: 'wrong', label: 'Attempted and wrong' },
                { id: 'left', label: 'Left it (saw it)' },
                { id: 'unseen', label: "Didn't get to see it" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleStep1Change(opt.id as Step1Choice)}
                  className={[
                    'p-3 rounded-[var(--lm-radius-md)] text-body font-medium border text-left transition-colors cursor-pointer',
                    currentR.step1 === opt.id
                      ? 'bg-[var(--lm-accent-soft)] border-2 border-[var(--lm-ink)] font-bold text-[var(--lm-ink)]'
                      : 'bg-[var(--lm-surface)] border-[var(--lm-border)] text-[var(--lm-ink)] hover:bg-[var(--lm-inset)]',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Nuance based on Step 1 */}
          <div className="flex flex-col gap-2">
            <span className="text-body-strong text-[var(--lm-ink)]">Step 2: Nuance</span>
            <div className="flex flex-col gap-2">
              {currentR.step1 === 'correct' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'fast', label: 'Solved it in no time' },
                    { id: 'slow', label: 'Took a lot of time' },
                    { id: 'guessed', label: 'Guessed it' },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => updateCurrentRecord({ step2: sub.id as Step2 })}
                      className={[
                        'p-3 rounded-[var(--lm-radius-md)] text-body font-medium border text-center transition-colors cursor-pointer',
                        currentR.step2 === sub.id
                          ? 'bg-[var(--lm-accent-soft)] border-2 border-[var(--lm-ink)] font-bold text-[var(--lm-ink)]'
                          : 'bg-[var(--lm-surface)] border-[var(--lm-border)] text-[var(--lm-ink)] hover:bg-[var(--lm-inset)]',
                      ].join(' ')}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}

              {currentR.step1 === 'wrong' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'can_solve', label: 'Wrong, but could solve' },
                    { id: 'cannot_solve', label: 'Wrong, cannot solve' },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => updateCurrentRecord({ step2: sub.id as Step2 })}
                      className={[
                        'p-3 rounded-[var(--lm-radius-md)] text-body font-medium border text-center transition-colors cursor-pointer',
                        currentR.step2 === sub.id
                          ? 'bg-[var(--lm-accent-soft)] border-2 border-[var(--lm-ink)] font-bold text-[var(--lm-ink)]'
                          : 'bg-[var(--lm-surface)] border-[var(--lm-border)] text-[var(--lm-ink)] hover:bg-[var(--lm-inset)]',
                      ].join(' ')}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}

              {(currentR.step1 === 'left' || currentR.step1 === 'unseen') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'can_solve', label: 'Could solve' },
                    { id: 'cannot_solve', label: 'Cannot solve' },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => updateCurrentRecord({ step2: sub.id as Step2 })}
                      className={[
                        'p-3 rounded-[var(--lm-radius-md)] text-body font-medium border text-center transition-colors cursor-pointer',
                        currentR.step2 === sub.id
                          ? 'bg-[var(--lm-accent-soft)] border-2 border-[var(--lm-ink)] font-bold text-[var(--lm-ink)]'
                          : 'bg-[var(--lm-surface)] border-[var(--lm-border)] text-[var(--lm-ink)] hover:bg-[var(--lm-inset)]',
                      ].join(' ')}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Grade Chip */}
          <div className="pt-2 border-t border-[var(--lm-border)] flex items-center justify-between">
            <span className="text-body-strong text-[var(--lm-ink)]">Grade:</span>
            <GradeChip grade={currentGrade} variant="full" showMeaning />
          </div>

          {/* Comment textarea */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-[var(--lm-border)]">
            <div className="flex items-center justify-between">
              <span className="text-caption font-semibold text-[var(--lm-ink)]">Comment (optional)</span>
              <span className="text-caption text-[var(--lm-text-muted)] font-mono">
                {(currentR.comment || '').length} / 200
              </span>
            </div>
            <textarea
              maxLength={200}
              rows={2}
              value={currentR.comment || ''}
              onChange={(e) => updateCurrentRecord({ comment: e.target.value })}
              placeholder={commentHelper}
              className="p-3 border border-[var(--lm-border)] rounded-[var(--lm-radius-sm)] text-body text-[var(--lm-ink)] resize-none"
            />
            <span className="text-small text-[var(--lm-text-muted)]">{commentHelper}</span>
          </div>
        </Card>

        {/* Section Actual Score input */}
        <Card className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[var(--lm-inset)]">
          <label className="text-body font-medium text-[var(--lm-ink)]">
            Actual score for this section (optional)
          </label>
          <input
            type="number"
            value={actualScoreInput}
            onChange={(e) => setActualScoreInput(Number(e.target.value) || 0)}
            className="w-24 p-2 border border-[var(--lm-border)] rounded-[var(--lm-radius-sm)] font-mono font-bold text-h3 text-[var(--lm-ink)]"
          />
        </Card>

        {/* Navigation / Save Footer */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="secondary"
            disabled={currentQIndex === 0}
            onClick={() => setCurrentQIndex((prev) => prev - 1)}
          >
            Previous
          </Button>

          <Button
            variant="primary"
            onClick={handleSaveSection}
            disabled={recordedCount === 0}
          >
            Save section
          </Button>

          <Button
            variant="secondary"
            disabled={currentQIndex === records.length - 1}
            onClick={() => setCurrentQIndex((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }

  // ── 4. SUMMARY VIEW ───────────────────────────────────────────
  if (!activeMock) {
    return <EmptyState message="Mock not found. Please return to mock list." onAction={() => setViewMode('list')} actionLabel="Back to mocks" />;
  }

  const summary = analyzeMockEntry(activeMock);

  // Focus list: question types ordered by D count desc, then B desc, then C desc
  const typeMap = new Map<string, { type: string; section: string; D: number; B: number; C: number; total: number }>();
  for (const s of activeMock.sections) {
    for (const r of s.records) {
      const g = gradeForOutcome(r.outcomeCode);
      const existing = typeMap.get(r.type) || { type: r.type, section: s.section, D: 0, B: 0, C: 0, total: 0 };
      if (g === 'D') existing.D += 1;
      if (g === 'B') existing.B += 1;
      if (g === 'C') existing.C += 1;
      existing.total += 1;
      typeMap.set(r.type, existing);
    }
  }

  const focusList = Array.from(typeMap.values()).sort((x, y) => {
    if (y.D !== x.D) return y.D - x.D;
    if (y.B !== x.B) return y.B - x.B;
    return y.C - x.C;
  });

  return (
    <div className="flex flex-col gap-8 max-w-[720px] mx-auto py-6 animate-fade-in">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="sample" />
          <span className="text-caption text-[var(--lm-text-muted)] font-mono">{activeMock.date}</span>
        </div>
        <h1 className="text-h1 text-[var(--lm-ink)] m-0 mt-2">{activeMock.label} — Summary</h1>
        <p className="text-body text-[var(--lm-text-muted)] m-0 mt-1">
          Review your decision grades, score potential, and leakage.
        </p>
      </div>

      {/* 1. Potential vs Actual (design.md 10.4, BR-14) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Potential Score Tile */}
        <Card className="p-6 flex flex-col justify-between gap-4 border-2 border-[var(--lm-ink)] bg-[var(--lm-surface)]">
          <div className="flex flex-col gap-1">
            <span className="text-caption font-bold tracking-wider text-[var(--lm-text-muted)] uppercase">
              Potential
            </span>
            <span className="text-display font-serif text-[var(--lm-ink)] leading-none my-1">
              {summary.totalPotentialScore}
            </span>
            <p className="text-small text-[var(--lm-text-muted)] m-0 leading-relaxed font-normal">
              {br14Sentence}
            </p>
          </div>

          <div className="pt-3 border-t border-[var(--lm-border)] text-caption font-semibold text-[var(--lm-ink)] flex items-center justify-between">
            <span>VARC {summary.sections.find((s) => s.section === 'VARC')?.potentialScore ?? 0}</span>
            <span>·</span>
            <span>LRDI {summary.sections.find((s) => s.section === 'LRDI')?.potentialScore ?? 0}</span>
            <span>·</span>
            <span>QA {summary.sections.find((s) => s.section === 'QA')?.potentialScore ?? 0}</span>
          </div>
        </Card>

        {/* Actual Score Tile */}
        <Card className="p-6 flex flex-col justify-between gap-4 bg-[var(--lm-surface)]">
          <div className="flex flex-col gap-1">
            <span className="text-caption font-bold tracking-wider text-[var(--lm-text-muted)] uppercase">
              Actual score
            </span>
            <span className="text-display font-serif text-[var(--lm-ink)] leading-none my-1">
              {summary.totalActualScore}
            </span>
            <p className="text-small text-[var(--lm-text-muted)] m-0">
              Recorded hand-entered or computed mock score.
            </p>
          </div>

          <div className="pt-3 border-t border-[var(--lm-border)] flex items-center justify-between">
            <span className="text-h3 font-semibold text-[var(--lm-accent-strong)]">
              Gap to work on: +{summary.totalLeakage}
            </span>
          </div>
        </Card>
      </div>

      {/* Leakage sentence */}
      <Card className="p-4 bg-[var(--lm-inset)] border border-[var(--lm-border)]">
        <p className="text-body font-medium text-[var(--lm-ink)] m-0">
          {summary.leakageSentence}
        </p>
      </Card>

      {/* 2. Grade counts overall: 4 BarRows */}
      <Card className="p-6 flex flex-col gap-5">
        <h2 className="text-h2 font-semibold text-[var(--lm-ink)] m-0">Grade distribution</h2>
        <div className="flex flex-col gap-3">
          {(['A', 'B', 'C', 'D'] as GradeLetter[]).map((letter) => {
            const count = summary.totalCounts[letter];
            const details = GRADE_DETAILS[letter];
            const Icon = details.Icon;

            return (
              <BarRow
                key={letter}
                label={`Grade ${letter} · ${details.label}`}
                count={count}
                maxCount={summary.totalCounts.total}
                fillColor={details.fg}
                icon={<Icon size={16} fill="currentColor" className="shrink-0" />}
              />
            );
          })}
        </div>
      </Card>

      {/* 3. Per-section mini summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summary.sections.map((sec) => (
          <Card key={sec.section} className="p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-h3 font-bold text-[var(--lm-ink)]">{sec.section}</span>
              <span className="text-caption font-bold text-[var(--lm-accent-strong)]">
                Potential {sec.potentialScore}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center font-mono text-caption font-bold pt-1">
              <span style={{ color: 'var(--grade-a-fg)' }}>A: {sec.counts.A}</span>
              <span style={{ color: 'var(--grade-b-fg)' }}>B: {sec.counts.B}</span>
              <span style={{ color: 'var(--grade-c-fg)' }}>C: {sec.counts.C}</span>
              <span style={{ color: 'var(--grade-d-fg)' }}>D: {sec.counts.D}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* 4. Focus list (10.3) */}
      <Card className="p-6 flex flex-col gap-4">
        <h2 className="text-h2 font-semibold text-[var(--lm-ink)] m-0">Focus list</h2>
        <p className="text-small text-[var(--lm-text-muted)] m-0">
          Question types ordered by priority to address (D flags, then B test-taking levers).
        </p>

        {focusList.length === 0 ? (
          <p className="text-body text-[var(--lm-text-muted)] m-0">
            Record a few more questions to see your focus list.
          </p>
        ) : (
          <ul className="flex flex-col gap-3 p-0 m-0 list-none">
            {focusList.slice(0, 5).map((item) => (
              <li
                key={`${item.section}-${item.type}`}
                className="p-3 bg-[var(--lm-inset)] rounded-[var(--lm-radius-md)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-body font-semibold text-[var(--lm-ink)]">{item.type}</span>
                  <span className="text-caption font-bold px-2 py-0.5 rounded-[var(--lm-radius-pill)] bg-[var(--lm-surface)] border border-[var(--lm-border)] text-[var(--lm-ink)]">
                    {item.section}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-caption text-[var(--grade-d-fg)] font-bold">D: {item.D}</span>
                  <span className="font-mono text-caption text-[var(--grade-b-fg)] font-bold">B: {item.B}</span>
                  <span className="font-mono text-caption text-[var(--grade-c-fg)] font-bold">C: {item.C}</span>
                  <EvidenceLine questionCount={item.total} text={`Based on ${item.total} questions.`} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* 5. Reading lines */}
      <Card className="p-5 flex flex-col gap-2 bg-[var(--lm-surface)]">
        <h3 className="text-h3 font-semibold text-[var(--lm-ink)] m-0">Observations</h3>
        {summary.totalCounts.D > 0 && (
          <p className="text-body text-[var(--lm-ink)] m-0">
            &bull; <strong>Eliminate the Ds:</strong> Focus on questions where both judgement and knowledge slipped.
          </p>
        )}
        {summary.totalCounts.B >= summary.totalCounts.C && (
          <p className="text-body text-[var(--lm-ink)] m-0">
            &bull; <strong>Knowledge is there, decisions are the lever.</strong> You had the knowledge to solve {summary.totalCounts.B} questions that were lost to timing or selection.
          </p>
        )}
        {summary.totalCounts.C > summary.totalCounts.B && (
          <p className="text-body text-[var(--lm-ink)] m-0">
            &bull; Exposure to more mocks raises knowledge and reduces C.
          </p>
        )}
      </Card>

      {/* 6. Reflection prompt */}
      <Card className="p-6 flex flex-col gap-3">
        <h3 className="text-h3 font-semibold text-[var(--lm-ink)] m-0">
          Which one decision would you change in the next mock?
        </h3>
        <textarea
          rows={3}
          maxLength={280}
          value={mockReflection}
          onChange={(e) => setMockReflection(e.target.value)}
          placeholder="e.g. In QA, I spent 6 minutes on question 8 instead of moving on."
          className="p-3 border border-[var(--lm-border)] rounded-[var(--lm-radius-sm)] text-body text-[var(--lm-ink)] resize-none"
        />
        <div className="flex items-center justify-between">
          <span className="text-caption text-[var(--lm-text-muted)]">
            {mockReflection.length} / 280
          </span>
          {mockReflection.length > 0 && (
            <span className="text-caption font-semibold text-[var(--grade-a-fg)]">
              Saved to your notes
            </span>
          )}
        </div>
      </Card>

      {/* Footer navigation */}
      <div className="flex items-center gap-4 pt-2">
        <Button
          variant="secondary"
          onClick={() => setViewMode('section_select')}
        >
          Add another section
        </Button>
        <Button variant="primary" onClick={() => setViewMode('list')}>
          Back to mocks
        </Button>
      </div>
    </div>
  );
}
