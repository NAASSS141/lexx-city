const $ = id => document.getElementById(id);
const GAME_DATA = window.GAME_DATA;
if(!GAME_DATA) throw new Error('GAME_DATA 未加载');
const STORAGE_KEY = 'lawCityStateV12';
const TOTAL_EVIDENCE = GAME_DATA.metadata.totalEvidence;
const MANUAL_SLOT_COUNT = GAME_DATA.metadata.manualSlotCount;
const {chapters,evidenceMeta,combos,achievementsMeta,endingsMeta,characterCodex,scenes,dialogues,defaultSettings,audioPresets} = GAME_DATA;

let state = {scene:'city',activeCase:'case1',completedCases:[],evidence:[],deductions:[],truth:0,ethics:0,used:{},endings:[],achievements:[],settings:{...defaultSettings},visitedScenes:[],introSeen:false};

const audio = {ctx:null,master:null,sfxGain:null,musicGain:null,ambientGain:null,musicTimer:null,rainSource:null,rainFilter:null,droneA:null,droneB:null,started:false,currentScene:'',currentPreset:null,nowPlaying:'未启动'};

function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
function hydrate(data){state=Object.assign({scene:'city',activeCase:'case1',completedCases:[],evidence:[],deductions:[],truth:0,ethics:0,used:{},endings:[],achievements:[],settings:{...defaultSettings},visitedScenes:[],introSeen:false},data||{});state.settings=Object.assign({},defaultSettings,state.settings||{});['completedCases','evidence','deductions','endings','achievements','visitedScenes'].forEach(k=>{if(!Array.isArray(state[k]))state[k]=[]});if(!state.used)state.used={};}
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
function addEvidence(name){if(name&&!state.evidence.includes(name)){state.evidence.push(name);showToast('获得证据',name);playSfx('evidence')}}
function addDeduction(name){if(name&&!state.deductions.includes(name)){state.deductions.push(name);showToast('组合推理完成',name);playSfx('combo')}}
function iconFor(e){return (evidenceMeta[e]||['🔎','等待与其他证据交叉印证。'])[0]}
function hintFor(e){return (evidenceMeta[e]||['🔎','等待与其他证据交叉印证。'])[1]}

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

function showToast(t,x){const s=$('toastStack');if(!s)return;const d=document.createElement('div');d.className='toast';d.innerHTML=`<strong>${t}</strong><p>${x}</p>`;s.appendChild(d);setTimeout(()=>{d.style.opacity='0';d.style.transform='translateY(8px)'},2800);setTimeout(()=>d.remove(),3300)}
function unlockAchievement(id){if(state.achievements.includes(id)||!achievementsMeta[id])return;state.achievements.push(id);showToast('成就解锁',achievementsMeta[id].title+' · '+achievementsMeta[id].desc);playSfx('success');save()}
function evaluateAchievements(){if(state.evidence.length>=1)unlockAchievement('firstEvidence');if(state.evidence.length>=10)unlockAchievement('evidenceHunter');if(state.evidence.length>=TOTAL_EVIDENCE)unlockAchievement('fullArchive');if(state.deductions.length>=1)unlockAchievement('comboApprentice');if(state.deductions.length>=combos.length)unlockAchievement('comboMaster');if(state.ethics>=5)unlockAchievement('ethicsHigh');['case1','case2','case3'].forEach((c,i)=>{if(caseDone(c))unlockAchievement(`case${i+1}Closer`)})}

