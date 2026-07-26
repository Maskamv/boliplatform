import { z } from "zod";
import { channelSchema } from "@boli/shared";

export const listMessagesQuerySchema = z.object({
  channel: channelSchema.optional(),
  guestId: z.string().optional(),
  campaignId: z.string().optional(),
});
export type ListMessagesQueryInput = z.infer<typeof listMessagesQuerySchema>;
