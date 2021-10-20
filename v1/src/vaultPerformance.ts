import { Address, BigInt } from "@graphprotocol/graph-ts";
import { RibbonOptionsVault } from "../generated/RibbonOptionsVault/RibbonOptionsVault";
import { Vault, VaultPerformanceUpdate } from "../generated/schema";

export function updateVaultPerformance(
  vaultAddress: string,
  timestamp: number
): void {
  let vault = Vault.load(vaultAddress);
  let vaultContract = RibbonOptionsVault.bind(Address.fromString(vaultAddress));
  let newCounter = vault.performanceUpdateCounter + 1;
  let updateID = vault.id + "-" + newCounter.toString();

  // We make sure we only update the vault performance
  // IF there are changes
  let prevCounter = vault.performanceUpdateCounter;
  let prevUpdate = VaultPerformanceUpdate.load(
    vault.id + "-" + prevCounter.toString()
  );
  let newPricePerShare =
    (BigInt.fromI32(10).pow(u8(vault.underlyingDecimals)) *
      vaultContract.totalBalance()) /
    vaultContract.totalSupply();
  if (prevUpdate != null && prevUpdate.pricePerShare == newPricePerShare) {
    return;
  }

  vault.performanceUpdateCounter = newCounter;
  vault.save();

  let performanceUpdate = new VaultPerformanceUpdate(updateID);
  performanceUpdate.vault = vault.id;
  performanceUpdate.pricePerShare = newPricePerShare;
  performanceUpdate.timestamp = i32(timestamp);
  performanceUpdate.save();
}
