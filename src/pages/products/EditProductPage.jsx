import { useEffect, useState } from "react";
import {
  getProductById,
  updateProduct,
} from "../../services/productManagementApi";
import { getAllCategories } from "../../services/categoryManagementApi";
import { getAllSuppliers } from "../../services/supplierManagementApi";

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
      setSuppliers(supplierResponse.data.data || []);

      setFormData({
        name: product.name || "",
        barcode: product.barcode || "",
        category: product.category?._id || product.category || "",
        supplier: product.supplier?._id || product.supplier || "",
        brand: product.brand || "",
        description: product.description || "",
        price: product.price || "",
        costPrice: product.costPrice || "",
        reorderLevel: product.reorderLevel || "",
        unit: product.unit || "",
      });

      setCurrentImage(product.image || "");
    } catch (error) {
      setMessage("Failed to load product, categories, or suppliers");
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
  };

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];

    if (selectedImage) {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }

      setNewImage(selectedImage);
      setPreviewImage(URL.createObjectURL(selectedImage));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!id) {
      setMessage("Product ID not found");
      return;
    }

    if (!formData.name.trim() || !formData.price) {
      setMessage("Product name and price are required");
      return;
    }

    try {
      setUpdating(true);
      setMessage("");

      const productFormData = new FormData();

      productFormData.append("name", formData.name);
      productFormData.append("barcode", formData.barcode);
      productFormData.append("brand", formData.brand);
      productFormData.append("description", formData.description);
      productFormData.append("price", formData.price);
      productFormData.append("costPrice", formData.costPrice);
      productFormData.append("reorderLevel", formData.reorderLevel);
      productFormData.append("unit", formData.unit);

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

      setMessage("Product updated successfully");

      setTimeout(() => {
        onBack();
      }, 800);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update product");
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
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
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
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
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
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Supplier
                </label>
                <select
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Unit
                </label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
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
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
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
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
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
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
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
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-5 text-lg font-semibold text-slate-800">
              Product Image
            </h2>

            <div className="rounded-xl border border-dashed border-blue-300 bg-blue-50/40 p-5">
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
                accept="image/*"
                onChange={handleImageChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600"
              />

              <p className="mt-3 text-xs text-slate-500">
                Select a new image only if you want to replace the current
                image.
              </p>
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
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
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