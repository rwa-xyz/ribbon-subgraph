import { Address, dataSource, log, TypedMap } from "@graphprotocol/graph-ts";
import { Transfer } from "../../generated/RibbonETHCoveredCall/RibbonThetaVault";

/**
 * This function return the round of a vault officially started
 */
export function getVaultStartRound(vaultSymbol: string): i32 {
  if (vaultSymbol == "rAAVE-THETA") {
    return 5;
  } else if (vaultSymbol == "rstETH-THETA") {
    return 2;
  } else if (vaultSymbol == "rAVAX-THETA") {
    return 3;
  } else if (vaultSymbol == "ryvUSDC-ETH-P-THETA") {
    return 2;
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
    // Yearn ETH Put
    gaugeMap.set(
      "0xeef6288057f3f258bfc540d91462653dca3b2aac",
      "0xcc323557c71c0d1d20a1861dc69c06c5f3cc9624"
    );
    // AAVE Call
    gaugeMap.set(
      "0x12dc10f72a64ce07d2b3d41420f2276f8c560919",
      "0xe63151a0ed4e5fafdc951d877102cf0977abd365"
    );
    // stETH Call
    gaugeMap.set(
      "0xaf23adb205169a5df1db7321bf1a8d7dea2f8abd",
      "0x53773e034d9784153471813dacaff53dbbb78e8c"
    );
    // ETH Call
    gaugeMap.set(
      "0x78b6dd0cd4697f9a62851323bea8a3b3bf213241",
      "0x25751853eab4d0eb3652b5eb6ecb102a2789644b"
    );
    // WBTC Call
    gaugeMap.set(
      "0xe53851c18e01ca5f8537246f37fb7de048619892",
      "0x65a833afdc250d9d38f8cd9bc2b1e3132db13b2f"
    );
  } else if (dataSource.network() == "kovan") {
    // ETH Put
    gaugeMap.set(
      "0xb8a058dd5e4652abfe7b7ad370777fdf800dffd8",
      "0xec1c50724cf7a618c6cda6cfea5c9064afc98e84"
    );
    // ETH Call
    gaugeMap.set(
      "0xac4495454a564731c085a5fcc522da1f0bdd69d4",
      "0xfaef8534a499d1a67cf83b7decbcc27bd49decfd"
    );
    // WBTC Call
    gaugeMap.set(
      "0x25938400ea02bb60432af0dbb7dfb87f7a20183f",
      "0x895d2ea2ef2c9f4a3c458ccd7c588f8f102118e6"
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
  let liquidityGaugePools = getLiquidityGaugePoolsMap().entries.map<string>(
    item => item.key
  );

  if (
    transfer.params.from.toHexString() ==
      "0x0000000000000000000000000000000000000000" ||
    transfer.params.to.toHexString() ==
      "0x0000000000000000000000000000000000000000" ||
    transfer.params.from.toHexString() == transfer.address.toHexString() ||
    transfer.params.to.toHexString() == transfer.address.toHexString()
  ) {
    return true;
  }

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

export const getThetaVaultFromYearnVault = (symbol: string): string | null => {
  // Yearn USDC Vault Strategy
  if (symbol == "yvUSDC") {
    return "0xCc323557c71C0D1D20a1861Dc69c06C5f3cC9624";
  }

  return null;
};
