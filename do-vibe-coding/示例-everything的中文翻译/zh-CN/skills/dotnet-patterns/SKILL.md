---
name: dotnet-patterns
description: 惯用的 C# 和 .NET 模式、约定、依赖项注入、异步/等待以及构建健壮、可维护的 .NET 应用程序的最佳实践。origin: ECC
---
# .NET 开发模式

用于构建健壮、高性能且可维护的应用程序的惯用 C# 和 .NET 模式。

## 何时激活

- 编写新的 C# 代码
- 审查 C# 代码
- 重构现有的.NET应用程序
- 使用 ASP.NET Core 设计服务架构

## 核心原则

### 1. 更喜欢不变性

对数据模型使用记录和仅限初始化的属性。可变性应该是一个明确的、合理的选择。```csharp
// Good: Immutable value object
public sealed record Money(decimal Amount, string Currency);

// Good: Immutable DTO with init setters
public sealed class CreateOrderRequest
{
    public required string CustomerId { get; init; }
    public required IReadOnlyList<OrderItem> Items { get; init; }
}

// Bad: Mutable model with public setters
public class Order
{
    public string CustomerId { get; set; }
    public List<OrderItem> Items { get; set; }
}
```
### 2. 显式优于隐式

清楚可空性、访问修饰符和意图。```csharp
// Good: Explicit access modifiers and nullability
public sealed class UserService
{
    private readonly IUserRepository _repository;
    private readonly ILogger<UserService> _logger;

    public UserService(IUserRepository repository, ILogger<UserService> logger)
    {
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<User?> FindByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _repository.FindByIdAsync(id, cancellationToken);
    }
}
```
### 3. 依赖抽象

使用接口作为服务边界。通过 DI 容器注册。```csharp
// Good: Interface-based dependency
public interface IOrderRepository
{
    Task<Order?> FindByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<IReadOnlyList<Order>> FindByCustomerAsync(string customerId, CancellationToken cancellationToken);
    Task AddAsync(Order order, CancellationToken cancellationToken);
}

// Registration
builder.Services.AddScoped<IOrderRepository, SqlOrderRepository>();
```
## 异步/等待模式

### 正确的异步用法```csharp
// Good: Async all the way, with CancellationToken
public async Task<OrderSummary> GetOrderSummaryAsync(
    Guid orderId,
    CancellationToken cancellationToken)
{
    var order = await _repository.FindByIdAsync(orderId, cancellationToken)
        ?? throw new NotFoundException($"Order {orderId} not found");

    var customer = await _customerService.GetAsync(order.CustomerId, cancellationToken);

    return new OrderSummary(order, customer);
}

// Bad: Blocking on async
public OrderSummary GetOrderSummary(Guid orderId)
{
    var order = _repository.FindByIdAsync(orderId, CancellationToken.None).Result; // Deadlock risk
    return new OrderSummary(order);
}
```
### 并行异步操作```csharp
// Good: Concurrent independent operations
public async Task<DashboardData> LoadDashboardAsync(CancellationToken cancellationToken)
{
    var ordersTask = _orderService.GetRecentAsync(cancellationToken);
    var metricsTask = _metricsService.GetCurrentAsync(cancellationToken);
    var alertsTask = _alertService.GetActiveAsync(cancellationToken);

    await Task.WhenAll(ordersTask, metricsTask, alertsTask);

    return new DashboardData(
        Orders: await ordersTask,
        Metrics: await metricsTask,
        Alerts: await alertsTask);
}
```
## 选项模式

将配置节绑定到强类型对象。```csharp
public sealed class SmtpOptions
{
    public const string SectionName = "Smtp";

    public required string Host { get; init; }
    public required int Port { get; init; }
    public required string Username { get; init; }
    public bool UseSsl { get; init; } = true;
}

// Registration
builder.Services.Configure<SmtpOptions>(
    builder.Configuration.GetSection(SmtpOptions.SectionName));

