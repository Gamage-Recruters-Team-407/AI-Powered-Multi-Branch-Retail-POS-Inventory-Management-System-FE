import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosInstance";

const ROLES = [
  { label: "Admin",   value: "admin",   icon: "ti-shield-check" },
  { label: "Manager", value: "manager", icon: "ti-briefcase"    },
  { label: "Cashier", value: "cashier", icon: "ti-receipt"      },
];

const Login = () => {
  const [form, setForm]         = useState({ email: "", password: "" });
  const [selectedRole, setRole] = useState("admin");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.user, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#050d1f" }}>

      {/* ── Left Panel ── */}
      <div style={{
        width: "82%", padding: "56px 52px",
        display: "flex", flexDirection: "column",
        justifyContent: "space-between",
        position: "relative", overflow: "hidden",
        background: "#050d1f",
      }}>
        {/* Top accent bar */}
        <div style={{ position:"absolute", top:0, left:0, right:0,
                      height:2, background:"#3b82f6" }} />
        {/* Orbs */}
        <div style={{ position:"absolute", width:400, height:400,
                      borderRadius:"50%", background:"#3b82f6",
                      opacity:.04, top:-120, right:-100 }} />
        <div style={{ position:"absolute", width:220, height:220,
                      borderRadius:"50%", background:"#1d4ed8",
                      opacity:.05, bottom:-60, left:-60 }} />

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, background:"#3b82f6",
                        borderRadius:8, display:"flex",
                        alignItems:"center", justifyContent:"center" }}>
            <i className="ti ti-building-store"
               style={{ color:"#fff", fontSize:17 }} />
          </div>
          <span style={{ color:"#fff", fontSize:14,
                         fontWeight:500, letterSpacing:.6 }}>
            POS Modules
          </span>
          <span style={{ fontSize:10, color:"#93c5fd",
                         background:"rgba(59,130,246,.15)",
                         border:"1px solid rgba(59,130,246,.25)",
                         borderRadius:20, padding:"2px 8px", marginLeft:4 }}>
            v2.0
          </span>
        </div>

        {/* Hero */}
        <div style={{ zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8,
                        fontSize:11, color:"#3b82f6", letterSpacing:2,
                        textTransform:"uppercase", fontWeight:500,
                        marginBottom:16 }}>
            <span style={{ width:24, height:1,
                           background:"#3b82f6", display:"block" }} />
            Enterprise retail platform
          </div>

          <h1 style={{ fontSize:32, fontWeight:700, color:"#fff",
                       lineHeight:1.25, marginBottom:16, letterSpacing:-.5 }}>
            AI-Powered<br />Multi-Branch<br />
            <span style={{ color:"#3b82f6" }}>Retail System</span>
          </h1>

          <p style={{ fontSize:13, color:"#6b88c8",
                      lineHeight:1.7, maxWidth:360 }}>
            Real-time intelligence across all branches — sales, inventory,
            employees and analytics in one unified platform.
          </p>

          {/* Stats bar */}
          <div style={{ display:"flex", marginTop:36,
                        border:"1px solid rgba(255,255,255,.07)",
                        borderRadius:12, overflow:"hidden",
                        background:"rgba(255,255,255,.03)" }}>
            {[
              { val:"22",   color:"#fff",    lbl:"Modules"   },
              { val:"Live", color:"#3b82f6", lbl:"Real-time" },
              { val:"AI",   color:"#93c5fd", lbl:"Insights"  },
              { val:"99%",  color:"#fff",    lbl:"Uptime"    },
            ].map(({ val, color, lbl }, i) => (
              <div key={lbl} style={{
                flex:1, padding:"16px 20px",
                borderRight: i < 3
                  ? "1px solid rgba(255,255,255,.07)" : "none",
              }}>
                <div style={{ fontSize:20, fontWeight:700,
                              color, marginBottom:2 }}>{val}</div>
                <div style={{ fontSize:10, color:"#4a6090",
                              textTransform:"uppercase",
                              letterSpacing:.8 }}>{lbl}</div>
              </div>
            ))}
          </div>

          {/* Chips */}
          <div style={{ display:"flex", gap:6,
                        flexWrap:"wrap", marginTop:28 }}>
            {[
              { icon:"ti-shield-check", text:"JWT auth"       },
              { icon:"ti-users",        text:"Role-based"     },
              { icon:"ti-git-branch",   text:"Multi-branch"   },
              { icon:"ti-brain",        text:"AI forecasting" },
            ].map(({ icon, text }) => (
              <span key={text} style={{
                display:"flex", alignItems:"center", gap:5,
                fontSize:11, color:"#4a6090",
                background:"rgba(255,255,255,.04)",
                border:"1px solid rgba(255,255,255,.07)",
                borderRadius:6, padding:"5px 10px",
              }}>
                <i className={`ti ${icon}`}
                   style={{ color:"#3b82f6", fontSize:12 }} />
                {text}
              </span>
            ))}
          </div>
        </div>

        <div style={{ fontSize:11, color:"#1e3a6e" }}>
          © 2026 POS System · All rights reserved
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div style={{
        width: "58%", background:"#070f21",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"40px 60px",
        borderLeft:"1px solid rgba(255,255,255,.05)",
      }}>
        <div style={{ width:"100%", maxWidth:480 }}>

          {/* Header */}
          <div style={{ marginBottom:28 }}>
            <h2 style={{ fontSize:24, fontWeight:700, color:"#fff",
                         marginBottom:4, letterSpacing:-.3 }}>
              Welcome back
            </h2>
            <p style={{ fontSize:12, color:"#4a6090" }}>
              Sign in to access your dashboard
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display:"flex", alignItems:"center", gap:8, fontSize:12,
              background:"rgba(239,68,68,.08)",
              border:"1px solid rgba(239,68,68,.2)",
              color:"#f87171", borderRadius:8,
              padding:"10px 12px", marginBottom:16,
            }}>
              <i className="ti ti-alert-circle" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <label style={{ fontSize:11, fontWeight:500, color:"#4a70b0",
                            letterSpacing:.5, textTransform:"uppercase",
                            marginBottom:6, display:"block" }}>
              Email address
            </label>
            <div style={{ position:"relative", marginBottom:16 }}>
              <i className="ti ti-mail" style={{
                position:"absolute", left:14, top:"50%",
                transform:"translateY(-50%)",
                color:"#1e3a6e", fontSize:16,
              }} />
              <input
                type="email" name="email"
                value={form.email} onChange={handleChange}
                placeholder="admin@company.com"
                style={inputBase}
                onFocus={e => e.target.style.borderColor = "#3b82f6"}
                onBlur={e  => e.target.style.borderColor = "#1a3060"}
                required
              />
            </div>

            {/* Password */}
            <label style={{ fontSize:11, fontWeight:500, color:"#4a70b0",
                            letterSpacing:.5, textTransform:"uppercase",
                            marginBottom:6, display:"block" }}>
              Password
            </label>
            <div style={{ position:"relative", marginBottom:16 }}>
              <i className="ti ti-lock" style={{
                position:"absolute", left:14, top:"50%",
                transform:"translateY(-50%)",
                color:"#1e3a6e", fontSize:16,
              }} />
              <input
                type={showPass ? "text" : "password"} name="password"
                value={form.password} onChange={handleChange}
                placeholder="Enter your password"
                style={inputBase}
                onFocus={e => e.target.style.borderColor = "#3b82f6"}
                onBlur={e  => e.target.style.borderColor = "#1a3060"}
                required
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position:"absolute", right:13, top:"50%",
                         transform:"translateY(-50%)", background:"none",
                         border:"none", color:"#1e3a6e",
                         cursor:"pointer", padding:0, fontSize:16 }}>
                <i className={`ti ${showPass ? "ti-eye-off" : "ti-eye"}`} />
              </button>
            </div>

            {/* Remember + Forgot */}
            <div style={{ display:"flex", justifyContent:"space-between",
                          alignItems:"center", marginBottom:22 }}>
              <label style={{ display:"flex", alignItems:"center", gap:6,
                              fontSize:11, color:"#4a6090", cursor:"pointer" }}>
                <input type="checkbox" checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  style={{ accentColor:"#3b82f6", width:13, height:13 }} />
                Remember me
              </label>
              <Link to="/forgot-password"
                style={{ fontSize:11, color:"#3b82f6", textDecoration:"none" }}>
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{
                width:"100%", height:50,
                background: loading ? "#2563eb" : "#3b82f6",
                border:"none", borderRadius:10, color:"#fff",
                fontSize:14, fontWeight:600,
                cursor: loading ? "not-allowed" : "pointer",
                display:"flex", alignItems:"center",
                justifyContent:"center", gap:8,
                letterSpacing:.2, transition:"background .15s",
                opacity: loading ? .8 : 1,
              }}>
              {loading ? (
                <><i className="ti ti-loader-2"
                     style={{ animation:"spin .8s linear infinite" }} />
                  Signing in...</>
              ) : (
                <><i className="ti ti-login" />
                  Sign in to dashboard</>
              )}
            </button>
          </form>

         {/* ── Feature highlights divider ── */}
