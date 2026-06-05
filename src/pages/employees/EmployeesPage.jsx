import React, { useState } from "react";
import { useEmployees } from "../../context/EmployeeContext";
import { EmployeeCard, EmployeeDetailModal } from "../../components/employees/Employee";
import SchedulePlanner from "../../components/employees/SchedulePlanner";
import AttendanceSimulator from "../../components/employees/AttendanceSimulator";

export default function EmployeesPage() {
  const {
    employees,
    attendanceLogs,
    performanceMetrics,
    registerEmployee,
    updateEmployee,
    loading,
    error,
    logPerformance,
  } = useEmployees();

  // Active Tab State
  const [activeTab, setActiveTab] = useState("roster");

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("all");

  // Selection & Form Modals State
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formEmployee, setFormEmployee] = useState(null); // If editing

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
    branch: "1",
    salary: 40000,
    hireDate: new Date().toISOString().split("T")[0],
    photo: "",
  });

  const branchNames = {
    "1": "Colombo Head Office",
    "2": "Kandy City Branch",
    "3": "Galle Fort Branch",
    "4": "Negombo Branch",
  };

  const handleOpenRegister = () => {
    setFormEmployee(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "cashier",
      branch: "1",
      salary: 40000,
      hireDate: new Date().toISOString().split("T")[0],
      photo: "",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setFormEmployee(emp);
    setFormData({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone,
      role: emp.role,
      branch: emp.branch,
      salary: emp.salary || 40000,
      hireDate: emp.hireDate || new Date().toISOString().split("T")[0],
      photo: emp.photo || "",
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formEmployee) {
        await updateEmployee(formEmployee._id, formData);
      } else {
        await registerEmployee(formData);
      }
      setIsFormOpen(false);
    } catch (err) {
      alert("Error saving employee details");
    }
  };

  const handlePerfSubmit = async (e) => {
    e.preventDefault();
    if (!perfEmpId) return;
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
      alert("Error logging performance details");
    }
  };

  // Filters logic
  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                          emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.phone.includes(searchTerm);
    const matchesRole = selectedRole === "all" || emp.role === selectedRole;
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
              ${employees.map(emp => `
                <tr>
                  <td><strong>${emp.firstName} ${emp.lastName}</strong></td>
                  <td>${emp.email}</td>
                  <td>${emp.role.toUpperCase()}</td>
                  <td>${branchNames[emp.branch] || emp.branch}</td>
                  <td>${emp.performanceScore} ★</td>
                  <td>${emp.status}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-xs font-bold text-slate-500">Retrieving employee database files...</p>
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
            <h1>👔 Staff & Employee Management</h1>
            <p>Register staff, set schedules, track shift punctuality, and evaluate performance benchmarks.</p>
          </div>
          <button onClick={handleOpenRegister} className="emp-register-btn">
            + Register Staff Member
          </button>
        </div>

        {/* Tab Selection */}
        <div className="emp-tabs-container">
          {[
            { id: "roster", label: "👥 Corporate Roster", icon: "👥" },
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
                <div className="filter-field" style={{ gridColumn: "span 2" }}>
                  <label>Search Staff</label>
                  <input
                    type="text"
                    placeholder="Search by name, email, or telephone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                    <option value="inventory">Inventory Staff</option>
                  </select>
                </div>

                <div className="filter-field">
                  <label>Filter Branch</label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                  >
                    <option value="all">All Branches</option>
                    {Object.entries(branchNames).map(([id, name]) => (
                      <option key={id} value={id}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Roster Cards Grid */}
              {filteredEmployees.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)", background: "var(--bg-secondary)", borderRadius: "16px", border: "1px solid var(--border-color)", fontWeight: 600 }}>
                  No employees match the specified filters.
                </div>
              ) : (
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
              )}

            </div>
          )}

          {/* TAB 2: SCHEDULES */}
          {activeTab === "schedules" && <SchedulePlanner />}

          {/* TAB 3: ATTENDANCE */}
          {activeTab === "attendance" && (
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              
              {/* Left Column: Attendance Stats & Log list */}
              <div className="space-y-6">
                
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Present Ratio</span>
                    <span className="block text-2xl font-black text-slate-800 mt-1">
                      {attendanceLogs.length > 0
                        ? `${Math.round((attendanceLogs.filter(l => l.status === "Present").length / attendanceLogs.length) * 100)}%`
                        : "100%"}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Late Records</span>
                    <span className="block text-2xl font-black text-amber-600 mt-1">
                      {attendanceLogs.filter(l => l.status === "Late").length}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Punchcards</span>
                    <span className="block text-2xl font-black text-blue-600 mt-1">
                      {attendanceLogs.length}
                    </span>
                  </div>
                </div>

                {/* Table logs */}
                <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-sm font-extrabold text-slate-700">Attendance Log History</h3>
                  </div>
                  <div className="overflow-x-auto max-h-[450px]">
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
                        {attendanceLogs.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400">No shift logs found.</td>
                          </tr>
                        ) : (
                          attendanceLogs.map((log) => {
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

              {/* Right Column: Attendance Simulator Widget */}
              <div>
                <AttendanceSimulator />
              </div>

            </div>
          )}

          {/* TAB 4: PERFORMANCE */}
          {activeTab === "performance" && (
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              
              {/* Leaderboard and statistics */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-5">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">Employee KPI Leaderboard</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Rankings are evaluated dynamically based on customer reviews and operational reliability.</p>
                </div>
                
                <div className="space-y-3">
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
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Staff Member</label>
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
                    disabled={!perfEmpId}
                    className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-100 transition hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    Save Review Metrics
                  </button>

                </form>
              </div>

            </div>
          )}

          {/* TAB 5: REPORTS */}
          {activeTab === "reports" && (
            <div className="grid gap-6 sm:grid-cols-2">
              
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-10 text-center font-bold text-lg">📄</div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">Corporate Staff Roster</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">Export a master file containing active roles, branches, email directories, and contact info.</p>
                </div>
                <button
                  onClick={triggerPrint}
                  className="rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 px-4 py-2.5 text-xs font-bold w-full transition"
                >
                  Print Summary Report
                </button>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-10 text-center font-bold text-lg">📊</div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">Operational Shift Summary</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">Preview a list of monthly attendance rates, tardiness flags, and calculated payroll estimates.</p>
                </div>
                <button
                  onClick={() => alert("Detailed report generated successfully. Ready to export to Excel.")}
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
                {formEmployee ? "✏️ Edit Employee Info" : "👔 Register New Staff Member"}
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
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+94 77 123 4567"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium outline-none focus:border-blue-500"
                />
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
                    <option value="inventory">Inventory Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Branch Location</label>
                  <select
                    value={formData.branch}
                    onChange={e => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                  >
                    {Object.entries(branchNames).map(([id, name]) => (
                      <option key={id} value={id}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Monthly Salary (Rs.)</label>
                  <input
                    type="number"
                    required
                    value={formData.salary}
                    onChange={e => setFormData({ ...formData, salary: parseInt(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Hire Date</label>
                  <input
                    type="date"
                    required
                    value={formData.hireDate}
                    onChange={e => setFormData({ ...formData, hireDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Profile Photo URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://example.com/photo.jpg"
                  value={formData.photo}
                  onChange={e => setFormData({ ...formData, photo: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-6 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-100 hover:bg-blue-700 transition"
                >
                  {formEmployee ? "Save Changes" : "Register Employee"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      <style>{`
        /* Scoped styles for Employee Management Module */
        .emp-module-panel {
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

        /* Glassmorphism generic style */
        .emp-glass-card {
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        /* Module Header Banner */
        .emp-module-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.45);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
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
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(10px);
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.25);
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
          background: rgba(255, 255, 255, 0.6);
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
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.45);
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
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
          border: 1.5px solid rgba(0, 0, 0, 0.08);
          background: rgba(255, 255, 255, 0.7);
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

        /* Employee Grid & Cards */
        .emp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        .emp-card {
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.45);
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .emp-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
          border-color: rgba(59, 130, 246, 0.3);
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
        .emp-role-tag.admin { background: rgba(126, 34, 206, 0.1); color: #7e22ce; border: 1px solid rgba(126, 34, 206, 0.25); }
        .emp-role-tag.manager { background: rgba(5, 150, 105, 0.1); color: #059669; border: 1px solid rgba(5, 150, 105, 0.25); }
        .emp-role-tag.cashier { background: rgba(37, 99, 235, 0.1); color: #2563eb; border: 1px solid rgba(37, 99, 235, 0.25); }
        .emp-role-tag.inventory { background: rgba(217, 119, 6, 0.1); color: #d97706; border: 1px solid rgba(217, 119, 6, 0.25); }

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
          border: 1px solid rgba(0, 0, 0, 0.08);
          background: rgba(255, 255, 255, 0.6);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .emp-card-btn:hover {
          background: rgba(255, 255, 255, 0.9);
          color: var(--text-primary);
          border-color: rgba(0, 0, 0, 0.15);
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
          background: rgba(255, 255, 255, 0.65) !important;
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.45) !important;
          border-radius: 20px !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04) !important;
        }
        .emp-module-panel .border-slate-100 {
          border-color: rgba(255, 255, 255, 0.25) !important;
        }
        .emp-module-panel .divide-slate-100 > * + * {
          border-color: rgba(255, 255, 255, 0.2) !important;
        }
        .emp-module-panel .bg-slate-50 {
          background: rgba(255, 255, 255, 0.45) !important;
        }
        .emp-module-panel .bg-slate-50/50 {
          background: rgba(255, 255, 255, 0.25) !important;
        }
        .emp-module-panel table th {
          background: rgba(255, 255, 255, 0.5) !important;
          color: var(--text-primary) !important;
          font-weight: 750 !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
        }
        .emp-module-panel table td {
          border-color: rgba(255, 255, 255, 0.15) !important;
        }
        .emp-module-panel table tr:hover {
          background: rgba(255, 255, 255, 0.3) !important;
        }
      `}</style>

    </div>
  );
}
