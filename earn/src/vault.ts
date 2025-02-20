import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import {
  RibbonEarnVault,
  CloseLoan,
  CollectVaultFees,
  Deposit,
  InitiateWithdraw,
  InstantWithdraw,
  OpenLoan,
  PayOptionYield,
  PurchaseOption,
  Withdraw
} from "../generated/RibbonEarnVault/RibbonEarnVault";
import {
  Provided,
  Redeemed
} from "../generated/templates/RibbonLendPool/RibbonLendPool";
import {
  createVaultAccount,
  refreshAllAccountBalances,
  triggerBalanceUpdate
} from "./accounts";
import { newVault, sharesToAssets } from "./utils";
import {
  Vault,
  VaultAccount,
  VaultTransaction,
  VaultOpenLoan,
  VaultCloseLoan,
  VaultOptionSold,
  VaultOptionYield
} from "../generated/schema";
import { isTestAmount, earnVaultList } from "./data/constant";
import { finalizePrevRoundVaultPerformance } from "./vaultPerformance";

export function handleOpenLoan(event: OpenLoan): void {
  let vaultContract = RibbonEarnVault.bind(event.address);
  let vaultAddress = event.address.toHexString();
  let round = vaultContract.vaultState().value0;
  let loanPosition = new VaultOpenLoan(
    event.address.toHexString() +
      "-" +
      round.toString() +
      "-" +
      event.params.borrower.toHexString()
  );
  loanPosition.vault = event.address.toHexString();
  loanPosition.loanAmount = event.params.amount;
  loanPosition.openedAt = event.block.timestamp.toI32();

  let vault = Vault.load(event.address.toHexString());
  if (vault.round !== round) {
    vault.round = round;
  }
  vault.save();

  loanPosition.openTxhash = event.transaction.hash;
  loanPosition.save();

  refreshAllAccountBalances(
    Address.fromString(vaultAddress),
    event.block.timestamp.toI32()
  );
}

export function handleCloseLoan(event: CloseLoan): void {
  let vaultContract = RibbonEarnVault.bind(event.address);
  let round = vaultContract.vaultState().value0;
  let loanClosePosition = new VaultCloseLoan(
    event.address.toHexString() +
      "-" +
      round.toString() +
      "-" +
      event.params.borrower.toHexString()
  );

  loanClosePosition.vault = event.address.toHexString();
  loanClosePosition.paidAmount = event.params.amount;
  loanClosePosition.closedAt = event.block.timestamp;
  loanClosePosition.closeTxhash = event.transaction.hash;
  loanClosePosition.save();
}

export function handleProvided(event: Provided): void {
  let vaultExist = earnVaultList.includes(event.params.provider.toHexString());
  if (vaultExist) {
    let vaultContract = RibbonEarnVault.bind(event.params.provider);
    let round = vaultContract.vaultState().value0;
    let loanPosition = new VaultOpenLoan(
      event.address.toHexString() +
        "-" +
        event.params.provider.toHexString() +
        "-" +
        event.block.timestamp.toString()
    );
    loanPosition.vault = event.params.provider.toHexString();
    loanPosition.loanAmount = event.params.currencyAmount;
    loanPosition.openedAt = event.block.timestamp.toI32();
    let vault = Vault.load(event.params.provider.toHexString());
    // if the loan is from the same round, we increment, else refresh principaloutstanding
    if (vault.round !== round) {
      vault.round = round;
    }
    vault.save();

    loanPosition.openTxhash = event.transaction.hash;
    loanPosition.save();
  }
}

