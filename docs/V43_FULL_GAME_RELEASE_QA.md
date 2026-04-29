# V43 全三案发布前完整 QA + 节奏统一

## 版本目标

V43 基于 V42 第三案导演剪辑版，对第一案、第二案、第三案进行完整流程检查、节奏统一和发布前修复。本版不新增大系统，重点让三案体验更稳定、更统一、更适合公开试玩。

---

## 全三案流程检查

### 第一案：雨夜证词

静态关键路径检查通过。

第一案关键证据仍可获得：

- 破损监控记录
- 逆向轮胎水痕
- 22:13 小票
- 二次出血痕迹
- 店内网络异常
- 未发送语音
- 匿名来电记录
- 袖口机油
- 伪造订单提醒
- 黑车车牌残片

第一案组合推理仍存在：

- 组合推理：陈巍不是伏击者
- 组合推理：店外黑车袭击
- 组合推理：店长与黑车有关

第一案轻解谜仍存在：

- `c1_timeline_order`
- `c1_contradiction_sulan`
- `c1_submit_blackcar`

### 第二案：沉默账本

静态关键路径检查通过。

第二案关键证据仍可获得：

- 医院缴费单
- 护士交班记录
- 残缺账本页
- 码头监控截图
- 货柜封条
- 私家侦探录音

第二案组合推理仍存在：

- 组合推理：受害人掌握地下账本
- 组合推理：幕后委托人浮出

第二案轻解谜仍存在：

- `c2_route_chain`
- `c2_submit_recording`

### 第三案：灰塔匿名函

静态关键路径检查通过。

第三案关键证据仍可获得：

- 匿名函残页
- 审计U盘
- 董事会日程
- 灰塔转账凭证
- 天台门禁记录
- 狙击照片底片

第三案组合推理仍存在：

- 组合推理：灰塔资本介入灭口
- 组合推理：终局委托人锁定

第三案轻解谜仍存在：

- `c3_submit_greytower`

---

## 修复项

### 1. 修复第三案乔衡对白镜头冲突

第三案中乔衡对白包含“灰塔 / 账本 / 证据”等词时，可能被第一案乔衡破防镜头 `qiao_break` 抢占。V43 已在 `directingCueForDialogue()` 中增加第三案优先判断，让档案中心、天台和终审阶段的乔衡对白优先触发 `qiao_money`。

### 2. 降低证据获得与组合推理时的重复 CG 密度

V43 将 `addEvidence()` 和 `addDeduction()` 中的导演 cue 改为 `cg:false`。这样证据获得时仍会触发镜头、人物状态、物件特写和证据演出，但不会额外叠加导演 CG。CG 由 `queueEvidenceCgIllustration()` 或明确的场景 / 章节节点统一处理。

### 3. 阶段完成提示轻量化

`evaluateTaskProgress()` 保留阶段完成 Toast，移除阶段完成时的大型 cinematic 弹出，降低连续推进时的打断感。

### 4. 结局失败文案直接化

- `部分胜利：矛盾被撬开` → `部分胜利：证据不足`
- `错误结局：偏见判词` → `错误结局：证据不足`
- 终局标题改为 `终极结局：完整责任链`
- 删除“城市收下了一个仓促的答案”等感悟式描述

### 5. 第二案 / 第三案在律所办公室的导演流程识别更稳

`isCase2DirectorMode()` 增加 office + activeCase 判断，保证第二案回律所整理推理时，右侧流程卡不被第一案流程抢占。第三案同类逻辑继续保留。

---

## 未修复原因

本轮没有新增大型资源，也没有做完整人工浏览器试玩。主要原因：

- 用户要求不新增大型资源
- 当前环境更适合静态路径检查、语法检查、资源检查和布局规则检查
- 三案真人试玩仍建议在浏览器中继续收集反馈

---

## 保留项

未删除或破坏以下系统：

- 对话框
- 热点探索
- 人物交互
- 物件特写
- 人物情绪系统
- 角色动作系统
- 人物舞台
- 镜头系统
- 动态场景
- CG / 动态插图系统
- 行动按钮
- 任务系统
- 轻解谜系统
- 第一案导演流程
- 第一案法庭高潮流程
- 第二案导演流程
- 第三案导演流程
- FIRST RUN GUIDE 新手引导
- 电脑端布局优化
- 公开试玩说明与反馈模板
- V34 表情资源系统
- V35 第一案戏剧状态系统
- V36 文案清理
- V37 镜头剪辑与台词节奏系统
- V38 真人试玩修复
- V39 电脑端试玩修复
- V40 第二案导演剪辑
- V41 第二案美术与角色演出精修
- V42 第三案导演剪辑
- 证据逻辑
- 存档逻辑
- 结局逻辑

---

## 检查结果

### `node --check game.js`

结果：通过。

### 关键 DOM ID 检查

结果：通过。

检查 ID：

- `startScreen`
- `gameScreen`
- `modal`
- `modalBody`
- `dialogueText`
- `choiceList`
- `locationArt`
- `cameraDirector`
- `cameraCaption`
- `sceneMotionLayer`
- `actorStageLayer`
- `hotspotLayer`
- `objectCloseupOverlay`
- `cinematicOverlay`
- `cgIllustrationOverlay`
- `locationActions`
- `objectiveTitle`
- `objectiveText`
- `taskTracker`
- `evidenceList`
- `toastStack`
- `puzzlePanelBtn`
- `demoGuideBtn`
- `knownIssuesBtn`
- `feedbackBtn`

### 本地资源路径检查

结果：通过。

所有 `./assets/...` 与 `./data/...` 引用均存在。

### GitHub Pages 根目录结构检查

结果：通过。

根目录包含：

- `index.html`
- `style.css`
- `game.js`
- `data/`
- `assets/`
- `docs/`
- `README.md`
- `GITHUB_PAGES_DEPLOY.md`

### 旧存档兼容检查

结果：通过静态检查。

本版修改运行时 UI、镜头节奏和文案，不新增必需 state 字段。

### 电脑端点击可用检查

结果：通过静态检查。

保留系统面板函数：

- `showMap()`
- `showEvidenceAtlas()`
- `showTimeline()`
- `showMissionPanel()`
- `showNotebook()`
- `showCaseSelect()`

### 移动端点击可用检查

结果：通过静态检查。

检查到：

- `touch-action:manipulation`
- `@media (max-width:720px)`
- 弹窗 fixed 覆盖
- V38 / V39 布局修复仍保留

### CG 资源检查

结果：通过。

- 第一案 CG：不少于 9 个
- 第二案 CG：不少于 6 个
- 第三案 CG：不少于 6 个

### 三案文案直接性检查

结果：通过。

以下问题表达未检出：

- `重新呼吸`
- `比雨声更碎`
- `像藤蔓`
- `证人席空着，却像`
- `迟到的判词`
- `真正意义`
- `城市收下`
- `仓促的答案`
- `矛盾被撬开`
- `法典之上`

---

## 结论

V43 已完成全三案发布前静态 QA 和节奏统一。三案导演流程、任务提示、证据路径、CG 触发密度、失败结局文案和弹窗布局都经过检查与修补，适合作为下一轮公开试玩候选版。
