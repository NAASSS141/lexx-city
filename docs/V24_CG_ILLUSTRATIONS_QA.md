# V24 关键剧情 CG / 动态插图系统 QA

本阶段新增关键剧情 CG / 动态插图系统，不修改原有功能、剧情、证据、存档、结局逻辑。

## 新增能力

- `cgIllustrationOverlay`：关键剧情 CG / 动态插图层
- `cgIllustrationNodes`：CG 节点资源表
- `showCgIllustration()`：显示指定 CG
- `closeCgIllustration()`：关闭 CG
- `queueSceneCgIllustration()`：章节 / 场景开场时触发
- `queueEvidenceCgIllustration()`：关键证据发现时触发
- `queueDialogueCgIllustration()`：关键台词出现时触发
- `pendingCgIllustration`：与物件特写、分镜叠加时延迟出场

## 已建立的关键 CG 节点资源位

1. 雨夜商业区路口，陆沉进入警戒线
2. 便利店冷白灯下的案发现场
3. 苏岚低头握着手机，未发送语音
4. 律所证据墙，陆沉连接红线
5. 医院深夜走廊，护士站灯光发白
6. 旧码头仓库，黑车尾灯映在水面
7. 法庭提交关键证据，投影幕亮起
8. 金融街天台，城市灯海下的终局对峙

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
- 不影响音频、分镜、证据、结局、存档逻辑

## 自检结果

- `node --check game.js` 通过
- 关键 DOM ID 检查通过
- 本地角色资源、背景资源和音频资源路径检查通过
- GitHub Pages 根目录结构检查通过
- 旧存档兼容：未新增必需 state 字段
- 移动端：CG 按钮可点击，布局自适应
- `prefers-reduced-motion`：动画可降级关闭
