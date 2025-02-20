import { BigInt } from "@graphprotocol/graph-ts";
import { RibbonLendPool } from "../generated/templates/RibbonLendPool/RibbonLendPool";

export function getPricePerShare(
  pool: RibbonLendPool,
  decimals: number
): BigInt {
  let callResult = pool.try_getCurrentExchangeRate();
  // If it reverts it means that the supply is 0, so we return a single share
  let decimalsU8: u8 = u8(decimals);
  return callResult.value / BigInt.fromI32(10).pow(decimalsU8);
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
