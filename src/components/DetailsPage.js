import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2,
  Package,
  Warehouse,
  Truck,
  DollarSign,
  Plus,
  X,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Edit3,
  Eye,
  Upload,
  FileText,
  MessageCircle,
  Phone,
  AlertCircle,
} from "lucide-react";
import axios from "axios";

// Product catalog with categories and subcategories
const PRODUCT_CATALOG = {
  "Construction Material": {
    Cement: [
      {
        id: "cement-1",
        name: "Portland Cement Type I",
        sizes: ["25kg", "40kg", "50kg"],
      },
      {
        id: "cement-2",
        name: "Portland Cement Type II",
        sizes: ["25kg", "40kg", "50kg"],
      },
      { id: "cement-3", name: "White Cement", sizes: ["25kg", "40kg", "50kg"] },
      {
        id: "cement-4",
        name: "Rapid Hardening Cement",
        sizes: ["25kg", "40kg", "50kg"],
      },
      {
        id: "cement-5",
        name: "Sulphate Resistant Cement",
        sizes: ["25kg", "40kg", "50kg"],
      },
    ],
    Bricks: [
      {
        id: "brick-1",
        name: "Red Clay Brick",
        sizes: ["Standard", "Modular", "Queen"],
      },
      {
        id: "brick-2",
        name: "Concrete Brick",
        sizes: ["Standard", "Modular", "Jumbo"],
      },
      { id: "brick-3", name: "Fly Ash Brick", sizes: ["Standard", "Modular"] },
      { id: "brick-4", name: "Fire Brick", sizes: ["Standard", "Split"] },
      { id: "brick-5", name: "Hollow Brick", sizes: ["Standard", "Large"] },
    ],
  },
};

