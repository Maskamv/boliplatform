import { prisma } from "../../db/client.js";
import { ApiError } from "../../lib/ApiError.js";
import { toReviewDto } from "../../lib/mappers.js";
import type { CreateReviewInput, RespondReviewInput } from "./reviews.schema.js";

export async function createReview(guestId: string, input: CreateReviewInput) {
  const visit = await prisma.visit.findFirst({ where: { id: input.visitId, guestId } });
  if (!visit) throw ApiError.notFound("Visit not found");

  const existing = await prisma.review.findFirst({ where: { visitId: visit.id, guestId } });
  if (existing) throw ApiError.conflict("You've already reviewed this visit");

  const review = await prisma.review.create({
    data: {
      guestId,
      outletId: visit.outletId,
      visitId: visit.id,
      rating: input.rating,
      comment: input.comment,
    },
  });
  return toReviewDto(review);
}

export async function listReviewsForMerchant(merchantId: string) {
  const reviews = await prisma.review.findMany({
    where: { outlet: { merchantId } },
    orderBy: { createdAt: "desc" },
    include: { guest: true, outlet: true },
  });
  return reviews.map((r) => ({
    ...toReviewDto(r),
    guestName: r.guest.name ?? r.guest.phone,
    outletName: r.outlet.name,
  }));
}

export async function respondToReview(merchantId: string, id: string, input: RespondReviewInput) {
  const review = await prisma.review.findFirst({ where: { id, outlet: { merchantId } } });
  if (!review) throw ApiError.notFound("Review not found");

  const updated = await prisma.review.update({ where: { id }, data: { staffResponse: input.staffResponse } });
  return toReviewDto(updated);
}
