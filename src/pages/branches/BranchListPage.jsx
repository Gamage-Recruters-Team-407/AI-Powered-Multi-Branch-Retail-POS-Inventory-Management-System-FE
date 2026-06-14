import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBranches } from "../../context/BranchContext";
import { useAuth } from "../../context/AuthContext";
import AddBranchModal from "./AddBranchModal";
import EditBranchModal from "./EditBranchModal";

function BranchListPage() {
  const { branches, loading, fetchBranches, removeBranch, searchBranch } =
    useBranches();

  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const [message, setMessage] = useState("");
  const [keyword, setKeyword] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

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
    <>
      <div
        className="rounded-[28px] p-6 min-h-[calc(100vh-100px)] shadow-lg text-slate-800"
        style={{
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.3)",
        }}
      >
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div
            className="mb-6 flex justify-between rounded-2xl p-6 shadow-sm"
            style={{
              background: "rgba(255,255,255,0.6)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Branch Management
              </h1>
              <p className="text-sm text-slate-700">Manage all branches</p>
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 transition"
              >
                + Add Branch
              </button>
            )}
          </div>

          {/* Search */}
          <div
            className="mb-6 rounded-2xl p-6 shadow-sm"
            style={{
              background: "rgba(255,255,255,0.6)",
              backdropFilter: "blur(10px)",
            }}
          >
            <form onSubmit={handleSearch} className="flex gap-3">
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search branch..."
                className="border px-4 py-2 rounded-lg w-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div
            className="rounded-2xl shadow-sm overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.6)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-800">
                Branch List ({isAdmin ? branches.length : 1})
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
                    <th className="p-3 text-gray-800">Name</th>
                    <th className="p-3 text-gray-800">Code</th>
                    <th className="p-3 text-gray-800">City</th>
                    <th className="p-3 text-gray-800">Contact</th>
                    <th className="p-3 text-gray-800">Status</th>
                    <th className="p-3 text-gray-800">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {branches
                    .filter((b) => {
                      if (!isAdmin) {
                        const branchId =
                          user?.branchId || user?.branch?._id || user?.branch;
                        return b._id === branchId;
                      }
                      return true;
                    })
                    .map((b) => (
                      <tr key={b._id} className="border-t">
                        <td className="p-3 text-gray-800">{b.name}</td>
                        <td className="p-3 text-gray-800">{b.code || "N/A"}</td>
                        <td className="p-3 text-gray-800">{b.city || "N/A"}</td>
                        <td className="p-3 text-gray-800">
                          {b.contactNumber || "N/A"}
                        </td>

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

                          {isAdmin && (
                            <>
                              <button
                                onClick={() => setEditTarget(b._id)}
                                className="text-slate-600"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(b._id)}
                                className="text-red-600"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {isAdmin && showAddModal && (
        <AddBranchModal
          onClose={() => setShowAddModal(false)}
          onSuccess={(msg) => {
            setMessage(msg);
            fetchBranches();
          }}
        />
      )}

      {isAdmin && editTarget && (
        <EditBranchModal
          branchId={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={(msg) => {
            setMessage(msg);
            fetchBranches();
          }}
        />
      )}
    </>
  );
}

export default BranchListPage;
