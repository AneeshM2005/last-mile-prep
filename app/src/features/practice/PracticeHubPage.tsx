/**
 * PracticeHubPage.tsx – Practice hub screen offering all focused practice modes.
 * PRD 3, design.md 8.5.
 * Route: /practice
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { useStore } from '../../data/store';
import {
  Compass,
  CheckCircle2,
  BookOpen,
  ClipboardList,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';

export function PracticeHubPage(): React.ReactElement {
  const navigate = useNavigate();
  const { data } = useStore();

  const isBaselineDone = Boolean(data.baseline && data.baseline.status === 'completed');
  const roundsCompletedCount = data.rounds.filter((r) => r.status === 'completed').length;
  const mocksRecordedCount = data.mocks.length;

  return (
    <div className="flex flex-col gap-6 max-w-[800px] mx-auto py-6 animate-fade-in">
      <div>
        <h1 className="text-h1 text-[var(--lm-ink)] m-0">Practice</h1>
        <p className="text-body text-[var(--lm-text-muted)] m-0 mt-1">
          Targeted exercises to sharpen test decisions and expand knowledge.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 1. Baseline Diagnostic */}
        <Card className="p-6 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-caption font-bold text-[var(--lm-accent-strong)] uppercase tracking-wider">
                Starting point
              </span>
              <div className="flex items-center gap-1.5">
                <Badge variant="sample" />
                {isBaselineDone && (
                  <span className="text-caption font-bold px-2 py-0.5 rounded-[var(--lm-radius-pill)] bg-[var(--grade-a-bg)] text-[var(--grade-a-fg)] flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    Done
                  </span>
                )}
              </div>
            </div>

            <h2 className="text-h2 font-semibold text-[var(--lm-ink)] m-0">
              Baseline diagnostic
            </h2>

            <p className="text-body text-[var(--lm-text-muted)] leading-relaxed m-0">
              Twelve questions across VARC, LRDI, and QA. 15 minutes. Identifies your starting timing and decision profile without pressure.
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant={isBaselineDone ? 'secondary' : 'primary-arrow'}
              onClick={() => navigate('/practice/baseline')}
              className="w-full sm:w-auto"
            >
              {isBaselineDone ? 'Retake or review' : 'Start baseline'}
            </Button>
          </div>
        </Card>

        {/* 2. Question Selection Rounds */}
        <Card className="p-6 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-caption font-bold text-[var(--lm-accent-strong)] uppercase tracking-wider">
                Timing & Selection
              </span>
              <div className="flex items-center gap-1.5">
                <Badge variant="sample" />
                {roundsCompletedCount > 0 && (
                  <span className="text-caption font-semibold text-[var(--lm-text-muted)] font-mono">
                    {roundsCompletedCount} done
                  </span>
                )}
              </div>
            </div>

            <h2 className="text-h2 font-semibold text-[var(--lm-ink)] m-0">
              Question selection
            </h2>

            <p className="text-body text-[var(--lm-text-muted)] leading-relaxed m-0">
              5 QA questions in 5 minutes. Learn which questions to solve and which to leave to hit your target score calmly.
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="primary-arrow"
              onClick={() => navigate('/practice/rounds')}
              className="w-full sm:w-auto"
            >
              Start rounds
            </Button>
          </div>
        </Card>

        {/* 3. Mock Analysis */}
        <Card className="p-6 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-caption font-bold text-[var(--lm-accent-strong)] uppercase tracking-wider">
                Honest potential
              </span>
              {mocksRecordedCount > 0 && (
                <span className="text-caption font-semibold text-[var(--lm-text-muted)] font-mono">
                  {mocksRecordedCount} mocks
                </span>
              )}
            </div>

            <h2 className="text-h2 font-semibold text-[var(--lm-ink)] m-0 flex items-center gap-2">
              <ClipboardList size={20} className="text-[var(--lm-accent-strong)]" />
              <span>Mock analysis</span>
            </h2>

            <p className="text-body text-[var(--lm-text-muted)] leading-relaxed m-0">
              Classify your mock decisions question by question and reveal your potential score: what you could score with steady choices.
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="secondary"
              onClick={() => navigate('/mock')}
              className="w-full sm:w-auto"
            >
              Open mock analysis
            </Button>
          </div>
        </Card>

        {/* 4. Spaced Revision */}
        <Card className="p-6 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-caption font-bold text-[var(--lm-accent-strong)] uppercase tracking-wider">
              Retention
            </span>

            <h2 className="text-h2 font-semibold text-[var(--lm-ink)] m-0 flex items-center gap-2">
              <RefreshCw size={20} className="text-[var(--lm-accent-strong)]" />
              <span>Spaced revision</span>
            </h2>

            <p className="text-body text-[var(--lm-text-muted)] leading-relaxed m-0">
              Four scheduled reminder intervals (1, 3, 7, 14, 30 days) to keep core formulas and rules fresh before the exam.
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="secondary"
              onClick={() => navigate('/revision')}
              className="w-full sm:w-auto"
            >
              View revision
            </Button>
          </div>
        </Card>

        {/* 5. Passage Reading */}
        <Card className="p-6 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-caption font-bold text-[var(--lm-accent-strong)] uppercase tracking-wider">
              Verbal & Vocabulary
            </span>

            <h2 className="text-h2 font-semibold text-[var(--lm-ink)] m-0 flex items-center gap-2">
              <BookOpen size={20} className="text-[var(--lm-accent-strong)]" />
              <span>Reading & Vocabulary</span>
            </h2>

            <p className="text-body text-[var(--lm-text-muted)] leading-relaxed m-0">
              Read curated editorial passages and tap unfamiliar words to add them directly to your personal flashcards.
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="secondary"
              onClick={() => navigate('/words')}
              className="w-full sm:w-auto"
            >
              Open words
            </Button>
          </div>
        </Card>

        {/* 6. OMET Teaser */}
        <Card className="p-6 flex flex-col justify-between gap-4 bg-[var(--lm-inset)] border border-[var(--lm-border)]">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-caption font-bold text-[var(--lm-text-muted)] uppercase tracking-wider">
                Beyond CAT
              </span>
              <span className="text-caption font-bold px-2 py-0.5 rounded-[var(--lm-radius-pill)] bg-[var(--lm-surface)] border border-[var(--lm-border)] text-[var(--lm-ink)]">
                Coming soon
              </span>
            </div>

            <h2 className="text-h2 font-semibold text-[var(--lm-ink)] m-0 flex items-center gap-2">
              <Compass size={20} className="text-[var(--lm-accent-strong)]" />
              <span>OMET preparation</span>
            </h2>

            <p className="text-body text-[var(--lm-text-muted)] leading-relaxed m-0">
              Explore how strategy and pacing shift for XAT, SNAP, NMAT, and other management entrance examinations.
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="ghost"
              onClick={() => navigate('/omet')}
              className="w-full sm:w-auto inline-flex items-center gap-1"
            >
              <span>Explore OMETs</span>
              <ArrowRight size={16} />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