<div style={{ display:"flex", alignItems:"center",
              gap:10, margin:"22px 0" }}>
  <hr style={{ flex:1, border:"none",
              borderTop:"1px solid #3b82f6" }} />
  <span style={{ fontSize:10, color:"#3b82f6",
                textTransform:"uppercase", letterSpacing:.8 }}>
    what you get
  </span>
  <hr style={{ flex:1, border:"none",
              borderTop:"1px solid #3b82f6" }} />
</div>

{/* Feature highlight cards */}
<div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)",
              gap:8, marginBottom:18 }}>
  {[
    { icon:"ti-rocket",       label:"Fast Setup",     sub:"Live in minutes"      },
    { icon:"ti-chart-line",   label:"Analytics",      sub:"Real-time insights"   },
    { icon:"ti-bell-ringing", label:"Smart Alerts",   sub:"Never miss a beat"    },
  ].map(({ icon, label, sub }) => (
    <div key={label} style={{
      border:"1px solid #1e3a6e",
      borderRadius:9, background:"#0a1628",
      padding:"12px 4px",
      display:"flex", flexDirection:"column",
      alignItems:"center", gap:5,
      transition:"border-color .2s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor="#3b82f6"}
      onMouseLeave={e => e.currentTarget.style.borderColor="#1e3a6e"}
    >
      <i className={`ti ${icon}`}
        style={{ fontSize:18, color:"#3b82f6" }} />
      <span style={{ fontSize:11, color:"#cbd5e1",
                    fontWeight:500 }}>{label}</span>
      <span style={{ fontSize:9, color:"#4a6090",
                    letterSpacing:.3 }}>{sub}</span>
    </div>
  ))}
</div>

          {/* Status */}
          <div style={{
            display:"flex", alignItems:"center", gap:7,
            background:"rgba(59,130,246,.07)",
            border:"1px solid rgba(59,130,246,.15)",
            borderRadius:8, padding:"10px 14px", marginBottom:20,
          }}>
            <span style={{ width:7, height:7, borderRadius:"50%",
                           background:"#3b82f6", flexShrink:0 }} />
            <span style={{ fontSize:11, color:"#3b82f6" }}>
              All systems operational · Live connection active
            </span>
          </div>

          <p style={{ textAlign:"center", fontSize:11, color:"#1e3a6e" }}>
            New to the system?{" "}
            <Link to="/register"
              style={{ color:"#3b82f6",
                       textDecoration:"none", fontWeight:500 }}>
              Create account
            </Link>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default Login;
