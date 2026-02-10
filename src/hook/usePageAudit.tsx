import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { sendAuditLog } from "../service/auditService";

export default function usePageAudit() {
  const location = useLocation();

  useEffect(() => {
    sendAuditLog({
      action: "PAGE_VIEW",
      page: location.pathname,
      detail: { search: location.search },
    });
  }, [location.pathname, location.search]);
}
