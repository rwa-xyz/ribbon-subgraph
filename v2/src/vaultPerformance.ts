import { Address, BigInt } from "@graphprotocol/graph-ts";
import { RibbonThetaVault } from "../generated/RibbonETHCoveredCall/RibbonThetaVault";
import { Vault, VaultPerformanceUpdate } from "../generated/schema";
import { getVaultStartRound } from "./data/constant";

export function updateVaultPerformance(
  vaultAddress: string,
  timestamp: number
): void {
  let vault = Vault.load(vaultAddress);
  let round = vault.round;
  let vaultContract = RibbonThetaVault.bind(Address.fromString(vaultAddress));
  let vaultPerformanceUpdateId = vault.id + "-" + round.toString();

  /**
   * Skip if we had not reach the round for indexing
   */
  if (getVaultStartRound(vault.symbol) > vault.round) {
    return;
  }

  let performanceUpdate = VaultPerformanceUpdate.load(vaultPerformanceUpdateId);
  let newPricePerShare = vaultContract.pricePerShare();

  let vaultPerformanceUpdateHistoryId = vaultPerformanceUpdateId;

  if (performanceUpdate == null) {
    /**
     * On auction cleared, record performance update of the week
     */
    performanceUpdate = new VaultPerformanceUpdate(vaultPerformanceUpdateId);
    performanceUpdate.vault = vault.id;
    performanceUpdate.pricePerShare = newPricePerShare;
    performanceUpdate.round = vault.round;

    vaultPerformanceUpdateHistoryId = vaultPerformanceUpdateHistoryId + "-0";
  } else {
    /**
     * On close short, we update pricePerShare with registered round price per share from contract
     */
    performanceUpdate.pricePerShare = newPricePerShare;

    vaultPerformanceUpdateHistoryId = vaultPerformanceUpdateHistoryId + "-1";
  }

  performanceUpdate.timestamp = i32(timestamp);
  performanceUpdate.save();
}

export function finalizePrevRoundVaultPerformance(
  vaultAddress: string,
  timestamp: number
): void {
  let vault = Vault.load(vaultAddress);
  let finalizeRound = vault.round - 1;
  let vaultContract = RibbonThetaVault.bind(Address.fromString(vaultAddress));
  let vaultPerformanceUpdateId = vault.id + "-" + finalizeRound.toString();

  /**
   * Skip if the vault round not officially started
   */
  if (getVaultStartRound(vault.symbol) > finalizeRound) {
    return;
  }

  let performanceUpdate = VaultPerformanceUpdate.load(vaultPerformanceUpdateId);
  let finalizedPricePerShare = vaultContract.roundPricePerShare(
    BigInt.fromI32(finalizeRound)
  );

  if (performanceUpdate != null) {
    performanceUpdate.pricePerShare = finalizedPricePerShare;
    performanceUpdate.timestamp = i32(timestamp);
    performanceUpdate.save();
  }
}
