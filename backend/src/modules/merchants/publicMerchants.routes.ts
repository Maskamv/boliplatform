import { Router } from "express";
import { getMerchantPublic } from "./merchants.service.js";

/** No-auth merchant lookups for guest-facing pages, mounted at /api/public/merchants. */
export const publicMerchantsRouter = Router();

publicMerchantsRouter.get("/:id", async (req, res, next) => {
  try {
    res.json(await getMerchantPublic(req.params.id));
  } catch (err) {
    next(err);
  }
});
