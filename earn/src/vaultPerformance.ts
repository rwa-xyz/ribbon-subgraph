import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { RibbonEarnVault } from "../generated/RibbonEarnVault/RibbonEarnVault";
import { Vault, VaultPerformanceUpdate } from "../generated/schema";
import { getVaultStartRound } from "./data/constant";

export function finalizePrevRoundVaultPerformance(
  vaultAddress: string,
  timestamp: number
): void {
  let vault = Vault.load(vaultAddress);
  let finalizeRound = vault.round - 1;
  let vaultContract = RibbonEarnVault.bind(Address.fromString(vaultAddress));
  let vaultPerformanceUpdateId = vault.id + "-" + finalizeRound.toString();

  /**
   * Skip if we had not reach the round for indexing
   */
  if (getVaultStartRound(vault.symbol) > vault.round) {
    return;
  }

  let performanceUpdate = new VaultPerformanceUpdate(vaultPerformanceUpdateId);
  let finalizedPricePerShare = vaultContract.roundPricePerShare(
    BigInt.fromI32(finalizeRound)
  );
  performanceUpdate.vault = vault.id;
  performanceUpdate.round = finalizeRound;
  performanceUpdate.pricePerShare = finalizedPricePerShare;
  performanceUpdate.timestamp = i32(timestamp);
  performanceUpdate.save();
}
