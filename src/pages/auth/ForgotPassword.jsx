import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axiosInstance";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const inputBase = {
    width: "100%", height: 48,
    background: "#0a1628",
    border: "1px solid #1a3060",
    borderRadius: 10,
    color: "#e2eaf4", fontSize: 14,
    outline: "none",
    padding: "0 14px 0 42px",
    transition: "border-color .15s",
    letterSpacing: ".2px",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
<<<<<<< HEAD
    setMessage(""); 
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setMessage("✅ " + data.message);
      setEmail("");
    } catch (err) {
      const status = err.response?.status;
      const errorData = err.response?.data;
      
      if (status === 404) {
        setError("❌ No account found with this email address.");
      } else if (status === 429) {
        setError("⏰ Too many requests. Please wait before trying again.");
      } else {
        setError(errorData?.message || "❌ Something went wrong. Please try again.");
      }
=======
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Something went wrong. Please try again."
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
        {/* Top accent bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: 2, background: "#3b82f6"
        }} />

        {/* Logo */}
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
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                         text-sm focus:outline-none focus:ring-2 
                         focus:ring-amber-400 focus:border-transparent transition"
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white 
                       font-semibold py-2.5 rounded-lg transition
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Remembered it?{" "}
          <Link to="/login" className="text-amber-600 font-medium hover:underline">
            Back to Login
=======
        {!sent ? (
          <>
            <h2 style={{
              fontSize: 22, fontWeight: 700, color: "#fff",
              marginBottom: 6, letterSpacing: -.3
            }}>
              Forgot your password?
            </h2>
            <p style={{ fontSize: 12, color: "#4a6090", marginBottom: 24, lineHeight: 1.6 }}>
              Enter the email address linked to your account and we'll send you a link to reset your password.
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
                Email address
              </label>
              <div style={{ position: "relative", marginBottom: 22 }}>
                <i className="ti ti-mail" style={{
                  position: "absolute", left: 14, top: "50%",
                  transform: "translateY(-50%)",
                  color: "#1e3a6e", fontSize: 16,
                }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.com"
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
                    Sending link...
                  </>
                ) : (
                  <>
                    <i className="ti ti-send" />
                    Send reset link
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
              <i className="ti ti-mail-check" style={{ color: "#3b82f6", fontSize: 24 }} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
              Check your email
            </h2>
            <p style={{ fontSize: 12, color: "#4a6090", lineHeight: 1.7, marginBottom: 4 }}>
              If an account exists for <strong style={{ color: "#93c5fd" }}>{email}</strong>,
              a password reset link has been sent. The link expires in 30 minutes.
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

export default ForgotPassword;
