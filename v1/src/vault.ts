import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  OpenShort,
  CloseShort,
  Deposit,
  Withdraw,
  Transfer,
  CapSet,
  Migrate
} from "../generated/RibbonOptionsVault/RibbonOptionsVault";
import {
  Vault,
  VaultShortPosition,
  VaultOptionTrade,
  VaultTransaction,
  VaultPerformanceUpdate
} from "../generated/schema";
import { RibbonOptionsVault } from "../generated/RibbonOptionsVault/RibbonOptionsVault";
import { Otoken } from "../generated/RibbonOptionsVault/Otoken";
import { Swap } from "../generated/Airswap/Airswap";

import {
  createVaultAccount,
  refreshAllAccountBalances,
  triggerBalanceUpdate
} from "./accounts";
import { isMiningPool } from "./data/constant";
import { getOtokenMintAmount } from "./utils";
import { updateVaultPerformance } from "./vaultPerformance";

export function handleOpenShort(event: OpenShort): void {
  let optionAddress = event.params.options;

  let shortPosition = new VaultShortPosition(optionAddress.toHexString());

  let otoken = Otoken.bind(optionAddress);
  shortPosition.expiry = otoken.expiryTimestamp();
  let strikePrice = otoken.strikePrice();
  let isPut = otoken.isPut();
  shortPosition.strikePrice = strikePrice;

  let collateral = Otoken.bind(otoken.collateralAsset());
  let collateralDecimals = collateral.decimals() as u8;

  let vaultAddress = event.address.toHexString();

  // Update short position
  shortPosition.vault = vaultAddress;
  shortPosition.option = optionAddress;
  shortPosition.depositAmount = event.params.depositAmount;
  shortPosition.mintAmount = getOtokenMintAmount(
    event.params.depositAmount,
    strikePrice,
    collateralDecimals,
    isPut
  );
  shortPosition.initiatedBy = event.params.manager;
  shortPosition.openedAt = event.block.timestamp;
  shortPosition.premiumEarned = BigInt.fromI32(0);
  shortPosition.openTxhash = event.transaction.hash;
  shortPosition.save();

  // Update total notional volume of vault
  let vault = Vault.load(vaultAddress);
  if (vault == null) {
    vault = newVault(vaultAddress, event.block.timestamp.toI32());
  }
  vault.totalNotionalVolume += (shortPosition.strikePrice * shortPosition.mintAmount)
  vault.save()
}

function newVault(vaultAddress: string, creationTimestamp: i32): Vault {
  let vault = new Vault(vaultAddress);
  let optionsVaultContract = RibbonOptionsVault.bind(
    Address.fromString(vaultAddress)
  );
  let underlyingAddress = optionsVaultContract.asset();
  let otoken = Otoken.bind(underlyingAddress);

  vault.name = optionsVaultContract.name();
  vault.symbol = optionsVaultContract.symbol();
  vault.numDepositors = 0;
  vault.depositors = [];
  vault.totalPremiumEarned = BigInt.fromI32(0);
  vault.totalWithdrawalFee = BigInt.fromI32(0);
  vault.totalNominalVolume = BigInt.fromI32(0);
  vault.totalNotionalVolume = BigInt.fromI32(0);
  vault.cap = optionsVaultContract.cap();
  vault.totalBalance = optionsVaultContract.totalBalance();
  vault.lockedAmount = optionsVaultContract.lockedAmount();
  vault.underlyingAsset = underlyingAddress;
  vault.underlyingName = otoken.name();
  vault.underlyingSymbol = otoken.symbol();
  vault.underlyingDecimals = otoken.decimals();
  vault.performanceUpdateCounter = 0;

  let performanceUpdate = new VaultPerformanceUpdate(vaultAddress + "-0");
  performanceUpdate.vault = vault.id;
  performanceUpdate.pricePerShare = BigInt.fromI32(10).pow(
    u8(vault.underlyingDecimals)
  );
  performanceUpdate.timestamp = creationTimestamp;
  performanceUpdate.save();

  return vault;
}

export function handleCloseShort(event: CloseShort): void {
  let vaultAddress = event.address;
  let shortPosition = VaultShortPosition.load(
    event.params.options.toHexString()
  );
  if (shortPosition != null) {
    updateVaultPerformance(
      vaultAddress.toHexString(),
      event.block.timestamp.toI32()
    );

    let loss = shortPosition.depositAmount - event.params.withdrawAmount;
    shortPosition.loss = loss;
    shortPosition.withdrawAmount = event.params.withdrawAmount;
    shortPosition.isExercised = loss > BigInt.fromI32(0);
    shortPosition.closedAt = event.block.timestamp;
    shortPosition.closeTxhash = event.transaction.hash;
    shortPosition.save();

    refreshAllAccountBalances(vaultAddress, event.block.timestamp.toI32());
  }
}

