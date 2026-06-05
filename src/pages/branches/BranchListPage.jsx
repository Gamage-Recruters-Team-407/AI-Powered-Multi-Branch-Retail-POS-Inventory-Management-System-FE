import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useBranches } from "../../context/BranchContext";

function BranchListPage() {
  const {
    branches,
    loading,
    fetchBranches,
    removeBranch,
    searchBranch,
  } = useBranches();

  const [message, setMessage] = useState("");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!keyword) {
      fetchBranches();
      return;
    }

    await searchBranch(keyword);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Delete this branch?");
    if (!confirm) return;

    try {
      await removeBranch(id);
      setMessage("Branch deleted successfully");
    } catch (err) {
      setMessage("Delete failed");
    }
  };

  const handleClear = () => {
    setKeyword("");
    fetchBranches();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex justify-between rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold">Branch Management</h1>
            <p className="text-sm text-slate-500">
              Manage all branches
            </p>
          </div>

          <Link
            to="/branches/add"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg"
          >
            + Add Branch
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search branch..."
              className="border px-4 py-2 rounded-lg w-full"
            />

            <button className="bg-blue-600 text-white px-4 rounded-lg">
              Search
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="border px-4 rounded-lg"
            >
              Clear
            </button>
          </form>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-4 bg-blue-50 text-blue-700 p-3 rounded-lg">
            {message}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold">
              Branch List ({branches.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-6 text-center">Loading...</div>
          ) : branches.length === 0 ? (
            <div className="p-6 text-center">No branches found</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Code</th>
                  <th className="p-3">City</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {branches.map((b) => (
                  <tr key={b._id} className="border-t">
                    <td className="p-3">{b.name}</td>
                    <td className="p-3">{b.code || "N/A"}</td>
                    <td className="p-3">{b.city || "N/A"}</td>
                    <td className="p-3">{b.contactNumber || "N/A"}</td>

                    <td className="p-3">
                      {b.isActive ? (
                        <span className="text-green-600">Active</span>
                      ) : (
                        <span className="text-red-600">Inactive</span>
                      )}
                    </td>

                    <td className="p-3 flex gap-2">
                      <Link
                        to={`/branches/${b._id}`}
                        className="text-blue-600"
                      >
                        View
                      </Link>

                      <Link
                        to={`/branches/edit/${b._id}`}
                        className="text-slate-600"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => handleDelete(b._id)}
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

      </div>
    </div>
  );
}

export default BranchListPage;