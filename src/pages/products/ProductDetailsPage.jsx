import { useEffect, useState } from "react";
import { getProductById } from "../../services/productManagementApi";

function ProductDetailsPage({ productId, onBack, onEdit }) {
  const id = productId;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchProductDetails = async () => {
    if (!id) {
      setMessage("Product ID not found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await getProductById(id);
      setProduct(response.data.product);
    } catch (error) {
      setMessage("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-slate-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (message || !product) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-red-600">{message || "Product not found"}</p>

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
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Product Details
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              View complete product information, category, supplier, pricing,
              barcode, and status.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onEdit(product._id)}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Edit Product
            </button>

            <button
              type="button"
              onClick={onBack}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-80 w-full rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-80 w-full items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                No Image Available
              </div>
            )}

            <div className="mt-5">
              {product.isActive ? (
                <span className="rounded-full bg-green-50 px-4 py-1.5 text-sm font-semibold text-green-700">
                  Active Product
                </span>
              ) : (
                <span className="rounded-full bg-red-50 px-4 py-1.5 text-sm font-semibold text-red-700">
                  Inactive Product
                </span>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-900">
              {product.name}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {product.description || "No description provided."}
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-semibold uppercase text-blue-700">
                  Selling Price
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  Rs. {product.price || 0}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Cost Price
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  Rs. {product.costPrice || 0}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Barcode
                </p>
                <p className="mt-1 break-all text-base font-semibold text-slate-900">
                  {product.barcode || "N/A"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Brand
                </p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  {product.brand || "N/A"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Category
                </p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  {product.category?.name || "N/A"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Supplier
                </p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  {product.supplier?.companyName || "N/A"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Unit
                </p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  {product.unit || "N/A"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Reorder Level
                </p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  {product.reorderLevel || 0}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-semibold uppercase text-blue-700">
                Supplier Information
              </p>

              {product.supplier ? (
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">Company:</span>{" "}
                    {product.supplier.companyName || "N/A"}
                  </p>

                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">Contact Person:</span>{" "}
                    {product.supplier.contactPerson || "N/A"}
                  </p>

                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">Phone:</span>{" "}
                    {product.supplier.phone || "N/A"}
                  </p>

                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">Email:</span>{" "}
                    {product.supplier.email || "N/A"}
                  </p>

                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">Status:</span>{" "}
                    {product.supplier.status || "N/A"}
                  </p>

                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">Rating:</span>{" "}
                    {product.supplier.rating || "N/A"}
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  No supplier assigned to this product.
                </p>
              )}
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Product ID
              </p>
              <p className="mt-1 break-all text-sm text-slate-700">
                {product._id}
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Created At
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {product.createdAt
                    ? new Date(product.createdAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Last Updated
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {product.updatedAt
                    ? new Date(product.updatedAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsPage;