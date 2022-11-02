import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  Borrowed,
  Provided,
  Provided1,
  Redeemed,
  Repaid,
  RibbonLendPool
} from "../generated/templates/RibbonLendPool/RibbonLendPool";

import {
  createPoolAccount,
  refreshAllAccountBalances,
  triggerBalanceUpdate
} from "./accounts";

import {
  Pool,
  PoolTransaction,
  PoolBorrow,
  PoolRepay
} from "../generated/schema";

function newPool(poolAddress: string, creationTimestamp: i32): Pool {
  let pool = new Pool(poolAddress);
  let poolContract = RibbonLendPool.bind(Address.fromString(poolAddress));

  pool.name = poolContract.name();
  pool.symbol = poolContract.symbol();
  pool.numDepositors = 0;
  pool.depositors = [];
  pool.decimals = poolContract.decimals();
  pool.totalPremiumEarned = BigInt.fromI32(0);
  pool.totalNominalVolume = BigInt.fromI32(0);
  pool.totalNotionalVolume = BigInt.fromI32(0);
  pool.totalBalance = poolContract.poolSize();
  pool.performanceFeeCollected = BigInt.fromI32(0);
  pool.managementFeeCollected = BigInt.fromI32(0);
  pool.totalFeeCollected = BigInt.fromI32(0);

  return pool;
}

export function newTransaction(
  txid: string,
  type: string,
  poolAddress: string,
  account: Address,
  txhash: Bytes,
  timestamp: i32,
  amount: BigInt,
  underlyingAmount: BigInt
): void {
  let transaction = new PoolTransaction(txid);
  transaction.type = type;
  transaction.pool = poolAddress;
  transaction.address = account;
  transaction.txhash = txhash;
  transaction.timestamp = timestamp;
  transaction.amount = amount;
  transaction.underlyingAmount = underlyingAmount || amount;
  transaction.save();
}

export function handleBorrowed(event: Borrowed): void {
  let poolAddress = event.address.toHexString();
  let pool = Pool.load(event.address.toHexString());
  let borrowTransaction = new PoolBorrow(
    event.address.toHexString() + "-" + event.transaction.hash.toHexString()
  );
  borrowTransaction.pool = event.address.toHexString();
  borrowTransaction.borrowAmount = event.params.amount;
  borrowTransaction.borrower = event.params.receiver;
  borrowTransaction.borrowedAt = event.block.timestamp.toI32();
  borrowTransaction.borrowTxhash = event.transaction.hash;
  borrowTransaction.save();

  pool.totalNotionalVolume =
    pool.totalNotionalVolume + borrowTransaction.borrowAmount;
  pool.save();

  // /**
  //  * Refresh all account balances to turn their balance locked
  //  */
  refreshAllAccountBalances(
    Address.fromString(poolAddress),
    event.block.timestamp.toI32()
  );
}

export function handleProvided(event: Provided): void {
  let poolAddress = event.address.toHexString();
  let pool = Pool.load(poolAddress);

  if (pool == null) {
    pool = newPool(poolAddress, event.block.timestamp.toI32());
    pool.save();
  }

  pool.totalNominalVolume =
    pool.totalNominalVolume + event.params.currencyAmount;
  pool.save();

  let poolAccount = createPoolAccount(event.address, event.params.provider);
  poolAccount.totalDeposits =
    poolAccount.totalDeposits + event.params.currencyAmount;
  poolAccount.save();

  let txid =
    poolAddress +
    "-" +
    event.transaction.hash.toHexString() +
    "-" +
    event.transactionLogIndex.toString();

  newTransaction(
    txid,
    "deposit",
    poolAddress,
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

export function handleProvided1(event: Provided1): void {
  let poolAddress = event.address.toHexString();
  let pool = Pool.load(poolAddress);

  if (pool == null) {
    pool = newPool(poolAddress, event.block.timestamp.toI32());
    pool.save();
  }

  pool.totalNominalVolume =
    pool.totalNominalVolume + event.params.currencyAmount;
  pool.save();

  let poolAccount = createPoolAccount(event.address, event.params.provider);
  poolAccount.totalDeposits =
    poolAccount.totalDeposits + event.params.currencyAmount;
  poolAccount.save();

  let txid =
    poolAddress +
    "-" +
    event.transaction.hash.toHexString() +
    "-" +
    event.transactionLogIndex.toString();

  newTransaction(
    txid,
    "deposit",
    poolAddress,
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
  let poolAddress = event.address.toHexString();
  let pool = Pool.load(poolAddress);

  if (pool == null) {
    pool = newPool(poolAddress, event.block.timestamp.toI32());
    pool.save();
  }

  let poolAccount = createPoolAccount(event.address, event.params.redeemer);
  poolAccount.totalDeposits =
    poolAccount.totalDeposits - event.params.currencyAmount;
  poolAccount.save();

  let txid =
    poolAddress +
    "-" +
    event.transaction.hash.toHexString() +
    "-" +
    event.transactionLogIndex.toString();

  newTransaction(
    txid,
    "withdraw",
    poolAddress,
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
  let poolAddress = event.address.toHexString();
  let repayTransaction = new PoolRepay(
    event.address.toHexString() + "-" + event.transaction.hash.toHexString()
  );

  repayTransaction.pool = event.address.toHexString();
  repayTransaction.repaidAmount = event.params.amount;
  repayTransaction.repaidAt = event.block.timestamp.toI32();
  repayTransaction.repayTxhash = event.transaction.hash;
  repayTransaction.save();

  refreshAllAccountBalances(
    Address.fromString(poolAddress),
    event.block.timestamp.toI32()
  );
}
