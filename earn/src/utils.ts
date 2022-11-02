import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { RibbonEarnVault } from "../generated/RibbonEarnVault/RibbonEarnVault";
import { Vault, VaultPerformanceUpdate } from "../generated/schema";
import { getVaultStartRound } from "./data/constant";

let WAD = BigInt.fromString("1000000000000000000");
let OTOKEN_DECIMALS = BigInt.fromString("100000000");
let SCALE_DECIMALS = BigInt.fromString("10000000000");

function wdiv(x: BigInt, y: BigInt): BigInt {
  return x
    .times(WAD)
    .plus(y.div(BigInt.fromI32(2)))
    .div(y);
}

export function getOtokenMintAmount(
  depositAmount: BigInt,
  strikePrice: BigInt,
  collateralDecimals: u8,
  isPut: bool
): BigInt {
  if (isPut) {
    return wdiv(
      depositAmount.times(OTOKEN_DECIMALS),
      strikePrice.times(SCALE_DECIMALS)
    ).div(BigInt.fromI32(10).pow(collateralDecimals));
  }

  let scaleByDecimals = BigInt.fromI32(10).pow(collateralDecimals - 8);
  return depositAmount.div(scaleByDecimals);
}

export function sharesToAssets(
  shareAmount: BigInt,
  assetPerShare: BigInt,
  decimals: number
): BigInt {
  let decimalsU8: u8 = u8(decimals);
  let singleShare = BigInt.fromI32(10).pow(decimalsU8);
  return (shareAmount * assetPerShare) / singleShare;
}

export function getTotalPendingDeposit(
  vault: RibbonEarnVault,
  account: Address
): BigInt {
  let vaultState = vault.vaultState();
  let currentRound = vaultState.value0;

  let depositReceipt = vault.depositReceipts(account);
  let receiptRound = depositReceipt.value0;
  let depositAmount = depositReceipt.value1;

  if (receiptRound >= currentRound) {
    return depositAmount;
  }
  return BigInt.fromI32(0);
}

export function newVault(vaultAddress: string, creationTimestamp: i32): Vault {
  let vault = new Vault(vaultAddress);
  let vaultContract = RibbonEarnVault.bind(Address.fromString(vaultAddress));

  vault.name = vaultContract.name();
  vault.symbol = vaultContract.symbol();
  vault.numDepositors = 0;
  vault.depositors = [];
  vault.decimals = vaultContract.decimals();
  vault.totalPremiumEarned = BigInt.fromI32(0);
  vault.totalNominalVolume = BigInt.fromI32(0);
  vault.totalNotionalVolume = BigInt.fromI32(0);
  vault.principalOutstanding = BigInt.fromI32(0);
  vault.cap = vaultContract.cap();
  vault.round = 1;
  vault.totalBalance = vaultContract.totalBalance();
  vault.performanceFeeCollected = BigInt.fromI32(0);
  vault.managementFeeCollected = BigInt.fromI32(0);
  vault.totalFeeCollected = BigInt.fromI32(0);
  vault.optionsTraded = 0;
  vault.numberOfHits = 0;

  if (getVaultStartRound(vault.symbol) == 0) {
    // We create an initial VaultPerformanceUpdate with the default pricePerShare
    let performanceUpdate = new VaultPerformanceUpdate(vaultAddress + "-0");
    performanceUpdate.vault = vault.id;
    performanceUpdate.pricePerShare = BigInt.fromI32(10).pow(
      u8(vault.decimals)
    );
    performanceUpdate.timestamp = creationTimestamp;
    performanceUpdate.round = 0;
    performanceUpdate.save();
  }

  return vault;
}
