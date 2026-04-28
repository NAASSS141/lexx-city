import type { GameState } from '../types';

export const STORAGE_KEY = 'lex-city-save-v1';

export const defaultState: GameState = {
  playerName: '崔知微',
  page: 'home',
  currentChapter: 'not_started',
  activeInvestigation: null,
  visitedScenes: [],
  collectedEvidence: [],
  completedChains: [],
  failedChains: [],
  trialStrategies: [],
  knowledgeCards: [],
  witnessTrust: {},
  attributes: {
    logic: 0,
    empathy: 0,
    procedure: 0,
    socialInsight: 0
  },
  trialScore: {
    fact: 0,
    law: 0,
    procedure: 0,
    social: 0
  },
  flags: {
    emotionalMistakes: 0,
    hasVideoClue: false,
    challengedPlatform: false,
    questionedVictim: false,
    trialPhase: 1
  },
  ending: null,
  log: [],
  settings: {
    sfx: true,
    bgm: true
  }
};

export function loadGame(): GameState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GameState>;
    return {
      ...defaultState,
      ...parsed,
      attributes: { ...defaultState.attributes, ...parsed.attributes },
      trialScore: { ...defaultState.trialScore, ...parsed.trialScore },
      flags: { ...defaultState.flags, ...parsed.flags },
      settings: { ...defaultState.settings, ...parsed.settings }
    };
  } catch {
    return null;
  }
}

export function saveGame(state: GameState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearGame() {
  window.localStorage.removeItem(STORAGE_KEY);
}

export const hasSave = () => Boolean(window.localStorage.getItem(STORAGE_KEY));
