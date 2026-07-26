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
} from "./enums.js";

/** Plain DTOs shared between backend responses and frontend consumers. Intentionally decoupled from Prisma's generated types so this package has no Prisma dependency. */

export interface MerchantPublicDto {
  id: string;
  businessName: string;
  slug: string;
  defaultLanguage: Language;
  currency: string;
  boliEarnRate: number;
}

export interface MerchantDto extends MerchantPublicDto {
  contactEmail: string;
  contactPhone: string | null;
  address: string | null;
  createdAt: string;
}

/** Merchant view for the platform-admin portal — includes isActive, which merchant staff/guests never need to see about themselves. */
export interface MerchantAdminDto extends MerchantDto {
  isActive: boolean;
}

export interface FeatureFlagsDto {
  crmEnabled: boolean;
  loyaltyEnabled: boolean;
  whatsappMarketingEnabled: boolean;
  campaignsEnabled: boolean;
  qrCodesEnabled: boolean;
  reviewsEnabled: boolean;
  referralsEnabled: boolean;
  membershipsEnabled: boolean;
}

export interface PlatformAdminDto {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export interface OutletDto {
  id: string;
  merchantId: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface StaffUserDto {
  id: string;
  merchantId: string;
  name: string;
  email: string;
  role: StaffRole;
  isActive: boolean;
  createdAt: string;
}

export interface GuestDto {
  id: string;
  merchantId: string;
  phone: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  language: Language;
  boliBalance: number;
  membershipTierId: string | null;
  totalVisits: number;
  lastVisitAt: string | null;
  createdAt: string;
}

export interface VisitDto {
  id: string;
  guestId: string;
  outletId: string;
  checkedInAt: string;
  source: VisitSource;
  amountSpent: number | null;
  boliEarned: number;
  notes: string | null;
}

export interface BoliTransactionDto {
  id: string;
  guestId: string;
  type: BoliTxnType;
  amount: number;
  balanceAfter: number;
  note: string | null;
  createdAt: string;
}

export interface RewardDto {
  id: string;
  merchantId: string;
  name: string;
  description: string | null;
  boliCost: number;
  isActive: boolean;
  stock: number | null;
  imageUrl: string | null;
}

export interface RedemptionDto {
  id: string;
  guestId: string;
  rewardId: string;
  outletId: string | null;
  boliSpent: number;
  status: RedemptionStatus;
  redeemedAt: string;
  fulfilledAt: string | null;
}

export interface MembershipTierDto {
  id: string;
  merchantId: string;
  name: string;
  minVisits: number;
  perks: string | null;
  sortOrder: number;
  badgeColor: string | null;
}

export interface CampaignDto {
  id: string;
  merchantId: string;
  name: string;
  triggerType: CampaignTriggerType;
  status: CampaignStatus;
  channel: Channel;
  messageTemplate: string;
  triggerConfig: Record<string, unknown>;
  lastRunAt: string | null;
}

export interface MessageLogDto {
  id: string;
  merchantId: string;
  guestId: string | null;
  campaignId: string | null;
  relatedVisitId: string | null;
  channel: Channel;
  purpose: MessagePurpose;
  toPhone: string;
  body: string;
  status: MessageStatus;
  createdAt: string;
}

export interface ReviewDto {
  id: string;
  guestId: string;
  outletId: string;
  visitId: string | null;
  rating: number;
  comment: string | null;
  isPublic: boolean;
  staffResponse: string | null;
  createdAt: string;
}

export interface ReferralCodeDto {
  id: string;
  guestId: string;
  code: string;
}

export interface ReferralDto {
  id: string;
  referrerGuestId: string;
  refereeGuestId: string;
  status: ReferralStatus;
  referrerRewardBoli: number | null;
  refereeRewardBoli: number | null;
  completedAt: string | null;
}

export interface ReferralSettingsDto {
  merchantId: string;
  referrerBonusBoli: number;
  refereeBonusBoli: number;
  isActive: boolean;
}

export interface DashboardSummaryDto {
  totalGuests: number;
  totalVisits30d: number;
  boliIssued30d: number;
  boliRedeemed30d: number;
  activeCampaigns: number;
  pendingRedemptions: number;
}

export interface VisitsTimeseriesPointDto {
  date: string;
  visits: number;
}

export interface ApiErrorBody {
  error: string;
  details?: unknown;
}
