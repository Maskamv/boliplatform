import { prisma } from "../../db/client.js";
import { ApiError } from "../../lib/ApiError.js";
import { generateOtpCode, otpExpiryDate, verifyAndConsumeOtp } from "../../lib/otp.js";
import { smsProvider } from "../../providers/sms/index.js";
import { whatsAppProvider } from "../../providers/whatsapp/index.js";
import { env } from "../../env.js";
import {
  toBoliTransactionDto,
  toGuestDto,
  toMembershipTierDto,
  toRedemptionDto,
  toReviewDto,
  toVisitDto,
} from "../../lib/mappers.js";
import type {
  ConfirmPhoneChangeInput,
  InviteGuestInput,
  ListGuestsQueryInput,
  RequestPhoneChangeInput,
  UpdateGuestByStaffInput,
  UpdateOwnProfileInput,
} from "./guests.schema.js";

// ---- Staff CRM ----

export async function listGuestsForMerchant(merchantId: string, query: ListGuestsQueryInput) {
  const guests = await prisma.guest.findMany({
    where: {
      merchantId,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search } },
              { phone: { contains: query.search } },
              { email: { contains: query.search } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  return guests.map(toGuestDto);
}

/**
 * Staff-initiated invite: no Guest row is created here — the guest completes
 * their own signup by following the link (same OTP-verify flow as a QR scan,
 * just without an outlet/checkin attached). This avoids "ghost" unverified
 * records in the CRM if someone never opens the link.
 */
export async function inviteGuest(merchantId: string, input: InviteGuestInput) {
  const merchant = await prisma.merchant.findUniqueOrThrow({ where: { id: merchantId } });

  const existing = await prisma.guest.findUnique({
    where: { merchantId_phone: { merchantId, phone: input.phone } },
  });
  if (existing) {
    throw ApiError.conflict("This phone number is already a guest");
  }

  const joinUrl = new URL(`/join/${merchantId}`, env.GUEST_APP_URL);
  joinUrl.searchParams.set("phone", input.phone);
  if (input.name) joinUrl.searchParams.set("name", input.name);

  const greeting = input.name ? `Hi ${input.name}` : "Hi there";
  const body = `${greeting}! ${merchant.businessName} invited you to join Boli — earn rewards on every visit. Tap to sign up: ${joinUrl.toString()}`;

  const result = await whatsAppProvider.sendMessage({ toPhone: input.phone, body });
  await prisma.messageLog.create({
    data: {
      merchantId,
      channel: "WHATSAPP",
      purpose: "INVITE",
      toPhone: input.phone,
      body,
      status: result.status,
      providerResponse: JSON.stringify(result.providerResponse),
    },
  });

  return { message: "Invite sent", joinUrl: joinUrl.toString() };
}

async function findGuestOrThrow(merchantId: string, guestId: string) {
  const guest = await prisma.guest.findFirst({ where: { id: guestId, merchantId } });
  if (!guest) throw ApiError.notFound("Guest not found");
  return guest;
}

export async function getGuestDetailForStaff(merchantId: string, guestId: string) {
  const guest = await findGuestOrThrow(merchantId, guestId);

  const [visits, transactions, redemptions, reviews] = await Promise.all([
    prisma.visit.findMany({ where: { guestId }, orderBy: { checkedInAt: "desc" }, include: { outlet: true } }),
    prisma.boliTransaction.findMany({ where: { guestId }, orderBy: { createdAt: "desc" } }),
    prisma.redemption.findMany({ where: { guestId }, orderBy: { redeemedAt: "desc" }, include: { reward: true } }),
    prisma.review.findMany({ where: { guestId }, orderBy: { createdAt: "desc" }, include: { outlet: true } }),
  ]);

  return {
    guest: toGuestDto(guest),
    visits: visits.map((v) => ({ ...toVisitDto(v), outletName: v.outlet.name })),
    transactions: transactions.map(toBoliTransactionDto),
    redemptions: redemptions.map((r) => ({ ...toRedemptionDto(r), rewardName: r.reward.name })),
    reviews: reviews.map((r) => ({ ...toReviewDto(r), outletName: r.outlet.name })),
  };
}

export async function updateGuestByStaff(merchantId: string, guestId: string, input: UpdateGuestByStaffInput) {
  await findGuestOrThrow(merchantId, guestId);
  const guest = await prisma.guest.update({
    where: { id: guestId },
    data: { ...input, dateOfBirth: input.dateOfBirth === undefined ? undefined : input.dateOfBirth ? new Date(input.dateOfBirth) : null },
  });
  return toGuestDto(guest);
}

// ---- Guest self-service ----

async function findOwnGuestOrThrow(guestId: string) {
  const guest = await prisma.guest.findUnique({ where: { id: guestId } });
  if (!guest) throw ApiError.notFound("Guest not found");
  return guest;
}

export async function getOwnProfile(guestId: string) {
  return toGuestDto(await findOwnGuestOrThrow(guestId));
}

export async function updateOwnProfile(guestId: string, input: UpdateOwnProfileInput) {
  await findOwnGuestOrThrow(guestId);
  const guest = await prisma.guest.update({
    where: { id: guestId },
    data: { ...input, dateOfBirth: input.dateOfBirth === undefined ? undefined : input.dateOfBirth ? new Date(input.dateOfBirth) : null },
  });
  return toGuestDto(guest);
}

export async function getOwnBalance(guestId: string) {
  const guest = await findOwnGuestOrThrow(guestId);
  return { boliBalance: guest.boliBalance };
}

export async function listOwnTransactions(guestId: string) {
  const txns = await prisma.boliTransaction.findMany({ where: { guestId }, orderBy: { createdAt: "desc" } });
  return txns.map(toBoliTransactionDto);
}

export async function listOwnVisits(guestId: string) {
  const visits = await prisma.visit.findMany({ where: { guestId }, orderBy: { checkedInAt: "desc" }, include: { outlet: true } });
  return visits.map((v) => ({ ...toVisitDto(v), outletName: v.outlet.name }));
}

export async function getOwnMembership(guestId: string) {
  const guest = await findOwnGuestOrThrow(guestId);
  const tiers = await prisma.membershipTier.findMany({
    where: { merchantId: guest.merchantId },
    orderBy: { minVisits: "asc" },
  });

  const currentTier = tiers.find((t) => t.id === guest.membershipTierId) ?? null;
  const nextTier = tiers.find((t) => t.minVisits > guest.totalVisits) ?? null;

  return {
    currentTier: currentTier ? toMembershipTierDto(currentTier) : null,
    nextTier: nextTier ? toMembershipTierDto(nextTier) : null,
    visitsToNextTier: nextTier ? Math.max(0, nextTier.minVisits - guest.totalVisits) : null,
    totalVisits: guest.totalVisits,
    allTiers: tiers.map(toMembershipTierDto),
  };
}

export async function listOwnRedemptions(guestId: string) {
  const redemptions = await prisma.redemption.findMany({ where: { guestId }, orderBy: { redeemedAt: "desc" }, include: { reward: true } });
  return redemptions.map((r) => ({ ...toRedemptionDto(r), rewardName: r.reward.name }));
}

export async function listOwnReviews(guestId: string) {
  const reviews = await prisma.review.findMany({ where: { guestId }, orderBy: { createdAt: "desc" } });
  return reviews.map(toReviewDto);
}

// ---- Phone number change (OTP-verified, since phone is the login identity) ----

export async function requestPhoneChange(guestId: string, input: RequestPhoneChangeInput) {
  const guest = await findOwnGuestOrThrow(guestId);

  if (input.newPhone === guest.phone) {
    throw ApiError.badRequest("That's already your phone number");
  }

  const existing = await prisma.guest.findUnique({
    where: { merchantId_phone: { merchantId: guest.merchantId, phone: input.newPhone } },
  });
  if (existing) {
    throw ApiError.conflict("That phone number is already in use");
  }

  const code = generateOtpCode();
  const otp = await prisma.otpCode.create({
    data: {
      phone: input.newPhone,
      merchantId: guest.merchantId,
      code,
      purpose: "PHONE_CHANGE",
      expiresAt: otpExpiryDate(),
    },
  });

  const result = await smsProvider.sendOtp({ toPhone: input.newPhone, code });
  await prisma.messageLog.create({
    data: {
      merchantId: guest.merchantId,
      guestId: guest.id,
      channel: "SMS",
      purpose: "OTP",
      toPhone: input.newPhone,
      body: `Your Boli phone-change verification code is ${code}`,
      status: result.status,
      providerResponse: JSON.stringify(result.providerResponse),
    },
  });

  return {
    message: "OTP sent",
    expiresAt: otp.expiresAt.toISOString(),
    devOtp: env.SMS_PROVIDER === "mock" ? code : undefined,
  };
}

export async function confirmPhoneChange(guestId: string, input: ConfirmPhoneChangeInput) {
  const guest = await findOwnGuestOrThrow(guestId);

  await verifyAndConsumeOtp(input.newPhone, guest.merchantId, "PHONE_CHANGE", input.code);

  try {
    const updated = await prisma.guest.update({ where: { id: guestId }, data: { phone: input.newPhone } });
    return toGuestDto(updated);
  } catch {
    // Unique constraint race — someone else claimed this number between request and confirm.
    throw ApiError.conflict("That phone number is already in use");
  }
}
