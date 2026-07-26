import { prisma } from "../../../db/client.js";
import { verifyPassword } from "../../../lib/password.js";
import { signStaffToken, type StaffJwtPayload } from "../../../lib/jwt.js";
import { ApiError } from "../../../lib/ApiError.js";
import { toStaffUserDto } from "../../../lib/mappers.js";
import type { StaffLoginInput } from "./staff.schema.js";
import type { StaffRole } from "@boli/shared";

export async function loginStaff(input: StaffLoginInput) {
  const staff = await prisma.staffUser.findUnique({ where: { email: input.email } });
  if (!staff || !staff.isActive) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const valid = await verifyPassword(input.password, staff.passwordHash);
  if (!valid) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const merchant = await prisma.merchant.findUnique({ where: { id: staff.merchantId }, select: { isActive: true } });
  if (!merchant?.isActive) {
    throw ApiError.forbidden("This business account has been suspended");
  }

  const payload: StaffJwtPayload = { staffId: staff.id, merchantId: staff.merchantId, role: staff.role as StaffRole };
  const token = signStaffToken(payload);

  return { token, staff: toStaffUserDto(staff) };
}

export async function getStaffMe(staffId: string) {
  const staff = await prisma.staffUser.findUnique({ where: { id: staffId } });
  if (!staff) throw ApiError.notFound("Staff user not found");
  return toStaffUserDto(staff);
}
