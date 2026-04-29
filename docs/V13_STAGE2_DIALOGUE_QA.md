# V13 Stage 2 对话框 / 文字演出优化 QA

本阶段只优化对话框系统、文字排版和对白演出，不改剧情内容和玩法逻辑。

## 保留项

- 未修改剧情数据
- 未修改证据、结局、成就、存档逻辑
- 保留原有 ID：
  - speakerPortrait
  - speakerName
  - speakerRole
  - dialogueText
  - choiceList

## 视觉与演出改动

- 对话框改为深蓝黑玻璃拟态 + 金色细边
- 新增角色名字牌视觉
- 新增角色状态标签：ON RECORD / SYSTEM LOG / EVIDENCE / KEY LINE / NARRATION
- 文本行距、宽度、字号和阅读节奏优化
- 文本模式自动区分：
  - 普通对白
  - 系统提示
  - 证据提示
  - 冲击性关键台词
  - 旁白
- 打字机节奏加强，标点处有轻微停顿
- 关键台词使用更大字号和电影感强调
- 移动端对话框改为纵向布局
- 支持 prefers-reduced-motion
