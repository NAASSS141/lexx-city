const $ = id => document.getElementById(id);
const GAME_DATA = window.GAME_DATA;
if(document.body){document.body.classList.add('home-running')}
if(!GAME_DATA) throw new Error('GAME_DATA 未加载');
const STORAGE_KEY = 'lawCityStateV12FreeBgmFreeBgm';
const TOTAL_EVIDENCE = GAME_DATA.metadata.totalEvidence;
const MANUAL_SLOT_COUNT = GAME_DATA.metadata.manualSlotCount;
const {chapters,evidenceMeta,combos,achievementsMeta,endingsMeta,characterCodex,scenes,dialogues,defaultSettings,audioPresets} = GAME_DATA;

let state = {scene:'city',activeCase:'case1',completedCases:[],evidence:[],deductions:[],puzzles:[],truth:0,ethics:0,used:{},endings:[],achievements:[],settings:{...defaultSettings},visitedScenes:[],introSeen:false};

const audio = {ctx:null,master:null,sfxGain:null,musicGain:null,ambientGain:null,musicTimer:null,rainSource:null,rainFilter:null,droneA:null,droneB:null,started:false,currentScene:'',currentPreset:null,nowPlaying:'未启动'};

function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
function hydrate(data){state=Object.assign({scene:'city',activeCase:'case1',completedCases:[],evidence:[],deductions:[],puzzles:[],truth:0,ethics:0,used:{},endings:[],achievements:[],settings:{...defaultSettings},visitedScenes:[],introSeen:false},data||{});state.settings=Object.assign({},defaultSettings,state.settings||{});['completedCases','evidence','deductions','puzzles','endings','achievements','visitedScenes'].forEach(k=>{if(!Array.isArray(state[k]))state[k]=[]});if(!state.used)state.used={};}
function load(){try{hydrate(JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}'))}catch(e){hydrate({})}}
function cloneState(){return JSON.parse(JSON.stringify(state))}
function slotKey(i){return `${STORAGE_KEY}_slot${i}`}
function readSlot(i){try{return JSON.parse(localStorage.getItem(slotKey(i))||'null')}catch(e){return null}}
function fmt(ts){if(!ts)return'未存档';const d=new Date(ts),p=n=>String(n).padStart(2,'0');return`${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`}
function caseTitleById(id){return (chapters.find(c=>c.id===id)||{}).title||'未命名案件'}
function sceneTitleById(id){return scenes[id]?scenes[id].name:'未知地点'}
function has(x){return state.evidence.includes(x)||state.deductions.includes(x)}
function caseDone(id){return state.completedCases.includes(id)}
function canUse(a){if(a.requireCount&&state.evidence.length<a.requireCount)return false;if(a.require&&!a.require.every(has))return false;if(a.requireAny&&!a.requireAny.some(has))return false;if(a.requireCase&&!caseDone(a.requireCase))return false;return true}
function addEvidence(name){if(name&&!state.evidence.includes(name)){state.evidence.push(name);showToast('获得证据',name);playSfx('evidence');if(typeof pulseCamera==='function') pulseCamera('insert',name,1000);const directingCue = cueForEvidence(name) || case2CueForEvidence(name) || case3CueForEvidence(name); if(directingCue) setTimeout(()=>applyDirectorCue(directingCue, {toast:false, cg:false}), 80); queueObjectCloseup(name);queueEvidenceCinematic(name);queueEvidenceCgIllustration(name);maybeShowFirstRunHint('evidence')}}
function addDeduction(name){if(name&&!state.deductions.includes(name)){state.deductions.push(name);showToast('组合推理完成',name);playSfx('combo');if(typeof pulseCamera==='function') pulseCamera('impact',name,950,{shake:true});const deductionCue=cueForEvidence(name)||case2CueForEvidence(name)||case3CueForEvidence(name);if(deductionCue)setTimeout(()=>applyDirectorCue(deductionCue,{toast:false, cg:false}),80);queueDeductionCinematic(name)}}
function iconFor(e){return (evidenceMeta[e]||['🔎','等待与其他证据交叉印证。'])[0]}
function hintFor(e){return (evidenceMeta[e]||['🔎','等待与其他证据交叉印证。'])[1]}

const evidenceImageMap = {
  "破损监控记录": "./assets/evidence/case1_evidence_01.jpg",
  "店内网络异常": "./assets/evidence/case1_evidence_02.jpg",
  "22:13 小票": "./assets/evidence/case1_evidence_03.jpg",
  "黑车车牌残片": "./assets/evidence/case1_evidence_04.jpg",
  "匿名来电记录": "./assets/evidence/case1_evidence_05.jpg",
  "逆向轮胎水痕": "./assets/evidence/case1_evidence_06.jpg",
  "二次出血痕迹": "./assets/evidence/case1_evidence_07.jpg",
  "未发送语音": "./assets/evidence/case1_evidence_08.jpg",
  "袖口机油": "./assets/evidence/case1_evidence_09.jpg",
  "店长删改指令": "./assets/evidence/case1_evidence_10.jpg",
  "保险柜合同": "./assets/evidence/case1_evidence_11.jpg",
  "伪造订单提醒": "./assets/evidence/case1_evidence_12.jpg",
  "医院缴费单": "./assets/evidence/case2_evidence_13.jpg",
  "护士交班记录": "./assets/evidence/case2_evidence_14.jpg",
  "残缺账本页": "./assets/evidence/case2_evidence_15.jpg",
  "码头监控截图": "./assets/evidence/case2_evidence_16.jpg",
  "货柜封条": "./assets/evidence/case2_evidence_17.jpg",
  "私家侦探录音": "./assets/evidence/case2_evidence_18.jpg",
  "匿名函残页": "./assets/evidence/case3_evidence_19.jpg",
  "审计U盘": "./assets/evidence/case3_evidence_20.jpg",
  "董事会日程": "./assets/evidence/case3_evidence_21.jpg",
  "灰塔转账凭证": "./assets/evidence/case3_evidence_22.jpg",
  "天台门禁记录": "./assets/evidence/case3_evidence_23.jpg",
  "狙击照片底片": "./assets/evidence/case3_evidence_24.jpg"
};

const caseCoverImageMap = {
  case1: './assets/ui/case_cover_case1.jpg',
  case2: './assets/ui/case_cover_case2.jpg',
  case3: './assets/ui/case_cover_case3.jpg'
};
const archiveBannerImages = {
  timeline: './assets/ui/timeline_banner.jpg',
  evidence: './assets/ui/evidence_atlas_banner.jpg',
  character: './assets/ui/character_dossier_banner.jpg',
  achievement: './assets/ui/achievement_banner.jpg',
  ending: './assets/ui/ending_banner.jpg'
};
const achievementImageMap = {
  firstEvidence: './assets/ui/achievement_firstEvidence.jpg',
  evidenceHunter: './assets/ui/achievement_evidenceHunter.jpg',
  fullArchive: './assets/ui/achievement_fullArchive.jpg',
  case1Closer: './assets/ui/achievement_case1Closer.jpg',
  case2Closer: './assets/ui/achievement_case2Closer.jpg',
  case3Closer: './assets/ui/achievement_case3Closer.jpg',
  comboApprentice: './assets/ui/achievement_comboApprentice.jpg',
  comboMaster: './assets/ui/achievement_comboMaster.jpg',
  ethicsHigh: './assets/ui/achievement_ethicsHigh.jpg'
};
const endingImageMap = {
  '第一案真相结局：雨停之前': './assets/ui/ending_case1_truth.jpg',
  '第二案终局：法域之城': './assets/ui/ending_case2_truth.jpg',
  '终极结局：完整责任链': './assets/ui/ending_case3_truth.jpg',
  '证据不足：真相隔着一层雾': './assets/ui/ending_fog.jpg',
  '部分胜利：证据不足': './assets/ui/ending_partial.jpg',
  '错误结局：偏见判词': './assets/ui/ending_bad.jpg'
};
function archiveBanner(kind, title=''){
  const img = archiveBannerImages[kind] || archiveBannerImages.evidence;
  return `<div class="archive-visual-banner" style="background-image:url('${img}')"><span>${uiSafe(title||kind)}</span></div>`;
}
function evidenceCardImage(name, unlocked=true){
  const img = evidenceImageMap[name];
  if(img && unlocked) return `<div class="evidence-card-image" style="background-image:url('${img}')"></div>`;
  return `<div class="evidence-card-image locked-image"><span>LOCKED</span></div>`;
}
function sceneCardImage(sceneId){
  const s = scenes[sceneId];
  const img = s && s.art ? s.art : './assets/ui/timeline_banner.jpg';
  return `<div class="timeline-scene-image" style="background-image:url('${img}')"></div>`;
}

const objectCloseupCases = {
  '破损监控记录':'第一案','店内网络异常':'第一案','22:13 小票':'第一案','黑车车牌残片':'第一案','匿名来电记录':'第一案','逆向轮胎水痕':'第一案','二次出血痕迹':'第一案','未发送语音':'第一案','袖口机油':'第一案','店长删改指令':'第一案','保险柜合同':'第一案','伪造订单提醒':'第一案',
  '医院缴费单':'第二案','护士交班记录':'第二案','残缺账本页':'第二案','码头监控截图':'第二案','货柜封条':'第二案','私家侦探录音':'第二案',
  '匿名函残页':'第三案','审计U盘':'第三案','董事会日程':'第三案','灰塔转账凭证':'第三案','天台门禁记录':'第三案','狙击照片底片':'第三案'
};
function closeupTypeFor(name){
  if(/监控|截图/.test(name)) return 'monitor';
  if(/小票|缴费|订单|日程|记录/.test(name)) return 'receipt';
  if(/车牌|黑车|轮胎|机油|封条/.test(name)) return 'vehicle';
  if(/账本|转账|合同/.test(name)) return 'ledger';
  if(/匿名函/.test(name)) return 'letter';
  if(/U盘|审计/.test(name)) return 'usb';
  if(/门禁/.test(name)) return 'access';
  if(/底片|照片/.test(name)) return 'film';
  if(/推理|证据链|法庭/.test(name)) return 'projection';
  return 'document';
}
function closeupTypeLabel(type){
  return {
    monitor:'监控画面', receipt:'小票 / 单据', vehicle:'车辆残片 / 黑车照片',
    ledger:'账本页 / 资金资料', letter:'匿名函', usb:'U盘 / 审计资料',
    access:'门禁记录', film:'照片底片', projection:'法庭证据投影', document:'卷宗文件'
  }[type] || '卷宗文件';
}
function closeupCaseFor(name){
  return objectCloseupCases[name] || caseTitleById(state.activeCase || 'case1');
}
function objectVisualFor(name,type){
  const img = evidenceImageMap[name];
  if(img){
    return `<figure class="obj-evidence-image-wrap type-${uiSafe(type)}">
      <img class="obj-evidence-image" src="${img}" alt="${uiSafe(name)} 证据图像" loading="eager" draggable="false">
      <figcaption><strong>${uiSafe(name)}</strong><span>${uiSafe(closeupTypeLabel(type))}</span></figcaption>
    </figure>`;
  }
  return `<div class="obj-document"><strong>${uiSafe(name)}</strong><p>${uiSafe(hintFor(name))}</p></div>`;
}
function showObjectCloseup(name, opts={}){
  if(!name) return;
  const overlay = $('objectCloseupOverlay');
  if(!overlay) return;
  const type = opts.type || closeupTypeFor(name);
  const title = opts.title || name;
  const desc = opts.desc || hintFor(name);
  const caseName = opts.caseName || closeupCaseFor(name);
  const typeLabel = closeupTypeLabel(type);
  $('objectCloseupKicker').textContent = 'OBJECT CLOSE-UP';
  $('objectCloseupTitle').textContent = title;
  $('objectCloseupMeta').textContent = `${caseName} / ${typeLabel}`;
  $('objectCloseupDesc').textContent = desc;
  $('objectCloseupTags').innerHTML = [`${caseName}`, typeLabel, state.evidence.includes(name)?'已入档':'待入档'].map(x=>`<span>${uiSafe(x)}</span>`).join('');
  $('objectCloseupVisual').innerHTML = objectVisualFor(name,type);
  const card = $('objectCloseupCard');
  card.className = `object-closeup-card type-${type}`;
  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden','false');
  document.body.classList.add('object-closeup-open');
  if(typeof pulseCamera === 'function') pulseCamera('insert', title, 1100, {focus:name});
  playSfx('evidence');
}
function closeObjectCloseup(){
  const overlay = $('objectCloseupOverlay');
  if(!overlay) return;
  overlay.classList.add('hidden');
  overlay.setAttribute('aria-hidden','true');
  document.body.classList.remove('object-closeup-open');
  setTimeout(flushPendingCgIllustration, 40);
}
function shouldShowObjectCloseup(name){
  if(!name) return false;
  return !!evidenceImageMap[name] || /监控|小票|车牌|黑车|轮胎|账本|匿名函|U盘|审计|门禁|底片|照片|缴费|交班|封条|录音|转账|合同|订单|日程|语音|机油|出血/.test(name);
}
function queueObjectCloseup(name){
  if(!shouldShowObjectCloseup(name)) return;
  const key = `object-closeup:${name}`;
  if(state.used && state.used[key]) return;
  if(!state.used) state.used = {};
  state.used[key] = true;
  setTimeout(()=>showObjectCloseup(name), 220);
}


function uiSafe(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

let stageCurrentSpeaker = '系统';
const actorMetaMap = Object.fromEntries(characterCodex.map(c=>[c.name,c]));
const sceneStageActors = {
  city:[{name:'陆沉', pos:'left', emotion:'serious', entrance:'in-left'},{name:'韩亦', pos:'right', emotion:'serious', entrance:'in-right'}],
  store:[{name:'陆沉', pos:'left', emotion:'serious', entrance:'in-left'},{name:'苏岚', pos:'right', emotion:'sad', entrance:'in-right'}],
  meeting:[{name:'陆沉', pos:'left', emotion:'serious', entrance:'in-left'},{name:'陈巍', pos:'right', emotion:'anger', entrance:'in-right'}],
  office:[{name:'陆沉', pos:'center', emotion:'serious', entrance:'in-center'},{name:'韩亦', pos:'right', emotion:'neutral', entrance:'in-right'}],
  court:[{name:'陆沉', pos:'left', emotion:'serious', entrance:'in-left'},{name:'韩亦', pos:'center', emotion:'serious', entrance:'in-center'},{name:'陈巍', pos:'right', emotion:'shock', entrance:'in-right'}],
  hospital:[{name:'陆沉', pos:'left', emotion:'serious', entrance:'in-left'},{name:'李娜', pos:'right', emotion:'sad', entrance:'in-right'},{name:'韩亦', pos:'center', emotion:'neutral', entrance:'in-center'}],
  dock:[{name:'陆沉', pos:'left', emotion:'serious', entrance:'in-left'},{name:'莫野', pos:'right', emotion:'serious', entrance:'in-right'}],
  court2:[{name:'陆沉', pos:'left', emotion:'serious', entrance:'in-left'},{name:'莫野', pos:'right', emotion:'neutral', entrance:'in-right'},{name:'韩亦', pos:'center', emotion:'serious', entrance:'in-center'}],
  archive:[{name:'陆沉', pos:'left', emotion:'serious', entrance:'in-left'},{name:'乔衡', pos:'right', emotion:'serious', entrance:'in-right'}],
  rooftop:[{name:'陆沉', pos:'left', emotion:'serious', entrance:'in-left'},{name:'乔衡', pos:'right', emotion:'anger', entrance:'in-right'}],
  court3:[{name:'陆沉', pos:'left', emotion:'serious', entrance:'in-left'},{name:'乔衡', pos:'right', emotion:'shock', entrance:'in-right'},{name:'韩亦', pos:'center', emotion:'serious', entrance:'in-center'}]
};

const actorEmotionProfiles = {
  '陆沉':['neutral','serious','resolve'],
  '韩亦':['neutral','serious'],
  '苏岚':['neutral','sad','shock'],
  '陈巍':['anger','shock','sad'],
  '李娜':['sad','shock'],
  '莫野':['neutral','serious'],
  '乔衡':['serious','anger','shock','sad']
};
const actorEmotionState = {};
const actorEmotionLabels = {
  neutral:'平静',
  serious:'严肃',
  shock:'动摇',
  anger:'压抑',
  sad:'低落',
  resolve:'反击'
};

const actorExpressionPortraits = {
  "陆沉": {
    "neutral": "./assets/portraits/v47_highres/luchen_neutral.jpg",
    "serious": "./assets/portraits/v47_highres/luchen_serious.jpg",
    "resolve": "./assets/portraits/v47_highres/luchen_resolve.jpg"
  },
  "韩亦": {
    "neutral": "./assets/portraits/v48_highres/hanyi_neutral.jpg",
    "serious": "./assets/portraits/v48_highres/hanyi_serious.jpg"
  },
  "苏岚": {
    "neutral": "./assets/portraits/v48_highres/sulan_neutral.jpg",
    "sad": "./assets/portraits/v48_highres/sulan_sad.jpg",
    "shock": "./assets/portraits/v48_highres/sulan_shock.jpg"
  },
  "陈巍": {
    "neutral": "./assets/portraits/v48_highres/chenwei_neutral.jpg",
    "anger": "./assets/portraits/v48_highres/chenwei_anger.jpg",
    "shock": "./assets/portraits/v48_highres/chenwei_shock.jpg",
    "sad": "./assets/portraits/v48_highres/chenwei_sad.jpg"
  },
  "李娜": {
    "neutral": "./assets/portraits/v48_highres/lina_neutral.jpg",
    "sad": "./assets/portraits/v48_highres/lina_sad.jpg",
    "shock": "./assets/portraits/v48_highres/lina_shock.jpg"
  },
  "莫野": {
    "neutral": "./assets/portraits/v48_highres/moye_neutral.jpg",
    "serious": "./assets/portraits/v48_highres/moye_serious.jpg"
  },
  "乔衡": {
    "neutral": "./assets/portraits/v48_highres/qiao_neutral.jpg",
    "serious": "./assets/portraits/v48_highres/qiao_serious.jpg",
    "anger": "./assets/portraits/v48_highres/qiao_anger.jpg",
    "shock": "./assets/portraits/v48_highres/qiao_shock.jpg",
    "sad": "./assets/portraits/v48_highres/qiao_sad.jpg"
  }
};
function portraitFor(name, emotion='neutral'){
  const meta = actorMetaMap[name];
  const table = actorExpressionPortraits[name];
  if(!table) return meta && meta.portrait ? meta.portrait : './assets/char_luchen.jpg';
  const key = normalizeActorEmotion(name, emotion || 'neutral');
  return table[key] || table.neutral || table.serious || table.sad || table.anger || Object.values(table)[0] || (meta && meta.portrait) || './assets/char_luchen.jpg';
}


const case1DramaticPortraits = {
  "陆沉": {
    "observe": "./assets/portraits/v47_highres/luchen_observe.jpg",
    "counter": "./assets/portraits/v47_highres/luchen_counter.jpg",
    "pressure": "./assets/portraits/v47_highres/luchen_pressure.jpg"
  },
  "苏岚": {
    "fear": "./assets/portraits/v48_highres/sulan_fear.jpg",
    "waver": "./assets/portraits/v48_highres/sulan_waver.jpg",
    "confess": "./assets/portraits/v48_highres/sulan_confess.jpg"
  },
  "陈巍": {
    "angry": "./assets/portraits/v48_highres/chenwei_angry.jpg",
    "wronged": "./assets/portraits/v48_highres/chenwei_wronged.jpg",
    "breakdown": "./assets/portraits/v48_highres/chenwei_breakdown.jpg"
  },
  "乔衡": {
    "calm": "./assets/portraits/v48_highres/qiao_calm.jpg",
    "break": "./assets/portraits/v48_highres/qiao_break.jpg",
    "evade": "./assets/portraits/v48_highres/qiao_evade.jpg"
  }
};
const case1DramaticLabels = {
  "observe": "冷静观察",
  "counter": "法庭反击",
  "pressure": "质证压迫",
  "fear": "恐惧",
  "waver": "动摇",
  "confess": "坦白",
  "angry": "愤怒",
  "wronged": "被冤",
  "breakdown": "崩溃",
  "calm": "伪装镇定",
  "break": "破防",
  "evade": "逃避"
};

const case2DramaticPortraits = {
  "李娜": {
    "hesitate": "./assets/portraits/v48_highres/lina_hesitate.jpg",
    "fear": "./assets/portraits/v48_highres/lina_fear.jpg",
    "testify": "./assets/portraits/v48_highres/lina_testify.jpg"
  },
  "莫野": {
    "observe": "./assets/portraits/v48_highres/moye_observe.jpg",
    "guard": "./assets/portraits/v48_highres/moye_guard.jpg",
    "recording": "./assets/portraits/v48_highres/moye_recording.jpg"
  },
  "陆沉": {
    "investigate": "./assets/portraits/v47_highres/luchen_investigate.jpg",
    "interrogate": "./assets/portraits/v47_highres/luchen_interrogate.jpg",
    "chain": "./assets/portraits/v47_highres/luchen_chain.jpg"
  },
  "韩亦": {
    "record": "./assets/portraits/v48_highres/hanyi_record.jpg",
    "route": "./assets/portraits/v48_highres/hanyi_route.jpg",
    "courtAssist": "./assets/portraits/v48_highres/hanyi_courtAssist.jpg"
  }
};
const case2DramaticLabels = {
  "hesitate": "犹豫",
  "fear": "害怕",
  "testify": "作证",
  "observe": "观察",
  "guard": "警惕",
  "recording": "交出录音",
  "investigate": "调查",
  "interrogate": "质证",
  "chain": "推进证据链",
  "record": "记录",
  "route": "核对路线",
  "courtAssist": "法庭辅助"
};

const case3DramaticPortraits = {
  "陆沉": {
    "archive": "./assets/portraits/v47_highres/luchen_chain.jpg",
    "rooftop": "./assets/portraits/v47_highres/luchen_pressure.jpg",
    "finalCourt": "./assets/portraits/v47_highres/luchen_interrogate.jpg"
  },
  "乔衡": {
    "calm": "./assets/portraits/v48_highres/qiao_calm.jpg",
    "break": "./assets/portraits/v48_highres/qiao_break.jpg",
    "evade": "./assets/portraits/v48_highres/qiao_evade.jpg"
  },
  "韩亦": {
    "route": "./assets/portraits/v48_highres/hanyi_route.jpg",
    "record": "./assets/portraits/v48_highres/hanyi_record.jpg",
    "courtAssist": "./assets/portraits/v48_highres/hanyi_courtAssist.jpg"
  }
};
const case3DramaticLabels = {
  "archive": "终局调查",
  "rooftop": "天台压迫",
  "finalCourt": "终审质证",
  "calm": "伪装镇定",
  "break": "破防",
  "evade": "逃避",
  "route": "核对路线",
  "record": "记录",
  "courtAssist": "法庭辅助"
};

function dramaPortraitFor(name, drama){
  if(case1DramaticPortraits[name] && case1DramaticPortraits[name][drama]) return case1DramaticPortraits[name][drama];
  if(case2DramaticPortraits[name] && case2DramaticPortraits[name][drama]) return case2DramaticPortraits[name][drama];
  if(case3DramaticPortraits[name] && case3DramaticPortraits[name][drama]) return case3DramaticPortraits[name][drama];
  return '';
}
function canActorDrama(name, drama){
  return !!dramaPortraitFor(name, drama);
}
function inferCase2DramaticState(name, role='', text=''){
  const t = String(text || '');
  if(name === '李娜'){
    if(/作证|法庭|证词|账本页|我只看到|交给/.test(t)) return 'testify';
    if(/威胁|害怕|手术费|不敢|移出|黑色雨衣|没有调取单/.test(t)) return 'fear';
    if(/病历|带走|缴费|交班|走廊|护士/.test(t)) return 'hesitate';
    return 'hesitate';
  }
  if(name === '莫野'){
    if(/录音|递来|交给|拿着|账本别进法院/.test(t)) return 'recording';
    if(/码头|货柜|黑车|尾号|封条|等人|危险/.test(t)) return 'guard';
    if(/路线|停留|观察|委托|终点/.test(t)) return 'observe';
    return 'guard';
  }
  if(name === '陆沉'){
    if(['court2'].includes(state.scene) || /质证|提交|法庭|录音|委托链/.test(t)) return 'interrogate';
    if(/证据链|账本|码头|医院|组合推理|推理/.test(t)) return 'chain';
    if(/调查|记录|核对|缴费|交班|病历|货柜/.test(t)) return 'investigate';
    return 'investigate';
  }
  if(name === '韩亦'){
    if(['court2'].includes(state.scene) || /法庭|提交|证据/.test(t)) return 'courtAssist';
    if(/路线|码头|车牌|监控|货柜/.test(t)) return 'route';
    if(/记录|编号|核对|病历|缴费/.test(t)) return 'record';
    return 'record';
  }
  return '';
}

const actorDramaticState = {};
function dramaLabel(state){return case1DramaticLabels[state] || case2DramaticLabels[state] || case3DramaticLabels[state] || '演出状态'}
function inferCase1DramaticState(name, role='', text=''){
  const t = String(text || '');
  if(name === '陆沉'){
    if(/我反对|提交|证据|真相|质证|法典|证明|反击|不是推论/.test(t) || ['court','court2','court3'].includes(state.scene)) return /压迫|逼问|为什么|凭什么|删掉|伪造|订单/.test(t) ? 'pressure' : 'counter';
    if(/查看|调查|记录|观察|线索|推理|监控|轮胎|小票/.test(t) || ['city','store','office'].includes(state.scene)) return 'observe';
    return 'observe';
  }
  if(name === '苏岚'){
    if(/害怕|不敢|报警|打不出去|失去工作|删掉|对不起/.test(t)) return 'fear';
    if(/看见|黑车|语音|监控|我不知道|不确定/.test(t)) return 'waver';
    if(/我说|我承认|我看见|是真的|坦白|告诉你/.test(t)) return 'confess';
    return characterCurrentEmotion(name)==='shock' ? 'waver' : characterCurrentEmotion(name)==='sad' ? 'fear' : 'waver';
  }
  if(name === '陈巍'){
    if(/我没|不是我|凭什么|为什么|刀|没有/.test(t)) return 'wronged';
    if(/气|愤怒|忍不了|冲动|恨/.test(t)) return 'angry';
    if(/匿名|来电|我不知道|崩|完了|害了/.test(t)) return 'breakdown';
    return characterCurrentEmotion(name)==='shock' ? 'breakdown' : characterCurrentEmotion(name)==='sad' ? 'wronged' : 'angry';
  }
  if(name === '乔衡'){
    if(/不可能|没有|别问|证据呢|你没有/.test(t)) return 'calm';
    if(/删掉|灰塔|转账|账本|对不起|我以为|不是/.test(t)) return 'break';
    if(/不知道|不在我手里|离开|逃|别/.test(t)) return 'evade';
    return ['court','court2','court3','rooftop'].includes(state.scene) ? 'break' : 'calm';
  }
  return '';
}
function setActorDramaticState(name, drama, reason='dialogue'){
  if(!name || !drama || !canActorDrama(name, drama)) return;
  actorDramaticState[name] = {drama, reason, at:Date.now()};
}
function currentDramaticState(name){
  return actorDramaticState[name] && actorDramaticState[name].drama || '';
}
function portraitForStage(name, emotion='neutral', drama=''){
  const d = drama || currentDramaticState(name);
  const dramaPortrait = d ? dramaPortraitFor(name, d) : '';
  if(dramaPortrait) return dramaPortrait;
  return portraitFor(name, emotion);
}

function actorCanEmotion(name, emotion){
  const list = actorEmotionProfiles[name];
  return !list || list.includes(emotion);
}
function normalizeActorEmotion(name, emotion){
  if(actorCanEmotion(name, emotion)) return emotion;
  const list = actorEmotionProfiles[name] || ['neutral'];
  if(list.includes('serious')) return 'serious';
  if(list.includes('neutral')) return 'neutral';
  return list[0] || 'neutral';
}
function baseActorEmotion(name){
  if(name === '陆沉') return ['court','court2','court3'].includes(state.scene) ? 'resolve' : 'serious';
  if(name === '韩亦') return 'serious';
  if(name === '苏岚') return 'sad';
  if(name === '陈巍') return 'anger';
  if(name === '李娜') return 'sad';
  if(name === '莫野') return 'serious';
  if(name === '乔衡') return ['rooftop','court3'].includes(state.scene) ? 'shock' : 'serious';
  return 'neutral';
}
function inferActorEmotion(name, role='', text=''){
  const t = String(text || '');
  let emotion = baseActorEmotion(name);
  if(name === '陆沉'){
    if(/我反对|反对|证据|真相|法典|提交|质证|终局|推理成立|不是推论|偏见/.test(t) || ['court','court2','court3'].includes(state.scene)) emotion='resolve';
    else if(/冷静|记录|调查|检查|推理/.test(t)) emotion='serious';
  }else if(name === '韩亦'){
    emotion = /提醒|不是一个人|旧码头|监控|调取|证据/.test(t) ? 'serious' : 'neutral';
  }else if(name === '苏岚'){
    if(/害怕|不敢|失去工作|删掉|电话|报警|打不出去|我真的/.test(t)) emotion='sad';
    if(/黑车|店外|看见|监控|语音/.test(t)) emotion='shock';
  }else if(name === '陈巍'){
    if(/我没|没有|刀已经|委屈|为什么|不是我/.test(t)) emotion='anger';
    if(/黑车|来电|匿名|不知道/.test(t)) emotion='shock';
  }else if(name === '李娜'){
    if(/害怕|账本|病历|带走|不敢/.test(t)) emotion='sad';
    if(/不是病历|夹在|账本/.test(t)) emotion='shock';
  }else if(name === '莫野'){
    emotion = /终点|擦地|危险|码头|委托/.test(t) ? 'serious' : 'neutral';
  }else if(name === '乔衡'){
    if(/我以为|活着|删掉|监控|对不起/.test(t)) emotion='sad';
    if(/灰塔|转账|委托|不可能|他们/.test(t)) emotion='shock';
    if(/不是我|别问|没有/.test(t)) emotion='anger';
  }
  if(/愤怒|怒|吼|别问/.test(t)) emotion='anger';
  if(/害怕|沉默|低头|不敢|失去/.test(t)) emotion='sad';
  if(/突然|不可能|黑车|匿名函|转账凭证/.test(t)) emotion='shock';
  if(/证据|真相|我反对|法典|反击|质证/.test(t) && name === '陆沉') emotion='resolve';
  return normalizeActorEmotion(name, emotion);
}
function setActorEmotion(name, emotion, reason='dialogue'){
  if(!actorMetaMap[name]) return;
  actorEmotionState[name] = {emotion:normalizeActorEmotion(name, emotion), reason, at:Date.now()};
}
function actorEmotionFor(actor, active){
  const stored = actorEmotionState[actor.name] && actorEmotionState[actor.name].emotion;
  const fallback = actor.emotion || baseActorEmotion(actor.name);
  return normalizeActorEmotion(actor.name, active && stored ? stored : fallback);
}
function emotionLabel(emotion){
  return actorEmotionLabels[emotion] || '状态';
}

function actorMeta(name){return actorMetaMap[name] || {name, role:'人物', portrait:'', desc:'这个人仍然站在案件阴影里。'}}
function stageActorsForScene(id){
  const list = sceneStageActors[id] ? [...sceneStageActors[id]] : [];
  if(stageCurrentSpeaker && actorMetaMap[stageCurrentSpeaker] && !list.some(a=>a.name===stageCurrentSpeaker)){
    const pos = list.length===0?'center':list.length===1?'right':'center';
    list.push({name:stageCurrentSpeaker,pos,emotion:'serious',entrance:`in-${pos}`});
  }
  return list.slice(0,3);
}
function actorStageLabel(actor, meta, active){
  const state = active ? '正在发言' : actor.emotion==='sad' ? '沉默' : actor.emotion==='anger' ? '压抑' : actor.emotion==='shock' ? '动摇' : '待命';
  return `<span class="actor-tooltip"><strong>${uiSafe(meta.name)}</strong><small>${uiSafe(meta.role)} · ${state}</small></span>`;
}


const actorActionProfiles = {
  '陆沉':['idle','speak','think','stepIn','point','tense'],
  '韩亦':['idle','speak','think','tense'],
  '苏岚':['idle','lowerHead','speak','stepBack','tense'],
  '陈巍':['idle','tense','stepIn','speak'],
  '李娜':['idle','lowerHead','speak','tense'],
  '莫野':['idle','speak','think','tense'],
  '乔衡':['idle','speak','tense','stepIn','stepBack']
};
const actorActionState = {};
const actorActionLabels = {
  idle:'站立',
  speak:'发言',
  think:'观察',
  tense:'对峙',
  stepIn:'压前',
  stepBack:'后退',
  point:'指证',
  lowerHead:'低头'
};
function actorCanAction(name, action){
  const list = actorActionProfiles[name];
  return !list || list.includes(action);
}
function normalizeActorAction(name, action){
  if(actorCanAction(name, action)) return action;
  const list = actorActionProfiles[name] || ['idle'];
  if(list.includes('speak')) return 'speak';
  if(list.includes('tense')) return 'tense';
  return list[0] || 'idle';
}
function baseActorAction(name){
  if(name === '陆沉') return ['court','court2','court3'].includes(state.scene) ? 'point' : 'think';
  if(name === '韩亦') return 'think';
  if(name === '苏岚') return 'lowerHead';
  if(name === '陈巍') return 'tense';
  if(name === '李娜') return 'lowerHead';
  if(name === '莫野') return 'think';
  if(name === '乔衡') return ['rooftop','court3'].includes(state.scene) ? 'stepBack' : 'tense';
  return 'idle';
}
function inferActorAction(name, role='', text=''){
  const t = String(text || '');
  let action = baseActorAction(name);
  if(name === '陆沉'){
    if(/我反对|提交|证据|真相|质证|法典|不是推论|偏见|证明|指出/.test(t)) action = 'point';
    else if(/进入|上前|开始|反击/.test(t)) action = 'stepIn';
    else if(/查看|调查|记录|观察|线索|推理/.test(t)) action = 'think';
    else action = 'speak';
  }else if(name === '韩亦'){
    if(/查|核对|记录|路线|时间|监控/.test(t)) action = 'think';
    else if(/小心|不对|不是/.test(t)) action = 'tense';
    else action = 'speak';
  }else if(name === '苏岚'){
    if(/害怕|不敢|失去工作|删掉|报警|打不出去|对不起/.test(t)) action = 'lowerHead';
    else if(/黑车|看见|监控|语音/.test(t)) action = 'stepBack';
    else action = 'speak';
  }else if(name === '陈巍'){
    if(/我没|没有|不是我|为什么|凭什么|刀/.test(t)) action = 'stepIn';
    else if(/不知道|匿名|黑车/.test(t)) action = 'tense';
    else action = 'speak';
  }else if(name === '李娜'){
    if(/害怕|不敢|病历|账本|带走/.test(t)) action = 'lowerHead';
    else action = 'speak';
  }else if(name === '莫野'){
    if(/码头|货柜|委托|终点|危险/.test(t)) action = 'think';
    else action = 'speak';
  }else if(name === '乔衡'){
    if(/不可能|不是我|别问|没有/.test(t)) action = 'stepIn';
    else if(/删掉|对不起|我以为|活着|灰塔|转账/.test(t)) action = 'stepBack';
    else action = 'tense';
  }
  if(/沉默|低头|不敢|害怕|失去/.test(t)) action = 'lowerHead';
  if(/质问|为什么|凭什么|不是我|别问/.test(t)) action = 'stepIn';
  if(/提交|证据|我反对|真相|法典|质证/.test(t) && name === '陆沉') action = 'point';
  if(['court','court2','court3'].includes(state.scene) && actorCanAction(name,'tense') && !/提交|证据|我反对|真相/.test(t)) action = action === 'idle' ? 'tense' : action;
  return normalizeActorAction(name, action);
}
function setActorAction(name, action, reason='dialogue'){
  if(!actorMetaMap[name]) return;
  actorActionState[name] = {action:normalizeActorAction(name, action), reason, at:Date.now()};
}
function actorActionFor(actor, active){
  const stored = actorActionState[actor.name] && actorActionState[actor.name].action;
  const fallback = actor.action || baseActorAction(actor.name);
  return normalizeActorAction(actor.name, active && stored ? stored : fallback);
}
function actionLabel(action){
  return actorActionLabels[action] || '动作';
}


const characterInteractionProfiles = {
  '陆沉':{
    observe:'陆沉正在核对证据与时间顺序。',
    ask:'先核对时间线，再检查证词和证据是否一致。',
    hint:'如果卡住，先去律所办公室整理证据墙，再查看未调查热点。'
  },
  '韩亦':{
    observe:'韩亦正在记录路线、时间和证据编号。',
    ask:'我可以帮你核对路线和时间。',
    hint:'优先补齐监控、通话和车辆痕迹。'
  },
  '苏岚':{
    observe:'苏岚回避监控方向，状态紧张。',
    ask:'我不是不想报警。我真的打不出去，后来……我怕店长知道我多说话。',
    hint:'如果要追问苏岚，先拿到店内网络异常和未发送语音。'
  },
  '陈巍':{
    observe:'陈巍情绪激动，反复否认自己刺人。',
    ask:'我没刺他！我到的时候他已经倒下了。有人打电话让我改路线，我以为只是吵架。',
    hint:'补齐黑车、通话和订单线索。'
  },
  '李娜':{
    observe:'李娜说话时会看向走廊尽头。',
    ask:'那不是普通病历。里面夹着账本页，我知道不该碰，可我也知道有人会因此出事。',
    hint:'医院线索要和旧码头线索放在一起看，单独一边都只是碎片。'
  },
  '莫野':{
    observe:'莫野掌握码头和车辆相关信息。',
    ask:'先确认路线安排和车辆停留点。',
    hint:'码头监控、货柜封条、私家侦探录音与委托信息相关。'
  },
  '乔衡':{
    observe:'乔衡回避关键问题，保持沉默。',
    ask:'我只是中间人。我以为删掉一段录像，就能让事情停在那里。',
    hint:'继续查灰塔转账、董事会日程和天台门禁。'
  }
};
const characterEvidenceResponses = {
  '苏岚':{
    '店内网络异常':'苏岚看向收银台下方的路由器，声音变低：“那天网络断过，不是普通故障。”',
    '未发送语音':'她的手指攥紧：“我录了语音，但没发出去。我怕那条语音把所有人都拖下去。”',
    '店长删改指令':'苏岚的脸色变白：“他让我说没看见店外的人。我当时只想保住工作。”'
  },
  '陈巍':{
    '匿名来电记录':'陈巍猛地抬头：“就是这个电话！我不是自己过去的。”',
    '黑车车牌残片':'他愣住几秒：“所以那辆车真的在？我就知道那晚不只有我。”',
    '袖口机油':'陈巍低头看向袖口：“我碰过车门，但那不是受害人的血。”'
  },
  '李娜':{
    '残缺账本页':'李娜咬住嘴唇：“那页不是病历，我看到过类似的编号。”',
    '医院缴费单':'她轻声说：“缴费记录被改过。不是护士能做到的权限。”',
    '护士交班记录':'李娜的眼神动摇：“交班本上少了一行，那晚有人拿走过病历。”'
  },
  '莫野':{
    '码头监控截图':'莫野眯起眼睛：“车停的位置不对，那是在等人，不是在卸货。”',
    '货柜封条':'他敲了敲封条编号：“这个编号和账本页能对上。”',
    '私家侦探录音':'莫野沉默片刻：“录音里那个人，不是在请我调查，是在试探我会不会闭嘴。”'
  },
  '乔衡':{
    '灰塔转账凭证':'乔衡看向凭证：“这是转账记录。”',
    '审计U盘':'他慢慢后退半步：“U盘里不是完整真相，但足够让他们害怕。”',
    '天台门禁记录':'乔衡低声说：“那晚我没有上天台。”',
    '狙击照片底片':'他查看底片：“照片底片已记录。”'
  },
  '陆沉':{
    '黑车车牌残片':'陆沉查看车牌残片：“记录车牌编号。”',
    '灰塔转账凭证':'陆沉查看证据墙：“记录资金流向。”',
    '匿名函残页':'陆沉查看残页：“记录匿名函内容。”'
  },
  '韩亦':{
    '破损监控记录':'韩亦点开记录：“黑屏时间太准确了。人为切断的可能性很高。”',
    '码头监控截图':'她把画面放大：“车身反光能和货柜编号对上。”',
    '董事会日程':'韩亦查看日程：“记录日程与转账时间。”'
  }
};
function characterInteractionProfile(name){
  return characterInteractionProfiles[name] || {
    observe:`${name}仍站在场景阴影里，等待你找到更有分量的问题。`,
    ask:'现在的信息还不够。继续调查现场，或拿出更明确的证据。',
    hint:'先查看任务面板和证据图鉴，找到尚未闭合的线索。'
  };
}
function characterCurrentEmotion(name){
  const stored = actorEmotionState[name] && actorEmotionState[name].emotion;
  return stored || baseActorEmotion(name);
}
function characterHintFor(name){
  const p = characterInteractionProfile(name);
  const m = typeof currentMission === 'function' ? currentMission() : null;
  const prog = m && typeof missionProgress === 'function' ? missionProgress(m) : null;
  const missionText = prog && prog.current ? `当前目标：${prog.current.goal}` : '查看未调查热点，补齐证据链。';
  if(name === '陆沉') return `${p.hint} ${missionText}`;
  if(name === '韩亦') return `${p.hint} ${missionText}`;
  return p.hint || missionText;
}
function speakCharacterInteraction(name, kind, text, emotion){
  const meta = actorMeta(name);
  const finalEmotion = normalizeActorEmotion(name, emotion || inferActorEmotion(name, meta.role, text));
  setActorEmotion(name, finalEmotion, kind);
  setActorDramaticState(name, inferCase2DramaticState(name, meta.role, text) || inferCase1DramaticState(name, meta.role, text), kind);
  setActorAction(name, inferActorAction(name, meta.role, text), kind);
  closeModal();
  if(typeof pulseCamera === 'function') pulseCamera(kind==='evidence'?'insert':'close', `${name} · ${emotionLabel(finalEmotion)}`, 900, {focus:name});
  say(name, meta.role, meta.portrait, text);
}
function showCharacterInteraction(name){
  const meta = actorMeta(name);
  const emotion = characterCurrentEmotion(name);
  const p = characterInteractionProfile(name);
  playSfx('click');
  if(typeof pulseCamera === 'function') pulseCamera('close', `${name} 互动`, 760, {focus:name});
  showModal(`${name} · 人物交互`, `
    <div class="character-interaction-shell">
      <div class="character-interaction-hero">
        <div class="character-interaction-portrait" style="background-image:url('${portraitForStage(name, emotion)}')"></div>
        <div class="character-interaction-info">
          <p class="archive-kicker">CHARACTER CONTACT</p>
          <h2>${uiSafe(meta.name)}</h2>
          <span>${uiSafe(meta.role||'人物')} · 当前状态：${emotionLabel(emotion)}${currentDramaticState(name)?' / '+dramaLabel(currentDramaticState(name)):''}</span>
          <p>${uiSafe(meta.desc||p.observe)}</p>
        </div>
      </div>
      <div class="character-interaction-actions">
        <button class="character-action-card" data-character-action="observe"><strong>观察</strong><small>查看此刻状态与细节</small></button>
        <button class="character-action-card" data-character-action="ask"><strong>追问</strong><small>触发短对白与情绪变化</small></button>
        <button class="character-action-card" data-character-action="evidence"><strong>出示证据</strong><small>选择已有证据试探反应</small></button>
        <button class="character-action-card" data-character-action="hint"><strong>请求提示</strong><small>获得下一步调查方向</small></button>
        <button class="character-action-card" data-character-action="expressions"><strong>表情资源</strong><small>查看当前人物表情立绘</small></button>
      </div>
    </div>`);
  document.querySelectorAll('[data-character-action]').forEach(btn=>{
    btn.onclick=()=>{
      const action = btn.dataset.characterAction;
      if(action === 'observe') return speakCharacterInteraction(name,'observe',p.observe, emotion);
      if(action === 'ask') return speakCharacterInteraction(name,'ask',p.ask, inferActorEmotion(name, meta.role, p.ask));
      if(action === 'hint') return speakCharacterInteraction(name,'hint',characterHintFor(name),'serious');
      if(action === 'evidence') return showCharacterEvidenceMenu(name);
      if(action === 'expressions') return showExpressionGallery(name);
    };
  });
}
function evidenceReaction(name, evidence){
  const specific = characterEvidenceResponses[name] && characterEvidenceResponses[name][evidence];
  if(specific) return specific;
  if(name === '陆沉') return `陆沉审视“${evidence}”：“这条证据有价值，但还要看它能和哪一条线索互相支撑。”`;
  if(name === '韩亦') return `韩亦记录下“${evidence}”：“我会去核对来源。别只看它本身，要看它出现的时间。”`;
  if(actorMetaMap[name]) return `${name}看着“${evidence}”，短暂沉默：“这东西……你是从哪里拿到的？”`;
  return `这条证据暂时没有得到明确回应。`;
}

function showExpressionGallery(name){
  const meta = actorMeta(name);
  const table = {...(actorExpressionPortraits[name] || {}), ...(case1DramaticPortraits[name] || {}), ...(case2DramaticPortraits[name] || {})};
  const cards = Object.entries(table).map(([emotion,src])=>`<article class="expression-card emotion-${emotion}">
    <div class="expression-thumb" style="background-image:url('${src}')"></div>
    <strong>${uiSafe(emotionLabel(emotion) || dramaLabel(emotion))}</strong>
    <small>${uiSafe(meta.name)} · ${uiSafe(meta.role||'人物')}</small>
  </article>`).join('');
  showModal(`${name} · 表情资源`, `<div class="expression-gallery">
    <p class="archive-kicker">EXPRESSION SHEET</p>
    <h2>${uiSafe(meta.name)} 表情立绘</h2>
    <p class="archive-summary">当前版本为阶段性表情资源：对白、人物舞台和 CG 会根据情绪自动调用对应立绘。</p>
    <div class="expression-grid">${cards}</div>
    <div class="save-actions"><button class="btn ghost" onclick="showCharacterInteraction('${uiSafe(name)}')">返回人物交互</button></div>
  </div>`);
}

function showCharacterEvidenceMenu(name){
  const meta = actorMeta(name);
  const evidence = state.evidence || [];
  const list = evidence.length ? evidence.map(ev=>`<button class="evidence-present-card" data-present-evidence="${uiSafe(ev)}"><span>${iconFor(ev)}</span><strong>${uiSafe(ev)}</strong><small>${uiSafe(hintFor(ev))}</small></button>`).join('') : '<p class="archive-empty">你还没有可出示的证据。先调查现场或查看热点。</p>';
  showModal(`${name} · 出示证据`, `
    <div class="character-evidence-shell">
      <div class="archive-header compact-character-head">
        <div>
          <p class="archive-kicker">PRESENT EVIDENCE</p>
          <h2>向 ${uiSafe(meta.name)} 出示证据</h2>
          <p class="archive-summary">选择一条已获得证据，观察人物反应。该互动不会改变原有证据、结局和存档逻辑。</p>
        </div>
      </div>
      <div class="evidence-present-grid">${list}</div>
      <div class="save-actions"><button class="btn ghost" onclick="showCharacterInteraction('${uiSafe(name)}')">返回人物交互</button></div>
    </div>`);
  document.querySelectorAll('[data-present-evidence]').forEach(btn=>{
    btn.onclick=()=>{
      const ev = btn.dataset.presentEvidence;
      const text = evidenceReaction(name, ev);
      const emotion = inferActorEmotion(name, meta.role, text);
      speakCharacterInteraction(name,'evidence',text,emotion);
    };
  });
}

function renderActorStage(){
  const layer = $('actorStageLayer');
  if(!layer) return;
  const list = stageActorsForScene(state.scene);
  if(!list.length){ layer.innerHTML=''; return; }
  const hasNamedSpeaker = actorMetaMap[stageCurrentSpeaker];
  layer.innerHTML = list.map((actor,idx)=>{
    const meta = actorMeta(actor.name);
    const active = hasNamedSpeaker ? actor.name === stageCurrentSpeaker : actor.name === '陆沉';
    const inactive = hasNamedSpeaker && !active;
    const emotion = actorEmotionFor(actor, active);
    const action = actorActionFor(actor, active);
    const drama = currentDramaticState(actor.name);
    const portrait = portraitForStage(actor.name, emotion, drama);
    const role = meta.role || '人物';
    return `<button class="stage-actor pos-${actor.pos||'center'} emotion-${emotion} action-${action} ${actor.entrance||''} ${active?'active':'dimmed'} ${inactive?'inactive':''}" data-stage-actor="${uiSafe(actor.name)}" data-emotion="${emotion}" data-action-pose="${action}" data-drama-state="${drama}" style="--actor-img:url('${portrait}');--actor-order:${idx}">
      <span class="actor-glow"></span>
      <span class="actor-motion-shadow" aria-hidden="true"></span>
      <span class="actor-emotion-aura" aria-hidden="true"></span>
      <span class="actor-gesture-line" aria-hidden="true"></span>
      <span class="actor-figure" aria-hidden="true"></span>
      <span class="actor-nameplate"><strong>${uiSafe(meta.name)}</strong><small>${uiSafe(role)} · ${emotionLabel(emotion)} / ${actionLabel(action)}</small></span>
      <span class="actor-emotion-badge">${emotionLabel(emotion)}</span>
      <span class="actor-action-badge">${drama ? dramaLabel(drama) : actionLabel(action)}</span>
      ${actorStageLabel({...actor, emotion}, meta, active)}
    </button>`;
  }).join('');
  document.querySelectorAll('[data-stage-actor]').forEach(btn=>{
    btn.onclick=()=>{
      const name = btn.dataset.stageActor;
      btn.classList.add('peek');
      clearTimeout(btn._peekTimer);
      btn._peekTimer = setTimeout(()=>btn.classList.remove('peek'), 1200);
      showCharacterInteraction(name);
    };
  });
}

const cameraModes = ['wide','medium','close','insert','impact','black','split'];
const cameraModeLabels = {
  wide:['WIDE','场景远景'],
  medium:['MEDIUM','人物中景'],
  close:['CLOSE','角色近景'],
  insert:['INSERT','物件特写'],
  impact:['IMPACT','冲击镜头'],
  black:['BLACK','黑场字幕'],
  split:['SPLIT','对峙镜头']
};
const sceneCameraMap = {
  city:'wide', store:'medium', meeting:'split', office:'medium', court:'split',
  hospital:'wide', dock:'wide', court2:'split', archive:'medium', rooftop:'wide', court3:'split'
};
let cameraBaseMode = 'wide';
let cameraMomentUntil = 0;
let cameraRestoreTimer = null;
let cameraCaptionTimer = null;
function clearCameraClasses(el){
  cameraModes.forEach(m=>el.classList.remove(`camera-${m}`));
  el.classList.remove('camera-shake');
}
function applyCamera(mode='wide', label='', opts={}){
  const art = $('locationArt');
  if(!art) return;
  if(!cameraModes.includes(mode)) mode = 'wide';
  clearCameraClasses(art);
  art.classList.add(`camera-${mode}`);
  art.dataset.cameraMode = mode;
  art.dataset.cameraFocus = opts.focus || '';
  if(document.body) document.body.dataset.cameraMode = mode;
  const cap = $('cameraCaption');
  if(cap){
    const [short, fallback] = cameraModeLabels[mode] || cameraModeLabels.wide;
    cap.innerHTML = `<strong>${short}</strong><span>${uiSafe(label || fallback)}</span>`;
    cap.classList.add('show');
    clearTimeout(cameraCaptionTimer);
    cameraCaptionTimer = setTimeout(()=>cap.classList.remove('show'), opts.keepLabel ? 2200 : 1300);
  }
  if(opts.shake){
    art.classList.remove('camera-shake');
    void art.offsetWidth;
    art.classList.add('camera-shake');
  }
}
function setSceneCamera(id){
  if(Date.now() < cameraMomentUntil) return;
  cameraBaseMode = sceneCameraMap[id] || 'wide';
  const s = scenes[id];
  applyCamera(cameraBaseMode, s ? s.name : '场景镜头');
}
function pulseCamera(mode,label,duration=900,opts={}){
  cameraMomentUntil = Date.now() + duration;
  applyCamera(mode,label,{...opts,keepLabel:true});
  clearTimeout(cameraRestoreTimer);
  cameraRestoreTimer = setTimeout(()=>{
    cameraMomentUntil = 0;
    setSceneCamera(state.scene);
  }, duration);
}
function applyDialogueCamera(name, role, text){
  const t = String(text||'');
  if(/我反对|偏见|不是推论|真相|终局|完整责任链|监控黑屏不是故障|乔衡不是终点/.test(t) && t.length <= 96){
    pulseCamera('impact', '关键台词', 900, {shake:true});
    return;
  }
  if(actorMetaMap[name]){
    const courtLike = ['court','court2','court3','rooftop','meeting'].includes(state.scene);
    const e = actorEmotionState[name] && actorEmotionState[name].emotion; pulseCamera(e==='resolve'||e==='anger'?'impact':(courtLike?'split':'close'), `${name} · ${emotionLabel(e||'neutral')}`, e==='resolve'||e==='anger'?850:950, {focus:name, shake:e==='resolve'||e==='anger'});
  }else if(name==='系统'){
    pulseCamera('medium','旁白镜头',650);
  }
}


const missionDefs = [
  {
    caseId:'case1',
    title:'第一案：雨夜证词',
    entry:'city',
    subtitle:'便利店雨夜伤人案',
    unlock:()=>true,
    stages:[
      {id:'case1_arrive', title:'抵达现场', desc:'进入商业区路口，确认雨夜案发区域与最初证据点。', goal:'查看现场环境，锁定监控与轮胎痕迹。', done:()=>visited('city')},
      {id:'case1_clues', title:'现场取证', desc:'收集监控、小票、血迹、轮胎水痕等基础线索。', goal:'至少收集 5 条第一案相关证据。', done:()=>countOwned(['破损监控记录','逆向轮胎水痕','22:13 小票','二次出血痕迹','店内网络异常'])>=5},
      {id:'case1_witness', title:'证人矛盾', desc:'询问苏岚和陈巍，找出黑车、删改指令与伪造订单。', goal:'获得关键证词：黑车、删改指令、伪造订单。', done:()=>hasAny(['未发送语音','店长删改指令']) && has('伪造订单提醒')},
      {id:'case1_chain', title:'组合证据链', desc:'在律所办公室完成第一案三条组合推理。', goal:'完成第一案 3 条推理链。', done:()=>has('组合推理：陈巍不是伏击者')&&has('组合推理：店外黑车袭击')&&has('组合推理：店长与黑车有关')},
      {id:'case1_trial', title:'法庭质证', desc:'进入第一案法庭，提交完整证据链。', goal:'完成第一案真相结局。', done:()=>caseDone('case1')}
    ]
  },
  {
    caseId:'case2',
    title:'第二案：沉默账本',
    entry:'hospital',
    subtitle:'医院账本与旧码头委托链',
    unlock:()=>caseDone('case1'),
    stages:[
      {id:'case2_open', title:'医院入口', desc:'从云港医院开始追踪病历、缴费单和账本第一页。', goal:'获得医院缴费单和护士交班记录。', done:()=>has('医院缴费单')&&has('护士交班记录')},
      {id:'case2_account', title:'账本浮出', desc:'通过护士李娜确认病历中夹带的残缺账本页。', goal:'获得残缺账本页。', done:()=>has('残缺账本页')},
      {id:'case2_dock', title:'旧码头追踪', desc:'前往旧码头仓库，连接黑车、货柜和录音。', goal:'获得码头监控截图、货柜封条和私家侦探录音。', done:()=>has('码头监控截图')&&has('货柜封条')&&has('私家侦探录音')},
      {id:'case2_chain', title:'委托链闭合', desc:'完成第二案医院线索与码头线索的组合推理。', goal:'完成第二案 2 条推理链。', done:()=>has('组合推理：受害人掌握地下账本')&&has('组合推理：幕后委托人浮出')},
      {id:'case2_trial', title:'第二案庭审', desc:'在第二案法庭指出幕后结构。', goal:'完成第二案终局。', done:()=>caseDone('case2')}
    ]
  },
  {
    caseId:'case3',
    title:'第三案：灰塔匿名函',
    entry:'archive',
    subtitle:'匿名函、灰塔资本与终局委托人',
    unlock:()=>caseDone('case2'),
    stages:[
      {id:'case3_archive', title:'档案追查', desc:'在市档案中心追查匿名函、审计 U 盘与董事会日程。', goal:'获得匿名函残页、审计 U 盘、董事会日程。', done:()=>has('匿名函残页')&&has('审计U盘')&&has('董事会日程')},
      {id:'case3_qiao', title:'中间人开口', desc:'让乔衡交代资金来源与最终委托人。', goal:'获得灰塔转账凭证。', done:()=>has('灰塔转账凭证')},
      {id:'case3_rooftop', title:'天台会面', desc:'在金融街天台寻找门禁记录与照片底片。', goal:'获得天台门禁记录和狙击照片底片。', done:()=>has('天台门禁记录')&&has('狙击照片底片')},
      {id:'case3_chain', title:'终局链条', desc:'完成第三案灰塔资本与天台会面的组合推理。', goal:'完成第三案 2 条推理链。', done:()=>has('组合推理：灰塔资本介入灭口')&&has('组合推理：终局委托人锁定')},
      {id:'case3_trial', title:'终局审判', desc:'在第三案法庭提交匿名函证据。', goal:'完成终极结局。', done:()=>caseDone('case3')}
    ]
  }
];
function visited(id){return (state.visitedScenes||[]).includes(id)}
function hasAny(list){return list.some(has)}
function countOwned(list){return list.filter(has).length}
function missionForCase(caseId){return missionDefs.find(m=>m.caseId===caseId)||missionDefs[0]}
function currentMission(){
  const scene = scenes[state.scene];
  const caseId = scene && scene.caseId !== 'hub' ? scene.caseId : state.activeCase || 'case1';
  return missionForCase(caseId);
}
function missionProgress(m){
  const completed = m.stages.filter(s=>s.done()).length;
  const current = m.stages.find(s=>!s.done()) || m.stages[m.stages.length-1];
  return {completed,total:m.stages.length,current,percent:Math.round((completed/m.stages.length)*100)};
}
function allMissionProgress(){
  const total = missionDefs.reduce((n,m)=>n+m.stages.length,0);
  const completed = missionDefs.reduce((n,m)=>n+m.stages.filter(s=>s.done()).length,0);
  return {completed,total,percent:Math.round((completed/total)*100)};
}


const case1FlowGuidanceRules = [
  {id:'intro', title:'第一步：调查画面', body:'画面上的金色热点可以点击。先从路口监控、轮胎水痕和便利店入口开始。', cta:'查看热点', action:()=>state.scene==='city'?showToast('新手提示','点击画面中的金色热点进行调查。'):go('city'), when:()=>visited('city') && state.evidence.length===0},
  {id:'hotspots', title:'热点调查', body:'点击金色热点进行调查。', cta:'继续调查', action:()=>showToast('新手提示','已调查热点会带有 DONE 状态，未调查热点仍可点击。'), when:()=>state.evidence.length<3 && ['city','store'].includes(state.scene)},
  {id:'evidence', title:'证据入档', body:'获得的证据会进入右侧证据包。', cta:'查看证据包', action:()=>showToast('证据包','右侧列表会显示已获得证据与说明。'), when:()=>state.evidence.length>0 && state.evidence.length<2},
  {id:'store', title:'进入便利店', body:'前往便利店，调查血迹与网络异常。', cta:'前往便利店', action:()=>go('store'), when:()=>has('破损监控记录') && has('逆向轮胎水痕') && !has('二次出血痕迹')},
  {id:'sulan', title:'与人物互动', body:'点击苏岚进行互动。', cta:'追问苏岚', action:()=>state.scene==='store'?showCharacterInteraction('苏岚'):go('store'), when:()=>state.scene==='store' && has('店内网络异常') && !has('未发送语音')},
  {id:'meeting', title:'会见陈巍', body:'前往会见室，追问陈巍。', cta:'会见陈巍', action:()=>go('meeting'), when:()=>has('未发送语音') && (!has('匿名来电记录') || !has('袖口机油') || !has('伪造订单提醒'))},
  {id:'puzzle', title:'轻解谜解锁', body:'打开轻解谜，完成“案发时间排序”。', cta:'开始轻解谜', action:()=>startPuzzle('c1_timeline_order'), when:()=>puzzleUnlocked(puzzleDefs.find(p=>p.id==='c1_timeline_order')) && !puzzleSolved('c1_timeline_order')},
  {id:'office', title:'回律所组合推理', body:'回律所证据墙，完成三条组合推理。', cta:'前往律所', action:()=>state.scene==='office'?showDeductionBoard():go('office'), when:()=>has('未发送语音') && has('伪造订单提醒') && !(has('组合推理：陈巍不是伏击者')&&has('组合推理：店外黑车袭击')&&has('组合推理：店长与黑车有关'))},
  {id:'court', title:'进入法庭', body:'进入法庭前，请先完成证据墙组合推理。', cta:'前往法庭', action:()=>case1TruthReady()?go('court'):showDeductionBoard(), when:()=>has('组合推理：陈巍不是伏击者')&&has('组合推理：店外黑车袭击')&&has('组合推理：店长与黑车有关')&&!caseDone('case1')},
  {id:'finish', title:'完成第一案', body:'在法庭完成关键提交与终案推理。', cta:'推进法庭', action:()=>state.scene==='court'?case1CourtClimaxAction(case1CourtBeatState().current.id):go('court'), when:()=>state.scene==='court' && !caseDone('case1')}
];
function case1CurrentGuidance(){
  if(!isCase1DirectorMode()) return null;
  return case1FlowGuidanceRules.find(r=>r.when && r.when()) || null;
}

function focusSidePanelMobile(targetId='taskTracker'){
  const el = $(targetId);
  if(!el) return;
  if(window.matchMedia && window.matchMedia('(max-width: 980px)').matches){
    setTimeout(()=>el.scrollIntoView({behavior:'smooth', block:'start'}), 80);
  }
}

function case1GuidanceAction(id){
  const rule = case1FlowGuidanceRules.find(r=>r.id===id);
  if(rule && rule.action) rule.action();
  if(id==='evidence') focusSidePanelMobile('evidenceList');
  else focusSidePanelMobile('taskTracker');
}

function currentDirectingBeat(){
  if(state.scene==='city') return '雨夜路口 / 商业区调查';
  if(state.scene==='store') return has('未发送语音') ? '苏岚坦白后续' : '便利店现场 / 苏岚询问';
  if(state.scene==='meeting') return has('伪造订单提醒') ? '陈巍会见收束' : '陈巍会见对峙';
  if(state.scene==='hospital') return has('残缺账本页') ? '李娜证词 / 账本页' : '云港医院 / 病历调取';
  if(state.scene==='dock') return has('私家侦探录音') ? '莫野录音 / 委托链' : '旧码头仓库 / 9号货柜';
  if(state.scene==='archive') return has('审计U盘') ? '市档案中心 / 灰塔资料链' : '市档案中心 / 匿名函';
  if(state.scene==='rooftop') return has('狙击照片底片') ? '金融街天台 / 终局证据' : '金融街天台 / 最后会面';
  if(state.scene==='office') return isCase3DirectorMode && isCase3DirectorMode() ? '律所证据墙 / 第三案组合推理' : isCase2DirectorMode && isCase2DirectorMode() ? '律所证据墙 / 第二案组合推理' : '律所证据墙推理';
  if(state.scene==='court3') return caseDone('case3') ? '终局结局收束' : '终审法庭质证';
  if(state.scene==='court2') return caseDone('case2') ? '第二案结局 / 第三案钩子' : '第二案法庭质证';
  if(state.scene==='court') return caseDone('case1') ? '第一案结局收束' : '第一案法庭高潮';
  return '';
}
function renderDirectingBeatCard(){
  const beat=currentDirectingBeat();
  const enabled = (isCase1DirectorMode && isCase1DirectorMode()) || (isCase2DirectorMode && isCase2DirectorMode()) || (isCase3DirectorMode && isCase3DirectorMode());
  if(!beat || !enabled) return '';
  return `<div class="directing-beat-card compact-info-card"><span class="mission-kicker">镜头节拍</span><strong>${beat}</strong></div>`;
}

function renderCase1GuidanceCard(){
  const g = case1CurrentGuidance();
  if(!g) return '';
  return `<div class="case1-guidance-card compact-info-card">
    <div><span class="mission-kicker">下一步</span><h4>${g.title}</h4></div>
    <button class="btn ghost" onclick="handleCase1GuidanceAction('${g.id}')">${g.cta}</button>
  </div>`;
}
function maybeShowFirstRunHint(event){
  if(!state.used) state.used = {};
  const key = `first-run:${event}`;
  if(state.used[key]) return;
  const g = case1CurrentGuidance();
  if(!g) return;
  state.used[key]=true;
  showToast(g.title, g.body);
}

const case1DirectorBeatDefs = [
  {id:'opening', title:'雨夜路口 CG', note:'前往商业区路口。', short:'查看监控与轮胎水痕。', done:()=>visited('city') && (has('破损监控记录') || has('逆向轮胎水痕'))},
  {id:'street', title:'商业区热点调查', note:'完成商业区路口调查。', short:'拿到监控、小票与轮胎水痕。', done:()=>has('破损监控记录') && has('逆向轮胎水痕') && has('22:13 小票')},
  {id:'store', title:'便利店内景调查', note:'完成便利店现场调查。', short:'拿到二次出血痕迹与店内网络异常。', done:()=>has('二次出血痕迹') && has('店内网络异常')},
  {id:'voice', title:'苏岚人物交互与语音 CG', note:'追问苏岚。', short:'拿到未发送语音。', done:()=>has('未发送语音')},
  {id:'meeting', title:'陈巍会见对峙', note:'前往会见室。', short:'拿到匿名来电记录、袖口机油、伪造订单提醒。', done:()=>has('匿名来电记录') && has('袖口机油') && has('伪造订单提醒')},
  {id:'orderPuzzle', title:'证据排序轻谜题', note:'打开轻解谜。', short:'完成“案发时间排序”。', done:()=>puzzleSolved('c1_timeline_order')},
  {id:'office', title:'律所证据墙推理', note:'返回律所证据墙。', short:'完成第一案 3 条组合推理。', done:()=>has('组合推理：陈巍不是伏击者') && has('组合推理：店外黑车袭击') && has('组合推理：店长与黑车有关')},
  {id:'courtPrep', title:'法庭质证与关键提交', note:'进入第一案法庭。', short:'完成关键证据提交。', done:()=>puzzleSolved('c1_submit_blackcar') || state.scene==='court' || caseDone('case1')},
  {id:'ending', title:'第一案结局演出', note:'完成第一案结局。', short:'完成第一案真相结局。', done:()=>caseDone('case1')}
];
function isCase1DirectorMode(){ return (state.activeCase||'case1')==='case1' || ['city','store','meeting','court'].includes(state.scene) || (state.scene==='office' && (state.activeCase||'case1')==='case1'); }
function case1DirectorBeatState(){
  const beats = case1DirectorBeatDefs.map((beat, idx)=>({
    ...beat,
    index: idx+1,
    done: !!beat.done()
  }));
  const completed = beats.filter(b=>b.done).length;
  const current = beats.find(b=>!b.done) || beats[beats.length-1];
  return {beats, completed, total:beats.length, current};
}
function case1DirectorBeatAction(beatId){
  switch(beatId){
    case 'opening':
    case 'street':
      if(state.scene!=='city') go('city');
      else showToast('导演提示','先查看路口监控与轮胎水痕。');
      break;
    case 'store':
    case 'voice':
      if(state.scene!=='store') go('store');
      else showToast('导演提示','继续调查店内，追问苏岚。');
      break;
    case 'meeting':
      if(state.scene!=='meeting') go('meeting');
      else showToast('导演提示','在会见室继续追问陈巍。');
      break;
    case 'orderPuzzle':
      startPuzzle('c1_timeline_order');
      break;
    case 'office':
      if(state.scene!=='office') go('office');
      else showDeductionBoard();
      break;
    case 'courtPrep':
      if(!puzzleSolved('c1_submit_blackcar') && puzzleUnlocked(puzzleDefs.find(p=>p.id==='c1_submit_blackcar'))){
        startPuzzle('c1_submit_blackcar');
      }else if(state.scene!=='court'){
        go('court');
      }else{
        showToast('导演提示','在法庭中提交关键证据并推进终案推理。');
      }
      break;
    case 'ending':
      if(state.scene!=='court') go('court');
      else showToast('导演提示','完成终案推理，触发第一案结局。');
      break;
  }
}
function directorBeatButtonLabel(beatId){
  return ({opening:'前往路口',street:'继续外景调查',store:'进入便利店',voice:'追问苏岚',meeting:'会见陈巍',orderPuzzle:'开始排序谜题',office:'回到证据墙',courtPrep:'推进法庭阶段',ending:'完成第一案'})[beatId] || '推进当前段落';
}
function renderCase1DirectorCard(){
  if(!isCase1DirectorMode()) return '';
  const info = case1DirectorBeatState();
  const beat = info.current;
  const percent = Math.round((info.completed/info.total)*100);
  return `<div class="director-card compact-flow-card">
    <div class="director-card-head"><div><span class="mission-kicker">导演流程</span><h4>${beat.title}</h4></div><strong>${percent}%</strong></div>
    <div class="mission-progress director-progress"><span style="width:${percent}%"></span></div>
    <button class="btn ghost director-jump" onclick="handleDirectorBeatAction('${beat.id}')">${directorBeatButtonLabel(beat.id)}</button>
  </div>`;
}
function maybeTriggerCase1DirectorCue(){
  if(!isCase1DirectorMode()) return;
  const info = case1DirectorBeatState();
  if(!info.current) return;
  if(!state.used) state.used = {};
  const key = `director-cue:${info.current.id}`;
  if(state.used[key]) return;
  state.used[key] = true;
  showToast('导演提示', info.current.title);
}

const case1CourtBeatDefs = [
  {id:'open', title:'法庭开场', short:'进入法庭，让场景从调查切到对抗。', done:()=>visited('court')},
  {id:'timeline', title:'时间线核对', short:'完成“案发时间排序”。', done:()=>puzzleSolved('c1_timeline_order')},
  {id:'witness', title:'证词核对', short:'核对苏岚证词与网络异常。', done:()=>puzzleSolved('c1_contradiction_sulan') || (has('店内网络异常') && has('未发送语音'))},
  {id:'blackcar', title:'黑车证据', short:'提交黑车车牌残片。', done:()=>puzzleSolved('c1_submit_blackcar') || has('黑车车牌残片')},
  {id:'chain', title:'组合推理', short:'完成第一案三条组合推理。', done:()=>has('组合推理：陈巍不是伏击者') && has('组合推理：店外黑车袭击') && has('组合推理：店长与黑车有关')},
  {id:'verdict', title:'终案推理', short:'选择核心证据链。', done:()=>caseDone('case1')}
];
function case1CourtBeatState(){
  const beats = case1CourtBeatDefs.map((b,i)=>({...b,index:i+1,done:!!b.done()}));
  const completed = beats.filter(b=>b.done).length;
  const current = beats.find(b=>!b.done) || beats[beats.length-1];
  return {beats,completed,total:beats.length,current,percent:Math.round((completed/beats.length)*100)};
}
function case1CourtClimaxAction(beatId){
  switch(beatId){
    case 'open':
      applyCase1DirectingCue('court_open', {toast:false});
      if(state.scene!=='court') go('court');
      else showCgIllustration('case1_court_open');
      break;
    case 'timeline':
      if(puzzleUnlocked(puzzleDefs.find(p=>p.id==='c1_timeline_order'))) startPuzzle('c1_timeline_order');
      else showToast('证据不足','需要先获得 22:13 小票、破损监控记录、匿名来电记录。');
      break;
    case 'witness':
      if(puzzleUnlocked(puzzleDefs.find(p=>p.id==='c1_contradiction_sulan'))) startPuzzle('c1_contradiction_sulan');
      else if(state.scene!=='store') go('store');
      else showToast('法庭准备','追问苏岚，调查店内网络异常。');
      break;
    case 'blackcar':
      applyCase1DirectingCue('court_submit', {toast:false});
      if(puzzleUnlocked(puzzleDefs.find(p=>p.id==='c1_submit_blackcar'))) startPuzzle('c1_submit_blackcar');
      else if(state.scene!=='city') go('city');
      else showToast('法庭准备','取得未发送语音后，调查排水沟反光物。');
      break;
    case 'chain':
      if(state.scene!=='office') go('office');
      else showDeductionBoard();
      break;
    case 'verdict':
      applyCase1DirectingCue('qiao_break', {toast:false});
      if(state.scene!=='court') go('court');
      else startDialogue('final1');
      break;
  }
}
function courtBeatButtonLabel(beatId){
  return ({open:'进入法庭',timeline:'验证时间线',witness:'追问证词矛盾',blackcar:'提交黑车证据',chain:'整理证据链',verdict:'开始终案推理'})[beatId] || '推进法庭高潮';
}
function renderCase1CourtClimaxCard(){
  if(state.scene!=='court' && !caseDone('case1')) return '';
  const info = case1CourtBeatState();
  const beat = info.current;
  return `<div class="court-climax-card compact-flow-card">
    <div class="court-climax-head"><div><span class="mission-kicker">法庭高潮</span><h4>${beat.title}</h4></div><strong>${info.percent}%</strong></div>
    <div class="mission-progress court-progress"><span style="width:${info.percent}%"></span></div>
    <button class="btn gold court-jump" onclick="handleCourtClimaxAction('${beat.id}')">${courtBeatButtonLabel(beat.id)}</button>
  </div>`;
}
function case1TruthReady(){
  return state.deductions.includes('组合推理：陈巍不是伏击者') && state.deductions.includes('组合推理：店外黑车袭击') && state.deductions.includes('组合推理：店长与黑车有关') && state.truth>=12;
}


const case1DirectingCues = {
  opening:{scene:'city', camera:'wide', focus:'陆沉', drama:{'陆沉':'observe'}, action:{'陆沉':'think'}, toast:'雨夜路口开场'},
  city_camera:{scene:'city', camera:'insert', focus:'破损监控记录', drama:{'陆沉':'observe'}, action:{'陆沉':'think'}, toast:'监控记录'},
  city_tire:{scene:'city', camera:'insert', focus:'逆向轮胎水痕', drama:{'陆沉':'observe'}, action:{'陆沉':'think'}, toast:'轮胎水痕'},
  city_plate:{scene:'city', camera:'insert', focus:'黑车车牌残片', drama:{'陆沉':'observe'}, action:{'陆沉':'point'}, toast:'车牌残片'},
  store_entry:{scene:'store', camera:'medium', focus:'苏岚', drama:{'苏岚':'fear','陆沉':'observe'}, action:{'苏岚':'lowerHead','陆沉':'think'}, toast:'便利店现场'},
  sulan_voice:{scene:'store', camera:'close', focus:'苏岚', drama:{'苏岚':'waver','陆沉':'observe'}, action:{'苏岚':'lowerHead','陆沉':'think'}, toast:'未发送语音'},
  sulan_confess:{scene:'store', camera:'close', focus:'苏岚', drama:{'苏岚':'confess','陆沉':'observe'}, action:{'苏岚':'speak','陆沉':'think'}, toast:'苏岚坦白'},
  meeting_entry:{scene:'meeting', camera:'medium', focus:'陈巍', drama:{'陈巍':'wronged','陆沉':'observe'}, action:{'陈巍':'tense','陆沉':'think'}, toast:'会见室对峙'},
  chenwei_call:{scene:'meeting', camera:'close', focus:'陈巍', drama:{'陈巍':'wronged','陆沉':'pressure'}, action:{'陈巍':'stepIn','陆沉':'point'}, toast:'匿名来电记录'},
  chenwei_break:{scene:'meeting', camera:'impact', focus:'陈巍', drama:{'陈巍':'breakdown','陆沉':'pressure'}, action:{'陈巍':'stepBack','陆沉':'point'}, toast:'陈巍动摇'},
  office_wall:{scene:'office', camera:'insert', focus:'证据墙', drama:{'陆沉':'observe'}, action:{'陆沉':'think'}, toast:'律所证据墙'},
  office_chain:{scene:'office', camera:'insert', focus:'组合推理', drama:{'陆沉':'counter'}, action:{'陆沉':'point'}, toast:'组合推理'},
  court_open:{scene:'court', camera:'wide', focus:'陆沉', drama:{'陆沉':'observe','乔衡':'calm'}, action:{'陆沉':'think','乔衡':'tense'}, toast:'法庭开场'},
  court_submit:{scene:'court', camera:'insert', focus:'关键证据提交', drama:{'陆沉':'counter','乔衡':'calm'}, action:{'陆沉':'point','乔衡':'tense'}, toast:'关键证据提交'},
  qiao_break:{scene:'court', camera:'impact', focus:'乔衡', drama:{'乔衡':'break','陆沉':'pressure'}, action:{'乔衡':'stepBack','陆沉':'point'}, toast:'乔衡破防'},
  ending:{scene:'court', camera:'black', focus:'第一案结局', drama:{'苏岚':'confess','陈巍':'wronged','乔衡':'evade','陆沉':'counter'}, action:{'苏岚':'speak','陈巍':'lowerHead','乔衡':'stepBack','陆沉':'think'}, toast:'第一案结局'}
};
function applyCase1DirectingCue(id, opts={}){
  const cue = case1DirectingCues[id];
  if(!cue) return;
  const sceneMatch = !cue.scene || cue.scene === state.scene;
  if(!sceneMatch && !opts.force) return;
  Object.entries(cue.drama||{}).forEach(([name,drama])=>setActorDramaticState(name, drama, `directing:${id}`));
  Object.entries(cue.action||{}).forEach(([name,action])=>setActorAction(name, action, `directing:${id}`));
  if(typeof pulseCamera === 'function'){
    pulseCamera(cue.camera || 'medium', cue.focus || cue.toast || '', opts.duration || 980, {focus:cue.focus});
  }
  if(opts.toast !== false && cue.toast) showToast('镜头', cue.toast);
  renderActorStage();
}
function cueForEvidence(name){
  return {
    '破损监控记录':'city_camera',
    '逆向轮胎水痕':'city_tire',
    '黑车车牌残片':'city_plate',
    '未发送语音':'sulan_voice',
    '店内网络异常':'sulan_voice',
    '店长删改指令':'sulan_confess',
    '匿名来电记录':'chenwei_call',
    '袖口机油':'chenwei_call',
    '伪造订单提醒':'chenwei_break',
    '组合推理：陈巍不是伏击者':'office_chain',
    '组合推理：店外黑车袭击':'office_chain',
    '组合推理：店长与黑车有关':'office_chain'
  }[name] || '';
}

function setCase1CourtDrama(beat='open'){
  if(beat==='open'){setActorDramaticState('陆沉','observe','court');setActorDramaticState('乔衡','calm','court');}
  if(beat==='timeline'||beat==='blackcar'){setActorDramaticState('陆沉','counter','court');setActorDramaticState('乔衡','calm','court');applyCase1DirectingCue('court_submit',{toast:false});}
  if(beat==='break'||beat==='truth'){setActorDramaticState('陆沉','pressure','court');setActorDramaticState('乔衡','break','court');applyCase1DirectingCue('qiao_break',{toast:false});}
  if(beat==='ending'){setActorDramaticState('苏岚','confess','ending');setActorDramaticState('陈巍','wronged','ending');setActorDramaticState('乔衡','evade','ending');}
}

function queueCase1CourtClimaxCue(kind){
  if(kind==='open') return queueCgIllustration('case1_court_open', 320, false);
  if(kind==='climax') return queueCgIllustration('case1_court_climax', 180, false);
  if(kind==='truth') return queueCgIllustration('case1_truth_reveal', 520, false);
  if(kind==='hook') return queueCgIllustration('case1_next_case_hook', 1500, false);
}
function case1EndingBody(){
  return `<div class="case1-ending-showcase">
    <div class="case1-ending-visual" style="background-image:url('./assets/cg_case1_arrival.jpg')"><span>CASE CLOSED</span></div>
    <div class="case1-ending-copy">
      <p>你提交了完整证据链，陈巍暂获释放。</p>
      <p>监控黑屏、伪造订单、删改指令与黑车残片被写入法庭记录。</p>
      <p><strong>乔衡低声说：</strong>账本不在我手里。</p>
      <button class="btn gold" onclick="goNextCase()">进入第二案：沉默账本</button>
    </div>
  </div>`;
}


const case2GuidanceRules = [
  {id:'case2-hospital', title:'云港医院调查', cta:'前往医院', action:()=>go('hospital'), when:()=>isCase2DirectorMode() && !has('医院缴费单')},
  {id:'case2-lina', title:'询问李娜', cta:'询问李娜', action:()=>state.scene==='hospital'?showCharacterInteraction('李娜'):go('hospital'), when:()=>isCase2DirectorMode() && has('护士交班记录') && !has('残缺账本页')},
  {id:'case2-dock', title:'前往旧码头', cta:'前往旧码头', action:()=>go('dock'), when:()=>isCase2DirectorMode() && has('残缺账本页') && (!has('码头监控截图') || !has('货柜封条'))},
  {id:'case2-moye', title:'会见莫野', cta:'会见莫野', action:()=>state.scene==='dock'?showCharacterInteraction('莫野'):go('dock'), when:()=>isCase2DirectorMode() && has('货柜封条') && !has('私家侦探录音')},
  {id:'case2-puzzle', title:'整理追踪路径', cta:'开始轻解谜', action:()=>startPuzzle('c2_route_chain'), when:()=>isCase2DirectorMode() && puzzleUnlocked(puzzleDefs.find(p=>p.id==='c2_route_chain')) && !puzzleSolved('c2_route_chain')},
  {id:'case2-office', title:'回律所组合推理', cta:'打开证据墙', action:()=>state.scene==='office'?showDeductionBoard():go('office'), when:()=>isCase2DirectorMode() && has('私家侦探录音') && !(has('组合推理：受害人掌握地下账本') && has('组合推理：幕后委托人浮出'))},
  {id:'case2-court', title:'进入第二案法庭', cta:'进入法庭', action:()=>go('court2'), when:()=>isCase2DirectorMode() && has('组合推理：受害人掌握地下账本') && has('组合推理：幕后委托人浮出') && !caseDone('case2')}
];
function isCase2DirectorMode(){
  return (state.activeCase||'case1')==='case2' || ['hospital','dock','court2'].includes(state.scene) || (state.scene==='office' && (state.activeCase||'case1')==='case2');
}
function case2CurrentGuidance(){
  return case2GuidanceRules.find(r=>r.when && r.when());
}
function handleCase2GuidanceAction(id){
  const rule = case2GuidanceRules.find(r=>r.id===id);
  if(rule && rule.action) rule.action();
}
const case2DirectorBeatDefs = [
  {id:'case2_open', title:'第二案开场钩子', note:'进入云港医院。', short:'调取缴费记录与交班记录。', done:()=>visited('hospital')},
  {id:'hospital', title:'云港医院调查', note:'调查缴费单和护士交班记录。', short:'获得医院缴费单、护士交班记录。', done:()=>has('医院缴费单') && has('护士交班记录')},
  {id:'lina', title:'李娜人物交互', note:'询问病历去向。', short:'获得残缺账本页。', done:()=>has('残缺账本页')},
  {id:'dock', title:'旧码头仓库调查', note:'追查 9 号仓库。', short:'获得码头监控截图、货柜封条。', done:()=>has('码头监控截图') && has('货柜封条')},
  {id:'moye', title:'莫野人物交互', note:'取得私家侦探录音。', short:'获得私家侦探录音。', done:()=>has('私家侦探录音')},
  {id:'puzzle', title:'第二案轻解谜', note:'整理账本追踪路径。', short:'完成“账本追踪路径”。', done:()=>puzzleSolved('c2_route_chain')},
  {id:'office', title:'律所证据墙推理', note:'完成第二案组合推理。', short:'完成 2 条第二案推理链。', done:()=>has('组合推理：受害人掌握地下账本') && has('组合推理：幕后委托人浮出')},
  {id:'court2', title:'第二案法庭质证', note:'提交私家侦探录音。', short:'完成“锁定幕后委托链”。', done:()=>puzzleSolved('c2_submit_recording') || caseDone('case2')},
  {id:'case2_end', title:'第二案结局与第三案钩子', note:'完成第二案结局。', short:'完成第二案终局。', done:()=>caseDone('case2')}
];
function case2DirectorBeatState(){
  const beats = case2DirectorBeatDefs.map((beat,idx)=>({...beat,index:idx+1,done:!!beat.done()}));
  const completed = beats.filter(b=>b.done).length;
  const current = beats.find(b=>!b.done) || beats[beats.length-1];
  return {beats, completed, total:beats.length, current, percent:Math.round((completed/beats.length)*100)};
}
function case2DirectorBeatAction(beatId){
  switch(beatId){
    case 'case2_open':
    case 'hospital':
      if(state.scene!=='hospital') go('hospital');
      else showToast('第二案提示','调查缴费记录与交班记录。');
      break;
    case 'lina':
      if(state.scene!=='hospital') go('hospital');
      else showCharacterInteraction('李娜');
      break;
    case 'dock':
      if(state.scene!=='dock') go('dock');
      else showToast('第二案提示','调查仓库监控与 9 号货柜。');
      break;
    case 'moye':
      if(state.scene!=='dock') go('dock');
      else showCharacterInteraction('莫野');
      break;
    case 'puzzle':
      startPuzzle('c2_route_chain');
      break;
    case 'office':
      if(state.scene!=='office') go('office');
      else showDeductionBoard();
      break;
    case 'court2':
      if(state.scene!=='court2') go('court2');
      else startPuzzle('c2_submit_recording');
      break;
    case 'case2_end':
      if(state.scene!=='court2') go('court2');
      else startDialogue('final2');
      break;
  }
}
function case2DirectorBeatButtonLabel(id){
  return {
    case2_open:'进入医院',
    hospital:'调查医院',
    lina:'询问李娜',
    dock:'前往码头',
    moye:'会见莫野',
    puzzle:'整理路径',
    office:'打开证据墙',
    court2:'提交录音',
    case2_end:'终案推理'
  }[id] || '继续';
}
function handleCase2DirectorBeatAction(id){case2DirectorBeatAction(id)}
function renderCase2DirectorCard(){
  if(!isCase2DirectorMode()) return '';
  const info = case2DirectorBeatState();
  const beat = info.current;
  return `<div class="director-card compact-flow-card case2-director-card">
    <div class="director-card-head"><div><span class="mission-kicker">第二案导演流程</span><h4>${beat.title}</h4></div><strong>${info.percent}%</strong></div>
    <div class="mission-progress director-progress"><span style="width:${info.percent}%"></span></div>
    <button class="btn gold director-jump" onclick="handleCase2DirectorBeatAction('${beat.id}')">${case2DirectorBeatButtonLabel(beat.id)}</button>
  </div>`;
}
function renderCase2GuidanceCard(){
  const g = case2CurrentGuidance();
  if(!g) return '';
  return `<div class="case1-guidance-card compact-info-card case2-guidance-card">
    <div><span class="mission-kicker">第二案下一步</span><h4>${g.title}</h4></div>
    <button class="btn ghost" onclick="handleCase2GuidanceAction('${g.id}')">${g.cta}</button>
  </div>`;
}

function maybeTriggerCase2DirectorCue(){
  if(!isCase2DirectorMode()) return;
  const info = case2DirectorBeatState();
  if(!info.current) return;
  if(info.current.id==='court2' && state.scene==='court2') applyCase2DirectingCue('case2_court_open',{toast:false});
  if(info.current.id==='case2_end' && state.scene==='court2') applyCase2DirectingCue('case2_ending',{toast:false});
}

function renderCase2QuickAction(){
  if(!isCase2DirectorMode()) return '';
  const g = case2CurrentGuidance();
  if(g) return `<button class="btn gold compact-next-btn" onclick="handleCase2GuidanceAction('${g.id}')">${g.cta}</button>`;
  const info = case2DirectorBeatState();
  if(info.current && !caseDone('case2')) return `<button class="btn gold compact-next-btn" onclick="handleCase2DirectorBeatAction('${info.current.id}')">${case2DirectorBeatButtonLabel(info.current.id)}</button>`;
  return '';
}
function renderCaseQuickAction(){
  if(isCase3DirectorMode()) return renderCase3QuickAction();
  if(isCase2DirectorMode()) return renderCase2QuickAction();
  return renderCase1QuickAction();
}
const case2DirectingCues = {
  hospital_entry:{scene:'hospital', camera:'wide', focus:'云港医院', emotion:{'李娜':'sad','陆沉':'serious','韩亦':'serious'}, action:{'李娜':'lowerHead','陆沉':'think','韩亦':'think'}, toast:'云港医院'},
  hospital_bill:{scene:'hospital', camera:'insert', focus:'医院缴费单', emotion:{'李娜':'sad','陆沉':'serious'}, action:{'李娜':'lowerHead','陆沉':'think'}, toast:'缴费单据'},
  hospital_log:{scene:'hospital', camera:'insert', focus:'护士交班记录', emotion:{'李娜':'shock','陆沉':'serious'}, action:{'李娜':'tense','陆沉':'think'}, toast:'交班记录'},
  lina_ledger:{scene:'hospital', camera:'close', focus:'李娜', emotion:{'李娜':'shock','陆沉':'serious'}, action:{'李娜':'speak','陆沉':'think'}, toast:'残缺账本页'},
  dock_entry:{scene:'dock', camera:'wide', focus:'旧码头仓库', emotion:{'莫野':'serious','陆沉':'serious'}, action:{'莫野':'think','陆沉':'think'}, toast:'旧码头仓库'},
  dock_camera:{scene:'dock', camera:'insert', focus:'码头监控截图', emotion:{'莫野':'serious','陆沉':'serious'}, action:{'莫野':'think','陆沉':'point'}, toast:'监控截图'},
  dock_seal:{scene:'dock', camera:'insert', focus:'货柜封条', emotion:{'莫野':'serious','陆沉':'serious'}, action:{'莫野':'think','陆沉':'point'}, toast:'货柜封条'},
  moye_recording:{scene:'dock', camera:'close', focus:'莫野', emotion:{'莫野':'serious','陆沉':'serious'}, action:{'莫野':'speak','陆沉':'think'}, toast:'私家侦探录音'},
  case2_office:{scene:'office', camera:'insert', focus:'第二案组合推理', emotion:{'陆沉':'resolve','韩亦':'serious'}, action:{'陆沉':'point','韩亦':'think'}, toast:'第二案组合推理'},
  case2_court_open:{scene:'court2', camera:'wide', focus:'第二案法庭', emotion:{'陆沉':'resolve','莫野':'serious','韩亦':'serious'}, action:{'陆沉':'think','莫野':'tense','韩亦':'think'}, toast:'第二案法庭'},
  case2_submit:{scene:'court2', camera:'insert', focus:'私家侦探录音', emotion:{'陆沉':'resolve','莫野':'serious'}, action:{'陆沉':'point','莫野':'speak'}, toast:'私家侦探录音'},
  case2_ending:{scene:'court2', camera:'black', focus:'第三案钩子', emotion:{'陆沉':'resolve','韩亦':'serious'}, action:{'陆沉':'think','韩亦':'speak'}, toast:'第三案线索'}
};

function case2DramaForCue(id){
  return {
    hospital_entry:{'李娜':'hesitate','陆沉':'investigate','韩亦':'record'},
    hospital_bill:{'李娜':'hesitate','陆沉':'investigate','韩亦':'record'},
    hospital_log:{'李娜':'fear','陆沉':'investigate','韩亦':'record'},
    lina_ledger:{'李娜':'testify','陆沉':'investigate','韩亦':'record'},
    dock_entry:{'莫野':'observe','陆沉':'investigate','韩亦':'route'},
    dock_camera:{'莫野':'guard','陆沉':'investigate','韩亦':'route'},
    dock_seal:{'莫野':'guard','陆沉':'archive','韩亦':'route'},
    moye_recording:{'莫野':'recording','陆沉':'chain','韩亦':'route'},
    case2_office:{'陆沉':'chain','韩亦':'route'},
    case2_court_open:{'陆沉':'interrogate','莫野':'guard','韩亦':'courtAssist'},
    case2_submit:{'陆沉':'interrogate','莫野':'recording','韩亦':'courtAssist'},
    case2_ending:{'陆沉':'chain','韩亦':'courtAssist','莫野':'recording'}
  }[id] || {};
}
function case2CgForCue(id){
  return {
    hospital_entry:'case2_hospital_lina',
    hospital_bill:'case2_hospital_lina',
    hospital_log:'case2_hospital_lina',
    lina_ledger:'case2_lina_ledger',
    dock_entry:'case2_dock_moye',
    dock_camera:'case2_dock_moye',
    dock_seal:'case2_dock_moye',
    moye_recording:'case2_dock_moye',
    case2_office:'case2_office_chain',
    case2_court_open:'case2_court_recording',
    case2_submit:'case2_court_recording',
    case2_ending:'case2_next_hook'
  }[id] || '';
}

function applyCase2DirectingCue(id, opts={}){
  const cue = case2DirectingCues[id];
  if(!cue) return;
  const sceneMatch = !cue.scene || cue.scene === state.scene;
  if(!sceneMatch && !opts.force) return;
  Object.entries(cue.emotion||{}).forEach(([name,emotion])=>setActorEmotion(name, emotion, `case2:${id}`));
  Object.entries(case2DramaForCue(id)).forEach(([name,drama])=>setActorDramaticState(name, drama, `case2:${id}`));
  Object.entries(cue.action||{}).forEach(([name,action])=>setActorAction(name, action, `case2:${id}`));
  if(typeof pulseCamera === 'function') pulseCamera(cue.camera || 'medium', cue.focus || cue.toast || '', opts.duration || 920, {focus:cue.focus});
  if(opts.toast !== false && cue.toast) showToast('第二案镜头', cue.toast);
  const cgId = case2CgForCue(id); if(opts.cg !== false && cgId) queueCgIllustration(cgId, opts.cgDelay || 380, false);
  renderActorStage();
}
function case2CueForEvidence(name){
  return {
    '医院缴费单':'hospital_bill',
    '护士交班记录':'hospital_log',
    '残缺账本页':'lina_ledger',
    '码头监控截图':'dock_camera',
    '货柜封条':'dock_seal',
    '私家侦探录音':'moye_recording',
    '组合推理：受害人掌握地下账本':'case2_office',
    '组合推理：幕后委托人浮出':'case2_office'
  }[name] || '';
}
function applyDirectorCue(id, opts={}){
  if(case1DirectingCues && case1DirectingCues[id]) return applyCase1DirectingCue(id, opts);
  if(case2DirectingCues && case2DirectingCues[id]) return applyCase2DirectingCue(id, opts);
  if(case3DirectingCues && case3DirectingCues[id]) return applyCase3DirectingCue(id, opts);
}
function applyCase2SceneEntryCue(id){
  const map = {hospital:'hospital_entry', dock:'dock_entry', court2:'case2_court_open'};
  if(map[id]) setTimeout(()=>applyCase2DirectingCue(map[id], {toast:false, duration:820}), 240);
}


const case3GuidanceRules = [
  {id:'case3-archive', title:'市档案中心调查', cta:'前往档案中心', action:()=>go('archive'), when:()=>isCase3DirectorMode() && !has('匿名函残页')},
  {id:'case3-usb', title:'提取审计资料', cta:'检查审计 U 盘', action:()=>go('archive'), when:()=>isCase3DirectorMode() && has('匿名函残页') && !has('审计U盘')},
  {id:'case3-qiao', title:'追问乔衡', cta:'会见乔衡', action:()=>['archive','rooftop'].includes(state.scene)?showCharacterInteraction('乔衡'):go('archive'), when:()=>isCase3DirectorMode() && has('审计U盘') && !has('灰塔转账凭证')},
  {id:'case3-rooftop', title:'金融街天台调查', cta:'前往天台', action:()=>go('rooftop'), when:()=>isCase3DirectorMode() && has('审计U盘') && (!has('天台门禁记录') || !has('狙击照片底片'))},
  {id:'case3-puzzle', title:'提交灰塔资金证据', cta:'开始轻解谜', action:()=>startPuzzle('c3_submit_greytower'), when:()=>isCase3DirectorMode() && puzzleUnlocked(puzzleDefs.find(p=>p.id==='c3_submit_greytower')) && !puzzleSolved('c3_submit_greytower')},
  {id:'case3-office', title:'回律所组合推理', cta:'打开证据墙', action:()=>state.scene==='office'?showDeductionBoard():go('office'), when:()=>isCase3DirectorMode() && has('灰塔转账凭证') && !(has('组合推理：灰塔资本介入灭口') && has('组合推理：终局委托人锁定'))},
  {id:'case3-court', title:'进入终审法庭', cta:'进入终审', action:()=>go('court3'), when:()=>isCase3DirectorMode() && has('组合推理：灰塔资本介入灭口') && has('组合推理：终局委托人锁定') && !caseDone('case3')}
];
function isCase3DirectorMode(){
  return (state.activeCase||'case1')==='case3' || ['archive','rooftop','court3'].includes(state.scene) || (state.scene==='office' && (state.activeCase||'case1')==='case3');
}
function case3CurrentGuidance(){
  return case3GuidanceRules.find(r=>r.when && r.when());
}
function handleCase3GuidanceAction(id){
  const rule = case3GuidanceRules.find(r=>r.id===id);
  if(rule && rule.action) rule.action();
}
const case3DirectorBeatDefs = [
  {id:'case3_open', title:'第三案开场钩子', note:'进入市档案中心。', short:'开始档案调查。', done:()=>visited('archive')},
  {id:'archive', title:'市档案中心调查', note:'取得匿名函、审计 U 盘和董事会日程。', short:'获得 3 条档案中心证据。', done:()=>has('匿名函残页') && has('审计U盘') && has('董事会日程')},
  {id:'qiao', title:'乔衡人物交互', note:'追问灰塔转账凭证。', short:'获得灰塔转账凭证。', done:()=>has('灰塔转账凭证')},
  {id:'rooftop', title:'金融街天台调查', note:'取得天台门禁记录与照片底片。', short:'获得门禁记录和照片底片。', done:()=>has('天台门禁记录') && has('狙击照片底片')},
  {id:'puzzle', title:'第三案轻解谜', note:'提交灰塔资金证据。', short:'完成“提交灰塔资金证据”。', done:()=>puzzleSolved('c3_submit_greytower')},
  {id:'office', title:'律所终局推理', note:'完成第三案组合推理。', short:'完成 2 条第三案推理链。', done:()=>has('组合推理：灰塔资本介入灭口') && has('组合推理：终局委托人锁定')},
  {id:'court3', title:'终审法庭质证', note:'提交终局证据链。', short:'进入第三案法庭并完成终案推理。', done:()=>caseDone('case3')},
  {id:'ending', title:'终局结局演出', note:'完成终极结局。', short:'完成终局。', done:()=>caseDone('case3')}
];
function case3DirectorBeatState(){
  const beats = case3DirectorBeatDefs.map((beat,idx)=>({...beat,index:idx+1,done:!!beat.done()}));
  const completed = beats.filter(b=>b.done).length;
  const current = beats.find(b=>!b.done) || beats[beats.length-1];
  return {beats, completed, total:beats.length, current, percent:Math.round((completed/beats.length)*100)};
}
function case3DirectorBeatAction(beatId){
  switch(beatId){
    case 'case3_open':
    case 'archive':
      if(state.scene!=='archive') go('archive');
      else showToast('第三案提示','检查匿名函、审计 U 盘和董事会日程。');
      break;
    case 'qiao':
      if(!['archive','rooftop'].includes(state.scene)) go('archive');
      else showCharacterInteraction('乔衡');
      break;
    case 'rooftop':
      if(state.scene!=='rooftop') go('rooftop');
      else showToast('第三案提示','调查天台门禁记录与照片底片。');
      break;
    case 'puzzle':
      startPuzzle('c3_submit_greytower');
      break;
    case 'office':
      if(state.scene!=='office') go('office');
      else showDeductionBoard();
      break;
    case 'court3':
    case 'ending':
      if(state.scene!=='court3') go('court3');
      else startDialogue('final3');
      break;
  }
}
function case3DirectorBeatButtonLabel(id){
  return {
    case3_open:'进入档案中心',
    archive:'调查档案',
    qiao:'追问乔衡',
    rooftop:'前往天台',
    puzzle:'提交资金证据',
    office:'打开证据墙',
    court3:'终审质证',
    ending:'终局推理'
  }[id] || '继续';
}
function handleCase3DirectorBeatAction(id){case3DirectorBeatAction(id)}
function renderCase3DirectorCard(){
  if(!isCase3DirectorMode()) return '';
  const info = case3DirectorBeatState();
  const beat = info.current;
  return `<div class="director-card compact-flow-card case3-director-card">
    <div class="director-card-head"><div><span class="mission-kicker">第三案导演流程</span><h4>${beat.title}</h4></div><strong>${info.percent}%</strong></div>
    <div class="mission-progress director-progress"><span style="width:${info.percent}%"></span></div>
    <button class="btn gold director-jump" onclick="handleCase3DirectorBeatAction('${beat.id}')">${case3DirectorBeatButtonLabel(beat.id)}</button>
  </div>`;
}
function renderCase3GuidanceCard(){
  const g = case3CurrentGuidance();
  if(!g) return '';
  return `<div class="case1-guidance-card compact-info-card case3-guidance-card">
    <div><span class="mission-kicker">第三案下一步</span><h4>${g.title}</h4></div>
    <button class="btn ghost" onclick="handleCase3GuidanceAction('${g.id}')">${g.cta}</button>
  </div>`;
}
function renderCase3QuickAction(){
  if(!isCase3DirectorMode()) return '';
  const g = case3CurrentGuidance();
  if(g) return `<button class="btn gold compact-next-btn" onclick="handleCase3GuidanceAction('${g.id}')">${g.cta}</button>`;
  const info = case3DirectorBeatState();
  if(info.current && !caseDone('case3')) return `<button class="btn gold compact-next-btn" onclick="handleCase3DirectorBeatAction('${info.current.id}')">${case3DirectorBeatButtonLabel(info.current.id)}</button>`;
  return '';
}
const case3DirectingCues = {
  archive_entry:{scene:'archive', camera:'wide', focus:'市档案中心', emotion:{'陆沉':'serious','韩亦':'serious'}, action:{'陆沉':'think','韩亦':'think'}, toast:'市档案中心'},
  archive_letter:{scene:'archive', camera:'insert', focus:'匿名函残页', emotion:{'陆沉':'serious','韩亦':'serious'}, action:{'陆沉':'think','韩亦':'record'}, toast:'匿名函残页'},
  archive_usb:{scene:'archive', camera:'insert', focus:'审计 U 盘', emotion:{'陆沉':'serious','韩亦':'serious'}, action:{'陆沉':'point','韩亦':'record'}, toast:'审计 U 盘'},
  archive_board:{scene:'archive', camera:'insert', focus:'董事会日程', emotion:{'陆沉':'serious','韩亦':'serious'}, action:{'陆沉':'think','韩亦':'route'}, toast:'董事会日程'},
  qiao_money:{scene:'archive', camera:'close', focus:'乔衡', emotion:{'陆沉':'resolve','乔衡':'shock'}, action:{'陆沉':'point','乔衡':'stepBack'}, toast:'灰塔转账凭证'},
  rooftop_entry:{scene:'rooftop', camera:'wide', focus:'金融街天台', emotion:{'陆沉':'resolve','韩亦':'serious','乔衡':'sad'}, action:{'陆沉':'think','韩亦':'route','乔衡':'stepBack'}, toast:'金融街天台'},
  rooftop_access:{scene:'rooftop', camera:'insert', focus:'天台门禁记录', emotion:{'陆沉':'resolve','韩亦':'serious'}, action:{'陆沉':'think','韩亦':'route'}, toast:'天台门禁记录'},
  rooftop_film:{scene:'rooftop', camera:'insert', focus:'狙击照片底片', emotion:{'陆沉':'resolve','韩亦':'serious'}, action:{'陆沉':'point','韩亦':'route'}, toast:'照片底片'},
  case3_office:{scene:'office', camera:'insert', focus:'第三案组合推理', emotion:{'陆沉':'resolve','韩亦':'serious'}, action:{'陆沉':'point','韩亦':'route'}, toast:'第三案组合推理'},
  case3_court_open:{scene:'court3', camera:'wide', focus:'终审法庭', emotion:{'陆沉':'resolve','韩亦':'serious','乔衡':'sad'}, action:{'陆沉':'think','韩亦':'courtAssist','乔衡':'tense'}, toast:'终审法庭'},
  case3_submit:{scene:'court3', camera:'insert', focus:'灰塔转账凭证', emotion:{'陆沉':'resolve','乔衡':'shock','韩亦':'serious'}, action:{'陆沉':'point','乔衡':'stepBack','韩亦':'courtAssist'}, toast:'灰塔转账凭证'},
  case3_ending:{scene:'court3', camera:'black', focus:'终极结局', emotion:{'陆沉':'resolve','韩亦':'serious'}, action:{'陆沉':'think','韩亦':'courtAssist'}, toast:'终极结局'}
};
function case3DramaForCue(id){
  return {
    archive_entry:{'陆沉':'chain','韩亦':'route'},
    archive_letter:{'陆沉':'archive','韩亦':'record'},
    archive_usb:{'陆沉':'chain','韩亦':'record'},
    archive_board:{'陆沉':'chain','韩亦':'route'},
    qiao_money:{'陆沉':'finalCourt','乔衡':'break','韩亦':'route'},
    rooftop_entry:{'陆沉':'rooftop','韩亦':'route','乔衡':'evade'},
    rooftop_access:{'陆沉':'chain','韩亦':'route'},
    rooftop_film:{'陆沉':'chain','韩亦':'route'},
    case3_office:{'陆沉':'chain','韩亦':'route'},
    case3_court_open:{'陆沉':'finalCourt','韩亦':'courtAssist','乔衡':'calm'},
    case3_submit:{'陆沉':'finalCourt','韩亦':'courtAssist','乔衡':'break'},
    case3_ending:{'陆沉':'chain','韩亦':'courtAssist','乔衡':'evade'}
  }[id] || {};
}
function case3CgForCue(id){
  return {
    archive_entry:'case3_archive_intro',
    archive_letter:'case3_archive_evidence',
    archive_usb:'case3_archive_evidence',
    archive_board:'case3_archive_evidence',
    qiao_money:'case3_rooftop_qiao',
    rooftop_entry:'case3_rooftop_qiao',
    rooftop_access:'case3_rooftop_evidence',
    rooftop_film:'case3_rooftop_evidence',
    case3_office:'case3_archive_evidence',
    case3_court_open:'case3_court_final',
    case3_submit:'case3_court_final',
    case3_ending:'case3_ending'
  }[id] || '';
}
function applyCase3DirectingCue(id, opts={}){
  const cue = case3DirectingCues[id];
  if(!cue) return;
  const sceneMatch = !cue.scene || cue.scene === state.scene;
  if(!sceneMatch && !opts.force) return;
  Object.entries(cue.emotion||{}).forEach(([name,emotion])=>setActorEmotion(name, emotion, `case3:${id}`));
  Object.entries(case3DramaForCue(id)).forEach(([name,drama])=>setActorDramaticState(name, drama, `case3:${id}`));
  Object.entries(cue.action||{}).forEach(([name,action])=>setActorAction(name, action, `case3:${id}`));
  if(typeof pulseCamera === 'function') pulseCamera(cue.camera || 'medium', cue.focus || cue.toast || '', opts.duration || 920, {focus:cue.focus});
  if(opts.toast !== false && cue.toast) showToast('第三案镜头', cue.toast);
  const cgId = case3CgForCue(id); if(opts.cg !== false && cgId) queueCgIllustration(cgId, opts.cgDelay || 380, false);
  renderActorStage();
}
function case3CueForEvidence(name){
  return {
    '匿名函残页':'archive_letter',
    '审计U盘':'archive_usb',
    '董事会日程':'archive_board',
    '灰塔转账凭证':'qiao_money',
    '天台门禁记录':'rooftop_access',
    '狙击照片底片':'rooftop_film',
    '组合推理：灰塔资本介入灭口':'case3_office',
    '组合推理：终局委托人锁定':'case3_office'
  }[name] || '';
}
function applyCase3SceneEntryCue(id){
  const map = {archive:'archive_entry', rooftop:'rooftop_entry', court3:'case3_court_open'};
  if(map[id]) setTimeout(()=>applyCase3DirectingCue(map[id], {toast:false, duration:820}), 240);
}
function maybeTriggerCase3DirectorCue(){
  if(!isCase3DirectorMode()) return;
  const info = case3DirectorBeatState();
  if(!info.current) return;
  if(info.current.id==='court3' && state.scene==='court3') applyCase3DirectingCue('case3_court_open',{toast:false});
  if(info.current.id==='ending' && state.scene==='court3') applyCase3DirectingCue('case3_ending',{toast:false});
}

function renderCase1QuickAction(){
  if(!isCase1DirectorMode()) return '';
  const guide = case1CurrentGuidance && case1CurrentGuidance();
  if(guide) return `<button class="btn gold compact-next-btn" onclick="handleCase1GuidanceAction('${guide.id}')">${guide.cta}</button>`;
  const court = (state.scene==='court' || caseDone('case1')) ? case1CourtBeatState() : null;
  if(court && court.current && !caseDone('case1')) return `<button class="btn gold compact-next-btn" onclick="handleCourtClimaxAction('${court.current.id}')">${courtBeatButtonLabel(court.current.id)}</button>`;
  const director = case1DirectorBeatState();
  if(director.current && !caseDone('case1')) return `<button class="btn gold compact-next-btn" onclick="handleDirectorBeatAction('${director.current.id}')">${directorBeatButtonLabel(director.current.id)}</button>`;
  return '';
}

function renderTaskTracker(){
  const host = $('taskTracker');
  if(!host) return;
  const m = currentMission();
  const p = missionProgress(m);
  const currentTitle = p.current && p.completed < p.total ? p.current.title : `${m.title} · 阶段完成`;
  const currentGoal = p.current ? p.current.goal : '当前案件阶段已完成。';
  $('objectiveTitle').textContent = currentTitle;
  $('objectiveText').textContent = currentGoal;
  const nextAction = renderCaseQuickAction();
  host.innerHTML = `
    <div class="mission-card compact-mission-card">
      <div class="mission-card-head">
        <div><span class="mission-kicker">CURRENT</span><h4>${currentTitle}</h4></div>
        <strong>${p.percent}%</strong>
      </div>
      <div class="mission-progress"><span style="width:${p.percent}%"></span></div>
      <p class="mission-goal">${currentGoal}</p>
      ${nextAction}
      <button class="btn ghost compact-detail-btn" onclick="showMissionPanel()">任务详情</button>
    </div>
    ${renderDirectingBeatCard()}
    ${renderCase1GuidanceCard()}
    ${renderCase1DirectorCard()}
    ${renderCase1CourtClimaxCard()}
    ${renderCase2GuidanceCard()}
    ${renderCase2DirectorCard()}
    ${renderCase3GuidanceCard()}
    ${renderCase3DirectorCard()}`;
}
function evaluateTaskProgress(){
  if(!state.used) state.used = {};
  missionDefs.forEach(m=>{
    if(!m.unlock()) return;
    m.stages.forEach(s=>{
      const key = `mission-done:${s.id}`;
      if(s.done() && !state.used[key]){
        state.used[key]=true;
        showToast('阶段完成', `${m.title} · ${s.title}`);
      }
    });
  });
}
function showMissionPanel(){
  const overall = allMissionProgress();
  const cases = missionDefs.map(m=>{
    const p = missionProgress(m);
    const locked = !m.unlock();
    const stages = m.stages.map((s,idx)=>{
      const done = s.done();
      const current = p.current && s.id===p.current.id && !done;
      return `<div class="mission-file-stage ${done?'done':''} ${current?'current':''}">
        <span>${String(idx+1).padStart(2,'0')}</span>
        <div><strong>${s.title}</strong><p>${done?'已完成':current?s.goal:s.desc}</p></div>
      </div>`;
    }).join('');
    return `<section class="mission-file ${locked?'locked':''}">
      <div class="mission-file-head">
        <div><p class="archive-kicker">${locked?'LOCKED CASE':'CASE MISSION'}</p><h3>${m.title}</h3><small>${m.subtitle}</small></div>
        <div class="mission-file-percent">${locked?'LOCK':p.percent+'%'}</div>
      </div>
      <div class="mission-progress"><span style="width:${locked?0:p.percent}%"></span></div>
      <div class="mission-file-stages">${stages}</div>
    </section>`;
  }).join('');
  showModal('任务档案', `
    <div class="archive-shell mission-archive-shell">
      <div class="archive-header">
        <div>
          <p class="archive-kicker">MISSION ARCHIVE</p>
          <h2>章节推进 / 任务系统</h2>
          <p class="archive-summary">这里展示每个案件的阶段目标、完成条件与关卡推进进度。原有剧情逻辑不变，任务系统负责让目标更清楚。</p>
        </div>
        <div class="archive-stats compact">
          <div class="archive-stat"><strong>${overall.completed}</strong><span>已完成阶段</span></div>
          <div class="archive-stat"><strong>${overall.total}</strong><span>总阶段</span></div>
          <div class="archive-stat"><strong>${overall.percent}%</strong><span>总进度</span></div>
        </div>
      </div>
      <div class="mission-file-grid">${cases}</div>
    </div>`);
}



let puzzleSession = {};
const puzzleDefs = [
  {
    id:'c1_timeline_order', caseId:'case1', type:'order', title:'案发时间排序', subtitle:'把第一案关键线索按时间顺序摆放。', reward:1,
    require:['22:13 小票','破损监控记录','匿名来电记录'],
    prompt:'将三条证据按时间顺序排序。',
    items:[
      {key:'receipt', label:'22:13 小票', hint:'受害人在便利店购买止痛药。'},
      {key:'camera', label:'破损监控记录', hint:'22:14 后监控出现 47 秒黑屏。'},
      {key:'call', label:'匿名来电记录', hint:'陈巍被匿名电话引导改变路线。'}
    ],
    correct:['receipt','camera','call'],
    success:'案发时间排序完成。'
  },
  {
    id:'c1_contradiction_sulan', caseId:'case1', type:'contradiction', title:'指出苏岚证词矛盾', subtitle:'选择需要继续核对的证词。', reward:1,
    require:['店内网络异常','未发送语音'],
    prompt:'选择与已获得证据不一致的证词。',
    options:[
      {text:'“我当时太害怕了，所以什么都没看见。”', correct:false, explain:'与当前证据不匹配。'},
      {text:'“报警电话一直打不出去。”', correct:true, explain:'与店内网络异常相匹配。'},
      {text:'“我只看见陈巍手里有刀。”', correct:false, explain:'不是本题目标。'},
      {text:'“店长那天没有来过店里。”', correct:false, explain:'缺少直接证据。'}
    ]
  },
  {
    id:'c1_submit_blackcar', caseId:'case1', type:'submit', title:'提交证据反驳现场叙事', subtitle:'选择一条对应证据。', reward:1,
    require:['黑车车牌残片','未发送语音'],
    prompt:'选择需要提交的证据。',
    correct:'黑车车牌残片',
    options:['黑车车牌残片','22:13 小票','袖口机油','保险柜合同'],
    success:'黑车车牌残片已提交。'
  },
  {
    id:'c2_route_chain', caseId:'case2', type:'order', title:'账本追踪路径', subtitle:'整理医院到账本再到旧码头的调查路径。', reward:1,
    require:['医院缴费单','残缺账本页','码头监控截图','货柜封条'],
    prompt:'将第二案关键证据按“调查推进路径”排序。',
    items:[
      {key:'bill', label:'医院缴费单', hint:'受害人与医院费用出现关联。'},
      {key:'ledger', label:'残缺账本页', hint:'病历里夹着旧码头地址。'},
      {key:'dockcam', label:'码头监控截图', hint:'黑车在仓库停留。'},
      {key:'seal', label:'货柜封条', hint:'货柜编号与账本页吻合。'}
    ],
    correct:['bill','ledger','dockcam','seal'],
    success:'追踪路径排序完成。'
  },
  {
    id:'c2_submit_recording', caseId:'case2', type:'submit', title:'锁定幕后委托链', subtitle:'选择对应证据。', reward:1,
    require:['私家侦探录音','货柜封条'],
    prompt:'选择需要提交的证据。',
    correct:'私家侦探录音',
    options:['私家侦探录音','货柜封条','医院缴费单','护士交班记录'],
    success:'私家侦探录音已提交。'
  },
  {
    id:'c3_submit_greytower', caseId:'case3', type:'submit', title:'提交灰塔资金证据', subtitle:'选择对应资金证据。', reward:1,
    require:['审计U盘','董事会日程','灰塔转账凭证'],
    prompt:'选择需要提交的证据。',
    correct:'灰塔转账凭证',
    options:['灰塔转账凭证','董事会日程','匿名函残页','天台门禁记录'],
    success:'灰塔转账凭证已提交。'
  }
];
function puzzleSolved(id){return (state.puzzles||[]).includes(id)}
function puzzleUnlocked(p){return (!p.require||p.require.every(has)) && (!p.requireCase||caseDone(p.requireCase))}
function puzzleCaseName(id){return id==='case1'?'第一案':id==='case2'?'第二案':'第三案'}

function directingCueForPuzzle(id){
  return {
    c1_timeline_order:'office_chain',
    c1_contradiction_sulan:'sulan_confess',
    c1_submit_blackcar:'court_submit',
    c2_route_chain:'case2_office',
    c2_submit_recording:'case2_submit',
    c3_submit_greytower:'case3_submit'
  }[id] || '';
}

function completePuzzle(p, detail){
  if(!state.puzzles) state.puzzles=[];
  if(!puzzleSolved(p.id)){
    state.puzzles.push(p.id);
    state.truth += p.reward || 1;
    showToast('解谜完成', `${p.title} · 真相 +${p.reward||1}`);
    const puzzleCue = directingCueForPuzzle(p.id); if(puzzleCue) setTimeout(()=>applyDirectorCue(puzzleCue,{toast:false}), 80);
    playSfx('success');
    if(typeof showCinematic === 'function'){
      setTimeout(()=>showCinematic('deduction',{kicker:'PUZZLE SOLVED', title:p.title, body:detail||p.success||'轻解谜已完成，新的判断写入调查记录。', chain:'<div class="cinematic-stamp">解谜完成</div>'}),160);
    }
  }else{
    showToast('已经完成', p.title);
  }
  save();
  render();
  maybeTriggerCase1DirectorCue();maybeTriggerCase2DirectorCue();maybeTriggerCase3DirectorCue();
  showPuzzleResult(p, true, detail||p.success||'解谜完成。');
}
function puzzleFail(p, message){
  playSfx('fail');
  showPuzzleResult(p, false, message||'推理未通过，请重新选择。');
}
function showPuzzleResult(p, ok, message){
  const cls = ok ? 'success' : 'fail';
  const label = ok ? '判断成立' : '推理未通过';
  const back = `<div class="save-actions"><button class="btn gold" onclick="startPuzzle('${p.id}')">继续尝试</button><button class="btn ghost" onclick="showPuzzleHub()">返回解谜档案</button></div>`;
  $('modalBody').innerHTML = `<div class="puzzle-result-card ${cls}"><div class="puzzle-result-stamp">${label}</div><h3>${p.title}</h3><p>${message}</p>${back}</div>`;
}
function showPuzzleHub(){
  const available = puzzleDefs.filter(p=>puzzleUnlocked(p)).length;
  const solved = puzzleDefs.filter(p=>puzzleSolved(p.id)).length;
  const cards = puzzleDefs.map(p=>{
    const unlocked = puzzleUnlocked(p);
    const done = puzzleSolved(p.id);
    return `<button class="puzzle-card ${done?'done':''} ${unlocked?'':'locked'}" data-puzzle="${p.id}" ${unlocked?'':'disabled'}>
      <div class="puzzle-card-head">
        <span>${puzzleCaseName(p.caseId)}</span>
        <em>${done?'已完成':unlocked?'可挑战':'未解锁'}</em>
      </div>
      <h3>${p.title}</h3>
      <p>${p.subtitle}</p>
      <small>${unlocked?(done?'可重复查看':'点击开始轻解谜'):'需要先获得相关证据'}</small>
    </button>`;
  }).join('');
  showModal('轻解谜档案', `
    <div class="archive-shell puzzle-shell">
      <div class="archive-header">
        <div>
          <p class="archive-kicker">LIGHT PUZZLES</p>
          <h2>轻解谜互动系统</h2>
          <p class="archive-summary">按提示完成排序、证词核对和证据提交。</p>
        </div>
        <div class="archive-stats compact">
          <div class="archive-stat"><strong>${solved}</strong><span>已完成</span></div>
          <div class="archive-stat"><strong>${available}</strong><span>可挑战</span></div>
          <div class="archive-stat"><strong>${puzzleDefs.length}</strong><span>总谜题</span></div>
        </div>
      </div>
      <div class="puzzle-grid">${cards}</div>
    </div>`);
  document.querySelectorAll('[data-puzzle]').forEach(btn=>btn.onclick=()=>startPuzzle(btn.dataset.puzzle));
}
function startPuzzle(id){
  const p = puzzleDefs.find(x=>x.id===id);
  if(!p) return;
  if(!puzzleUnlocked(p)){showToast('谜题未解锁','需要先获得相关证据。');playSfx('fail');return;}
  puzzleSession[p.id] = puzzleSession[p.id] || {};
  if(p.type==='order') return renderOrderPuzzle(p);
  if(p.type==='contradiction') return renderChoicePuzzle(p);
  if(p.type==='submit') return renderSubmitPuzzle(p);
}
function renderPuzzleFrame(p, body){
  showModal(p.title, `<div class="puzzle-play-shell">
    <div class="puzzle-play-head">
      <div><p class="archive-kicker">${puzzleCaseName(p.caseId)} · ${p.type==='order'?'排序谜题':p.type==='contradiction'?'矛盾指出':'证据提交'}</p><h2>${p.title}</h2><p>${p.prompt}</p></div>
      <div class="puzzle-type-badge">${puzzleSolved(p.id)?'DONE':'PUZZLE'}</div>
    </div>
    ${body}
    <div class="save-actions"><button class="btn ghost" onclick="showPuzzleHub()">返回解谜档案</button></div>
  </div>`);
}
function renderOrderPuzzle(p){
  const session = puzzleSession[p.id] || (puzzleSession[p.id]={selected:[]});
  if(!Array.isArray(session.selected)) session.selected=[];
  const selected = session.selected;
  const pool = p.items.map(item=>{
    const used = selected.includes(item.key);
    return `<button class="puzzle-evidence-token ${used?'used':''}" data-order-pick="${item.key}" ${used?'disabled':''}>
      <strong>${item.label}</strong><small>${item.hint}</small>
    </button>`;
  }).join('');
  const slots = p.correct.map((_,idx)=>{
    const key = selected[idx];
    const item = p.items.find(x=>x.key===key);
    return `<div class="puzzle-order-slot ${key?'filled':''}">
      <span>${idx+1}</span>
      ${item?`<strong>${item.label}</strong><small>${item.hint}</small><button class="mini-btn" data-order-remove="${idx}">移除</button>`:`<em>等待证据落位</em>`}
    </div>`;
  }).join('');
  renderPuzzleFrame(p, `<div class="puzzle-order-layout">
    <section class="puzzle-panel"><h3>可用证据</h3><div class="puzzle-token-grid">${pool}</div></section>
    <section class="puzzle-panel"><h3>排序槽</h3><div class="puzzle-order-slots">${slots}</div><div class="save-actions"><button class="btn gold" id="verifyOrderPuzzle">验证顺序</button><button class="btn ghost" id="resetOrderPuzzle">重置</button></div></section>
  </div>`);
  document.querySelectorAll('[data-order-pick]').forEach(btn=>btn.onclick=()=>{
    if(session.selected.length<p.correct.length && !session.selected.includes(btn.dataset.orderPick)){
      session.selected.push(btn.dataset.orderPick);
      playSfx('move');
      renderOrderPuzzle(p);
    }
  });
  document.querySelectorAll('[data-order-remove]').forEach(btn=>btn.onclick=()=>{
    session.selected.splice(Number(btn.dataset.orderRemove),1);
    playSfx('click');
    renderOrderPuzzle(p);
  });
  $('resetOrderPuzzle').onclick=()=>{session.selected=[];renderOrderPuzzle(p);playSfx('click')};
  $('verifyOrderPuzzle').onclick=()=>{
    const ok = p.correct.join('|') === session.selected.join('|');
    if(ok) completePuzzle(p,p.success);
    else puzzleFail(p,'顺序还没有闭合。注意“时间发生”与“调查发现”不是同一件事。');
  };
}
function renderChoicePuzzle(p){
  const options = p.options.map((o,idx)=>`<button class="puzzle-choice" data-puzzle-choice="${idx}">
    <span>${String(idx+1).padStart(2,'0')}</span>
    <strong>${o.text}</strong>
  </button>`).join('');
  renderPuzzleFrame(p, `<div class="puzzle-panel"><h3>选择你要追问的矛盾句</h3><div class="puzzle-choice-grid">${options}</div></div>`);
  document.querySelectorAll('[data-puzzle-choice]').forEach(btn=>btn.onclick=()=>{
    const o = p.options[Number(btn.dataset.puzzleChoice)];
    if(o.correct) completePuzzle(p,o.explain);
    else puzzleFail(p,o.explain);
  });
}
function renderSubmitPuzzle(p){
  const options = p.options.map((name,idx)=>{
    const owned = state.evidence.includes(name);
    return `<button class="puzzle-submit-card ${owned?'':'missing'}" data-submit-evidence="${name}" ${owned?'':'disabled'}>
      <span>${owned?iconFor(name):'?'}</span>
      <strong>${name}</strong>
      <small>${owned?hintFor(name):'尚未获得这条证据'}</small>
    </button>`;
  }).join('');
  renderPuzzleFrame(p, `<div class="puzzle-panel"><h3>选择提交证据</h3><div class="puzzle-submit-grid">${options}</div></div>`);
  document.querySelectorAll('[data-submit-evidence]').forEach(btn=>btn.onclick=()=>{
    const name = btn.dataset.submitEvidence;
    if(name===p.correct) completePuzzle(p,p.success);
    else puzzleFail(p,`“${name}”还不足以支撑这次反驳。重新选择一条能直接击中矛盾的证据。`);
  });
}


let cinematicCallback = null;

let pendingCgIllustration = null;
const cgIllustrationNodes = {
  city_entry:{
    kicker:'第一案 · 建立镜头', modeLabel:'导演剪辑 CG', title:'雨夜商业区路口',
    narration:'',
    caption:'商业区路口', scene:'city', bg:'./assets/cg_case1_arrival.jpg', mood:'rain',
    fx:['rain','glow'],
    characters:[]
  },
  store_crime:{
    kicker:'第一案 · 关键场景', modeLabel:'导演剪辑 CG', title:'便利店冷白灯下',
    narration:'',
    caption:'便利店现场', scene:'store', bg:'./assets/cg_case1_store_crime.jpg', mood:'cold',
    fx:['glassRain','glow'],
    characters:[]
  },
  sulan_voice:{
    kicker:'第一案 · 人物情绪', modeLabel:'导演剪辑 CG', title:'未发送语音',
    narration:'',
    caption:'未发送语音', scene:'store', bg:'./assets/cg_case1_sulan_voice.jpg', mood:'memory',
    fx:['phoneGlow','dust'],
    characters:[]
  },
  office_wall:{
    kicker:'第一案 · 推理构图', modeLabel:'导演剪辑 CG', title:'律所证据墙',
    narration:'',
    caption:'律所证据墙', scene:'office', bg:'./assets/cg_case1_office_wall.jpg', mood:'office',
    fx:['glow','dust'],
    characters:[]
  },
  case2_hospital_lina:{
    kicker:'第二案 · 医院证人', modeLabel:'导演剪辑 CG', title:'云港医院',
    narration:'',
    caption:'李娜 / 病历调取', scene:'hospital', bg:'./assets/cg_case2_hospital_lina.jpg', mood:'cold',
    fx:['fluorescent','dust','screenGlow'],
    characters:[{name:'李娜', pos:'right', tone:'focus', action:'lowerHead', drama:'hesitate', scale:1.02, shift:'8px'},{name:'陆沉', pos:'left', tone:'muted', action:'think', drama:'investigate', scale:.98, shift:'-12px'}]
  },
  case2_lina_ledger:{
    kicker:'第二案 · 证词转折', modeLabel:'导演剪辑 CG', title:'残缺账本页',
    narration:'',
    caption:'李娜交出账本页', scene:'hospital', bg:'./assets/cg_case2_lina_ledger.jpg', mood:'cold',
    fx:['fluorescent','screenGlow','paperShadow'],
    characters:[{name:'李娜', pos:'right', tone:'focus', action:'speak', drama:'testify', scale:1.04, shift:'8px'},{name:'韩亦', pos:'left', tone:'muted', action:'think', drama:'record', scale:.94, shift:'-10px'}]
  },
  case2_dock_moye:{
    kicker:'第二案 · 码头线人', modeLabel:'导演剪辑 CG', title:'旧码头 9 号仓',
    narration:'',
    caption:'莫野 / 黑车停留记录', scene:'dock', bg:'./assets/cg_case2_dock_moye.jpg', mood:'wind',
    fx:['fog','warningLight','windLines','tailLight'],
    characters:[{name:'莫野', pos:'left', tone:'focus', action:'think', drama:'guard', scale:1.02, shift:'-10px'},{name:'陆沉', pos:'right', tone:'muted', action:'think', drama:'investigate', scale:.98, shift:'8px'}]
  },
  case2_office_chain:{
    kicker:'第二案 · 推理构图', modeLabel:'导演剪辑 CG', title:'医院与码头证据链',
    narration:'',
    caption:'律所证据墙', scene:'office', bg:'./assets/cg_case2_office_chain.jpg', mood:'office',
    fx:['glow','dust','redThread'],
    characters:[{name:'陆沉', pos:'right', tone:'focus', action:'point', drama:'chain', scale:1.04, shift:'8px'},{name:'韩亦', pos:'left', tone:'muted', action:'think', drama:'route', scale:.98, shift:'-8px'}]
  },
  case2_court_recording:{
    kicker:'第二案 · 法庭质证', modeLabel:'导演剪辑 CG', title:'第二案证据提交',
    narration:'',
    caption:'私家侦探录音', scene:'court2', bg:'./assets/cg_case2_court_recording.jpg', mood:'court',
    fx:['projection','spotlight','paperShadow'],
    characters:[{name:'陆沉', pos:'left', tone:'focus', action:'point', drama:'interrogate', scale:1.04, shift:'-8px'},{name:'莫野', pos:'right', tone:'muted', action:'speak', drama:'recording', scale:.98, shift:'10px'}]
  },
  case2_next_hook:{
    kicker:'第二案 · 第三案钩子', modeLabel:'导演剪辑 CG', title:'第三案钩子',
    narration:'',
    caption:'匿名函 / 审计资料', scene:'archive', bg:'./assets/cg_case2_next_hook.jpg', mood:'archive',
    fx:['dust','screenGlow','glow'],
    characters:[{name:'陆沉', pos:'right', tone:'focus', action:'think', drama:'chain', scale:1.0, shift:'8px'},{name:'韩亦', pos:'left', tone:'muted', action:'think', drama:'courtAssist', scale:.96, shift:'-8px'}]
  },
  hospital_night:{
    kicker:'第二案 · 建立镜头', modeLabel:'场景 CG', title:'医院深夜走廊',
    narration:'',
    caption:'云港医院', scene:'hospital', bg:'./assets/scene_hospital.jpg', mood:'cold',
    fx:['fluorescent','dust','screenGlow'],
    characters:[{name:'李娜', pos:'right', tone:'focus', action:'lowerHead', scale:1.04, shift:'8px'},{name:'陆沉', pos:'left', tone:'muted', scale:1.0, shift:'-10px'}]
  },
  dock_blackcar:{
    kicker:'第二案 · 关键场景', modeLabel:'场景 CG', title:'旧码头仓库',
    narration:'',
    caption:'旧码头仓库', scene:'dock', bg:'./assets/scene_dock.jpg', mood:'wind',
    fx:['fog','warningLight','windLines','tailLight'],
    characters:[{name:'莫野', pos:'left', tone:'focus', action:'think', scale:1.0, shift:'-10px'},{name:'韩亦', pos:'right', tone:'muted', scale:1.0, shift:'8px'}]
  },
  case2_court_submission:{
    kicker:'第二案 · 法庭质证', modeLabel:'场景 CG', title:'第二案证据提交',
    narration:'',
    caption:'第二案法庭', scene:'court2', bg:'./assets/cg_case1_court_submission.jpg', mood:'court',
    fx:['projection','spotlight','paperShadow'],
    characters:[{name:'陆沉', pos:'left', tone:'focus', action:'point', scale:1.04, shift:'-8px'},{name:'莫野', pos:'right', tone:'muted', action:'tense', scale:.98, shift:'10px'}]
  },
  court_submission:{
    kicker:'法庭 · 证据投影', modeLabel:'导演剪辑 CG', title:'关键证据提交',
    narration:'',
    caption:'关键证据提交', scene:'court', bg:'./assets/cg_case1_court_submission.jpg', mood:'court',
    fx:['projection','spotlight','glow'],
    characters:[]
  },
  case1_court_open:{
    kicker:'第一案 · 法庭开场', modeLabel:'高潮 CG', title:'灯光落下',
    narration:'',
    caption:'第一案法庭', scene:'court', bg:'./assets/scene_court.jpg', mood:'court',
    fx:['spotlight','paperShadow','glow'],
    characters:[]
  },
  case1_court_climax:{
    kicker:'第一案 · 翻盘节点', modeLabel:'高潮 CG', title:'证据提交',
    narration:'',
    caption:'关键证据提交', scene:'court', bg:'./assets/cg_case1_court_submission.jpg', mood:'court',
    fx:['projection','spotlight','glow'],
    characters:[]
  },
  case1_truth_reveal:{
    kicker:'第一案 · 真相揭示', modeLabel:'高潮 CG', title:'雨停之前',
    narration:'',
    caption:'第一案结局', scene:'court', bg:'./assets/cg_case1_arrival.jpg', mood:'rain',
    fx:['rain','glow','neon'],
    characters:[]
  },
  case1_next_case_hook:{
    kicker:'第二案钩子', modeLabel:'悬念 CG', title:'账本不在我手里',
    narration:'',
    caption:'第二案线索', scene:'meeting', bg:'./assets/scene_meeting.jpg', mood:'cold',
    fx:['fluorescent','dust','glow'],
    characters:[]
  },
  case3_archive_intro:{
    kicker:'第三案 · 档案中心', modeLabel:'导演剪辑 CG', title:'市档案中心',
    narration:'',
    caption:'匿名函 / 审计资料', scene:'archive', bg:'./assets/cg_case3_archive_intro.jpg', mood:'archive',
    fx:['dust','screenGlow','glow'],
    characters:[{name:'陆沉', pos:'right', tone:'focus', action:'think', drama:'chain', scale:1.0, shift:'8px'},{name:'韩亦', pos:'left', tone:'muted', action:'think', drama:'route', scale:.96, shift:'-8px'}]
  },
  case3_archive_evidence:{
    kicker:'第三案 · 证据链', modeLabel:'导演剪辑 CG', title:'灰塔资料链',
    narration:'',
    caption:'审计 U 盘 / 董事会日程', scene:'archive', bg:'./assets/cg_case3_archive_evidence.jpg', mood:'archive',
    fx:['dust','screenGlow','redThread'],
    characters:[{name:'陆沉', pos:'right', tone:'focus', action:'point', drama:'chain', scale:1.03, shift:'8px'},{name:'韩亦', pos:'left', tone:'muted', action:'think', drama:'record', scale:.96, shift:'-8px'}]
  },
  case3_rooftop_qiao:{
    kicker:'第三案 · 天台对峙', modeLabel:'导演剪辑 CG', title:'金融街天台',
    narration:'',
    caption:'乔衡 / 最后会面', scene:'rooftop', bg:'./assets/cg_case3_rooftop_qiao.jpg', mood:'wind',
    fx:['windLines','cityGlow','tailLight'],
    characters:[{name:'陆沉', pos:'left', tone:'focus', action:'point', drama:'interrogate', scale:1.04, shift:'-8px'},{name:'乔衡', pos:'right', tone:'muted', action:'stepBack', drama:'evade', scale:.96, shift:'10px'}]
  },
  case3_rooftop_evidence:{
    kicker:'第三案 · 天台证据', modeLabel:'导演剪辑 CG', title:'天台证据',
    narration:'',
    caption:'门禁记录 / 照片底片', scene:'rooftop', bg:'./assets/cg_case3_rooftop_evidence.jpg', mood:'wind',
    fx:['windLines','cityGlow','screenGlow'],
    characters:[{name:'韩亦', pos:'left', tone:'muted', action:'think', drama:'route', scale:.96, shift:'-8px'},{name:'陆沉', pos:'right', tone:'focus', action:'point', drama:'chain', scale:1.02, shift:'8px'}]
  },
  case3_court_final:{
    kicker:'第三案 · 终审质证', modeLabel:'导演剪辑 CG', title:'终审法庭',
    narration:'',
    caption:'灰塔资本证据链', scene:'court3', bg:'./assets/cg_case3_court_final.jpg', mood:'court',
    fx:['projection','spotlight','paperShadow'],
    characters:[{name:'陆沉', pos:'left', tone:'focus', action:'point', drama:'interrogate', scale:1.05, shift:'-8px'},{name:'乔衡', pos:'right', tone:'muted', action:'stepBack', drama:'break', scale:.96, shift:'10px'}]
  },
  case3_ending:{
    kicker:'第三案 · 终局收束', modeLabel:'导演剪辑 CG', title:'终局收束',
    narration:'',
    caption:'完整责任链', scene:'court3', bg:'./assets/cg_case3_ending.jpg', mood:'court',
    fx:['projection','spotlight','glow'],
    characters:[{name:'陆沉', pos:'right', tone:'focus', action:'think', drama:'chain', scale:1.0, shift:'8px'},{name:'韩亦', pos:'left', tone:'muted', action:'think', drama:'courtAssist', scale:.96, shift:'-8px'}]
  },
  rooftop_finale:{
    kicker:'第三案 · 终局对峙', modeLabel:'终局 CG', title:'金融街天台',
    narration:'',
    caption:'金融街天台', scene:'rooftop', bg:'./assets/scene_rooftop.jpg', mood:'finale',
    fx:['cityGlow','windLines','fog','glow'],
    characters:[{name:'陆沉', pos:'left', tone:'focus', action:'point', scale:1.04, shift:'-8px'},{name:'乔衡', pos:'right', tone:'antagonist', action:'stepBack', scale:1.04, shift:'10px'}]
  }
};
const cgSceneMap = {city:'city_entry',store:'store_crime',office:'office_wall',hospital:'case2_hospital_lina',dock:'case2_dock_moye',archive:'case3_archive_intro',court:'case1_court_open',court2:'case2_court_recording',court3:'case3_court_final',rooftop:'case3_rooftop_qiao'};
const cgEvidenceMap = {'未发送语音':'sulan_voice','医院缴费单':'case2_hospital_lina','护士交班记录':'case2_hospital_lina','残缺账本页':'case2_lina_ledger','码头监控截图':'case2_dock_moye','货柜封条':'case2_dock_moye','私家侦探录音':'case2_dock_moye','匿名函残页':'case3_archive_intro','审计U盘':'case3_archive_evidence','董事会日程':'case3_archive_evidence','灰塔转账凭证':'case3_rooftop_qiao','天台门禁记录':'case3_rooftop_evidence','狙击照片底片':'case3_rooftop_evidence'};
function canShowCgIllustrationNow(){
  return (!$('cinematicOverlay') || $('cinematicOverlay').classList.contains('hidden')) && (!$('objectCloseupOverlay') || $('objectCloseupOverlay').classList.contains('hidden'));
}
function cgIllustrationKey(id){ return `cg:${id}`; }
function shouldPlayCgIllustration(id, force=false){
  if(!id || !cgIllustrationNodes[id]) return false;
  if(state.settings && state.settings.cinematics === false && !force) return false;
  if(force) return true;
  if(state.used && state.used[cgIllustrationKey(id)]) return false;
  if(!state.used) state.used = {};
  state.used[cgIllustrationKey(id)] = true;
  save();
  return true;
}
function cgFxHtml(kind){
  return {
    rain:'<span class="cg-rain cg-r1"></span><span class="cg-rain cg-r2"></span>',
    policeTape:'<span class="cg-police-tape">POLICE LINE</span>',
    neon:'<span class="cg-neon cg-n1"></span><span class="cg-neon cg-n2"></span>',
    glow:'<span class="cg-soft-glow"></span>',
    glassRain:'<span class="cg-glass-rain"></span>',
    fluorescent:'<span class="cg-fluorescent"></span>',
    monitor:'<span class="cg-monitor-red"></span>',
    phoneGlow:'<span class="cg-phone-glow"></span>',
    dust:'<span class="cg-dust cg-d1"></span><span class="cg-dust cg-d2"></span>',
    windowRain:'<span class="cg-window-rain"></span>',
    redThread:'<span class="cg-red-thread rt1"></span><span class="cg-red-thread rt2"></span><span class="cg-red-thread rt3"></span>',
    screenGlow:'<span class="cg-screen-glow"></span>',
    fog:'<span class="cg-fog f1"></span><span class="cg-fog f2"></span>',
    warningLight:'<span class="cg-warning-light"></span>',
    windLines:'<span class="cg-wind w1"></span><span class="cg-wind w2"></span>',
    tailLight:'<span class="cg-tail-light"></span>',
    projection:'<span class="cg-projection-beam"></span>',
    spotlight:'<span class="cg-spotlight c1"></span><span class="cg-spotlight c2"></span>',
    paperShadow:'<span class="cg-paper-shadow"></span>',
    cityGlow:'<span class="cg-city-glow"></span>'
  }[kind] || '';
}
function cgActorHtml(cfg){
  const meta = actorMeta(cfg.name);
  const emotion = cfg.emotion || characterCurrentEmotion(cfg.name) || 'neutral';
  const action = cfg.action || (actorActionState[cfg.name] && actorActionState[cfg.name].action) || baseActorAction(cfg.name) || 'idle';
  const drama = cfg.drama || currentDramaticState(cfg.name);
  const portrait = portraitForStage(cfg.name, emotion, drama);
  return `<div class="cg-actor pos-${cfg.pos||'center'} tone-${cfg.tone||'muted'} emotion-${emotion} action-${action}" style="--cg-actor:url('${portrait}');--cg-shift:${cfg.shift||'0px'};--cg-scale:${cfg.scale||1};"><div class="cg-actor-figure"></div><div class="cg-actor-nameplate"><strong>${safeHtml(meta.name)}</strong><span>${safeHtml(meta.role||'角色')} · ${drama ? dramaLabel(drama) : actionLabel(action)}</span></div></div>`;
}
function showCgIllustration(id, force=false){
  const node = cgIllustrationNodes[id];
  if(!node) return;
  if(!force && !shouldPlayCgIllustration(id)) return;
  const overlay = $('cgIllustrationOverlay');
  if(!overlay) return;
  $('cgKicker').textContent = node.kicker || 'CG ILLUSTRATION';
  $('cgModeLabel').textContent = node.modeLabel || '关键画面';
  $('cgTitle').textContent = node.title || '';
  $('cgNarration').textContent = node.narration || '';
  $('cgNarration').style.display = node.narration ? '' : 'none';
  $('cgCaption').textContent = node.caption || '';
  const scene = $('cgScene');
  scene.className = `cg-scene type-${node.mood||'rain'}`;
  scene.dataset.cgId = id;
  $('cgBackdrop').style.backgroundImage = `url('${node.bg || (scenes[node.scene]||{}).art || ''}')`;
  $('cgFx').innerHTML = (node.fx||[]).map(cgFxHtml).join('');
  $('cgActors').innerHTML = (node.characters||[]).map(cgActorHtml).join('');
  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden','false');
  document.body.classList.add('cg-open');
  if(typeof pulseCamera === 'function') pulseCamera(node.mood==='court'?'split':'medium', node.title || '关键画面', 950, {focus:(node.characters&&node.characters[0]&&node.characters[0].name)||''});
  playSfx(node.mood==='court' || node.mood==='finale' ? 'court' : 'click');
}
function queueCgIllustration(id, delay=360, force=false){
  if(!cgIllustrationNodes[id]) return;
  if(!force && !shouldPlayCgIllustration(id)) return;
  const launch = ()=>{
    if(canShowCgIllustrationNow()) showCgIllustration(id, true);
    else pendingCgIllustration = id;
  };
  setTimeout(launch, delay);
}
function flushPendingCgIllustration(){
  if(!pendingCgIllustration) return;
  if(!canShowCgIllustrationNow()) return;
  const id = pendingCgIllustration;
  pendingCgIllustration = null;
  showCgIllustration(id, true);
}
function closeCgIllustration(){
  const overlay = $('cgIllustrationOverlay');
  if(!overlay) return;
  overlay.classList.add('hidden');
  overlay.setAttribute('aria-hidden','true');
  document.body.classList.remove('cg-open');
}
function queueSceneCgIllustration(sceneId, first, opts={}){
  const id = cgSceneMap[sceneId];
  if(!id || (!first && !opts.forceSplash)) return;
  queueCgIllustration(id, 1750, false);
}
function queueEvidenceCgIllustration(name){
  const id = cgEvidenceMap[name];
  if(!id) return;
  queueCgIllustration(id, 520, false);
}
function queueDialogueCgIllustration(name, role, text){
  const line = String(text||'').trim();
  if(/我反对|真相|不是推论|完整责任链|终局/.test(line)){
    queueCgIllustration('court_submission', 420, false);
  }
}

const sceneCinematicMeta = {
  city:{kicker:'第一案 · 雨夜入口', title:'商业区路口', body:'商业区路口调查开始。'},
  store:{kicker:'第一案 · 案发现场', title:'便利店现场', body:'便利店现场调查开始。'},
  meeting:{kicker:'第一案 · 会见', title:'玻璃两侧', body:'会见室询问开始。'},
  office:{kicker:'推理中枢', title:'律所证据墙', body:'证据墙已打开。'},
  court:{kicker:'第一案 · 庭审', title:'雨停之前', body:'第一案法庭阶段开始。'},
  hospital:{kicker:'第二案 · 医院', title:'沉默账本', body:'医院调查开始。'},
  dock:{kicker:'第二案 · 旧码头', title:'9 号仓库', body:'旧码头调查开始。'},
  court2:{kicker:'第二案 · 庭审', title:'谁布置了刀', body:'第二案法庭阶段开始。'},
  archive:{kicker:'第三案 · 档案中心', title:'灰塔匿名函', body:'档案中心调查开始。'},
  rooftop:{kicker:'第三案 · 天台', title:'金融街天台', body:'金融街天台调查开始。'},
  court3:{kicker:'终局 · 完整责任链', title:'最终审判', body:'终审阶段开始。'}
};
function safeHtml(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function cinematicKey(kind,id){return `cinematic:${kind}:${id}`}
function shouldPlayCinematic(key){
  if(state.settings && state.settings.cinematics === false) return false;
  if(state.used && state.used[key]) return false;
  if(!state.used) state.used = {};
  state.used[key] = true;
  save();
  return true;
}
function showCinematic(mode, payload={}, callback=null){
  if(state.settings && state.settings.cinematics === false){ if(callback) callback(); return; }
  const overlay = $('cinematicOverlay');
  if(!overlay){ if(callback) callback(); return; }
  cinematicCallback = callback;
  overlay.className = `cinematic-overlay mode-${mode||'title'}`;
  overlay.setAttribute('aria-hidden','false');
  document.body.classList.add('cinematic-open');
  $('cinematicKicker').textContent = payload.kicker || 'CUTSCENE';
  $('cinematicModeLabel').textContent = payload.modeLabel || (mode==='evidence'?'证据特写':mode==='impact'?'关键台词':mode==='confrontation'?'对峙分镜':mode==='deduction'?'推理分镜':'章节分镜');
  $('cinematicTitle').textContent = payload.title || '';
  $('cinematicBody').textContent = payload.body || '';
  $('cinematicAsset').innerHTML = payload.asset || '';
  $('cinematicChain').innerHTML = payload.chain || '';
  playSfx(mode==='impact'||mode==='confrontation'?'court':mode==='evidence'||mode==='deduction'?'evidence':'click');
}
function closeCinematic(){
  const overlay = $('cinematicOverlay');
  if(!overlay) return;
  overlay.classList.add('hidden');
  overlay.setAttribute('aria-hidden','true');
  document.body.classList.remove('cinematic-open');
  const cb = cinematicCallback;
  cinematicCallback = null;
  if(cb) cb();
  setTimeout(flushPendingCgIllustration, 40);
}
function queueSceneCinematic(id, scene, kicker, first, opts={}){
  const meta = sceneCinematicMeta[id];
  if(!meta) return;
  if(!first && !opts.forceSplash) return;
  const key = cinematicKey('scene', id);
  if(!shouldPlayCinematic(key)) return;
  setTimeout(()=>showCinematic('title', {kicker:meta.kicker||kicker, title:meta.title||scene.name, body:meta.body||scene.desc}), 580);
}
function queueEvidenceCinematic(name){
  if(!name) return;
  const key = cinematicKey('evidence', name);
  if(!shouldPlayCinematic(key)) return;
  const icon = iconFor(name), hint = hintFor(name);
  const asset = `<div class="cinematic-evidence-card"><div class="cinematic-evidence-icon">${icon}</div><div><span>NEW EVIDENCE</span><strong>${safeHtml(name)}</strong><p>${safeHtml(hint)}</p></div></div>`;
  setTimeout(()=>{ if(typeof showObjectCloseup==='function' && shouldShowObjectCloseup(name)) showObjectCloseup(name); else showCinematic('evidence', {kicker:'证据入档', title:name, body:hint, asset}); }, 180);
}
function queueDeductionCinematic(name){
  if(!name) return;
  const key = cinematicKey('deduction', name);
  if(!shouldPlayCinematic(key)) return;
  const chain = `<div class="cinematic-stamp">推理成立</div>`;
  setTimeout(()=>showCinematic('deduction', {kicker:'DEDUCTION COMPLETE', title:name, body:'推理已写入卷宗。', chain}), 180);
}
function queueDialogueCinematic(id,d){
  const meta = {
    final1:{kicker:'第一案 · 法庭对决', title:'终案推理', body:'请选择本案核心证据链。'},
    final2:{kicker:'第二案 · 法庭对决', title:'幕后结构', body:'请选择第二案核心证据链。'},
    final3:{kicker:'第三案 · 终局审判', title:'匿名函的意义', body:'请选择第三案核心证据链。'},
    qiao:{kicker:'第三案 · 关键证词', title:'乔衡开口', body:'乔衡会见开始。'},
    moye:{kicker:'第二案 · 线人登场', title:'旧码头线人', body:'莫野会见开始。'}
  }[id];
  if(!meta) return;
  const key = cinematicKey('dialogue', id);
  if(!shouldPlayCinematic(key)) return;
  setTimeout(()=>showCinematic('confrontation', meta), 90);
  if(id==='final1') queueCase1CourtClimaxCue('climax');
}
function queueImpactCinematic(name, role, text){
  const shortText = String(text||'').trim();
  if(shortText.length>90) return;
  if(!/我反对|偏见|不是推论|真相|终局|完整责任链|监控黑屏不是故障|乔衡不是终点/.test(shortText)) return;
  const key = cinematicKey('impact', name+':'+shortText);
  if(!shouldPlayCinematic(key)) return;
  setTimeout(()=>showCinematic('impact', {kicker:role||'关键台词', title:name||'关键台词', body:shortText}), 120);
  queueDialogueCgIllustration(name, role, shortText);
}



const sceneDynamicsMeta = {
  city:{theme:'rain-neon', label:'雨夜路口', layers:['rain','headlights','neon','puddle']},
  store:{theme:'store-cold', label:'便利店现场', layers:['glassRain','fluorescent','monitor','dust']},
  meeting:{theme:'interrogation', label:'会见室冷光', layers:['glassReflection','coldPressure','dust']},
  office:{theme:'office-wall', label:'律所证据墙', layers:['windowRain','redThread','lampGlow','dust']},
  court:{theme:'courtroom', label:'第一案法庭', layers:['spotlight','paperShadow','projection']},
  hospital:{theme:'hospital', label:'医院走廊', layers:['fluorescent','medicalPulse','dust']},
  dock:{theme:'dock', label:'旧码头夜风', layers:['fog','warningLight','windLines']},
  court2:{theme:'courtroom', label:'第二案法庭', layers:['spotlight','paperShadow','projection']},
  archive:{theme:'archive', label:'档案中心', layers:['scanLight','dust','screenGlow']},
  rooftop:{theme:'rooftop', label:'金融街天台', layers:['windLines','cityLights','fog']},
  court3:{theme:'courtroom-final', label:'终局法庭', layers:['spotlight','projection','paperShadow']}
};
function dynamicLayerHtml(layer){
  const common = {
    rain:'<span class="dyn-rain r1"></span><span class="dyn-rain r2"></span>',
    headlights:'<span class="dyn-headlight h1"></span><span class="dyn-headlight h2"></span>',
    neon:'<span class="dyn-neon n1"></span><span class="dyn-neon n2"></span>',
    puddle:'<span class="dyn-puddle"></span>',
    glassRain:'<span class="dyn-glass-rain"></span>',
    fluorescent:'<span class="dyn-flicker"></span>',
    monitor:'<span class="dyn-monitor-dot"></span>',
    dust:'<span class="dyn-dust d1"></span><span class="dyn-dust d2"></span>',
    glassReflection:'<span class="dyn-glass-reflection"></span>',
    coldPressure:'<span class="dyn-cold-pressure"></span>',
    windowRain:'<span class="dyn-window-rain"></span>',
    redThread:'<span class="dyn-red-thread t1"></span><span class="dyn-red-thread t2"></span>',
    lampGlow:'<span class="dyn-lamp-glow"></span>',
    spotlight:'<span class="dyn-spotlight s1"></span><span class="dyn-spotlight s2"></span>',
    paperShadow:'<span class="dyn-paper-shadow"></span>',
    projection:'<span class="dyn-projection"></span>',
    medicalPulse:'<span class="dyn-medical-pulse"></span>',
    fog:'<span class="dyn-fog f1"></span><span class="dyn-fog f2"></span>',
    warningLight:'<span class="dyn-warning-light"></span>',
    windLines:'<span class="dyn-wind w1"></span><span class="dyn-wind w2"></span>',
    scanLight:'<span class="dyn-scan-light"></span>',
    screenGlow:'<span class="dyn-screen-glow"></span>',
    cityLights:'<span class="dyn-city-lights"></span>'
  };
  return common[layer] || '';
}
function renderSceneDynamics(){
  const layer = $('sceneMotionLayer');
  const art = $('locationArt');
  if(!layer || !art) return;
  const meta = sceneDynamicsMeta[state.scene] || {theme:'default', label:'场景环境', layers:['dust']};
  art.dataset.dynamicTheme = meta.theme;
  layer.className = `scene-motion-layer dynamic-${meta.theme}`;
  layer.innerHTML = `<div class="dynamic-label"><strong>ENV</strong><span>${uiSafe(meta.label)}</span></div>${meta.layers.map(dynamicLayerHtml).join('')}`;
}


function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function ensureAudio(){if(audio.started)return;const C=window.AudioContext||window.webkitAudioContext;if(!C)return;audio.ctx=new C();audio.master=audio.ctx.createGain();audio.musicGain=audio.ctx.createGain();audio.ambientGain=audio.ctx.createGain();audio.sfxGain=audio.ctx.createGain();audio.master.connect(audio.ctx.destination);audio.musicGain.connect(audio.master);audio.ambientGain.connect(audio.master);audio.sfxGain.connect(audio.master);const rain=audio.ctx.createBufferSource(),buf=audio.ctx.createBuffer(1,audio.ctx.sampleRate*2,audio.ctx.sampleRate),data=buf.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.45;audio.rainFilter=audio.ctx.createBiquadFilter();audio.rainFilter.type='lowpass';audio.rainFilter.frequency.value=1450;rain.buffer=buf;rain.loop=true;rain.connect(audio.rainFilter);audio.rainFilter.connect(audio.ambientGain);rain.start();audio.rainSource=rain;audio.droneA=audio.ctx.createOscillator();audio.droneB=audio.ctx.createOscillator();audio.droneA.type='sine';audio.droneB.type='triangle';audio.droneA.connect(audio.ambientGain);audio.droneB.connect(audio.ambientGain);audio.droneA.start();audio.droneB.start();audio.started=true;setSceneAudio(state.scene);applyAudioLevels()}
function applyAudioLevels(){if(!audio.ctx)return;const n=audio.ctx.currentTime,muted=!state.settings.audio,base=audio.currentPreset?audio.currentPreset.ambient:.28;if(audio.master)audio.master.gain.setTargetAtTime(muted?.0001:.92,n,.06);if(audio.musicGain)audio.musicGain.gain.setTargetAtTime(muted||!state.settings.music?.0001:.05*clamp(state.settings.musicVolume,0,1),n,.25);if(audio.ambientGain)audio.ambientGain.gain.setTargetAtTime(muted||!state.settings.ambient?.0001:.18*clamp(state.settings.ambientVolume,0,1)*base*2.2,n,.25);if(audio.sfxGain)audio.sfxGain.gain.setTargetAtTime(muted?.0001:.48*clamp(state.settings.sfxVolume,0,1),n,.05)}
function note(root,semi){return root*Math.pow(2,semi/12)}
function schedule(freq,dur,when,vol=.03,type='triangle'){if(!audio.ctx)return;const o=audio.ctx.createOscillator(),g=audio.ctx.createGain(),f=audio.ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=1200;o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,when);g.gain.linearRampToValueAtTime(vol,when+.12);g.gain.exponentialRampToValueAtTime(.0001,when+dur);o.connect(f);f.connect(g);g.connect(audio.musicGain);o.start(when);o.stop(when+dur+.05)}
function setSceneAudio(id){ensureAudio();if(!audio.ctx)return;const p=audioPresets[id]||audioPresets.city;audio.currentPreset=p;audio.nowPlaying=p.label;if($('musicNow'))$('musicNow').textContent=`BGM：${p.label}`;const n=audio.ctx.currentTime;if(audio.droneA)audio.droneA.frequency.setTargetAtTime(p.root/2,n,.4);if(audio.droneB)audio.droneB.frequency.setTargetAtTime(note(p.root,p.chord[p.chord.length-1])/2,n,.45);if(audio.rainFilter)audio.rainFilter.frequency.setTargetAtTime(id.includes('court')?900:id==='office'?1200:id==='hospital'?1600:1450,n,.5);if(audio.currentScene===id&&audio.musicTimer){applyAudioLevels();return}audio.currentScene=id;if(audio.musicTimer)clearInterval(audio.musicTimer);const pulse=()=>{if(!audio.ctx||!state.settings.audio||!state.settings.music)return;const t=audio.ctx.currentTime+.02,ch=p.chord.map(s=>note(p.root,s));schedule(p.root/2,1.8,t,.024,'sine');schedule(ch[0],1.6,t+.12,.018);schedule(ch[1],1.35,t+.48,.014);schedule(ch[2],1.2,t+.82,.012,'sine')};pulse();audio.musicTimer=setInterval(pulse,p.tempo);applyAudioLevels()}
function playTone(freq=440,dur=.08,type='sine',vol=.08){if(!state.settings.audio)return;ensureAudio();if(!audio.ctx)return;if(audio.ctx.state==='suspended')audio.ctx.resume();const o=audio.ctx.createOscillator(),g=audio.ctx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,audio.ctx.currentTime);g.gain.exponentialRampToValueAtTime(vol,audio.ctx.currentTime+.01);g.gain.exponentialRampToValueAtTime(.0001,audio.ctx.currentTime+dur);o.connect(g);g.connect(audio.sfxGain);o.start();o.stop(audio.ctx.currentTime+dur+.02)}
function playSfx(k){const b=clamp(state.settings.sfxVolume,0,1),m={click:[520,.06,'triangle',.04*b],move:[340,.09,'sine',.05*b],evidence:[660,.18,'triangle',.07*b],combo:[780,.22,'sawtooth',.06*b],success:[920,.3,'triangle',.09*b],fail:[180,.18,'square',.07*b],court:[280,.16,'sawtooth',.08*b]};playTone(...(m[k]||m.click))}
function updateAudioUi(){if($('audioBtn')){$('audioBtn').textContent=`快速静音：${state.settings.audio?'关':'开'}`;$('audioBtn').classList.toggle('active-audio',state.settings.audio)}if($('musicNow'))$('musicNow').textContent=`BGM：${audio.nowPlaying||'未启动'}`;applyAudioLevels()}
function toggleAudio(){state.settings.audio=!state.settings.audio;ensureAudio();updateAudioUi();save();if(state.settings.audio)playSfx('click')}

function showToast(t,x){const s=$('toastStack');if(!s)return;const type=/证据/.test(t)?'evidence':/组合推理|推理/.test(t)?'combo':/失败|不足|未成立|错误/.test(t)?'fail':/成就/.test(t)?'success':'system';const d=document.createElement('div');d.className=`toast type-${type}`;d.innerHTML=`<strong>${t}</strong><p>${x}</p>`;s.appendChild(d);setTimeout(()=>{d.style.opacity='0';d.style.transform='translateY(8px)'},2800);setTimeout(()=>d.remove(),3300)}
function unlockAchievement(id){if(state.achievements.includes(id)||!achievementsMeta[id])return;state.achievements.push(id);showToast('成就解锁',achievementsMeta[id].title+' · '+achievementsMeta[id].desc);playSfx('success');save()}
function evaluateAchievements(){if(state.evidence.length>=1)unlockAchievement('firstEvidence');if(state.evidence.length>=10)unlockAchievement('evidenceHunter');if(state.evidence.length>=TOTAL_EVIDENCE)unlockAchievement('fullArchive');if(state.deductions.length>=1)unlockAchievement('comboApprentice');if(state.deductions.length>=combos.length)unlockAchievement('comboMaster');if(state.ethics>=5)unlockAchievement('ethicsHigh');['case1','case2','case3'].forEach((c,i)=>{if(caseDone(c))unlockAchievement(`case${i+1}Closer`)})}

function activateGameUI(){document.body.classList.add('scene-transitioning','game-running');document.body.classList.remove('home-running');$('startScreen').classList.remove('active');$('gameScreen').classList.add('active');clearTimeout(activateGameUI.timer);activateGameUI.timer=setTimeout(()=>document.body.classList.remove('scene-transitioning'),420)}
function showChapterSplash(k,t,d){if(typeof pulseCamera==='function') pulseCamera('black',k||'章节转场',420);const w=$('chapterSplash');if(!w)return;$('splashKicker').textContent=k;$('splashTitle').textContent=t;$('splashDesc').textContent=d;w.classList.remove('hidden');w.setAttribute('aria-hidden','false');clearTimeout(showChapterSplash.timer);showChapterSplash.timer=setTimeout(()=>{w.classList.add('hidden');w.setAttribute('aria-hidden','true')},1650)}
function visitScene(id){if(!state.visitedScenes)state.visitedScenes=[];const first=!state.visitedScenes.includes(id);if(first)state.visitedScenes.push(id);return first}
function currentChapter(){const s=scenes[state.scene];if(s.caseId==='hub')return chapters.find(c=>c.id===state.activeCase)||chapters[0];return chapters.find(c=>c.id===s.caseId)||chapters[0]}

const sceneHotspots = {
  city:[
    {id:'camera', action:'camera', x:28, y:20, label:'监控探头', tip:'检查缺失的 47 秒', kind:'evidence'},
    {id:'tyre', action:'tyre', x:52, y:73, label:'轮胎水痕', tip:'观察地面倒车痕迹', kind:'evidence'},
    {id:'plate', action:'plate', x:70, y:80, label:'排水沟反光物', tip:'需要先获得黑车证词', kind:'locked'},
    {id:'store', action:'store', x:78, y:43, label:'便利店灯光', tip:'进入案发现场', kind:'move'},
    {id:'meeting', action:'meeting', x:18, y:63, label:'警车方向', tip:'会见嫌疑人陈巍', kind:'move'}
  ],
  store:[
    {id:'receipt', action:'receipt', x:37, y:55, label:'收银台小票', tip:'核对付款时间', kind:'evidence'},
    {id:'blood', action:'blood', x:55, y:78, label:'地面痕迹', tip:'观察血滴方向', kind:'evidence'},
    {id:'network', action:'network', x:78, y:28, label:'路由器', tip:'检查网络日志', kind:'evidence'},
    {id:'sulan', action:'sulan', x:20, y:44, label:'苏岚', tip:'询问便利店店员', kind:'dialogue'},
    {id:'manager', action:'manager', x:86, y:58, label:'店长办公室', tip:'检查保险柜', kind:'locked'}
  ],
  meeting:[
    {id:'phone', action:'phone', x:36, y:58, label:'通话记录', tip:'调取手机记录', kind:'evidence'},
    {id:'stain', action:'stain', x:64, y:62, label:'外套袖口', tip:'检查机油痕迹', kind:'evidence'},
    {id:'chen', action:'chen', x:50, y:38, label:'陈巍', tip:'追问当晚细节', kind:'dialogue'},
    {id:'court', action:'court', x:78, y:33, label:'法庭传票', tip:'证据足够后进入庭审', kind:'move'}
  ],
  office:[
    {id:'combo', action:'combo', x:43, y:36, label:'证据墙', tip:'打开证据组合', kind:'system'},
    {id:'notebook', action:'notebook', x:62, y:62, label:'案件笔记', tip:'查看所有线索', kind:'system'},
    {id:'casehall', action:'casehall', x:24, y:61, label:'卷宗柜', tip:'切换案件章节', kind:'system'},
    {id:'map', action:'map', x:75, y:35, label:'城市地图', tip:'选择已解锁地点', kind:'system'},
    {id:'court', action:'court', x:52, y:78, label:'庭审准备', tip:'提交第一案证据', kind:'move'}
  ],
  court:[
    {id:'final1', action:'final1', x:50, y:40, label:'律师席', tip:'开始第一案终案推理', kind:'dialogue'},
    {id:'judge-seat', x:50, y:22, label:'审判席', tip:'观察庭审压力', kind:'inspect', speaker:'系统', role:'法庭观察', say:'审判席灯光已记录。'},
    {id:'witness-seat', x:24, y:50, label:'证人席', tip:'证词的重量', kind:'inspect', speaker:'系统', role:'法庭观察', say:'证人席已记录。'},
    {id:'office', action:'office', x:80, y:67, label:'退庭整理', tip:'返回律所补充证据', kind:'move'}
  ],
  hospital:[
    {id:'bill', action:'bill', x:32, y:58, label:'缴费机', tip:'查找受害人记录', kind:'evidence'},
    {id:'nurseLog', action:'nurseLog', x:62, y:36, label:'交班本', tip:'查看午夜记录', kind:'evidence'},
    {id:'lina', action:'lina', x:78, y:54, label:'护士李娜', tip:'确认病历去向', kind:'dialogue'},
    {id:'dock', action:'dock', x:52, y:78, label:'账本地址', tip:'前往旧码头', kind:'move'},
    {id:'office', action:'office', x:18, y:30, label:'回律所', tip:'整理医院线索', kind:'move'}
  ],
  dock:[
    {id:'dockCam', action:'dockCam', x:28, y:27, label:'仓库监控', tip:'截取黑车画面', kind:'evidence'},
    {id:'seal', action:'seal', x:56, y:61, label:'9 号货柜', tip:'检查封条编号', kind:'evidence'},
    {id:'moye', action:'moye', x:76, y:44, label:'莫野', tip:'会见私家侦探', kind:'dialogue'},
    {id:'court2', action:'court2', x:82, y:76, label:'第二案法庭', tip:'证据足够后提交账本', kind:'move'},
    {id:'office', action:'office', x:18, y:72, label:'返回律所', tip:'整理码头线索', kind:'move'}
  ],
  court2:[
    {id:'final2', action:'final2', x:50, y:40, label:'质证中心', tip:'指出幕后结构', kind:'dialogue'},
    {id:'dock-chain', x:30, y:52, label:'账本投影', tip:'医院与码头的链条', kind:'inspect', speaker:'系统', role:'法庭观察', say:'投影幕上，医院账本和旧码头封条被并列放大。证据开始替沉默的人说话。'},
    {id:'gallery', x:72, y:54, label:'旁听席', tip:'沉默的压力', kind:'inspect', speaker:'系统', role:'法庭观察', say:'旁听席已记录。'},
    {id:'office', action:'office', x:80, y:67, label:'退庭整理', tip:'返回律所补充证据', kind:'move'}
  ],
  archive:[
    {id:'letter', action:'letter', x:30, y:38, label:'匿名函档案袋', tip:'检查寄件内容', kind:'evidence'},
    {id:'usb', action:'usb', x:62, y:54, label:'审计备份柜', tip:'提取删除数据', kind:'locked'},
    {id:'board', action:'board', x:78, y:30, label:'董事会排期表', tip:'查看会议时间', kind:'evidence'},
    {id:'qiao', action:'qiao', x:48, y:72, label:'乔衡笔录', tip:'追问最终委托人', kind:'dialogue'},
    {id:'rooftop', action:'rooftop', x:86, y:72, label:'金融街地址', tip:'前往终局现场', kind:'move'}
  ],
  rooftop:[
    {id:'access', action:'access', x:34, y:60, label:'电梯门禁', tip:'调取顶层记录', kind:'evidence'},
    {id:'film', action:'film', x:66, y:45, label:'广告灯箱', tip:'搜寻遗留底片', kind:'evidence'},
    {id:'court3', action:'court3', x:82, y:70, label:'终局法庭', tip:'提交灰塔匿名函', kind:'move'},
    {id:'wind', x:48, y:26, label:'天台风压', tip:'高处的沉默', kind:'inspect', speaker:'系统', role:'天台观察', say:'金融街天台风压已记录。'}
  ],
  court3:[
    {id:'final3', action:'final3', x:50, y:40, label:'终局审判', tip:'提交匿名函证据', kind:'dialogue'},
    {id:'greytower', x:27, y:52, label:'灰塔证据链', tip:'资金、门禁与底片', kind:'inspect', speaker:'系统', role:'法庭观察', say:'资金流、门禁记录和照片底片已列入证据表。'},
    {id:'judge-final', x:50, y:22, label:'审判席灯光', tip:'最终判词之前', kind:'inspect', speaker:'系统', role:'法庭观察', say:'审判席灯光已记录。'},
    {id:'office', action:'office', x:80, y:67, label:'回到律所', tip:'补充证据组合', kind:'move'}
  ]
};
function hotspotUsedKey(h){return `hot:${state.scene}:${h.id}`}
function isHotspotUsed(h, action){
  if(state.used && state.used[hotspotUsedKey(h)]) return true;
  if(action && action.evidence && state.evidence.includes(action.evidence)) return true;
  if(action && state.used && state.used[action.id]) return true;
  return false;
}
function renderHotspots(){
  const layer = $('hotspotLayer');
  if(!layer) return;
  const scene = scenes[state.scene];
  const list = sceneHotspots[state.scene] || [];
  if(!list.length){
    layer.innerHTML = '';
    return;
  }
  layer.innerHTML = list.map(h=>{
    const action = h.action ? scene.actions.find(a=>a.id===h.action) : null;
    const ok = action ? canUse(action) : true;
    const used = isHotspotUsed(h, action);
    const stateText = !ok ? 'LOCKED' : used ? 'DONE' : (h.kind === 'move' ? 'MOVE' : h.kind === 'dialogue' ? 'TALK' : h.kind === 'system' ? 'OPEN' : 'CHECK');
    return `<button class="scene-hotspot kind-${h.kind||'inspect'} ${used?'used':''}" style="left:${h.x}%;top:${h.y}%;" data-hotspot="${h.id}" ${ok?'':'disabled'}>
      <span class="hotspot-pulse"></span>
      <span class="hotspot-dot"></span>
      <span class="hotspot-label"><strong>${h.label}</strong><small>${ok?h.tip:(action&&action.locked)||'尚未解锁'}</small><em>${stateText}</em></span>
    </button>`;
  }).join('');
  document.querySelectorAll('[data-hotspot]').forEach(btn=>{
    btn.onclick = () => {
      const h = (sceneHotspots[state.scene] || []).find(x=>x.id===btn.dataset.hotspot);
      if(!h) return;
      state.used[hotspotUsedKey(h)] = true;
      if(h.action){
        const action = scenes[state.scene].actions.find(a=>a.id===h.action);
        handleAction(action,'hotspot');
        return;
      }
      playSfx('click');
      say(h.speaker || '系统', h.role || '现场观察', h.portrait || '', h.say || h.tip || '这里值得记录。');
      render();
    };
  });
}


function applyCase1SceneEntryCue(sceneId){
  const map = {city:'opening', store:'store_entry', meeting:'meeting_entry', office:'office_wall', court:'court_open'};
  if(map[sceneId]) setTimeout(()=>applyCase1DirectingCue(map[sceneId], {toast:false, duration:820}), 240);
}

function go(id, narration=false){if(!scenes[id])return;return goScene(id,narration,{forceSplash:true})}
function goScene(id,narration='你移动到新的地点。',opts={}){const first=visitScene(id);state.scene=id;if(narration!==false)say(opts.speaker||'系统',opts.role||'调查记录',opts.portrait||'',narration||'你移动到新的地点。');render();applyCase1SceneEntryCue(id);applyCase2SceneEntryCue(id);applyCase3SceneEntryCue(id);if(first||opts.forceSplash){const s=scenes[id],k=opts.kicker||(s.caseId==='case3'?'第三案：灰塔匿名函':s.caseId==='case2'?'第二案：沉默账本':s.caseId==='hub'?'推理中枢':'第一案：雨夜证词');showChapterSplash(k,s.name,s.desc);queueSceneCinematic(id,s,k,first,opts);queueSceneCgIllustration(id,first,opts);if(id==='court'){queueCase1CourtClimaxCue('open');maybeShowFirstRunHint('court')}}}
function render(){
  const s=scenes[state.scene];
  if(document.body) document.body.dataset.scene=state.scene;
  if(s.caseId!=='hub') state.activeCase=s.caseId;
  const ch=currentChapter();
  $('chapterKicker').textContent=ch.title;
  $('chapterTitle').textContent=s.name;
  $('phaseBadge').textContent=s.phase;
  $('locationName').textContent=s.name;
  $('locationDesc').textContent=s.desc;
  const art=$('locationArt');
  art.style.backgroundImage=`url("${s.art}")`;
  art.classList.remove('scene-animate');
  void art.offsetWidth;
  art.classList.add('scene-animate');
  $('truthScore').textContent=`真相 ${state.truth}`;
  $('ethicsScore').textContent=`正义 ${state.ethics}`;
  $('evidenceCount').textContent=`${state.evidence.length} / ${TOTAL_EVIDENCE}`;
  $('objectiveTitle').textContent=s.phase.includes('推理')?'组合证据链':s.phase.includes('庭审')||s.phase.includes('终审')?'完成法庭对决':'找到关键线索';
  $('objectiveText').textContent=s.phase.includes('庭审')||s.phase.includes('终审')?'完成证据提交与终案推理。':'继续调查并补齐证据。';
  $('locks').innerHTML=(s.locks||[]).map(l=>`<div class="lock">${l}</div>`).join('');
  $('locationActions').innerHTML=s.actions.map(a=>{const ok=canUse(a);return`<button class="action" data-action="${a.id}" ${ok?'':'disabled'}><strong>${a.icon||'◆'} ${a.title}</strong><small>${ok?a.text:(a.locked||'尚未解锁')}</small></button>`}).join('');
  $('evidenceList').innerHTML=state.evidence.length?state.evidence.map(e=>`<div class="evidence"><div class="icon">${iconFor(e)}</div><div><strong>${e}</strong><small>${hintFor(e)}</small></div></div>`).join(''):`<p style="color:#8fa7be;line-height:1.7">证据包空空如也。城市不会主动开口，你得先敲门。</p>`;
  $('chapterNav').innerHTML=ch.phases.map(p=>`<span class="${p===s.phase?'active':(p==='终局'&&caseDone(ch.id)?'done':'')}">${p}</span>`).join('');
  setSceneAudio(state.scene);
  setSceneCamera(state.scene);
  updateAudioUi();
  renderSceneDynamics();
  renderActorStage();
  renderHotspots();
  maybeShowFirstRunHint('scene');
  bindActions();
  renderTaskTracker();
  evaluateTaskProgress();
  evaluateAchievements();
  maybeTriggerCase1DirectorCue();
  save();
}

function dialogueModeFor(name, role, text){
  const shortText = String(text || '').trim();
  if(name === '系统' || /系统|案件推进|调查记录|存档管理/.test(role || '')) return 'system';
  if(/获得证据|新增推理|组合推理|推理完成|证据/.test(shortText) && shortText.length < 80) return 'evidence';
  if(/我反对|偏见|不是推论|真相|终局|完整责任链|乔衡不是终点|监控黑屏不是故障/.test(shortText) && shortText.length <= 90) return 'impact';
  if(!name || name === '旁白') return 'narration';
  return 'dialogue';
}
function setDialogueMode(name, role, text){
  const panel = $('dialoguePanel') || document.querySelector('.dialogue-panel');
  if(!panel) return;
  const mode = dialogueModeFor(name, role, text);
  panel.classList.remove('mode-dialogue','mode-system','mode-evidence','mode-impact','mode-narration');
  panel.classList.add(`mode-${mode}`);
  const status = $('speakerStatus');
  if(status){
    status.textContent = mode === 'system' ? 'SYSTEM LOG' :
      mode === 'evidence' ? 'EVIDENCE' :
      mode === 'impact' ? 'KEY LINE' :
      mode === 'narration' ? 'NARRATION' : 'ON RECORD';
  }
}

function typeText(text){
  const el=$('dialogueText');
  const panel=$('dialoguePanel') || document.querySelector('.dialogue-panel');
  if(!state.settings.typewriter){
    el.textContent=text;
    el.classList.remove('typing');
    if(panel) panel.classList.remove('is-speaking');
    return;
  }
  el.textContent='';
  el.classList.add('typing');
  if(panel){
    panel.classList.add('is-speaking');
    clearTimeout(typeText.speakingTimer);
  }
  let i=0;
  clearInterval(typeText.timer);
  const mode = panel && panel.classList.contains('mode-impact') ? 'impact' : panel && panel.classList.contains('mode-system') ? 'system' : 'dialogue';
  const baseDelay = mode === 'impact' ? 28 : mode === 'system' ? 18 : 14;
  function tick(){
    const ch = text.charAt(i);
    el.textContent = text.slice(0,i+1);
    i++;
    if(i>=text.length){
      clearInterval(typeText.timer);
      el.classList.remove('typing');
      if(panel) typeText.speakingTimer=setTimeout(()=>panel.classList.remove('is-speaking'),260);
      return;
    }
    if(/[。！？；]/.test(ch)){
      clearInterval(typeText.timer);
      setTimeout(()=>{typeText.timer=setInterval(tick,baseDelay)}, mode === 'impact' ? 180 : 90);
    }
  }
  typeText.timer=setInterval(tick,baseDelay);
}

function choiceTone(c){
  const text = String((c && c.text) || '');
  if(c && c.cls === 'good') return 'key';
  if(c && (c.ending === 'bad' || c.cls === 'danger')) return 'risk';
  if(c && c.ending) return c.ending === 'partial' ? 'caution' : 'key';
  if(/证据|推理|监控|账本|匿名函|黑车|链|矛盾|为什么|调取|检查|查看|确认|指出|提交/.test(text)) return 'reasoning';
  if(/结束|返回|关闭/.test(text)) return 'plain';
  return 'dialogue';
}
function choiceIconFor(c){
  const tone = choiceTone(c);
  if(tone === 'key') return '◆';
  if(tone === 'risk') return '!';
  if(tone === 'caution') return '◇';
  if(tone === 'reasoning') return '⌁';
  return '›';
}


function lineBreakKeyPhrases(text=''){
  let t = String(text || '');
  const replacements = [
    ['我没刺他！我到的时候他已经倒下了。有人打电话让我改路线，我以为只是吵架。','我没刺他！\n我到的时候，他已经倒下了。\n有人打电话让我改路线。'],
    ['我不是不想报警。我真的打不出去，后来……我怕店长知道我多说话。','我不是不想报警。\n我真的打不出去。\n后来……我怕店长知道我多说话。'],
    ['苏岚沉默了很久，交出一段未发送语音：‘他不是凶手，店外还有一辆黑车。’','苏岚交出一段未发送语音。\n“他不是凶手，店外还有一辆黑车。”'],
    ['因为我现在没有退路。','因为我现在没有退路。'],
    ['请选择本案的核心证据链。','请选择本案的核心证据链。']
  ];
  replacements.forEach(([a,b])=>{ t = t.replace(a,b); });
  return t;
}
function directingCueForDialogue(name, text=''){
  const t = String(text||'');
  if(name==='苏岚' && /未发送语音|黑车|打不出去|店长/.test(t)) return /交出|黑车|语音/.test(t) ? 'sulan_confess' : 'sulan_voice';
  if(name==='陈巍' && /我没刺|匿名|路线|订单|袖口/.test(t)) return /订单|伪造|完了|不知道/.test(t) ? 'chenwei_break' : 'chenwei_call';
  if(name==='陆沉' && state.scene==='court') return /核心证据链|我反对|提交|证据/.test(t) ? 'court_submit' : 'court_open';
  if(name==='乔衡' && (state.scene==='archive'||state.scene==='rooftop'||state.scene==='court3'||state.activeCase==='case3') && /灰塔|转账|匿名函|账本|壳公司|沉默/.test(t)) return 'qiao_money';
  if(name==='乔衡' && /没有退路|删|证据|灰塔|账本/.test(t)) return 'qiao_break';
  if(name==='李娜' && /病历|账本|调取|手术费|威胁/.test(t)) return /账本|只看到|作证/.test(t) ? 'lina_ledger' : 'hospital_log';
  if(name==='莫野' && /录音|码头|货柜|委托|终点/.test(t)) return /录音|递来/.test(t) ? 'moye_recording' : 'dock_camera';
  if(name==='陆沉' && state.scene==='court2') return 'case2_submit';
  if(name==='陆沉' && state.scene==='court3') return 'case3_submit';
  if(name==='韩亦' && /路线|核对|记录|法庭|档案|审计/.test(t)) return state.scene==='court3' ? 'case3_submit' : state.scene==='court2' ? 'case2_submit' : state.activeCase==='case3' ? 'case3_office' : 'case2_office';
  return '';
}

function say(n,r,p,t,choices=[]){stageCurrentSpeaker=n||'系统';const inferredEmotion=inferActorEmotion(stageCurrentSpeaker,r,t);const inferredDrama=inferCase2DramaticState(stageCurrentSpeaker,r,t) || inferCase1DramaticState(stageCurrentSpeaker,r,t);setActorEmotion(stageCurrentSpeaker,inferredEmotion,'dialogue');setActorDramaticState(stageCurrentSpeaker,inferredDrama,'dialogue');setActorAction(stageCurrentSpeaker,inferActorAction(stageCurrentSpeaker,r,t),'dialogue');setDialogueMode(n,r,t);queueImpactCinematic(n,r,t);const dialogueCue=directingCueForDialogue(stageCurrentSpeaker,t); if(dialogueCue) applyDirectorCue(dialogueCue,{toast:false,duration:920}); renderActorStage();applyDialogueCamera(n,r,t);$('speakerName').textContent=n;$('speakerRole').textContent=r;const dialoguePortrait=actorMetaMap[stageCurrentSpeaker]?portraitForStage(stageCurrentSpeaker,inferredEmotion,inferredDrama):p;$('speakerPortrait').style.backgroundImage=dialoguePortrait?`url("${dialoguePortrait}")`:'';const pacedText=lineBreakKeyPhrases(t);typeText(pacedText);$('choiceList').innerHTML=choices.map((c,i)=>`<button class="choice ${c.cls||(c.ending==='bad'?'danger':'')} tone-${choiceTone(c)}" data-choice="${i}"><span class="choice-index">${choiceIconFor(c)}</span><span class="choice-copy">${c.text}</span></button>`).join('')}
function handleAction(a,source='button'){
  if(!a || !canUse(a)) return;
  if(source==='hotspot' && !a.goto && !a.special){pulseCamera(a.dialogue?'close':'insert', a.title||'现场特写', a.dialogue?900:1100);if(a.evidence && state.evidence.includes(a.evidence)) setTimeout(()=>showObjectCloseup(a.evidence),120);}
  playSfx(source==='hotspot'?'move':'click');
  if(a.special==='combo') return showCombo();
  if(a.special==='notebook') return showNotebook();
  if(a.special==='map') return showMap();
  if(a.special==='casehall') return showCaseSelect();
  if(a.goto){
    playSfx('move');
    return goScene(a.goto,a.say||'你移动到新的地点。');
  }
  if(a.dialogue) return startDialogue(a.dialogue);
  if(!state.used[a.id]){
    state.truth+=a.truth||0;
    state.ethics+=a.ethics||0;
    addEvidence(a.evidence);
    state.used[a.id]=true;
  }
  say('韩亦','刑警 / 案件联络人','./assets/char_hanyi.jpg',a.say||'这条线索值得记录。');
  render();
}
function bindActions(){
  document.querySelectorAll('[data-action]').forEach(btn=>btn.onclick=()=>{
    const a=scenes[state.scene].actions.find(x=>x.id===btn.dataset.action);
    handleAction(a,'button');
  });
}
function startDialogue(id){const d=dialogues[id];queueDialogueCinematic(id,d);say(d.speaker,d.role,d.portrait,d.text,d.choices);document.querySelectorAll('[data-choice]').forEach(btn=>btn.onclick=()=>{playSfx('click');const c=d.choices[Number(btn.dataset.choice)];if(c.ending){if(id==='final1')queueCase1CourtClimaxCue(c.ending==='case1good'?'climax':'open');return finish(c.ending);}if(!state.used[id+c.text]){state.truth+=c.truth||0;state.ethics+=c.ethics||0;addEvidence(c.evidence);state.used[id+c.text]=true}say(d.speaker,d.role,d.portrait,c.response,d.choices);render()})}


function lockPageForModal(){
  document.body.classList.add('modal-open');
  const card = document.querySelector('#modal .modal-card');
  if(card) card.scrollTop = 0;
  const body = $('modalBody');
  if(body) body.scrollTop = 0;
}
function unlockPageForModal(){
  document.body.classList.remove('modal-open');
}

function showModal(t,b){$('modalTitle').textContent=t;$('modalBody').innerHTML=b;document.body.classList.add('modal-open');$('modal').classList.remove('hidden');lockPageForModal();$('modal').setAttribute('aria-hidden','false')}
function closeModal(){document.body.classList.remove('modal-open');$('modal').classList.add('hidden');unlockPageForModal();$('modal').setAttribute('aria-hidden','true')}

function enhanceInteractiveSurface(root=document){
  const selector = '.btn,.tiny,.mini-btn,.choice,.action,.combo,.casePick,.mapNode,.replay-card,.drag-evidence,.scene-hotspot,.stage-actor,.character-action-card,.evidence-present-card,[data-save-slot],[data-load-slot],[data-del-slot],[data-fill-combo],[data-replay],[data-map],[data-case],[data-combo]';
  root.querySelectorAll(selector).forEach(el=>{
    if(el.dataset.enhancedUi) return;
    el.dataset.enhancedUi = '1';
    el.addEventListener('mouseenter',()=>{ if(typeof playFileSfx === 'function') playFileSfx('hover'); });
  });
}
const originalShowModalStage3 = showModal;
showModal = function(t,b){
  originalShowModalStage3(t,b);
  setTimeout(()=>enhanceInteractiveSurface($('modalBody') || document),0);
};
const originalRenderStage3 = render;
render = function(){
  originalRenderStage3();
  setTimeout(()=>enhanceInteractiveSurface(document),0);
};

function showCombo(){const html=combos.map(c=>{const ok=c.req.every(r=>state.evidence.includes(r)),done=state.deductions.includes(c.result),label=c.caseId==='case1'?'第一案':c.caseId==='case2'?'第二案':'第三案';return`<button class="combo" data-combo="${c.id}" ${ok&&!done?'':'disabled'}><strong>${done?'✅ ':''}${label} · ${c.title}</strong><br><small>需要：${c.req.join(' / ')}${done?' · 已完成':ok?' · 可推理':' · 证据不足'}</small></button>`}).join('');showModal('证据组合推理',`<div class="combo-grid">${html}</div>`);document.querySelectorAll('[data-combo]').forEach(btn=>btn.onclick=()=>{const c=combos.find(x=>x.id===btn.dataset.combo);if(!c||!c.req.every(r=>state.evidence.includes(r))||state.deductions.includes(c.result))return;state.truth+=c.truth||0;state.ethics+=c.ethics||0;addDeduction(c.result);render();showModal(c.title,`<p>${c.text}</p><p><strong>新增推理：</strong>${c.result}</p><button class="btn gold" onclick="showCombo()">继续组合</button>`)})}
function showNotebook(){const ev=state.evidence.map(e=>`<div class="note"><strong>${iconFor(e)} ${e}</strong><p>${hintFor(e)}</p></div>`).join('')||'<p>暂无证据。</p>',de=state.deductions.map(d=>`<div class="note"><strong>🧠 ${d}</strong><p>由多项证据交叉验证得到。</p></div>`).join('')||'<p>暂无组合推理。</p>';showModal('案件笔记',`<h3>证据</h3><div class="note-grid">${ev}</div><h3>组合推理</h3><div class="note-grid">${de}</div>`)}
function showEvidenceAtlas(){
  const entries = Object.entries(evidenceMeta);
  const unlocked = entries.filter(([n]) => state.evidence.includes(n));
  const locked = entries.filter(([n]) => !state.evidence.includes(n));
  const all = entries.map(([n,m], idx) => {
    const unlockedNow = state.evidence.includes(n);
    return `<div class="evidence-dossier-card ${unlockedNow?'':'locked'}">
      <div class="evidence-dossier-head">
        <span class="evidence-id">EV-${String(idx+1).padStart(2,'0')}</span>
        <span class="evidence-state">${unlockedNow?'已归档':'未发现'}</span>
      </div>
      ${evidenceCardImage(n, unlockedNow)}
      <div class="evidence-dossier-body">
        <h3>${unlockedNow?n:'未发现证据'}</h3>
        <p>${unlockedNow?m[1]:'继续调查地点、询问证人或完成前置线索。'}</p>
      </div>
    </div>`;
  }).join('');
  const de = state.deductions.map((d, idx) => `<div class="evidence-dossier-card deduction-record">
    <div class="evidence-dossier-head">
      <span class="evidence-id">DX-${String(idx+1).padStart(2,'0')}</span>
      <span class="evidence-state">推理完成</span>
    </div>
    <div class="evidence-card-image deduction-image" style="background-image:url('${archiveBannerImages.evidence}')"></div>
    <div class="evidence-dossier-body">
      <h3>${d}</h3>
      <p>由多项证据交叉验证得到的有效推理链。</p>
    </div>
  </div>`).join('') || '<p class="archive-empty">暂无组合推理。</p>';
  showModal('证据图鉴', `
    <div class="archive-shell archive-evidence-shell">
      <div class="archive-header">
        <div>
          <p class="archive-kicker">EVIDENCE ATLAS</p>
          <h2>证据库 / 案件归档</h2>
          <p class="archive-summary">浏览已归档证据、未发现线索和已完成推理。</p>
        </div>
        <div class="archive-stats compact">
          <div class="archive-stat"><strong>${unlocked.length}</strong><span>已收集证据</span></div>
          <div class="archive-stat"><strong>${locked.length}</strong><span>未发现证据</span></div>
          <div class="archive-stat"><strong>${state.deductions.length}</strong><span>已完成推理</span></div>
        </div>
      </div>
      ${archiveBanner('evidence','EVIDENCE ATLAS')}
      <section class="archive-section">
        <div class="archive-section-head"><h3>证据总览</h3><span>全部条目</span></div>
        <div class="evidence-vault-grid">${all}</div>
      </section>
      <section class="archive-section">
        <div class="archive-section-head"><h3>组合推理归档</h3><span>Deduction Records</span></div>
        <div class="evidence-vault-grid deduction-grid">${de}</div>
      </section>
    </div>`)
}
function showGallery(){const items=Object.entries(scenes).filter(([id])=>!id.includes('court')).map(([id,s])=>`<div class="gallery-card"><div class="thumb" style="background-image:url('${s.art}')"></div><div class="gallery-body"><h3>${s.name}</h3><p>${s.desc}</p></div></div>`).join('');showModal('视觉图鉴',`<div class="gallery-grid"><div class="gallery-card"><div class="thumb cover" style="background-image:url('./assets/cover.jpg')"></div><div class="gallery-body"><h3>封面海报</h3><p>游戏主视觉。</p></div></div>${items}</div>`)}
function showCharacterCodex(){
  const html = characterCodex.map((c, idx) => {
    const linkedCase = /刑警|审计|匿名|律师|店长|证人/.test(c.role) ? '案件关联' : '资料记录';
    return `<div class="character-dossier-card">
      <div class="character-portrait" style="background-image:url('${c.portrait}')"></div>
      <div class="character-dossier-body">
        <div class="character-dossier-head">
          <span class="character-index">FILE ${String(idx+1).padStart(2,'0')}</span>
          <span class="role">${c.role}</span>
        </div>
        <h3>${c.name}</h3>
        <p class="character-subline">${linkedCase} · 人物档案</p>
        <p>${c.desc}</p>
      </div>
    </div>`;
  }).join('');
  showModal('角色档案', `
    <div class="archive-shell">
      <div class="archive-header">
        <div>
          <p class="archive-kicker">CHARACTER DOSSIER</p>
          <h2>角色档案 / 人物资料卡</h2>
          <p class="archive-summary">所有主要角色统一收录在人物档案页中，用更有层级的资料卡形式呈现。</p>
        </div>
        <div class="archive-stats compact">
          <div class="archive-stat"><strong>${characterCodex.length}</strong><span>角色条目</span></div>
          <div class="archive-stat"><strong>${state.completedCases.length}</strong><span>已完成案件</span></div>
        </div>
      </div>
      ${archiveBanner('character','CHARACTER DOSSIER')}
      <section class="archive-section">
        <div class="archive-section-head"><h3>人物资料库</h3><span>Profiles</span></div>
        <div class="character-dossier-grid">${html}</div>
      </section>
    </div>`)
}
function showAchievements(){
  const items = Object.entries(achievementsMeta);
  const unlockedCount = items.filter(([id]) => state.achievements.includes(id)).length;
  const html = items.map(([id,m], idx) => {
    const ok = state.achievements.includes(id);
    return `<div class="collection-card achievement-card-pro ${ok?'':'locked'}">
      <div class="collection-card-head">
        <span class="collection-code">AC-${String(idx+1).padStart(2,'0')}</span>
        <span class="collection-state">${ok?'已解锁':'未解锁'}</span>
      </div>
      <div class="collection-card-image" style="background-image:url('${achievementImageMap[id]||archiveBannerImages.achievement}')"></div>
      <div class="collection-rank">${ok?'★':'☆'}</div>
      <h3>${m.title}</h3>
      <p>${ok?m.desc:'继续推进剧情来解锁这个成就。'}</p>
    </div>`;
  }).join('');
  showModal('成就系统', `
    <div class="archive-shell">
      <div class="archive-header">
        <div>
          <p class="archive-kicker">ACHIEVEMENTS</p>
          <h2>成就收藏 / 奖励展示</h2>
          <p class="archive-summary">把已完成的关键里程碑和未完成目标，统一收纳成更有收藏感的展示页。</p>
        </div>
        <div class="archive-stats compact">
          <div class="archive-stat"><strong>${unlockedCount}</strong><span>已解锁成就</span></div>
          <div class="archive-stat"><strong>${items.length-unlockedCount}</strong><span>待解锁</span></div>
        </div>
      </div>
      ${archiveBanner('achievement','ACHIEVEMENTS')}
      <section class="archive-section">
        <div class="archive-section-head"><h3>成就陈列柜</h3><span>Reward Showcase</span></div>
        <div class="collection-grid">${html}</div>
      </section>
    </div>`)
}
function showEndingCollection(){
  const items = Object.entries(endingsMeta);
  const unlockedEnding = ([n]) => state.endings.includes(n)||(n.includes('法典')&&caseDone('case3'))||(n.includes('法域')&&caseDone('case2'))||(n.includes('雨停')&&caseDone('case1'));
  const count = items.filter(unlockedEnding).length;
  const html = items.map(([n,m], idx) => {
    const u = unlockedEnding([n,m]);
    return `<div class="collection-card ending-card-pro ${u?'':'locked'}">
      <div class="collection-card-head">
        <span class="collection-code">ED-${String(idx+1).padStart(2,'0')}</span>
        <span class="collection-state">${u?'已收藏':'未解锁'}</span>
      </div>
      <div class="collection-card-image" style="background-image:url('${endingImageMap[n]||archiveBannerImages.ending}')"></div>
      <div class="collection-rank rank-${(m.rank||'').toLowerCase()}">${u?m.rank:'?'}</div>
      <h3>${u?n:'未解锁结局'}</h3>
      <p>${u?m.desc:'继续推进调查、尝试不同选择来解锁新的结局。'}</p>
    </div>`;
  }).join('');
  showModal('结局收藏', `
    <div class="archive-shell">
      <div class="archive-header">
        <div>
          <p class="archive-kicker">ENDING COLLECTION</p>
          <h2>结局收藏 / 终局陈列</h2>
          <p class="archive-summary">整理已解锁与未解锁结局。</p>
        </div>
        <div class="archive-stats compact">
          <div class="archive-stat"><strong>${count}</strong><span>已解锁结局</span></div>
          <div class="archive-stat"><strong>${items.length-count}</strong><span>待解锁结局</span></div>
        </div>
      </div>
      ${archiveBanner('ending','ENDING COLLECTION')}
      <section class="archive-section">
        <div class="archive-section-head"><h3>终局收藏柜</h3><span>Endings Vault</span></div>
        <div class="collection-grid endings-grid">${html}</div>
      </section>
    </div>`)
}
function showCaseSelect(){
  const cases = [
    {id:'case1', title:'第一案：雨夜证词', subtitle:'便利店雨夜伤人案', intro:'便利店、黑车、伪造订单，一场被故意拖慢的报警开始把整座城市牵进来。', art:caseCoverImageMap.case1, entry:'city', status:caseDone('case1')?'已结案':'可进入', lock:false, stateLine:caseDone('case1')?'真相已完成，可回放。':'当前已开启，可直接进入。'},
    {id:'case2', title:'第二案：沉默账本', subtitle:'医院与旧码头的账本链条', intro:caseDone('case1')?'从医院病历追到旧码头货柜，补齐账本来源与委托链。':'完成第一案真相结局后解锁。', art:caseCoverImageMap.case2, entry:'hospital', status:caseDone('case2')?'已结案':caseDone('case1')?'可进入':'未解锁', lock:!caseDone('case1'), stateLine:caseDone('case2')?'第二案已完成。':caseDone('case1')?'已解锁，可继续调查。':'需要完成第一案真相结局。'},
    {id:'case3', title:'第三案：灰塔匿名函', subtitle:'灰塔资本与终局法庭', intro:caseDone('case2')?'从匿名函、审计资料和天台门禁中锁定灰塔资本。':'完成第二案终局后解锁。', art:caseCoverImageMap.case3, entry:'archive', status:caseDone('case3')?'终局完成':caseDone('case2')?'可进入':'未解锁', lock:!caseDone('case2'), stateLine:caseDone('case3')?'最终案件已完成。':caseDone('case2')?'已解锁，可进入终局调查。':'需要完成第二案终局。'}
  ];
  const html = cases.map((c, idx) => `<button class="casePick archive-case-card ${c.lock?'locked-case':'open-case'}" data-case="${c.id}" ${c.lock?'disabled':''}>
    <div class="archive-case-cover" style="background-image:url('${c.art}')">
      <span class="archive-case-id">CASE ${idx+1}</span>
      <span class="archive-case-status">${c.status}</span>
    </div>
    <div class="archive-case-body">
      <p class="archive-case-subtitle">${c.subtitle}</p>
      <h3>${c.title}</h3>
      <p>${c.intro}</p>
      <div class="archive-case-meta"><span>${c.stateLine}</span><span>${c.lock?'LOCKED':'OPEN'}</span></div>
    </div>
  </button>`).join('');
  showModal('案件大厅', `
    <div class="archive-shell">
      <div class="archive-header">
        <div>
          <p class="archive-kicker">CASE ARCHIVE</p>
          <h2>案件大厅 / 章节卷宗</h2>
          <p class="archive-summary">每个案件都以卷宗卡片形式展示，强化封面感、状态感和章节入口的沉浸度。</p>
        </div>
        <div class="archive-stats compact">
          <div class="archive-stat"><strong>${state.completedCases.length}</strong><span>已完成案件</span></div>
          <div class="archive-stat"><strong>${chapters.length}</strong><span>总案件数</span></div>
          <div class="archive-stat"><strong>${state.evidence.length}</strong><span>已收集证据</span></div>
        </div>
      </div>
      <section class="archive-section">
        <div class="archive-section-head"><h3>案件卷宗</h3><span>Case Files</span></div>
        <div class="case-file-grid">${html}</div>
      </section>
    </div>`);
  document.querySelectorAll('[data-case]').forEach(btn=>btn.onclick=()=>{const c=btn.dataset.case,target=c==='case1'?'city':c==='case2'?'hospital':'archive';closeModal();activateGameUI();goScene(target,c==='case1'?'重新进入第一案。':c==='case2'?'沉默账本，再次开始。':'灰塔匿名函，开始收束整座城市。',{forceSplash:true})})
}
function showMap(){const nodes=[['city','商业区路口','第一案现场',true,60,120],['store','便利店现场','第一案核心现场',true,310,80],['meeting','会见室','询问陈巍',true,610,130],['office','律所办公室','推理中枢',state.evidence.length>=4,300,290],['court','第一案法庭','完成第一案',state.evidence.length>=7,585,300],['hospital','云港医院','第二案入口',caseDone('case1'),65,425],['dock','旧码头仓库','追踪黑车',caseDone('case1'),305,500],['court2','第二案法庭','完成第二案',state.evidence.length>=14,590,500],['archive','市档案中心','第三案入口',caseDone('case2'),850,210],['rooftop','金融街天台','终局前夜',caseDone('case2'),1065,370],['court3','第三案法庭','终极结局',state.evidence.length>=20&&caseDone('case2'),900,575]];const lines='<div class="mapLine" style="left:205px;top:163px;width:145px;transform:rotate(-10deg)"></div><div class="mapLine" style="left:470px;top:150px;width:150px;transform:rotate(10deg)"></div><div class="mapLine" style="left:420px;top:215px;width:145px;transform:rotate(60deg)"></div><div class="mapLine" style="left:190px;top:378px;width:180px;transform:rotate(18deg)"></div><div class="mapLine" style="left:455px;top:455px;width:150px"></div><div class="mapLine" style="left:680px;top:290px;width:190px;transform:rotate(-20deg)"></div>';const html=nodes.map(([id,t,d,ok,x,y])=>`<button class="mapNode v4" style="left:${x}px;top:${y}px" data-map="${id}" ${ok?'':'disabled'}><h3>${ok?'◆':'◇'} ${t}</h3><p>${ok?d:'尚未解锁'}</p></button>`).join('');showModal('城市地图',`<div class="city-map-board">${lines}${html}</div>`);document.querySelectorAll('[data-map]').forEach(btn=>btn.onclick=()=>{closeModal();goScene(btn.dataset.map,'你抵达新的地点。',{role:'城市地图'})})}
function showTimeline(){
  const visited = (state.visitedScenes||[]);
  const visits = visited.map((id,i)=>{
    const s = scenes[id];
    if(!s) return '';
    const flags = [i===0?'is-first':'', i===visited.length-1?'is-latest':'', state.scene===id?'is-current':''].filter(Boolean).join(' ');
    const flagText = state.scene===id ? '当前地点' : i===visited.length-1 ? '最近推进' : i===0 ? '起点' : '节点';
    return `<div class="timeline-entry ${flags}">
      <div class="timeline-entry-rail"><span class="timeline-dot">${String(i+1).padStart(2,'0')}</span></div>
      <div class="timeline-entry-card">
        ${sceneCardImage(id)}
        <div class="timeline-entry-head"><h3>${s.name}</h3><span>${flagText}</span></div>
        <p class="timeline-entry-meta">${s.caseId==='hub'?'推理中枢':caseTitleById(s.caseId)} · ${s.phase}</p>
        <p>${s.desc}</p>
      </div>
    </div>`;
  }).join('') || '<p class="archive-empty">你还没有移动到新的地点。</p>';
  const ev = state.evidence.slice(-6).reverse().map((n, idx)=>`<div class="timeline-evidence-item"><div class="timeline-evidence-thumb" style="background-image:url('${evidenceImageMap[n]||archiveBannerImages.evidence}')"></div><div><strong>${n}</strong><small>${hintFor(n)}</small></div></div>`).join('') || '<p class="archive-empty">尚未获得证据。</p>';
  showModal('案件时间线', `
    <div class="archive-shell">
      <div class="archive-header">
        <div>
          <p class="archive-kicker">CASE TIMELINE</p>
          <h2>案件时间线 / 调查时间轴</h2>
          <p class="archive-summary">把地点推进与关键调查节点重组为更有调查感的时间轴页面。</p>
        </div>
        <div class="archive-stats compact">
          <div class="archive-stat"><strong>${visited.length}</strong><span>地点节点</span></div>
          <div class="archive-stat"><strong>${state.evidence.length}</strong><span>已收集证据</span></div>
          <div class="archive-stat"><strong>${state.deductions.length}</strong><span>已完成推理</span></div>
        </div>
      </div>
      <div class="timeline-archive-layout">
        ${archiveBanner('timeline','CASE TIMELINE')}
        <section class="archive-section timeline-main-board">
          <div class="archive-section-head"><h3>调查时间轴</h3><span>Investigation Route</span></div>
          <div class="timeline-rail-board">${visits}</div>
        </section>
        <aside class="timeline-archive-side">
          <div class="archive-side-card">
            <div class="archive-section-head"><h3>总体进度</h3><span>Progress</span></div>
            <div class="archive-mini-stats">
              <div class="archive-mini-stat"><strong>${state.completedCases.length}</strong><span>已完成案件</span></div>
              <div class="archive-mini-stat"><strong>${state.truth}</strong><span>真相值</span></div>
              <div class="archive-mini-stat"><strong>${state.ethics}</strong><span>正义值</span></div>
            </div>
          </div>
          <div class="archive-side-card">
            <div class="archive-section-head"><h3>最近证据</h3><span>Recent Evidence</span></div>
            <div class="timeline-evidence-list">${ev}</div>
          </div>
        </aside>
      </div>
    </div>`)
}
function showReplayPanel(){const unlocked=Object.entries(scenes).filter(([id,s])=>id==='office'||['city','store','meeting'].includes(id)||s.caseId==='case1'||(s.caseId==='case2'&&caseDone('case1'))||(s.caseId==='case3'&&caseDone('case2')));const html=unlocked.map(([id,s])=>`<button class="replay-card" data-replay="${id}"><div class="replay-thumb" style="background-image:url('${s.art}')"></div><div class="replay-body"><h3>${state.visitedScenes.includes(id)?'◆':'◇'} ${s.name}</h3><p>${s.phase}</p><small>${s.desc}</small></div></button>`).join('');showModal('章节回放',`<p>可快速跳转到已解锁章节。回放不会清空证据与存档。</p><div class="replay-grid">${html}</div>`);document.querySelectorAll('[data-replay]').forEach(btn=>btn.onclick=()=>{closeModal();activateGameUI();goScene(btn.dataset.replay,'你从章节回放进入该地点。',{forceSplash:true,role:'章节回放'})})}
function showDataPanel(){
  showModal('数据面板', `
    <div class="archive-shell">
      <div class="archive-header">
        <div>
          <p class="archive-kicker">DATA PANEL</p>
          <h2>数据面板 / 档案系统总览</h2>
          <p class="archive-summary">让原本偏后台的信息页升级为游戏内置资料室，总览当前项目结构与玩家进度。</p>
        </div>
        <div class="archive-stats compact">
          <div class="archive-stat"><strong>${chapters.length}</strong><span>案件</span></div>
          <div class="archive-stat"><strong>${Object.keys(scenes).length}</strong><span>场景</span></div>
          <div class="archive-stat"><strong>${Object.keys(evidenceMeta).length}</strong><span>证据</span></div>
          <div class="archive-stat"><strong>${combos.length}</strong><span>推理链</span></div>
        </div>
      </div>
      <div class="data-archive-grid">
        <section class="archive-section data-card wide">
          <div class="archive-section-head"><h3>项目结构</h3><span>Project Structure</span></div>
          <p>V10 起，案件、场景、证据、角色、对话、组合推理、结局和音频预设已抽离到 <code>data/game-data.js</code> 与 <code>data/game-data.json</code>，便于扩展与维护。</p>
          <div class="archive-mini-stats data-metrics">
            <div class="archive-mini-stat"><strong>${state.evidence.length}</strong><span>已发现证据</span></div>
            <div class="archive-mini-stat"><strong>${state.deductions.length}</strong><span>已完成推理</span></div>
            <div class="archive-mini-stat"><strong>${state.completedCases.length}</strong><span>已结案案件</span></div>
            <div class="archive-mini-stat"><strong>${(state.visitedScenes||[]).length}</strong><span>已访问节点</span></div>
          </div>
        </section>
        <section class="archive-section data-card">
          <div class="archive-section-head"><h3>扩展手册</h3><span>Authoring</span></div>
          <p>项目内附带 <code>docs/AUTHORING.md</code>，说明如何扩展案件、场景、证据、角色和对话。</p>
          <div class="save-actions">
            <button class="mini-btn" id="openReplayFromData">打开章节回放</button>
            <button class="mini-btn" id="openTimelineFromData">打开时间线</button>
          </div>
        </section>
        <section class="archive-section data-card">
          <div class="archive-section-head"><h3>当前状态</h3><span>Session Snapshot</span></div>
          <div class="data-key-list">
            <div><span>当前案件</span><strong>${caseTitleById(state.activeCase)}</strong></div>
            <div><span>当前场景</span><strong>${sceneTitleById(state.scene)}</strong></div>
            <div><span>最近阶段</span><strong>${(scenes[state.scene]||{}).phase || '调查阶段'}</strong></div>
          </div>
        </section>
      </div>
    </div>`);
  $('openReplayFromData').onclick=showReplayPanel;
  $('openTimelineFromData').onclick=showTimeline
}
function showSaveManager(){const cards=Array.from({length:MANUAL_SLOT_COUNT},(_,i)=>{const slot=i+1,rec=readSlot(slot);if(!rec||!rec.data)return`<div class="save-card"><h3>存档槽位 ${slot}</h3><p>当前为空。</p><div class="save-actions"><button class="mini-btn" data-save-slot="${slot}">保存当前进度</button></div></div>`;const d=rec.data;return`<div class="save-card"><h3>存档槽位 ${slot}</h3><p>${caseTitleById(d.activeCase || (scenes[d.scene]?scenes[d.scene].caseId:'case1'))} · ${sceneTitleById(d.scene)}</p><div class="save-meta"><div>时间：${fmt(rec.savedAt)}</div><div>证据：${(d.evidence||[]).length}/${TOTAL_EVIDENCE}</div><div>真相：${d.truth||0}</div><div>正义：${d.ethics||0}</div></div><div class="save-actions"><button class="mini-btn" data-load-slot="${slot}">读取</button><button class="mini-btn" data-save-slot="${slot}">覆盖</button><button class="mini-btn danger" data-del-slot="${slot}">删除</button></div></div>`}).join('');showModal('存档管理',`<p>自动存档会持续记录当前进度；这里提供 3 个手动槽位。</p><div class="save-grid">${cards}</div>`);document.querySelectorAll('[data-save-slot]').forEach(b=>b.onclick=()=>saveToSlot(Number(b.dataset.saveSlot)));document.querySelectorAll('[data-load-slot]').forEach(b=>b.onclick=()=>loadFromSlot(Number(b.dataset.loadSlot)));document.querySelectorAll('[data-del-slot]').forEach(b=>b.onclick=()=>deleteSlot(Number(b.dataset.delSlot)))}
function slotKey(i){return`${STORAGE_KEY}_slot${i}`}function readSlot(i){try{return JSON.parse(localStorage.getItem(slotKey(i))||'null')}catch(e){return null}}function fmt(ts){if(!ts)return'未存档';return new Date(ts).toLocaleString()}function saveToSlot(slot){localStorage.setItem(slotKey(slot),JSON.stringify({version:'V10',savedAt:Date.now(),data:JSON.parse(JSON.stringify(state))}));showSaveManager();showToast('手动存档完成',`进度已保存到槽位 ${slot}。`)}function loadFromSlot(slot){const rec=readSlot(slot);if(!rec||!rec.data)return showToast('读取失败',`槽位 ${slot} 为空。`);hydrate(rec.data);closeModal();activateGameUI();visitScene(state.scene);render();say('系统','存档管理','',`已从槽位 ${slot} 读取进度。`);showChapterSplash(currentChapter().title,scenes[state.scene].name,'手动存档读取成功。');save()}function deleteSlot(slot){localStorage.removeItem(slotKey(slot));showSaveManager();showToast('槽位已删除',`槽位 ${slot} 已清空。`)}
function showSettings(){showModal('声音与演出设置',`<div class="settings-grid"><div class="settings-card"><h3>总控制</h3><p>动态配乐、环境雨声与交互音效均由程序实时生成。</p><div class="toggle-line"><span>总音频：${state.settings.audio?'已开启':'已静音'}</span><button class="switch" id="toggleMaster">${state.settings.audio?'一键静音':'恢复声音'}</button></div></div><div class="settings-card"><h3>演出开关</h3><div class="toggle-line"><span>动态配乐：${state.settings.music?'开启':'关闭'}</span><button class="switch" id="toggleMusic">切换配乐</button></div><div class="toggle-line"><span>环境音：${state.settings.ambient?'开启':'关闭'}</span><button class="switch" id="toggleAmbient">切换环境音</button></div><div class="toggle-line"><span>打字机：${state.settings.typewriter?'开启':'关闭'}</span><button class="switch" id="toggleTypewriter">切换打字机</button></div></div><div class="settings-card"><h3>音量混音</h3><div class="range-row"><label>配乐音量 <strong id="musicVolVal">${Math.round(state.settings.musicVolume*100)}%</strong></label><input id="musicVol" type="range" min="0" max="100" value="${Math.round(state.settings.musicVolume*100)}"></div><div class="range-row"><label>环境音量 <strong id="ambientVolVal">${Math.round(state.settings.ambientVolume*100)}%</strong></label><input id="ambientVol" type="range" min="0" max="100" value="${Math.round(state.settings.ambientVolume*100)}"></div><div class="range-row"><label>音效音量 <strong id="sfxVolVal">${Math.round(state.settings.sfxVolume*100)}%</strong></label><input id="sfxVol" type="range" min="0" max="100" value="${Math.round(state.settings.sfxVolume*100)}"></div></div></div>`);$('toggleMaster').onclick=()=>{toggleAudio();showSettings()};$('toggleMusic').onclick=()=>{state.settings.music=!state.settings.music;updateAudioUi();save();showSettings()};$('toggleAmbient').onclick=()=>{state.settings.ambient=!state.settings.ambient;updateAudioUi();save();showSettings()};$('toggleTypewriter').onclick=()=>{state.settings.typewriter=!state.settings.typewriter;save();showSettings()};[['musicVol','musicVolume','musicVolVal'],['ambientVol','ambientVolume','ambientVolVal'],['sfxVol','sfxVolume','sfxVolVal']].forEach(([id,k,l])=>{$(id).oninput=()=>{state.settings[k]=Number($(id).value)/100;$(l).textContent=`${$(id).value}%`;updateAudioUi();save()}})}
function showIntro(startAfter=false){showModal('序章：雨落之前',`<p>22:13，商业区便利店的监控开始黑屏。有人把报警拖慢了 47 秒，也把一场普通债务纠纷推成蓄意误导。</p><div class="intro-flow"><div class="intro-card"><h3>雨夜</h3><p>每个人都只说一半真话。</p></div><div class="intro-card"><h3>城市</h3><p>便利店、医院、旧码头与金融街高楼，将在同一部法典里重新连接。</p></div><div class="intro-card"><h3>法庭</h3><p>你需要提交证据并完成推理。</p></div><div class="intro-card"><h3>终局</h3><p>完成三案后进入终局。</p></div></div><div class="intro-actions">${startAfter?'<button id="introStartNow" class="btn gold">带着序章开始新游戏</button>':'<button id="introEnterCase" class="btn gold">进入案件大厅</button>'}<button id="introCloseOnly" class="btn ghost">关闭</button></div>`);if($('introStartNow'))$('introStartNow').onclick=()=>{closeModal();enterGame(true)};if($('introEnterCase'))$('introEnterCase').onclick=()=>{closeModal();showCaseSelect()};$('introCloseOnly').onclick=closeModal}

function rememberEnding(t){if(!state.endings.includes(t))state.endings.push(t)}

function publicDemoFeedbackCta(context='demo'){
  return `<div class="public-demo-endcap">
    <p class="archive-kicker">PUBLIC DEMO FEEDBACK</p>
    <h3>试玩反馈</h3>
    <p>这是最终公开试玩准备版。通关任一案件或全流程后，可以复制反馈模板，记录卡点、误解点、设备信息和最需要优化的地方。</p>
    <button class="btn gold" onclick="showPublicDemoFeedback('${context}')">复制反馈模板</button>
  </div>`;
}
function showPublicDemoGuide(){
  showModal('公开试玩说明', `
    <div class="public-demo-modal">
      <div class="public-demo-hero">
        <p class="archive-kicker">V45 RESOURCE OPTIMIZATION</p>
        <h2>建议按三案顺序试玩</h2>
        <p>本候选版包含三个案件：第一案“雨夜证词”、第二案“沉默账本”、第三案“灰塔匿名函”。推荐从新游戏开始，按第一案 → 第二案 → 第三案顺序体验。</p>
      </div>
      <div class="public-demo-grid">
        <article><strong>推荐顺序</strong><span>第一案 → 第二案 → 第三案</span></article>
        <article><strong>预计时长</strong><span>第一案 25–40 分钟；全流程约 60–90 分钟</span></article>
        <article><strong>推荐浏览器</strong><span>Chrome / Edge / Safari 最新版</span></article>
        <article><strong>推荐设备</strong><span>桌面端最佳；手机竖屏可玩，横屏更舒适</span></article>
        <article><strong>声音建议</strong><span>建议开启声音，浏览器可能需要首次点击后才播放</span></article>
        <article><strong>存档说明</strong><span>存档保存在当前浏览器本地，换设备或清缓存会丢失</span></article>
      </div>
      <div class="public-demo-steps">
        <h3>建议游玩方式</h3>
        <ol>
          <li>从“新游戏”进入第一案。</li>
          <li>在场景中点击金色热点，收集证据。</li>
          <li>点击角色进行观察、追问、出示证据或请求提示。</li>
          <li>证据足够后回律所办公室，打开证据墙组合推理。</li>
          <li>完成轻解谜后进入法庭，提交关键证据。</li>
          <li>第一案结束后进入第二案，第二案结束后进入第三案。</li>
          <li>终局后复制反馈模板，记录卡点、误解点、设备和建议。</li>
        </ol>
      </div>
      <div class="save-actions">
        <button class="btn gold" onclick="closeModal();showIntro(true)">从第一案开始</button>
        <button class="btn ghost" onclick="showCaseSelect()">打开案件大厅</button>
        <button class="btn ghost" onclick="showPublicDemoFeedback('before-play')">查看反馈模板</button>
      </div>
    </div>`);
}
function showKnownIssues(){
  showModal('已知问题 / 试玩说明', `
    <div class="public-demo-modal">
      <p class="archive-kicker">KNOWN ISSUES</p>
      <h2>公开试玩注意事项</h2>
      <ul class="known-issues-list">
        <li><strong>音频播放</strong><span>浏览器通常需要玩家点击页面后才允许播放音频。</span></li>
        <li><strong>首次加载</strong><span>本版包含多张 CG 和角色状态图，首次打开可能需要等待数秒。</span></li>
        <li><strong>移动端画面</strong><span>手机竖屏已适配，极窄屏可能裁切宽幅 CG 边缘。</span></li>
        <li><strong>存档范围</strong><span>存档只保存在当前浏览器本地，清理浏览器数据会清除存档。</span></li>
        <li><strong>推荐顺序</strong><span>建议按第一案 → 第二案 → 第三案体验，避免跳案导致理解成本升高。</span></li>
        <li><strong>反馈重点</strong><span>请优先反馈卡住位置、看不清的界面、误解的任务提示和移动端点击问题。</span></li>
      </ul>
      <div class="save-actions">
        <button class="btn gold" onclick="showPublicDemoGuide()">查看试玩说明</button>
        <button class="btn ghost" onclick="showPublicDemoFeedback('known-issues')">复制反馈模板</button>
      </div>
    </div>`);
}
function textareaSafe(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')} 
function publicDemoFeedbackText(context='demo'){
  return `【法域之城 V54 Final Public Demo 试玩反馈】

一、基础信息
设备：
系统：
浏览器：
屏幕方向：横屏 / 竖屏
是否开启声音：
试玩时长：

二、游玩进度
试玩到哪里：第一案 / 第二案 / 第三案 / 终局
是否完成第一案：
是否完成第二案：
是否完成第三案：
如果未完成，停在哪个场景 / 按钮 / 提示：

三、是否卡住
是否不知道下一步去哪：
卡住位置：
当时看到的任务提示：
希望提示怎么改：

四、界面与操作
电脑端是否需要频繁上下滑：
手机端是否点得到热点 / 人物 / 按钮：
弹窗是否正确覆盖显示：
文字是否清楚：
CG / 场景图是否裁切严重：

五、体验感受
最喜欢的场景或演出：
最不清楚的玩法：
节奏是否过慢或过密：
哪个案件最完整：
哪个案件最需要继续打磨：

六、Bug 记录
是否出现无法继续：
是否出现按钮无反应：
是否出现存档 / 读档异常：
可复现步骤：

七、建议
最想优先优化的一件事：
其他备注：

反馈触发位置：${context}`;
}
function showPublicDemoFeedback(context='demo'){
  const text = publicDemoFeedbackText(context);
  showModal('试玩反馈模板', `
    <div class="public-demo-modal">
      <p class="archive-kicker">FEEDBACK TEMPLATE</p>
      <h2>复制下面的反馈模板</h2>
      <p>本 Demo 保持纯静态网页，不接入真实联网表单。请复制模板后发给作者，优先记录卡点、误解点、设备、浏览器和最影响体验的地方。</p>
      <textarea id="feedbackTemplateBox" class="feedback-template" readonly>${textareaSafe(text)}</textarea>
      <div class="save-actions">
        <button class="btn gold" onclick="copyPublicDemoFeedback()">复制模板</button>
        <button class="btn ghost" onclick="showPublicDemoGuide()">返回试玩说明</button>
      </div>
    </div>`);
}
function copyPublicDemoFeedback(){
  const box = $('feedbackTemplateBox');
  if(!box) return;
  box.removeAttribute('readonly');
  box.focus();
  box.select();
  box.setSelectionRange(0, box.value.length);
  const done = ()=>{box.setAttribute('readonly','readonly');showToast('已复制','反馈模板已复制。')};
  const fallback = ()=>{try{document.execCommand('copy');done()}catch(e){box.setAttribute('readonly','readonly');showToast('复制提示','已选中模板，请手动复制。')}};
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(box.value).then(done).catch(fallback);
  }else{
    fallback();
  }
}

function finish(type){let title,body,score='';const c1=state.deductions.includes('组合推理：陈巍不是伏击者')&&state.deductions.includes('组合推理：店外黑车袭击')&&state.deductions.includes('组合推理：店长与黑车有关')&&state.truth>=12,c2=state.deductions.includes('组合推理：受害人掌握地下账本')&&state.deductions.includes('组合推理：幕后委托人浮出')&&state.truth>=20,c3=state.deductions.includes('组合推理：灰塔资本介入灭口')&&state.deductions.includes('组合推理：终局委托人锁定')&&state.evidence.includes('灰塔转账凭证')&&state.truth>=28;if(type==='case1good'&&c1){if(!caseDone('case1'))state.completedCases.push('case1');title='第一案真相结局：雨停之前';applyCase1DirectingCue('ending', {toast:false, force:true});body=case1EndingBody()+publicDemoFeedbackCta('case1-ending');setCase1CourtDrama('ending');queueCase1CourtClimaxCue('truth');queueCase1CourtClimaxCue('hook');playSfx('success')}else if(type==='case2good'&&c2&&caseDone('case1')){if(!caseDone('case2'))state.completedCases.push('case2');title='第二案终局：法域之城';score=`<div class="score-grid"><div class="score"><strong>S</strong>第二案评级</div><div class="score"><strong>${state.truth}</strong>真相值</div><div class="score"><strong>${state.ethics}</strong>正义值</div><div class="score"><strong>${state.evidence.length}</strong>证据数</div></div>`;applyCase2DirectingCue('case2_ending',{toast:false,force:true});body=`${score}<p>医院账本、码头货柜和录音已提交。第三案已解锁。</p><button class="btn gold" onclick="goFinalCase()">进入第三案</button>`;playSfx('success')}else if(type==='case3good'&&c3&&caseDone('case2')){if(!caseDone('case3'))state.completedCases.push('case3');title='终极结局：完整责任链';score=`<div class="score-grid"><div class="score"><strong>SS</strong>终局评级</div><div class="score"><strong>${state.truth}</strong>真相值</div><div class="score"><strong>${state.ethics}</strong>正义值</div><div class="score"><strong>${state.evidence.length}</strong>证据数</div></div>`;applyCase3DirectingCue('case3_ending',{toast:false,force:true});body=`${score}<p>匿名函、审计 U 盘、天台门禁和转账凭证已提交。</p><button class="btn gold" onclick="resetGame()">重新开始</button>${publicDemoFeedbackCta('final-ending')}`;playSfx('success')}else if(type.includes('good')){title='证据不足';body='<p>证据链未完成。回到律所，完成对应案件的组合推理，再回到法庭。</p>';playSfx('court')}else if(type==='partial'){title='部分胜利：证据不足';body='<p>你指出了异常，但没有提交完整责任链。</p>';playSfx('court')}else{title='错误结局：证据不足';body='<p>你选择了动机，而不是证据，案件未能形成完整责任链。</p>';playSfx('fail')}rememberEnding(title);render();showModal(title,body)}
function goNextCase(){closeModal();goScene('hospital','线索指向云港医院。第二案开始。',{speaker:'韩亦',role:'刑警 / 案件联络人',portrait:'./assets/char_hanyi.jpg',forceSplash:true,kicker:'第二案：沉默账本'});setTimeout(()=>applyCase2DirectingCue('hospital_entry',{toast:false,force:true}),260)}
function goFinalCase(){closeModal();goScene('archive','一封匿名函被送到律所前台。第三案开始。',{speaker:'系统',role:'案件推进',forceSplash:true,kicker:'第三案：灰塔匿名函'});setTimeout(()=>applyCase3DirectingCue('archive_entry',{toast:false,force:true}),260)}
function resetGame(){document.body.classList.add('game-running');document.body.classList.remove('home-running');localStorage.removeItem(STORAGE_KEY);const settings={...state.settings};state={scene:'city',activeCase:'case1',completedCases:[],evidence:[],deductions:[],puzzles:[],truth:0,ethics:0,used:{},endings:[],achievements:[],settings,visitedScenes:[],introSeen:state.introSeen||false};closeModal();visitScene('city');render();say('系统','调查记录','','雨越下越密，你抵达商业区路口。');showChapterSplash('第一案：雨夜证词','商业区路口',scenes.city.desc);queueSceneCgIllustration('city',true,{forceSplash:true});showToast('游戏已重置','新的调查已经开始。');setTimeout(()=>maybeShowFirstRunHint('intro'),420)}
function enterGame(reset=false){ensureAudio();if(reset)resetGame();else{load();visitScene(state.scene);render()}activateGameUI();if(!reset)showChapterSplash(currentChapter().title,scenes[state.scene].name,scenes[state.scene].desc)}


const AUDIO_FILES = (GAME_DATA.metadata && GAME_DATA.metadata.audioFiles) || {};
const fileAudio = {music:null,ambient:null,currentMusicKey:'',ready:false};
const sceneMusicMap = {city:'bgm_investigation',store:'bgm_investigation',meeting:'bgm_deduction',office:'bgm_deduction',hospital:'bgm_investigation',dock:'bgm_rooftop',archive:'bgm_deduction',rooftop:'bgm_rooftop',court:'bgm_court',court2:'bgm_court',court3:'bgm_court'};
function initFileAudio(){
  if(fileAudio.ready || !state.settings.audioFiles) return;
  if(AUDIO_FILES.rain_loop){
    fileAudio.ambient = new Audio(AUDIO_FILES.rain_loop);
    fileAudio.ambient.loop = true;
    fileAudio.ambient.preload = 'auto';
  }
  fileAudio.ready = true;
  applyFileAudioLevels();
}
function applyFileAudioLevels(){
  const enabled = !!(state.settings.audio && state.settings.audioFiles);
  if(fileAudio.music) fileAudio.music.volume = enabled && state.settings.music ? 0.42 * (state.settings.fileMusicVolume ?? 0.62) : 0;
  if(fileAudio.ambient) fileAudio.ambient.volume = enabled && state.settings.ambient ? 0.34 * (state.settings.fileAmbientVolume ?? 0.55) : 0;
}
function tryPlayFileAudio(){
  if(!state.settings.audioFiles) return;
  initFileAudio();
  if(fileAudio.ambient) fileAudio.ambient.play().catch(()=>{});
  if(fileAudio.music) fileAudio.music.play().catch(()=>{});
}

function playTitleBgm(){
  if(!state.settings.audioFiles || !AUDIO_FILES.bgm_title) return;
  initFileAudio();
  const key = 'bgm_title';
  if(fileAudio.currentMusicKey !== key){
    if(fileAudio.music){ fileAudio.music.pause(); fileAudio.music = null; }
    fileAudio.music = new Audio(AUDIO_FILES.bgm_title);
    fileAudio.music.loop = true;
    fileAudio.music.preload = 'auto';
    fileAudio.currentMusicKey = key;
    audio.nowPlaying = '标题界面';
    if($('musicNow')) $('musicNow').textContent = 'BGM：标题界面';
  }
  applyFileAudioLevels();
  tryPlayFileAudio();
}

function setSceneFileAudio(sceneId){
  if(!state.settings.audioFiles) return;
  initFileAudio();
  const key = sceneMusicMap[sceneId] || 'bgm_city';
  const src = AUDIO_FILES[key];
  if(src && fileAudio.currentMusicKey !== key){
    if(fileAudio.music){ fileAudio.music.pause(); fileAudio.music = null; }
    fileAudio.music = new Audio(src);
    fileAudio.music.loop = true;
    fileAudio.music.preload = 'auto';
    fileAudio.currentMusicKey = key;
  }
  applyFileAudioLevels();
  tryPlayFileAudio();
}
function playFileSfx(kind){
  if(!state.settings.audio || !state.settings.audioFiles) return;
  const key = kind === 'move' ? 'sfx_click' : `sfx_${kind}`;
  const src = AUDIO_FILES[key] || AUDIO_FILES.sfx_click;
  if(!src) return;
  const a = new Audio(src);
  a.volume = 0.55 * (state.settings.sfxVolume ?? 0.82);
  a.play().catch(()=>{});
}

function showMusicCredits(){
  const credits = (GAME_DATA.metadata && GAME_DATA.metadata.musicCredits) || [];
  const html = credits.map(c => `<div class="note">
    <strong>${c.title}</strong>
    <p>${c.credit}</p>
    ${c.url ? `<p><small>Source: ${c.url}</small></p>` : ''}
  </div>`).join('');
  showModal('音乐署名 / Music Credits', `
    <p>以下 BGM 使用了可商用的免费授权音乐。Incompetech 免费 Creative Commons 授权需要在作品中保留署名；本页即为游戏内署名页。</p>
    <div class="note-grid">${html}</div>
    <p class="muted-note">如果未来购买免署名授权或替换为自有音乐，可以同步更新 data/game-data.json 与 data/game-data.js 中的 metadata.musicCredits。</p>
  `);
}

function showAudioPackPanel(){
  const files = Object.entries(AUDIO_FILES).map(([k,v])=>`<div class="note"><strong>${k}</strong><p>${v}</p></div>`).join('');
  showModal('真实音频包', `
    <div class="timeline-grid">
      <div class="timeline-card">
        <h3>音频包状态</h3>
        <p>当前版本使用本地标题/调查 BGM，并已接入 Incompetech 免费可商用 BGM 作为推理、法庭和终局音乐；请保留“音乐署名”页面。浏览器第一次播放需要点击页面授权。</p>
        <div class="toggle-line"><span>真实音频包：${state.settings.audioFiles?'开启':'关闭'}</span><button class="switch" id="toggleAudioFiles">切换音频包</button></div>
        <div class="range-row"><label>BGM 文件音量 <strong id="fileMusicVal">${Math.round((state.settings.fileMusicVolume??0.62)*100)}%</strong></label><input id="fileMusicVol" type="range" min="0" max="100" value="${Math.round((state.settings.fileMusicVolume??0.62)*100)}"></div>
        <div class="range-row"><label>雨声文件音量 <strong id="fileAmbientVal">${Math.round((state.settings.fileAmbientVolume??0.55)*100)}%</strong></label><input id="fileAmbientVol" type="range" min="0" max="100" value="${Math.round((state.settings.fileAmbientVolume??0.55)*100)}"></div>
        <div class="save-actions"><button class="mini-btn" id="testFileBgm">试听当前场景 BGM</button><button class="mini-btn" id="testFileSfx">试听音效</button></div>
      </div>
      <div class="timeline-card">
        <h3>素材清单</h3>
        <div class="note-grid">${files}</div>
        <p class="muted-note">替换自己的音频时，保持同名文件或同步修改 data/game-data.json 与 data/game-data.js。</p>
      </div>
    </div>`);
  $('toggleAudioFiles').onclick=()=>{state.settings.audioFiles=!state.settings.audioFiles;save();if(state.settings.audioFiles){setSceneFileAudio(state.scene)}else{if(fileAudio.music)fileAudio.music.pause();if(fileAudio.ambient)fileAudio.ambient.pause()}showAudioPackPanel()};
  $('fileMusicVol').oninput=()=>{state.settings.fileMusicVolume=Number($('fileMusicVol').value)/100;$('fileMusicVal').textContent=$('fileMusicVol').value+'%';applyFileAudioLevels();save()};
  $('fileAmbientVol').oninput=()=>{state.settings.fileAmbientVolume=Number($('fileAmbientVol').value)/100;$('fileAmbientVal').textContent=$('fileAmbientVol').value+'%';applyFileAudioLevels();save()};
  $('testFileBgm').onclick=()=>{setSceneFileAudio(state.scene);tryPlayFileAudio();showToast('正在试听','已尝试播放当前场景 BGM。')};
  $('testFileSfx').onclick=()=>playFileSfx('success');
}
const originalSetSceneAudio = setSceneAudio;
setSceneAudio = function(sceneId){ originalSetSceneAudio(sceneId); setSceneFileAudio(sceneId); };
const originalPlaySfx = playSfx;
playSfx = function(kind){ originalPlaySfx(kind); playFileSfx(kind); };
const originalUpdateAudioUi = updateAudioUi;
updateAudioUi = function(){ originalUpdateAudioUi(); applyFileAudioLevels(); };
document.addEventListener('click', tryPlayFileAudio, {once:true});
document.addEventListener('click', playTitleBgm, {once:true});


const VOICE_FILES = (GAME_DATA.metadata && GAME_DATA.metadata.voiceFiles) || {};
let boardSlots = [null, null, null];
let boardFeedback = {type:'idle', title:'推理待命', text:'从左侧卷宗区选择三条证据，让事实彼此作证。'};
function setBoardFeedback(type,title,text){boardFeedback={type:title?type:'idle',title:title||'推理待命',text:text||'从左侧卷宗区选择三条证据，让事实彼此作证。'}}
function syncBoardFeedback(){const current=boardSlots.filter(Boolean),matched=current.length===3?comboByEvidence(current):null;if(current.length===0)return setBoardFeedback('idle','推理待命','从左侧卷宗区选择三条证据，让事实彼此作证。');if(current.length<3)return setBoardFeedback('idle','链条搭建中',`还差 ${3-current.length} 条证据。拖拽或点按证据卡，让推理链完整落位。`);if(matched)return state.deductions.includes(matched.result)?setBoardFeedback('done','链条已归档',`这条推理已经完成：${matched.result}`):setBoardFeedback('ready','发现可成立链条',`${matched.title} · 按下“验证链条”确认推理。`);return setBoardFeedback('warning','链条存在断点','这三条证据之间仍有空缺。试着更换其中一张证据。')}

function normalizedSet(list){ return [...list].sort().join('||'); }
function comboByEvidence(list){
  const key = normalizedSet(list);
  return combos.find(c => normalizedSet(c.req) === key);
}
function renderDeductionBoard(){
  const have = state.evidence || [];
  const cards = have.length ? have.map((name, index) => {
    const used = boardSlots.includes(name);
    const meta = evidenceMeta[name] || ['🔎','等待与其他证据交叉印证。'];
    return `<button class="drag-evidence ${used?'used':''}" draggable="true" data-board-evidence="${name}">
      <div class="evidence-card-top"><span class="evidence-chip">证物 ${String(index+1).padStart(2,'0')}</span><span class="evidence-icon">${meta[0]}</span></div>
      <strong>${name}</strong>
      <small>${meta[1]}</small>
      <span class="drag-tip">${used?'已放入链条':'拖拽 / 点按放入槽位'}</span>
    </button>`;
  }).join('') : `<p class="board-empty-copy">你还没有证据。先去现场调查，城市会把第一枚齿轮吐出来。</p>`;
  const slots = boardSlots.map((name, idx) => {
    const slotState = name ? 'filled' : 'empty';
    return `<div class="drop-zone ${name?'filled':''}" data-board-slot="${idx}">
      <div class="slot-head"><span class="slot-index">0${idx+1}</span><span class="slot-title">${name?'证据已落位':'待放入证据'}</span></div>
      <div class="slot-body ${slotState}">${name ? `<div class="slot-card"><strong>${iconFor(name)} ${name}</strong><small>${hintFor(name)}</small></div><button class="mini-btn" data-clear-slot="${idx}">移出槽位</button>` : `<div class="slot-placeholder"><span>将证据放在这里</span><small>支持拖拽，也支持点击左侧证据自动填入</small></div>`}</div>
    </div>`;
  }).join('');
  const availableCombos = combos.filter(c => c.req.every(r => have.includes(r)) && !state.deductions.includes(c.result));
  const suggestions = availableCombos.length ? availableCombos.map(c => `<button class="combo-hint mini-btn" data-fill-combo="${c.id}">
    <span class="hint-case">${c.caseId==='case1'?'第一案':c.caseId==='case2'?'第二案':'第三案'}</span>
    <strong>${c.title}</strong>
    <small>${c.req.join(' / ')}</small>
  </button>`).join('') : `<p class="board-empty-copy">暂无可自动填入的组合。继续收集证据吧。</p>`;
  const current = boardSlots.filter(Boolean);
  const matched = current.length === 3 ? comboByEvidence(current) : null;
  const status = boardFeedback.type || 'idle';
  const resultTags = matched ? `<div class="board-result-tags"><span>${matched.caseId==='case1'?'第一案':matched.caseId==='case2'?'第二案':'第三案'}</span><span>${matched.req.join(' · ')}</span></div>` : `<div class="board-result-tags"><span>当前槽位</span><span>${current.length}/3</span></div>`;
  $('modalBody').innerHTML = `
    <div class="case-desk">
      <div class="board-layout board-layout-v2">
        <div class="board-panel evidence-panel">
          <div class="board-header">
            <div><p class="board-kicker">EVIDENCE ARCHIVE</p><h3>卷宗证据区</h3></div>
            <span class="board-counter">${have.length} / ${TOTAL_EVIDENCE}</span>
          </div>
          <p class="board-copy">每一张证据卡都是可拼接的事实切片。把它们放上分析台，寻找彼此作证的方式。</p>
          <div class="board-evidence-list">${cards}</div>
        </div>
        <div class="board-panel chain-panel">
          <div class="board-header">
            <div><p class="board-kicker">DEDUCTION BOARD</p><h3>案件分析台</h3></div>
            <span class="board-counter">CHAIN x3</span>
          </div>
          <div class="chain-stage">
            <div class="board-chain-lines" aria-hidden="true"><span class="chain-link link-a"></span><span class="chain-link link-b"></span></div>
            <div class="drop-zone-grid">${slots}</div>
          </div>
          <div class="save-actions board-actions">
            <button class="btn gold" id="boardCheckBtn">验证链条</button>
            <button class="btn ghost" id="boardClearBtn">清空槽位</button>
          </div>
          <div class="board-result status-${status}">
            <div class="board-result-mark">${status==='success'?'推理成立':status==='fail'?'链条断裂':status==='ready'?'可成立':status==='done'?'已归档':'推理状态'}</div>
            <h4>${boardFeedback.title}</h4>
            <p>${boardFeedback.text}</p>
            ${resultTags}
          </div>
          <h3 class="board-subtitle">可用链条提示</h3>
          <div class="combo-suggestion">${suggestions}</div>
        </div>
      </div>
    </div>`;
  bindDeductionBoard();
}
function showDeductionBoard(){
  boardSlots = boardSlots.map(x => state.evidence.includes(x) ? x : null);
  syncBoardFeedback();
  showModal('证据拖拽推理棋盘', '<p>正在展开推理棋盘……</p>');
  renderDeductionBoard();
}
function firstEmptyBoardSlot(){
  const idx = boardSlots.findIndex(x => !x);
  return idx < 0 ? 0 : idx;
}
function bindDeductionBoard(){
  document.querySelectorAll('[data-board-evidence]').forEach(btn => {
    btn.ondragstart = ev => ev.dataTransfer.setData('text/plain', btn.dataset.boardEvidence);
    btn.onclick = () => {
      const name = btn.dataset.boardEvidence;
      if(!boardSlots.includes(name)) boardSlots[firstEmptyBoardSlot()] = name;
      syncBoardFeedback();
      renderDeductionBoard();
      playSfx('click');
    };
  });
  document.querySelectorAll('[data-board-slot]').forEach(zone => {
    zone.ondragover = ev => { ev.preventDefault(); zone.classList.add('active'); };
    zone.ondragleave = () => zone.classList.remove('active');
    zone.ondrop = ev => {
      ev.preventDefault();
      zone.classList.remove('active');
      const name = ev.dataTransfer.getData('text/plain');
      if(name && state.evidence.includes(name)){
        const old = boardSlots.indexOf(name);
        if(old >= 0) boardSlots[old] = null;
        boardSlots[Number(zone.dataset.boardSlot)] = name;
        setBoardFeedback('idle','证据已落位',`“${name}” 已放入槽位 ${Number(zone.dataset.boardSlot)+1}。`);
        syncBoardFeedback();
        renderDeductionBoard();
        playSfx('move');
      }
    };
  });
  document.querySelectorAll('[data-clear-slot]').forEach(btn => btn.onclick = () => {
    const idx = Number(btn.dataset.clearSlot);
    const removed = boardSlots[idx];
    boardSlots[idx] = null;
    setBoardFeedback('idle','槽位已清空', removed ? `已移出：${removed}` : '你可以重新摆放证据。');
    syncBoardFeedback();
    renderDeductionBoard();
    playSfx('click');
  });
  document.querySelectorAll('[data-fill-combo]').forEach(btn => btn.onclick = () => {
    const c = combos.find(x => x.id === btn.dataset.fillCombo);
    if(c){
      boardSlots = [...c.req];
      setBoardFeedback('ready','已装填推荐链条', `${c.title} · 可直接验证。`);
    }
    syncBoardFeedback();
    renderDeductionBoard();
    playSfx('move');
  });
  $('boardClearBtn').onclick = () => {
    boardSlots = [null,null,null];
    setBoardFeedback('idle','推理已重置','三个槽位均已清空。重新摆放证据吧。');
    renderDeductionBoard();
    playSfx('click');
  };
  $('boardCheckBtn').onclick = () => {
    const current = boardSlots.filter(Boolean);
    if(current.length < 3){
      setBoardFeedback('warning','链条不足', '请先放入三条证据。');
      renderDeductionBoard();
      showToast('链条不足', '请先放入三条证据。');
      playSfx('fail');
      return;
    }
    const matched = comboByEvidence(current);
    if(!matched){
      setBoardFeedback('fail','推理未成立', '这三条证据还无法互相支撑。换一张证据试试。');
      renderDeductionBoard();
      showToast('推理未成立', '这三条证据还无法互相支撑。');
      playSfx('fail');
      return;
    }
    if(state.deductions.includes(matched.result)){
      setBoardFeedback('done','这条链条已归档', matched.result);
      renderDeductionBoard();
      showToast('已经完成', matched.result);
      playSfx('click');
      return;
    }
    state.truth += matched.truth || 0;
    state.ethics += matched.ethics || 0;
    setBoardFeedback('success','推理成立', `${matched.title} · 新增推理：${matched.result}`);
    addDeduction(matched.result);
    render();
    showModal(matched.title, `<div class="deduction-outcome success"><div class="outcome-stamp">推理成立</div><h3>${matched.title}</h3><p>${matched.text}</p><div class="outcome-chain"><span>${matched.req[0]}</span><i></i><span>${matched.req[1]}</span><i></i><span>${matched.req[2]}</span></div><div class="outcome-result"><strong>新增推理：</strong>${matched.result}</div><div class="save-actions"><button class="btn gold" onclick="showDeductionBoard()">回到推理棋盘</button><button class="btn ghost" onclick="showCombo()">打开传统组合面板</button></div></div>`);
  };
}

function playVoiceCue(speaker){
  if(!state.settings.voice || !state.settings.audio) return;
  const src = VOICE_FILES[speaker] || VOICE_FILES['系统'];
  if(!src) return;
  try{
    const a = new Audio(src);
    a.volume = 0.48 * (state.settings.voiceVolume ?? 0.55);
    a.play().catch(()=>{});
  }catch(e){}
}
const originalSayForVoice = say;
say = function(n,r,p,t,choices=[]){
  originalSayForVoice(n,r,p,t,choices);
  playVoiceCue(n);
};

function showVoicePanel(){
  const rows = Object.entries(VOICE_FILES).map(([name, src]) => `<div class="voice-row"><div><strong>${name}</strong><br><small>${src}</small></div><button class="mini-btn" data-test-voice="${name}">试听</button></div>`).join('');
  showModal('语音演出系统', `
    <div class="voice-grid">
      <div class="voice-card">
        <h3>语音提示音</h3>
        <p>V12 加入的是“角色语气提示音”，不是完整真人配音。它会在角色发言时播放短促音色，增强视觉小说演出感，同时避免占用过大体积。</p>
        <div class="toggle-line"><span>语音提示：${state.settings.voice?'开启':'关闭'}</span><button class="switch" id="toggleVoiceCue">切换语音提示</button></div>
        <div class="range-row"><label>语音提示音量 <strong id="voiceVolVal">${Math.round((state.settings.voiceVolume??0.55)*100)}%</strong></label><input id="voiceVol" type="range" min="0" max="100" value="${Math.round((state.settings.voiceVolume??0.55)*100)}"></div>
      </div>
      <div class="voice-card">
        <h3>角色音色清单</h3>
        <div class="voice-list">${rows}</div>
        <p class="muted-note">如果将来加入真人语音，可以保持同名文件替换，或在 data/game-data.json 的 metadata.voiceFiles 中修改路径。</p>
      </div>
    </div>`);
  $('toggleVoiceCue').onclick = () => { state.settings.voice = !state.settings.voice; save(); showVoicePanel(); };
  $('voiceVol').oninput = () => { state.settings.voiceVolume = Number($('voiceVol').value)/100; $('voiceVolVal').textContent = $('voiceVol').value + '%'; save(); };
  document.querySelectorAll('[data-test-voice]').forEach(btn => btn.onclick = () => playVoiceCue(btn.dataset.testVoice));
}

window.showCombo=showCombo;
function updateMobileViewportUnit(){
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--app-vh', `${vh}px`);
  if(window.matchMedia){
    document.body.classList.toggle('touch-device', window.matchMedia('(pointer: coarse)').matches);
  }
}
window.addEventListener('resize', updateMobileViewportUnit, {passive:true});
window.addEventListener('orientationchange', ()=>setTimeout(updateMobileViewportUnit,120), {passive:true});
updateMobileViewportUnit();

window.goNextCase=goNextCase;window.goFinalCase=goFinalCase;window.resetGame=resetGame;window.go=go;
$('newGameBtn').onclick=()=>{playSfx('click');showIntro(true)};$('continueBtn').onclick=()=>{playSfx('click');enterGame(false)};$('introBtn').onclick=()=>{playSfx('click');showIntro(false)};$('caseSelectBtn').onclick=()=>{playSfx('click');showCaseSelect()};$('saveManagerBtn').onclick=()=>{playSfx('click');showSaveManager()};$('galleryBtn').onclick=()=>{playSfx('click');showGallery()};$('charactersBtn').onclick=()=>{playSfx('click');showCharacterCodex()};$('replayBtn').onclick=()=>{playSfx('click');showReplayPanel()};$('deductionBoardHeroBtn').onclick=()=>{playSfx('click');showDeductionBoard()};$('puzzleHeroBtn').onclick=()=>{playSfx('click');showPuzzleHub()};$('voicePanelHeroBtn').onclick=()=>{playSfx('click');showVoicePanel()};$('dataPanelBtn').onclick=()=>{playSfx('click');showDataPanel()};$('audioPackHeroBtn').onclick=()=>{playSfx('click');showAudioPackPanel()};$('collectionBtn').onclick=()=>{playSfx('click');showEndingCollection()};$('musicCreditsHeroBtn').onclick=()=>{playSfx('click');showMusicCredits()};$('howBtn').onclick=()=>showModal('玩法说明','<ol><li>建议按第一案、第二案、第三案顺序试玩。</li><li>点击场景热点和人物进行调查，收集证据。</li><li>证据足够后回到律所办公室，完成证据组合推理。</li><li>进入法庭后提交关键证据，推进案件结局。</li><li>全流程结束后可在首页或结局页复制反馈模板。</li></ol>');$('demoGuideBtn').onclick=()=>{playSfx('click');showPublicDemoGuide()};$('knownIssuesBtn').onclick=()=>{playSfx('click');showKnownIssues()};$('feedbackBtn').onclick=()=>{playSfx('click');showPublicDemoFeedback('home')};$('closeModal').onclick=closeModal;$('resetBtn').onclick=()=>{playSfx('click');resetGame()};$('notebookBtn').onclick=()=>{playSfx('click');showNotebook()};$('timelineBtn').onclick=()=>{playSfx('click');showTimeline()};$('taskPanelBtn').onclick=()=>{playSfx('click');showMissionPanel()};$('puzzlePanelBtn').onclick=()=>{playSfx('click');showPuzzleHub()};$('deductionBoardTopBtn').onclick=()=>{playSfx('click');showDeductionBoard()};$('replayTopBtn').onclick=()=>{playSfx('click');showReplayPanel()};$('savePanelBtn').onclick=()=>{playSfx('click');showSaveManager()};$('atlasBtn').onclick=()=>{playSfx('click');showEvidenceAtlas()};$('caseHallBtn').onclick=()=>{playSfx('click');showCaseSelect()};$('mapBtn').onclick=()=>{playSfx('click');showMap()};$('achievementsBtn').onclick=()=>{playSfx('click');showAchievements()};$('settingsBtn').onclick=()=>{playSfx('click');showSettings()};$('voicePanelTopBtn').onclick=()=>{playSfx('click');showVoicePanel()};$('audioPackTopBtn').onclick=()=>{playSfx('click');showAudioPackPanel()};$('musicCreditsTopBtn').onclick=()=>{playSfx('click');showMusicCredits()};$('audioBtn').onclick=()=>{toggleAudio();if(state.settings.audio)playSfx('click')};
if($('cinematicNext')) $('cinematicNext').onclick=closeCinematic;
if($('cinematicSkip')) $('cinematicSkip').onclick=closeCinematic;
document.addEventListener('keydown',e=>{if(e.key==='Escape' && $('cinematicOverlay') && !$('cinematicOverlay').classList.contains('hidden')) closeCinematic()});
window.showCinematic=showCinematic;
if($('objectCloseupCollect')) $('objectCloseupCollect').onclick=closeObjectCloseup;
if($('objectCloseupContinue')) $('objectCloseupContinue').onclick=closeObjectCloseup;
if($('objectCloseupSkip')) $('objectCloseupSkip').onclick=closeObjectCloseup;
document.addEventListener('keydown',e=>{if(e.key==='Escape' && $('objectCloseupOverlay') && !$('objectCloseupOverlay').classList.contains('hidden')) closeObjectCloseup()});
window.showObjectCloseup=showObjectCloseup;
window.closeObjectCloseup=closeObjectCloseup;
if($('cgContinue')) $('cgContinue').onclick=closeCgIllustration;
if($('cgSkip')) $('cgSkip').onclick=closeCgIllustration;
document.addEventListener('keydown',e=>{if(e.key==='Escape' && $('cgIllustrationOverlay') && !$('cgIllustrationOverlay').classList.contains('hidden')) closeCgIllustration()});
window.showCgIllustration=showCgIllustration;
window.closeCgIllustration=closeCgIllustration;
window.showPublicDemoGuide=showPublicDemoGuide;
window.showKnownIssues=showKnownIssues;
window.showPublicDemoFeedback=showPublicDemoFeedback;

window.showMissionPanel=showMissionPanel;
window.showPuzzleHub=showPuzzleHub;
window.showCharacterInteraction=showCharacterInteraction;
window.showCharacterEvidenceMenu=showCharacterEvidenceMenu;
window.showExpressionGallery=showExpressionGallery;
window.startPuzzle=startPuzzle;
window.handleDirectorBeatAction=case1DirectorBeatAction;
window.handleCourtClimaxAction=case1CourtClimaxAction;
window.handleCase1GuidanceAction=case1GuidanceAction;
window.closeCinematic=closeCinematic;
load();visitScene(state.scene);render();say('系统','调查记录','','雨越下越密，你抵达商业区路口。');document.addEventListener('click',ensureAudio,{once:true});
