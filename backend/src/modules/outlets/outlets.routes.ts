import { Router } from "express";
import { authStaff } from "../../middleware/authStaff.js";
import { requireStaffFeature } from "../../lib/features.js";
import { validateBody } from "../../middleware/validate.js";
import { createOutletSchema, updateOutletSchema } from "./outlets.schema.js";
import {
  createOutlet,
  deleteOutlet,
  getOutlet,
  getOutletQrCode,
  listOutlets,
  regenerateOutletQrCode,
  updateOutlet,
} from "./outlets.service.js";

export const outletsRouter = Router();

outletsRouter.use(authStaff);

outletsRouter.get("/", async (req, res, next) => {
  try {
    res.json(await listOutlets(req.staff!.merchantId));
  } catch (err) {
    next(err);
  }
});

outletsRouter.post("/", validateBody(createOutletSchema), async (req, res, next) => {
  try {
    res.status(201).json(await createOutlet(req.staff!.merchantId, req.body));
  } catch (err) {
    next(err);
  }
});

outletsRouter.get("/:id", async (req, res, next) => {
  try {
    res.json(await getOutlet(req.staff!.merchantId, req.params.id));
  } catch (err) {
    next(err);
  }
});

outletsRouter.patch("/:id", validateBody(updateOutletSchema), async (req, res, next) => {
  try {
    res.json(await updateOutlet(req.staff!.merchantId, req.params.id, req.body));
  } catch (err) {
    next(err);
  }
});

outletsRouter.delete("/:id", async (req, res, next) => {
  try {
    await deleteOutlet(req.staff!.merchantId, req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

outletsRouter.get("/:id/qrcode", requireStaffFeature("qrCodesEnabled"), async (req, res, next) => {
  try {
    res.json(await getOutletQrCode(req.staff!.merchantId, req.params.id));
  } catch (err) {
    next(err);
  }
});

outletsRouter.post("/:id/qrcode/regenerate", requireStaffFeature("qrCodesEnabled"), async (req, res, next) => {
  try {
    res.json(await regenerateOutletQrCode(req.staff!.merchantId, req.params.id));
  } catch (err) {
    next(err);
  }
});
