# V32 Playtest Fixes QA

## 版本目标

V32 基于 V31 Public Demo 做试玩反馈修复版。用户尚未提供逐条真实试玩反馈，因此本版按 V31 暴露出的高概率试玩问题做预防性修复和体验微调：避免新玩家卡在引导优先级、提升手机端反馈模板复制稳定性、减少 CG 裁切风险，并强化第一案引导按钮的触控可用性。

---

## 收到的问题

### 已提供的具体试玩反馈

暂未提供具体逐条反馈。

### 本版按优先级主动处理的高概率问题

1. FIRST RUN GUIDE 中“证据入档”提示可能过早覆盖“前往便利店”等更重要的下一步。
2. 手机端点击引导按钮后，玩家可能看不到被引导区域。
3. iOS / Safari 上复制反馈模板可能失败或不明显。
4. 极窄屏下部分 CG 主体可能被裁切到边缘。
5. 反馈模板仍显示 V31，不利于回收 V32 反馈。

---

## 修复项

### 1. 修复 FIRST RUN GUIDE 优先级

将“证据入档”提示的触发范围收窄，避免在玩家已经拿到多条证据后继续遮挡：

- 进入便利店
- 会见陈巍
- 开始轻解谜
- 回律所组合推理
- 进入法庭

这些更重要的推进提示。

### 2. 新增移动端引导滚动

新增：

- `focusSidePanelMobile()`

玩家点击 FIRST RUN GUIDE、导演流程或证据提示时，窄屏设备会尝试滚动到对应区域，降低“点了按钮但不知道发生了什么”的概率。

### 3. 修复反馈模板版本与复制稳定性

- 反馈模板更新为 `法域之城 V32 试玩反馈`
- 增加 `textareaSafe()`
- 复制时会临时取消 readonly、focus、select，再执行复制
- 如果复制 API 失败，会选中文本并提示玩家手动复制

### 4. 优化 CG 移动端裁切

为 CG 场景增加：

- `scene.dataset.cgId = id`

并针对第一案主要 CG 增加移动端 `background-position` 微调，降低主体严重偏移风险。

### 5. 增强触控区域

对 FIRST RUN GUIDE、导演流程和法庭高潮流程按钮增加最小高度，提升手机点击稳定性。

---

## 未修复原因

由于本轮没有收到具体试玩反馈，以下项目未做大改：

- 没有重写剧情文本
- 没有新增剧情分支
- 没有更换 CG / 场景图资源
- 没有删除分阶段叠加的旧 CSS
- 没有调整第二案、第三案主体流程

这些内容需要真实试玩反馈后再进入下一轮精修。

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

## 自检结果

### `node --check game.js`

结果：通过。

### 关键 DOM ID 检查

结果：通过。

新增与保留关键 ID 包括：

- `demoGuideBtn`
- `knownIssuesBtn`
- `feedbackBtn`
- `cgIllustrationOverlay`
- `objectCloseupOverlay`
- `taskTracker`
- `hotspotLayer`

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

本版新增的是引导滚动、反馈模板和 CSS 微调，不新增必需 state 字段。

### 移动端点击可用检查

结果：通过静态检查。

- 保留 `updateMobileViewportUnit()`
- 保留 `@media (pointer:coarse)`
- 保留 `--tap-min`
- 新增流程按钮最小高度
- 新增窄屏引导滚动

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

V32 是一版保守的试玩反馈修复版。由于尚未收到真实逐条反馈，本版优先修复最可能影响新玩家试玩的引导优先级、移动端可见性、复制反馈稳定性和 CG 裁切风险。
