  # 全局偏好

  ## Workflow

  - 做任何破坏性操作（删除文件、git reset --hard、强制推送）前先确认
  - 优先增量修改，避免不必要的大范围重构
  - 除非我明确要求，不要新建文档文件（*.md）

  ## Code Style

  - TypeScript: 双引号，分号结尾
  - Python: 4 空格缩进，单引号
  - 导入顺序：第三方 → 内部模块 → 相对路径

  ## Communication

  - 用中文回复
  - 简洁直接，不要寒暄套话
  - 代码块前给文件路径和行号

  ## Environment

  - 默认 Node 22, Python 3.12
  - 包管理器优先用 pnpm

  ---
  ---
  ---

  ## Global Conventions
  - All projects use TypeScript strict mode
  - Use pnpm as package manager
  - Run type check and lint before commits
  - Use functional programming style
  - Prefer named exports over default exports

  ## Communication Style
  - Lead with the solution, then explain
  - Be concise, skip filler words
  - Admit uncertainty rather than hallucinate

  ## Safety (Global)
  - Never run destructive commands without 
    explicit confirmation
  - Never commit secrets or API keys
  - Always use .env files for credentials

  ## Preferred Stack (default unless project 
  ## specifies otherwise)
  - Language: TypeScript
  - Framework: Next.js (App Router)
  - Database: PostgreSQL with Prisma
  - Styling: Tailwind CSS

全局约定
所有项目使用 TypeScript strict 模式
使用 pnpm 作为包管理器
提交前运行类型检查和代码检查
使用函数式编程风格
优先使用命名导出，避免默认导出
沟通风格
先给答案，再解释原因
简洁直接，不说废话
不确定时就承认，不编造答案
安全规范（全局）
执行破坏性命令前必须获得明确确认
绝不提交密钥或 API 密钥
凭证信息统一使用 .env 文件管理
技术偏好栈（项目无特殊说明时默认）
语言：TypeScript
框架：Next.js（App Router）
数据库：PostgreSQL + Prisma
样式：Tailwind CSS