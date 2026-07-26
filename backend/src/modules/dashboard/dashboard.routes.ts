import { Router } from "express";
import { authStaff } from "../../middleware/authStaff.js";
import { getDashboardSummary, getVisitsTimeseries } from "./dashboard.service.js";

export const dashboardRouter = Router();

dashboardRouter.use(authStaff);

dashboardRouter.get("/summary", async (req, res, next) => {
  try {
    res.json(await getDashboardSummary(req.staff!.merchantId));
  } catch (err) {
    next(err);
  }
});

dashboardRouter.get("/visits-timeseries", async (req, res, next) => {
  try {
    res.json(await getVisitsTimeseries(req.staff!.merchantId));
  } catch (err) {
    next(err);
  }
});
