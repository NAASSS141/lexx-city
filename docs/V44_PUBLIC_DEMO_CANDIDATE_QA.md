# V44 Public Demo Candidate QA

## 版本目标

V44 基于 V43 全三案发布前完整 QA + 节奏统一版，把项目整理成更适合公开发给玩家试玩的候选版本。本版不新增剧情或大系统，重点做封版前 polish、说明整理、试玩入口优化、README 和部署体验检查。

---

## 封版 polish 项

### 1. 首页版本与试玩说明

首页已更新为：

```text
V44 PUBLIC DEMO CANDIDATE
```

首页试玩卡片已明确：

- 推荐顺序：第一案 → 第二案 → 第三案
- 预计时长：第一案 25–40 分钟，全流程 60–90 分钟
- 推荐浏览器：Chrome / Edge / Safari 最新版
- 玩法重点：点热点、问人物、收证据、回律所推理、进法庭质证

### 2. 公开试玩说明弹窗

`showPublicDemoGuide()` 已更新：

- 标明本版为 V44 Public Demo Candidate
- 明确三案顺序
- 明确全流程预计时长
- 增加推荐设备、声音建议、存档说明
- 增加完整游玩步骤
- 提供“从第一案开始”“打开案件大厅”“查看反馈模板”三个入口

### 3. 已知问题 / 试玩注意事项

`showKnownIssues()` 已更新：

- 音频播放限制
- 首次加载说明
- 手机端宽幅 CG 裁切说明
- 本地存档说明
- 推荐三案顺序
- 反馈重点说明

### 4. 反馈模板

`publicDemoFeedbackText()` 已从旧版模板升级为 V44 模板。

新模板覆盖：

- 设备、系统、浏览器、屏幕方向
- 三案完成进度
- 卡点位置与任务提示
- 电脑端上下滑动问题
- 手机端点击问题
- 弹窗覆盖问题
- 画面 / 文字 / CG 裁切反馈
- 节奏、案件完整度、Bug 复现步骤
- 优先优化建议

### 5. 试玩结束反馈提示

`publicDemoFeedbackCta()` 已更新为公开试玩候选版文案，鼓励玩家在通关任一案件或全流程后复制反馈模板。

### 6. UI 小幅 polish

新增 V44 CSS：

- 公开试玩卡片边框更明确
- 反馈模板 textarea 更高，更适合复制长模板
- 移动端反馈按钮纵向排列
- 公开 Demo endcap 视觉更统一

---

## README / 部署说明修改

### README.md

已重写为 V44 Public Demo Candidate 公开试玩说明，包含：

- 公开试玩建议
- 当前内容
- 建议试玩方式
- 反馈重点
- GitHub Pages 部署方式
- 体积说明
- 发布检查文档位置
- 音乐署名提醒
- 扩展说明

### GITHUB_PAGES_DEPLOY.md

已重写为最终部署步骤，包含：

- 解压 zip
- 根目录结构检查
- 上传 GitHub
- 开启 Pages
- 推荐试玩设置
- 常见问题
- 发布前快速检查

### 文档引用检查

结果：通过。

首页、README 和部署说明不再引用旧的 V31 / V43 发布 QA 文档作为当前发布检查入口。

---

## 资源体积检查

### 解压后体积

```text
83.69 MB
```

### 最大文件 Top 10

- assets/cover.jpg：2.40 MB
- assets/scene_store.jpg：2.23 MB
- assets/cg_case1_director_overview.jpg：2.20 MB
- assets/cg_case1_arrival.jpg：2.20 MB
- assets/cg_case1_arrival.jpg：2.20 MB
- assets/scene_dock.jpg：2.19 MB
- assets/scene_office.jpg：2.16 MB
- assets/cg_case1_office_wall.jpg：2.14 MB
- assets/scene_city.jpg：2.13 MB
- assets/cg_case1_store_crime.jpg：2.13 MB

### 结论

- 未发现单个文件超过 100 MB。
- zip 可直接部署到 GitHub Pages。
- 总体体积偏大，主要来自 CG 和角色状态图。后续若要进一步公开扩散，建议单独制作 V45 资源压缩版。

---

## 废弃文档 / 重复说明检查

当前 `docs/` 内共有 43 个文件。

结论：

- 历史 QA 文档作为迭代记录保留。
- README 已指向 V44 当前 QA 文档。
- 部署说明已更新为 V44。
- 未删除历史文档，避免破坏前序版本记录。
- 未发现首页或 README 继续引用旧发布候选文档作为当前入口。

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
- 移动端触控优化
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
- V43 全三案发布前 QA
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

本版修改说明、反馈模板、README 和部署文档，不新增必需 state 字段。

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

### 三案关键路径静态模拟

结果：通过。

第一案、第二案、第三案关键证据、组合推理和轻解谜均保留。

### zip 根目录直接部署检查

结果：通过。

压缩包根目录直接包含 `index.html`，不是多包一层目录。

---

## 结论

V44 已完成公开试玩候选版封版 polish。项目可直接上传 GitHub Pages，并适合发给朋友、测试玩家或潜在合作者试玩。
