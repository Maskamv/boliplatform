import { z } from "zod";

export const createTierSchema = z.object({
  name: z.string().min(1),
  minVisits: z.number().int().nonnegative().default(0),
  perks: z.string().nullable().optional(),
  sortOrder: z.number().int().default(0),
  badgeColor: z.string().nullable().optional(),
});
export type CreateTierInput = z.infer<typeof createTierSchema>;

export const updateTierSchema = z.object({
  name: z.string().min(1).optional(),
  minVisits: z.number().int().nonnegative().optional(),
  perks: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  badgeColor: z.string().nullable().optional(),
});
export type UpdateTierInput = z.infer<typeof updateTierSchema>;
