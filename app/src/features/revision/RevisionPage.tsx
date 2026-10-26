/**
 * RevisionPage.tsx – Spaced revision management screen.
 * PRD M6, design.md 8.8.
 * Route: /revision
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Tabs } from '../../ui/Tabs';
import { EmptyState } from '../../ui/EmptyState';
import { Badge } from '../../ui/Badge';
import { useAppContext } from '../../app/providers';
import { useStore } from '../../data/store';
import { appClock } from '../../domain/appClock';
import { logEvent } from '../../data/eventLog';
import {
  createRevisionItem,
  markItemReviewed,
  postponeItem,
  getDueItems,
  getUpcomingGrouped,
} from '../../domain/revisionScheduler';
import type { Section } from '../../data/schemas';
import { CheckCircle2, Clock, Calendar, Sparkles } from 'lucide-react';

export function RevisionPage(): React.ReactElement {
  const navigate = useNavigate();
  const { config } = useAppContext();
  const { data, setData } = useStore();

  const copy = config?.copy as unknown as
    | { empty?: { dueToday?: string } }
    | undefined;
  const emptyDueMessage =
    copy?.empty?.dueToday ||
    'Nothing is due today. Add a topic to start a revision plan.';

  const offsets = config?.revision?.offsetsDays || [1, 3, 9, 18];

  const todayStr = appClock.today();

  const [activeTab, setActiveTab] = useState<string>('due');

  // Add topic form state
  const [topicInput, setTopicInput] = useState<string>('');
  const [sectionInput, setSectionInput] = useState<Section | ''>('');
  const [createdOnInput, setCreatedOnInput] = useState<string>(todayStr);
  const [addSuccessMessage, setAddSuccessMessage] = useState<string | null>(null);

  // Filter due and upcoming items
  const dueItems = getDueItems(data.revisionItems, todayStr);
  const upcomingGroups = getUpcomingGrouped(data.revisionItems, todayStr, 7);

  // ── Actions ───────────────────────────────────────────────────

  const handleMarkReviewed = (itemId: string, scheduleDate: string) => {
    setData((prev) => ({
      ...prev,
      revisionItems: prev.revisionItems.map((item) =>
        item.id === itemId ? markItemReviewed(item, scheduleDate) : item
      ),
    }));
    logEvent('revision_marked', 'revision');
  };

  const handleNeedMoreTime = (itemId: string, currentDueDate: string) => {
    // Reschedule to tomorrow without guilt
    const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    setData((prev) => ({
      ...prev,
      revisionItems: prev.revisionItems.map((item) =>
        item.id === itemId ? postponeItem(item, currentDueDate, tomorrowStr) : item
      ),
    }));
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim()) return;

    const newItem = createRevisionItem(
      topicInput,
      sectionInput || undefined,
      createdOnInput,
      offsets
    );

    setData((prev) => ({
      ...prev,
      revisionItems: [newItem, ...prev.revisionItems],
    }));

    logEvent('revision_item_added', 'revision');

    setTopicInput('');
    setSectionInput('');
    setAddSuccessMessage('Added. Four reminders scheduled.');
    setTimeout(() => {
      setAddSuccessMessage(null);
      setActiveTab('due');
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6 max-w-[720px] mx-auto py-6 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[var(--lm-border)] pb-3">
        <div>
          <h1 className="text-h1 text-[var(--lm-ink)] m-0">Spaced revision</h1>
          <p className="text-body text-[var(--lm-text-muted)] m-0 mt-0.5">
            Four scheduled reviews to hold key formulas and rules active in memory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {appClock.isSimulated() && (
            <span className="text-caption font-bold px-2.5 py-1 rounded-[var(--lm-radius-pill)] bg-[var(--lm-inset)] text-[var(--lm-accent-strong)] border border-[var(--lm-border)]">
              Today: {todayStr}
            </span>
          )}
          <Badge variant="prototype" />
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            id: 'due',
            label: `Due today ${dueItems.length > 0 ? `(${dueItems.length})` : ''}`,
          },
          { id: 'upcoming', label: 'Upcoming (7 days)' },
          { id: 'add', label: 'Add topic' },
        ]}
      />

      {/* TAB 1: Due Today */}
      {activeTab === 'due' && (
        <div className="flex flex-col gap-4">
          {dueItems.length === 0 ? (
            <EmptyState
              message={emptyDueMessage}
              actionLabel="Add a topic"
              onAction={() => setActiveTab('add')}
            />
          ) : (
            dueItems.map(({ item, dueSchedule, stepNumber, totalSteps }) => (
              <Card
                key={`${item.id}-${dueSchedule.dueOn}`}
                className="p-6 flex flex-col gap-4 bg-[var(--lm-surface)] border border-[var(--lm-border)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-h2 font-bold text-[var(--lm-ink)]">{item.topic}</span>
                      {item.section && (
                        <span className="text-caption font-bold px-2 py-0.5 rounded-[var(--lm-radius-pill)] bg-[var(--lm-inset)] border border-[var(--lm-border)] text-[var(--lm-ink)]">
                          {item.section}
                        </span>
                      )}
                    </div>
                    <span className="text-small text-[var(--lm-text-muted)]">
                      Notes created on {item.createdOn}
                    </span>
                  </div>

                  <span className="text-caption font-bold px-2.5 py-1 rounded-[var(--lm-radius-pill)] bg-[var(--lm-accent-soft)] text-[var(--lm-accent-strong)] border border-[var(--lm-accent-strong)] shrink-0">
                    Step {stepNumber} of {totalSteps}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--lm-border)]">
                  <span className="text-caption text-[var(--lm-text-muted)] font-medium">
                    Waiting for review
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleNeedMoreTime(item.id, dueSchedule.dueOn)}
                    >
                      Need more time
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => handleMarkReviewed(item.id, dueSchedule.dueOn)}
                      className="inline-flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={16} />
                      <span>Reviewed</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* TAB 2: Upcoming (7 days) */}
      {activeTab === 'upcoming' && (
        <div className="flex flex-col gap-6">
          {upcomingGroups.length === 0 ? (
            <EmptyState
              message="Nothing scheduled in the next 7 days."
              actionLabel="Add topic"
              onAction={() => setActiveTab('add')}
            />
          ) : (
            upcomingGroups.map((group) => (
              <div key={group.date} className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-caption font-mono font-bold text-[var(--lm-text-muted)]">
                  <Calendar size={14} />
                  <span>{group.date}</span>
                </div>

                <div className="flex flex-col gap-2">
                  {group.items.map(({ item, stepNumber }) => (
                    <Card key={`${item.id}-${group.date}`} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-body font-semibold text-[var(--lm-ink)]">{item.topic}</span>
                        {item.section && (
                          <span className="text-caption px-2 py-0.5 rounded-[var(--lm-radius-pill)] bg-[var(--lm-inset)] text-[var(--lm-ink)] font-bold">
                            {item.section}
                          </span>
                        )}
                      </div>
                      <span className="text-caption text-[var(--lm-text-muted)]">
                        Step {stepNumber} of {item.schedule.length}
                      </span>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: Add Topic */}
      {activeTab === 'add' && (
        <form onSubmit={handleAddTopic}>
          <Card className="p-6 flex flex-col gap-5 bg-[var(--lm-surface)]">
            <h2 className="text-h2 font-semibold text-[var(--lm-ink)] m-0">Add a new revision topic</h2>

            {addSuccessMessage && (
              <div className="p-3 bg-[var(--grade-a-bg)] text-[var(--grade-a-fg)] rounded-[var(--lm-radius-sm)] font-semibold text-small flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{addSuccessMessage}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-body-strong text-[var(--lm-ink)]">
                  Topic or formula name
                </label>
                <span className="text-caption text-[var(--lm-text-muted)] font-mono">
                  {topicInput.length} / 60
                </span>
              </div>
              <input
                type="text"
                maxLength={60}
                required
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="e.g. Time, Speed & Distance (Relative Speed)"
                className="p-3 border border-[var(--lm-border)] rounded-[var(--lm-radius-sm)] text-body text-[var(--lm-ink)]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-body-strong text-[var(--lm-ink)]">
                  Section (optional)
                </label>
                <select
                  value={sectionInput}
                  onChange={(e) => setSectionInput(e.target.value as Section)}
                  className="p-3 border border-[var(--lm-border)] rounded-[var(--lm-radius-sm)] bg-[var(--lm-surface)] text-body text-[var(--lm-ink)]"
                >
                  <option value="">None / General</option>
                  <option value="VARC">VARC</option>
                  <option value="LRDI">LRDI</option>
                  <option value="QA">QA</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-body-strong text-[var(--lm-ink)]">
                  Notes created on
                </label>
                <input
                  type="date"
                  value={createdOnInput}
                  onChange={(e) => setCreatedOnInput(e.target.value)}
                  className="p-3 border border-[var(--lm-border)] rounded-[var(--lm-radius-sm)] bg-[var(--lm-surface)] text-body text-[var(--lm-ink)]"
                />
              </div>
            </div>

            <div className="p-4 bg-[var(--lm-inset)] rounded-[var(--lm-radius-md)] border border-[var(--lm-border)] text-small text-[var(--lm-text-muted)] flex items-start gap-2">
              <Sparkles size={16} className="text-[var(--lm-accent-strong)] shrink-0 mt-0.5" />
              <span>
                Adding this topic schedules 4 calm reminders at +1, +3, +9, and +18 days. You can review or postpone anytime without guilt.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" type="button" onClick={() => setActiveTab('due')}>
                Cancel
              </Button>
              <Button variant="primary-arrow" type="submit" disabled={!topicInput.trim()}>
                Add to plan
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* Demo tools note */}
      <div className="p-4 rounded-[var(--lm-radius-md)] bg-[var(--lm-inset)] border border-[var(--lm-border)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-small text-[var(--lm-text-muted)]">
          <Clock size={16} />
          <span>Need to test revision reminders? Use the date simulator in Profile settings.</span>
        </div>
        <Button variant="ghost" onClick={() => navigate('/profile')}>
          Demo tools
        </Button>
      </div>
    </div>
  );
}
