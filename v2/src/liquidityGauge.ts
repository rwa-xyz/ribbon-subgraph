import { Address } from "@graphprotocol/graph-ts";
import { RibbonThetaVault } from "../generated/RibbonETHCoveredCall/RibbonThetaVault";
import {
  Deposit,
  Transfer,
  Withdraw
} from "../generated/RibbonWBTCCoveredCallLiquidityGauge/LiquidityGaugeV5";
import { createVaultAccount, triggerBalanceUpdate } from "./accounts";
import { searchLiquidityGaugePoolsVaultAddress } from "./data/constant";
import { newTransaction } from "./vault";
import { sharesToAssets, getPricePerShare } from "./utils";
import { Vault } from "../generated/schema";

export function handleStake(event: Deposit): void {
  let vaultAddress = searchLiquidityGaugePoolsVaultAddress(event.address);

  let txid =
    vaultAddress.toHexString() +
    "-" +
    event.transaction.hash.toHexString() +
    "-" +
    event.transactionLogIndex.toString();

  let vault = Vault.load(vaultAddress.toHexString());
  let vaultContract = RibbonThetaVault.bind(vaultAddress);
  let underlyingAmount = sharesToAssets(
    event.params.value,
    getPricePerShare(vaultContract, vault.underlyingDecimals),
    vault.underlyingDecimals
  );

  let vaultAccount = createVaultAccount(vaultAddress, event.transaction.from);

  vaultAccount.totalStakedShares = vaultAccount.totalStakedShares.plus(
    event.params.value
  );
  vaultAccount.save();

  newTransaction(
    txid,
    "stake",
    vaultAddress.toHexString(),
    event.transaction.from,
    event.transaction.hash,
    event.block.timestamp,
    event.params.value,
    underlyingAmount
  );

  triggerBalanceUpdate(
    vaultAddress,
    event.transaction.from,
    event.block.timestamp.toI32(),
    false,
    true
  );
}

export function handleUnstake(event: Withdraw): void {
  let vaultAddress = searchLiquidityGaugePoolsVaultAddress(event.address);

  let txid =
    vaultAddress.toHexString() +
    "-" +
    event.transaction.hash.toHexString() +
    "-" +
    event.transactionLogIndex.toString();

  let vault = Vault.load(vaultAddress.toHexString());
  let vaultContract = RibbonThetaVault.bind(vaultAddress);
  let underlyingAmount = sharesToAssets(
    event.params.value,
    getPricePerShare(vaultContract, vault.underlyingDecimals),
    vault.underlyingDecimals
  );

  let vaultAccount = createVaultAccount(vaultAddress, event.transaction.from);

  vaultAccount.totalStakedShares = vaultAccount.totalStakedShares.minus(
    event.params.value
  );
  vaultAccount.save();

  newTransaction(
    txid,
    "unstake",
    vaultAddress.toHexString(),
    event.transaction.from,
    event.transaction.hash,
    event.block.timestamp,
    event.params.value,
    underlyingAmount
  );

  triggerBalanceUpdate(
    vaultAddress,
    event.transaction.from,
    event.block.timestamp.toI32(),
    false,
    true
  );
}

export function handleTransfer(event: Transfer): void {
  // Ignore if the transfer event came from stake/unstake
  if (
    event.params._from.toHexString() ==
      "0x0000000000000000000000000000000000000000" ||
    event.params._to.toHexString() ==
      "0x0000000000000000000000000000000000000000" ||
    event.params._from.toHexString() == event.address.toHexString() ||
    event.params._to.toHexString() == event.address.toHexString()
  ) {
    return;
  }

  let vaultAddress = searchLiquidityGaugePoolsVaultAddress(event.address);

  let txid =
    vaultAddress.toHexString() +
    "-" +
    event.transaction.hash.toHexString() +
    "-" +
    event.transactionLogIndex.toString();

  let vault = Vault.load(vaultAddress.toHexString());
  let vaultContract = RibbonThetaVault.bind(vaultAddress);
  let underlyingAmount = sharesToAssets(
    event.params._value,
    getPricePerShare(vaultContract, vault.underlyingDecimals),
    vault.underlyingDecimals
  );

  // TODO: TBD on how should we finalize handling transfer of gToken
  // For now, we treat the person who transfer as unstake
  let fromVaultAccount = createVaultAccount(vaultAddress, event.params._from);

  fromVaultAccount.totalStakedShares = fromVaultAccount.totalStakedShares.minus(
    event.params._value
  );
  fromVaultAccount.save();

  newTransaction(
    txid + "-T",
    "unstake",
    vaultAddress.toHexString(),
    event.params._from,
    event.transaction.hash,
    event.block.timestamp,
    event.params._value,
    underlyingAmount
  );

  triggerBalanceUpdate(
    vaultAddress,
    event.params._from,
    event.block.timestamp.toI32(),
    false,
    true
  );

  // TODO: TBD on how should we finalize handling receive of gToken
  // For now, we treat the person who receive as stake
  let toVaultAccount = createVaultAccount(vaultAddress, event.params._to);

  toVaultAccount.totalStakedShares = toVaultAccount.totalStakedShares.plus(
    event.params._value
  );
  toVaultAccount.save();

  newTransaction(
    txid + "-R",
    "stake",
    vaultAddress.toHexString(),
    event.params._to,
    event.transaction.hash,
    event.block.timestamp,
    event.params._value,
    underlyingAmount
  );

  triggerBalanceUpdate(
    vaultAddress,
    event.params._to,
    event.block.timestamp.toI32(),
    false,
    true
  );
}
