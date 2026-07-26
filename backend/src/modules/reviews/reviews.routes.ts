import { Router } from "express";
import { authGuest } from "../../middleware/authGuest.js";
import { authStaff } from "../../middleware/authStaff.js";
import { requireGuestFeature, requireStaffFeature } from "../../lib/features.js";
import { validateBody } from "../../middleware/validate.js";
import { createReviewSchema, respondReviewSchema } from "./reviews.schema.js";
import { createReview, listReviewsForMerchant, respondToReview } from "./reviews.service.js";

export const reviewsRouter = Router();

reviewsRouter.post("/", authGuest, requireGuestFeature("reviewsEnabled"), validateBody(createReviewSchema), async (req, res, next) => {
  try {
    res.status(201).json(await createReview(req.guest!.guestId, req.body));
  } catch (err) {
    next(err);
  }
});

reviewsRouter.get("/", authStaff, requireStaffFeature("reviewsEnabled"), async (req, res, next) => {
  try {
    res.json(await listReviewsForMerchant(req.staff!.merchantId));
  } catch (err) {
    next(err);
  }
});

reviewsRouter.patch("/:id/respond", authStaff, requireStaffFeature("reviewsEnabled"), validateBody(respondReviewSchema), async (req, res, next) => {
  try {
    res.json(await respondToReview(req.staff!.merchantId, req.params.id, req.body));
  } catch (err) {
    next(err);
  }
});
