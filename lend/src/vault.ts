import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  Borrowed,
  Provided,
  Redeemed,
  Repaid,
  RibbonLendVault
} from "../generated/RibbonLendVault/RibbonLendVault";

import {
  createVaultAccount,
  refreshAllAccountBalances,
  triggerBalanceUpdate
} from "./accounts";

import {
  Vault,
  VaultTransaction,
  VaultBorrow,
  VaultRepay
} from "../generated/schema";

function newVault(vaultAddress: string, creationTimestamp: i32): Vault {
  let vault = new Vault(vaultAddress);
  let vaultContract = RibbonLendVault.bind(Address.fromString(vaultAddress));

  vault.name = vaultContract.name();
  vault.symbol = vaultContract.symbol();
  vault.numDepositors = 0;
  vault.depositors = [];
  vault.decimals = vaultContract.decimals();
  vault.totalPremiumEarned = BigInt.fromI32(0);
  vault.totalNominalVolume = BigInt.fromI32(0);
  vault.totalNotionalVolume = BigInt.fromI32(0);
  vault.totalBalance = vaultContract.poolSize();
  vault.performanceFeeCollected = BigInt.fromI32(0);
  vault.managementFeeCollected = BigInt.fromI32(0);
  vault.totalFeeCollected = BigInt.fromI32(0);

  return vault;
}

export function newTransaction(
  txid: string,
  type: string,
  vaultAddress: string,
  account: Address,
  txhash: Bytes,
  timestamp: i32,
  amount: BigInt,
  underlyingAmount: BigInt
): void {
  let transaction = new VaultTransaction(txid);
  transaction.type = type;
  transaction.vault = vaultAddress;
  transaction.address = account;
  transaction.txhash = txhash;
  transaction.timestamp = timestamp;
  transaction.amount = amount;
  transaction.underlyingAmount = underlyingAmount || amount;
  transaction.save();
}

export function handleBorrowed(event: Borrowed): void {
  let vaultAddress = event.address.toHexString();
  let vault = Vault.load(event.address.toHexString());
  let borrowTransaction = new VaultBorrow(
    event.address.toHexString() + "-" + event.transaction.hash.toHexString()
  );
  borrowTransaction.vault = event.address.toHexString();
  borrowTransaction.borrowAmount = event.params.amount;
  borrowTransaction.borrower = event.params.receiver;
  borrowTransaction.borrowedAt = event.block.timestamp.toI32();
  borrowTransaction.borrowTxhash = event.transaction.hash;
  borrowTransaction.save();

  vault.totalNotionalVolume =
    vault.totalNotionalVolume + borrowTransaction.borrowAmount;
  vault.save();

  // /**
  //  * Refresh all account balances to turn their balance locked
  //  */
  refreshAllAccountBalances(
    Address.fromString(vaultAddress),
    event.block.timestamp.toI32()
  );
}

export function handleProvided(event: Provided): void {
  let vaultAddress = event.address.toHexString();
  let vault = Vault.load(vaultAddress);

  if (vault == null) {
    vault = newVault(vaultAddress, event.block.timestamp.toI32());
    vault.save();
  }

  vault.totalNominalVolume =
    vault.totalNominalVolume + event.params.currencyAmount;
  vault.save();

  let vaultAccount = createVaultAccount(event.address, event.params.provider);
  vaultAccount.totalDeposits =
    vaultAccount.totalDeposits + event.params.currencyAmount;
  vaultAccount.save();

  let txid =
    vaultAddress +
    "-" +
    event.transaction.hash.toHexString() +
    "-" +
    event.transactionLogIndex.toString();

  newTransaction(
    txid,
    "deposit",
    vaultAddress,
    event.params.provider,
    event.transaction.hash,
    event.block.timestamp.toI32(),
    event.params.currencyAmount,
    event.params.currencyAmount
  );

  triggerBalanceUpdate(
    event.address,
    event.params.provider,
    event.block.timestamp.toI32(),
    false,
    false
  );
}

export function handleRedeemed(event: Redeemed): void {
  let vaultAddress = event.address.toHexString();
  let vault = Vault.load(vaultAddress);

  if (vault == null) {
    vault = newVault(vaultAddress, event.block.timestamp.toI32());
    vault.save();
  }

  let vaultAccount = createVaultAccount(event.address, event.params.redeemer);
  vaultAccount.totalDeposits =
    vaultAccount.totalDeposits - event.params.currencyAmount;
  vaultAccount.save();

  let txid =
    vaultAddress +
    "-" +
    event.transaction.hash.toHexString() +
    "-" +
    event.transactionLogIndex.toString();

  newTransaction(
    txid,
    "withdraw",
    vaultAddress,
    event.params.redeemer,
    event.transaction.hash,
    event.block.timestamp.toI32(),
    event.params.currencyAmount,
    event.params.currencyAmount
  );

  triggerBalanceUpdate(
    event.address,
    event.params.redeemer,
    event.block.timestamp.toI32(),
    false,
    true
  );
}

export function handleRepaid(event: Repaid): void {
  let vaultAddress = event.address.toHexString();
  let repayTransaction = new VaultRepay(
    event.address.toHexString() + "-" + event.transaction.hash.toHexString()
  );

  repayTransaction.vault = event.address.toHexString();
  repayTransaction.repaidAmount = event.params.amount;
  repayTransaction.repaidAt = event.block.timestamp.toI32();
  repayTransaction.repayTxhash = event.transaction.hash;
  repayTransaction.save();

  refreshAllAccountBalances(
    Address.fromString(vaultAddress),
    event.block.timestamp.toI32()
  );
}
