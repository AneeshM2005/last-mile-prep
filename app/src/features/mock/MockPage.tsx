/**
 * MockPage.tsx – Comprehensive Mock Analysis screen with multi-step workflow.
 * Section 6: Start mock analysis -> Instructions -> Mock details -> Section choice -> Question cards -> Summary.
 * Light editorial aesthetic, zero pre-selected options, SpecularButton primary actions.
 * Route: /mock
 */

import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { EmptyState } from '../../ui/EmptyState';
import { ProgressBar } from '../../ui/ProgressBar';
import { GradeChip, GRADE_DETAILS } from '../../ui/GradeChip';
import { BarRow } from '../../ui/BarRow';
import { SpecularButton } from '../../ui/animations/SpecularButton';
import { useAppContext } from '../../app/providers';
import { useStore } from '../../data/store';
import { logEvent } from '../../data/eventLog';
import {
  deriveOutcomeCode,
  gradeForOutcome,
  analyzeMockEntry,
  type GradeLetter,
} from '../../domain/mockAnalysis';
import {
  validateMockDetails,
  MOCK_PROVIDERS,
  type MockDetailsForm,
} from '../../domain/mockDetailsValidation';
import type {
  MockEntry,
  MockSection,
  MockRecord,
  Step2,
  OutcomeCode,
} from '../../data/schemas';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Info,
} from 'lucide-react';

