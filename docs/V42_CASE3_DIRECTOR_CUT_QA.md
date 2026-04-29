# V42 第三案导演剪辑版 QA

## 版本目标

V42 基于 V41 第二案美术与角色演出精修版，集中打磨第三案“灰塔匿名函”。本版不新增大系统，不改变剧情、证据、存档、结局逻辑，而是整合已有热点探索、人物舞台、人物情绪、角色动作、镜头语言、动态场景、人物交互、物件特写、CG / 动态插图、任务系统和轻解谜系统，让第三案成为更完整的终局关卡。

---

## 第三案精修节点

本版重点覆盖：

1. 第三案开场钩子
2. 市档案中心调查
3. 匿名函残页 / 审计 U 盘 / 董事会日程物件特写
4. 金融街天台调查
5. 乔衡人物交互
6. 天台门禁记录 / 狙击照片底片 / 灰塔转账凭证物件特写
7. 第三案证据提交轻谜题
8. 律所证据墙组合推理
9. 终审法庭质证
10. 终局结局演出

---

## 新增或复用的演出

### 1. 第三案导演流程

新增：

- `case3DirectorBeatDefs`
- `case3DirectorBeatState()`
- `case3DirectorBeatAction()`
- `renderCase3DirectorCard()`
- `renderCase3QuickAction()`

第三案右侧任务区现在会显示专属导演流程卡，并根据当前节点提供主按钮。

### 2. 第三案下一步引导

新增：

- `case3GuidanceRules`
- `case3CurrentGuidance()`
- `handleCase3GuidanceAction()`
- `renderCase3GuidanceCard()`

引导覆盖：

- 前往档案中心
- 提取审计 U 盘
- 追问乔衡
- 前往金融街天台
- 完成第三案轻解谜
- 回律所证据墙
- 进入终审法庭

### 3. 第三案镜头系统接入

新增：

- `case3DirectingCues`
- `applyCase3DirectingCue()`
- `case3CueForEvidence()`
- `case3DramaForCue()`
- `case3CgForCue()`
- `applyCase3SceneEntryCue()`

节点对应：

- `archive_entry`：市档案中心建立镜头
- `archive_letter`：匿名函残页插入镜头
- `archive_usb`：审计 U 盘插入镜头
- `archive_board`：董事会日程插入镜头
- `qiao_money`：乔衡 / 灰塔转账凭证近景
- `rooftop_entry`：金融街天台建立镜头
- `rooftop_access`：天台门禁记录插入镜头
- `rooftop_film`：狙击照片底片插入镜头
- `case3_office`：律所终局组合推理
- `case3_court_open`：终审法庭开场
- `case3_submit`：提交灰塔转账凭证
- `case3_ending`：终极结局演出

### 4. 第三案 CG / 动态插图

新增 6 张第三案关键 CG，尺寸统一为 `1280 × 720`：

- `cg_case3_archive_intro.jpg`
- `cg_case3_archive_evidence.jpg`
- `cg_case3_rooftop_qiao.jpg`
- `cg_case3_rooftop_evidence.jpg`
- `cg_case3_court_final.jpg`
- `cg_case3_ending.jpg`

新增 CG 节点：

- `case3_archive_intro`
- `case3_archive_evidence`
- `case3_rooftop_qiao`
- `case3_rooftop_evidence`
- `case3_court_final`
- `case3_ending`

`cgSceneMap` 新增或调整：

- `archive → case3_archive_intro`
- `rooftop → case3_rooftop_qiao`
- `court3 → case3_court_final`

`cgEvidenceMap` 新增第三案证据映射：

- 匿名函残页
- 审计 U 盘
- 董事会日程
- 灰塔转账凭证
- 天台门禁记录
- 狙击照片底片

### 5. 第三案文案与目标清晰化

不新增大型剧情段落，但强化了第三案目标表达：

- 市档案中心：匿名函残页、审计 U 盘与董事会日程
- 金融街天台：门禁记录、照片底片与灰塔转账凭证
- 终审法庭：提交灰塔资本相关证据链
- 乔衡对白更直接说明灰塔转账和账本切割责任

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
- 证据逻辑
- 存档逻辑
- 结局逻辑

---

## 检查结果

### `node --check game.js`

结果：通过。

### 关键 DOM ID 检查

结果：通过。

### 本地资源路径检查

结果：通过。

### 新增 CG 资源检查

结果：通过。

新增第三案关键 CG 数量：6

所有新增第三案 CG 尺寸均为：

```text
1280 × 720
```

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

本版新增的是第三案导演流程、运行时镜头节拍、CG 映射和 UI 引导，不新增必需 state 字段。

### 电脑端点击可用检查

结果：通过静态检查。

保留系统面板函数：

- `showMap()`
- `showEvidenceAtlas()`
- `showTimeline()`
- `showMissionPanel()`
- `showNotebook()`
- `showCaseSelect()`

### 第三案关键路径静态模拟

结果：通过。

第三案关键证据仍可通过场景行动或对白选择获得：

- 匿名函残页
- 审计U盘
- 董事会日程
- 灰塔转账凭证
- 天台门禁记录
- 狙击照片底片

第三案组合推理结果仍存在：

- 组合推理：灰塔资本介入灭口
- 组合推理：终局委托人锁定

第三案轻解谜仍存在：

- `c3_submit_greytower`

---

## 说明

本版没有新增大型视频资源，优先复用已有场景、角色立绘、动态层和 UI 化证据系统，同时新增轻量级第三案 CG 图。第三案现在具备更明确的档案中心调查、金融街天台对峙、灰塔资本证据链、终审法庭质证和终局收束。
