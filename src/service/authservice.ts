import axios, { type AxiosResponse } from "axios";

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

/* --- API functions --- */

export const loginApi = async (
  item: LoginCredentials
): Promise<LoginResponse> => {
  const response: AxiosResponse<LoginResponse> = await axios.post(
    `${BASE_URL1}/Login`,
    item
  );
  return response.data;
};

export const CheckXjaidee = async (): Promise<CheckXjaideeResponse> => {
  const response: AxiosResponse<CheckXjaideeResponse> = await axios.post(
    `${BASE_URL2}/ReportCredit`
  );
  return response.data;
};

export const SalaryCut = async (
  data: SalaryCutData
): Promise<SalaryCutResponse> => {
  const response: AxiosResponse<SalaryCutResponse> = await axios.post(
    `${BASE_URL2}/Salary_Cut`,
    data
  );
  return response.data;
};

export const updateXjaidee = async (
  data: XjaideeData
): Promise<XjaideeResponse> => {
  const response: AxiosResponse<XjaideeResponse> = await axios.post(
    `${BASE_URL2}/Get_Data`,
    data
  );
  return response.data;
};

export const insertXjaidee = async (
  data: InsertTransactionData
): Promise<Record<string, unknown>> => {
  const response: AxiosResponse<Record<string, unknown>> = await axios.post(
    `${BASE_URL2}/InsertTransaction`,
    data
  );
  return response.data;
};

export const Report_Xjaidee_All = async (
  data: ReportData
): Promise<Record<string, unknown>> => {
  const response: AxiosResponse<Record<string, unknown>> = await axios.post(
    `${BASE_URL2}/Report_Xjaidee_All`,
    data
  );
  return response.data;
};

export const Report_Xjaidee_Paid = async (
  data: ReportData
): Promise<Record<string, unknown>> => {
  const response: AxiosResponse<Record<string, unknown>> = await axios.post(
    `${BASE_URL2}/Report_Xjaidee_Paid`,
    data
  );
  return response.data;
};

export const Report_Xjaidee_Amount_All = async (
  data: ReportData
): Promise<Record<string, unknown>> => {
  const response: AxiosResponse<Record<string, unknown>> = await axios.post(
    `${BASE_URL2}/Report_Xjaidee_Amount_All`,
    data
  );
  return response.data;
};