import { Address } from "@graphprotocol/graph-ts";
import { oToken } from "../generated/GnosisAuction/oToken";
import { ERC20 } from "../generated/GnosisAuction/ERC20";
import {
  Token,
  Option
} from "../generated/schema";

export function createToken(
  newToken: Address
): Token {
  let tokenContract = ERC20.bind(newToken)
  let token = new Token(newToken.toHexString());
  token.name = tokenContract.name()
  token.symbol = tokenContract.symbol()
  token.decimals = tokenContract.decimals()
  token.save()

  return token as Token;
}

export function createOption(
  newOption: Address
): Option {
  let oTokenContract = oToken.bind(newOption)
  let option = new Option(newOption.toHexString());

  let underlying = Token.load(oTokenContract.underlyingAsset().toHexString())
  if (!underlying) {
    underlying = createToken(oTokenContract.underlyingAsset())
  }

  option.name = oTokenContract.name()
  option.symbol = oTokenContract.symbol()
  option.decimals = oTokenContract.decimals()
  option.expiry = oTokenContract.expiryTimestamp()
  option.strike = oTokenContract.strikePrice()
  option.underlying = underlying.id
  option.put = oTokenContract.isPut()
  option.save()
  
  return option as Option;
}
