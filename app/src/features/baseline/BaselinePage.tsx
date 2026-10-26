/**
 * BaselinePage.tsx – 12-question diagnostic baseline flow.
 * PRD 2.1, design.md 8.4.
 * Route: /practice/baseline
 * Features:
 * - 12 questions (4 VARC, 4 LRDI, 4 QA)
 * - 15-minute quiet countdown timer with auto-submit
 * - Focus time tracking (pauses on visibility change)
 * - Optional confidence chips (Low, Medium, High)
 * - Question grid for non-linear jumping
 * - Immediate autosave to store & resume support
 * - Finish confirm dialog if questions are left
 * - Direct transition to post-baseline reflection and SWOT profile
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { OptionRow } from '../../ui/OptionRow';
import { CountdownTimer } from '../../ui/CountdownTimer';
import { QuestionGrid, type QuestionGridItem } from '../../ui/QuestionGrid';
import { Modal } from '../../ui/Modal';
import { Card } from '../../ui/Card';
import { useAppContext } from '../../app/providers';
import { useStore } from '../../data/store';
import { logEvent } from '../../data/eventLog';
import { computeBaselineScoring } from '../../domain/baselineScoring';
import type { BaselineAnswer, BaselineAttempt } from '../../data/schemas';
import type { Question } from '../../data/configSchemas';

export function BaselinePage(): React.ReactElement {
  const navigate = useNavigate();
  const { config } = useAppContext();
  const { data, setData } = useStore();

  const questionsPack = config?.questions;
  const questionsList: Question[] = questionsPack?.questions || [];
  const baselineIds: string[] = questionsPack?.baselineQuestionIds || [];

  // Filter the 12 baseline questions in order
  const baselineQuestions = baselineIds
    .map((id) => questionsList.find((q) => q.id === id))
    .filter((q): q is Question => Boolean(q));

  // Existing attempt from store or initialize fresh
  const existingAttempt = data.baseline;
  const [inProgress, setInProgress] = useState<boolean>(Boolean(existingAttempt && existingAttempt.status === 'in_progress'));
  const [currentIndex, setCurrentIndex] = useState<number>(existingAttempt ? existingAttempt.currentIndex : 0);
  const [answers, setAnswers] = useState<BaselineAnswer[]>(existingAttempt ? existingAttempt.answers : []);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(Boolean(existingAttempt && existingAttempt.status === 'completed'));

  // Question focus time measurement
  const questionStartTimeRef = useRef<number>(Date.now());

  // Focus time tracking & hidden tab detection
  useEffect(() => {
    questionStartTimeRef.current = Date.now();
  }, [currentIndex]);

  const currentQ = baselineQuestions[currentIndex];

  const currentAnswer = answers.find((a) => a.questionId === currentQ?.id);

  // Start baseline
  const handleStartBaseline = () => {
    const now = new Date().toISOString();
    const endsAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const newAttempt: BaselineAttempt = {
      id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : 'baseline-attempt-1',
      status: 'in_progress',
      startedAt: now,
      endsAt,
      currentIndex: 0,
      questionIds: baselineQuestions.map((q) => q.id),
      answers: baselineQuestions.map((q) => ({
        questionId: q.id,
        response: null,
        correct: null,
        skipped: false,
        timeMs: 0,
      })),
    };

    setAnswers(newAttempt.answers);
    setCurrentIndex(0);
    setInProgress(true);
    setIsCompleted(false);

    setData((prev) => ({ ...prev, baseline: newAttempt }));
    logEvent('baseline_started', 'baseline');
  };

  // Record answer change
  const handleSelectOption = (optionId: string) => {
    if (!currentQ) return;
    const elapsed = Date.now() - questionStartTimeRef.current;
    const isCorrect = optionId === currentQ.correctAnswer;

    setAnswers((prev) => {
      const updated = prev.map((a) => {
        if (a.questionId === currentQ.id) {
          return {
            ...a,
            response: optionId,
            correct: isCorrect,
            skipped: false,
            timeMs: a.timeMs + elapsed,
          };
        }
        return a;
      });

      // Autosave to store
      setData((s) => ({
        ...s,
        baseline: s.baseline ? { ...s.baseline, answers: updated, currentIndex } : null,
      }));
      return updated;
    });

    questionStartTimeRef.current = Date.now();
  };

  // Skip question
  const handleSkip = () => {
    if (!currentQ) return;
    const elapsed = Date.now() - questionStartTimeRef.current;

    setAnswers((prev) => {
      const updated = prev.map((a) => {
        if (a.questionId === currentQ.id) {
          return {
            ...a,
            skipped: true,
            timeMs: a.timeMs + elapsed,
          };
        }
        return a;
      });

      setData((s) => ({
        ...s,
        baseline: s.baseline ? { ...s.baseline, answers: updated, currentIndex } : null,
      }));
      return updated;
    });

    goToNext();
  };

  // Set optional confidence
  const handleSetConfidence = (confidence: 'low' | 'medium' | 'high') => {
    if (!currentQ) return;
    setAnswers((prev) => {
      const updated = prev.map((a) => {
        if (a.questionId === currentQ.id) {
          return { ...a, confidence };
        }
        return a;
      });

      setData((s) => ({
        ...s,
        baseline: s.baseline ? { ...s.baseline, answers: updated } : null,
      }));
      return updated;
    });
  };

  const goToNext = () => {
    if (currentIndex < baselineQuestions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setData((s) => ({
        ...s,
        baseline: s.baseline ? { ...s.baseline, currentIndex: nextIdx } : null,
      }));
    } else {
      checkFinish();
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      setData((s) => ({
        ...s,
        baseline: s.baseline ? { ...s.baseline, currentIndex: prevIdx } : null,
      }));
    }
  };

  const checkFinish = () => {
    const unansweredCount = answers.filter((a) => !a.response && !a.skipped).length;
    if (unansweredCount > 0) {
      setShowConfirmModal(true);
    } else {
      finishAttempt('finish');
    }
  };

  const finishAttempt = (endedBy: 'finish' | 'timeout') => {
    setShowConfirmModal(false);
    const now = new Date().toISOString();

    setData((prev) => {
      if (!prev.baseline) return prev;
      const completed: BaselineAttempt = {
        ...prev.baseline,
        status: 'completed',
        completedAt: now,
        endedBy,
      };
      return { ...prev, baseline: completed };
    });

    setInProgress(false);
    setIsCompleted(true);
    logEvent('baseline_completed', 'baseline');
  };

  // Grid items
  const gridItems: QuestionGridItem[] = baselineQuestions.map((q, idx) => {
    const ans = answers.find((a) => a.questionId === q.id);
    let status: QuestionGridItem['status'] = 'unvisited';
    if (idx === currentIndex) status = 'current';
    else if (ans?.response) status = 'answered';
    else if (ans?.skipped) status = 'skipped';
    return { index: idx, status };
  });

  // Calculate results if completed
  const scoringResult = existingAttempt && existingAttempt.status === 'completed'
    ? computeBaselineScoring(existingAttempt, baselineQuestions)
    : null;

  // 1. INTRO VIEW
  if (!inProgress && !isCompleted) {
    return (
      <div className="flex flex-col gap-6 max-w-[720px] mx-auto py-6 animate-fade-in">
        <h1 className="text-h1 text-[var(--lm-ink)] m-0">Baseline diagnostic</h1>
        <p className="text-body-lg text-[var(--lm-text-muted)] leading-relaxed m-0">
          Twelve questions across Verbal Ability, Data Interpretation, and Quantitative Aptitude. This establishes your starting timing and decision profile without tests or pressure.
        </p>

        <Card className="p-6 flex flex-col gap-4">
          <h2 className="text-h3 font-semibold text-[var(--lm-ink)] m-0">Assessment parameters</h2>
          <ul className="text-body text-[var(--lm-ink)] space-y-2 pl-5 m-0 list-disc">
            <li>12 questions (4 VARC, 4 LRDI, 4 QA)</li>
            <li>15 minutes quiet countdown</li>
            <li>Answer, skip, or jump freely using the question grid</li>
            <li>Optional confidence checks after answering</li>
          </ul>
        </Card>

        <div className="pt-2">
          <Button variant="primary-arrow" onClick={handleStartBaseline}>
            Start baseline
          </Button>
        </div>
      </div>
    );
  }

  // 2. COMPLETED VIEW
  if (isCompleted && scoringResult) {
    return (
      <div className="flex flex-col gap-8 max-w-[720px] mx-auto py-4 animate-fade-in">
        <div>
          <Badge variant="sample" />
          <h1 className="text-h1 text-[var(--lm-ink)] m-0 mt-2">Baseline complete</h1>
          <p className="text-body text-[var(--lm-text-muted)] m-0 mt-1">
            Your decision baseline is recorded. Your initial SWOT profile is ready.
          </p>
        </div>

        {/* Section summaries */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(['VARC', 'LRDI', 'QA'] as const).map((sec) => {
            const s = scoringResult.sectionSummaries[sec];
            return (
              <Card key={sec} className="p-5 flex flex-col gap-1">
                <span className="text-caption font-bold text-[var(--lm-accent-strong)]">{sec}</span>
                <span className="text-h2 font-bold text-[var(--lm-ink)]">
                  {s.correct} / {s.attempted}
                </span>
                <span className="text-small text-[var(--lm-text-muted)]">
                  {s.avgTimeSec}s avg · {s.skipped} skipped
                </span>
              </Card>
            );
          })}
        </div>

        {/* Reflection prompt */}
        <div className="p-6 rounded-[var(--lm-radius-lg)] bg-[var(--lm-inset)] border border-[var(--lm-border)]">
          <p className="text-reflect italic text-[var(--lm-ink)] m-0">
            &ldquo;What surprised you about how you worked through these?&rdquo;
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="primary-arrow" onClick={() => navigate('/profile')}>
            View SWOT profile
          </Button>
          <Button variant="secondary" onClick={() => navigate('/')}>
            Go to Today
          </Button>
        </div>
      </div>
    );
  }

  // 3. ASSESSMENT WORKSPACE VIEW
  return (
    <div className="flex flex-col gap-6 max-w-[720px] mx-auto pb-12 animate-fade-in">
      {/* Top status bar */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-[var(--lm-border)]">
        <div className="flex items-center gap-2">
          <span className="text-caption font-bold px-2 py-0.5 rounded-[var(--lm-radius-pill)] bg-[var(--lm-inset)] text-[var(--lm-ink)] border border-[var(--lm-border)]">
            {currentQ?.section}
          </span>
          <Badge variant="memory" label="Memory-based" />
          <Badge variant="sample" />
        </div>

        <CountdownTimer
          totalSeconds={15 * 60}
          onExpire={() => finishAttempt('timeout')}
        />
      </div>

      {/* Question Counter & Jump Grid */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-small text-[var(--lm-text-muted)] font-medium">
            Question {currentIndex + 1} of {baselineQuestions.length}
          </span>
          <span className="text-caption text-[var(--lm-text-muted)]">
            {currentQ?.type} · Expected ~{currentQ?.expectedTimeSec}s
          </span>
        </div>

        <QuestionGrid
          items={gridItems}
          currentIndex={currentIndex}
          onSelect={(idx) => setCurrentIndex(idx)}
        />
      </div>

      {/* Stimulus if present */}
      {currentQ?.stimulus && (
        <div className="p-5 bg-[var(--lm-inset)] rounded-[var(--lm-radius-md)] border border-[var(--lm-border)] text-body text-[var(--lm-ink)] leading-relaxed">
          {currentQ.stimulus.value}
        </div>
      )}

      {/* Question Stem */}
      <Card className="p-6 flex flex-col gap-5">
        <p className="text-body-lg font-semibold text-[var(--lm-ink)] leading-snug m-0">
          {currentQ?.stem}
        </p>

        {/* Options */}
        <div role="radiogroup" aria-label="Question options" className="flex flex-col gap-2.5">
          {currentQ?.options?.map((opt: { id: string; text: string }) => {
            const isSelected = currentAnswer?.response === opt.id;
            return (
              <OptionRow
                key={opt.id}
                id={`opt-${opt.id}`}
                letter={opt.id}
                text={opt.text}
                selected={isSelected}
                onClick={() => handleSelectOption(opt.id)}
              />
            );
          })}
        </div>

        {/* Optional Confidence Chip */}
        {(currentAnswer?.response || currentAnswer?.skipped) && (
          <div className="pt-3 border-t border-[var(--lm-border)] flex flex-wrap items-center gap-3">
            <span className="text-small text-[var(--lm-text-muted)]">Confidence:</span>
            {(['low', 'medium', 'high'] as const).map((lvl) => {
              const isSelected = currentAnswer.confidence === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => handleSetConfidence(lvl)}
                  className={[
                    'px-3 py-1 text-caption font-semibold rounded-[var(--lm-radius-pill)] border transition-all cursor-pointer capitalize',
                    isSelected
                      ? 'bg-[var(--lm-accent-soft)] border-2 border-[var(--lm-ink)] text-[var(--lm-ink)]'
                      : 'bg-[var(--lm-surface)] border-[var(--lm-border-strong)] text-[var(--lm-ink)] hover:bg-[var(--lm-inset)]',
                  ].join(' ')}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {/* Bottom controls */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="secondary"
          disabled={currentIndex === 0}
          onClick={goToPrev}
        >
          Previous
        </Button>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleSkip}>
            Skip
          </Button>

          {currentIndex === baselineQuestions.length - 1 ? (
            <Button variant="primary" onClick={checkFinish}>
              Finish baseline
            </Button>
          ) : (
            <Button variant="primary-arrow" onClick={goToNext}>
              Next
            </Button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        id="finish-confirm-modal"
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Finish baseline assessment?"
      >
        <div className="flex flex-col gap-6">
          <p className="text-body text-[var(--lm-ink)] m-0">
            You have {answers.filter((a) => !a.response && !a.skipped).length} unattempted questions. Would you like to finish and view your baseline SWOT profile?
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
              Keep answering
            </Button>
            <Button variant="primary" onClick={() => finishAttempt('finish')}>
              Finish and see SWOT
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
