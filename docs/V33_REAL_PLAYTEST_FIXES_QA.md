# V33 Real Playtest Fixes QA

## 版本目标

V33 原计划根据真实试玩反馈逐条修复问题。当前用户消息中的反馈区仍是占位文本，没有粘贴具体问题。因此本版没有做剧情或系统级重构，而是在 V32 基础上继续保留并验证此前的试玩修复，同时生成“真实反馈待补充”的 QA 记录，便于下一轮接入真实反馈。

---

## 收到的问题

### 用户提供的真实反馈

未提供具体逐条试玩反馈。原文反馈区为：

```text
【把试玩反馈粘贴在这里】
```

### 本版处理策略

由于没有具体问题，本版采取保守策略：

1. 不新增大系统。
2. 不修改剧情、证据、存档、结局逻辑。
3. 保留 V32 中已经修复的高概率试玩问题。
4. 重新执行发布前静态检查。
5. 在 QA 文档中明确记录“未收到真实反馈”，避免假装已经根据真实反馈逐条修复。

---

## 逐条修复项

### 1. FIRST RUN GUIDE 优先级

状态：保留 V32 修复。

- “证据入档”提示触发范围已收窄。
- 避免遮挡“前往便利店 / 会见陈巍 / 回律所 / 进入法庭”等关键推进提示。

### 2. 移动端引导可见性

状态：保留 V32 修复。

- 保留 `focusSidePanelMobile()`。
- 窄屏设备点击引导按钮后，会尝试滚动到任务或证据区域。

### 3. 反馈模板复制稳定性

状态：保留 V32 修复。

- 保留 `textareaSafe()`。
- 复制时临时取消 `readonly`、focus 并选中文本。
- 复制失败时提示玩家手动复制。

### 4. 第一案 CG 移动端裁切

状态：保留 V32 修复。

- CG 场景保留 `scene.dataset.cgId = id`。
- 第一案主要 CG 保留移动端 `background-position` 微调。

### 5. 触控区域

状态：保留 V32 修复。

- FIRST RUN GUIDE、导演流程、法庭高潮流程按钮保留最小触控高度。

---

## 未修复原因

因为没有收到真实试玩反馈，以下内容未做：

- 未根据具体玩家卡点调整流程。
- 未重写文本节奏。
- 未调整具体 CG 构图。
- 未修改某一具体移动端设备上的显示问题。
- 未修复未复现的 bug。
- 未新增或替换大型资源。

需要你下一轮提供真实反馈后，才能逐条修复。

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
- FIRST RUN GUIDE 新手引导
- 移动端触控优化
- 公开试玩说明与反馈模板
- 证据逻辑
- 存档逻辑
- 结局逻辑
- 第二案和第三案主体流程

---

## 检查结果

### `node --check game.js`

结果：通过。

### 关键 DOM ID 检查

结果：通过。

检查对象包括：

- `startScreen`
- `gameScreen`
- `modal`
- `dialogueText`
- `choiceList`
- `locationArt`
- `sceneMotionLayer`
- `actorStageLayer`
- `hotspotLayer`
- `objectCloseupOverlay`
- `cinematicOverlay`
- `cgIllustrationOverlay`
- `taskTracker`
- `evidenceList`
- `demoGuideBtn`
- `knownIssuesBtn`
- `feedbackBtn`

### 本地资源路径检查

结果：通过。

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

本版没有新增必需 state 字段。

### 移动端点击可用检查

结果：通过静态检查。

- 保留 `updateMobileViewportUnit()`
- 保留 `@media (pointer:coarse)`
- 保留 `--tap-min`
- 保留 `touch-action: manipulation`

### 静态模拟第一案关键路径

结果：通过。

第一案关键证据仍可通过场景行动或对白选择获得：

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

### 图像裁切静态检查

结果：通过静态检查。

检查图像：

- `assets/cg_case1_arrival.jpg`：1672 × 941
- `assets/cg_case1_store_crime.jpg`：1672 × 941
- `assets/cg_case1_sulan_voice.jpg`：1672 × 941
- `assets/cg_case1_office_wall.jpg`：1672 × 941
- `assets/cg_case1_court_submission.jpg`：1672 × 941
- `assets/scene_court.jpg`：1672 × 941
- `assets/cg_case1_court_submission.jpg`：1672 × 941
- `assets/cg_case1_arrival.jpg`：1672 × 941
- `assets/scene_meeting.jpg`：1672 × 941
- `assets/scene_meeting.jpg`：1672 × 941
- `assets/scene_court.jpg`：1672 × 941

---

## 结论

V33 当前是“真实反馈待补充”的保守检查版。由于没有收到具体反馈，本版没有虚构问题，也没有冒险改动剧情和逻辑。下一轮请提供实际试玩记录，我可以逐条修复。
