const TOKEN_KEY = "boli_guest_token";
const MERCHANT_KEY = "boli_merchant_id";

export function getGuestToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setGuestToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearGuestToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * The guest-app is scoped to whichever merchant the guest first scanned
 * into — persisted so re-opening the app (or requesting a fresh OTP)
 * doesn't require re-scanning. Falls back to this deployment's configured
 * default merchant (this build serves one business) so a guest who opens
 * the app cold — e.g. from a home-screen icon before ever scanning, or
 * after storage was cleared — still lands on a normal login screen
 * instead of a dead end. Scanning is still how they check in for Boli;
 * it just isn't required to open the app at all.
 */
export function getMerchantId(): string | null {
  return localStorage.getItem(MERCHANT_KEY) || import.meta.env.VITE_DEFAULT_MERCHANT_ID || null;
}

export function setMerchantId(merchantId: string): void {
  localStorage.setItem(MERCHANT_KEY, merchantId);
}

export function isLoggedIn(): boolean {
  return Boolean(getGuestToken());
}

export function logout(): void {
  clearGuestToken();
}
