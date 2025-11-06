import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Building2,
  Package,
  Settings,
  LogOut,
  Edit3,
  Plus,
  Eye,
  Trash2,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  AlertCircle,
  Save,
  X,
  Upload,
  FileText,
  Warehouse,
  Truck,
  DollarSign,
} from "lucide-react";
import axios from "axios";

const API_BASE_URL = "https://supplier-mangement-backend.onrender.com/api";

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [supplierData, setSupplierData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form data
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
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchSupplierData();
  }, []);

  const fetchSupplierData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_BASE_URL}/suppliers/my-supplier`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSupplierData(response.data.supplier);

        // Populate form with user data
        setFormData({
          companyName: response.data.user.companyName || "",
          contactPerson: response.data.user.contactPerson || "",
          email: response.data.user.email || "",
          phone: response.data.user.phone || "",
          website: response.data.user.website || "",
          taxId: response.data.user.taxId || "",
          address: response.data.user.address || {
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: "Indonesia",
          },
        });
      }
    } catch (error) {
      console.error("Error fetching supplier data:", error);
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        setError("Failed to load supplier data");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    onLogout();
    navigate("/login");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
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
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("authToken");
      console.log("Token from localStorage:", token ? "Present" : "Missing");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const formDataObj = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === "address") {
          formDataObj.append(key, JSON.stringify(formData[key]));
        } else {
          formDataObj.append(key, formData[key]);
        }
      });

      console.log("Making request to:", `${API_BASE_URL}/suppliers/profile`);
      console.log("With token:", token.substring(0, 10) + "...");

      const response = await axios.patch(
        `${API_BASE_URL}/suppliers/profile`,
        formDataObj,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      console.error("Error response:", error.response?.data);

      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
        // Optionally redirect to login
        setTimeout(() => {
          handleLogout();
        }, 2000);
      } else {
        setError(error.response?.data?.message || "Failed to update profile");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const navigateToProducts = () => {
    navigate("/");
  };

  const StatusBadge = ({ status }) => {
    const statusColors = {
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Approved: "bg-green-100 text-green-800 border-green-200",
      Rejected: "bg-red-100 text-red-800 border-red-200",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium border ${
          statusColors[status] || statusColors.Pending
        }`}
      >
        {status || "Pending"}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Building2 className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Supplier Portal
                </h1>
                <p className="text-sm text-gray-500">
                  Welcome back, {formData.contactPerson || user?.phone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {supplierData && <StatusBadge status={supplierData.status} />}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === "profile"
                      ? "bg-purple-100 text-purple-700 border border-purple-200"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <User size={18} />
                  Profile Information
                </button>

                <button
                  onClick={() => setActiveTab("products")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === "products"
                      ? "bg-purple-100 text-purple-700 border border-purple-200"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <Package size={18} />
                  Products & Business
                  {supplierData?.products?.length > 0 && (
                    <span className="ml-auto bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                      {supplierData.products.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("documents")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === "documents"
                      ? "bg-purple-100 text-purple-700 border border-purple-200"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <FileText size={18} />
                  Documents
                  {supplierData?.documents?.length > 0 && (
                    <span className="ml-auto bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                      {supplierData.documents.length}
                    </span>
                  )}
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Success/Error Messages */}
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-green-600 flex items-center gap-2">
                  <CheckCircle size={16} />
                  {success}
                </p>
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </p>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-xl shadow-sm border p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Profile Information
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Manage your company and contact details
                    </p>
                  </div>

                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Edit3 size={16} />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {isSaving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        ) : (
                          <Save size={16} />
                        )}
                        {isSaving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                      placeholder="Enter company name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                      placeholder="Enter contact person name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={true} // Phone number should not be editable
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                      placeholder="Phone number"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Phone number cannot be changed. Contact support if needed.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tax ID
                    </label>
                    <input
                      type="text"
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                      placeholder="Enter tax ID"
                    />
                  </div>

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
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
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
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
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
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
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
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
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
                      value={formData.address.country}
                      disabled={true}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === "products" && (
              <div className="space-y-6">
                {/* Products Section */}
                <div className="bg-white rounded-xl shadow-sm border p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Products & Business Information
                      </h2>
                      <p className="text-gray-600 mt-1">
                        Manage your product catalog and business details
                      </p>
                    </div>

                    <button
                      onClick={navigateToProducts}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Plus size={16} />
                      Add Products
                    </button>
                  </div>

                  {supplierData?.products?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                              Product
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                              Brand
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                              Size
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                              Price
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                              Min Qty
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {supplierData.products.map((product, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-100 hover:bg-gray-50"
                            >
                              <td className="py-3 px-4">
                                <div>
                                  <div className="font-medium text-gray-800">
                                    {product.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {product.category} • {product.subcategory}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-600">
                                {product.brandName}
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                  {product.selectedSize}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-semibold text-green-600">
                                {product.price} {product.unit}
                              </td>
                              <td className="py-3 px-4 text-gray-600">
                                {product.minOrderQuantity}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">
                        No Products Added
                      </h3>
                      <p className="text-gray-500 mb-6">
                        Start by adding products you can supply
                      </p>
                      <button
                        onClick={navigateToProducts}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Plus size={20} />
                        Add Your First Product
                      </button>
                    </div>
                  )}
                </div>

                {/* Business Info Summary */}
                {supplierData && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Warehouse className="h-8 w-8 text-orange-500" />
                        <h3 className="font-bold text-gray-800">Warehouses</h3>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {supplierData.warehouses?.length || 0}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Warehouse locations
                      </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Truck className="h-8 w-8 text-blue-500" />
                        <h3 className="font-bold text-gray-800">Shipping</h3>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {supplierData.shippingMethods?.length || 0}
                      </p>
                      <p className="text-gray-600 text-sm">Shipping methods</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <DollarSign className="h-8 w-8 text-green-500" />
                        <h3 className="font-bold text-gray-800">Payment</h3>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {supplierData.paymentTerms?.length || 0}
                      </p>
                      <p className="text-gray-600 text-sm">Payment terms</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === "documents" && (
              <div className="bg-white rounded-xl shadow-sm border p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Documents
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Manage your verification documents
                    </p>
                  </div>
                </div>

                {supplierData?.documents?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {supplierData.documents.map((document, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-xl p-4"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-gray-800">
                            {document.documentId}
                          </h4>
                        </div>
                        {document.documentImage && (
                          <img
                            src={document.documentImage}
                            alt="Document"
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                        )}
                        <p className="text-sm text-gray-600 mb-2">
                          {document.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          Uploaded:{" "}
                          {new Date(document.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      No Documents Uploaded
                    </h3>
                    <p className="text-gray-500">
                      Upload verification documents to complete your profile
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
