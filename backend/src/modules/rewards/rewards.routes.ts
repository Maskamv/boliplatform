import { Router } from "express";
import { authGuest } from "../../middleware/authGuest.js";
import { authStaff } from "../../middleware/authStaff.js";
import { requireGuestFeature, requireStaffFeature } from "../../lib/features.js";
import { validateBody } from "../../middleware/validate.js";
import { createRewardSchema, redeemRewardSchema, updateRewardSchema } from "./rewards.schema.js";
import {
  createReward,
  deleteReward,
  listActiveRewardsForGuest,
  listRewardsForStaff,
  redeemReward,
  updateReward,
} from "./rewards.service.js";

/** Mounted at /api/rewards. Staff CRUD lives under authStaff; the guest catalog/redeem endpoints live under authGuest on distinct sub-paths so the two auth schemes never collide on the same route. */
export const rewardsRouter = Router();

rewardsRouter.get("/catalog", authGuest, requireGuestFeature("loyaltyEnabled"), async (req, res, next) => {
  try {
    res.json(await listActiveRewardsForGuest(req.guest!.merchantId));
  } catch (err) {
    next(err);
  }
});

rewardsRouter.post("/:id/redeem", authGuest, requireGuestFeature("loyaltyEnabled"), validateBody(redeemRewardSchema), async (req, res, next) => {
  try {
    res.status(201).json(await redeemReward(req.guest!.guestId, req.guest!.merchantId, req.params.id, req.body));
  } catch (err) {
    next(err);
  }
});

rewardsRouter.get("/", authStaff, requireStaffFeature("loyaltyEnabled"), async (req, res, next) => {
  try {
    res.json(await listRewardsForStaff(req.staff!.merchantId));
  } catch (err) {
    next(err);
  }
});

rewardsRouter.post("/", authStaff, requireStaffFeature("loyaltyEnabled"), validateBody(createRewardSchema), async (req, res, next) => {
  try {
    res.status(201).json(await createReward(req.staff!.merchantId, req.body));
  } catch (err) {
    next(err);
  }
});

rewardsRouter.patch("/:id", authStaff, requireStaffFeature("loyaltyEnabled"), validateBody(updateRewardSchema), async (req, res, next) => {
  try {
    res.json(await updateReward(req.staff!.merchantId, req.params.id, req.body));
  } catch (err) {
    next(err);
  }
});

rewardsRouter.delete("/:id", authStaff, requireStaffFeature("loyaltyEnabled"), async (req, res, next) => {
  try {
    await deleteReward(req.staff!.merchantId, req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
