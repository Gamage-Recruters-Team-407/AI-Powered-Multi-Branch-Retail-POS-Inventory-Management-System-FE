import React, { useState } from "react";
import { useEmployees } from "../../context/EmployeeContext";
import { useBranches } from "../../context/BranchContext";

export const EmployeeCard = ({ employee, onViewDetails, onEdit }) => {
  const { role, branch, status, firstName, lastName, performanceScore, photo, phone, email, name } = employee;
  const { branches } = useBranches();

  // Curated color palette mapping for roles
  const roleColors = {
    admin: "bg-purple-100 text-purple-700 border-purple-200",
    manager: "bg-emerald-100 text-emerald-700 border-emerald-200",
    cashier: "bg-blue-100 text-blue-700 border-blue-200",
    inventory: "bg-amber-100 text-amber-700 border-amber-200",
  };

  const branchNames = {
    "1": "Colombo HO",
    "2": "Kandy City",
    "3": "Galle Fort",
    "4": "Negombo",
  };

  const branchObj = branches.find(b => b._id === branch);
  const displayBranch = branchObj ? branchObj.name : (branchNames[branch] || (branch ? `Branch ${branch}` : "Not Assigned"));
  const empName = name || `${firstName || ""} ${lastName || ""}`.trim() || "Unnamed User";

  return (
    <div className="emp-card">
      <div className="emp-card-header">
        <div className="emp-card-avatar">
          <img
            src={photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop"}
            alt={empName}
          />
          <span className={`emp-status-dot ${status === "Active" ? "active" : "inactive"}`} />
        </div>

        <div className="emp-card-info">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", flexWrap: "wrap", gap: "6px" }}>
            <span className={`emp-role-tag ${role ? role.toLowerCase() : ""}`}>
              {role}
            </span>
            <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 600 }}>
              📍 {displayBranch}
            </span>
          </div>

          <h3 className="emp-card-name">
            {empName}
          </h3>

          <div className="emp-card-details">
            <span className="emp-card-detail-item">📞 {phone || "No Phone"}</span>
            <span className="emp-card-detail-item" style={{ wordBreak: "break-all" }}>✉️ {email}</span>
          </div>
        </div>
      </div>

      <div className="emp-card-footer">
        <div className="emp-rating-badge">
          <span style={{ color: "#fbbf24" }}>★</span>
          <span style={{ fontSize: "0.75rem", fontWeight: 700 }}>{performanceScore}</span>
          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginLeft: "2px" }}>/ 5.0 Rating</span>
        </div>

        <div className="emp-card-actions">
          <button onClick={() => onEdit(employee)} className="emp-card-btn">
            Edit
          </button>
          <button onClick={() => onViewDetails(employee)} className="emp-card-btn primary">
            Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export const EmployeeDetailModal = ({ employee, onClose, onEdit }) => {
  const { employees, updateEmployee, deleteEmployee, attendanceLogs, schedules, performanceMetrics } = useEmployees();
  const { branches } = useBranches();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const freshEmployee = employees.find(e => e._id === employee._id) || employee;
  const { _id, firstName, lastName, role, branch, email, phone, salary, hireDate, joiningDate, status, photo, performanceScore, name } = freshEmployee;
  const displayHireDate = (hireDate || joiningDate) ? new Date(hireDate || joiningDate).toISOString().split('T')[0] : "N/A";

  // Filter logs specific to this employee
  const employeeLogs = attendanceLogs.filter(log => log.employeeId === _id);
  const employeeSchedules = schedules.filter(sch => sch.employeeId === _id).sort((a, b) => new Date(b.date) - new Date(a.date));
  const performanceInfo = performanceMetrics.find(p => p.employeeId === _id) || {
    punctuality: 80,
    salesAchievement: 85,
    customerRating: 4.0,
    taskCompletion: 80,
  };

  const branchNames = {
    "1": "Colombo Head Office",
    "2": "Kandy City Branch",
    "3": "Galle Fort Branch",
    "4": "Negombo Branch",
  };

  const branchObj = branches.find(b => b._id === branch);
  const displayBranch = branchObj ? branchObj.name : (branchNames[branch] || (branch ? `Branch ${branch}` : "Not Assigned"));
  const empName = name || `${firstName || ""} ${lastName || ""}`.trim() || "Unnamed User";

  const attendanceRate = employeeLogs.length > 0 
    ? Math.round((employeeLogs.filter(l => l.status === "Present").length / employeeLogs.length) * 100)
    : 100;

  const handleDelete = async () => {
    try {
      await deleteEmployee(_id);
      onClose();
    } catch (err) {
      alert("Error deleting employee");
    }
  };

  const handleToggleStatus = async () => {
    const nextStatus = status === "Active" ? "Inactive" : "Active";
    try {
      await updateEmployee(_id, { status: nextStatus });
    } catch (err) {
      alert("Error changing employee status");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white/90 border border-white/40 backdrop-blur-2xl shadow-2xl transition-all flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/5 bg-slate-50/50 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-800">Employee Corporate Profile</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition">
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            
            {/* Left Column: Avatar & Basic Stats */}
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <img
                  src={photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop"}
                  alt={empName}
                  className="h-40 w-40 rounded-3xl object-cover border-4 border-white shadow-md"
                />
                <span className={`absolute bottom-2 right-2 h-5 w-5 rounded-full border-4 border-white ${status === "Active" ? "bg-green-500" : "bg-red-400"}`} />
              </div>

              <h3 className="mt-4 text-xl font-bold text-slate-800">{empName}</h3>
              <p className="text-xs uppercase font-bold text-blue-600 tracking-widest mt-1">{role}</p>
              <p className="text-xs text-slate-400 font-semibold mt-1">📍 {displayBranch}</p>
              
              {/* Basic Quick Stats */}
              <div className="mt-6 w-full grid grid-cols-2 gap-3 border-t border-slate-100 pt-6">
                <div className="rounded-2xl bg-slate-100/50 border border-black/5 p-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Performance</span>
                  <span className="text-base font-extrabold text-slate-800">{performanceScore} ★</span>
                </div>
                <div className="rounded-2xl bg-slate-100/50 border border-black/5 p-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Attendance</span>
                  <span className="text-base font-extrabold text-slate-800">{attendanceRate}%</span>
                </div>
              </div>

              {/* Status & Control Actions */}
              <div className="mt-8 w-full flex flex-col gap-3">
                <button
                  onClick={handleToggleStatus}
                  className={`w-full rounded-xl py-3 text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5 ${
                    status === "Active" 
                      ? "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-100" 
                      : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100"
                  }`}
                >
                  {status === "Active" ? "⚠️ Suspend/Deactivate" : "✓ Reactivate Employee"}
                </button>

                <button
                  onClick={() => {
                    onEdit(employee);
                    onClose();
                  }}
                  className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-100 hover:bg-blue-700 transition flex items-center justify-center gap-1.5"
                >
                  ✏️ Edit Profile Details
                </button>

                {isConfirmingDelete ? (
                  <div className="mt-1 rounded-2xl bg-rose-50/50 p-3 border border-rose-100/80">
                    <p className="text-[11px] text-rose-800 font-extrabold mb-2.5">Permanently delete employee account?</p>
                    <div className="flex gap-2">
                      <button onClick={handleDelete} className="flex-1 rounded-xl bg-rose-600 py-2 text-xs font-bold text-white hover:bg-rose-700 transition">Confirm Delete</button>
                      <button onClick={() => setIsConfirmingDelete(false)} className="flex-1 rounded-xl bg-white border border-slate-200 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsConfirmingDelete(true)}
                    className="w-full rounded-xl py-3 text-xs font-bold border border-rose-200 bg-rose-50/50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 hover:border-rose-300 transition flex items-center justify-center gap-1.5"
                  >
                    🗑️ Permanently Delete
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Detailed Employee Records */}
            <div className="flex flex-col gap-6">
              
              {/* Contract Information */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
                <h4 className="text-sm font-extrabold text-slate-800 mb-4 border-b border-slate-100/50 pb-2">📋 Employment Details</h4>
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 text-xs">
                  <div>
                    <span className="text-slate-400 block font-semibold">Email Address</span>
                    <span className="font-bold text-slate-700">{email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Phone Number</span>
                    <span className="font-bold text-slate-700">{phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Monthly Salary</span>
                    <span className="font-bold text-slate-700">Rs. {salary ? salary.toLocaleString() : "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Hire Date</span>
                    <span className="font-bold text-slate-700">{displayHireDate}</span>
                  </div>
                </div>
              </div>

              {/* Performance Radar Metrics */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
                <h4 className="text-sm font-extrabold text-slate-800 mb-4 border-b border-slate-100/50 pb-2">📈 Performance Scorecard</h4>
                <div className="space-y-3.5">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-bold">
                      <span className="text-slate-500">Punctuality & Reliability</span>
                      <span className="text-blue-600">{performanceInfo.punctuality}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-black/5 overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${performanceInfo.punctuality}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-bold">
                      <span className="text-slate-500">Sales Targets / Productivity</span>
                      <span className="text-emerald-600">{performanceInfo.salesAchievement}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-black/5 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${performanceInfo.salesAchievement}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-bold">
                      <span className="text-slate-500">Customer Satisfaction Rating</span>
                      <span className="text-amber-600">{performanceInfo.customerRating * 20}% ({performanceInfo.customerRating}/5.0)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-black/5 overflow-hidden">
                      <div className="h-full rounded-full bg-amber-500" style={{ width: `${performanceInfo.customerRating * 20}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-bold">
                      <span className="text-slate-500">Task Completion & Operations</span>
                      <span className="text-purple-600">{performanceInfo.taskCompletion}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-black/5 overflow-hidden">
                      <div className="h-full rounded-full bg-purple-500" style={{ width: `${performanceInfo.taskCompletion}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedules & Shift History */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
                <h4 className="text-sm font-extrabold text-slate-800 mb-3 border-b border-slate-100/50 pb-2">📅 Upcoming Schedules</h4>
                {employeeSchedules.length === 0 ? (
                  <p className="text-xs text-slate-400">No shifts scheduled for this employee.</p>
                ) : (
                  <div className="max-h-32 overflow-y-auto space-y-2.5 pr-2">
                    {employeeSchedules.slice(0, 5).map((sch) => (
                      <div key={sch._id} className="flex justify-between items-center text-xs p-2 bg-white/40 border border-black/5 rounded-xl">
                        <span className="font-bold text-slate-600">{sch.date}</span>
                        <span className="rounded-full bg-blue-100 text-blue-800 font-extrabold px-3 py-0.5 text-[10px]">{sch.shift}</span>
                        <span className="text-slate-400 italic truncate max-w-[200px]">{sch.notes || "No notes"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
