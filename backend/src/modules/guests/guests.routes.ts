import { Router } from "express";
import { authStaff } from "../../middleware/authStaff.js";
import { requireStaffFeature } from "../../lib/features.js";
import { validateBody, validateQuery } from "../../middleware/validate.js";
import { inviteGuestSchema, listGuestsQuerySchema, updateGuestByStaffSchema } from "./guests.schema.js";
import { getGuestDetailForStaff, inviteGuest, listGuestsForMerchant, updateGuestByStaff } from "./guests.service.js";

/** Staff-facing CRM routes, mounted at /api/guests. */
export const guestsRouter = Router();

guestsRouter.use(authStaff, requireStaffFeature("crmEnabled"));

guestsRouter.get("/", validateQuery(listGuestsQuerySchema), async (req, res, next) => {
  try {
    res.json(await listGuestsForMerchant(req.staff!.merchantId, req.query as never));
  } catch (err) {
    next(err);
  }
});

guestsRouter.post("/invite", validateBody(inviteGuestSchema), async (req, res, next) => {
  try {
    res.status(201).json(await inviteGuest(req.staff!.merchantId, req.body));
  } catch (err) {
    next(err);
  }
});

guestsRouter.get("/:id", async (req, res, next) => {
  try {
    res.json(await getGuestDetailForStaff(req.staff!.merchantId, req.params.id));
  } catch (err) {
    next(err);
  }
});

guestsRouter.patch("/:id", validateBody(updateGuestByStaffSchema), async (req, res, next) => {
  try {
    res.json(await updateGuestByStaff(req.staff!.merchantId, req.params.id, req.body));
  } catch (err) {
    next(err);
  }
});
