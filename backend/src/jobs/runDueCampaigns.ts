import type { Campaign, Guest, Visit } from "@prisma/client";
import { DEFAULT_POST_VISIT_DELAY_HOURS, DEFAULT_WIN_BACK_DAYS, WIN_BACK_DEDUPE_WINDOW_DAYS, type Channel, type MessagePurpose } from "@boli/shared";
import { prisma } from "../db/client.js";
import { getFeatureFlags } from "../lib/features.js";
import { renderTemplate, sendChannelMessage } from "../lib/messaging.js";

interface TriggerConfig {
  daysSinceLastVisit?: number;
  delayHours?: number;
}

function parseTriggerConfig(raw: string): TriggerConfig {
  try {
    return JSON.parse(raw) as TriggerConfig;
  } catch {
    return {};
  }
}

async function findWelcomeEligible(campaign: Campaign): Promise<Guest[]> {
  const candidates = await prisma.guest.findMany({ where: { merchantId: campaign.merchantId, totalVisits: 1 } });
  if (candidates.length === 0) return [];
  const sent = await prisma.messageLog.findMany({
    where: { campaignId: campaign.id, guestId: { in: candidates.map((g) => g.id) } },
    select: { guestId: true },
  });
  const sentIds = new Set(sent.map((m) => m.guestId));
  return candidates.filter((g) => !sentIds.has(g.id));
}

async function findBirthdayEligible(campaign: Campaign): Promise<Guest[]> {
  const now = new Date();
  const candidates = await prisma.guest.findMany({
    where: { merchantId: campaign.merchantId, dateOfBirth: { not: null } },
  });
  const todays = candidates.filter(
    (g) => g.dateOfBirth && g.dateOfBirth.getUTCMonth() === now.getUTCMonth() && g.dateOfBirth.getUTCDate() === now.getUTCDate(),
  );
  if (todays.length === 0) return [];
  const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const sent = await prisma.messageLog.findMany({
    where: { campaignId: campaign.id, guestId: { in: todays.map((g) => g.id) }, createdAt: { gte: yearStart } },
    select: { guestId: true },
  });
  const sentIds = new Set(sent.map((m) => m.guestId));
  return todays.filter((g) => !sentIds.has(g.id));
}

