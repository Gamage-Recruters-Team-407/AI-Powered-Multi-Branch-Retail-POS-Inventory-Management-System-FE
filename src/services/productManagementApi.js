const apiHost = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_ROOT = apiHost.endsWith("/api")
  ? apiHost
  : `${apiHost.replace(/\/$/, "")}/api`;
const PRODUCT_API_URL =
  import.meta.env.VITE_RETAIL_POS_PRODUCT_API_URL || `${API_ROOT}/products`;

const request = async (method, path, body, params) => {
  const url = new URL(`${PRODUCT_API_URL}${path}`);
  const token = localStorage.getItem("token");
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    });
  }

  const options = { method, headers };

  if (body instanceof FormData) {
    options.body = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const error = new Error(data?.message || data?.error || "Request failed");
    error.response = { status: response.status, data };
    throw error;
  }

  return { data, status: response.status };
};

export const getAllProducts = () => request("GET", "/");

export const getProductById = (id) => request("GET", `/${id}`);

export const addProduct = (formData) => request("POST", "/", formData);

export const updateProduct = (id, formData) => request("PUT", `/${id}`, formData);

export const deactivateProduct = (id) => request("PATCH", `/${id}/deactivate`);

export const reactivateProduct = (id) => request("PATCH", `/${id}/reactivate`);

export const deleteProduct = (id) => request("DELETE", `/${id}`);

export const getProductByBarcode = (barcode) =>
  request("GET", `/barcode/${barcode}`);

export const searchProducts = (params) =>
  request("GET", "/search/filter", undefined, params);

export const getActiveProducts = () => request("GET", "/status/active");

export const getInactiveProducts = () => request("GET", "/status/inactive");