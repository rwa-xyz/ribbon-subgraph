import { TokenMinterDistribution } from "../generated/schema";
import { Minted } from "../generated/TokenMinter/TokenMinter";

export function handleMinted(event: Minted): void {
  const gaugeAddress = event.params.gauge.toHexString();
  const mintedAmount = event.params.minted
  const newMinted = new TokenMinterDistribution(gaugeAddress)
  newMinted.amount = newMinted.amount ? newMinted.amount!.plus(mintedAmount) : mintedAmount
  newMinted.save()
}