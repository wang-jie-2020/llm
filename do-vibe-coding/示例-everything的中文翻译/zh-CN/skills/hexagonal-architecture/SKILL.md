---
name: hexagonal-architecture
description: 设计、实现和重构端口和适配器系统，具有清晰的域边界、依赖倒置以及跨 TypeScript、Java、Kotlin 和 Go 服务的可测试用例编排。origin: ECC
---
# 六边形架构

六边形架构（端口和适配器）使业务逻辑独立于框架、传输和持久性细节。核心应用程序依赖于抽象端口，适配器在边缘实现这些端口。

## 何时使用

- 构建长期可维护性和可测试性很重要的新功能。
- 重构分层或框架密集型代码，其中域逻辑与 I/O 问题混合在一起。
- 支持同一用例的多个接口（HTTP、CLI、队列工作人员、cron 作业）。
- 无需重写业务规则即可更换基础设施（数据库、外部API、消息总线）。

当请求涉及边界、以领域为中心的设计、重构紧密耦合的服务或将应用程序逻辑与特定库解耦时，请使用此技能。

## 核心概念

- **领域模型**：业务规则和实体/值对象。没有框架导入。
- **用例（应用程序层）**：编排域行为和工作流程步骤。
- **入站端口**：描述应用程序可以执行的操作的契约（命令/查询/用例接口）。- **出站端口**：应用程序所需的依赖项的合同（存储库、网关、事件发布者、时钟、UUID 等）。
- **适配器**：端口的基础设施和交付实现（HTTP 控制器、数据库存储库、队列使用者、SDK 包装器）。
- **组合根**：具体适配器绑定到用例的单个接线位置。

出站端口接口通常位于应用程序层（或者仅当抽象是真正的域级时才位于域中），而基础设施适配器则实现它们。

依赖方向始终是向内的：

- 适配器 -> 应用程序/域
- 应用程序 -> 端口接口（入站/出站合同）
- 域 -> 仅域抽象（无框架或基础设施依赖性）
- 域 -> 没有任何外部内容

## 它是如何工作的

### 步骤 1：对用例边界建模

使用清晰的输入和输出 DTO 定义单个用例。将传输详细信息（Express `req`、GraphQL `context`、作业负载包装器）保留在此边界之外。

### 步骤2：首先定义出站端口

将每个副作用识别为一个端口：

- 持久性（`UserRepositoryPort`）
- 外部调用（`BillingGatewayPort`）- 横切（`LoggerPort`、`ClockPort`）

端口应该模拟能力，而不是技术。

### 步骤 3：通过纯编排实现用例

用例类/函数通过构造函数/参数接收端口。它验证应用程序级不变量、协调域规则并返回简单的数据结构。

### 步骤 4：在边缘构建适配器

- 入站适配器将协议输入转换为用例输入。
- 出站适配器将应用程序合约映射到具体的 API/ORM/查询构建器。
- 映射保留在适配器中，而不是在用例中。

### 步骤 5：将所有内容连接到组合根中

实例化适配器，然后将它们注入到用例中。保持该布线集中以避免隐藏的服务定位器行为。

### 第 6 步：按边界进行测试

- 使用假端口进行单元测试用例。
- 具有真实基础设施依赖性的集成测试适配器。
- 通过入站适配器进行端到端测试面向用户的流量。

## 架构图```mermaid
flowchart LR
  Client["Client (HTTP/CLI/Worker)"] --> InboundAdapter["Inbound Adapter"]
  InboundAdapter -->|"calls"| UseCase["UseCase (Application Layer)"]
  UseCase -->|"uses"| OutboundPort["OutboundPort (Interface)"]
  OutboundAdapter["Outbound Adapter"] -->|"implements"| OutboundPort
  OutboundAdapter --> ExternalSystem["DB/API/Queue"]
  UseCase --> DomainModel["DomainModel"]
```
## 建议的模块布局

使用具有明确边界的功能优先组织：```text
src/
  features/
    orders/
      domain/
        Order.ts
        OrderPolicy.ts
      application/
        ports/
          inbound/
            CreateOrder.ts
          outbound/
            OrderRepositoryPort.ts
            PaymentGatewayPort.ts
        use-cases/
          CreateOrderUseCase.ts
      adapters/
        inbound/
          http/
            createOrderRoute.ts
        outbound/
          postgres/
            PostgresOrderRepository.ts
          stripe/
            StripePaymentGateway.ts
      composition/
        ordersContainer.ts
```
## TypeScript 示例

### 端口定义```typescript
export interface OrderRepositoryPort {
  save(order: Order): Promise<void>;
  findById(orderId: string): Promise<Order | null>;
}

export interface PaymentGatewayPort {
  authorize(input: { orderId: string; amountCents: number }): Promise<{ authorizationId: string }>;
}
```
### 用例```typescript
type CreateOrderInput = {
  orderId: string;
  amountCents: number;
};

type CreateOrderOutput = {
  orderId: string;
  authorizationId: string;
};

export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepositoryPort,
    private readonly paymentGateway: PaymentGatewayPort
  ) {}

  async execute(input: CreateOrderInput): Promise<CreateOrderOutput> {
    const order = Order.create({ id: input.orderId, amountCents: input.amountCents });

    const auth = await this.paymentGateway.authorize({
      orderId: order.id,
      amountCents: order.amountCents,
    });

    // markAuthorized returns a new Order instance; it does not mutate in place.
    const authorizedOrder = order.markAuthorized(auth.authorizationId);
    await this.orderRepository.save(authorizedOrder);

    return {
      orderId: order.id,
      authorizationId: auth.authorizationId,
    };
  }
}
```
### 出站适配器```typescript
export class PostgresOrderRepository implements OrderRepositoryPort {
  constructor(private readonly db: SqlClient) {}

