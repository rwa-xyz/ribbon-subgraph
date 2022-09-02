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

export class Vault extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Vault entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Vault entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Vault", id.toString(), this);
  }

  static load(id: string): Vault | null {
    return store.get("Vault", id) as Vault | null;
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

  get totalPremiumEarned(): BigInt {
    let value = this.get("totalPremiumEarned");
    return value.toBigInt();
  }

  set totalPremiumEarned(value: BigInt) {
    this.set("totalPremiumEarned", Value.fromBigInt(value));
  }

  get totalNominalVolume(): BigInt {
    let value = this.get("totalNominalVolume");
    return value.toBigInt();
  }

  set totalNominalVolume(value: BigInt) {
    this.set("totalNominalVolume", Value.fromBigInt(value));
  }

  get totalNotionalVolume(): BigInt {
    let value = this.get("totalNotionalVolume");
    return value.toBigInt();
  }

  set totalNotionalVolume(value: BigInt) {
    this.set("totalNotionalVolume", Value.fromBigInt(value));
  }

  get totalBorrowed(): BigInt {
    let value = this.get("totalBorrowed");
    return value.toBigInt();
  }

  set totalBorrowed(value: BigInt) {
    this.set("totalBorrowed", Value.fromBigInt(value));
  }

  get principalOutstanding(): BigInt {
    let value = this.get("principalOutstanding");
    return value.toBigInt();
  }

  set principalOutstanding(value: BigInt) {
    this.set("principalOutstanding", Value.fromBigInt(value));
  }

  get numDepositors(): i32 {
    let value = this.get("numDepositors");
    return value.toI32();
  }

  set numDepositors(value: i32) {
    this.set("numDepositors", Value.fromI32(value));
  }

  get depositors(): Array<Bytes> {
    let value = this.get("depositors");
    return value.toBytesArray();
  }

  set depositors(value: Array<Bytes>) {
    this.set("depositors", Value.fromBytesArray(value));
  }

  get vaultAccounts(): Array<string> {
    let value = this.get("vaultAccounts");
    return value.toStringArray();
  }

  set vaultAccounts(value: Array<string>) {
    this.set("vaultAccounts", Value.fromStringArray(value));
  }

  get totalBalance(): BigInt {
    let value = this.get("totalBalance");
    return value.toBigInt();
  }

  set totalBalance(value: BigInt) {
    this.set("totalBalance", Value.fromBigInt(value));
  }

  get cap(): BigInt {
    let value = this.get("cap");
    return value.toBigInt();
  }

  set cap(value: BigInt) {
    this.set("cap", Value.fromBigInt(value));
  }

  get round(): i32 {
    let value = this.get("round");
    return value.toI32();
  }

  set round(value: i32) {
    this.set("round", Value.fromI32(value));
  }

  get performanceFeeCollected(): BigInt {
    let value = this.get("performanceFeeCollected");
    return value.toBigInt();
  }

  set performanceFeeCollected(value: BigInt) {
    this.set("performanceFeeCollected", Value.fromBigInt(value));
  }

  get managementFeeCollected(): BigInt {
    let value = this.get("managementFeeCollected");
    return value.toBigInt();
  }

  set managementFeeCollected(value: BigInt) {
    this.set("managementFeeCollected", Value.fromBigInt(value));
  }

  get totalFeeCollected(): BigInt {
    let value = this.get("totalFeeCollected");
    return value.toBigInt();
  }

  set totalFeeCollected(value: BigInt) {
    this.set("totalFeeCollected", Value.fromBigInt(value));
  }
}

