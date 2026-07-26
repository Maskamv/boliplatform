import type { Prisma, PrismaClient } from "@prisma/client";

type Db = PrismaClient | Prisma.TransactionClient;

/** Re-evaluates and applies the guest's membership tier from their current totalVisits (visit-count based — there's no real POS spend data to key off yet). Call after any visit-count change. */
export async function evaluateMembershipTierForGuest(db: Db, guestId: string): Promise<void> {
  const guest = await db.guest.findUniqueOrThrow({ where: { id: guestId } });

  const tiers = await db.membershipTier.findMany({
    where: { merchantId: guest.merchantId },
    orderBy: { minVisits: "desc" },
  });

  const eligible = tiers.find((t) => guest.totalVisits >= t.minVisits);
  const nextTierId = eligible?.id ?? null;

  if (nextTierId !== guest.membershipTierId) {
    await db.guest.update({ where: { id: guestId }, data: { membershipTierId: nextTierId } });
  }
}
