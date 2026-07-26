import { z } from "zod";
import { campaignStatusSchema, campaignTriggerTypeSchema, channelSchema } from "@boli/shared";

export const createCampaignSchema = z.object({
  name: z.string().min(1),
  triggerType: campaignTriggerTypeSchema,
  channel: channelSchema.default("WHATSAPP"),
  status: campaignStatusSchema.default("DRAFT"),
  messageTemplate: z.string().min(1),
  triggerConfig: z.record(z.unknown()).default({}),
});
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;

export const updateCampaignSchema = z.object({
  name: z.string().min(1).optional(),
  triggerType: campaignTriggerTypeSchema.optional(),
  channel: channelSchema.optional(),
  status: campaignStatusSchema.optional(),
  messageTemplate: z.string().min(1).optional(),
  triggerConfig: z.record(z.unknown()).optional(),
});
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