function activateGameUI(){$('startScreen').classList.remove('active');$('gameScreen').classList.add('active')}
function showChapterSplash(k,t,d){const w=$('chapterSplash');if(!w)return;$('splashKicker').textContent=k;$('splashTitle').textContent=t;$('splashDesc').textContent=d;w.classList.remove('hidden');w.setAttribute('aria-hidden','false');clearTimeout(showChapterSplash.timer);showChapterSplash.timer=setTimeout(()=>{w.classList.add('hidden');w.setAttribute('aria-hidden','true')},1650)}
function visitScene(id){if(!state.visitedScenes)state.visitedScenes=[];const first=!state.visitedScenes.includes(id);if(first)state.visitedScenes.push(id);return first}
function currentChapter(){const s=scenes[state.scene];if(s.caseId==='hub')return chapters.find(c=>c.id===state.activeCase)||chapters[0];return chapters.find(c=>c.id===s.caseId)||chapters[0]}
function goScene(id,narration='你移动到新的地点。',opts={}){const first=visitScene(id);state.scene=id;if(narration!==false)say(opts.speaker||'系统',opts.role||'调查记录',opts.portrait||'',narration||'你移动到新的地点。');render();if(first||opts.forceSplash){const s=scenes[id],k=opts.kicker||(s.caseId==='case3'?'第三案：灰塔匿名函':s.caseId==='case2'?'第二案：沉默账本':s.caseId==='hub'?'推理中枢':'第一案：雨夜证词');showChapterSplash(k,s.name,s.desc)}}
function render(){const s=scenes[state.scene];if(s.caseId!=='hub')state.activeCase=s.caseId;const ch=currentChapter();$('chapterKicker').textContent=ch.title;$('chapterTitle').textContent=s.name;$('phaseBadge').textContent=s.phase;$('locationName').textContent=s.name;$('locationDesc').textContent=s.desc;const art=$('locationArt');art.style.backgroundImage=`url("${s.art}")`;art.classList.remove('scene-animate');void art.offsetWidth;art.classList.add('scene-animate');$('truthScore').textContent=`真相 ${state.truth}`;$('ethicsScore').textContent=`正义 ${state.ethics}`;$('evidenceCount').textContent=`${state.evidence.length} / ${TOTAL_EVIDENCE}`;$('objectiveTitle').textContent=s.phase.includes('推理')?'组合证据链':s.phase.includes('庭审')||s.phase.includes('终审')?'完成法庭对决':'找到关键线索';$('objectiveText').textContent=s.phase.includes('庭审')||s.phase.includes('终审')?'不要把情绪带上证人席。证据链越完整，结局越锋利。':'证据不是答案，它只是把你推到更难的问题面前。';$('locks').innerHTML=(s.locks||[]).map(l=>`<div class="lock">${l}</div>`).join('');$('locationActions').innerHTML=s.actions.map(a=>{const ok=canUse(a);return`<button class="action" data-action="${a.id}" ${ok?'':'disabled'}><strong>${a.icon||'◆'} ${a.title}</strong><small>${ok?a.text:(a.locked||'尚未解锁')}</small></button>`}).join('');$('evidenceList').innerHTML=state.evidence.length?state.evidence.map(e=>`<div class="evidence"><div class="icon">${iconFor(e)}</div><div><strong>${e}</strong><small>${hintFor(e)}</small></div></div>`).join(''):`<p style="color:#8fa7be;line-height:1.7">证据包空空如也。城市不会主动开口，你得先敲门。</p>`;$('chapterNav').innerHTML=ch.phases.map(p=>`<span class="${p===s.phase?'active':(p==='终局'&&caseDone(ch.id)?'done':'')}">${p}</span>`).join('');setSceneAudio(state.scene);updateAudioUi();bindActions();evaluateAchievements();save()}
function typeText(text){const el=$('dialogueText');if(!state.settings.typewriter){el.textContent=text;el.classList.remove('typing');return}el.textContent='';el.classList.add('typing');let i=0;clearInterval(typeText.timer);typeText.timer=setInterval(()=>{el.textContent=text.slice(0,i+1);i++;if(i>=text.length){clearInterval(typeText.timer);el.classList.remove('typing')}},14)}
function say(n,r,p,t,choices=[]){$('speakerName').textContent=n;$('speakerRole').textContent=r;$('speakerPortrait').style.backgroundImage=p?`url("${p}")`:'';typeText(t);$('choiceList').innerHTML=choices.map((c,i)=>`<button class="choice ${c.cls||(c.ending==='bad'?'danger':'')}" data-choice="${i}">${c.text}</button>`).join('')}
function bindActions(){document.querySelectorAll('[data-action]').forEach(btn=>btn.onclick=()=>{playSfx('click');const a=scenes[state.scene].actions.find(x=>x.id===btn.dataset.action);if(!a||!canUse(a))return;if(a.special==='combo')return showCombo();if(a.special==='notebook')return showNotebook();if(a.special==='map')return showMap();if(a.special==='casehall')return showCaseSelect();if(a.goto){playSfx('move');return goScene(a.goto,a.say||'你移动到新的地点。')}if(a.dialogue)return startDialogue(a.dialogue);if(!state.used[a.id]){state.truth+=a.truth||0;state.ethics+=a.ethics||0;addEvidence(a.evidence);state.used[a.id]=true}say('韩亦','刑警 / 案件联络人','./assets/char_hanyi.png',a.say||'这条线索值得记录。');render()})}
function startDialogue(id){const d=dialogues[id];say(d.speaker,d.role,d.portrait,d.text,d.choices);document.querySelectorAll('[data-choice]').forEach(btn=>btn.onclick=()=>{playSfx('click');const c=d.choices[Number(btn.dataset.choice)];if(c.ending)return finish(c.ending);if(!state.used[id+c.text]){state.truth+=c.truth||0;state.ethics+=c.ethics||0;addEvidence(c.evidence);state.used[id+c.text]=true}say(d.speaker,d.role,d.portrait,c.response,d.choices);render()})}