export class VaultOpenLoan extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save VaultOpenLoan entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save VaultOpenLoan entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("VaultOpenLoan", id.toString(), this);
  }

  static load(id: string): VaultOpenLoan | null {
    return store.get("VaultOpenLoan", id) as VaultOpenLoan | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get vault(): string {
    let value = this.get("vault");
    return value.toString();
  }

  set vault(value: string) {
    this.set("vault", Value.fromString(value));
  }

  get loanAmount(): BigInt {
    let value = this.get("loanAmount");
    return value.toBigInt();
  }

  set loanAmount(value: BigInt) {
    this.set("loanAmount", Value.fromBigInt(value));
  }

  get withdrawAmount(): BigInt | null {
    let value = this.get("withdrawAmount");
    if (value === null || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set withdrawAmount(value: BigInt | null) {
    if (value === null) {
      this.unset("withdrawAmount");
    } else {
      this.set("withdrawAmount", Value.fromBigInt(value as BigInt));
    }
  }

  get optionAllocation(): BigInt {
    let value = this.get("optionAllocation");
    return value.toBigInt();
  }

  set optionAllocation(value: BigInt) {
    this.set("optionAllocation", Value.fromBigInt(value));
  }

  get borrower(): Bytes {
    let value = this.get("borrower");
    return value.toBytes();
  }

  set borrower(value: Bytes) {
    this.set("borrower", Value.fromBytes(value));
  }

  get optionSeller(): Bytes {
    let value = this.get("optionSeller");
    return value.toBytes();
  }

  set optionSeller(value: Bytes) {
    this.set("optionSeller", Value.fromBytes(value));
  }

  get loanTermLength(): BigInt {
    let value = this.get("loanTermLength");
    return value.toBigInt();
  }

  set loanTermLength(value: BigInt) {
    this.set("loanTermLength", Value.fromBigInt(value));
  }

  get optionPurchaseFreq(): BigInt {
    let value = this.get("optionPurchaseFreq");
    return value.toBigInt();
  }

  set optionPurchaseFreq(value: BigInt) {
    this.set("optionPurchaseFreq", Value.fromBigInt(value));
  }

  get subRounds(): BigInt {
    let value = this.get("subRounds");
    return value.toBigInt();
  }

  set subRounds(value: BigInt) {
    this.set("subRounds", Value.fromBigInt(value));
  }

  get isExercised(): boolean {
    let value = this.get("isExercised");
    return value.toBoolean();
  }

  set isExercised(value: boolean) {
    this.set("isExercised", Value.fromBoolean(value));
  }

  get expiry(): BigInt {
    let value = this.get("expiry");
    return value.toBigInt();
  }

  set expiry(value: BigInt) {
    this.set("expiry", Value.fromBigInt(value));
  }

  get openedAt(): BigInt {
    let value = this.get("openedAt");
    return value.toBigInt();
  }

  set openedAt(value: BigInt) {
    this.set("openedAt", Value.fromBigInt(value));
  }

  get openTxhash(): Bytes {
    let value = this.get("openTxhash");
    return value.toBytes();
  }

  set openTxhash(value: Bytes) {
    this.set("openTxhash", Value.fromBytes(value));
  }
}

export class VaultCloseLoan extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save VaultCloseLoan entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save VaultCloseLoan entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("VaultCloseLoan", id.toString(), this);
  }

  static load(id: string): VaultCloseLoan | null {
    return store.get("VaultCloseLoan", id) as VaultCloseLoan | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get vault(): string {
    let value = this.get("vault");
    return value.toString();
  }

  set vault(value: string) {
    this.set("vault", Value.fromString(value));
  }

  get paidAmount(): BigInt | null {
    let value = this.get("paidAmount");
    if (value === null || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set paidAmount(value: BigInt | null) {
    if (value === null) {
      this.unset("paidAmount");
    } else {
      this.set("paidAmount", Value.fromBigInt(value as BigInt));
    }
  }

  get borrower(): Bytes {
    let value = this.get("borrower");
    return value.toBytes();
  }

  set borrower(value: Bytes) {
    this.set("borrower", Value.fromBytes(value));
  }

  get _yield(): BigInt | null {
    let value = this.get("_yield");
    if (value === null || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set _yield(value: BigInt | null) {
    if (value === null) {
      this.unset("_yield");
    } else {
      this.set("_yield", Value.fromBigInt(value as BigInt));
    }
  }

  get loanAmount(): BigInt | null {
    let value = this.get("loanAmount");
    if (value === null || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set loanAmount(value: BigInt | null) {
    if (value === null) {
      this.unset("loanAmount");
    } else {
      this.set("loanAmount", Value.fromBigInt(value as BigInt));
    }
  }

  get isExercised(): boolean {
    let value = this.get("isExercised");
    return value.toBoolean();
  }

  set isExercised(value: boolean) {
    this.set("isExercised", Value.fromBoolean(value));
  }

  get closedAt(): BigInt {
    let value = this.get("closedAt");
    return value.toBigInt();
  }

  set closedAt(value: BigInt) {
    this.set("closedAt", Value.fromBigInt(value));
  }

  get premiumEarned(): BigInt | null {
    let value = this.get("premiumEarned");
    if (value === null || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set premiumEarned(value: BigInt | null) {
    if (value === null) {
      this.unset("premiumEarned");
    } else {
      this.set("premiumEarned", Value.fromBigInt(value as BigInt));
    }
  }

  get closeTxhash(): Bytes {
    let value = this.get("closeTxhash");
    return value.toBytes();
  }

  set closeTxhash(value: Bytes) {
    this.set("closeTxhash", Value.fromBytes(value));
  }
}

export class VaultOptionSold extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save VaultOptionSold entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save VaultOptionSold entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("VaultOptionSold", id.toString(), this);
  }

  static load(id: string): VaultOptionSold | null {
    return store.get("VaultOptionSold", id) as VaultOptionSold | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get vault(): string {
    let value = this.get("vault");
    return value.toString();
  }

  set vault(value: string) {
    this.set("vault", Value.fromString(value));
  }

  get premium(): BigInt {
    let value = this.get("premium");
    return value.toBigInt();
  }

  set premium(value: BigInt) {
    this.set("premium", Value.fromBigInt(value));
  }

  get optionAllocation(): BigInt {
    let value = this.get("optionAllocation");
    return value.toBigInt();
  }

  set optionAllocation(value: BigInt) {
    this.set("optionAllocation", Value.fromBigInt(value));
  }

  get optionSeller(): Bytes {
    let value = this.get("optionSeller");
    return value.toBytes();
  }

  set optionSeller(value: Bytes) {
    this.set("optionSeller", Value.fromBytes(value));
  }

  get optionPurchaseFreq(): BigInt {
    let value = this.get("optionPurchaseFreq");
    return value.toBigInt();
  }

  set optionPurchaseFreq(value: BigInt) {
    this.set("optionPurchaseFreq", Value.fromBigInt(value));
  }

  get subRounds(): BigInt {
    let value = this.get("subRounds");
    return value.toBigInt();
  }

  set subRounds(value: BigInt) {
    this.set("subRounds", Value.fromBigInt(value));
  }

  get soldAt(): BigInt {
    let value = this.get("soldAt");
    return value.toBigInt();
  }

  set soldAt(value: BigInt) {
    this.set("soldAt", Value.fromBigInt(value));
  }

  get txhash(): Bytes {
    let value = this.get("txhash");
    return value.toBytes();
  }

  set txhash(value: Bytes) {
    this.set("txhash", Value.fromBytes(value));
  }
}

export class VaultOptionYield extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save VaultOptionYield entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save VaultOptionYield entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("VaultOptionYield", id.toString(), this);
  }

  static load(id: string): VaultOptionYield | null {
    return store.get("VaultOptionYield", id) as VaultOptionYield | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get vault(): string {
    let value = this.get("vault");
    return value.toString();
  }

  set vault(value: string) {
    this.set("vault", Value.fromString(value));
  }

  get _yield(): BigInt {
    let value = this.get("_yield");
    return value.toBigInt();
  }

  set _yield(value: BigInt) {
    this.set("_yield", Value.fromBigInt(value));
  }

  get netYield(): BigInt {
    let value = this.get("netYield");
    return value.toBigInt();
  }

  set netYield(value: BigInt) {
    this.set("netYield", Value.fromBigInt(value));
  }

  get optionAllocation(): BigInt {
    let value = this.get("optionAllocation");
    return value.toBigInt();
  }

  set optionAllocation(value: BigInt) {
    this.set("optionAllocation", Value.fromBigInt(value));
  }

  get optionSeller(): Bytes {
    let value = this.get("optionSeller");
    return value.toBytes();
  }

  set optionSeller(value: Bytes) {
    this.set("optionSeller", Value.fromBytes(value));
  }

  get optionPurchaseFreq(): BigInt {
    let value = this.get("optionPurchaseFreq");
    return value.toBigInt();
  }

  set optionPurchaseFreq(value: BigInt) {
    this.set("optionPurchaseFreq", Value.fromBigInt(value));
  }

  get subRounds(): BigInt {
    let value = this.get("subRounds");
    return value.toBigInt();
  }

  set subRounds(value: BigInt) {
    this.set("subRounds", Value.fromBigInt(value));
  }

  get paidAt(): BigInt {
    let value = this.get("paidAt");
    return value.toBigInt();
  }

  set paidAt(value: BigInt) {
    this.set("paidAt", Value.fromBigInt(value));
  }

  get txhash(): Bytes {
    let value = this.get("txhash");
    return value.toBytes();
  }

  set txhash(value: Bytes) {
    this.set("txhash", Value.fromBytes(value));
  }
}

export class VaultOptionTrade extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save VaultOptionTrade entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save VaultOptionTrade entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("VaultOptionTrade", id.toString(), this);
  }

  static load(id: string): VaultOptionTrade | null {
    return store.get("VaultOptionTrade", id) as VaultOptionTrade | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get vault(): string {
    let value = this.get("vault");
    return value.toString();
  }

  set vault(value: string) {
    this.set("vault", Value.fromString(value));
  }

  get VaultOpenLoan(): string {
    let value = this.get("VaultOpenLoan");
    return value.toString();
  }

  set VaultOpenLoan(value: string) {
    this.set("VaultOpenLoan", Value.fromString(value));
  }

  get sellAmount(): BigInt {
    let value = this.get("sellAmount");
    return value.toBigInt();
  }

  set sellAmount(value: BigInt) {
    this.set("sellAmount", Value.fromBigInt(value));
  }

  get premium(): BigInt {
    let value = this.get("premium");
    return value.toBigInt();
  }

  set premium(value: BigInt) {
    this.set("premium", Value.fromBigInt(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }

  get txhash(): Bytes {
    let value = this.get("txhash");
    return value.toBytes();
  }

  set txhash(value: Bytes) {
    this.set("txhash", Value.fromBytes(value));
  }
}

export class VaultAccount extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save VaultAccount entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save VaultAccount entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("VaultAccount", id.toString(), this);
  }

  static load(id: string): VaultAccount | null {
    return store.get("VaultAccount", id) as VaultAccount | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get vault(): string {
    let value = this.get("vault");
    return value.toString();
  }

  set vault(value: string) {
    this.set("vault", Value.fromString(value));
  }

  get account(): Bytes {
    let value = this.get("account");
    return value.toBytes();
  }

  set account(value: Bytes) {
    this.set("account", Value.fromBytes(value));
  }

  get updateCounter(): i32 {
    let value = this.get("updateCounter");
    return value.toI32();
  }

  set updateCounter(value: i32) {
    this.set("updateCounter", Value.fromI32(value));
  }

  get totalYieldEarned(): BigInt {
    let value = this.get("totalYieldEarned");
    return value.toBigInt();
  }

  set totalYieldEarned(value: BigInt) {
    this.set("totalYieldEarned", Value.fromBigInt(value));
  }

  get totalDeposits(): BigInt {
    let value = this.get("totalDeposits");
    return value.toBigInt();
  }

  set totalDeposits(value: BigInt) {
    this.set("totalDeposits", Value.fromBigInt(value));
  }

  get totalBalance(): BigInt {
    let value = this.get("totalBalance");
    return value.toBigInt();
  }

  set totalBalance(value: BigInt) {
    this.set("totalBalance", Value.fromBigInt(value));
  }

  get totalScheduledWithdrawal(): BigInt {
    let value = this.get("totalScheduledWithdrawal");
    return value.toBigInt();
  }

  set totalScheduledWithdrawal(value: BigInt) {
    this.set("totalScheduledWithdrawal", Value.fromBigInt(value));
  }

  get scheduledWithdrawalRoundPricePerShare(): BigInt {
    let value = this.get("scheduledWithdrawalRoundPricePerShare");
    return value.toBigInt();
  }

  set scheduledWithdrawalRoundPricePerShare(value: BigInt) {
    this.set("scheduledWithdrawalRoundPricePerShare", Value.fromBigInt(value));
  }

  get shares(): BigInt {
    let value = this.get("shares");
    return value.toBigInt();
  }

  set shares(value: BigInt) {
    this.set("shares", Value.fromBigInt(value));
  }

  get totalPendingDeposit(): BigInt {
    let value = this.get("totalPendingDeposit");
    return value.toBigInt();
  }

  set totalPendingDeposit(value: BigInt) {
    this.set("totalPendingDeposit", Value.fromBigInt(value));
  }

  get depositInRound(): i32 {
    let value = this.get("depositInRound");
    return value.toI32();
  }

  set depositInRound(value: i32) {
    this.set("depositInRound", Value.fromI32(value));
  }
}

export class VaultPerformanceUpdate extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(
      id !== null,
      "Cannot save VaultPerformanceUpdate entity without an ID"
    );
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save VaultPerformanceUpdate entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("VaultPerformanceUpdate", id.toString(), this);
  }

  static load(id: string): VaultPerformanceUpdate | null {
    return store.get(
      "VaultPerformanceUpdate",
      id
    ) as VaultPerformanceUpdate | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get vault(): string {
    let value = this.get("vault");
    return value.toString();
  }

  set vault(value: string) {
    this.set("vault", Value.fromString(value));
  }

  get pricePerShare(): BigInt {
    let value = this.get("pricePerShare");
    return value.toBigInt();
  }

  set pricePerShare(value: BigInt) {
    this.set("pricePerShare", Value.fromBigInt(value));
  }

  get timestamp(): i32 {
    let value = this.get("timestamp");
    return value.toI32();
  }

  set timestamp(value: i32) {
    this.set("timestamp", Value.fromI32(value));
  }

  get round(): i32 {
    let value = this.get("round");
    return value.toI32();
  }

  set round(value: i32) {
    this.set("round", Value.fromI32(value));
  }
}

export class VaultTransaction extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save VaultTransaction entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save VaultTransaction entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("VaultTransaction", id.toString(), this);
  }

  static load(id: string): VaultTransaction | null {
    return store.get("VaultTransaction", id) as VaultTransaction | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get vault(): string {
    let value = this.get("vault");
    return value.toString();
  }

  set vault(value: string) {
    this.set("vault", Value.fromString(value));
  }

  get type(): string {
    let value = this.get("type");
    return value.toString();
  }

  set type(value: string) {
    this.set("type", Value.fromString(value));
  }

  get address(): Bytes {
    let value = this.get("address");
    return value.toBytes();
  }

  set address(value: Bytes) {
    this.set("address", Value.fromBytes(value));
  }

  get txhash(): Bytes {
    let value = this.get("txhash");
    return value.toBytes();
  }

  set txhash(value: Bytes) {
    this.set("txhash", Value.fromBytes(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }

  get amount(): BigInt {
    let value = this.get("amount");
    return value.toBigInt();
  }

  set amount(value: BigInt) {
    this.set("amount", Value.fromBigInt(value));
  }

  get underlyingAmount(): BigInt {
    let value = this.get("underlyingAmount");
    return value.toBigInt();
  }

  set underlyingAmount(value: BigInt) {
    this.set("underlyingAmount", Value.fromBigInt(value));
  }
}

export class BalanceUpdate extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save BalanceUpdate entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save BalanceUpdate entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("BalanceUpdate", id.toString(), this);
  }

  static load(id: string): BalanceUpdate | null {
    return store.get("BalanceUpdate", id) as BalanceUpdate | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get vault(): string {
    let value = this.get("vault");
    return value.toString();
  }

  set vault(value: string) {
    this.set("vault", Value.fromString(value));
  }

  get account(): Bytes {
    let value = this.get("account");
    return value.toBytes();
  }

  set account(value: Bytes) {
    this.set("account", Value.fromBytes(value));
  }

  get timestamp(): i32 {
    let value = this.get("timestamp");
    return value.toI32();
  }

  set timestamp(value: i32) {
    this.set("timestamp", Value.fromI32(value));
  }

  get balance(): BigInt {
    let value = this.get("balance");
    return value.toBigInt();
  }

  set balance(value: BigInt) {
    this.set("balance", Value.fromBigInt(value));
  }

  get yieldEarned(): BigInt {
    let value = this.get("yieldEarned");
    return value.toBigInt();
  }

  set yieldEarned(value: BigInt) {
    this.set("yieldEarned", Value.fromBigInt(value));
  }

  get isWithdraw(): boolean {
    let value = this.get("isWithdraw");
    return value.toBoolean();
  }

  set isWithdraw(value: boolean) {
    this.set("isWithdraw", Value.fromBoolean(value));
  }
}

export class ERC20Token extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save ERC20Token entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save ERC20Token entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("ERC20Token", id.toString(), this);
  }

  static load(id: string): ERC20Token | null {
    return store.get("ERC20Token", id) as ERC20Token | null;
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

  get numHolders(): i32 {
    let value = this.get("numHolders");
    return value.toI32();
  }

  set numHolders(value: i32) {
    this.set("numHolders", Value.fromI32(value));
  }

  get holders(): Array<Bytes> {
    let value = this.get("holders");
    return value.toBytesArray();
  }

  set holders(value: Array<Bytes>) {
    this.set("holders", Value.fromBytesArray(value));
  }

  get tokenAccounts(): Array<string> {
    let value = this.get("tokenAccounts");
    return value.toStringArray();
  }

  set tokenAccounts(value: Array<string>) {
    this.set("tokenAccounts", Value.fromStringArray(value));
  }

  get totalSupply(): BigInt {
    let value = this.get("totalSupply");
    return value.toBigInt();
  }

  set totalSupply(value: BigInt) {
    this.set("totalSupply", Value.fromBigInt(value));
  }
}

export class ERC20TokenAccount extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save ERC20TokenAccount entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save ERC20TokenAccount entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("ERC20TokenAccount", id.toString(), this);
  }

  static load(id: string): ERC20TokenAccount | null {
    return store.get("ERC20TokenAccount", id) as ERC20TokenAccount | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get token(): string {
    let value = this.get("token");
    return value.toString();
  }

  set token(value: string) {
    this.set("token", Value.fromString(value));
  }

  get balance(): BigInt {
    let value = this.get("balance");
    return value.toBigInt();
  }

  set balance(value: BigInt) {
    this.set("balance", Value.fromBigInt(value));
  }

  get account(): Bytes {
    let value = this.get("account");
    return value.toBytes();
  }

  set account(value: Bytes) {
    this.set("account", Value.fromBytes(value));
  }
}
