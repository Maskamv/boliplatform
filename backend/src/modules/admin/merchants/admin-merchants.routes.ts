import { Router } from "express";
import { authAdmin } from "../../../middleware/authAdmin.js";
import { validateBody } from "../../../middleware/validate.js";
import { createMerchantSchema, updateFeatureFlagsSchema } from "./admin-merchants.schema.js";
import {
  createMerchant,
  getMerchantFeatures,
  getMerchantForAdmin,
  listMerchants,
  reactivateMerchant,
  suspendMerchant,
  updateMerchantFeatures,
} from "./admin-merchants.service.js";

export const adminMerchantsRouter = Router();

adminMerchantsRouter.use(authAdmin);

adminMerchantsRouter.get("/", async (_req, res, next) => {
  try {
    res.json(await listMerchants());
  } catch (err) {
    next(err);
  }
});

adminMerchantsRouter.post("/", validateBody(createMerchantSchema), async (req, res, next) => {
  try {
    res.status(201).json(await createMerchant(req.body));
  } catch (err) {
    next(err);
  }
});

adminMerchantsRouter.get("/:id", async (req, res, next) => {
  try {
    res.json(await getMerchantForAdmin(req.params.id));
  } catch (err) {
    next(err);
  }
});

adminMerchantsRouter.post("/:id/suspend", async (req, res, next) => {
  try {
    res.json(await suspendMerchant(req.params.id));
  } catch (err) {
    next(err);
  }
});

adminMerchantsRouter.post("/:id/reactivate", async (req, res, next) => {
  try {
    res.json(await reactivateMerchant(req.params.id));
  } catch (err) {
    next(err);
  }
});

adminMerchantsRouter.get("/:id/features", async (req, res, next) => {
  try {
    res.json(await getMerchantFeatures(req.params.id));
  } catch (err) {
    next(err);
  }
});

adminMerchantsRouter.patch("/:id/features", validateBody(updateFeatureFlagsSchema), async (req, res, next) => {
  try {
    res.json(await updateMerchantFeatures(req.params.id, req.body));
  } catch (err) {
    next(err);
  }
});
