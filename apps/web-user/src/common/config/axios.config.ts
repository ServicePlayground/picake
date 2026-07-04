import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/apps/web-user/common/store/auth.store";
import { useAlertStore } from "@/apps/web-user/common/store/alert.store";
import { captureSentryApiError } from "@/apps/web-user/common/utils/sentry.util";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_DOMAIN;

const axiosConfig = {
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
};

export const consumerClient = axios.create({
  ...axiosConfig,
  baseURL: `${API_BASE_URL}/v1/consumer`,
});

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

  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// 공통 응답 인터셉터 - 401 에러 처리
const responseErrorHandler = async (error: AxiosError<{ data?: { message?: string } }>) => {
  const status = error.response?.status;
  const message = error.response?.data?.data?.message;

  // 401 && ACCESS_TOKEN_INVALID 오류 처리
  if (status === 401 && message?.includes("ACCESS_TOKEN_INVALID")) {
    useAuthStore.getState().handleLogoutByEnvironment();
    useAlertStore.getState().showAlert({
      type: "error",
      title: "로그인",
      message: "로그인한 뒤 이용해 주세요.",
    });
    return Promise.resolve();
  }

  captureSentryApiError(error);

  return Promise.reject(error);
};

consumerClient.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error));
consumerClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  responseErrorHandler,
);
