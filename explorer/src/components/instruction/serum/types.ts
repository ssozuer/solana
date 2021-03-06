/* eslint-disable @typescript-eslint/no-redeclare */

import { decodeInstruction, MARKETS } from "@project-serum/serum";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import BN from "bn.js";
import { coerce, enums, number, optional, pick, StructType } from "superstruct";
import { BigNumValue } from "validators/bignum";
import { Pubkey } from "validators/pubkey";

const SERUM_PROGRAM_ID = "4ckmDgGdxQoPDLUkDT3vHgSAkzA3QRdNq5ywwY4sUSJn";

export const SERUM_DECODED_MAX = 6;

export type Side = StructType<typeof Side>;
export const Side = enums(["buy", "sell"]);

export type OrderType = StructType<typeof OrderType>;
export const OrderType = enums(["limit", "ioc", "postOnly"]);

export type InitializeMarket = {
  market: PublicKey;
  requestQueue: PublicKey;
  eventQueue: PublicKey;
  bids: PublicKey;
  asks: PublicKey;
  baseVault: PublicKey;
  quoteVault: PublicKey;
  baseMint: PublicKey;
  quoteMint: PublicKey;
  baseLotSize: BN;
  quoteLotSize: BN;
  feeRateBps: number;
  vaultSignerNonce: BN;
  quoteDustThreshold: BN;
  programId: PublicKey;
};

export const InitializeMarketDecode = pick({
  baseLotSize: BigNumValue,
  quoteLotSize: BigNumValue,
  feeRateBps: number(),
  quoteDustThreshold: BigNumValue,
  vaultSignerNonce: BigNumValue,
});

export function decodeInitializeMarket(
  ix: TransactionInstruction
): InitializeMarket {
  const decoded = coerce(
    decodeInstruction(ix.data).initializeMarket,
    InitializeMarketDecode
  );

  let initializeMarket: InitializeMarket = {
    market: ix.keys[0].pubkey,
    requestQueue: ix.keys[1].pubkey,
    eventQueue: ix.keys[2].pubkey,
    bids: ix.keys[3].pubkey,
    asks: ix.keys[4].pubkey,
    baseVault: ix.keys[5].pubkey,
    quoteVault: ix.keys[6].pubkey,
    baseMint: ix.keys[7].pubkey,
    quoteMint: ix.keys[8].pubkey,
    programId: ix.programId,
    baseLotSize: decoded.baseLotSize as BN,
    quoteLotSize: decoded.quoteLotSize as BN,
    feeRateBps: decoded.feeRateBps,
    quoteDustThreshold: decoded.quoteDustThreshold as BN,
    vaultSignerNonce: decoded.vaultSignerNonce as BN,
  };

  return initializeMarket;
}

export type NewOrder = {
  market: PublicKey;
  openOrders: PublicKey;
  requestQueue: PublicKey;
  payer: PublicKey;
  owner: PublicKey;
  baseVault: PublicKey;
  quoteVault: PublicKey;
  programId: PublicKey;
  feeDiscountPubkey?: PublicKey;
  side: Side;
  limitPrice: BN;
  maxQuantity: BN;
  orderType: OrderType;
  clientId: BN;
};

export const NewOrderDecode = pick({
  side: Side,
  limitPrice: BigNumValue,
  maxQuantity: BigNumValue,
  orderType: OrderType,
  clientId: BigNumValue,
  feeDiscountPubkey: optional(Pubkey),
});

export function decodeNewOrder(ix: TransactionInstruction): NewOrder {
  const decoded = coerce(decodeInstruction(ix.data).newOrder, NewOrderDecode);

  let newOrder: NewOrder = {
    market: ix.keys[0].pubkey,
    openOrders: ix.keys[1].pubkey,
    requestQueue: ix.keys[2].pubkey,
    payer: ix.keys[3].pubkey,
    owner: ix.keys[4].pubkey,
    baseVault: ix.keys[5].pubkey,
    quoteVault: ix.keys[6].pubkey,
    programId: ix.programId,
    side: decoded.side as Side,
    limitPrice: decoded.limitPrice as BN,
    maxQuantity: decoded.maxQuantity as BN,
    orderType: decoded.orderType as OrderType,
    clientId: decoded.clientId as BN,
  };

  if (decoded.feeDiscountPubkey) {
    newOrder.feeDiscountPubkey = decoded.feeDiscountPubkey;
  }

  return newOrder;
}

export type MatchOrders = {
  market: PublicKey;
  requestQueue: PublicKey;
  eventQueue: PublicKey;
  bids: PublicKey;
  asks: PublicKey;
  baseVault: PublicKey;
  quoteVault: PublicKey;
  limit: number;
  programId: PublicKey;
};

export const MatchOrdersDecode = pick({
  limit: number(),
});

export function decodeMatchOrders(ix: TransactionInstruction): MatchOrders {
  const decoded = coerce(
    decodeInstruction(ix.data).matchOrders,
    MatchOrdersDecode
  );

  const matchOrders: MatchOrders = {
    market: ix.keys[0].pubkey,
    requestQueue: ix.keys[1].pubkey,
    eventQueue: ix.keys[2].pubkey,
    bids: ix.keys[3].pubkey,
    asks: ix.keys[4].pubkey,
    baseVault: ix.keys[5].pubkey,
    quoteVault: ix.keys[6].pubkey,
    programId: ix.programId,
    limit: decoded.limit,
  };

  return matchOrders;
}

