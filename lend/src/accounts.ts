import { BigInt, Address, log } from "@graphprotocol/graph-ts";
import { RibbonLendPool } from "../generated/templates/RibbonLendPool/RibbonLendPool";
import {
  BalanceUpdate,
  ERC20Token,
  ERC20TokenAccount,
  Pool,
  PoolAccount
} from "../generated/schema";
import { getPricePerShare, sharesToAssets } from "./utils";

export function _refreshVaultStats(
    pool: Pool,
    poolContract: RibbonLendPool
): void {
    pool.totalBalance = poolContract.poolSize();
    pool.borrowRate = poolContract.getBorrowRate();
    pool.supplyRate = poolContract.getSupplyRate();
    pool.rewardPerSecond = poolContract.rewardPerSecond();
    pool.utilization = poolContract.getUtilizationRate();
    pool.principal = poolContract.principal();
    pool.borrows = poolContract.borrows();
    pool.state = poolContract.state();
    pool.save();
}

export function refreshAllAccountBalances(
  poolAddress: Address,
  timestamp: i32
): void {
  let pool = Pool.load(poolAddress.toHexString())!;
  let poolContract = RibbonLendPool.bind(poolAddress);
  let decimals = pool.decimals;
  let assetPerShare = getPricePerShare(poolContract, 18 - decimals); // this gives back pricePerShare in usdc terms (18-6)

  _refreshVaultStats(pool, poolContract);

  if (pool != null) {
    for (let i = 0; i < pool.numDepositors; i++) {
      let depositors = pool.depositors;
      let depositorAddress = depositors[i];
      if (depositorAddress != null) {
        _triggerBalanceUpdate(
          poolAddress,
          depositorAddress as Address,
          timestamp,
          true,
          false,
          false,
          assetPerShare,
          decimals
        );
      }
    }
  }
}

export function triggerBalanceUpdate(
  poolAddress: Address,
  accountAddress: Address,
  timestamp: i32,
  accruesYield: bool,
  isWithdraw: bool
): void {
  let pool = Pool.load(poolAddress.toHexString())!;
  let poolContract = RibbonLendPool.bind(poolAddress);
  let decimals = pool.decimals;
  let assetPerShare = getPricePerShare(poolContract, 18 - decimals) // this gives back pricePerShare in usdc terms (18-6)

  _refreshVaultStats(pool, poolContract);

  _triggerBalanceUpdate(
    poolAddress,
    accountAddress,
    timestamp,
    accruesYield,
    isWithdraw,
    true,
    assetPerShare,
    decimals
  );
}

export function _triggerBalanceUpdate(
  poolAddress: Address,
  accountAddress: Address,
  timestamp: i32,
  accruesYield: bool,
  isWithdraw: bool,
  isRefresh: bool,
  assetPerShare: BigInt,
  decimals: number
): void {
  let poolID = poolAddress.toHexString();
  let poolContract = RibbonLendPool.bind(poolAddress);
  let poolAccount = PoolAccount.load(
    poolAddress.toHexString() + "-" + accountAddress.toHexString()
  );

  if (poolAccount == null) {
    return;
  }

  let prevUpdateCounter = poolAccount.updateCounter;
  let updateCounter = prevUpdateCounter + 1;
  let updateID =
    poolAddress.toHexString() +
    "-" +
    accountAddress.toHexString() +
    "-" +
    updateCounter.toString();

  let accountBalance = sharesToAssets(
    poolContract.balanceOf(accountAddress),
    assetPerShare,
    decimals
  );

  let update = new BalanceUpdate(updateID);
  update.pool = poolID;
  update.account = accountAddress;
  update.timestamp = timestamp;
  update.balance = accountBalance;
  update.yieldEarned = BigInt.fromI32(0);
  update.isWithdraw = isWithdraw;

  if (accruesYield) {
    let prevUpdateID =
      poolAddress.toHexString() +
      "-" +
      accountAddress.toHexString() +
      "-" +
      prevUpdateCounter.toString();

    let prevUpdate = BalanceUpdate.load(prevUpdateID);
    if (prevUpdate != null) {
      let yieldEarned = accountBalance.minus(prevUpdate.balance);
      if (yieldEarned.gt(BigInt.fromI32(0))) {
        update.yieldEarned = yieldEarned;
        poolAccount.totalYieldEarned = poolAccount.totalYieldEarned.plus(
          yieldEarned
        );
      }
    }
  }

  update.save();

  poolAccount.updateCounter = updateCounter;
  poolAccount.totalBalance = accountBalance;
  poolAccount.shares = poolContract.balanceOf(accountAddress);
  poolAccount.save();
}

export function createPoolAccount(
  poolAddress: Address,
  accountAddress: Address
): PoolAccount {
  let poolAccountID =
    poolAddress.toHexString() + "-" + accountAddress.toHexString();
  let poolAccount = PoolAccount.load(poolAccountID);

  if (poolAccount == null) {
    let pool = Pool.load(poolAddress.toHexString())!;
    let depositors = pool.depositors;
    depositors.push(accountAddress);
    pool.depositors = depositors;

    pool.numDepositors = pool.numDepositors + 1;
    pool.save();

    poolAccount = new PoolAccount(poolAccountID);
    poolAccount.pool = poolAddress.toHexString();
    poolAccount.account = accountAddress;
    poolAccount.shares = BigInt.fromI32(0);
    poolAccount.totalDeposits = BigInt.fromI32(0);
    poolAccount.totalBalance = BigInt.fromI32(0);
    poolAccount.totalYieldEarned = BigInt.fromI32(0);
    poolAccount.updateCounter = 0;
    poolAccount.save();
  }
  return poolAccount as PoolAccount;
}

export function getOrCreateTokenAccount(
  tokenAddress: Address,
  accountAddress: Address,
  token: ERC20Token
): ERC20TokenAccount {
  let tokenAccountID =
    tokenAddress.toHexString() + "-" + accountAddress.toHexString();

  let tokenAccount = ERC20TokenAccount.load(tokenAccountID);
  if (tokenAccount == null) {
    let holders = token.holders;
    holders.push(accountAddress);
    token.holders = holders;

    token.numHolders = token.numHolders + 1;
    token.save();

    tokenAccount = new ERC20TokenAccount(tokenAccountID);
    tokenAccount.token = tokenAddress.toHexString();
    tokenAccount.account = accountAddress;
    tokenAccount.balance = BigInt.fromI32(0);
    tokenAccount.save();
  }
  return tokenAccount as ERC20TokenAccount;
}
