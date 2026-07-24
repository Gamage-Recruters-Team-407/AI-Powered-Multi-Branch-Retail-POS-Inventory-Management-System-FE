import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../../api/axiosInstance";

const ResetPassword = () => {
<<<<<<< HEAD
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [message, setMessage]     = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const { token }                 = useParams();
  const navigate                  = useNavigate();
=======
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const inputBase = {
    width: "100%", height: 48,
    background: "#0a1628",
    border: "1px solid #1a3060",
    borderRadius: 10,
    color: "#e2eaf4", fontSize: 14,
    outline: "none",
    padding: "0 44px 0 42px",
    transition: "border-color .15s",
    letterSpacing: ".2px",
  };
>>>>>>> 958e532c5171664fe6b2bc34f1be8a50139b1285

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
<<<<<<< HEAD
    setMessage("");
    
    if (password !== confirm) {
      return setError("❌ Passwords do not match");
    }
    
    if (password.length < 6) {
      return setError("❌ Password must be at least 6 characters");
    }
    
    setLoading(true);
    try {
      const { data } = await api.put(`/auth/reset-password/${token}`, { password });
      setMessage("✅ " + data.message);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      const status = err.response?.status;
      const errorData = err.response?.data;
      
      if (status === 400) {
        setError("❌ Invalid or expired reset token. Please request a new one.");
      } else {
        setError(errorData?.message || "❌ Reset failed. Please try again.");
      }
=======

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Reset link is invalid or has expired."
      );
>>>>>>> 958e532c5171664fe6b2bc34f1be8a50139b1285
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#050d1f",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 20px",
    }}>
      <div style={{
        width: "100%", maxWidth: 420,
        background: "#070f21",
        border: "1px solid #1a3060",
        borderRadius: 16,
        padding: "40px 36px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: 2, background: "#3b82f6"
        }} />

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{
            width: 34, height: 34, background: "#3b82f6",
            borderRadius: 8, display: "flex",
            alignItems: "center", justifyContent: "center"
          }}>
            <i className="ti ti-building-store" style={{ color: "#fff", fontSize: 17 }} />
          </div>
          <span style={{ color: "#fff", fontSize: 14, fontWeight: 500, letterSpacing: .6 }}>
            POS Modules
          </span>
        </div>

<<<<<<< HEAD
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 
                          rounded-lg px-4 py-3 mb-5 text-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 
                          rounded-lg px-4 py-3 mb-5 text-sm">
            {error}
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
              disabled={loading}
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
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white 
                       font-semibold py-2.5 rounded-lg transition
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="text-violet-600 font-medium hover:underline">
            Back to Login
=======
        {!success ? (
          <>
            <h2 style={{
              fontSize: 22, fontWeight: 700, color: "#fff",
              marginBottom: 6, letterSpacing: -.3
            }}>
              Set a new password
            </h2>
            <p style={{ fontSize: 12, color: "#4a6090", marginBottom: 24, lineHeight: 1.6 }}>
              Choose a strong new password for your account.
            </p>

            {error && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8, fontSize: 12,
                background: "rgba(239,68,68,.08)",
                border: "1px solid rgba(239,68,68,.2)",
                color: "#f87171", borderRadius: 8,
                padding: "10px 12px", marginBottom: 16,
              }}>
                <i className="ti ti-alert-circle" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <label style={{
                fontSize: 11, fontWeight: 500, color: "#4a70b0",
                letterSpacing: .5, textTransform: "uppercase",
                marginBottom: 6, display: "block"
              }}>
                New password
              </label>
              <div style={{ position: "relative", marginBottom: 16 }}>
                <i className="ti ti-lock" style={{
                  position: "absolute", left: 14, top: "50%",
                  transform: "translateY(-50%)",
                  color: "#1e3a6e", fontSize: 16,
                }} />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  style={inputBase}
                  onFocus={e => e.target.style.borderColor = "#3b82f6"}
                  onBlur={e => e.target.style.borderColor = "#1a3060"}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute", right: 13, top: "50%",
                    transform: "translateY(-50%)", background: "none",
                    border: "none", color: "#1e3a6e",
                    cursor: "pointer", padding: 0, fontSize: 16
                  }}>
                  <i className={`ti ${showPass ? "ti-eye-off" : "ti-eye"}`} />
                </button>
              </div>

              <label style={{
                fontSize: 11, fontWeight: 500, color: "#4a70b0",
                letterSpacing: .5, textTransform: "uppercase",
                marginBottom: 6, display: "block"
              }}>
                Confirm password
              </label>
              <div style={{ position: "relative", marginBottom: 22 }}>
                <i className="ti ti-lock" style={{
                  position: "absolute", left: 14, top: "50%",
                  transform: "translateY(-50%)",
                  color: "#1e3a6e", fontSize: 16,
                }} />
                <input
                  type={showPass ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  style={inputBase}
                  onFocus={e => e.target.style.borderColor = "#3b82f6"}
                  onBlur={e => e.target.style.borderColor = "#1a3060"}
                  required
                />
              </div>

              <button type="submit" disabled={loading}
                style={{
                  width: "100%", height: 50,
                  background: loading ? "#2563eb" : "#3b82f6",
                  border: "none", borderRadius: 10, color: "#fff",
                  fontSize: 14, fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 8,
                  letterSpacing: .2, transition: "background .15s",
                  opacity: loading ? .8 : 1,
                }}>
                {loading ? (
                  <>
                    <i className="ti ti-loader-2" style={{ animation: "spin .8s linear infinite" }} />
                    Resetting...
                  </>
                ) : (
                  <>
                    <i className="ti ti-shield-check" />
                    Reset password
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "rgba(59,130,246,.12)",
              border: "1px solid rgba(59,130,246,.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 18px"
            }}>
              <i className="ti ti-check" style={{ color: "#3b82f6", fontSize: 24 }} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
              Password updated
            </h2>
            <p style={{ fontSize: 12, color: "#4a6090", lineHeight: 1.7 }}>
              Redirecting you to the sign-in page...
            </p>
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: 11, color: "#1e3a6e", marginTop: 26 }}>
          <Link to="/login" style={{
            color: "#3b82f6", textDecoration: "none", fontWeight: 500,
            display: "inline-flex", alignItems: "center", gap: 5
          }}>
            <i className="ti ti-arrow-left" />
            Back to sign in
>>>>>>> 958e532c5171664fe6b2bc34f1be8a50139b1285
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
};

export default ResetPassword;
