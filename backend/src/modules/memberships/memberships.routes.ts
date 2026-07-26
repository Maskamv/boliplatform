import { Router } from "express";
import { authStaff } from "../../middleware/authStaff.js";
import { requireStaffFeature } from "../../lib/features.js";
import { validateBody } from "../../middleware/validate.js";
import { createTierSchema, updateTierSchema } from "./memberships.schema.js";
import { createTier, deleteTier, listTiers, updateTier } from "./memberships.service.js";

export const membershipsRouter = Router();

membershipsRouter.use(authStaff, requireStaffFeature("membershipsEnabled"));

membershipsRouter.get("/", async (req, res, next) => {
  try {
    res.json(await listTiers(req.staff!.merchantId));
  } catch (err) {
    next(err);
  }
});

membershipsRouter.post("/", validateBody(createTierSchema), async (req, res, next) => {
  try {
    res.status(201).json(await createTier(req.staff!.merchantId, req.body));
  } catch (err) {
    next(err);
  }
});

membershipsRouter.patch("/:id", validateBody(updateTierSchema), async (req, res, next) => {
  try {
    res.json(await updateTier(req.staff!.merchantId, req.params.id, req.body));
  } catch (err) {
    next(err);
  }
});

membershipsRouter.delete("/:id", async (req, res, next) => {
  try {
    await deleteTier(req.staff!.merchantId, req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
