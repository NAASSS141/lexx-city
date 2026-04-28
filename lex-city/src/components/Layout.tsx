import type { ReactNode } from 'react';
import type { GameContextValue, Page } from '../types';
import { LegalDisclaimer } from './LegalDisclaimer';
import { Button } from './Button';
import { chapterTitles } from '../data/scenes';

interface LayoutProps {
  game: GameContextValue;
  children: ReactNode;
}

export function Layout({ game, children }: LayoutProps) {
  const { state, actions } = game;
  const nav = (page: Page) => actions.setPage(page);

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <button className="brand" onClick={() => nav('home')}>
          <span className="brand-mark">⚖️</span>
          <span>
            <strong>法域迷城</strong>
            <small>第一案：算法之下</small>
          </span>
        </button>
        <nav className="top-actions">
          <button onClick={() => nav('map')}>地图</button>
          <button onClick={() => nav('archive')}>档案</button>
          <button onClick={() => nav('knowledge')}>知识库</button>
          <button onClick={() => actions.toggleSetting('bgm')}>{state.settings.bgm ? 'BGM 开' : 'BGM 关'}</button>
          <button onClick={() => actions.toggleSetting('sfx')}>{state.settings.sfx ? '音效 开' : '音效 关'}</button>
        </nav>
      </header>

      <main className="main-panel">
        <section className="status-strip">
          <span>当前身份：崔知微，崔律</span>
          <span>{chapterTitles[state.currentChapter]}</span>
          <span>已收集证据：{state.collectedEvidence.length}</span>
        </section>
        {children}
      </main>

      <div className="quick-reset">
        <Button variant="ghost" onClick={actions.resetGame}>重新开始</Button>
      </div>
      <LegalDisclaimer />
    </div>
  );
}
