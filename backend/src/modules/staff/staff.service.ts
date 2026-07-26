import { prisma } from "../../db/client.js";
import { ApiError } from "../../lib/ApiError.js";
import { hashPassword } from "../../lib/password.js";
import { toStaffUserDto } from "../../lib/mappers.js";
import type { CreateStaffInput, UpdateStaffInput } from "./staff.schema.js";

export async function listStaffForMerchant(merchantId: string) {
  const staff = await prisma.staffUser.findMany({ where: { merchantId }, orderBy: { createdAt: "asc" } });
  return staff.map(toStaffUserDto);
}

export async function createStaff(merchantId: string, input: CreateStaffInput) {
  const existing = await prisma.staffUser.findUnique({ where: { email: input.email } });
  if (existing) throw ApiError.conflict("A staff account with this email already exists");

  const passwordHash = await hashPassword(input.password);
  const staff = await prisma.staffUser.create({
    data: { merchantId, name: input.name, email: input.email, passwordHash, role: input.role },
  });
  return toStaffUserDto(staff);
}

async function findStaffOrThrow(merchantId: string, id: string) {
  const staff = await prisma.staffUser.findFirst({ where: { id, merchantId } });
  if (!staff) throw ApiError.notFound("Staff user not found");
  return staff;
}

export async function updateStaff(merchantId: string, id: string, input: UpdateStaffInput) {
  const target = await findStaffOrThrow(merchantId, id);

  if ((input.role && input.role !== "OWNER") || input.isActive === false) {
    if (target.role === "OWNER") {
      const otherOwners = await prisma.staffUser.count({ where: { merchantId, role: "OWNER", id: { not: id } } });
      if (otherOwners === 0) throw ApiError.conflict("A business must keep at least one owner");
    }
  }

  const staff = await prisma.staffUser.update({ where: { id }, data: input });
  return toStaffUserDto(staff);
}

export async function deleteStaff(merchantId: string, id: string, requestingStaffId: string) {
  if (id === requestingStaffId) throw ApiError.badRequest("You can't remove your own account");
  const target = await findStaffOrThrow(merchantId, id);

  if (target.role === "OWNER") {
    const otherOwners = await prisma.staffUser.count({ where: { merchantId, role: "OWNER", id: { not: id } } });
    if (otherOwners === 0) throw ApiError.conflict("A business must keep at least one owner");
  }

  await prisma.staffUser.delete({ where: { id } });
}
