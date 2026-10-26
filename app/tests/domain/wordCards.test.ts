/**
 * wordCards.test.ts – Unit tests for word cards domain.
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeWord,
  createWordCard,
  addWordsFromSession,
  toggleWordStatus,
  setWordStatus,
  filterWordCards,
  getWordCardStats,
  findGlossaryEntry,
} from '@/domain/wordCards';
import type { WordCard } from '@/data/schemas';
import type { Passage } from '@/data/configSchemas';

describe('normalizeWord', () => {
  it('strips punctuation and converts to lowercase', () => {
    expect(normalizeWord('  "Epistemic," ')).toBe('epistemic');
    expect(normalizeWord('Heuristics...')).toBe('heuristics');
    expect(normalizeWord('(Bounded)')).toBe('bounded');
    expect(normalizeWord('')).toBe('');
  });
});

describe('createWordCard', () => {
  it('creates a word card with learning status and valid schema properties', () => {
    const card = createWordCard('Archetype', 'p-1', true, '2026-10-25');
    expect(card.id).toBeDefined();
    expect(card.word).toBe('archetype');
    expect(card.passageId).toBe('p-1');
    expect(card.addedOn).toBe('2026-10-25');
    expect(card.status).toBe('learning');
    expect(card.contentState).toBe('available');
  });

  it('marks contentState as pending when not available in glossary', () => {
    const card = createWordCard('Obscure', 'p-1', false, '2026-10-25');
    expect(card.contentState).toBe('pending');
  });
});

describe('addWordsFromSession', () => {
  it('adds non-duplicate words up to 30 and sets available/pending correctly', () => {
    const existing: WordCard[] = [
      {
        id: '1',
        word: 'cognition',
        passageId: 'p-1',
        addedOn: '2026-10-20',
        status: 'learning',
        contentState: 'available',
      },
    ];

    const rawWords = ['cognition', 'heuristic', 'epistemic', 'heuristic', 'unknownterm'];
    const glossary = ['heuristic', 'epistemic', 'salience'];

    const res = addWordsFromSession(existing, rawWords, 'p-2', glossary, '2026-10-26');
    expect(res.addedCount).toBe(3); // heuristic, epistemic, unknownterm (cognition already exists)
    expect(res.updatedCards).toHaveLength(4);

    const heuristicCard = res.addedCards.find((c) => c.word === 'heuristic');
    expect(heuristicCard?.contentState).toBe('available');

    const unknownCard = res.addedCards.find((c) => c.word === 'unknownterm');
    expect(unknownCard?.contentState).toBe('pending');
  });

  it('caps session additions at 30 words', () => {
    const rawWords = Array.from({ length: 45 }, (_, i) => `word${i}`);
    const res = addWordsFromSession([], rawWords, 'p-1', [], '2026-10-26');
    expect(res.addedCount).toBe(30);
  });
});

describe('status toggling and filtering', () => {
  it('toggles and sets status correctly', () => {
    const card = createWordCard('paradigm', 'p-1', true, '2026-10-26');
    const toggled = toggleWordStatus(card);
    expect(toggled.status).toBe('known');

    const toggledBack = toggleWordStatus(toggled);
    expect(toggledBack.status).toBe('learning');

    const setDirectly = setWordStatus(card, 'known');
    expect(setDirectly.status).toBe('known');
  });

  it('filters and counts stats correctly', () => {
    const cards: WordCard[] = [
      { id: '1', word: 'a', passageId: 'p-1', addedOn: '2026-10-20', status: 'learning', contentState: 'available' },
      { id: '2', word: 'b', passageId: 'p-1', addedOn: '2026-10-20', status: 'known', contentState: 'available' },
      { id: '3', word: 'c', passageId: 'p-1', addedOn: '2026-10-20', status: 'learning', contentState: 'pending' },
    ];

    expect(filterWordCards(cards, 'all')).toHaveLength(3);
    expect(filterWordCards(cards, 'learning')).toHaveLength(2);
    expect(filterWordCards(cards, 'known')).toHaveLength(1);

    const stats = getWordCardStats(cards);
    expect(stats).toEqual({ total: 3, learning: 2, known: 1 });
  });
});

describe('findGlossaryEntry', () => {
  const passages: Passage[] = [
    {
      id: 'p-1',
      title: 'Cognitive Biases',
      text: 'Sample text',
      source: 'Source 1',
      licence: 'CC BY',
      estReadMinutes: 3,
      glossary: [
        {
          word: 'heuristic',
          meaning: 'A practical mental shortcut',
          synonym: 'rule of thumb',
          antonym: 'algorithm',
          usage: 'Heuristics speed up decisions under uncertainty.',
        },
      ],
    },
  ];

  it('finds glossary entry and passage title', () => {
    const result = findGlossaryEntry('heuristic', passages, 'p-1');
    expect(result).not.toBeNull();
    expect(result?.passageTitle).toBe('Cognitive Biases');
    expect(result?.entry.meaning).toBe('A practical mental shortcut');
  });

  it('returns null for unknown word', () => {
    const result = findGlossaryEntry('nonexistent', passages);
    expect(result).toBeNull();
  });
});
