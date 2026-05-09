> 此文件使用特定于 Web 的安全内容扩展了 [common/security.md](../common/security.md)。

# 网络安全规则

## 内容安全策略

始终配置生产 CSP。

### 基于 Nonce 的 CSP

对脚本使用每个请求的随机数，而不是“不安全内联”。```text
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{RANDOM}' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.example.com;
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
```
调整项目的起源。不要对这个区块进行货物崇拜，保持不变。

## XSS 预防

- 切勿注入未经净化的 HTML
- 避免使用 `innerHTML` / `dangerouslySetInnerHTML`，除非先进行清理
- 转义动态模板值
- 在绝对必要时使用经过审查的本地清理工具清理用户 HTML

## 第三方脚本

- 异步加载
- 从 CDN 提供服务时使用 SRI
- 每季度进行审计
- 在实际情况下更喜欢自托管关键依赖项

## HTTPS 和标头```text
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```
## 表格

- 对状态改变表单的 CSRF 保护
- 提交端点的速率限制
- 验证客户端和服务器端
- 与严厉的验证码默认设置相比，更喜欢蜜罐或轻微的反滥用控制