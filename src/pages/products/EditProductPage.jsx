import { useEffect, useState } from "react";
import {
  getProductById,
  updateProduct,
} from "../../services/productManagementApi";
import { getAllCategories } from "../../services/categoryManagementApi";
import { getAllSuppliers } from "../../services/supplierManagementApi";
import toast from "react-hot-toast";

function EditProductPage({ productId, onBack }) {
  const id = productId;

  const [formData, setFormData] = useState({
    name: "",
    barcode: "",
    category: "",
    supplier: "",
    brand: "",
    description: "",
    price: "",
    costPrice: "",
    reorderLevel: "",
    unit: "",
  });

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [currentImage, setCurrentImage] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const fetchProductAndDropdownData = async () => {
    if (!id) {
      setMessage("Product ID not found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const productResponse = await getProductById(id);
      const categoryResponse = await getAllCategories();
      const supplierResponse = await getAllSuppliers();

      const product = productResponse.data.product;

      setCategories(categoryResponse.data.categories || []);
      setSuppliers(categoryResponse ? supplierResponse.data.data || [] : []);

      setFormData({
        name: product.name || "",
        barcode: product.barcode || "",
        category: product.category?._id || product.category || "",
        supplier: product.supplier?._id || product.supplier || "",
        brand: product.brand || "",
        description: product.description || "",
        price: product.price ?? "",
        costPrice: product.costPrice ?? "",
        reorderLevel: product.reorderLevel ?? "",
        unit: product.unit || "",
      });

      setCurrentImage(product.image || "");
    } catch (error) {
      setMessage("Failed to load product, categories, or suppliers");
      toast.error("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductAndDropdownData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setMessage("");
  };

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];

    if (!selectedImage) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(selectedImage.type)) {
      setNewImage(null);
      setPreviewImage("");

      setErrors((prev) => ({
        ...prev,
        image: "Only JPG, PNG, and WEBP images are allowed",
      }));

      toast.error("Only JPG, PNG, and WEBP images are allowed");
      return;
    }

    if (selectedImage.size > maxSize) {
      setNewImage(null);
      setPreviewImage("");

      setErrors((prev) => ({
        ...prev,
        image: "Image size must be less than 2MB",
      }));

      toast.error("Image size must be less than 2MB");
      return;
    }

    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }

    setNewImage(selectedImage);
    setPreviewImage(URL.createObjectURL(selectedImage));

    setErrors((prev) => ({
      ...prev,
      image: "",
    }));

    setMessage("");
  };

  const validateForm = () => {
    const newErrors = {};

    const nameRegex = /^[a-zA-Z0-9\s\-&().]+$/;
    const barcodeRegex = /^[0-9]{8,14}$/;

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Product name must be at least 2 characters";
    } else if (formData.name.trim().length > 80) {
      newErrors.name = "Product name cannot exceed 80 characters";
    } else if (!nameRegex.test(formData.name.trim())) {
      newErrors.name = "Product name contains invalid characters";
    }

    if (formData.barcode.trim() && !barcodeRegex.test(formData.barcode.trim())) {
      newErrors.barcode = "Barcode must contain only 8 to 14 digits";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.unit.trim()) {
      newErrors.unit = "Unit is required";
    } else if (formData.unit.trim().length > 20) {
      newErrors.unit = "Unit cannot exceed 20 characters";
    }

    if (!formData.price && formData.price !== 0) {
      newErrors.price = "Selling price is required";
    } else if (Number(formData.price) <= 0) {
      newErrors.price = "Selling price must be greater than 0";
    }

    if (formData.costPrice !== "" && Number(formData.costPrice) < 0) {
      newErrors.costPrice = "Cost price cannot be negative";
    }

    if (
      formData.costPrice !== "" &&
      formData.price !== "" &&
      Number(formData.costPrice) > Number(formData.price)
    ) {
      newErrors.costPrice = "Cost price cannot be greater than selling price";
    }

    if (formData.reorderLevel !== "" && Number(formData.reorderLevel) < 0) {
      newErrors.reorderLevel = "Reorder level cannot be negative";
    }

    if (
      formData.reorderLevel !== "" &&
      !Number.isInteger(Number(formData.reorderLevel))
    ) {
      newErrors.reorderLevel = "Reorder level must be a whole number";
    }

    if (formData.brand.trim().length > 50) {
      newErrors.brand = "Brand cannot exceed 50 characters";
    }

    if (formData.description.trim().length > 500) {
      newErrors.description = "Description cannot exceed 500 characters";
    }

    if (newImage) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      const maxSize = 2 * 1024 * 1024;

      if (!allowedTypes.includes(newImage.type)) {
        newErrors.image = "Only JPG, PNG, and WEBP images are allowed";
      } else if (newImage.size > maxSize) {
        newErrors.image = "Image size must be less than 2MB";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!id) {
      setMessage("Product ID not found");
      return;
    }

    const isValid = validateForm();

    if (!isValid) {
      toast.error("Please fix the validation errors");
      setMessage("Please fix the validation errors before updating");
      return;
    }

    try {
      setUpdating(true);
      setMessage("");

      const productFormData = new FormData();

      productFormData.append("name", formData.name.trim());
      productFormData.append("barcode", formData.barcode.trim());
      productFormData.append("brand", formData.brand.trim());
      productFormData.append("description", formData.description.trim());
      productFormData.append("price", formData.price);
      productFormData.append("costPrice", formData.costPrice);
      productFormData.append("reorderLevel", formData.reorderLevel);
      productFormData.append("unit", formData.unit.trim());

      if (formData.category) {
        productFormData.append("category", formData.category);
      }

      if (formData.supplier) {
        productFormData.append("supplier", formData.supplier);
      }

      if (newImage) {
        productFormData.append("image", newImage);
      }

      await updateProduct(id, productFormData);

      toast.success("Product updated successfully");
      setMessage("Product updated successfully");

      setTimeout(() => {
        onBack();
      }, 800);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update product";
      toast.error(errorMessage);
      setMessage(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-slate-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-red-600">Product ID not found.</p>

          <button
            type="button"
            onClick={onBack}
            className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Edit Product
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Update product details, category, supplier, barcode, price, and
              image.
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            disabled={updating}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Back to Products
          </button>
        </div>

        {message && (
          <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            {message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 rounded-2xl bg-white p-6 shadow-sm lg:grid-cols-3"
        >
          <div className="lg:col-span-2">
            <h2 className="mb-5 text-lg font-semibold text-slate-800">
              Product Information
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  maxLength={80}
                  placeholder="Example: Coca Cola"
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 ${
                    errors.name
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Barcode
                </label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  maxLength={14}
                  inputMode="numeric"
                  placeholder="Example: 123456789111"
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 ${
                    errors.barcode
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Optional. Barcode should be 8 to 14 digits.
                </p>
                {errors.barcode && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {errors.barcode}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 ${
                    errors.category
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {errors.category}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Supplier
                </label>
                <select
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 ${
                    errors.supplier
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                >
                  <option value="">Select supplier</option>
                  {suppliers
                    .filter((supplier) => supplier.status === "Active")
                    .map((supplier) => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.companyName}
                      </option>
                    ))}
                </select>
                {errors.supplier && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {errors.supplier}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  maxLength={50}
                  placeholder="Example: Coca Cola"
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 ${
                    errors.brand
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                />
                {errors.brand && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {errors.brand}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Unit *
                </label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  maxLength={20}
                  placeholder="Example: bottle, packet, kg, pcs"
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 ${
                    errors.unit
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                />
                {errors.unit && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {errors.unit}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Selling Price *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="Example: 250"
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 ${
                    errors.price
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                />
                {errors.price && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {errors.price}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Cost Price
                </label>
                <input
                  type="number"
                  name="costPrice"
                  value={formData.costPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="Example: 180"
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 ${
                    errors.costPrice
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                />
                {errors.costPrice && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {errors.costPrice}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Reorder Level
                </label>
                <input
                  type="number"
                  name="reorderLevel"
                  value={formData.reorderLevel}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  placeholder="Example: 20"
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 ${
                    errors.reorderLevel
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                />
                {errors.reorderLevel && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {errors.reorderLevel}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  maxLength={500}
                  placeholder="Enter product description"
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 ${
                    errors.description
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                />

                <div className="mt-1 flex items-center justify-between">
                  {errors.description ? (
                    <p className="text-xs font-medium text-red-600">
                      {errors.description}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Maximum 500 characters.
                    </p>
                  )}

                  <p className="text-xs text-slate-400">
                    {formData.description.length}/500
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-5 text-lg font-semibold text-slate-800">
              Product Image
            </h2>

            <div
              className={`rounded-xl border border-dashed p-5 ${
                errors.image
                  ? "border-red-300 bg-red-50/40"
                  : "border-blue-300 bg-blue-50/40"
              }`}
            >
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="New preview"
                  className="mb-4 h-56 w-full rounded-xl object-cover"
                />
              ) : currentImage ? (
                <img
                  src={currentImage}
                  alt="Current product"
                  className="mb-4 h-56 w-full rounded-xl object-cover"
                />
              ) : (
                <div className="mb-4 flex h-56 w-full items-center justify-center rounded-xl bg-white text-sm text-slate-400">
                  No image available
                </div>
              )}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600"
              />

              <p className="mt-3 text-xs text-slate-500">
                Select a new JPG, PNG, or WEBP image only if you want to replace
                the current image. Maximum size: 2MB.
              </p>

              {errors.image && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  {errors.image}
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="submit"
                disabled={updating}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {updating ? "Updating..." : "Update Product"}
              </button>

              <button
                type="button"
                onClick={onBack}
                disabled={updating}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Back to Products
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProductPage;