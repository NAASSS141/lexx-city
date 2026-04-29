# V41 第二案美术与角色演出精修版 QA

## 版本目标

V41 基于 V40 第二案导演剪辑版，进一步提升第二案“沉默账本”的视觉完成度和人物演出感。目标不是新增大系统，而是补强第二案的角色状态、场景氛围、关键 CG / 动态插图和法庭质证表现，让第二案更接近第一案的完成度。

---

## 新增或调整的角色状态

新增目录：

```text
assets/portraits/case2_drama/
```

新增 12 张第二案戏剧状态立绘，尺寸统一为 `1024 × 1536`。

### 李娜

- `lina_hesitate.png`：犹豫
- `lina_fear.png`：害怕
- `lina_testify.png`：作证

### 莫野

- `moye_observe.png`：观察
- `moye_guard.png`：警惕
- `moye_recording.png`：交出录音

### 陆沉

- `luchen_investigate.png`：调查
- `luchen_interrogate.png`：质证
- `luchen_chain.png`：推进证据链

### 韩亦

- `hanyi_record.png`：记录
- `hanyi_route.png`：核对路线
- `hanyi_courtAssist.png`：法庭辅助

新增 / 调整逻辑：

- `case2DramaticPortraits`
- `case2DramaticLabels`
- `inferCase2DramaticState()`
- `case2DramaForCue()`
- `dramaPortraitFor()`
- `portraitForStage()` 现在支持第一案和第二案戏剧状态立绘
- `showExpressionGallery()` 现在会显示第二案戏剧状态资源

---

## 视觉 / CG / 动效调整

新增 6 张第二案关键动态插图背景，尺寸统一为 `1280 × 720`：

- `cg_case2_hospital_lina.jpg`
- `cg_case2_lina_ledger.jpg`
- `cg_case2_dock_moye.jpg`
- `cg_case2_office_chain.jpg`
- `cg_case2_court_recording.jpg`
- `cg_case2_next_hook.jpg`

新增 / 调整 CG 节点：

- `case2_hospital_lina`：云港医院开场
- `case2_lina_ledger`：李娜交出残缺账本页
- `case2_dock_moye`：旧码头黑车与 9 号货柜
- `case2_office_chain`：律所整理医院与码头证据
- `case2_court_recording`：第二案法庭提交录音
- `case2_next_hook`：第二案结局与第三案钩子

第二案镜头节点现在会联动：

- 角色戏剧状态
- 人物舞台立绘
- 对话框头像
- 人物交互面板
- CG 角色层
- 证据获得 CG
- 第二案导演流程节拍

---

## 第二案关键节点覆盖

本版重点强化：

1. 云港医院开场
2. 李娜交出残缺账本页
3. 旧码头黑车与 9 号货柜
4. 莫野交出私家侦探录音
5. 律所整理医院与码头证据
6. 第二案法庭提交录音
7. 第二案结局与第三案钩子

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

### 新增角色状态资源检查

结果：通过。

新增第二案戏剧状态立绘数量：12

所有新增第二案戏剧状态立绘尺寸均为：

```text
1024 × 1536
```

### 新增 CG 资源检查

结果：通过。

新增第二案关键 CG 数量：6

所有新增第二案 CG 尺寸均为：

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

本版新增的是资源、运行时角色状态和 CG 映射，不新增必需 state 字段。

### 电脑端点击可用检查

结果：通过静态检查。

保留系统面板函数与 V39 电脑端布局修复。

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

本版优先复用现有素材，通过二次合成、光效、构图和 UI 化 CG 强化第二案表现，没有引入大型视频资源。第二案已经具备更明确的医院证人、码头线人、律所推理和法庭质证画面记忆点。
