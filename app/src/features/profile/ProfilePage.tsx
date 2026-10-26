/**
 * ProfilePage.tsx – Profile with SWOT and Settings & Data tabs.
 * design.md 8.5, 8.13, 8.14.
 * Tab 1: SWOT (shows quadrants or empty state)
 * Tab 2: Settings and data (Your details, Data on this device with Reset, Demo tools, Send to team)
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs } from '../../ui/Tabs';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Field } from '../../ui/Field';
import { Badge } from '../../ui/Badge';
import { Modal } from '../../ui/Modal';
import { Banner } from '../../ui/Banner';
import { EmptyState } from '../../ui/EmptyState';
import { EvidenceLine } from '../../ui/EvidenceLine';
import { useToast } from '../../ui/Toast';
import { useStore } from '../../data/store';
import { resetApp } from '../../data/reset';
import { appClock } from '../../domain/appClock';
import { logEvent } from '../../data/eventLog';
import { getConfig } from '../../data/configLoader';
import { computeBaselineScoring } from '../../domain/baselineScoring';
import { buildSwotProfile } from '../../domain/swot';

import type { MockEntry } from '../../data/schemas';

type DailyMinutes = 15 | 30 | 45 | 60 | 90;

export function ProfilePage(): React.ReactElement {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data, updateProfile, setData } = useStore();
  const profile = data.profile;

  const [activeTab, setActiveTab] = useState<'swot' | 'settings'>('swot');

  // Edit details state
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [selectedSchools, setSelectedSchools] = useState<string[]>(profile?.targetSchoolIds || []);
  const [dailyMinutes, setDailyMinutes] = useState<DailyMinutes>(profile?.dailyMinutes || 30);
  const [schoolError, setSchoolError] = useState('');

  // Reset modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'reset' | 'new-session'>('reset');

  // Demo clock state
  const [offsetInput, setOffsetInput] = useState<number>(0);
  const isSimulated = appClock.isSimulated();

  const config = getConfig();
  const questionsList = config?.questions?.questions || [];
  const baselinePatterns = data.baseline && data.baseline.status === 'completed'
    ? computeBaselineScoring(data.baseline, questionsList).patterns
    : [];
  const swotResult = buildSwotProfile(baselinePatterns, data.mocks);

  const loadedSchools = config?.schools?.schools || [];
  const schoolOptions = loadedSchools.length > 0
    ? loadedSchools.map((s: { id: string; name: string }) => ({ id: s.id, label: s.name }))
    : [
        { id: 'iima', label: 'IIM Ahmedabad' },
        { id: 'iimb', label: 'IIM Bangalore' },
        { id: 'iimc', label: 'IIM Calcutta' },
        { id: 'iiml', label: 'IIM Lucknow' },
        { id: 'fms', label: 'FMS Delhi' },
        { id: 'xlri', label: 'XLRI Jamshedpur' },
      ];

  const handleSaveDetails = () => {
    if (!displayName.trim()) {
      showToast('Display name cannot be empty.');
      return;
    }
    if (selectedSchools.length === 0) {
      showToast('Choose at least 1 target school.');
      return;
    }
    updateProfile({
      displayName: displayName.trim(),
      targetSchoolIds: selectedSchools,
      dailyMinutes,
    });
    showToast('Your details have been updated.');
  };

  const handleSchoolToggle = (id: string) => {
    setSchoolError('');
    setSelectedSchools((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // keep at least 1
        return prev.filter((s) => s !== id);
      }
      if (prev.length >= 3) {
        setSchoolError('You can choose up to 3.');
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleConfirmReset = () => {
    setModalOpen(false);
    resetApp();
    navigate('/welcome', { replace: true });
  };

  const handleApplyDemoOffset = () => {
    appClock.setOffsetDays(offsetInput);
    logEvent('demo_date_jumped', 'demo_tools');
    showToast(`Date simulated: ${appClock.today()}`);
  };

  const handleResetDemoClock = () => {
    appClock.resetOffset();
    setOffsetInput(0);
    showToast('Returned to today.');
  };

  const handleLoadSampleMock = async () => {
    try {
      const res = await fetch('/content/sampleMock.json');
      if (res.ok) {
        const sample: MockEntry = await res.json();
        setData((prev) => ({
          ...prev,
          mocks: [sample, ...prev.mocks.filter((m) => m.id !== sample.id)],
        }));
        logEvent('mock_summary_viewed', 'demo_tools');
        showToast('Loaded sample mock (AIMCAT 2026).');
      } else {
        throw new Error('Not found');
      }
    } catch {
      const fallbackSample: MockEntry = {
        id: '00000000-0000-0000-0000-000000000099',
        label: 'AIMCAT 2026 Sample Mock',
        date: '2026-10-15',
        provider: 'TIME',
        mockType: 'full',
        sections: [
          {
            section: 'VARC',
            questionCount: 24,
            actualScore: 15,
            savedAt: '2026-10-15T10:40:00.000Z',
            records: [
              ...Array.from({ length: 7 }, (_, i) => ({ n: i + 1, type: 'Reading Comprehension', step1: 'correct' as const, step2: 'fast' as const, outcomeCode: 'CORRECT_FAST' as const })),
              ...Array.from({ length: 2 }, (_, i) => ({ n: i + 8, type: 'Para Summary', step1: 'correct' as const, step2: 'slow' as const, outcomeCode: 'CORRECT_SLOW' as const })),
              ...Array.from({ length: 2 }, (_, i) => ({ n: i + 10, type: 'Para Jumble', step1: 'wrong' as const, step2: 'can_solve' as const, outcomeCode: 'WRONG_CAN' as const })),
              ...Array.from({ length: 4 }, (_, i) => ({ n: i + 12, type: 'Reading Comprehension', step1: 'correct' as const, step2: 'guessed' as const, outcomeCode: 'CORRECT_GUESSED' as const })),
              ...Array.from({ length: 4 }, (_, i) => ({ n: i + 16, type: 'Odd Sentence Out', step1: 'left' as const, step2: 'cannot_solve' as const, outcomeCode: 'LEFT_CANNOT' as const })),
              ...Array.from({ length: 5 }, (_, i) => ({ n: i + 20, type: 'Reading Comprehension', step1: 'wrong' as const, step2: 'cannot_solve' as const, outcomeCode: 'WRONG_CANNOT' as const })),
            ],
          },
          {
            section: 'LRDI',
            questionCount: 22,
            actualScore: 12,
            savedAt: '2026-10-15T11:25:00.000Z',
            records: [
              ...Array.from({ length: 4 }, (_, i) => ({ n: i + 1, type: 'Data Interpretation - Tables', step1: 'correct' as const, step2: 'fast' as const, outcomeCode: 'CORRECT_FAST' as const })),
              ...Array.from({ length: 5 }, (_, i) => ({ n: i + 5, type: 'Seating Arrangement', step1: 'correct' as const, step2: 'slow' as const, outcomeCode: 'CORRECT_SLOW' as const })),
              ...Array.from({ length: 4 }, (_, i) => ({ n: i + 10, type: 'Data Interpretation - Charts', step1: 'left' as const, step2: 'can_solve' as const, outcomeCode: 'LEFT_CAN' as const })),
              ...Array.from({ length: 9 }, (_, i) => ({ n: i + 14, type: 'Games and Tournaments', step1: 'left' as const, step2: 'cannot_solve' as const, outcomeCode: 'LEFT_CANNOT' as const })),
            ],
          },
          {
            section: 'QA',
            questionCount: 22,
            actualScore: 6,
            savedAt: '2026-10-15T12:10:00.000Z',
            records: [
              ...Array.from({ length: 3 }, (_, i) => ({ n: i + 1, type: 'Arithmetic', step1: 'correct' as const, step2: 'fast' as const, outcomeCode: 'CORRECT_FAST' as const })),
              ...Array.from({ length: 2 }, (_, i) => ({ n: i + 4, type: 'Algebra', step1: 'correct' as const, step2: 'slow' as const, outcomeCode: 'CORRECT_SLOW' as const })),
              ...Array.from({ length: 3 }, (_, i) => ({ n: i + 6, type: 'Geometry', step1: 'wrong' as const, step2: 'can_solve' as const, outcomeCode: 'WRONG_CAN' as const })),
              ...Array.from({ length: 14 }, (_, i) => ({ n: i + 9, type: 'Number Systems', step1: 'left' as const, step2: 'cannot_solve' as const, outcomeCode: 'LEFT_CANNOT' as const })),
            ],
          },
        ],
      };
      setData((prev) => ({
        ...prev,
        mocks: [fallbackSample, ...prev.mocks.filter((m) => m.id !== fallbackSample.id)],
      }));
      logEvent('mock_summary_viewed', 'demo_tools');
      showToast('Loaded sample mock (AIMCAT 2026).');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[800px] mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-h1 text-[var(--lm-ink)] m-0">My profile</h1>
      </div>

      <Tabs
        tabs={[
          { id: 'swot', label: 'SWOT' },
          { id: 'settings', label: 'Settings and data' },
        ]}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab as 'swot' | 'settings')}
      />

      {/* TAB 1: SWOT */}
      {activeTab === 'swot' && (
        <div className="flex flex-col gap-6">
          <Banner
            id="swot-starter-banner"
            type="info"
            message="Starter profile. It becomes more detailed as you use the app."
          />

          {swotResult && swotResult.totalPatterns > 0 ? (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <Card className="p-6 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-h2 font-semibold text-[var(--lm-ink)] m-0">Strengths</h2>
                    <span className="text-caption font-bold px-2 py-0.5 rounded-[var(--lm-radius-pill)] bg-[var(--grade-a-bg)] text-[var(--grade-a-fg)]">
                      {swotResult.strengths.length}
                    </span>
                  </div>
                  {swotResult.strengths.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {swotResult.strengths.map((item) => (
                        <div key={item.id} className="p-3 bg-[var(--lm-inset)] rounded-[var(--lm-radius-sm)] flex flex-col gap-1">
                          <span className="text-body-strong text-[var(--lm-ink)]">{item.section}: {item.type}</span>
                          <EvidenceLine questionCount={item.questionCount} text={item.evidence} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-small text-[var(--lm-text-muted)] m-0">No strengths classified yet.</p>
                  )}
                </Card>

                {/* Weaknesses */}
                <Card className="p-6 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-h2 font-semibold text-[var(--lm-ink)] m-0">Weaknesses</h2>
                    <span className="text-caption font-bold px-2 py-0.5 rounded-[var(--lm-radius-pill)] bg-[var(--grade-d-bg)] text-[var(--grade-d-fg)]">
                      {swotResult.weaknesses.length}
                    </span>
                  </div>
                  {swotResult.weaknesses.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {swotResult.weaknesses.map((item) => (
                        <div key={item.id} className="p-3 bg-[var(--lm-inset)] rounded-[var(--lm-radius-sm)] flex flex-col gap-1">
                          <span className="text-body-strong text-[var(--lm-ink)]">{item.section}: {item.type}</span>
                          <EvidenceLine questionCount={item.questionCount} text={item.evidence} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-small text-[var(--lm-text-muted)] m-0">No weaknesses classified yet.</p>
                  )}
                </Card>

                {/* Opportunities */}
                <Card className="p-6 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-h2 font-semibold text-[var(--lm-ink)] m-0">Opportunities</h2>
                    <span className="text-caption font-bold px-2 py-0.5 rounded-[var(--lm-radius-pill)] bg-[var(--grade-b-bg)] text-[var(--grade-b-fg)]">
                      {swotResult.opportunities.length}
                    </span>
                  </div>
                  {swotResult.opportunities.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {swotResult.opportunities.map((item) => (
                        <div key={item.id} className="p-3 bg-[var(--lm-inset)] rounded-[var(--lm-radius-sm)] flex flex-col gap-1">
                          <span className="text-body-strong text-[var(--lm-ink)]">{item.section}: {item.type}</span>
                          <EvidenceLine questionCount={item.questionCount} text={item.evidence} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-small text-[var(--lm-text-muted)] m-0">No opportunities classified yet.</p>
                  )}
                </Card>

                {/* Threats */}
                <Card className="p-6 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-h2 font-semibold text-[var(--lm-ink)] m-0">Threats</h2>
                    <span className="text-caption font-bold px-2 py-0.5 rounded-[var(--lm-radius-pill)] bg-[var(--grade-c-bg)] text-[var(--grade-c-fg)]">
                      {swotResult.threats.length}
                    </span>
                  </div>
                  {swotResult.threats.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {swotResult.threats.map((item) => (
                        <div key={item.id} className="p-3 bg-[var(--lm-inset)] rounded-[var(--lm-radius-sm)] flex flex-col gap-1">
                          <span className="text-body-strong text-[var(--lm-ink)]">{item.section}: {item.type}</span>
                          <EvidenceLine questionCount={item.questionCount} text={item.evidence} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-small text-[var(--lm-text-muted)] m-0">No threats classified yet.</p>
                  )}
                </Card>
              </div>

              {/* Reflection prompt */}
              <div className="p-5 rounded-[var(--lm-radius-md)] bg-[var(--lm-inset)] border border-[var(--lm-border)]">
                <p className="text-reflect italic text-[var(--lm-ink)] m-0">
                  &ldquo;Notice your opportunities: knowledge is present, decisions and timing are your levers.&rdquo;
                </p>
              </div>
            </div>
          ) : (
            <EmptyState
              message="Nothing here yet. This fills in as you practise."
              actionLabel="Start baseline"
              onAction={() => navigate('/practice/baseline')}
            />
          )}
        </div>
      )}

      {/* TAB 2: Settings & Data */}
      {activeTab === 'settings' && (
        <div className="flex flex-col gap-6">
          {/* Card 1: Your details */}
          <Card className="p-6 sm:p-8 flex flex-col gap-6">
            <h2 className="text-h2 font-semibold text-[var(--lm-ink)] m-0">Your details</h2>

            <Field
              label="Display name"
              helper="Any name or nickname. It stays on this device."
              value={displayName}
              maxLength={30}
              showCharCount
              onChange={(e) => setDisplayName(e.target.value)}
            />

            <div>
              <label className="text-body-strong text-[var(--lm-ink)] block mb-1">
                Target schools ({selectedSchools.length} of 3 chosen)
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {schoolOptions.map((school: { id: string; label: string }) => {
                  const isSelected = selectedSchools.includes(school.id);
                  return (
                    <button
                      key={school.id}
                      type="button"
                      onClick={() => handleSchoolToggle(school.id)}
                      className={[
                        'px-3.5 py-2 rounded-[var(--lm-radius-pill)] text-body transition-colors cursor-pointer border',
                        isSelected
                          ? 'bg-[var(--lm-accent-soft)] border-2 border-[var(--lm-ink)] font-bold text-[var(--lm-ink)]'
                          : 'bg-[var(--lm-surface)] border-[var(--lm-border-strong)] text-[var(--lm-ink)] hover:bg-[var(--lm-inset)]',
                      ].join(' ')}
                    >
                      {school.label}
                    </button>
                  );
                })}
              </div>
              {schoolError && (
                <p role="alert" className="text-small text-[var(--lm-notice-text)] mt-1.5 m-0">
                  {schoolError}
                </p>
              )}
            </div>

            <div>
              <label className="text-body-strong text-[var(--lm-ink)] block mb-1">
                Daily practice duration
              </label>
              <div className="flex flex-wrap gap-2.5 mt-2">
                {([15, 30, 45, 60, 90] as DailyMinutes[]).map((mins) => {
                  const isSelected = dailyMinutes === mins;
                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDailyMinutes(mins)}
                      className={[
                        'px-4 py-2 rounded-[var(--lm-radius-pill)] text-body transition-colors cursor-pointer border',
                        isSelected
                          ? 'bg-[var(--lm-accent-soft)] border-2 border-[var(--lm-ink)] font-bold text-[var(--lm-ink)]'
                          : 'bg-[var(--lm-surface)] border-[var(--lm-border-strong)] text-[var(--lm-ink)] hover:bg-[var(--lm-inset)]',
                      ].join(' ')}
                    >
                      {mins} min
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <Button variant="primary" onClick={handleSaveDetails}>
                Save changes
              </Button>
            </div>
          </Card>

          {/* Card 2: Data on this device */}
          <Card className="p-6 sm:p-8 flex flex-col gap-4">
            <h2 className="text-h2 font-semibold text-[var(--lm-ink)] m-0">Data on this device</h2>
            <p className="text-body text-[var(--lm-text-muted)] m-0 leading-relaxed">
              All your practice data, SWOT insights, and mocks are stored locally in this browser. Nothing is sent to any server.
            </p>

            <div className="flex flex-wrap gap-3 pt-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setModalMode('new-session');
                  setModalOpen(true);
                }}
              >
                Start new session
              </Button>
              <Button
                variant="quiet-danger"
                onClick={() => {
                  setModalMode('reset');
                  setModalOpen(true);
                }}
              >
                Reset my data
              </Button>
            </div>
          </Card>

          {/* Card 3: Demo tools */}
          <Card className="p-6 sm:p-8 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-h2 font-semibold text-[var(--lm-ink)] m-0">Demo tools</h2>
              <Badge variant="simulation" label="Simulation" />
            </div>

            <p className="text-body text-[var(--lm-text-muted)] m-0">
              This changes the app&apos;s date so you can see how reminders behave. It does not change timers.
            </p>

            {isSimulated && (
              <p className="text-body-strong text-[var(--lm-ink)] m-0">
                Active date: {appClock.today()}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <label htmlFor="jump-days" className="text-body font-medium">
                Jump days (−30 to +60):
              </label>
              <input
                id="jump-days"
                type="number"
                min={-30}
                max={60}
                value={offsetInput}
                onChange={(e) => setOffsetInput(parseInt(e.target.value, 10) || 0)}
                className="w-20 px-3 py-2 border-[1.5px] border-[var(--lm-border-strong)] rounded-[var(--lm-radius-md)] text-body"
              />
              <Button variant="secondary" onClick={handleApplyDemoOffset}>
                Apply
              </Button>
              {isSimulated && (
                <Button variant="ghost" onClick={handleResetDemoClock}>
                  Back to today
                </Button>
              )}
            </div>

            <div className="pt-3 border-t border-[var(--lm-sage-200)] flex items-center justify-between">
              <div>
                <p className="text-body-strong text-[var(--lm-ink)] m-0">Sample mock data</p>
                <p className="text-small text-[var(--lm-text-muted)] m-0">
                  Load the AIMCAT 2026 worked example mock into your saved mocks.
                </p>
              </div>
              <Button variant="secondary" onClick={handleLoadSampleMock}>
                Load sample mock
              </Button>
            </div>
          </Card>

          {/* Card 4: Send to the team */}
          <Card className="p-6 sm:p-8 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-h2 font-semibold text-[var(--lm-ink)] m-0 mb-1">Send to the team</h2>
              <p className="text-small text-[var(--lm-text-muted)] m-0">
                Review your session summary and share anonymous feedback.
              </p>
            </div>
            <Button variant="secondary" onClick={() => navigate('/feedback')}>
              Share feedback
            </Button>
          </Card>
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        id="reset-confirm-modal"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          modalMode === 'reset'
            ? 'Delete everything on this device?'
            : 'Start a new session?'
        }
      >
        <div className="flex flex-col gap-6">
          <p className="text-body text-[var(--lm-ink)] m-0">
            {modalMode === 'reset'
              ? "Delete everything on this device? This removes your profile and all practice data. It can't be undone."
              : 'This will reset your local profile and practice records so a new tester can begin.'}
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmReset}>
              {modalMode === 'reset' ? 'Delete everything' : 'Start new session'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
