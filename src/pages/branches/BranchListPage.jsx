import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBranches } from "../../context/BranchContext";
import { useAuth } from "../../context/AuthContext";
import AddBranchModal from "./AddBranchModal";
import EditBranchModal from "./EditBranchModal";

const AVATAR_COLORS = [
  { bg: "#eff6ff", color: "#1e40af" },
  { bg: "#f0fdfa", color: "#0f766e" },
  { bg: "#f5f3ff", color: "#5b21b6" },
  { bg: "#fffbeb", color: "#92400e" },
  { bg: "#fdf2f8", color: "#86198f" },
  { bg: "#f0fdf4", color: "#166534" },
  { bg: "#fef2f2", color: "#991b1b" },
  { bg: "#fff7ed", color: "#9a3412" },
];

function getAvatarColor(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function BranchListPage() {
  const { branches, loading, fetchBranches, removeBranch, searchBranch } = useBranches();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAdmin = ["admin", "super_admin"].includes(user?.role);
  const isManager = user?.role === "manager";

  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [keyword, setKeyword] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => { fetchBranches(); }, []);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(""), 4000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) { fetchBranches(); return; }
    await searchBranch(keyword);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this branch? This action cannot be undone.")) return;
    try {
      await removeBranch(id);
      setMessage("Branch deleted successfully");
      setMessageType("success");
    } catch {
      setMessage("Failed to delete branch");
      setMessageType("error");
    }
  };

  const handleClear = () => { setKeyword(""); fetchBranches(); };

  const visibleBranches = branches.filter((b) => {
    if (isManager) {
      const managerId = user?._id;
      const branchManagerId = b.manager?._id || b.manager;
      return String(branchManagerId) === String(managerId);
    }
    return true;
  });

  const filteredBranches = visibleBranches.filter((b) => {
    if (activeFilter === "active") return b.isActive;
    if (activeFilter === "inactive") return !b.isActive;
    return true;
  });

  const totalCount = visibleBranches.length;
  const activeCount = visibleBranches.filter((b) => b.isActive).length;
  const inactiveCount = visibleBranches.filter((b) => !b.isActive).length;

  return (
    <>
      <div style={{ padding: "0 0 2rem", fontFamily: "inherit" }}>

        {/* ── Header Banner ── */}
        <div style={{
          background: "linear-gradient(135deg,#1a2744 0%,#0f3460 55%,#16213e 100%)",
          borderRadius: "16px",
          padding: "28px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          position: "relative",
          overflow: "hidden",
          flexWrap: "wrap",
          gap: "20px",
        }}>
          {/* decorative circles */}
          <div style={{ position:"absolute",right:"-40px",top:"-40px",width:"200px",height:"200px",borderRadius:"50%",background:"rgba(255,255,255,0.04)" }} />
          <div style={{ position:"absolute",right:"80px",bottom:"-60px",width:"140px",height:"140px",borderRadius:"50%",background:"rgba(99,179,237,0.07)" }} />

          <div style={{ position:"relative", zIndex:1 }}>
            <p style={{ fontSize:"11px",fontWeight:600,color:"rgba(163,216,255,0.7)",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:"6px",margin:"0 0 6px" }}>
              POS System · Locations
            </p>
            <h1 style={{ fontSize:"26px",fontWeight:700,color:"#fff",margin:"0 0 4px",letterSpacing:"-0.3px" }}>
              Branch Management
            </h1>
            <p style={{ fontSize:"13px",color:"rgba(255,255,255,0.45)",margin:0 }}>
              Monitor and control all retail locations
            </p>
          </div>

          <div style={{ display:"flex",gap:"28px",position:"relative",zIndex:1,flexWrap:"wrap" }}>
            {[
              { num: totalCount,   label: "Total",    color: "#fff" },
              { num: activeCount,  label: "Active",   color: "#4ade80" },
              { num: inactiveCount,label: "Inactive", color: "#f87171" },
            ].map(({ num, label, color }) => (
              <div key={label} style={{ textAlign:"center" }}>
                <div style={{ fontSize:"24px",fontWeight:700,color,lineHeight:1 }}>{num}</div>
                <div style={{ fontSize:"11px",color:"rgba(255,255,255,0.4)",marginTop:"4px",letterSpacing:"0.5px" }}>{label}</div>
              </div>
            ))}
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background:"#2563eb",color:"#fff",border:"none",borderRadius:"10px",
                padding:"11px 22px",fontSize:"13px",fontWeight:600,cursor:"pointer",
                display:"flex",alignItems:"center",gap:"7px",position:"relative",zIndex:1,
                whiteSpace:"nowrap",transition:"background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background="#1d4ed8"}
              onMouseLeave={e => e.currentTarget.style.background="#2563eb"}
            >
              <span style={{ fontSize:"16px", lineHeight:1 }}>+</span> Add Branch
            </button>
          )}
        </div>

        {/* ── Toast Message ── */}
        {message && (
          <div style={{
            marginBottom:"16px",borderRadius:"10px",padding:"12px 16px",
            display:"flex",alignItems:"center",gap:"10px",fontSize:"13px",
            background: messageType === "success" ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${messageType === "success" ? "#bbf7d0" : "#fecaca"}`,
            color: messageType === "success" ? "#166534" : "#dc2626",
          }}>
            <span style={{ fontSize:"16px" }}>{messageType === "success" ? "✓" : "✕"}</span>
            {message}
          </div>
        )}

        {/* ── Toolbar ── */}
        <form onSubmit={handleSearch} style={{ display:"flex",gap:"10px",marginBottom:"16px",flexWrap:"wrap" }}>
          <div style={{ flex:1,minWidth:"200px",position:"relative" }}>
            <span style={{ position:"absolute",left:"13px",top:"50%",transform:"translateY(-50%)",color:"#94a3b8",fontSize:"15px",pointerEvents:"none" }}>
              🔍
            </span>
            <input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="Search branches by name, city, or code…"
              style={{
                width:"100%",height:"40px",border:"1px solid #e2e8f0",borderRadius:"10px",
                padding:"0 14px 0 38px",fontSize:"13px",color:"#0f172a",
                background:"rgba(255,255,255,0.8)",outline:"none",boxSizing:"border-box",
                transition:"border-color 0.15s,box-shadow 0.15s",
              }}
              onFocus={e => { e.target.style.borderColor="#2563eb"; e.target.style.boxShadow="0 0 0 3px rgba(37,99,235,0.12)"; }}
              onBlur={e => { e.target.style.borderColor="#e2e8f0"; e.target.style.boxShadow="none"; }}
            />
          </div>
          <button
            type="submit"
            style={{
              height:"40px",padding:"0 20px",background:"#2563eb",color:"#fff",
              border:"none",borderRadius:"10px",fontSize:"13px",fontWeight:600,cursor:"pointer",
            }}
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleClear}
            style={{
              height:"40px",padding:"0 16px",background:"rgba(255,255,255,0.8)",color:"#64748b",
              border:"1px solid #e2e8f0",borderRadius:"10px",fontSize:"13px",fontWeight:500,cursor:"pointer",
            }}
          >
            Clear
          </button>
        </form>

        {/* ── Table Card ── */}
        <div style={{ background:"rgba(255,255,255,0.85)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.5)",borderRadius:"14px",overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,0.06)" }}>

          {/* Card Header */}
          <div style={{ padding:"16px 20px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"12px" }}>
            <div style={{ display:"flex",alignItems:"center",gap:"10px" }}>
              <span style={{ fontSize:"15px" }}>🏪</span>
              <span style={{ fontSize:"14px",fontWeight:600,color:"#0f172a" }}>Branch List</span>
              <span style={{ background:"#eff6ff",color:"#1d4ed8",fontSize:"11px",fontWeight:700,padding:"3px 9px",borderRadius:"20px",border:"1px solid #bfdbfe" }}>
                {filteredBranches.length} locations
              </span>
            </div>

            {/* Filter tabs */}
            <div style={{ display:"flex",gap:"2px",background:"#f1f5f9",borderRadius:"8px",padding:"2px" }}>
              {[
                { key:"all",      label:`All (${totalCount})` },
                { key:"active",   label:`Active (${activeCount})` },
                { key:"inactive", label:`Inactive (${inactiveCount})` },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  style={{
                    padding:"5px 12px",fontSize:"12px",borderRadius:"6px",cursor:"pointer",
                    border:"none",fontWeight:500,transition:"all 0.15s",
                    background: activeFilter === key ? "#fff" : "transparent",
                    color: activeFilter === key ? "#0f172a" : "#64748b",
                    boxShadow: activeFilter === key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ padding:"48px",textAlign:"center",color:"#64748b",fontSize:"13px" }}>
              <div style={{ marginBottom:"8px",fontSize:"20px" }}>⏳</div>
              Loading branches…
            </div>
          ) : filteredBranches.length === 0 ? (
            <div style={{ padding:"48px",textAlign:"center",color:"#94a3b8",fontSize:"13px" }}>
              <div style={{ fontSize:"32px",marginBottom:"8px" }}>🏪</div>
              No branches found
            </div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%",borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:"#f8fafc" }}>
                    {["Branch","Code","Contact","Status","Actions"].map(h => (
                      <th key={h} style={{ padding:"10px 20px",textAlign:"left",fontSize:"11px",fontWeight:700,color:"#94a3b8",letterSpacing:"0.8px",textTransform:"uppercase",borderBottom:"1px solid #f1f5f9",whiteSpace:"nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredBranches.map((b) => {
                    const av = getAvatarColor(b.name);
                    return (
                      <tr
                        key={b._id}
                        style={{ borderBottom:"1px solid #f1f5f9", transition:"background 0.1s" }}
                        onMouseEnter={e => e.currentTarget.style.background="#f8fafc"}
                        onMouseLeave={e => e.currentTarget.style.background="transparent"}
                      >
                        {/* Branch name + city */}
                        <td style={{ padding:"14px 20px" }}>
                          <div style={{ display:"flex",alignItems:"center",gap:"11px" }}>
                            <div style={{
                              width:"36px",height:"36px",borderRadius:"9px",flexShrink:0,
                              background:av.bg,color:av.color,
                              display:"flex",alignItems:"center",justifyContent:"center",
                              fontSize:"12px",fontWeight:700,
                            }}>
                              {getInitials(b.name)}
                            </div>
                            <div>
                              <div style={{ fontSize:"13px",fontWeight:600,color:"#0f172a" }}>{b.name}</div>
                              <div style={{ fontSize:"11px",color:"#94a3b8",marginTop:"2px" }}>{b.city || "—"}</div>
                            </div>
                          </div>
                        </td>

                        {/* Code */}
                        <td style={{ padding:"14px 20px" }}>
                          <span style={{
                            background:"#f1f5f9",border:"1px solid #e2e8f0",color:"#475569",
                            fontSize:"11px",fontWeight:700,padding:"3px 9px",borderRadius:"6px",
                            fontFamily:"monospace",letterSpacing:"0.5px",
                          }}>
                            {b.code || "N/A"}
                          </span>
                        </td>

                        {/* Contact */}
                        <td style={{ padding:"14px 20px" }}>
                          <div style={{ display:"flex",alignItems:"center",gap:"6px",color:"#64748b",fontSize:"12px" }}>
                            📞 {b.contactNumber || "—"}
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ padding:"14px 20px" }}>
                          {b.isActive ? (
                            <span style={{
                              background:"#f0fdf4",color:"#15803d",border:"1px solid #bbf7d0",
                              fontSize:"11px",fontWeight:700,padding:"4px 10px",borderRadius:"20px",
                              display:"inline-flex",alignItems:"center",gap:"5px",
                            }}>
                              <span style={{ width:"6px",height:"6px",borderRadius:"50%",background:"#22c55e",display:"inline-block" }} />
                              Active
                            </span>
                          ) : (
                            <span style={{
                              background:"#fef2f2",color:"#dc2626",border:"1px solid #fecaca",
                              fontSize:"11px",fontWeight:700,padding:"4px 10px",borderRadius:"20px",
                              display:"inline-flex",alignItems:"center",gap:"5px",
                            }}>
                              <span style={{ width:"6px",height:"6px",borderRadius:"50%",background:"#ef4444",display:"inline-block" }} />
                              Inactive
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ padding:"14px 20px" }}>
                          <div style={{ display:"flex",gap:"6px",alignItems:"center" }}>
                            <Link
                              to={`/branches/${b._id}`}
                              style={{
                                display:"inline-flex",alignItems:"center",justifyContent:"center",
                                width:"30px",height:"30px",borderRadius:"7px",
                                border:"1px solid #e2e8f0",background:"#fff",
                                color:"#2563eb",fontSize:"14px",textDecoration:"none",
                                transition:"all 0.1s",
                              }}
                              title="View"
                              onMouseEnter={e => { e.currentTarget.style.background="#eff6ff"; e.currentTarget.style.borderColor="#bfdbfe"; }}
                              onMouseLeave={e => { e.currentTarget.style.background="#fff"; e.currentTarget.style.borderColor="#e2e8f0"; }}
                            >
                              👁
                            </Link>

                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => setEditTarget(b._id)}
                                  title="Edit"
                                  style={{
                                    width:"30px",height:"30px",borderRadius:"7px",
                                    border:"1px solid #e2e8f0",background:"#fff",
                                    color:"#475569",fontSize:"14px",cursor:"pointer",
                                    display:"flex",alignItems:"center",justifyContent:"center",
                                    transition:"all 0.1s",
                                  }}
                                  onMouseEnter={e => { e.currentTarget.style.background="#f8fafc"; e.currentTarget.style.color="#0f172a"; }}
                                  onMouseLeave={e => { e.currentTarget.style.background="#fff"; e.currentTarget.style.color="#475569"; }}
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDelete(b._id)}
                                  title="Delete"
                                  style={{
                                    width:"30px",height:"30px",borderRadius:"7px",
                                    border:"1px solid #e2e8f0",background:"#fff",
                                    color:"#ef4444",fontSize:"14px",cursor:"pointer",
                                    display:"flex",alignItems:"center",justifyContent:"center",
                                    transition:"all 0.1s",
                                  }}
                                  onMouseEnter={e => { e.currentTarget.style.background="#fef2f2"; e.currentTarget.style.borderColor="#fecaca"; }}
                                  onMouseLeave={e => { e.currentTarget.style.background="#fff"; e.currentTarget.style.borderColor="#e2e8f0"; }}
                                >
                                  🗑
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          {!loading && filteredBranches.length > 0 && (
            <div style={{ padding:"12px 20px",borderTop:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <span style={{ fontSize:"12px",color:"#94a3b8" }}>
                Showing {filteredBranches.length} of {totalCount} branches
              </span>
              <span style={{ fontSize:"12px",color:"#94a3b8" }}>
                {activeCount} active · {inactiveCount} inactive
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isAdmin && showAddModal && (
        <AddBranchModal
          onClose={() => setShowAddModal(false)}
          onSuccess={(msg) => { setMessage(msg); setMessageType("success"); fetchBranches(); }}
        />
      )}

      {isAdmin && editTarget && (
        <EditBranchModal
          branchId={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={(msg) => { setMessage(msg); setMessageType("success"); fetchBranches(); }}
        />
      )}
    </>
  );
}

export default BranchListPage;