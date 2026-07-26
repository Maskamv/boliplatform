import { Router } from "express";
import { authStaff, requireRole } from "../../middleware/authStaff.js";
import { validateBody } from "../../middleware/validate.js";
import { createStaffSchema, updateStaffSchema } from "./staff.schema.js";
import { createStaff, deleteStaff, listStaffForMerchant, updateStaff } from "./staff.service.js";

export const staffRouter = Router();

staffRouter.use(authStaff, requireRole(["OWNER"]));

staffRouter.get("/", async (req, res, next) => {
  try {
    res.json(await listStaffForMerchant(req.staff!.merchantId));
  } catch (err) {
    next(err);
  }
});

staffRouter.post("/", validateBody(createStaffSchema), async (req, res, next) => {
  try {
    res.status(201).json(await createStaff(req.staff!.merchantId, req.body));
  } catch (err) {
    next(err);
  }
});

staffRouter.patch("/:id", validateBody(updateStaffSchema), async (req, res, next) => {
  try {
    res.json(await updateStaff(req.staff!.merchantId, req.params.id, req.body));
  } catch (err) {
    next(err);
  }
});

staffRouter.delete("/:id", async (req, res, next) => {
  try {
    await deleteStaff(req.staff!.merchantId, req.params.id, req.staff!.staffId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
