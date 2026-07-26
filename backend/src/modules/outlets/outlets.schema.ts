import { z } from "zod";

export const createOutletSchema = z.object({
  name: z.string().min(1),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
});
export type CreateOutletInput = z.infer<typeof createOutletSchema>;

export const updateOutletSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});
export type UpdateOutletInput = z.infer<typeof updateOutletSchema>;
