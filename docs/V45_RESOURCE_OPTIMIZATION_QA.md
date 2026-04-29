# V45 资源压缩与加载速度优化版 QA

## 版本目标

V45 基于 V44 Public Demo Candidate，对项目进行资源体积优化和加载速度优化。本版不新增剧情或系统，目标是减少 zip 体积、降低首次加载压力，让 GitHub Pages 公开试玩更顺畅。

---

## 优化前后体积

### 解压后体积

- 优化前：83.69 MB
- 优化后：10.47 MB
- 减少：73.22 MB

### zip 体积

- 优化前 zip：82.80 MB
- 优化后 zip：见最终产物
- 打包后会再次检查根目录结构

### 图片数量

- JPG / JPEG：49
- PNG：23
- SVG：7

---

## 压缩了哪些资源

### 1. 处理 1MB 以上大图

原始 assets 中 1MB 以上图片数量：

```text
41
```

处理策略：

- RGB 背景图 / CG：转换为浏览器兼容 JPG
- 1672 × 941 背景 / CG：缩放到 1280 × 720
- 1536 × 1024 图片：缩放到 1280 × 853
- 1024 × 1536 角色状态图：缩放到 853 × 1280
- JPG 质量：82，启用 optimize 与 progressive

### 2. 主要压缩样例

- `assets/cover.png` → `assets/cover.jpg`：2.40 MB → 0.19 MB，(1672, 941) → (1280, 720)
- `assets/cg_case1_ending_rain.png` → `removed / merged`：2.20 MB → 0.00 MB， → 
- `assets/scene_store.png` → `assets/scene_store.jpg`：2.23 MB → 0.17 MB，(1672, 941) → (1280, 720)
- `assets/scene_dock.png` → `assets/scene_dock.jpg`：2.19 MB → 0.16 MB，(1672, 941) → (1280, 720)
- `assets/cg_case1_arrival.png` → `assets/cg_case1_arrival.jpg`：2.20 MB → 0.18 MB，(1672, 941) → (1280, 720)
- `assets/scene_office.png` → `assets/scene_office.jpg`：2.16 MB → 0.17 MB，(1672, 941) → (1280, 720)
- `assets/cg_case1_office_wall.png` → `assets/cg_case1_office_wall.jpg`：2.14 MB → 0.16 MB，(1672, 941) → (1280, 720)
- `assets/cg_case1_director_overview.png` → `assets/cg_case1_director_overview.jpg`：2.20 MB → 0.23 MB，(1536, 1024) → (1280, 853)
- `assets/cg_case1_store_crime.png` → `assets/cg_case1_store_crime.jpg`：2.13 MB → 0.17 MB，(1672, 941) → (1280, 720)
- `assets/scene_city.png` → `assets/scene_city.jpg`：2.13 MB → 0.18 MB，(1672, 941) → (1280, 720)
- `assets/cg_case1_court_climax.png` → `removed / merged`：1.93 MB → 0.00 MB， → 
- `assets/portraits/case2_drama/luchen_interrogate.png` → `assets/portraits/case2_drama/luchen_interrogate.jpg`：2.06 MB → 0.14 MB，(1024, 1536) → (853, 1280)
- `assets/portraits/case2_drama/luchen_chain.png` → `assets/portraits/case2_drama/luchen_chain.jpg`：2.05 MB → 0.14 MB，(1024, 1536) → (853, 1280)
- `assets/portraits/case1_drama/luchen_counter.png` → `assets/portraits/case1_drama/luchen_counter.jpg`：2.02 MB → 0.15 MB，(1024, 1536) → (853, 1280)
- `assets/cg_case1_court_submission.png` → `assets/cg_case1_court_submission.jpg`：1.93 MB → 0.13 MB，(1672, 941) → (1280, 720)

### 3. 去除精确重复资源

已检查并去除精确重复资源，引用已指向保留文件。

处理过的重复项包括：

- `cg_case1_ending_rain` 合并到 `cg_case1_arrival`
- `cg_case1_court_climax` 合并到 `cg_case1_court_submission`
- `cg_case1_court_open` 合并到 `scene_court`
- `cg_case1_next_hook` 合并到 `scene_meeting`

### 4. 删除未引用旧资源

已删除未被当前代码、数据、样式、README 或部署说明引用的旧资源：

- `assets/audio/bgm_city.wav`
- `assets/audio/bgm_mystery.wav`
- `assets/audio/bgm_court.wav`
- `assets/audio/bgm_rooftop.wav`
- `assets/scene_meeting.svg`

### 5. 修复第三案 CG 节点引用

资源检查发现 V44 中存在第三案 CG 文件和映射 ID，但部分 CG 节点定义缺失。V45 已补回对应节点，让已有资源能够被当前系统调用：

- `case3_archive_intro`
- `case3_archive_evidence`
- `case3_rooftop_qiao`
- `case3_rooftop_evidence`
- `case3_court_final`
- `case3_ending`

这属于资源路径与加载修复，不改变剧情、证据、存档、结局逻辑。

---

## 未压缩原因

以下内容未继续压缩：

- SVG 矢量场景：本身体积很小，继续处理收益低。
- 音频 mp3 / wav：当前引用音频体积较小，且继续压缩可能影响听感或带来兼容风险。
- 历史 docs 文档：作为迭代记录保留，不参与首屏资源加载。
- 小于 1MB 的图片：继续处理收益有限，且可能增加画质损失。

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
- V44 Public Demo Candidate
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

所有运行时 `./assets/...` 与 `./data/...` 引用均存在。

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

本版主要修改资源文件格式、路径引用和文档说明，不新增必需 state 字段。

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

### 大图检查

结果：通过。

当前 assets 中不存在 1MB 以上的图片或 SVG 资源。

### 重复资源检查

结果：通过。

未发现 assets 中仍存在精确重复文件。

### 未引用资源检查

结果：通过。

未发现未被当前文本资源引用的 assets 文件。

---

## 结论

V45 已在保持当前视觉质量和玩法完整度的前提下，大幅降低资源体积和首次加载压力。适合作为公开传播前的轻量化试玩版本。
