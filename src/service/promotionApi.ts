// src/service/promotionApi.ts
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

/* =====================
   Types
===================== */
export type Promotion = {
  id?: number;
  code: string;
  name: string;
  description: string;
  type: "percentage" | "fixed" | "free_service";
  discountValue: number;
  minAmount: number;
  maxDiscount?: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  usageLimit: number;
  usedCount?: number;
  status: "active" | "scheduled" | "expired" | "inactive";
  applicableServices: string[];
  createdBy?: string;
};

export type PromotionStatistics = {
  total: number;
  active: number;
  scheduled: number;
  byType: { type: string; count: number }[];
  totalUsage: number;
  avgDiscount: number;
};

type ApiResp<T> = {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  count?: number;
};

/* =====================
   Helpers (unknown -> safe)
===================== */
const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

const toStringSafe = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : fallback;

const toNumberSafe = (v: unknown, fallback = 0): number => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
  return fallback;
};

const toStringArraySafe = (v: unknown): string[] => {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
};

/* =====================
   mapping UI -> API (snake_case)
===================== */
const toSnake = (p: Partial<Promotion>) => ({
  code: p.code,
  name: p.name,
  description: p.description,
  type: p.type,

  discount_value: p.discountValue,
  min_amount: p.minAmount,
  max_discount: p.maxDiscount ?? null,

  start_date: p.startDate,
  end_date: p.endDate,

  usage_limit: p.usageLimit,
  used_count: p.usedCount ?? 0,

  status: p.status,

  applicable_services: Array.isArray(p.applicableServices) ? p.applicableServices : [],
  created_by: p.createdBy ?? "admin",
});

/* =====================
   mapping API -> UI (unknown-safe)
===================== */
type PromotionRowSnake = {
  id: unknown;
  code: unknown;
  name: unknown;
  description: unknown;
  type: unknown;

  discount_value: unknown;
  min_amount: unknown;
  max_discount: unknown;

  start_date: unknown;
  end_date: unknown;

  usage_limit: unknown;
  used_count: unknown;

  status: unknown;

  applicable_services: unknown;
  created_by: unknown;
};

const fromSnake = (row: unknown): Promotion => {
  if (!isRecord(row)) {
    // return a safe empty object shape (should not happen if backend is correct)
    return {
      id: undefined,
      code: "",
      name: "",
      description: "",
      type: "percentage",
      discountValue: 0,
      minAmount: 0,
      maxDiscount: undefined,
      startDate: "",
      endDate: "",
      usageLimit: 0,
      usedCount: 0,
      status: "scheduled",
      applicableServices: [],
      createdBy: "admin",
    };
  }

  const r = row as PromotionRowSnake;

  const typeStr = toStringSafe(r.type, "percentage");
  const statusStr = toStringSafe(r.status, "scheduled");

  // narrow to union safely (fallback if unknown)
  const type: Promotion["type"] =
    typeStr === "percentage" || typeStr === "fixed" || typeStr === "free_service"
      ? typeStr
      : "percentage";

  const status: Promotion["status"] =
    statusStr === "active" ||
    statusStr === "scheduled" ||
    statusStr === "expired" ||
    statusStr === "inactive"
      ? statusStr
      : "scheduled";

  const maxDiscountVal = r.max_discount;
  const maxDiscount =
    maxDiscountVal === null || maxDiscountVal === undefined || maxDiscountVal === ""
      ? undefined
      : toNumberSafe(maxDiscountVal);

  return {
    id: toNumberSafe(r.id, 0) || undefined,
    code: toStringSafe(r.code),
    name: toStringSafe(r.name),
    description: toStringSafe(r.description),
    type,

    discountValue: toNumberSafe(r.discount_value, 0),
    minAmount: toNumberSafe(r.min_amount, 0),
    maxDiscount,

    startDate: toStringSafe(r.start_date),
    endDate: toStringSafe(r.end_date),

    usageLimit: toNumberSafe(r.usage_limit, 0),
    usedCount: toNumberSafe(r.used_count, 0),

    status,

    applicableServices: toStringArraySafe(r.applicable_services),
    createdBy: toStringSafe(r.created_by, "admin"),
  };
};

/* =====================
   API functions (no any)
===================== */
export async function getAllPromotions(): Promise<Promotion[]> {
  const res = await axios.get<ApiResp<unknown>>(`${API}/promotions`);
  if (!res.data.success) throw new Error(res.data.message || "Failed to load promotions");

  const data = res.data.data;
  if (!Array.isArray(data)) return [];
  return data.map(fromSnake);
}

export async function searchPromotions(
  search = "",
  type = "all",
  status = "all"
): Promise<Promotion[]> {
  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  if (type) qs.set("type", type);
  if (status) qs.set("status", status);

  const res = await axios.get<ApiResp<unknown>>(`${API}/promotions?${qs.toString()}`);
  if (!res.data.success) throw new Error(res.data.message || "Search failed");

  const data = res.data.data;
  if (!Array.isArray(data)) return [];
  return data.map(fromSnake);
}

export async function getPromotionStatistics(): Promise<PromotionStatistics> {
  const res = await axios.get<ApiResp<unknown>>(`${API}/promotions/statistics`);
  if (!res.data.success) throw new Error(res.data.message || "Failed to load statistics");

  const d = res.data.data;
  if (!isRecord(d)) {
    return { total: 0, active: 0, scheduled: 0, byType: [], totalUsage: 0, avgDiscount: 0 };
  }

  const byTypeRaw = d.byType;
  const byType =
    Array.isArray(byTypeRaw)
      ? byTypeRaw
          .filter(isRecord)
          .map((x) => ({
            type: toStringSafe(x.type),
            count: toNumberSafe(x.count, 0),
          }))
      : [];

  return {
    total: toNumberSafe(d.total, 0),
    active: toNumberSafe(d.active, 0),
    scheduled: toNumberSafe(d.scheduled, 0),
    byType,
    totalUsage: toNumberSafe(d.totalUsage, 0),
    avgDiscount: toNumberSafe(d.avgDiscount, 0),
  };
}

export async function createPromotion(
  payload: Omit<Promotion, "id" | "usedCount">
): Promise<Promotion> {
  const res = await axios.post<ApiResp<unknown>>(`${API}/promotions`, toSnake(payload));
  if (!res.data.success) throw new Error(res.data.error || res.data.message || "Create failed");
  return fromSnake(res.data.data);
}

export async function updatePromotion(
  id: number,
  payload: Partial<Promotion>
): Promise<Promotion> {
  const res = await axios.put<ApiResp<unknown>>(`${API}/promotions/${id}`, toSnake(payload));
  if (!res.data.success) throw new Error(res.data.error || res.data.message || "Update failed");
  return fromSnake(res.data.data);
}

export async function deletePromotion(id: number): Promise<void> {
  const res = await axios.delete<ApiResp<unknown>>(`${API}/promotions/${id}`);
  if (!res.data.success) throw new Error(res.data.error || res.data.message || "Delete failed");
}
