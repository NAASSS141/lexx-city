# 法域之城 V10 扩展手册

V10 把核心剧情数据抽离到了 `data/` 目录，方便继续扩展案件。

## 主要文件

- `index.html`：页面结构与脚本加载顺序
- `style.css`：全部视觉样式
- `game.js`：游戏引擎逻辑，包括存档、音效、渲染、解锁、结局
- `data/game-data.json`：可读剧情数据源
- `data/game-data.js`：浏览器直接使用的数据文件，部署静态站必须加载它
- `assets/`：图片、SVG、角色立绘、场景图

## 修改剧情的推荐流程

1. 先编辑 `data/game-data.json`
2. 同步生成 `data/game-data.js`
3. 检查 `index.html` 是否先加载 `data/game-data.js`
4. 打开游戏测试证据、地点、组合推理和结局是否正常

## 新增证据

在 `evidenceMeta` 中添加：

```json
"新证据名称": ["图标", "说明文字"]
```

然后在某个场景 action 或对话 choice 中引用：

```json
{
  "id": "uniqueActionId",
  "icon": "🔎",
  "title": "调查目标",
  "text": "按钮说明",
  "evidence": "新证据名称",
  "truth": 1,
  "say": "调查后显示的叙述"
}
```

## 新增场景

在 `scenes` 中添加场景，并在其他场景的 action 中通过 `goto` 引用。

## 解锁条件

可用字段：

- `require`: 必须拥有全部指定证据/推理
- `requireAny`: 拥有其中任意一个
- `requireCount`: 已收集证据数量
- `requireCase`: 必须完成某个案件，例如 `case2`

## 注意事项

- `id` 必须唯一，避免覆盖存档状态
- 证据名必须与 `evidenceMeta` 完全一致
- 场景 ID、对话 ID、组合推理 ID 推荐使用英文或拼音
