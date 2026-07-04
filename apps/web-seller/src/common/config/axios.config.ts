import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { getAccessToken, removeAccessToken } from "@/apps/web-seller/common/utils/token.util";
import { ROUTES } from "@/apps/web-seller/common/constants/paths.constant";
import { captureSentryApiError } from "@/apps/web-seller/common/utils/sentry.util";

const API_BASE_URL = import.meta.env.VITE_PUBLIC_API_DOMAIN;

const axiosConfig = {
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
};

// seller API 클라이언트
export const sellerClient = axios.create({ ...axiosConfig, baseURL: `${API_BASE_URL}/v1/seller` });

// 공통 요청 인터셉터 - Authorization 헤더 추가
const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  // 기본 Content-Type(application/json)이 FormData 요청에 남으면 boundary 없이 전송되어 업로드가 실패함
  if (config.data instanceof FormData && config.headers) {
    const headers = config.headers as InternalAxiosRequestConfig["headers"] & {
      delete?: (name: string) => void;
    };
    if (typeof headers.delete === "function") {
      headers.delete("Content-Type");
    } else {
      delete (headers as Record<string, unknown>)["Content-Type"];
      delete (headers as Record<string, unknown>)["content-type"];
    }
  }

  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// 공통 응답 인터셉터 - 401 에러 처리
const responseErrorHandler = async (error: AxiosError<any>) => {
  const status = error.response?.status;
  const message = error.response?.data?.data?.message;

  // 401 && ACCESS_TOKEN_INVALID 오류 처리
  if (status === 401 && message?.includes("ACCESS_TOKEN_INVALID")) {
    removeAccessToken();
    window.location.href = ROUTES.AUTH.LOGIN;
    return Promise.resolve();
  }

  captureSentryApiError(error);

  return Promise.reject(error);
};

// seller API 인터셉터 설정
sellerClient.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error));
sellerClient.interceptors.response.use((response: AxiosResponse) => response, responseErrorHandler);
