---
name: canary-watch
description: 使用此技能可以监视部署的 URL 在部署、合并或依赖项升级后的回归情况。origin: ECC
---
# Canary Watch — 部署后监控

## 何时使用

- 部署到生产或登台后
- 合并有风险的 PR 后
- 当您想验证修复是否确实修复了它时
- 在启动窗口期间持续监控
- 依赖升级后

## 它是如何工作的

监控已部署 URL 的回归情况。循环运行，直到停止或监视窗口到期。

### 它看什么```
1. HTTP Status — is the page returning 200?
2. Console Errors — new errors that weren't there before?
3. Network Failures — failed API calls, 5xx responses?
4. Performance — LCP/CLS/INP regression vs baseline?
5. Content — did key elements disappear? (h1, nav, footer, CTA)
6. API Health — are critical endpoints responding within SLA?
```
### 观看模式

**快速检查**（默认）：单次通过，报告结果```
/canary-watch https://myapp.com
```
**持续观看**：每 N 分钟检查一次，持续 M 小时```
/canary-watch https://myapp.com --interval 5m --duration 2h
```
**差异模式**：比较分期与生产```
/canary-watch --compare https://staging.myapp.com https://myapp.com
```
### 警报阈值```yaml
critical:  # immediate alert
  - HTTP status != 200
  - Console error count > 5 (new errors only)
  - LCP > 4s
  - API endpoint returns 5xx

warning:   # flag in report
  - LCP increased > 500ms from baseline
  - CLS > 0.1
  - New console warnings
  - Response time > 2x baseline

info:      # log only
  - Minor performance variance
  - New network requests (third-party scripts added?)
```
### 通知

当超过临界阈值时：
- 桌面通知（macOS/Linux）
- 可选：Slack/Discord webhook
- 登录到`~/.claude/canary-watch.log`

## 输出```markdown
## Canary Report — myapp.com — 2026-03-23 03:15 PST

### Status: HEALTHY ✓

| Check | Result | Baseline | Delta |
|-------|--------|----------|-------|
| HTTP | 200 ✓ | 200 | — |
| Console errors | 0 ✓ | 0 | — |
| LCP | 1.8s ✓ | 1.6s | +200ms |
| CLS | 0.01 ✓ | 0.01 | — |
| API /health | 145ms ✓ | 120ms | +25ms |

### No regressions detected. Deploy is clean.
```
## 整合

搭配：
- `/browser-qa` 用于预部署验证
- 挂钩：在 `git push` 上添加为 PostToolUse 挂钩，以便在部署后自动检查
- CI：部署步骤后在 GitHub Actions 中运行