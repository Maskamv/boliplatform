import express from "express";
import cors from "cors";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

import { staffAuthRouter } from "./modules/auth/staff/staff.routes.js";
import { guestAuthRouter } from "./modules/auth/guest/guest.routes.js";
import { merchantsRouter } from "./modules/merchants/merchants.routes.js";
import { publicMerchantsRouter } from "./modules/merchants/publicMerchants.routes.js";
import { outletsRouter } from "./modules/outlets/outlets.routes.js";
import { scanRouter } from "./modules/scan/scan.routes.js";
import { guestsRouter } from "./modules/guests/guests.routes.js";
import { meRouter } from "./modules/guests/me.routes.js";
import { rewardsRouter } from "./modules/rewards/rewards.routes.js";
import { redemptionsRouter } from "./modules/rewards/redemptions.routes.js";
import { membershipsRouter } from "./modules/memberships/memberships.routes.js";
import { campaignsRouter } from "./modules/campaigns/campaigns.routes.js";
import { messagesRouter } from "./modules/messages/messages.routes.js";
import { reviewsRouter } from "./modules/reviews/reviews.routes.js";
import { meReferralRouter, referralsRouter, referralSettingsRouter } from "./modules/referrals/referrals.routes.js";
import { staffRouter } from "./modules/staff/staff.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";
import { adminAuthRouter } from "./modules/auth/admin/admin.routes.js";
import { adminMerchantsRouter } from "./modules/admin/merchants/admin-merchants.routes.js";

export function createApp() {
  const app = express();

  app.use(cors());
  // Default 100kb is smaller than the ~500KB avatar data-URL cap in
  // guests.schema.ts — bumped so a real (not test-tiny) photo doesn't get
  // silently rejected by the body parser before validation even runs.
  app.use(express.json({ limit: "2mb" }));
  app.use(requestLogger);

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/auth/staff", staffAuthRouter);
  app.use("/api/auth/guest", guestAuthRouter);
  app.use("/api/merchant", merchantsRouter);
  app.use("/api/public/merchants", publicMerchantsRouter);
  app.use("/api/outlets", outletsRouter);
  app.use("/api/scan", scanRouter);
  app.use("/api/guests", guestsRouter);
  app.use("/api/me", meRouter);
  app.use("/api/me", meReferralRouter);
  app.use("/api/rewards", rewardsRouter);
  app.use("/api/redemptions", redemptionsRouter);
  app.use("/api/membership-tiers", membershipsRouter);
  app.use("/api/campaigns", campaignsRouter);
  app.use("/api/messages", messagesRouter);
  app.use("/api/reviews", reviewsRouter);
  app.use("/api/referrals", referralsRouter);
  app.use("/api/referral-settings", referralSettingsRouter);
  app.use("/api/staff", staffRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/admin/auth", adminAuthRouter);
  app.use("/api/admin/merchants", adminMerchantsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
