import React, { useState, useEffect, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Contexts
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from './context/CartContext';
import { EmployeeProvider } from './context/EmployeeContext';
import { ProductProvider } from './context/ProductContext';
import { SalesProvider } from './context/SalesContext';
import { NotificationProvider } from './context/NotificationContext';
import { BranchProvider } from "./context/BranchContext";
import { CustomerProvider } from "./context/CustomerContext";

// Components
import ErrorBoundary from "./components/common/ErrorBoundary";
import ProtectedRoute from "./routes/ProtectedRoute";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Profile from "./pages/auth/Profile";
import Unauthorized from "./pages/auth/Unauthorized";

// POS / Dashboard Pages
import Dashboard from "./pages/dashboard/Dashboard";
import CheckoutPage from './pages/pos/CheckoutPage';
import POSPage from './pages/pos/POSPage';
import ReceiptPage from './pages/pos/ReceiptPage';
import SalesHistoryPage from './pages/pos/SalesHistoryPage';

// Product Pages
import ProductListPage from './pages/products/ProductListPage';
import AddProductPage from './pages/products/AddProductPage';
import EditProductPage from './pages/products/EditProductPage';
import ProductDetailsPage from './pages/products/ProductDetailsPage';
import CategoryManagementPage from "./pages/products/CategoryManagementPage";

// Warehouse Pages (Oyage Routes)
import WarehouseList from './pages/warehouse/WarehouseList';
import WarehouseDetail from './pages/Warehouse/WarehouseDetail';

// Branch Pages
import BranchListPage from "./pages/branches/BranchListPage";
import AddBranchPage from "./pages/branches/AddBranchPage";
import EditBranchPage from "./pages/branches/EditBranchPage";
import BranchDetailsPage from "./pages/branches/BranchDetailsPage";

// Customer Pages
import CustomerListPage from "./pages/customers/CustomerListPage";

// AI & Reports Pages
import AIAssistantPage from "./pages/ai/AIAssistantPage";
import ReportsPage from "./pages/reports/ReportsPage";

// Other Pages
import EmployeesPage from './pages/employees/EmployeesPage';
import ReturnsPage from "./pages/returns/ReturnsPage";
import PurchaseOrdersPage from "./pages/purchase-orders/PurchaseOrdersPage";

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
          invoices: invoicesRes.data || [],
          returns: returnsRes.data || [],
        });
      } catch (error) {
        console.error("Error fetching returns/invoices from backend:", error);
      }
    };

    fetchReturnsData();
  }, []);

  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <EmployeeProvider>
        <ProductProvider>
          <SalesProvider>
            <CartProvider>
              <NotificationProvider>
                <CustomerProvider>
                  <BranchProvider>
                    <BrowserRouter>
                      <ErrorBoundary>
                        <div className="app-container">
                          <Routes>
                            {/* Public Auth Routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password/:token" element={<ResetPassword />} />
                            <Route path="/unauthorized" element={<Unauthorized />} />

                            {/* Protected Dashboard Route */}
                            <Route
                              path="/dashboard"
                              element={
                                <ProtectedRoute roles={["admin", "manager", "cashier", "user"]}>
                                  <Suspense
                                    fallback={
                                      <div
                                        style={{
                                          minHeight: '100vh',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          background: 'linear-gradient(180deg, #4facfe 0%, #00f2fe 100%)',
                                          fontWeight: 600,
                                          color: '#0f172a',
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

                            {/* POS Routes */}
                            <Route path="/pos" element={<POSPage />} />
                            <Route path="/checkout" element={<CheckoutPage />} />
                            <Route path="/receipt" element={<ReceiptPage />} />
                            <Route path="/history" element={<SalesHistoryPage />} />

                            {/* Product Routes */}
                            <Route path="/products" element={<ProductListPage />} />
                            <Route path="/products/add" element={<AddProductPage />} />
                            <Route path="/products/edit/:id" element={<EditProductPage />} />
                            <Route path="/products/categories" element={<CategoryManagementPage />} />
                            <Route path="/products/:id" element={<ProductDetailsPage />} />

                            {/* Warehouse Routes */}
                            <Route path="/warehouse" element={<WarehouseList />} />
                            <Route path="/warehouse/:id" element={<WarehouseDetail />} />

                            {/* Branch Routes */}
                            <Route path="/branches" element={<BranchListPage />} />
                            <Route path="/branches/add" element={<AddBranchPage />} />
                            <Route path="/branches/edit/:id" element={<EditBranchPage />} />
                            <Route path="/branches/:id" element={<BranchDetailsPage />} />
                            
                            {/* Customer Routes */}
                            <Route path="/customers" element={<CustomerListPage />} />

                            {/* AI & Reports Routes */}
                            <Route
                              path="/ai"
                              element={
                                <ProtectedRoute roles={["admin", "manager", "cashier"]}>
                                  <AIAssistantPage />
                                </ProtectedRoute>
                              }
                            />
                            <Route path="/reports" element={<ReportsPage />} />

                            {/* Other Routes */}
                            <Route path="/employees" element={<EmployeesPage />} />
                            <Route path="/returns" element={<ReturnsPage />} />
                            <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />

                            {/* Default Redirect */}
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
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