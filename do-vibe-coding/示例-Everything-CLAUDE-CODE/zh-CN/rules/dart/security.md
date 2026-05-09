---
paths:
  - "**/*.dart"
  - "**/pubspec.yaml"
  - "**/AndroidManifest.xml"
  - "**/Info.plist"
---
# Dart/Flutter 安全性

> 此文件使用 Dart、Flutter 和特定于移动设备的内容扩展了 [common/security.md](../common/security.md)。

## 秘密管理

- 切勿在 Dart 源代码中硬编码 API 密钥、令牌或凭证
- 使用 `--dart-define` 或 `--dart-define-from-file` 进行编译时配置（值并不是真正的秘密 - 使用后端代理作为服务器端秘密）
- 使用“flutter_dotenv”或等效项，并在“.gitignore”中列出“.env”文件
- 将运行时机密存储在平台安全存储中：“flutter_secure_storage”（iOS 上的 Keychain，Android 上的 EncryptedSharedPreferences）```dart
// BAD
const apiKey = 'sk-abc123...';

// GOOD — compile-time config (not secret, just configurable)
const apiKey = String.fromEnvironment('API_KEY');

// GOOD — runtime secret from secure storage
final token = await secureStorage.read(key: 'auth_token');
```
## 网络安全

- 强制执行 HTTPS — 在生产中没有“http://”调用
- 配置 Android `network_security_config.xml` 以阻止明文流量
- 在“Info.plist”中设置“NSAppTransportSecurity”以禁止任意加载
- 在所有 HTTP 客户端上设置请求超时 — 切勿保留默认值
- 考虑对高安全性端点进行证书固定```dart
// Dio with timeout and HTTPS enforcement
final dio = Dio(BaseOptions(
  baseUrl: 'https://api.example.com',
  connectTimeout: const Duration(seconds: 10),
  receiveTimeout: const Duration(seconds: 30),
));
```
## 输入验证

- 在发送到 API 或存储之前验证并清理所有用户输入
- 切勿将未经处理的输入传递给 SQL 查询 - 使用参数化查询（sqflite、drift）
- 在导航前清理深层链接 URL — 验证方案、主机和路径参数
- 使用“Uri.tryParse”并在导航前进行验证```dart
// BAD — SQL injection
await db.rawQuery("SELECT * FROM users WHERE email = '$userInput'");

// GOOD — parameterized
await db.query('users', where: 'email = ?', whereArgs: [userInput]);

// BAD — unvalidated deep link
final uri = Uri.parse(incomingLink);
context.go(uri.path); // could navigate to any route

// GOOD — validated deep link
final uri = Uri.tryParse(incomingLink);
if (uri != null && uri.host == 'myapp.com' && _allowedPaths.contains(uri.path)) {
  context.go(uri.path);
}
```
## 数据保护

- 仅将令牌、PII 和凭证存储在“flutter_secure_storage”中
- 切勿以明文形式将敏感数据写入“SharedPreferences”或本地文件
- 注销时清除身份验证状态：令牌、缓存的用户数据、cookie
- 使用生物识别身份验证（`local_auth`）进行敏感操作
- 避免记录敏感数据——没有“print(token)”或“debugPrint(password)”

## Android 特定

- 在`AndroidManifest.xml`中仅声明所需的权限
- 仅在必要时导出 Android 组件（`Activity`、`Service`、`BroadcastReceiver`）；在不需要的地方添加`android:exported="false"`
- 检查意图过滤器 - 任何应用程序都可以访问具有隐式意图过滤器的导出组件
- 对显示敏感数据的屏幕使用“FLAG_SECURE”（防止屏幕截图）```xml
<!-- AndroidManifest.xml — restrict exported components -->
<activity android:name=".MainActivity" android:exported="true">
    <!-- Only the launcher activity needs exported=true -->
</activity>
<activity android:name=".SensitiveActivity" android:exported="false" />
```
## iOS 特定

- 在“Info.plist”中仅声明所需的使用描述（“NSCameraUsageDescription”等）
- 在钥匙串中存储秘密 - `flutter_secure_storage` 在 iOS 上使用钥匙串
- 使用应用程序传输安全 (ATS) — 禁止任意加载
- 启用敏感文件的数据保护权限

## WebView 安全

- 使用 `webview_flutter` v4+ (`WebViewController` / `WebViewWidget`) — 旧版 `WebView` 小部件被删除
- 除非明确需要，否则禁用 JavaScript (`JavaScriptMode.disabled`)
- 加载前验证 URL — 切勿从深层链接加载任意 URL
- 除非绝对需要并且经过仔细沙箱处理，否则切勿将 Dart 回调暴露给 JavaScript
- 使用 `NavigationDelegate.onNavigationRequest` 拦截并验证导航请求```dart
// webview_flutter v4+ API (WebViewController + WebViewWidget)
final controller = WebViewController()
  ..setJavaScriptMode(JavaScriptMode.disabled) // disabled unless required
  ..setNavigationDelegate(
    NavigationDelegate(
      onNavigationRequest: (request) {
        final uri = Uri.tryParse(request.url);
        if (uri == null || uri.host != 'trusted.example.com') {
          return NavigationDecision.prevent;
        }
        return NavigationDecision.navigate;
      },
    ),
  );

// In your widget tree:
WebViewWidget(controller: controller)
```
## 混淆和构建安全性

- 在发布版本中启用混淆：`flutter build apk --obfuscate --split-debug-info=./debug-info/`
- 将 `--split-debug-info` 输出保留在版本控制之外（仅用于崩溃符号）
- 确保 ProGuard/R8 规则不会无意中暴露序列化类
- 运行“flutteranalyze”并在发布前解决所有警告