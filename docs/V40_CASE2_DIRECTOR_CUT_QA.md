# V40 第二案导演剪辑版 QA

## 版本目标

V40 基于 V39 电脑端真实试玩专项修复版，集中打磨第二案“沉默账本”。本版不新增大型资源，不改变剧情、证据、存档、结局逻辑，而是整合已有热点探索、人物舞台、人物情绪、角色动作、镜头语言、动态场景、人物交互、物件特写、CG / 动态插图、任务系统和轻解谜系统，让第二案从结构性章节提升为更完整的可展示关卡。

---

## 第二案精修节点

本版重点覆盖：

1. 第二案开场钩子
2. 云港医院调查
3. 李娜人物交互
4. 医院缴费单 / 护士交班记录 / 残缺账本页物件特写
5. 旧码头仓库调查
6. 莫野人物交互
7. 码头监控截图 / 货柜封条 / 私家侦探录音物件特写
8. 第二案轻解谜
9. 律所证据墙组合推理
10. 第二案法庭质证
11. 第二案结局与第三案钩子

---

## 新增或复用的演出

### 1. 第二案导演流程

新增：

- `case2DirectorBeatDefs`
- `case2DirectorBeatState()`
- `case2DirectorBeatAction()`
- `renderCase2DirectorCard()`
- `renderCase2QuickAction()`

第二案右侧任务区现在会显示专属导演流程卡，当前节点会提供一个主按钮。

### 2. 第二案玩家引导

新增：

- `case2GuidanceRules`
- `case2CurrentGuidance()`
- `handleCase2GuidanceAction()`
- `renderCase2GuidanceCard()`

引导覆盖：

- 前往云港医院
- 询问李娜
- 前往旧码头
- 会见莫野
- 完成第二案轻解谜
- 回律所证据墙
- 进入第二案法庭

### 3. 第二案镜头系统接入

新增：

- `case2DirectingCues`
- `applyCase2DirectingCue()`
- `case2CueForEvidence()`
- `applyCase2SceneEntryCue()`

节点对应：

- `hospital_entry`：云港医院建立镜头
- `hospital_bill`：医院缴费单插入镜头
- `hospital_log`：护士交班记录插入镜头
- `lina_ledger`：李娜 / 残缺账本页近景
- `dock_entry`：旧码头仓库建立镜头
- `dock_camera`：码头监控截图插入镜头
- `dock_seal`：货柜封条插入镜头
- `moye_recording`：莫野 / 私家侦探录音近景
- `case2_office`：律所证据墙第二案组合推理
- `case2_court_open`：第二案法庭开场
- `case2_submit`：提交私家侦探录音
- `case2_ending`：第二案结局与第三案钩子

### 4. 第二案 CG / 动态插图复用

未新增大型资源，复用现有资源：

- 医院节点复用 `hospital_night`
- 码头节点复用 `dock_blackcar`
- 第二案法庭新增 `case2_court_submission`，复用现有法庭投影资源

`cgEvidenceMap` 新增第二案证据映射：

- 医院缴费单
- 护士交班记录
- 残缺账本页
- 码头监控截图
- 货柜封条
- 私家侦探录音

### 5. 第二案轻解谜联动

已有轻解谜：

- `c2_route_chain`
- `c2_submit_recording`

现在接入导演节拍：

- `c2_route_chain` → `case2_office`
- `c2_submit_recording` → `case2_submit`

### 6. 第二案文案与目标清晰化

不新增大段剧情，但清理和强化了第二案目标表达：

- 云港医院：病历调取、缴费记录、交班本与病历柜
- 旧码头仓库：监控点、9 号货柜、封条与黑车停留记录
- 第二案法庭：提交医院账本与旧码头委托链
- 李娜对白更直接说明病历、账本页与威胁关系
- 莫野对白更直接说明乔衡不是终点、码头负责处理账本

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
- 电脑端布局优化
- 公开试玩说明与反馈模板
- V34 表情资源系统
- V35 第一案戏剧状态系统
- V36 文案清理
- V37 镜头剪辑与台词节奏系统
- V38 真人试玩修复
- V39 电脑端试玩修复
- 证据逻辑
- 存档逻辑
- 结局逻辑
- 第三案主体结构

---

## 检查结果

### `node --check game.js`

结果：通过。

### 关键 DOM ID 检查

结果：通过。

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

本版新增的是第二案导演流程、运行时镜头节拍和 UI 引导，不新增必需 state 字段。

### 电脑端点击可用检查

结果：通过静态检查。

保留系统面板函数：

- `showMap()`
- `showEvidenceAtlas()`
- `showTimeline()`
- `showMissionPanel()`
- `showNotebook()`
- `showCaseSelect()`

### 第二案关键路径静态模拟

结果：通过。

第二案关键证据仍可通过场景行动或对白选择获得：

- 医院缴费单
- 护士交班记录
- 残缺账本页
- 码头监控截图
- 货柜封条
- 私家侦探录音

第二案组合推理结果仍存在：

- 组合推理：受害人掌握地下账本
- 组合推理：幕后委托人浮出

第二案轻解谜仍存在：

- `c2_route_chain`
- `c2_submit_recording`

---

## 说明

本版没有新增大型资源，优先复用现有场景、CG 和 UI 化证据特写。第二案整体流程已更完整，但若要达到第一案完全同等水准，下一步可继续补第二案专用 CG、李娜 / 莫野 / 幕后委托链专属戏剧状态立绘。
