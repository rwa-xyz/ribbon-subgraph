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
    return 1;
  }

  return 0;
}

/**
 * Keys: Liquidity Guage Address
 * Value: Vault address
 */
export function getLiquidityGaugePoolsMap(): TypedMap<string, string> {
  let gaugeMap = new TypedMap<string, string>();
  if (dataSource.network() == "mainnet") {
    // REARN
    gaugeMap.set(
      "0x9674126ff31e5ece36de0cf03a49351a7c814587",
      "0x84c2b16fa6877a8ff4f3271db7ea837233dfd6f0"
    );
  }
  return gaugeMap;
}

export function searchLiquidityGaugePoolsVaultAddress(
  liquidityGaugeAddress: Address
): Address {
  let addressMap = getLiquidityGaugePoolsMap();

  return Address.fromString(
    addressMap.get(liquidityGaugeAddress.toHexString()) as string
  );
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

  let liquidityGaugePools = getLiquidityGaugePoolsMap().entries.map<string>(
    item => item.key
  );
  // Graph-ts array type appear not to be iterable, so uses for loop instead
  for (let i = 0; i < liquidityGaugePools.length; i++) {
    let gaugeAddress = Address.fromString(liquidityGaugePools[i]);

    if (
      gaugeAddress.equals(transfer.params.from) ||
      gaugeAddress.equals(transfer.params.to)
    ) {
      return true;
    }
  }

  return false;
}

export function isTestAmount(vaultSymbol: string, amount: BigInt): boolean {
  if (vaultSymbol == "rEARN") {
    return amount.lt(BigInt.fromI32(100000000));
  }
  return false;
}

export const earnVaultList: Array<string> = [
  "0x84c2b16fa6877a8ff4f3271db7ea837233dfd6f0", //RibbonEarn
];
