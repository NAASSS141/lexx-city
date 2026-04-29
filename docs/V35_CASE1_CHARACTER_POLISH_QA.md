# V35 第一案核心角色精修版 QA

## 版本目标

V35 在 V34 人物立绘与表情资源基础上，集中精修第一案核心角色演出完成度。重点不是继续铺开所有角色，而是强化陆沉、苏岚、陈巍、乔衡四名第一案关键人物的戏剧状态，让第一案对峙、法庭高潮和结局收束更有张力。

---

## 新增角色资源

新增目录：

```text
assets/portraits/case1_drama/
```

新增 12 张第一案核心戏剧状态半身立绘，尺寸统一为 `1024 × 1536`。

### 陆沉

- `luchen_observe.png`：冷静观察
- `luchen_counter.png`：法庭反击
- `luchen_pressure.png`：质证压迫

### 苏岚

- `sulan_fear.png`：恐惧
- `sulan_waver.png`：动摇
- `sulan_confess.png`：坦白

### 陈巍

- `chenwei_angry.png`：愤怒
- `chenwei_wronged.png`：被冤
- `chenwei_breakdown.png`：崩溃

### 乔衡

- `qiao_calm.png`：伪装镇定
- `qiao_break.png`：破防
- `qiao_evade.png`：逃避

---

## 调用逻辑

新增核心逻辑：

- `case1DramaticPortraits`
- `case1DramaticLabels`
- `actorDramaticState`
- `inferCase1DramaticState(name, role, text)`
- `setActorDramaticState(name, drama, reason)`
- `currentDramaticState(name)`
- `portraitForStage(name, emotion, drama)`
- `setCase1CourtDrama(beat)`

现在以下系统会优先调用第一案核心戏剧状态立绘：

- 对话框头像
- 人物舞台
- 人物交互面板
- CG / 动态插图角色
- 法庭高潮流程
- 第一案结局演出

### 推断规则示例

- 陆沉出现“我反对 / 提交证据 / 真相 / 质证”时，进入 `counter` 或 `pressure`
- 陆沉在调查、观察、推理阶段进入 `observe`
- 苏岚出现“害怕 / 不敢 / 报警 / 打不出去”时进入 `fear`
- 苏岚涉及“黑车 / 语音 / 监控”时进入 `waver`
- 苏岚坦白相关文本进入 `confess`
- 陈巍辩解“我没 / 不是我 / 凭什么”时进入 `wronged`
- 陈巍被击穿时进入 `breakdown`
- 乔衡前期维持 `calm`
- 乔衡被证据击中时进入 `break`
- 乔衡逃避、否认、离场感文本进入 `evade`

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
- V34 表情资源系统
- 证据逻辑
- 存档逻辑
- 结局逻辑
- 第二案和第三案主体流程

---

## 检查结果

### `node --check game.js`

结果：通过。

### 关键 DOM ID 检查

结果：通过。

### 本地资源路径检查

结果：通过。

### 新增角色资源检查

结果：通过。

新增戏剧状态立绘数量：12

所有新增戏剧状态立绘尺寸均为：

```text
1024 × 1536
```

### GitHub Pages 根目录结构检查

结果：通过。

根目录包含：

- `index.html`
- `style.css`
- `game.js`
- `data/`
- `assets/`
- `assets/portraits/`
- `assets/portraits/case1_drama/`
- `docs/`
- `README.md`
- `GITHUB_PAGES_DEPLOY.md`

### 旧存档兼容检查

结果：通过静态检查。

本版新增的是运行时戏剧状态与资源映射，不新增必需 state 字段。

### 移动端点击可用检查

结果：通过静态检查。

新增内容不改变核心交互结构，人物交互仍为 button，表情资源页保持响应式布局。

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

---

## 说明与限制

本版相比 V34 更强调第一案核心人物的戏剧状态，但仍属于阶段性资源方案。它通过半身立绘资源、光效、构图、状态标签和自动调用逻辑强化演出，不等同于完全手绘的商业级多表情、多姿势差分。

如果继续提升人物演出，下一阶段应把这些戏剧状态与具体剧情节点做更细的台词节奏和镜头剪辑联动。
