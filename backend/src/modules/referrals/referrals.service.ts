import crypto from "node:crypto";
import { prisma } from "../../db/client.js";
import { ApiError } from "../../lib/ApiError.js";
import { toReferralCodeDto, toReferralSettingsDto } from "../../lib/mappers.js";
import { DEFAULT_REFEREE_BONUS_BOLI, DEFAULT_REFERRER_BONUS_BOLI } from "@boli/shared";
import type { RedeemReferralCodeInput, UpdateReferralSettingsInput } from "./referrals.schema.js";

function randomCodeSuffix(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase().slice(0, 6);
}

export async function getOrCreateReferralCode(guestId: string) {
  const existing = await prisma.referralCode.findUnique({ where: { guestId } });
  if (existing) return toReferralCodeDto(existing);

  const guest = await prisma.guest.findUniqueOrThrow({ where: { id: guestId } });

  let code = "";
  // Small collision probability with a 6-char random suffix — retry a handful of times rather than looping forever.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = `BOLI-${randomCodeSuffix()}`;
    const clash = await prisma.referralCode.findUnique({ where: { code: candidate } });
    if (!clash) {
      code = candidate;
      break;
    }
  }
  if (!code) throw ApiError.badRequest("Could not generate a unique referral code — try again");

  const created = await prisma.referralCode.create({ data: { guestId, merchantId: guest.merchantId, code } });
  return toReferralCodeDto(created);
}

export async function redeemReferralCode(guestId: string, merchantId: string, input: RedeemReferralCodeInput) {
  const guest = await prisma.guest.findUniqueOrThrow({ where: { id: guestId } });

  if (guest.totalVisits > 0) {
    throw ApiError.badRequest("Referral codes can only be redeemed before your first visit");
  }

  const existingReferral = await prisma.referral.findUnique({ where: { refereeGuestId: guestId } });
  if (existingReferral) throw ApiError.conflict("You've already used a referral code");

  const referralCode = await prisma.referralCode.findUnique({ where: { code: input.code } });
  if (!referralCode || referralCode.merchantId !== merchantId) {
    throw ApiError.notFound("Referral code not found");
  }
  if (referralCode.guestId === guestId) {
    throw ApiError.badRequest("You can't redeem your own referral code");
  }

  const referral = await prisma.referral.create({
    data: {
      referralCodeId: referralCode.id,
      referrerGuestId: referralCode.guestId,
      refereeGuestId: guestId,
      status: "PENDING",
    },
  });

  await prisma.guest.update({ where: { id: guestId }, data: { referredByGuestId: referralCode.guestId } });

  return { id: referral.id, status: referral.status };
}

export async function listReferralsForMerchant(merchantId: string) {
  const referrals = await prisma.referral.findMany({
    where: { referrerGuest: { merchantId } },
    orderBy: { createdAt: "desc" },
    include: { referrerGuest: true, refereeGuest: true },
  });
  return referrals.map((r) => ({
    id: r.id,
    status: r.status,
    referrerName: r.referrerGuest.name ?? r.referrerGuest.phone,
    refereeName: r.refereeGuest.name ?? r.refereeGuest.phone,
    referrerRewardBoli: r.referrerRewardBoli,
    refereeRewardBoli: r.refereeRewardBoli,
    completedAt: r.completedAt ? r.completedAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getReferralSettings(merchantId: string) {
  const existing = await prisma.referralSettings.findUnique({ where: { merchantId } });
  if (existing) return toReferralSettingsDto(existing);

  const created = await prisma.referralSettings.create({
    data: {
      merchantId,
      referrerBonusBoli: DEFAULT_REFERRER_BONUS_BOLI,
      refereeBonusBoli: DEFAULT_REFEREE_BONUS_BOLI,
    },
  });
  return toReferralSettingsDto(created);
}

export async function updateReferralSettings(merchantId: string, input: UpdateReferralSettingsInput) {
  await getReferralSettings(merchantId); // ensures a row exists
  const updated = await prisma.referralSettings.update({ where: { merchantId }, data: input });
  return toReferralSettingsDto(updated);
}
