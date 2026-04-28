import type { GameContextValue } from '../types';
import { characters } from '../data/characters';
import { evidenceList } from '../data/evidence';
import { chains } from '../data/scenes';
import { CharacterCard } from '../components/CharacterCard';
import { EvidenceCard } from '../components/EvidenceCard';
import { Button } from '../components/Button';

interface Props {
  game: GameContextValue;
}

export function CaseArchivePage({ game }: Props) {
  const { state, actions } = game;
  return (
    <section className="archive-page fade-in">
      <div className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">案件档案</p>
            <h1>第一案：算法之下</h1>
          </div>
          <Button variant="ghost" onClick={() => actions.setPage('map')}>返回地图</Button>
        </div>
        <p className="lead">
          外卖骑手陈墨在商业区路口与行人周启明发生冲突。周启明摔倒骨折，陈墨被指控涉嫌故意伤害。
          深层争议在于：冲突起因是否被完整呈现，平台算法压力是否应进入责任评价。
        </p>
        <div className="archive-stats">
          <span>证据收集：{state.collectedEvidence.length}/{evidenceList.length}</span>
          <span>事实链完成：{state.completedChains.length}/{chains.length}</span>
          <span>情绪化失误：{state.flags.emotionalMistakes}</span>
        </div>
      </div>

      <div className="panel">
        <p className="eyebrow">人物关系</p>
        <div className="character-grid">
          {characters.map((character) => <CharacterCard key={character.id} character={character} compact />)}
        </div>
      </div>

      <div className="panel">
        <p className="eyebrow">证据收集情况</p>
        <div className="evidence-list archive-evidence">
          {evidenceList.map((item) => (
            <EvidenceCard key={item.id} evidence={item} locked={!state.collectedEvidence.includes(item.id)} />
          ))}
        </div>
      </div>

      <div className="panel">
        <p className="eyebrow">办案记录</p>
        <div className="case-log">
          {state.log.length === 0 && <p className="muted">暂无记录。开始游戏后，关键选择会写入这里。</p>}
          {state.log.slice().reverse().map((entry, index) => <span key={`${entry}-${index}`}>{entry}</span>)}
        </div>
      </div>
    </section>
  );
}