  async save(order: Order): Promise<void> {
    await this.db.query(
      "insert into orders (id, amount_cents, status, authorization_id) values ($1, $2, $3, $4)",
      [order.id, order.amountCents, order.status, order.authorizationId]
    );
  }

  async findById(orderId: string): Promise<Order | null> {
    const row = await this.db.oneOrNone("select * from orders where id = $1", [orderId]);
    return row ? Order.rehydrate(row) : null;
  }
}
```
### 组合根```typescript
export const buildCreateOrderUseCase = (deps: { db: SqlClient; stripe: StripeClient }) => {
  const orderRepository = new PostgresOrderRepository(deps.db);
  const paymentGateway = new StripePaymentGateway(deps.stripe);

  return new CreateOrderUseCase(orderRepository, paymentGateway);
};
```
## 多语言映射

跨生态系统使用相同的边界规则；仅语法和接线风格发生变化。

- **TypeScript/JavaScript**
  - 端口：`application/ports/*` 作为接口/类型。
  - 用例：带有构造函数/参数注入的类/函数。
  - 适配器：“适配器/入站/*”、“适配器/出站/*”。
  - 组成：显式工厂/容器模块（无隐藏全局变量）。
- **Java**
  - 包：`domain`、`application.port.in`、`application.port.out`、`application.usecase`、`adapter.in`、`adapter.out`。
  - 端口：“application.port.*”中的接口。
  - 用例：普通类（Spring `@Service` 是可选的，不是必需的）。
  - 组成：Spring配置或手动接线类；保持在域/用例类之外进行连接。
- **科特林**
  - 模块/包镜像 Java 拆分（“domain”、“application.port”、“application.usecase”、“adapter”）。
  - 端口：Kotlin 接口。
  - 使用案例：带有构造函数注入的类（Koin/Dagger/Spring/手册）。
  - 组合：模块定义或专用组合函数；避免服务定位器模式。
- **去**- 包：`internal/<feature>/domain`、`application`、`ports`、`adapters/inbound`、`adapters/outbound`。
  - 端口：消费应用程序包拥有的小接口。
  - 用例：具有接口字段的结构加上显式的“New...”构造函数。
  - 组合：在 `cmd/<app>/main.go` （或专用接线包）中接线，保持构造函数明确。

## 要避免的反模式

- 导入 ORM 模型、Web 框架类型或 SDK 客户端的域实体。
- 直接从“req”、“res”或队列元数据读取的用例。
- 直接从用例返回数据库行，无需域/应用程序映射。
- 让适配器直接相互调用，而不是通过用例端口流动。
- 使用隐藏的全局单例在许多文件之间传播依赖关系。

## 迁移手册

1. 选择一个频繁变化的垂直切片（单个端点/作业）。
2. 使用显式输入/输出类型提取用例边界。
3.围绕现有基础设施调用引入出站端口。
4. 将编排逻辑从控制器/服务移至用例中。
5. 保留旧适配器，但让它们委托给新用例。6. 围绕新边界添加测试（单元+适配器集成）。
7. 逐片重复；避免完全重写。

### 重构现有系统

- **扼杀者方法**：保留当前端点，通过新端口/适配器一次路由一个用例。
- **没有大爆炸重写**：每个功能切片进行迁移并通过特征测试保留行为。
- **外观优先**：在替换内部之前将遗留服务包装在出站端口后面。
- **组合冻结**：尽早集中布线，以便新的依赖项不会泄漏到域/用例层中。
- **切片选择规则**：首先优先考虑高扰动、低爆炸半径的流。
- **回滚路径**：为每个迁移的切片保留可逆切换或路由开关，直到验证生产行为。

## 测试指南（相同六边形边界）

- **领域测试**：将实体/值对象作为纯业务规则进行测试（无模拟，无框架设置）。
- **用例单元测试**：使用出站端口的伪造/存根测试编排；断言业务成果和端口交互。
- **出站适配器契约测试**：在端口级别定义共享契约套件并针对每个适配器实现运行它们。- **入站适配器测试**：验证协议映射（HTTP/CLI/队列有效负载到用例输入和输出/错误映射回协议）。
- **适配器集成测试**：针对真实基础设施（DB/API/队列）运行序列化、模式/查询行为、重试和超时。
- **端到端测试**：通过入站适配器 -> 用例 -> 出站适配器覆盖关键用户旅程。
- **重构安全性**：在提取之前添加表征测试；保留它们直到新的边界行为稳定且等效。

## 最佳实践清单

- 域和用例层仅导入内部类型和端口。
- 每个外部依赖项都由出站端口表示。
- 验证发生在边界处（入站适配器+用例不变量）。
- 使用不可变转换（返回新值/实体而不是改变共享状态）。
- 错误跨边界转换（基础错误 -> 应用程序/域错误）。
- 成分根明确且易于审核。
- 可以使用简单的内存中端口伪造来测试用例。
- 重构从一个垂直切片开始，并进行行为保留测试。- 语言/框架细节保留在适配器中，而不是域规则中。