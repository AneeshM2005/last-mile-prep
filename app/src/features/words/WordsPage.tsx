/**
 * WordsPage.tsx – Vocabulary flashcard review and management.
 * PRD 7, design 8.10.
 * Route: /words
 *
 * Implements Part D legibility fixes:
 * - Opaque white cards with 1px sage border (no opacity reduction)
 * - Word headings in ink #2B2B2B (font-serif)
 * - Definitions in ink #2B2B2B (14.16:1 contrast on white)
 * - "From: ..." line in muted token at 13px (6.84:1 contrast)
 * - Stat tiles in ink and deep-sage (no yellow or bright green numbers)
 * - Status badges with shape icons: Triangle for Still learning (6.53:1), CircleCheck for Got it (9.11:1)
 * - Inactive toggle label at least 4.5:1 against sage-100 background (5.81:1)
 * - Elimination of all dark:* and raw zinc-* classes that caused white-on-white text in dark mode
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Tabs } from '../../ui/Tabs';
import { EmptyState } from '../../ui/EmptyState';
import { useAppContext } from '../../app/providers';
import { useStore } from '../../data/store';
import { logEvent } from '../../data/eventLog';
import {
  filterWordCards,
  getWordCardStats,
  setWordStatus,
  findGlossaryEntry,
} from '../../domain/wordCards';
import type { Passage } from '../../data/configSchemas';
import type { WordCard } from '../../data/schemas';
import {
  RotateCw,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Plus,
  Triangle,
  CheckCircle2,
} from 'lucide-react';

/**
 * Accessible status badge with shape icon + text (shape + label rule).
 * Meets WCAG AA & AAA contrast requirements.
 */
function WordStatusBadge({ status }: { status: 'learning' | 'known' }): React.ReactElement {
  if (status === 'known') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--lm-sage-50)] text-[var(--lm-sage-900)] border border-[var(--lm-sage-200)]">
        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--lm-sage-700)] shrink-0" aria-hidden="true" />
        <span>Got it</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--lm-notice-bg)] text-[var(--lm-notice-text)] border border-[var(--lm-border)]">
      <Triangle className="w-3 h-3 fill-current text-[var(--lm-notice-text)] shrink-0" aria-hidden="true" />
      <span>Still learning</span>
    </span>
  );
}

