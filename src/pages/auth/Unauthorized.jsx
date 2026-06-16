import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Unauthorized = () => {
  const navigate  = useNavigate();
  const { user }  = useAuth();

  return (
    <div style={{ display:"flex", minHeight:"100vh",
                  background:"#050d1f", alignItems:"center",
                  justifyContent:"center" }}>
      <div style={{ textAlign:"center", padding:"40px" }}>

        {/* Icon */}
        <div style={{ width:80, height:80, borderRadius:"50%",
                      background:"rgba(239,68,68,.1)",
                      border:"1px solid rgba(239,68,68,.2)",
                      display:"flex", alignItems:"center",
                      justifyContent:"center", margin:"0 auto 24px" }}>
          <i className="ti ti-shield-off"
             style={{ color:"#f87171", fontSize:36 }} />
        </div>

        <h1 style={{ fontSize:22, fontWeight:700, color:"#fff",
                     marginBottom:8, letterSpacing:-.3 }}>
          Unauthorized Access
        </h1>
        <p style={{ fontSize:13, color:"#4a6090",
                    marginBottom:32, lineHeight:1.6 }}>
          You don't have permission to view this page.<br />
          {user
            ? `Your current role is "${user.role}".`
            : "Please sign in to continue."}
        </p>

        <div style={{ display:"flex", gap:10,
                      justifyContent:"center" }}>
          <button onClick={() => navigate(-1)}
            style={{ height:42, padding:"0 20px",
                     background:"rgba(59,130,246,.1)",
                     border:"1px solid rgba(59,130,246,.2)",
                     borderRadius:9, color:"#3b82f6",
                     fontSize:13, cursor:"pointer",
                     display:"flex", alignItems:"center", gap:6 }}>
            <i className="ti ti-arrow-left" />
            Go back
          </button>
          <button onClick={() => navigate("/dashboard")}
            style={{ height:42, padding:"0 20px",
                     background:"#3b82f6", border:"none",
                     borderRadius:9, color:"#fff",
                     fontSize:13, fontWeight:600,
                     cursor:"pointer",
                     display:"flex", alignItems:"center", gap:6 }}>
            <i className="ti ti-home" />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;