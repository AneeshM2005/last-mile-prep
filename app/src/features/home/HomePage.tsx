/**
 * HomePage.tsx – Today home screen with 12-column Bento layout.
 * PRD M5, design.md 8.4, 10.5, 10.6.
 * Route: /
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, parseISO } from 'date-fns';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { useAppContext } from '../../app/providers';
import { useStore } from '../../data/store';
import { appClock } from '../../domain/appClock';
import { logEvent } from '../../data/eventLog';
import { recommendTodayTask } from '../../domain/taskRecommender';
import { MessageSquare, ArrowRight, CheckCircle2, Circle } from 'lucide-react';

export function HomePage(): React.ReactElement {
  const navigate = useNavigate();
  const { config } = useAppContext();
  const { data } = useStore();

  const profile = data.profile;
  const todayDateStr = appClock.today();
  const catDateStr = config?.app?.cat?.date || '2026-11-29';

  // Calculate days to CAT
  const catDate = parseISO(catDateStr);
  const now = appClock.now();
  const daysToCAT = Math.max(0, differenceInDays(catDate, now));

  // Time allocation stepper
  const [selectedMinutes, setSelectedMinutes] = useState<number>(profile?.dailyMinutes || 30);

  // Today recommended task
  const recommended = recommendTodayTask(data, config?.tasks);

  // Quote
  const quotesList = config?.quotes?.quotes || [
    {
      id: 'q1',
      text: 'One well-chosen question, attempted with full attention, is worth more than ten rushed guesses.',
    },
  ];
  // Deterministic daily quote based on date string hash
  const quoteIndex =
    todayDateStr
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0) % quotesList.length;
  const dailyQuote = quotesList[quoteIndex] || quotesList[0];

  // Days practised
  const uniquePractisedDays = new Set(data.activity.map((a) => a.date)).size;

  // 5 Journey milestones
  const milestones = [
    {
      id: 'baseline',
      label: 'Baseline diagnostic',
      done: Boolean(data.baseline && data.baseline.status === 'completed'),
      route: '/practice/baseline',
    },
    {
      id: 'round',
      label: 'Selection round',
      done: data.rounds.some((r) => r.status === 'completed'),
      route: '/practice/rounds',
    },
    {
      id: 'mock',
      label: 'Mock analysis',
      done: data.mocks.length > 0,
      route: '/mock',
    },
    {
      id: 'revision',
      label: 'Spaced revision',
      done: data.revisionItems.length > 0,
      route: '/revision',
    },
    {
      id: 'words',
      label: 'Vocabulary reading',
      done: data.passageSessions.length > 0 || data.wordCards.length > 0,
      route: '/words',
    },
  ];

  const milestonesDoneCount = milestones.filter((m) => m.done).length;

  // Check for in-progress session to resume
  const hasInProgressBaseline = Boolean(data.baseline && data.baseline.status === 'in_progress');
  const hasInProgressRound = data.rounds.find((r) => r.status === 'in_progress');

  const handleStartTask = () => {
    logEvent('task_started', 'home');
    navigate(recommended.route);
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1000px] mx-auto py-6 animate-fade-in">
      {/* Top greeting bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[var(--lm-border)] pb-4">
        <div>
          <h1 className="text-h1 text-[var(--lm-ink)] m-0">Today</h1>
          <p className="text-body text-[var(--lm-text-muted)] m-0 mt-0.5">
            {profile?.displayName ? `Welcome back, ${profile.displayName}. ` : ''}
            One steady step at a time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {appClock.isSimulated() && (
            <span className="text-caption font-bold px-2.5 py-1 rounded-[var(--lm-radius-pill)] bg-[var(--lm-inset)] text-[var(--lm-accent-strong)] border border-[var(--lm-border)]">
              Simulation: {todayDateStr}
            </span>
          )}
          <Badge variant="prototype" />
        </div>
      </div>

      {/* Resume Card (if any active session in progress) */}
      {(hasInProgressBaseline || hasInProgressRound) && (
        <Card className="p-5 border-2 border-[var(--lm-accent-strong)] bg-[var(--lm-accent-soft)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-caption font-bold text-[var(--lm-accent-strong)] uppercase tracking-wider">
              Resume in progress
            </span>
            <span className="text-body-strong text-[var(--lm-ink)]">
              {hasInProgressBaseline ? 'Baseline diagnostic in progress' : 'Question selection round in progress'}
            </span>
            <span className="text-small text-[var(--lm-text-muted)]">
              Your previous answers are saved on this device.
            </span>
          </div>

          <Button
            variant="primary-arrow"
            onClick={() => {
              if (hasInProgressBaseline) navigate('/practice/baseline');
              else navigate('/practice/rounds');
            }}
          >
            Resume session
          </Button>
        </Card>
      )}

      {/* 12-Column Bento Grid */}
      <div className="grid grid-cols-12 gap-5">
        {/* 1. Today's task card (col-span-12 lg:col-span-8) */}
        <Card className="col-span-12 lg:col-span-8 p-6 flex flex-col justify-between gap-5 bg-[var(--lm-surface)] border-2 border-[var(--lm-ink)]">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-caption font-bold tracking-wider text-[var(--lm-accent-strong)] uppercase">
                Today&apos;s Focus · {selectedMinutes} mins
              </span>
              <span className="text-caption text-[var(--lm-text-muted)] font-mono">{todayDateStr}</span>
            </div>

            <h2 className="text-display font-serif text-[var(--lm-ink)] leading-tight m-0">
              {recommended.title}
            </h2>

            <p className="text-body text-[var(--lm-ink)] leading-relaxed m-0 font-medium">
              {recommended.whyThis}
            </p>
          </div>

          {/* Stepper chips for daily time adjustment */}
          <div className="flex flex-col gap-2 pt-2 border-t border-[var(--lm-border)]">
            <span className="text-caption font-semibold text-[var(--lm-text-muted)]">
              Adjust time for today:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {[15, 30, 45, 60, 90].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setSelectedMinutes(mins)}
                  className={[
                    'px-3.5 py-1 text-caption font-semibold rounded-[var(--lm-radius-pill)] border transition-all cursor-pointer',
                    selectedMinutes === mins
                      ? 'bg-[var(--lm-ink)] text-white border-[var(--lm-ink)] font-bold'
                      : 'bg-[var(--lm-surface)] text-[var(--lm-ink)] border-[var(--lm-border)] hover:bg-[var(--lm-inset)]',
                  ].join(' ')}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <Button
              variant="primary-arrow"
              onClick={handleStartTask}
              className="text-body-strong px-6"
            >
              Start task
            </Button>
            <Button variant="ghost" onClick={() => navigate('/practice')}>
              Other options
            </Button>
          </div>
        </Card>

        {/* 2. Days to CAT Stat tile (col-span-6 lg:col-span-4) */}
        <Card className="col-span-12 sm:col-span-6 lg:col-span-4 p-6 flex flex-col justify-between gap-3 bg-[var(--lm-surface)]">
          <div>
            <span className="text-caption font-bold tracking-wider text-[var(--lm-text-muted)] uppercase">
              Countdown
            </span>
            <div className="flex items-baseline gap-2 my-2">
              <span className="text-display font-serif text-[var(--lm-ink)] leading-none">
                {daysToCAT}
              </span>
              <span className="text-body font-medium text-[var(--lm-text-muted)]">
                days to CAT
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--lm-border)] text-caption text-[var(--lm-text-muted)]">
            CAT 2026: {catDateStr}
          </div>
        </Card>

        {/* 3. Days practised tile (col-span-6 lg:col-span-4) */}
        <Card className="col-span-12 sm:col-span-6 lg:col-span-4 p-6 flex flex-col justify-between gap-3 bg-[var(--lm-surface)]">
          <div>
            <span className="text-caption font-bold tracking-wider text-[var(--lm-text-muted)] uppercase">
              Consistency
            </span>
            <div className="flex items-baseline gap-2 my-2">
              <span className="text-display font-serif text-[var(--lm-ink)] leading-none">
                {uniquePractisedDays}
              </span>
              <span className="text-body font-medium text-[var(--lm-text-muted)]">
                days practised
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--lm-border)] text-caption text-[var(--lm-text-muted)]">
            Every session stays on this device
          </div>
        </Card>

        {/* 4. Quote tile (col-span-12 lg:col-span-8) */}
        <Card className="col-span-12 lg:col-span-8 p-6 flex flex-col justify-between gap-3 bg-[var(--lm-inset)] border border-[var(--lm-border)]">
          <span className="text-caption font-bold tracking-wider text-[var(--lm-accent-strong)] uppercase">
            Perspective
          </span>
          <p className="font-serif italic text-body-lg text-[var(--lm-ink)] leading-relaxed m-0">
            &ldquo;{dailyQuote.text}&rdquo;
          </p>
          <span className="text-small text-[var(--lm-text-muted)]">
            Focus on decisions over anxiety
          </span>
        </Card>

        {/* 5. Journey indicator (col-span-12) */}
        <Card className="col-span-12 p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-h3 font-semibold text-[var(--lm-ink)]">Your progress journey</span>
              <span className="text-caption font-bold px-2 py-0.5 rounded-[var(--lm-radius-pill)] bg-[var(--lm-inset)] text-[var(--lm-ink)]">
                {milestonesDoneCount} of 5 milestones
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
            {milestones.map((ms, idx) => (
              <div
                key={ms.id}
                onClick={() => navigate(ms.route)}
                className={[
                  'p-3.5 rounded-[var(--lm-radius-md)] border flex flex-col gap-1.5 transition-all cursor-pointer',
                  ms.done
                    ? 'bg-[var(--grade-a-bg)] border-[var(--grade-a-fg)] text-[var(--lm-ink)]'
                    : 'bg-[var(--lm-surface)] border-[var(--lm-border)] hover:bg-[var(--lm-inset)]',
                ].join(' ')}
              >
                <div className="flex items-center justify-between">
                  <span className="text-caption font-mono font-bold text-[var(--lm-text-muted)]">
                    0{idx + 1}
                  </span>
                  {ms.done ? (
                    <CheckCircle2 size={16} className="text-[var(--grade-a-fg)]" />
                  ) : (
                    <Circle size={16} className="text-[var(--lm-border-strong)]" />
                  )}
                </div>
                <span className="text-small font-semibold leading-snug">{ms.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Feedback nudge */}
      <Card className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--lm-surface)] border border-[var(--lm-border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[var(--lm-radius-pill)] bg-[var(--lm-inset)] flex items-center justify-center shrink-0">
            <MessageSquare size={20} className="text-[var(--lm-accent-strong)]" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-body-strong text-[var(--lm-ink)]">
              Help refine Last Mile
            </span>
            <span className="text-small text-[var(--lm-text-muted)]">
              Share quick anonymous prototype feedback. Your name is never sent.
            </span>
          </div>
        </div>

        <Button
          variant="secondary"
          onClick={() => navigate('/feedback')}
          className="inline-flex items-center gap-2 shrink-0"
        >
          <span>Share feedback</span>
          <ArrowRight size={16} />
        </Button>
      </Card>
    </div>
  );
}
