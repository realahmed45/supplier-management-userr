import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  CreditCard,
  MessageCircle,
  Upload,
  AlertCircle,
  Camera,
  ArrowLeft,
  CheckCircle,
  Package,
  LogOut,
} from "lucide-react";
import apiClient, { authUtils } from "./authutils";

const ProfilePage = ({ supplierData, updateSupplierData, user, onLogout }) => {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();

  // Form data state
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    website: "",
    taxId: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Indonesia",
    },
    profilePicture: "",
  });

  // Check authentication on component mount
  useEffect(() => {
    const token = authUtils.getToken();
    if (!token) {
      console.log("No token found, redirecting to login");
      navigate("/login");
      return;
    }

    // Verify token is valid
    authUtils.verifyToken().then((result) => {
      if (!result.success) {
        console.log("Token verification failed, redirecting to login");
        navigate("/login");
      }
    });
  }, [navigate]);

  // Redirect if no products selected
  useEffect(() => {
    if (!supplierData.products || supplierData.products.length === 0) {
      alert("Please select products first!");
      navigate("/");
    }
  }, [supplierData.products, navigate]);

  // Load user data if available
  useEffect(() => {
    if (user) {
      setFormData({
        companyName: user.companyName || "",
        contactPerson: user.contactPerson || "",
        email: user.email || "",
        phone: user.phone || "",
        website: user.website || "",
        taxId: user.taxId || "",
        address: user.address || {
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "Indonesia",
        },
        profilePicture: user.profilePicture || "",
      });
    }
  }, [user]);

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    } else {
      await authUtils.logout(navigate);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData((prev) => ({
          ...prev,
          profilePicture: base64String,
        }));
        setPreviewImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors = {};

    // Only validate required fields: company name, contact person, and phone
    if (!formData.companyName?.trim()) {
      newErrors.companyName = "Company name is required";
    }
    if (!formData.contactPerson?.trim()) {
      newErrors.contactPerson = "Contact person is required";
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to convert base64 to blob
  const base64ToBlob = (base64String) => {
    try {
      const [header, data] = base64String.split(",");
      const mimeType = header.match(/:(.*?);/)[1];
      const binaryString = window.atob(data);
      const bytes = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      return new Blob([bytes], { type: mimeType });
    } catch (error) {
      console.error("Error converting base64 to blob:", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      const firstErrorField = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Starting form submission...");

      // Verify token before making request
      const token = authUtils.getToken();
      if (!token) {
        setErrors({ submit: "Authentication required. Please login again." });
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      console.log("Token found, proceeding with submission");

      // Step 1: Create supplier with profile info
      const formDataObj = new FormData();

      // Add form fields (excluding profilePicture for now)
      Object.keys(formData).forEach((key) => {
        if (key === "address") {
          formDataObj.append(key, JSON.stringify(formData[key]));
        } else if (key === "profilePicture") {
          // Handle profile picture separately
          if (formData[key] && formData[key].startsWith("data:")) {
            const blob = base64ToBlob(formData[key]);
            if (blob) {
              formDataObj.append(key, blob, "profile.jpg");
            }
          }
        } else if (formData[key]) {
          formDataObj.append(key, formData[key]);
        }
      });

      console.log("Creating supplier with profile data...");

      // Create supplier using apiClient (which automatically includes auth header)
      const createResponse = await apiClient.post("/suppliers", formDataObj, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Supplier creation response:", createResponse.data);

      const supplierId = createResponse.data.supplier._id;
      console.log("Supplier created with ID:", supplierId);

      // IMPORTANT: Wait a moment to ensure the database is updated
      // The user's supplierId should now be set by the backend
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 2: Verify token again to get updated user info
      console.log("Verifying token to get updated user info...");
      const verifyResponse = await authUtils.verifyToken();

      if (!verifyResponse.success) {
        throw new Error("Token verification failed after supplier creation");
      }

      console.log("Updated user info:", verifyResponse.user);

      // Step 3: Update with products using PATCH
      console.log("Adding products to supplier...");

      const businessResponse = await apiClient.patch(
        `/suppliers/${supplierId}/business`,
        {
          products: supplierData.products || [],
          businessType: [],
          yearsInBusiness: 0,
          warehouses: [],
          shippingMethods: [],
          deliveryAreas: [],
          paymentTerms: [],
          preferredCurrency: "IDR",
          documents: [],
        }
      );

      console.log("Business data update response:", businessResponse.data);
      console.log("Products added successfully");

      // Navigate to success page
      navigate("/success");
    } catch (error) {
      console.error("Error submitting form:", error);
      console.error("Error response:", error.response?.data);

      let errorMessage =
        "There was an error submitting the form. Please try again.";

      if (error.response?.status === 401) {
        errorMessage = "Session expired. Please login again.";
        setTimeout(() => navigate("/login"), 2000);
      } else if (error.response?.status === 403) {
        errorMessage =
          "Access denied. There was an issue with your account permissions.";
        console.error("403 Error details:", error.response?.data);
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with logout */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Company Information
              </h1>
              <p className="text-gray-600">Tell us about your company</p>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-600" size={32} />
                <span className="font-bold text-green-600">
                  Step 1: Products
                </span>
              </div>
              <div className="w-24 h-1 bg-green-600"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <span className="font-bold text-blue-600">
                  Step 2: Company Info
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Products Summary Banner */}
        <div className="bg-green-50 border-2 border-green-500 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            <Package className="text-green-600" size={40} />
            <div>
              <h3 className="text-xl font-bold text-green-900">
                ✅ {supplierData.products?.length} Product(s) Selected
              </h3>
              <p className="text-green-700">
                Great! Now let's add your company information
              </p>
            </div>
          </div>
        </div>

        {/* Fixed Support Box - Smaller */}
        <div className="fixed top-4 right-2 bg-white rounded-lg shadow-lg p-3 max-w-xs border border-purple-200 z-50">
          <div className="flex items-center gap-2">
            <div className="bg-purple-100 p-1 rounded-full">
              <MessageCircle className="text-purple-600" size={16} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-sm">Need Help?</h3>
              <button className="w-full flex items-center gap-1 px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors mt-1">
                <Phone size={12} />
                +620864322626
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Required Information Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-500 rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Building2 className="text-blue-600" size={24} />
                Required Information
              </h2>
              <p className="text-gray-600 mb-6">
                Fill these required fields to continue
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.companyName
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200"
                    }`}
                    placeholder="Enter your company name"
                  />
                  {errors.companyName && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={16} />
                      {errors.companyName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Person *
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.contactPerson
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200"
                      }`}
                      placeholder="Enter contact person name"
                    />
                  </div>
                  {errors.contactPerson && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={16} />
                      {errors.contactPerson}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={true} // Phone should be read-only as it's used for authentication
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-100 ${
                        errors.phone
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200"
                      }`}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={16} />
                      {errors.phone}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Phone number is linked to your account and cannot be changed
                    here
                  </p>
                </div>
              </div>
            </div>

            {/* Optional Information Section */}
            <div className="bg-gray-50 border-2 border-gray-300 rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Mail className="text-gray-600" size={24} />
                Optional Information
              </h2>
              <p className="text-gray-600 mb-6">
                Complete your profile (optional but recommended)
              </p>

              {/* Profile Picture */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mx-auto mb-4 overflow-hidden border-4 border-white shadow-lg">
                    {previewImage || formData.profilePicture ? (
                      <img
                        src={previewImage || formData.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="text-white" size={24} />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                    <Upload size={12} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500">
                  Upload company logo or profile picture
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Website
                  </label>
                  <div className="relative">
                    <Globe
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tax ID
                  </label>
                  <div className="relative">
                    <CreditCard
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your tax ID"
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <MapPin className="text-green-600" size={20} />
                    Address Information
                  </h3>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter street address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State/Province
                  </label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter state/province"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="address.postalCode"
                    value={formData.address.postalCode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter postal code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="address.country"
                    value="Indonesia"
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              {errors.submit && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 flex items-center gap-2">
                    <AlertCircle size={20} />
                    {errors.submit}
                  </p>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 flex items-center gap-2"
                >
                  <ArrowLeft size={20} />
                  Back to Products
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <CheckCircle size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
