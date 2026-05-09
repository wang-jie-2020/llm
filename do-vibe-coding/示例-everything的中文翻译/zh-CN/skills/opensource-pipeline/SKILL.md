---
name: opensource-pipeline
description: "开源管道：分叉、清理和打包私有项目以安全公开发布。连锁 3 个代理（叉子、消毒器、包装器）。触发器：“/opensource”、“开源”、“公开”、“准备开源”。"origin: ECC
---
# 开源管道技能

通过 3 阶段管道安全地开源任何项目：**Fork**（剥离机密）→ **Sanitize**（验证干净）→ **Package**（CLAUDE.md + setup.sh + README）。

## 何时激活

- 用户说“开源这个项目”或“公开这个项目”
- 用户想要准备一个私人仓库以供公开发布
- 用户需要在推送到 GitHub 之前删除机密
- 用户调用“/opensource fork”、“/opensource verify”或“/opensource package”

## 命令

|命令|行动|
|---------|--------|
| `/opensource fork 项目` |完整管道：分叉+消毒+包装|
| `/开源验证项目` |在现有存储库上运行消毒剂 |
| `/开源包项目` |生成 CLAUDE.md + setup.sh + README |
| `/开源列表` |显示所有已上演的项目 |
| `/开源状态项目` |显示分阶段项目的报告 |

## 协议

### /开源分叉项目

**完整管道——主要工作流程。**

#### 第 1 步：收集参数

解决项目路径。如果 PROJECT 包含 `/`，则视为路径（绝对或相对）。否则检查：当前工作目录“$HOME/PROJECT”，然后询问用户。```
SOURCE_PATH="<resolved absolute path>"
STAGING_PATH="$HOME/opensource-staging/${PROJECT_NAME}"
```
询问用户：
1.“哪个项目？” （如果没有找到）
2.“许可证？（MIT / Apache-2.0 / GPL-3.0 / BSD-3-Clause）”
3.“GitHub 组织或用户名？” （默认：通过 `gh api user -q .login` 检测）
4.“GitHub 存储库名称？” （默认：项目名称）
5.“自述文件的说明？” （分析项目以寻求建议）

#### 第 2 步：创建暂存目录```bash
mkdir -p $HOME/opensource-staging/
```
#### 步骤 3：运行 Forker 代理

生成 `opensource-forker` 代理：```
Agent(
  description="Fork {PROJECT} for open-source",
  subagent_type="opensource-forker",
  prompt="""
Fork project for open-source release.

Source: {SOURCE_PATH}
Target: {STAGING_PATH}
License: {chosen_license}

Follow the full forking protocol:
1. Copy files (exclude .git, node_modules, __pycache__, .venv)
2. Strip all secrets and credentials
3. Replace internal references with placeholders
4. Generate .env.example
5. Clean git history
6. Generate FORK_REPORT.md in {STAGING_PATH}/FORK_REPORT.md
"""
)
```
等待完成。阅读“{STAGING_PATH}/FORK_REPORT.md”。

#### 步骤 4：运行 Sanitizer 代理

生成 `opensource-sanitizer` 代理：```
Agent(
  description="Verify {PROJECT} sanitization",
  subagent_type="opensource-sanitizer",
  prompt="""
Verify sanitization of open-source fork.

Project: {STAGING_PATH}
Source (for reference): {SOURCE_PATH}

Run ALL scan categories:
1. Secrets scan (CRITICAL)
2. PII scan (CRITICAL)
3. Internal references scan (CRITICAL)
4. Dangerous files check (CRITICAL)
5. Configuration completeness (WARNING)
6. Git history audit

Generate SANITIZATION_REPORT.md inside {STAGING_PATH}/ with PASS/FAIL verdict.
"""
)
```
等待完成。阅读“{STAGING_PATH}/SANITIZATION_REPORT.md”。

**如果失败：** 向用户显示结果。问：“修复这些问题并重新扫描，还是中止？”
- 如果修复：应用修复，重新运行清理程序（最多 3 次重试 - 3 次失败后，显示所有发现并要求用户手动修复）
- 如果中止：清理暂存目录

**如果通过或通过但有警告：** 继续步骤 5。

#### 步骤 5：运行 Packager Agent

生成 `opensource-packager` 代理：```
Agent(
  description="Package {PROJECT} for open-source",
  subagent_type="opensource-packager",
  prompt="""
Generate open-source packaging for project.

Project: {STAGING_PATH}
License: {chosen_license}
Project name: {PROJECT_NAME}
Description: {description}
GitHub repo: {github_repo}

Generate:
1. CLAUDE.md (commands, architecture, key files)
2. setup.sh (one-command bootstrap, make executable)
3. README.md (or enhance existing)
4. LICENSE
5. CONTRIBUTING.md
6. .github/ISSUE_TEMPLATE/ (bug_report.md, feature_request.md)
"""
)
```
#### 第 6 步：最终审核

呈现给用户：```
Open-Source Fork Ready: {PROJECT_NAME}

