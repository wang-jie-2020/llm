---
name: nestjs-patterns
description: 用于模块、控制器、提供程序、DTO 验证、防护、拦截器、配置和生产级 TypeScript 后端的 NestJS 架构模式。origin: ECC
---
# NestJS 开发模式

用于模块化 TypeScript 后端的生产级 NestJS 模式。

## 何时激活

- 构建 NestJS API 或服务
- 构建模块、控制器和提供者
- 添加 DTO 验证、防护、拦截器或异常过滤器
- 配置环境感知设置和数据库集成
- 测试 NestJS 单元或 HTTP 端点

## 项目结构```text
src/
├── app.module.ts
├── main.ts
├── common/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
├── config/
│   ├── configuration.ts
│   └── validation.ts
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   ├── guards/
│   │   └── strategies/
│   └── users/
│       ├── dto/
│       ├── entities/
│       ├── users.controller.ts
│       ├── users.module.ts
│       └── users.service.ts
└── prisma/ or database/
```
- 将域代码保留在功能模块内。
- 将横切过滤器、装饰器、防护器和拦截器放在“common/”中。
- 让 DTO 靠近拥有它们的模块。

## 引导程序和全局验证```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```
- 始终在公共 API 上启用“白名单”和“forbidNonWhitelisted”。
- 更喜欢一个全局验证管道，而不是每条路由重复验证配置。

## 模块、控制器和提供程序```ts
@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getById(id);
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}

@Injectable()
export class UsersService {
  constructor(private readonly usersRepo: UsersRepository) {}

  async create(dto: CreateUserDto) {
    return this.usersRepo.create(dto);
  }
}
```
- 控制器应该保持精简：解析 HTTP 输入、调用提供者、返回响应 DTO。
- 将业务逻辑放入可注入服务中，而不是控制器中。
- 仅导出其他模块真正需要的提供程序。

## DTO 和验证```ts
export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(2, 80)
  name!: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
```
- 使用“class-validator”验证每个请求 DTO。
- 使用专用响应 DTO 或序列化器，而不是直接返回 ORM 实体。
- 避免泄露内部字段，例如密码哈希、令牌或审核列。

## 身份验证、防护和请求上下文```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Get('admin/report')
getAdminReport(@Req() req: AuthenticatedRequest) {
  return this.reportService.getForUser(req.user.id);
}
```
- 保持身份验证策略和保护模块本地化，除非它们真正共享。
- 在警卫中编码粗略的访问规则，然后在服务中进行特定于资源的授权。
- 对于经过身份验证的请求对象，首选显式请求类型。

## 异常过滤器和错误形状```ts
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<Request>();

    if (exception instanceof HttpException) {
      return response.status(exception.getStatus()).json({
        path: request.url,
        error: exception.getResponse(),
      });
    }

    return response.status(500).json({
      path: request.url,
      error: 'Internal server error',
    });
  }
}
```
- 在 API 中保持一致的错误信封。
- 针对预期的客户端错误抛出框架异常；集中记录和包装意外故障。

## 配置和环境验证```ts
ConfigModule.forRoot({
  isGlobal: true,
  load: [configuration],
  validate: validateEnv,
});
```
- 在启动时验证环境，而不是在第一次请求时延迟验证。
- 将配置访问保留在类型化帮助程序或配置服务后面。
- 在配置工厂中拆分开发/暂存/生产问题，而不是在整个功能代码中进行分支。

## 持久化和事务

- 将存储库/ORM 代码保留在使用领域语言的提供商后面。
- 对于 Prisma 或 TypeORM，隔离拥有工作单元的服务中的事务工作流程。
- 不要让控制器直接协调多步写入。

## 测试```ts
describe('UsersController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UsersModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });
});
```
- 单元测试提供者与模拟依赖项隔离。
- 为防护、验证管道和异常过滤器添加请求级测试。
- 在测试中重复使用您在生产中使用的相同全局管道/过滤器。

## 生产默认值

- 启用结构化日志记录和请求关联 ID。
- 终止无效的环境/配置而不是部分启动。
- 更喜欢使用显式运行状况检查的数据库/缓存客户端的异步提供程序初始化。
- 将后台作业和事件消费者保留在自己的模块中，而不是 HTTP 控制器内。
- 明确公共端点的速率限制、身份验证和审计日志记录。