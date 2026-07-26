import jwt from "jsonwebtoken";
import { ADMIN_JWT_EXPIRES_IN, GUEST_JWT_EXPIRES_IN, STAFF_JWT_EXPIRES_IN, type StaffRole } from "@boli/shared";
import { env } from "../env.js";

export interface GuestJwtPayload {
  guestId: string;
  merchantId: string;
}

export interface StaffJwtPayload {
  staffId: string;
  merchantId: string;
  role: StaffRole;
}

/** Deliberately has no merchantId — platform admins aren't scoped to one merchant, unlike StaffJwtPayload. Signed with its own secret so an admin token can never be mistaken for (or forged from) a staff/guest token. */
export interface AdminJwtPayload {
  adminId: string;
}

export function signGuestToken(payload: GuestJwtPayload): string {
  return jwt.sign(payload, env.JWT_GUEST_SECRET, { expiresIn: GUEST_JWT_EXPIRES_IN });
}

export function verifyGuestToken(token: string): GuestJwtPayload {
  return jwt.verify(token, env.JWT_GUEST_SECRET) as GuestJwtPayload;
}

export function signStaffToken(payload: StaffJwtPayload): string {
  return jwt.sign(payload, env.JWT_STAFF_SECRET, { expiresIn: STAFF_JWT_EXPIRES_IN });
}

export function verifyStaffToken(token: string): StaffJwtPayload {
  return jwt.verify(token, env.JWT_STAFF_SECRET) as StaffJwtPayload;
}

export function signAdminToken(payload: AdminJwtPayload): string {
  return jwt.sign(payload, env.JWT_ADMIN_SECRET, { expiresIn: ADMIN_JWT_EXPIRES_IN });
}

export function verifyAdminToken(token: string): AdminJwtPayload {
  return jwt.verify(token, env.JWT_ADMIN_SECRET) as AdminJwtPayload;
}