export function handleSwap(event: Swap): void {
  let optionToken = event.params.senderToken;
  let vaultAddress = event.params.senderWallet;

  let shortPosition = VaultShortPosition.load(optionToken.toHexString());
  let vault = Vault.load(vaultAddress.toHexString());

  if (shortPosition == null) {
    return;
  }
  if (vault == null) {
    return;
  }

  updateVaultPerformance(
    vaultAddress.toHexString(),
    event.block.timestamp.toI32()
  );

  let swapID =
    optionToken.toHexString() +
    "-" +
    event.transaction.hash.toHexString() +
    "-" +
    event.transactionLogIndex.toString();
  let premium = event.params.signerAmount;

  let optionTrade = new VaultOptionTrade(swapID);
  optionTrade.vault = vaultAddress.toHexString();
  optionTrade.buyer = event.params.signerWallet;
  optionTrade.sellAmount = event.params.senderAmount;
  optionTrade.premium = event.params.signerAmount;
  optionTrade.optionToken = event.params.senderToken;
  optionTrade.premiumToken = event.params.signerToken;
  optionTrade.vaultShortPosition = optionToken.toHexString();
  optionTrade.timestamp = event.block.timestamp;
  optionTrade.txhash = event.transaction.hash;
  optionTrade.save();

  shortPosition.premiumEarned = shortPosition.premiumEarned.plus(premium);
  shortPosition.save();

  vault.totalPremiumEarned = vault.totalPremiumEarned.plus(premium);
  vault.save();

  refreshAllAccountBalances(vaultAddress, event.block.timestamp.toI32());
}

export function handleDeposit(event: Deposit): void {
  let vaultAddress = event.address.toHexString();
  let vault = Vault.load(vaultAddress);

  if (vault == null) {
    vault = newVault(vaultAddress, event.block.timestamp.toI32());
    vault.save();
  }

  vault.totalNominalVolume = vault.totalNominalVolume + event.params.amount;
  vault.save();

  let vaultAccount = createVaultAccount(event.address, event.params.account);
  vaultAccount.totalDeposits = vaultAccount.totalDeposits + event.params.amount;
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
    event.params.account,
    event.transaction.hash,
    event.block.timestamp,
    event.params.amount,
    event.params.amount,
    BigInt.fromI32(0) // zero fees on deposit
  );

  triggerBalanceUpdate(
    event.address,
    event.params.account,
    event.block.timestamp.toI32(),
    false,
    false
  );
}

export function handleWithdraw(event: Withdraw): void {
  let vaultAddress = event.address.toHexString();
  let vault = Vault.load(vaultAddress);

  if (vault == null) {
    vault = newVault(vaultAddress, event.block.timestamp.toI32());
    vault.save();
  }

  vault.totalWithdrawalFee = vault.totalWithdrawalFee + event.params.fee;
  vault.save();

  let vaultAccount = createVaultAccount(event.address, event.params.account);
  vaultAccount.totalDeposits =
    vaultAccount.totalDeposits - event.params.amount - event.params.fee;
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
    event.params.account,
    event.transaction.hash,
    event.block.timestamp,
    event.params.amount,
    event.params.amount,
    event.params.fee
  );

  triggerBalanceUpdate(
    event.address,
    event.params.account,
    event.block.timestamp.toI32(),
    false,
    true
  );
}

/**
 * We have two types of transfer
 *
 * Liquidity Mining
 * In liquidity mining, we keep track of the amount as shares, and underlying as actual underlying amount
 *
 * Normal transfer
 * We will store both underlying and amount as asset amount. In this case, the user transfer "underlying" instead of shares.
 */
