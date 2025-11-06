import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProductSelectionPage from "./components/ProductSelectionPage";
import ProfilePage from "./components/ProfilePage";
import SubmissionSuccess from "./components/SubmissionSuccess";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import axios from "axios";

const API_BASE_URL = "https://supplier-mangement-backend.onrender.com/api";

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [supplierData, setSupplierData] = useState({
    // Products FIRST
    products: [],

    // Profile information (comes later)
    profilePicture: "",
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Indonesia",
    },
    website: "",
    taxId: "",

    // Business details
    businessType: [],
    yearsInBusiness: 0,
    warehouses: [],
    shippingMethods: [],
    deliveryAreas: [],
    paymentTerms: [],
    documents: [],
    preferredCurrency: "IDR",
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/auth/verify-token`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem("authToken");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("authToken");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("authToken");
  };

  const updateSupplierData = (newData) => {
    setSupplierData((prev) => ({ ...prev, ...newData }));
  };

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Login Route */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate
                  to={user?.hasSupplierData ? "/dashboard" : "/"}
                  replace
                />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />

          {/* Dashboard Route - Protected */}
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <Dashboard user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Product Selection Page - For new applications or adding products */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <ProductSelectionPage
                  supplierData={supplierData}
                  updateSupplierData={updateSupplierData}
                  user={user}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Profile Page - For completing new applications */}
          <Route
            path="/profile"
            element={
              isAuthenticated ? (
                <ProfilePage
                  supplierData={supplierData}
                  updateSupplierData={updateSupplierData}
                  user={user}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Success Page */}
          <Route
            path="/success"
            element={
              isAuthenticated ? (
                <SubmissionSuccess />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Redirect any other routes */}
          <Route
            path="*"
            element={
              <Navigate
                to={
                  isAuthenticated
                    ? user?.hasSupplierData
                      ? "/dashboard"
                      : "/"
                    : "/login"
                }
                replace
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
