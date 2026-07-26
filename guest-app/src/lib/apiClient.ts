import type {
  BoliTransactionDto,
  GuestDto,
  MembershipTierDto,
  MerchantPublicDto,
  OutletDto,
  ReferralCodeDto,
  RewardDto,
} from "@boli/shared";
import { getGuestToken } from "./auth";

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
  const token = getGuestToken();
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

// ---- Scan / onboarding ----

export function getScanInfo(outletId: string, token: string) {
  return apiFetch<{ outlet: OutletDto; merchant: MerchantPublicDto }>(`/api/scan/${outletId}?t=${encodeURIComponent(token)}`);
}

export function getMerchantPublic(merchantId: string) {
  return apiFetch<MerchantPublicDto>(`/api/public/merchants/${merchantId}`);
}

export function checkin(outletId: string, token: string) {
  return apiFetch<{ visit: unknown; boliBalance: number }>(`/api/scan/${outletId}/checkin?t=${encodeURIComponent(token)}`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

// ---- Guest auth ----

export function requestOtp(phone: string, merchantId: string) {
  return apiFetch<{ message: string; expiresAt: string; devOtp?: string }>("/api/auth/guest/otp/request", {
    method: "POST",
    body: JSON.stringify({ phone, merchantId }),
  });
}

export function verifyOtp(phone: string, merchantId: string, code: string, name?: string) {
  return apiFetch<{ token: string; guest: GuestDto; isNewGuest: boolean }>("/api/auth/guest/otp/verify", {
    method: "POST",
    body: JSON.stringify({ phone, merchantId, code, name }),
  });
}

// ---- Self-service ----

export function getProfile() {
  return apiFetch<GuestDto>("/api/me/profile");
}

export function updateProfile(input: Partial<Pick<GuestDto, "name" | "email" | "avatarUrl" | "language">>) {
  return apiFetch<GuestDto>("/api/me/profile", { method: "PATCH", body: JSON.stringify(input) });
}

export function requestPhoneChange(newPhone: string) {
  return apiFetch<{ message: string; expiresAt: string; devOtp?: string }>("/api/me/phone/request-change", {
    method: "POST",
    body: JSON.stringify({ newPhone }),
  });
}

export function confirmPhoneChange(newPhone: string, code: string) {
  return apiFetch<GuestDto>("/api/me/phone/confirm-change", {
    method: "POST",
    body: JSON.stringify({ newPhone, code }),
  });
}

export function getBalance() {
  return apiFetch<{ boliBalance: number }>("/api/me/balance");
}

export function getTransactions() {
  return apiFetch<BoliTransactionDto[]>("/api/me/transactions");
}

export function getVisits() {
  return apiFetch<Array<{ id: string; outletName: string; checkedInAt: string; boliEarned: number }>>("/api/me/visits");
}

export function getMembership() {
  return apiFetch<{
    currentTier: MembershipTierDto | null;
    nextTier: MembershipTierDto | null;
    visitsToNextTier: number | null;
    totalVisits: number;
    allTiers: MembershipTierDto[];
  }>("/api/me/membership");
}

export function getMyRedemptions() {
  return apiFetch<Array<{ id: string; rewardName: string; boliSpent: number; status: string; redeemedAt: string }>>("/api/me/redemptions");
}

export function getMyReviews() {
  return apiFetch<Array<{ id: string; visitId: string | null; rating: number; comment: string | null }>>("/api/me/reviews");
}

// ---- Rewards ----

export function getRewardsCatalog() {
  return apiFetch<RewardDto[]>("/api/rewards/catalog");
}

export function redeemReward(rewardId: string) {
  return apiFetch<{ id: string; status: string; boliSpent: number }>(`/api/rewards/${rewardId}/redeem`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

// ---- Reviews ----

export function submitReview(visitId: string, rating: number, comment?: string) {
  return apiFetch(`/api/reviews`, { method: "POST", body: JSON.stringify({ visitId, rating, comment }) });
}

// ---- Referrals ----

export function getReferralCode() {
  return apiFetch<ReferralCodeDto>("/api/me/referral-code");
}

export function redeemReferralCode(code: string) {
  return apiFetch<{ id: string; status: string }>("/api/referrals/redeem", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}