function showModal(t,b){$('modalTitle').textContent=t;$('modalBody').innerHTML=b;$('modal').classList.remove('hidden');$('modal').setAttribute('aria-hidden','false')}
function closeModal(){$('modal').classList.add('hidden');$('modal').setAttribute('aria-hidden','true')}
function showCombo(){const html=combos.map(c=>{const ok=c.req.every(r=>state.evidence.includes(r)),done=state.deductions.includes(c.result),label=c.caseId==='case1'?'第一案':c.caseId==='case2'?'第二案':'第三案';return`<button class="combo" data-combo="${c.id}" ${ok&&!done?'':'disabled'}><strong>${done?'✅ ':''}${label} · ${c.title}</strong><br><small>需要：${c.req.join(' / ')}${done?' · 已完成':ok?' · 可推理':' · 证据不足'}</small></button>`}).join('');showModal('证据组合推理',`<div class="combo-grid">${html}</div>`);document.querySelectorAll('[data-combo]').forEach(btn=>btn.onclick=()=>{const c=combos.find(x=>x.id===btn.dataset.combo);if(!c||!c.req.every(r=>state.evidence.includes(r))||state.deductions.includes(c.result))return;state.truth+=c.truth||0;state.ethics+=c.ethics||0;addDeduction(c.result);render();showModal(c.title,`<p>${c.text}</p><p><strong>新增推理：</strong>${c.result}</p><button class="btn gold" onclick="showCombo()">继续组合</button>`)})}
function showNotebook(){const ev=state.evidence.map(e=>`<div class="note"><strong>${iconFor(e)} ${e}</strong><p>${hintFor(e)}</p></div>`).join('')||'<p>暂无证据。</p>',de=state.deductions.map(d=>`<div class="note"><strong>🧠 ${d}</strong><p>由多项证据交叉验证得到。</p></div>`).join('')||'<p>暂无组合推理。</p>';showModal('案件笔记',`<h3>证据</h3><div class="note-grid">${ev}</div><h3>组合推理</h3><div class="note-grid">${de}</div>`)}
function showEvidenceAtlas(){const all=Object.entries(evidenceMeta).map(([n,m])=>{const u=state.evidence.includes(n);return`<div class="atlas-card ${u?'':'locked'}"><div class="atlas-icon">${u?m[0]:'?'}</div><strong>${u?n:'未发现证据'}</strong><p>${u?m[1]:'继续调查地点、询问证人或完成前置线索。'}</p></div>`}).join('');const de=state.deductions.map(d=>`<div class="atlas-card"><div class="atlas-icon">🧠</div><strong>${d}</strong><p>已完成组合推理。</p></div>`).join('');showModal('证据图鉴',`<h3>证据图鉴</h3><div class="atlas-grid">${all}</div><h3>组合推理</h3><div class="atlas-grid">${de||'<p>暂无组合推理。</p>'}</div>`)}
function showGallery(){const items=Object.entries(scenes).filter(([id])=>!id.includes('court')).map(([id,s])=>`<div class="gallery-card"><div class="thumb" style="background-image:url('${s.art}')"></div><div class="gallery-body"><h3>${s.name}</h3><p>${s.desc}</p></div></div>`).join('');showModal('视觉图鉴',`<div class="gallery-grid"><div class="gallery-card"><div class="thumb cover" style="background-image:url('./assets/cover.png')"></div><div class="gallery-body"><h3>封面海报</h3><p>游戏主视觉。</p></div></div>${items}</div>`)}
function showCharacterCodex(){const html=characterCodex.map(c=>`<div class="character-card"><div class="thumb" style="background-image:url('${c.portrait}')"></div><div class="body"><h3>${c.name}</h3><span class="role">${c.role}</span><p>${c.desc}</p></div></div>`).join('');showModal('角色档案',`<div class="character-grid">${html}</div>`)}
function showAchievements(){const html=Object.entries(achievementsMeta).map(([id,m])=>{const ok=state.achievements.includes(id);return`<div class="achievement-card ${ok?'':'locked'}"><div class="achievement-badge">${ok?'已解锁':'未解锁'}</div><h3>${m.title}</h3><p>${ok?m.desc:'继续推进剧情来解锁这个成就。'}</p></div>`}).join('');showModal('成就系统',`<div class="achievement-grid">${html}</div>`)}
function showEndingCollection(){const html=Object.entries(endingsMeta).map(([n,m])=>{const u=state.endings.includes(n)||(n.includes('法典')&&caseDone('case3'))||(n.includes('法域')&&caseDone('case2'))||(n.includes('雨停')&&caseDone('case1'));return`<div class="ending-card ${u?'':'locked'}"><div class="rank">${u?m.rank:'?'}</div><h3>${u?n:'未解锁结局'}</h3><p>${u?m.desc:'继续推进调查、尝试不同选择。'}</p></div>`}).join('');showModal('结局收藏',`<div class="ending-grid">${html}</div>`)}
function showCaseSelect(){const html=`<button class="casePick" data-case="case1"><h3>第一案：雨夜证词</h3><p>便利店、黑车、伪造订单。已${caseDone('case1')?'完成':'开启'}。</p></button><button class="casePick" data-case="case2" ${caseDone('case1')?'':'disabled'}><h3>第二案：沉默账本</h3><p>${caseDone('case1')?'医院、旧码头与幕后委托人。':'完成第一案真相结局后解锁。'}</p></button><button class="casePick" data-case="case3" ${caseDone('case2')?'':'disabled'}><h3>第三案：灰塔匿名函</h3><p>${caseDone('case2')?'市档案中心、金融街天台与终局法庭。':'完成第二案终局后解锁。'}</p></button>`;showModal('案件大厅',`<div class="case-grid">${html}</div>`);document.querySelectorAll('[data-case]').forEach(btn=>btn.onclick=()=>{const c=btn.dataset.case,target=c==='case1'?'city':c==='case2'?'hospital':'archive';closeModal();activateGameUI();goScene(target,c==='case1'?'重新进入第一案。':c==='case2'?'沉默账本，再次开始。':'灰塔匿名函，开始收束整座城市。',{forceSplash:true})})}
function showMap(){const nodes=[['city','商业区路口','第一案现场',true,60,120],['store','便利店现场','第一案核心现场',true,310,80],['meeting','会见室','询问陈巍',true,610,130],['office','律所办公室','推理中枢',state.evidence.length>=4,300,290],['court','第一案法庭','完成第一案',state.evidence.length>=7,585,300],['hospital','云港医院','第二案入口',caseDone('case1'),65,425],['dock','旧码头仓库','追踪黑车',caseDone('case1'),305,500],['court2','第二案法庭','完成第二案',state.evidence.length>=14,590,500],['archive','市档案中心','第三案入口',caseDone('case2'),850,210],['rooftop','金融街天台','终局前夜',caseDone('case2'),1065,370],['court3','第三案法庭','终极结局',state.evidence.length>=20&&caseDone('case2'),900,575]];const lines='<div class="mapLine" style="left:205px;top:163px;width:145px;transform:rotate(-10deg)"></div><div class="mapLine" style="left:470px;top:150px;width:150px;transform:rotate(10deg)"></div><div class="mapLine" style="left:420px;top:215px;width:145px;transform:rotate(60deg)"></div><div class="mapLine" style="left:190px;top:378px;width:180px;transform:rotate(18deg)"></div><div class="mapLine" style="left:455px;top:455px;width:150px"></div><div class="mapLine" style="left:680px;top:290px;width:190px;transform:rotate(-20deg)"></div>';const html=nodes.map(([id,t,d,ok,x,y])=>`<button class="mapNode v4" style="left:${x}px;top:${y}px" data-map="${id}" ${ok?'':'disabled'}><h3>${ok?'◆':'◇'} ${t}</h3><p>${ok?d:'尚未解锁'}</p></button>`).join('');showModal('城市地图',`<div class="city-map-board">${lines}${html}</div>`);document.querySelectorAll('[data-map]').forEach(btn=>btn.onclick=()=>{closeModal();goScene(btn.dataset.map,'你抵达新的地点。',{role:'城市地图'})})}
function showTimeline(){const visits=(state.visitedScenes||[]).map((id,i)=>{const s=scenes[id];if(!s)return'';return`<div class="timeline-item"><div class="timeline-dot">${String(i+1).padStart(2,'0')}</div><div><strong>${s.name}</strong><small>${s.caseId==='hub'?'推理中枢':caseTitleById(s.caseId)} · ${s.phase}</small><p>${s.desc}</p></div></div>`}).join('')||'<p>你还没有移动到新的地点。</p>';const ev=state.evidence.slice(-6).reverse().map(n=>`<div class="note"><strong>${iconFor(n)} ${n}</strong><p>${hintFor(n)}</p></div>`).join('')||'<p>尚未获得证据。</p>';showModal('案件时间线',`<div class="timeline-grid"><div class="timeline-card"><h3>地点推进</h3><div class="timeline-list">${visits}</div></div><div class="timeline-stats"><div class="timeline-card"><h3>总体进度</h3><div class="stat"><strong>${state.evidence.length}</strong>已收集证据</div><div class="stat"><strong>${state.deductions.length}</strong>已完成组合推理</div><div class="stat"><strong>${state.completedCases.length}</strong>已完成案件</div></div><div class="timeline-card"><h3>最近证据</h3><div class="note-grid">${ev}</div></div></div></div>`)}
function showReplayPanel(){const unlocked=Object.entries(scenes).filter(([id,s])=>id==='office'||['city','store','meeting'].includes(id)||s.caseId==='case1'||(s.caseId==='case2'&&caseDone('case1'))||(s.caseId==='case3'&&caseDone('case2')));const html=unlocked.map(([id,s])=>`<button class="replay-card" data-replay="${id}"><div class="replay-thumb" style="background-image:url('${s.art}')"></div><div class="replay-body"><h3>${state.visitedScenes.includes(id)?'◆':'◇'} ${s.name}</h3><p>${s.phase}</p><small>${s.desc}</small></div></button>`).join('');showModal('章节回放',`<p>可快速跳转到已解锁章节。回放不会清空证据与存档。</p><div class="replay-grid">${html}</div>`);document.querySelectorAll('[data-replay]').forEach(btn=>btn.onclick=()=>{closeModal();activateGameUI();goScene(btn.dataset.replay,'你从章节回放进入该地点。',{forceSplash:true,role:'章节回放'})})}
function showDataPanel(){showModal('数据面板',`<div class="timeline-grid"><div class="timeline-card"><h3>数据结构</h3><p>V10 已将案件、场景、证据、角色、对话、组合推理、结局和音频预设抽离到 <code>data/game-data.js</code> 与 <code>data/game-data.json</code>。</p><div class="timeline-stats" style="margin-top:12px"><div class="stat"><strong>${chapters.length}</strong>案件</div><div class="stat"><strong>${Object.keys(scenes).length}</strong>场景</div><div class="stat"><strong>${Object.keys(evidenceMeta).length}</strong>证据</div><div class="stat"><strong>${combos.length}</strong>组合推理</div></div></div><div class="timeline-card"><h3>扩展手册</h3><p>项目内附带 <code>docs/AUTHORING.md</code>，说明如何扩展案件、场景、证据、角色和对话。</p><div class="save-actions"><button class="mini-btn" id="openReplayFromData">打开章节回放</button><button class="mini-btn" id="openTimelineFromData">打开时间线</button></div></div></div>`);$('openReplayFromData').onclick=showReplayPanel;$('openTimelineFromData').onclick=showTimeline}
function showSaveManager(){const cards=Array.from({length:MANUAL_SLOT_COUNT},(_,i)=>{const slot=i+1,rec=readSlot(slot);if(!rec||!rec.data)return`<div class="save-card"><h3>存档槽位 ${slot}</h3><p>当前为空。</p><div class="save-actions"><button class="mini-btn" data-save-slot="${slot}">保存当前进度</button></div></div>`;const d=rec.data;return`<div class="save-card"><h3>存档槽位 ${slot}</h3><p>${caseTitleById(d.activeCase || (scenes[d.scene]?scenes[d.scene].caseId:'case1'))} · ${sceneTitleById(d.scene)}</p><div class="save-meta"><div>时间：${fmt(rec.savedAt)}</div><div>证据：${(d.evidence||[]).length}/${TOTAL_EVIDENCE}</div><div>真相：${d.truth||0}</div><div>正义：${d.ethics||0}</div></div><div class="save-actions"><button class="mini-btn" data-load-slot="${slot}">读取</button><button class="mini-btn" data-save-slot="${slot}">覆盖</button><button class="mini-btn danger" data-del-slot="${slot}">删除</button></div></div>`}).join('');showModal('存档管理',`<p>自动存档会持续记录当前进度；这里提供 3 个手动槽位。</p><div class="save-grid">${cards}</div>`);document.querySelectorAll('[data-save-slot]').forEach(b=>b.onclick=()=>saveToSlot(Number(b.dataset.saveSlot)));document.querySelectorAll('[data-load-slot]').forEach(b=>b.onclick=()=>loadFromSlot(Number(b.dataset.loadSlot)));document.querySelectorAll('[data-del-slot]').forEach(b=>b.onclick=()=>deleteSlot(Number(b.dataset.delSlot)))}
function slotKey(i){return`${STORAGE_KEY}_slot${i}`}function readSlot(i){try{return JSON.parse(localStorage.getItem(slotKey(i))||'null')}catch(e){return null}}function fmt(ts){if(!ts)return'未存档';return new Date(ts).toLocaleString()}function saveToSlot(slot){localStorage.setItem(slotKey(slot),JSON.stringify({version:'V10',savedAt:Date.now(),data:JSON.parse(JSON.stringify(state))}));showSaveManager();showToast('手动存档完成',`进度已保存到槽位 ${slot}。`)}function loadFromSlot(slot){const rec=readSlot(slot);if(!rec||!rec.data)return showToast('读取失败',`槽位 ${slot} 为空。`);hydrate(rec.data);closeModal();activateGameUI();visitScene(state.scene);render();say('系统','存档管理','',`已从槽位 ${slot} 读取进度。`);showChapterSplash(currentChapter().title,scenes[state.scene].name,'手动存档读取成功。');save()}function deleteSlot(slot){localStorage.removeItem(slotKey(slot));showSaveManager();showToast('槽位已删除',`槽位 ${slot} 已清空。`)}
function showSettings(){showModal('声音与演出设置',`<div class="settings-grid"><div class="settings-card"><h3>总控制</h3><p>动态配乐、环境雨声与交互音效均由程序实时生成。</p><div class="toggle-line"><span>总音频：${state.settings.audio?'已开启':'已静音'}</span><button class="switch" id="toggleMaster">${state.settings.audio?'一键静音':'恢复声音'}</button></div></div><div class="settings-card"><h3>演出开关</h3><div class="toggle-line"><span>动态配乐：${state.settings.music?'开启':'关闭'}</span><button class="switch" id="toggleMusic">切换配乐</button></div><div class="toggle-line"><span>环境音：${state.settings.ambient?'开启':'关闭'}</span><button class="switch" id="toggleAmbient">切换环境音</button></div><div class="toggle-line"><span>打字机：${state.settings.typewriter?'开启':'关闭'}</span><button class="switch" id="toggleTypewriter">切换打字机</button></div></div><div class="settings-card"><h3>音量混音</h3><div class="range-row"><label>配乐音量 <strong id="musicVolVal">${Math.round(state.settings.musicVolume*100)}%</strong></label><input id="musicVol" type="range" min="0" max="100" value="${Math.round(state.settings.musicVolume*100)}"></div><div class="range-row"><label>环境音量 <strong id="ambientVolVal">${Math.round(state.settings.ambientVolume*100)}%</strong></label><input id="ambientVol" type="range" min="0" max="100" value="${Math.round(state.settings.ambientVolume*100)}"></div><div class="range-row"><label>音效音量 <strong id="sfxVolVal">${Math.round(state.settings.sfxVolume*100)}%</strong></label><input id="sfxVol" type="range" min="0" max="100" value="${Math.round(state.settings.sfxVolume*100)}"></div></div></div>`);$('toggleMaster').onclick=()=>{toggleAudio();showSettings()};$('toggleMusic').onclick=()=>{state.settings.music=!state.settings.music;updateAudioUi();save();showSettings()};$('toggleAmbient').onclick=()=>{state.settings.ambient=!state.settings.ambient;updateAudioUi();save();showSettings()};$('toggleTypewriter').onclick=()=>{state.settings.typewriter=!state.settings.typewriter;save();showSettings()};[['musicVol','musicVolume','musicVolVal'],['ambientVol','ambientVolume','ambientVolVal'],['sfxVol','sfxVolume','sfxVolVal']].forEach(([id,k,l])=>{$(id).oninput=()=>{state.settings[k]=Number($(id).value)/100;$(l).textContent=`${$(id).value}%`;updateAudioUi();save()}})}
function showIntro(startAfter=false){showModal('序章：雨落之前',`<p>22:13，商业区便利店的监控开始黑屏。有人把报警拖慢了 47 秒，也把一场普通债务纠纷推成蓄意误导。</p><div class="intro-flow"><div class="intro-card"><h3>雨夜</h3><p>每个人都只说一半真话。</p></div><div class="intro-card"><h3>城市</h3><p>便利店、医院、旧码头与金融街高楼，将在同一部法典里重新连接。</p></div><div class="intro-card"><h3>法庭</h3><p>你不是来选择最像凶手的人，而是让证据彼此作证。</p></div><div class="intro-card"><h3>终局</h3><p>真正的敌人，也许从来都不站在雨里。</p></div></div><div class="intro-actions">${startAfter?'<button id="introStartNow" class="btn gold">带着序章开始新游戏</button>':'<button id="introEnterCase" class="btn gold">进入案件大厅</button>'}<button id="introCloseOnly" class="btn ghost">关闭</button></div>`);if($('introStartNow'))$('introStartNow').onclick=()=>{closeModal();enterGame(true)};if($('introEnterCase'))$('introEnterCase').onclick=()=>{closeModal();showCaseSelect()};$('introCloseOnly').onclick=closeModal}

