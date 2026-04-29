# V25 角色动作与姿态切换系统 QA

本阶段新增角色动作 / 姿态系统，不修改原有功能、剧情、证据、存档、结局逻辑。

## 新增能力

- `actorActionProfiles`：每个主要角色可用动作表
- `actorActionState`：运行时动作状态，不写入存档
- `inferActorAction()`：根据角色、场景和对白内容自动推断动作
- `setActorAction()`：设置当前角色动作
- `actorActionFor()`：人物舞台渲染时计算动作
- `actionLabel()`：动作标签显示
- CG / 动态插图角色同步支持动作姿态

## 支持动作 / 姿态

- idle：默认站立
- speak：发言中
- think：思考 / 观察
- tense：紧张 / 对峙
- stepIn：上前一步
- stepBack：后退 / 犹疑
- point：指向证据 / 强调
- lowerHead：低头 / 沉默

## 主要角色映射

- 陆沉：idle / speak / think / stepIn / point / tense
- 韩亦：idle / speak / think / tense
- 苏岚：idle / lowerHead / speak / stepBack / tense
- 陈巍：idle / tense / stepIn / speak
- 李娜：idle / lowerHead / speak / tense
- 莫野：idle / speak / think / tense
- 乔衡：idle / speak / tense / stepIn / stepBack

## 保留项

- 不删除原有对话框
- 不删除热点探索
- 不删除人物交互
- 不删除物件特写
- 不删除人物情绪系统
- 不删除人物舞台
- 不删除镜头系统
- 不删除动态场景
- 不删除行动按钮
- 不删除任务系统
- 不删除轻解谜系统
- 不删除 CG / 动态插图系统
- 不影响音频、分镜、证据、结局、存档逻辑

## 检查结果

- `node --check game.js` 通过
- 关键 DOM ID 检查通过
- 本地角色资源、背景资源和音频资源路径检查通过
- GitHub Pages 根目录结构检查通过
- 旧存档兼容：未新增必需 state 字段；动作状态为运行时状态
- 移动端：人物仍为可点击 button，动作徽章和姿态自动收敛
- `prefers-reduced-motion`：发言呼吸和指证闪线动画可关闭
