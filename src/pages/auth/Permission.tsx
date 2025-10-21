import React from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import * as CryptoJS from "crypto-js";
import { mySecretKey } from "../../service/myConst";

interface PermissionProps {
  allowedRoles: string[];
  children: ReactNode;
}

export default function Permission({ allowedRoles, children }: PermissionProps): React.ReactElement {
  const encryptedRole = localStorage.getItem("Role");

  if (!encryptedRole) {
    return <Navigate to="/login" replace />;
  }

  try {
    const bytes = CryptoJS.AES.decrypt(encryptedRole, mySecretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
      return <Navigate to="/login" replace />;
    }

    // decrypted may be a plain string, JSON string, or JSON with array of roles
    let roleStr: string | undefined;
    try {
      const parsed: unknown = JSON.parse(decrypted);

      const isStringArray = (v: unknown): v is string[] =>
        Array.isArray(v) && v.every((x) => typeof x === "string");

      const isObject = (v: unknown): v is Record<string, unknown> =>
        v !== null && typeof v === "object";

      if (typeof parsed === "string") {
        roleStr = parsed;
      } else if (isStringArray(parsed)) {
        // array of roles
        const ok = parsed.some((r) => allowedRoles.includes(r));
        if (!ok) return <Navigate to="/mainscreen" replace />;
        return <>{children}</>;
      } else if (isObject(parsed)) {
        const obj = parsed as Record<string, unknown>;
        if (typeof obj.role === "string") {
          roleStr = obj.role;
        } else if (isStringArray(obj.roles)) {
          const ok = obj.roles.some((r) => allowedRoles.includes(r));
          if (!ok) return <Navigate to="/mainscreen" replace />;
          return <>{children}</>;
        } else {
          // fallback: try first string value
          const first = Object.values(obj).find((v) => typeof v === "string");
          roleStr = first ? String(first) : undefined;
        }
      }
    } catch {
      // not JSON — treat as plain string
      roleStr = decrypted;
    }

    if (!roleStr) {
      return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(roleStr)) {
      return <Navigate to="/mainscreen" replace />;
    }

    return <>{children}</>;
  } catch (error) {
    console.error("Permission decryption error:", error);
    return <Navigate to="/login" replace />;
  }
}