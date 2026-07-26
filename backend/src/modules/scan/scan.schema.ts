import { z } from "zod";

export const scanQuerySchema = z.object({
  t: z.string().min(1),
});
export type ScanQueryInput = z.infer<typeof scanQuerySchema>;

export const checkinBodySchema = z.object({
  amountSpent: z.number().int().nonnegative().nullable().optional(),
});
export type CheckinBodyInput = z.infer<typeof checkinBodySchema>;
