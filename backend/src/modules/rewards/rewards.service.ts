import { prisma } from "../../db/client.js";
import { ApiError } from "../../lib/ApiError.js";
import { toRedemptionDto, toRewardDto } from "../../lib/mappers.js";
import { applyBoliTransaction, assertSufficientBalance } from "../../lib/boli.js";
import type { CreateRewardInput, RedeemRewardInput, UpdateRewardInput } from "./rewards.schema.js";

export async function listRewardsForStaff(merchantId: string) {
  const rewards = await prisma.reward.findMany({ where: { merchantId }, orderBy: { boliCost: "asc" } });
  return rewards.map(toRewardDto);
}

export async function listActiveRewardsForGuest(merchantId: string) {
  const rewards = await prisma.reward.findMany({
    where: { merchantId, isActive: true, OR: [{ stock: null }, { stock: { gt: 0 } }] },
    orderBy: { boliCost: "asc" },
  });
  return rewards.map(toRewardDto);
}

async function findRewardOrThrow(merchantId: string, id: string) {
  const reward = await prisma.reward.findFirst({ where: { id, merchantId } });
  if (!reward) throw ApiError.notFound("Reward not found");
  return reward;
}

export async function createReward(merchantId: string, input: CreateRewardInput) {
  const reward = await prisma.reward.create({ data: { merchantId, ...input } });
  return toRewardDto(reward);
}

export async function updateReward(merchantId: string, id: string, input: UpdateRewardInput) {
  await findRewardOrThrow(merchantId, id);
  const reward = await prisma.reward.update({ where: { id }, data: input });
  return toRewardDto(reward);
}

export async function deleteReward(merchantId: string, id: string) {
  await findRewardOrThrow(merchantId, id);
  await prisma.reward.delete({ where: { id } });
}

export async function redeemReward(guestId: string, merchantId: string, rewardId: string, input: RedeemRewardInput) {
  const reward = await prisma.reward.findFirst({ where: { id: rewardId, merchantId, isActive: true } });
  if (!reward) throw ApiError.notFound("Reward not found or no longer available");
  if (reward.stock !== null && reward.stock <= 0) throw ApiError.conflict("This reward is out of stock");

  await assertSufficientBalance(prisma, guestId, reward.boliCost);

  const redemption = await prisma.$transaction(async (tx) => {
    const created = await tx.redemption.create({
      data: {
        guestId,
        rewardId,
        outletId: input.outletId ?? null,
        boliSpent: reward.boliCost,
        status: "PENDING",
      },
    });

    await applyBoliTransaction(tx, {
      guestId,
      type: "REDEEM",
      amount: -reward.boliCost,
      relatedRedemptionId: created.id,
      note: `Redeemed: ${reward.name}`,
    });

    if (reward.stock !== null) {
      await tx.reward.update({ where: { id: reward.id }, data: { stock: { decrement: 1 } } });
    }

    return created;
  });

  return toRedemptionDto(redemption);
}

export async function listRedemptionsForMerchant(merchantId: string) {
  const redemptions = await prisma.redemption.findMany({
    where: { guest: { merchantId } },
    orderBy: { redeemedAt: "desc" },
    include: { guest: true, reward: true },
  });
  return redemptions.map((r) => ({
    ...toRedemptionDto(r),
    guestName: r.guest.name ?? r.guest.phone,
    rewardName: r.reward.name,
  }));
}

export async function fulfillRedemption(merchantId: string, redemptionId: string) {
  const redemption = await prisma.redemption.findFirst({
    where: { id: redemptionId, guest: { merchantId } },
  });
  if (!redemption) throw ApiError.notFound("Redemption not found");
  if (redemption.status !== "PENDING") throw ApiError.conflict("Redemption is not pending");

  const updated = await prisma.redemption.update({
    where: { id: redemptionId },
    data: { status: "FULFILLED", fulfilledAt: new Date() },
  });
  return toRedemptionDto(updated);
}
