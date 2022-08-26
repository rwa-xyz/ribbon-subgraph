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

export class OwnershipTransferred extends ethereum.Event {
  get params(): OwnershipTransferred__Params {
    return new OwnershipTransferred__Params(this);
  }
}

export class OwnershipTransferred__Params {
  _event: OwnershipTransferred;

  constructor(event: OwnershipTransferred) {
    this._event = event;
  }

  get previousOwner(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get newOwner(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class Pause extends ethereum.Event {
  get params(): Pause__Params {
    return new Pause__Params(this);
  }
}

export class Pause__Params {
  _event: Pause;

  constructor(event: Pause) {
    this._event = event;
  }

  get account(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get vaultAddress(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get share(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }

  get round(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }
}

export class ProcessWithdrawal extends ethereum.Event {
  get params(): ProcessWithdrawal__Params {
    return new ProcessWithdrawal__Params(this);
  }
}

export class ProcessWithdrawal__Params {
  _event: ProcessWithdrawal;

  constructor(event: ProcessWithdrawal) {
    this._event = event;
  }

  get vaultAddress(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get round(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class Resume extends ethereum.Event {
  get params(): Resume__Params {
    return new Resume__Params(this);
  }
}

export class Resume__Params {
  _event: Resume;

  constructor(event: Resume) {
    this._event = event;
  }

  get account(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get vaultAddress(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get withdrawAmount(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class RibbonVaultPauser__getPausePositionResultValue0Struct extends ethereum.Tuple {
  get round(): i32 {
    return this[0].toI32();
  }

  get shares(): BigInt {
    return this[1].toBigInt();
  }
}

export class RibbonVaultPauser__pausedPositionsResult {
  value0: i32;
  value1: BigInt;

  constructor(value0: i32, value1: BigInt) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set(
      "value0",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(this.value0))
    );
    map.set("value1", ethereum.Value.fromUnsignedBigInt(this.value1));
    return map;
  }

  getRound(): i32 {
    return this.value0;
  }

  getShares(): BigInt {
    return this.value1;
  }
}

export class RibbonVaultPauser extends ethereum.SmartContract {
  static bind(address: Address): RibbonVaultPauser {
    return new RibbonVaultPauser("RibbonVaultPauser", address);
  }

  STETH(): Address {
    let result = super.call("STETH", "STETH():(address)", []);

    return result[0].toAddress();
  }

  try_STETH(): ethereum.CallResult<Address> {
    let result = super.tryCall("STETH", "STETH():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  STETH_VAULT(): Address {
    let result = super.call("STETH_VAULT", "STETH_VAULT():(address)", []);

    return result[0].toAddress();
  }

  try_STETH_VAULT(): ethereum.CallResult<Address> {
    let result = super.tryCall("STETH_VAULT", "STETH_VAULT():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  WETH(): Address {
    let result = super.call("WETH", "WETH():(address)", []);

    return result[0].toAddress();
  }

  try_WETH(): ethereum.CallResult<Address> {
    let result = super.tryCall("WETH", "WETH():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  getPausePosition(
    _vaultAddress: Address,
    _userAddress: Address
  ): RibbonVaultPauser__getPausePositionResultValue0Struct {
    let result = super.call(
      "getPausePosition",
      "getPausePosition(address,address):((uint16,uint128))",
      [
        ethereum.Value.fromAddress(_vaultAddress),
        ethereum.Value.fromAddress(_userAddress)
      ]
    );

    return changetype<RibbonVaultPauser__getPausePositionResultValue0Struct>(
      result[0].toTuple()
    );
  }

  try_getPausePosition(
    _vaultAddress: Address,
    _userAddress: Address
  ): ethereum.CallResult<
    RibbonVaultPauser__getPausePositionResultValue0Struct
  > {
    let result = super.tryCall(
      "getPausePosition",
      "getPausePosition(address,address):((uint16,uint128))",
      [
        ethereum.Value.fromAddress(_vaultAddress),
        ethereum.Value.fromAddress(_userAddress)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      changetype<RibbonVaultPauser__getPausePositionResultValue0Struct>(
        value[0].toTuple()
      )
    );
  }

  keeper(): Address {
    let result = super.call("keeper", "keeper():(address)", []);

    return result[0].toAddress();
  }

  try_keeper(): ethereum.CallResult<Address> {
    let result = super.tryCall("keeper", "keeper():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  owner(): Address {
    let result = super.call("owner", "owner():(address)", []);

    return result[0].toAddress();
  }

  try_owner(): ethereum.CallResult<Address> {
    let result = super.tryCall("owner", "owner():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  pausedPositions(
    param0: Address,
    param1: Address
  ): RibbonVaultPauser__pausedPositionsResult {
    let result = super.call(
      "pausedPositions",
      "pausedPositions(address,address):(uint16,uint128)",
      [ethereum.Value.fromAddress(param0), ethereum.Value.fromAddress(param1)]
    );

    return new RibbonVaultPauser__pausedPositionsResult(
      result[0].toI32(),
      result[1].toBigInt()
    );
  }

  try_pausedPositions(
    param0: Address,
    param1: Address
  ): ethereum.CallResult<RibbonVaultPauser__pausedPositionsResult> {
    let result = super.tryCall(
      "pausedPositions",
      "pausedPositions(address,address):(uint16,uint128)",
      [ethereum.Value.fromAddress(param0), ethereum.Value.fromAddress(param1)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new RibbonVaultPauser__pausedPositionsResult(
        value[0].toI32(),
        value[1].toBigInt()
      )
    );
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

  get _keeper(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _weth(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get _steth(): Address {
    return this._call.inputValues[2].value.toAddress();
  }

  get _steth_vault(): Address {
    return this._call.inputValues[3].value.toAddress();
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class DefaultCall extends ethereum.Call {
  get inputs(): DefaultCall__Inputs {
    return new DefaultCall__Inputs(this);
  }

  get outputs(): DefaultCall__Outputs {
    return new DefaultCall__Outputs(this);
  }
}

export class DefaultCall__Inputs {
  _call: DefaultCall;

  constructor(call: DefaultCall) {
    this._call = call;
  }
}

export class DefaultCall__Outputs {
  _call: DefaultCall;

  constructor(call: DefaultCall) {
    this._call = call;
  }
}

export class AddVaultCall extends ethereum.Call {
  get inputs(): AddVaultCall__Inputs {
    return new AddVaultCall__Inputs(this);
  }

  get outputs(): AddVaultCall__Outputs {
    return new AddVaultCall__Outputs(this);
  }
}

export class AddVaultCall__Inputs {
  _call: AddVaultCall;

  constructor(call: AddVaultCall) {
    this._call = call;
  }

  get _vaultAddress(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class AddVaultCall__Outputs {
  _call: AddVaultCall;

  constructor(call: AddVaultCall) {
    this._call = call;
  }
}

export class PausePositionCall extends ethereum.Call {
  get inputs(): PausePositionCall__Inputs {
    return new PausePositionCall__Inputs(this);
  }

  get outputs(): PausePositionCall__Outputs {
    return new PausePositionCall__Outputs(this);
  }
}

export class PausePositionCall__Inputs {
  _call: PausePositionCall;

  constructor(call: PausePositionCall) {
    this._call = call;
  }

  get _account(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _amount(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class PausePositionCall__Outputs {
  _call: PausePositionCall;

  constructor(call: PausePositionCall) {
    this._call = call;
  }
}

export class ProcessWithdrawalCall extends ethereum.Call {
  get inputs(): ProcessWithdrawalCall__Inputs {
    return new ProcessWithdrawalCall__Inputs(this);
  }

  get outputs(): ProcessWithdrawalCall__Outputs {
    return new ProcessWithdrawalCall__Outputs(this);
  }
}

export class ProcessWithdrawalCall__Inputs {
  _call: ProcessWithdrawalCall;

  constructor(call: ProcessWithdrawalCall) {
    this._call = call;
  }

  get _vaultAddress(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class ProcessWithdrawalCall__Outputs {
  _call: ProcessWithdrawalCall;

  constructor(call: ProcessWithdrawalCall) {
    this._call = call;
  }
}

export class RenounceOwnershipCall extends ethereum.Call {
  get inputs(): RenounceOwnershipCall__Inputs {
    return new RenounceOwnershipCall__Inputs(this);
  }

  get outputs(): RenounceOwnershipCall__Outputs {
    return new RenounceOwnershipCall__Outputs(this);
  }
}

export class RenounceOwnershipCall__Inputs {
  _call: RenounceOwnershipCall;

  constructor(call: RenounceOwnershipCall) {
    this._call = call;
  }
}

export class RenounceOwnershipCall__Outputs {
  _call: RenounceOwnershipCall;

  constructor(call: RenounceOwnershipCall) {
    this._call = call;
  }
}

export class ResumePositionCall extends ethereum.Call {
  get inputs(): ResumePositionCall__Inputs {
    return new ResumePositionCall__Inputs(this);
  }

  get outputs(): ResumePositionCall__Outputs {
    return new ResumePositionCall__Outputs(this);
  }
}

export class ResumePositionCall__Inputs {
  _call: ResumePositionCall;

  constructor(call: ResumePositionCall) {
    this._call = call;
  }

  get _vaultAddress(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class ResumePositionCall__Outputs {
  _call: ResumePositionCall;

  constructor(call: ResumePositionCall) {
    this._call = call;
  }
}

export class SetNewKeeperCall extends ethereum.Call {
  get inputs(): SetNewKeeperCall__Inputs {
    return new SetNewKeeperCall__Inputs(this);
  }

  get outputs(): SetNewKeeperCall__Outputs {
    return new SetNewKeeperCall__Outputs(this);
  }
}

export class SetNewKeeperCall__Inputs {
  _call: SetNewKeeperCall;

  constructor(call: SetNewKeeperCall) {
    this._call = call;
  }

  get _newKeeper(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class SetNewKeeperCall__Outputs {
  _call: SetNewKeeperCall;

  constructor(call: SetNewKeeperCall) {
    this._call = call;
  }
}

export class TransferOwnershipCall extends ethereum.Call {
  get inputs(): TransferOwnershipCall__Inputs {
    return new TransferOwnershipCall__Inputs(this);
  }

  get outputs(): TransferOwnershipCall__Outputs {
    return new TransferOwnershipCall__Outputs(this);
  }
}

export class TransferOwnershipCall__Inputs {
  _call: TransferOwnershipCall;

  constructor(call: TransferOwnershipCall) {
    this._call = call;
  }

  get newOwner(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class TransferOwnershipCall__Outputs {
  _call: TransferOwnershipCall;

  constructor(call: TransferOwnershipCall) {
    this._call = call;
  }
}
