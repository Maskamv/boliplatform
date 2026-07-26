import type { FeatureFlagsDto, MerchantAdminDto, PlatformAdminDto, StaffUserDto } from "@boli/shared";
import { getAdminToken } from "./auth";

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
  const token = getAdminToken();
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
  return apiFetch<{ token: string; admin: PlatformAdminDto }>("/api/admin/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
export function getMe() {
  return apiFetch<PlatformAdminDto>("/api/admin/auth/me");
}

// ---- Merchants ----
export function listMerchants() {
  return apiFetch<MerchantAdminDto[]>("/api/admin/merchants");
}
export function getMerchant(id: string) {
  return apiFetch<MerchantAdminDto>(`/api/admin/merchants/${id}`);
}
export interface CreateMerchantInput {
  businessName: string;
  contactEmail: string;
  contactPhone?: string | null;
  address?: string | null;
  boliEarnRate: number;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
}
export function createMerchant(input: CreateMerchantInput) {
  return apiFetch<{ merchant: MerchantAdminDto; owner: StaffUserDto }>("/api/admin/merchants", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
export function suspendMerchant(id: string) {
  return apiFetch<MerchantAdminDto>(`/api/admin/merchants/${id}/suspend`, { method: "POST" });
}
export function reactivateMerchant(id: string) {
  return apiFetch<MerchantAdminDto>(`/api/admin/merchants/${id}/reactivate`, { method: "POST" });
}
export function getMerchantFeatures(id: string) {
  return apiFetch<FeatureFlagsDto>(`/api/admin/merchants/${id}/features`);
}
export function updateMerchantFeatures(id: string, input: Partial<FeatureFlagsDto>) {
  return apiFetch<FeatureFlagsDto>(`/api/admin/merchants/${id}/features`, { method: "PATCH", body: JSON.stringify(input) });
}
