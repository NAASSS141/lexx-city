# V11 音频包说明

V11 已内置真实 WAV 音频素材，路径如下：

```text
assets/audio/
├── bgm_city.wav
├── bgm_mystery.wav
├── bgm_court.wav
├── bgm_rooftop.wav
├── rain_loop.wav
├── sfx_click.wav
├── sfx_evidence.wav
├── sfx_success.wav
├── sfx_fail.wav
└── sfx_court.wav
```

## 如何替换为自己的 BGM

保持文件名不变，直接替换 `assets/audio/` 中的文件即可。

如果你想改文件名，需要同步修改：

```text
data/game-data.json
data/game-data.js
```

位置：

```json
metadata.audioFiles
```

## 浏览器播放限制

大多数浏览器要求用户先点击页面，音频才能播放。因此游戏会在第一次点击后自动激活音频。

## 双轨混音

V11 同时保留：

- 程序生成的动态配乐
- 真实 WAV 音频文件

你可以在游戏内的“音频包”面板里打开或关闭真实音频包。
