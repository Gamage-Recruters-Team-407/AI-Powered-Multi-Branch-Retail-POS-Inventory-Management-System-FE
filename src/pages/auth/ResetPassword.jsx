import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../api/axiosInstance";

const ResetPassword = () => {
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [message, setMessage]     = useState("");
  const [error, setError]         = useState("");
  const { token }                 = useParams();
  const navigate                  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      return setError("Passwords do not match");
    }
    try {
      const { data } = await api.put(`/auth/reset-password/${token}`, { password });
      setMessage(data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 
                    flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your new password</p>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                         text-sm focus:outline-none focus:ring-2 
                         focus:ring-violet-400 focus:border-transparent transition"
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                         text-sm focus:outline-none focus:ring-2 
                         focus:ring-violet-400 focus:border-transparent transition"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-700 text-white 
                       font-semibold py-2.5 rounded-lg transition"
          >
            Reset Password
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="text-violet-600 font-medium hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;