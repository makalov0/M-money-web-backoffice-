import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const isAuthenticated = (): boolean => !!localStorage.getItem("token");

export function ProtectedRoute({ children }: { children: ReactNode }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function LoginGate({ children }: { children: ReactNode }) {
  if (isAuthenticated()) return <Navigate to="/mainscreen" replace />;
  return <>{children}</>;
}
