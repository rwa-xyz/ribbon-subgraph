import { Address } from "@graphprotocol/graph-ts";

import { StrategyReported, yvHEGIC } from "../generated/YearnUSDCVault/yvHEGIC";
import { refreshAllAccountBalances } from "./accounts";
import { getThetaVaultFromYearnVault } from "./data/constant";

export function handleStrategyReported(event: StrategyReported): void {
  let yearnVault = yvHEGIC.bind(event.address);
  let vaultAddress = getThetaVaultFromYearnVault(yearnVault.symbol());

  if (vaultAddress) {
    refreshAllAccountBalances(
      Address.fromString(vaultAddress),
      event.block.timestamp.toI32()
    );
  }
}
