---
name: security-bounty-hunter
description: 在存储库中寻找可利用的、值得赏金的安全问题。专注于可远程访问的漏洞，这些漏洞有资格获得真实报告，而不是仅限于本地的嘈杂发现。origin: ECC direct-port adaptation
version: "1.0.0"
---
# 安全赏金猎人

当目标是发现实际漏洞以进行负责任的披露或赏金提交，而不是广泛的最佳实践审查时，请使用此选项。

## 何时使用

- 扫描存储库以查找可利用的漏洞
- 准备 Huntr、HackerOne 或类似的赏金提交
- 分类问题是“这真的能赚钱吗？”而不是“这在理论上不安全吗？”

## 它是如何工作的

偏向于可远程访问、用户控制的攻击路径，并丢弃平台通常因信息丰富或超出范围而拒绝的模式。

## 范围内模式

这些是始终重要的问题：

|图案| CWE |典型影响 |
| --- | --- | --- |
|通过用户控制的 URL 进行 SSRF | CWE-918 |内网访问、云元数据盗窃|
|中间件或 API 防护中的身份验证绕过CWE-287 |未经授权的帐户或数据访问 |
|远程反序列化或上传至 RCE 路径 | CWE-502 |代码执行 |
|可访问端点中的 SQL 注入 | CWE-89 |数据泄露、身份验证绕过、数据破坏 |
|请求处理程序中的命令注入 | CWE-78 |代码执行 ||文件服务路径中的路径遍历 | CWE-22 |任意文件读取或写入|
|自动触发的 XSS | CWE-79 |会话盗窃、管理员妥协 |

## 跳过这些

这些通常是低信号或超出赏金范围，除非计划另有说明：

- 仅本地“pickle.loads”、“torch.load”或无远程路径的等效项
- 仅 CLI 工具中的“eval()”或“exec()”
- 完全硬编码命令上的“shell=True”
- 本身缺少安全标头
- 没有利用影响的通用速率限制投诉
- 自我XSS要求受害者手动粘贴代码
- 不属于目标程序范围的 CI/CD 注入
- 演示、示例或仅供测试的代码

## 工作流程

1. 首先检查范围：程序规则、SECURITY.md、披露渠道和排除。
2. 找到真正的入口点：HTTP 处理程序、上传、后台作业、Webhooks、解析器和集成端点。
3. 在有帮助的地方运行静态工具，但仅将其视为分类输入。
4. 端到端地阅读真实的代码路径。
5. 证明用户控制达到有意义的接收器。
6. 使用尽可能小的安全 PoC 确认可利用性和影响。
7. 在起草报告之前检查是否有重复项。

## 分类循环示例```bash
semgrep --config=auto --severity=ERROR --severity=WARNING --json
```
然后手动过滤：

- 跌落测试、演示、固定装置、供应代码
- 删除仅本地或不可到达的路径
- 仅保留具有清晰网络或用户控制路线的发现

## 报告结构```markdown
## Description
[What the vulnerability is and why it matters]

## Vulnerable Code
[File path, line range, and a small snippet]

## Proof of Concept
[Minimal working request or script]

## Impact
[What the attacker can achieve]

## Affected Version
[Version, commit, or deployment target tested]
```
## 质量门

提交前：

- 代码路径可从真实用户或网络边界访问
- 输入真正由用户控制
- 水槽有意义且可利用
- PoC 有效
- 该问题尚未包含在公告、CVE 或开放票证中
- 目标实际上在赏金计划的范围内