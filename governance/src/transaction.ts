import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { GovernanceTransaction } from "../generated/schema";

export function newTransaction(
  txid: string,
  type: string,
  account: Address,
  txhash: Bytes,
  timestamp: BigInt,
  amount: BigInt
): void {
  let transaction = new GovernanceTransaction(txid);
  transaction.type = type;
  transaction.address = account;
  transaction.txhash = txhash;
  transaction.timestamp = timestamp;
  transaction.amount = amount;
  transaction.save();
}
