# V27_CASE1_COURT_CLIMAX_QA

## 版本目标
在 V26「第一案导演剪辑版」基础上，继续打磨第一案后半段：**法庭质证 -> 关键证据提交 -> 第一案结局演出 -> 第二案钩子**。目标是让第一案结尾更像完整的视觉小说高潮，而不是单纯弹出结局文本。

---

## 本版新增 / 整合内容

### 1. 第一案法庭高潮流程卡
新增 `COURT CLIMAX / 第一案法庭高潮` 卡片，用于在法庭阶段提示玩家下一步：
1. 法庭开场
2. 时间线反击
3. 证词核对
4. 黑车入口
5. 证据链闭合
6. 最后一击

每一步都提供轻量说明和按钮入口，不替代原有按钮，只作为导演式引导层。

### 2. 新增法庭高潮 CG 节点
新增 CG 节点：
- `case1_court_open`：第一案法庭开场
- `case1_court_climax`：关键证据提交 / 翻盘节点
- `case1_truth_reveal`：第一案真相揭示
- `case1_next_case_hook`：第二案钩子

### 3. 插入高质量图像资源
新增资源：
- `assets/scene_court.jpg`
- `assets/cg_case1_court_submission.jpg`
- `assets/cg_case1_arrival.jpg`
- `assets/scene_meeting.jpg`
- `assets/cg_case1_director_overview.jpg`

说明：本版继续使用高质量图像资源，不使用简单 SVG 作为第一案高潮画面主体。

### 4. 第一案结局演出升级
将第一案真相结局的弹窗内容升级为图文式结局演出：
- 雨夜结局画面
- 陈巍暂获释放后的案件余波
- 苏岚沉默被解除的收束
- 乔衡“账本不在我手里”的悬念强化
- 第二案入口按钮

### 5. 第二案钩子强化
第一案真相结局后会排队触发 `case1_next_case_hook`，用会见室画面承接“沉默账本”的开端。

---

## 保留项
以下内容未删除、未破坏：
- 原有剧情内容
- 原有证据逻辑
- 原有结局判断逻辑
- 原有存档结构
- 对话框系统
- 热点探索系统
- 人物交互系统
- 物件特写系统
- 人物情绪系统
- 角色动作系统
- 人物舞台系统
- 镜头系统
- 动态场景系统
- CG / 动态插图系统
- 行动按钮
- 任务系统
- 轻解谜系统
- 第二案和第三案流程

---

## 代码改动摘要

### game.js
新增：
- `case1CourtBeatDefs`
- `case1CourtBeatState()`
- `case1CourtClimaxAction()`
- `renderCase1CourtClimaxCard()`
- `queueCase1CourtClimaxCue()`
- `case1EndingBody()`
- `go()` 场景跳转辅助函数

改动：
- 第一案法庭场景进入时触发法庭开场 CG
- `final1` 对话启动时触发法庭高潮 CG
- 第一案真相结局成功时触发真相揭示与第二案钩子
- `renderTaskTracker()` 中接入法庭高潮卡

### style.css
新增：
- 法庭高潮流程卡样式
- 法庭节点列表样式
- 第一案结局图文演出样式
- 移动端适配样式

### assets/
新增 5 张高质量图像资源。

---

## 自检结果

### 1. `node --check game.js`
结果：通过。

### 2. 关键 DOM ID 检查
检查对象包括：
- `gameScreen`
- `locationArt`
- `cameraDirector`
- `cameraCaption`
- `sceneMotionLayer`
- `actorStageLayer`
- `hotspotLayer`
- `locationActions`
- `objectiveTitle`
- `objectiveText`
- `taskTracker`
- `locks`
- `dialoguePanel`
- `speakerPortrait`
- `speakerName`
- `speakerRole`
- `dialogueText`
- `choiceList`
- `evidenceList`
- `modal`
- `modalBody`
- `cinematicOverlay`
- `objectCloseupOverlay`
- `cgIllustrationOverlay`
- `toastStack`

结果：关键 DOM ID 均存在。

### 3. 本地资源路径检查
结果：通过。

新增图像资源均存在：
- `assets/scene_court.jpg`
- `assets/cg_case1_court_submission.jpg`
- `assets/cg_case1_arrival.jpg`
- `assets/scene_meeting.jpg`
- `assets/cg_case1_director_overview.jpg`

### 4. GitHub Pages 根目录结构检查
结果：通过。

根目录保持：
- `index.html`
- `game.js`
- `style.css`
- `README.md`
- `GITHUB_PAGES_DEPLOY.md`
- `assets/`
- `data/`
- `docs/`

### 5. 旧存档兼容检查
结果：通过（静态兼容）。

原因：
- 新增法庭高潮卡通过已有证据、谜题、推理和结局状态推断
- 未新增必需 `state` 字段
- `hydrate()` 继续使用默认状态兜底

### 6. 移动端点击可用检查
结果：通过（静态检查）。

依据：
- 新增入口均为 `<button>`
- 不依赖 hover 作为唯一交互
- CSS 已加入移动端布局收敛

---

## 已知说明
1. 本版强化第一案结尾演出，但不重写核心剧情和结局条件。
2. 第二案、第三案仍保持原状，避免本阶段范围失控。
3. 部分 CG 为演出触发层，玩家也可以继续通过旧按钮完成流程。

---

## 结论
V27 已将第一案结尾从“终案选择 + 结局弹窗”升级为更完整的法庭高潮段落：
- 有法庭开场
- 有证据提交高潮
- 有真相揭示 CG
- 有结局图文演出
- 有第二案悬念钩子
- 保留原有系统和逻辑
