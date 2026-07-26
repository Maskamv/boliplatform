import { Router } from "express";
import { authGuest } from "../../middleware/authGuest.js";
import { validateBody, validateQuery } from "../../middleware/validate.js";
import { checkinBodySchema, scanQuerySchema } from "./scan.schema.js";
import { checkin, getScanInfo } from "./scan.service.js";

export const scanRouter = Router();

scanRouter.get("/:outletId", validateQuery(scanQuerySchema), async (req, res, next) => {
  try {
    const { t } = req.query as unknown as { t: string };
    res.json(await getScanInfo(req.params.outletId, t));
  } catch (err) {
    next(err);
  }
});

scanRouter.post(
  "/:outletId/checkin",
  authGuest,
  validateQuery(scanQuerySchema),
  validateBody(checkinBodySchema),
  async (req, res, next) => {
    try {
      const { t } = req.query as unknown as { t: string };
      res.json(await checkin(req.params.outletId, t, req.guest!.guestId, req.guest!.merchantId, req.body));
    } catch (err) {
      next(err);
    }
  },
);
