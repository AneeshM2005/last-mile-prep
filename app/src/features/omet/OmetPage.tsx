/**
 * OmetPage.tsx – Other Management Entrance Tests teaser.
 * PRD 6, design.md 8.11.
 * Route: /omet
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { logEvent } from '../../data/eventLog';
import { Compass, Sparkles } from 'lucide-react';

export function OmetPage(): React.ReactElement {
  const navigate = useNavigate();

  useEffect(() => {
    logEvent('omet_teaser_viewed', 'omet');
  }, []);

  return (
    <div className="flex flex-col gap-8 max-w-[800px] mx-auto py-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="sample" />
          <span className="text-caption font-bold px-2 py-0.5 rounded-[var(--lm-radius-pill)] bg-[var(--lm-inset)] text-[var(--lm-accent-strong)] border border-[var(--lm-border)]">
            Coming Soon
          </span>
        </div>
        <h1 className="text-h1 text-[var(--lm-ink)] m-0 mt-2">OMET preparation</h1>
        <p className="text-body text-[var(--lm-text-muted)] m-0 mt-1">
          How strategy and decision routines change outside CAT.
        </p>
      </div>

      {/* Two-row comparison: CAT vs OMETs */}
      <div className="flex flex-col gap-4">
        {/* Row 1: CAT Decision Paradigm */}
        <Card className="p-6 flex flex-col gap-3 border-2 border-[var(--lm-border-strong)] bg-[var(--lm-surface)]">
          <div className="flex items-center justify-between">
            <span className="text-caption font-bold text-[var(--lm-accent-strong)] uppercase tracking-wider">
              The CAT Paradigm
            </span>
            <span className="text-caption font-mono font-semibold text-[var(--lm-text-muted)]">
              Depth & Selective Accuracy
            </span>
          </div>

          <h2 className="text-h2 font-semibold text-[var(--lm-ink)] m-0">
            Strict sectional timers & question gatekeeping
          </h2>

          <p className="text-body text-[var(--lm-ink)] leading-relaxed m-0 font-medium">
            CAT rewards knowing what NOT to attempt. With 40 minutes per section and −1 negative marks for wrong answers, attempting 10 to 12 questions with high accuracy is often superior to rushing 18.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[var(--lm-border)] text-small text-[var(--lm-text-muted)]">
            <div>&bull; 40-minute lock per section</div>
            <div>&bull; −1 on wrong MCQs</div>
            <div>&bull; Selection is 50% of the game</div>
          </div>
        </Card>

        {/* Row 2: OMET Landscape */}
        <Card className="p-6 flex flex-col gap-5 bg-[var(--lm-inset)] border border-[var(--lm-border)]">
          <div className="flex items-center justify-between">
            <span className="text-caption font-bold text-[var(--lm-accent-strong)] uppercase tracking-wider">
              The OMET Shift
            </span>
            <span className="text-caption font-mono font-semibold text-[var(--lm-text-muted)]">
              Speed, Decision-Making & Nuance
            </span>
          </div>

          <h2 className="text-h2 font-semibold text-[var(--lm-ink)] m-0 flex items-center gap-2">
            <Sparkles size={22} className="text-[var(--lm-accent-strong)]" />
            <span>XAT, SNAP, and NMAT adaptations</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-[var(--lm-surface)] rounded-[var(--lm-radius-md)] border border-[var(--lm-border)] flex flex-col gap-1.5">
              <span className="text-h3 font-bold text-[var(--lm-ink)]">XAT</span>
              <span className="text-caption font-semibold text-[var(--lm-accent-strong)]">
                Decision Making + Negative on Leaves
              </span>
              <p className="text-small text-[var(--lm-text-muted)] m-0">
                Features business ethics / managerial scenarios and penalizes leaving more than 8 questions.
              </p>
            </div>

            <div className="p-4 bg-[var(--lm-surface)] rounded-[var(--lm-radius-md)] border border-[var(--lm-border)] flex flex-col gap-1.5">
              <span className="text-h3 font-bold text-[var(--lm-ink)]">SNAP</span>
              <span className="text-caption font-semibold text-[var(--lm-accent-strong)]">
                Pure Speed Sprint
              </span>
              <p className="text-small text-[var(--lm-text-muted)] m-0">
                60 questions in 60 minutes with no sectional time gates. Quick elimination is the winning routine.
              </p>
            </div>

            <div className="p-4 bg-[var(--lm-surface)] rounded-[var(--lm-radius-md)] border border-[var(--lm-border)] flex flex-col gap-1.5">
              <span className="text-h3 font-bold text-[var(--lm-ink)]">NMAT</span>
              <span className="text-caption font-semibold text-[var(--lm-accent-strong)]">
                Computer-Adaptive & Zero Negative
              </span>
              <p className="text-small text-[var(--lm-text-muted)] m-0">
                Adapts difficulty dynamically. Every single question must be answered with zero negative penalty.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Routine advice */}
      <Card className="p-6 flex flex-col gap-3">
        <h3 className="text-h3 font-semibold text-[var(--lm-ink)] m-0">
          How to pace yourself
        </h3>
        <p className="text-body text-[var(--lm-text-muted)] leading-relaxed m-0">
          Do not scatter your routines before CAT. Master question selection and pacing on CAT first; the foundational decision instincts transfer directly to OMETs with minor speed calibrations in December and January.
        </p>
      </Card>

      {/* CTA to provide input */}
      <Card className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--lm-surface)] border border-[var(--lm-border)]">
        <div className="flex items-center gap-3">
          <Compass size={24} className="text-[var(--lm-accent-strong)] shrink-0" />
          <div className="flex flex-col gap-0.5">
            <span className="text-body-strong text-[var(--lm-ink)]">
              Which OMETs are you targeting?
            </span>
            <span className="text-small text-[var(--lm-text-muted)]">
              Let us know in your prototype feedback so we prioritize those modules.
            </span>
          </div>
        </div>

        <Button
          variant="primary-arrow"
          onClick={() => navigate('/feedback')}
          className="shrink-0"
        >
          Share your target OMETs
        </Button>
      </Card>
    </div>
  );
}
