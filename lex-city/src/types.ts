export type Page =
  | 'home'
  | 'map'
  | 'dialog'
  | 'investigation'
  | 'evidence'
  | 'trial'
  | 'ending'
  | 'knowledge'
  | 'archive';

export type Chapter =
  | 'not_started'
  | 'intro'
  | 'interview'
  | 'crossing'
  | 'sulan'
  | 'video'
  | 'platform'
  | 'evidence'
  | 'trial'
  | 'ending';

export type AttributeKey = 'logic' | 'empathy' | 'procedure' | 'socialInsight';

export interface Attributes {
  logic: number;
  empathy: number;
  procedure: number;
  socialInsight: number;
}

export interface TrialScore {
  fact: number;
  law: number;
  procedure: number;
  social: number;
}

export interface Flags {
  emotionalMistakes: number;
  hasVideoClue: boolean;
  challengedPlatform: boolean;
  questionedVictim: boolean;
  trialPhase: number;
}

export interface GameState {
  playerName: string;
  page: Page;
  currentChapter: Chapter;
  activeInvestigation: 'crossing' | 'video' | 'platform' | null;
  visitedScenes: string[];
  collectedEvidence: string[];
  completedChains: string[];
  failedChains: string[];
  trialStrategies: string[];
  knowledgeCards: string[];
  witnessTrust: Record<string, number>;
  attributes: Attributes;
  trialScore: TrialScore;
  flags: Flags;
  ending: string | null;
  log: string[];
  settings: {
    sfx: boolean;
    bgm: boolean;
  };
}

export interface Character {
  id: string;
  name: string;
  alias: string;
  role: string;
  emoji: string;
  traits: string[];
  description: string;
  quote: string;
}

export interface Evidence {
  id: string;
  name: string;
  description: string;
  source: string;
  credibility: number;
  tags: string[];
  isKey: boolean;
  icon: string;
}

export interface KnowledgeCard {
  id: string;
  title: string;
  content: string;
}

export interface Ending {
  id: string;
  title: string;
  subtitle: string;
  result: string;
  text: string;
  share: string;
}

export interface ChainDefinition {
  id: string;
  title: string;
  description: string;
  requiredEvidence: string[];
  optionalEvidence?: string[];
  conclusion: string;
}

export interface AppActions {
  setPage: (page: Page) => void;
  startNewGame: () => void;
  continueGame: () => void;
  resetGame: () => void;
  setChapter: (chapter: Chapter) => void;
  setActiveInvestigation: (scene: GameState['activeInvestigation']) => void;
  visitScene: (scene: string) => void;
  addEvidence: (id: string) => void;
  addManyEvidence: (ids: string[]) => void;
  addAttribute: (key: AttributeKey, amount: number) => void;
  addKnowledge: (id: string) => void;
  completeChain: (id: string) => void;
  failChain: (id: string) => void;
  addStrategy: (id: string) => void;
  addTrialScore: (key: keyof TrialScore, amount: number) => void;
  setWitnessTrust: (id: string, value: number) => void;
  setFlag: <K extends keyof Flags>(key: K, value: Flags[K]) => void;
  bumpEmotionalMistake: () => void;
  finishWithEnding: (ending: string) => void;
  addLog: (entry: string) => void;
  toggleSetting: (key: 'sfx' | 'bgm') => void;
}

export interface GameContextValue {
  state: GameState;
  actions: AppActions;
}
