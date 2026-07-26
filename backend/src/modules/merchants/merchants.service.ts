import { prisma } from "../../db/client.js";
import { ApiError } from "../../lib/ApiError.js";
import { toMerchantDto, toMerchantPublicDto } from "../../lib/mappers.js";
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
