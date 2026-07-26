import type {
  BoliTransaction,
  Campaign,
  Guest,
  MembershipTier,
  Merchant,
  MerchantFeatureFlags,
  MessageLog,
  Outlet,
  PlatformAdmin,
  Redemption,
  ReferralCode,
  Referral,
  ReferralSettings,
  Review,
  Reward,
  StaffUser,
  Visit,
} from "@prisma/client";
import type {
  BoliTransactionDto,
  CampaignDto,
  FeatureFlagsDto,
  GuestDto,
  MembershipTierDto,
  MerchantAdminDto,
  MerchantDto,
  MerchantPublicDto,
  MessageLogDto,
  OutletDto,
  PlatformAdminDto,
  RedemptionDto,
  ReferralCodeDto,
  ReferralDto,
  ReferralSettingsDto,
  ReviewDto,
  RewardDto,
  StaffUserDto,
  VisitDto,
} from "@boli/shared";
import type {
  BoliTxnType,
  CampaignStatus,
  CampaignTriggerType,
  Channel,
  Language,
  MessagePurpose,
  MessageStatus,
  RedemptionStatus,
  ReferralStatus,
  StaffRole,
  VisitSource,
} from "@boli/shared";

/**
 * Every enum-like Prisma column is a plain String (SQLite has no native
 * enum support). These mappers cast at the DB → DTO boundary — Prisma
 * writes are validated against the zod enums in packages/shared before
 * they ever reach the database, so the cast here is safe.
 */

export function toMerchantPublicDto(m: Merchant): MerchantPublicDto {
  return {
    id: m.id,
    businessName: m.businessName,
    slug: m.slug,
    defaultLanguage: m.defaultLanguage as Language,
    currency: m.currency,
    boliEarnRate: m.boliEarnRate,
  };
}

export function toMerchantDto(m: Merchant): MerchantDto {
  return {
    ...toMerchantPublicDto(m),
    contactEmail: m.contactEmail,
    contactPhone: m.contactPhone,
    address: m.address,
    createdAt: m.createdAt.toISOString(),
  };
}

export function toMerchantAdminDto(m: Merchant): MerchantAdminDto {
  return { ...toMerchantDto(m), isActive: m.isActive };
}

export function toFeatureFlagsDto(f: MerchantFeatureFlags): FeatureFlagsDto {
  return {
    crmEnabled: f.crmEnabled,
    loyaltyEnabled: f.loyaltyEnabled,
    whatsappMarketingEnabled: f.whatsappMarketingEnabled,
    campaignsEnabled: f.campaignsEnabled,
    qrCodesEnabled: f.qrCodesEnabled,
    reviewsEnabled: f.reviewsEnabled,
    referralsEnabled: f.referralsEnabled,
    membershipsEnabled: f.membershipsEnabled,
  };
}

export function toPlatformAdminDto(a: PlatformAdmin): PlatformAdminDto {
  return { id: a.id, name: a.name, email: a.email, isActive: a.isActive, createdAt: a.createdAt.toISOString() };
}

export function toOutletDto(o: Outlet): OutletDto {
  return {
    id: o.id,
    merchantId: o.merchantId,
    name: o.name,
    slug: o.slug,
    address: o.address,
    phone: o.phone,
    isActive: o.isActive,
    createdAt: o.createdAt.toISOString(),
  };
}

export function toStaffUserDto(s: StaffUser): StaffUserDto {
  return {
    id: s.id,
    merchantId: s.merchantId,
    name: s.name,
    email: s.email,
    role: s.role as StaffRole,
    isActive: s.isActive,
    createdAt: s.createdAt.toISOString(),
  };
}

export function toGuestDto(g: Guest): GuestDto {
  return {
    id: g.id,
    merchantId: g.merchantId,
    phone: g.phone,
    name: g.name,
    email: g.email,
    avatarUrl: g.avatarUrl,
    dateOfBirth: g.dateOfBirth ? g.dateOfBirth.toISOString() : null,
    language: g.language as Language,
    boliBalance: g.boliBalance,
    membershipTierId: g.membershipTierId,
    totalVisits: g.totalVisits,
    lastVisitAt: g.lastVisitAt ? g.lastVisitAt.toISOString() : null,
    createdAt: g.createdAt.toISOString(),
  };
}