function rememberEnding(t){if(!state.endings.includes(t))state.endings.push(t)}
function finish(type){let title,body,score='';const c1=state.deductions.includes('组合推理：陈巍不是伏击者')&&state.deductions.includes('组合推理：店外黑车袭击')&&state.deductions.includes('组合推理：店长与黑车有关')&&state.truth>=12,c2=state.deductions.includes('组合推理：受害人掌握地下账本')&&state.deductions.includes('组合推理：幕后委托人浮出')&&state.truth>=20,c3=state.deductions.includes('组合推理：灰塔资本介入灭口')&&state.deductions.includes('组合推理：终局委托人锁定')&&state.evidence.includes('灰塔转账凭证')&&state.truth>=28;if(type==='case1good'&&c1){if(!caseDone('case1'))state.completedCases.push('case1');title='第一案真相结局：雨停之前';body='<p>你提交了完整证据链，陈巍暂获释放。乔衡说：账本不在我手里。第二案已解锁。</p><button class="btn gold" onclick="goNextCase()">进入第二案</button>';playSfx('success')}else if(type==='case2good'&&c2&&caseDone('case1')){if(!caseDone('case2'))state.completedCases.push('case2');title='第二案终局：法域之城';score=`<div class="score-grid"><div class="score"><strong>S</strong>第二案评级</div><div class="score"><strong>${state.truth}</strong>真相值</div><div class="score"><strong>${state.ethics}</strong>正义值</div><div class="score"><strong>${state.evidence.length}</strong>证据数</div></div>`;body=`${score}<p>医院账本、码头货柜和录音形成闭环。但卷宗并没有结束。第三案已解锁。</p><button class="btn gold" onclick="goFinalCase()">进入第三案</button>`;playSfx('success')}else if(type==='case3good'&&c3&&caseDone('case2')){if(!caseDone('case3'))state.completedCases.push('case3');title='终极结局：法典之上';score=`<div class="score-grid"><div class="score"><strong>SS</strong>终局评级</div><div class="score"><strong>${state.truth}</strong>真相值</div><div class="score"><strong>${state.ethics}</strong>正义值</div><div class="score"><strong>${state.evidence.length}</strong>证据数</div></div>`;body=`${score}<p>匿名函、审计 U 盘、天台门禁和转账凭证终于在法庭上完成闭环。法典不该只写给街角的人，也该写给高楼里的人。</p><button class="btn gold" onclick="resetGame()">重新开始</button>`;playSfx('success')}else if(type.includes('good')){title='证据不足：真相隔着一层雾';body='<p>你的方向正确，但证据链还没有完全闭合。回到律所，完成对应案件的组合推理，再回到法庭。</p>';playSfx('court')}else if(type==='partial'){title='部分胜利：裂缝被撬开';body='<p>你指出了异常，却没能锁定完整责任链。</p>';playSfx('court')}else{title='错误结局：偏见判词';body='<p>你选择了动机，而不是证据。城市收下了一个仓促的答案。</p>';playSfx('fail')}rememberEnding(title);render();showModal(title,body)}
function goNextCase(){closeModal();goScene('hospital','乔衡开口前，有人切断了审讯室电源。线索指向云港医院。第二案，开始。',{speaker:'韩亦',role:'刑警 / 案件联络人',portrait:'./assets/char_hanyi.png',forceSplash:true,kicker:'第二案：沉默账本'})}
function goFinalCase(){closeModal();goScene('archive','第二案结束后的第三天，一封匿名函被送到律所前台。第三案，开始。',{speaker:'系统',role:'案件推进',forceSplash:true,kicker:'第三案：灰塔匿名函'})}
function resetGame(){localStorage.removeItem(STORAGE_KEY);const settings={...state.settings};state={scene:'city',activeCase:'case1',completedCases:[],evidence:[],deductions:[],truth:0,ethics:0,used:{},endings:[],achievements:[],settings,visitedScenes:[],introSeen:state.introSeen||false};closeModal();visitScene('city');render();say('系统','调查记录','','雨越下越密。你抵达商业区路口，案件从这里重新呼吸。');showChapterSplash('第一案：雨夜证词','商业区路口',scenes.city.desc);showToast('游戏已重置','新的调查已经开始。')}
function enterGame(reset=false){ensureAudio();if(reset)resetGame();else{load();visitScene(state.scene);render()}activateGameUI();if(!reset)showChapterSplash(currentChapter().title,scenes[state.scene].name,scenes[state.scene].desc)}


