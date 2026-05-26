# 项目协作准则（提效版）

## 目标
减少无关检索（git 状态、系统文件、系统配置）造成的耗时。

## 默认执行边界
- 默认只在 `D:/Code/llm/do-mine/do-prompt` 内检索。
- 除非用户明确要求，不扫描以下路径：
  - `D:/Code/llm/.git`
  - `D:/Code/llm/repository`
  - `D:/Code/llm/what-i-do`
  - 系统目录（如 Windows、Program Files、用户主目录）
- 未给出目标路径/文件时，先提一个澄清问题，不做全仓搜索。

## Git 操作策略
- 默认不主动执行 `git status`、`git diff`、`git log`、`git branch -a`。
- 仅在以下场景执行 git：
  1. 用户明确要求 git 信息；
  2. 用户要求提交或创建 PR；
  3. 诊断确认属于版本差异问题。
- 需要 git 时，优先最小化命令：
  - `git status --short`
  - `git diff -- <path>`
  - `git log -n 5 -- <path>`

## 检索策略（先快后全）
1. 用户已给出文件/目录：直接定向 `Read` / `Grep`。
2. 用户未给出范围：先问“请给目录或文件名范围”。
3. 用户允许扩大范围后，再做 `Glob` / `Grep`，且每次限定 `path + pattern`。

## 代码地图（当前项目）
- 工作目录：`D:/Code/llm/do-mine/do-prompt`
- 默认仅处理该目录下文件。
- 若代码在其他目录，用户需在需求中显式给出路径。

## 常用命令（按需执行）
- 查看当前目录：`ls -a`
- 定向检索：`Glob/Grep`（限定路径）
- 定向阅读：`Read <absolute_path>`

## 需求输入模板（建议）
- 目标：做什么
- 路径：在哪个目录
- 文件：改哪些文件
- 是否允许 git 检查：是/否
- 是否允许跨目录搜索：是/否
