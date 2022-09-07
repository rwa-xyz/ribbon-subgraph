import { BigInt, Address, log } from "@graphprotocol/graph-ts";
import { RibbonLendVault } from "../generated/RibbonLendVault/RibbonLendVault";
import {
  BalanceUpdate,
  ERC20Token,
  ERC20TokenAccount,
  Vault,
  VaultAccount
} from "../generated/schema";
import { getPricePerShare, sharesToAssets } from "./utils";

export function refreshAllAccountBalances(
  vaultAddress: Address,
  timestamp: i32
): void {
  let vault = Vault.load(vaultAddress.toHexString());
  let vaultContract = RibbonLendVault.bind(vaultAddress);
  let decimals = vault.decimals;
  let assetPerShare = getPricePerShare(vaultContract, 18 - decimals); // this gives back pricePerShare in usdc terms (18-6)

  let totalBalance = vaultContract.poolSize();
  vault.totalBalance = totalBalance;
  vault.save();

  if (vault != null) {
    for (let i = 0; i < vault.numDepositors; i++) {
      let depositors = vault.depositors;
      let depositorAddress = depositors[i];
      if (depositorAddress != null) {
        _triggerBalanceUpdate(
          vaultAddress,
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
  vaultAddress: Address,
  accountAddress: Address,
  timestamp: i32,
  accruesYield: bool,
  isWithdraw: bool
): void {
  let vault = Vault.load(vaultAddress.toHexString());
  let vaultContract = RibbonLendVault.bind(vaultAddress);
  let decimals = vault.decimals;
  let assetPerShare = getPricePerShare(vaultContract, 18 - decimals) // this gives back pricePerShare in usdc terms (18-6)
  let totalBalance = vaultContract.poolSize();
  vault.totalBalance = totalBalance;
  vault.save();

  _triggerBalanceUpdate(
    vaultAddress,
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
  vaultAddress: Address,
  accountAddress: Address,
  timestamp: i32,
  accruesYield: bool,
  isWithdraw: bool,
  isRefresh: bool,
  assetPerShare: BigInt,
  decimals: number
): void {
  let vaultID = vaultAddress.toHexString();
  let vaultContract = RibbonLendVault.bind(vaultAddress);
  let vaultAccount = VaultAccount.load(
    vaultAddress.toHexString() + "-" + accountAddress.toHexString()
  );

  if (vaultAccount == null) {
    return;
  }

  let prevUpdateCounter = vaultAccount.updateCounter;
  let updateCounter = prevUpdateCounter + 1;
  let updateID =
    vaultAddress.toHexString() +
    "-" +
    accountAddress.toHexString() +
    "-" +
    updateCounter.toString();

  let accountBalance = sharesToAssets(
    vaultContract.balanceOf(accountAddress),
    assetPerShare,
    decimals
  );

  let update = new BalanceUpdate(updateID);
  update.vault = vaultID;
  update.account = accountAddress;
  update.timestamp = timestamp;
  update.balance = accountBalance;
  update.yieldEarned = BigInt.fromI32(0);
  update.isWithdraw = isWithdraw;

  if (accruesYield) {
    let prevUpdateID =
      vaultAddress.toHexString() +
      "-" +
      accountAddress.toHexString() +
      "-" +
      prevUpdateCounter.toString();

    let prevUpdate = BalanceUpdate.load(prevUpdateID);
    if (prevUpdate != null) {
      let yieldEarned = accountBalance.minus(prevUpdate.balance);
      if (yieldEarned.gt(BigInt.fromI32(0))) {
        update.yieldEarned = yieldEarned;
        vaultAccount.totalYieldEarned = vaultAccount.totalYieldEarned.plus(
          yieldEarned
        );
      }
    }
  }

  update.save();

  vaultAccount.updateCounter = updateCounter;
  vaultAccount.totalBalance = accountBalance;
  vaultAccount.shares = vaultContract.balanceOf(accountAddress);
  vaultAccount.save();
}

export function createVaultAccount(
  vaultAddress: Address,
  accountAddress: Address
): VaultAccount {
  let vaultAccountID =
    vaultAddress.toHexString() + "-" + accountAddress.toHexString();
  let vaultAccount = VaultAccount.load(vaultAccountID);

  if (vaultAccount == null) {
    let vault = Vault.load(vaultAddress.toHexString());
    let depositors = vault.depositors;
    depositors.push(accountAddress);
    vault.depositors = depositors;

    vault.numDepositors = vault.numDepositors + 1;
    vault.save();

    vaultAccount = new VaultAccount(vaultAccountID);
    vaultAccount.vault = vaultAddress.toHexString();
    vaultAccount.account = accountAddress;
    vaultAccount.shares = BigInt.fromI32(0);
    vaultAccount.totalDeposits = BigInt.fromI32(0);
    vaultAccount.totalBalance = BigInt.fromI32(0);
    vaultAccount.totalYieldEarned = BigInt.fromI32(0);
    vaultAccount.updateCounter = 0;
    vaultAccount.save();
  }
  return vaultAccount as VaultAccount;
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
