import { prisma } from "../../../db/client.js";
import { generateOtpCode, otpExpiryDate, verifyAndConsumeOtp } from "../../../lib/otp.js";
import { signGuestToken, type GuestJwtPayload } from "../../../lib/jwt.js";
import { ApiError } from "../../../lib/ApiError.js";
import { applyBoliTransaction } from "../../../lib/boli.js";
import { toGuestDto } from "../../../lib/mappers.js";
import { smsProvider } from "../../../providers/sms/index.js";
import { env } from "../../../env.js";
import { DEFAULT_SIGNUP_BONUS_BOLI } from "@boli/shared";
import type { OtpRequestInput, OtpVerifyInput } from "./guest.schema.js";

export async function requestGuestOtp(input: OtpRequestInput) {
  const merchant = await prisma.merchant.findUnique({ where: { id: input.merchantId } });
  if (!merchant) throw ApiError.notFound("Merchant not found");
  if (!merchant.isActive) throw ApiError.forbidden("This business account has been suspended");

  const code = generateOtpCode();
  const otp = await prisma.otpCode.create({
    data: {
      phone: input.phone,
      merchantId: input.merchantId,
      code,
      purpose: "GUEST_LOGIN",
      expiresAt: otpExpiryDate(),
    },
  });

  const result = await smsProvider.sendOtp({ toPhone: input.phone, code });
  await prisma.messageLog.create({
    data: {
      merchantId: input.merchantId,
      channel: "SMS",
      purpose: "OTP",
      toPhone: input.phone,
      body: `Your Boli verification code is ${code}`,
      status: result.status,
      providerResponse: JSON.stringify(result.providerResponse),
    },
  });

  return {
    message: "OTP sent",
    expiresAt: otp.expiresAt.toISOString(),
    // Only exposed when there's no real SMS provider wired up — never once a live one is configured.
    devOtp: env.SMS_PROVIDER === "mock" ? code : undefined,
  };
}

export async function verifyGuestOtp(input: OtpVerifyInput) {
  await verifyAndConsumeOtp(input.phone, input.merchantId, "GUEST_LOGIN", input.code);

  let guest = await prisma.guest.findUnique({
    where: { merchantId_phone: { merchantId: input.merchantId, phone: input.phone } },
  });

  let isNewGuest = false;
  if (!guest) {
    isNewGuest = true;
    guest = await prisma.guest.create({
      data: { merchantId: input.merchantId, phone: input.phone, name: input.name, boliBalance: 0 },
    });
    await applyBoliTransaction(prisma, {
      guestId: guest.id,
      type: "SIGNUP_BONUS",
      amount: DEFAULT_SIGNUP_BONUS_BOLI,
      note: "Welcome bonus for joining",
    });
    guest = await prisma.guest.findUniqueOrThrow({ where: { id: guest.id } });
  }

  const payload: GuestJwtPayload = { guestId: guest.id, merchantId: guest.merchantId };
  const token = signGuestToken(payload);

  return { token, guest: toGuestDto(guest), isNewGuest };
}

export async function getGuestMe(guestId: string) {
  const guest = await prisma.guest.findUnique({ where: { id: guestId } });
  if (!guest) throw ApiError.notFound("Guest not found");
  return toGuestDto(guest);
}