export function handleRedeemed(event: Redeemed): void {
  let vaultExist = earnVaultList.includes(event.params.redeemer.toHexString());
  if (vaultExist) {
    let loanClosePosition = new VaultCloseLoan(
      event.address.toHexString() +
        "-" +
        event.params.redeemer.toHexString() +
        "-" +
        event.block.timestamp.toHexString()
    );

    loanClosePosition.vault = event.params.redeemer.toHexString();
    loanClosePosition.paidAmount = event.params.currencyAmount;
    loanClosePosition.closedAt = event.block.timestamp;
    loanClosePosition.closeTxhash = event.transaction.hash;
    loanClosePosition.save();
  }
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

export function handleCollectVaultFees(event: CollectVaultFees): void {
  let vaultAddress = event.address.toHexString();
  let vault = Vault.load(vaultAddress);

  let performanceFee = event.params.performanceFee;
  let totalFee = event.params.vaultFee;
  let managementFee = totalFee - performanceFee;
  vault.performanceFeeCollected =
    vault.performanceFeeCollected + performanceFee;
  vault.round = vault.round + 1;
  vault.managementFeeCollected = vault.managementFeeCollected + managementFee;
  vault.totalFeeCollected = vault.totalFeeCollected + totalFee;
  vault.save();

  refreshAllAccountBalances(
    Address.fromString(vaultAddress),
    event.block.timestamp.toI32()
  );

  finalizePrevRoundVaultPerformance(
    vaultAddress,
    event.block.timestamp.toI32()
  );
}

export function handleInitiateWithdraw(event: InitiateWithdraw): void {
  let vaultAddress = event.address.toHexString();
  let vault = Vault.load(vaultAddress);
  let vaultAccount = createVaultAccount(event.address, event.params.account);
  vaultAccount.save();

  let txid =
    vaultAddress +
    "-" +
    event.transaction.hash.toHexString() +
    "-" +
    event.transactionLogIndex.toString();

  let vaultContract = RibbonEarnVault.bind(event.address);

  let decimals = vault.decimals;
  let assetAmount = sharesToAssets(
    event.params.shares,
    vaultContract.roundPricePerShare(BigInt.fromI32(vault.round - 1)),
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

  let vaultAccountID = vaultAddress + "-" + event.params.account.toHexString();
  let vaultAccount = VaultAccount.load(vaultAccountID);
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
  transaction.timestamp = timestamp.toI32();
  transaction.amount = amount;
  transaction.underlyingAmount = underlyingAmount || amount;
  transaction.save();
}

export function handlePayOptionYield(event: PayOptionYield): void {
  let vault = Vault.load(event.address.toHexString());
  //filter out test option yields
  if (!isTestAmount(vault.symbol, event.params._yield)) {
    let vaultContract = RibbonEarnVault.bind(event.address);
    let vaultAddress = event.address.toHexString();
    let vault = Vault.load(vaultAddress);
    vault.numberOfHits = vault.numberOfHits + 1;
    vault.save();
    let allocationState = vaultContract.allocationState();
    let round = vaultContract.vaultState().value0;
    let optionPaid = new VaultOptionYield(
      event.address.toHexString() +
        "-" +
        event.transaction.hash.toHexString() +
        "-" +
        round.toString()
    );
    optionPaid.vault = vaultAddress;
    optionPaid._yield = event.params._yield;
    optionPaid.netYield = event.params.netYield;
    optionPaid.optionAllocation = allocationState.value7;
    optionPaid.optionSeller = event.params.seller;
    optionPaid.optionPurchaseFreq = allocationState.value3.toI32();
    optionPaid.subRounds =
      allocationState.value2.toI32() / allocationState.value3.toI32();
    optionPaid.paidAt = event.block.timestamp.toI32();
    optionPaid.txhash = event.transaction.hash;
    optionPaid.save();
  }
}

export function handlePurchaseOption(event: PurchaseOption): void {
  let vaultContract = RibbonEarnVault.bind(event.address);
  let allocationState = vaultContract.allocationState();
  let round = vaultContract.vaultState().value0;
  let option = new VaultOptionSold(
    event.address.toHexString() +
      "-" +
      event.transaction.hash.toHexString() +
      "-" +
      round.toString()
  );
  let vaultAddress = event.address.toHexString();
  let vault = Vault.load(vaultAddress);
  vault.optionsTraded = vault.optionsTraded + 1;
  vault.save();
  option.vault = event.address.toHexString();
  option.premium = event.params.premium;
  option.optionAllocation = allocationState.value7;
  option.optionSeller = vaultContract.optionSeller();
  option.optionPurchaseFreq = allocationState.value3.toI32();
  option.subRounds =
    allocationState.value2.toI32() / allocationState.value3.toI32();
  option.soldAt = event.block.timestamp.toI32();
  option.txhash = event.transaction.hash;
  option.save();
}
