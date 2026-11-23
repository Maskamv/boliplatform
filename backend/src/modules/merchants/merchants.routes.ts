import { Router } from "express";
import { authStaff, requireRole } from "../../middleware/authStaff.js";
import { validateBody } from "../../middleware/validate.js";
import { updateMerchantSchema } from "./merchants.schema.js";
import { getMerchant, getShareKit, updateMerchant } from "./merchants.service.js";

export const merchantsRouter = Router();

merchantsRouter.use(authStaff);

merchantsRouter.get("/", async (req, res, next) => {
  try {
    res.json(await getMerchant(req.staff!.merchantId));
  } catch (err) {
    next(err);
  }
});

merchantsRouter.get("/share-kit", async (req, res, next) => {
  try {
    res.json(await getShareKit(req.staff!.merchantId));
  } catch (err) {
    next(err);
  }
});

merchantsRouter.patch("/", requireRole(["OWNER"]), validateBody(updateMerchantSchema), async (req, res, next) => {
  try {
    res.json(await updateMerchant(req.staff!.merchantId, req.body));
  } catch (err) {
    next(err);
  }
});
