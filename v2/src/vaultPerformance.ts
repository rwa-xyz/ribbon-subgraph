import { Address } from "@graphprotocol/graph-ts";
import { RibbonThetaVault } from "../generated/RibbonETHCoveredCall/RibbonThetaVault";
import { Vault, VaultPerformanceUpdate } from "../generated/schema";

export function updateVaultPerformance(
  vaultAddress: string,
  timestamp: number
): void {
  let vault = Vault.load(vaultAddress);
  let vaultContract = RibbonThetaVault.bind(Address.fromString(vaultAddress));
  let newCounter = vault.performanceUpdateCounter + 1;
  let updateID = vault.id + "-" + newCounter.toString();

  // We make sure we only update the vault performance
  // IF there are changes
  let prevUpdate = VaultPerformanceUpdate.load(vault.performanceUpdateCounter);
  let newPricePerShare = vaultContract.pricePerShare();
  if (prevUpdate.pricePerShare == newPricePerShare) {
    return;
  }

  vault.performanceUpdateCounter = vault.performanceUpdateCounter + 1;
  vault.save();

  let performanceUpdate = new VaultPerformanceUpdate(updateID);
  performanceUpdate.vault = vault.id;
  performanceUpdate.pricePerShare = newPricePerShare;
  performanceUpdate.timestamp = i32(timestamp);
  performanceUpdate.save();
}
