import { Address, dataSource } from "@graphprotocol/graph-ts";
import { Transfer } from "../../generated/RibbonToken/ERC20";

export function getRBNTokenAddress(): Address {
  return dataSource.network() == "mainnet"
    ? Address.fromString("0x6123B0049F904d730dB3C36a31167D9d4121fA6B")
    : Address.fromString("0x80Ba81056BA048c82b7b01eB8bffE342fDe1998D");
}

export function getVotingEscrowAddress(): Address | null {
  return dataSource.network() == "mainnet"
    ? Address.fromString("0x10dAd929A9890B32Db9A5d568B5953FCa5826AC8")
    : Address.fromString("0x8E75FCac21074AB6E71d6097741bA23fbbA474a4");
}

export function ignoreTransfer(transfer: Transfer): boolean {
  let votingEscrowAddress = getVotingEscrowAddress();

  return (
    votingEscrowAddress !== null &&
    (transfer.params.from.equals(votingEscrowAddress) ||
      transfer.params.to.equals(votingEscrowAddress))
  );
}