export function handleTransfer(event: Transfer): void {
  // Just skip if it's a new deposit or withdrawal
  if (
    event.params.from.toHexString() ==
      "0x0000000000000000000000000000000000000000" ||
    event.params.to.toHexString() ==
      "0x0000000000000000000000000000000000000000"
  ) {
    return;
  }

  let type = "transfer";

  if (isMiningPool(event.params.to)) {
    type = "stake";
  } else if (isMiningPool(event.params.from)) {
    type = "unstake";
  }

  let vaultAddress = event.address.toHexString();
  let txid =
    vaultAddress +
    "-" +
    event.transaction.hash.toHexString() +
    "-" +
    event.transactionLogIndex.toString();

  /**
   * Calculate underlying amount
   * Staking: To be able to calculate USD value that had been staked
   * Transfer: Transfer are always in the unit of underlying
   */
  let vaultContract = RibbonOptionsVault.bind(event.address);
  let underlyingAmount =
    (event.params.value * vaultContract.totalBalance()) /
    vaultContract.totalSupply();

  /**
   * Record sender deposit/withdraw amount
   */
  let senderVaultAccount = createVaultAccount(event.address, event.params.from);
  switch (type as u32) {
    case "stake" as u32:
      senderVaultAccount.totalStakedShares =
        senderVaultAccount.totalStakedShares + event.params.value;
      break;
    default:
      senderVaultAccount.totalDeposits =
        senderVaultAccount.totalDeposits - underlyingAmount;
  }
  senderVaultAccount.save();

  newTransaction(
    txid + "-T", // Indicate transfer
    type == "stake" ? "stake" : "transfer",
    vaultAddress,
    event.params.from,
    event.transaction.hash,
    event.block.timestamp,
    type == "stake" ? event.params.value : underlyingAmount,
    underlyingAmount,
    BigInt.fromI32(0) // zero fees on transfer
  );

  /**
   * Record receiver deposit/withdraw amount
   */
  let receiverVaultAccount = createVaultAccount(event.address, event.params.to);
  switch (type as u32) {
    case "unstake" as u32:
      receiverVaultAccount.totalStakedShares =
        receiverVaultAccount.totalStakedShares - event.params.value;
      break;
    default:
      receiverVaultAccount.totalDeposits =
        receiverVaultAccount.totalDeposits + underlyingAmount;
  }
  receiverVaultAccount.save();

  newTransaction(
    txid + "-R", // Indicate receive
    type == "unstake" ? "unstake" : "receive",
    vaultAddress,
    event.params.to,
    event.transaction.hash,
    event.block.timestamp,
    type == "unstake" ? event.params.value : underlyingAmount,
    underlyingAmount,
    BigInt.fromI32(0) // zero fees on transfer
  );

  triggerBalanceUpdate(
    event.address,
    event.params.from,
    event.block.timestamp.toI32(),
    false,
    true
  );
  triggerBalanceUpdate(
    event.address,
    event.params.to,
    event.block.timestamp.toI32(),
    false,
    false
  );
}

/**
 *
 * @param event In migrate, we treat it as transfer/withdraw
 * @returns
 */
export function handleMigrate(event: Migrate): void {
  let vaultAddress = event.address.toHexString();
  let txid =
    vaultAddress +
    "-" +
    event.transaction.hash.toHexString() +
    "-" +
    event.transactionLogIndex.toString();

  let migrateAmount = event.params.amount;

  /**
   * Record sender deposit/withdraw amount
   */
  let senderVaultAccount = createVaultAccount(
    event.address,
    event.params.account
  );
  senderVaultAccount.totalDeposits =
    senderVaultAccount.totalDeposits - migrateAmount;
  senderVaultAccount.save();

  newTransaction(
    txid + "-T", // Indicate transfer
    "migrate",
    vaultAddress,
    event.params.account,
    event.transaction.hash,
    event.block.timestamp,
    migrateAmount,
    migrateAmount,
    BigInt.fromI32(0) // zero fees on transfer
  );

  triggerBalanceUpdate(
    event.address,
    event.params.account,
    event.block.timestamp.toI32(),
    false,
    true
  );
}

function newTransaction(
  txid: string,
  type: string,
  vaultAddress: string,
  account: Address,
  txhash: Bytes,
  timestamp: BigInt,
  amount: BigInt,
  underlyingAmount: BigInt,
  fee: BigInt
): void {
  let transaction = new VaultTransaction(txid);
  transaction.type = type;
  transaction.vault = vaultAddress;
  transaction.address = account;
  transaction.txhash = txhash;
  transaction.timestamp = timestamp;
  transaction.amount = amount;
  transaction.underlyingAmount = underlyingAmount || amount;
  transaction.fee = fee;
  transaction.save();
}

export function handleCapSet(event: CapSet): void {
  let vault = Vault.load(event.address.toHexString());
  if (vault != null) {
    vault.cap = event.params.newCap;
    vault.save();
  }
}
