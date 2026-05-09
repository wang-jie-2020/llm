---
name: llm-trading-agent-security
description: 具有钱包或交易权限的自主交易代理的安全模式。涵盖即时注入、支出限制、预发送模拟、断路器、MEV 保护和密钥处理。origin: ECC direct-port adaptation
version: "1.0.0"
---
# 法学硕士交易代理安全

自主交易代理具有比普通法学硕士应用程序更严厉的威胁模型：注入或不良工具路径可能直接导致资产损失。

## 何时使用

- 构建一个签名和发送交易的人工智能代理
- 审核交易机器人或链上执行助手
- 为代理设计钱包密钥管理
- 允许法学硕士进行订单下达、掉期或财务操作

## 它是如何工作的

分层防御。单一检查是不够的。将即时卫生、支出政策、模拟、执行限制和钱包隔离视为独立控制。

## 示例

### 将即时注入视为金融攻击```python
import re

INJECTION_PATTERNS = [
    r'ignore (previous|all) instructions',
    r'new (task|directive|instruction)',
    r'system prompt',
    r'send .{0,50} to 0x[0-9a-fA-F]{40}',
    r'transfer .{0,50} to',
    r'approve .{0,50} for',
]

def sanitize_onchain_data(text: str) -> str:
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            raise ValueError(f"Potential prompt injection: {text[:100]}")
    return text
```
不要盲目地将令牌名称、配对标签、网络钩子或社交源注入到可执行的提示中。

### 硬性支出限制```python
from decimal import Decimal

MAX_SINGLE_TX_USD = Decimal("500")
MAX_DAILY_SPEND_USD = Decimal("2000")

class SpendLimitError(Exception):
    pass

class SpendLimitGuard:
    def check_and_record(self, usd_amount: Decimal) -> None:
        if usd_amount > MAX_SINGLE_TX_USD:
            raise SpendLimitError(f"Single tx ${usd_amount} exceeds max ${MAX_SINGLE_TX_USD}")

        daily = self._get_24h_spend()
        if daily + usd_amount > MAX_DAILY_SPEND_USD:
            raise SpendLimitError(f"Daily limit: ${daily} + ${usd_amount} > ${MAX_DAILY_SPEND_USD}")

        self._record_spend(usd_amount)
```
### 发送前模拟```python
class SlippageError(Exception):
    pass

async def safe_execute(self, tx: dict, expected_min_out: int | None = None) -> str:
    sim_result = await self.w3.eth.call(tx)

    if expected_min_out is None:
        raise ValueError("min_amount_out is required before send")

    actual_out = decode_uint256(sim_result)
    if actual_out < expected_min_out:
        raise SlippageError(f"Simulation: {actual_out} < {expected_min_out}")

    signed = self.account.sign_transaction(tx)
    return await self.w3.eth.send_raw_transaction(signed.raw_transaction)
```
### 断路器```python
class TradingCircuitBreaker:
    MAX_CONSECUTIVE_LOSSES = 3
    MAX_HOURLY_LOSS_PCT = 0.05

    def check(self, portfolio_value: float) -> None:
        if self.consecutive_losses >= self.MAX_CONSECUTIVE_LOSSES:
            self.halt("Too many consecutive losses")

        if self.hour_start_value <= 0:
            self.halt("Invalid hour_start_value")
            return

        hourly_pnl = (portfolio_value - self.hour_start_value) / self.hour_start_value
        if hourly_pnl < -self.MAX_HOURLY_LOSS_PCT:
            self.halt(f"Hourly PnL {hourly_pnl:.1%} below threshold")
```
### 钱包隔离```python
import os
from eth_account import Account

private_key = os.environ.get("TRADING_WALLET_PRIVATE_KEY")
if not private_key:
    raise EnvironmentError("TRADING_WALLET_PRIVATE_KEY not set")

account = Account.from_key(private_key)
```
使用专用热钱包，仅包含所需的会话资金。切勿将代理人指向主要金库钱包。

### MEV and deadline protection```python
import time

PRIVATE_RPC = "https://rpc.flashbots.net"
MAX_SLIPPAGE_BPS = {"stable": 10, "volatile": 50}
deadline = int(time.time()) + 60
```
## 预部署清单

- 外部数据在进入法学硕士背景之前经过清理
- 支出限制的执行独立于模型输出
- 交易在发送前进行模拟
- `min_amount_out` 是强制性的
- 断路器因资金回撤或无效状态而停止
- 密钥来自环境或秘密管理器，从不编码或日志
- 在适当的时候使用私有内存池或受保护的路由
- 按策略设定滑点和截止日期
- 所有代理决策都经过审核记录，而不仅仅是成功的发送