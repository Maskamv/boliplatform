import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  JWT_GUEST_SECRET: z.string().min(1),
  JWT_STAFF_SECRET: z.string().min(1),
  JWT_ADMIN_SECRET: z.string().min(1),
  WHATSAPP_PROVIDER: z.enum(["mock"]).default("mock"),
  SMS_PROVIDER: z.enum(["mock"]).default("mock"),
  GUEST_APP_URL: z.string().url().default("http://localhost:5173"),
  ADMIN_PORTAL_URL: z.string().url().default("http://localhost:5175"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration — check backend/.env against backend/.env.example");
}

export const env = parsed.data;
export const isDev = env.NODE_ENV === "development";
