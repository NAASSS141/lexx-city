import { useState } from 'react';
import type { AttributeKey, GameContextValue } from '../types';
import { Button } from '../components/Button';
import { CharacterCard } from '../components/CharacterCard';
import { getCharacter } from '../data/characters';

interface Props {
  game: GameContextValue;
}

export function DialogPage({ game }: Props) {
  const { state } = game;

  if (state.currentChapter === 'intro') return <IntroDialog game={game} />;
  if (state.currentChapter === 'interview') return <InterviewDialog game={game} />;
  if (state.currentChapter === 'sulan') return <SulanDialog game={game} />;

  return (
    <section className="panel fade-in">
      <h1>对话暂告一段落</h1>
      <p>回到地图，继续寻找被城市藏起来的事实。</p>
      <Button onClick={() => game.actions.setPage('map')}>返回地图</Button>
    </section>
  );
}

function SceneFrame({ title, speaker, quote, children }: { title: string; speaker: string; quote: string; children: React.ReactNode }) {
  const character = getCharacter(speaker);
  return (
    <section className="dialog-scene fade-in">
      <div className="scene-backdrop aid-center" />
      <div className="dialog-layout">
        <aside>{character && <CharacterCard character={character} />}</aside>
        <div className="dialog-panel panel">
          <p className="eyebrow">{title}</p>
          <div className="dialog-bubble">
            <strong>{character?.name ?? speaker}</strong>
            <p>{quote}</p>
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}

function IntroDialog({ game }: Props) {
  const { actions } = game;

  function choose(text: string, key: AttributeKey) {
    actions.addAttribute(key, 1);
    actions.addLog(`接案选择：${text}`);
    actions.setChapter('interview');
    actions.setPage('map');
  }

  return (
    <SceneFrame
      title="第一章：接案"
      speaker="shen_yan"
      quote="崔律，这个案子不难，难的是每个人都只拿出对自己有利的一半真相。"
    >
      <p>
        法律援助中心的雨夜像一只没合上的档案袋。警方材料显示：陈墨推倒周启明，造成骨折。
        可监控只有一小段，陈墨的供述也像被风吹乱的纸页。
      </p>
      <div className="choice-list">
        <Button onClick={() => choose('我接，这可能不只是一起伤人案。', 'empathy')}>我接，这可能不只是一起伤人案。</Button>
        <Button variant="ghost" onClick={() => choose('先看证据，不能被情绪带着走。', 'logic')}>先看证据，不能被情绪带着走。</Button>
        <Button variant="ghost" onClick={() => choose('如果证据不利，我不会强行辩护。', 'procedure')}>如果证据不利，我不会强行辩护。</Button>
      </div>
    </SceneFrame>
  );
}

function InterviewDialog({ game }: Props) {
  const { state, actions } = game;
  const [asked, setAsked] = useState<string[]>([]);
  const [line, setLine] = useState('崔律，我真的没想伤他，我只是想拿回手机。');

  function ask(id: string, response: string, evidence: string[] = []) {
    setAsked((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setLine(response);
    actions.addManyEvidence(evidence);
    actions.addKnowledge('intent_injury');
    actions.addLog(`会见陈墨：${response}`);
  }

  const canFinish = asked.length >= 3 || state.collectedEvidence.includes('evidence_delivery_record');

  return (
    <SceneFrame title="第二章：会见陈墨" speaker="chen_mo" quote={line}>
      <p>
        会见室的灯没有阴影，所有人都被照得疲惫。陈墨握着纸杯，指节发白。他并不擅长解释自己，
        但每一次沉默都像在说：事情不是那段监控里那么短。
      </p>
      <div className="choice-list two-col">
        <Button variant="ghost" onClick={() => ask('why', '他先骂我，说我差点撞到他。我想解释，但他说要拍我，后来抢了我的手机。', ['evidence_chen_statement'])}>为什么发生争执？</Button>
        <Button variant="ghost" onClick={() => ask('hands', '我推了他，这个我认。可我当时只是想把手机拿回来，不是想让他摔倒。', ['evidence_chen_statement'])}>你有没有主动动手？</Button>
        <Button variant="ghost" onClick={() => ask('phone', '手机里有我自己录的一段视频。后来我才知道，他可能想删掉。', ['evidence_chen_statement'])}>你的手机里有什么？</Button>
        <Button variant="ghost" onClick={() => ask('hurry', '我妈在医院等缴费。我那天不能掉线，不能少一单。', ['evidence_hospital_sms'])}>你当天为什么那么急？</Button>
        <Button variant="ghost" onClick={() => ask('platform', '一直催。超时会扣钱，严重了封号。我不是机器，可系统只看我准不准时。', ['evidence_delivery_record'])}>平台有没有催单？</Button>
      </div>
      <div className="dialog-actions">
        <Button disabled={!canFinish} onClick={() => { actions.setChapter('crossing'); actions.setPage('map'); }}>
          完成会见，前往现场
        </Button>
        {!canFinish && <span className="hint">至少问出三个关键信息，才能结束会见。</span>}
      </div>
    </SceneFrame>
  );
}

function SulanDialog({ game }: Props) {
  const { actions } = game;
  const [result, setResult] = useState<string | null>(null);

  function choose(mode: 'hard' | 'warm' | 'legal') {
    if (mode === 'hard') {
      actions.bumpEmotionalMistake();
      actions.setWitnessTrust('su_lan', 0);
      actions.addEvidence('evidence_sulan_partial_testimony');
      actions.addLog('询问苏岚：强势追问，苏岚只给出模糊证词。');
      setResult('你追问得太急，苏岚的目光躲进收银台后的阴影里。她只说争执发生过，但不愿再多讲。');
      return;
    }

    if (mode === 'warm') {
      actions.addAttribute('empathy', 1);
      actions.setWitnessTrust('su_lan', 1);
      actions.addManyEvidence(['evidence_sulan_partial_testimony', 'evidence_phone_grab']);
      actions.addLog('询问苏岚：温和沟通，获得手机抢夺事实。');
      setResult('你没有逼她立刻成为证人，只是让她先把害怕放在桌上。苏岚低声说：周启明确实先抢了手机。');
      return;
    }

    actions.addAttribute('procedure', 1);
    actions.setWitnessTrust('su_lan', 2);
    actions.addManyEvidence(['evidence_sulan_full_testimony', 'evidence_phone_grab']);
    actions.addKnowledge('complete_evidence');
    actions.setFlag('hasVideoClue', true);
    actions.addLog('询问苏岚：法律告知，获得完整证词和备用监控线索。');
    setResult('你向她说明作证权利、风险和保护方式。苏岚终于抬头：便利店后场还有一份备用监控，可能拍到了全部。');
  }

  return (
    <SceneFrame title="第四章：询问苏岚" speaker="su_lan" quote="崔律……如果我说实话，会不会惹麻烦？">
      <p>
        便利店的冷柜嗡嗡作响，像城市替所有胆怯的人低声辩解。苏岚看见了更多，但她害怕那句“更多”会把自己也拖进漩涡。
      </p>
      {!result ? (
        <div className="choice-list">
          <Button variant="danger" onClick={() => choose('hard')}>强势追问：你必须说清楚。</Button>
          <Button variant="ghost" onClick={() => choose('warm')}>温和沟通：你可以先告诉我你担心什么。</Button>
          <Button onClick={() => choose('legal')}>法律告知：我会说明作证权利和保护方式。</Button>
        </div>
      ) : (
        <>
          <div className="result-card">{result}</div>
          <Button onClick={() => actions.setPage('map')}>返回地图</Button>
        </>
      )}
    </SceneFrame>
  );
}