// Usage via injection
public class EmailService(IOptions<SmtpOptions> options)
{
    private readonly SmtpOptions _smtp = options.Value;
}
```
## 结果模式

返回明确的成功/失败，而不是抛出预期的失败。```csharp
public sealed record Result<T>
{
    public bool IsSuccess { get; }
    public T? Value { get; }
    public string? Error { get; }

    private Result(T value) { IsSuccess = true; Value = value; }
    private Result(string error) { IsSuccess = false; Error = error; }

    public static Result<T> Success(T value) => new(value);
    public static Result<T> Failure(string error) => new(error);
}

// Usage
public async Task<Result<Order>> PlaceOrderAsync(CreateOrderRequest request)
{
    if (request.Items.Count == 0)
        return Result<Order>.Failure("Order must contain at least one item");

    var order = Order.Create(request);
    await _repository.AddAsync(order, CancellationToken.None);
    return Result<Order>.Success(order);
}
```
## 带有 EF Core 的存储库模式```csharp
public sealed class SqlOrderRepository : IOrderRepository
{
    private readonly AppDbContext _db;

    public SqlOrderRepository(AppDbContext db) => _db = db;

    public async Task<Order?> FindByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _db.Orders
            .Include(o => o.Items)
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Order>> FindByCustomerAsync(
        string customerId,
        CancellationToken cancellationToken)
    {
        return await _db.Orders
            .Where(o => o.CustomerId == customerId)
            .OrderByDescending(o => o.CreatedAt)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Order order, CancellationToken cancellationToken)
    {
        _db.Orders.Add(order);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
```
## 中间件和管道```csharp
// Custom middleware
public sealed class RequestTimingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestTimingMiddleware> _logger;

    public RequestTimingMiddleware(RequestDelegate next, ILogger<RequestTimingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();
            _logger.LogInformation(
                "Request {Method} {Path} completed in {ElapsedMs}ms with status {StatusCode}",
                context.Request.Method,
                context.Request.Path,
                stopwatch.ElapsedMilliseconds,
                context.Response.StatusCode);
        }
    }
}
```
## 最小 API 模式```csharp
// Organized with route groups
var orders = app.MapGroup("/api/orders")
    .RequireAuthorization()
    .WithTags("Orders");

orders.MapGet("/{id:guid}", async (
    Guid id,
    IOrderRepository repository,
    CancellationToken cancellationToken) =>
{
    var order = await repository.FindByIdAsync(id, cancellationToken);
    return order is not null
        ? TypedResults.Ok(order)
        : TypedResults.NotFound();
});

orders.MapPost("/", async (
    CreateOrderRequest request,
    IOrderService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.PlaceOrderAsync(request, cancellationToken);
    return result.IsSuccess
        ? TypedResults.Created($"/api/orders/{result.Value!.Id}", result.Value)
        : TypedResults.BadRequest(result.Error);
});
```
## 保护条款```csharp
// Good: Early returns with clear validation
public async Task<ProcessResult> ProcessPaymentAsync(
    PaymentRequest request,
    CancellationToken cancellationToken)
{
    ArgumentNullException.ThrowIfNull(request);

    if (request.Amount <= 0)
        throw new ArgumentOutOfRangeException(nameof(request.Amount), "Amount must be positive");

    if (string.IsNullOrWhiteSpace(request.Currency))
        throw new ArgumentException("Currency is required", nameof(request.Currency));

    // Happy path continues here without nesting
    var gateway = _gatewayFactory.Create(request.Currency);
    return await gateway.ChargeAsync(request, cancellationToken);
}
```
## 要避免的反模式

|反模式 |修复 |
|---|---|
| `async void` 方法 |返回“任务”（事件处理程序除外）|
| `.Result` 或 `.Wait()` |使用“等待” |
| `catch（异常）{}` |根据上下文处理或重新抛出 |
|构造函数中的`new Service()`使用构造函数注入 |
| “公共”字段 |将属性与适当的访问器一起使用 |
|业务逻辑中的“动态” |使用泛型或显式类型 |
|可变的“静态”状态 |使用 DI 范围或 `ConcurrentDictionary` |
|循环中的“string.Format” |使用“StringBuilder”或内插字符串处理程序 |