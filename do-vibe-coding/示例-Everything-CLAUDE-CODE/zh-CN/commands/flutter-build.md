---
description: 逐步修复 Dart 分析器错误和 Flutter 构建失败。调用 dart-build-resolver 代理进行最小的外科修复。---
# Flutter 构建和修复

此命令调用 **dart-build-resolver** 代理，以最小的更改增量修复 Dart/Flutter 构建错误。

## 该命令的作用

1. **运行诊断**：执行`flutteranalyze`、`flutterpubget`
2. **解析错误**：按文件分组并按严重性排序
3. **增量修复**：一次一个错误
4. **验证每个修复**：每次更改后重新运行分析
5. **报告摘要**：显示已修复的内容和剩余的内容

## 何时使用

在以下情况下使用“/flutter-build”：
- `flutteranalyze` 报告错误
- “flutter build”在任何平台上都会失败
- `dart pub get` / `flutter pub get` 由于版本冲突而失败
- `build_runner` 无法生成代码
- 拉取破坏构建的更改后

## 诊断命令运行```bash
# Analysis
flutter analyze 2>&1

# Dependencies
flutter pub get 2>&1

# Code generation (if project uses build_runner)
dart run build_runner build --delete-conflicting-outputs 2>&1

# Platform builds
flutter build apk 2>&1
flutter build web 2>&1
```
## 会话示例````text
User: /flutter-build

Agent:
# Flutter Build Resolution

## Initial Diagnostics

```
$ 颤振分析
正在分析项目...

  错误 • lib/features/user/data/user_repository_impl.dart:34:16 •
    “字符串？”类型的值不能分配给“String”类型的变量。 •
    无效分配

  错误 • lib/features/cart/presentation/cart_page.dart:58:5 •
    没有为类型“List<Item>”定义方法“add”。
    尝试将名称更正为现有方法的名称，或定义名为“add”的方法。 •
    未定义的方法

发现 2 个错误。```

## Fix 1: Null Safety

File: lib/features/user/data/user_repository_impl.dart:34
Error: A value of type 'String?' can't be assigned to type 'String'

Changed:
```dart
最终id=response.id；```
To:
```dart
最终 id = 响应.id ?? '';```

```
$ 颤振分析
发现 1 个错误。```

## Fix 2: Immutable List

File: lib/features/cart/presentation/cart_page.dart:58
Error: The method 'add' isn't defined for the type 'List<Item>'
Cause: State holds an unmodifiable list; mutation goes through Cubit

Changed:
```dart
状态.items.add(item);```
To:
```dart
context.read<CartCubit>().addItem(item);
// 注意：Cubit 公开命名方法（addItem、removeItem）；
// .add(event) 是 BLoC 事件 API — 不要混合使用它们。```

```
$ 颤振分析
没有发现问题！```

## Final Verification

```
$ 颤振测试
所有测试都通过了。```

## Summary

| Metric | Count |
|--------|-------|
| Analysis errors fixed | 2 |
| Files modified | 2 |
| Remaining issues | 0 |

Build Status: PASS ✓
````
## 常见错误已修复

|错误 |典型修复|
|--------|-------------|
| `'X 类型的值？'无法分配给 'X'` |添加`??默认`或空保护|
| `名称'X'未定义` |添加导入或修复拼写错误 |
| `必须初始化不可为空的实例字段` |添加初始化程序或 `late` |
| `版本解析失败` |调整 pubspec.yaml 中的版本约束 |
| `缺少'X'的具体实现` |实现缺失的接口方法 |
| `build_runner：X 预期的一部分` |删除陈旧的 `.g.dart` 并重建 |

## 修复策略

1. **首先分析错误** — 代码必须没有错误
2. **警告分类第二** - 修复可能导致运行时错误的警告
3. **pub 冲突第三** - 修复依赖解析
4. **一次修复一个** — 验证每项更改
5. **最小的改变**——不重构，只修复

## 停止条件

如果出现以下情况，代理将停止并报告：
- 3次尝试后仍然存在相同的错误
- 修复引入更多错误
- 需要架构更改
- 包升级冲突需要用户决定

## 相关命令

- `/flutter-test` — 构建成功后运行测试
- `/flutter-review` — 检查代码质量
- `verification-loop` 技能 — 完整的验证循环## 相关

- 代理：`agents/dart-build-resolver.md`
- 技能：`技能/flutter-dart-code-review/`