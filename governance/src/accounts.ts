import { Address, BigInt } from "@graphprotocol/graph-ts";
import { RBNAccount, RBNToken } from "../generated/schema";

export function getOrCreateTokenAccount(
  accountAddress: Address,
  token: RBNToken
): RBNAccount {
  let accountId = accountAddress.toHexString();

  let tokenAccount = RBNAccount.load(accountId);
  if (tokenAccount == null) {
    let holders = token.holders;
    holders.push(accountAddress);
    token.holders = holders;

    token.numHolders = token.numHolders + 1;
    token.save();

    tokenAccount = new RBNAccount(accountId);
    tokenAccount.token = token.id;
    tokenAccount.totalBalance = BigInt.fromI32(0);
    tokenAccount.lockedBalance = BigInt.fromI32(0);
    tokenAccount.save();
  }
  return tokenAccount as RBNAccount;
}
