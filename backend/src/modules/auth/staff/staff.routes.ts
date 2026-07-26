import { Router } from "express";
import { authStaff } from "../../../middleware/authStaff.js";
import { validateBody } from "../../../middleware/validate.js";
import { staffLoginSchema } from "./staff.schema.js";
import { getStaffMe, loginStaff } from "./staff.service.js";

export const staffAuthRouter = Router();

staffAuthRouter.post("/login", validateBody(staffLoginSchema), async (req, res, next) => {
  try {
    res.json(await loginStaff(req.body));
  } catch (err) {
    next(err);
  }
});

staffAuthRouter.get("/me", authStaff, async (req, res, next) => {
  try {
    res.json(await getStaffMe(req.staff!.staffId));
  } catch (err) {
    next(err);
  }
});
