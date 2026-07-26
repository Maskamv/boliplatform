import { z } from "zod";
import { languageSchema } from "@boli/shared";

export const updateMerchantSchema = z.object({
  businessName: z.string().min(1).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().min(6).nullable().optional(),
  address: z.string().nullable().optional(),
  defaultLanguage: languageSchema.optional(),
  boliEarnRate: z.number().int().positive().optional(),
});
export type UpdateMerchantInput = z.infer<typeof updateMerchantSchema>;
