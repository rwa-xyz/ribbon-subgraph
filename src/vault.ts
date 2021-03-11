import {
  OpenShort,
  CloseShort
} from "../generated/RibbonOptionsVault/RibbonOptionsVault";
import { VaultShortPosition } from "../generated/schema";
import { Otoken } from "../generated/RibbonOptionsVault/Otoken";

export function handleOpenShort(event: OpenShort): void {
  let optionAddress = event.params.options;

  let shortPosition = new VaultShortPosition(optionAddress.toHex());
  shortPosition.option = optionAddress;
  shortPosition.depositAmount = event.params.depositAmount;
  shortPosition.initiatedBy = event.params.manager;
  shortPosition.openedAt = event.block.timestamp;

  let otoken = Otoken.bind(optionAddress);
  shortPosition.expiry = otoken.expiryTimestamp();
  shortPosition.strikePrice = otoken.strikePrice();

  shortPosition.save();
}

export function handleCloseShort(event: CloseShort): void {
  let shortPosition = VaultShortPosition.load(event.params.options.toHex());
  if (shortPosition !== null) {
    shortPosition.closedAt = event.block.timestamp;
  }
}
