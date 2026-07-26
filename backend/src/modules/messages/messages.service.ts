import { prisma } from "../../db/client.js";
import { toMessageLogDto } from "../../lib/mappers.js";
import type { ListMessagesQueryInput } from "./messages.schema.js";

export async function listMessages(merchantId: string, query: ListMessagesQueryInput) {
  const messages = await prisma.messageLog.findMany({
    where: {
      merchantId,
      ...(query.channel ? { channel: query.channel } : {}),
      ...(query.guestId ? { guestId: query.guestId } : {}),
      ...(query.campaignId ? { campaignId: query.campaignId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return messages.map(toMessageLogDto);
}
