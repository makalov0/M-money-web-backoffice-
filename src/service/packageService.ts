import axios, { type AxiosResponse, type AxiosError } from "axios";

const BASE_URL = "http://localhost:5000/api"; // Your backend URL

/* --- Types --- */
export interface DataPackage {
  id?: number;
  name: string;
  nameEn: string;
  data: string;
  price: number;
  validity: string;
  speed: string;
  type: "daily" | "weekly" | "monthly" | "unlimited";
  status: "active" | "inactive";
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface PackageStatistics {
  total: number;
  byType: Array<{ type: string; count: number }>;
  avgPrice: number;
}

export interface ApiError {
  message: string;
  status?: number;
  data?: unknown;
}

/* NEW: Backend error type (Fix Unexpected any) */
interface BackendErrorResponse {
  message?: string;
  [key: string]: unknown;
}

/* --- Axios Configuration --- */
const packageApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* --- Request Interceptor --- */
packageApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* --- Response Interceptor --- */
const handleApiError = (error: AxiosError): ApiError => {
  if (error.response) {
    const data = error.response.data as BackendErrorResponse;

    return {
      message: data?.message || "Server error occurred",
      status: error.response.status,
      data,
    };
  } else if (error.request) {
    return {
      message: "No response from server. Please check your connection.",
      status: 0,
    };
  } else {
    return {
      message: error.message || "An unexpected error occurred",
    };
  }
};

packageApi.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(handleApiError(error))
);

/* --- API Functions --- */

// Get all packages
export const getAllPackages = async (): Promise<DataPackage[]> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: DataPackage[]; count: number }> =
      await packageApi.get("/packages");
    return response.data.data;
  } catch (error) {
    console.error("Get all packages error:", error);
    throw error;
  }
};

// Get package by ID
export const getPackageById = async (id: number): Promise<DataPackage> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: DataPackage }> =
      await packageApi.get(`/packages/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("Get package by ID error:", error);
    throw error;
  }
};

// Create new package
export const createPackage = async (packageData: Omit<DataPackage, "id">): Promise<DataPackage> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: DataPackage; message: string }> =
      await packageApi.post("/packages", packageData);
    return response.data.data;
  } catch (error) {
    console.error("Create package error:", error);
    throw error;
  }
};

// Update package
export const updatePackage = async (
  id: number,
  packageData: Partial<DataPackage>
): Promise<DataPackage> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: DataPackage; message: string }> =
      await packageApi.put(`/packages/${id}`, packageData);
    return response.data.data;
  } catch (error) {
    console.error("Update package error:", error);
    throw error;
  }
};

// Delete package
export const deletePackage = async (id: number): Promise<{ message: string }> => {
  try {
    const response: AxiosResponse<{ success: boolean; message: string }> =
      await packageApi.delete(`/packages/${id}`);
    return { message: response.data.message };
  } catch (error) {
    console.error("Delete package error:", error);
    throw error;
  }
};

// Search packages
export const searchPackages = async (
  searchTerm: string,
  filterType: string = "all"
): Promise<DataPackage[]> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: DataPackage[]; count: number }> =
      await packageApi.get("/packages", {
        params: { search: searchTerm, type: filterType },
      });
    return response.data.data;
  } catch (error) {
    console.error("Search packages error:", error);
    throw error;
  }
};

// Get package statistics
export const getPackageStatistics = async (): Promise<PackageStatistics> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: PackageStatistics }> =
      await packageApi.get("/packages/statistics");
    return response.data.data;
  } catch (error) {
    console.error("Get package statistics error:", error);
    throw error;
  }
};

// Get packages by type
export const getPackagesByType = async (type: string): Promise<DataPackage[]> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: DataPackage[]; count: number }> =
      await packageApi.get("/packages", {
        params: { type },
      });
    return response.data.data;
  } catch (error) {
    console.error("Get packages by type error:", error);
    throw error;
  }
};
