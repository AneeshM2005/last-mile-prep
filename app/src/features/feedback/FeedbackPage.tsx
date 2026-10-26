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
import { PeekRating } from '../../ui/animations/PeekRating';
import { SpecularButton } from '../../ui/animations/SpecularButton';
import type { FeedbackRecord, FeatureId } from '../../data/schemas';
import { Check, Copy, Download, Share2, ShieldCheck } from 'lucide-react';

const FEATURES: { id: FeatureId; label: string }[] = [
  { id: 'baseline_profile', label: 'Baseline & SWOT' },
  { id: 'question_selection', label: 'Selection rounds' },
  { id: 'mock_analysis', label: 'Mock analysis & leakage' },
  { id: 'revision', label: 'Spaced revision' },
  { id: 'todays_task', label: "Today's task" },
  { id: 'my_words', label: 'Personal dictionary' },
];

export function FeedbackPage(): React.ReactElement {
  const { data, setData } = useStore();
  const existingFeedback = data.feedback;

  // Both ratings start empty (null) on fresh load
  const [strategyRating, setStrategyRating] = useState<number | null>(
    existingFeedback?.ratings.strategy ?? null
  );
  const [calmRating, setCalmRating] = useState<number | null>(
    existingFeedback?.ratings.calm ?? null
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

  // Feature chips start empty (none selected) on fresh load
  const [selectedFeatures, setSelectedFeatures] = useState<FeatureId[]>(
    existingFeedback?.wouldUseAgain || []
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
      strategy: (strategyRating || 1) as 1 | 2 | 3 | 4 | 5,
      calm: (calmRating || 1) as 1 | 2 | 3 | 4 | 5,
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
          <span className="text-caption font-bold px-2.5 py-0.5 rounded-[var(--lm-radius-pill)] bg-[var(--lm-sage-100)] text-[var(--lm-sage-700)] border border-[var(--lm-sage-200)]">
            User testing
          </span>
        </div>
        <h1 className="text-h1 text-[var(--lm-ink)] m-0 mt-2">Share feedback</h1>
        <p className="text-body text-[var(--lm-text-muted)] m-0 mt-1 leading-relaxed">
          Your thoughts help shape the next version. Everything is anonymous, exported manually, and stored only on this device.
        </p>
      </div>

      {/* Privacy Guarantee Banner */}
      <div className="p-4 bg-[var(--lm-sage-50)] border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-card)] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[var(--lm-sage-700)] shrink-0 mt-0.5" />
        <div className="text-small text-[var(--lm-ink)] space-y-1">
          <p className="font-semibold m-0">Zero network tracking</p>
          <p className="text-[var(--lm-text-muted)] m-0 leading-relaxed">
            Your display name and raw question texts are completely excluded. Review the exact JSON export below before copying or sharing.
          </p>
        </div>
      </div>

      {/* 1. Core Experience Ratings using PeekRating */}
      <Card className="p-6 flex flex-col gap-5 bg-[var(--lm-surface)] border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-card)] shadow-[var(--lm-shadow-card)]">
        <div>
          <h2 className="text-h2 font-semibold text-[var(--lm-ink)] m-0">Experience ratings</h2>
          <p className="text-small text-[var(--lm-text-muted)] m-0 mt-1">
            Tap a star to select. Tap the same star again to clear.
          </p>
        </div>

        {/* Strategy Rating */}
        <div className="flex flex-col gap-1">
          <label className="text-body font-medium text-[var(--lm-ink)]">
            How helpful was the decision and strategy focus?
          </label>
          <PeekRating
            value={strategyRating}
            count={5}
            labels={['Poor', 'Fair', 'Good', 'Great', 'Superb']}
            activeColor="rgb(245, 180, 0)" // amber-400
            idleColor="rgb(127, 160, 122)"  // sage-500
            tipColor="rgb(47, 74, 50)"      // sage-900
            size={32}
            lift={7}
            magnify={1.15}
            name="strategy-rating"
            onChange={(val) => setStrategyRating(val)}
          />
        </div>

        {/* Calm Routine Rating */}
        <div className="flex flex-col gap-1 pt-3 border-t border-[var(--lm-sage-200)]">
          <label className="text-body font-medium text-[var(--lm-ink)]">
            How calm and sustainable was your practice routine?
          </label>
          <PeekRating
            value={calmRating}
            count={5}
            labels={['Poor', 'Fair', 'Good', 'Great', 'Superb']}
            activeColor="rgb(245, 180, 0)" // amber-400
            idleColor="rgb(127, 160, 122)"  // sage-500
            tipColor="rgb(47, 74, 50)"      // sage-900
            size={32}
            lift={7}
            magnify={1.15}
            name="calm-rating"
            onChange={(val) => setCalmRating(val)}
          />
        </div>
      </Card>

      {/* 2. Qualitative Prompts (max 280 chars) */}
      <Card className="p-6 flex flex-col gap-5 bg-[var(--lm-surface)] border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-card)] shadow-[var(--lm-shadow-card)]">
        <h2 className="text-h2 font-semibold text-[var(--lm-ink)] m-0">Reflections</h2>

        {/* Question 1 */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-body font-medium text-[var(--lm-ink)]">
              What was most useful and least useful?
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
            placeholder="e.g. Liked the non-linear question selection; felt the review intervals were too short."
            className="p-3 border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-sm)] text-body text-[var(--lm-ink)] bg-[var(--lm-surface)] resize-none focus:outline-none focus:border-[var(--lm-sage-700)]"
          />
        </div>

        {/* Question 2 */}
        <div className="flex flex-col gap-1.5 pt-3 border-t border-[var(--lm-sage-200)]">
          <div className="flex items-center justify-between">
            <label className="text-body font-medium text-[var(--lm-ink)]">
              What new insight about your CAT strategy did this give you?
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
            placeholder="e.g. Realised I was dropping 15+ marks in QA by persevering on question traps."
            className="p-3 border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-sm)] text-body text-[var(--lm-ink)] bg-[var(--lm-surface)] resize-none focus:outline-none focus:border-[var(--lm-sage-700)]"
          />
        </div>

        {/* Question 3 */}
        <div className="flex flex-col gap-1.5 pt-3 border-t border-[var(--lm-sage-200)]">
          <div className="flex items-center justify-between">
            <label className="text-body font-medium text-[var(--lm-ink)]">
              Did anything feel stressful or demotivating?
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
            placeholder="e.g. The countdown timer on baseline felt a bit fast initially."
            className="p-3 border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-sm)] text-body text-[var(--lm-ink)] bg-[var(--lm-surface)] resize-none focus:outline-none focus:border-[var(--lm-sage-700)]"
          />
        </div>

        {/* Question 4 */}
        <div className="flex flex-col gap-1.5 pt-3 border-t border-[var(--lm-sage-200)]">
          <div className="flex items-center justify-between">
            <label className="text-body font-medium text-[var(--lm-ink)]">
              How did you use this in your daily study routine?
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
            className="p-3 border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-sm)] text-body text-[var(--lm-ink)] bg-[var(--lm-surface)] resize-none focus:outline-none focus:border-[var(--lm-sage-700)]"
          />
        </div>

        {/* Question 5 */}
        <div className="flex flex-col gap-1.5 pt-3 border-t border-[var(--lm-sage-200)]">
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
            className="p-3 border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-sm)] text-body text-[var(--lm-ink)] bg-[var(--lm-surface)] resize-none focus:outline-none focus:border-[var(--lm-sage-700)]"
          />
        </div>
      </Card>

      {/* 3. Would Use Again Chips: None selected on first load */}
      <Card className="p-6 flex flex-col gap-3 bg-[var(--lm-surface)] border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-card)] shadow-[var(--lm-shadow-card)]">
        <div>
          <h2 className="text-h2 font-semibold text-[var(--lm-ink)] m-0">
            Which features would you use again?
          </h2>
          <p className="text-small text-[var(--lm-text-muted)] m-0 mt-1">
            Tap a chip to select or deselect.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {FEATURES.map((f) => {
            const isSelected = selectedFeatures.includes(f.id);
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => toggleFeature(f.id)}
                aria-pressed={isSelected}
                className={[
                  'px-3.5 py-1.5 rounded-[var(--lm-radius-pill)] border text-caption font-semibold transition-all cursor-pointer flex items-center gap-1.5 select-none',
                  isSelected
                    ? 'bg-[var(--lm-sage-100)] text-[var(--lm-sage-700)] border-[var(--lm-sage-700)]'
                    : 'bg-[var(--lm-surface)] text-[var(--lm-ink)] border-[var(--lm-sage-200)] hover:bg-[var(--lm-sage-50)]',
                ].join(' ')}
              >
                {isSelected && <Check size={14} className="text-[var(--lm-sage-700)]" />}
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* 4. Live Payload Preview */}
      <Card className="p-6 flex flex-col gap-3 bg-[var(--lm-sage-50)] border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-card)]">
        <div className="flex items-center justify-between">
          <span className="text-caption font-bold text-[var(--lm-sage-700)] uppercase tracking-wider">
            Live export payload preview
          </span>
          <span className="text-caption text-[var(--grade-a-fg)] font-semibold">
            Display name stripped
          </span>
        </div>
        <pre className="p-4 bg-[var(--lm-surface)] rounded-[var(--lm-radius-sm)] border border-[var(--lm-sage-200)] text-caption font-mono text-[var(--lm-ink)] overflow-x-auto max-h-60">
          {payloadString}
        </pre>
      </Card>

      {/* Save and Export Actions ("Save feedback" Specular primary button) */}
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

        <SpecularButton
          size="md"
          radius={9999}
          onClick={handleSaveAndCopy}
          aria-label="Save & Copy feedback"
          className="w-full sm:w-auto"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? 'Copied to clipboard' : 'Save & Copy feedback'}</span>
        </SpecularButton>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-[var(--grade-a-bg)] text-[var(--grade-a-fg)] rounded-[var(--lm-radius-sm)] text-center font-semibold text-small border border-[var(--lm-sage-200)]">
          Feedback saved to your device and copied for sharing.
        </div>
      )}
    </div>
  );
}

export default FeedbackPage;
