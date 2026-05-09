---
paths:
  - "**/*.dart"
  - "**/pubspec.yaml"
  - "**/analysis_options.yaml"
---
# Dart/Flutter 编码风格

> 此文件使用 Dart 和 Flutter 特定的内容扩展了 [common/coding-style.md](../common/coding-style.md)。

## 格式化

- 所有 `.dart` 文件的 **dart 格式** — 在 CI 中强制执行（`dart format --set-exit-if-changed .`）
- 行长度：80 个字符（默认为 dart 格式）
- 多行参数/参数列表上的尾随逗号以改进差异和格式

## 不变性

- 局部变量优先使用“final”，编译时常量优先使用“const”
- 当所有字段都是“final”时，使用“const”构造函数
- 从公共 API 返回不可修改的集合（`List.unmodifying`、`Map.unmodifying`）
- 使用“copyWith()”进行不可变状态类中的状态突变```dart
// BAD
var count = 0;
List<String> items = ['a', 'b'];

// GOOD
final count = 0;
const items = ['a', 'b'];
```
## 命名

遵循 Dart 约定：
- 变量、参数和命名构造函数使用“camelCase”
- 用于类、枚举、类型定义和扩展的“PascalCase”
- 文件名和库名的“snake_case”
- `SCREAMING_SNAKE_CASE` 用于在顶层用 `const` 声明的常量
- 私有成员前面加上“_”前缀
- 扩展名称描述了它们扩展的类型：“StringExtensions”，而不是“MyHelpers”

## 空安全

- 避免 `!`（bang 运算符）——更喜欢 `?.`、`??`、`if (x != null)` 或 Dart 3 模式匹配；仅当空值是编程错误且崩溃是正确行为时才保留“！”
- 避免“late”，除非在首次使用之前保证初始化（首选可为 null 或构造函数 init）
- 对必须始终提供的构造函数参数使用“required”```dart
// BAD — crashes at runtime if user is null
final name = user!.name;

// GOOD — null-aware operators
final name = user?.name ?? 'Unknown';

// GOOD — Dart 3 pattern matching (exhaustive, compiler-checked)
final name = switch (user) {
  User(:final name) => name,
  null => 'Unknown',
};

// GOOD — early-return null guard
String getUserName(User? user) {
  if (user == null) return 'Unknown';
  return user.name; // promoted to non-null after the guard
}
```
## 密封类型和模式匹配 (Dart 3+)

使用密封类来建模封闭状态层次结构：```dart
sealed class AsyncState<T> {
  const AsyncState();
}

final class Loading<T> extends AsyncState<T> {
  const Loading();
}

final class Success<T> extends AsyncState<T> {
  const Success(this.data);
  final T data;
}

final class Failure<T> extends AsyncState<T> {
  const Failure(this.error);
  final Object error;
}
```
始终对密封类型使用详尽的“switch”——无默认值/通配符：```dart
// BAD
if (state is Loading) { ... }

// GOOD
return switch (state) {
  Loading() => const CircularProgressIndicator(),
  Success(:final data) => DataWidget(data),
  Failure(:final error) => ErrorWidget(error.toString()),
};
```
## 错误处理

- 在“on”子句中指定异常类型 - 切勿使用裸露的“catch (e)”
- 永远不要捕获“Error”子类型——它们表示编程错误
- 使用“Result”类型或密封类来处理可恢复的错误
- 避免使用异常来控制流程```dart
// BAD
try {
  await fetchUser();
} catch (e) {
  log(e.toString());
}

// GOOD
try {
  await fetchUser();
} on NetworkException catch (e) {
  log('Network error: ${e.message}');
} on NotFoundException {
  handleNotFound();
}
```
## 异步/期货

- 始终“await”Futures 或显式调用“unwaited()”来表示有意的“即发即弃”
- 如果函数从不“await”任何内容，则永远不要将其标记为“async”
- 使用 `Future.wait` / `Future.any` 进行并发操作
- 在任何“await”之后使用“BuildContext”之前检查“context.mounted”（Flutter 3.7+）```dart
// BAD — ignoring Future
fetchData(); // fire-and-forget without marking intent

// GOOD
unawaited(fetchData()); // explicit fire-and-forget
await fetchData();      // or properly awaited
```
## 进口

- 始终使用 `package:` 导入 — 对于跨功能或跨层代码，切勿使用相对导入 (`../`)
- 顺序： `dart:` → 外部 `package:` → 内部 `package:` （同一包）
- 没有未使用的导入——“dartanalyze”通过“unused_import”强制执行此操作

## 代码生成

- 生成的文件（`.g.dart`、`.freezed.dart`、`.gr.dart`）必须一致地提交或 gitignored — 每个项目选择一种策略
- 切勿手动编辑生成的文件
- 仅在规范源文件上保留生成器注释（`@JsonSerialized`、`@freezed`、`@riverpod` 等）