import morgan from "morgan";
import { isDev } from "../env.js";

export const requestLogger = morgan(isDev ? "dev" : "combined");
