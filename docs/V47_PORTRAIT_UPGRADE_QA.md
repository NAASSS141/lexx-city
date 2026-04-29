# V47 人物画像补齐第一批 QA

## 版本目标

V47 基于 V46 图像资源补齐第一批，继续补齐“应有高质量图像的位置不能只用简约图标代替”的问题。本版先更新核心主角陆沉的人物画像与关键演出状态，形成可运行 zip，后续继续补齐其他人物。

---

## 本版新增

### 1. 新增高质量人物画像目录

```text
assets/portraits/v47_highres/
```

### 2. 新增 9 张陆沉高质量画像

所有新增画像尺寸均为：

```text
853 × 1280
```

新增画像：

- `./assets/portraits/v47_highres/luchen_neutral.jpg`：156.3 KB
- `./assets/portraits/v47_highres/luchen_serious.jpg`：138.0 KB
- `./assets/portraits/v47_highres/luchen_resolve.jpg`：125.8 KB
- `./assets/portraits/v47_highres/luchen_observe.jpg`：101.5 KB
- `./assets/portraits/v47_highres/luchen_counter.jpg`：125.8 KB
- `./assets/portraits/v47_highres/luchen_pressure.jpg`：131.5 KB
- `./assets/portraits/v47_highres/luchen_investigate.jpg`：101.5 KB
- `./assets/portraits/v47_highres/luchen_interrogate.jpg`：125.8 KB
- `./assets/portraits/v47_highres/luchen_chain.jpg`：131.5 KB

### 3. 替换 / 接入位置

本版替换了以下陆沉相关映射：

- 普通表情：neutral / serious / resolve
- 第一案戏剧状态：observe / counter / pressure
- 第二案戏剧状态：investigate / interrogate / chain
- 第三案新增陆沉状态：archive / rooftop / finalCourt

### 4. 第三案人物状态补充

新增：

- `case3DramaticPortraits`
- `case3DramaticLabels`

让第三案档案中心、金融街天台和终审法庭可以调用更明确的陆沉终局演出画像。

---

## 保留项

未删除或破坏以下系统：

- 剧情逻辑
- 证据逻辑
- 存档逻辑
- 结局逻辑
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
- V45 资源压缩
- V46 证据图像补齐

---

## 检查结果

### `node --check game.js`

结果：通过。

### 关键 DOM ID 检查

结果：通过。

### 本地资源路径检查

结果：通过。

### 人物画像检查

结果：通过。

- 新增画像数量：9
- 图像文件存在：通过
- 图像尺寸 853 × 1280：通过
- 游戏映射引用：通过

### GitHub Pages 根目录结构检查

结果：通过。

### 旧存档兼容检查

结果：通过静态检查。

本版新增人物画像资源和映射，不新增必需 state 字段。

### 电脑端 / 移动端点击检查

结果：通过静态检查。

### 三案关键路径静态模拟

结果：通过。

第一案、第二案、第三案关键证据、组合推理和轻解谜均保留。

---

## 未完成项

本版只完成“人物画像补齐第一批”。仍建议后续继续补齐：

- 苏岚：恐惧 / 动摇 / 坦白
- 陈巍：被冤 / 愤怒 / 崩溃
- 乔衡：伪装镇定 / 破防 / 逃避
- 李娜：犹豫 / 害怕 / 作证
- 莫野：观察 / 警惕 / 交出录音
- 韩亦：记录 / 核对路线 / 法庭辅助
- 案件大厅、时间线、资料馆等页面的卡面图

---

## 结论

V47 已把主角陆沉从旧合成图升级为高质量画像，并覆盖三案关键演出状态。可以作为继续补充其他角色画像的基础版本。
