import { prisma } from "../../db/client.js";
import { ApiError } from "../../lib/ApiError.js";
import { toMembershipTierDto } from "../../lib/mappers.js";
import type { CreateTierInput, UpdateTierInput } from "./memberships.schema.js";

export async function listTiers(merchantId: string) {
  const tiers = await prisma.membershipTier.findMany({ where: { merchantId }, orderBy: { minVisits: "asc" } });
  return tiers.map(toMembershipTierDto);
}

async function findTierOrThrow(merchantId: string, id: string) {
  const tier = await prisma.membershipTier.findFirst({ where: { id, merchantId } });
  if (!tier) throw ApiError.notFound("Membership tier not found");
  return tier;
}

export async function createTier(merchantId: string, input: CreateTierInput) {
  const tier = await prisma.membershipTier.create({ data: { merchantId, ...input } });
  return toMembershipTierDto(tier);
}

export async function updateTier(merchantId: string, id: string, input: UpdateTierInput) {
  await findTierOrThrow(merchantId, id);
  const tier = await prisma.membershipTier.update({ where: { id }, data: input });
  return toMembershipTierDto(tier);
}

export async function deleteTier(merchantId: string, id: string) {
  await findTierOrThrow(merchantId, id);
  await prisma.membershipTier.delete({ where: { id } });
}
