import axios, { type AxiosResponse, type AxiosError } from "axios";

const BASE_URL1 = "http://192.168.100.223:3600/api";
const BASE_URL2 = "http://172.28.26.8:1344";

/* --- Types --- */
export interface LoginCredentials {
  username?: string;
  password?: string;
  [key: string]: unknown;
}

export interface LoginResponse {
  token?: string;
  user?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface CheckXjaideeResponse {
  data?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export interface SalaryCutData {
  emp_id?: string;
  amount?: number;
  [key: string]: unknown;
}

export interface SalaryCutResponse {
  success?: boolean;
  message?: string;
  [key: string]: unknown;
}

export interface XjaideeData {
  emp_id?: string;
  [key: string]: unknown;
}

export interface XjaideeResponse {
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface InsertTransactionData {
  emp_id?: string;
  amount?: number;
  transaction_type?: string;
  [key: string]: unknown;
}

export interface ReportData {
  start_date?: string;
  end_date?: string;
  department?: string;
  [key: string]: unknown;
}

export interface ApiError {
  message: string;
  status?: number;
  data?: unknown;
}

/* --- Axios Configuration --- */
const api1 = axios.create({
  baseURL: BASE_URL1,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const api2 = axios.create({
  baseURL: BASE_URL2,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* --- Request Interceptor (for adding auth tokens) --- */
api1.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api2.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* --- Response Interceptor (for error handling) --- */
const handleApiError = (error: AxiosError): ApiError => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || 'Server error occurred',
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // Request made but no response
    return {
      message: 'No response from server. Please check your connection.',
      status: 0,
    };
  } else {
    // Error in request setup
    return {
      message: error.message || 'An unexpected error occurred',
    };
  }
};

api1.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(handleApiError(error))
);

api2.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(handleApiError(error))
);

/* --- API functions --- */

export const loginApi = async (
  item: LoginCredentials
): Promise<LoginResponse> => {
  try {
    const response: AxiosResponse<LoginResponse> = await api1.post('/Login', item);
    
    // Store token if present
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const CheckXjaidee = async (): Promise<CheckXjaideeResponse> => {
  try {
    const response: AxiosResponse<CheckXjaideeResponse> = await api2.post('/ReportCredit');
    return response.data;
  } catch (error) {
    console.error('CheckXjaidee error:', error);
    throw error;
  }
};

export const SalaryCut = async (
  data: SalaryCutData
): Promise<SalaryCutResponse> => {
  try {
    const response: AxiosResponse<SalaryCutResponse> = await api2.post('/Salary_Cut', data);
    return response.data;
  } catch (error) {
    console.error('SalaryCut error:', error);
    throw error;
  }
};

export const updateXjaidee = async (
  data: XjaideeData
): Promise<XjaideeResponse> => {
  try {
    const response: AxiosResponse<XjaideeResponse> = await api2.post('/Get_Data', data);
    return response.data;
  } catch (error) {
    console.error('updateXjaidee error:', error);
    throw error;
  }
};

export const insertXjaidee = async (
  data: InsertTransactionData
): Promise<Record<string, unknown>> => {
  try {
    const response: AxiosResponse<Record<string, unknown>> = await api2.post(
      '/InsertTransaction',
      data
    );
    return response.data;
  } catch (error) {
    console.error('insertXjaidee error:', error);
    throw error;
  }
};

export const Report_Xjaidee_All = async (
  data: ReportData
): Promise<Record<string, unknown>> => {
  try {
    const response: AxiosResponse<Record<string, unknown>> = await api2.post(
      '/Report_Xjaidee_All',
      data
    );
    return response.data;
  } catch (error) {
    console.error('Report_Xjaidee_All error:', error);
    throw error;
  }
};

export const Report_Xjaidee_Paid = async (
  data: ReportData
): Promise<Record<string, unknown>> => {
  try {
    const response: AxiosResponse<Record<string, unknown>> = await api2.post(
      '/Report_Xjaidee_Paid',
      data
    );
    return response.data;
  } catch (error) {
    console.error('Report_Xjaidee_Paid error:', error);
    throw error;
  }
};

export const Report_Xjaidee_Amount_All = async (
  data: ReportData
): Promise<Record<string, unknown>> => {
  try {
    const response: AxiosResponse<Record<string, unknown>> = await api2.post(
      '/Report_Xjaidee_Amount_All',
      data
    );
    return response.data;
  } catch (error) {
    console.error('Report_Xjaidee_Amount_All error:', error);
    throw error;
  }
};

/* --- Utility functions --- */

export const logout = (): void => {
  localStorage.removeItem('token');
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};