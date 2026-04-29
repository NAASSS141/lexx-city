# V49 证据图像与界面卡面补齐版 QA

## 版本目标

V49 基于 V48 Character Portrait Upgrade，继续补齐全三案仍然缺少高质量图像的界面位置。目标不是新增剧情或大系统，而是减少“简约图标 / 占位块”在证据、案件资料馆、时间线、成就和结局收藏中的使用。

---

## 新增或替换的图像

### 新增目录

```text
assets/ui/
```

### 新增图像数量

```text
23 张
```

### 新增图像清单

- `assets/ui/achievement_banner.jpg`：118.9 KB
- `assets/ui/achievement_case1Closer.jpg`：55.0 KB
- `assets/ui/achievement_case2Closer.jpg`：50.4 KB
- `assets/ui/achievement_case3Closer.jpg`：35.5 KB
- `assets/ui/achievement_comboApprentice.jpg`：64.2 KB
- `assets/ui/achievement_comboMaster.jpg`：56.2 KB
- `assets/ui/achievement_ethicsHigh.jpg`：58.4 KB
- `assets/ui/achievement_evidenceHunter.jpg`：43.6 KB
- `assets/ui/achievement_firstEvidence.jpg`：41.4 KB
- `assets/ui/achievement_fullArchive.jpg`：35.8 KB
- `assets/ui/case_cover_case1.jpg`：150.3 KB
- `assets/ui/case_cover_case2.jpg`：127.2 KB
- `assets/ui/case_cover_case3.jpg`：63.7 KB
- `assets/ui/character_dossier_banner.jpg`：135.2 KB
- `assets/ui/ending_bad.jpg`：58.6 KB
- `assets/ui/ending_banner.jpg`：116.2 KB
- `assets/ui/ending_case1_truth.jpg`：55.1 KB
- `assets/ui/ending_case2_truth.jpg`：53.2 KB
- `assets/ui/ending_case3_truth.jpg`：35.1 KB
- `assets/ui/ending_fog.jpg`：70.2 KB
- `assets/ui/ending_partial.jpg`：55.6 KB
- `assets/ui/evidence_atlas_banner.jpg`：82.3 KB
- `assets/ui/timeline_banner.jpg`：142.7 KB

---

## 覆盖位置

### 1. 案件大厅

新增 3 张案件封面：

- `case_cover_case1.jpg`
- `case_cover_case2.jpg`
- `case_cover_case3.jpg`

`showCaseSelect()` 已改为优先使用案件封面图，不再直接使用普通场景图当案件封面。

### 2. 证据图鉴

`showEvidenceAtlas()` 已更新：

- 已解锁证据卡片显示证据图像
- 未解锁证据显示 LOCKED 图像卡面
- 推理完成卡片使用证据库视觉图
- 不再用单个 emoji 图标作为主要视觉

### 3. 时间线

`showTimeline()` 已更新：

- 每个地点节点显示场景缩略图
- 近期证据列表显示证据缩略图
- 时间线页面增加视觉横幅

### 4. 角色档案

`showCharacterCodex()` 已新增角色档案视觉横幅，让资料馆页面不再只有卡片排布。

### 5. 成就系统

`showAchievements()` 已更新：

- 每个成就卡片接入成就卡面图
- 成就页增加视觉横幅

### 6. 结局收藏

`showEndingCollection()` 已更新：

- 每个结局卡片接入结局卡面图
- 结局页增加视觉横幅

---

## 新增运行时映射

新增：

- `caseCoverImageMap`
- `archiveBannerImages`
- `achievementImageMap`
- `endingImageMap`
- `archiveBanner()`
- `evidenceCardImage()`
- `sceneCardImage()`

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
- V47 主角画像补齐
- V48 关键角色画像补齐

---

## 检查结果

### `node --check game.js`

结果：通过。

### 关键 DOM ID 检查

结果：通过。

### 本地资源路径检查

结果：通过。

### 新增图像检查

结果：通过。

- `assets/ui/` 图像数量：23
- 案件封面与页面横幅尺寸：1280 × 720
- 成就 / 结局卡面尺寸：800 × 450

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

### zip 根目录直接部署检查

结果：通过。

---

## 结论

V49 已继续减少“简约图标代替完整图像”的情况。案件大厅、证据图鉴、时间线、角色档案、成就页和结局收藏都接入了更完整的图像化资源。
