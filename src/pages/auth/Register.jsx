import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axiosInstance";

const Register = () => {
  const [form, setForm]         = useState({ name:"", email:"", password:"", role:"user" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate                = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      setSuccess("Registration successful! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputBase = {
    width:"100%", height:48,
    background:"#0a1628",
    border:"1px solid #1a3060",
    borderRadius:10,
    color:"#e2eaf4", fontSize:14,
    outline:"none",
    padding:"0 44px 0 42px",
    transition:"border-color .15s",
    letterSpacing:".2px",
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#050d1f" }}>

      {/* ── Left Panel ── */}
      <div style={{
        width:"42%", padding:"56px 52px",
        display:"flex", flexDirection:"column",
        justifyContent:"space-between",
        position:"relative", overflow:"hidden",
        background:"#050d1f",
      }}>
        <div style={{ position:"absolute", top:0, left:0, right:0,
                      height:2, background:"#3b82f6" }} />
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
            Create your account
          </div>

          <h1 style={{ fontSize:30, fontWeight:700, color:"#fff",
                       lineHeight:1.25, marginBottom:12, letterSpacing:-.5 }}>
            Join the<br />Multi-Branch<br />
            <span style={{ color:"#3b82f6" }}>POS Platform</span>
          </h1>

          <p style={{ fontSize:13, color:"#6b88c8",
                      lineHeight:1.7, maxWidth:340 }}>
            Powerful retail management — inventory, sales,
            employees and real-time analytics.
          </p>

          {/* Illustration */}
          <div style={{ marginTop:32 }}>
            <div style={{
              background:"rgba(59,130,246,.06)",
              border:"1px solid rgba(59,130,246,.15)",
              borderRadius:16, padding:"20px", marginBottom:12,
            }}>
              <div style={{ display:"flex", alignItems:"center",
                            gap:6, marginBottom:14 }}>
                {["#ef4444","#f59e0b","#22c55e"].map(c => (
                  <div key={c} style={{ width:7, height:7,
                    borderRadius:"50%", background:c }} />
                ))}
                <div style={{ flex:1, height:5,
                              background:"rgba(255,255,255,.05)",
                              borderRadius:4, marginLeft:8 }} />
                <span style={{ fontSize:9, color:"#2a4070",
                               letterSpacing:.5 }}>LIVE</span>
                <div style={{ width:5, height:5, borderRadius:"50%",
                              background:"#3b82f6", marginLeft:4 }} />
              </div>

              <div style={{ display:"grid",
                            gridTemplateColumns:"repeat(3,1fr)",
                            gap:8, marginBottom:12 }}>
                {[
                  { val:"$12,450", lbl:"Revenue", color:"#3b82f6", tag:"↑ 8.2%" },
                  { val:"526",     lbl:"Sales",   color:"#93c5fd", tag:"↑ 3.8%" },
                  { val:"99%",     lbl:"Uptime",  color:"#fff",    tag:"● Live"  },
                ].map(({ val, lbl, color, tag }) => (
                  <div key={lbl} style={{
                    background:"rgba(255,255,255,.04)",
                    border:"1px solid rgba(255,255,255,.06)",
                    borderRadius:9, padding:"9px 10px",
                  }}>
                    <div style={{ fontSize:13, fontWeight:700,
                                  color, marginBottom:1 }}>{val}</div>
                    <div style={{ fontSize:8, color:"#4a6090",
                                  textTransform:"uppercase",
                                  letterSpacing:.6 }}>{lbl}</div>
                    <div style={{ fontSize:9, color:"#3b82f6",
                                  marginTop:2 }}>{tag}</div>
                  </div>
                ))}
              </div>

              <div style={{ display:"flex", alignItems:"flex-end",
                            gap:4, height:44, padding:"0 2px" }}>
                {[30,50,38,65,48,80,55,72,42,88,60,75].map((h,i) => (
                  <div key={i} style={{
                    flex:1, height:`${h}%`,
                    borderRadius:"3px 3px 0 0",
                    background: i===9 ? "#3b82f6"
                      : `rgba(59,130,246,${0.15+(h/100)*0.3})`,
                  }} />
                ))}
              </div>
              <div style={{ fontSize:8, color:"#1e3a6e", marginTop:5,
                            textAlign:"center", letterSpacing:.8 }}>
                MONTHLY SALES OVERVIEW
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[
                { icon:"ti-shield-lock", text:"Bank-grade JWT security"     },
                { icon:"ti-git-branch",  text:"Multi-branch real-time sync" },
                { icon:"ti-brain",       text:"AI demand forecasting engine"},
              ].map(({ icon, text }) => (
                <div key={text} style={{
                  display:"flex", alignItems:"center", gap:10,
                  background:"rgba(255,255,255,.03)",
                  border:"1px solid rgba(255,255,255,.06)",
                  borderRadius:10, padding:"9px 12px",
                }}>
                  <div style={{ width:26, height:26, borderRadius:7,
                                background:"rgba(59,130,246,.12)",
                                border:"1px solid rgba(59,130,246,.2)",
                                display:"flex", alignItems:"center",
                                justifyContent:"center", flexShrink:0 }}>
                    <i className={`ti ${icon}`}
                       style={{ color:"#3b82f6", fontSize:13 }} />
                  </div>
                  <span style={{ fontSize:12, color:"#6b88c8" }}>{text}</span>
                  <i className="ti ti-chevron-right"
                     style={{ color:"#1e3a6e", fontSize:11,
                               marginLeft:"auto" }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ fontSize:11, color:"#1e3a6e" }}>
          © 2026 POS System · All rights reserved
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div style={{
        width:"58%", background:"#070f21",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"40px 60px",
        borderLeft:"1px solid rgba(255,255,255,.05)",
      }}>
        <div style={{ width:"100%", maxWidth:480 }}>

          <div style={{ marginBottom:28 }}>
            <h2 style={{ fontSize:24, fontWeight:700, color:"#fff",
                         marginBottom:4, letterSpacing:-.3 }}>
              Create account
            </h2>
            <p style={{ fontSize:12, color:"#4a6090" }}>
              Fill in your details to get started
            </p>
          </div>

          {error && (
            <div style={{
              display:"flex", alignItems:"center", gap:8, fontSize:12,
              background:"rgba(239,68,68,.08)",
              border:"1px solid rgba(239,68,68,.2)",
              color:"#f87171", borderRadius:8,
              padding:"10px 12px", marginBottom:16,
            }}>
              <i className="ti ti-alert-circle" /> {error}
            </div>
          )}

          {success && (
            <div style={{
              display:"flex", alignItems:"center", gap:8, fontSize:12,
              background:"rgba(59,130,246,.08)",
              border:"1px solid rgba(59,130,246,.2)",
              color:"#93c5fd", borderRadius:8,
              padding:"10px 12px", marginBottom:16,
            }}>
              <i className="ti ti-circle-check" /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Name */}
            <label style={{ fontSize:11, fontWeight:500, color:"#4a70b0",
                            letterSpacing:.5, textTransform:"uppercase",
                            marginBottom:6, display:"block" }}>
              Full name
            </label>
            <div style={{ position:"relative", marginBottom:16 }}>
              <i className="ti ti-user" style={{ position:"absolute",
                left:14, top:"50%", transform:"translateY(-50%)",
                color:"#1e3a6e", fontSize:16 }} />
              <input type="text" name="name" value={form.name}
                onChange={handleChange} placeholder="John Doe"
                style={inputBase}
                onFocus={e => e.target.style.borderColor="#3b82f6"}
                onBlur={e  => e.target.style.borderColor="#1a3060"}
                required />
            </div>

            {/* Email */}
            <label style={{ fontSize:11, fontWeight:500, color:"#4a70b0",
                            letterSpacing:.5, textTransform:"uppercase",
                            marginBottom:6, display:"block" }}>
              Email address
            </label>
            <div style={{ position:"relative", marginBottom:16 }}>
              <i className="ti ti-mail" style={{ position:"absolute",
                left:14, top:"50%", transform:"translateY(-50%)",
                color:"#1e3a6e", fontSize:16 }} />
              <input type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="admin@company.com"
                style={inputBase}
                onFocus={e => e.target.style.borderColor="#3b82f6"}
                onBlur={e  => e.target.style.borderColor="#1a3060"}
                required />
            </div>

            {/* Password */}
            <label style={{ fontSize:11, fontWeight:500, color:"#4a70b0",
                            letterSpacing:.5, textTransform:"uppercase",
                            marginBottom:6, display:"block" }}>
              Password
            </label>
            <div style={{ position:"relative", marginBottom:24 }}>
              <i className="ti ti-lock" style={{ position:"absolute",
                left:14, top:"50%", transform:"translateY(-50%)",
                color:"#1e3a6e", fontSize:16 }} />
              <input type={showPass?"text":"password"} name="password"
                value={form.password} onChange={handleChange}
                placeholder="Min. 6 characters" style={inputBase}
                onFocus={e => e.target.style.borderColor="#3b82f6"}
                onBlur={e  => e.target.style.borderColor="#1a3060"}
                minLength={6} required />
              <button type="button" onClick={()=>setShowPass(!showPass)}
                style={{ position:"absolute", right:13, top:"50%",
                         transform:"translateY(-50%)", background:"none",
                         border:"none", color:"#1e3a6e",
                         cursor:"pointer", padding:0, fontSize:16 }}>
                <i className={`ti ${showPass?"ti-eye-off":"ti-eye"}`} />
              </button>
            </div>

            {/* ✅ Role hidden — default "user" */}
            <input type="hidden" name="role" value="user" />

            {/* Role info badge */}
            <div style={{
              display:"flex", alignItems:"center", gap:8,
              background:"rgba(59,130,246,.05)",
              border:"1px solid rgba(59,130,246,.12)",
              borderRadius:9, padding:"10px 14px", marginBottom:22,
            }}>
              <div style={{ width:28, height:28, borderRadius:7,
                            background:"rgba(59,130,246,.12)",
                            border:"1px solid rgba(59,130,246,.2)",
                            display:"flex", alignItems:"center",
                            justifyContent:"center", flexShrink:0 }}>
                <i className="ti ti-user"
                   style={{ color:"#3b82f6", fontSize:14 }} />
              </div>
              <div>
                <div style={{ fontSize:11, color:"#93c5fd",
                              fontWeight:500, letterSpacing:.3 }}>
                  Default role: User
                </div>
                <div style={{ fontSize:10, color:"#1e3a6e", marginTop:1 }}>
                  Role can be changed by an admin after registration
                </div>
              </div>
              <div style={{ marginLeft:"auto", fontSize:9,
                            color:"#3b82f6", background:"rgba(59,130,246,.1)",
                            border:"1px solid rgba(59,130,246,.2)",
                            borderRadius:20, padding:"2px 8px" }}>
                USER
              </div>
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
                  Creating account...</>
              ) : (
                <><i className="ti ti-user-plus" />
                  Create account</>
              )}
            </button>
          </form>

          <div style={{ display:"flex", alignItems:"center",
                        gap:10, margin:"22px 0" }}>
            <hr style={{ flex:1, border:"none",
                         borderTop:"1px solid #0f2040" }} />
            <span style={{ fontSize:10, color:"#1e3a6e",
                           textTransform:"uppercase", letterSpacing:.8 }}>
              already registered
            </span>
            <hr style={{ flex:1, border:"none",
                         borderTop:"1px solid #0f2040" }} />
          </div>

          <div style={{
            display:"flex", alignItems:"center", gap:7,
            background:"rgba(59,130,246,.07)",
            border:"1px solid rgba(59,130,246,.15)",
            borderRadius:8, padding:"10px 14px", marginBottom:20,
          }}>
            <span style={{ width:7, height:7, borderRadius:"50%",
                           background:"#3b82f6", flexShrink:0 }} />
            <span style={{ fontSize:11, color:"#3b82f6" }}>
              All systems operational · Secure registration
            </span>
          </div>

          <p style={{ textAlign:"center", fontSize:11, color:"#1e3a6e" }}>
            Already have an account?{" "}
            <Link to="/login"
              style={{ color:"#3b82f6",
                       textDecoration:"none", fontWeight:500 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default Register;