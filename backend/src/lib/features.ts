import type { NextFunction, Request, Response } from "express";
import type { FeatureFlagsDto, FeatureKey } from "@boli/shared";
import { prisma } from "../db/client.js";
import { ApiError } from "./ApiError.js";
import { toFeatureFlagsDto } from "./mappers.js";

const ALL_ENABLED: FeatureFlagsDto = {
  crmEnabled: true,
  loyaltyEnabled: true,
  whatsappMarketingEnabled: true,
  campaignsEnabled: true,
  qrCodesEnabled: true,
  reviewsEnabled: true,
  referralsEnabled: true,
  membershipsEnabled: true,
};

/** No row = every feature enabled, so merchants created before this table existed (or via the seed script) aren't retroactively locked out. */
export async function getFeatureFlags(merchantId: string): Promise<FeatureFlagsDto> {
  const flags = await prisma.merchantFeatureFlags.findUnique({ where: { merchantId } });
  return flags ? toFeatureFlagsDto(flags) : ALL_ENABLED;
}

/** Upserts on top of the same all-enabled default, so a platform admin can flip a single flag without needing to specify every other one. */
export async function updateFeatureFlags(merchantId: string, input: Partial<FeatureFlagsDto>): Promise<FeatureFlagsDto> {
  const flags = await prisma.merchantFeatureFlags.upsert({
    where: { merchantId },
    create: { merchantId, ...ALL_ENABLED, ...input },
    update: input,
  });
  return toFeatureFlagsDto(flags);
}

/** Gates a staff route on a feature flag. Mount after authStaff. */
export function requireStaffFeature(key: FeatureKey) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const flags = await getFeatureFlags(req.staff!.merchantId);
    if (!flags[key]) {
      return next(ApiError.forbidden("This feature isn't enabled for your business — contact Boli support"));
    }
    next();
  };
}

/** Gates a guest-facing route on a feature flag. Mount after authGuest. */
export function requireGuestFeature(key: FeatureKey) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const flags = await getFeatureFlags(req.guest!.merchantId);
    if (!flags[key]) {
      return next(ApiError.forbidden("This feature isn't enabled for this business right now"));
    }
    next();
  };
}
