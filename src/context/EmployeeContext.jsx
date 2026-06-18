import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getAllEmployees,
  addEmployee as apiAddEmployee,
  updateEmployee as apiUpdateEmployee,
  deleteEmployee as apiDeleteEmployee,
  getSchedules,
  saveSchedule as apiSaveSchedule,
  getAttendance,
  logAttendance as apiLogAttendance,
  getPerformanceMetrics,
  logPerformanceMetric as apiLogPerformanceMetric,
} from "../services/employeeApi";

const EmployeeContext = createContext();

export const useEmployees = () => useContext(EmployeeContext);

export const EmployeeProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState([]);

  // Granular loading & error states
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [employeesError, setEmployeesError] = useState(null);

  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [schedulesError, setSchedulesError] = useState(null);

  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState(null);

  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [performanceError, setPerformanceError] = useState(null);

  // Granular Fetching Loaders
  const loadEmployees = async (silent = false) => {
    if (!silent) setEmployeesLoading(true);
    try {
      const res = await getAllEmployees();
      setEmployees(res.data.employees || []);
      setEmployeesError(null);
    } catch (err) {
      console.error("Failed to load employees:", err);
      setEmployeesError("Failed to connect to backend server. Ensure the server is online.");
    } finally {
      if (!silent) setEmployeesLoading(false);
    }
  };

  const loadSchedules = async (silent = false) => {
    if (!silent) setSchedulesLoading(true);
    try {
      const res = await getSchedules();
      setSchedules(res.data.schedules || []);
      setSchedulesError(null);
    } catch (err) {
      console.error("Failed to load schedules:", err);
      setSchedulesError("Failed to retrieve shift planner schedules from the server.");
    } finally {
      if (!silent) setSchedulesLoading(false);
    }
  };

  const loadAttendance = async (silent = false) => {
    if (!silent) setAttendanceLoading(true);
    try {
      const res = await getAttendance();
      setAttendanceLogs(res.data.attendance || []);
      setAttendanceError(null);
    } catch (err) {
      console.error("Failed to load attendance logs:", err);
      setAttendanceError("Failed to retrieve attendance logs from the server.");
    } finally {
      if (!silent) setAttendanceLoading(false);
    }
  };

  const loadPerformance = async (silent = false) => {
    if (!silent) setPerformanceLoading(true);
    try {
      const res = await getPerformanceMetrics();
      setPerformanceMetrics(res.data.performance || []);
      setPerformanceError(null);
    } catch (err) {
      console.error("Failed to load performance metrics:", err);
      setPerformanceError("Failed to retrieve performance rating files from the server.");
    } finally {
      if (!silent) setPerformanceLoading(false);
    }
  };

  // Backward compatibility wrapper
  const loadAllData = async (silent = false) => {
    await Promise.all([
      loadEmployees(silent),
      loadSchedules(silent),
      loadAttendance(silent),
      loadPerformance(silent),
    ]);
  };

  // Initial mount - fetch only active roster (employees)
  useEffect(() => {
    loadEmployees();
    
    // Auto-refresh the active dataset silently every 30 seconds for live sync
    const intervalId = setInterval(() => {
      loadEmployees(true);
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Employee action handlers
  const handleRegisterEmployee = async (employeeData) => {
    try {
      const res = await apiAddEmployee(employeeData);
      await loadEmployees();
      return res.data;
    } catch (err) {
      console.error("Failed to register employee:", err);
      throw err;
    }
  };

  const handleUpdateEmployee = async (id, employeeData) => {
    try {
      const res = await apiUpdateEmployee(id, employeeData);
      await loadEmployees();
      return res.data;
    } catch (err) {
      console.error("Failed to update employee:", err);
      throw err;
    }
  };

  const handleDeleteEmployee = async (id) => {
    try {
      const res = await apiDeleteEmployee(id);
      await loadEmployees();
      return res.data;
    } catch (err) {
      console.error("Failed to delete employee profile:", err);
      throw err;
    }
  };

  // Schedule action handlers
  const handleAssignSchedule = async (scheduleData) => {
    try {
      const res = await apiSaveSchedule(scheduleData);
      await loadSchedules();
      return res.data;
    } catch (err) {
      console.error("Failed to assign schedule:", err);
      throw err;
    }
  };

  // Attendance action handlers
  const handleLogAttendance = async (attendanceData) => {
    try {
      const res = await apiLogAttendance(attendanceData);
      
      // Optimistic local state update for status indicator
      const emps = [...employees];
      const empIdx = emps.findIndex(e => e._id === attendanceData.employeeId);
      if (empIdx !== -1) {
        if (attendanceData.status === "Present" || attendanceData.status === "Late") {
          if (attendanceData.clockOut) {
            emps[empIdx].workingStatus = "Off Duty";
          } else {
            emps[empIdx].workingStatus = "Clocked In";
          }
          setEmployees(emps);
        }
      }
      
      await loadAttendance();
      return res.data;
    } catch (err) {
      console.error("Failed to log attendance:", err);
      throw err;
    }
  };

  // Performance log handlers
  const handleLogPerformance = async (metricData) => {
    try {
      const res = await apiLogPerformanceMetric(metricData);
      await loadPerformance();
      await loadEmployees(true); // reload performanceScore average on directory card
      return res.data;
    } catch (err) {
      console.error("Failed to update performance log:", err);
      throw err;
    }
  };

  // Backward compatible properties for legacy views
  const loading = employeesLoading;
  const error = employeesError;

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        schedules,
        attendanceLogs,
        performanceMetrics,
        loading,
        error,
        employeesLoading,
        schedulesLoading,
        attendanceLoading,
        performanceLoading,
        employeesError,
        schedulesError,
        attendanceError,
        performanceError,
        loadEmployees,
        loadSchedules,
        loadAttendance,
        loadPerformance,
        registerEmployee: handleRegisterEmployee,
        updateEmployee: handleUpdateEmployee,
        deleteEmployee: handleDeleteEmployee,
        assignSchedule: handleAssignSchedule,
        logAttendance: handleLogAttendance,
        logPerformance: handleLogPerformance,
        refreshData: loadAllData,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};
