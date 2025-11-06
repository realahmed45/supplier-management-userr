import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Plus,
  X,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Phone,
  MessageCircle,
  ShoppingCart,
} from "lucide-react";

// Product catalog with categories and subcategories
const PRODUCT_CATALOG = {
  "Construction Material": {
    Cement: [
      {
        id: "cement-1",
        name: "Portland Cement Type I",
        sizes: ["25kg", "40kg", "50kg"],
        brands: ["ACC", "UltraTech", "Ambuja", "Shree", "Other"],
      },
      {
        id: "cement-2",
        name: "Portland Cement Type II",
        sizes: ["25kg", "40kg", "50kg"],
        brands: ["ACC", "UltraTech", "Ambuja", "Shree", "Other"],
      },
      {
        id: "cement-3",
        name: "White Cement",
        sizes: ["25kg", "40kg", "50kg"],
        brands: ["Birla White", "JK White", "Ultratech White", "Other"],
      },
      {
        id: "cement-4",
        name: "Rapid Hardening Cement",
        sizes: ["25kg", "40kg", "50kg"],
        brands: ["ACC", "UltraTech", "Ambuja", "Other"],
      },
      {
        id: "cement-5",
        name: "Sulphate Resistant Cement",
        sizes: ["25kg", "40kg", "50kg"],
        brands: ["ACC", "UltraTech", "Ambuja", "Other"],
      },
    ],
    Bricks: [
      {
        id: "brick-1",
        name: "Red Clay Brick",
        sizes: ["Standard", "Modular", "Queen"],
        brands: ["Wienerberger", "Brickworks", "Local Manufacturer", "Other"],
      },
      {
        id: "brick-2",
        name: "Concrete Brick",
        sizes: ["Standard", "Modular", "Jumbo"],
        brands: ["Supreme", "Magicrete", "Jindal", "Other"],
      },
      {
        id: "brick-3",
        name: "Fly Ash Brick",
        sizes: ["Standard", "Modular"],
        brands: ["Magicrete", "Buildmate", "Supreme", "Other"],
      },
      {
        id: "brick-4",
        name: "Fire Brick",
        sizes: ["Standard", "Split"],
        brands: ["Refractories", "HarbisonWalker", "RHI Magnesita", "Other"],
      },
      {
        id: "brick-5",
        name: "Hollow Brick",
        sizes: ["Standard", "Large"],
        brands: ["Porotherm", "Supreme", "Magicrete", "Other"],
      },
    ],
  },
};

