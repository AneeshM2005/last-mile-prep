/**
 * FeedbackPage.tsx – Anonymous user feedback screen with live payload preview.
 * PRD 7, BR-13, design.md 8.12.
 * Route: /feedback
 */

import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { useStore } from '../../data/store';
import { logEvent } from '../../data/eventLog';
import { buildAnonymousFeedbackPayload } from '../../domain/sessionSummary';
import type { FeedbackRecord, FeatureId } from '../../data/schemas';
import { Check, Copy, Download, Share2, ShieldCheck } from 'lucide-react';

const FEATURES: { id: FeatureId; label: string }[] = [
  { id: 'baseline_profile', label: 'Baseline & SWOT' },
  { id: 'question_selection', label: 'Selection rounds' },
  { id: 'mock_analysis', label: 'Mock analysis & leakage' },
  { id: 'revision', label: 'Spaced revision' },
  { id: 'todays_task', label: "Today's task" },
  { id: 'my_words', label: 'Vocabulary & reading' },
];

export function FeedbackPage(): React.ReactElement {
  const { data, setData } = useStore();

  const existingFeedback = data.feedback;

  const [strategyRating, setStrategyRating] = useState<1 | 2 | 3 | 4 | 5>(
    existingFeedback?.ratings.strategy || 4
  );
  const [calmRating, setCalmRating] = useState<1 | 2 | 3 | 4 | 5>(
    existingFeedback?.ratings.calm || 5
  );

  const [mostAndLeast, setMostAndLeast] = useState<string>(
    existingFeedback?.answers.mostAndLeastUseful || ''
  );
  const [newInsight, setNewInsight] = useState<string>(
    existingFeedback?.answers.newInsight || ''
  );
  const [stressful, setStressful] = useState<string>(
    existingFeedback?.answers.stressful || ''
  );
  const [dailyUse, setDailyUse] = useState<string>(
    existingFeedback?.answers.dailyUse || ''
  );
  const [ometMissing, setOmetMissing] = useState<string>(
    existingFeedback?.answers.ometMissing || ''
  );

  const [selectedFeatures, setSelectedFeatures] = useState<FeatureId[]>(
    existingFeedback?.wouldUseAgain || ['baseline_profile', 'question_selection', 'mock_analysis']
  );

  const [copied, setCopied] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const toggleFeature = (fId: FeatureId) => {
    setSelectedFeatures((prev) =>
      prev.includes(fId) ? prev.filter((id) => id !== fId) : [...prev, fId]
    );
  };

  const currentFeedbackRecord: FeedbackRecord = {
    ratings: {
      strategy: strategyRating,
      calm: calmRating,
    },
    answers: {
      mostAndLeastUseful: mostAndLeast.slice(0, 280),
      newInsight: newInsight.slice(0, 280),
      stressful: stressful.slice(0, 280),
      dailyUse: dailyUse.slice(0, 280),
      ometMissing: ometMissing.slice(0, 280),
    },
    wouldUseAgain: selectedFeatures,
    savedAt: new Date().toISOString(),
  };

  const payload = buildAnonymousFeedbackPayload(data, currentFeedbackRecord);
  const payloadString = JSON.stringify(payload, null, 2);

  const handleSaveAndCopy = async () => {
    setData((prev) => ({ ...prev, feedback: currentFeedbackRecord }));
    logEvent('feedback_submitted', 'feedback');

    try {
      await navigator.clipboard.writeText(payloadString);
      setCopied(true);
      setSavedSuccess(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setSavedSuccess(true);
    }
  };

  const handleDownload = () => {
    setData((prev) => ({ ...prev, feedback: currentFeedbackRecord }));
    logEvent('feedback_submitted', 'feedback');

    const blob = new Blob([payloadString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `last-mile-feedback-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSavedSuccess(true);
  };

  const handleShare = async () => {
    setData((prev) => ({ ...prev, feedback: currentFeedbackRecord }));
    logEvent('feedback_submitted', 'feedback');

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Last Mile Feedback',
          text: payloadString,
        });
        setSavedSuccess(true);
      } catch {
        // user cancelled share
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-[720px] mx-auto py-6 animate-fade-in">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="prototype" />
          <span className="text-caption font-bold px-2.5 py-0.5 rounded-[var(--lm-radius-pill)] bg-[var(--lm-inset)] text-[var(--lm-ink)] border border-[var(--lm-border)]">
            User testing
          </span>
        </div>
        <h1 className="text-h1 text-[var(--lm-ink)] m-0 mt-2">Share feedback</h1>
        <p className="text-body text-[var(--lm-text-muted)] m-0 mt-1">
          Help us refine the prototype for CAT aspirants. Everything below stays private on this device until you choose to copy or download it.
        </p>
      </div>

      {/* Privacy guarantee banner */}
      <div className="p-4 rounded-[var(--lm-radius-md)] bg-[var(--lm-inset)] border border-[var(--lm-border)] flex items-center gap-3">
        <ShieldCheck size={20} className="text-[var(--grade-a-fg)] shrink-0" />
        <span className="text-small text-[var(--lm-ink)] font-medium">
          <strong>Privacy guarantee:</strong> Your display name is completely stripped. No personal identifiers or questions are ever exported.
        </span>
      </div>

      {/* 1. Numerical Ratings (1 to 5) */}
      <Card className="p-6 flex flex-col gap-5">
        <h2 className="text-h2 font-semibold text-[var(--lm-ink)] m-0">Experience ratings</h2>

        {/* Strategy Rating */}
        <div className="flex flex-col gap-2">
          <label className="text-body font-medium text-[var(--lm-ink)]">
            How helpful was the decision and strategy focus? (1 = Not helpful, 5 = Extremely helpful)
          </label>
          <div className="flex items-center gap-2">
            {([1, 2, 3, 4, 5] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setStrategyRating(r)}
                className={[
                  'w-11 h-11 rounded-[var(--lm-radius-sm)] border font-mono font-bold text-h3 transition-all cursor-pointer',
                  strategyRating === r
                    ? 'bg-[var(--lm-ink)] text-white border-[var(--lm-ink)]'
                    : 'bg-[var(--lm-surface)] text-[var(--lm-ink)] border-[var(--lm-border)] hover:bg-[var(--lm-inset)]',
                ].join(' ')}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Calm Routine Rating */}
        <div className="flex flex-col gap-2 pt-3 border-t border-[var(--lm-border)]">
          <label className="text-body font-medium text-[var(--lm-ink)]">
            How calm and sustainable was your practice routine? (1 = Stressful, 5 = Very calm & steady)
          </label>
          <div className="flex items-center gap-2">
            {([1, 2, 3, 4, 5] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setCalmRating(r)}
                className={[
                  'w-11 h-11 rounded-[var(--lm-radius-sm)] border font-mono font-bold text-h3 transition-all cursor-pointer',
                  calmRating === r
                    ? 'bg-[var(--lm-ink)] text-white border-[var(--lm-ink)]'
                    : 'bg-[var(--lm-surface)] text-[var(--lm-ink)] border-[var(--lm-border)] hover:bg-[var(--lm-inset)]',
                ].join(' ')}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* 2. Qualitative Textareas (max 280 chars) */}
      <Card className="p-6 flex flex-col gap-5">
        <h2 className="text-h2 font-semibold text-[var(--lm-ink)] m-0">Your honest thoughts</h2>

        {/* Question 1 */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-body font-medium text-[var(--lm-ink)]">
              Which features were most and least useful?
            </label>
            <span className="text-caption text-[var(--lm-text-muted)] font-mono">
              {mostAndLeast.length} / 280
            </span>
          </div>
          <textarea
            maxLength={280}
            rows={2}
            value={mostAndLeast}
            onChange={(e) => setMostAndLeast(e.target.value)}
            placeholder="e.g. Selection rounds helped me notice time loss; mock analysis was eye-opening."
            className="p-3 border border-[var(--lm-border)] rounded-[var(--lm-radius-sm)] text-body text-[var(--lm-ink)] resize-none"
          />
        </div>

        {/* Question 2 */}
        <div className="flex flex-col gap-1.5 pt-3 border-t border-[var(--lm-border)]">
          <div className="flex items-center justify-between">
            <label className="text-body font-medium text-[var(--lm-ink)]">
              What new insight did you gain about your preparation?
            </label>
            <span className="text-caption text-[var(--lm-text-muted)] font-mono">
              {newInsight.length} / 280
            </span>
          </div>
          <textarea
            maxLength={280}
            rows={2}
            value={newInsight}
            onChange={(e) => setNewInsight(e.target.value)}
            placeholder="e.g. I realized my B grade leakage was 24 marks on QA arithmetic."
            className="p-3 border border-[var(--lm-border)] rounded-[var(--lm-radius-sm)] text-body text-[var(--lm-ink)] resize-none"
          />
        </div>

        {/* Question 3 */}
        <div className="flex flex-col gap-1.5 pt-3 border-t border-[var(--lm-border)]">
          <div className="flex items-center justify-between">
            <label className="text-body font-medium text-[var(--lm-ink)]">
              What felt confusing, stressful, or unnecessary?
            </label>
            <span className="text-caption text-[var(--lm-text-muted)] font-mono">
              {stressful.length} / 280
            </span>
          </div>
          <textarea
            maxLength={280}
            rows={2}
            value={stressful}
            onChange={(e) => setStressful(e.target.value)}
            placeholder="e.g. Would prefer larger font on question tiles."
            className="p-3 border border-[var(--lm-border)] rounded-[var(--lm-radius-sm)] text-body text-[var(--lm-ink)] resize-none"
          />
        </div>

        {/* Question 4 */}
        <div className="flex flex-col gap-1.5 pt-3 border-t border-[var(--lm-border)]">
          <div className="flex items-center justify-between">
            <label className="text-body font-medium text-[var(--lm-ink)]">
              How did this fit into your daily study routine?
            </label>
            <span className="text-caption text-[var(--lm-text-muted)] font-mono">
              {dailyUse.length} / 280
            </span>
          </div>
          <textarea
            maxLength={280}
            rows={2}
            value={dailyUse}
            onChange={(e) => setDailyUse(e.target.value)}
            placeholder="e.g. Used it for 30 minutes every morning before starting full sectional tests."
            className="p-3 border border-[var(--lm-border)] rounded-[var(--lm-radius-sm)] text-body text-[var(--lm-ink)] resize-none"
          />
        </div>

        {/* Question 5 */}
        <div className="flex flex-col gap-1.5 pt-3 border-t border-[var(--lm-border)]">
          <div className="flex items-center justify-between">
            <label className="text-body font-medium text-[var(--lm-ink)]">
              What OMET exams or specific modules would you like to see next?
            </label>
            <span className="text-caption text-[var(--lm-text-muted)] font-mono">
              {ometMissing.length} / 280
            </span>
          </div>
          <textarea
            maxLength={280}
            rows={2}
            value={ometMissing}
            onChange={(e) => setOmetMissing(e.target.value)}
            placeholder="e.g. XAT decision making cases and SNAP vocabulary drills."
            className="p-3 border border-[var(--lm-border)] rounded-[var(--lm-radius-sm)] text-body text-[var(--lm-ink)] resize-none"
          />
        </div>
      </Card>

      {/* 3. Would Use Again Chips */}
      <Card className="p-6 flex flex-col gap-3">
        <h2 className="text-h2 font-semibold text-[var(--lm-ink)] m-0">
          Which features would you use again?
        </h2>
        <div className="flex flex-wrap gap-2 pt-1">
          {FEATURES.map((f) => {
            const isSelected = selectedFeatures.includes(f.id);
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => toggleFeature(f.id)}
                className={[
                  'px-3.5 py-1.5 rounded-[var(--lm-radius-pill)] border text-caption font-semibold transition-all cursor-pointer flex items-center gap-1.5',
                  isSelected
                    ? 'bg-[var(--lm-ink)] text-white border-[var(--lm-ink)]'
                    : 'bg-[var(--lm-surface)] text-[var(--lm-ink)] border-[var(--lm-border)] hover:bg-[var(--lm-inset)]',
                ].join(' ')}
              >
                {isSelected && <Check size={14} />}
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* 4. Live Payload Preview */}
      <Card className="p-6 flex flex-col gap-3 bg-[var(--lm-inset)] border border-[var(--lm-border)]">
        <div className="flex items-center justify-between">
          <span className="text-caption font-bold text-[var(--lm-accent-strong)] uppercase tracking-wider">
            Live export payload preview
          </span>
          <span className="text-caption text-[var(--grade-a-fg)] font-semibold">
            Display name stripped
          </span>
        </div>
        <pre className="p-4 bg-[var(--lm-surface)] rounded-[var(--lm-radius-sm)] border border-[var(--lm-border)] text-caption font-mono text-[var(--lm-ink)] overflow-x-auto max-h-60">
          {payloadString}
        </pre>
      </Card>

      {/* Save and Export Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 justify-end pt-2">
        <Button
          variant="secondary"
          onClick={handleDownload}
          className="w-full sm:w-auto inline-flex items-center gap-2"
        >
          <Download size={16} />
          <span>Download JSON</span>
        </Button>

        {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
          <Button
            variant="secondary"
            onClick={handleShare}
            className="w-full sm:w-auto inline-flex items-center gap-2"
          >
            <Share2 size={16} />
            <span>Share</span>
          </Button>
        )}

        <Button
          variant="primary-arrow"
          onClick={handleSaveAndCopy}
          className="w-full sm:w-auto inline-flex items-center gap-2"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? 'Copied to clipboard' : 'Save & Copy feedback'}</span>
        </Button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-[var(--grade-a-bg)] text-[var(--grade-a-fg)] rounded-[var(--lm-radius-sm)] text-center font-semibold text-small">
          Feedback saved to your device and copied for sharing.
        </div>
      )}
    </div>
  );
}
