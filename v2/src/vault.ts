import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import {
  OpenShort,
  CloseShort,
  Deposit,
  Withdraw,
  Transfer,
  InitiateGnosisAuction,
  InitiateWithdraw,
  InstantWithdraw,
  CollectVaultFees
} from "../generated/RibbonETHCoveredCall/RibbonThetaVaultWithSwap";
import {
  Pause,
  Resume
} from "../generated/RibbonVaultPauser/RibbonVaultPauser";
import { DistributePremium } from "../generated/RibbonTreasuryVaultPERP/RibbonTreasuryVault";
import {
  Vault,
  VaultShortPosition,
  GnosisAuction,
  VaultOptionTrade,
  VaultTransaction,
  SwapOffer
} from "../generated/schema";
import { RibbonThetaVaultWithSwap as RibbonThetaVault } from "../generated/RibbonETHCoveredCall/RibbonThetaVaultWithSwap";
import { OptionsPremiumPricer } from "../generated/RibbonETHCoveredCall/OptionsPremiumPricer";
import { Otoken } from "../generated/RibbonETHCoveredCall/Otoken";
import { AuctionCleared } from "../generated/GnosisAuction/GnosisAuction";
import {
  NewOffer,
  SettleOffer,
  Swap
} from "../generated/RibbonSwap/SwapContract";

import {
  createVaultAccount,
  refreshAllAccountBalances,
  triggerBalanceUpdate
} from "./accounts";
import {
  getOrCreateVault,
  newVault,
  getOtokenMintAmount,
  getPricePerShare,
  sharesToAssets
} from "./utils";
import {
  finalizePrevRoundVaultPerformance,
  updateVaultPerformance
} from "./vaultPerformance";
import { blockNumberOfUpgradedCloseRound, ignoreTransfer } from "./data/constant";


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
  shortPosition.openTxhash = event.transaction.hash;
  shortPosition.save();

  let vault = getOrCreateVault(vaultAddress, event.block.timestamp.toI32());

  // Only increment vault if NO upgraded block, or if block is less than upgraded block
  let upgradedBlock = blockNumberOfUpgradedCloseRound(event.address)
  if (upgradedBlock == 0 || event.block.number.toI32() < upgradedBlock) {
    vault.round = vault.round + 1;
  }

  // We first need to get the underlying price of the asset
  let vaultContract = RibbonThetaVault.bind(event.address);
  let pricerAddress = vaultContract.optionsPremiumPricer();
  let pricerContract = OptionsPremiumPricer.bind(pricerAddress);
  vault.totalNotionalVolume +=
    shortPosition.mintAmount * pricerContract.getUnderlyingPrice();
  vault.save();

  /**
   * We finalize last round pricePerShare here
   */
  finalizePrevRoundVaultPerformance(
    vaultAddress,
    event.block.timestamp.toI32()
  );

  /**
   * Refresh all account balances to turn their balance locked
   */
  refreshAllAccountBalances(
    Address.fromString(vaultAddress),
    event.block.timestamp.toI32()
  );
}

export function handleCloseShort(event: CloseShort): void {
  let vaultAddress = event.address.toHexString();

  // Only increment vault round if more than upgraded block
  let upgradedBlock = blockNumberOfUpgradedCloseRound(event.address)
  if (upgradedBlock != 0 && event.block.number.toI32() >= upgradedBlock) {
    let vault = getOrCreateVault(vaultAddress, event.block.timestamp.toI32());
    vault.round = vault.round + 1;
    vault.save();
  }

  let shortPosition = VaultShortPosition.load(
    event.params.options.toHexString()
  );
  let timestamp = event.block.timestamp.toI32();
  if (shortPosition != null) {
    getOrCreateVault(vaultAddress, timestamp);

    updateVaultPerformance(vaultAddress, timestamp);

    let loss = shortPosition.depositAmount - event.params.withdrawAmount;
    shortPosition.loss = loss;
    shortPosition.withdrawAmount = event.params.withdrawAmount;
    shortPosition.isExercised = loss > BigInt.fromI32(0);
    shortPosition.closedAt = event.block.timestamp;
    shortPosition.closeTxhash = event.transaction.hash;
    shortPosition.save();

    // Only refresh balances if theres a loss
    if (shortPosition.isExercised) {
      refreshAllAccountBalances(
        Address.fromString(vaultAddress),
        event.block.timestamp.toI32()
      );
    }
  }
}

