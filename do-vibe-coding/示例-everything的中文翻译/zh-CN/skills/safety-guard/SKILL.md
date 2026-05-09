---
name: safety-guard
description: 在生产系统上工作或自主运行代理时，使用此技能可以防止破坏性操作。origin: ECC
---
# 安全卫士——防止破坏性操作

## 何时使用

- 在生产系统上工作时
- 当代理自主运行时（全自动模式）
- 当您想限制对特定目录的编辑时
- 敏感操作期间（迁移、部署、数据更改）

## 它是如何工作的

三种保护模式：

### 模式1：小心模式

在执行前拦截破坏性命令并发出警告：```
Watched patterns:
- rm -rf (especially /, ~, or project root)
- git push --force
- git reset --hard
- git checkout . (discard all changes)
- DROP TABLE / DROP DATABASE
- docker system prune
- kubectl delete
- chmod 777
- sudo rm
- npm publish (accidental publishes)
- Any command with --no-verify
```
检测到时：显示命令的作用、要求确认、建议更安全的替代方案。

### 模式 2：冻结模式

将文件编辑锁定到特定目录树：```
/safety-guard freeze src/components/
```
任何在 `src/components/` 之外的写入/编辑都会被阻止并带有解释。当您希望代理专注于一个区域而不接触不相关的代码时非常有用。

### 模式3：守卫模式（小心+冻结相结合）

两种保护均处于活动状态。自主代理的最大安全性。```
/safety-guard guard --dir src/api/ --allow-read-all
```
代理可以读取任何内容，但只能写入“src/api/”。破坏性命令随处被阻止。

### 解锁```
/safety-guard off
```
## 实施

使用 PreToolUse 挂钩拦截 Bash、Write、Edit 和 MultiEdit 工具调用。在允许执行之前根据活动规则检查命令/路径。

## 整合

- 默认情况下启用“codex -a never”会话
- 与 ECC 2.0 中的可观察性风险评分配对
- 将所有被阻止的操作记录到`~/.claude/safety-guard.log`