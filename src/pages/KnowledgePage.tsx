import type { GameContextValue } from '../types';
import { knowledgeCards } from '../data/knowledge';
import { Button } from '../components/Button';

interface Props {
  game: GameContextValue;
}

export function KnowledgePage({ game }: Props) {
  const { state, actions } = game;
  return (
    <section className="panel fade-in">
      <div className="section-head">
        <div>
          <p className="eyebrow">法律知识库</p>
          <h1>崔律的普法卡</h1>
        </div>
        <Button variant="ghost" onClick={() => actions.setPage('map')}>返回地图</Button>
      </div>
      <div className="knowledge-grid">
        {knowledgeCards.map((card) => {
          const unlocked = state.knowledgeCards.includes(card.id);
          return (
            <article className={`knowledge-card ${unlocked ? '' : 'locked'}`} key={card.id}>
              <span className="card-corner">{unlocked ? '已解锁' : '未解锁'}</span>
              <h2>{unlocked ? card.title : '🔒 ' + card.title}</h2>
              <p>{unlocked ? card.content : '继续案件流程，完成相关调查或庭审节点后解锁。'}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
