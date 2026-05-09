---
paths:
  - "**/*.dart"
  - "**/pubspec.yaml"
  - "**/analysis_options.yaml"
---
# 飞镖/颤动钩

> 此文件使用 Dart 和 Flutter 特定的内容扩展了 [common/hooks.md](../common/hooks.md)。

## PostToolUse 挂钩

在`~/.claude/settings.json`中配置：

- **dart 格式**：编辑后自动格式化 `.dart` 文件
- **dart分析**：编辑Dart文件和表面警告后运行静态分析
- **颤振测试**：可选择在重大更改后运行受影响的测试

## 推荐的钩子配置```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": { "tool_name": "Edit", "file_paths": ["**/*.dart"] },
        "hooks": [
          { "type": "command", "command": "dart format $CLAUDE_FILE_PATHS" }
        ]
      }
    ]
  }
}
```
## 预提交检查

在提交 Dart/Flutter 更改之前运行：```bash
dart format --set-exit-if-changed .
dart analyze --fatal-infos
flutter test
```
## 有用的台词```bash
# Format all Dart files
dart format .

# Analyze and report issues
dart analyze

# Run all tests with coverage
flutter test --coverage

# Regenerate code-gen files
dart run build_runner build --delete-conflicting-outputs

# Check for outdated packages
flutter pub outdated

# Upgrade packages within constraints
flutter pub upgrade
```
