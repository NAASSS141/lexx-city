import type { GameContextValue } from '../types';
import { mapRegions, chapterTitles } from '../data/scenes';
import { Button } from '../components/Button';

interface Props {
  game: GameContextValue;
}

const chapterOrder = ['intro', 'interview', 'crossing', 'sulan', 'video', 'platform', 'evidence', 'trial'];

export function MapPage({ game }: Props) {
  const { state, actions } = game;

  function goRegion(regionId: string, chapter?: string) {
    actions.visitScene(regionId);
    if (chapter === 'intro') {
      actions.setChapter('intro');
      actions.setPage('dialog');
      return;
    }
    if (chapter === 'interview') {
      actions.setChapter('interview');
      actions.setPage('dialog');
      return;
    }
    if (chapter === 'crossing') {
      actions.setChapter('crossing');
      actions.setActiveInvestigation('crossing');
      actions.setPage('investigation');
      return;
    }
    if (chapter === 'sulan') {
      actions.setChapter('sulan');
      actions.setPage('dialog');
      return;
    }
    if (chapter === 'platform') {
      actions.setChapter('platform');
      actions.setActiveInvestigation('platform');
      actions.setPage('investigation');
      return;
    }
    if (chapter === 'trial') {
      actions.setChapter('trial');
      actions.setPage('trial');
    }
  }

  function goNext() {
    if (state.currentChapter === 'not_started') return goRegion('aid_center', 'intro');
    if (state.currentChapter === 'intro') return goRegion('meeting_room', 'interview');
    if (state.currentChapter === 'interview') return goRegion('business_crossing', 'crossing');
    if (state.currentChapter === 'crossing') return goRegion('convenience_store', 'sulan');
    if (state.currentChapter === 'sulan') {
      if (state.flags.hasVideoClue) {
        actions.setChapter('video');
        actions.setActiveInvestigation('video');
        actions.setPage('investigation');
      } else {
        goRegion('platform_office', 'platform');
      }
      return;
    }
    if (state.currentChapter === 'video') return goRegion('platform_office', 'platform');
    if (state.currentChapter === 'platform') {
      actions.setChapter('evidence');
      actions.setPage('evidence');
      return;
    }
    if (state.currentChapter === 'evidence') return goRegion('central_court', 'trial');
    if (state.currentChapter === 'trial') return actions.setPage('trial');
    return actions.setPage('ending');
  }

  function isActive(chapter?: string) {
    if (!chapter) return false;
    if (state.currentChapter === 'not_started') return chapter === 'intro';
    const currentIndex = chapterOrder.indexOf(state.currentChapter);
    const regionIndex = chapterOrder.indexOf(chapter);
    return regionIndex <= Math.max(currentIndex + 1, 0);
  }

  return (
    <section className="page-grid fade-in">
      <div className="map-board panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">法域城地图</p>
            <h1>一座城市，就是一部活的法典</h1>
          </div>
          <Button onClick={goNext}>继续主线</Button>
        </div>
        <div className="map-grid">
          {mapRegions.map((region) => {
            const locked = region.status === 'soon';
            const active = !locked && isActive(region.chapter);
            return (
              <button
                className={`region-card ${locked ? 'soon' : ''} ${active ? 'active' : ''}`}
                key={region.id}
                onClick={() => active && goRegion(region.id, region.chapter)}
                disabled={!active}
              >
                <span className="region-emoji">{region.emoji}</span>
                <strong>{region.name}</strong>
                <small>{region.description}</small>
                <em>{locked ? '即将开放' : active ? '可进入' : '待解锁'}</em>
              </button>
            );
          })}
        </div>
      </div>
      <aside className="panel side-panel">
        <p className="eyebrow">当前任务</p>
        <h2>{chapterTitles[state.currentChapter]}</h2>
        <p>
          {state.currentChapter === 'not_started' && '前往法律援助中心，接下崔律的第一案。'}
          {state.currentChapter === 'intro' && '会见陈墨，听他讲述自己的版本。'}
          {state.currentChapter === 'interview' && '去商业区路口，调查事故现场。'}
          {state.currentChapter === 'crossing' && '找到便利店店员苏岚，尝试获得完整证言。'}
          {state.currentChapter === 'sulan' && (state.flags.hasVideoClue ? '根据苏岚线索，调取便利店备用监控。' : '线索不完整，先转向平台办公室。')}
          {state.currentChapter === 'video' && '前往平台办公室，确认算法压力是否存在。'}
          {state.currentChapter === 'platform' && '回到证据板，把证据拼成事实链。'}
          {state.currentChapter === 'evidence' && '准备出庭，选择能站得住的法律策略。'}
          {state.currentChapter === 'trial' && '中心法院已经开庭。'}
          {state.currentChapter === 'ending' && '案件已结，查看复盘。'}
        </p>
        <div className="mini-list">
          <button onClick={() => actions.setPage('archive')}>查看证据包</button>
          <button onClick={() => actions.setPage('knowledge')}>查看知识卡</button>
        </div>
      </aside>
    </section>
  );
}
