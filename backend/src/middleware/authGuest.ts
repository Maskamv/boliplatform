import type { NextFunction, Request, Response } from "express";
import { verifyGuestToken } from "../lib/jwt.js";
import { ApiError } from "../lib/ApiError.js";
import { prisma } from "../db/client.js";

export async function authGuest(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(ApiError.unauthorized("Missing guest token"));
  }
  try {
    req.guest = verifyGuestToken(header.slice("Bearer ".length));
  } catch {
    return next(ApiError.unauthorized("Invalid or expired guest token"));
  }

  // Checked per-request so a platform admin suspending a merchant takes
  // effect immediately, even for guests already logged in.
  const merchant = await prisma.merchant.findUnique({ where: { id: req.guest.merchantId }, select: { isActive: true } });
  if (!merchant?.isActive) {
    return next(ApiError.forbidden("This business account has been suspended"));
  }
  next();
}
