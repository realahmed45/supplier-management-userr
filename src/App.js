import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProductSelectionPage from "./components/ProductSelectionPage";
import ProfilePage from "./components/ProfilePage";
import SubmissionSuccess from "./components/SubmissionSuccess";

function App() {
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

  const updateSupplierData = (newData) => {
    setSupplierData((prev) => ({ ...prev, ...newData }));
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* FIRST PAGE: Product Selection */}
          <Route
            path="/"
            element={
              <ProductSelectionPage
                supplierData={supplierData}
                updateSupplierData={updateSupplierData}
              />
            }
          />

          {/* SECOND PAGE: Profile Information */}
          <Route
            path="/profile"
            element={
              <ProfilePage
                supplierData={supplierData}
                updateSupplierData={updateSupplierData}
              />
            }
          />

          {/* SUCCESS PAGE */}
          <Route path="/success" element={<SubmissionSuccess />} />

          {/* Redirect any other routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
