# V13 Stage 3 选择项 / 按钮 / 交互卡片优化 QA

本阶段只优化选择项 UI、交互按钮和互动卡片样式，不改剧情逻辑。

## 保留项

- 未修改剧情数据
- 未修改证据、结局、成就、存档逻辑
- 保留所有按钮 ID 和 data-* 绑定
- 保留所有原有点击处理函数

## 优化项

- 统一 `.btn`、`.tiny`、`.mini-btn`、`.choice`、`.action`、`.combo`、`.casePick`、`.mapNode` 等交互组件视觉
- 剧情选择项改为“选择卡片”结构
- 自动为选择项增加轻量类型：
  - tone-dialogue：普通对话
  - tone-reasoning：推理 / 证据型选择
  - tone-key：关键推进
  - tone-risk：风险 / 错误倾向
  - tone-caution：部分正确 / 谨慎
  - tone-plain：结束 / 返回
- 统一主按钮和次按钮层级
- 增强 hover、active、focus-visible 状态
- 统一弹窗、组合推理、案件卡、地图节点、回放卡片的交互风格
- 移动端点击目标大小优化
- 支持 prefers-reduced-motion
