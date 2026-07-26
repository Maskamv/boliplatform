export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 5;
export const OTP_MAX_ATTEMPTS = 5;

export const DEFAULT_BOLI_PER_VISIT = 10;
export const DEFAULT_SIGNUP_BONUS_BOLI = 20;
export const DEFAULT_REFERRER_BONUS_BOLI = 50;
export const DEFAULT_REFEREE_BONUS_BOLI = 25;

export const GUEST_JWT_EXPIRES_IN = "30d";
export const STAFF_JWT_EXPIRES_IN = "7d";
export const ADMIN_JWT_EXPIRES_IN = "7d";

/** How many days without a visit before a guest is eligible for a WIN_BACK campaign, if the campaign doesn't override it. */
export const DEFAULT_WIN_BACK_DAYS = 30;
/** Re-send cooldown for WIN_BACK so the same guest isn't messaged every run. */
export const WIN_BACK_DEDUPE_WINDOW_DAYS = 14;
/** Default delay after a visit before a POST_VISIT campaign (e.g. review request) fires. */
export const DEFAULT_POST_VISIT_DELAY_HOURS = 3;

export const CURRENCY_DEFAULT = "MVR";
