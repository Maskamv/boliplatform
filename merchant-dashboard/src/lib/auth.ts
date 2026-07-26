const TOKEN_KEY = "boli_staff_token";

export function getStaffToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStaffToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function isLoggedIn(): boolean {
  return Boolean(getStaffToken());
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
}
