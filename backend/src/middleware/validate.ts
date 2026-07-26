import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { ApiError } from "../lib/ApiError.js";

type Source = "body" | "query" | "params";

function validate(source: Source, schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(ApiError.badRequest("Validation failed", result.error.flatten()));
    }
    // Replace with the parsed (and possibly coerced/defaulted) value.
    (req as unknown as Record<Source, unknown>)[source] = result.data;
    next();
  };
}

export const validateBody = (schema: ZodSchema) => validate("body", schema);
export const validateQuery = (schema: ZodSchema) => validate("query", schema);
export const validateParams = (schema: ZodSchema) => validate("params", schema);
