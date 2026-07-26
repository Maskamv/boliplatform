import { z } from "zod";

export const otpRequestSchema = z.object({
  phone: z.string().min(6).max(20),
  merchantId: z.string().min(1),
});
export type OtpRequestInput = z.infer<typeof otpRequestSchema>;

export const otpVerifySchema = z.object({
  phone: z.string().min(6).max(20),
  merchantId: z.string().min(1),
  code: z.string().length(6),
  // Only applied when this OTP verification creates a brand-new guest (e.g.
  // via an admin-sent invite link that pre-filled a name) — ignored for an
  // existing guest's regular login.
  name: z.string().min(1).max(100).optional(),
});
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
