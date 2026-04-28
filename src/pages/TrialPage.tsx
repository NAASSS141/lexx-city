import { useState } from 'react';
import type { GameContextValue } from '../types';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { EvidenceCard } from '../components/EvidenceCard';
import { getEvidence } from '../data/evidence';
import { resolveEnding } from '../utils/endingResolver';

interface Props {
  game: GameContextValue;
}

export function TrialPage({ game }: Props) {
  const { state, actions } = game;
  const [phase, setPhase] = useState(state.flags.trialPhase);
  const [message, setMessage] = useState('中心法院的灯亮起，所有被雨水浸过的事实都要在这里接受询问。');
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([]);
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);

  function goPhase(next: number) {
    actions.setFlag('trialPhase', next);
    setPhase(next);
  }

  function phaseOne(choice: 'deny' | 'focus' | 'attack') {
    if (choice === 'deny') {
      actions.bumpEmotionalMistake();
      actions.addTrialScore('fact', -1);
      setMessage('顾清辞立刻抓住漏洞：伤害结果有病历和监控印证，不能直接否认。');
      goPhase(2);
      return;
    }
    if (choice === 'attack') {
      actions.bumpEmotionalMistake();
      actions.addTrialScore('procedure', -1);
      setMessage('法庭提醒：情绪化评价不能替代事实论证。');
      goPhase(2);
      return;
    }
    actions.addTrialScore('fact', 2);
    actions.addTrialScore('law', 1);
    setMessage('崔律：我方不否认伤害结果，但本案争议焦点在于，被告是否具有伤害故意，以及冲突起因是否被完整呈现。');
    goPhase(2);
  }

  function toggleEvidence(id: string) {
    setSelectedEvidence((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  function submitCrossExamination() {
    const hasFullVideo = selectedEvidence.includes('evidence_full_video');
    const hasSulan = selectedEvidence.includes('evidence_sulan_full_testimony');
    if (hasFullVideo && hasSulan) {
      actions.addTrialScore('fact', 2);
      actions.addTrialScore('procedure', 1);
      actions.setFlag('questionedVictim', true);
      setMessage('完整视频和苏岚证词相互印证。周启明承认：他确实抢过陈墨的手机。');
    } else if (hasFullVideo || hasSulan) {
      actions.addTrialScore('fact', 1);
      setMessage('你撬开了周启明陈述的一角，但证据之间还缺少相互支撑。');
    } else {
      actions.bumpEmotionalMistake();
      actions.addTrialScore('fact', -1);
      setMessage('证据力度不足，周启明坚持自己的说法。法庭没有被说服。');
    }
    goPhase(3);
  }

  function toggleStrategy(id: string) {
    setSelectedStrategies((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  function finishTrial() {
    if (selectedStrategies.includes('innocent') && !selectedStrategies.includes('mitigation')) {
      actions.addTrialScore('law', -1);
    }
    if (selectedStrategies.includes('mitigation')) {
      actions.addStrategy('mitigation');
      actions.addTrialScore('law', 2);
    }
    if (selectedStrategies.includes('social_responsibility')) {
      actions.addStrategy('social_responsibility');
      actions.addTrialScore('social', 2);
      actions.addAttribute('socialInsight', 1);
    }
    if (selectedStrategies.length === 0) {
      actions.bumpEmotionalMistake();
    }

    const nextState = {
      ...state,
      trialStrategies: Array.from(new Set([...state.trialStrategies, ...selectedStrategies])),
      trialScore: {
        ...state.trialScore,
        law: state.trialScore.law + (selectedStrategies.includes('mitigation') ? 2 : 0) - (selectedStrategies.includes('innocent') && !selectedStrategies.includes('mitigation') ? 1 : 0),
        social: state.trialScore.social + (selectedStrategies.includes('social_responsibility') ? 2 : 0)
      },
      attributes: {
        ...state.attributes,
        socialInsight: state.attributes.socialInsight + (selectedStrategies.includes('social_responsibility') ? 1 : 0)
      },
      flags: {
        ...state.flags,
        emotionalMistakes: state.flags.emotionalMistakes + (selectedStrategies.length === 0 ? 1 : 0)
      }
    };
    const ending = resolveEnding(nextState);
    actions.finishWithEnding(ending);
  }

  const phaseTwoEvidence = ['evidence_clip_monitor', 'evidence_chen_statement', 'evidence_full_video', 'evidence_sulan_full_testimony']
    .filter((id) => state.collectedEvidence.includes(id));

  return (
    <section className="trial-page fade-in">
      <div className="panel courtroom">
        <div className="court-visual">
          <span>🏛️</span>
          <strong>中心法院</strong>
          <em>开庭</em>
        </div>
        <div className="section-head">
          <div>
            <p className="eyebrow">第八章：庭审</p>
            <h1>顾清辞正在质询</h1>
          </div>
          <span className="phase-pill">第 {phase} 轮</span>
        </div>
        <div className="dialog-bubble prosecutor">
          <strong>顾清辞</strong>
          <p>{phase === 1 && '被告主动推搡被害人，并造成骨折后果。崔律，你是否否认这一基本事实？'}</p>
          <p>{phase === 2 && '周启明称：“我只是要求他道歉，他突然推了我。”崔律，你准备用什么证据质询？'}</p>
          <p>{phase === 3 && '事实链已经摆在法庭上。崔律，你最终选择怎样的辩护路线？'}</p>
        </div>
        <div className="result-card">{message}</div>

        {phase === 1 && (
          <div className="choice-list">
            <Button variant="danger" onClick={() => phaseOne('deny')}>否认周启明受伤</Button>
            <Button onClick={() => phaseOne('focus')}>承认伤害结果，但争议主观故意</Button>
            <Button variant="danger" onClick={() => phaseOne('attack')}>指责周启明活该</Button>
          </div>
        )}

        {phase === 2 && (
          <>
            <div className="evidence-list trial-evidence">
              {phaseTwoEvidence.length === 0 && <p className="muted">你没有带来足够质询证据，只能依赖口头陈述。</p>}
              {phaseTwoEvidence.map((id) => {
                const item = getEvidence(id)!;
                return <EvidenceCard key={id} evidence={item} selected={selectedEvidence.includes(id)} onClick={() => toggleEvidence(id)} />;
              })}
            </div>
            <Button onClick={submitCrossExamination}>提交质询证据</Button>
          </>
        )}

        {phase === 3 && (
          <>
            <div className="strategy-grid">
              <button className={selectedStrategies.includes('innocent') ? 'selected' : ''} onClick={() => toggleStrategy('innocent')}>
                <strong>路线 A：无罪辩护</strong>
                <span>陈墨只是夺回手机，不应承担刑事责任。风险较高。</span>
              </button>
              <button className={selectedStrategies.includes('mitigation') ? 'selected' : ''} onClick={() => toggleStrategy('mitigation')}>
                <strong>路线 B：罪轻辩护</strong>
                <span>缺乏伤害故意，主观恶性较低，应从轻处理。</span>
              </button>
              <button className={selectedStrategies.includes('social_responsibility') ? 'selected' : ''} onClick={() => toggleStrategy('social_responsibility')}>
                <strong>路线 C：社会责任辩护</strong>
                <span>平台算法压力不直接免责，但应作为背景进入评价。</span>
              </button>
            </div>
            <Button onClick={finishTrial}>完成最终陈述</Button>
          </>
        )}
      </div>

      <aside className="panel side-panel">
        <p className="eyebrow">庭审评分</p>
        <ProgressBar label="事实清晰度" value={Math.max(0, state.trialScore.fact + 2)} max={6} />
        <ProgressBar label="法律适用度" value={Math.max(0, state.trialScore.law + 2)} max={6} />
        <ProgressBar label="程序严谨度" value={Math.max(0, state.trialScore.procedure + 2)} max={6} />
        <ProgressBar label="社会洞察力" value={Math.max(0, state.trialScore.social + 2)} max={6} />
        <div className="mini-list">
          <span>情绪化失误：{state.flags.emotionalMistakes}</span>
          <span>完成事实链：{state.completedChains.length}/3</span>
        </div>
      </aside>
    </section>
  );
}
