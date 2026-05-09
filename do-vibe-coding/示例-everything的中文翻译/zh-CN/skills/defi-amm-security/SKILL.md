---
name: defi-amm-security
description: Solidity AMM 合约、流动性池和掉期流量的安全清单。涵盖重入、CEI 排序、捐赠或通货膨胀攻击、预言机操纵、滑点、管理控制和整数数学。origin: ECC direct-port adaptation
version: "1.0.0"
---
# DeFi AMM 安全

Solidity AMM 合约、LP 金库和交换功能的关键漏洞模式和强化实施。

## 何时使用

- 编写或审计 Solidity AMM 或流动性池合约
- 实施持有代币余额的交换、存款、取款、铸币或销毁流程
- 审查在份额或储备数学中使用“token.balanceOf(address(this))”的任何合约
- 向 DeFi 协议添加费用设置器、暂停器、预言机更新或其他管理功能

## 它是如何工作的

将其用作清单加模式库。根据以下类别检查每个用户入口点，并且更喜欢强化示例而不是手动变体。

## 执行安全

本技能中的 shell 命令是本地审计示例。仅在受信任的签出或一次性沙箱中运行它们，并且不要将不受信任的合约名称、路径、RPC URL、私钥或用户提供的标志拼接到 shell 命令中。在安装工具或运行可能消耗大量本地或付费资源的长时间模糊测试/静态分析作业之前询问。

切勿在命令示例、日志或报告中包含秘密、私钥、助记词、API 令牌或主网签名凭据。## 示例

### 可重入：执行 CEI 命令

脆弱：```solidity
function withdraw(uint256 amount) external {
    require(balances[msg.sender] >= amount);
    token.transfer(msg.sender, amount);
    balances[msg.sender] -= amount;
}
```
安全的：```solidity
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

using SafeERC20 for IERC20;

function withdraw(uint256 amount) external nonReentrant {
    require(balances[msg.sender] >= amount, "Insufficient");
    balances[msg.sender] -= amount;
    token.safeTransfer(msg.sender, amount);
}
```
当存在强化库时，不要编写自己的防护。

### 捐赠或通货膨胀攻击

直接使用 token.balanceOf(address(this)) 进行份额数学计算，攻击者可以通过将代币发送到预期路径之外的合约来操纵分母。```solidity
// Vulnerable
function deposit(uint256 assets) external returns (uint256 shares) {
    shares = (assets * totalShares) / token.balanceOf(address(this));
}
```

```solidity
// Safe
uint256 private _totalAssets;

function deposit(uint256 assets) external nonReentrant returns (uint256 shares) {
    uint256 balBefore = token.balanceOf(address(this));
    token.safeTransferFrom(msg.sender, address(this), assets);
    uint256 received = token.balanceOf(address(this)) - balBefore;

    shares = totalShares == 0 ? received : (received * totalShares) / _totalAssets;
    _totalAssets += received;
    totalShares += shares;
}
```
跟踪内部会计并衡量实际收到的代币。

### 甲骨文操作

现货价格可以通过闪电贷来操纵。更喜欢 TWAP。```solidity
uint32[] memory secondsAgos = new uint32[](2);
secondsAgos[0] = 1800;
secondsAgos[1] = 0;
(int56[] memory tickCumulatives,) = IUniswapV3Pool(pool).observe(secondsAgos);
int24 twapTick = int24(
    (tickCumulatives[1] - tickCumulatives[0]) / int56(uint56(30 minutes))
);
uint160 sqrtPriceX96 = TickMath.getSqrtRatioAtTick(twapTick);
```
### 防滑保护

每个交换路径都需要调用者提供的滑点和截止日期。```solidity
function swap(
    uint256 amountIn,
    uint256 amountOutMin,
    uint256 deadline
) external returns (uint256 amountOut) {
    require(block.timestamp <= deadline, "Expired");
    amountOut = _calculateOut(amountIn);
    require(amountOut >= amountOutMin, "Slippage exceeded");
    _executeSwap(amountIn, amountOut);
}
```
### 安全储备数学```solidity
import {FullMath} from "@uniswap/v3-core/contracts/libraries/FullMath.sol";

uint256 result = FullMath.mulDiv(a, b, c);
```
对于大储备数学，当存在溢出风险时，请避免天真的“a * b / c”。

### 管理控制```solidity
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";

contract MyAMM is Ownable2Step {
    function setFee(uint256 fee) external onlyOwner { ... }
    function pause() external onlyOwner { ... }
}
```
更喜欢明确接受所有权转让并控制每条特权路径。

## 安全检查表

- 可重入暴露的入口点使用“nonReentrant”
- 尊重 CEI 排序
- 共享数学不依赖于原始 `balanceOf(address(this))`
- ERC-20 传输使用 `SafeERC20`
- 存款衡量实际收到的代币
- Oracle 读取使用 TWAP 或其他抗操纵源
- 掉期需要“amountOutMin”和“deadline”
- 溢出敏感的储备数学使用安全原语，如“mulDiv”
- 管理功能受到访问控制
- 紧急暂停存在并经过测试
- 静态分析和模糊测试在生产前运行

## 审核工具```bash
pip install slither-analyzer
slither . --exclude-dependencies

echidna-test . --contract YourAMM --config echidna.yaml

forge test --fuzz-runs 10000
```
