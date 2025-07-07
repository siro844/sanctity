import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

const api = axios.create({
  baseURL:  process.env.NEXT_PUBLIC_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const originalConfig = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || originalConfig?._retry) {
      return Promise.reject(error);
    }

    originalConfig._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string | null) => {
            if (!originalConfig.headers || !token) return;
            originalConfig.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalConfig));
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      const { data } = await api.post("/auth/refresh", {token : refreshToken });

      const newAccessToken = data.accessToken;
      const newRefreshToken = data.refreshToken;
      localStorage.setItem("accessToken", newAccessToken);
      if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);

      processQueue(null, newAccessToken);

      if (originalConfig.headers) {
        originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;
      }
      return api(originalConfig);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
