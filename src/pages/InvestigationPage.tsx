import { useMemo, useState } from 'react';
import type { GameContextValue } from '../types';
import { Button } from '../components/Button';
import { EvidenceCard } from '../components/EvidenceCard';
import { getEvidence } from '../data/evidence';

interface Props {
  game: GameContextValue;
}

type Hotspot = {
  id: string;
  title: string;
  icon: string;
  description: string;
  evidence?: string[];
  action?: () => void;
};

export function InvestigationPage({ game }: Props) {
  const { state } = game;
  if (state.activeInvestigation === 'video') return <VideoScene game={game} />;
  if (state.activeInvestigation === 'platform') return <PlatformScene game={game} />;
  return <CrossingScene game={game} />;
}

function SceneShell({ title, subtitle, children, side }: { title: string; subtitle: string; children: React.ReactNode; side?: React.ReactNode }) {
  return (
    <section className="page-grid fade-in">
      <div className="panel investigation-panel">
        <p className="eyebrow">调查场景</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {children}
      </div>
      <aside className="panel side-panel">{side}</aside>
    </section>
  );
}

function CrossingScene({ game }: Props) {
  const { state, actions } = game;
  const [message, setMessage] = useState('点击现场热点，收集能把监控前后缝起来的线索。');

  const hotspots: Hotspot[] = useMemo(() => [
    {
      id: 'camera',
      title: '路口监控摄像头',
      icon: '📹',
      description: '只显示陈墨推倒周启明的瞬间，缺少前因。',
      evidence: ['evidence_clip_monitor', 'evidence_push_monitor']
    },
    {
      id: 'brake',
      title: '斑马线地面',
      icon: '🛞',
      description: '刹车痕迹证明陈墨曾紧急刹车。',
      evidence: ['evidence_brake_marks']
    },
    {
      id: 'store',
      title: '便利店门口',
      icon: '🏪',
      description: '店员苏岚似乎看见了更多。',
      action: () => {
        actions.setChapter('sulan');
        actions.setPage('dialog');
      }
    },
    {
      id: 'stop',
      title: '外卖停靠区',
      icon: '🅿️',
      description: '骑手聚集，路口混乱。',
      evidence: ['evidence_rider_stop']
    },
    {
      id: 'ad',
      title: '商业广告屏',
      icon: '🪧',
      description: '屏幕滚动着平台广告：“准时必达”。',
      evidence: ['evidence_ad_slogan']
    }
  ], [actions]);

  function clickHotspot(item: Hotspot) {
    if (item.action) {
      item.action();
      return;
    }
    if (item.evidence) {
      actions.addManyEvidence(item.evidence);
      actions.addLog(`现场调查：${item.title}`);
      setMessage(`已调查：${item.title}。${item.description}`);
    }
  }

  const collected = hotspots.filter((h) => h.evidence?.some((id) => state.collectedEvidence.includes(id))).length;

  return (
    <SceneShell
      title="商业区路口"
      subtitle="霓虹灯照着斑马线，雨水把轮胎印拖成细长的句号。这里发生过冲突，也发生过被剪掉的前因。"
      side={
        <>
          <p className="eyebrow">现场提示</p>
          <h2>已调查 {collected}/4 个证据热点</h2>
          <p>{message}</p>
          <Button variant="ghost" onClick={() => actions.setPage('map')}>返回地图</Button>
        </>
      }
    >
      <div className="scene-illustration crossing-art">
        {hotspots.map((item, index) => (
          <button
            key={item.id}
            className={`hotspot h-${index + 1} ${item.evidence?.every((id) => state.collectedEvidence.includes(id)) ? 'done' : ''}`}
            onClick={() => clickHotspot(item)}
          >
            <span>{item.icon}</span>
            <strong>{item.title}</strong>
          </button>
        ))}
      </div>
      <div className="dialog-actions">
        <Button disabled={collected < 2} onClick={() => { actions.setChapter('sulan'); actions.setPage('dialog'); }}>
          询问便利店店员苏岚
        </Button>
        {collected < 2 && <span className="hint">至少调查两个现场证据热点再询问证人。</span>}
      </div>
    </SceneShell>
  );
}

