# V50 图像一致性检查与替换版 QA

## 本版目标

在 V49 证据图像与界面卡面补齐版基础上，继续检查全项目中仍在运行时使用的低完成度图像引用，并优先替换为高质量位图资源。

---

## 本版实际修复

### 1. 运行时场景图替换

已新增：

- `assets/scene_archive.jpg`
- `assets/scene_rooftop.jpg`

并替换以下场景引用：

- 第二案法庭：`scene_court.svg` → `scene_court.jpg`
- 第三案法庭：`scene_court.svg` → `scene_court.jpg`
- 市档案中心：`scene_archive.svg` → `scene_archive.jpg`
- 金融街天台：`scene_rooftop.svg` → `scene_rooftop.jpg`

### 2. 人物交互画像替换

以下对话交互入口已由旧 SVG / 旧占位画像改为高质量人物画像：

- 陈巍 → `./assets/portraits/v48_highres/chenwei_neutral.jpg`
- 李娜 → `./assets/portraits/v48_highres/lina_neutral.jpg`
- 莫野 → `./assets/portraits/v48_highres/moye_neutral.jpg`
- 乔衡 → `./assets/portraits/v48_highres/qiao_neutral.jpg`

### 3. 硬编码镜头背景替换

`game.js` 中第三案金融街天台导演镜头背景已由 SVG 改为 JPG。

---

## 图像检查结论

本轮检查后，运行时核心路径中的以下类型已基本完成图像化：

- 三案案件封面
- 三案证据图
- 角色档案图
- 成就卡面
- 结局卡面
- 三案关键 CG
- 三案核心互动角色画像
- 三案主要场景底图

---

## 仍建议继续补充 / 替换的地方

- 首页 cover.jpg 仍可继续升级为更统一的正式主视觉封面。
- 24 项证据虽然已有图像，但物件特写弹层仍以 UI 化展示为主；后续可以继续补成更强叙事感的单独证据插图。
- 部分场景仍复用通用 JPG（如法庭场景）；后续可继续为第二案法庭、第三案终审法庭分别制作差异化背景。
- assets 下保留了若干 legacy SVG 文件用于历史版本兼容与回退，但运行时已不再引用。

---

## 保留项

未删除或破坏以下内容：

- 剧情、证据、存档、结局逻辑
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
- 第二案导演流程
- 第三案导演流程
- FIRST RUN GUIDE 新手引导
- 电脑端布局优化
- 移动端触控优化
- 公开试玩说明与反馈模板

---

## 检查结果

- `node --check game.js`：通过
- 关键 DOM ID：通过
- 本地资源路径：通过
- GitHub Pages 根目录结构：通过
- 旧存档兼容静态检查：通过
- 电脑端点击可用静态检查：通过
- 移动端点击可用静态检查：通过
- 三案关键路径静态模拟：通过
- zip 根目录可直接部署：打包前检查通过

---

## 结论

V50 继续减少了运行时仍在使用的 SVG / 占位图引用，并补上了第三案关键场景图。现在项目的图像一致性比 V49 更完整，剩余待补图位置也更清晰。
