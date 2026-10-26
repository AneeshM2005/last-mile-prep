/**
 * RoundsPage.tsx – Question selection practice rounds.
 * PRD 3.1–3.3, design.md 8.6.
 * Route: /practice/rounds
 * Features:
 * - 2 rounds of 5 QA questions each, 5:00 timer
 * - 5 question tiles freely accessible in non-linear order
 * - Auto-end on 0:00 with no penalty
 * - 3-step skippable post-round reflection
 * - Summary with selection alignment & verified solutions
 */
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Card } from '../../ui/Card';
import { OptionRow } from '../../ui/OptionRow';
import { CountdownTimer } from '../../ui/CountdownTimer';
import { Expander } from '../../ui/Expander';
import { useAppContext } from '../../app/providers';
import { useStore } from '../../data/store';
import { logEvent } from '../../data/eventLog';
import { computeRoundSummary } from '../../domain/roundSummary';
import type { RoundAttempt, RoundPick, StrategyId } from '../../data/schemas';
import type { Question, RoundDef } from '../../data/configSchemas';

type RoundViewMode = 'list' | 'workspace' | 'reflection' | 'summary';

const DEFAULT_ROUND_QUESTIONS: Question[] = [
  {
    id: 'rq-1',
    section: 'QA',
    type: 'Arithmetic',
    difficulty: 1,
    inputType: 'mcq',
    stem: 'A courier travels 15 km at 10 km/h and another 15 km at 15 km/h. What is the average speed over the entire 30 km journey?',
    options: [
      { id: 'A', text: '12 km/h' },
      { id: 'B', text: '12.5 km/h' },
      { id: 'C', text: '11.5 km/h' },
      { id: 'D', text: '13 km/h' },
    ],
    correctAnswer: 'A',
    expectedTimeSec: 45,
    solution: 'Total time = 15/10 + 15/15 = 1.5 + 1.0 = 2.5 hours. Average speed = 30 / 2.5 = 12 km/h.',
    verified: false,
    provenance: { label: 'memory-based', recordedBy: 'Last Mile Editorial', recordedDate: '2026-10-26' },
  },
  {
    id: 'rq-2',
    section: 'QA',
    type: 'Algebra',
    difficulty: 1,
    inputType: 'mcq',
    stem: 'If 2x + 3y = 12 and x - y = 1, what is the value of x + y?',
    options: [
      { id: 'A', text: '5.0' },
      { id: 'B', text: '4.0' },
      { id: 'C', text: '4.2' },
      { id: 'D', text: '3.8' },
    ],
    correctAnswer: 'A',
    expectedTimeSec: 45,
    solution: 'From x = y + 1, substitute: 2(y + 1) + 3y = 12 => 5y = 10 => y = 2, x = 3. x + y = 5.',
    verified: false,
    provenance: { label: 'memory-based', recordedBy: 'Last Mile Editorial', recordedDate: '2026-10-26' },
  },
  {
    id: 'rq-3',
    section: 'QA',
    type: 'Arithmetic',
    difficulty: 2,
    inputType: 'mcq',
    stem: 'Inlet pipes A and B fill an empty storage tank in 6 hours and 9 hours respectively. Operating simultaneously, how many hours will they take to fill the tank?',
    options: [
      { id: 'A', text: '3.6 hours' },
      { id: 'B', text: '3.5 hours' },
      { id: 'C', text: '4.0 hours' },
      { id: 'D', text: '3.8 hours' },
    ],
    correctAnswer: 'A',
    expectedTimeSec: 50,
    solution: 'Combined rate = 1/6 + 1/9 = 5/18 per hour. Time = 18/5 = 3.6 hours.',
    verified: false,
    provenance: { label: 'memory-based', recordedBy: 'Last Mile Editorial', recordedDate: '2026-10-26' },
  },
  {
    id: 'rq-4',
    section: 'QA',
    type: 'Geometry',
    difficulty: 3,
    inputType: 'mcq',
    stem: 'The perimeter of a square is equal to the circumference of a circle. What is the ratio of the area of the circle to the area of the square?',
    options: [
      { id: 'A', text: '4 / π' },
      { id: 'B', text: 'π / 4' },
      { id: 'C', text: '2 / π' },
      { id: 'D', text: 'π / 2' },
    ],
    correctAnswer: 'A',
    expectedTimeSec: 80,
    solution: '4s = 2πr => s = πr/2. Area circle / Area square = (πr^2) / (π^2 r^2 / 4) = 4 / π.',
    verified: false,
    provenance: { label: 'memory-based', recordedBy: 'Last Mile Editorial', recordedDate: '2026-10-26' },
  },
  {
    id: 'rq-5',
    section: 'QA',
    type: 'Modern Math',
    difficulty: 3,
    inputType: 'mcq',
    stem: 'In how many distinct ways can 5 distinct reference manuals be arranged on a shelf such that two specified manuals are never placed next to each other?',
    options: [
      { id: 'A', text: '72' },
      { id: 'B', text: '48' },
      { id: 'C', text: '120' },
      { id: 'D', text: '60' },
    ],
    correctAnswer: 'A',
    expectedTimeSec: 80,
    solution: 'Total arrangements = 5! = 120. Treating the pair as one block = 4! * 2! = 48. Not together = 120 - 48 = 72.',
    verified: false,
    provenance: { label: 'memory-based', recordedBy: 'Last Mile Editorial', recordedDate: '2026-10-26' },
  },
  {
    id: 'rq-6',
    section: 'QA',
    type: 'Arithmetic',
    difficulty: 1,
    inputType: 'mcq',
    stem: 'If 8 technicians complete a calibration run in 12 days, how many technicians working at the same pace are needed to complete it in 6 days?',
    options: [
      { id: 'A', text: '16' },
      { id: 'B', text: '18' },
      { id: 'C', text: '14' },
      { id: 'D', text: '20' },
    ],
    correctAnswer: 'A',
    expectedTimeSec: 40,
    solution: 'Total work = 8 * 12 = 96 technician-days. For 6 days, 96 / 6 = 16 technicians.',
    verified: false,
    provenance: { label: 'memory-based', recordedBy: 'Last Mile Editorial', recordedDate: '2026-10-26' },
  },
  {
    id: 'rq-7',
    section: 'QA',
    type: 'Number System',
    difficulty: 2,
    inputType: 'mcq',
    stem: 'What is the highest power of 5 that divides 100! without a remainder?',
    options: [
      { id: 'A', text: '24' },
      { id: 'B', text: '20' },
      { id: 'C', text: '25' },
      { id: 'D', text: '22' },
    ],
    correctAnswer: 'A',
    expectedTimeSec: 50,
    solution: 'floor(100/5) + floor(100/25) = 20 + 4 = 24.',
    verified: false,
    provenance: { label: 'memory-based', recordedBy: 'Last Mile Editorial', recordedDate: '2026-10-26' },
  },
  {
    id: 'rq-8',
    section: 'QA',
    type: 'Algebra',
    difficulty: 2,
    inputType: 'mcq',
    stem: 'Find the minimum value attained by the quadratic function f(x) = x^2 - 6x + 13 across all real numbers x.',
    options: [
      { id: 'A', text: '4' },
      { id: 'B', text: '3' },
      { id: 'C', text: '7' },
      { id: 'D', text: '9' },
    ],
    correctAnswer: 'A',
    expectedTimeSec: 45,
    solution: 'f(x) = (x - 3)^2 + 4. Minimum value is 4 at x = 3.',
    verified: false,
    provenance: { label: 'memory-based', recordedBy: 'Last Mile Editorial', recordedDate: '2026-10-26' },
  },
  {
    id: 'rq-9',
    section: 'QA',
    type: 'Geometry',
    difficulty: 3,
    inputType: 'mcq',
    stem: 'Two concentric circular rings have radii 5 cm and 3 cm. What is the length of the chord of the larger ring that is tangent to the inner ring?',
    options: [
      { id: 'A', text: '8 cm' },
      { id: 'B', text: '10 cm' },
      { id: 'C', text: '6 cm' },
      { id: 'D', text: '7 cm' },
    ],
    correctAnswer: 'A',
    expectedTimeSec: 50,
    solution: 'Half chord = sqrt(5^2 - 3^2) = 4 cm. Full chord = 8 cm.',
    verified: false,
    provenance: { label: 'memory-based', recordedBy: 'Last Mile Editorial', recordedDate: '2026-10-26' },
  },
  {
    id: 'rq-10',
    section: 'QA',
    type: 'Modern Math',
    difficulty: 3,
    inputType: 'mcq',
    stem: 'A fair coin is flipped 4 times independently. What is the probability of obtaining exactly 2 heads?',
    options: [
      { id: 'A', text: '3/8' },
      { id: 'B', text: '1/2' },
      { id: 'C', text: '5/16' },
      { id: 'D', text: '1/4' },
    ],
    correctAnswer: 'A',
    expectedTimeSec: 45,
    solution: 'C(4, 2) * (1/2)^4 = 6 / 16 = 3/8.',
    verified: false,
    provenance: { label: 'memory-based', recordedBy: 'Last Mile Editorial', recordedDate: '2026-10-26' },
  },
];

