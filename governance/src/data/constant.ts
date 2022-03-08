import { Address, dataSource } from "@graphprotocol/graph-ts";
import { Transfer } from "../../generated/RibbonToken/ERC20";

export function getRBNTokenAddress(): Address {
  return dataSource.network() == "mainnet"
    ? Address.fromString("0x6123B0049F904d730dB3C36a31167D9d4121fA6B")
    : Address.fromString("0x80Ba81056BA048c82b7b01eB8bffE342fDe1998D");
}

export function getVotingEscrowAddress(): Address | null {
  return dataSource.network() == "mainnet"
    ? Address.fromString("0x19854C9A5fFa8116f48f984bDF946fB9CEa9B5f7")
    : Address.fromString("0x75F024aa6ca8f7eec23465388a661209f735B0DF");
}

export function ignoreTransfer(transfer: Transfer): boolean {
  let votingEscrowAddress = getVotingEscrowAddress();

  return (
    votingEscrowAddress !== null &&
    (transfer.params.from.equals(votingEscrowAddress) ||
      transfer.params.to.equals(votingEscrowAddress))
  );
}
