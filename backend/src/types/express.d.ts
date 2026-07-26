import type { AdminJwtPayload, GuestJwtPayload, StaffJwtPayload } from "../lib/jwt.js";

declare global {
  namespace Express {
    interface Request {
      guest?: GuestJwtPayload;
      staff?: StaffJwtPayload;
      admin?: AdminJwtPayload;
    }
  }
}

export {};
