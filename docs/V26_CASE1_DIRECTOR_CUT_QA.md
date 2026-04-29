# V26_CASE1_DIRECTOR_CUT_QA

## 版本目标
将第一案《雨夜证词》整合为更完整、可展示的导演剪辑版 Demo，在 **不改动既有剧情结局与核心逻辑** 的前提下，强化第一案的流程感、镜头感、动作演出感与节点引导。

---

## 本版新增 / 整合内容

### 1. 第一案导演流程整合
围绕第一案建立了更清晰的导演流程提示，重点围绕以下路径组织：
1. 首页进入
2. 雨夜路口 CG
3. 商业区热点调查
4. 监控 / 轮胎 / 黑车线索物件特写
5. 便利店内景调查
6. 苏岚人物交互与“未发送语音” CG
7. 陈巍会见对峙
8. 证据排序轻谜题
9. 律所证据墙推理
10. 第一案法庭质证
11. 提交关键证据
12. 第一案结局演出

### 2. 新增“导演剪辑”进度卡
在右侧任务区域追加 **Director Cut / 第一案导演流程** 卡片：
- 展示当前导演段落
- 展示段落完成百分比
- 展示下一步引导
- 提供“推进当前段落”按钮，直接跳到当前推荐入口（如前往场景、进入轻解谜、返回证据墙等）

### 3. 第一案高质量图像资源替换 / 插入
新增并接入以下高质量图像资源：
- `assets/cg_case1_arrival.jpg`
- `assets/cg_case1_store_crime.jpg`
- `assets/cg_case1_sulan_voice.jpg`
- `assets/cg_case1_office_wall.jpg`
- `assets/cg_case1_court_submission.jpg`
- `assets/scene_meeting.jpg`
- `assets/scene_court.jpg`

### 4. 第一案关键 CG 升级
将第一案关键节点的 CG 改为高质量图像背景：
- 雨夜商业区路口
- 便利店案发现场
- 苏岚“未发送语音”情绪 CG
- 律所证据墙推理 CG
- 法庭关键证据提交 CG

### 5. 第一案场景背景升级
替换原先较轻量的第一案部分场景背景：
- 会见室：切换为 `scene_meeting.png`
- 第一案法庭：切换为 `scene_court.png`

### 6. 轻引导而非弹窗轰炸
新增第一案导演提示逻辑：
- 根据当前完成度自动判断“下一段该做什么”
- 通过 Toast 与任务卡引导玩家，而非持续强制弹窗
- 保留原有行动按钮作为备用入口

---

## 保留项（未删除 / 未破坏）
以下系统保留并继续兼容：
- 对话框系统
- 热点探索系统
- 人物交互系统
- 物件特写系统
- 人物情绪系统
- 角色动作系统（V25）
- 人物舞台系统
- 镜头系统
- 动态场景系统
- CG / 动态插图系统
- 行动按钮
- 任务系统
- 轻解谜系统
- 推理 / 证据组合逻辑
- 存档系统
- 结局与章节解锁逻辑
- 第二案与第三案主体流程

说明：
- 第一案剧情、证据、结局判断逻辑未改写。
- 第二案、第三案未被强制重构，仅保持兼容。

---

## 代码改动摘要

### game.js
- 替换第一案关键 CG 节点的图像资源
- 替换第一案会见室 / 法庭场景背景
- 新增 `case1DirectorBeatDefs`
- 新增：
  - `case1DirectorBeatState()`
  - `case1DirectorBeatAction()`
  - `renderCase1DirectorCard()`
  - `maybeTriggerCase1DirectorCue()`
- 在 `renderTaskTracker()` 中整合导演流程卡
- 在 `render()` 和 `completePuzzle()` 中刷新导演引导
- 暴露 `window.handleDirectorBeatAction`

### data/game-data.json
- 将第一案会见室场景图替换为 `./assets/scene_meeting.jpg`
- 将第一案法庭场景图替换为 `./assets/scene_court.jpg`
- 元数据版本更新为 `V26`

### style.css
- 新增导演流程卡样式
- 新增移动端下的导演流程卡适配样式

---

## 自检结果

### 1. `node --check game.js`
结果：**通过**

### 2. 关键 DOM ID 检查
检查对象：
- `gameScreen`
- `locationArt`
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

结果：**关键 DOM ID 均存在**

备注：部分弹窗内部控件 ID 属于运行时动态生成，不计入静态缺失风险。

### 3. 本地资源路径检查
结果：**通过**
- 检查到 `./assets/*`、`./data/*` 引用路径存在
- 本版新增图像资源均已落地并可被项目引用

### 4. GitHub Pages 根目录结构检查
结果：**通过**
根目录保持为：
- `index.html`
- `game.js`
- `style.css`
- `README.md`
- `GITHUB_PAGES_DEPLOY.md`
- `assets/`
- `data/`
- `docs/`

适合直接部署到 GitHub Pages。

### 5. 旧存档兼容检查
结果：**通过（静态兼容）**
原因：
- `hydrate()` 仍然使用默认状态与旧存档做合并
- 新增导演流程依赖已有证据 / 场景 / 谜题完成状态推断，不要求旧存档新增字段
- `state.used` 已有默认兜底
- 未修改旧存档核心结构

### 6. 移动端点击可用检查
结果：**通过（静态检查）**
依据：
- 场景操作入口继续采用 `<button>`
- 导演流程跳转入口也采用 `<button>`
- 热点系统保留点击行为
- 样式已补充移动端适配
- 未引入依赖 hover 的唯一核心交互

---

## 风险 / 已知说明
1. 新增导演流程卡是“引导层”，不会改写第一案原有证据逻辑。
2. 第一案关键 CG 已替换为更完整图像，但人物立绘系统本身仍沿用现有角色舞台机制。
3. 第二、第三案保持原状，以确保本版重点聚焦第一案 Demo 完整度。

---

## 结论
V26 已把第一案整合成更接近 **“轻探索 + 视觉小说 + 分镜叙事 + 场景交互 + 法律推理”** 的展示型 Demo：
- 节点更清楚
- CG 更完整
- 场景推进更像导演分镜
- 玩家更容易顺着第一案跑完整个流程
- 旧系统与旧存档保持兼容
