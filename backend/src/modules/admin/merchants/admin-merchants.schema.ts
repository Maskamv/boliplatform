import { z } from "zod";

export const createMerchantSchema = z.object({
  businessName: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  boliEarnRate: z.number().int().positive().default(10),
  ownerName: z.string().min(1),
  ownerEmail: z.string().email(),
  ownerPassword: z.string().min(8),
});
export type CreateMerchantInput = z.infer<typeof createMerchantSchema>;

export const updateFeatureFlagsSchema = z.object({
  crmEnabled: z.boolean().optional(),
  loyaltyEnabled: z.boolean().optional(),
  whatsappMarketingEnabled: z.boolean().optional(),
  campaignsEnabled: z.boolean().optional(),
  qrCodesEnabled: z.boolean().optional(),
  reviewsEnabled: z.boolean().optional(),
  referralsEnabled: z.boolean().optional(),
  membershipsEnabled: z.boolean().optional(),
});
export type UpdateFeatureFlagsInput = z.infer<typeof updateFeatureFlagsSchema>;
