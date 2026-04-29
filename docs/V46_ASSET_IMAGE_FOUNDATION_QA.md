# V46 图像资源补齐第一批 QA

## 版本目标

V46 基于 V45 资源压缩版，先交付一版可运行 zip，并开始补齐“每一处应有高质量图像的地方不能只用简约图标代替”的问题。

本版第一批优先补齐证据特写图像。

---

## 本版新增

### 1. 新增证据图像目录

```text
assets/evidence/
```

### 2. 新增 24 张证据特写图像

所有新增证据图像尺寸均为：

```text
1280 × 720
```

覆盖证据：

- 破损监控记录 → `./assets/evidence/case1_evidence_01.jpg`
- 店内网络异常 → `./assets/evidence/case1_evidence_02.jpg`
- 22:13 小票 → `./assets/evidence/case1_evidence_03.jpg`
- 黑车车牌残片 → `./assets/evidence/case1_evidence_04.jpg`
- 匿名来电记录 → `./assets/evidence/case1_evidence_05.jpg`
- 逆向轮胎水痕 → `./assets/evidence/case1_evidence_06.jpg`
- 二次出血痕迹 → `./assets/evidence/case1_evidence_07.jpg`
- 未发送语音 → `./assets/evidence/case1_evidence_08.jpg`
- 袖口机油 → `./assets/evidence/case1_evidence_09.jpg`
- 店长删改指令 → `./assets/evidence/case1_evidence_10.jpg`
- 保险柜合同 → `./assets/evidence/case1_evidence_11.jpg`
- 伪造订单提醒 → `./assets/evidence/case1_evidence_12.jpg`
- 医院缴费单 → `./assets/evidence/case2_evidence_13.jpg`
- 护士交班记录 → `./assets/evidence/case2_evidence_14.jpg`
- 残缺账本页 → `./assets/evidence/case2_evidence_15.jpg`
- 码头监控截图 → `./assets/evidence/case2_evidence_16.jpg`
- 货柜封条 → `./assets/evidence/case2_evidence_17.jpg`
- 私家侦探录音 → `./assets/evidence/case2_evidence_18.jpg`
- 匿名函残页 → `./assets/evidence/case3_evidence_19.jpg`
- 审计U盘 → `./assets/evidence/case3_evidence_20.jpg`
- 董事会日程 → `./assets/evidence/case3_evidence_21.jpg`
- 灰塔转账凭证 → `./assets/evidence/case3_evidence_22.jpg`
- 天台门禁记录 → `./assets/evidence/case3_evidence_23.jpg`
- 狙击照片底片 → `./assets/evidence/case3_evidence_24.jpg`

### 3. 物件特写层改造

`objectVisualFor()` 已改为优先读取：

```text
evidenceImageMap
```

只要证据存在对应图像，就显示真实图像资源，不再只依赖 CSS 简约图标 / 示意块。

### 4. UI 样式补充

新增 V46 CSS：

- `.obj-evidence-image-wrap`
- `.obj-evidence-image`
- 图像化证据标题栏
- 移动端证据图像标题适配

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

---

## 检查结果

### `node --check game.js`

结果：通过。

### 关键 DOM ID 检查

结果：通过。

### 本地资源路径检查

结果：通过。

### 证据图像检查

结果：通过。

- `evidenceImageMap` 条目数：24
- 图像文件存在：通过
- 图像尺寸 1280 × 720：通过

### GitHub Pages 根目录结构检查

结果：通过。

### 旧存档兼容检查

结果：通过静态检查。

本版新增图像资源和 UI 映射，不新增必需 state 字段。

### 电脑端 / 移动端点击检查

结果：通过静态检查。

### 三案关键路径静态模拟

结果：通过。

第一案、第二案、第三案关键证据、组合推理和轻解谜均保留。

---

## 未完成项

本版是“图像补齐第一批”，优先处理证据图像。人物画像仍建议继续下一批精修：

- 补充非核心角色更完整的高质量半身像
- 替换仍显得像合成卡片的角色状态图
- 为关键人物交互面板补专属头像 / 半身图
- 为案件大厅、时间线、资料馆等页面补卡面图

---

## 结论

V46 可以先作为可部署版本使用。它已经把 24 个关键证据的物件特写从简约图标升级为真实图像资源，为后续人物画像补齐打下资产基础。