// // Used for mapping of AuctionCleared to RibbonVault
export function handleInitiateGnosisAuction(
  event: InitiateGnosisAuction
): void {
  let auctionID = event.params.auctionCounter;
  let optionToken = event.params.auctioningToken;

  let auction = new GnosisAuction(auctionID.toHexString());
  auction.optionToken = optionToken;
  auction.save();
}

export function handleAuctionCleared(event: AuctionCleared): void {
  let auctionID = event.params.auctionId;
  let auction = GnosisAuction.load(auctionID.toHexString());
  if (auction == null) {
    return;
  }

  let optionToken = auction.optionToken;
  let shortPosition = VaultShortPosition.load(optionToken.toHexString());
  if (shortPosition == null) {
    return;
  }

  let vault = Vault.load(shortPosition.vault);
  if (vault == null) {
    return;
  }

  let tradeID =
    optionToken.toHexString() +
    "-" +
    event.transaction.hash.toHexString() +
    "-" +
    event.transactionLogIndex.toString();

  let optionsSold = event.params.soldAuctioningTokens;
  let totalPremium = event.params.soldBiddingTokens;

  // If there are no premiums exchanging hands,
  // This means that the auction is settled without any bids
  // This is rare, but has happened before.
  if (totalPremium == BigInt.fromI32(0)) {
    return;
  }

  updateVaultPerformance(shortPosition.vault, event.block.timestamp.toI32());

  let optionTrade = new VaultOptionTrade(tradeID);
  optionTrade.vault = shortPosition.vault;

  optionTrade.sellAmount = optionsSold;
  optionTrade.premium = totalPremium;

  optionTrade.vaultShortPosition = optionToken.toHexString();
  optionTrade.timestamp = event.block.timestamp;
  optionTrade.txhash = event.transaction.hash;
  optionTrade.save();

  if (shortPosition.premiumEarned === null) {
    shortPosition.premiumEarned = totalPremium;
  } else {
    shortPosition.premiumEarned += totalPremium;
  }
  shortPosition.save();

  vault.totalPremiumEarned = vault.totalPremiumEarned.plus(totalPremium);
  vault.save();

  refreshAllAccountBalances(
    Address.fromString(shortPosition.vault),
    event.block.timestamp.toI32()
  );
}

export function handleNewOffer(event: NewOffer): void {
  let auctionID = event.params.swapId;
  let optionToken = event.params.oToken;

  let auction = new SwapOffer(auctionID.toHexString());

  auction.optionToken = optionToken;
  auction.oTokensSold = BigInt.fromI32(0);
  auction.totalPremium = BigInt.fromI32(0);

  auction.save();
}

export function handleSwap(event: Swap): void {
  let swap = SwapOffer.load(event.params.swapId.toHexString());

  if (swap == null) {
    return;
  }

  swap.oTokensSold += event.params.sellerAmount;
  swap.totalPremium += event.params.signerAmount;
  swap.save();
}

export function handleSettleOffer(event: SettleOffer): void {
  let auctionID = event.params.swapId;
  let auction = SwapOffer.load(auctionID.toHexString());
  if (auction == null) {
    return;
  }

  let optionToken = auction.optionToken;
  let shortPosition = VaultShortPosition.load(optionToken.toHexString());
  if (shortPosition == null) {
    return;
  }

  let vault = Vault.load(shortPosition.vault);
  if (vault == null) {
    return;
  }

  let tradeID =
    optionToken.toHexString() +
    "-" +
    event.transaction.hash.toHexString() +
    "-" +
    event.transactionLogIndex.toString();

  let optionsSold = auction.oTokensSold;
  let totalPremium = auction.totalPremium;

  // If there are no premiums exchanging hands,
  // This means that the auction is settled without any bids
  // This is rare, but has happened before.
  if (totalPremium == BigInt.fromI32(0)) {
    return;
  }

  updateVaultPerformance(shortPosition.vault, event.block.timestamp.toI32());

  let optionTrade = new VaultOptionTrade(tradeID);
  optionTrade.vault = shortPosition.vault;

  optionTrade.sellAmount = optionsSold;
  optionTrade.premium = totalPremium;

  optionTrade.vaultShortPosition = optionToken.toHexString();
  optionTrade.timestamp = event.block.timestamp;
  optionTrade.txhash = event.transaction.hash;
  optionTrade.save();

  if (shortPosition.premiumEarned === null) {
    shortPosition.premiumEarned = totalPremium;
  } else {
    shortPosition.premiumEarned += totalPremium;
  }

  shortPosition.save();

  vault.totalPremiumEarned = vault.totalPremiumEarned.plus(totalPremium);
  vault.save();

  refreshAllAccountBalances(
    Address.fromString(shortPosition.vault),
    event.block.timestamp.toI32()
  );
}

