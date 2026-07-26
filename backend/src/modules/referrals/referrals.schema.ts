import { z } from "zod";

export const redeemReferralCodeSchema = z.object({
  code: z.string().min(1),
});
export type RedeemReferralCodeInput = z.infer<typeof redeemReferralCodeSchema>;

export const updateReferralSettingsSchema = z.object({
  referrerBonusBoli: z.number().int().nonnegative().optional(),
  refereeBonusBoli: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
});
export type UpdateReferralSettingsInput = z.infer<typeof updateReferralSettingsSchema>;
