---
name: text-animations
description: Remotion 的版式和文本动画模式。metadata:
  tags: typography, text, typewriter, highlighter ken
---
## 文字动画

基于useCurrentFrame()，逐个字符缩减字符串，打造打字机效果。

## 打字机效果

请参阅 [Typewriter](assets/text-animations-typewriter.tsx) 了解带有闪烁光标和第一句话后暂停的高级示例。

始终使用字符串切片来实现打字机效果。切勿使用每个字符的不透明度。

## 单词突出显示

请参阅 [单词突出显示](assets/text-animations-word-highlight.tsx)，了解如何对单词突出显示进行动画处理的示例，例如使用荧光笔。