async function findWinBackEligible(campaign: Campaign, config: TriggerConfig): Promise<Guest[]> {
  const days = config.daysSinceLastVisit ?? DEFAULT_WIN_BACK_DAYS;
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const candidates = await prisma.guest.findMany({
    where: { merchantId: campaign.merchantId, lastVisitAt: { lte: cutoff } },
  });
  if (candidates.length === 0) return [];
  const dedupeCutoff = new Date(Date.now() - WIN_BACK_DEDUPE_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const recentlySent = await prisma.messageLog.findMany({
    where: { campaignId: campaign.id, guestId: { in: candidates.map((g) => g.id) }, createdAt: { gte: dedupeCutoff } },
    select: { guestId: true },
  });
  const recentIds = new Set(recentlySent.map((m) => m.guestId));
  return candidates.filter((g) => !recentIds.has(g.id));
}

async function findPostVisitEligible(campaign: Campaign, config: TriggerConfig): Promise<Array<Visit & { guest: Guest }>> {
  const delayHours = config.delayHours ?? DEFAULT_POST_VISIT_DELAY_HOURS;
  const cutoff = new Date(Date.now() - delayHours * 60 * 60 * 1000);
  const candidates = await prisma.visit.findMany({
    where: { outlet: { merchantId: campaign.merchantId }, checkedInAt: { lte: cutoff } },
    include: { guest: true },
    orderBy: { checkedInAt: "desc" },
    take: 200, // local-dev job — a real scheduler would paginate/cursor this
  });
  if (candidates.length === 0) return [];
  const sent = await prisma.messageLog.findMany({
    where: { campaignId: campaign.id, relatedVisitId: { in: candidates.map((v) => v.id) } },
    select: { relatedVisitId: true },
  });
  const sentVisitIds = new Set(sent.map((m) => m.relatedVisitId));
  return candidates.filter((v) => !sentVisitIds.has(v.id));
}

const PURPOSE_BY_TRIGGER: Record<string, MessagePurpose> = {
  WELCOME: "CAMPAIGN_WELCOME",
  BIRTHDAY: "CAMPAIGN_BIRTHDAY",
  WIN_BACK: "CAMPAIGN_WIN_BACK",
  POST_VISIT: "CAMPAIGN_POST_VISIT",
};

async function sendAndLog(campaign: Campaign, guest: Guest, relatedVisitId?: string) {
  const body = renderTemplate(campaign.messageTemplate, { guestName: guest.name ?? "there" });
  const result = await sendChannelMessage(campaign.channel as Channel, guest.phone, body);
  await prisma.messageLog.create({
    data: {
      merchantId: campaign.merchantId,
      guestId: guest.id,
      campaignId: campaign.id,
      relatedVisitId: relatedVisitId ?? null,
      channel: campaign.channel,
      purpose: PURPOSE_BY_TRIGGER[campaign.triggerType] ?? "CAMPAIGN_MANUAL",
      toPhone: guest.phone,
      body,
      status: result.status,
      providerResponse: JSON.stringify(result.providerResponse),
    },
  });
}

export interface RunDueCampaignsResult {
  campaignsEvaluated: number;
  messagesSent: number;
  details: { campaignId: string; campaignName: string; messagesSent: number }[];
}

/**
 * Evaluates every ACTIVE campaign's trigger and sends (mock) messages to
 * newly-eligible guests. Idempotent per campaign+guest (and per campaign+visit
 * for POST_VISIT) via MessageLog lookups, so it's safe to call repeatedly —
 * this is what makes a "Run due campaigns now" button in the dashboard safe,
 * and what a real cron/scheduler would call on an interval later with zero
 * code changes.
 *
 * MANUAL campaigns are not evaluated here — they're for a future one-off
 * "send to all guests now" action, out of scope for this build.
 */
export async function runDueCampaigns(merchantId?: string): Promise<RunDueCampaignsResult> {
  const campaigns = await prisma.campaign.findMany({
    where: { status: "ACTIVE", triggerType: { not: "MANUAL" }, ...(merchantId ? { merchantId } : {}) },
  });

  const details: RunDueCampaignsResult["details"] = [];
  let totalSent = 0;

  for (const campaign of campaigns) {
    // Defensive re-check: a platform admin may have disabled WhatsApp
    // Marketing for this merchant after the campaign was already created.
    if (campaign.channel === "WHATSAPP") {
      const flags = await getFeatureFlags(campaign.merchantId);
      if (!flags.whatsappMarketingEnabled) {
        details.push({ campaignId: campaign.id, campaignName: campaign.name, messagesSent: 0 });
        continue;
      }
    }

    const config = parseTriggerConfig(campaign.triggerConfig);
    let sentCount = 0;

    if (campaign.triggerType === "POST_VISIT") {
      const visits = await findPostVisitEligible(campaign, config);
      for (const visit of visits) {
        await sendAndLog(campaign, visit.guest, visit.id);
        sentCount += 1;
      }
    } else {
      const guests =
        campaign.triggerType === "WELCOME"
          ? await findWelcomeEligible(campaign)
          : campaign.triggerType === "BIRTHDAY"
            ? await findBirthdayEligible(campaign)
            : campaign.triggerType === "WIN_BACK"
              ? await findWinBackEligible(campaign, config)
              : [];

      for (const guest of guests) {
        await sendAndLog(campaign, guest);
        sentCount += 1;
      }
    }

    if (sentCount > 0) {
      await prisma.campaign.update({ where: { id: campaign.id }, data: { lastRunAt: new Date() } });
    }

    totalSent += sentCount;
    details.push({ campaignId: campaign.id, campaignName: campaign.name, messagesSent: sentCount });
  }

  return { campaignsEvaluated: campaigns.length, messagesSent: totalSent, details };
}
