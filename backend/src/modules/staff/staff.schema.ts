import { z } from "zod";
import { staffRoleSchema } from "@boli/shared";

export const createStaffSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: staffRoleSchema.default("STAFF"),
});
export type CreateStaffInput = z.infer<typeof createStaffSchema>;

export const updateStaffSchema = z.object({
  name: z.string().min(1).optional(),
  role: staffRoleSchema.optional(),
  isActive: z.boolean().optional(),
});
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
