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

/** The guest-app is scoped to whichever merchant the guest first scanned into — persisted so re-opening the app (or requesting a fresh OTP) doesn't require re-scanning. */
export function getMerchantId(): string | null {
  return localStorage.getItem(MERCHANT_KEY);
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
