import { useEffect, useState } from "react";
import {
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../../services/categoryManagementApi";

function CategoryManagementPage({ onBack }) {
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getAllCategories();
      setCategories(response.data.categories || []);
    } catch (error) {
      setMessage("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: "",
    });

    setMessage("");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
    });

    setEditingCategoryId(null);
    setErrors({});
    setMessage("");
  };

  const validateForm = () => {
    const newErrors = {};
    const categoryNameRegex = /^[a-zA-Z0-9\s\-&()]+$/;

    const trimmedName = formData.name.trim();
    const trimmedDescription = formData.description.trim();

    if (!trimmedName) {
      newErrors.name = "Category name is required";
    } else if (trimmedName.length < 2) {
      newErrors.name = "Category name must be at least 2 characters";
    } else if (trimmedName.length > 50) {
      newErrors.name = "Category name cannot exceed 50 characters";
    } else if (!categoryNameRegex.test(trimmedName)) {
      newErrors.name =
        "Category name can only contain letters, numbers, spaces, -, &, and ()";
    }

    const duplicateCategory = categories.find(
      (category) =>
        category.name.toLowerCase().trim() === trimmedName.toLowerCase() &&
        category._id !== editingCategoryId
    );

    if (duplicateCategory) {
      newErrors.name = "Category name already exists";
    }

    if (trimmedDescription.length > 300) {
      newErrors.description = "Description cannot exceed 300 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      setMessage("Please fix the validation errors before saving");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const categoryPayload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
      };

      if (editingCategoryId) {
        await updateCategory(editingCategoryId, categoryPayload);
        setMessage("Category updated successfully");
      } else {
        await addCategory(categoryPayload);
        setMessage("Category added successfully");
      }

      resetForm();
      fetchCategories();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategoryId(category._id);

    setFormData({
      name: category.name || "",
      description: category.description || "",
    });

    setErrors({});
    setMessage("");
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmDelete) return;

    try {
      setSaving(true);
      await deleteCategory(id);
      setMessage("Category deleted successfully");

      if (editingCategoryId === id) {
        resetForm();
      }

      fetchCategories();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to delete category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Category Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Create and manage product categories for the product catalog.
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            disabled={saving}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Back to Products
          </button>
        </div>

        {message && (
          <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-1"
          >
            <h2 className="mb-5 text-lg font-semibold text-slate-800">
              {editingCategoryId ? "Edit Category" : "Add Category"}
            </h2>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Category Name *
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Example: Beverages"
                maxLength={50}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 ${
                  errors.name
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                }`}
              />

              {errors.name ? (
                <p className="mt-1 text-xs font-medium text-red-600">
                  {errors.name}
                </p>
              ) : (
                <p className="mt-1 text-xs text-slate-500">
                  Use a clear category name. Example: Beverages, Dairy Products.
                </p>
              )}
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Example: Soft drinks, juices, and water"
                maxLength={300}
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
                    Optional. Maximum 300 characters.
                  </p>
                )}

                <p className="text-xs text-slate-400">
                  {formData.description.length}/300
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {saving
                  ? "Saving..."
                  : editingCategoryId
                    ? "Update Category"
                    : "Save Category"}
              </button>

              {editingCategoryId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          <div className="rounded-2xl bg-white shadow-sm lg:col-span-2">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-800">
                Category List
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Showing {categories.length} category(s)
              </p>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-500">
                Loading categories...
              </div>
            ) : categories.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No categories found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                        Category Name
                      </th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                        Description
                      </th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {categories.map((category) => (
                      <tr key={category._id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">
                            {category.name}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {category.description || "N/A"}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(category)}
                              disabled={saving}
                              className="rounded-md border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(category._id)}
                              disabled={saving}
                              className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryManagementPage;