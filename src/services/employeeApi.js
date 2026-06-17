import axios from "axios";

const EMPLOYEE_API_URL = import.meta.env.VITE_RETAIL_POS_EMPLOYEE_API_URL || "http://localhost:5000/api/employees";

const employeeApi = axios.create({
  baseURL: EMPLOYEE_API_URL,
  timeout: 60000, // Increased timeout to 60 seconds to allow slow MongoDB Atlas clusters to connect/respond
});

export const getAllEmployees = () => {
  return employeeApi.get("/");
};

export const getEmployeeById = (id) => {
  return employeeApi.get(`/${id}`);
};

export const addEmployee = (employeeData) => {
  return employeeApi.post("/", employeeData);
};

export const updateEmployee = (id, employeeData) => {
  return employeeApi.put(`/${id}`, employeeData);
};

export const deleteEmployee = (id) => {
  return employeeApi.delete(`/${id}`);
};

// Shift schedules API
export const getSchedules = () => {
  return employeeApi.get("/schedules");
};

export const saveSchedule = (scheduleData) => {
  return employeeApi.post("/schedules", scheduleData);
};

// Attendance API
export const getAttendance = () => {
  return employeeApi.get("/attendance");
};

export const logAttendance = (attendanceData) => {
  return employeeApi.post("/attendance", attendanceData);
};

// Performance Metrics API
export const getPerformanceMetrics = () => {
  return employeeApi.get("/performance");
};

export const logPerformanceMetric = (metricData) => {
  return employeeApi.post("/performance", metricData);
};
