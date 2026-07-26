import type { Prisma, PrismaClient } from "@prisma/client";
import { applyBoliTransaction } from "./boli.js";

type Db = PrismaClient | Prisma.TransactionClient;

/**
 * If this guest was referred and this is their first-ever visit, completes
 * the referral and awards bonus Boli to both referrer and referee. Safe to
 * call on every checkin — it's a no-op once the referral is already
 * COMPLETED or the guest wasn't referred at all.
 */
export async function completeReferralIfEligible(db: Db, guestId: string): Promise<void> {
  const guest = await db.guest.findUniqueOrThrow({ where: { id: guestId } });

  // Only the guest's first visit completes a referral.
  if (guest.totalVisits !== 1) return;

  const referral = await db.referral.findUnique({ where: { refereeGuestId: guestId } });
  if (!referral || referral.status !== "PENDING") return;

  const settings = await db.referralSettings.findUnique({ where: { merchantId: guest.merchantId } });
  if (!settings || !settings.isActive) return;

  await db.referral.update({
    where: { id: referral.id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      referrerRewardBoli: settings.referrerBonusBoli,
      refereeRewardBoli: settings.refereeBonusBoli,
    },
  });

  await applyBoliTransaction(db, {
    guestId: referral.referrerGuestId,
    type: "REFERRAL_BONUS",
    amount: settings.referrerBonusBoli,
    relatedReferralId: referral.id,
    note: "Referral bonus — a friend you referred just visited",
  });

  await applyBoliTransaction(db, {
    guestId: referral.refereeGuestId,
    type: "REFERRAL_BONUS",
    amount: settings.refereeBonusBoli,
    relatedReferralId: referral.id,
    note: "Referral bonus — welcome, thanks for using a friend's code",
  });
}