export function WordsPage(): React.ReactElement {
  const navigate = useNavigate();
  const { config } = useAppContext();
  const { data, setData } = useStore();

  const passages = (config?.passages?.passages as Passage[] | undefined) || [];
  const words = data.wordCards;

  // Filter tab: 'all' | 'learning' | 'known'
  const [activeTab, setActiveTab] = useState<'all' | 'learning' | 'known'>('all');
  // Mode: 'cards' | 'list'
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  // Flashcard carousel index
  const [cardIndex, setCardIndex] = useState<number>(0);
  // Whether current card is flipped
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Filtered words
  const filteredWords = useMemo(() => {
    return filterWordCards(words, activeTab);
  }, [words, activeTab]);

  const stats = useMemo(() => {
    return getWordCardStats(words);
  }, [words]);

  // Current active card in carousel
  const activeCard: WordCard | undefined = filteredWords[cardIndex] || filteredWords[0];

  // Lookup glossary entry for active card
  const activeGlossary = useMemo(() => {
    if (!activeCard) return null;
    return findGlossaryEntry(activeCard.word, passages, activeCard.passageId);
  }, [activeCard, passages]);

  // Handle card flip
  const handleFlip = () => {
    setIsFlipped((prev) => {
      const next = !prev;
      if (next) {
        logEvent('card_flipped', 'words');
      }
      return next;
    });
  };

  // Set card status
  const handleUpdateStatus = (card: WordCard, status: 'learning' | 'known') => {
    const updated = setWordStatus(card, status);
    const newCards = data.wordCards.map((c) => (c.id === card.id ? updated : c));
    setData((prev) => ({
      ...prev,
      wordCards: newCards,
    }));
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev + 1) % Math.max(1, filteredWords.length));
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCardIndex((prev) =>
      prev - 1 < 0 ? Math.max(0, filteredWords.length - 1) : prev - 1,
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[var(--lm-ink)] font-serif">
              Personal dictionary
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--lm-sage-100)] text-[var(--lm-sage-700)]">
              Vocabulary Cards
            </span>
          </div>
          <p className="text-sm text-[var(--lm-text-muted)] mt-1">
            Build active recall and reading fluency from curated RC passages.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/words/read')}
          className="self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Read a Passage
        </Button>
      </div>

      {/* Stats row: clean ink and deep-sage numbers, muted labels */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-4 text-center bg-[var(--lm-surface)] border border-[var(--lm-sage-200)] shadow-[var(--lm-shadow-card)]">
          <div className="text-2xl sm:text-3xl font-extrabold text-[var(--lm-ink)] font-serif">
            {stats.total}
          </div>
          <div className="text-xs text-[var(--lm-text-muted)] font-medium mt-1">Total Words</div>
        </Card>
        <Card className="p-4 text-center bg-[var(--lm-surface)] border border-[var(--lm-sage-200)] shadow-[var(--lm-shadow-card)]">
          <div className="text-2xl sm:text-3xl font-extrabold text-[var(--lm-ink)] font-serif">
            {stats.learning}
          </div>
          <div className="text-xs text-[var(--lm-text-muted)] font-medium mt-1">Still Learning</div>
        </Card>
        <Card className="p-4 text-center bg-[var(--lm-surface)] border border-[var(--lm-sage-200)] shadow-[var(--lm-shadow-card)]">
          <div className="text-2xl sm:text-3xl font-extrabold text-[var(--lm-sage-900)] font-serif">
            {stats.known}
          </div>
          <div className="text-xs text-[var(--lm-text-muted)] font-medium mt-1">Got It</div>
        </Card>
      </div>

      {/* Tabs and Mode switch */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[var(--lm-border)] pb-2">
        <Tabs
          tabs={[
            { id: 'all', label: `All (${stats.total})` },
            { id: 'learning', label: `Still learning (${stats.learning})` },
            { id: 'known', label: `Got it (${stats.known})` },
          ]}
          activeTab={activeTab}
          onChange={(id) => {
            setActiveTab(id as 'all' | 'learning' | 'known');
            setCardIndex(0);
            setIsFlipped(false);
          }}
        />

        {/* Toggle: Practice Cards / Word List */}
        <div className="flex items-center gap-1 bg-[var(--lm-sage-100)] p-1 rounded-lg text-xs font-semibold border border-[var(--lm-sage-200)]">
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={[
              'px-3 py-1 rounded-md transition-colors cursor-pointer',
              viewMode === 'cards'
                ? 'bg-[var(--lm-surface)] text-[var(--lm-ink)] shadow-xs font-bold'
                : 'text-[var(--lm-text-muted)] hover:text-[var(--lm-ink)]',
            ].join(' ')}
          >
            Practice Cards
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={[
              'px-3 py-1 rounded-md transition-colors cursor-pointer',
              viewMode === 'list'
                ? 'bg-[var(--lm-surface)] text-[var(--lm-ink)] shadow-xs font-bold'
                : 'text-[var(--lm-text-muted)] hover:text-[var(--lm-ink)]',
            ].join(' ')}
          >
            Word List
          </button>
        </div>
      </div>

      {/* Empty State */}
      {words.length === 0 ? (
        <EmptyState
          message="No vocabulary cards yet. Read a passage and tap words to start building your personal vocabulary collection."
          actionLabel="Read a Passage Now"
          onAction={() => navigate('/words/read')}
        />
      ) : filteredWords.length === 0 ? (
        <Card className="p-8 text-center text-[var(--lm-text-muted)] bg-[var(--lm-surface)] border border-[var(--lm-sage-200)]">
          No words matching the &ldquo;{activeTab}&rdquo; filter.
        </Card>
      ) : viewMode === 'cards' && activeCard ? (
        /* Flashcard practice carousel */
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-[var(--lm-text-muted)] font-medium px-1">
            <span>
              Card {cardIndex + 1} of {filteredWords.length}
            </span>
            <span>Click card or flip icon to see definition</span>
          </div>

          {/* 3D Flip Card Container */}
          <div
            className="w-full h-80 sm:h-96 relative cursor-pointer select-none"
            style={{ perspective: '1000px' }}
            onClick={handleFlip}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                handleFlip();
              }
            }}
            aria-label={`Flashcard for ${activeCard.word}, currently ${
              isFlipped ? 'definition showing' : 'word showing'
            }`}
          >
            <div
              className="w-full h-full relative transition-transform duration-500 ease-in-out"
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Card Front */}
              <div
                className="absolute inset-0 w-full h-full rounded-2xl border border-[var(--lm-sage-200)] bg-[var(--lm-surface)] p-8 flex flex-col justify-between shadow-[var(--lm-shadow-card)]"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                <div className="flex items-center justify-between">
                  <WordStatusBadge status={activeCard.status} />
                  <span className="text-xs text-[var(--lm-text-muted)] font-mono">Tap to flip</span>
                </div>

                <div className="text-center space-y-3 my-auto">
                  <h2 className="text-3xl sm:text-4xl font-extrabold capitalize tracking-tight text-[var(--lm-ink)] font-serif">
                    {activeCard.word}
                  </h2>
                  {activeGlossary && (
                    <p className="text-[13px] text-[var(--lm-text-muted)] italic">
                      From: {activeGlossary.passageTitle}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--lm-sage-700)] font-semibold">
                  <RotateCw className="w-3.5 h-3.5" />
                  Flip to reveal meaning
                </div>
              </div>

              {/* Card Back */}
              <div
                className="absolute inset-0 w-full h-full rounded-2xl border border-[var(--lm-sage-200)] bg-[var(--lm-surface)] p-6 sm:p-8 flex flex-col justify-between shadow-[var(--lm-shadow-card)] overflow-y-auto"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <div className="flex items-center justify-between border-b border-[var(--lm-border)] pb-2">
                  <span className="text-base font-bold capitalize text-[var(--lm-ink)] font-serif">
                    {activeCard.word}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--lm-sage-100)] text-[var(--lm-sage-900)]">
                    Meaning & Usage
                  </span>
                </div>

                <div className="my-auto space-y-3 py-2 text-left">
                  {activeGlossary ? (
                    <>
                      <div>
                        <div className="text-xs font-bold text-[var(--lm-sage-700)] uppercase tracking-wider">
                          Definition
                        </div>
                        <p className="text-sm sm:text-base text-[var(--lm-ink)] font-medium mt-0.5 leading-relaxed">
                          {activeGlossary.entry.meaning}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-[var(--lm-inset)] p-2.5 rounded-lg border border-[var(--lm-border)]">
                          <span className="text-[var(--lm-text-muted)] block font-semibold">
                            Synonym:
                          </span>
                          <span className="text-[var(--lm-ink)] font-medium">
                            {activeGlossary.entry.synonym}
                          </span>
                        </div>
                        <div className="bg-[var(--lm-inset)] p-2.5 rounded-lg border border-[var(--lm-border)]">
                          <span className="text-[var(--lm-text-muted)] block font-semibold">
                            Antonym:
                          </span>
                          <span className="text-[var(--lm-ink)] font-medium">
                            {activeGlossary.entry.antonym}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-[var(--lm-sage-700)] uppercase tracking-wider">
                          Context Example
                        </div>
                        <p className="text-[13px] text-[var(--lm-ink)] italic mt-0.5 bg-[var(--lm-inset)] p-2.5 rounded-lg border border-[var(--lm-border)] leading-relaxed">
                          &ldquo;{activeGlossary.entry.usage}&rdquo;
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6 text-[var(--lm-text-muted)] text-sm">
                      Definition pending glossary linkage for this word.
                    </div>
                  )}
                </div>

                <div className="text-center text-xs text-[var(--lm-text-muted)]">
                  Tap to flip back
                </div>
              </div>
            </div>
          </div>

          {/* Quick status actions and navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            {/* Status toggle buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant={activeCard.status === 'learning' ? 'primary' : 'secondary'}
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateStatus(activeCard, 'learning');
                }}
                className="flex-1 sm:flex-initial"
              >
                <RotateCw className="w-4 h-4 mr-1.5" />
                Still Learning
              </Button>
              <Button
                variant={activeCard.status === 'known' ? 'primary' : 'secondary'}
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateStatus(activeCard, 'known');
                }}
                className="flex-1 sm:flex-initial text-[var(--lm-sage-900)] font-semibold"
              >
                <BookmarkCheck className="w-4 h-4 mr-1.5" />
                Got It
              </Button>
            </div>

            {/* Previous / Next buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevCard();
                }}
                disabled={filteredWords.length <= 1}
                aria-label="Previous card"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Prev
              </Button>
              <Button
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextCard();
                }}
                disabled={filteredWords.length <= 1}
                aria-label="Next card"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Word List View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredWords.map((card) => {
            const glossary = findGlossaryEntry(
              card.word,
              passages,
              card.passageId,
            );
            return (
              <Card
                key={card.id}
                className="p-4 space-y-2.5 bg-[var(--lm-surface)] border border-[var(--lm-sage-200)] shadow-[var(--lm-shadow-card)]"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[var(--lm-ink)] capitalize font-serif">
                    {card.word}
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateStatus(
                        card,
                        card.status === 'learning' ? 'known' : 'learning',
                      )
                    }
                    className="cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--lm-focus)] rounded-full"
                    aria-label={`Toggle status for ${card.word}, currently ${
                      card.status === 'known' ? 'Got it' : 'Still learning'
                    }`}
                  >
                    <WordStatusBadge status={card.status} />
                  </button>
                </div>

                {glossary ? (
                  <div className="space-y-1">
                    <p className="line-clamp-2 text-sm text-[var(--lm-ink)] font-normal leading-relaxed">
                      {glossary.entry.meaning}
                    </p>
                    <div className="text-[var(--lm-text-muted)] text-[13px] pt-1">
                      From: {glossary.passageTitle}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[var(--lm-text-muted)] italic">
                    Glossary definition pending
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
