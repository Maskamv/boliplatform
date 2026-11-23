import { prisma } from "../../db/client.js";
import { ApiError } from "../../lib/ApiError.js";
import { toMerchantDto, toMerchantPublicDto } from "../../lib/mappers.js";
import type { ShareChannel, ShareKitDto } from "@boli/shared";
import { env } from "../../env.js";
import { generateQrCodeDataUrl } from "../../lib/qrcode.js";
import type { UpdateMerchantInput } from "./merchants.schema.js";

export async function getMerchant(merchantId: string) {
  const merchant = await prisma.merchant.findUnique({ where: { id: merchantId } });
  if (!merchant) throw ApiError.notFound("Merchant not found");
  return toMerchantDto(merchant);
}

/** No-auth lookup for guest-facing pages (join links, scan landing) that only need the business name/branding, never anything sensitive. */
export async function getMerchantPublic(merchantId: string) {
  const merchant = await prisma.merchant.findUnique({ where: { id: merchantId } });
  if (!merchant) throw ApiError.notFound("Merchant not found");
  return toMerchantPublicDto(merchant);
}

export async function updateMerchant(merchantId: string, input: UpdateMerchantInput) {
  const merchant = await prisma.merchant.update({ where: { id: merchantId }, data: input });
  return toMerchantDto(merchant);
}

const SHARE_CHANNELS: ShareChannel[] = ["VIBER", "WHATSAPP", "FACEBOOK", "INSTAGRAM", "TIKTOK"];

/**
 * Per-channel join links (+ QR codes) for the dashboard's share kit. Each link
 * carries ?src=<channel> so a guest who signs up from it can later be
 * attributed to the post that brought them in. Nothing is posted from here —
 * staff share these themselves from their own Viber/WhatsApp/social apps.
 */
export async function getShareKit(merchantId: string): Promise<ShareKitDto> {
  const merchant = await prisma.merchant.findUnique({ where: { id: merchantId } });
  if (!merchant) throw ApiError.notFound("Merchant not found");

  const links = await Promise.all(
    SHARE_CHANNELS.map(async (channel) => {
      const url = new URL(`/join/${merchantId}`, env.GUEST_APP_URL);
      url.searchParams.set("src", channel.toLowerCase());
      return { channel, url: url.toString(), qrDataUrl: await generateQrCodeDataUrl(url.toString()) };
    }),
  );

  return { businessName: merchant.businessName, links };
}
