import { Router } from "express";
import { authAdmin } from "../../../middleware/authAdmin.js";
import { validateBody } from "../../../middleware/validate.js";
import { adminLoginSchema } from "./admin.schema.js";
import { getAdminMe, loginAdmin } from "./admin.service.js";

export const adminAuthRouter = Router();

adminAuthRouter.post("/login", validateBody(adminLoginSchema), async (req, res, next) => {
  try {
    res.json(await loginAdmin(req.body));
  } catch (err) {
    next(err);
  }
});

adminAuthRouter.get("/me", authAdmin, async (req, res, next) => {
  try {
    res.json(await getAdminMe(req.admin!.adminId));
  } catch (err) {
    next(err);
  }
});
