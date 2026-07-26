import { z } from "zod";

export const createReviewSchema = z.object({
  visitId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable().optional(),
});
export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const respondReviewSchema = z.object({
  staffResponse: z.string().min(1),
});
export type RespondReviewInput = z.infer<typeof respondReviewSchema>;
