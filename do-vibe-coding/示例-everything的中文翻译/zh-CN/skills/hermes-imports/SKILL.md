---
name: hermes-imports
description: 将本地 Hermes 操作员工作流程转换为经过净化的 ECC 技能和发布包工件。在准备 Hermes 工作流程以供公共 ECC 重用时使用，而不会泄漏私有工作区状态、凭据或仅限本地的路径。origin: ECC
---
# 爱马仕进口

将重复的 Hermes 工作流程转变为可在 ECC 中安全运输的内容时，请使用此技能。

Hermes 是操作员 shell。 ECC 是可重用的工作流层。进口应该将稳定的模式从 Hermes 转移到 ECC，而不转移私有状态。

## 何时使用

- Hermes 工作流程已重复足够多次，可重复使用。
- 本地操作员提示应成为公共 ECC 技能。
- 启动、内容、研究或工程工作流程需要经过清理的移交文档。
- 工作流程提及在发布之前必须删除的本地路径、凭据、个人数据集或私人帐户名称。

## 导入规则

- 将本地路径转换为存储库相对路径或占位符。
- 将真实帐户名称替换为“操作员”、“默认配置文件”或“工作区所有者”等角色标签。
- 仅按提供商名称描述凭证要求。
- 保持示例的范围窄且具有可操作性。
- 请勿发送原始工作区导出、令牌、OAuth 文件、健康数据、CRM 数据或财务数据。
- 如果工作流程需要私有状态才有意义，请将其保留在本地。

## 消毒检查表

在提交导入的工作流程之前，请扫描：

- 绝对路径，例如“/Users/...”- `~/.hermes` 路径，除非文档明确解释本地设置
- API 密钥、令牌、cookie、OAuth 文件或不记名字符串
- 电话号码、私人电子邮件地址和个人联系图
- 尚未公开的客户姓名、姓氏或账户名
- 收入、健康状况或 CRM 详细信息
- 原始日志，包括私有系统的工具输出

## 转换模式

1. 识别可重复的运算符循环。
2. 剥离私有输入和输出。
3. 将本地路径重写为与存储库相关的示例。
4. 将一次性说明变成“何时使用”部分和一个简短的过程。
5.增加具体的输出要求。
6. 在打开 PR 之前运行秘密和本地路径扫描。

## 示例：启动切换

本地Hermes提示：```text
Read my local workspace files and finalize launch copy.
```
ECC安全版本：```text
Use the public release pack under docs/releases/<version>/.
Return one X thread, one LinkedIn post, one recording checklist, and the missing assets list.
```
## 示例：安静时间操作员工作

当地爱马仕工作：```text
Run my private inbox, finance, and content checks overnight.
```
ECC安全版本：```text
Describe the scheduler policy, the quiet-hours window, the escalation rules, and the categories of checks. Do not include private data sources or credentials.
```
## 输出合约

返回：

- 候选ECC技能名称
- 净化后的工作流程摘要
- 所需的公共投入
- 删除了私人输入
- 剩余风险
- 应该创建或更新的文件