function VideoScene({ game }: Props) {
  const { state, actions } = game;
  const [opened, setOpened] = useState(state.collectedEvidence.includes('evidence_full_video'));

  function collectVideo() {
    actions.addEvidence('evidence_full_video');
    actions.addKnowledge('complete_evidence');
    actions.addLog('获取完整现场视频：备用监控记录了冲突前因。');
    setOpened(true);
  }

  return (
    <SceneShell
      title="便利店后场"
      subtitle="备用监控藏在一台老旧主机里，风扇转得像一名迟到证人的呼吸。"
      side={
        <>
          <p className="eyebrow">导师提示</p>
          <h2>沈砚</h2>
          <p>现在你有了前因。记住，庭审最怕的不是没有事实，而是事实被切成刚好能误导人的形状。</p>
        </>
      }
    >
      <div className="video-timeline">
        {['陈墨骑车急刹', '周启明上前争执', '周启明抢夺手机', '陈墨试图拿回手机', '推搡中周启明倒地'].map((step, index) => (
          <div className="timeline-step" key={step}>
            <span>{index + 1}</span>
            <p>{step}</p>
          </div>
        ))}
      </div>
      {!opened ? <Button onClick={collectVideo}>调取完整现场视频</Button> : <EvidenceCard evidence={getEvidence('evidence_full_video')!} selected />}
      <div className="dialog-actions">
        <Button onClick={() => { actions.setChapter('platform'); actions.setActiveInvestigation('platform'); actions.setPage('investigation'); }}>
          前往平台办公室
        </Button>
      </div>
    </SceneShell>
  );
}

function PlatformScene({ game }: Props) {
  const { state, actions } = game;
  const [message, setMessage] = useState('许照保持着职业微笑，像一份会自动更新的免责声明。');

  function presentDeliveryRecord() {
    setMessage('许照：正常系统分配而已。骑手可以自主选择接单。');
    actions.addLog('平台交涉：出示派单记录，许照以“自主选择”回应。');
  }

  function getPenalty() {
    actions.addEvidence('evidence_penalty_rule');
    setMessage('许照：这是行业常规激励机制，不是强迫。');
    actions.addLog('平台交涉：取得平台超时处罚规则。');
  }

  function getNotice() {
    actions.addEvidence('evidence_urge_notice');
    setMessage('系统催单通知像小小的警报器，在陈墨手机里响了一整天。');
    actions.addLog('平台交涉：取得系统催单通知。');
  }

  function breakThrough() {
    const hasBase = state.collectedEvidence.includes('evidence_delivery_record');
    if (!hasBase) {
      setMessage('你缺少派单记录，组合还不够稳。先回到会见笔录里补齐事实地基。');
      return;
    }
    actions.addManyEvidence(['evidence_penalty_rule', 'evidence_urge_notice', 'evidence_internal_chat']);
    actions.addKnowledge('platform_rules');
    actions.addAttribute('socialInsight', 1);
    actions.setFlag('challengedPlatform', true);
    setMessage('许照的微笑裂开一条缝。内部公告显示，平台明知恶劣天气和高峰拥堵，仍要求维持高准时率。');
    actions.addLog('平台交涉：组合突破，取得内部运营群公告截图。');
  }

  const cards = ['evidence_penalty_rule', 'evidence_urge_notice', 'evidence_internal_chat']
    .filter((id) => state.collectedEvidence.includes(id))
    .map((id) => getEvidence(id)!);

  return (
    <SceneShell
      title="平台办公室"
      subtitle="玻璃墙、数据屏、漂亮曲线。这里没有人说“压力”，他们只说“效率”。"
      side={
        <>
          <p className="eyebrow">许照</p>
          <h2>“我们只是技术服务平台。”</h2>
          <p>{message}</p>
        </>
      }
    >
      <div className="choice-list two-col">
        <Button variant="ghost" onClick={presentDeliveryRecord}>出示派单记录截图</Button>
        <Button variant="ghost" onClick={getPenalty}>调取超时处罚规则</Button>
        <Button variant="ghost" onClick={getNotice}>追问系统催单通知</Button>
        <Button onClick={breakThrough}>组合：派单记录 + 处罚规则 + 催单通知</Button>
      </div>
      <div className="evidence-list compact-list">
        {cards.map((item) => <EvidenceCard key={item.id} evidence={item} selected />)}
      </div>
      <div className="dialog-actions">
        <Button onClick={() => { actions.setChapter('evidence'); actions.setPage('evidence'); }}>回到法律援助中心整理证据</Button>
      </div>
    </SceneShell>
  );
}
