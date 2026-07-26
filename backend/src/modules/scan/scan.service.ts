import { prisma } from "../../db/client.js";
import { ApiError } from "../../lib/ApiError.js";
import { toMerchantPublicDto, toOutletDto, toVisitDto } from "../../lib/mappers.js";
import { applyBoliTransaction } from "../../lib/boli.js";
import { evaluateMembershipTierForGuest } from "../../lib/membership.js";
import { completeReferralIfEligible } from "../../lib/referral.js";
import type { CheckinBodyInput } from "./scan.schema.js";

async function findActiveOutletByToken(outletId: string, token: string) {
  const outlet = await prisma.outlet.findUnique({ where: { id: outletId } });
  if (!outlet || outlet.qrCodeToken !== token || !outlet.isActive) {
    throw ApiError.notFound("This QR code isn't valid — ask staff for a fresh one");
  }
  return outlet;
}

export async function getScanInfo(outletId: string, token: string) {
  const outlet = await findActiveOutletByToken(outletId, token);
  const merchant = await prisma.merchant.findUniqueOrThrow({ where: { id: outlet.merchantId } });
  return { outlet: toOutletDto(outlet), merchant: toMerchantPublicDto(merchant) };
}

export async function checkin(outletId: string, token: string, guestId: string, guestMerchantId: string, input: CheckinBodyInput) {
  const outlet = await findActiveOutletByToken(outletId, token);
  if (outlet.merchantId !== guestMerchantId) {
    throw ApiError.forbidden("This QR code belongs to a different business than your account");
  }

  const merchant = await prisma.merchant.findUniqueOrThrow({ where: { id: outlet.merchantId } });
  const boliEarned = merchant.boliEarnRate;

  const visit = await prisma.$transaction(async (tx) => {
    const createdVisit = await tx.visit.create({
      data: {
        guestId,
        outletId: outlet.id,
        source: "QR_SCAN",
        amountSpent: input.amountSpent ?? null,
        boliEarned,
      },
    });

    await tx.guest.update({
      where: { id: guestId },
      data: { totalVisits: { increment: 1 }, lastVisitAt: createdVisit.checkedInAt },
    });

    await applyBoliTransaction(tx, {
      guestId,
      type: "EARN",
      amount: boliEarned,
      relatedVisitId: createdVisit.id,
      note: `Visit at ${outlet.name}`,
    });

    await evaluateMembershipTierForGuest(tx, guestId);
    await completeReferralIfEligible(tx, guestId);

    return createdVisit;
  });

  const guest = await prisma.guest.findUniqueOrThrow({ where: { id: guestId } });

  return { visit: toVisitDto(visit), boliBalance: guest.boliBalance };
}
