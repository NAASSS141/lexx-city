import { useEffect, useMemo, useState } from 'react';
import type { AppActions, AttributeKey, Chapter, Flags, GameState, Page, TrialScore } from './types';
import { clearGame, defaultState, loadGame, saveGame } from './store/gameStore';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { MapPage } from './pages/MapPage';
import { DialogPage } from './pages/DialogPage';
import { InvestigationPage } from './pages/InvestigationPage';
import { EvidencePage } from './pages/EvidencePage';
import { TrialPage } from './pages/TrialPage';
import { EndingPage } from './pages/EndingPage';
import { KnowledgePage } from './pages/KnowledgePage';
import { CaseArchivePage } from './pages/CaseArchivePage';

function unique<T>(list: T[]): T[] {
  return Array.from(new Set(list));
}

export default function App() {
  const [state, setState] = useState<GameState>(() => loadGame() ?? defaultState);

  useEffect(() => {
    saveGame(state);
  }, [state]);

  const actions: AppActions = useMemo(() => ({
    setPage: (page: Page) => setState((prev) => ({ ...prev, page })),
    startNewGame: () => {
      const fresh: GameState = {
        ...defaultState,
        page: 'map',
        currentChapter: 'not_started',
        log: ['崔律的第一案已开启。']
      };
      setState(fresh);
      saveGame(fresh);
    },
    continueGame: () => {
      const saved = loadGame();
      if (saved) setState({ ...saved, page: saved.ending ? 'ending' : saved.page === 'home' ? 'map' : saved.page });
    },
    resetGame: () => {
      clearGame();
      setState({ ...defaultState, page: 'home' });
    },
    setChapter: (currentChapter: Chapter) => setState((prev) => ({ ...prev, currentChapter })),
    setActiveInvestigation: (activeInvestigation: GameState['activeInvestigation']) => setState((prev) => ({ ...prev, activeInvestigation })),
    visitScene: (scene: string) => setState((prev) => ({ ...prev, visitedScenes: unique([...prev.visitedScenes, scene]) })),
    addEvidence: (id: string) => setState((prev) => {
      if (prev.collectedEvidence.includes(id)) return prev;
      return {
        ...prev,
        collectedEvidence: [...prev.collectedEvidence, id],
        log: [`获得证据：${id}`, ...prev.log].slice(0, 80)
      };
    }),
    addManyEvidence: (ids: string[]) => setState((prev) => ({
      ...prev,
      collectedEvidence: unique([...prev.collectedEvidence, ...ids]),
      log: unique([...ids.map((id) => `获得证据：${id}`), ...prev.log]).slice(0, 80)
    })),
    addAttribute: (key: AttributeKey, amount: number) => setState((prev) => ({
      ...prev,
      attributes: { ...prev.attributes, [key]: Math.max(0, prev.attributes[key] + amount) }
    })),
    addKnowledge: (id: string) => setState((prev) => prev.knowledgeCards.includes(id) ? prev : ({
      ...prev,
      knowledgeCards: [...prev.knowledgeCards, id]
    })),
    completeChain: (id: string) => setState((prev) => ({
      ...prev,
      completedChains: unique([...prev.completedChains, id]),
      failedChains: prev.failedChains.filter((item) => item !== id)
    })),
    failChain: (id: string) => setState((prev) => ({
      ...prev,
      failedChains: unique([...prev.failedChains, id])
    })),
    addStrategy: (id: string) => setState((prev) => ({
      ...prev,
      trialStrategies: unique([...prev.trialStrategies, id])
    })),
    addTrialScore: (key: keyof TrialScore, amount: number) => setState((prev) => ({
      ...prev,
      trialScore: { ...prev.trialScore, [key]: prev.trialScore[key] + amount }
    })),
    setWitnessTrust: (id: string, value: number) => setState((prev) => ({
      ...prev,
      witnessTrust: { ...prev.witnessTrust, [id]: value }
    })),
    setFlag: <K extends keyof Flags>(key: K, value: Flags[K]) => setState((prev) => ({
      ...prev,
      flags: { ...prev.flags, [key]: value }
    })),
    bumpEmotionalMistake: () => setState((prev) => ({
      ...prev,
      flags: { ...prev.flags, emotionalMistakes: prev.flags.emotionalMistakes + 1 }
    })),
    finishWithEnding: (ending: string) => setState((prev) => ({
      ...prev,
      ending,
      currentChapter: 'ending',
      page: 'ending',
      log: [`案件结局：${ending}`, ...prev.log].slice(0, 80)
    })),
    addLog: (entry: string) => setState((prev) => ({ ...prev, log: [entry, ...prev.log].slice(0, 80) })),
    toggleSetting: (key: 'sfx' | 'bgm') => setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, [key]: !prev.settings[key] }
    }))
  }), []);

  const game = { state, actions };

  function renderPage(page: Page) {
    switch (page) {
      case 'home': return <HomePage game={game} />;
      case 'map': return <MapPage game={game} />;
      case 'dialog': return <DialogPage game={game} />;
      case 'investigation': return <InvestigationPage game={game} />;
      case 'evidence': return <EvidencePage game={game} />;
      case 'trial': return <TrialPage game={game} />;
      case 'ending': return <EndingPage game={game} />;
      case 'knowledge': return <KnowledgePage game={game} />;
      case 'archive': return <CaseArchivePage game={game} />;
      default: return <HomePage game={game} />;
    }
  }

  return <Layout game={game}>{renderPage(state.page)}</Layout>;
}