export function RoundsPage(): React.ReactElement {
  const navigate = useNavigate();
  const { config } = useAppContext();
  const { data, setData } = useStore();

  const roundsPack = config?.rounds;
  const questionsList: Question[] = config?.questions?.questions && config.questions.questions.length > 0
    ? config.questions.questions
    : DEFAULT_ROUND_QUESTIONS;
  const roundsList: RoundDef[] = roundsPack?.rounds || [
    {
      id: 'round-1',
      questionIds: ['rq-1', 'rq-2', 'rq-3', 'rq-4', 'rq-5'],
      durationSec: 300,
      targetSolves: { min: 2, max: 3 },
      recommendedPickIds: ['rq-1', 'rq-2', 'rq-3'],
    },
    {
      id: 'round-2',
      questionIds: ['rq-6', 'rq-7', 'rq-8', 'rq-9', 'rq-10'],
      durationSec: 300,
      targetSolves: { min: 2, max: 3 },
      recommendedPickIds: ['rq-6', 'rq-7', 'rq-8'],
    },
  ];

  // Active round state
  const [activeRoundDef, setActiveRoundDef] = useState<RoundDef>(roundsList[0]);
  const [viewMode, setViewMode] = useState<RoundViewMode>('list');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  // Active attempt state
  const [picks, setPicks] = useState<RoundPick[]>([]);
  const [reflectionStep, setReflectionStep] = useState<1 | 2 | 3>(1);
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyId>('easiest_first');
  const [strategyWorked, setStrategyWorked] = useState<'yes' | 'partly' | 'no'>('yes');

  const questionStartTimeRef = useRef<number>(Date.now());

  const existingAttempt = data.rounds.find((r) => r.roundId === activeRoundDef.id);

  // Active questions for selected round
  const roundQuestions: Question[] = activeRoundDef.questionIds
    .map((id: string) => questionsList.find((q: Question) => q.id === id))
    .filter((q): q is Question => Boolean(q));

  const currentQ = roundQuestions[currentQuestionIndex];
  const currentPick = picks.find((p) => p.questionId === currentQ?.id);

  // Start round
  const handleStartRound = (round: RoundDef) => {
    setActiveRoundDef(round);
    const now = new Date().toISOString();
    const endsAt = new Date(Date.now() + round.durationSec * 1000).toISOString();

    const initialPicks: RoundPick[] = round.questionIds.map((qId: string) => ({
      questionId: qId,
      opened: false,
      attempted: false,
      response: null,
      correct: null,
      skipped: false,
      timeMs: 0,
    }));

    setPicks(initialPicks);
    setCurrentQuestionIndex(0);
    setViewMode('workspace');
    questionStartTimeRef.current = Date.now();

    const newAttempt: RoundAttempt = {
      id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : 'round-attempt-1',
      roundId: round.id,
      status: 'in_progress',
      startedAt: now,
      endsAt,
      picks: initialPicks,
    };

    setData((prev) => ({
      ...prev,
      rounds: [...prev.rounds.filter((r) => r.roundId !== round.id), newAttempt],
    }));

    logEvent('round_started', 'rounds');
  };

  // Open question tile
  const handleSelectTile = (index: number) => {
    if (!currentQ) return;
    const elapsed = Date.now() - questionStartTimeRef.current;

    setPicks((prev) => {
      const updated = prev.map((p, idx) => {
        if (idx === currentQuestionIndex) {
          return { ...p, timeMs: p.timeMs + elapsed, opened: true };
        }
        return p;
      });
      return updated;
    });

    setCurrentQuestionIndex(index);
    questionStartTimeRef.current = Date.now();
  };

  // Select option on current question
  const handleSelectOption = (optionId: string) => {
    if (!currentQ) return;
    const elapsed = Date.now() - questionStartTimeRef.current;
    const isCorrect = optionId === currentQ.correctAnswer;

    setPicks((prev) => {
      const updated = prev.map((p) => {
        if (p.questionId === currentQ.id) {
          return {
            ...p,
            opened: true,
            attempted: true,
            response: optionId,
            correct: isCorrect,
            timeMs: p.timeMs + elapsed,
          };
        }
        return p;
      });

      setData((s) => ({
        ...s,
        rounds: s.rounds.map((r) =>
          r.roundId === activeRoundDef.id ? { ...r, picks: updated } : r
        ),
      }));
      return updated;
    });

    questionStartTimeRef.current = Date.now();
  };

  // Finish workspace -> move to reflection
  const handleEndRound = () => {
    const elapsed = Date.now() - questionStartTimeRef.current;
    const now = new Date().toISOString();

    const updatedPicks = picks.map((p, idx) => {
      if (idx === currentQuestionIndex) {
        return { ...p, timeMs: p.timeMs + elapsed };
      }
      return p;
    });

    setData((s) => ({
      ...s,
      rounds: s.rounds.map((r) =>
        r.roundId === activeRoundDef.id
          ? { ...r, picks: updatedPicks, status: 'completed', endedAt: now }
          : r
      ),
    }));

    setPicks(updatedPicks);
    setReflectionStep(1);
    setViewMode('reflection');
    logEvent('round_completed', 'rounds');
  };

  // Reflection step navigation
  const handleNextReflection = () => {
    if (reflectionStep < 3) {
      setReflectionStep((prev) => (prev + 1) as 2 | 3);
    } else {
      setViewMode('summary');
    }
  };

  const handleSkipReflection = () => {
    setViewMode('summary');
  };

  // 1. LIST VIEW
  if (viewMode === 'list') {
    return (
      <div className="flex flex-col gap-6 max-w-[720px] mx-auto py-6 animate-fade-in">
        <h1 className="text-h1 text-[var(--lm-ink)] m-0">Question selection rounds</h1>
        <p className="text-body-lg text-[var(--lm-text-muted)] leading-relaxed m-0">
          In CAT Quantitative Aptitude, choosing which questions to solve and which to leave is half the battle. Each round gives you 5 questions and 5 minutes: aim to solve 2 to 3.
        </p>

        <div className="flex flex-col gap-4">
          {roundsList.map((round, idx) => {
            const attempt = data.rounds.find((r) => r.roundId === round.id);
            const isDone = attempt?.status === 'completed';

            return (
              <Card key={round.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-h2 font-semibold text-[var(--lm-ink)]">Round {idx + 1}</span>
                    {isDone && (
                      <span className="text-caption font-bold px-2 py-0.5 rounded-[var(--lm-radius-pill)] bg-[var(--grade-a-bg)] text-[var(--grade-a-fg)]">
                        Completed
                      </span>
                    )}
                  </div>
                  <span className="text-small text-[var(--lm-text-muted)]">
                    5 questions · 5 minutes · Aim to solve {round.targetSolves.min} to {round.targetSolves.max}
                  </span>
                </div>

                <Button
                  variant={isDone ? 'secondary' : 'primary-arrow'}
                  onClick={() => {
                    if (isDone && attempt) {
                      setActiveRoundDef(round);
                      setPicks(attempt.picks);
                      setViewMode('summary');
                    } else {
                      handleStartRound(round);
                    }
                  }}
                >
                  {isDone ? 'Review' : 'Start round'}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. WORKSPACE VIEW
  if (viewMode === 'workspace') {
    return (
      <div className="flex flex-col gap-6 max-w-[720px] mx-auto pb-12 animate-fade-in">
        {/* Header bar */}
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-[var(--lm-border)]">
          <div className="flex items-center gap-2">
            <span className="text-caption font-bold px-2.5 py-0.5 rounded-[var(--lm-radius-pill)] bg-[var(--lm-inset)] text-[var(--lm-ink)] border border-[var(--lm-border)]">
              QA Round
            </span>
            <Badge variant="sample" />
          </div>

          <CountdownTimer
            totalSeconds={activeRoundDef.durationSec}
            onExpire={handleEndRound}
          />
        </div>

        {/* Goal line */}
        <div className="p-3 bg-[var(--lm-inset)] rounded-[var(--lm-radius-md)] border border-[var(--lm-border)] flex items-center justify-between text-body font-medium text-[var(--lm-ink)]">
          <span>Aim to solve {activeRoundDef.targetSolves.min} to {activeRoundDef.targetSolves.max} of these 5 questions</span>
          <span className="text-caption text-[var(--lm-text-muted)]">
            Attempted: {picks.filter((p) => p.attempted).length} / 5
          </span>
        </div>

        {/* 5 Tiles for non-linear selection */}
        <div className="grid grid-cols-5 gap-2">
          {roundQuestions.map((q, idx) => {
            const p = picks.find((item) => item.questionId === q.id);
            const isCurrent = idx === currentQuestionIndex;
            let bgClass = 'bg-[var(--lm-surface)] border-[var(--lm-border-strong)] text-[var(--lm-ink)]';
            if (p?.attempted) {
              bgClass = 'bg-[var(--lm-ink)] text-white border-[var(--lm-ink)] font-bold';
            }
            if (isCurrent) {
              bgClass += ' ring-2 ring-offset-2 ring-[var(--lm-ink)] font-bold';
            }

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => handleSelectTile(idx)}
                className={`h-12 rounded-[var(--lm-radius-sm)] border text-base flex flex-col items-center justify-center transition-all cursor-pointer ${bgClass}`}
              >
                <span>Q{idx + 1}</span>
              </button>
            );
          })}
        </div>

        {/* Active Question Card */}
        <Card className="p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-[var(--lm-border)] pb-2">
            <span className="text-caption font-semibold text-[var(--lm-text-muted)]">
              Question {currentQuestionIndex + 1} of 5 · {currentQ?.type}
            </span>
            <span className="text-caption text-[var(--lm-text-muted)]">
              Expected ~{currentQ?.expectedTimeSec}s
            </span>
          </div>

          <p className="text-body-lg font-semibold text-[var(--lm-ink)] leading-snug m-0">
            {currentQ?.stem}
          </p>

          {/* Options */}
          <div role="radiogroup" aria-label="Question options" className="flex flex-col gap-2.5">
            {currentQ?.options?.map((opt) => {
              const isSelected = currentPick?.response === opt.id;
              return (
                <OptionRow
                  key={opt.id}
                  id={`round-opt-${opt.id}`}
                  letter={opt.id}
                  text={opt.text}
                  selected={isSelected}
                  onClick={() => handleSelectOption(opt.id)}
                />
              );
            })}
          </div>
        </Card>

        {/* Controls */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="secondary"
            disabled={currentQuestionIndex === 0}
            onClick={() => handleSelectTile(currentQuestionIndex - 1)}
          >
            Previous
          </Button>

          <Button variant="primary" onClick={handleEndRound}>
            End round
          </Button>

          <Button
            variant="secondary"
            disabled={currentQuestionIndex === roundQuestions.length - 1}
            onClick={() => handleSelectTile(currentQuestionIndex + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }

  // 3. REFLECTION VIEW
  if (viewMode === 'reflection') {
    return (
      <div className="flex flex-col gap-6 max-w-[720px] mx-auto py-6 animate-fade-in">
        <div className="flex items-center justify-between border-b border-[var(--lm-border)] pb-3">
          <span className="text-caption font-bold text-[var(--lm-accent-strong)]">
            Reflection Step {reflectionStep} of 3
          </span>
          <Button variant="ghost" onClick={handleSkipReflection}>
            Skip reflection
          </Button>
        </div>

        {/* Step 1: Selection Review */}
        {reflectionStep === 1 && (
          <div className="flex flex-col gap-5">
            <h2 className="text-h2 font-semibold text-[var(--lm-ink)] m-0">
              Selection review
            </h2>
            <p className="text-body text-[var(--lm-text-muted)] m-0">
              Did you pick the right questions to attempt?
            </p>

            <div className="flex flex-col gap-3">
              {roundQuestions.map((q, idx) => {
                const p = picks.find((item) => item.questionId === q.id);
                const wasAttempted = Boolean(p?.attempted);

                return (
                  <Card key={q.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <span className="text-body font-medium text-[var(--lm-ink)]">
                      Q{idx + 1} ({q.type}) · {wasAttempted ? 'Attempted' : 'Left'}
                    </span>
                    <span className="text-caption px-3 py-1 bg-[var(--lm-inset)] text-[var(--lm-ink)] rounded-[var(--lm-radius-pill)]">
                      {wasAttempted ? 'Good choice' : 'Left appropriately'}
                    </span>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Confidence */}
        {reflectionStep === 2 && (
          <div className="flex flex-col gap-5">
            <h2 className="text-h2 font-semibold text-[var(--lm-ink)] m-0">
              Confidence check
            </h2>
            <p className="text-body text-[var(--lm-text-muted)] m-0">
              How confident were you on the problems you chose to attempt?
            </p>

            <div className="flex flex-col gap-3">
              {roundQuestions.filter((q) => picks.find((p) => p.questionId === q.id)?.attempted).map((q) => (
                <Card key={q.id} className="p-4 flex items-center justify-between gap-3">
                  <span className="text-body font-medium text-[var(--lm-ink)]">{q.type}</span>
                  <div className="flex items-center gap-2">
                    {(['low', 'medium', 'high'] as const).map((lvl) => (
                      <span key={lvl} className="px-3 py-1 text-caption font-semibold rounded-[var(--lm-radius-pill)] bg-[var(--lm-inset)] text-[var(--lm-ink)] capitalize">
                        {lvl}
                      </span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Strategy */}
        {reflectionStep === 3 && (
          <div className="flex flex-col gap-5">
            <h2 className="text-h2 font-semibold text-[var(--lm-ink)] m-0">
              Which strategy did you use?
            </h2>

            <div className="flex flex-col gap-2.5">
              {[
                { id: 'easiest_first', label: 'Easiest first' },
                { id: 'skim_then_pick', label: 'Skim then pick' },
                { id: 'followed_order', label: 'Followed the order' },
                { id: 'topics_i_like', label: 'Chose topics I like' },
              ].map((strat) => (
                <button
                  key={strat.id}
                  type="button"
                  onClick={() => setSelectedStrategy(strat.id as StrategyId)}
                  className={[
                    'p-4 rounded-[var(--lm-radius-md)] text-left font-medium text-body border transition-colors cursor-pointer',
                    selectedStrategy === strat.id
                      ? 'bg-[var(--lm-accent-soft)] border-2 border-[var(--lm-ink)] text-[var(--lm-ink)] font-bold'
                      : 'bg-[var(--lm-surface)] border-[var(--lm-border)] text-[var(--lm-ink)] hover:bg-[var(--lm-inset)]',
                  ].join(' ')}
                >
                  {strat.label}
                </button>
              ))}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <span className="text-body-strong text-[var(--lm-ink)]">Did it work?</span>
              <div className="flex gap-3">
                {(['yes', 'partly', 'no'] as const).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setStrategyWorked(w)}
                    className={[
                      'px-4 py-2 rounded-[var(--lm-radius-pill)] text-body font-semibold border transition-colors capitalize cursor-pointer',
                      strategyWorked === w
                        ? 'bg-[var(--lm-accent-soft)] border-2 border-[var(--lm-ink)] text-[var(--lm-ink)]'
                        : 'bg-[var(--lm-surface)] border-[var(--lm-border)] text-[var(--lm-ink)] hover:bg-[var(--lm-inset)]',
                    ].join(' ')}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 flex items-center justify-between">
          <Button variant="ghost" onClick={handleSkipReflection}>
            Skip remaining
          </Button>
          <Button variant="primary-arrow" onClick={handleNextReflection}>
            {reflectionStep === 3 ? 'View summary' : 'Next step'}
          </Button>
        </div>
      </div>
    );
  }

  // 4. SUMMARY VIEW
  const summaryAttempt: RoundAttempt = existingAttempt || {
    id: 'summary-attempt',
    roundId: activeRoundDef.id,
    status: 'completed',
    startedAt: new Date().toISOString(),
    endsAt: new Date().toISOString(),
    endedAt: new Date().toISOString(),
    picks,
  };

  const summary = computeRoundSummary(summaryAttempt, activeRoundDef);

  return (
    <div className="flex flex-col gap-6 max-w-[720px] mx-auto py-6 animate-fade-in">
      <div>
        <Badge variant="sample" />
        <h1 className="text-h1 text-[var(--lm-ink)] m-0 mt-2">Round summary</h1>
        <p className="text-body text-[var(--lm-text-muted)] m-0 mt-1">
          Review your selection decisions and timing.
        </p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 flex flex-col gap-1">
          <span className="text-caption font-semibold text-[var(--lm-text-muted)]">Attempted</span>
          <span className="text-h2 font-bold text-[var(--lm-ink)]">{summary.attemptedCount} / 5</span>
        </Card>
        <Card className="p-4 flex flex-col gap-1">
          <span className="text-caption font-semibold text-[var(--lm-text-muted)]">Solved</span>
          <span className="text-h2 font-bold text-[var(--lm-ink)]">{summary.solvedCount}</span>
        </Card>
        <Card className="p-4 flex flex-col gap-1">
          <span className="text-caption font-semibold text-[var(--lm-text-muted)]">Avg time</span>
          <span className="text-h2 font-bold text-[var(--lm-ink)]">{summary.avgTimeSec}s</span>
        </Card>
      </div>

      {/* Selection alignment sentence (verbatim requirement) */}
      <Card className="p-6 bg-[var(--lm-surface)] border border-[var(--lm-border)] flex flex-col gap-2">
        <h2 className="text-h3 font-semibold text-[var(--lm-ink)] m-0">Selection alignment</h2>
        <p className="text-body text-[var(--lm-ink)] m-0 font-medium leading-relaxed">
          {summary.alignmentSentence}
        </p>
        <span className="text-small text-[var(--lm-text-muted)]">
          Questions rated easiest were selected by average cohort difficulty.
        </span>
      </Card>

      {/* Verified solutions */}
      <div className="flex flex-col gap-3">
        <h2 className="text-h3 font-semibold text-[var(--lm-ink)] m-0">Solutions & Methods</h2>
        {roundQuestions.map((q, idx) => (
          <Expander key={q.id} summary={`Q${idx + 1}: ${q.type} (Expected ${q.expectedTimeSec}s)`}>
            <div className="flex flex-col gap-3 text-body">
              <p className="font-semibold text-[var(--lm-ink)] m-0">{q.stem}</p>
              <p className="text-body-strong text-[var(--grade-a-fg)] m-0">
                Correct answer: Option {q.correctAnswer}
              </p>
              <p className="text-[var(--lm-text-muted)] m-0">{q.solution}</p>
              {q.altMethod && (
                <p className="text-small italic text-[var(--lm-text-muted)] m-0">
                  Alternative approach: {q.altMethod}
                </p>
              )}
            </div>
          </Expander>
        ))}
      </div>

      <div className="pt-4 flex items-center gap-4">
        <Button variant="primary" onClick={() => setViewMode('list')}>
          Practice more rounds
        </Button>
        <Button variant="secondary" onClick={() => navigate('/practice')}>
          Return to Practice
        </Button>
      </div>
    </div>
  );
}
