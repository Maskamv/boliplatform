export const PATHS = {
  scan: (outletId = ":outletId") => `/scan/${outletId}`,
  scanQr: "/scan-qr",
  join: (merchantId = ":merchantId") => `/join/${merchantId}`,
  login: "/login",
  loginVerify: "/login/verify",
  home: "/",
  rewards: "/rewards",
  membership: "/membership",
  history: "/history",
  review: (visitId = ":visitId") => `/review/${visitId}`,
  referral: "/referral",
  profile: "/profile",
} as const;
