import React from "react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface PermissionProps {
  allowedRoles: Array<"ADMIN" | "EMPLOYEE"> | string[];
  children: ReactNode;
}

export default function Permission({
  allowedRoles,
  children,
}: PermissionProps): React.ReactElement {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // "ADMIN" | "EMPLOYEE"

  // ✅ no token => go login
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // ✅ no role => clear session + go login
  if (!role) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("empId");
    localStorage.removeItem("email");
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // ✅ normalize role
  const roleUpper = role.toUpperCase();

  // ✅ normalize allowed roles too (avoid case issue)
  const allowedUpper = allowedRoles.map((r) => String(r).toUpperCase());

  // ✅ role not allowed => go mainscreen
  const ok = allowedUpper.includes(roleUpper);
  if (!ok) {
    return <Navigate to="/mainscreen" replace />;
  }

  return <>{children}</>;
}
