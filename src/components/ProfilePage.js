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
} from "lucide-react";
import axios from "axios";

const ProfilePage = ({ supplierData, updateSupplierData }) => {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();

  // Redirect if no products selected
  useEffect(() => {
    if (!supplierData.products || supplierData.products.length === 0) {
      alert("Please select products first!");
      navigate("/");
    }
  }, [supplierData.products, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes("address.")) {
      const addressField = name.split(".")[1];
      updateSupplierData({
        address: {
          ...supplierData.address,
          [addressField]: value,
        },
      });
    } else {
      updateSupplierData({ [name]: value });
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
        updateSupplierData({ profilePicture: base64String });
        setPreviewImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!supplierData.companyName?.trim()) {
      newErrors.companyName = "Company name is required";
    }
    if (!supplierData.contactPerson?.trim()) {
      newErrors.contactPerson = "Contact person is required";
    }
    if (!supplierData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(supplierData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!supplierData.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      // Step 1: Create supplier with profile info
      const formData = new FormData();

      const profileFields = [
        "companyName",
        "contactPerson",
        "email",
        "phone",
        "website",
        "taxId",
      ];

      profileFields.forEach((field) => {
        if (supplierData[field]) {
          formData.append(field, supplierData[field]);
        }
      });

      // Add address
      formData.append("address", JSON.stringify(supplierData.address || {}));

      // Add profile picture if exists
      if (supplierData.profilePicture) {
        const response = await fetch(supplierData.profilePicture);
        const blob = await response.blob();
        formData.append("profilePicture", blob, "profile.jpg");
      }

      // Create supplier
      const createResponse = await axios.post(
        "https://supplier-mangement-backend.onrender.com/api/suppliers",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const supplierId = createResponse.data._id;
      console.log("Supplier created with ID:", supplierId);

      // Step 2: Update with products using PATCH
      await axios.patch(
        `https://supplier-mangement-backend.onrender.com/api/suppliers/${supplierId}/business`,
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
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Products added successfully");

      // Navigate to success page
      navigate("/success");
    } catch (error) {
      console.error("Error submitting form:", error);

      let errorMessage =
        "There was an error submitting the form. Please try again.";
      if (error.response?.data?.message) {
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

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <Building2 className="mx-auto text-blue-600 mb-4" size={48} />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Company Information
            </h1>
            <p className="text-gray-600">Tell us about your company</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Picture */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mx-auto mb-4 overflow-hidden border-4 border-white shadow-lg">
                  {previewImage || supplierData.profilePicture ? (
                    <img
                      src={previewImage || supplierData.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="text-white" size={40} />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                  <Upload size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Upload your company logo or profile picture
              </p>
            </div>

            {/* Fixed Support Box */}
            <div className="fixed top-10 right-2 bg-white rounded-2xl shadow-2xl p-6 max-w-sm border-2 border-purple-200 z-50">
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <MessageCircle className="text-purple-600" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-extrabold text-gray-800 mb-2">
                    Need Help?
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Reach out to us if you need help
                  </p>
                  <div className="space-y-2">
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      <Phone size={16} />
                      Call +620864322626
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Building2 className="text-blue-600" size={24} />
                Company Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={supplierData.companyName || ""}
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
                      value={supplierData.contactPerson || ""}
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
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="email"
                      name="email"
                      value={supplierData.email || ""}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.email
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200"
                      }`}
                      placeholder="Enter your email address"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={16} />
                      {errors.email}
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
                      value={supplierData.phone || ""}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
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
                      value={supplierData.website || ""}
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
                      value={supplierData.taxId || ""}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your tax ID"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <MapPin className="text-green-600" size={24} />
                Address Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={supplierData.address?.street || ""}
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
                    value={supplierData.address?.city || ""}
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
                    value={supplierData.address?.state || ""}
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
                    value={supplierData.address?.postalCode || ""}
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
