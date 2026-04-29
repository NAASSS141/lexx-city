# V21 人物情绪与表情系统 QA

本阶段新增人物情绪系统，不修改原有功能、剧情、证据、存档、结局逻辑。

## 新增能力

- `actorEmotionProfiles`：每个角色可用情绪
- `actorEmotionState`：运行时情绪状态，不写入存档
- `inferActorEmotion()`：根据角色、场景、对白内容自动推断情绪
- `setActorEmotion()`：设置当前发言角色情绪
- `actorEmotionFor()`：渲染人物舞台时计算当前情绪
- 情绪徽章：角色名牌旁显示当前状态

## 支持情绪

- neutral：默认 / 平静
- serious：严肃
- shock：惊讶 / 动摇
- anger：愤怒 / 压抑
- sad：沉默 / 低落
- resolve：坚定 / 反击

## 保留项

- 不删除原有对话框
- 不删除热点探索
- 不删除人物舞台
- 不删除镜头系统
- 不删除动态场景
- 不删除行动按钮
- 不删除任务系统
- 不删除轻解谜系统
- 不影响音频、分镜、证据、结局、存档逻辑

## 检查结果

- `node --check game.js` 通过
- 关键 DOM ID 检查通过
- 本地角色资源和音频资源路径检查通过
- GitHub Pages 根目录结构检查通过
- 旧存档兼容：未新增必需 state 字段；情绪状态为运行时状态
- 移动端：角色仍是可点击 button，情绪徽章自动缩小
- `prefers-reduced-motion`：shock / anger 动画自动关闭
