import type { GameContextValue } from '../types';
import { Button } from '../components/Button';
import { hasSave } from '../store/gameStore';

interface Props {
  game: GameContextValue;
}

export function HomePage({ game }: Props) {
  const { actions } = game;
  const canContinue = hasSave();

  return (
    <section className="hero-page fade-in">
      <div className="city-silhouette" aria-hidden="true">
        <div className="court-light" />
        <div className="building b1" />
        <div className="building b2" />
        <div className="building b3" />
        <div className="building b4" />
      </div>
      <div className="hero-copy">
        <p className="eyebrow">网页剧情法律游戏</p>
        <h1>法域迷城</h1>
        <h2>第一案：算法之下</h2>
        <p className="hero-text">
          你是崔知微，也被所有人称为崔律。今晚，法域城交给你一份被剪碎的真相：
          一个外卖骑手、一个受伤的行人、一段被切断的监控，以及一套藏在报表里的算法规则。
        </p>
        <div className="hero-actions">
          <Button onClick={actions.startNewGame}>开始游戏</Button>
          <Button variant="ghost" disabled={!canContinue} onClick={actions.continueGame}>继续游戏</Button>
          <Button variant="ghost" onClick={() => actions.setPage('archive')}>案件档案</Button>
          <Button variant="ghost" onClick={() => actions.setPage('knowledge')}>法律知识库</Button>
        </div>
        <div className="feature-grid">
          <div><strong>地图探索</strong><span>在法域城中点击区域推进案件。</span></div>
          <div><strong>证据拼接</strong><span>把片段证据组合成可以站上法庭的事实链。</span></div>
          <div><strong>庭审对决</strong><span>面对顾清辞的质询，承认证据，也争取边界。</span></div>
        </div>
      </div>
    </section>
  );
}
