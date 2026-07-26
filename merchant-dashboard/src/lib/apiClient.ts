import type {
  BoliTransactionDto,
  CampaignDto,
  DashboardSummaryDto,
  GuestDto,
  MembershipTierDto,
  MerchantDto,
  MessageLogDto,
  OutletDto,
  RedemptionDto,
  ReferralSettingsDto,
  ReviewDto,
  RewardDto,
  StaffUserDto,
  VisitDto,
  VisitsTimeseriesPointDto,
} from "@boli/shared";
import { getStaffToken } from "./auth";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export class ApiRequestError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.details = details;
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStaffToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiRequestError(res.status, body.error ?? "Request failed", body.details);
  }
  return body as T;
}

// ---- Auth ----
export function login(email: string, password: string) {
  return apiFetch<{ token: string; staff: StaffUserDto }>("/api/auth/staff/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
export function getMe() {
  return apiFetch<StaffUserDto>("/api/auth/staff/me");
}

// ---- Merchant ----
export function getMerchant() {
  return apiFetch<MerchantDto>("/api/merchant");
}
export function updateMerchant(input: Partial<Pick<MerchantDto, "businessName" | "contactEmail" | "contactPhone" | "address" | "defaultLanguage" | "boliEarnRate">>) {
  return apiFetch<MerchantDto>("/api/merchant", { method: "PATCH", body: JSON.stringify(input) });
}

// ---- Dashboard ----
export function getDashboardSummary() {
  return apiFetch<DashboardSummaryDto>("/api/dashboard/summary");
}
export function getVisitsTimeseries() {
  return apiFetch<VisitsTimeseriesPointDto[]>("/api/dashboard/visits-timeseries");
}

// ---- Outlets ----
export function listOutlets() {
  return apiFetch<OutletDto[]>("/api/outlets");
}
export function getOutlet(id: string) {
  return apiFetch<OutletDto>(`/api/outlets/${id}`);
}
export function createOutlet(input: { name: string; address?: string | null; phone?: string | null }) {
  return apiFetch<OutletDto>("/api/outlets", { method: "POST", body: JSON.stringify(input) });
}
export function updateOutlet(id: string, input: Partial<{ name: string; address: string | null; phone: string | null; isActive: boolean }>) {
  return apiFetch<OutletDto>(`/api/outlets/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}
export function deleteOutlet(id: string) {
  return apiFetch<void>(`/api/outlets/${id}`, { method: "DELETE" });
}
export function getOutletQrCode(id: string) {
  return apiFetch<{ scanUrl: string; dataUrl: string }>(`/api/outlets/${id}/qrcode`);
}
export function regenerateOutletQrCode(id: string) {
  return apiFetch<{ scanUrl: string; dataUrl: string }>(`/api/outlets/${id}/qrcode/regenerate`, { method: "POST" });
}

// ---- Guests (CRM) ----
export function listGuests(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiFetch<GuestDto[]>(`/api/guests${qs}`);
}
export interface GuestDetail {
  guest: GuestDto;
  visits: (VisitDto & { outletName: string })[];
  transactions: BoliTransactionDto[];
  redemptions: (RedemptionDto & { rewardName: string })[];
  reviews: (ReviewDto & { outletName: string })[];
}
export function getGuestDetail(id: string) {
  return apiFetch<GuestDetail>(`/api/guests/${id}`);
}
export function updateGuest(id: string, input: Partial<{ name: string | null; email: string | null; dateOfBirth: string | null }>) {
  return apiFetch<GuestDto>(`/api/guests/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}
export function inviteGuest(input: { phone: string; name?: string | null }) {
  return apiFetch<{ message: string; joinUrl: string }>("/api/guests/invite", { method: "POST", body: JSON.stringify(input) });
}

// ---- Rewards & redemptions ----
export function listRewards() {
  return apiFetch<RewardDto[]>("/api/rewards");
}
export function createReward(input: { name: string; description?: string | null; boliCost: number; stock?: number | null; imageUrl?: string | null }) {
  return apiFetch<RewardDto>("/api/rewards", { method: "POST", body: JSON.stringify(input) });
}
export function updateReward(id: string, input: Partial<{ name: string; description: string | null; boliCost: number; isActive: boolean; stock: number | null }>) {
  return apiFetch<RewardDto>(`/api/rewards/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}
export function deleteReward(id: string) {
  return apiFetch<void>(`/api/rewards/${id}`, { method: "DELETE" });
}
export interface RedemptionRow extends RedemptionDto {
  guestName: string;
  rewardName: string;
}
export function listRedemptions() {
  return apiFetch<RedemptionRow[]>("/api/redemptions");
}
export function fulfillRedemption(id: string) {
  return apiFetch<RedemptionDto>(`/api/redemptions/${id}/fulfill`, { method: "PATCH" });
}

// ---- Membership tiers ----
export function listTiers() {
  return apiFetch<MembershipTierDto[]>("/api/membership-tiers");
}
export function createTier(input: { name: string; minVisits: number; perks?: string | null; sortOrder?: number; badgeColor?: string | null }) {
  return apiFetch<MembershipTierDto>("/api/membership-tiers", { method: "POST", body: JSON.stringify(input) });
}
export function updateTier(id: string, input: Partial<{ name: string; minVisits: number; perks: string | null; sortOrder: number; badgeColor: string | null }>) {
  return apiFetch<MembershipTierDto>(`/api/membership-tiers/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}
export function deleteTier(id: string) {
  return apiFetch<void>(`/api/membership-tiers/${id}`, { method: "DELETE" });
}

// ---- Campaigns ----
export function listCampaigns() {
  return apiFetch<CampaignDto[]>("/api/campaigns");
}
export function createCampaign(input: {
  name: string;
  triggerType: CampaignDto["triggerType"];
  channel: CampaignDto["channel"];
  status: CampaignDto["status"];
  messageTemplate: string;
  triggerConfig: Record<string, unknown>;
}) {
  return apiFetch<CampaignDto>("/api/campaigns", { method: "POST", body: JSON.stringify(input) });
}
export function updateCampaign(id: string, input: Partial<{
  name: string;
  triggerType: CampaignDto["triggerType"];
  channel: CampaignDto["channel"];
  status: CampaignDto["status"];
  messageTemplate: string;
  triggerConfig: Record<string, unknown>;
}>) {
  return apiFetch<CampaignDto>(`/api/campaigns/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}
export function deleteCampaign(id: string) {
  return apiFetch<void>(`/api/campaigns/${id}`, { method: "DELETE" });
}
export function runDueCampaigns() {
  return apiFetch<{ campaignsEvaluated: number; messagesSent: number; details: { campaignId: string; campaignName: string; messagesSent: number }[] }>(
    "/api/campaigns/run-due",
    { method: "POST" },
  );
}

// ---- Messages ----
export function listMessages() {
  return apiFetch<MessageLogDto[]>("/api/messages");
}

// ---- Reviews ----
export interface ReviewRow extends ReviewDto {
  guestName: string;
  outletName: string;
}
export function listReviews() {
  return apiFetch<ReviewRow[]>("/api/reviews");
}
export function respondToReview(id: string, staffResponse: string) {
  return apiFetch<ReviewDto>(`/api/reviews/${id}/respond`, { method: "PATCH", body: JSON.stringify({ staffResponse }) });
}

// ---- Referrals ----
export interface ReferralRow {
  id: string;
  status: string;
  referrerName: string;
  refereeName: string;
  referrerRewardBoli: number | null;
  refereeRewardBoli: number | null;
  completedAt: string | null;
  createdAt: string;
}
export function listReferrals() {
  return apiFetch<ReferralRow[]>("/api/referrals");
}
export function getReferralSettings() {
  return apiFetch<ReferralSettingsDto>("/api/referral-settings");
}
export function updateReferralSettings(input: Partial<Pick<ReferralSettingsDto, "referrerBonusBoli" | "refereeBonusBoli" | "isActive">>) {
  return apiFetch<ReferralSettingsDto>("/api/referral-settings", { method: "PATCH", body: JSON.stringify(input) });
}

// ---- Staff ----
export function listStaff() {
  return apiFetch<StaffUserDto[]>("/api/staff");
}
export function createStaff(input: { name: string; email: string; password: string; role: StaffUserDto["role"] }) {
  return apiFetch<StaffUserDto>("/api/staff", { method: "POST", body: JSON.stringify(input) });
}
export function updateStaff(id: string, input: Partial<{ name: string; role: StaffUserDto["role"]; isActive: boolean }>) {
  return apiFetch<StaffUserDto>(`/api/staff/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}
export function deleteStaff(id: string) {
  return apiFetch<void>(`/api/staff/${id}`, { method: "DELETE" });
}
