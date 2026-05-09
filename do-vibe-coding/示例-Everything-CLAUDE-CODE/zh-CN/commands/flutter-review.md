---
description: 查看 Flutter/Dart 代码以了解惯用模式、小部件最佳实践、状态管理、性能、可访问性和安全性。调用 flutter-reviewer 代理。---
# Flutter 代码审查

此命令调用 **flutter-reviewer** 代理来审查 Flutter/Dart 代码更改。

## 该命令的作用

1. **收集上下文**：回顾 `git diff --staged` 和 `git diff`
2. **检查项目**：检查 `pubspec.yaml`、`analysis_options.yaml`、状态管理解决方案
3. **安全预扫描**：检查硬编码机密和关键安全问题
4. **全面审查**：应用完整的审查清单
5. **报告结果**：按严重程度分组的输出问题以及修复指南

## 先决条件

在运行“/flutter-review”之前，请确保：
1. **构建过程** — 首先运行 `/flutter-build`；对损坏代码的审查不完整
2. **测试通过** — 运行 `/flutter-test` 以确认没有回归
3. **无合并冲突** — 解决所有冲突，以便差异仅反映有意的更改
4. **`flutteranalyze` 很干净** - 在审查之前修复分析器警告

## 何时使用

在以下情况下使用“/flutter-review”：
- 在提交包含 Flutter/Dart 更改的 PR 之前（构建和测试通过后）
- 实施新功能后尽早发现问题
- 在审阅别人的Flutter代码时
- 审核小部件、状态管理组件或服务类- 在产品发布之前

## 审查领域

|面积 |严重性 |
|------|----------|
|硬编码秘密、明文 HTTP |关键 |
|架构违规、状态管理反模式|关键 |
|小部件重建问题、资源泄漏 |高|
|等待后缺少 `dispose()`、`BuildContext`高|
| Dart null 安全性、缺失错误/加载状态 |高|
|常量传播，小部件组合 |高|
|性能：`build()` 中的昂贵工作 |高|
|辅助功能、语义标签 |中 |
|缺少状态转换测试 |高|
|硬编码字符串 (l10n) |中 |
|酒吧依赖卫生 |低|

## 会话示例````text
User: /flutter-review

Agent:
# Flutter Code Review

## Context

Changed files:
- lib/features/auth/presentation/login_page.dart
- lib/features/auth/data/auth_repository_impl.dart

State management: Riverpod (detected from pubspec.yaml)
Architecture: feature-first

## Security Pre-scan

✓ No hardcoded secrets detected
✓ No cleartext HTTP calls

## Review Findings

[HIGH] BuildContext used after async gap without mounted check
File: lib/features/auth/presentation/login_page.dart:67
Issue: `context.go('/home')` called after `await auth.login(...)` with no `mounted` check.
Fix: Add `if (!context.mounted) return;` before any navigation after awaits (Flutter 3.7+).

[HIGH] AsyncValue error state not handled
File: lib/features/auth/presentation/login_page.dart:42
Issue: `ref.watch(authProvider)` switches on loading/data but has no `error` branch.
Fix: Add error case to the switch expression or `when()` call to show a user-facing error message.

[MEDIUM] Hardcoded string not localized
File: lib/features/auth/presentation/login_page.dart:89
Issue: `Text('Login')` — user-visible string not using localization system.
Fix: Use the project's l10n accessor: `Text(context.l10n.loginButton)`.

## Review Summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 0     | pass   |
| HIGH     | 2     | block  |
| MEDIUM   | 1     | info   |
| LOW      | 0     | note   |

Verdict: BLOCK — HIGH issues must be fixed before merge.
````
## 批准标准

- **批准**：无严重或严重问题
- **阻止**：合并之前必须修复任何关键或严重问题

## 相关命令

- `/flutter-build` — 首先修复构建错误
- `/flutter-test` — 在审查之前运行测试
- `/code-review` — 一般代码审查（与语言无关）

## 相关

- 代理：`agents/flutter-reviewer.md`
- 技能：`技能/flutter-dart-code-review/`
- 规则：`规则/dart/`