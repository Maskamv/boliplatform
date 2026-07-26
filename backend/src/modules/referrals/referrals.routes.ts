import { Router } from "express";
import { authGuest } from "../../middleware/authGuest.js";
import { authStaff, requireRole } from "../../middleware/authStaff.js";
import { requireGuestFeature, requireStaffFeature } from "../../lib/features.js";
import { validateBody } from "../../middleware/validate.js";
import { redeemReferralCodeSchema, updateReferralSettingsSchema } from "./referrals.schema.js";
import {
  getOrCreateReferralCode,
  getReferralSettings,
  listReferralsForMerchant,
  redeemReferralCode,
  updateReferralSettings,
} from "./referrals.service.js";

/** Mounted at /api/me alongside meRouter — guest's own referral code. */
export const meReferralRouter = Router();
meReferralRouter.use(authGuest, requireGuestFeature("referralsEnabled"));
meReferralRouter.get("/referral-code", async (req, res, next) => {
  try {
    res.json(await getOrCreateReferralCode(req.guest!.guestId));
  } catch (err) {
    next(err);
  }
});

/** Mounted at /api/referrals. */
export const referralsRouter = Router();

referralsRouter.post(
  "/redeem",
  authGuest,
  requireGuestFeature("referralsEnabled"),
  validateBody(redeemReferralCodeSchema),
  async (req, res, next) => {
    try {
      res.status(201).json(await redeemReferralCode(req.guest!.guestId, req.guest!.merchantId, req.body));
    } catch (err) {
      next(err);
    }
  },
);

referralsRouter.get("/", authStaff, requireStaffFeature("referralsEnabled"), async (req, res, next) => {
  try {
    res.json(await listReferralsForMerchant(req.staff!.merchantId));
  } catch (err) {
    next(err);
  }
});

/** Mounted at /api/referral-settings. */
export const referralSettingsRouter = Router();
referralSettingsRouter.use(authStaff, requireStaffFeature("referralsEnabled"));

referralSettingsRouter.get("/", async (req, res, next) => {
  try {
    res.json(await getReferralSettings(req.staff!.merchantId));
  } catch (err) {
    next(err);
  }
});

referralSettingsRouter.patch("/", requireRole(["OWNER"]), validateBody(updateReferralSettingsSchema), async (req, res, next) => {
  try {
    res.json(await updateReferralSettings(req.staff!.merchantId, req.body));
  } catch (err) {
    next(err);
  }
});
