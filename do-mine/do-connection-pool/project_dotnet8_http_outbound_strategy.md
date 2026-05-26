---
name: dotnet8_http_outbound_standard
description: .NET 8 服务高频访问第三方 HTTP 时的统一连接池与客户端治理策略。
type: project
originSessionId: 858dbeb1-7fcf-41d0-9b3d-e12fbfff93fe
---
在 .NET 8 场景下，高频访问第三方系统的出站 HTTP 请求统一采用 `IHttpClientFactory` + `TypedClient` + `SocketsHttpHandler` 连接池化；核心参数包含 `MaxConnectionsPerServer`、`PooledConnectionLifetime`、`PooledConnectionIdleTimeout`、`ConnectTimeout`，并结合请求级 `CancellationToken`、仅对幂等请求的重试、并发与速率限制。
**Why:** 降低 TCP/TLS 握手开销，避免端口耗尽与连接风暴，减少 DNS 变更导致的陈旧连接问题，稳定高并发延迟。
**How to apply:** 设计/评审第三方集成代码时，按“每个上游系统一个客户端配置”落地在 DI 中，避免每次请求临时 `new HttpClient`，并根据上游 SLA 调整超时与连接上限。

示例配置：

```csharp
builder.Services.AddHttpClient<ThirdApiClient>(c =>
{
    c.BaseAddress = new Uri(cfg.BaseUrl);
    c.Timeout = Timeout.InfiniteTimeSpan;
})
.ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
{
    MaxConnectionsPerServer = 128,
    PooledConnectionLifetime = TimeSpan.FromMinutes(5),
    PooledConnectionIdleTimeout = TimeSpan.FromMinutes(2),
    ConnectTimeout = TimeSpan.FromSeconds(3)
})
.SetHandlerLifetime(Timeout.InfiniteTimeSpan);
```