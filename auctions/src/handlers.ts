import { BigInt, ByteArray, Bytes } from "@graphprotocol/graph-ts";
import { NewOffer, SettleOffer, Swap, SwapContract } from "../../v2/generated/RibbonSwap/SwapContract";
import {
  AuctionCleared,
  NewAuction,
  NewSellOrder,
  CancellationSellOrder,
  ClaimedFromOrder,
  NewUser,
} from "../generated/GnosisAuction/GnosisAuction";
import {
  Auction,
  Bid,
  Account,
} from "../generated/schema";
import { vaultList } from "./data/constant";
import { createOption, createToken } from "./token"
import { encodeOrder } from "./utils";

export function handleSellOrder(event: NewSellOrder): void {
  let auction = Auction.load(event.params.auctionId.toString())

  let bid = new Bid(
    event.params.auctionId.toString() 
    + "-" + event.params.userId.toString()
    + "-" + event.params.buyAmount.toString()
    + "-" + event.params.sellAmount.toString()
  )

  let account = Account.load(event.params.userId.toString())
  
  if (auction) {
    bid.index = event.block.timestamp
    bid.auction = event.params.auctionId.toI32()
    bid.account = account.id
    bid.size = event.params.buyAmount
    bid.payable = event.params.sellAmount
    bid.createtx = event.transaction.hash
    bid.bytes = encodeOrder(
      event.params.userId,
      event.params.buyAmount,
      event.params.sellAmount
    )
    
    bid.save()
  }
}

export function handleCancellation(event: CancellationSellOrder): void {
  let bid = Bid.load(
    event.params.auctionId.toString() 
    + "-" + event.params.userId.toString()
    + "-" + event.params.buyAmount.toString()
    + "-" + event.params.sellAmount.toString()
  )

  if (bid) {
    bid.canceltx = event.transaction.hash
    bid.save()
  }
}

export function handleClaim(event: ClaimedFromOrder): void {
  let bid = Bid.load(
    event.params.auctionId.toString() 
    + "-" + event.params.userId.toString()
    + "-" + event.params.buyAmount.toString()
    + "-" + event.params.sellAmount.toString()
  )

  if (bid) {
    bid.claimtx = event.transaction.hash
    bid.save()
  }
}

export function handleAuctionCleared(event: AuctionCleared): void {
  let auction = Auction.load(event.params.auctionId.toString())

  if (auction) {
    auction.filled = event.params.soldAuctioningTokens
    auction.clearing = event.params.clearingPriceOrder
    auction.live = false

    auction.save()
  }
}

export function handleNewAuction(event: NewAuction): void {
  let vault = event.transaction.to.toHexString()
  let vaultExist = vaultList.includes(vault)

  if (vaultExist) {
    let auction = new Auction(event.params.auctionId.toString())
    let option = createOption(event.params._auctioningToken)
    let token = createToken(event.params._biddingToken)
    
    auction.option = option.id
    auction.bidding = token.id
    auction.minimum = event.params._minBuyAmount
    auction.size = event.params._auctionedSellAmount
    auction.start = event.block.timestamp
    auction.end = event.params.auctionEndDate
    auction.filled = BigInt.fromI32(0)
    auction.clearing = event.params.allowListData
    auction.live = true

    auction.save()
  }
}

export function handleNewUser(event: NewUser): void {
  let userId = event.params.userId
  let user = new Account(userId.toString())
  user.address = event.params.userAddress

  user.save()
}

export function handleNewOffer(event: NewOffer): void {
  let vault = event.transaction.to.toHexString()
  let vaultExist = vaultList.includes(vault)

  if (vaultExist) {
    let auction = new Auction(event.params.swapId.toString())
    let option = createOption(event.params.oToken)
    let token = createToken(event.params.biddingToken)
    
    auction.option = option.id
    auction.bidding = token.id
    auction.minimum = event.params.minPrice
    auction.size = event.params.totalSize
    auction.start = event.block.timestamp
    auction.end = BigInt.fromI32(0)
    auction.filled = BigInt.fromI32(0)
    auction.clearing = Bytes.fromHexString("") as Bytes
    auction.live = true

    auction.save()
  }
}

export function handleSwap(event: Swap): void {
  let swap = Auction.load(event.params.swapId.toString());

  if (swap == null) {
    return
  }

  swap.filled = swap.filled.plus(event.params.sellerAmount);
  swap.save();
}

export function handleSettleOffer(event: SettleOffer): void {
  let auction = Auction.load(event.params.swapId.toString())

  if (auction) {
    let Swap = SwapContract.bind(event.address)
    let clearingPrice = Swap.averagePriceForOffer(event.params.swapId)
    let clearingHex = clearingPrice.toHexString()
    let len = clearingHex.length
    clearingHex = len % 2 == 0 
      ? clearingHex
      : clearingHex.substring(0, 2) + "0" + clearingHex.substring(2) 
    auction.clearing = Bytes.fromHexString(clearingHex) as Bytes
    auction.end = event.block.timestamp
    auction.live = false

    auction.save()
  }
}
