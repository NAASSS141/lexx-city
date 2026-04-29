# V30 Release Candidate QA

## 版本目标

V30 是发布候选版，目标是让项目更适合直接上传 GitHub Pages 并公开展示。本版不新增剧情和大系统，重点做发布前清理、性能检查、部署说明整理和完整静态 QA。

---

## 本版清理和优化内容

### 1. 发布信息整理

- 首页标题更新为 `法域之城：雨夜证词 V30 Release Candidate`
- `data/game-data.json` 元数据更新为 `V30`
- `README.md` 重写为发布候选版说明
- `GITHUB_PAGES_DEPLOY.md` 重写为清晰部署步骤

### 2. 性能清理

- 对 PNG 资源进行无损优化，保留原路径和画质，减少约 1.99 MB
- 未新增大型资源
- 保留所有高质量 CG / 场景图
- 对移动端进一步降低高频动效：
  - 隐藏次级雨丝 / 尘粒 / 雾层
  - 降低动态场景透明度
  - 移动端场景切换动画缩短
  - 隐藏移动端部分非必要镜头标签
- 保留 `prefers-reduced-motion`

### 3. 部署清理

- 确认 zip 根目录可直接部署
- 确认 `index.html` 位于根目录
- 确认 `assets/`、`data/`、`docs/` 位于根目录
- README 和部署文档均指向正确结构

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

检查对象包括：

- `gameScreen`
- `locationArt`
- `cameraDirector`
- `sceneMotionLayer`
- `actorStageLayer`
- `hotspotLayer`
- `objectCloseupOverlay`
- `cinematicOverlay`
- `cgIllustrationOverlay`
- `taskTracker`
- `dialogueText`
- `choiceList`
- `evidenceList`
- `toastStack`

### 本地资源路径检查

结果：通过。

检查范围：

- `data/game-data.json` 中的角色资源
- 场景资源
- 音频资源
- JS / CSS / HTML 中引用的 `./assets/*` 与 `./data/*`

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

- `hydrate()` 存在
- 旧存档仍通过默认对象与 `Object.assign` 合并
- `state.used` 保持兜底
- 本版没有新增必需 state 字段

### 移动端点击可用检查

结果：通过静态检查。

- 保留 `updateMobileViewportUnit()`
- 保留 `@media (pointer:coarse)`
- 保留 `--tap-min`
- 保留 `touch-action: manipulation`
- 核心移动端入口仍为 button / 可点击元素

### 主要 CG / 场景图移动端错位检查

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

说明：

- 图像均为宽幅大图
- 当前容器使用 `background-size: cover`
- V29 / V30 保留竖屏和横屏低高度适配
- 未发现会导致主体完全不可见的静态规则冲突

### 第一案关键路径静态模拟

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

### CSS 重复片段快速检查

发现少量选择器多次出现，主要来自 V13 到 V30 的分阶段样式叠加。未做高风险删除，以避免破坏既有 UI。发布候选版采取“保守清理”策略，仅新增性能覆盖层。

重复较多选择器样本：

- `.hud`：4 次
- `.layout`：4 次
- `.location-art`：8 次
- `.side-panel`：5 次
- `#dialogueText`：4 次
- `.toast`：4 次
- `.drop-zone`：4 次
- `.home-title`：4 次
- `.scene-hotspot`：4 次
- `.hotspot-dot`：4 次

### 资源体积检查

- 文件总数：83
- 项目总大小：46.07 MB
- assets 总大小：45.60 MB

最大资源：

- `assets/cover.jpg`：2.40 MB
- `assets/scene_store.jpg`：2.23 MB
- `assets/cg_case1_director_overview.jpg`：2.20 MB
- `assets/cg_case1_arrival.jpg`：2.20 MB
- `assets/cg_case1_arrival.jpg`：2.20 MB
- `assets/scene_dock.jpg`：2.19 MB
- `assets/scene_office.jpg`：2.16 MB
- `assets/cg_case1_office_wall.jpg`：2.14 MB
- `assets/scene_city.jpg`：2.13 MB
- `assets/cg_case1_store_crime.jpg`：2.13 MB
- `assets/cg_case1_sulan_voice.jpg`：1.94 MB
- `assets/cg_case1_court_submission.jpg`：1.93 MB

结论：资源体积主要来自高质量 PNG 场景 / CG。V30 做了无损优化，没有牺牲画质，也没有删除用户要求保留的高质量图像。

---

## 结论

V30 已具备发布候选版基础条件：

- 可直接上传 GitHub Pages
- 桌面端和手机端均有基础适配
- 第一案关键路径静态检查通过
- 资源路径和根目录结构通过
- 没有新增高风险功能
- README 和部署说明已整理
