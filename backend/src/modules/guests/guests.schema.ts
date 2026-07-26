import { z } from "zod";
import { languageSchema } from "@boli/shared";

export const listGuestsQuerySchema = z.object({
  search: z.string().optional(),
});
export type ListGuestsQueryInput = z.infer<typeof listGuestsQuerySchema>;

export const inviteGuestSchema = z.object({
  phone: z.string().min(6).max(20),
  name: z.string().min(1).max(100).nullable().optional(),
});
export type InviteGuestInput = z.infer<typeof inviteGuestSchema>;

export const updateGuestByStaffSchema = z.object({
  name: z.string().min(1).nullable().optional(),
  email: z.string().email().nullable().optional(),
  dateOfBirth: z.string().datetime().nullable().optional(),
});
export type UpdateGuestByStaffInput = z.infer<typeof updateGuestByStaffSchema>;

// Avatars are sent as data: URLs (client resizes to ~256px before encoding),
// so this cap is generous headroom rather than a tight limit — no file
// storage/multer needed for a local demo, just guards against absurd payloads.
const AVATAR_MAX_LENGTH = 500_000;

export const updateOwnProfileSchema = z.object({
  name: z.string().min(1).nullable().optional(),
  email: z.string().email().nullable().optional(),
  avatarUrl: z.string().max(AVATAR_MAX_LENGTH).nullable().optional(),
  dateOfBirth: z.string().datetime().nullable().optional(),
  language: languageSchema.optional(),
});
export type UpdateOwnProfileInput = z.infer<typeof updateOwnProfileSchema>;

export const requestPhoneChangeSchema = z.object({
  newPhone: z.string().min(6).max(20),
});
export type RequestPhoneChangeInput = z.infer<typeof requestPhoneChangeSchema>;

export const confirmPhoneChangeSchema = z.object({
  newPhone: z.string().min(6).max(20),
  code: z.string().length(6),
});
export type ConfirmPhoneChangeInput = z.infer<typeof confirmPhoneChangeSchema>;
