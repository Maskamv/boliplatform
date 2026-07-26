export const PATHS = {
  login: "/login",
  merchants: "/",
  merchantNew: "/merchants/new",
  merchantDetail: (id = ":id") => `/merchants/${id}`,
} as const;