export function toVisitDto(v: Visit): VisitDto {
  return {
    id: v.id,
    guestId: v.guestId,
    outletId: v.outletId,
    checkedInAt: v.checkedInAt.toISOString(),
    source: v.source as VisitSource,
    amountSpent: v.amountSpent,
    boliEarned: v.boliEarned,
    notes: v.notes,
  };
}

export function toBoliTransactionDto(t: BoliTransaction): BoliTransactionDto {
  return {
    id: t.id,
    guestId: t.guestId,
    type: t.type as BoliTxnType,
    amount: t.amount,
    balanceAfter: t.balanceAfter,
    note: t.note,
    createdAt: t.createdAt.toISOString(),
  };
}

export function toRewardDto(r: Reward): RewardDto {
  return {
    id: r.id,
    merchantId: r.merchantId,
    name: r.name,
    description: r.description,
    boliCost: r.boliCost,
    isActive: r.isActive,
    stock: r.stock,
    imageUrl: r.imageUrl,
  };
}

export function toRedemptionDto(r: Redemption): RedemptionDto {
  return {
    id: r.id,
    guestId: r.guestId,
    rewardId: r.rewardId,
    outletId: r.outletId,
    boliSpent: r.boliSpent,
    status: r.status as RedemptionStatus,
    redeemedAt: r.redeemedAt.toISOString(),
    fulfilledAt: r.fulfilledAt ? r.fulfilledAt.toISOString() : null,
  };
}

export function toMembershipTierDto(t: MembershipTier): MembershipTierDto {
  return {
    id: t.id,
    merchantId: t.merchantId,
    name: t.name,
    minVisits: t.minVisits,
    perks: t.perks,
    sortOrder: t.sortOrder,
    badgeColor: t.badgeColor,
  };
}

export function toCampaignDto(c: Campaign): CampaignDto {
  let triggerConfig: Record<string, unknown> = {};
  try {
    triggerConfig = JSON.parse(c.triggerConfig);
  } catch {
    triggerConfig = {};
  }
  return {
    id: c.id,
    merchantId: c.merchantId,
    name: c.name,
    triggerType: c.triggerType as CampaignTriggerType,
    status: c.status as CampaignStatus,
    channel: c.channel as Channel,
    messageTemplate: c.messageTemplate,
    triggerConfig,
    lastRunAt: c.lastRunAt ? c.lastRunAt.toISOString() : null,
  };
}

export function toMessageLogDto(m: MessageLog): MessageLogDto {
  return {
    id: m.id,
    merchantId: m.merchantId,
    guestId: m.guestId,
    campaignId: m.campaignId,
    relatedVisitId: m.relatedVisitId,
    channel: m.channel as Channel,
    purpose: m.purpose as MessagePurpose,
    toPhone: m.toPhone,
    body: m.body,
    status: m.status as MessageStatus,
    createdAt: m.createdAt.toISOString(),
  };
}

export function toReviewDto(r: Review): ReviewDto {
  return {
    id: r.id,
    guestId: r.guestId,
    outletId: r.outletId,
    visitId: r.visitId,
    rating: r.rating,
    comment: r.comment,
    isPublic: r.isPublic,
    staffResponse: r.staffResponse,
    createdAt: r.createdAt.toISOString(),
  };
}

export function toReferralCodeDto(r: ReferralCode): ReferralCodeDto {
  return { id: r.id, guestId: r.guestId, code: r.code };
}

export function toReferralDto(r: Referral): ReferralDto {
  return {
    id: r.id,
    referrerGuestId: r.referrerGuestId,
    refereeGuestId: r.refereeGuestId,
    status: r.status as ReferralStatus,
    referrerRewardBoli: r.referrerRewardBoli,
    refereeRewardBoli: r.refereeRewardBoli,
    completedAt: r.completedAt ? r.completedAt.toISOString() : null,
  };
}

export function toReferralSettingsDto(r: ReferralSettings): ReferralSettingsDto {
  return {
    merchantId: r.merchantId,
    referrerBonusBoli: r.referrerBonusBoli,
    refereeBonusBoli: r.refereeBonusBoli,
    isActive: r.isActive,
  };
}
