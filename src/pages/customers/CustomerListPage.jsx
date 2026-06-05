import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCustomers } from "../../context/CustomerContext";
import CustomerViewModal from "./CustomerViewModal";

function CustomerListPage() {
  const {
    customers,
    loading,
    fetchCustomers,
    removeCustomer,
    searchCustomer,
    setSelectedCustomer,
    selectedCustomer,
  } = useCustomers();

  const [keyword, setKeyword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!keyword) return fetchCustomers();
    await searchCustomer(keyword);
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this customer?");
    if (!ok) return;

    try {
      await removeCustomer(id);
      setMessage("Customer deleted successfully");
    } catch {
      setMessage("Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between bg-white p-6 rounded-xl shadow mb-6">
          <div>
            <h1 className="text-2xl font-bold">Customer Management</h1>
            <p className="text-sm text-gray-500">Manage all customers</p>
          </div>

          <Link
            to="/customers/add"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            + Add Customer
          </Link>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search customers..."
            className="w-full border px-4 py-2 rounded-lg"
          />
          <button className="bg-blue-600 text-white px-4 rounded-lg">
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setKeyword("");
              fetchCustomers();
            }}
            className="border px-4 rounded-lg"
          >
            Clear
          </button>
        </form>

        {/* Message */}
        {message && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg">
            {message}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-4 border-b font-semibold">
            Customer List ({customers.length})
          </div>

          {loading ? (
            <div className="p-6 text-center">Loading...</div>
          ) : customers.length === 0 ? (
            <div className="p-6 text-center">No customers found</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3">First Name</th>
                  <th className="p-3">Last Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Loyalty Points</th>
                  <th className="p-3">Total Purchases</th>
                  <th className="p-3">Preferred Branch</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((c) => (
                  <tr key={c._id} className="border-t">
                    <td className="p-3">{c.firstName}</td>
                    <td className="p-3">{c.lastName}</td>
                    <td className="p-3">{c.email}</td>
                    <td className="p-3">{c.phone}</td>
                    <td className="p-3">{c.loyaltyPoints || 0}</td>
                    <td className="p-3">{c.totalPurchases || 0}</td>
                    <td className="p-3">
                      {c.preferredBranch?.name || "N/A"}
                    </td>

                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="text-blue-600"
                      >
                        View
                      </button>

                      <Link
                        to={`/customers/edit/${c._id}`}
                        className="text-gray-600"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => handleDelete(c._id)}
                        className="text-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal */}
        {selectedCustomer && <CustomerViewModal />}
      </div>
    </div>
  );
}

export default CustomerListPage;