import React, { useState, useEffect } from "react";
import { useEmployees } from "../../context/EmployeeContext";
import { useBranches } from "../../context/BranchContext";
import { EmployeeCard, EmployeeDetailModal } from "../../components/employees/Employee";
import SchedulePlanner from "../../components/employees/SchedulePlanner";
import { useAuth } from "../../context/AuthContext";

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

  // Selection & Form Modals State
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formEmployee, setFormEmployee] = useState(null); // If editing
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPerfSubmitting, setIsPerfSubmitting] = useState(false);

  // Performance Form State
  const [perfEmpId, setPerfEmpId] = useState("");
  const [perfPunctuality, setPerfPunctuality] = useState(90);
  const [perfSales, setPerfSales] = useState(90);
  const [perfRating, setPerfRating] = useState(4.5);
  const [perfTasks, setPerfTasks] = useState(90);

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
        if (!value) {
          error = "Hire date is required.";
        } else {
          const inputDate = new Date(value);
          if (isNaN(inputDate.getTime())) {
            error = "Please enter a valid date.";
          }
        }
        break;
      case "photo":
        if (value) {
          if (typeof value === "string" && value.trim()) {
            const isDataUri = value.trim().startsWith('data:image/');
            const urlRegex = /^(https?:\/\/|\/?uploads\/).*\.(?:png|jpg|jpeg|gif|webp)/i;
            if (!isDataUri && !urlRegex.test(value.trim())) {
              error = "Must be a valid image URL (ending in .png, .jpg, .jpeg, or .webp).";
            }
          } else if (value instanceof File) {
            if (!value.type.startsWith("image/")) {
              error = "Only image files are allowed.";
            } else if (value.size > 5 * 1024 * 1024) {
              error = "Image size must be less than 5MB.";
            }
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
    if (!formData.hireDate) {
      errors.hireDate = "Hire date is required.";
    } else {
      const inputDate = new Date(formData.hireDate);
      if (isNaN(inputDate.getTime())) {
        errors.hireDate = "Please enter a valid date.";
      }
    }
    
    // Profile Photo (Optional)
    if (formData.photo) {
      if (typeof formData.photo === "string" && formData.photo.trim()) {
        const isDataUri = formData.photo.trim().startsWith('data:image/');
        const urlRegex = /^(https?:\/\/|\/?uploads\/).*\.(?:png|jpg|jpeg|gif|webp)/i;
        if (!isDataUri && !urlRegex.test(formData.photo.trim())) {
          errors.photo = "Must be a valid image URL (ending in .png, .jpg, .jpeg, or .webp).";
        }
      } else if (formData.photo instanceof File) {
        if (!formData.photo.type.startsWith("image/")) {
          errors.photo = "Only image files are allowed.";
        } else if (formData.photo.size > 5 * 1024 * 1024) {
          errors.photo = "Image size must be less than 5MB.";
        }
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };  const formatPhoneNumber = (value) => {
    let cleaned = value.replace(/[^\d+]/g, "");
    if (cleaned.startsWith("+94")) {
      const parts = [];
      const code = cleaned.slice(0, 3);
      const rest = cleaned.slice(3);
      if (rest.length > 0) parts.push(rest.slice(0, 2));
      if (rest.length > 2) parts.push(rest.slice(2, 5));
      if (rest.length > 5) parts.push(rest.slice(5, 9));
      return `${code} ${parts.join(" ")}`.trim();
    } else if (cleaned.startsWith("0")) {
      const parts = [];
      if (cleaned.length > 0) parts.push(cleaned.slice(0, 3));
      if (cleaned.length > 3) parts.push(cleaned.slice(3, 6));
      if (cleaned.length > 6) parts.push(cleaned.slice(6, 10));
      return parts.join(" ");
    }
    return value;
  };



  useEffect(() => {
    if (branches.length > 0 && !formData.branch) {
      setFormData(prev => ({ ...prev, branch: branches[0]._id }));
    }
  }, [branches, formData.branch]);

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
      branch: branches[0]?._id || "1",
      salary: "",
      hireDate: "",
      photo: "",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setFormEmployee(emp);
    setFormErrors({});
    setIsSubmitting(false);

    let formattedDate = "";
    const rawDate = emp.hireDate || emp.joiningDate;
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
      phone: emp.phone || "",
      role: emp.role || "cashier",
      branch: emp.branch || "",
      salary: emp.salary || "",
      hireDate: formattedDate,
      photo: emp.photo || "",
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append("firstName", formData.firstName);
      submitData.append("lastName", formData.lastName);
      submitData.append("email", formData.email);
      submitData.append("phone", formData.phone);
      submitData.append("role", formData.role);
      submitData.append("branch", formData.branch);
      submitData.append("salary", formData.salary);
      submitData.append("hireDate", formData.hireDate);
      if (formData.photo !== undefined && formData.photo !== null) {
        submitData.append("photo", formData.photo);
      }

      if (formEmployee) {
        await updateEmployee(formEmployee._id, submitData);
      } else {
        await registerEmployee(submitData);
      }
      setIsFormOpen(false);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Error saving employee details";
      alert(errMsg);
    } finally {
      setIsSubmitting(false);
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
      alert("Performance record updated successfully!");
      // Reset
      setPerfEmpId("");
    } catch (err) {
      console.error("Performance log submission error:", err);
      alert("Error logging performance details");
    } finally {
      setIsPerfSubmitting(false);
    }
  };

  // Filters logic
  const filteredEmployees = employees.filter((emp) => {
    const cleanSearch = searchTerm.trim().toLowerCase();
    const empName = emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim();
    const fullName = empName.toLowerCase();
    const matchesSearch = fullName.includes(cleanSearch) || 
                          (emp.email && emp.email.toLowerCase().includes(cleanSearch)) ||
                          (emp.phone && emp.phone.includes(cleanSearch));
    const matchesRole = selectedRole === "all" || (emp.role && emp.role.toLowerCase() === selectedRole.toLowerCase());
    const matchesBranch = selectedBranch === "all" || emp.branch === selectedBranch;
    return matchesSearch && matchesRole && matchesBranch;
  });

  // Calculate Leaderboard metrics
  const getLeaderboard = () => {
    return [...employees].sort((a, b) => b.performanceScore - a.performanceScore);
  };

  const leaderboard = getLeaderboard();

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
                const displayBranch = branchObj ? branchObj.name : (branchNames[emp.branch] || "Not Assigned");
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
          <button onClick={handleOpenRegister} className="emp-register-btn">
            + Employee Registration
          </button>
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
                    <option value="admin">Administrator</option>
                    <option value="manager">Manager</option>
                    <option value="cashier">Cashier</option>
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
                <div className="emp-grid-container">
                  <div className="emp-grid">
                    {filteredEmployees.map((emp) => (
                      <EmployeeCard
                        key={emp._id}
                        employee={emp}
                        onViewDetails={setSelectedEmployee}
                        onEdit={handleOpenEdit}
                      />
                    ))}
                  </div>
                </div>
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
                      <div className="grid grid-cols-3 gap-4">
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
                        <div className="flex flex-col md:flex-row md:items-end gap-4 w-full">
                          
                          {/* Search box */}
                          <div className="flex flex-col relative flex-1">
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
                          <div className="flex flex-col w-full md:w-48">
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
                          <div className="flex flex-col relative w-full md:w-48">
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
                              className="w-full md:w-auto rounded-xl border border-blue-100 bg-blue-50 text-blue-600 px-5 py-2.5 text-xs font-bold hover:bg-blue-100 transition whitespace-nowrap"
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
                        <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
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
                                activeAttendanceLogs.map((log) => {
                                  const emp = employees.find(e => e._id === log.employeeId) || { firstName: "Deleted", lastName: "Staff", photo: "" };
                                  return (
                                    <tr key={log._id} className="hover:bg-slate-50/50">
                                      <td className="px-5 py-3.5 flex items-center gap-2.5">
                                        <img src={emp.photo} alt={emp.firstName} className="h-6 w-6 rounded-md object-cover" />
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
                
                <div className="space-y-3 overflow-y-auto max-h-[550px] pr-1">
                  {leaderboard.map((emp, index) => {
                    const rankMedal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}th`;
                    return (
                      <div key={emp._id} className="flex items-center justify-between p-3.5 border border-slate-100 rounded-2xl hover:bg-slate-50/50 transition">
                        <div className="flex items-center gap-3.5">
                          <span className="text-sm font-black text-slate-500 w-6 text-center">{rankMedal}</span>
                          <img src={emp.photo} alt={emp.firstName} className="h-10 w-10 rounded-xl object-cover" />
                          <div>
                            <span className="font-extrabold text-slate-800 block text-xs">{emp.firstName} {emp.lastName}</span>
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">{emp.role} • Branch {emp.branch}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 text-xs font-black text-slate-800 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                            <span className="text-amber-400">★</span> {emp.performanceScore}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Add rating review */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xl">✍️</span>
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
                      onChange={e => setPerfEmpId(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                    >
                      <option value="">-- Choose Employee --</option>
                      {employees.map(e => (
                        <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1 font-bold">
                      <span className="text-slate-500">Punctuality Score</span>
                      <span className="text-blue-600">{perfPunctuality}%</span>
                    </div>
                    <input type="range" min="10" max="100" value={perfPunctuality} onChange={e => setPerfPunctuality(e.target.value)} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer" />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1 font-bold">
                      <span className="text-slate-500">Productivity Targets Achievement</span>
                      <span className="text-emerald-600">{perfSales}%</span>
                    </div>
                    <input type="range" min="10" max="100" value={perfSales} onChange={e => setPerfSales(e.target.value)} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer" />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1 font-bold">
                      <span className="text-slate-500">Customer Rating (Avg)</span>
                      <span className="text-amber-600">{perfRating} ★</span>
                    </div>
                    <input type="range" min="1" max="5" step="0.1" value={perfRating} onChange={e => setPerfRating(e.target.value)} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer" />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1 font-bold">
                      <span className="text-slate-500">Task Completion Rate</span>
                      <span className="text-purple-600">{perfTasks}%</span>
                    </div>
                    <input type="range" min="10" max="100" value={perfTasks} onChange={e => setPerfTasks(e.target.value)} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer" />
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

            </div>
          )
        )}

          {/* TAB 5: REPORTS */}
          {activeTab === "reports" && (
            <div className="grid gap-6 sm:grid-cols-2">
              
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-10 text-center font-bold text-lg flex-shrink-0">📄</div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800">Staff Master Directory</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">Export a master file containing active roles, branches, email directories, and contact info.</p>
                  </div>
                </div>
                <button
                  onClick={triggerPrint}
                  className="rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 px-4 py-2.5 text-xs font-bold w-full transition"
                >
                  Print Summary Report
                </button>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-10 text-center font-bold text-lg flex-shrink-0">📊</div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800">Operational Shift Summary</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">Preview a list of monthly attendance rates, tardiness flags, and calculated payroll estimates.</p>
                  </div>
                </div>
                <button
                  onClick={triggerExcelExport}
                  className="rounded-xl border border-emerald-200 text-emerald-600 hover:bg-emerald-50 px-4 py-2.5 text-xs font-bold w-full transition"
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
                    <option value="admin">Administrator</option>
                    <option value="manager">Manager</option>
                    <option value="cashier">Cashier</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Branch Location</label>
                  <select
                    value={formData.branch}
                    onChange={e => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                  >
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
                    required
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

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Profile Photo (Optional)</label>
                {formData.photo && (
                  <div className="flex items-center gap-2.5 mb-2">
                    <img 
                      src={typeof formData.photo === "string" ? formData.photo : URL.createObjectURL(formData.photo)} 
                      alt="Profile preview" 
                      className="h-12 w-12 rounded-xl object-cover border border-slate-200" 
                    />
                    <span className="text-[10px] text-slate-500 font-semibold">Selected profile image preview</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      setFormData({ ...formData, photo: file });
                      validateField("photo", file);
                    }
                  }}
                  className={`w-full rounded-xl border px-3.5 py-2 text-xs font-medium outline-none bg-slate-50 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${
                    formErrors.photo ? "border-rose-500 focus:border-rose-500" : "border-slate-200 focus:border-blue-500"
                  }`}
                />
                {formErrors.photo && (
                  <p className="text-[10px] text-rose-500 font-semibold mt-1">{formErrors.photo}</p>
                )}
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
          max-height: 60vh;
          overflow-y: auto;
          padding-right: 6px;
          padding-bottom: 12px;
        }
        .emp-grid-container::-webkit-scrollbar {
          width: 6px;
        }
        .emp-grid-container::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.03);
          border-radius: 99px;
        }
        .emp-grid-container::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.12);
          border-radius: 99px;
        }
        .emp-grid-container::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.24);
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
        }
        .emp-card-avatar img {
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
        .emp-role-tag.admin { background: rgba(126, 34, 206, 0.15); color: #7e22ce; border: 1px solid rgba(126, 34, 206, 0.3); }
        .emp-role-tag.manager { background: rgba(5, 150, 105, 0.15); color: #059669; border: 1px solid rgba(5, 150, 105, 0.3); }
        .emp-role-tag.cashier { background: rgba(37, 99, 235, 0.15); color: #2563eb; border: 1px solid rgba(37, 99, 235, 0.3); }
        .emp-role-tag.inventory { background: rgba(217, 119, 6, 0.15); color: #d97706; border: 1px solid rgba(217, 119, 6, 0.3); }

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