Location: {STAGING_PATH}
License: {license}
Files generated:
  - CLAUDE.md
  - setup.sh (executable)
  - README.md
  - LICENSE
  - CONTRIBUTING.md
  - .env.example ({N} variables)

Sanitization: {sanitization_verdict}

Next steps:
  1. Review: cd {STAGING_PATH}
  2. Create repo: gh repo create {github_org}/{github_repo} --public
  3. Push: git remote add origin ... && git push -u origin main

Proceed with GitHub creation? (yes/no/review first)
```
#### 步骤 7：GitHub 发布（经用户批准）```bash
cd "{STAGING_PATH}"
gh repo create "{github_org}/{github_repo}" --public --source=. --push --description "{description}"
```
---

### /开源验证项目

独立运行消毒剂。解析路径：如果PROJECT包含“/”，则视为路径。否则检查 `$HOME/opensource-staging/PROJECT`，然后检查 `$HOME/PROJECT`，然后检查当前目录。```
Agent(
  subagent_type="opensource-sanitizer",
  prompt="Verify sanitization of: {resolved_path}. Run all 6 scan categories and generate SANITIZATION_REPORT.md."
)
```
---

### /开源包项目

独立运行打包程序。询问“许可证？”和“描述？”，然后：```
Agent(
  subagent_type="opensource-packager",
  prompt="Package: {resolved_path} ..."
)
```
---

### /开源列表```bash
ls -d $HOME/opensource-staging/*/
```
显示每个项目的管道进度（FORK_REPORT.md、SANITIZATION_REPORT.md、CLAUDE.md 存在）。

---

### /开源状态项目```bash
cat $HOME/opensource-staging/${PROJECT}/SANITIZATION_REPORT.md
cat $HOME/opensource-staging/${PROJECT}/FORK_REPORT.md
```
## 舞台布局```
$HOME/opensource-staging/
  my-project/
    FORK_REPORT.md           # From forker agent
    SANITIZATION_REPORT.md   # From sanitizer agent
    CLAUDE.md                # From packager agent
    setup.sh                 # From packager agent
    README.md                # From packager agent
    .env.example             # From forker agent
    ...                      # Sanitized project files
```
## 反模式

- 未经用户批准，**决不**推送到 GitHub
- **永远不要**跳过消毒剂——它是安全门
- 在消毒剂失败后，**切勿**在未修复所有关键问题的情况下继续进行
- **永远不要**将 `.env`、`*.pem` 或 `credentials.json` 留在暂存目录中

## 最佳实践

- 始终运行新版本的完整管道（分叉→清理→打包）
- 暂存目录一直存在，直到明确清理为止 - 使用它进行审查
- 在发布之前进行任何手动修复后重新运行消毒程序
- 参数化秘密而不是删除它们——保留项目功能

## 相关技能

请参阅“安全审查”以了解消毒剂使用的秘密检测模式。