export function handleDeposit(event: Deposit): void {
  let vaultAddress = event.address.toHexString();

  // Dont handle any deposit into AVAX / sAVAX vaults if less than 0.001 AVAX
  if (
    (vaultAddress == "0x98d03125c62dae2328d9d3cb32b7b969e6a87787" ||
      vaultAddress == "0x6bf686d99a4ce17798c45d09c21181fac29a9fb3") &&
    event.params.amount <= BigInt.fromString("100000000000000000")
  ) {
    log.error("Ignoring deposit {}", [event.transaction.hash.toHexString()]);
    return;
  }

  let vault = Vault.load(vaultAddress);

  if (vault == null) {
    vault = newVault(vaultAddress, event.block.timestamp.toI32());
    vault.save();
  }

  vault.totalNominalVolume = vault.totalNominalVolume + event.params.amount;
  vault.save();

  let vaultAccount = createVaultAccount(event.address, event.params.account);
  vaultAccount.totalDeposits = vaultAccount.totalDeposits + event.params.amount;
  vaultAccount.depositInRound = vault.round;
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
    event.params.amount
  );

  triggerBalanceUpdate(
    event.address,
    event.params.account,
    event.block.timestamp.toI32(),
    false,
    false
  );
}

export function handleInitiateWithdraw(event: InitiateWithdraw): void {
  let vaultAddress = event.address.toHexString();
  let vault = getOrCreateVault(vaultAddress, event.block.timestamp.toI32());
  let vaultAccount = createVaultAccount(event.address, event.params.account);
  vaultAccount.save();

  let txid =
    vaultAddress +
    "-" +
    event.transaction.hash.toHexString() +
    "-" +
    event.transactionLogIndex.toString();

  let vaultContract = RibbonThetaVault.bind(event.address);

  let decimals = vault.underlyingDecimals;
  let assetAmount = sharesToAssets(
    event.params.shares,
    getPricePerShare(vaultContract, decimals),
    decimals
  );

  newTransaction(
    txid,
    "initiateWithdraw",
    vaultAddress,
    event.params.account,
    event.transaction.hash,
    event.block.timestamp,
    event.params.shares,
    assetAmount
  );

  triggerBalanceUpdate(
    event.address,
    event.params.account,
    event.block.timestamp.toI32(),
    false,
    true
  );
}

export function handleWithdraw(event: Withdraw): void {
  let vaultAddress = event.address.toHexString();
  let vault = Vault.load(vaultAddress);

  if (vault == null) {
    vault = newVault(vaultAddress, event.block.timestamp.toI32());
    vault.save();
  }

  let vaultAccount = createVaultAccount(event.address, event.params.account);
  vaultAccount.totalDeposits = vaultAccount.totalDeposits - event.params.amount;
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
    event.params.amount
  );

  triggerBalanceUpdate(
    event.address,
    event.params.account,
    event.block.timestamp.toI32(),
    false,
    true
  );
}

