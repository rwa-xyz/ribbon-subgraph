// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Address,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class Auction extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Auction entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Auction entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Auction", id.toString(), this);
  }

  static load(id: string): Auction | null {
    return store.get("Auction", id) as Auction | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get option(): string {
    let value = this.get("option");
    return value.toString();
  }

  set option(value: string) {
    this.set("option", Value.fromString(value));
  }

  get bidding(): string {
    let value = this.get("bidding");
    return value.toString();
  }

  set bidding(value: string) {
    this.set("bidding", Value.fromString(value));
  }

  get minimum(): BigInt {
    let value = this.get("minimum");
    return value.toBigInt();
  }

  set minimum(value: BigInt) {
    this.set("minimum", Value.fromBigInt(value));
  }

  get size(): BigInt {
    let value = this.get("size");
    return value.toBigInt();
  }

  set size(value: BigInt) {
    this.set("size", Value.fromBigInt(value));
  }

  get start(): BigInt {
    let value = this.get("start");
    return value.toBigInt();
  }

  set start(value: BigInt) {
    this.set("start", Value.fromBigInt(value));
  }

  get end(): BigInt {
    let value = this.get("end");
    return value.toBigInt();
  }

  set end(value: BigInt) {
    this.set("end", Value.fromBigInt(value));
  }

  get filled(): BigInt {
    let value = this.get("filled");
    return value.toBigInt();
  }

  set filled(value: BigInt) {
    this.set("filled", Value.fromBigInt(value));
  }

  get clearing(): Bytes {
    let value = this.get("clearing");
    return value.toBytes();
  }

  set clearing(value: Bytes) {
    this.set("clearing", Value.fromBytes(value));
  }

  get live(): boolean {
    let value = this.get("live");
    return value.toBoolean();
  }

  set live(value: boolean) {
    this.set("live", Value.fromBoolean(value));
  }
}

export class Account extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Account entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Account entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Account", id.toString(), this);
  }

  static load(id: string): Account | null {
    return store.get("Account", id) as Account | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get userid(): string {
    let value = this.get("userid");
    return value.toString();
  }

  set userid(value: string) {
    this.set("userid", Value.fromString(value));
  }

  get bids(): Array<string> | null {
    let value = this.get("bids");
    if (value === null || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toStringArray();
    }
  }

  set bids(value: Array<string> | null) {
    if (value === null) {
      this.unset("bids");
    } else {
      this.set("bids", Value.fromStringArray(value as Array<string>));
    }
  }
}

export class Bid extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Bid entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Bid entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Bid", id.toString(), this);
  }

  static load(id: string): Bid | null {
    return store.get("Bid", id) as Bid | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get index(): BigInt {
    let value = this.get("index");
    return value.toBigInt();
  }

  set index(value: BigInt) {
    this.set("index", Value.fromBigInt(value));
  }

  get auction(): i32 {
    let value = this.get("auction");
    return value.toI32();
  }

  set auction(value: i32) {
    this.set("auction", Value.fromI32(value));
  }

  get account(): string {
    let value = this.get("account");
    return value.toString();
  }

  set account(value: string) {
    this.set("account", Value.fromString(value));
  }

  get size(): BigInt {
    let value = this.get("size");
    return value.toBigInt();
  }

  set size(value: BigInt) {
    this.set("size", Value.fromBigInt(value));
  }

  get payable(): BigInt {
    let value = this.get("payable");
    return value.toBigInt();
  }

  set payable(value: BigInt) {
    this.set("payable", Value.fromBigInt(value));
  }

  get bytes(): string {
    let value = this.get("bytes");
    return value.toString();
  }

  set bytes(value: string) {
    this.set("bytes", Value.fromString(value));
  }

  get createtx(): Bytes {
    let value = this.get("createtx");
    return value.toBytes();
  }

  set createtx(value: Bytes) {
    this.set("createtx", Value.fromBytes(value));
  }

  get canceltx(): Bytes | null {
    let value = this.get("canceltx");
    if (value === null || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBytes();
    }
  }

  set canceltx(value: Bytes | null) {
    if (value === null) {
      this.unset("canceltx");
    } else {
      this.set("canceltx", Value.fromBytes(value as Bytes));
    }
  }

  get claimtx(): Bytes | null {
    let value = this.get("claimtx");
    if (value === null || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBytes();
    }
  }

  set claimtx(value: Bytes | null) {
    if (value === null) {
      this.unset("claimtx");
    } else {
      this.set("claimtx", Value.fromBytes(value as Bytes));
    }
  }
}

export class Token extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Token entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Token entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Token", id.toString(), this);
  }

  static load(id: string): Token | null {
    return store.get("Token", id) as Token | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get name(): string {
    let value = this.get("name");
    return value.toString();
  }

  set name(value: string) {
    this.set("name", Value.fromString(value));
  }

  get symbol(): string {
    let value = this.get("symbol");
    return value.toString();
  }

  set symbol(value: string) {
    this.set("symbol", Value.fromString(value));
  }

  get decimals(): i32 {
    let value = this.get("decimals");
    return value.toI32();
  }

  set decimals(value: i32) {
    this.set("decimals", Value.fromI32(value));
  }
}

export class Option extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Option entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Option entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Option", id.toString(), this);
  }

  static load(id: string): Option | null {
    return store.get("Option", id) as Option | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get name(): string {
    let value = this.get("name");
    return value.toString();
  }

  set name(value: string) {
    this.set("name", Value.fromString(value));
  }

  get symbol(): string {
    let value = this.get("symbol");
    return value.toString();
  }

  set symbol(value: string) {
    this.set("symbol", Value.fromString(value));
  }

  get decimals(): i32 {
    let value = this.get("decimals");
    return value.toI32();
  }

  set decimals(value: i32) {
    this.set("decimals", Value.fromI32(value));
  }

  get expiry(): BigInt {
    let value = this.get("expiry");
    return value.toBigInt();
  }

  set expiry(value: BigInt) {
    this.set("expiry", Value.fromBigInt(value));
  }

  get strike(): BigInt {
    let value = this.get("strike");
    return value.toBigInt();
  }

  set strike(value: BigInt) {
    this.set("strike", Value.fromBigInt(value));
  }

  get underlying(): string {
    let value = this.get("underlying");
    return value.toString();
  }

  set underlying(value: string) {
    this.set("underlying", Value.fromString(value));
  }

  get put(): boolean {
    let value = this.get("put");
    return value.toBoolean();
  }

  set put(value: boolean) {
    this.set("put", Value.fromBoolean(value));
  }
}
