import { prisma } from "../../../db/client.js";
import { ApiError } from "../../../lib/ApiError.js";
import { slugify } from "../../../lib/slugify.js";
import { hashPassword } from "../../../lib/password.js";
import { getFeatureFlags, updateFeatureFlags } from "../../../lib/features.js";
import { toMerchantAdminDto, toStaffUserDto } from "../../../lib/mappers.js";
import type { CreateMerchantInput, UpdateFeatureFlagsInput } from "./admin-merchants.schema.js";

async function uniqueMerchantSlug(base: string): Promise<string> {
  const baseSlug = slugify(base);
  let slug = baseSlug;
  let n = 1;
  while (await prisma.merchant.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${baseSlug}-${n}`;
  }
  return slug;
}

export async function listMerchants() {
  const merchants = await prisma.merchant.findMany({ orderBy: { createdAt: "desc" } });
  return merchants.map(toMerchantAdminDto);
}

async function findMerchantOrThrow(id: string) {
  const merchant = await prisma.merchant.findUnique({ where: { id } });
  if (!merchant) throw ApiError.notFound("Merchant not found");
  return merchant;
}

export async function getMerchantForAdmin(id: string) {
  return toMerchantAdminDto(await findMerchantOrThrow(id));
}

/** Onboards a new merchant plus its first (OWNER) staff account in one step — there's no self-serve business signup, so this is the only way a merchant comes into existence outside the seed script. */
export async function createMerchant(input: CreateMerchantInput) {
  const existingOwnerEmail = await prisma.staffUser.findUnique({ where: { email: input.ownerEmail } });
  if (existingOwnerEmail) {
    throw ApiError.conflict("A staff account with this owner email already exists");
  }

  const slug = await uniqueMerchantSlug(input.businessName);
  const passwordHash = await hashPassword(input.ownerPassword);

  const { merchant, owner } = await prisma.$transaction(async (tx) => {
    const createdMerchant = await tx.merchant.create({
      data: {
        businessName: input.businessName,
        slug,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
        address: input.address,
        boliEarnRate: input.boliEarnRate,
      },
    });
    const createdOwner = await tx.staffUser.create({
      data: {
        merchantId: createdMerchant.id,
        name: input.ownerName,
        email: input.ownerEmail,
        passwordHash,
        role: "OWNER",
      },
    });
    return { merchant: createdMerchant, owner: createdOwner };
  });

  return { merchant: toMerchantAdminDto(merchant), owner: toStaffUserDto(owner) };
}

export async function suspendMerchant(id: string) {
  await findMerchantOrThrow(id);
  const merchant = await prisma.merchant.update({ where: { id }, data: { isActive: false } });
  return toMerchantAdminDto(merchant);
}

export async function reactivateMerchant(id: string) {
  await findMerchantOrThrow(id);
  const merchant = await prisma.merchant.update({ where: { id }, data: { isActive: true } });
  return toMerchantAdminDto(merchant);
}

export async function getMerchantFeatures(id: string) {
  await findMerchantOrThrow(id);
  return getFeatureFlags(id);
}

export async function updateMerchantFeatures(id: string, input: UpdateFeatureFlagsInput) {
  await findMerchantOrThrow(id);
  return updateFeatureFlags(id, input);
}
