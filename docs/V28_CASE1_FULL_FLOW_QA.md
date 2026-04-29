# V28 第一案全流程 QA + 新手引导优化

## 版本目标

在 V27「第一案法庭高潮版」基础上，本版不继续堆大系统，而是集中做第一案完整流程自测、节奏修补和新手引导优化，确保新玩家能理解并顺畅完成第一案。

---

## 本版修补 / 优化内容

### 1. 新增克制型新手引导层

新增运行时引导逻辑：

- `case1FlowGuidanceRules`
- `case1CurrentGuidance()`
- `renderCase1GuidanceCard()`
- `maybeShowFirstRunHint()`
- `case1GuidanceAction()`

引导不会强制打断玩家，而是通过右侧任务区域和少量 toast 进行提示。

### 2. 新增 FIRST RUN GUIDE 卡片

在任务区域新增 `FIRST RUN GUIDE` 卡片，会根据第一案当前状态提示下一步：

- 第一次进入：提示点击场景热点
- 第一次获得证据：提示证据会进入证据包
- 需要进入便利店：提示前往便利店继续调查
- 需要和苏岚互动：提示点击人物追问
- 需要会见陈巍：提示去会见室
- 轻解谜解锁：提示打开“案发时间排序”
- 需要组合推理：提示回律所证据墙
- 需要进入法庭：提示完整证据链后进入法庭
- 法庭阶段：提示继续关键提交和终案推理

### 3. 修补可能卡住的节点

重点检查并加提示：

- 不知道下一步去哪：由 FIRST RUN GUIDE + 导演流程卡解决
- 必要证据前置不清晰：根据证据状态提示去对应场景
- 轻解谜解锁条件不清晰：满足条件后提示开始轻解谜
- 法庭进入条件不清晰：提示先完成证据墙组合推理
- 推理链条件不清晰：引导回律所证据墙
- 导演流程和任务系统提示不一致：FIRST RUN GUIDE 直接叠在任务区域，优先说明当前可执行动作

### 4. 静态模拟第一案关键路径

已检查第一案所需关键证据均存在于场景行动或对白选择中：

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

已检查第一案关键流程具备入口：

1. 新游戏进入
2. 雨夜路口 CG
3. 商业区热点调查
4. 便利店调查
5. 苏岚互动
6. 未发送语音 CG
7. 陈巍会见
8. 证据排序轻谜题
9. 律所证据墙推理
10. 法庭质证
11. 关键证据提交
12. 第一案真相结局
13. 第二案钩子

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

检查了：

- 角色资源
- 场景资源
- 音频资源
- JS / CSS / HTML 中引用的 `./assets/*`

### 图像适配 / 错位检查

结果：通过静态检查。

检查了主要高质量图像尺寸：

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

- 本版未修改 V26 / V27 的 CG 图像容器核心定位
- 未覆盖 `cgScene`、`objectCloseupOverlay`、`locationArt` 的基础图像布局
- 高质量图像均为宽幅大图，适合当前 `background-size: cover` 的 CG / 场景容器
- 移动端仍沿用已有响应式规则，避免新增错位风险

### GitHub Pages 根目录结构检查

结果：通过。

根目录包含：

- `index.html`
- `game.js`
- `style.css`
- `assets/`
- `data/`
- `docs/`

### 旧存档兼容检查

结果：通过。

本版新增引导逻辑主要使用已有 `state.used`，不新增必需存档字段。旧存档可继续合并默认状态。

### 移动端点击检查

结果：通过静态检查。

新增引导入口为 `button`，不依赖 hover；移动端布局使用已有任务栏和响应式样式。

---

## 结论

V28 主要解决“玩家第一次玩不知道下一步做什么”的问题。第一案现在更容易顺着以下节奏完成：

调查现场 → 点击人物 → 收集证据 → 完成轻解谜 → 回律所组合推理 → 进入法庭翻盘 → 完成第一案 → 接入第二案钩子。
