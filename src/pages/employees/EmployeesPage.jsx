import React, { useState, useEffect } from "react";
import { useEmployees } from "../../context/EmployeeContext";
import { useBranches } from "../../context/BranchContext";
import { EmployeeCard, EmployeeDetailModal } from "../../components/employees/Employee";
import SchedulePlanner from "../../components/employees/SchedulePlanner";
import { useAuth } from "../../context/AuthContext";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const getGradientForId = (id) => {
  const gradients = [
    ["#6366f1", "#8b5cf6"],
    ["#8b5cf6", "#a78bfa"],
    ["#ec4899", "#f472b6"],
    ["#f59e0b", "#fbbf24"],
    ["#10b981", "#34d399"],
    ["#3b82f6", "#60a5fa"]
  ];
  if (!id) return `linear-gradient(135deg, ${gradients[0][0]}, ${gradients[0][1]})`;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % gradients.length;
  return `linear-gradient(135deg, ${gradients[idx][0]}, ${gradients[idx][1]})`;
};

export default function EmployeesPage() {
  const {
    employees,
    schedules,
    attendanceLogs,
    performanceMetrics,
    registerEmployee,
    updateEmployee,
    loading,
    error,
    logPerformance,
    loadEmployees,
    loadSchedules,
    loadAttendance,
    loadPerformance,
    employeesLoading,
    schedulesLoading,
    attendanceLoading,
    performanceLoading,
    employeesError,
    schedulesError,
    attendanceError,
    performanceError
  } = useEmployees();

  const { branches, fetchBranches } = useBranches();
  const { user } = useAuth();

  const getTodayLocalDateStr = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Attendance Log Filters & Validation State
  const [attSearchQuery, setAttSearchQuery] = useState("");
  const [attSearchError, setAttSearchError] = useState("");
  const [attStatusFilter, setAttStatusFilter] = useState("All");
  const [attDateFilter, setAttDateFilter] = useState(getTodayLocalDateStr());
  const [attDateError, setAttDateError] = useState("");
  const [attCurrentPage, setAttCurrentPage] = useState(1);
  const ATT_LOGS_PER_PAGE = 8;
  const [perfCurrentPage, setPerfCurrentPage] = useState(1);
  const PERF_LEADERBOARD_PER_PAGE = 9;

  useEffect(() => {
    setAttCurrentPage(1);
  }, [attSearchQuery, attStatusFilter, attDateFilter]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setAttSearchQuery(value);
    const specialCharRegex = /[^\w\s\-\.\@]/g;
    if (specialCharRegex.test(value)) {
      setAttSearchError("Letters, numbers, spaces, and @ . - allowed");
    } else {
      setAttSearchError("");
    }
  };

  const handleDateFilterChange = (e) => {
    const selectedDateStr = e.target.value;
    setAttDateFilter(selectedDateStr);
    if (selectedDateStr) {
      const selectedDate = new Date(selectedDateStr);
      const today = new Date();
      selectedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (selectedDate > today) {
        setAttDateError("Future date cannot be selected");
      } else {
        setAttDateError("");
      }
    } else {
      setAttDateError("");
    }
  };

  // Filter out any logs belonging to deleted employees, then apply search/filter criteria
  const activeAttendanceLogs = attendanceLogs.filter(log => {
    const emp = employees.find(e => e._id === log.employeeId);
    if (!emp) return false;

    // Search query check (Name or Email)
    if (attSearchQuery.trim()) {
      const searchLower = attSearchQuery.toLowerCase();
      const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
      const email = (emp.email || "").toLowerCase();
      if (!fullName.includes(searchLower) && !email.includes(searchLower)) {
        return false;
      }
    }

    // Status filter check
    if (attStatusFilter !== "All" && log.status !== attStatusFilter) {
      return false;
    }

    // Date filter check (only if there's no validation error)
    if (attDateFilter && !attDateError && log.date !== attDateFilter) {
      return false;
    }

    return true;
  });

  const attTotalPages = Math.max(1, Math.ceil(activeAttendanceLogs.length / ATT_LOGS_PER_PAGE));
  const attSafePage = Math.min(attCurrentPage, attTotalPages);
  const attStartIndex = (attSafePage - 1) * ATT_LOGS_PER_PAGE;
  const paginatedAttendanceLogs = activeAttendanceLogs.slice(attStartIndex, attStartIndex + ATT_LOGS_PER_PAGE);

  const goToAttPage = (page) => {
    if (page < 1 || page > attTotalPages) return;
    setAttCurrentPage(page);
  };

  const getAttPageNumbers = () => {
    const pages = [];
    const maxButtons = 5;
    if (attTotalPages <= maxButtons) {
      for (let i = 1; i <= attTotalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (attSafePage > 3) pages.push("...");
      const start = Math.max(2, attSafePage - 1);
      const end = Math.min(attTotalPages - 1, attSafePage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (attSafePage < attTotalPages - 2) pages.push("...");
      pages.push(attTotalPages);
    }
    return pages;
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // Active Tab State
  const [activeTab, setActiveTab] = useState("roster");

  // Fetch data dynamically on tab switch
  useEffect(() => {
    if (activeTab === "roster") {
      loadEmployees(employees.length > 0); // silent if already loaded
    } else if (activeTab === "schedules") {
      loadSchedules(schedules.length > 0);
    } else if (activeTab === "attendance") {
      loadAttendance(attendanceLogs.length > 0);
    } else if (activeTab === "performance") {
      loadPerformance(performanceMetrics.length > 0);
    } else if (activeTab === "reports") {
      Promise.all([
        loadEmployees(true),
        loadAttendance(true),
        loadPerformance(true)
      ]);
    }
  }, [activeTab]);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const EMPLOYEES_PER_PAGE = 9;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRole, selectedBranch]);

  // Selection & Form Modals State
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formEmployee, setFormEmployee] = useState(null); // If editing
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPerfSubmitting, setIsPerfSubmitting] = useState(false);

  // Fetch metrics silently when an employee is selected to view details
  useEffect(() => {
    if (selectedEmployee) {
      loadPerformance(true);
      loadSchedules(true);
      loadAttendance(true);
    }
  }, [selectedEmployee]);

  // Performance Form State
  const [perfEmpId, setPerfEmpId] = useState("");
  const [perfPunctuality, setPerfPunctuality] = useState(0);
  const [perfSales, setPerfSales] = useState(0);
  const [perfRating, setPerfRating] = useState(0.0);
  const [perfTasks, setPerfTasks] = useState(0);

  // Form Fields State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "cashier",
    branch: "",
    salary: "",
    hireDate: "",
    photo: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "firstName":
        if (!value || !value.trim()) {
          error = "First name is required.";
        } else if (!/^[a-zA-Z\s\-']{2,50}$/.test(value.trim())) {
          error = "Must be 2-50 characters (letters only).";
        }
        break;
      case "lastName":
        if (!value || !value.trim()) {
          error = "Last name is required.";
        } else if (!/^[a-zA-Z\s\-']{2,50}$/.test(value.trim())) {
          error = "Must be 2-50 characters (letters only).";
        }
        break;
      case "email":
        if (!value || !value.trim()) {
          error = "Email address is required.";
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value.trim())) {
          error = "Please enter a valid email address.";
        }
        break;
      case "phone":
        if (!value || !value.trim()) {
          error = "Phone number is required.";
        } else {
          const cleanPhone = value.replace(/[\s\-\(\)]/g, "");
          if (!/^(?:\+94|0)?7[0-9]{8}$/.test(cleanPhone)) {
            error = "Enter a valid Sri Lankan mobile number.";
          }
        }
        break;
      case "salary":
        if (value === undefined || value === null || value === "" || isNaN(value) || Number(value) <= 0) {
          error = "Salary must be a positive number above 0.";
        }
        break;
      case "hireDate":
        if (value) {
          const inputDate = new Date(value);
          if (isNaN(inputDate.getTime())) {
            error = "Please enter a valid date.";
          }
        }
        break;
      default:
        break;
    }
    
    setFormErrors(prev => ({
      ...prev,
      [name]: error ? error : null
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    // First Name
    if (!formData.firstName || !formData.firstName.trim()) {
      errors.firstName = "First name is required.";
    } else if (!/^[a-zA-Z\s\-']{2,50}$/.test(formData.firstName.trim())) {
      errors.firstName = "Must be 2-50 characters (letters only).";
    }
    
    // Last Name
    if (!formData.lastName || !formData.lastName.trim()) {
      errors.lastName = "Last name is required.";
    } else if (!/^[a-zA-Z\s\-']{2,50}$/.test(formData.lastName.trim())) {
      errors.lastName = "Must be 2-50 characters (letters only).";
    }
    
    // Email
    if (!formData.email || !formData.email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    
    // Phone
    if (!formData.phone || !formData.phone.trim()) {
      errors.phone = "Phone number is required.";
    } else {
      const cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, "");
      if (!/^(?:\+94|0)?7[0-9]{8}$/.test(cleanPhone)) {
        errors.phone = "Enter a valid Sri Lankan mobile number.";
      }
    }
    
    // Salary
    if (formData.salary === undefined || formData.salary === null || formData.salary === "" || isNaN(formData.salary) || Number(formData.salary) <= 0) {
      errors.salary = "Salary must be a positive number above 0.";
    }
    
    // Hire Date
    if (formData.hireDate) {
      const inputDate = new Date(formData.hireDate);
      if (isNaN(inputDate.getTime())) {
        errors.hireDate = "Please enter a valid date.";
      }
    }
    
    // Profile Photo validation removed
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };  const formatPhoneNumber = (value) => {
    let cleaned = value.replace(/[^\d+]/g, "");
    if (cleaned.startsWith("+94")) {
      cleaned = cleaned.slice(0, 12);
      const parts = [];
      const code = cleaned.slice(0, 3);
      const rest = cleaned.slice(3);
      if (rest.length > 0) parts.push(rest.slice(0, 2));
      if (rest.length > 2) parts.push(rest.slice(2, 5));
      if (rest.length > 5) parts.push(rest.slice(5, 9));
      return `${code} ${parts.join(" ")}`.trim();
    } else if (cleaned.startsWith("0")) {
      cleaned = cleaned.slice(0, 10);
      const parts = [];
      if (cleaned.length > 0) parts.push(cleaned.slice(0, 3));
      if (cleaned.length > 3) parts.push(cleaned.slice(3, 6));
      if (cleaned.length > 6) parts.push(cleaned.slice(6, 10));
      return parts.join(" ");
    }
    return cleaned.slice(0, 12);
  };





  const branchNames = {
    "1": "Colombo Head Office",
    "2": "Kandy City Branch",
    "3": "Galle Fort Branch",
    "4": "Negombo Branch",
  };

  const handleOpenRegister = () => {
    setFormEmployee(null);
    setFormErrors({});
    setIsSubmitting(false);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "cashier",
      branch: "",
      salary: "",
      hireDate: "",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setFormEmployee(emp);
    setFormErrors({});
    setIsSubmitting(false);

    let formattedDate = "";
    const rawDate = emp.joiningDate || emp.hireDate;
    if (rawDate) {
      try {
        formattedDate = new Date(rawDate).toISOString().substring(0, 10);
      } catch (e) {
        formattedDate = String(rawDate).substring(0, 10);
      }
    }

    setFormData({
      firstName: emp.firstName || "",
      lastName: emp.lastName || "",
      email: emp.email || "",
      phone: (!emp.phone || emp.phone.toLowerCase() === "no phone") ? "" : emp.phone,
      role: emp.role ? emp.role.toLowerCase() : "cashier",
      // branch: emp.branch || "",
      branch: (typeof emp.branch === 'object' ? emp.branch?._id : (emp.branch && emp.branch !== "Not Assigned" ? emp.branch : "")) || "",
      salary: emp.salary || "",
      hireDate: formattedDate,
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        branch: formData.branch,
        salary: formData.salary,
        hireDate: formData.hireDate
      };

      if (formEmployee) {
        await updateEmployee(formEmployee._id, payload);
      } else {
        await registerEmployee(payload);
      }
      setIsFormOpen(false);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Error saving employee details";
      alert(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmployeeSelect = (empId) => {
    setPerfEmpId(empId);
    if (!empId) {
      setPerfPunctuality(0);
      setPerfSales(0);
      setPerfRating(0.0);
      setPerfTasks(0);
      return;
    }
    const empMetrics = performanceMetrics
      .filter((m) => m.employeeId === empId)
      .sort((a, b) => b.date.localeCompare(a.date));
    if (empMetrics.length > 0) {
      const latest = empMetrics[0];
      setPerfPunctuality(latest.punctuality || 0);
      setPerfSales(latest.salesAchievement || 0);
      setPerfRating(latest.customerRating || 0.0);
      setPerfTasks(latest.taskCompletion || 0);
    } else {
      setPerfPunctuality(0);
      setPerfSales(0);
      setPerfRating(0.0);
      setPerfTasks(0);
    }
  };

  const handlePerfSubmit = async (e) => {
    e.preventDefault();
    if (!perfEmpId || isPerfSubmitting) return;
    setIsPerfSubmitting(true);
    try {
      await logPerformance({
        employeeId: perfEmpId,
        punctuality: parseInt(perfPunctuality),
        salesAchievement: parseInt(perfSales),
        customerRating: parseFloat(perfRating),
        taskCompletion: parseInt(perfTasks),
        date: new Date().toISOString().substring(0, 7),
      });
      // Reset
      setPerfEmpId("");
      setPerfPunctuality(0);
      setPerfSales(0);
      setPerfRating(0.0);
      setPerfTasks(0);
    } catch (err) {
      console.error("Performance log submission error:", err);
      alert("Error logging performance details");
    } finally {
      setIsPerfSubmitting(false);
    }
  };

  // Extract all unique roles present in the live employees database
  const liveRoles = Array.from(
    new Set(
      employees
        .map((emp) => (emp.role ? emp.role.trim().toLowerCase() : ""))
        .filter((r) => r !== "")
    )
  ).sort();

  // Filters logic
  const filteredEmployees = employees.filter((emp) => {
    const cleanSearch = searchTerm.trim().toLowerCase();
    const empName = emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim();
    const fullName = empName.toLowerCase();
    const matchesSearch = fullName.includes(cleanSearch) || 
                          (emp.email && emp.email.toLowerCase().includes(cleanSearch)) ||
                          (emp.phone && emp.phone.includes(cleanSearch));
    const matchesRole = selectedRole === "all" || (emp.role && emp.role.toLowerCase() === selectedRole.toLowerCase());
    // const matchesBranch = selectedBranch === "all" || emp.branch === selectedBranch;
    const matchesBranch = selectedBranch === "all" || 
    (typeof emp.branch === 'object' 
        ? emp.branch?._id === selectedBranch 
        : emp.branch === selectedBranch);
    return matchesSearch && matchesRole && matchesBranch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / EMPLOYEES_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * EMPLOYEES_PER_PAGE;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + EMPLOYEES_PER_PAGE);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxButtons = 5;
    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("...");
      const start = Math.max(2, safePage - 1);
      const end = Math.min(totalPages - 1, safePage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (safePage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  // Calculate Leaderboard metrics
  const getLeaderboard = () => {
    return [...employees].sort((a, b) => b.performanceScore - a.performanceScore);
  };

  const leaderboard = getLeaderboard();

  const perfTotalPages = Math.max(1, Math.ceil(leaderboard.length / PERF_LEADERBOARD_PER_PAGE));
  const perfSafePage = Math.min(perfCurrentPage, perfTotalPages);
  const perfStartIndex = (perfSafePage - 1) * PERF_LEADERBOARD_PER_PAGE;
  const paginatedLeaderboard = leaderboard.slice(perfStartIndex, perfStartIndex + PERF_LEADERBOARD_PER_PAGE);

  const goToPerfPage = (page) => {
    if (page < 1 || page > perfTotalPages) return;
    setPerfCurrentPage(page);
  };

  const getPerfPageNumbers = () => {
    const pages = [];
    const maxButtons = 5;
    if (perfTotalPages <= maxButtons) {
      for (let i = 1; i <= perfTotalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (perfSafePage > 3) pages.push("...");
      const start = Math.max(2, perfSafePage - 1);
      const end = Math.min(perfTotalPages - 1, perfSafePage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (perfSafePage < perfTotalPages - 2) pages.push("...");
      pages.push(perfTotalPages);
    }
    return pages;
  };

  // Print summary report
  const triggerPrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>POS Employees Summary Report</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { bg-color: #f5f5f5; }
            .badge { padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <h1>Employee Corporate Registry</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Branch</th>
                <th>Rating</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${employees.map(emp => {
                const branchObj = branches.find(b => b._id === emp.branch);
                // const displayBranch = branchObj ? branchObj.name : (branchNames[emp.branch] || "Not Assigned");
                const displayBranch = typeof emp.branch === 'object'
                ? emp.branch?.name
                : (branches.find(b => b._id === emp.branch)?.name || "Not Assigned");
                return `
                  <tr>
                    <td><strong>${emp.firstName} ${emp.lastName}</strong></td>
                    <td>${emp.email}</td>
                    <td>${emp.role.toUpperCase()}</td>
                    <td>${displayBranch}</td>
                    <td>${emp.performanceScore} ★</td>
                    <td>${emp.status}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };
  
  const triggerExcelExport = () => {
    const headers = [
      "Employee Name",
      "Email",
      "Role",
      "Base Salary (Rs.)",
      "Total Shifts Logged",
      "Days Present",
      "Days Late",
      "Days Absent",
      "Attendance Rate (%)",
      "Calculated Payout (Rs.)"
    ];

    const rows = employees.map(emp => {
      const empLogs = attendanceLogs.filter(log => log.employeeId === emp._id);
      const totalLogs = empLogs.length;
      
      const presentLogs = empLogs.filter(log => log.status === "Present" || log.status === "PRESENT").length;
      const lateLogs = empLogs.filter(log => log.status === "Late" || log.status === "LATE").length;
      const absentLogs = empLogs.filter(log => log.status === "Absent" || log.status === "ABSENT").length;
      
      const attendanceRate = totalLogs > 0 
        ? Math.round(((presentLogs + lateLogs) / totalLogs) * 100)
        : 100;
        
      const baseSalary = emp.salary || 40000;
      let calculatedPayout = baseSalary;
      if (totalLogs > 0) {
        calculatedPayout = Math.round(baseSalary * ((presentLogs + lateLogs) / totalLogs));
      }

      return [
        `"${emp.firstName} ${emp.lastName}"`,
        `"${emp.email}"`,
        `"${emp.role.toUpperCase()}"`,
        baseSalary,
        totalLogs,
        presentLogs,
        lateLogs,
        absentLogs,
        `"${attendanceRate}%"`,
        calculatedPayout
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Operational_Shift_Summary_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (employeesLoading && employees.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-xs font-bold text-slate-500">Retrieving employee database files...</p>
        </div>
      </div>
    );
  }

  if (employeesError && employees.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-slate-900/10 backdrop-blur-sm p-4">
        <div className="text-center bg-white border border-slate-100 rounded-3xl p-8 max-w-md shadow-xl">
          <div className="text-rose-500 font-black text-3xl mb-3">⚠️ Connection Error</div>
          <p className="text-xs text-slate-500 font-extrabold mb-5 leading-relaxed">{employeesError}</p>
          <button
            onClick={() => loadEmployees(false)}
            className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-100 hover:bg-blue-700 transition"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="emp-module-panel">
      <div className="employees-max-wrapper">
        
        {/* Module Banner */}
        <div className="emp-module-header">
          <div className="emp-header-info">
            <h1>Employee Management</h1>
            <p>Register staff, set schedules, track shift punctuality, and evaluate performance benchmarks.</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="emp-tabs-container">
          {[
            { id: "roster", label: "👥 Employee Directory", icon: "👥" },
            { id: "schedules", label: "📅 Shift Planner", icon: "📅" },
            { id: "attendance", label: "⏱️ Attendance Logs", icon: "⏱️" },
            { id: "performance", label: "📈 Performance Center", icon: "📈" },
            { id: "reports", label: "📄 Metrics Reports", icon: "📄" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`emp-tab-button ${activeTab === tab.id ? "active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="space-y-6">
          
          {/* TAB 1: ROSTER */}
          {activeTab === "roster" && (
            <div className="space-y-5">
              
              {/* Search & Filter Bar */}
              <div className="emp-filters-card">
                <div className="filter-field">
                  <label>Search Staff</label>
                  <input
                    type="text"
                    placeholder="Search by name, email, or telephone..."
                    value={searchTerm}
                    onChange={(e) => {
                      const rawVal = e.target.value;
                      if (rawVal.length > 100) return; // Limit search to 100 characters
                      const sanitized = rawVal
                        .replace(/[^a-zA-Z0-9\s\.\-\@\_\+\(\)]/g, "") // Block all special characters except name/email/phone symbols
                        .replace(/^\s+/, ""); // Trim leading whitespace
                      setSearchTerm(sanitized);
                    }}
                  />
                </div>
                
                <div className="filter-field">
                  <label>Filter Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    {liveRoles.map((role) => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-field">
                  <label>Filter Branch</label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                  >
                    <option value="all">All Branches</option>
                    {branches.length > 0 ? (
                      branches.map((b) => (
                        <option key={b._id} value={b._id}>{b.name}</option>
                      ))
                    ) : (
                      Object.entries(branchNames).map(([id, name]) => (
                        <option key={id} value={id}>{name}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Roster Cards Grid */}
              {filteredEmployees.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)", background: "var(--bg-secondary)", borderRadius: "16px", border: "1px solid var(--border-color)", fontWeight: 600 }}>
                  No employees match the specified filters.
                </div>
              ) : (
                <>
                  <div className="emp-grid-container">
                    <div className="emp-grid">
                      {paginatedEmployees.map((emp) => (
                        <EmployeeCard
                          key={emp._id}
                          employee={emp}
                          onViewDetails={setSelectedEmployee}
                          onEdit={handleOpenEdit}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="emp-pagination-container">
                      <div className="emp-pagination-info">
                        Page {safePage} of {totalPages}
                      </div>
                      <div className="emp-pagination-buttons">
                        <button 
                          onClick={() => goToPage(safePage - 1)} 
                          disabled={safePage === 1}
                          className="emp-pagination-btn"
                        >
                          ← Prev
                        </button>
                        {getPageNumbers().map((p, idx) => p === "..." ? (
                          <span key={`ellipsis-${idx}`} style={{ padding: "7px 6px", fontSize: "13px", color: "#94a3b8" }}>...</span>
                        ) : (
                          <button 
                            key={p} 
                            onClick={() => goToPage(p)}
                            className={`emp-pagination-btn ${p === safePage ? "active" : ""}`}
                          >
                            {p}
                          </button>
                        ))}
                        <button 
                          onClick={() => goToPage(safePage + 1)} 
                          disabled={safePage === totalPages}
                          className="emp-pagination-btn"
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>
          )}

          {/* TAB 2: SCHEDULES */}
          {activeTab === "schedules" && (
            schedulesLoading ? (
              <div className="flex h-[40vh] items-center justify-center bg-white/80 rounded-2xl border border-slate-100 p-8 shadow-sm">
                <div className="text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
                  <p className="mt-4 text-xs font-bold text-slate-500">Loading shift schedules...</p>
                </div>
              </div>
            ) : schedulesError ? (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold px-5 py-4 rounded-2xl text-center shadow-sm">
                ⚠️ {schedulesError}
              </div>
            ) : (
              <SchedulePlanner />
            )
          )}

          {/* TAB 3: ATTENDANCE */}
          {activeTab === "attendance" && (
            attendanceLoading ? (
              <div className="flex h-[40vh] items-center justify-center bg-white/80 rounded-2xl border border-slate-100 p-8 shadow-sm">
                <div className="text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
                  <p className="mt-4 text-xs font-bold text-slate-500">Loading attendance records...</p>
                </div>
              </div>
            ) : attendanceError ? (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold px-5 py-4 rounded-2xl text-center shadow-sm">
                ⚠️ {attendanceError}
              </div>
            ) : (
              (() => {
                const currentEmployee = employees.find(e => e.email?.toLowerCase() === user?.email?.toLowerCase());
                const todayStr = getTodayLocalDateStr();
                const myTodayLog = currentEmployee 
                  ? attendanceLogs.find(log => log.employeeId === currentEmployee._id && log.date === todayStr)
                  : null;

                return (
                  <div className={currentEmployee ? "grid gap-6 lg:grid-cols-[1fr_360px]" : ""}>
                    
                    {/* Left Column: Attendance Stats & Log list */}
                    <div className="space-y-6">
                      
                      {/* Stats row */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm text-center">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Present Ratio</span>
                          <span className="block text-2xl font-black text-slate-800 mt-1">
                            {activeAttendanceLogs.length > 0
                              ? `${Math.round((activeAttendanceLogs.filter(l => l.status === "Present").length / activeAttendanceLogs.length) * 100)}%`
                              : "100%"}
                          </span>
                        </div>
                        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm text-center">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Late Records</span>
                          <span className="block text-2xl font-black text-amber-600 mt-1">
                            {activeAttendanceLogs.filter(l => l.status === "Late").length}
                          </span>
                        </div>
                        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm text-center">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Punchcards</span>
                          <span className="block text-2xl font-black text-blue-600 mt-1">
                            {activeAttendanceLogs.length}
                          </span>
                        </div>
                      </div>

                      {/* Standalone Filters Card */}
                      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                        <div className="flex flex-wrap items-end gap-4 w-full">
                          
                          {/* Search box */}
                          <div className="flex flex-col relative flex-1 min-w-[200px]">
                            <div className="flex justify-between items-center mb-1.5">
                              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Search Staff</label>
                              {attSearchError && (
                                <span className="text-[9px] font-bold text-rose-500">{attSearchError}</span>
                              )}
                            </div>
                            <input
                              type="text"
                              placeholder="Search by name or email..."
                              value={attSearchQuery}
                              onChange={handleSearchChange}
                              className={`w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 text-xs font-medium outline-none transition focus:ring-2 focus:ring-blue-100 ${attSearchError ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-blue-500"}`}
                            />
                          </div>

                          {/* Status dropdown */}
                          <div className="flex flex-col w-full sm:w-48">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 block">Filter Verdict</label>
                            <select
                              value={attStatusFilter}
                              onChange={(e) => setAttStatusFilter(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                            >
                              <option value="All">All Verdicts</option>
                              <option value="Present">Present</option>
                              <option value="Late">Late</option>
                              <option value="Absent">Absent</option>
                              <option value="Leave">Leave</option>
                            </select>
                          </div>

                          {/* Date filter */}
                          <div className="flex flex-col relative w-full sm:w-48">
                            <div className="flex justify-between items-center mb-1.5">
                              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Filter Date</label>
                              {attDateError && (
                                <span className="text-[9px] font-bold text-rose-500">{attDateError}</span>
                              )}
                            </div>
                            <input
                              type="date"
                              value={attDateFilter}
                              onChange={handleDateFilterChange}
                              max={getTodayLocalDateStr()}
                              className={`w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 text-xs font-medium outline-none transition focus:ring-2 focus:ring-blue-100 ${attDateError ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-blue-500"}`}
                            />
                          </div>

                          {/* Clear button */}
                          {(attSearchQuery || attStatusFilter !== "All" || attDateFilter) && (
                            <button
                              onClick={() => {
                                setAttSearchQuery("");
                                setAttStatusFilter("All");
                                setAttDateFilter("");
                                setAttDateError("");
                                setAttSearchError("");
                              }}
                              className="w-full sm:w-auto rounded-xl border border-blue-100 bg-blue-50 text-blue-600 px-5 py-2.5 text-xs font-bold hover:bg-blue-100 transition whitespace-nowrap"
                              title="Clear all filters"
                            >
                              Clear
                            </button>
                          )}

                        </div>
                      </div>

                      {/* Table logs */}
                      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                          <h3 className="text-sm font-extrabold text-slate-700">Attendance Log History</h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-extrabold uppercase text-[10px]">
                                <th className="px-5 py-3">Employee</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Clock In</th>
                                <th className="px-4 py-3">Clock Out</th>
                                <th className="px-5 py-3">Verdict</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {activeAttendanceLogs.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="p-8 text-center text-slate-400">No shift logs found.</td>
                                </tr>
                              ) : (
                                paginatedAttendanceLogs.map((log) => {
                                  const emp = employees.find(e => e._id === log.employeeId) || { firstName: "Deleted", lastName: "Staff", photo: "" };
                                  return (
                                    <tr key={log._id} className="hover:bg-slate-50/50">
                                      <td className="px-5 py-3.5 flex items-center gap-2.5">
                                        {emp.photo ? (
                                          <img src={emp.photo} alt={emp.firstName} className="h-6 w-6 rounded-md object-cover" />
                                        ) : (
                                          <div 
                                            className="h-6 w-6 rounded-md flex items-center justify-center text-white font-bold text-[9px] flex-shrink-0"
                                            style={{ background: getGradientForId(emp._id || log.employeeId) }}
                                          >
                                            {(emp.firstName || "?").charAt(0).toUpperCase()}
                                          </div>
                                        )}
                                        <span className="font-bold text-slate-700">{emp.firstName} {emp.lastName}</span>
                                      </td>
                                      <td className="px-4 py-3.5 font-medium text-slate-500">{log.date}</td>
                                      <td className="px-4 py-3.5 font-bold text-emerald-600">{log.clockIn}</td>
                                      <td className="px-4 py-3.5 font-bold text-slate-600">{log.clockOut || "On Shift"}</td>
                                      <td className="px-5 py-3.5">
                                        <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[9px] uppercase border ${log.status === "Present" ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                                          {log.status}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination Footer Controls */}
                        {attTotalPages > 1 && (
                          <div className="flex justify-between items-center p-4 border-t border-slate-100 bg-slate-50/50 flex-wrap gap-3">
                            <div className="text-[11px] font-bold text-slate-500">
                              Page {attSafePage} of {attTotalPages}
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button 
                                onClick={() => goToAttPage(attSafePage - 1)} 
                                disabled={attSafePage === 1}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                ← Prev
                              </button>
                              {getAttPageNumbers().map((p, idx) => p === "..." ? (
                                <span key={`ellipsis-${idx}`} className="px-2 text-xs font-bold text-slate-400">...</span>
                              ) : (
                                <button 
                                  key={p} 
                                  onClick={() => goToAttPage(p)}
                                  className={`rounded-xl border px-3 py-1.5 text-[11px] font-bold transition ${p === attSafePage ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                                >
                                  {p}
                                </button>
                              ))}
                              <button 
                                onClick={() => goToAttPage(attSafePage + 1)} 
                                disabled={attSafePage === attTotalPages}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Next →
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Right Column: Personal Shift Details Card (Only if user is a registered employee) */}
                    {currentEmployee && (
                      <div>
                        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4 text-left">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">My Shift Status</h3>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                              currentEmployee.workingStatus === "Clocked In" 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}>
                              {currentEmployee.workingStatus || "Off Duty"}
                            </span>
                          </div>
                          
                          <div className="divide-y divide-slate-100 text-xs">
                            <div className="py-2.5 flex justify-between items-center">
                              <span className="text-slate-400 font-bold">Shift Date</span>
                              <span className="font-extrabold text-slate-700">{todayStr}</span>
                            </div>
                            <div className="py-2.5 flex justify-between items-center">
                              <span className="text-slate-400 font-bold">Punch In (Login)</span>
                              <span className="font-extrabold text-emerald-600">
                                {myTodayLog?.clockIn || "Not Clocked In"}
                              </span>
                            </div>
                            <div className="py-2.5 flex justify-between items-center">
                              <span className="text-slate-400 font-bold">Punch Out (Logout)</span>
                              <span className="font-extrabold text-slate-600">
                                {myTodayLog?.clockOut || (myTodayLog?.clockIn ? "Active on Shift" : "Not Clocked Out")}
                              </span>
                            </div>
                            <div className="py-2.5 flex justify-between items-center">
                              <span className="text-slate-400 font-bold">Shift Verdict</span>
                              <span className="font-extrabold text-blue-600">
                                {myTodayLog?.status || "Pending Punch"}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mt-2">
                            ℹ️ Your shift logs are recorded automatically when you log in and log out of the system.
                          </p>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })()
            )
          )
        }

          {/* TAB 4: PERFORMANCE */}
          {activeTab === "performance" && (
            performanceLoading ? (
              <div className="flex h-[40vh] items-center justify-center bg-white/80 rounded-2xl border border-slate-100 p-8 shadow-sm">
                <div className="text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
                  <p className="mt-4 text-xs font-bold text-slate-500">Loading performance data...</p>
                </div>
              </div>
            ) : performanceError ? (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold px-5 py-4 rounded-2xl text-center shadow-sm">
                ⚠️ {performanceError}
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

              
              {/* Leaderboard and statistics */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-5">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">Employee KPI Leaderboard</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Rankings are evaluated dynamically based on customer reviews and operational reliability.</p>
                </div>
                
                <div className="space-y-3 pr-1">
                  {paginatedLeaderboard.map((emp, index) => {
                    const overallIndex = perfStartIndex + index;
                    const rankMedal = overallIndex === 0 ? "🥇" : overallIndex === 1 ? "🥈" : overallIndex === 2 ? "🥉" : `${overallIndex + 1}th`;
                    return (
                      <div 
                        key={emp._id} 
                        className="flex items-center justify-between p-3.5 bg-white border border-slate-100/80 rounded-2xl shadow-[0_2px_5px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-md hover:border-slate-200/80 transition-all duration-200"
                      >
                        <div className="flex items-center gap-3.5">
                          <span className="text-sm font-black text-slate-500 w-6 text-center">{rankMedal}</span>
                          {emp.photo ? (
                            <img src={emp.photo} alt={emp.firstName} className="h-10 w-10 rounded-xl object-cover" />
                          ) : (
                            <div 
                              className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                              style={{ background: getGradientForId(emp._id) }}
                            >
                              {(emp.firstName || "?").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span className="font-extrabold text-slate-800 block text-xs">{emp.firstName} {emp.lastName}</span>
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">
                              {emp.role} • {typeof emp.branch === 'object' ? emp.branch?.name : (branches.find(b => b._id === emp.branch)?.name || "Not Assigned")}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center justify-center gap-1 text-xs font-black text-slate-800 bg-gradient-to-br from-white to-slate-50 border border-slate-100 w-[68px] py-1.5 rounded-xl shadow-sm">
                            <span className="text-amber-400">★</span> {emp.performanceScore}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Footer Controls */}
                {perfTotalPages > 1 && (
                  <div className="flex justify-between items-center p-4 border border-slate-100 rounded-2xl bg-slate-50/50 flex-wrap gap-3 mt-4">
                    <div className="text-xs font-bold text-slate-500">
                      Page {perfSafePage} of {perfTotalPages}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button 
                        onClick={() => goToPerfPage(perfSafePage - 1)} 
                        disabled={perfSafePage === 1}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ← Prev
                      </button>
                      {getPerfPageNumbers().map((p, idx) => p === "..." ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-xs font-bold text-slate-400">...</span>
                      ) : (
                        <button 
                          key={p} 
                          onClick={() => goToPerfPage(p)}
                          className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${p === perfSafePage ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                        >
                          {p}
                        </button>
                      ))}
                      <button 
                        onClick={() => goToPerfPage(perfSafePage + 1)} 
                        disabled={perfSafePage === perfTotalPages}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              {(() => {
                // Calculate dynamic segment shares for selected employee KPI chart
                const val1 = parseInt(perfPunctuality) || 0;
                const val2 = parseInt(perfSales) || 0;
                const val3 = Math.round((parseFloat(perfRating) || 0) * 20); // Scale 5-star to 100%
                const val4 = parseInt(perfTasks) || 0;

                const rawTotal = val1 + val2 + val3 + val4;
                const total = rawTotal > 0 ? rawTotal : 400; // default to equal shares if all are 0

                const share1 = (val1 / total) * 100;
                const share2 = (val2 / total) * 100;
                const share3 = (val3 / total) * 100;
                const share4 = (val4 / total) * 100;

                const C = 314.16; // Circumference for radius 50
                const size1 = (share1 / 100) * C;
                const size2 = (share2 / 100) * C;
                const size3 = (share3 / 100) * C;
                const size4 = (share4 / 100) * C;

                const offset2 = -size1;
                const offset3 = -(size1 + size2);
                const offset4 = -(size1 + size2 + size3);

                const overallScore = Math.round((val1 + val2 + val3 + val4) / 4);

                const isEmptyState = !perfEmpId || rawTotal === 0;
                const chartData = isEmptyState
                  ? [{ name: "Skeleton", value: 100, color: "#cbd5e1" }]
                  : [
                      { name: "Punctuality", value: share1, color: "#3b82f6" },
                      { name: "Productivity", value: share2, color: "#10b981" },
                      { name: "Customer Rating", value: share3, color: "#f59e0b" },
                      { name: "Task Completion", value: share4, color: "#8b5cf6" }
                    ];

                return (
                  <div className="h-full flex flex-col gap-6">
                    <style>{`
                      .kpi-range-input::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        appearance: none;
                        width: 0px;
                        height: 0px;
                        background: transparent;
                        border: none;
                      }
                      .kpi-range-input::-moz-range-thumb {
                        width: 0px;
                        height: 0px;
                        background: transparent;
                        border: none;
                      }
                      .kpi-chart-container:hover .kpi-center-text {
                        opacity: 0;
                        visibility: hidden;
                      }
                      .kpi-center-text {
                        transition: opacity 0.2s ease, visibility 0.2s ease;
                      }
                      .kpi-select-dropdown optgroup {
                        background-color: rgba(59, 130, 246, 0.08);
                        color: #1e3a8a;
                        font-weight: 800;
                      }
                      .kpi-select-dropdown option {
                        background-color: #ffffff;
                        color: #334155;
                        font-weight: 500;
                      }
                    `}</style>
                    {/* Evaluate Performance Form Card */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                      <div className="flex items-center mb-4">
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-800">Evaluate Performance</h3>
                          <p className="text-[10px] text-slate-400 font-semibold">Submit manager review scorecards for personnel.</p>
                        </div>
                      </div>

                      <form onSubmit={handlePerfSubmit} className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Employee</label>
                          <select
                            value={perfEmpId}
                            onChange={e => handleEmployeeSelect(e.target.value)}
                            required
                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 kpi-select-dropdown"
                          >
                            <option value="">-- Choose Employee --</option>
                            {(() => {
                              // Sort employees alphabetically by first and last name
                              const sortedEmployees = [...employees].sort((a, b) => 
                                `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
                              );

                              // Group by branch
                              const groupedByBranch = sortedEmployees.reduce((groups, emp) => {
                                let branchName = "Unassigned / Not Assigned";
                                if (emp.branch) {
                                  if (typeof emp.branch === "object" && emp.branch.name) {
                                    branchName = emp.branch.name;
                                  } else {
                                    const foundBranch = branches.find(b => b._id === emp.branch);
                                    if (foundBranch) {
                                      branchName = foundBranch.name;
                                    }
                                  }
                                }
                                if (!groups[branchName]) groups[branchName] = [];
                                groups[branchName].push(emp);
                                return groups;
                              }, {});

                              return Object.keys(groupedByBranch).sort().map(branchName => (
                                <optgroup key={branchName} label={`🏢 ${branchName.toUpperCase()}`}>
                                  {groupedByBranch[branchName].map(e => (
                                    <option key={e._id} value={e._id}>
                                      {e.firstName} {e.lastName} ({(e.role || "Staff").toUpperCase()})
                                    </option>
                                  ))}
                                </optgroup>
                              ));
                            })()}
                          </select>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1 font-bold">
                            <span className="text-slate-500">Punctuality Score</span>
                            <span className="text-blue-600">{perfPunctuality}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={perfPunctuality} 
                            onChange={e => setPerfPunctuality(e.target.value)} 
                            className="w-full h-2.5 bg-transparent rounded-lg appearance-none cursor-pointer kpi-range-input" 
                            style={{
                              background: `linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.15) 100%), linear-gradient(to right, #3b82f6 0%, #3b82f6 ${Math.max(0, perfPunctuality - 1.5)}%, #0f172a ${Math.max(0, perfPunctuality - 1.5)}%, #0f172a ${perfPunctuality}%, #e2e8f0 ${perfPunctuality}%, #e2e8f0 100%)`,
                              boxShadow: "inset 0 1.5px 3px rgba(0, 0, 0, 0.15)"
                            }}
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1 font-bold">
                            <span className="text-slate-500">Productivity Targets Achievement</span>
                            <span className="text-emerald-600">{perfSales}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={perfSales} 
                            onChange={e => setPerfSales(e.target.value)} 
                            className="w-full h-2.5 bg-transparent rounded-lg appearance-none cursor-pointer kpi-range-input" 
                            style={{
                              background: `linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.15) 100%), linear-gradient(to right, #10b981 0%, #10b981 ${Math.max(0, perfSales - 1.5)}%, #0f172a ${Math.max(0, perfSales - 1.5)}%, #0f172a ${perfSales}%, #e2e8f0 ${perfSales}%, #e2e8f0 100%)`,
                              boxShadow: "inset 0 1.5px 3px rgba(0, 0, 0, 0.15)"
                            }}
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1 font-bold">
                            <span className="text-slate-500">Customer Rating (Avg)</span>
                            <span className="text-amber-600">{perfRating} ★</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="5" 
                            step="0.1" 
                            value={perfRating} 
                            onChange={e => setPerfRating(e.target.value)} 
                            className="w-full h-2.5 bg-transparent rounded-lg appearance-none cursor-pointer kpi-range-input" 
                            style={{
                              background: `linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.15) 100%), linear-gradient(to right, #f59e0b 0%, #f59e0b ${Math.max(0, (perfRating / 5) * 100 - 1.5)}%, #0f172a ${Math.max(0, (perfRating / 5) * 100 - 1.5)}%, #0f172a ${(perfRating / 5) * 100}%, #e2e8f0 ${(perfRating / 5) * 100}%, #e2e8f0 100%)`,
                              boxShadow: "inset 0 1.5px 3px rgba(0, 0, 0, 0.15)"
                            }}
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1 font-bold">
                            <span className="text-slate-500">Task Completion Rate</span>
                            <span className="text-purple-600">{perfTasks}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={perfTasks} 
                            onChange={e => setPerfTasks(e.target.value)} 
                            className="w-full h-2.5 bg-transparent rounded-lg appearance-none cursor-pointer kpi-range-input" 
                            style={{
                              background: `linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.15) 100%), linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${Math.max(0, perfTasks - 1.5)}%, #0f172a ${Math.max(0, perfTasks - 1.5)}%, #0f172a ${perfTasks}%, #e2e8f0 ${perfTasks}%, #e2e8f0 100%)`,
                              boxShadow: "inset 0 1.5px 3px rgba(0, 0, 0, 0.15)"
                            }}
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={!perfEmpId || isPerfSubmitting}
                          className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-100 transition hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isPerfSubmitting ? (
                            <>
                              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              <span>Saving Review...</span>
                            </>
                          ) : (
                            "Save Review Metrics"
                          )}
                        </button>
                      </form>
                    </div>

                    {/* KPI Breakdown Donut/Pie Chart Card */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4 flex-1 flex flex-col justify-between">
                      <div className="text-left">
                        <h3 className="text-sm font-extrabold text-slate-800">Performance KPI Share</h3>
                        <p className="text-[10px] text-slate-400 font-semibold mt-1">Distribution weight share of current evaluated metrics</p>
                      </div>
                      
                      <div className="relative flex justify-center items-center h-40 w-full kpi-chart-container">
                        <ResponsiveContainer width="100%" height={160}>
                          <PieChart>
                            {/* SVG Defs for 3D Drop Shadow Filter */}
                            <defs>
                              <filter id="kpi-3d-shadow" x="-20%" y="-20%" width="140%" height="140%">
                                <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.18" />
                              </filter>
                            </defs>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={70}
                              paddingAngle={isEmptyState ? 0 : 3}
                              dataKey="value"
                              isAnimationActive={!isEmptyState}
                            >
                              {chartData.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={entry.color} 
                                  stroke="none" 
                                  style={{ filter: "url(#kpi-3d-shadow)" }}
                                />
                              ))}
                            </Pie>
                            {/* Hover Tooltip Box (visible only when employee is selected) */}
                            {!isEmptyState && (
                              <Tooltip 
                                formatter={(v) => `${Math.round(v)}%`}
                                contentStyle={{ 
                                  borderRadius: 8, 
                                  border: 'none', 
                                  background: '#172554', 
                                  color: '#93c5fd',
                                  fontSize: '11px',
                                  fontWeight: 'bold'
                                }} 
                              />
                            )}
                          </PieChart>
                        </ResponsiveContainer>
                        {/* Overall score inside the donut */}
                        <div className="absolute text-center kpi-center-text" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                          <span className="block text-2xl font-black text-slate-800">{overallScore}%</span>
                          <span className="block text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">KPI Rating</span>
                        </div>
                      </div>

                      {/* Metrics Legend keys */}
                      <div className="space-y-2.5 text-[11px] font-bold text-slate-600 border-t border-slate-50 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2.5"><span className="h-2.5 w-2.5 rounded-full bg-[#3b82f6]" /> Punctuality Share</span>
                          <span>{Math.round(share1)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2.5"><span className="h-2.5 w-2.5 rounded-full bg-[#10b981]" /> Productivity Share</span>
                          <span>{Math.round(share2)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2.5"><span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" /> Customer Rating Share</span>
                          <span>{Math.round(share3)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2.5"><span className="h-2.5 w-2.5 rounded-full bg-[#8b5cf6]" /> Task Completion Share</span>
                          <span>{Math.round(share4)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )
        )}

          {/* TAB 5: REPORTS */}
          {activeTab === "reports" && (
            <div className="grid gap-6 sm:grid-cols-2">
              
              <div className="rounded-2xl border border-slate-100/80 bg-white p-5 shadow-[0_4px_15px_rgba(0,0,0,0.02),0_1px_3px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg hover:border-slate-200/80 transition-all duration-300 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl w-10 h-10 font-bold text-lg flex-shrink-0">📄</div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800">Staff Master Directory</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">Export a master file containing active roles, branches, email directories, and contact info.</p>
                  </div>
                </div>
                <button
                  onClick={triggerPrint}
                  className="rounded-xl border border-blue-100/80 bg-gradient-to-br from-white to-blue-50/30 text-blue-600 shadow-sm hover:bg-blue-50/50 hover:shadow hover:border-blue-200 px-4 py-2.5 text-xs font-black w-full transition-all duration-200"
                >
                  Print Summary Report
                </button>
              </div>

              <div className="rounded-2xl border border-slate-100/80 bg-white p-5 shadow-[0_4px_15px_rgba(0,0,0,0.02),0_1px_3px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg hover:border-slate-200/80 transition-all duration-300 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-xl w-10 h-10 font-bold text-lg flex-shrink-0">📊</div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800">Operational Shift Summary</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">Preview a list of monthly attendance rates, tardiness flags, and calculated payroll estimates.</p>
                  </div>
                </div>
                <button
                  onClick={triggerExcelExport}
                  className="rounded-xl border border-emerald-100/80 bg-gradient-to-br from-white to-emerald-50/30 text-emerald-600 shadow-sm hover:bg-emerald-50/50 hover:shadow hover:border-emerald-200 px-4 py-2.5 text-xs font-black w-full transition-all duration-200"
                >
                  Export Metrics to Excel
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Employee Corporate Profile Modal */}
      {selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onEdit={handleOpenEdit}
        />
      )}

      {/* Form Slide-out Modal (Register / Edit) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsFormOpen(false)} />

          {/* Form Drawer */}
          <div className="relative w-full max-w-md h-full bg-white/95 border-l border-white/20 shadow-2xl p-6 flex flex-col z-10 overflow-y-auto backdrop-blur-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-black/5 pb-3">
              <h3 className="text-base font-bold text-slate-800">
                {formEmployee ? "Edit Employee Info" : "Employee Registration"}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 text-lg hover:text-slate-600">
                ✕
              </button>
            </div>

            {!formEmployee && (
              <div className="mb-4 rounded-xl bg-blue-50/80 border border-blue-200/50 p-3 text-[11px] text-blue-700 leading-normal flex gap-2">
                <span className="text-sm select-none">💡</span>
                <div>
                  <span className="font-bold">Notice:</span> Registering a new employee automatically generates a user login account (if it doesn't already exist). The employee can log in using the default temporary password: <code className="bg-rose-50 text-rose-600 border border-rose-200/60 px-1.5 py-0.5 rounded font-mono font-bold select-all">tempPassword123</code>, which they can update later through the User Settings.
                </div>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Nimal"
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    onBlur={e => validateField("firstName", e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2 text-xs font-medium outline-none ${
                      formErrors.firstName ? "border-rose-500 focus:border-rose-500" : "border-slate-200 focus:border-blue-500"
                    }`}
                  />
                  {formErrors.firstName && (
                    <p className="text-[10px] text-rose-500 font-semibold mt-1">{formErrors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Perera"
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    onBlur={e => validateField("lastName", e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2 text-xs font-medium outline-none ${
                      formErrors.lastName ? "border-rose-500 focus:border-rose-500" : "border-slate-200 focus:border-blue-500"
                    }`}
                  />
                  {formErrors.lastName && (
                    <p className="text-[10px] text-rose-500 font-semibold mt-1">{formErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g., nimal.p@pos.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  onBlur={e => validateField("email", e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2 text-xs font-medium outline-none ${
                    formErrors.email ? "border-rose-500 focus:border-rose-500" : "border-slate-200 focus:border-blue-500"
                  }`}
                />
                {formErrors.email && (
                  <p className="text-[10px] text-rose-500 font-semibold mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g., +94 77 123 4567"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                  onBlur={e => validateField("phone", e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2 text-xs font-medium outline-none ${
                    formErrors.phone ? "border-rose-500 focus:border-rose-500" : "border-slate-200 focus:border-blue-500"
                  }`}
                />
                {formErrors.phone && (
                  <p className="text-[10px] text-rose-500 font-semibold mt-1">{formErrors.phone}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Role Assignment</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                  >
                    {liveRoles.map(role => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Branch Location</label>
                  <select
                    value={formData.branch}
                    onChange={e => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                  >
                    <option value="" disabled hidden>Not Assigned</option>
                    {branches.length > 0 ? (
                      branches.map((b) => (
                        <option key={b._id} value={b._id}>{b.name}</option>
                      ))
                    ) : (
                      Object.entries(branchNames).map(([id, name]) => (
                        <option key={id} value={id}>{name}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Monthly Salary (Rs.)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g., 40000"
                    value={formData.salary}
                    onKeyDown={e => {
                      if (e.key === "-" || e.key === "e" || e.key === "E") {
                        e.preventDefault();
                      }
                    }}
                    onChange={e => {
                      const rawVal = e.target.value;
                      if (rawVal === "") {
                        setFormData({ ...formData, salary: "" });
                        return;
                      }
                      
                      // Strip leading zeros
                      const sanitizedVal = rawVal.replace(/^0+/, "");
                      if (sanitizedVal === "") {
                        setFormData({ ...formData, salary: "" });
                        return;
                      }
                      
                      const parsed = parseInt(sanitizedVal);
                      if (isNaN(parsed) || parsed < 0) {
                        return;
                      }
                      setFormData({ ...formData, salary: parsed });
                    }}
                    onBlur={e => validateField("salary", e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2 text-xs font-medium outline-none ${
                      formErrors.salary ? "border-rose-500 focus:border-rose-500" : "border-slate-200 focus:border-blue-500"
                    }`}
                  />
                  {formErrors.salary && (
                    <p className="text-[10px] text-rose-500 font-semibold mt-1">{formErrors.salary}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Hire Date</label>
                  <input
                    type="date"
                    placeholder="e.g., Select hiring date"
                    value={formData.hireDate}
                    onChange={e => setFormData({ ...formData, hireDate: e.target.value })}
                    onBlur={e => validateField("hireDate", e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2 text-xs font-medium outline-none ${
                      formErrors.hireDate ? "border-rose-500 focus:border-rose-500" : "border-slate-200 focus:border-blue-500"
                    }`}
                  />
                  {formErrors.hireDate && (
                    <p className="text-[10px] text-rose-500 font-semibold mt-1">{formErrors.hireDate}</p>
                  )}
                </div>
              </div>



              <div className="pt-6 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 rounded-xl border border-rose-200 bg-rose-50 py-3 text-xs font-bold text-slate-800 hover:bg-rose-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-100 hover:bg-blue-700 transition disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    formEmployee ? "Save Changes" : "Register Employee"
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      <style>{`
        /* Scoped styles for Employee Management Module */
        .emp-module-panel {
          /* Local override variables to enforce black/dark text contrast on light glass background */
          --text-primary: #0f172a !important;
          --text-secondary: #475569 !important;
          --text-muted: #64748b !important;
          --border-color: rgba(0, 0, 0, 0.12) !important;
          --bg-secondary: rgba(255, 255, 255, 0.85) !important;
          --bg-tertiary: rgba(0, 0, 0, 0.05) !important;

          animation: fadeIn 0.4s ease-out;
          font-family: var(--font-sans);
          color: var(--text-primary);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .employees-max-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
        }

        /* Glassmorphism generic style - Brightened and refined */
        .emp-glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.65);
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        /* Module Header Banner */
        .emp-module-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.65);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          flex-wrap: wrap;
          gap: 16px;
        }
        .emp-header-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: left;
        }
        .emp-header-info h1 {
          font-size: 1.55rem;
          font-weight: 850;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          line-height: 1.2;
          margin: 0;
        }
        .emp-header-info p {
          font-size: 0.82rem;
          color: var(--text-secondary);
          font-weight: 550;
          margin: 0;
        }
        .emp-register-btn {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          font-weight: 750;
          padding: 11px 22px;
          border-radius: 12px;
          border: none;
          font-size: 0.82rem;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.25);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .emp-register-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35);
        }
        .emp-register-btn:active {
          transform: translateY(0);
        }

        /* Tab Selectors */
        .emp-tabs-container {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 6px;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(16px);
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.5);
          scrollbar-width: none;
          width: fit-content;
          max-width: 100%;
        }
        .emp-tabs-container::-webkit-scrollbar {
          display: none;
        }
        .emp-tab-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          font-size: 0.8rem;
          font-weight: 750;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .emp-tab-button:hover {
          background: rgba(255, 255, 255, 0.8);
          color: var(--text-primary);
        }
        .emp-tab-button.active {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }

        /* Filters Card */
        .emp-filters-card {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 16px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.65);
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        }
        @media (max-width: 1150px) {
          .emp-tabs-container {
            flex-direction: column;
            width: 100% !important;
            max-width: 100%;
            gap: 6px;
            box-sizing: border-box;
          }
          .emp-tab-button {
            width: 100% !important;
            justify-content: center;
            padding: 11px 16px;
          }
        }
        @media (max-width: 768px) {
          .emp-filters-card {
            grid-template-columns: 1fr;
          }
        }
        .filter-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          text-align: left;
        }
        .filter-field label {
          font-size: 0.68rem;
          font-weight: 800;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .emp-module-panel input, .emp-module-panel select, .emp-module-panel textarea {
          padding: 10px 14px;
          border-radius: 10px;
          border: 1.5px solid #cbd5e1;
          background: rgba(255, 255, 255, 0.85);
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-primary);
          outline: none;
          transition: all 0.2s ease;
          width: 100%;
        }
        .emp-module-panel input:focus, .emp-module-panel select:focus, .emp-module-panel textarea:focus {
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .emp-grid-container {
          padding-bottom: 12px;
        }

        /* Pagination Styles */
        .emp-pagination-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          margin-top: 24px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.65);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          flex-wrap: wrap;
          gap: 12px;
        }
        .emp-pagination-info {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 750;
        }
        .emp-pagination-buttons {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .emp-pagination-btn {
          padding: 7px 14px;
          border-radius: 8px;
          border: 1.5px solid rgba(0, 0, 0, 0.08);
          background: white;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 750;
          color: var(--text-secondary);
          transition: all 0.2s ease;
        }
        .emp-pagination-btn:hover:not(:disabled) {
          background: rgba(0, 0, 0, 0.02);
          border-color: rgba(0, 0, 0, 0.15);
        }
        .emp-pagination-btn:disabled {
          cursor: not-allowed;
          color: #cbd5e1;
          border-color: rgba(0, 0, 0, 0.04);
        }
        .emp-pagination-btn.active {
          background: #2563eb;
          color: white;
          border-color: #2563eb;
        }

        /* Employee Grid & Cards */
        .emp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        .emp-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.65);
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .emp-card:hover {
          box-shadow: 0 12px 40px rgba(59, 130, 246, 0.12);
          border-color: rgba(59, 130, 246, 0.45);
        }
        .emp-card-header {
          display: flex;
          gap: 16px;
          align-items: center;
        }
        .emp-card-avatar {
          position: relative;
          flex-shrink: 0;
          width: 60px;
          height: 60px;
        }
        .emp-card-avatar img, .emp-card-avatar .emp-avatar-fallback {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          object-fit: cover;
          border: 2px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
        }
        .emp-status-dot {
          position: absolute;
          bottom: -4px;
          right: -4px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 3px solid rgba(255, 255, 255, 0.95);
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        .emp-status-dot.active { background: #10b981; }
        .emp-status-dot.inactive { background: #ef4444; }

        .emp-card-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: left;
        }
        .emp-role-tag {
          display: inline-flex;
          align-items: center;
          padding: 3px 8px;
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          border-radius: 6px;
          width: fit-content;
          letter-spacing: 0.05em;
        }
        .emp-role-tag.super-admin, .emp-role-tag.superadmin { background: rgba(99, 102, 241, 0.15); color: #6366f1; border: 1px solid rgba(99, 102, 241, 0.3); } /* Indigo */
        .emp-role-tag.admin { background: rgba(168, 85, 247, 0.15); color: #a855f7; border: 1px solid rgba(168, 85, 247, 0.3); } /* Purple */
        .emp-role-tag.manager { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); } /* Emerald Green */
        .emp-role-tag.cashier { background: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); } /* Blue */
        .emp-role-tag.inventory { background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); } /* Amber / Orange */
        .emp-role-tag.employee { background: rgba(244, 63, 94, 0.15); color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.3); } /* Rose / Pink */
        .emp-role-tag.user { background: rgba(100, 116, 139, 0.15); color: #64748b; border: 1px solid rgba(100, 116, 139, 0.3); } /* Slate Grey */

        .emp-card-name {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .emp-card-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .emp-card-detail-item {
          font-size: 0.74rem;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .emp-card-footer {
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          padding-top: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
        }
        .emp-rating-badge {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .emp-card-actions {
          display: flex;
          gap: 8px;
        }
        .emp-card-btn {
          padding: 6px 12px;
          font-size: 0.72rem;
          font-weight: 750;
          border-radius: 8px;
          border: 1px solid #bfdbfe;
          background: #eff6ff;
          color: #1d4ed8;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .emp-card-btn:hover {
          background: #dbeafe;
          color: #1e40af;
          border-color: #3b82f6;
          transform: translateY(-1px);
        }
        .emp-card-btn.primary {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border: none;
          box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
        }
        .emp-card-btn.primary:hover {
          box-shadow: 0 6px 14px rgba(37, 99, 235, 0.3);
          transform: translateY(-1px);
        }

        /* Scoped override for all white blocks (Scheduler, simulator, logs table etc.) to convert them to glassmorphic panels */
        .emp-module-panel .bg-white {
          background: rgba(255, 255, 255, 0.85) !important;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.65) !important;
          border-radius: 20px !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08) !important;
        }
        .emp-module-panel .border-slate-100 {
          border-color: rgba(0, 0, 0, 0.05) !important;
        }
        .emp-module-panel .divide-slate-100 > * + * {
          border-color: rgba(0, 0, 0, 0.04) !important;
        }
        .emp-module-panel .bg-slate-50 {
          background: rgba(255, 255, 255, 0.55) !important;
        }
        .emp-module-panel .bg-slate-50/50 {
          background: rgba(255, 255, 255, 0.35) !important;
        }
        .emp-module-panel table th {
          background: rgba(255, 255, 255, 0.6) !important;
          color: var(--text-primary) !important;
          font-weight: 750 !important;
          border-color: rgba(0, 0, 0, 0.05) !important;
        }
        .emp-module-panel table td {
          border-color: rgba(0, 0, 0, 0.04) !important;
        }
        .emp-module-panel table tr:hover {
          background: rgba(255, 255, 255, 0.4) !important;
        }
      `}</style>

    </div>
  );
}