import { BigInt } from "@graphprotocol/graph-ts";
import {
  OpenShort,
  CloseShort
} from "../generated/RibbonOptionsVault/RibbonOptionsVault";
import { VaultShortPosition, VaultOptionTrade } from "../generated/schema";
import { Otoken } from "../generated/RibbonOptionsVault/Otoken";
import { Swap } from "../generated/Airswap/Airswap";

export function handleOpenShort(event: OpenShort): void {
  let optionAddress = event.params.options;

  let shortPosition = new VaultShortPosition(optionAddress.toHex());

  if (event.transaction.to == null) {
    return;
  }

  shortPosition.vault = event.transaction.to;
  shortPosition.option = optionAddress;
  shortPosition.depositAmount = event.params.depositAmount;
  shortPosition.initiatedBy = event.params.manager;
  shortPosition.openedAt = event.block.timestamp;
  shortPosition.premiumEarned = BigInt.fromI32(0);

  let otoken = Otoken.bind(optionAddress);
  shortPosition.expiry = otoken.expiryTimestamp();
  shortPosition.strikePrice = otoken.strikePrice();

  shortPosition.save();
}

export function handleCloseShort(event: CloseShort): void {
  let shortPosition = VaultShortPosition.load(event.params.options.toHex());
  if (shortPosition != null) {
    shortPosition.closedAt = event.block.timestamp;
    shortPosition.save();
  }
}

export function handleSwap(event: Swap): void {
  let optionToken = event.params.signerToken;
  let vault = event.params.signerWallet;

  let shortPosition = VaultShortPosition.load(optionToken.toHex());

  if (shortPosition == null) {
    return;
  }

  let swapID =
    optionToken.toHex() +
    "-" +
    event.transaction.hash.toHex() +
    "-" +
    event.transactionLogIndex.toString();
  let premium = event.params.senderAmount;

  let optionTrade = new VaultOptionTrade(swapID);
  optionTrade.vault = vault;
  optionTrade.buyer = event.params.senderWallet;
  optionTrade.sellAmount = event.params.signerAmount;
  optionTrade.premium = event.params.senderAmount;
  optionTrade.optionToken = event.params.signerToken;
  optionTrade.premiumToken = event.params.senderToken;
  optionTrade.vaultShortPosition = optionToken.toHex();
  optionTrade.save();

  shortPosition.premiumEarned = shortPosition.premiumEarned.plus(premium);
  shortPosition.save();
}
