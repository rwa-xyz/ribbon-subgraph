import { BigInt } from "@graphprotocol/graph-ts";

export function encodeOrder(userId: BigInt, buyAmount: BigInt, sellAmount: BigInt): string {
  return (
    '0x' +
    userId.toHexString().slice(2).padStart(16, '0') +
    buyAmount.toHexString().slice(2).padStart(24, '0') +
    sellAmount.toHexString().slice(2).padStart(24, '0')
  )
}