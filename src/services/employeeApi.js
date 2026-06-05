const EMPLOYEE_API_URL = import.meta.env.VITE_RETAIL_POS_EMPLOYEE_API_URL || "http://localhost:5000/api/employees";

const employeeApi = {
  request: async (method, path, body) => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);

    const options = {
      method,
      signal: controller.signal,
      headers: {},
    };

    if (body !== undefined) {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${EMPLOYEE_API_URL}${path}`, options);
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
    } finally {
      window.clearTimeout(timeout);
    }
  },
  get: (path) => employeeApi.request("GET", path),
  post: (path, body) => employeeApi.request("POST", path, body),
  put: (path, body) => employeeApi.request("PUT", path, body),
  delete: (path) => employeeApi.request("DELETE", path),
};

// Helper to determine if we should fallback to localStorage/mock data
const handleRequest = async (apiCall, fallbackFn) => {
  try {
    const response = await apiCall();
    return response;
  } catch (error) {
    console.warn("Employee API call failed, falling back to LocalStorage/Mock Data:", error.message);
    const data = fallbackFn();
    return { data, isMock: true };
  }
};

// Initial Mock Data
const INITIAL_EMPLOYEES = [
  {
    _id: "emp_1",
    firstName: "Nimal",
    lastName: "Perera",
    email: "nimal.p@pos.com",
    phone: "+94 77 123 4567",
    role: "manager",
    branch: "1", // Colombo Head Office
    status: "Active",
    salary: 75000,
    hireDate: "2024-01-15",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
    performanceScore: 4.8,
  },
  {
    _id: "emp_2",
    firstName: "Kasun",
    lastName: "Jayawardena",
    email: "kasun.j@pos.com",
    phone: "+94 71 987 6543",
    role: "cashier",
    branch: "1", // Colombo Head Office
    status: "Active",
    salary: 45000,
    hireDate: "2024-03-10",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    performanceScore: 4.2,
  },
  {
    _id: "emp_3",
    firstName: "Sunil",
    lastName: "Fernando",
    email: "sunil.f@pos.com",
    phone: "+94 75 444 5555",
    role: "inventory",
    branch: "2", // Kandy City Branch
    status: "Active",
    salary: 48000,
    hireDate: "2024-02-01",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    performanceScore: 4.5,
  },
  {
    _id: "emp_4",
    firstName: "Priya",
    lastName: "Silva",
    email: "priya.s@pos.com",
    phone: "+94 72 222 3333",
    role: "cashier",
    branch: "3", // Galle Fort Branch
    status: "Active",
    salary: 43000,
    hireDate: "2024-05-18",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    performanceScore: 3.9,
  },
  {
    _id: "emp_5",
    firstName: "Amara",
    lastName: "Dias",
    email: "amara.d@pos.com",
    phone: "+94 77 999 8888",
    role: "admin",
    branch: "1", // Colombo Head Office
    status: "Active",
    salary: 95000,
    hireDate: "2023-08-01",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop",
    performanceScore: 4.9,
  }
];

const INITIAL_SCHEDULES = [
  { _id: "sch_1", employeeId: "emp_1", date: "2026-06-03", shift: "Morning", notes: "Opening manager" },
  { _id: "sch_2", employeeId: "emp_2", date: "2026-06-03", shift: "Morning", notes: "Register 1" },
  { _id: "sch_3", employeeId: "emp_3", date: "2026-06-03", shift: "Evening", notes: "Receiving stock" },
  { _id: "sch_4", employeeId: "emp_4", date: "2026-06-03", shift: "Morning", notes: "Galle checkout" },
  { _id: "sch_5", employeeId: "emp_5", date: "2026-06-03", shift: "Off", notes: "Day Off" },
];

const INITIAL_ATTENDANCE = [
  { _id: "att_1", employeeId: "emp_1", date: "2026-06-02", clockIn: "07:55 AM", clockOut: "05:05 PM", status: "Present" },
  { _id: "att_2", employeeId: "emp_2", date: "2026-06-02", clockIn: "08:15 AM", clockOut: "05:00 PM", status: "Late" },
  { _id: "att_3", employeeId: "emp_3", date: "2026-06-02", clockIn: "01:50 PM", clockOut: "10:05 PM", status: "Present" },
  { _id: "att_4", employeeId: "emp_4", date: "2026-06-02", clockIn: "08:00 AM", clockOut: "04:55 PM", status: "Present" },
];

const INITIAL_PERFORMANCE = [
  { _id: "perf_1", employeeId: "emp_1", punctuality: 98, salesAchievement: 105, customerRating: 4.8, taskCompletion: 95, date: "2026-05" },
  { _id: "perf_2", employeeId: "emp_2", punctuality: 85, salesAchievement: 92, customerRating: 4.5, taskCompletion: 88, date: "2026-05" },
  { _id: "perf_3", employeeId: "emp_3", punctuality: 95, salesAchievement: 80, customerRating: 4.2, taskCompletion: 92, date: "2026-05" },
  { _id: "perf_4", employeeId: "emp_4", punctuality: 92, salesAchievement: 98, customerRating: 4.0, taskCompletion: 90, date: "2026-05" },
  { _id: "perf_5", employeeId: "emp_5", punctuality: 100, salesAchievement: 110, customerRating: 4.9, taskCompletion: 99, date: "2026-05" },
];

// Initialize localStorage databases if not present
const getLocalStorageDb = (key, initialData) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
  }
  return JSON.parse(data);
};

const setLocalStorageDb = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// CRUD Mock Handlers
const getMockEmployees = () => getLocalStorageDb("pos_employees", INITIAL_EMPLOYEES);
const getMockSchedules = () => getLocalStorageDb("pos_schedules", INITIAL_SCHEDULES);
const getMockAttendance = () => getLocalStorageDb("pos_attendance", INITIAL_ATTENDANCE);
const getMockPerformance = () => getLocalStorageDb("pos_performance", INITIAL_PERFORMANCE);

export const getAllEmployees = () => {
  return handleRequest(
    () => employeeApi.get("/"),
    () => ({ employees: getMockEmployees() })
  );
};

export const getEmployeeById = (id) => {
  return handleRequest(
    () => employeeApi.get(`/${id}`),
    () => {
      const emps = getMockEmployees();
      const emp = emps.find((e) => e._id === id);
      return { employee: emp };
    }
  );
};

export const addEmployee = (employeeData) => {
  return handleRequest(
    () => employeeApi.post("/", employeeData),
    () => {
      const emps = getMockEmployees();
      const newEmp = {
        _id: `emp_${Date.now()}`,
        status: "Active",
        performanceScore: 4.0,
        photo: employeeData.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop",
        ...employeeData,
      };
      emps.push(newEmp);
      setLocalStorageDb("pos_employees", emps);
      
      // Also add initial default performance record for this employee
      const perfs = getMockPerformance();
      perfs.push({
        _id: `perf_${Date.now()}`,
        employeeId: newEmp._id,
        punctuality: 100,
        salesAchievement: 100,
        customerRating: 4.0,
        taskCompletion: 100,
        date: new Date().toISOString().substring(0, 7),
      });
      setLocalStorageDb("pos_performance", perfs);

      return { employee: newEmp, message: "Employee registered successfully" };
    }
  );
};

export const updateEmployee = (id, employeeData) => {
  return handleRequest(
    () => employeeApi.put(`/${id}`, employeeData),
    () => {
      const emps = getMockEmployees();
      const idx = emps.findIndex((e) => e._id === id);
      if (idx !== -1) {
        emps[idx] = { ...emps[idx], ...employeeData };
        setLocalStorageDb("pos_employees", emps);
        return { employee: emps[idx], message: "Employee updated successfully" };
      }
      throw new Error("Employee not found");
    }
  );
};

export const deleteEmployee = (id) => {
  return handleRequest(
    () => employeeApi.delete(`/${id}`),
    () => {
      const emps = getMockEmployees();
      const filtered = emps.filter((e) => e._id !== id);
      setLocalStorageDb("pos_employees", filtered);
      return { message: "Employee profile deleted successfully" };
    }
  );
};

// Shift schedules API
export const getSchedules = () => {
  return handleRequest(
    () => employeeApi.get("/schedules"),
    () => ({ schedules: getMockSchedules() })
  );
};

export const saveSchedule = (scheduleData) => {
  return handleRequest(
    () => employeeApi.post("/schedules", scheduleData),
    () => {
      const schedules = getMockSchedules();
      // Remove existing schedule for same employee and date if any
      const filtered = schedules.filter(
        (s) => !(s.employeeId === scheduleData.employeeId && s.date === scheduleData.date)
      );
      const newSchedule = {
        _id: `sch_${Date.now()}`,
        ...scheduleData,
      };
      filtered.push(newSchedule);
      setLocalStorageDb("pos_schedules", filtered);
      return { schedule: newSchedule, message: "Schedule updated successfully" };
    }
  );
};

// Attendance API
export const getAttendance = () => {
  return handleRequest(
    () => employeeApi.get("/attendance"),
    () => ({ attendance: getMockAttendance() })
  );
};

export const logAttendance = (attendanceData) => {
  return handleRequest(
    () => employeeApi.post("/attendance", attendanceData),
    () => {
      const logs = getMockAttendance();
      const newLog = {
        _id: `att_${Date.now()}`,
        ...attendanceData,
      };
      logs.unshift(newLog); // Prepend to show latest logs first
      setLocalStorageDb("pos_attendance", logs);
      return { log: newLog, message: "Attendance logged successfully" };
    }
  );
};

// Performance Metrics API
export const getPerformanceMetrics = () => {
  return handleRequest(
    () => employeeApi.get("/performance"),
    () => ({ performance: getMockPerformance() })
  );
};

export const logPerformanceMetric = (metricData) => {
  return handleRequest(
    () => employeeApi.post("/performance", metricData),
    () => {
      const perfs = getMockPerformance();
      const newPerf = {
        _id: `perf_${Date.now()}`,
        ...metricData,
      };
      perfs.push(newPerf);
      setLocalStorageDb("pos_performance", perfs);
      
      // Update employee performanceScore average
      const emps = getMockEmployees();
      const idx = emps.findIndex((e) => e._id === metricData.employeeId);
      if (idx !== -1) {
        const empPerfs = perfs.filter(p => p.employeeId === metricData.employeeId);
        const avgScore = empPerfs.reduce((acc, curr) => {
          const score = (curr.punctuality + curr.salesAchievement + (curr.customerRating * 20) + curr.taskCompletion) / 4 / 20;
          return acc + score;
        }, 0) / empPerfs.length;
        
        emps[idx].performanceScore = parseFloat(avgScore.toFixed(2));
        setLocalStorageDb("pos_employees", emps);
      }

      return { performance: newPerf, message: "Performance metrics updated" };
    }
  );
};
