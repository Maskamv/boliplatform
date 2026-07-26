import type { NextFunction, Request, Response } from "express";
import type { StaffRole } from "@boli/shared";
import { verifyStaffToken } from "../lib/jwt.js";
import { ApiError } from "../lib/ApiError.js";
import { prisma } from "../db/client.js";

export async function authStaff(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(ApiError.unauthorized("Missing staff token"));
  }
  try {
    req.staff = verifyStaffToken(header.slice("Bearer ".length));
  } catch {
    return next(ApiError.unauthorized("Invalid or expired staff token"));
  }

  // Checked per-request (not just at login) so a platform admin suspending a
  // merchant takes effect immediately, even for staff already logged in.
  const merchant = await prisma.merchant.findUnique({ where: { id: req.staff.merchantId }, select: { isActive: true } });
  if (!merchant?.isActive) {
    return next(ApiError.forbidden("This business account has been suspended"));
  }
  next();
}

/** Use after authStaff to further gate a route by role, e.g. requireRole(["OWNER"]). */
export function requireRole(roles: StaffRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.staff || !roles.includes(req.staff.role)) {
      return next(ApiError.forbidden("You don't have permission to perform this action"));
    }
    next();
  };
}
