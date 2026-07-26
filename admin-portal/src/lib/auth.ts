const TOKEN_KEY = "boli_admin_token";

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function isLoggedIn(): boolean {
  return Boolean(getAdminToken());
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
}
