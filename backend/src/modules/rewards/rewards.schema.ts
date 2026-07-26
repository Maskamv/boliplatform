import { z } from "zod";

export const createRewardSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  boliCost: z.number().int().positive(),
  stock: z.number().int().nonnegative().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
});
export type CreateRewardInput = z.infer<typeof createRewardSchema>;

export const updateRewardSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  boliCost: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  stock: z.number().int().nonnegative().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
});
export type UpdateRewardInput = z.infer<typeof updateRewardSchema>;

export const redeemRewardSchema = z.object({
  outletId: z.string().nullable().optional(),
});
export type RedeemRewardInput = z.infer<typeof redeemRewardSchema>;
