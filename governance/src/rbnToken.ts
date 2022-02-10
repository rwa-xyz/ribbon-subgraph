import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ERC20, Transfer } from "../generated/RibbonToken/ERC20";
import {
  RBNToken,
  RBNAccount,
  GovernanceTransaction
} from "../generated/schema";
import { getOrCreateTokenAccount } from "./accounts";
import { ignoreTransfer } from "./data/constant";

function getOrCreateToken(tokenAddress: string): RBNToken {
  let token = RBNToken.load(tokenAddress);

  if (token == null) {
    token = new RBNToken(tokenAddress);
    let tokenContract = ERC20.bind(Address.fromString(tokenAddress));
    token.name = tokenContract.name();
    token.symbol = tokenContract.symbol();
    token.numHolders = 0;
    token.holders = [];
    token.totalSupply = tokenContract.totalSupply();
    token.totalStaked = BigInt.fromI32(0);
    token.save();
  }
  return token as RBNToken;
}

function updateTokenAccountBalance(
  tokenAddress: Address,
  userAddress: Address,
  tokenAccount: RBNAccount
): void {
  let tokenContract = ERC20.bind(tokenAddress);

  let callResult = tokenContract.try_balanceOf(userAddress);

  if (!callResult.reverted) {
    tokenAccount.totalBalance = callResult.value + tokenAccount.lockedBalance;
    tokenAccount.save();
  }
}

export function handleTransfer(event: Transfer): void {
  /**
   * If the transfer is staking, we let votingEscrow to process the transaction
   */
  if (ignoreTransfer(event)) {
    return;
  }

  let tokenAddress = event.address.toHexString();
  let token = getOrCreateToken(tokenAddress);
  let senderTokenAccount = getOrCreateTokenAccount(event.params.from, token);
  let receiverTokenAccount = getOrCreateTokenAccount(event.params.to, token);

  updateTokenAccountBalance(
    event.address,
    event.params.from,
    senderTokenAccount
  );
  updateTokenAccountBalance(
    event.address,
    event.params.to,
    receiverTokenAccount
  );
}
