import { Router } from "express";
import { authStaff } from "../../middleware/authStaff.js";
import { requireStaffFeature } from "../../lib/features.js";
import { validateQuery } from "../../middleware/validate.js";
import { listMessagesQuerySchema } from "./messages.schema.js";
import { listMessages } from "./messages.service.js";

export const messagesRouter = Router();

messagesRouter.use(authStaff, requireStaffFeature("whatsappMarketingEnabled"));

messagesRouter.get("/", validateQuery(listMessagesQuerySchema), async (req, res, next) => {
  try {
    res.json(await listMessages(req.staff!.merchantId, req.query as never));
  } catch (err) {
    next(err);
  }
});
