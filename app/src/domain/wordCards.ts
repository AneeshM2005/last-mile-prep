/**
 * wordCards.ts – Domain logic for vocabulary cards and passage word selection.
 * Schema 2.7, PRD 7, design 8.9, 8.10.
 */

import type { WordCard } from '../data/schemas';
import type { Passage, GlossaryWord } from '../data/configSchemas';

/**
 * Normalises a word: lowercases, trims, and strips surrounding punctuation.
 * E.g., '"epistemic,"' -> 'epistemic'
 */
export function normalizeWord(raw: string): string {
  if (!raw) return '';
  return raw
    .trim()
    .toLowerCase()
    .replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, '');
}

/**
 * Creates a single WordCard according to Schema 2.7.
 */
export function createWordCard(
  rawWord: string,
  passageId: string,
  availableInGlossary: boolean,
  clockDate: string,
): WordCard {
  return {
    id: crypto.randomUUID(),
    word: normalizeWord(rawWord),
    passageId,
    addedOn: clockDate,
    status: 'learning',
    contentState: availableInGlossary ? 'available' : 'pending',
  };
}

/**
 * Processes words selected during a passage reading session.
 * - Deduplicates within the session
 * - Caps at 30 words per session (BR: selectedWords max 30)
 * - Skips words already in existingCards (duplicate words are not added twice)
 * - Sets contentState to 'available' if in passage glossary, else 'pending'
 */
export function addWordsFromSession(
  existingCards: WordCard[],
  rawWords: string[],
  passageId: string,
  glossaryWords: string[],
  clockDate: string,
): {
  updatedCards: WordCard[];
  addedCards: WordCard[];
  addedCount: number;
} {
  const existingSet = new Set(existingCards.map((c) => normalizeWord(c.word)));
  const glossarySet = new Set(glossaryWords.map((w) => normalizeWord(w)));

  // Deduplicate session words and cap at 30
  const sessionWords: string[] = [];
  const seenInSession = new Set<string>();

  for (const raw of rawWords) {
    const norm = normalizeWord(raw);
    if (!norm) continue;
    if (seenInSession.has(norm)) continue;
    seenInSession.add(norm);
    sessionWords.push(norm);
    if (sessionWords.length >= 30) break;
  }

  const addedCards: WordCard[] = [];

  for (const word of sessionWords) {
    if (existingSet.has(word)) continue;
    const isAvailable = glossarySet.has(word);
    const newCard = createWordCard(word, passageId, isAvailable, clockDate);
    addedCards.push(newCard);
    existingSet.add(word); // Prevent double additions in same batch
  }

  return {
    updatedCards: [...existingCards, ...addedCards],
    addedCards,
    addedCount: addedCards.length,
  };
}

/**
 * Toggles a card's status between 'learning' and 'known'.
 */
export function toggleWordStatus(card: WordCard): WordCard {
  return {
    ...card,
    status: card.status === 'learning' ? 'known' : 'learning',
  };
}

/**
 * Explicitly sets a card's status.
 */
export function setWordStatus(card: WordCard, status: 'learning' | 'known'): WordCard {
  return {
    ...card,
    status,
  };
}

/**
 * Filters word cards by status tab.
 */
export function filterWordCards(
  cards: WordCard[],
  filter: 'all' | 'learning' | 'known',
): WordCard[] {
  if (filter === 'all') return cards;
  return cards.filter((c) => c.status === filter);
}

/**
 * Calculates aggregate stats for word cards.
 */
export function getWordCardStats(cards: WordCard[]): {
  total: number;
  learning: number;
  known: number;
} {
  let learning = 0;
  let known = 0;
  for (const c of cards) {
    if (c.status === 'learning') learning += 1;
    else if (c.status === 'known') known += 1;
  }
  return {
    total: cards.length,
    learning,
    known,
  };
}

/**
 * Finds glossary entry for a word across passages or matching passage.
 */
export function findGlossaryEntry(
  word: string,
  passages: Passage[],
  passageId?: string,
): { entry: GlossaryWord; passageTitle: string } | null {
  const norm = normalizeWord(word);
  if (!norm) return null;

  // Search matching passage first if provided
  if (passageId) {
    const p = passages.find((item) => item.id === passageId);
    if (p) {
      const match = p.glossary.find((g: GlossaryWord) => normalizeWord(g.word) === norm);
      if (match) return { entry: match, passageTitle: p.title };
    }
  }

  // Search all passages
  for (const p of passages) {
    const match = p.glossary.find((g: GlossaryWord) => normalizeWord(g.word) === norm);
    if (match) return { entry: match, passageTitle: p.title };
  }

  return null;
}
