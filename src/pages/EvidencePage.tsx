import { useMemo, useState } from 'react';
import type { GameContextValue } from '../types';
import { chains } from '../data/scenes';
import { evidenceList, getEvidence } from '../data/evidence';
import { Button } from '../components/Button';
import { EvidenceCard } from '../components/EvidenceCard';
import { checkChain, chainProgress } from '../utils/evidenceChecker';

interface Props {
  game: GameContextValue;
}

export function EvidencePage({ game }: Props) {
  const { state, actions } = game;
  const [activeChain, setActiveChain] = useState(chains[0].id);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState('选择一条事实链，再点击左侧证据加入。证据不是越多越好，逻辑才是骨架。');

  const collected = useMemo(() => evidenceList.filter((item) => state.collectedEvidence.includes(item.id)), [state.collectedEvidence]);
  const currentSelection = selected[activeChain] ?? [];
  const activeDefinition = chains.find((item) => item.id === activeChain)!;

  function toggleEvidence(id: string) {
    setSelected((prev) => {
      const list = prev[activeChain] ?? [];
      const next = list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
      return { ...prev, [activeChain]: next };
    });
  }

  function submitChain() {
    const result = checkChain(activeChain, currentSelection);
    const progress = chainProgress(activeChain, currentSelection);
    if (result === 'complete') {
      actions.completeChain(activeChain);
      actions.addLog(`完成事实链：${activeDefinition.title}`);
      setMessage(`事实链成立：${activeDefinition.conclusion}`);
      return;
    }
    actions.failChain(activeChain);
    if (result === 'partial') {
      setMessage(`部分成立：你命中了 ${progress.hits}/${progress.total} 个关键证据，但还缺能让法庭点头的核心材料。`);
    } else if (result === 'conflict') {
      actions.bumpEmotionalMistake();
      setMessage('逻辑冲突：证据不是越多越好。不能证明同一件事的证据堆在一起，只会变成纸山。');
    } else {
      setMessage('证据无关：这组材料还没有形成可验证的事实链。');
    }
  }

  return (
    <section className="evidence-page fade-in">
      <div className="panel evidence-library">
        <p className="eyebrow">证据库</p>
        <h2>已收集证据</h2>
        <div className="evidence-list">
          {collected.length === 0 && <p className="muted">你还没有收集证据。回到地图调查现场。</p>}
          {collected.map((evidence) => (
            <EvidenceCard
              key={evidence.id}
              evidence={evidence}
              selected={currentSelection.includes(evidence.id)}
              onClick={() => toggleEvidence(evidence.id)}
            />
          ))}
        </div>
      </div>

      <div className="panel chain-board">
        <div className="section-head">
          <div>
            <p className="eyebrow">证据拼接</p>
            <h1>把证据拼成事实链</h1>
          </div>
          <Button variant="ghost" onClick={() => actions.setPage('map')}>返回地图</Button>
        </div>
        <div className="chain-tabs">
          {chains.map((chain) => (
            <button
              key={chain.id}
              className={`chain-tab ${activeChain === chain.id ? 'active' : ''} ${state.completedChains.includes(chain.id) ? 'done' : ''}`}
              onClick={() => setActiveChain(chain.id)}
            >
              {state.completedChains.includes(chain.id) ? '✓ ' : ''}{chain.title}
            </button>
          ))}
        </div>
        <div className="chain-drop-zone">
          <h2>{activeDefinition.title}</h2>
          <p>{activeDefinition.description}</p>
          <div className="selected-evidence-row">
            {currentSelection.length === 0 && <span className="empty-slot">点击左侧证据加入事实链</span>}
            {currentSelection.map((id) => {
              const item = getEvidence(id);
              return item ? <EvidenceCard key={id} evidence={item} selected onClick={() => toggleEvidence(id)} /> : null;
            })}
          </div>
          <div className="dialog-actions">
            <Button onClick={submitChain}>提交这条事实链</Button>
            <Button variant="ghost" onClick={() => setSelected((prev) => ({ ...prev, [activeChain]: [] }))}>清空选择</Button>
          </div>
        </div>
      </div>

      <aside className="panel side-panel">
        <p className="eyebrow">沈砚提示</p>
        <h2>“纸山不是逻辑。”</h2>
        <p>{message}</p>
        <div className="mini-list">
          {chains.map((chain) => (
            <span key={chain.id}>{chain.title}：{state.completedChains.includes(chain.id) ? '已成立' : '未成立'}</span>
          ))}
        </div>
        <Button onClick={() => { actions.setChapter('trial'); actions.setPage('trial'); }}>
          带着现有证据开庭
        </Button>
      </aside>
    </section>
  );
}
