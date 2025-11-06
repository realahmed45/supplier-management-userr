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
import { authUtils } from "./components/authutils";

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
    const token = authUtils.getToken();
    console.log("Checking auth status, token present:", !!token);

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await authUtils.verifyToken();
      console.log("Token verification response:", response);

      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
        console.log("User authenticated:", response.user);
      } else {
        console.log("Token verification failed, removing token");
        authUtils.removeToken();
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      authUtils.removeToken();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (userData) => {
    console.log("Login successful, user data:", userData);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    console.log("Logging out user");
    try {
      await authUtils.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      // Don't need to manually remove token as authUtils.logout() handles it
    }
  };

  const updateSupplierData = (newData) => {
    console.log("Updating supplier data:", newData);
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
                <Login
                  onLogin={handleLogin}
                  onLogout={handleLogout}
                  isLoggedIn={isAuthenticated}
                />
              )
            }
          />

          {/* Dashboard Route - For existing suppliers */}
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                user?.hasSupplierData ? (
                  <Dashboard user={user} onLogout={handleLogout} />
                ) : (
                  // New user should go to product selection first
                  <Navigate to="/" replace />
                )
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
                user?.hasSupplierData ? (
                  // Existing supplier should go to dashboard by default
                  <Navigate to="/dashboard" replace />
                ) : (
                  // New user starts here
                  <ProductSelectionPage
                    supplierData={supplierData}
                    updateSupplierData={updateSupplierData}
                    user={user}
                    onLogout={handleLogout}
                  />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Add Products Route - For adding products to existing supplier */}
          <Route
            path="/add-products"
            element={
              isAuthenticated ? (
                <ProductSelectionPage
                  supplierData={supplierData}
                  updateSupplierData={updateSupplierData}
                  user={user}
                  onLogout={handleLogout}
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
                  onLogout={handleLogout}
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
                <SubmissionSuccess onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Redirect any other routes based on user status */}
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
