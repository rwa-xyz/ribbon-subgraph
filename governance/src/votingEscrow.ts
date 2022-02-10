import { BigInt, log } from "@graphprotocol/graph-ts";
import { RBNAccount, RBNToken } from "../generated/schema";
import { Deposit, Withdraw } from "../generated/VotingEscrow/VotingEscrow";
import { getOrCreateTokenAccount } from "./accounts";
import { getRBNTokenAddress } from "./data/constant";
import { newTransaction } from "./transaction";

export function handleDeposit(event: Deposit): void {
  let token = RBNToken.load(getRBNTokenAddress().toHexString());

  if (!token) {
    log.error("Something wrong at transaction {}", [
      event.transaction.hash.toHexString()
    ]);
    return;
  }

  let activity = "stake";

  let tokenAccount = getOrCreateTokenAccount(event.transaction.from, token);

  /**
   * Check if user had previous staked
   * When user has previous stake, the activity will either be increasing stake amount of increasing stake duration
   */
  if (tokenAccount.lockStartTimestamp) {
    activity = event.params.value.isZero()
      ? "increaseStakeDuration"
      : "increaseStakeAmount";
  }

  /**
   * Locked balance will be set back to 0 on withdraw. If they are not, it simply mean the transaction is either increase amount or increase lock time
   */
  tokenAccount.lockedBalance = tokenAccount.lockedBalance + event.params.value;
  tokenAccount.lockStartTimestamp =
    tokenAccount.lockStartTimestamp || event.block.timestamp;
  tokenAccount.lockEndTimestamp = event.params.locktime;

  tokenAccount.save();

  /**
   * Add amount into total staked
   */
  token.totalStaked = token.totalStaked + event.params.value;
  token.save();

  newTransaction(
    event.transaction.hash.toHexString(),
    activity,
    event.transaction.from,
    event.transaction.hash,
    event.block.timestamp,
    event.params.value
  );
}

export function handleWithdraw(event: Withdraw): void {
  let token = RBNToken.load(getRBNTokenAddress().toHexString());

  if (!token) {
    log.error("Something wrong at transaction {}", [
      event.transaction.hash.toHexString()
    ]);
    return;
  }

  let tokenAccount = getOrCreateTokenAccount(event.transaction.from, token);
  tokenAccount.lockedBalance = BigInt.fromI32(0);
  tokenAccount.lockStartTimestamp = null;
  tokenAccount.lockEndTimestamp = null;

  tokenAccount.save();

  /**
   * Deduct from total staked
   */
  token.totalStaked = token.totalStaked - event.params.value;
  token.save();

  newTransaction(
    event.transaction.hash.toHexString(),
    "unstake",
    event.transaction.from,
    event.transaction.hash,
    event.block.timestamp,
    event.params.value
  );
}