export type ConsumeEvents = {
  market: PublicKey;
  eventQueue: PublicKey;
  openOrdersAccounts: PublicKey[];
  limit: number;
  programId: PublicKey;
};

export const ConsumeEventsDecode = pick({
  limit: number(),
});

export function decodeConsumeEvents(ix: TransactionInstruction): ConsumeEvents {
  const decoded = coerce(
    decodeInstruction(ix.data).consumeEvents,
    ConsumeEventsDecode
  );

  const consumeEvents: ConsumeEvents = {
    openOrdersAccounts: ix.keys.slice(0, -2).map((k) => k.pubkey),
    market: ix.keys[ix.keys.length - 2].pubkey,
    eventQueue: ix.keys[ix.keys.length - 3].pubkey,
    programId: ix.programId,
    limit: decoded.limit,
  };

  return consumeEvents;
}

export type CancelOrder = {
  market: PublicKey;
  openOrders: PublicKey;
  owner: PublicKey;
  requestQueue: PublicKey;
  side: "buy" | "sell";
  orderId: BN;
  openOrdersSlot: number;
  programId: PublicKey;
};

export const CancelOrderDecode = pick({
  side: Side,
  orderId: BigNumValue,
  openOrdersSlot: number(),
});

export function decodeCancelOrder(ix: TransactionInstruction): CancelOrder {
  const decoded = coerce(
    decodeInstruction(ix.data).cancelOrder,
    CancelOrderDecode
  );

  const cancelOrder: CancelOrder = {
    market: ix.keys[0].pubkey,
    openOrders: ix.keys[1].pubkey,
    requestQueue: ix.keys[2].pubkey,
    owner: ix.keys[3].pubkey,
    programId: ix.programId,
    openOrdersSlot: decoded.openOrdersSlot,
    orderId: decoded.orderId as BN,
    side: decoded.side,
  };

  return cancelOrder;
}

export type CancelOrderByClientId = {
  market: PublicKey;
  openOrders: PublicKey;
  owner: PublicKey;
  requestQueue: PublicKey;
  clientId: BN;
  programId: PublicKey;
};

export const CancelOrderByClientIdDecode = pick({
  clientId: BigNumValue,
});

export function decodeCancelOrderByClientId(
  ix: TransactionInstruction
): CancelOrderByClientId {
  const decoded = coerce(
    decodeInstruction(ix.data).cancelOrderByClientId,
    CancelOrderByClientIdDecode
  );

  const cancelOrderByClientId: CancelOrderByClientId = {
    market: ix.keys[0].pubkey,
    openOrders: ix.keys[1].pubkey,
    requestQueue: ix.keys[2].pubkey,
    owner: ix.keys[3].pubkey,
    programId: ix.programId,
    clientId: decoded.clientId as BN,
  };

  return cancelOrderByClientId;
}

export type SettleFunds = {
  market: PublicKey;
  openOrders: PublicKey;
  owner: PublicKey;
  baseVault: PublicKey;
  quoteVault: PublicKey;
  baseWallet: PublicKey;
  quoteWallet: PublicKey;
  vaultSigner: PublicKey;
  programId: PublicKey;
  referrerQuoteWallet?: PublicKey;
};

export function decodeSettleFunds(ix: TransactionInstruction): SettleFunds {
  let settleFunds: SettleFunds = {
    market: ix.keys[0].pubkey,
    openOrders: ix.keys[1].pubkey,
    owner: ix.keys[2].pubkey,
    baseVault: ix.keys[3].pubkey,
    quoteVault: ix.keys[4].pubkey,
    baseWallet: ix.keys[5].pubkey,
    quoteWallet: ix.keys[6].pubkey,
    vaultSigner: ix.keys[7].pubkey,
    programId: ix.programId,
  };

  if (ix.keys.length > 9) {
    settleFunds.referrerQuoteWallet = ix.keys[9].pubkey;
  }

  return settleFunds;
}

export function isSerumInstruction(instruction: TransactionInstruction) {
  return (
    instruction.programId.toBase58() === SERUM_PROGRAM_ID ||
    MARKETS.some(
      (market) =>
        market.programId && market.programId.equals(instruction.programId)
    )
  );
}

export function parseSerumInstructionKey(
  instruction: TransactionInstruction
): string {
  const decoded = decodeInstruction(instruction.data);
  const keys = Object.keys(decoded);

  if (keys.length < 1) {
    throw new Error("Serum instruction key not decoded");
  }

  return keys[0];
}

const SERUM_CODE_LOOKUP: { [key: number]: string } = {
  0: "Initialize Market",
  1: "New Order",
  2: "Match Orders",
  3: "Consume Events",
  4: "Cancel Order",
  5: "Settle Funds",
  6: "Cancel Order By Client Id",
  7: "Disable Market",
  8: "Sweep Fees",
  9: "New Order",
};

export function parseSerumInstructionCode(instruction: TransactionInstruction) {
  return instruction.data.slice(1, 5).readUInt32LE(0);
}

export function parseSerumInstructionTitle(
  instruction: TransactionInstruction
): string {
  const code = parseSerumInstructionCode(instruction);

  if (!(code in SERUM_CODE_LOOKUP)) {
    throw new Error(`Unrecognized Serum instruction code: ${code}`);
  }

  return SERUM_CODE_LOOKUP[code];
}