const AUDIO_FILES = (GAME_DATA.metadata && GAME_DATA.metadata.audioFiles) || {};
const fileAudio = {music:null,ambient:null,currentMusicKey:'',ready:false};
const sceneMusicMap = {city:'bgm_city',store:'bgm_city',meeting:'bgm_mystery',office:'bgm_mystery',hospital:'bgm_mystery',dock:'bgm_rooftop',archive:'bgm_mystery',rooftop:'bgm_rooftop',court:'bgm_court',court2:'bgm_court',court3:'bgm_court'};
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
function showAudioPackPanel(){
  const files = Object.entries(AUDIO_FILES).map(([k,v])=>`<div class="note"><strong>${k}</strong><p>${v}</p></div>`).join('');
  showModal('真实音频包', `
    <div class="timeline-grid">
      <div class="timeline-card">
        <h3>音频包状态</h3>
        <p>V11 已内置 WAV 音频素材：场景 BGM、雨声环境音和交互音效。浏览器第一次播放需要点击页面授权。</p>
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


const VOICE_FILES = (GAME_DATA.metadata && GAME_DATA.metadata.voiceFiles) || {};
let boardSlots = [null, null, null];

function normalizedSet(list){ return [...list].sort().join('||'); }
function comboByEvidence(list){
  const key = normalizedSet(list);
  return combos.find(c => normalizedSet(c.req) === key);
}
function renderDeductionBoard(){
  const have = state.evidence || [];
  const cards = have.length ? have.map(name => {
    const used = boardSlots.includes(name);
    return `<button class="drag-evidence ${used?'used':''}" draggable="true" data-board-evidence="${name}">
      <strong>${iconFor(name)} ${name}</strong><small>${hintFor(name)}</small>
    </button>`;
  }).join('') : `<p>你还没有证据。先去现场调查，城市会把第一枚齿轮吐出来。</p>`;
  const slots = boardSlots.map((name, idx) => `<div class="drop-zone ${name?'filled':''}" data-board-slot="${idx}">
    ${name ? `<div><strong>${iconFor(name)} ${name}</strong><small>${hintFor(name)}</small><br><button class="mini-btn" data-clear-slot="${idx}">移除</button></div>` : `拖入证据 ${idx+1}<br><small>也可以点击左侧证据自动放入</small>`}
  </div>`).join('');
  const availableCombos = combos.filter(c => c.req.every(r => have.includes(r)) && !state.deductions.includes(c.result));
  const suggestions = availableCombos.length ? availableCombos.map(c => `<button class="mini-btn" data-fill-combo="${c.id}">
    ${c.caseId==='case1'?'第一案':c.caseId==='case2'?'第二案':'第三案'} · ${c.title}<br><small>${c.req.join(' / ')}</small>
  </button>`).join('') : `<p>暂无可自动填入的组合。继续收集证据吧。</p>`;
  const current = boardSlots.filter(Boolean);
  const matched = current.length === 3 ? comboByEvidence(current) : null;
  const result = current.length < 3
    ? `还需要放入 ${3-current.length} 条证据。`
    : matched
      ? state.deductions.includes(matched.result)
        ? `这条推理已经完成：${matched.result}`
        : `发现可成立链条：${matched.title}`
      : `这三条证据暂时无法组成稳定链条。换一张证据试试。`;
  $('modalBody').innerHTML = `
    <div class="board-layout">
      <div class="board-panel">
        <h3>已获得证据</h3>
        <p>拖动证据到右侧三个槽位。移动端可以直接点击证据自动填入空槽。</p>
        <div class="board-evidence-list">${cards}</div>
      </div>
      <div class="board-panel">
        <h3>推理槽</h3>
        <div class="drop-zone-grid">${slots}</div>
        <div class="save-actions">
          <button class="btn gold" id="boardCheckBtn">验证链条</button>
          <button class="btn ghost" id="boardClearBtn">清空槽位</button>
        </div>
        <div class="board-result">${result}</div>
        <h3 style="margin-top:18px">可用链条提示</h3>
        <div class="combo-suggestion">${suggestions}</div>
      </div>
    </div>`;
  bindDeductionBoard();
}
function showDeductionBoard(){
  boardSlots = boardSlots.map(x => state.evidence.includes(x) ? x : null);
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
        renderDeductionBoard();
        playSfx('move');
      }
    };
  });
  document.querySelectorAll('[data-clear-slot]').forEach(btn => btn.onclick = () => {
    boardSlots[Number(btn.dataset.clearSlot)] = null;
    renderDeductionBoard();
    playSfx('click');
  });
  document.querySelectorAll('[data-fill-combo]').forEach(btn => btn.onclick = () => {
    const c = combos.find(x => x.id === btn.dataset.fillCombo);
    if(c) boardSlots = [...c.req];
    renderDeductionBoard();
    playSfx('move');
  });
  $('boardClearBtn').onclick = () => { boardSlots = [null,null,null]; renderDeductionBoard(); playSfx('click'); };
  $('boardCheckBtn').onclick = () => {
    const current = boardSlots.filter(Boolean);
    if(current.length < 3){ showToast('链条不足', '请先放入三条证据。'); playSfx('fail'); return; }
    const matched = comboByEvidence(current);
    if(!matched){ showToast('推理未成立', '这三条证据还无法互相支撑。'); playSfx('fail'); renderDeductionBoard(); return; }
    if(state.deductions.includes(matched.result)){ showToast('已经完成', matched.result); playSfx('click'); return; }
    state.truth += matched.truth || 0;
    state.ethics += matched.ethics || 0;
    addDeduction(matched.result);
    render();
    showModal(matched.title, `<p>${matched.text}</p><p><strong>新增推理：</strong>${matched.result}</p><div class="save-actions"><button class="btn gold" onclick="showDeductionBoard()">回到推理棋盘</button><button class="btn ghost" onclick="showCombo()">打开传统组合面板</button></div>`);
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

window.showCombo=showCombo;window.goNextCase=goNextCase;window.goFinalCase=goFinalCase;window.resetGame=resetGame;
$('newGameBtn').onclick=()=>{playSfx('click');showIntro(true)};$('continueBtn').onclick=()=>{playSfx('click');enterGame(false)};$('introBtn').onclick=()=>{playSfx('click');showIntro(false)};$('caseSelectBtn').onclick=()=>{playSfx('click');showCaseSelect()};$('saveManagerBtn').onclick=()=>{playSfx('click');showSaveManager()};$('galleryBtn').onclick=()=>{playSfx('click');showGallery()};$('charactersBtn').onclick=()=>{playSfx('click');showCharacterCodex()};$('replayBtn').onclick=()=>{playSfx('click');showReplayPanel()};$('deductionBoardHeroBtn').onclick=()=>{playSfx('click');showDeductionBoard()};$('voicePanelHeroBtn').onclick=()=>{playSfx('click');showVoicePanel()};$('dataPanelBtn').onclick=()=>{playSfx('click');showDataPanel()};$('audioPackHeroBtn').onclick=()=>{playSfx('click');showAudioPackPanel()};$('collectionBtn').onclick=()=>{playSfx('click');showEndingCollection()};$('howBtn').onclick=()=>showModal('玩法说明','<ol><li>点击地点卡片调查现场，收集证据。</li><li>回到律所办公室，可以进行证据组合推理。</li><li>第一案真相结局会解锁第二案，第二案终局会继续解锁第三案。</li><li>V10 已将剧情数据抽离到 data/ 目录，并新增章节回放和数据面板。V11 新增真实 WAV 音频包和音频包控制面板。V12 新增证据拖拽推理棋盘与语音演出提示音。</li></ol>');$('closeModal').onclick=closeModal;$('resetBtn').onclick=()=>{playSfx('click');resetGame()};$('notebookBtn').onclick=()=>{playSfx('click');showNotebook()};$('timelineBtn').onclick=()=>{playSfx('click');showTimeline()};$('deductionBoardTopBtn').onclick=()=>{playSfx('click');showDeductionBoard()};$('replayTopBtn').onclick=()=>{playSfx('click');showReplayPanel()};$('savePanelBtn').onclick=()=>{playSfx('click');showSaveManager()};$('atlasBtn').onclick=()=>{playSfx('click');showEvidenceAtlas()};$('caseHallBtn').onclick=()=>{playSfx('click');showCaseSelect()};$('mapBtn').onclick=()=>{playSfx('click');showMap()};$('achievementsBtn').onclick=()=>{playSfx('click');showAchievements()};$('settingsBtn').onclick=()=>{playSfx('click');showSettings()};$('voicePanelTopBtn').onclick=()=>{playSfx('click');showVoicePanel()};$('audioPackTopBtn').onclick=()=>{playSfx('click');showAudioPackPanel()};$('audioBtn').onclick=()=>{toggleAudio();if(state.settings.audio)playSfx('click')};
load();visitScene(state.scene);render();say('系统','调查记录','','雨越下越密。你抵达商业区路口，案件从这里重新呼吸。');document.addEventListener('click',ensureAudio,{once:true});
