/**
 * words.test.tsx – Integration tests for Milestone M8: Passage reading and Words flashcard screens.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppContext, type AppContextValue } from '@/app/providers';
import { useStore } from '@/data/store';
import { PassageSessionPage } from '@/features/words/PassageSessionPage';
import { WordsPage } from '@/features/words/WordsPage';
import type { Passage } from '@/data/configSchemas';
import type { WordCard } from '@/data/schemas';
import type { LoadedConfig } from '@/data/configLoader';

const samplePassage: Passage = {
  id: 'p-1',
  title: 'Cognitive Architecture and Bounded Rationality',
  text: 'Human agents operate under intractable computational constraints, incomplete information landscapes, and severe temporal restrictions. Consequently, deliberation rarely aims for global optimization; rather, decision makers rely on satisficing heuristics.',
  source: 'The Last-Mile RC Series',
  licence: 'CC BY-SA 4.0',
  estReadMinutes: 3,
  glossary: [
    {
      word: 'intractable',
      meaning: 'Extremely difficult to solve',
      synonym: 'unmanageable',
      antonym: 'tractable',
      usage: 'The problem was intractable.',
    },
    {
      word: 'heuristics',
      meaning: 'Practical mental shortcuts',
      synonym: 'rules of thumb',
      antonym: 'exhaustive search',
      usage: 'Heuristics save time.',
    },
    {
      word: 'satisficing',
      meaning: 'Selecting an acceptable option',
      synonym: 'sufficing',
      antonym: 'optimizing',
      usage: 'Satisficing is common.',
    },
    // Add dummy entries to satisfy >= 15
    ...Array.from({ length: 12 }, (_, i) => ({
      word: `term${i}`,
      meaning: `meaning ${i}`,
      synonym: `syn ${i}`,
      antonym: `ant ${i}`,
      usage: `usage ${i}`,
    })),
  ],
};

const mockContextValue: AppContextValue = {
  config: {
    passages: {
      passages: [samplePassage],
    },
  } as unknown as LoadedConfig,
  configErrors: [],
  loading: false,
  storageAvailable: true,
};

describe('Milestone M8: Words and Passage Reading Screens', () => {
  beforeEach(() => {
    useStore.getState().resetAllData();
  });

  it('renders PassageSessionPage, allows word selection, and completes reading session', () => {
    render(
      <AppContext.Provider value={mockContextValue}>
        <MemoryRouter initialEntries={['/words/read']}>
          <Routes>
            <Route path="/words/read" element={<PassageSessionPage />} />
            <Route path="/words" element={<WordsPage />} />
          </Routes>
        </MemoryRouter>
      </AppContext.Provider>,
    );

    // Verify header and passage title
    expect(
      screen.getByText('Cognitive Architecture and Bounded Rationality'),
    ).toBeInTheDocument();
    expect(screen.getByText('3:00')).toBeInTheDocument(); // 3 mins * 60s

    // Click on words to select them
    const intractableBtn = screen.getByRole('button', { name: 'intractable' });
    fireEvent.click(intractableBtn);

    // Selected words counter updates
    expect(screen.getByText('1 / 30 words selected')).toBeInTheDocument();

    // Finish reading session
    const finishBtn = screen.getByRole('button', {
      name: /Finish Reading \(1 words selected\)/i,
    });
    fireEvent.click(finishBtn);

    // Verify session completion screen
    expect(screen.getByText('Reading Session Complete!')).toBeInTheDocument();

    // Check store state: 1 word card added, passageSession recorded, activity updated
    const state = useStore.getState().data;
    expect(state.wordCards).toHaveLength(1);
    expect(state.wordCards[0].word).toBe('intractable');
    expect(state.wordCards[0].contentState).toBe('available');
    expect(state.passageSessions).toHaveLength(1);
    expect(state.activity.some((a) => a.completedTaskTypes.includes('passage'))).toBe(
      true,
    );
  });

  it('renders WordsPage with empty state and navigates to read passage', () => {
    render(
      <AppContext.Provider value={mockContextValue}>
        <MemoryRouter initialEntries={['/words']}>
          <Routes>
            <Route path="/words" element={<WordsPage />} />
          </Routes>
        </MemoryRouter>
      </AppContext.Provider>,
    );

    expect(screen.getByText('My Words')).toBeInTheDocument();
    expect(screen.getByText(/No vocabulary cards yet/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Read a Passage Now/i })).toBeInTheDocument();
  });

  it('renders WordsPage with existing cards, flips card, and toggles known status', () => {
    const existingCards: WordCard[] = [
      {
        id: 'c-1',
        word: 'intractable',
        passageId: 'p-1',
        addedOn: '2026-10-26',
        status: 'learning',
        contentState: 'available',
      },
    ];

    useStore.getState().setData((prev) => ({
      ...prev,
      wordCards: existingCards,
    }));

    render(
      <AppContext.Provider value={mockContextValue}>
        <MemoryRouter initialEntries={['/words']}>
          <Routes>
            <Route path="/words" element={<WordsPage />} />
          </Routes>
        </MemoryRouter>
      </AppContext.Provider>,
    );

    // Verify stats
    expect(screen.getByText('Total Words')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'intractable' })).toBeInTheDocument();

    // Click on flashcard to flip
    const cardEl = screen.getByRole('button', {
      name: /Flashcard for intractable/i,
    });
    fireEvent.click(cardEl);

    // Back of card shows meaning
    expect(screen.getByText('Extremely difficult to solve')).toBeInTheDocument();

    // Click "Got It" button to mark known
    const gotItBtn = screen.getByRole('button', { name: /Got It/i });
    fireEvent.click(gotItBtn);

    // Verify state updated
    const updatedState = useStore.getState().data;
    expect(updatedState.wordCards[0].status).toBe('known');
  });
});
