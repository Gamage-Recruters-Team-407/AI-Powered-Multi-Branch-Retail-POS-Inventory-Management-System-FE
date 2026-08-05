import { useEffect, useMemo, useState } from "react";
import {
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../../services/categoryManagementApi";

const baseControlClass =
  "cm-control w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition";

const getControlClass = (hasError) =>
  `${baseControlClass} ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
  }`;

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

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  const totalCategories = categories.length;
  const totalPages = Math.max(1, Math.ceil(totalCategories / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex =
    totalCategories === 0 ? 0 : (currentPage - 1) * itemsPerPage;

  const endIndex = Math.min(startIndex + itemsPerPage, totalCategories);

  const paginatedCategories = categories.slice(startIndex, endIndex);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = [1];
    const leftPage = Math.max(2, currentPage - 1);
    const rightPage = Math.min(totalPages - 1, currentPage + 1);

    if (leftPage > 2) {
      pages.push("left-ellipsis");
    }

    for (let page = leftPage; page <= rightPage; page += 1) {
      pages.push(page);
    }

    if (rightPage < totalPages - 1) {
      pages.push("right-ellipsis");
    }

    pages.push(totalPages);

    return pages;
  }, [currentPage, totalPages]);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

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

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
    });

    setEditingCategoryId(null);
    setErrors({});
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
        resetForm();
        setMessage("Category updated successfully");
      } else {
        await addCategory(categoryPayload);
        resetForm();
        setCurrentPage(1);
        setMessage("Category added successfully");
      }

      await fetchCategories();
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
      setMessage("");

      await deleteCategory(id);

      if (editingCategoryId === id) {
        resetForm();
      }

      setMessage("Category deleted successfully");
      await fetchCategories();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to delete category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="category-management-page min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <style>
        {`
          .category-management-page .cm-control {
            color: #0f172a !important;
            background-color: #ffffff !important;
            -webkit-text-fill-color: #0f172a !important;
          }

          .category-management-page textarea.cm-control {
            color: #0f172a !important;
            background-color: #ffffff !important;
            -webkit-text-fill-color: #0f172a !important;
          }

          .category-management-page .cm-control::placeholder {
            color: #94a3b8 !important;
            opacity: 1 !important;
            -webkit-text-fill-color: #94a3b8 !important;
          }

          .category-management-page .cm-control option {
            color: #0f172a !important;
            background-color: #ffffff !important;
            -webkit-text-fill-color: #0f172a !important;
          }

          .category-management-page .cm-control:-webkit-autofill,
          .category-management-page .cm-control:-webkit-autofill:hover,
          .category-management-page .cm-control:-webkit-autofill:focus {
            -webkit-text-fill-color: #0f172a !important;
            box-shadow: 0 0 0px 1000px #ffffff inset !important;
          }
        `}
      </style>

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
                className={getControlClass(errors.name)}
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
                className={getControlClass(errors.description)}
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

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm lg:col-span-2">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-6 py-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Category List
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Showing {totalCategories === 0 ? 0 : startIndex + 1} to{" "}
                  {endIndex} of {totalCategories} category(s)
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-slate-700">
                  Rows:
                </label>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="cm-control rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
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
              <>
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
                      {paginatedCategories.map((category) => (
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

                <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 px-6 py-4 md:flex-row">
                  <p className="text-sm text-slate-500">
                    Page {currentPage} of {totalPages}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => goToPage(1)}
                      disabled={currentPage === 1}
                      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      First
                    </button>

                    <button
                      type="button"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>

                    {pageNumbers.map((page) =>
                      typeof page === "string" ? (
                        <span
                          key={page}
                          className="px-2 py-2 text-sm font-semibold text-slate-400"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          type="button"
                          onClick={() => goToPage(page)}
                          className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                            currentPage === page
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}

                    <button
                      type="button"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>

                    <button
                      type="button"
                      onClick={() => goToPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Last
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryManagementPage;