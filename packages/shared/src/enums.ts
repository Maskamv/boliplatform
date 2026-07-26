import { z } from "zod";

/**
 * SQLite has no native Prisma `enum` support, so every enum-like column in
 * `backend/prisma/schema.prisma` is a plain `String`. These zod schemas are
 * the single source of truth for valid values — backend services validate
 * against them before writing, and both frontends import the derived TS
 * types for compile-time safety on API payloads.
 */

// Dhivehi (dv) support was descoped for now — see git history / README if
// re-adding it later. Only English ships today.
export const LANGUAGES = ["en"] as const;
export const languageSchema = z.enum(LANGUAGES);
export type Language = z.infer<typeof languageSchema>;

export const STAFF_ROLES = ["OWNER", "MANAGER", "STAFF"] as const;
export const staffRoleSchema = z.enum(STAFF_ROLES);
export type StaffRole = z.infer<typeof staffRoleSchema>;

export const VISIT_SOURCES = ["QR_SCAN", "MANUAL", "POS_IMPORT"] as const;
export const visitSourceSchema = z.enum(VISIT_SOURCES);
export type VisitSource = z.infer<typeof visitSourceSchema>;

export const BOLI_TXN_TYPES = [
  "EARN",
  "REDEEM",
  "ADJUST",
  "EXPIRE",
  "REFERRAL_BONUS",
  "SIGNUP_BONUS",
] as const;
export const boliTxnTypeSchema = z.enum(BOLI_TXN_TYPES);
export type BoliTxnType = z.infer<typeof boliTxnTypeSchema>;

export const REDEMPTION_STATUSES = ["PENDING", "FULFILLED", "CANCELLED"] as const;
export const redemptionStatusSchema = z.enum(REDEMPTION_STATUSES);
export type RedemptionStatus = z.infer<typeof redemptionStatusSchema>;

export const CAMPAIGN_TRIGGER_TYPES = [
  "WELCOME",
  "BIRTHDAY",
  "WIN_BACK",
  "POST_VISIT",
  "MANUAL",
] as const;
export const campaignTriggerTypeSchema = z.enum(CAMPAIGN_TRIGGER_TYPES);
export type CampaignTriggerType = z.infer<typeof campaignTriggerTypeSchema>;

export const CAMPAIGN_STATUSES = ["DRAFT", "ACTIVE", "PAUSED"] as const;
export const campaignStatusSchema = z.enum(CAMPAIGN_STATUSES);
export type CampaignStatus = z.infer<typeof campaignStatusSchema>;

export const CHANNELS = ["WHATSAPP", "SMS"] as const;
export const channelSchema = z.enum(CHANNELS);
export type Channel = z.infer<typeof channelSchema>;

export const MESSAGE_STATUSES = ["SENT_MOCK", "FAILED"] as const;
export const messageStatusSchema = z.enum(MESSAGE_STATUSES);
export type MessageStatus = z.infer<typeof messageStatusSchema>;

export const REFERRAL_STATUSES = ["PENDING", "COMPLETED"] as const;
export const referralStatusSchema = z.enum(REFERRAL_STATUSES);
export type ReferralStatus = z.infer<typeof referralStatusSchema>;

export const OTP_PURPOSES = ["GUEST_LOGIN", "PHONE_CHANGE"] as const;
export const otpPurposeSchema = z.enum(OTP_PURPOSES);
export type OtpPurpose = z.infer<typeof otpPurposeSchema>;

/** Keys of FeatureFlagsDto, in the order the admin portal displays them. Kept here (not derived from the interface) so it's a real runtime value usable for iteration/validation, not just a compile-time type. */
export const FEATURE_KEYS = [
  "crmEnabled",
  "loyaltyEnabled",
  "whatsappMarketingEnabled",
  "campaignsEnabled",
  "qrCodesEnabled",
  "reviewsEnabled",
  "referralsEnabled",
  "membershipsEnabled",
] as const;
export type FeatureKey = (typeof FEATURE_KEYS)[number];

export const MESSAGE_PURPOSES = [
  "OTP",
  "CAMPAIGN_WELCOME",
  "CAMPAIGN_BIRTHDAY",
  "CAMPAIGN_WIN_BACK",
  "CAMPAIGN_POST_VISIT",
  "CAMPAIGN_MANUAL",
  "INVITE",
] as const;
export const messagePurposeSchema = z.enum(MESSAGE_PURPOSES);
export type MessagePurpose = z.infer<typeof messagePurposeSchema>;
