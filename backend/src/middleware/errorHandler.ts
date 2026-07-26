import type { NextFunction, Request, Response } from "express";
import type { ApiErrorBody } from "@boli/shared";
import { ApiError } from "../lib/ApiError.js";
import { isDev } from "../env.js";

export function notFoundHandler(req: Request, res: Response) {
  const body: ApiErrorBody = { error: `No route for ${req.method} ${req.path}` };
  res.status(404).json(body);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    const body: ApiErrorBody = { error: err.message, details: err.details };
    return res.status(err.status).json(body);
  }

  if (err && typeof err === "object" && "name" in err && (err as { name: string }).name === "InsufficientBoliBalanceError") {
    const body: ApiErrorBody = { error: (err as Error).message };
    return res.status(409).json(body);
  }

  console.error(err);
  const body: ApiErrorBody = {
    error: "Internal server error",
    details: isDev ? String(err instanceof Error ? err.stack : err) : undefined,
  };
  res.status(500).json(body);
}
