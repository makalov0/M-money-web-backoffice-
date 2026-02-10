import axios, { type AxiosResponse, type AxiosError } from "axios";

const BASE_URL = "http://localhost:5001/api";

/* Types */
export interface LoginCredentials {
  emp_id: string;
  phone: string;
}

export interface LoginProfile {
  emp_id?: string;
  role?: "ADMIN" | "EMPLOYEE";
  email?: string;
}

export interface LoginResponse {
  success?: boolean;
  token?: string;
  profile?: LoginProfile;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  data?: unknown;
}

interface BackendErrorResponse {
  message?: string;
  [key: string]: unknown;
}

/* Axios */
const authApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

const handleApiError = (error: AxiosError): ApiError => {
  if (error.response) {
    const data = error.response.data as BackendErrorResponse;
    return { message: data?.message || "Server error occurred", status: error.response.status, data };
  }
  if (error.request) return { message: "No response from server. Please check your connection.", status: 0 };
  return { message: error.message || "An unexpected error occurred" };
};

authApi.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(handleApiError(error))
);

/* API */
export const loginApi = async (item: LoginCredentials): Promise<LoginResponse> => {
  const response: AxiosResponse<LoginResponse> = await authApi.post("/auth/login", item);

  if (response.data?.token) localStorage.setItem("token", response.data.token);
  if (response.data?.profile?.emp_id) localStorage.setItem("empId", response.data.profile.emp_id);
  if (response.data?.profile?.role) localStorage.setItem("role", response.data.profile.role);
  if (response.data?.profile?.email) localStorage.setItem("email", response.data.profile.email);

  return response.data;
};

export const logoutApi = async (): Promise<{ success: boolean; message?: string }> => {
  try {
    const response: AxiosResponse<{ success: boolean; message?: string }> =
      await authApi.post("/auth/logout");

    // ✅ clear local always
    localStorage.removeItem("token");
    localStorage.removeItem("empId");
    localStorage.removeItem("role");
    localStorage.removeItem("email");

    return response.data;
  } catch (err) {
    // ✅ even server fail => clear local to force login again
    localStorage.removeItem("token");
    localStorage.removeItem("empId");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    throw err;
  }
};
