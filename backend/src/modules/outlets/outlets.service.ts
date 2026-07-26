import crypto from "node:crypto";
import { prisma } from "../../db/client.js";
import { ApiError } from "../../lib/ApiError.js";
import { toOutletDto } from "../../lib/mappers.js";
import { slugify } from "../../lib/slugify.js";
import { buildScanUrl, generateQrCodeDataUrl } from "../../lib/qrcode.js";
import type { CreateOutletInput, UpdateOutletInput } from "./outlets.schema.js";

async function uniqueSlug(merchantId: string, base: string): Promise<string> {
  const baseSlug = slugify(base);
  let slug = baseSlug;
  let n = 1;
  // Small outlet counts per merchant in practice — a loop is fine here.
  while (await prisma.outlet.findUnique({ where: { merchantId_slug: { merchantId, slug } } })) {
    n += 1;
    slug = `${baseSlug}-${n}`;
  }
  return slug;
}

export async function listOutlets(merchantId: string) {
  const outlets = await prisma.outlet.findMany({ where: { merchantId }, orderBy: { createdAt: "asc" } });
  return outlets.map(toOutletDto);
}

async function findOutletOrThrow(merchantId: string, id: string) {
  const outlet = await prisma.outlet.findFirst({ where: { id, merchantId } });
  if (!outlet) throw ApiError.notFound("Outlet not found");
  return outlet;
}

export async function getOutlet(merchantId: string, id: string) {
  return toOutletDto(await findOutletOrThrow(merchantId, id));
}

export async function createOutlet(merchantId: string, input: CreateOutletInput) {
  const slug = await uniqueSlug(merchantId, input.name);
  const outlet = await prisma.outlet.create({
    data: { merchantId, name: input.name, address: input.address, phone: input.phone, slug },
  });
  return toOutletDto(outlet);
}

export async function updateOutlet(merchantId: string, id: string, input: UpdateOutletInput) {
  await findOutletOrThrow(merchantId, id);
  const outlet = await prisma.outlet.update({ where: { id }, data: input });
  return toOutletDto(outlet);
}

export async function deleteOutlet(merchantId: string, id: string) {
  await findOutletOrThrow(merchantId, id);
  await prisma.outlet.delete({ where: { id } });
}

export async function getOutletQrCode(merchantId: string, id: string) {
  const outlet = await findOutletOrThrow(merchantId, id);
  const scanUrl = buildScanUrl(outlet.id, outlet.qrCodeToken);
  const dataUrl = await generateQrCodeDataUrl(scanUrl);
  return { scanUrl, dataUrl };
}

export async function regenerateOutletQrCode(merchantId: string, id: string) {
  await findOutletOrThrow(merchantId, id);
  await prisma.outlet.update({ where: { id }, data: { qrCodeToken: crypto.randomUUID() } });
  return getOutletQrCode(merchantId, id);
}
