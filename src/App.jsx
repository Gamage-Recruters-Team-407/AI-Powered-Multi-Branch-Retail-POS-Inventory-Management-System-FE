import React, { useState, useEffect, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Contexts
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { EmployeeProvider } from "./context/EmployeeContext";
import { ProductProvider } from "./context/ProductContext";
import { SalesProvider } from "./context/SalesContext";
import { NotificationProvider } from "./context/NotificationContext";
import { BranchProvider } from "./context/BranchContext";
import { CustomerProvider } from "./context/CustomerContext";

// Components
import ErrorBoundary from "./components/common/ErrorBoundary";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Profile from "./pages/auth/Profile";
import Unauthorized from "./pages/auth/Unauthorized";

// POS / Dashboard Pages
import Dashboard from "./pages/dashboard/Dashboard";
import CheckoutPage from "./pages/pos/CheckoutPage";
import POSPage from "./pages/pos/POSPage";
import ReceiptPage from "./pages/pos/ReceiptPage";
import SalesHistoryPage from "./pages/pos/SalesHistoryPage";

// Product Pages
import ProductListPage from "./pages/products/ProductListPage";
import AddProductPage from "./pages/products/AddProductPage";
import EditProductPage from "./pages/products/EditProductPage";
import ProductDetailsPage from "./pages/products/ProductDetailsPage";
import CategoryManagementPage from "./pages/products/CategoryManagementPage";

// Branch Pages
import BranchListPage from "./pages/branches/BranchListPage";
import BranchDetailsPage from "./pages/branches/BranchDetailsPage";

// Customer Pages
import CustomerListPage from "./pages/customers/CustomerListPage";

// AI & Reports Pages
import AIAssistantPage from "./pages/ai/AIAssistantPage";
import ReportsPage from "./pages/reports/ReportsPage";

// Audit & Security Pages
import AuditSecurityPage from "./pages/audit/AuditSecurityPage";

// Other Pages
import EmployeesPage from "./pages/employees/EmployeesPage";
import ReturnsPage from "./pages/returns/ReturnsPage";
import PurchaseOrdersPage from "./pages/purchase-orders/PurchaseOrdersPage";
import AnalyticsPage from "./pages/analytics/AnalyticsPage";
import WarehouseList from "./pages/Warehouse/WarehouseList";
import WarehouseDetail from "./pages/Warehouse/WarehouseDetail";

// Services
import { getInvoices, getReturns } from "./services/returnsApi";

import "./App.css";

// Placeholder pages
const AdminPanel = () => <h1>🔐 Admin Panel</h1>;

function App() {
  const [returnState, setReturnState] = useState({
    invoices: [],
    returns: [],
  });

  useEffect(() => {
    const fetchReturnsData = async () => {
      try {
        const invoicesRes = await getInvoices();
        const returnsRes = await getReturns();

        setReturnState({
          invoices: invoicesRes?.data || invoicesRes || [],
          returns: returnsRes?.data || returnsRes || [],
        });
      } catch (error) {
        console.error("Error fetching returns/invoices from backend:", error);
        // Set empty arrays on error to avoid breaking the UI
        setReturnState({
          invoices: [],
          returns: [],
        });
      }
    };

    fetchReturnsData();
  }, []);

  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      <EmployeeProvider>
        <ProductProvider>
          <SalesProvider>
            <CartProvider>
              <NotificationProvider>
                <CustomerProvider>
                  <BranchProvider>
                    <BrowserRouter
                      future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                      }}
                    >
                      <ErrorBoundary>
                        <div className="app-container">
                          <Routes>
                            <Route
                              path="/"
                              element={<Navigate to="/dashboard" replace />}
                            />

                            {/* Public Auth Routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route
                              path="/forgot-password"
                              element={<ForgotPassword />}
                            />
                            <Route
                              path="/reset-password/:token"
                              element={<ResetPassword />}
                            />
                            <Route
                              path="/unauthorized"
                              element={<Unauthorized />}
                            />

                            {/* Protected Dashboard Route */}
                            <Route
                              path="/dashboard"
                              element={
                                <ProtectedRoute
                                  roles={[
                                    "admin",
                                    "manager",
                                    "cashier",
                                    "user",
                                  ]}
                                >
                                  <Suspense
                                    fallback={
                                      <div
                                        style={{
                                          minHeight: "100vh",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          background:
                                            "linear-gradient(180deg, #4facfe 0%, #00f2fe 100%)",
                                          fontWeight: 600,
                                          color: "#0f172a",
                                        }}
                                      >
                                        Loading dashboard…
                                      </div>
                                    }
                                  >
                                    <Dashboard
                                      returnState={returnState}
                                      setReturnState={setReturnState}
                                    />
                                  </Suspense>
                                </ProtectedRoute>
                              }
                            />

                            {/* Protected Profile Route */}
                            <Route
                              path="/profile"
                              element={
                                <ProtectedRoute>
                                  <Profile />
                                </ProtectedRoute>
                              }
                            />

                            {/* Protected Admin Route */}
                            <Route
                              path="/admin"
                              element={
                                <ProtectedRoute roles={["admin"]}>
                                  <AdminPanel />
                                </ProtectedRoute>
                              }
                            />

                            {/* Audit & Security Route */}
                            <Route
                              path="/audit"
                              element={
                                <ProtectedRoute
                                  roles={["admin", "manager", "super_admin"]}
                                >
                                  <Suspense
                                    fallback={
                                      <div>Loading Audit Security...</div>
                                    }
                                  >
                                    <AuditSecurityPage />
                                  </Suspense>
                                </ProtectedRoute>
                              }
                            />

                            {/* POS Routes */}
                            <Route path="/pos" element={<POSPage />} />
                            <Route
                              path="/checkout"
                              element={<CheckoutPage />}
                            />
                            <Route path="/receipt" element={<ReceiptPage />} />
                            <Route
                              path="/history"
                              element={<SalesHistoryPage />}
                            />

                            {/* Product Routes */}
                            <Route
                              path="/products"
                              element={<ProductListPage />}
                            />
                            <Route
                              path="/products/add"
                              element={<AddProductPage />}
                            />
                            <Route
                              path="/products/edit/:id"
                              element={<EditProductPage />}
                            />
                            <Route
                              path="/products/categories"
                              element={<CategoryManagementPage />}
                            />
                            <Route
                              path="/products/:id"
                              element={<ProductDetailsPage />}
                            />

                            {/* Warehouse Routes - DashboardLayout keeps nav visible */}
                            <Route
                              path="/warehouse"
                              element={
                                <DashboardLayout>
                                  <WarehouseList />
                                </DashboardLayout>
                              }
                            />
                            <Route
                              path="/warehouse/:id"
                              element={
                                <DashboardLayout>
                                  <WarehouseDetail />
                                </DashboardLayout>
                              }
                            />

                            {/* Branch Routes */}
                            <Route
                              path="/branches"
                              element={
                                <ProtectedRoute roles={["admin", "manager"]}>
                                  <BranchListPage />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/branches/:id"
                              element={
                                <ProtectedRoute roles={["admin", "manager"]}>
                                  <BranchDetailsPage />
                                </ProtectedRoute>
                              }
                            />

                            {/* Customer Routes */}
                            <Route
                              path="/customers"
                              element={<CustomerListPage />}
                            />

                            {/* AI & Reports Routes */}
                            <Route
                              path="/ai"
                              element={
                                <ProtectedRoute
                                  roles={["admin", "manager", "cashier"]}
                                >
                                  <AIAssistantPage />
                                </ProtectedRoute>
                              }
                            />
                            <Route path="/reports" element={<ReportsPage />} />

                            {/* Other Routes */}
                            <Route
                              path="/employees"
                              element={<EmployeesPage />}
                            />
                            <Route
                              path="/returns"
                              element={
                                <ReturnsPage
                                  returnState={returnState}
                                  setReturnState={setReturnState}
                                />
                              }
                            />
                            <Route
                              path="/purchase-orders"
                              element={<PurchaseOrdersPage />}
                            />
                            <Route
                              path="/analytics"
                              element={
                                <ProtectedRoute roles={["admin", "manager"]}>
                                  <AnalyticsPage />
                                </ProtectedRoute>
                              }
                            />

                            {/* Default Redirect */}
                            <Route
                              path="*"
                              element={<Navigate to="/dashboard" replace />}
                            />
                          </Routes>
                        </div>
                      </ErrorBoundary>
                    </BrowserRouter>
                  </BranchProvider>
                </CustomerProvider>
              </NotificationProvider>
            </CartProvider>
          </SalesProvider>
        </ProductProvider>
      </EmployeeProvider>
    </AuthProvider>
  );
}

export default App;
