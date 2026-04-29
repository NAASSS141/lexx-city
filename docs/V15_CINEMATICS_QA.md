# V15 分镜叙事系统 QA

本阶段新增分镜叙事系统，不修改剧情数据、证据逻辑、结局逻辑和存档结构。

## 新增能力

- `cinematicOverlay`：全屏分镜演出层
- `showCinematic()`：统一分镜显示函数
- `queueSceneCinematic()`：场景首次进入时显示章节镜头
- `queueEvidenceCinematic()`：获得新证据时显示证据特写
- `queueDeductionCinematic()`：组合推理完成时显示推理成立镜头
- `queueDialogueCinematic()`：法庭终案和关键证词触发对峙分镜
- `queueImpactCinematic()`：关键短句触发冲击台词分镜

## 分镜类型

- title：章节 / 场景标题卡
- evidence：证据特写
- deduction：推理成立
- confrontation：对峙镜头
- impact：冲击台词

## 兼容性

- 保持原有行动按钮与场景热点
- 保持原有剧情、证据、结局、成就、存档逻辑
- 支持点击“继续 / 跳过演出”
- 支持 Esc 关闭演出
- 移动端自适应
- `prefers-reduced-motion` 兼容

## 验证

- `game.js` 语法检查通过
- 分镜 overlay 关键 ID 检查通过
- GitHub Pages 根目录结构保留
