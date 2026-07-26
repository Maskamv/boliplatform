import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../lib/auth";
import { PATHS } from "../router";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  if (!isLoggedIn()) return <Navigate to={PATHS.login} replace />;
  return <>{children}</>;
}
