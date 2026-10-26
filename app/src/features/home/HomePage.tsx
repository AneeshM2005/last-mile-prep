/**
 * HomePage.tsx – Today home screen with 12-column Bento layout.
 * PRD M5, design.md 8.4, 10.5, 10.6.
 * Section 1, 2C, 7: College picture countdown rotation, light translucent panel, Specular CTA.
 * Route: /
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, parseISO } from 'date-fns';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { SpecularButton } from '../../ui/animations/SpecularButton';
import { useAppContext } from '../../app/providers';
import { useStore } from '../../data/store';
import { appClock } from '../../domain/appClock';
import { logEvent } from '../../data/eventLog';
import { recommendTodayTask } from '../../domain/taskRecommender';
import { resolveSessionCollegeCursor, type SchoolTarget } from '../../domain/collegeRotation';
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

  // Target schools resolution for countdown card rotation
  const allSchools: SchoolTarget[] = config?.schools?.schools || [
    { id: 'iima', name: 'IIM Ahmedabad' },
    { id: 'iimb', name: 'IIM Bangalore' },
    { id: 'iimc', name: 'IIM Calcutta' },
    { id: 'fms', name: 'FMS Delhi' },
    { id: 'xlri', name: 'XLRI Jamshedpur' },
    { id: 'spjimr', name: 'SPJIMR Mumbai' },
    { id: 'iimk', name: 'IIM Kozhikode' },
    { id: 'iims', name: 'IIM Shillong' },
  ];

  const userChosenSchoolIds = profile?.targetSchoolIds || [];
  const chosenColleges = userChosenSchoolIds
    .map((id) => allSchools.find((s) => s.id === id))
    .filter((s): s is SchoolTarget => Boolean(s));

  const targetColleges = chosenColleges.length > 0 ? chosenColleges : [allSchools[0]];
  const activeCollegeIndex = resolveSessionCollegeCursor(targetColleges.length);
  const activeCollege = targetColleges[activeCollegeIndex] || targetColleges[0];

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
      label: 'Personal dictionary',
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[var(--lm-sage-200)] pb-4">
        <div>
          <h1 className="text-h1 text-[var(--lm-ink)] m-0">Today</h1>
          <p className="text-body text-[var(--lm-text-muted)] m-0 mt-0.5">
            {profile?.displayName ? `Welcome back, ${profile.displayName}. ` : ''}
            One steady step at a time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {appClock.isSimulated() && (
            <span className="text-caption font-bold px-2.5 py-1 rounded-[var(--lm-radius-pill)] bg-[var(--lm-sage-100)] text-[var(--lm-sage-700)] border border-[var(--lm-sage-200)]">
              Simulation: {todayDateStr}
            </span>
          )}
          <Badge variant="prototype" />
        </div>
      </div>

      {/* Resume Card (if any active session in progress) */}
      {(hasInProgressBaseline || hasInProgressRound) && (
        <Card className="p-5 border border-[var(--lm-sage-700)] bg-[var(--lm-sage-50)] rounded-[var(--lm-radius-card,24px)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-caption font-bold text-[var(--lm-sage-700)] uppercase tracking-wider">
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
        <Card className="col-span-12 lg:col-span-8 p-6 flex flex-col justify-between gap-5 bg-[var(--lm-surface)] border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-card,24px)] shadow-[var(--lm-shadow-card)]">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-caption font-bold tracking-wider text-[var(--lm-sage-700)] uppercase">
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
          <div className="flex flex-col gap-2 pt-2 border-t border-[var(--lm-sage-200)]">
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
                      ? 'bg-[var(--lm-sage-900)] text-white border-[var(--lm-sage-900)] font-bold'
                      : 'bg-[var(--lm-surface)] text-[var(--lm-ink)] border-[var(--lm-sage-200)] hover:bg-[var(--lm-sage-50)]',
                  ].join(' ')}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <SpecularButton
              size="md"
              radius={9999}
              onClick={handleStartTask}
              aria-label="Start task"
            >
              <span>Start task</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </SpecularButton>

            <Button variant="ghost" onClick={() => navigate('/practice')}>
              Other options
            </Button>
          </div>
        </Card>

        {/* 2. Days to CAT Stat tile with College Picture Rotation (col-span-12 sm:col-span-6 lg:col-span-4) */}
        {(() => {
          const collegeImgSrc = typeof activeCollege?.image === 'string'
            ? activeCollege.image
            : activeCollege?.image?.file;
          const collegeCredit = typeof activeCollege?.image === 'object' && activeCollege.image?.attribution
            ? activeCollege.image.attribution
            : activeCollege?.credit;

          return (
            <div
              className="col-span-12 sm:col-span-6 lg:col-span-4 rounded-[var(--lm-radius-card)] border border-[var(--lm-sage-200)] shadow-[var(--lm-shadow-card)] relative overflow-hidden flex flex-col justify-between p-3"
              style={{
                minHeight: '220px',
                backgroundImage: collegeImgSrc ? `url(${collegeImgSrc})` : 'var(--lm-sky-fallback)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Translucent light panel: 88% opaque paper, no blur, ensuring contrast */}
              <div
                className="p-5 rounded-[20px] border border-[var(--lm-sage-200)] shadow-xs flex flex-col justify-between h-full"
                style={{
                  backgroundColor: 'rgba(251, 252, 249, 0.88)',
                }}
              >
                <div>
                  <span className="text-caption font-bold tracking-wider text-[var(--lm-sage-700)] uppercase">
                    Countdown
                  </span>
                  <div className="flex items-baseline gap-2 my-2">
                    <span className="text-display font-serif text-[var(--lm-ink)] leading-none">
                      {daysToCAT}
                    </span>
                    <span className="text-body font-medium text-[var(--lm-text-muted)]">
                      {daysToCAT === 0 ? 'CAT day has passed' : 'days to CAT'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--lm-sage-200)] flex items-center justify-between text-caption text-[var(--lm-text-muted)]">
                  <span className="font-semibold text-[var(--lm-sage-700)]">
                    {activeCollege.name}
                  </span>
                  {collegeCredit && (
                    <span className="text-[11px] opacity-75">{collegeCredit}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* 3. Days practised tile (col-span-12 sm:col-span-6 lg:col-span-4) */}
        <Card className="col-span-12 sm:col-span-6 lg:col-span-4 p-6 flex flex-col justify-between gap-3 bg-[var(--lm-surface)] border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-card,24px)] shadow-[var(--lm-shadow-card)]">
          <div>
            <span className="text-caption font-bold tracking-wider text-[var(--lm-sage-700)] uppercase">
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

          <div className="pt-2 border-t border-[var(--lm-sage-200)] text-caption text-[var(--lm-text-muted)]">
            Every session stays on this device
          </div>
        </Card>

        {/* 4. Daily Quote card (col-span-12 sm:col-span-6 lg:col-span-4) */}
        <Card className="col-span-12 sm:col-span-6 lg:col-span-4 p-6 flex flex-col justify-between gap-3 bg-[var(--lm-sage-50)] border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-card,24px)]">
          <div>
            <span className="text-caption font-bold tracking-wider text-[var(--lm-sage-700)] uppercase">
              Daily Anchor
            </span>
            <p className="text-quote text-[var(--lm-ink)] my-3 leading-snug">
              &ldquo;{dailyQuote.text}&rdquo;
            </p>
          </div>
          <div className="text-caption text-[var(--lm-text-muted)] border-t border-[var(--lm-sage-200)] pt-2">
            Mindset for steady execution
          </div>
        </Card>

        {/* 5. 5-Step Journey Progress (col-span-12 sm:col-span-6 lg:col-span-4) */}
        <Card className="col-span-12 sm:col-span-6 lg:col-span-4 p-6 flex flex-col justify-between gap-3 bg-[var(--lm-surface)] border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-card,24px)] shadow-[var(--lm-shadow-card)]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-caption font-bold tracking-wider text-[var(--lm-sage-700)] uppercase">
                Progress
              </span>
              <span className="text-caption text-[var(--lm-text-muted)] font-mono font-semibold">
                {milestonesDoneCount} of 5 milestones
              </span>
            </div>
            <h3 className="text-h3 font-serif text-[var(--lm-ink)] mt-1 mb-3">
              Your progress journey
            </h3>

            <div className="flex flex-col gap-2">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  onClick={() => navigate(m.route)}
                  className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-[var(--lm-sage-50)] transition-colors cursor-pointer text-small"
                >
                  <div className="flex items-center gap-2">
                    {m.done ? (
                      <CheckCircle2 size={16} className="text-[var(--grade-a-fg)] shrink-0" />
                    ) : (
                      <Circle size={16} className="text-[var(--lm-sage-300)] shrink-0" />
                    )}
                    <span className={m.done ? 'text-[var(--lm-ink)] font-medium' : 'text-[var(--lm-text-muted)]'}>
                      {m.label}
                    </span>
                  </div>
                  <ArrowRight size={14} className="text-[var(--lm-text-muted)] opacity-60" />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--lm-sage-200)] text-caption text-[var(--lm-text-muted)]">
            Tap any milestone to practise
          </div>
        </Card>
      </div>

      {/* Floating feedback teaser banner if user completed rounds */}
      {data.rounds.length >= 1 && !data.feedback && (
        <Card className="p-4 bg-[var(--lm-surface)] border border-[var(--lm-sage-200)] rounded-[var(--lm-radius-card,24px)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--lm-sage-100)] text-[var(--lm-sage-700)] flex items-center justify-center shrink-0">
              <MessageSquare size={16} />
            </div>
            <div>
              <span className="text-body-strong text-[var(--lm-ink)] block">
                How is your prep feeling?
              </span>
              <span className="text-small text-[var(--lm-text-muted)] block">
                Share 2 minutes of feedback to help us refine Last Mile.
              </span>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate('/feedback')}
            className="shrink-0"
          >
            Feedback
          </Button>
        </Card>
      )}
    </div>
  );
}

export default HomePage;
