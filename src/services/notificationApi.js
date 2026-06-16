const apiHost = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_ROOT = apiHost.endsWith("/api")
  ? apiHost
  : `${apiHost.replace(/\/$/, "")}/api`;
const NOTIFICATION_API_URL = `${API_ROOT}/notifications`;

const request = async (method, path, body, params) => {
  const url = new URL(`${NOTIFICATION_API_URL}${path}`);
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

  if (body !== undefined) {
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

export const getNotifications = () => request("GET", "/");

export const markAsRead = (id) => request("PUT", `/${id}/read`);

export const markAllAsRead = () => request("PUT", "/read-all");

export const getPreferences = () => request("GET", "/preferences");

export const updatePreferences = (preferences) =>
  request("PUT", "/preferences", preferences);

export const getEmailLogs = () => request("GET", "/emails");

export const sendSmsToSuppliers = (supplierIds, message) =>
  request("POST", "/sms/suppliers", { supplierIds, message });

export const sendSmsToWarehouses = (warehouseIds, message) =>
  request("POST", "/sms/warehouses", { warehouseIds, message });

export const sendSupplierNotifications = (supplierIds, message, subject, sendSms, sendEmail) =>
  request("POST", "/notify/suppliers", { supplierIds, message, subject, sendSms, sendEmail });

export const sendEmployeeNotifications = (employeeIds, message, subject, sendSms, sendEmail) =>
  request("POST", "/notify/employees", { employeeIds, message, subject, sendSms, sendEmail });

export const sendCustomerNotifications = (customerIds, message, subject, sendSms, sendEmail) =>
  request("POST", "/notify/customers", { customerIds, message, subject, sendSms, sendEmail });
