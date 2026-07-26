import type { NextFunction, Request, Response } from "express";
import { verifyAdminToken } from "../lib/jwt.js";
import { ApiError } from "../lib/ApiError.js";

export function authAdmin(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(ApiError.unauthorized("Missing admin token"));
  }
  try {
    req.admin = verifyAdminToken(header.slice("Bearer ".length));
    next();
  } catch {
    next(ApiError.unauthorized("Invalid or expired admin token"));
  }
}
