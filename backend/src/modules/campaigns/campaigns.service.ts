import { prisma } from "../../db/client.js";
import { ApiError } from "../../lib/ApiError.js";
import { getFeatureFlags } from "../../lib/features.js";
import { toCampaignDto } from "../../lib/mappers.js";
import type { CreateCampaignInput, UpdateCampaignInput } from "./campaigns.schema.js";

export async function listCampaigns(merchantId: string) {
  const campaigns = await prisma.campaign.findMany({ where: { merchantId }, orderBy: { createdAt: "desc" } });
  return campaigns.map(toCampaignDto);
}

async function findCampaignOrThrow(merchantId: string, id: string) {
  const campaign = await prisma.campaign.findFirst({ where: { id, merchantId } });
  if (!campaign) throw ApiError.notFound("Campaign not found");
  return campaign;
}

async function assertWhatsAppAllowedIfUsed(merchantId: string, channel: string | undefined) {
  if (channel !== "WHATSAPP") return;
  const flags = await getFeatureFlags(merchantId);
  if (!flags.whatsappMarketingEnabled) {
    throw ApiError.forbidden("WhatsApp Marketing isn't enabled for your business — contact Boli support");
  }
}

export async function createCampaign(merchantId: string, input: CreateCampaignInput) {
  await assertWhatsAppAllowedIfUsed(merchantId, input.channel);
  const campaign = await prisma.campaign.create({
    data: { merchantId, ...input, triggerConfig: JSON.stringify(input.triggerConfig) },
  });
  return toCampaignDto(campaign);
}

export async function updateCampaign(merchantId: string, id: string, input: UpdateCampaignInput) {
  await findCampaignOrThrow(merchantId, id);
  await assertWhatsAppAllowedIfUsed(merchantId, input.channel);
  const { triggerConfig, ...rest } = input;
  const campaign = await prisma.campaign.update({
    where: { id },
    data: { ...rest, ...(triggerConfig !== undefined ? { triggerConfig: JSON.stringify(triggerConfig) } : {}) },
  });
  return toCampaignDto(campaign);
}

export async function deleteCampaign(merchantId: string, id: string) {
  await findCampaignOrThrow(merchantId, id);
  await prisma.campaign.delete({ where: { id } });
}