const DetailsPage = ({ supplierData, updateSupplierData }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Product selection is now the FIRST step
  const [hasSelectedProducts, setHasSelectedProducts] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productDetails, setProductDetails] = useState({});

  // Check if user has already added products
  useEffect(() => {
    if (supplierData.products && supplierData.products.length > 0) {
      setHasSelectedProducts(true);
    }
  }, [supplierData.products]);

  // Ensure arrays are initialized
  useEffect(() => {
    updateSupplierData({
      businessType: supplierData.businessType || [],
      products: supplierData.products || [],
      warehouses: supplierData.warehouses || [],
      shippingMethods: supplierData.shippingMethods || [],
      deliveryAreas: supplierData.deliveryAreas || [],
      paymentTerms: supplierData.paymentTerms || [],
      documents: supplierData.documents || [],
      preferredCurrency: "IDR",
    });
  }, []);

  const [warehouseInput, setWarehouseInput] = useState({
    warehouseName: "",
    location: "",
    handlingCapacity: "",
  });

  const [documentInput, setDocumentInput] = useState({
    documentId: "",
    documentImage: null,
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateSupplierData({ [name]: value });
  };

  const handleBusinessTypeChange = (type) => {
    const currentTypes = supplierData.businessType || [];
    const updatedTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];
    updateSupplierData({ businessType: updatedTypes });
  };

  const handleCheckboxChange = (field, value) => {
    const currentArray = supplierData[field] || [];
    const updatedArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];
    updateSupplierData({ [field]: updatedArray });
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory("");
    setSelectedProducts([]);
  };

  const handleSubcategorySelect = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setSelectedProducts([]);
  };

  const handleProductToggle = (product) => {
    const isSelected = selectedProducts.some((p) => p.id === product.id);

    if (isSelected) {
      setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id));
      const newDetails = { ...productDetails };
      delete newDetails[product.id];
      setProductDetails(newDetails);
    } else {
      setSelectedProducts([...selectedProducts, product]);
      setProductDetails({
        ...productDetails,
        [product.id]: {
          brandName: "",
          minOrderQuantity: "",
          price: "",
          unit: "piece",
          availableQuantity: "",
          selectedSize: product.sizes[0],
          leadTime: "",
          description: "",
        },
      });
    }
  };

  const handleProductDetailChange = (productId, field, value) => {
    setProductDetails({
      ...productDetails,
      [productId]: {
        ...productDetails[productId],
        [field]: value,
      },
    });
  };

  const addSelectedProducts = () => {
    // Validate that all required fields are filled
    for (const product of selectedProducts) {
      const details = productDetails[product.id];
      if (
        !details.brandName ||
        !details.minOrderQuantity ||
        !details.price ||
        !details.availableQuantity
      ) {
        alert(`Please fill all required fields for ${product.name}`);
        return;
      }
    }

    const productsToAdd = selectedProducts.map((product) => {
      const details = productDetails[product.id];
      return {
        category: selectedCategory,
        subcategory: selectedSubcategory,
        name: product.name,
        brandName: details.brandName,
        minOrderQuantity: Number(details.minOrderQuantity) || 0,
        price: Number(details.price) || 0,
        unit: details.unit,
        availableQuantity: details.availableQuantity,
        selectedSize: details.selectedSize,
        leadTime: details.leadTime,
        description: details.description,
      };
    });

    updateSupplierData({
      products: [...(supplierData.products || []), ...productsToAdd],
    });

    setSelectedProducts([]);
    setProductDetails({});
    setHasSelectedProducts(true);
    alert(
      `${productsToAdd.length} product(s) added successfully! You can now fill the rest of the form.`
    );
  };

  const removeProduct = (index) => {
    const updatedProducts = [...(supplierData.products || [])];
    updatedProducts.splice(index, 1);
    updateSupplierData({ products: updatedProducts });

    // If no products left, show product selection again
    if (updatedProducts.length === 0) {
      setHasSelectedProducts(false);
    }
  };

  const handleWarehouseChange = (e) => {
    const { name, value } = e.target;
    setWarehouseInput((prev) => ({ ...prev, [name]: value }));
  };

  const addWarehouse = () => {
    if (!warehouseInput.warehouseName.trim()) return;

    const newWarehouse = {
      ...warehouseInput,
      handlingCapacity: Number(warehouseInput.handlingCapacity) || 0,
    };

    updateSupplierData({
      warehouses: [...(supplierData.warehouses || []), newWarehouse],
    });

    setWarehouseInput({
      warehouseName: "",
      location: "",
      handlingCapacity: "",
    });
  };

  const removeWarehouse = (index) => {
    const updatedWarehouses = [...(supplierData.warehouses || [])];
    updatedWarehouses.splice(index, 1);
    updateSupplierData({ warehouses: updatedWarehouses });
  };

  const handleDocumentChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "documentImage" && files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocumentInput((prev) => ({
          ...prev,
          documentImage: e.target.result,
        }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setDocumentInput((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addDocument = () => {
    if (!documentInput.documentId.trim() || !documentInput.documentImage)
      return;

    const newDocument = {
      ...documentInput,
      uploadedAt: new Date().toISOString(),
    };

    updateSupplierData({
      documents: [...(supplierData.documents || []), newDocument],
    });

    setDocumentInput({
      documentId: "",
      documentImage: null,
      description: "",
    });

    alert("Document has been uploaded successfully!");
  };

  const removeDocument = (index) => {
    const updatedDocuments = [...(supplierData.documents || [])];
    updatedDocuments.splice(index, 1);
    updateSupplierData({ documents: updatedDocuments });
  };

  const handlePreview = () => {
    if (!supplierData.products || supplierData.products.length === 0) {
      alert("Please add at least one product before submitting.");
      return;
    }
    setShowConfirmation(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);

    try {
      const businessData = {
        businessType: supplierData.businessType || [],
        yearsInBusiness: Number(supplierData.yearsInBusiness) || 0,
        products: supplierData.products || [],
        warehouses: supplierData.warehouses || [],
        shippingMethods: supplierData.shippingMethods || [],
        deliveryAreas: supplierData.deliveryAreas || [],
        paymentTerms: supplierData.paymentTerms || [],
        preferredCurrency: "IDR",
        documents: supplierData.documents || [],
      };

      const response = await axios.patch(
        `https://supplier-mangement-backend.onrender.com/api/suppliers/${id}/business`,
        businessData
      );

      navigate("/success");
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      alert("Error saving business details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showConfirmation) {
    return (
      <ConfirmationPanel
        supplierData={supplierData}
        onEdit={() => setShowConfirmation(false)}
        onConfirm={handleFinalSubmit}
        isSubmitting={isSubmitting}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6 pb-32">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Building2 className="text-purple-600" size={40} />
                Supplier Application Form
              </h1>
              <p className="text-gray-600 mt-2">
                {!hasSelectedProducts
                  ? "⚠️ First, select the products you can supply from our catalog"
                  : "✅ Products selected! Complete the remaining information"}
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <ArrowLeft size={20} />
              Back
            </button>
          </div>
        </div>

        {/* IMPORTANT NOTICE - Product Selection Required */}
        {!hasSelectedProducts && (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-start gap-4">
              <AlertCircle
                className="text-yellow-600 flex-shrink-0"
                size={32}
              />
              <div>
                <h2 className="text-2xl font-bold text-yellow-900 mb-3">
                  ⚠️ IMPORTANT: Product Selection Required
                </h2>
                <p className="text-lg text-yellow-800 mb-4">
                  <strong>
                    This form is ONLY for suppliers who have the products we
                    need.
                  </strong>
                </p>
                <p className="text-yellow-800 mb-4">
                  Before filling any other information, you MUST:
                </p>
                <ul className="list-disc list-inside space-y-2 text-yellow-800 mb-4">
                  <li>Select the category of products you supply</li>
                  <li>Choose the specific products from our catalog</li>
                  <li>
                    Provide details for each product (brand, size, price, etc.)
                  </li>
                </ul>
                <p className="text-yellow-900 font-bold text-lg">
                  👇 If you DON'T have these products, please DO NOT fill this
                  form.
                </p>
              </div>
            </div>
          </div>
        )}

        <form className="space-y-8">
          {/* PRODUCT SELECTION - MANDATORY FIRST STEP */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-xl p-8 border-4 border-green-500">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Package className="text-green-600" size={32} />
                STEP 1: Select Your Products (REQUIRED)
              </h2>
              <p className="text-lg text-gray-700 font-semibold">
                📋 Please select the products you can supply from our catalog
                below:
              </p>
            </div>

            {/* Step 1: Category Selection */}
            <div className="mb-8">
              <label className="block text-lg font-bold text-gray-800 mb-4">
                1️⃣ Select Product Category *
              </label>
              <div className="grid grid-cols-1 gap-4">
                {Object.keys(PRODUCT_CATALOG).map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategorySelect(category)}
                    className={`p-6 border-4 rounded-xl text-left transition-all duration-200 flex items-center justify-between ${
                      selectedCategory === category
                        ? "border-green-600 bg-green-100 shadow-lg"
                        : "border-gray-300 hover:border-green-400 bg-white"
                    }`}
                  >
                    <span className="text-xl font-bold text-gray-800">
                      {category}
                    </span>
                    {selectedCategory === category && (
                      <CheckCircle className="text-green-600" size={32} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Subcategory Selection */}
            {selectedCategory && (
              <div className="mb-8 animate-fade-in">
                <label className="block text-lg font-bold text-gray-800 mb-4">
                  2️⃣ Select Product Type *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(PRODUCT_CATALOG[selectedCategory]).map(
                    (subcategory) => (
                      <button
                        key={subcategory}
                        type="button"
                        onClick={() => handleSubcategorySelect(subcategory)}
                        className={`p-6 border-4 rounded-xl text-left transition-all duration-200 flex items-center justify-between ${
                          selectedSubcategory === subcategory
                            ? "border-green-600 bg-green-100 shadow-lg"
                            : "border-gray-300 hover:border-green-400 bg-white"
                        }`}
                      >
                        <span className="text-xl font-bold text-gray-800">
                          {subcategory}
                        </span>
                        {selectedSubcategory === subcategory && (
                          <CheckCircle className="text-green-600" size={32} />
                        )}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Product Selection */}
            {selectedSubcategory && (
              <div className="mb-8 animate-fade-in">
                <label className="block text-lg font-bold text-gray-800 mb-4">
                  3️⃣ Select Products You Supply (You can select multiple) *
                </label>
                <div className="space-y-4">
                  {PRODUCT_CATALOG[selectedCategory][selectedSubcategory].map(
                    (product) => (
                      <div
                        key={product.id}
                        className={`border-4 rounded-xl p-6 transition-all duration-200 ${
                          selectedProducts.some((p) => p.id === product.id)
                            ? "border-green-600 bg-green-50 shadow-lg"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center mb-4">
                          <input
                            type="checkbox"
                            checked={selectedProducts.some(
                              (p) => p.id === product.id
                            )}
                            onChange={() => handleProductToggle(product)}
                            className="mr-4 h-6 w-6 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <span className="font-bold text-gray-800 text-xl">
                            {product.name}
                          </span>
                        </div>

                        {/* Product Details Form */}
                        {selectedProducts.some((p) => p.id === product.id) && (
                          <div className="ml-10 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-fade-in bg-white p-4 rounded-lg">
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1">
                                Brand Name *
                              </label>
                              <input
                                type="text"
                                placeholder="Enter brand name"
                                value={
                                  productDetails[product.id]?.brandName || ""
                                }
                                onChange={(e) =>
                                  handleProductDetailChange(
                                    product.id,
                                    "brandName",
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-medium"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1">
                                Size/Package *
                              </label>
                              <select
                                value={
                                  productDetails[product.id]?.selectedSize ||
                                  product.sizes[0]
                                }
                                onChange={(e) =>
                                  handleProductDetailChange(
                                    product.id,
                                    "selectedSize",
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-medium"
                              >
                                {product.sizes.map((size) => (
                                  <option key={size} value={size}>
                                    {size}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1">
                                Minimum Order Quantity *
                              </label>
                              <input
                                type="number"
                                placeholder="e.g., 100"
                                value={
                                  productDetails[product.id]
                                    ?.minOrderQuantity || ""
                                }
                                onChange={(e) =>
                                  handleProductDetailChange(
                                    product.id,
                                    "minOrderQuantity",
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-medium"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1">
                                Price & Unit *
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  placeholder="Price"
                                  value={
                                    productDetails[product.id]?.price || ""
                                  }
                                  onChange={(e) =>
                                    handleProductDetailChange(
                                      product.id,
                                      "price",
                                      e.target.value
                                    )
                                  }
                                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-medium"
                                  required
                                />
                                <select
                                  value={
                                    productDetails[product.id]?.unit || "piece"
                                  }
                                  onChange={(e) =>
                                    handleProductDetailChange(
                                      product.id,
                                      "unit",
                                      e.target.value
                                    )
                                  }
                                  className="px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-medium"
                                >
                                  <option value="piece">Piece</option>
                                  <option value="kg">Kg</option>
                                  <option value="liter">Liter</option>
                                  <option value="box">Box</option>
                                  <option value="pack">Pack</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1">
                                Available Stock/Quantity *
                              </label>
                              <input
                                type="text"
                                placeholder="e.g., 5000 units"
                                value={
                                  productDetails[product.id]
                                    ?.availableQuantity || ""
                                }
                                onChange={(e) =>
                                  handleProductDetailChange(
                                    product.id,
                                    "availableQuantity",
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-medium"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1">
                                Lead Time (Delivery Time)
                              </label>
                              <input
                                type="text"
                                placeholder="e.g., 2-4 weeks"
                                value={
                                  productDetails[product.id]?.leadTime || ""
                                }
                                onChange={(e) =>
                                  handleProductDetailChange(
                                    product.id,
                                    "leadTime",
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-medium"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-sm font-bold text-gray-700 mb-1">
                                Product Description (Optional)
                              </label>
                              <textarea
                                placeholder="Additional details about the product..."
                                value={
                                  productDetails[product.id]?.description || ""
                                }
                                onChange={(e) =>
                                  handleProductDetailChange(
                                    product.id,
                                    "description",
                                    e.target.value
                                  )
                                }
                                rows="2"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-medium"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>

                {selectedProducts.length > 0 && (
                  <button
                    type="button"
                    onClick={addSelectedProducts}
                    className="mt-6 w-full px-8 py-4 bg-green-600 text-white text-xl font-bold rounded-xl hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-3 shadow-lg"
                  >
                    <Plus size={24} />
                    Add Selected Products ({selectedProducts.length}) to
                    Application
                  </button>
                )}
              </div>
            )}

            {/* Added Products Summary */}
            {supplierData.products?.length > 0 && (
              <div className="mt-8 bg-white rounded-xl p-6 border-4 border-green-500">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={24} />✅
                  Products Added ({supplierData.products.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-3 px-4 font-bold text-gray-700">
                          Product
                        </th>
                        <th className="text-left py-3 px-4 font-bold text-gray-700">
                          Brand
                        </th>
                        <th className="text-left py-3 px-4 font-bold text-gray-700">
                          Size
                        </th>
                        <th className="text-left py-3 px-4 font-bold text-gray-700">
                          Price
                        </th>
                        <th className="text-left py-3 px-4 font-bold text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {supplierData.products.map((product, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 font-medium text-gray-800">
                            {product.name}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {product.brandName}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {product.selectedSize}
                          </td>
                          <td className="py-3 px-4 font-semibold text-green-600">
                            {product.price} {product.unit}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() => removeProduct(index)}
                              className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                            >
                              <X size={18} />
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* REST OF THE FORM - Only show if products are selected */}
          {hasSelectedProducts && (
            <>
              {/* Business Information */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Building2 className="text-blue-600" size={24} />
                  Business Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Business Type (Select Multiple)
                    </label>
                    <div className="space-y-2">
                      {[
                        "Manufacturer",
                        "Wholesaler",
                        "Distributor",
                        "Importer",
                        "Other",
                      ].map((type) => (
                        <label key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={
                              supplierData.businessType?.includes(type) || false
                            }
                            onChange={() => handleBusinessTypeChange(type)}
                            className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <span className="text-gray-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Years in Business
                    </label>
                    <input
                      type="number"
                      name="yearsInBusiness"
                      value={supplierData.yearsInBusiness || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter years in business"
                    />
                  </div>
                </div>
              </div>

              {/* Warehouses */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Warehouse className="text-orange-600" size={24} />
                  Warehouse Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <input
                    type="text"
                    name="warehouseName"
                    value={warehouseInput.warehouseName}
                    onChange={handleWarehouseChange}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="Warehouse Name"
                  />
                  <input
                    type="text"
                    name="location"
                    value={warehouseInput.location}
                    onChange={handleWarehouseChange}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="Location"
                  />
                  <input
                    type="number"
                    name="handlingCapacity"
                    value={warehouseInput.handlingCapacity}
                    onChange={handleWarehouseChange}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="Daily handling capacity"
                  />
                </div>

                <button
                  type="button"
                  onClick={addWarehouse}
                  className="mb-6 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors duration-200 flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add Warehouse
                </button>

                {supplierData.warehouses?.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {supplierData.warehouses.map((warehouse, index) => (
                      <div
                        key={index}
                        className="bg-orange-50 p-4 rounded-xl border border-orange-200"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-gray-800">
                            {warehouse.warehouseName}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeWarehouse(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-center p-2 bg-white rounded-lg">
                            <p className="text-gray-500">Location</p>
                            <p className="font-semibold">
                              {warehouse.location}
                            </p>
                          </div>
                          <div className="text-center p-2 bg-white rounded-lg">
                            <p className="text-gray-500">Daily Capacity</p>
                            <p className="font-semibold">
                              {warehouse.handlingCapacity}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Logistics & Payment */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Logistics */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Truck className="text-blue-600" size={24} />
                    Logistics
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Shipping Methods (Select Multiple)
                      </label>
                      <div className="space-y-2">
                        {[
                          "Air Freight",
                          "Sea Freight",
                          "Land Transport",
                          "Express Delivery",
                          "Standard Delivery",
                        ].map((method) => (
                          <label key={method} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={
                                supplierData.shippingMethods?.includes(
                                  method
                                ) || false
                              }
                              onChange={() =>
                                handleCheckboxChange("shippingMethods", method)
                              }
                              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-gray-700">{method}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Delivery Areas (Select Multiple)
                      </label>
                      <div className="space-y-2">
                        {["Seminyak", "Bali"].map((area) => (
                          <label key={area} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={
                                supplierData.deliveryAreas?.includes(area) ||
                                false
                              }
                              onChange={() =>
                                handleCheckboxChange("deliveryAreas", area)
                              }
                              className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <span className="text-gray-700">{area}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Terms */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <DollarSign className="text-green-600" size={24} />
                    Payment Terms
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Payment Terms (Select Multiple)
                      </label>
                      <div className="space-y-2">
                        {[
                          "Net 30",
                          "Net 60",
                          "Advance Payment",
                          "Cash on Delivery",
                          "Other",
                        ].map((term) => (
                          <label key={term} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={
                                supplierData.paymentTerms?.includes(term) ||
                                false
                              }
                              onChange={() =>
                                handleCheckboxChange("paymentTerms", term)
                              }
                              className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <span className="text-gray-700">{term}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Preferred Currency
                      </label>
                      <input
                        type="text"
                        value="IDR"
                        disabled
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Verification */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FileText className="text-red-600" size={24} />
                  ID / Document Verification - No Scam Happens
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <input
                    type="text"
                    name="documentId"
                    value={documentInput.documentId}
                    onChange={handleDocumentChange}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    placeholder="Document ID / Name"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      name="documentImage"
                      onChange={handleDocumentChange}
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 flex items-center gap-2 text-gray-600">
                      <Upload size={20} />
                      {documentInput.documentImage
                        ? "Image Selected"
                        : "Upload Document Image"}
                    </div>
                  </div>
                  <input
                    type="text"
                    name="description"
                    value={documentInput.description}
                    onChange={handleDocumentChange}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    placeholder="Document Description"
                  />
                </div>

                <button
                  type="button"
                  onClick={addDocument}
                  className="mb-6 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add Document
                </button>

                {supplierData.documents?.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {supplierData.documents.map((document, index) => (
                      <div
                        key={index}
                        className="bg-red-50 p-4 rounded-xl border border-red-200"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-gray-800">
                            {document.documentId}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        {document.documentImage && (
                          <img
                            src={document.documentImage}
                            alt="Document"
                            className="w-full h-32 object-cover rounded-lg mb-2"
                          />
                        )}
                        <p className="text-sm text-gray-600">
                          {document.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 flex items-center gap-2"
                  >
                    <ArrowLeft size={20} />
                    Back to Profile
                  </button>

                  <button
                    type="button"
                    onClick={handlePreview}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2"
                  >
                    <Eye size={20} />
                    Preview & Submit
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </>
          )}
        </form>
      </div>

      {/* Fixed Support Box */}
      <div className="fixed top-10 right-2 bg-white rounded-2xl shadow-2xl p-6 max-w-sm border-2 border-purple-200 z-50">
        <div className="flex items-start gap-3">
          <div className="bg-purple-100 p-2 rounded-full">
            <MessageCircle className="text-purple-600" size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-extrabold text-gray-800 mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Reach out to us while you need help filling this form
            </p>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                <Phone size={16} />
                Call +620864322626
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Confirmation Panel Component - keeping same as before
const ConfirmationPanel = ({
  supplierData,
  onEdit,
  onConfirm,
  isSubmitting,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Review Your Application
            </h1>
            <p className="text-gray-600">
              Please review all information before submitting your supplier
              application
            </p>
          </div>

          {/* Company Profile & Business Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Building2 className="text-blue-600" size={20} />
                Company Profile
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-600">Company:</span>
                  <span className="ml-2 text-gray-800">
                    {supplierData.companyName}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Contact:</span>
                  <span className="ml-2 text-gray-800">
                    {supplierData.contactPerson}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Email:</span>
                  <span className="ml-2 text-gray-800">
                    {supplierData.email}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Phone:</span>
                  <span className="ml-2 text-gray-800">
                    {supplierData.phone}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">
                    Business Type:
                  </span>
                  <span className="ml-2 text-gray-800">
                    {supplierData.businessType?.join(", ") || "Not specified"}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">
                    Years in Business:
                  </span>
                  <span className="ml-2 text-gray-800">
                    {supplierData.yearsInBusiness || "Not specified"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Business Summary
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white rounded-lg">
                  <Package className="mx-auto text-green-500 mb-1" size={20} />
                  <p className="text-2xl font-bold text-gray-800">
                    {supplierData.products?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Products</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <Warehouse
                    className="mx-auto text-orange-500 mb-1"
                    size={20}
                  />
                  <p className="text-2xl font-bold text-gray-800">
                    {supplierData.warehouses?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Warehouses</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <FileText className="mx-auto text-red-500 mb-1" size={20} />
                  <p className="text-2xl font-bold text-gray-800">
                    {supplierData.documents?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Documents</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <Truck className="mx-auto text-blue-500 mb-1" size={20} />
                  <p className="text-2xl font-bold text-gray-800">
                    {supplierData.shippingMethods?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Shipping Methods</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Product Information */}
          {supplierData.products?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Package className="text-green-600" size={24} />
                Product Details
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Category
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Subcategory
                      </th>
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
                        <td className="py-3 px-4 text-gray-600">
                          {product.category}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {product.subcategory}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-800">
                            {product.name}
                          </div>
                          {product.description && (
                            <div className="text-sm text-gray-500 mt-1">
                              {product.description}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-800">
                          {product.brandName}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                            {product.selectedSize}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-green-600">
                            {product.price} {product.unit}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {product.minOrderQuantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Rest of confirmation panel remains same... */}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={onEdit}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
            >
              <Edit3 size={20} />
              Edit Details
            </button>

            <button
              onClick={onConfirm}
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Confirm & Submit
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Fixed Support Box */}
      <div className="fixed top-10 right-2 bg-white rounded-2xl shadow-2xl p-6 max-w-sm border-2 border-purple-200 z-50">
        <div className="flex items-start gap-3">
          <div className="bg-purple-100 p-2 rounded-full">
            <MessageCircle className="text-purple-600" size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-extrabold text-gray-800 mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Reach out to us while you need help filling this form
            </p>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                <Phone size={16} />
                Call +620864322626
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsPage;
