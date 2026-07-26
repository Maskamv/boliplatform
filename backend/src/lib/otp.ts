import crypto from "node:crypto";
import { OTP_EXPIRY_MINUTES, OTP_LENGTH, OTP_MAX_ATTEMPTS, type OtpPurpose } from "@boli/shared";
import { prisma } from "../db/client.js";
import { ApiError } from "./ApiError.js";

export function generateOtpCode(): string {
  const max = 10 ** OTP_LENGTH;
  const n = crypto.randomInt(0, max);
  return n.toString().padStart(OTP_LENGTH, "0");
}

export function otpExpiryDate(from: Date = new Date()): Date {
  return new Date(from.getTime() + OTP_EXPIRY_MINUTES * 60_000);
}

/**
 * Shared verify-and-consume logic for every OTP purpose (guest login, phone
 * change, ...). Looks up the latest unconsumed code for (phone, merchantId,
 * purpose), checks expiry/attempts/match, increments attempts on a wrong
 * guess, and marks it consumed on success. Throws ApiError on any failure —
 * callers don't need their own validation branches.
 */
export async function verifyAndConsumeOtp(phone: string, merchantId: string, purpose: OtpPurpose, code: string): Promise<void> {
  const otp = await prisma.otpCode.findFirst({
    where: { phone, merchantId, purpose, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) throw ApiError.badRequest("No pending verification code — request a new one");
  if (otp.expiresAt < new Date()) throw ApiError.badRequest("Verification code expired — request a new one");
  if (otp.attempts >= OTP_MAX_ATTEMPTS) throw ApiError.badRequest("Too many attempts — request a new code");

  if (otp.code !== code) {
    await prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    throw ApiError.badRequest("Incorrect verification code");
  }

  await prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });
}
