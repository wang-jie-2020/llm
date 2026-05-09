---
name: get-audio-duration
description: 使用 Mediabunny 获取音频文件的持续时间（以秒为单位）metadata:
  tags: duration, audio, length, time, seconds, mp3, wav
---
# 使用 Mediabunny 获取音频持续时间

Mediabunny 可以提取音频文件的持续时间。它适用于浏览器、Node.js 和 Bun 环境。

## 获取音频时长```tsx
import { Input, ALL_FORMATS, UrlSource } from "mediabunny";

export const getAudioDuration = async (src: string) => {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new UrlSource(src, {
      getRetryDelay: () => null,
    }),
  });

  const durationInSeconds = await input.computeDuration();
  return durationInSeconds;
};
```
＃＃ 用法```tsx
const duration = await getAudioDuration("https://remotion.media/audio.mp3");
console.log(duration); // e.g. 180.5 (seconds)
```
## 与本地文件一起使用

对于本地文件，请使用“FileSource”而不是“UrlSource”：```tsx
import { Input, ALL_FORMATS, FileSource } from "mediabunny";

const input = new Input({
  formats: ALL_FORMATS,
  source: new FileSource(file), // File object from input or drag-drop
});

const durationInSeconds = await input.computeDuration();
```
## 在 Remotion 中与 staticFile 一起使用```tsx
import { staticFile } from "remotion";

const duration = await getAudioDuration(staticFile("audio.mp3"));
```
