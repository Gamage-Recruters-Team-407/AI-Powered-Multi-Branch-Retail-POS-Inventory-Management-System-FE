import React, { useState, useEffect } from "react";
import { getAllUsers, createUser, updateUser, deleteUser, searchUsers } from "../../services/userApi";
const ROLES = ["admin", "manager", "cashier"];
const emptyForm = { name: "", email: "", password: "", role: "cashier", phone: "", address: "", status: "active" };
const USERS_PER_PAGE = 6; // change this to control how many rows show per page

export default function UserListPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ========== PAGINATION STATE ==========
  const [currentPage, setCurrentPage] = useState(1);
  // ========================================

  const fetchUsers = async () => {
    try { setLoading(true); const res = await getAllUsers(); setUsers(res.data.data || []); }
    catch { setError("Failed to load users."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // reset to page 1 whenever the search changes
  };

  const openAdd = () => { setEditUser(null); setForm(emptyForm); setFormError(""); setShowModal(true); };
  const openEdit = (u) => { setEditUser(u); setForm({ name: u.firstName ? `${u.firstName} ${u.lastName || ""}`.trim() : u.name || "", email:u.email||"", password:"", role:u.role||"cashier", phone:u.phone||"", address:u.address||"", status:u.status||"active" }); setFormError(""); setShowModal(true); };
  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    if (!form.name || !form.email || (!editUser && !form.password)) { setFormError("Name, Email and Password are required."); return; }
    setSaving(true); setFormError("");
    try {
      const payload = {
        firstName: form.name.split(' ')[0],
        lastName: form.name.split(' ')[1] || '',
        email: form.email,
        password: form.password,
        phone: form.phone,
        address: form.address,
        role: form.role,
        isActive: form.status === 'active',
      };
      if (editUser && !payload.password) delete payload.password;
      editUser ? await updateUser(editUser._id, payload) : await createUser(payload);
      setShowModal(false); fetchUsers();
    } catch (err) { setFormError(err?.response?.data?.message || "Save failed."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await deleteUser(id); setDeleteConfirm(null); fetchUsers(); }
    catch { alert("Delete failed."); }
  };

  const roleConfig = { admin: { bg:"#fef2f2", color:"#dc2626", dot:"#dc2626" }, manager: { bg:"#eff6ff", color:"#2563eb", dot:"#2563eb" }, cashier: { bg:"#f0fdf4", color:"#16a34a", dot:"#16a34a" } };
  const getRoleStyle = (r) => roleConfig[r] || roleConfig.cashier;

  // ========== SEARCH FILTER (client-side) ==========
  const filteredUsers = users.filter(u => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const fullName = u.firstName ? `${u.firstName} ${u.lastName || ""}`.trim() : (u.name || "");
    return fullName.toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q);
  });

  // ========== PAGINATION LOGIC ==========
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  // keep currentPage valid if the users list shrinks (e.g. after delete/search)
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * USERS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // builds a compact page list like: 1, 2, ... , 14  (matches teammate's style)
  const getPageNumbers = () => {
    const pages = [];
    const maxButtons = 5;
    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("...");
      const start = Math.max(2, safePage - 1);
      const end = Math.min(totalPages - 1, safePage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (safePage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };
  // ========================================

  return (
<div className="user-page-container" style={{ padding:"32px", maxWidth:"1200px", margin:"0 auto" }}>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
      `}</style>
    

      {/* Header */}
      <div className="user-header-flex" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"32px" }}>
        <div>
          <h1 style={{ fontSize:"26px", fontWeight:"700", color:"#0f172a", margin:0, letterSpacing:"-0.5px" }}>User Management</h1>
          <p style={{ fontSize:"14px", color:"#64748b", margin:"6px 0 0" }}>Manage system users, roles and permissions</p>
        </div>
        <button onClick={openAdd} style={{ display:"flex", alignItems:"center", gap:"8px", padding:"11px 22px", background:"linear-gradient(135deg,#2563eb,#1d4ed8)", color:"#fff", border:"none", borderRadius:"12px", fontWeight:"600", cursor:"pointer", fontSize:"14px", boxShadow:"0 4px 14px rgba(37,99,235,0.35)", transition:"all 0.2s" }}>
          <span style={{ fontSize:"18px", lineHeight:1 }}>+</span> Add User
        </button>
      </div>

      {/* Search & Stats */}
      <div className="user-stats-grid" style={{ display:"grid", gridTemplateColumns:"1fr auto auto auto", gap:"16px", alignItems:"center", marginBottom:"24px" }}>
        <div style={{ position:"relative" }}>
          <span style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", color:"#94a3b8", fontSize:"16px" }}>🔍</span>
          <input type="text" placeholder="Search users by name or email..." value={search} onChange={handleSearch}
            style={{ width:"100%", padding:"11px 14px 11px 40px", borderRadius:"12px", border:"1.5px solid #e2e8f0", fontSize:"14px", background:"rgba(255,255,255,0.9)", color:"#1e293b", boxSizing:"border-box", outline:"none", backdropFilter:"blur(8px)" }} />
        </div>
        {["admin","manager","cashier"].map(r => (
          <div key={r} style={{ padding:"8px 16px", borderRadius:"10px", background:"rgba(255,255,255,0.8)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.6)", textAlign:"center", minWidth:"80px" }}>
            <div style={{ fontSize:"18px", fontWeight:"700", color:"#1e293b" }}>{users.filter(u => u.role?.toLowerCase()===r).length}</div>
            <div style={{ fontSize:"11px", color:"#64748b", textTransform:"capitalize" }}>{r}s</div>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ padding:"14px 18px", background:"rgba(254,226,226,0.9)", backdropFilter:"blur(8px)", borderRadius:"12px", color:"#dc2626", marginBottom:"20px", border:"1px solid rgba(252,165,165,0.5)", fontSize:"14px", display:"flex", alignItems:"center", gap:"8px" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Table Card */}
      <div className="user-table-wrapper" style={{ background:"rgba(255,255,255,0.85)", backdropFilter:"blur(20px)", borderRadius:"20px", border:"1px solid rgba(255,255,255,0.7)", boxShadow:"0 8px 32px rgba(0,0,0,0.08)", overflowX:"auto" }}>
        {loading ? (
          <div style={{ padding:"80px", textAlign:"center", color:"#94a3b8", fontSize:"15px" }}>
            <div style={{ fontSize:"32px", marginBottom:"12px" }}>⏳</div>Loading users...
          </div>
        ) : (
          <div>
          <div className="custom-scrollbar" style={{ overflowX:"auto", paddingBottom:"4px" }}>
          <table style={{ width:"100%", minWidth:"1400px", borderCollapse:"collapse", fontSize:"14px" }}>
            <thead>
              <tr style={{ background:"rgba(248,250,252,0.8)" }}>
                {["User","Email","Phone","Role","Status","Actions"].map(h => (
                  <th key={h} style={{ padding:"14px 20px", textAlign:"left", fontWeight:"600", color:"#475569", fontSize:"12px", textTransform:"uppercase", letterSpacing:"0.5px", borderBottom:"1px solid rgba(226,232,240,0.8)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={6} style={{ padding:"60px", textAlign:"center", color:"#94a3b8" }}>
                  <div style={{ fontSize:"40px", marginBottom:"12px" }}>👥</div>
                  <div style={{ fontSize:"16px", fontWeight:"500" }}>No users found</div>
                  <div style={{ fontSize:"13px", marginTop:"4px" }}>Add your first user to get started</div>
                </td></tr>
              ) : paginatedUsers.map((user, i) => (
                <tr key={user._id} style={{ borderBottom:"1px solid rgba(241,245,249,0.8)", transition:"background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background="rgba(248,250,252,0.6)"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"16px 20px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                      <div style={{ width:"38px", height:"38px", borderRadius:"12px", background:`linear-gradient(135deg, ${["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#3b82f6"][i%6]}, ${["#8b5cf6","#a78bfa","#f472b6","#fbbf24","#34d399","#60a5fa"][i%6]})`, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:"700", fontSize:"15px", flexShrink:0 }}>
                        {(user.firstName || user.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight:"600", color:"#1e293b", fontSize:"14px" }}>{user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user.name || ""}</div>
                        <div style={{ fontSize:"12px", color:"#94a3b8", marginTop:"2px" }}>ID: {user._id?.slice(-6)}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:"16px 20px", color:"#475569" }}>{user.email}</td>
                  <td style={{ padding:"16px 20px", color:"#64748b" }}>{user.phone || <span style={{ color:"#cbd5e1" }}>—</span>}</td>
                  <td style={{ padding:"16px 20px" }}>
                    <span style={{ display:"inline-flex", alignItems:"center", gap:"6px", padding:"4px 12px", borderRadius:"20px", fontSize:"12px", fontWeight:"600", background:getRoleStyle(user.role).bg, color:getRoleStyle(user.role).color }}>
                      <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:getRoleStyle(user.role).dot }}></span>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding:"16px 20px" }}>
                    <span style={{ display:"inline-flex", alignItems:"center", gap:"6px", padding:"4px 12px", borderRadius:"20px", fontSize:"12px", fontWeight:"600", background:user.isActive!==false?"#f0fdf4":"#f8fafc", color:user.isActive!==false?"#16a34a":"#94a3b8" }}>
                      <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:user.isActive!==false?"#16a34a":"#cbd5e1" }}></span>
                      {user.isActive!==false?"active":"inactive"}
                    </span>
                  </td>

                  {/* ========== UPDATED BUTTONS ========== */}
                  <td style={{ padding:"16px 20px" }}>
                    <div style={{ display:"flex", gap:"8px" }}>
                      <button onClick={()=>openEdit(user)}
                        style={{ display:"flex", alignItems:"center", gap:"6px", padding:"7px 16px", borderRadius:"8px", border:"1.5px solid #e2e8f0", background:"white", cursor:"pointer", fontSize:"13px", fontWeight:"500", color:"#475569", transition:"all 0.15s" }}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor="#2563eb";e.currentTarget.style.color="#2563eb"}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor="#e2e8f0";e.currentTarget.style.color="#475569"}}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit
                      </button>
                      <button onClick={()=>setDeleteConfirm(user)}
                        style={{ display:"flex", alignItems:"center", gap:"6px", padding:"7px 16px", borderRadius:"8px", border:"1.5px solid #fecaca", background:"#fff5f5", cursor:"pointer", fontSize:"13px", fontWeight:"500", color:"#dc2626", transition:"all 0.15s" }}
                        onMouseEnter={e=>{e.currentTarget.style.background="#fef2f2"}}
                        onMouseLeave={e=>{e.currentTarget.style.background="#fff5f5"}}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                  {/* ========== END UPDATED BUTTONS ========== */}

                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div style={{ textAlign:"center", padding:"4px 0 2px", fontSize:"11px", color:"#94a3b8" }}>
            ← scroll to see more →
          </div>
          </div>
        )}

        {/* ========== PAGINATION CONTROLS ========== */}
        {!loading && users.length > 0 && (
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", borderTop:"1px solid rgba(226,232,240,0.8)", background:"rgba(248,250,252,0.6)" }}>
            <div style={{ fontSize:"13px", color:"#64748b" }}>
              Page {safePage} of {totalPages}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
              <button onClick={()=>goToPage(safePage - 1)} disabled={safePage === 1}
                style={{ padding:"7px 14px", borderRadius:"8px", border:"1.5px solid #e2e8f0", background:"white", cursor:safePage===1?"not-allowed":"pointer", fontSize:"13px", fontWeight:"500", color:safePage===1?"#cbd5e1":"#475569" }}>
                ← Prev
              </button>

              {getPageNumbers().map((p, idx) => p === "..." ? (
                <span key={`ellipsis-${idx}`} style={{ padding:"7px 6px", fontSize:"13px", color:"#94a3b8" }}>...</span>
              ) : (
                <button key={p} onClick={()=>goToPage(p)}
                  style={{ padding:"7px 13px", borderRadius:"8px", border:"1.5px solid", borderColor:p===safePage?"#2563eb":"#e2e8f0", background:p===safePage?"#2563eb":"white", cursor:"pointer", fontSize:"13px", fontWeight:"600", color:p===safePage?"white":"#475569", minWidth:"34px" }}>
                  {p}
                </button>
              ))}

              <button onClick={()=>goToPage(safePage + 1)} disabled={safePage === totalPages}
                style={{ padding:"7px 14px", borderRadius:"8px", border:"1.5px solid #e2e8f0", background:"white", cursor:safePage===totalPages?"not-allowed":"pointer", fontSize:"13px", fontWeight:"500", color:safePage===totalPages?"#cbd5e1":"#475569" }}>
                Next →
              </button>
            </div>
          </div>
        )}
        {/* ========== END PAGINATION CONTROLS ========== */}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.5)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:"20px" }}>
          <div style={{ background:"rgba(255,255,255,0.98)", borderRadius:"24px", padding:"36px", width:"520px", maxWidth:"95vw", boxShadow:"0 25px 60px rgba(0,0,0,0.2)", border:"1px solid rgba(255,255,255,0.8)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"28px" }}>
              <div>
                <h2 style={{ fontSize:"20px", fontWeight:"700", color:"#0f172a", margin:0 }}>{editUser ? "Edit User" : "Add New User"}</h2>
                <p style={{ fontSize:"13px", color:"#94a3b8", margin:"4px 0 0" }}>{editUser ? "Update user information" : "Create a new system user"}</p>
              </div>
              <button onClick={()=>setShowModal(false)} style={{ width:"32px", height:"32px", borderRadius:"8px", border:"1px solid #e2e8f0", background:"#f8fafc", cursor:"pointer", fontSize:"16px", color:"#64748b", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
            </div>

            {formError && (
              <div style={{ padding:"12px 16px", background:"#fef2f2", borderRadius:"10px", color:"#dc2626", marginBottom:"20px", fontSize:"13px", border:"1px solid #fecaca" }}>⚠️ {formError}</div>
            )}

            <div style={{ display:"grid", gap:"18px" }}>
              <div className="user-modal-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"18px" }}>
                {[{label:"Full Name",name:"name",type:"text",required:true},{label:"Email Address",name:"email",type:"email",required:true}].map(f => (
                  <div key={f.name}>
                    <label style={{ fontSize:"12px", fontWeight:"600", color:"#475569", display:"block", marginBottom:"8px", textTransform:"uppercase", letterSpacing:"0.5px" }}>{f.label} {f.required && <span style={{ color:"#dc2626" }}>*</span>}</label>
                    <input name={f.name} type={f.type} value={form[f.name]} onChange={handleFormChange} placeholder={f.name==="name"?"John Doe":"john@example.com"}
                      style={{ width:"100%", padding:"10px 14px", borderRadius:"10px", border:"1.5px solid #e2e8f0", fontSize:"14px", color:"#1e293b", boxSizing:"border-box", outline:"none", background:"#fafafa", transition:"border 0.2s" }}
                      onFocus={e=>e.target.style.borderColor="#2563eb"} onBlur={e=>e.target.style.borderColor="#e2e8f0"} />
                  </div>
                ))}
              </div>

              <div>
                <label style={{ fontSize:"12px", fontWeight:"600", color:"#475569", display:"block", marginBottom:"8px", textTransform:"uppercase", letterSpacing:"0.5px" }}>Password {!editUser && <span style={{ color:"#dc2626" }}>*</span>}</label>
                <input name="password" type="password" value={form.password} onChange={handleFormChange} placeholder={editUser ? "Leave blank to keep current" : "Min 6 characters"}
                  style={{ width:"100%", padding:"10px 14px", borderRadius:"10px", border:"1.5px solid #e2e8f0", fontSize:"14px", color:"#1e293b", boxSizing:"border-box", outline:"none", background:"#fafafa" }}
                  onFocus={e=>e.target.style.borderColor="#2563eb"} onBlur={e=>e.target.style.borderColor="#e2e8f0"} />
              </div>

              <div className="user-modal-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"18px" }}>
                {[{label:"Phone",name:"phone",type:"text",placeholder:"+94 77 123 4567"},{label:"Address",name:"address",type:"text",placeholder:"Colombo, Sri Lanka"}].map(f => (
                  <div key={f.name}>
                    <label style={{ fontSize:"12px", fontWeight:"600", color:"#475569", display:"block", marginBottom:"8px", textTransform:"uppercase", letterSpacing:"0.5px" }}>{f.label}</label>
                    <input name={f.name} type={f.type} value={form[f.name]} onChange={handleFormChange} placeholder={f.placeholder}
                      style={{ width:"100%", padding:"10px 14px", borderRadius:"10px", border:"1.5px solid #e2e8f0", fontSize:"14px", color:"#1e293b", boxSizing:"border-box", outline:"none", background:"#fafafa" }}
                      onFocus={e=>e.target.style.borderColor="#2563eb"} onBlur={e=>e.target.style.borderColor="#e2e8f0"} />
                  </div>
                ))}
              </div>

              <div className="user-modal-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"18px" }}>
                <div>
                  <label style={{ fontSize:"12px", fontWeight:"600", color:"#475569", display:"block", marginBottom:"8px", textTransform:"uppercase", letterSpacing:"0.5px" }}>Role</label>
                  <select name="role" value={form.role} onChange={handleFormChange}
                    style={{ width:"100%", padding:"10px 14px", borderRadius:"10px", border:"1.5px solid #e2e8f0", fontSize:"14px", color:"#1e293b", background:"#fafafa", outline:"none" }}>
                    {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:"12px", fontWeight:"600", color:"#475569", display:"block", marginBottom:"8px", textTransform:"uppercase", letterSpacing:"0.5px" }}>Status</label>
                  <select name="status" value={form.status} onChange={handleFormChange}
                    style={{ width:"100%", padding:"10px 14px", borderRadius:"10px", border:"1.5px solid #e2e8f0", fontSize:"14px", color:"#1e293b", background:"#fafafa", outline:"none" }}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display:"flex", gap:"12px", marginTop:"28px", justifyContent:"flex-end" }}>
              <button onClick={()=>setShowModal(false)} style={{ padding:"10px 22px", borderRadius:"10px", border:"1.5px solid #e2e8f0", background:"white", cursor:"pointer", fontSize:"14px", fontWeight:"500", color:"#64748b" }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ padding:"10px 22px", borderRadius:"10px", border:"none", background:"linear-gradient(135deg,#2563eb,#1d4ed8)", color:"#fff", cursor:"pointer", fontSize:"14px", fontWeight:"600", boxShadow:"0 4px 14px rgba(37,99,235,0.35)", opacity:saving?0.7:1 }}>
                {saving ? "Saving..." : editUser ? "Update User" : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.5)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:"20px" }}>
          <div style={{ background:"white", borderRadius:"20px", padding:"32px", width:"400px", maxWidth:"100%", boxShadow:"0 25px 60px rgba(0,0,0,0.2)", textAlign:"center" }}>
            <div style={{ width:"56px", height:"56px", borderRadius:"16px", background:"#fef2f2", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", fontSize:"24px" }}>🗑️</div>
            <h3 style={{ fontSize:"18px", fontWeight:"700", color:"#0f172a", margin:"0 0 8px" }}>Delete User</h3>
            <p style={{ fontSize:"14px", color:"#64748b", margin:"0 0 24px" }}>Are you sure you want to delete <strong style={{ color:"#1e293b" }}>{deleteConfirm.firstName || deleteConfirm.name}</strong>? This action cannot be undone.</p>
            <div style={{ display:"flex", gap:"12px", justifyContent:"center" }}>
              <button onClick={()=>setDeleteConfirm(null)} style={{ padding:"10px 24px", borderRadius:"10px", border:"1.5px solid #e2e8f0", background:"white", cursor:"pointer", fontSize:"14px", fontWeight:"500", color:"#64748b" }}>Cancel</button>
              <button onClick={()=>handleDelete(deleteConfirm._id)} style={{ padding:"10px 24px", borderRadius:"10px", border:"none", background:"linear-gradient(135deg,#dc2626,#b91c1c)", color:"#fff", cursor:"pointer", fontSize:"14px", fontWeight:"600", boxShadow:"0 4px 14px rgba(220,38,38,0.3)" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .user-page-container { padding: 16px !important; }
          .user-header-flex { flex-direction: column; align-items: flex-start !important; gap: 16px; }
          .user-stats-grid { grid-template-columns: 1fr !important; }
          .user-modal-grid { grid-template-columns: 1fr !important; }
          .user-table-wrapper { border-radius: 12px !important; }
        }
      `}</style>
    </div>
  );
}
