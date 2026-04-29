# GitHub Pages 部署说明：V54 Final Public Demo

本项目是纯静态网页游戏，无需后端、无需 npm、无需构建。解压后可直接上传 GitHub Pages。

## 1. 解压 zip

请先解压，不要直接上传 zip 文件。

## 2. 确认根目录结构

`index.html` 必须在仓库根目录，不能被包在子文件夹里。

正确结构：

```text
你的仓库/
├── index.html
├── style.css
├── game.js
├── data/
├── assets/
├── docs/
├── README.md
└── GITHUB_PAGES_DEPLOY.md
```

错误结构：

```text
你的仓库/
└── law-city-game-v54-final-public-demo-release-prep/
    ├── index.html
    ├── style.css
    └── game.js
```

## 3. 上传到 GitHub

把解压后的所有文件和文件夹上传到仓库根目录。

上传后建议确认：

- `assets/` 是否完整上传
- `data/game-data.json` 和 `data/game-data.js` 是否存在
- `docs/MUSIC_CREDITS.md` 是否保留
- `index.html` 是否在根目录

## 4. 开启 Pages

1. 打开仓库 Settings
2. 进入 Pages
3. Source 选择 `Deploy from a branch`
4. Branch 选择 `main`
5. Folder 选择 `/root`
6. Save
7. 等待 1 到 3 分钟

## 5. 推荐试玩设置

- 推荐浏览器：Chrome / Edge / Safari 最新版
- 推荐设备：桌面端最佳，手机端可玩
- 推荐顺序：第一案 → 第二案 → 第三案
- 预计时长：第一案 25–40 分钟，全流程 60–90 分钟
- 建议开启声音

## 6. 常见问题

### 页面 404

通常是 `index.html` 不在仓库根目录，或 Pages 分支 / 目录选错。

### 页面打开但没有样式

通常是只上传了 `index.html`，没有上传 `style.css`、`game.js`、`assets/`、`data/`。

### 图片或 CG 不显示

通常是 `assets/` 没有完整上传，或文件名大小写被改动。请不要手动改名。

### 音频没有自动播放

浏览器会限制自动播放。玩家点击“新游戏”或页面按钮后，音频控制才会正常工作。

### 手机端显示拥挤

手机竖屏已适配，但宽幅 CG 在极窄屏可能裁切边缘。横屏会更舒适。

### 旧存档异常

本项目使用浏览器 localStorage。公开试玩前如需从头测试，可在游戏内点击重置，或清理站点数据。
