import { Router } from "express";
import { authStaff } from "../../middleware/authStaff.js";
import { requireStaffFeature } from "../../lib/features.js";
import { validateBody } from "../../middleware/validate.js";
import { runDueCampaigns } from "../../jobs/runDueCampaigns.js";
import { createCampaignSchema, updateCampaignSchema } from "./campaigns.schema.js";
import { createCampaign, deleteCampaign, listCampaigns, updateCampaign } from "./campaigns.service.js";

export const campaignsRouter = Router();

campaignsRouter.use(authStaff, requireStaffFeature("campaignsEnabled"));

campaignsRouter.get("/", async (req, res, next) => {
  try {
    res.json(await listCampaigns(req.staff!.merchantId));
  } catch (err) {
    next(err);
  }
});

campaignsRouter.post("/", validateBody(createCampaignSchema), async (req, res, next) => {
  try {
    res.status(201).json(await createCampaign(req.staff!.merchantId, req.body));
  } catch (err) {
    next(err);
  }
});

campaignsRouter.patch("/:id", validateBody(updateCampaignSchema), async (req, res, next) => {
  try {
    res.json(await updateCampaign(req.staff!.merchantId, req.params.id, req.body));
  } catch (err) {
    next(err);
  }
});

campaignsRouter.delete("/:id", async (req, res, next) => {
  try {
    await deleteCampaign(req.staff!.merchantId, req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

campaignsRouter.post("/run-due", async (req, res, next) => {
  try {
    res.json(await runDueCampaigns(req.staff!.merchantId));
  } catch (err) {
    next(err);
  }
});
