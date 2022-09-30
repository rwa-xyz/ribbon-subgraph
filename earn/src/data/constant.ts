import {
  Address,
  dataSource,
  log,
  TypedMap,
  BigInt
} from "@graphprotocol/graph-ts";
import { Transfer } from "../../generated/RibbonEarnVault/RibbonEarnVault";

/**
 * This function return the round of a vault officially started
 */
export function getVaultStartRound(vaultSymbol: string): i32 {
  if (vaultSymbol == "rEARN") {
    return 0;
  }

  return 0;
}

/**
 * This function detect if it should ignore transfer event
 */
export function ignoreTransfer(transfer: Transfer): boolean {
  // Ethereum Pauser
  if (
    transfer.params.from.toHexString() ==
      "0xE04e8Ae290965AD4F7E40c68041c493d2e89cDC3" ||
    transfer.params.to.toHexString() ==
      "0xE04e8Ae290965AD4F7E40c68041c493d2e89cDC3"
  ) {
    return true;
  }

  return false;
}

export function isTestAmount(vaultSymbol: string, amount: BigInt): boolean {
  if (vaultSymbol == "rEARN") {
    return amount.lt(BigInt.fromI32(100000000));
  }
  return false;
}
