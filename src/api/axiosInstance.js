const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const isAuthPage = () => {
  const path = window.location.pathname;
  return (
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/reset-password")
  );
};

const request = async (method, url, body) => {
  const token = localStorage.getItem("token");
  const headers = {};

  const options = { method, headers };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  // Make sure url starts with / and doesn't have double /api
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  const fullUrl = `${API_BASE_URL}${cleanUrl}`;

  const response = await fetch(fullUrl, options);
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (response.status === 401 && !isAuthPage()) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  if (!response.ok) {
    const error = new Error(data?.message || data?.error || "Request failed");
    error.response = { status: response.status, data };
    throw error;
  }

  return { data, status: response.status };
};

const api = {
  get: (url) => request("GET", url),
  post: (url, body) => request("POST", url, body),
  put: (url, body) => request("PUT", url, body),
  patch: (url, body) => request("PATCH", url, body),
  delete: (url) => request("DELETE", url),
};

export default api;