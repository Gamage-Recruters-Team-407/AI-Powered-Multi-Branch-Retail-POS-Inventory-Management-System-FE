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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data from API/Mock database on mount
  const loadAllData = async () => {
    setLoading(true);
    try {
      const empsRes = await getAllEmployees();
      const schedsRes = await getSchedules();
      const attendRes = await getAttendance();
      const perfRes = await getPerformanceMetrics();

      setEmployees(empsRes.data.employees || []);
      setSchedules(schedsRes.data.schedules || []);
      setAttendanceLogs(attendRes.data.attendance || []);
      setPerformanceMetrics(perfRes.data.performance || []);
      setError(null);
    } catch (err) {
      console.error("Failed to load employee module state:", err);
      setError("Failed to load employee management data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Employee action handlers
  const handleRegisterEmployee = async (employeeData) => {
    try {
      const res = await apiAddEmployee(employeeData);
      // Reload from local database or update state
      await loadAllData();
      return res.data;
    } catch (err) {
      console.error("Failed to register employee:", err);
      throw err;
    }
  };

  const handleUpdateEmployee = async (id, employeeData) => {
    try {
      const res = await apiUpdateEmployee(id, employeeData);
      await loadAllData();
      return res.data;
    } catch (err) {
      console.error("Failed to update employee:", err);
      throw err;
    }
  };

  const handleDeleteEmployee = async (id) => {
    try {
      const res = await apiDeleteEmployee(id);
      await loadAllData();
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
      await loadAllData();
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
      
      // Update employee active status in local state if relevant
      const emps = [...employees];
      const empIdx = emps.findIndex(e => e._id === attendanceData.employeeId);
      if (empIdx !== -1) {
        if (attendanceData.status === "Present" || attendanceData.status === "Late") {
          // If clocked out, set status to Active (not working right now) or custom sub-status.
          // Let's assume clocking in changes active indicator
          if (attendanceData.clockOut) {
            emps[empIdx].workingStatus = "Off Duty";
          } else {
            emps[empIdx].workingStatus = "Clocked In";
          }
          setEmployees(emps);
        }
      }
      
      await loadAllData();
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
      await loadAllData();
      return res.data;
    } catch (err) {
      console.error("Failed to update performance log:", err);
      throw err;
    }
  };

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        schedules,
        attendanceLogs,
        performanceMetrics,
        loading,
        error,
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