export function handleInstantWithdraw(event: InstantWithdraw): void {
  // The vault & vaultAccount must already exist before an instantwithdraw is triggered
  // This is because we create them on deposit
  let vaultAddress = event.address.toHexString();

  let txid =
    vaultAddress +
    "-" +
    event.transaction.hash.toHexString() +
    "-" +
    event.transactionLogIndex.toString();

  let vaultAccount = createVaultAccount(event.address, event.params.account);

  vaultAccount.totalDeposits = vaultAccount.totalDeposits - event.params.amount;
  vaultAccount.save();

  newTransaction(
    txid,
    "instantWithdraw",
    vaultAddress,
    event.params.account,
    event.transaction.hash,
    event.block.timestamp,
    event.params.amount,
    event.params.amount
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
  /**
   * We skip when the transfer is one of the following events
   * - Normal deposit
   * - Normal withdrawal
   * - Staking into Liquidity Guage
   * - Unstaking into Liquidity Gauge
   */
  if (ignoreTransfer(event)) {
    return;
  }

  let vaultAddress = event.address.toHexString();
  let vault = getOrCreateVault(vaultAddress, event.block.timestamp.toI32());
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
  let vaultContract = RibbonThetaVault.bind(event.address);

  let decimals = vault.underlyingDecimals;
  let underlyingAmount = sharesToAssets(
    event.params.value,
    getPricePerShare(vaultContract, decimals),
    decimals
  );

  /**
   * Record sender deposit/withdraw amount
   */
  let senderVaultAccount = createVaultAccount(event.address, event.params.from);
  senderVaultAccount.totalDeposits =
    senderVaultAccount.totalDeposits - underlyingAmount;
  senderVaultAccount.save();

  newTransaction(
    txid + "-T", // Indicate transfer
    "transfer",
    vaultAddress,
    event.params.from,
    event.transaction.hash,
    event.block.timestamp,
    underlyingAmount,
    underlyingAmount
  );

  /**
   * Record receiver deposit/withdraw amount
   */
  let receiverVaultAccount = createVaultAccount(event.address, event.params.to);
  receiverVaultAccount.totalDeposits =
    receiverVaultAccount.totalDeposits + underlyingAmount;
  receiverVaultAccount.save();

  newTransaction(
    txid + "-R", // Indicate receive
    "receive",
    vaultAddress,
    event.params.to,
    event.transaction.hash,
    event.block.timestamp,
    underlyingAmount,
    underlyingAmount
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

export function handlePause(event: Pause): void {
  let vaultAddress = event.params.vaultAddress.toHexString();
  let vault = getOrCreateVault(vaultAddress, event.block.timestamp.toI32());
  let txid =
    vaultAddress +
    "-" +
    event.transaction.hash.toHexString() +
    "-" +
    event.transactionLogIndex.toString();

  let vaultContract = RibbonThetaVault.bind(event.params.vaultAddress);

  let decimals = vault.underlyingDecimals;
  let underlyingAmount = sharesToAssets(
    event.params.share,
    getPricePerShare(vaultContract, decimals),
    decimals
  );

  newTransaction(
    txid,
    "pause",
    event.params.vaultAddress.toHexString(),
    event.params.account,
    event.transaction.hash,
    event.block.timestamp,
    underlyingAmount,
    underlyingAmount
  );

  triggerBalanceUpdate(
    event.params.vaultAddress,
    event.params.account,
    event.block.timestamp.toI32(),
    false,
    false
  );
}

export function handleResume(event: Resume): void {
  let vaultAddress = event.address.toHexString();
  let txid =
    vaultAddress +
    "-" +
    event.transaction.hash.toHexString() +
    "-" +
    event.transactionLogIndex.toString();

  let underlyingAmount = event.params.withdrawAmount;

  newTransaction(
    txid,
    "pause",
    event.params.vaultAddress.toHexString(),
    event.params.account,
    event.transaction.hash,
    event.block.timestamp,
    underlyingAmount,
    underlyingAmount
  );

  triggerBalanceUpdate(
    event.params.vaultAddress,
    event.params.account,
    event.block.timestamp.toI32(),
    false,
    false
  );
}

export function newTransaction(
  txid: string,
  type: string,
  vaultAddress: string,
  account: Address,
  txhash: Bytes,
  timestamp: BigInt,
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

export function handleCollectVaultFees(event: CollectVaultFees): void {
  let vaultAddress = event.address.toHexString();
  let vault = getOrCreateVault(vaultAddress, event.block.timestamp.toI32());

  let performanceFee = event.params.performanceFee;
  let totalFee = event.params.vaultFee;
  let managementFee = totalFee - performanceFee;

  vault.performanceFeeCollected =
    vault.performanceFeeCollected + performanceFee;
  vault.managementFeeCollected = vault.managementFeeCollected + managementFee;
  vault.totalFeeCollected = vault.totalFeeCollected + totalFee;
  vault.save();
}

export function handleDistributePremium(event: DistributePremium): void {
  let vaultAddress = event.address.toHexString();
  let vault = Vault.load(vaultAddress);

  if (vault == null) {
    vault = newVault(vaultAddress, event.block.timestamp.toI32());
    vault.save();
  }

  let recipients = event.params.recipients;
  let amounts = event.params.amounts;

  for (let i = 0; i < event.params.recipients.length; i++) {
    let txid =
      vaultAddress +
      "-" +
      event.transaction.hash.toHexString() +
      "-" +
      i.toString();

    newTransaction(
      txid,
      "distribute",
      vaultAddress,
      recipients[i],
      event.transaction.hash,
      event.block.timestamp,
      amounts[i],
      amounts[i]
    );
  }
}