const ProductSelectionPage = ({ supplierData, updateSupplierData }) => {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productDetails, setProductDetails] = useState({});

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
          brandName: product.brands[0],
          customBrandName: "",
          minOrderQuantity: "",
          price: "",
          unit: "piece",
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
      const finalBrandName =
        details.brandName === "Other"
          ? details.customBrandName
          : details.brandName;

      if (!finalBrandName || !details.minOrderQuantity || !details.price) {
        alert(`Please fill all required fields for ${product.name}`);
        return;
      }
    }

    const productsToAdd = selectedProducts.map((product) => {
      const details = productDetails[product.id];
      const finalBrandName =
        details.brandName === "Other"
          ? details.customBrandName
          : details.brandName;

      return {
        category: selectedCategory,
        subcategory: selectedSubcategory,
        name: product.name,
        brandName: finalBrandName,
        minOrderQuantity: Number(details.minOrderQuantity) || 0,
        price: Number(details.price) || 0,
        unit: details.unit,
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
    alert(`${productsToAdd.length} product(s) added successfully!`);
  };

  const removeProduct = (index) => {
    const updatedProducts = [...(supplierData.products || [])];
    updatedProducts.splice(index, 1);
    updateSupplierData({ products: updatedProducts });
  };

  const handleContinue = () => {
    if (!supplierData.products || supplierData.products.length === 0) {
      alert("Please add at least one product before continuing.");
      return;
    }
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 px-2 sm:px-4 lg:px-6 py-4 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4">
          <div className="text-center">
            <div className="flex justify-center items-center gap-3 mb-3">
              <ShoppingCart className="text-purple-600" size={32} />
              <Package className="text-green-600" size={32} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Welcome to Our Supplier Portal
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 font-semibold">
              🎯 Step 1 of 2: Select Products You Supply
            </p>
          </div>
        </div>

        {/* IMPORTANT NOTICE */}
        <div className="bg-yellow-50 border-0 sm:border-4 sm:border-yellow-400 sm:rounded-xl shadow-xl p-3 sm:p-6 mb-2 sm:mb-4 -mx-2 sm:mx-0">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
            <div className="flex-1">
              <h2 className="text-lg sm:text-2xl font-bold text-yellow-900 mb-2 sm:mb-3">
                ⚠️ IMPORTANT: Read Before Proceeding
              </h2>
            </div>
          </div>
        </div>

        {/* First White Section - Edge to Edge on Mobile */}
        <div className="bg-white p-3 sm:p-4 mb-2 sm:mb-3 -mx-2 sm:mx-0 sm:rounded-lg">
          <p className="text-lg sm:text-lg font-bold text-yellow-900 mb-2 sm:mb-2">
            This portal is ONLY for suppliers who can provide the specific
            products listed below.
          </p>
          <p className="text-base sm:text-base text-yellow-800">
            If you DO NOT supply these products, please DO NOT continue with
            this form.
          </p>
        </div>

        {/* Second White Section - Edge to Edge on Mobile */}
        <div className="bg-white p-3 sm:p-4 mb-4 -mx-2 sm:mx-0 sm:rounded-lg">
          <h3 className="text-lg sm:text-lg font-bold text-gray-800 mb-3">
            ✅ What You Must Do:
          </h3>
          <ul className="list-none space-y-2 text-gray-700 text-base sm:text-base">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">1.</span>
              <span>Select the category of products you can supply</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">2.</span>
              <span>Choose the specific products from our catalog</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">3.</span>
              <span>
                Provide complete details for each product (brand, size, price,
                quantity)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">4.</span>
              <span>
                Only AFTER adding products can you continue to the next step
              </span>
            </li>
          </ul>
        </div>

        {/* PRODUCT SELECTION */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-xl p-4 sm:p-6 border-4 border-green-500 mb-4">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Package className="text-green-600" size={28} />
              Select Your Products
            </h2>
            <p className="text-base text-gray-700 font-semibold">
              📋 Choose from our catalog below:
            </p>
          </div>

          {/* Step 1: Category Selection */}
          <div className="mb-6">
            <label className="block text-lg font-bold text-gray-800 mb-3">
              1️⃣ Select Product Category *
            </label>
            <div className="grid grid-cols-1 gap-3">
              {Object.keys(PRODUCT_CATALOG).map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategorySelect(category)}
                  className={`p-4 border-4 rounded-lg text-left transition-all duration-200 flex items-center justify-between ${
                    selectedCategory === category
                      ? "border-green-600 bg-green-100 shadow-lg"
                      : "border-gray-300 hover:border-green-400 bg-white"
                  }`}
                >
                  <span className="text-lg font-bold text-gray-800">
                    {category}
                  </span>
                  {selectedCategory === category && (
                    <CheckCircle className="text-green-600" size={28} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Subcategory Selection */}
          {selectedCategory && (
            <div className="mb-6 animate-fade-in">
              <label className="block text-lg font-bold text-gray-800 mb-3">
                2️⃣ Select Product Type *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.keys(PRODUCT_CATALOG[selectedCategory]).map(
                  (subcategory) => (
                    <button
                      key={subcategory}
                      type="button"
                      onClick={() => handleSubcategorySelect(subcategory)}
                      className={`p-4 border-4 rounded-lg text-left transition-all duration-200 flex items-center justify-between ${
                        selectedSubcategory === subcategory
                          ? "border-green-600 bg-green-100 shadow-lg"
                          : "border-gray-300 hover:border-green-400 bg-white"
                      }`}
                    >
                      <span className="text-lg font-bold text-gray-800">
                        {subcategory}
                      </span>
                      {selectedSubcategory === subcategory && (
                        <CheckCircle className="text-green-600" size={28} />
                      )}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Step 3: Product Selection */}
          {selectedSubcategory && (
            <div className="mb-6 animate-fade-in">
              <label className="block text-lg font-bold text-gray-800 mb-3">
                3️⃣ Select Products (You can select multiple) *
              </label>
              <div className="space-y-3">
                {PRODUCT_CATALOG[selectedCategory][selectedSubcategory].map(
                  (product) => (
                    <div
                      key={product.id}
                      className={`border-4 rounded-lg p-4 transition-all duration-200 ${
                        selectedProducts.some((p) => p.id === product.id)
                          ? "border-green-600 bg-green-50 shadow-lg"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center mb-3">
                        <input
                          type="checkbox"
                          checked={selectedProducts.some(
                            (p) => p.id === product.id
                          )}
                          onChange={() => handleProductToggle(product)}
                          className="mr-3 h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="font-bold text-gray-800 text-lg">
                          {product.name}
                        </span>
                      </div>

                      {/* Product Details Form */}
                      {selectedProducts.some((p) => p.id === product.id) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 animate-fade-in bg-white p-3 sm:p-4 border-2 border-green-200 -mx-4 sm:mx-8 sm:rounded-lg">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                              Brand Name *
                            </label>
                            <select
                              value={
                                productDetails[product.id]?.brandName ||
                                product.brands[0]
                              }
                              onChange={(e) =>
                                handleProductDetailChange(
                                  product.id,
                                  "brandName",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-medium"
                              required
                            >
                              {product.brands.map((brand) => (
                                <option key={brand} value={brand}>
                                  {brand}
                                </option>
                              ))}
                            </select>
                          </div>

                          {productDetails[product.id]?.brandName ===
                            "Other" && (
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1">
                                Custom Brand Name *
                              </label>
                              <input
                                type="text"
                                placeholder="Enter brand name"
                                value={
                                  productDetails[product.id]?.customBrandName ||
                                  ""
                                }
                                onChange={(e) =>
                                  handleProductDetailChange(
                                    product.id,
                                    "customBrandName",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-medium"
                                required
                              />
                            </div>
                          )}

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
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-medium"
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
                                productDetails[product.id]?.minOrderQuantity ||
                                ""
                              }
                              onChange={(e) =>
                                handleProductDetailChange(
                                  product.id,
                                  "minOrderQuantity",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-medium"
                              required
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                              Price & Unit *
                            </label>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <div className="flex-1">
                                <input
                                  type="number"
                                  placeholder="Enter price"
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
                                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-medium"
                                  required
                                />
                              </div>
                              <div className="sm:w-32">
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
                                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-medium"
                                >
                                  <option value="piece">Piece</option>
                                  <option value="kg">Kg</option>
                                  <option value="liter">Liter</option>
                                  <option value="box">Box</option>
                                  <option value="pack">Pack</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                              ( Delivery time ) days
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., 2-4 days"
                              value={productDetails[product.id]?.leadTime || ""}
                              onChange={(e) =>
                                handleProductDetailChange(
                                  product.id,
                                  "leadTime",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-medium"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                              Addional notes if needed ( optional )
                            </label>
                            <textarea
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
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-medium"
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
                  className="mt-4 w-full px-6 py-3 bg-green-600 text-white text-lg font-bold rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg"
                >
                  <Plus size={20} />
                  Add Selected Products ({selectedProducts.length}) to
                  Application
                </button>
              )}
            </div>
          )}

          {/* Added Products Summary */}
          {supplierData.products?.length > 0 && (
            <div className="mt-6 bg-white rounded-lg p-4 border-4 border-green-500">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <CheckCircle className="text-green-600" size={20} />✅ Products
                Added ({supplierData.products.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-2 px-3 font-bold text-gray-700 text-sm">
                        Product
                      </th>
                      <th className="text-left py-2 px-3 font-bold text-gray-700 text-sm">
                        Brand
                      </th>
                      <th className="text-left py-2 px-3 font-bold text-gray-700 text-sm">
                        Size
                      </th>
                      <th className="text-left py-2 px-3 font-bold text-gray-700 text-sm">
                        Price
                      </th>
                      <th className="text-left py-2 px-3 font-bold text-gray-700 text-sm">
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
                        <td className="py-2 px-3 font-medium text-gray-800 text-sm">
                          {product.name}
                        </td>
                        <td className="py-2 px-3 text-gray-600 text-sm">
                          {product.brandName}
                        </td>
                        <td className="py-2 px-3 text-gray-600 text-sm">
                          {product.selectedSize}
                        </td>
                        <td className="py-2 px-3 font-semibold text-green-600 text-sm">
                          {product.price} {product.unit}
                        </td>
                        <td className="py-2 px-3">
                          <button
                            type="button"
                            onClick={() => removeProduct(index)}
                            className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1 text-sm"
                          >
                            <X size={16} />
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

        {/* Continue Button - Only shows if products are added */}
        {supplierData.products?.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                🎉 Great! You've added {supplierData.products.length} product(s)
              </h3>
              <p className="text-base text-gray-600">
                Click below to continue with your company information
              </p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleContinue}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                Continue to Company Information
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Support Box - Much Smaller */}
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
    </div>
  );
};

export default ProductSelectionPage;
