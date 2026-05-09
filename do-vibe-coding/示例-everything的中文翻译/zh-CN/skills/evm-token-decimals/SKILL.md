---
name: evm-token-decimals
description: 防止 EVM 链上的无提示十进制不匹配错误。涵盖运行时十进制查找、链感知缓存、桥接代币精度漂移以及机器人、仪表板和 DeFi 工具的安全标准化。origin: ECC direct-port adaptation
version: "1.0.0"
---
# EVM 代币小数

无提示的小数点不匹配是发送数量级偏差的余额或美元值而不引发错误的最简单方法之一。

## 何时使用

- 使用 Python、TypeScript 或 Solidity 读取 ERC-20 余额
- 根据链上余额计算法币价值
- 比较多个 EVM 链的代币数量
- 处理桥接资产
- 构建投资组合跟踪器、机器人或聚合器

## 它是如何工作的

永远不要假设稳定币在任何地方都使用相同的小数。在运行时查询“decimals()”，通过“(chain_id, token_address)”进行缓存，并使用小数安全数学进行值计算。

## 示例

### 运行时查询小数```python
from decimal import Decimal
from web3 import Web3

ERC20_ABI = [
    {"name": "decimals", "type": "function", "inputs": [],
     "outputs": [{"type": "uint8"}], "stateMutability": "view"},
    {"name": "balanceOf", "type": "function",
     "inputs": [{"name": "account", "type": "address"}],
     "outputs": [{"type": "uint256"}], "stateMutability": "view"},
]

def get_token_balance(w3: Web3, token_address: str, wallet: str) -> Decimal:
    contract = w3.eth.contract(
        address=Web3.to_checksum_address(token_address),
        abi=ERC20_ABI,
    )
    decimals = contract.functions.decimals().call()
    raw = contract.functions.balanceOf(Web3.to_checksum_address(wallet)).call()
    return Decimal(raw) / Decimal(10 ** decimals)
```
不要硬编码“1_000_000”，因为符号在其他地方通常有 6 位小数。

### 通过链和令牌缓存```python
from functools import lru_cache

@lru_cache(maxsize=512)
def get_decimals(chain_id: int, token_address: str) -> int:
    w3 = get_web3_for_chain(chain_id)
    contract = w3.eth.contract(
        address=Web3.to_checksum_address(token_address),
        abi=ERC20_ABI,
    )
    return contract.functions.decimals().call()
```
### 防御性地处理奇怪的标记```python
try:
    decimals = contract.functions.decimals().call()
except Exception:
    logging.warning(
        "decimals() reverted on %s (chain %s), defaulting to 18",
        token_address,
        chain_id,
    )
    decimals = 18
```
记录后备并使其可见。旧的或非标准的令牌仍然存在。

### 在 Solidity 中标准化为 18 进制 WAD```solidity
interface IERC20Metadata {
    function decimals() external view returns (uint8);
}

function normalizeToWad(address token, uint256 amount) internal view returns (uint256) {
    uint8 d = IERC20Metadata(token).decimals();
    if (d == 18) return amount;
    if (d < 18) return amount * 10 ** (18 - d);
    return amount / 10 ** (d - 18);
}
```
### TypeScript 与以太坊```typescript
import { Contract, formatUnits } from 'ethers';

const ERC20_ABI = [
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
];

async function getBalance(provider: any, tokenAddress: string, wallet: string): Promise<string> {
  const token = new Contract(tokenAddress, ERC20_ABI, provider);
  const [decimals, raw] = await Promise.all([
    token.decimals(),
    token.balanceOf(wallet),
  ]);
  return formatUnits(raw, decimals);
}
```
### 快速链上检查```bash
cast call <token_address> "decimals()(uint8)" --rpc-url <rpc>
```
## 规则

- 始终在运行时查询 `decimals()`
- 按链加代币地址而不是符号进行缓存
- 使用“Decimal”、“BigInt”或等效的精确数学，而不是浮点数
- 桥接或包装更改后重新查询小数
- 在比较或定价之前一致地规范内部会计