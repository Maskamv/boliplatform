import { prisma } from "../../../db/client.js";
import { verifyPassword } from "../../../lib/password.js";
import { signAdminToken, type AdminJwtPayload } from "../../../lib/jwt.js";
import { ApiError } from "../../../lib/ApiError.js";
import { toPlatformAdminDto } from "../../../lib/mappers.js";
import type { AdminLoginInput } from "./admin.schema.js";

export async function loginAdmin(input: AdminLoginInput) {
  const admin = await prisma.platformAdmin.findUnique({ where: { email: input.email } });
  if (!admin || !admin.isActive) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const valid = await verifyPassword(input.password, admin.passwordHash);
  if (!valid) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const payload: AdminJwtPayload = { adminId: admin.id };
  const token = signAdminToken(payload);

  return { token, admin: toPlatformAdminDto(admin) };
}

export async function getAdminMe(adminId: string) {
  const admin = await prisma.platformAdmin.findUnique({ where: { id: adminId } });
  if (!admin) throw ApiError.notFound("Admin not found");
  return toPlatformAdminDto(admin);
}
