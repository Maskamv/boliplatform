/**
 * Carries the scanned outlet through the login/OTP flow (which can span
 * multiple page navigations) so we can auto-checkin immediately after the
 * guest verifies their code, without asking them to scan again.
 */
const OUTLET_KEY = "boli_pending_scan_outlet";
const TOKEN_KEY = "boli_pending_scan_token";

export function setPendingScan(outletId: string, token: string): void {
  sessionStorage.setItem(OUTLET_KEY, outletId);
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function getPendingScan(): { outletId: string; token: string } | null {
  const outletId = sessionStorage.getItem(OUTLET_KEY);
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!outletId || !token) return null;
  return { outletId, token };
}

export function clearPendingScan(): void {
  sessionStorage.removeItem(OUTLET_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}
