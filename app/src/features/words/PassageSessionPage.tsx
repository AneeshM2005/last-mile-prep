/**
 * PassageSessionPage.tsx – Interactive reading passage session.
 * PRD 7, design 8.9.
 * Route: /words/read
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { useAppContext } from '../../app/providers';
import { useStore } from '../../data/store';
import { appClock } from '../../domain/appClock';
import { logEvent } from '../../data/eventLog';
import { addWordsFromSession, normalizeWord } from '../../domain/wordCards';
import type { Passage, GlossaryWord } from '../../data/configSchemas';
import type { PassageSession } from '../../data/schemas';
import { BookOpen, Clock, CheckCircle2, X, ArrowLeft, Sparkles } from 'lucide-react';

export function PassageSessionPage(): React.ReactElement {
  const navigate = useNavigate();
  const { config } = useAppContext();
  const { data, setData } = useStore();

  const passages = (config?.passages?.passages as Passage[] | undefined) || [];

  // Determine starting passage: first one uncompleted, or first in list
  const initialPassageId = useMemo(() => {
    if (!passages.length) return '';
    const completedIds = new Set(
      data.passageSessions
        .filter((s) => s.status === 'completed')
        .map((s) => s.passageId),
    );
    const uncompleted = passages.find((p) => !completedIds.has(p.id));
    return uncompleted ? uncompleted.id : passages[0].id;
  }, [passages, data.passageSessions]);

  const [selectedPassageId, setSelectedPassageId] = useState<string>(initialPassageId);

  useEffect(() => {
    if (!selectedPassageId && initialPassageId) {
      setSelectedPassageId(initialPassageId);
    }
  }, [initialPassageId, selectedPassageId]);

  const currentPassage = passages.find((p) => p.id === selectedPassageId) || passages[0];

  // Session state
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [sessionStartTime] = useState<string>(() => new Date().toISOString());
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() =>
    currentPassage ? currentPassage.estReadMinutes * 60 : 180,
  );
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [sessionComplete, setSessionComplete] = useState<boolean>(false);
  const [savedCount, setSavedCount] = useState<number>(0);

  // Reset timer if passage changes
  useEffect(() => {
    if (currentPassage) {
      setSecondsRemaining(currentPassage.estReadMinutes * 60);
      setSelectedWords([]);
      setSessionComplete(false);
    }
  }, [currentPassage?.id]);

  // Timer countdown
  useEffect(() => {
    if (isTimerPaused || secondsRemaining <= 0 || sessionComplete) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerPaused, secondsRemaining, sessionComplete]);

  // Format seconds into MM:SS
  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Split passage text into tokens (words and separators)
  const textTokens = useMemo(() => {
    if (!currentPassage) return [];
    // Match words or whitespace/punctuation
    const regex = /([a-zA-Z0-9'-]+|[^a-zA-Z0-9'-]+)/g;
    const matches = currentPassage.text.match(regex) || [];
    return matches.map((token: string, index: number) => {
      const isWord = /[a-zA-Z0-9]/.test(token);
      const normalized = isWord ? normalizeWord(token) : '';
      return {
        id: `token-${index}`,
        text: token,
        isWord,
        normalized,
      };
    });
  }, [currentPassage]);

  // Toggle word selection
  const handleToggleWord = (normalized: string) => {
    if (!normalized) return;
    setSelectedWords((prev) => {
      if (prev.includes(normalized)) {
        return prev.filter((w) => w !== normalized);
      }
      if (prev.length >= 30) {
        return prev; // Capped at 30 words per session
      }
      return [...prev, normalized];
    });
  };

  // Complete session and save words
  const handleFinishReading = () => {
    if (!currentPassage) return;

    const today = appClock.today();
    const glossaryWords = currentPassage.glossary.map((g: GlossaryWord) => g.word);

    // Add words to store
    const { updatedCards, addedCards, addedCount } = addWordsFromSession(
      data.wordCards,
      selectedWords,
      currentPassage.id,
      glossaryWords,
      today,
    );

    // Create completed passage session record
    const endsAt = new Date(
      new Date(sessionStartTime).getTime() + currentPassage.estReadMinutes * 60 * 1000,
    ).toISOString();

    const newSession: PassageSession = {
      id: crypto.randomUUID(),
      passageId: currentPassage.id,
      status: 'completed',
      startedAt: sessionStartTime,
      endsAt,
      endedAt: new Date().toISOString(),
      selectedWords,
      assignedOn: today,
    };

    // Update activity log for today
    const existingActivity = data.activity.find((a) => a.date === today);
    let updatedActivity = data.activity;
    if (existingActivity) {
      if (!existingActivity.completedTaskTypes.includes('passage')) {
        updatedActivity = data.activity.map((a) =>
          a.date === today
            ? { ...a, completedTaskTypes: [...a.completedTaskTypes, 'passage' as const] }
            : a,
        );
      }
    } else {
      updatedActivity = [
        ...data.activity,
        { date: today, completedTaskTypes: ['passage' as const] },
      ];
    }

    setData((prev) => ({
      ...prev,
      wordCards: updatedCards,
      passageSessions: [...prev.passageSessions, newSession],
      activity: updatedActivity,
    }));

    // Log events
    logEvent('passage_session_completed', 'words');
    for (let i = 0; i < addedCards.length; i++) {
      logEvent('word_added', 'words');
    }

    setSavedCount(addedCount);
    setSessionComplete(true);
  };

  if (!currentPassage) {
    return (
      <div className="p-6 text-center">
        <p className="text-zinc-600 dark:text-zinc-400">Loading passage content...</p>
      </div>
    );
  }

  // Summary screen once finished
  if (sessionComplete) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <Card className="p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Reading Session Complete!
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
              You reviewed{' '}
              <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                {currentPassage.title}
              </span>
              .
            </p>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700 max-w-sm mx-auto">
            <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              +{savedCount}
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              New vocabulary cards added to your collection
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button variant="primary" onClick={() => navigate('/words')}>
              <Sparkles className="w-4 h-4 mr-2" />
              Practice Flashcards
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                // Find next passage
                const currentIndex = passages.findIndex((p) => p.id === currentPassage.id);
                const nextPassage = passages[(currentIndex + 1) % passages.length];
                setSelectedPassageId(nextPassage.id);
              }}
            >
              Read Another Passage
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <button
          type="button"
          onClick={() => navigate('/words')}
          className="inline-flex items-center text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Vocabulary
        </button>

        {/* Passage switcher if multiple */}
        {passages.length > 1 && (
          <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <span>Passage:</span>
            <select
              value={selectedPassageId}
              onChange={(e) => setSelectedPassageId(e.target.value)}
              className="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-800 dark:text-zinc-200 font-medium"
            >
              {passages.map((p, idx) => (
                <option key={p.id} value={p.id}>
                  Passage {idx + 1}: {p.title.slice(0, 30)}...
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Header card with timer and instructions */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-700 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                Reading Comprehension
              </span>
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                {currentPassage.estReadMinutes} min read
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">
              {currentPassage.title}
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Source: {currentPassage.source}
            </p>
          </div>

          {/* Reading timer */}
          <div className="flex items-center gap-3 self-start md:self-auto bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-xl">
            <Clock className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            <span
              className={`font-mono text-lg font-bold ${
                secondsRemaining === 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-zinc-800 dark:text-zinc-200'
              }`}
            >
              {formatTimer(secondsRemaining)}
            </span>
            <button
              type="button"
              onClick={() => setIsTimerPaused(!isTimerPaused)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 ml-1 cursor-pointer"
            >
              {isTimerPaused ? 'Resume' : 'Pause'}
            </button>
          </div>
        </div>

        {/* Interaction hint */}
        <div className="mt-4 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <span>
              Tap or click unfamiliar words as you read to create flashcards.
            </span>
          </div>
          <div className="font-semibold text-zinc-800 dark:text-zinc-200">
            {selectedWords.length} / 30 words selected
          </div>
        </div>
      </Card>

      {/* Passage text reading area with SelectableText */}
      <Card className="p-6 md:p-8 bg-amber-50/20 dark:bg-zinc-900/60">
        <div
          className="text-base md:text-lg leading-relaxed md:leading-loose text-zinc-800 dark:text-zinc-200 font-normal tracking-wide select-none"
          tabIndex={0}
          aria-label="Passage reading content"
        >
          {textTokens.map((token: { id: string; text: string; isWord: boolean; normalized: string }) => {
            if (!token.isWord) {
              return <span key={token.id}>{token.text}</span>;
            }

            const isSelected = selectedWords.includes(token.normalized);

            return (
              <button
                key={token.id}
                type="button"
                onClick={() => handleToggleWord(token.normalized)}
                aria-pressed={isSelected}
                className={`cursor-pointer transition-colors duration-150 inline-block px-0.5 rounded text-left ${
                  isSelected
                    ? 'bg-amber-200 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 font-medium underline underline-offset-4 decoration-amber-500'
                    : 'hover:bg-zinc-200/60 dark:hover:bg-zinc-700/50'
                }`}
              >
                {token.text}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Selected words preview chips */}
      {selectedWords.length > 0 && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Selected Words for Vocabulary:
            </span>
            <button
              type="button"
              onClick={() => setSelectedWords([])}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
            >
              Clear all
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedWords.map((word) => (
              <span
                key={word}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
              >
                {word}
                <button
                  type="button"
                  onClick={() => handleToggleWord(word)}
                  className="hover:text-indigo-900 dark:hover:text-indigo-100 cursor-pointer"
                  aria-label={`Remove ${word}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Bottom finish button */}
      <div className="flex justify-end pt-2">
        <Button
          variant="primary"
          onClick={handleFinishReading}
          className="w-full sm:w-auto px-8 py-3 text-base"
        >
          <CheckCircle2 className="w-5 h-5 mr-2" />
          Finish Reading ({selectedWords.length} words selected)
        </Button>
      </div>
    </div>
  );
}
