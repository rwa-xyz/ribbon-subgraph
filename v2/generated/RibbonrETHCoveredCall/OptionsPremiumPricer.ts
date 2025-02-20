// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class OptionsPremiumPricer extends ethereum.SmartContract {
  static bind(address: Address): OptionsPremiumPricer {
    return new OptionsPremiumPricer("OptionsPremiumPricer", address);
  }

  getOptionDelta(st: BigInt, expiryTimestamp: BigInt): BigInt {
    let result = super.call(
      "getOptionDelta",
      "getOptionDelta(uint256,uint256):(uint256)",
      [
        ethereum.Value.fromUnsignedBigInt(st),
        ethereum.Value.fromUnsignedBigInt(expiryTimestamp)
      ]
    );

    return result[0].toBigInt();
  }

  try_getOptionDelta(
    st: BigInt,
    expiryTimestamp: BigInt
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "getOptionDelta",
      "getOptionDelta(uint256,uint256):(uint256)",
      [
        ethereum.Value.fromUnsignedBigInt(st),
        ethereum.Value.fromUnsignedBigInt(expiryTimestamp)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  getOptionDelta1(
    sp: BigInt,
    st: BigInt,
    v: BigInt,
    expiryTimestamp: BigInt
  ): BigInt {
    let result = super.call(
      "getOptionDelta",
      "getOptionDelta(uint256,uint256,uint256,uint256):(uint256)",
      [
        ethereum.Value.fromUnsignedBigInt(sp),
        ethereum.Value.fromUnsignedBigInt(st),
        ethereum.Value.fromUnsignedBigInt(v),
        ethereum.Value.fromUnsignedBigInt(expiryTimestamp)
      ]
    );

    return result[0].toBigInt();
  }

  try_getOptionDelta1(
    sp: BigInt,
    st: BigInt,
    v: BigInt,
    expiryTimestamp: BigInt
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "getOptionDelta",
      "getOptionDelta(uint256,uint256,uint256,uint256):(uint256)",
      [
        ethereum.Value.fromUnsignedBigInt(sp),
        ethereum.Value.fromUnsignedBigInt(st),
        ethereum.Value.fromUnsignedBigInt(v),
        ethereum.Value.fromUnsignedBigInt(expiryTimestamp)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  getPremium(st: BigInt, expiryTimestamp: BigInt, isPut: boolean): BigInt {
    let result = super.call(
      "getPremium",
      "getPremium(uint256,uint256,bool):(uint256)",
      [
        ethereum.Value.fromUnsignedBigInt(st),
        ethereum.Value.fromUnsignedBigInt(expiryTimestamp),
        ethereum.Value.fromBoolean(isPut)
      ]
    );

    return result[0].toBigInt();
  }

  try_getPremium(
    st: BigInt,
    expiryTimestamp: BigInt,
    isPut: boolean
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "getPremium",
      "getPremium(uint256,uint256,bool):(uint256)",
      [
        ethereum.Value.fromUnsignedBigInt(st),
        ethereum.Value.fromUnsignedBigInt(expiryTimestamp),
        ethereum.Value.fromBoolean(isPut)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  getUnderlyingPrice(): BigInt {
    let result = super.call(
      "getUnderlyingPrice",
      "getUnderlyingPrice():(uint256)",
      []
    );

    return result[0].toBigInt();
  }

  try_getUnderlyingPrice(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "getUnderlyingPrice",
      "getUnderlyingPrice():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  pool(): Address {
    let result = super.call("pool", "pool():(address)", []);

    return result[0].toAddress();
  }

  try_pool(): ethereum.CallResult<Address> {
    let result = super.tryCall("pool", "pool():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  priceOracle(): Address {
    let result = super.call("priceOracle", "priceOracle():(address)", []);

    return result[0].toAddress();
  }

  try_priceOracle(): ethereum.CallResult<Address> {
    let result = super.tryCall("priceOracle", "priceOracle():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  stablesOracle(): Address {
    let result = super.call("stablesOracle", "stablesOracle():(address)", []);

    return result[0].toAddress();
  }

  try_stablesOracle(): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "stablesOracle",
      "stablesOracle():(address)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  volatilityOracle(): Address {
    let result = super.call(
      "volatilityOracle",
      "volatilityOracle():(address)",
      []
    );

    return result[0].toAddress();
  }

  try_volatilityOracle(): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "volatilityOracle",
      "volatilityOracle():(address)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }
}

export class ConstructorCall extends ethereum.Call {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }

  get _pool(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _volatilityOracle(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get _priceOracle(): Address {
    return this._call.inputValues[2].value.toAddress();
  }

  get _stablesOracle(): Address {
    return this._call.inputValues[3].value.toAddress();
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}
