import { Router } from "express";
import { authGuest } from "../../../middleware/authGuest.js";
import { validateBody } from "../../../middleware/validate.js";
import { otpRequestSchema, otpVerifySchema } from "./guest.schema.js";
import { getGuestMe, requestGuestOtp, verifyGuestOtp } from "./guest.service.js";

export const guestAuthRouter = Router();

guestAuthRouter.post("/otp/request", validateBody(otpRequestSchema), async (req, res, next) => {
  try {
    res.json(await requestGuestOtp(req.body));
  } catch (err) {
    next(err);
  }
});

guestAuthRouter.post("/otp/verify", validateBody(otpVerifySchema), async (req, res, next) => {
  try {
    res.json(await verifyGuestOtp(req.body));
  } catch (err) {
    next(err);
  }
});

guestAuthRouter.get("/me", authGuest, async (req, res, next) => {
  try {
    res.json(await getGuestMe(req.guest!.guestId));
  } catch (err) {
    next(err);
  }
});
