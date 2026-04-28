import type { GameContextValue } from '../types';
import { getEnding } from '../data/endings';
import { knowledgeCards } from '../data/knowledge';
import { getEvidence } from '../data/evidence';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';

interface Props {
  game: GameContextValue;
}

function profileName(state: GameContextValue['state']) {
  const attrs = state.attributes;
  const entries: Array<[string, number]> = [
    ['冷静证据派', attrs.logic],
    ['人情洞察派', attrs.empathy],
    ['程序正义派', attrs.procedure],
    ['社会议题派', attrs.socialInsight]
  ];
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

export function EndingPage({ game }: Props) {
  const { state, actions } = game;
  const ending = getEnding(state.ending);
  const missing = [
    'evidence_full_video',
    'evidence_sulan_full_testimony',
    'evidence_penalty_rule',
    'evidence_urge_notice',
    'evidence_internal_chat'
  ].filter((id) => !state.collectedEvidence.includes(id));

  async function copyShare() {
    try {
      await navigator.clipboard.writeText(ending.share);
      actions.addLog('已复制分享文案。');
      alert('已复制分享文案');
    } catch {
      alert(ending.share);
    }
  }

  return (
    <section className="ending-page fade-in">
      <div className={`panel ending-card ending-${ending.id.toLowerCase()}`}>
        <p className="eyebrow">案件结局</p>
        <h1>{ending.title}</h1>
        <h2>{ending.subtitle}</h2>
        <p className="ending-result">{ending.result}</p>
        <blockquote>{ending.text}</blockquote>
        <div className="ending-actions">
          <Button onClick={copyShare}>复制分享文案</Button>
          <Button variant="ghost" onClick={() => actions.setPage('archive')}>查看案件档案</Button>
          <Button variant="ghost" onClick={actions.resetGame}>重新开始</Button>
        </div>
      </div>

      <aside className="panel side-panel">
        <p className="eyebrow">崔律职业画像</p>
        <h2>{profileName(state)}</h2>
        <ProgressBar label="理性" value={state.attributes.logic} max={5} />
        <ProgressBar label="同理心" value={state.attributes.empathy} max={5} />
        <ProgressBar label="程序意识" value={state.attributes.procedure} max={5} />
        <ProgressBar label="社会洞察" value={state.attributes.socialInsight} max={5} />
        <div className="mini-list">
          <strong>漏掉的关键线索</strong>
          {missing.length === 0 && <span>没有遗漏关键线索。</span>}
          {missing.map((id) => <span key={id}>{getEvidence(id)?.name}</span>)}
        </div>
      </aside>

      <div className="panel knowledge-unlocked">
        <p className="eyebrow">已解锁法律知识卡</p>
        <div className="knowledge-grid">
          {knowledgeCards.map((card) => {
            const unlocked = state.knowledgeCards.includes(card.id);
            return (
              <article className={`knowledge-card ${unlocked ? '' : 'locked'}`} key={card.id}>
                <h3>{unlocked ? card.title : '🔒 未解锁知识卡'}</h3>
                <p>{unlocked ? card.content : '通过调查、庭审或证据拼接解锁。'}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
