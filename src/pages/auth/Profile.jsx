import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosInstance";

const roleBadge = {
  admin:   "bg-red-100 text-red-700",
  manager: "bg-blue-100 text-blue-700",
  cashier: "bg-green-100 text-green-700",
};

const Profile = () => {
  const { user, login }       = useAuth();
  const [form, setForm]       = useState({ name: user?.name, email: user?.email, password: "" });
  const [message, setMessage] = useState("");
  const [error, setError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); setError("");
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      const { data } = await api.put("/auth/profile", payload);
      login(data.user, localStorage.getItem("token"));
      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center 
                          justify-center text-3xl font-bold text-indigo-600">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full 
                             ${roleBadge[user?.role]}`}>
              {user?.role?.toUpperCase()}
            </span>
          </div>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 
                          rounded-lg px-4 py-3 mb-5 text-sm">
            ✅ {message}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 
                          rounded-lg px-4 py-3 mb-5 text-sm">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            { label:"Full Name",    name:"name",     type:"text"     },
            { label:"Email",        name:"email",    type:"email"    },
            { label:"New Password", name:"password", type:"password",
              placeholder:"Leave blank to keep current" },
          ].map(({ label, name, type, placeholder }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              <input
                type={type}
                value={form[name]}
                onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                placeholder={placeholder || ""}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                           text-sm focus:outline-none focus:ring-2 
                           focus:ring-indigo-400 focus:border-transparent transition"
              />
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white 
                       font-semibold py-2.5 rounded-lg transition"
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;