  # MyApp

  全栈 Web 应用，React + Node.js + PostgreSQL

  ## Commands

  | Command | Description |
  |---------|-------------|
  | `npm run dev` | 启动开发服务器 (前端 :3000, 后端 :4000) |
  | `npm run build` | 生产构建 |
  | `npm test` | 运行全部测试 |
  | `npm run lint` | ESLint + Prettier 检查 |
  | `npx prisma migrate dev` | 数据库迁移 |
  | `docker compose up -d` | 启动本地 PostgreSQL/Redis |

  ## Architecture

  src/
  ├── server/          # Express API
  │   ├── routes/      # REST 路由
  │   ├── services/    # 业务逻辑层
  │   └── middleware/   # auth, validation, etc.
  ├── client/          # React SPA (Vite)
  │   ├── pages/       # 路由页面组件
  │   ├── components/  # 共享组件
  │   └── hooks/       # 自定义 hooks
  └── shared/          # 前后端共享类型/常量

  ## Code Style

  - 类型优先使用 `interface`，仅联合类型用 `type`
  - 文件名：组件 PascalCase，工具函数 camelCase
  - API 路由遵循 RESTful 命名

  ## Gotchas

  - Prisma 迁移必须先生成再应用，直接改 schema 不同步
  - 测试数据库用的是 SQLite (内存模式)，与生产 PG 有行为差异
  - `npm run dev` 不会自动装新依赖，手动 `npm i`


  ---
  ---
  ---

    # Superpowers Chrome MCP

  Chrome 浏览器操作的 MCP 服务器

  ## 项目结构

  - `src/index.ts` — MCP 服务器入口
  - `src/tools/` — 各个 MCP 工具实现
  - `dist/index.js` — esbuild 打包产物（发布到 npm）

  ## 构建系统

  TypeScript → esbuild → 单文件 dist/index.js

  npm run build    # 编译 + 打包
  npm run dev      # watch 模式开发

  ## 发布工程

  1. `npm version patch|minor|major`
  2. `npm run build`
  3. `npm publish`

  ## 常见问题

  **构建报 "module not found"**
  → 原因：新依赖未安装。解决：`npm i`

  **版本不匹配**
  → 原因：改了 package.json 后忘记重新构建

  ## Git 工作流

  - 分支命名：`feature/<name>` / `fix/<name>`
  - 提交信息：`type: description`（feat/fix/chore/docs）
  - 不要提交 `dist/`（CI 自动构建）

  ---
  ---
  ---

  ## Project Overview
  An AI landing page generation tool for designers.
  Users upload designs, AI generates deployable 
  Landing Pages.
  Core metric: From design to live < 5 minutes.

  ## Tech Stack
  - Next.js 15 (App Router)
  - TypeScript (strict)
  - Tailwind CSS + shadcn/ui
  - Supabase (auth + database)
  - Vercel AI SDK
  - Vitest
  - pnpm

Prohibited: Redux, styled-components, Material UI

## Architecture
- app/ — Routes and pages (RSC preferred)
- components/ui/ — Design system components
- components/landing/ — Landing page templates
- lib/ — Shared utilities and API clients
- features/ — Business modules
- types/ — Shared type definitions

## Coding Conventions
- Functional components, avoid class components
- Named exports (except route files)
- async/await style
- Components max 200 lines
- Functions max 50 lines
- Descriptive naming, avoid abbreviations
- No leftover console.log
- All user input must be Zod-validated

## Commands
- Dev: pnpm dev
- Build: pnpm build
- Types: pnpm typecheck
- Test: pnpm test -- --run
- Lint: pnpm lint

## Safety Rules
- Don't modify auth logic
- Don't modify database schema
- Don't rename published API routes
- Maintain component API backward compatibility