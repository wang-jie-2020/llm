---
description: 运行 Flutter/Dart 测试、报告故障并逐步修复测试问题。涵盖单元、小部件、黄金和集成测试。---
# 颤振测试

此命令运行 Flutter 测试套件并报告结果。当发生故障时，它会逐步诊断并修复问题。

## 该命令的作用

1. **运行测试**：执行`flutter test`（或更改文件的范围）
2. **解析失败**：按类型和原因识别失败测试
3. **增量修复**：尽可能一次修复一个故障
4. **验证**：每次修复后重新运行
5. **报告**：显示覆盖率摘要和剩余故障

## 何时使用

在以下情况下使用“/flutter-test”：
- 实施一项功能以验证没有损坏后
- 运行“/flutter-build”后确保测试通过
- 检查新代码的测试覆盖率
- 当特定测试文件失败时
- 提交 PR 之前

## 命令运行```bash
# Run all tests
flutter test 2>&1

# Run with coverage
flutter test --coverage 2>&1

# Run specific test file
flutter test test/unit/domain/usecases/get_user_test.dart 2>&1

# Run tests matching a name pattern
flutter test --name "CartBloc" 2>&1

# Run integration tests (requires device/emulator)
flutter test integration_test/ 2>&1

# Update golden files when intentional visual changes are made
flutter test --update-goldens 2>&1
```
## 会话示例````text
User: /flutter-test

Agent:
# Flutter Test Run

## Test Execution

```
$ 颤振测试
00:05 +42 -2：一些测试失败。

失败：测试/单元/数据/user_repository_test.dart
  用户存储库 getById
    未找到用户时返回 null
    预期：空
    实际：用户（id：'test-id'，名称：'测试用户'）

失败：测试/小部件/cart_page_test.dart
  购物车页面
    当购物车为空时显示空状态
    预期：恰好有一个带有文本“您的购物车为空”的小部件
    发现：没有带有文本“您的购物车为空”的小部件```

## Fix 1: Repository Test

File: test/unit/data/user_repository_test.dart
Failure: `getById` returns a user when it should return null for missing ID

Root cause: Test setup adds a user with ID 'test-id' but queries with 'missing-id'.
Fix: Updated test to query with 'missing-id' — setup was correct, query was wrong.

```
$ 颤动测试测试/单元/数据/user_repository_test.dart
1 项测试通过。```

## Fix 2: Widget Test

File: test/widget/cart_page_test.dart
Failure: Empty state text widget not found

Root cause: Empty state message was renamed from 'Your cart is empty' to 'Cart is empty' in the widget.
Fix: Updated test string to match current widget copy.

```
$ 颤振测试 test/widget/cart_page_test.dart
1 项测试通过。```

## Final Run

```
$ 颤振测试--覆盖率
44 项测试全部通过。
覆盖率：84.2%（目标：80%）```

## Summary

| Metric | Value |
|--------|-------|
| Total tests | 44 |
| Passed | 44 |
| Failed | 0 |
| Coverage | 84.2% |

Test Status: PASS ✓
````
## 常见测试失败

|失败|典型修复|
|---------|-------------|
| `预期：<X> 实际：<Y>` |更新断言或修复实现 |
| `找不到小部件` |小部件重命名后修复查找器选择器或更新测试 |
| `找不到黄金文件` |运行 `flutter test --update-goldens` 来生成 |
| “黄金错配” |检查差异；如果更改是故意的，请运行“--update-goldens” |
| `MissingPluginException` |测试设置中的模拟平台通道 |
| `LateInitializationError` |在 `setUp()` 中初始化 `late` 字段 |
| `pumpAndSettle 超时` |替换为显式的“pump(Duration)”调用 |

## 相关命令

- `/flutter-build` — 在运行测试之前修复构建错误
- `/flutter-review` — 测试通过后检查代码
- `tdd-workflow` 技能 — 测试驱动的开发工作流程

## 相关

- 代理：`agents/flutter-reviewer.md`
- 代理：`agents/dart-build-resolver.md`
- 技能：`技能/flutter-dart-code-review/`
- 规则：`rules/dart/testing.md`