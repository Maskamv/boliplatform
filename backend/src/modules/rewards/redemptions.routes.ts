import { Router } from "express";
import { authStaff } from "../../middleware/authStaff.js";
import { requireStaffFeature } from "../../lib/features.js";
import { fulfillRedemption, listRedemptionsForMerchant } from "./rewards.service.js";

/** Staff view of redemptions across all rewards, mounted at /api/redemptions. */
export const redemptionsRouter = Router();

redemptionsRouter.use(authStaff, requireStaffFeature("loyaltyEnabled"));

redemptionsRouter.get("/", async (req, res, next) => {
  try {
    res.json(await listRedemptionsForMerchant(req.staff!.merchantId));
  } catch (err) {
    next(err);
  }
});

redemptionsRouter.patch("/:id/fulfill", async (req, res, next) => {
  try {
    res.json(await fulfillRedemption(req.staff!.merchantId, req.params.id));
  } catch (err) {
    next(err);
  }
});
