import type { Prisma, PrismaClient } from "@prisma/client";
import type { BoliTxnType } from "@boli/shared";

/** Accepts either the top-level PrismaClient or a `$transaction` callback client, so callers can compose this with other writes atomically (e.g. scan/checkin creates a Visit + earns Boli in one transaction). */
type Db = PrismaClient | Prisma.TransactionClient;

export interface BoliLedgerEntryInput {
  guestId: string;
  type: BoliTxnType;
  /** Signed: positive for EARN/bonus types, negative for REDEEM/downward ADJUST. */
  amount: number;
  relatedVisitId?: string;
  relatedRedemptionId?: string;
  relatedReferralId?: string;
  note?: string;
}

export class InsufficientBoliBalanceError extends Error {
  constructor(guestId: string, balance: number, required: number) {
    super(`Guest ${guestId} has ${balance} Boli, needs ${required}`);
    this.name = "InsufficientBoliBalanceError";
  }
}

/** Applies one ledger entry: updates the guest's cached balance and writes the immutable BoliTransaction row that balance is derived from. */
export async function applyBoliTransaction(db: Db, input: BoliLedgerEntryInput) {
  const guest = await db.guest.update({
    where: { id: input.guestId },
    data: { boliBalance: { increment: input.amount } },
  });

  const txn = await db.boliTransaction.create({
    data: {
      guestId: input.guestId,
      type: input.type,
      amount: input.amount,
      balanceAfter: guest.boliBalance,
      relatedVisitId: input.relatedVisitId,
      relatedRedemptionId: input.relatedRedemptionId,
      relatedReferralId: input.relatedReferralId,
      note: input.note,
    },
  });

  return { guest, txn };
}

/** Throws InsufficientBoliBalanceError if the guest can't afford `required` Boli. Callers must check this before attempting a REDEEM ledger entry — applyBoliTransaction itself does not guard against a negative balance. */
export async function assertSufficientBalance(db: Db, guestId: string, required: number): Promise<void> {
  const guest = await db.guest.findUniqueOrThrow({ where: { id: guestId }, select: { boliBalance: true } });
  if (guest.boliBalance < required) {
    throw new InsufficientBoliBalanceError(guestId, guest.boliBalance, required);
  }
}
