import { PrismaClient } from "@prisma/client";

// Single shared PrismaClient instance for the process (tsx watch mode
// restarts the whole process on change, so no HMR-singleton dance needed).
export const prisma = new PrismaClient();
