---
name: transcribe-captions
description: 在 Remotion 中转录音频以生成字幕metadata:
  tags: captions, transcribe, whisper, audio, speech-to-text
---
# 转录音频

Remotion 提供了多个用于转录音频以生成字幕的内置选项：

- `@remotion/install-whisper-cpp` - 使用 Whisper.cpp 在服务器上进行本地转录。快速且免费，但需要服务器基础设施。
  <https://remotion.dev/docs/install-whisper-cpp>

- `@remotion/whisper-web` - 使用 WebAssembly 在浏览器中转录。不需要服务器并且免费，但由于 WASM 开销而速度较慢。
  <https://remotion.dev/docs/whisper-web>

- `@remotion/openai-whisper` - 使用 OpenAI Whisper API 进行基于云的转录。速度快，不需要服务器，但需要付费。
  <https://remotion.dev/docs/openai-whisper/openai-whisper-api-to-captions>