type MockViewMode =
  | 'list'
  | 'instructions'
  | 'details'
  | 'section_select'
  | 'entry'
  | 'summary';

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

  // Mock details form state (starts with nothing pre-selected or pre-filled)
  const [mockDetails, setMockDetails] = useState<MockDetailsForm>({
    name: '',
    provider: '',
    providerOther: '',
    dateTaken: '',
    mockType: null,
    overallScore: null,
    varcScore: null,
    lrdiScore: null,
    qaScore: null,
    composure: null,
  });
  const [detailsErrors, setDetailsErrors] = useState<Record<string, string>>({});

  // Section choice state (starts with NO section pre-selected)
  const [activeSectionType, setActiveSectionType] = useState<'VARC' | 'LRDI' | 'QA' | null>(null);
  const [questionCountInput, setQuestionCountInput] = useState<number>(24);

  // Entry workspace state
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [records, setRecords] = useState<MockRecord[]>([]);

  // Reflection in summary
  const [mockReflection, setMockReflection] = useState<string>('');

  const activeMock = data.mocks.find((m) => m.id === activeMockId);

  const sectionQuestionTypes: string[] = activeSectionType
    ? (config?.questionTypes?.questionTypes[activeSectionType] as string[]) || [
        'Reading Comprehension',
        'Arithmetic',
        'Algebra',
        'Geometry',
        'Data Interpretation - Tables',
      ]
    : [];

  // Default section question sizes from config
  const defaultCounts: Record<'VARC' | 'LRDI' | 'QA', number> = {
    VARC: config?.app?.sections?.VARC || 24,
    LRDI: config?.app?.sections?.LRDI || 22,
    QA: config?.app?.sections?.QA || 22,
  };

  // ── Handlers ──────────────────────────────────────────────────

  const handleStartMockAnalysisFlow = () => {
    setViewMode('instructions');
  };

  const handleContinueFromInstructions = () => {
    setViewMode('details');
  };

  const handleContinueToAnalysis = () => {
    const counts = {
      VARC: defaultCounts.VARC,
      LRDI: defaultCounts.LRDI,
      QA: defaultCounts.QA,
    };
    const validation = validateMockDetails(mockDetails, counts);
    if (!validation.isValid) {
      setDetailsErrors(validation.errors);
      return;
    }

    setDetailsErrors({});

    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `mock-${Date.now()}`;

    const newMock: MockEntry = {
      id,
      label: mockDetails.name.trim(),
      date: mockDetails.dateTaken,
      sections: [],
      provider: mockDetails.provider === 'Other' ? mockDetails.providerOther?.trim() : mockDetails.provider,
      mockType: mockDetails.mockType || undefined,
      totalScore: mockDetails.overallScore ?? validation.computedTotal,
      composure: mockDetails.composure || undefined,
    };

    setData((prev) => ({
      ...prev,
      mocks: [newMock, ...prev.mocks],
    }));

    setActiveMockId(id);
    setActiveSectionType(null); // No section pre-selected
    setViewMode('section_select');
  };

  const handleSelectSection = (type: 'VARC' | 'LRDI' | 'QA') => {
    setActiveSectionType(type);
    setQuestionCountInput(defaultCounts[type]);
  };

  const handleStartSection = () => {
    if (!activeSectionType) return;
    const initialRecords: MockRecord[] = Array.from(
      { length: questionCountInput },
      (_, i) => ({
        n: i + 1,
        type: '', // placeholder, not pre-selected
        step1: undefined as unknown as Step1Choice, // unselected
        step2: undefined as unknown as Step2,       // unselected
        outcomeCode: undefined as unknown as OutcomeCode,
      })
    );

    setRecords(initialRecords);
    setCurrentQIndex(0);
    setViewMode('entry');
  };

  const handleRecordStep1 = (choice: Step1Choice) => {
    setRecords((prev) => {
      const next = [...prev];
      const cur = next[currentQIndex] || { n: currentQIndex + 1, type: '' };
      const nextR: MockRecord = {
        ...cur,
        step1: choice,
      };
      if (nextR.step1 && nextR.step2) {
        nextR.outcomeCode = deriveOutcomeCode(nextR.step1, nextR.step2);
      }
      next[currentQIndex] = nextR;
      return next;
    });
  };

  const handleRecordStep2 = (choice: Step2) => {
    setRecords((prev) => {
      const next = [...prev];
      const cur = next[currentQIndex] || { n: currentQIndex + 1, type: '' };
      const nextR: MockRecord = {
        ...cur,
        step2: choice,
      };
      if (nextR.step1 && nextR.step2) {
        nextR.outcomeCode = deriveOutcomeCode(nextR.step1, nextR.step2);
      }
      next[currentQIndex] = nextR;
      return next;
    });
  };

  const handleTypeChange = (typeVal: string) => {
    setRecords((prev) => {
      const next = [...prev];
      const cur = next[currentQIndex] || { n: currentQIndex + 1 };
      next[currentQIndex] = { ...cur, type: typeVal };
      return next;
    });
  };

  const handleCommentChange = (commentVal: string) => {
    setRecords((prev) => {
      const next = [...prev];
      const cur = next[currentQIndex] || { n: currentQIndex + 1 };
      next[currentQIndex] = { ...cur, comment: commentVal.slice(0, 200) };
      return next;
    });
  };

  const handleSaveSection = () => {
    if (!activeMockId || !activeSectionType) return;

    // Filter to questions that were actually recorded (both step1 and step2 chosen)
    const validRecords = records.filter((r) => r.step1 && r.step2 && r.outcomeCode);

    // Calculate actual section score: 3 for correct, -1 for wrong, 0 for left/unseen
    const actualScore = validRecords.reduce((acc, r) => {
      if (r.step1 === 'correct') return acc + 3;
      if (r.step1 === 'wrong') return acc - 1;
      return acc;
    }, 0);

    const newSection: MockSection = {
      section: activeSectionType,
      questionCount: questionCountInput,
      records: validRecords,
      actualScore,
      savedAt: new Date().toISOString(),
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

  // ── 1. LIST / START SCREEN VIEW ────────────────────────────────
  if (viewMode === 'list') {
    return (
      <div className="flex flex-col gap-6 max-w-[720px] mx-auto py-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-h1 text-[var(--lm-ink)] m-0">Mock analysis</h1>
            <p className="text-body text-[var(--lm-text-muted)] m-0 mt-1">
              Analyse your decisions, question choices, and honest score potential.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <SpecularButton
              size="md"
              radius={9999}
              onClick={handleStartMockAnalysisFlow}
              aria-label="Start mock analysis"
            >
              <span>Start mock analysis</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </SpecularButton>
          </div>
        </div>

        {/* Quiet link to reopen instructions */}
        <div className="flex items-center gap-1.5 -mt-2">
          <HelpCircle size={15} className="text-[var(--lm-sage-700)]" />
          <button
            type="button"
            onClick={() => setViewMode('instructions')}
            className="text-xs font-semibold text-[var(--lm-sage-700)] hover:underline cursor-pointer"
          >
            How mock analysis works
          </button>
        </div>

        {/* List of past mocks or EmptyState */}
        {data.mocks.length === 0 ? (
          <EmptyState
            message="No mocks recorded yet. Start a new mock analysis when you are ready to revisit your scorecard question by question."
            actionLabel="Start mock analysis"
            onAction={handleStartMockAnalysisFlow}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {data.mocks.map((m) => {
              const summary = analyzeMockEntry(m);
              const sectionNames = m.sections.map((s) => s.section).join(', ') || 'No sections recorded';

              return (
                <Card
                  key={m.id}
                  className="p-6 flex flex-col gap-4 hover:border-[var(--lm-sage-500)] transition-colors bg-[var(--lm-surface)] border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-card)] shadow-[var(--lm-shadow-card)]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-h2 font-semibold text-[var(--lm-ink)] m-0">
                          {m.label}
                        </h2>
                        {m.provider && (
                          <span className="text-caption font-bold px-2 py-0.5 rounded-full bg-[var(--lm-sage-100)] text-[var(--lm-sage-700)]">
                            {m.provider}
                          </span>
                        )}
                      </div>
                      <span className="text-caption text-[var(--lm-text-muted)] font-mono block mt-0.5">
                        {m.date} · {m.mockType === 'sectional' ? 'Sectional test' : 'Full-length mock'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setActiveMockId(m.id);
                          setViewMode('summary');
                        }}
                      >
                        View summary
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => {
                          setActiveMockId(m.id);
                          setActiveSectionType(null);
                          setViewMode('section_select');
                        }}
                      >
                        Add section
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-[var(--lm-sage-200)]">
                    <div>
                      <span className="text-caption text-[var(--lm-text-muted)] block">Potential score</span>
                      <span className="text-h2 font-bold font-serif text-[var(--lm-sage-700)]">
                        {summary.totalPotentialScore}
                      </span>
                    </div>

                    <div>
                      <span className="text-caption text-[var(--lm-text-muted)] block">Actual score</span>
                      <span className="text-h2 font-bold font-serif text-[var(--lm-ink)]">
                        {summary.totalActualScore}
                      </span>
                    </div>

                    <div>
                      <span className="text-caption text-[var(--lm-text-muted)] block">Score leakage</span>
                      <span className="text-h2 font-bold font-serif text-[var(--lm-sage-900)]">
                        +{summary.totalLeakage}
                      </span>
                    </div>

                    <div className="ml-auto text-caption text-[var(--lm-text-muted)] font-medium">
                      Sections: <span className="text-[var(--lm-ink)] font-semibold">{sectionNames}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── 2. INSTRUCTIONS VIEW ──────────────────────────────────────
  if (viewMode === 'instructions') {
    return (
      <div className="flex flex-col gap-6 max-w-[720px] mx-auto py-6 animate-fade-in">
        <button
          type="button"
          onClick={() => setViewMode('list')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--lm-sage-700)] hover:underline self-start cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to mocks
        </button>

        <div>
          <span className="text-caption font-bold text-[var(--lm-sage-700)] uppercase tracking-wider">
            Preparation Protocol
          </span>
          <h1 className="text-h1 text-[var(--lm-ink)] m-0 mt-1">How mock analysis works</h1>
          <p className="text-body text-[var(--lm-text-muted)] m-0 mt-1">
            This is for learning and strategy calibration, not for scoring yourself.
          </p>
        </div>

        <Card className="p-6 flex flex-col gap-5 bg-[var(--lm-surface)] border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-card)] shadow-[var(--lm-shadow-card)]">
          <div>
            <h2 className="text-h3 font-serif font-bold text-[var(--lm-ink)] m-0">What you will do</h2>
            <p className="text-body text-[var(--lm-text-muted)] m-0 mt-1 leading-relaxed">
              Revisit a mock you took, question by question, soon after taking it. Have your mock scorecard or report ready with the provider name and section scores.
            </p>
          </div>

          <div className="pt-3 border-t border-[var(--lm-sage-200)] space-y-2">
            <h2 className="text-h3 font-serif font-bold text-[var(--lm-ink)] m-0">Two small steps per question</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 bg-[var(--lm-sage-50)] border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-md)]">
                <span className="text-xs font-bold text-[var(--lm-sage-700)] uppercase block mb-1">
                  Step 1 · Outcome
                </span>
                <span className="text-small text-[var(--lm-ink)] font-medium">
                  What actually happened? Did you answer correctly, get it wrong, leave it after reading, or leave it unseen?
                </span>
              </div>
              <div className="p-3.5 bg-[var(--lm-sage-50)] border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-md)]">
                <span className="text-xs font-bold text-[var(--lm-sage-700)] uppercase block mb-1">
                  Step 2 · Capability
                </span>
                <span className="text-small text-[var(--lm-ink)] font-medium">
                  Could you have solved it? Did you solve it easily, need 1 minute more, need a conceptual hint, or cannot solve?
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--lm-sage-200)] space-y-3">
            <h2 className="text-h3 font-serif font-bold text-[var(--lm-ink)] m-0">
              Judgement and Knowledge: Four Decision Grades
            </h2>
            <p className="text-small text-[var(--lm-text-muted)] m-0 leading-relaxed">
              Judgement is choosing the right question. Knowledge is being able to solve it. Combining them reveals your Grade:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {(['A', 'B', 'C', 'D'] as GradeLetter[]).map((grade) => (
                <div
                  key={grade}
                  className="p-3 rounded-[var(--lm-radius-md)] border flex flex-col items-center text-center gap-1.5"
                  style={{
                    backgroundColor: GRADE_DETAILS[grade].bg,
                    borderColor: GRADE_DETAILS[grade].fg,
                    color: GRADE_DETAILS[grade].fg,
                  }}
                >
                  <GradeChip grade={grade} variant="compact" />
                  <span className="text-xs font-bold">Grade {grade}</span>
                  <span className="text-[11px] opacity-80 leading-tight">
                    {GRADE_DETAILS[grade].label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--lm-sage-200)] space-y-2">
            <h2 className="text-h3 font-serif font-bold text-[var(--lm-ink)] m-0">Ground rules</h2>
            <ul className="text-small text-[var(--lm-text-muted)] space-y-1.5 list-disc pl-5 m-0 leading-relaxed">
              <li>Never type the actual question text. Only enter personal reflections.</li>
              <li>Comments are optional and capped at 200 characters.</li>
              <li>You may skip questions you did not encounter; unrecorded questions are safely excluded.</li>
              <li>You can save a section at any time and return to complete others.</li>
            </ul>
          </div>
        </Card>

        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" onClick={() => setViewMode('list')}>
            Back
          </Button>
          <SpecularButton
            size="md"
            radius={9999}
            onClick={handleContinueFromInstructions}
            aria-label="Continue to mock details"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </SpecularButton>
        </div>
      </div>
    );
  }

  // ── 3. MOCK DETAILS VIEW ──────────────────────────────────────
  if (viewMode === 'details') {
    return (
      <div className="flex flex-col gap-6 max-w-[720px] mx-auto py-6 animate-fade-in">
        <button
          type="button"
          onClick={() => setViewMode('instructions')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--lm-sage-700)] hover:underline self-start cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to instructions
        </button>

        <div>
          <span className="text-caption font-bold text-[var(--lm-sage-700)] uppercase tracking-wider">
            Step 1 of 2
          </span>
          <h1 className="text-h1 text-[var(--lm-ink)] m-0 mt-1">Mock details</h1>
          <p className="text-body text-[var(--lm-text-muted)] m-0 mt-1">
            Enter test identifiers and scores from your scorecard report.
          </p>
        </div>

        <Card className="p-6 flex flex-col gap-5 bg-[var(--lm-surface)] border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-card)] shadow-[var(--lm-shadow-card)]">
          {/* Mock Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="mock-name" className="text-body font-semibold text-[var(--lm-ink)]">
              Mock name <span className="text-[var(--lm-sage-700)]">*</span>
            </label>
            <input
              id="mock-name"
              type="text"
              maxLength={40}
              value={mockDetails.name}
              onChange={(e) => setMockDetails((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. AIMCAT 2026 / CL Countdown 3"
              className="p-3 border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-sm)] text-body text-[var(--lm-ink)] bg-[var(--lm-surface)] focus:outline-none focus:border-[var(--lm-sage-700)]"
            />
            {detailsErrors.name && (
              <span className="text-xs text-[var(--lm-ink)] font-semibold flex items-center gap-1">
                <Info size={13} className="text-[var(--lm-amber-400)]" />
                {detailsErrors.name}
              </span>
            )}
          </div>

          {/* Provider Select */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="mock-provider" className="text-body font-semibold text-[var(--lm-ink)]">
              Mock provider <span className="text-[var(--lm-sage-700)]">*</span>
            </label>
            <select
              id="mock-provider"
              value={mockDetails.provider}
              onChange={(e) => setMockDetails((prev) => ({ ...prev, provider: e.target.value }))}
              className="p-3 border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-sm)] text-body text-[var(--lm-ink)] bg-[var(--lm-surface)] focus:outline-none focus:border-[var(--lm-sage-700)]"
            >
              <option value="">Choose a provider</option>
              {MOCK_PROVIDERS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {detailsErrors.provider && (
              <span className="text-xs text-[var(--lm-ink)] font-semibold flex items-center gap-1">
                <Info size={13} className="text-[var(--lm-amber-400)]" />
                {detailsErrors.provider}
              </span>
            )}
          </div>

          {/* If Other Provider -> Text Field */}
          {mockDetails.provider === 'Other' && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="provider-other" className="text-body font-semibold text-[var(--lm-ink)]">
                Provider name <span className="text-[var(--lm-sage-700)]">*</span>
              </label>
              <input
                id="provider-other"
                type="text"
                maxLength={40}
                value={mockDetails.providerOther || ''}
                onChange={(e) => setMockDetails((prev) => ({ ...prev, providerOther: e.target.value }))}
                placeholder="Enter coaching institute or mock test series"
                className="p-3 border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-sm)] text-body text-[var(--lm-ink)] bg-[var(--lm-surface)] focus:outline-none focus:border-[var(--lm-sage-700)]"
              />
              {detailsErrors.providerOther && (
                <span className="text-xs text-[var(--lm-ink)] font-semibold flex items-center gap-1">
                  <Info size={13} className="text-[var(--lm-amber-400)]" />
                  {detailsErrors.providerOther}
                </span>
              )}
            </div>
          )}

          {/* Date Taken */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="mock-date" className="text-body font-semibold text-[var(--lm-ink)]">
              Date taken <span className="text-[var(--lm-sage-700)]">*</span>
            </label>
            <input
              id="mock-date"
              type="date"
              value={mockDetails.dateTaken}
              onChange={(e) => setMockDetails((prev) => ({ ...prev, dateTaken: e.target.value }))}
              className="p-3 border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-sm)] text-body text-[var(--lm-ink)] bg-[var(--lm-surface)] focus:outline-none focus:border-[var(--lm-sage-700)]"
            />
            {detailsErrors.dateTaken && (
              <span className="text-xs text-[var(--lm-ink)] font-semibold flex items-center gap-1">
                <Info size={13} className="text-[var(--lm-amber-400)]" />
                {detailsErrors.dateTaken}
              </span>
            )}
          </div>

          {/* Mock Type (2 chips, none selected) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-body font-semibold text-[var(--lm-ink)]">
              Mock type <span className="text-[var(--lm-sage-700)]">*</span>
            </label>
            <div className="flex items-center gap-3">
              {([
                { type: 'full', label: 'Full-length mock' },
                { type: 'sectional', label: 'Sectional test' },
              ] as const).map(({ type, label }) => {
                const isSelected = mockDetails.mockType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMockDetails((prev) => ({ ...prev, mockType: type }))}
                    aria-pressed={isSelected}
                    className={[
                      'px-4 py-2 rounded-full border text-small font-semibold transition-all cursor-pointer flex items-center gap-1.5',
                      isSelected
                        ? 'bg-[var(--lm-sage-100)] text-[var(--lm-sage-700)] border-[var(--lm-sage-700)] font-bold'
                        : 'bg-[var(--lm-surface)] text-[var(--lm-ink)] border-[var(--lm-sage-200)] hover:bg-[var(--lm-sage-50)]',
                    ].join(' ')}
                  >
                    {isSelected && <CheckCircle2 size={15} className="text-[var(--lm-sage-700)]" />}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
            {detailsErrors.mockType && (
              <span className="text-xs text-[var(--lm-ink)] font-semibold flex items-center gap-1">
                <Info size={13} className="text-[var(--lm-amber-400)]" />
                {detailsErrors.mockType}
              </span>
            )}
          </div>

          {/* Section Scores & Overall Score */}
          <div className="pt-3 border-t border-[var(--lm-sage-200)] space-y-4">
            <div>
              <span className="text-body font-semibold text-[var(--lm-ink)] block">
                Scores (optional)
              </span>
              <span className="text-caption text-[var(--lm-text-muted)] block">
                Entering scores here sets your &quot;Actual&quot; scores in the summary automatically.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex flex-col gap-1 text-caption font-semibold text-[var(--lm-ink)]">
                VARC score
                <input
                  type="number"
                  placeholder="e.g. 30"
                  value={mockDetails.varcScore ?? ''}
                  onChange={(e) =>
                    setMockDetails((prev) => ({
                      ...prev,
                      varcScore: e.target.value === '' ? null : parseInt(e.target.value, 10),
                    }))
                  }
                  className="p-2.5 border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-sm)] text-body font-mono text-[var(--lm-ink)] bg-[var(--lm-surface)]"
                />
                {detailsErrors.varcScore && (
                  <span className="text-[11px] text-[var(--lm-ink)] font-semibold">
                    {detailsErrors.varcScore}
                  </span>
                )}
              </label>

              <label className="flex flex-col gap-1 text-caption font-semibold text-[var(--lm-ink)]">
                LRDI score
                <input
                  type="number"
                  placeholder="e.g. 21"
                  value={mockDetails.lrdiScore ?? ''}
                  onChange={(e) =>
                    setMockDetails((prev) => ({
                      ...prev,
                      lrdiScore: e.target.value === '' ? null : parseInt(e.target.value, 10),
                    }))
                  }
                  className="p-2.5 border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-sm)] text-body font-mono text-[var(--lm-ink)] bg-[var(--lm-surface)]"
                />
                {detailsErrors.lrdiScore && (
                  <span className="text-[11px] text-[var(--lm-ink)] font-semibold">
                    {detailsErrors.lrdiScore}
                  </span>
                )}
              </label>

              <label className="flex flex-col gap-1 text-caption font-semibold text-[var(--lm-ink)]">
                QA score
                <input
                  type="number"
                  placeholder="e.g. 24"
                  value={mockDetails.qaScore ?? ''}
                  onChange={(e) =>
                    setMockDetails((prev) => ({
                      ...prev,
                      qaScore: e.target.value === '' ? null : parseInt(e.target.value, 10),
                    }))
                  }
                  className="p-2.5 border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-sm)] text-body font-mono text-[var(--lm-ink)] bg-[var(--lm-surface)]"
                />
                {detailsErrors.qaScore && (
                  <span className="text-[11px] text-[var(--lm-ink)] font-semibold">
                    {detailsErrors.qaScore}
                  </span>
                )}
              </label>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <label className="flex flex-col gap-1 flex-1 text-caption font-semibold text-[var(--lm-ink)]">
                Overall score (optional)
                <input
                  type="number"
                  placeholder="Leave empty to calculate from sections"
                  value={mockDetails.overallScore ?? ''}
                  onChange={(e) =>
                    setMockDetails((prev) => ({
                      ...prev,
                      overallScore: e.target.value === '' ? null : parseInt(e.target.value, 10),
                    }))
                  }
                  className="p-2.5 border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-sm)] text-body font-mono text-[var(--lm-ink)] bg-[var(--lm-surface)]"
                />
                {detailsErrors.overallScore && (
                  <span className="text-xs text-[var(--lm-ink)] font-semibold flex items-center gap-1 mt-1">
                    <Info size={13} className="text-[var(--lm-amber-400)]" />
                    {detailsErrors.overallScore}
                  </span>
                )}
              </label>

              {/* Read-only computed total if only sections entered */}
              {mockDetails.overallScore === null &&
                (mockDetails.varcScore !== null || mockDetails.lrdiScore !== null || mockDetails.qaScore !== null) && (
                  <div className="p-3 bg-[var(--lm-sage-50)] border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-md)] flex items-center gap-3">
                    <span className="text-caption text-[var(--lm-text-muted)]">Computed Total:</span>
                    <span className="text-h2 font-bold font-serif text-[var(--lm-sage-700)]">
                      {(mockDetails.varcScore || 0) + (mockDetails.lrdiScore || 0) + (mockDetails.qaScore || 0)}
                    </span>
                  </div>
                )}
            </div>
          </div>

          {/* Composure rating during mock (optional 5 points) */}
          <div className="pt-3 border-t border-[var(--lm-sage-200)] space-y-2">
            <span className="text-body font-semibold text-[var(--lm-ink)] block">
              How calm did you feel during this mock? (optional)
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { val: 1, label: 'Very anxious' },
                { val: 2, label: 'Tense' },
                { val: 3, label: 'Balanced' },
                { val: 4, label: 'Steady' },
                { val: 5, label: 'Very composed' },
              ].map(({ val, label }) => {
                const isSelected = mockDetails.composure === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setMockDetails((prev) => ({ ...prev, composure: isSelected ? null : val }))}
                    aria-pressed={isSelected}
                    className={[
                      'px-3.5 py-1.5 rounded-full border text-caption font-semibold transition-all cursor-pointer',
                      isSelected
                        ? 'bg-[var(--lm-sage-900)] text-white border-[var(--lm-sage-900)]'
                        : 'bg-[var(--lm-surface)] text-[var(--lm-ink)] border-[var(--lm-sage-200)] hover:bg-[var(--lm-sage-50)]',
                    ].join(' ')}
                  >
                    {val} · {label}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" onClick={() => setViewMode('instructions')}>
            Back
          </Button>
          <SpecularButton
            size="md"
            radius={9999}
            onClick={handleContinueToAnalysis}
            aria-label="Continue to analysis"
          >
            <span>Continue to analysis</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </SpecularButton>
        </div>
      </div>
    );
  }

  // ── 4. SECTION SELECT VIEW ────────────────────────────────────
  if (viewMode === 'section_select') {
    return (
      <div className="flex flex-col gap-6 max-w-[720px] mx-auto py-6 animate-fade-in">
        <button
          type="button"
          onClick={() => setViewMode('list')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--lm-sage-700)] hover:underline self-start cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to mock overview
        </button>

        <div>
          <span className="text-caption font-bold text-[var(--lm-sage-700)] uppercase tracking-wider">
            Step 2 of 2 · {activeMock?.label}
          </span>
          <h1 className="text-h1 text-[var(--lm-ink)] m-0 mt-1">Choose a section</h1>
          <p className="text-body text-[var(--lm-text-muted)] m-0 mt-1">
            Pick which section from this mock you want to classify question by question.
          </p>
        </div>

        {/* Section Cards (starts with none selected) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(['VARC', 'LRDI', 'QA'] as const).map((type) => {
            const isSelected = activeSectionType === type;
            const alreadyRecorded = activeMock?.sections.some((s) => s.section === type);

            return (
              <Card
                key={type}
                onClick={() => handleSelectSection(type)}
                className={[
                  'p-6 flex flex-col justify-between gap-3 cursor-pointer transition-all rounded-[var(--lm-radius-card)]',
                  isSelected
                    ? 'border-2 border-[var(--lm-sage-700)] bg-[var(--lm-sage-50)] shadow-md'
                    : 'border border-[var(--lm-sage-200)] bg-[var(--lm-surface)] hover:bg-[var(--lm-sage-50)] shadow-xs',
                ].join(' ')}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-h2 font-serif font-bold text-[var(--lm-ink)]">{type}</span>
                    {alreadyRecorded && (
                      <span className="text-caption font-bold px-2 py-0.5 rounded-full bg-[var(--grade-a-bg)] text-[var(--grade-a-fg)]">
                        Done
                      </span>
                    )}
                  </div>
                  <span className="text-caption text-[var(--lm-text-muted)] font-mono block">
                    {defaultCounts[type]} questions
                  </span>
                </div>

                <div className="text-xs font-semibold text-[var(--lm-sage-700)] flex items-center gap-1">
                  {isSelected ? (
                    <>
                      <CheckCircle2 size={14} /> <span>Selected</span>
                    </>
                  ) : (
                    <span>Tap to select</span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Stepper for custom question count if selected */}
        {activeSectionType && (
          <Card className="p-6 flex flex-col gap-3 bg-[var(--lm-surface)] border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-card)] shadow-xs">
            <label className="flex flex-col gap-1.5 text-body-strong text-[var(--lm-ink)]">
              Questions in this section
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={questionCountInput}
                  onChange={(e) => setQuestionCountInput(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                  className="w-28 p-2.5 border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-sm)] text-h3 font-bold text-[var(--lm-ink)] font-mono bg-[var(--lm-surface)]"
                />
                <span className="text-small text-[var(--lm-text-muted)]">
                  CAT default: {defaultCounts[activeSectionType]} questions
                </span>
              </div>
            </label>
          </Card>
        )}

        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" onClick={() => setViewMode('list')}>
            Cancel
          </Button>
          <SpecularButton
            size="md"
            radius={9999}
            disabled={!activeSectionType}
            onClick={handleStartSection}
            aria-label="Start section"
          >
            <span>Start section</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </SpecularButton>
        </div>
      </div>
    );
  }

  // ── 5. ENTRY WORKSPACE VIEW ───────────────────────────────────
  if (viewMode === 'entry') {
    const currentR = records[currentQIndex] || { n: currentQIndex + 1, type: '' };
    const currentGrade = currentR.outcomeCode ? gradeForOutcome(currentR.outcomeCode) : null;
    const recordedCount = records.filter((r) => r.step1 && r.step2).length;

    return (
      <div className="flex flex-col gap-6 max-w-[720px] mx-auto py-6 pb-12 animate-fade-in">
        {/* Header bar */}
        <div className="flex items-center justify-between gap-4 pb-2 border-b border-[var(--lm-sage-200)]">
          <div className="flex items-center gap-2">
            <span className="text-caption font-bold px-2.5 py-0.5 rounded-[var(--lm-radius-pill)] bg-[var(--lm-sage-100)] text-[var(--lm-sage-700)] border border-[var(--lm-sage-200)]">
              {activeSectionType} · {activeMock?.label}
            </span>
          </div>
          <span className="text-caption text-[var(--lm-text-muted)] font-medium">
            {recordedCount} of {records.length} classified
          </span>
        </div>

        <ProgressBar current={recordedCount} total={records.length} />

        {/* Question Jumper Grid */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {records.map((r, idx) => {
            const isCur = idx === currentQIndex;
            const letter = r.outcomeCode ? gradeForOutcome(r.outcomeCode) : null;
            const details = letter ? GRADE_DETAILS[letter] : null;

            return (
              <button
                key={r.n}
                type="button"
                onClick={() => setCurrentQIndex(idx)}
                className={[
                  'w-9 h-9 rounded-[var(--lm-radius-sm)] border text-caption font-bold flex items-center justify-center transition-all cursor-pointer',
                  isCur ? 'ring-2 ring-offset-1 ring-[var(--lm-sage-700)]' : '',
                  r.outcomeCode ? '' : 'bg-[var(--lm-surface)] text-[var(--lm-text-muted)] border-[var(--lm-sage-200)]',
                ].join(' ')}
                style={
                  details
                    ? {
                        backgroundColor: details.bg,
                        color: details.fg,
                        borderColor: isCur ? 'var(--lm-sage-700)' : 'transparent',
                      }
                    : undefined
                }
              >
                {r.n}
              </button>
            );
          })}
        </div>

        {/* Active Question Entry Card */}
        <Card className="p-6 flex flex-col gap-6 bg-[var(--lm-surface)] border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-card)] shadow-[var(--lm-shadow-card)]">
          {/* Top question row: title and GradeChip */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-h2 font-semibold text-[var(--lm-ink)] m-0">
                Question {currentR.n}
              </h2>
              {currentGrade ? (
                <GradeChip grade={currentGrade} variant="full" />
              ) : (
                <span className="text-caption text-[var(--lm-text-muted)] italic">
                  Unclassified
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQIndex === 0}
                className="text-caption"
              >
                Prev
              </Button>
              <Button
                variant="ghost"
                onClick={() => setCurrentQIndex((prev) => Math.min(records.length - 1, prev + 1))}
                disabled={currentQIndex === records.length - 1}
                className="text-caption"
              >
                Next
              </Button>
            </div>
          </div>

          {/* Question Type Select (Starts unselected with "Choose a type") */}
          <div className="flex flex-col gap-1.5">
            <label className="text-caption font-semibold text-[var(--lm-ink)]">
              Question category / topic
            </label>
            <select
              value={currentR.type || ''}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="p-2.5 border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-sm)] text-body text-[var(--lm-ink)] bg-[var(--lm-surface)]"
            >
              <option value="">Choose a type</option>
              {sectionQuestionTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Step 1: What happened? (None pre-selected) */}
          <div className="flex flex-col gap-2 pt-2 border-t border-[var(--lm-sage-200)]">
            <span className="text-body font-semibold text-[var(--lm-ink)]">
              Step 1 · What happened?
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { val: 'correct', label: 'Attempted and correct' },
                { val: 'wrong', label: 'Attempted and wrong' },
                { val: 'left', label: 'Left after reading' },
                { val: 'unseen', label: 'Left unseen / out of time' },
              ].map(({ val, label }) => {
                const isSelected = currentR.step1 === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleRecordStep1(val as Step1Choice)}
                    aria-pressed={isSelected}
                    className={[
                      'p-3 rounded-[var(--lm-radius-sm)] border text-left text-small font-medium transition-all cursor-pointer flex items-center justify-between',
                      isSelected
                        ? 'bg-[var(--lm-sage-100)] text-[var(--lm-sage-700)] border-[var(--lm-sage-700)] font-bold'
                        : 'bg-[var(--lm-surface)] text-[var(--lm-ink)] border-[var(--lm-sage-200)] hover:bg-[var(--lm-sage-50)]',
                    ].join(' ')}
                  >
                    <span>{label}</span>
                    {isSelected && <CheckCircle2 size={16} className="text-[var(--lm-sage-700)]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Could you have solved it? (None pre-selected) */}
          <div className="flex flex-col gap-2 pt-2 border-t border-[var(--lm-sage-200)]">
            <span className="text-body font-semibold text-[var(--lm-ink)]">
              Step 2 · Could you have solved it?
            </span>
            {!currentR.step1 ? (
              <p className="text-small text-[var(--lm-text-muted)] italic m-0">
                Select Step 1 above to reveal decision nuance options.
              </p>
            ) : currentR.step1 === 'correct' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { val: 'fast', label: 'Solved it in no time' },
                  { val: 'slow', label: 'Took a lot of time' },
                  { val: 'guessed', label: 'Guessed / got lucky' },
                ].map(({ val, label }) => {
                  const isSelected = currentR.step2 === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleRecordStep2(val as Step2)}
                      aria-pressed={isSelected}
                      className={[
                        'p-3 rounded-[var(--lm-radius-sm)] border text-left text-small font-medium transition-all cursor-pointer flex items-center justify-between',
                        isSelected
                          ? 'bg-[var(--lm-sage-100)] text-[var(--lm-sage-700)] border-[var(--lm-sage-700)] font-bold'
                          : 'bg-[var(--lm-surface)] text-[var(--lm-ink)] border-[var(--lm-sage-200)] hover:bg-[var(--lm-sage-50)]',
                      ].join(' ')}
                    >
                      <span>{label}</span>
                      {isSelected && <CheckCircle2 size={16} className="text-[var(--lm-sage-700)]" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { val: 'can_solve', label: currentR.step1 === 'wrong' ? 'Wrong, but could solve' : 'Could solve' },
                  { val: 'cannot_solve', label: currentR.step1 === 'wrong' ? 'Wrong, cannot solve' : 'Cannot solve' },
                ].map(({ val, label }) => {
                  const isSelected = currentR.step2 === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleRecordStep2(val as Step2)}
                      aria-pressed={isSelected}
                      className={[
                        'p-3 rounded-[var(--lm-radius-sm)] border text-left text-small font-medium transition-all cursor-pointer flex items-center justify-between',
                        isSelected
                          ? 'bg-[var(--lm-sage-100)] text-[var(--lm-sage-700)] border-[var(--lm-sage-700)] font-bold'
                          : 'bg-[var(--lm-surface)] text-[var(--lm-ink)] border-[var(--lm-sage-200)] hover:bg-[var(--lm-sage-50)]',
                      ].join(' ')}
                    >
                      <span>{label}</span>
                      {isSelected && <CheckCircle2 size={16} className="text-[var(--lm-sage-700)]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Comment (up to 200 chars) */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-[var(--lm-sage-200)]">
            <div className="flex items-center justify-between">
              <label className="text-caption font-semibold text-[var(--lm-ink)]">
                Reflection note (optional)
              </label>
              <span className="text-caption text-[var(--lm-text-muted)] font-mono">
                {(currentR.comment || '').length} / 200
              </span>
            </div>
            <textarea
              maxLength={200}
              rows={2}
              value={currentR.comment || ''}
              onChange={(e) => handleCommentChange(e.target.value)}
              placeholder={commentHelper}
              className="p-3 border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-sm)] text-body text-[var(--lm-ink)] bg-[var(--lm-surface)] resize-none"
            />
          </div>
        </Card>

        {/* Action bar */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" onClick={() => setViewMode('section_select')}>
            Change section
          </Button>

          <Button variant="primary-arrow" onClick={handleSaveSection}>
            Save section & View summary
          </Button>
        </div>
      </div>
    );
  }

  // ── 6. SUMMARY VIEW ───────────────────────────────────────────
  if (viewMode === 'summary') {
    if (!activeMock) {
      return (
        <div className="max-w-[720px] mx-auto py-8">
          <EmptyState message="Mock not found." onAction={() => setViewMode('list')} actionLabel="Back" />
        </div>
      );
    }

    const summary = analyzeMockEntry(activeMock);

    return (
      <div className="flex flex-col gap-6 max-w-[720px] mx-auto py-6 animate-fade-in">
        <button
          type="button"
          onClick={() => setViewMode('list')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--lm-sage-700)] hover:underline self-start cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to mocks overview
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-h1 text-[var(--lm-ink)] m-0">
              {activeMock.label} — Summary
            </h1>
            <span className="text-caption text-[var(--lm-text-muted)] font-mono block mt-0.5">
              {activeMock.date} {activeMock.provider ? `· ${activeMock.provider}` : ''}
            </span>
          </div>

          <Button
            variant="secondary"
            onClick={() => {
              setActiveSectionType(null);
              setViewMode('section_select');
            }}
          >
            Add another section
          </Button>
        </div>

        {/* Verbatim BR-14 Sentence Banner */}
        <div className="p-4 bg-[var(--lm-sage-50)] border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-card)] text-small text-[var(--lm-ink)] flex items-start gap-3">
          <Info size={18} className="text-[var(--lm-sage-700)] shrink-0 mt-0.5" />
          <p className="m-0 leading-relaxed">{br14Sentence}</p>
        </div>

        {/* Potential Score and Leakage Hero Card */}
        <Card className="p-6 bg-[var(--lm-surface)] border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-card)] shadow-[var(--lm-shadow-card)] flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div>
              <span className="text-caption font-bold text-[var(--lm-sage-700)] uppercase tracking-wider block">
                Potential Score
              </span>
              <span className="text-display font-serif font-bold text-[var(--lm-sage-700)] leading-tight block mt-1">
                {summary.totalPotentialScore}
              </span>
              <span className="text-caption text-[var(--lm-text-muted)]">
                Score if every solvable question was answered
              </span>
            </div>

            <div>
              <span className="text-caption font-bold text-[var(--lm-text-muted)] uppercase tracking-wider block">
                Actual Score
              </span>
              <span className="text-display font-serif font-bold text-[var(--lm-ink)] leading-tight block mt-1">
                {summary.totalActualScore}
              </span>
              <span className="text-caption text-[var(--lm-text-muted)]">
                Recorded marks from scorecard
              </span>
            </div>

            <div>
              <span className="text-caption font-bold text-[var(--lm-sage-900)] uppercase tracking-wider block">
                Gap to work on
              </span>
              <span className="text-display font-serif font-bold text-[var(--lm-sage-900)] leading-tight block mt-1">
                +{summary.totalLeakage}
              </span>
              <span className="text-caption text-[var(--lm-text-muted)]">
                Leakage: +{summary.totalLeakage} marks
              </span>
            </div>
          </div>

          {/* Section Breakdown potentials */}
          <div className="pt-4 border-t border-[var(--lm-sage-200)] flex items-center justify-around flex-wrap gap-4 text-small">
            <span className="font-semibold text-[var(--lm-ink)]">
              VARC {summary.sections.find((s) => s.section === 'VARC')?.potentialScore ?? 0}
            </span>
            <span className="text-[var(--lm-sage-200)]">·</span>
            <span className="font-semibold text-[var(--lm-ink)]">
              LRDI {summary.sections.find((s) => s.section === 'LRDI')?.potentialScore ?? 0}
            </span>
            <span className="text-[var(--lm-sage-200)]">·</span>
            <span className="font-semibold text-[var(--lm-ink)]">
              QA {summary.sections.find((s) => s.section === 'QA')?.potentialScore ?? 0}
            </span>
          </div>
        </Card>

        {/* Grade Distribution BarRow */}
        <Card className="p-6 flex flex-col gap-4 bg-[var(--lm-surface)] border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-card)] shadow-xs">
          <h2 className="text-h2 font-semibold text-[var(--lm-ink)] m-0">Decision Grade Distribution</h2>
          <div className="space-y-3 pt-1">
            {(['A', 'B', 'C', 'D'] as const).map((grade) => {
              const details = GRADE_DETAILS[grade];
              const Icon = details.Icon;
              return (
                <BarRow
                  key={grade}
                  label={`Grade ${grade} · ${details.label}`}
                  count={summary.totalCounts[grade]}
                  maxCount={summary.totalCounts.total}
                  fillColor={details.fg}
                  icon={<Icon size={16} fill="currentColor" className="shrink-0" />}
                />
              );
            })}
          </div>
        </Card>

        {/* Post-Mock Reflection Prompt */}
        <Card className="p-6 flex flex-col gap-3 bg-[var(--lm-surface)] border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-card)] shadow-xs">
          <label className="text-body font-semibold text-[var(--lm-ink)]">
            Which one decision would you change in the next mock?
          </label>
          <textarea
            maxLength={280}
            rows={3}
            value={mockReflection}
            onChange={(e) => setMockReflection(e.target.value)}
            placeholder="e.g. Leave question traps after 45 seconds if the algebra path is unclear."
            className="p-3 border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-sm)] text-body text-[var(--lm-ink)] bg-[var(--lm-surface)] resize-none"
          />
        </Card>

        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" onClick={() => setViewMode('list')}>
            Done · Return to mocks
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setActiveSectionType(null);
              setViewMode('section_select');
            }}
          >
            Add another section
          </Button>
        </div>
      </div>
    );
  }

  return <div />;
}

export default MockPage;
