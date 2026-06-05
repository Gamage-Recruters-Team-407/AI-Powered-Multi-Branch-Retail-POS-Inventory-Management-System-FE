import React, { useState } from "react";
import { useEmployees } from "../../context/EmployeeContext";

export default function AttendanceSimulator() {
  const { employees, attendanceLogs, logAttendance } = useEmployees();
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [simulatedTime, setSimulatedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [statusMessage, setStatusMessage] = useState(null);

  const getTodayDateStr = () => new Date().toISOString().split("T")[0];

  const getTodayLogForEmployee = (employeeId) => {
    return attendanceLogs.find(log => log.employeeId === employeeId && log.date === getTodayDateStr());
  };

  const handleClockIn = async () => {
    if (!selectedEmpId) return;
    const todayStr = getTodayDateStr();
    const timeStr = simulatedTime || new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

    // Determine status (Late if after 08:15 AM for morning shifts - let's make it simple)
    let status = "Present";
    if (timeStr.includes("AM")) {
      const parts = timeStr.split(" ")[0].split(":");
      const hour = parseInt(parts[0]);
      const minute = parseInt(parts[1]);
      if (hour > 8 || (hour === 8 && minute > 15)) {
        status = "Late";
      }
    } else if (timeStr.includes("PM")) {
      status = "Late"; // Morning shift tardiness
    }

    try {
      await logAttendance({
        employeeId: selectedEmpId,
        date: todayStr,
        clockIn: timeStr,
        clockOut: "",
        status: status,
      });

      const empName = employees.find(e => e._id === selectedEmpId)?.firstName;
      setStatusMessage({ type: "success", text: `✓ ${empName} Clocked In successfully as ${status} at ${timeStr}!` });
      setNotes("");
      
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      setStatusMessage({ type: "error", text: "Failed to process clock-in." });
    }
  };

  const handleClockOut = async () => {
    if (!selectedEmpId) return;
    const todayStr = getTodayDateStr();
    const timeStr = simulatedTime || new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    const existingLog = getTodayLogForEmployee(selectedEmpId);

    if (!existingLog) {
      setStatusMessage({ type: "error", text: "Employee must Clock In before Clocking Out." });
      return;
    }

    try {
      // Find and update existing log in the database (or just append an updated entry)
      await logAttendance({
        employeeId: selectedEmpId,
        date: todayStr,
        clockIn: existingLog.clockIn,
        clockOut: timeStr,
        status: existingLog.status,
      });

      const empName = employees.find(e => e._id === selectedEmpId)?.firstName;
      setStatusMessage({ type: "success", text: `✓ ${empName} Clocked Out successfully at ${timeStr}!` });
      
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      setStatusMessage({ type: "error", text: "Failed to process clock-out." });
    }
  };

  const currentEmp = employees.find(e => e._id === selectedEmpId);
  const todayLog = selectedEmpId ? getTodayLogForEmployee(selectedEmpId) : null;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xl">⏱️</span>
        <div>
          <h3 className="text-sm font-extrabold text-slate-800">Attendance Register Console</h3>
          <p className="text-[10px] text-slate-400 font-semibold">Simulate biometric punch cards for employee clock actions.</p>
        </div>
      </div>

      {statusMessage && (
        <div className={`mb-4 rounded-xl border p-3 text-xs font-bold transition-all duration-300 ${statusMessage.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"}`}>
          {statusMessage.text}
        </div>
      )}

      <div className="space-y-4">
        
        {/* Selector */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Select Employee</label>
          <select
            value={selectedEmpId}
            onChange={(e) => {
              setSelectedEmpId(e.target.value);
              setStatusMessage(null);
            }}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">-- Choose Employee to Punch --</option>
            {employees.map(e => (
              <option key={e._id} value={e._id}>{e.firstName} {e.lastName} ({e.role})</option>
            ))}
          </select>
        </div>

        {/* Current status display */}
        {currentEmp && (
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 font-semibold block">Today's Status</span>
              <span className="font-extrabold text-slate-700 mt-0.5 block">
                {todayLog 
                  ? todayLog.clockOut 
                    ? `Clocked Out (Worked: ${todayLog.clockIn} - ${todayLog.clockOut})` 
                    : `Active Duty (Clocked In: ${todayLog.clockIn})`
                  : "Not Clocked In Yet"}
              </span>
            </div>
            {todayLog && (
              <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] uppercase border ${todayLog.status === "Present" ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                {todayLog.status}
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {/* Custom Time */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Manual Time Override</label>
            <input
              type="text"
              placeholder="e.g. 08:00 AM"
              value={simulatedTime}
              onChange={(e) => setSimulatedTime(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
            />
          </div>

          {/* Action Simulation Buttons */}
          <div className="flex items-end gap-2.5">
            <button
              onClick={handleClockIn}
              disabled={!selectedEmpId || (todayLog && !todayLog.clockOut)}
              className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed shadow-sm shadow-emerald-50"
            >
              Punch In
            </button>
            <button
              onClick={handleClockOut}
              disabled={!selectedEmpId || !todayLog || !!todayLog.clockOut}
              className="flex-1 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed shadow-sm"
            >
              Punch Out
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
