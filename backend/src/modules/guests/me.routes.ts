import { Router } from "express";
import { authGuest } from "../../middleware/authGuest.js";
import { requireGuestFeature } from "../../lib/features.js";
import { validateBody } from "../../middleware/validate.js";
import { confirmPhoneChangeSchema, requestPhoneChangeSchema, updateOwnProfileSchema } from "./guests.schema.js";
import {
  confirmPhoneChange,
  getOwnBalance,
  getOwnMembership,
  getOwnProfile,
  listOwnRedemptions,
  listOwnReviews,
  listOwnTransactions,
  listOwnVisits,
  requestPhoneChange,
  updateOwnProfile,
} from "./guests.service.js";

/** Guest self-service routes, mounted at /api/me. */
export const meRouter = Router();

meRouter.use(authGuest);

meRouter.get("/profile", async (req, res, next) => {
  try {
    res.json(await getOwnProfile(req.guest!.guestId));
  } catch (err) {
    next(err);
  }
});

meRouter.patch("/profile", validateBody(updateOwnProfileSchema), async (req, res, next) => {
  try {
    res.json(await updateOwnProfile(req.guest!.guestId, req.body));
  } catch (err) {
    next(err);
  }
});

meRouter.get("/balance", async (req, res, next) => {
  try {
    res.json(await getOwnBalance(req.guest!.guestId));
  } catch (err) {
    next(err);
  }
});

meRouter.get("/transactions", async (req, res, next) => {
  try {
    res.json(await listOwnTransactions(req.guest!.guestId));
  } catch (err) {
    next(err);
  }
});

meRouter.get("/visits", async (req, res, next) => {
  try {
    res.json(await listOwnVisits(req.guest!.guestId));
  } catch (err) {
    next(err);
  }
});

meRouter.get("/membership", requireGuestFeature("membershipsEnabled"), async (req, res, next) => {
  try {
    res.json(await getOwnMembership(req.guest!.guestId));
  } catch (err) {
    next(err);
  }
});

meRouter.get("/redemptions", async (req, res, next) => {
  try {
    res.json(await listOwnRedemptions(req.guest!.guestId));
  } catch (err) {
    next(err);
  }
});

meRouter.get("/reviews", async (req, res, next) => {
  try {
    res.json(await listOwnReviews(req.guest!.guestId));
  } catch (err) {
    next(err);
  }
});

meRouter.post("/phone/request-change", validateBody(requestPhoneChangeSchema), async (req, res, next) => {
  try {
    res.json(await requestPhoneChange(req.guest!.guestId, req.body));
  } catch (err) {
    next(err);
  }
});

meRouter.post("/phone/confirm-change", validateBody(confirmPhoneChangeSchema), async (req, res, next) => {
  try {
    res.json(await confirmPhoneChange(req.guest!.guestId, req.body));
  } catch (err) {
    next(err);
  }
});
