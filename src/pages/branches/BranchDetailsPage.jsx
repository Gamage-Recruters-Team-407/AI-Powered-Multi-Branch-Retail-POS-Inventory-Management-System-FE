import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getBranchById,
  getBranchInventory,
  getBranchSales,
  getBranchEmployees,
  getBranchPerformance,
} from "../../services/branchApi";
import EditBranchModal from "./EditBranchModal";
import SaleDetailsModal from "../../components/SaleDetailsModal";
import { useAuth } from "../../context/AuthContext";
import {
  Store, Pencil, ArrowLeft, Hash, Phone, UserCircle2, MapPin,
  Package, Wallet, Users, BarChart3, Building2, ShoppingBag,
  DollarSign, Receipt, CreditCard, Eye, RefreshCcw, Download,
  ChevronDown, Calendar as CalendarIcon, Search,
} from "lucide-react";

/* ── constants ─────────────────────────────────────────────────────── */
const SALES_PERIODS  = [{ id:"today",label:"Today"},{id:"week",label:"Week"},{id:"month",label:"Month"}];
const EXPORT_PERIODS = [
  {id:"today",label:"Today"},{id:"week",label:"This Week"},
  {id:"month",label:"This Month"},{id:"custom",label:"Custom Range"},{id:"all",label:"All Time"},
];
const STATUS_STYLES  = { COMPLETED:"#f0fdf4|#15803d|#bbf7d0", VOIDED:"#fef2f2|#dc2626|#fecaca", REFUNDED:"#fffbeb|#92400e|#fde68a" };
const PAYMENT_STYLES = { CASH:"#eff6ff|#1d4ed8|#bfdbfe", CARD:"#f5f3ff|#5b21b6|#ddd6fe", QR:"#fdf2f8|#86198f|#f9a8d4" };

const AVATAR_COLORS = [
  {bg:"#eff6ff",color:"#1e40af"},{bg:"#f0fdfa",color:"#0f766e"},
  {bg:"#f5f3ff",color:"#5b21b6"},{bg:"#fffbeb",color:"#92400e"},
  {bg:"#fdf2f8",color:"#86198f"},{bg:"#f0fdf4",color:"#166534"},
];
function getAvatarColor(str=""){
  let h=0; for(let i=0;i<str.length;i++) h=str.charCodeAt(i)+((h<<5)-h);
  return AVATAR_COLORS[Math.abs(h)%AVATAR_COLORS.length];
}
function getInitials(name=""){
  const p=name.trim().split(/\s+/);
  return p.length===1?p[0].slice(0,2).toUpperCase():(p[0][0]+p[p.length-1][0]).toUpperCase();
}
function pillStyle(map,key){
  const v=(map[key]||"#f1f5f9|#475569|#e2e8f0").split("|");
  return {background:v[0],color:v[1],border:`1px solid ${v[2]}`,
    fontSize:"11px",fontWeight:700,padding:"3px 10px",borderRadius:"20px",
    display:"inline-flex",alignItems:"center",gap:"4px"};
}

/* ── helpers ────────────────────────────────────────────────────────── */
function isWithinPeriod(d,period){
  if(!d) return false;
  const date=new Date(d), now=new Date();
  if(period==="today") return date.toDateString()===now.toDateString();
  if(period==="week"){ const w=new Date(now); w.setDate(now.getDate()-7); return date>=w&&date<=now; }
  if(period==="month") return date.getMonth()===now.getMonth()&&date.getFullYear()===now.getFullYear();
  return true;
}
function isWithinCustomRange(d,start,end){
  if(!d) return false;
  const date=new Date(d);
  if(start){ const s=new Date(start); s.setHours(0,0,0,0); if(date<s) return false; }
  if(end)  { const e=new Date(end);   e.setHours(23,59,59,999); if(date>e) return false; }
  return true;
}
function csvEscape(v){ const s=String(v??""); return(s.includes(",")||s.includes('"')||s.includes("\n"))?`"${s.replace(/"/g,'""')}"`:s; }
function sortDesc(list){ return [...list].sort((a,b)=>(b.createdAt?new Date(b.createdAt):0)-(a.createdAt?new Date(a.createdAt):0)); }

/* ── shared sub-components ──────────────────────────────────────────── */
function Pagination({ page, total, perPage, setPage }) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (total <= perPage) return null;
  return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:"16px",padding:"0 4px" }}>
      <span style={{ fontSize:"12px",color:"#94a3b8" }}>
        Showing {(page-1)*perPage+1}–{Math.min(page*perPage,total)} of {total}
      </span>
      <div style={{ display:"flex",gap:"4px" }}>
        <PagBtn label="← Prev" disabled={page===1}    onClick={()=>setPage(p=>Math.max(1,p-1))}/>
        {Array.from({length:pages},(_,i)=>i+1).map(n=>(
          <PagBtn key={n} label={n} active={page===n} onClick={()=>setPage(n)}/>
        ))}
        <PagBtn label="Next →" disabled={page===pages} onClick={()=>setPage(p=>Math.min(pages,p+1))}/>
      </div>
    </div>
  );
}
function PagBtn({label,disabled,active,onClick}){
  return(
    <button onClick={onClick} disabled={disabled} style={{
      minWidth:"32px",height:"32px",padding:"0 10px",borderRadius:"7px",border:"1px solid #e2e8f0",
      background:active?"#2563eb":"#fff",color:active?"#fff":"#475569",
      fontSize:"12px",fontWeight:600,cursor:disabled?"not-allowed":"pointer",
      opacity:disabled?0.4:1,transition:"all 0.1s",
    }}>
      {label}
    </button>
  );
}

function TabBtn({id,label,Icon,active,onClick}){
  return(
    <button onClick={()=>onClick(id)} style={{
      display:"flex",alignItems:"center",gap:"7px",padding:"8px 16px",borderRadius:"8px",
      border:"none",cursor:"pointer",fontSize:"12px",fontWeight:600,transition:"all 0.15s",
      background:active?"#2563eb":"transparent",color:active?"#fff":"#64748b",
      whiteSpace:"nowrap",
    }}
    onMouseEnter={e=>{ if(!active){ e.currentTarget.style.background="#f1f5f9"; e.currentTarget.style.color="#0f172a"; }}}
    onMouseLeave={e=>{ if(!active){ e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#64748b"; }}}
    >
      <Icon size={14}/>{label}
    </button>
  );
}

function SectionHeader({title,sub,children}){
  return(
    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"12px",marginBottom:"16px" }}>
      <div>
        <h2 style={{ fontSize:"15px",fontWeight:700,color:"#0f172a",margin:0 }}>{title}</h2>
        {sub && <p style={{ fontSize:"12px",color:"#94a3b8",margin:"2px 0 0" }}>{sub}</p>}
      </div>
      {children}
    </div>
  );
}

function Card({children,style={}}){
  return(
    <div style={{ background:"rgba(255,255,255,0.85)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.5)",borderRadius:"14px",overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,0.06)",...style }}>
      {children}
    </div>
  );
}

function EmptyState({Icon:I,text}){
  return(
    <div style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>
      <I size={36} style={{ marginBottom:"10px",opacity:0.35 }}/>
      <p style={{ fontSize:"13px",fontWeight:600,margin:0 }}>{text}</p>
    </div>
  );
}

function THead({cols}){
  return(
    <thead>
      <tr style={{ background:"#f8fafc" }}>
        {cols.map(c=>(
          <th key={c} style={{ padding:"10px 20px",textAlign:"left",fontSize:"11px",fontWeight:700,color:"#94a3b8",letterSpacing:"0.8px",textTransform:"uppercase",borderBottom:"1px solid #f1f5f9",whiteSpace:"nowrap" }}>
            {c}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function SearchBox({value,onChange,placeholder}){
  return(
    <div style={{ position:"relative",width:"240px" }}>
      <Search size={14} style={{ position:"absolute",left:"12px",top:"50%",transform:"translateY(-50%)",color:"#94a3b8",pointerEvents:"none" }}/>
      <input value={value} onChange={onChange} placeholder={placeholder} style={{
        width:"100%",height:"36px",border:"1px solid #e2e8f0",borderRadius:"10px",
        padding:"0 12px 0 34px",fontSize:"12px",color:"#0f172a",background:"rgba(255,255,255,0.8)",
        outline:"none",boxSizing:"border-box",
      }}
      onFocus={e=>{e.target.style.borderColor="#2563eb";e.target.style.boxShadow="0 0 0 3px rgba(37,99,235,0.12)";}}
      onBlur={e=>{e.target.style.borderColor="#e2e8f0";e.target.style.boxShadow="none";}}
      />
    </div>
  );
}

/* ══ main component ═════════════════════════════════════════════════════ */
export default function BranchDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [branch,      setBranch]      = useState(null);
  const [inventory,   setInventory]   = useState([]);
  const [sales,       setSales]       = useState([]);
  const [employees,   setEmployees]   = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [activeTab,   setActiveTab]   = useState("info");
  const [showEditModal,   setShowEditModal]   = useState(false);
  const [selectedSale,    setSelectedSale]    = useState(null);

  const [salesPage,     setSalesPage]     = useState(1);
  const [inventoryPage, setInventoryPage] = useState(1);
  const [employeePage,  setEmployeePage]  = useState(1);

  const [salesPeriod,    setSalesPeriod]    = useState("today");
  const [paymentFilter,  setPaymentFilter]  = useState("ALL");
  const [inventorySearch,setInventorySearch]= useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");

  const [showExportPanel, setShowExportPanel] = useState(false);
  const [exportPeriod,    setExportPeriod]    = useState("today");
  const [exportPayment,   setExportPayment]   = useState("ALL");
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate,   setExportEndDate]   = useState("");

  const PER = 10;

  const fetchData = async () => {
    try {
      const [bR,iR,sR,eR,pR] = await Promise.all([
        getBranchById(id),
        getBranchInventory(id).catch(()=>({data:[]})),
        getBranchSales(id).catch(()=>({data:[]})),
        getBranchEmployees(id).catch(()=>({data:[]})),
        getBranchPerformance(id).catch(()=>({data:{}})),
      ]);
      setBranch(bR.data);
      setInventory(iR.data||[]);
      setSales(sR.data||[]);
      setEmployees(eR.data||[]);
      setPerformance(pR.data||{});
      setSalesPage(1); setInventoryPage(1); setEmployeePage(1);
    } catch(e){ console.error(e); }
    finally{ setLoading(false); }
  };

  useEffect(()=>{ fetchData(); },[id]);

  const sortedSales     = useMemo(()=>sortDesc(sales),     [sales]);
  const sortedInventory = useMemo(()=>sortDesc(inventory), [inventory]);
  const sortedEmployees = useMemo(()=>sortDesc(employees), [employees]);

  const periodSales   = useMemo(()=>sortedSales.filter(s=>isWithinPeriod(s.createdAt,salesPeriod)),[sortedSales,salesPeriod]);
  const filteredSales = useMemo(()=>paymentFilter==="ALL"?periodSales:periodSales.filter(s=>s.paymentMethod===paymentFilter),[periodSales,paymentFilter]);

  const salesStats = useMemo(()=>{
    const rev=periodSales.reduce((s,x)=>s+(x.totalAmount||0),0);
    const tx=periodSales.length;
    return{ revenue:rev, transactions:tx, avgValue:tx>0?rev/tx:0,
      cash:periodSales.filter(s=>s.paymentMethod==="CASH").length,
      card:periodSales.filter(s=>s.paymentMethod==="CARD").length,
      qr:  periodSales.filter(s=>s.paymentMethod==="QR").length,
    };
  },[periodSales]);

  const filteredInventory = useMemo(()=>{
    if(!inventorySearch.trim()) return sortedInventory;
    const q=inventorySearch.trim().toLowerCase();
    return sortedInventory.filter(i=>(i.product?.name||"").toLowerCase().includes(q));
  },[sortedInventory,inventorySearch]);

  const filteredEmployees = useMemo(()=>{
    if(!employeeSearch.trim()) return sortedEmployees;
    const q=employeeSearch.trim().toLowerCase();
    return sortedEmployees.filter(e=>(e.name||"").toLowerCase().includes(q)||(e.role||"").toLowerCase().includes(q)||(e.email||"").toLowerCase().includes(q));
  },[sortedEmployees,employeeSearch]);

  const getManagerName = m=>{ if(!m) return "N/A"; if(typeof m==="string") return m; return(`${m.firstName||""} ${m.lastName||""}`.trim()||m.email||"N/A"); };
  const getCashierName = c=>{ if(!c) return "N/A"; if(typeof c==="string") return c; return(`${c.firstName||""} ${c.lastName||""}`.trim()||c.email||"N/A"); };

  const handleDownloadCsv = ()=>{
    let ex=sortedSales;
    if(exportPeriod==="custom") ex=ex.filter(s=>isWithinCustomRange(s.createdAt,exportStartDate,exportEndDate));
    else if(exportPeriod!=="all") ex=ex.filter(s=>isWithinPeriod(s.createdAt,exportPeriod));
    if(exportPayment!=="ALL") ex=ex.filter(s=>s.paymentMethod===exportPayment);
    const headers=["Invoice Number","Date & Time","Cashier","Item Name","Quantity","Unit Price","Line Total","Sale Subtotal","Discount","Tax","Sale Total","Payment Method","Status"];
    const rows=[];
    ex.forEach(sale=>{
      const dt=sale.createdAt?new Date(sale.createdAt).toLocaleString():"N/A";
      const cn=getCashierName(sale.cashier);
      if(sale.items?.length>0){
        sale.items.forEach(item=>rows.push([sale.invoiceNumber||"N/A",dt,cn,item.name||"N/A",item.quantity??"",Number(item.unitPrice??0).toFixed(2),Number(item.lineTotal??0).toFixed(2),Number(sale.subtotal??0).toFixed(2),Number(sale.discountAmount??0).toFixed(2),Number(sale.taxAmount??0).toFixed(2),Number(sale.totalAmount??0).toFixed(2),sale.paymentMethod||"N/A",sale.status||"N/A"]));
      } else {
        rows.push([sale.invoiceNumber||"N/A",dt,cn,"","","","",Number(sale.subtotal??0).toFixed(2),Number(sale.discountAmount??0).toFixed(2),Number(sale.taxAmount??0).toFixed(2),Number(sale.totalAmount??0).toFixed(2),sale.paymentMethod||"N/A",sale.status||"N/A"]);
      }
    });
    const csv=[headers.map(csvEscape).join(","),...rows.map(r=>r.map(csvEscape).join(","))].join("\n");
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url; a.setAttribute("download",`sales_${(branch?.code||"branch").replace(/\s+/g,"_")}_${exportPeriod}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    setShowExportPanel(false);
  };

  /* ── loading / not found ── */
  if (loading) return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",minHeight:"300px",color:"#64748b",fontSize:"14px",gap:"10px" }}>
      <div style={{ width:"18px",height:"18px",border:"2px solid #e2e8f0",borderTopColor:"#2563eb",borderRadius:"50%",animation:"spin 0.7s linear infinite" }}/>
      Loading branch…
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!branch) return (
    <div style={{ textAlign:"center",padding:"48px",color:"#94a3b8",fontSize:"14px" }}>Branch not found</div>
  );

  const av = getAvatarColor(branch.name);
  const paginatedSales     = filteredSales.slice((salesPage-1)*PER,salesPage*PER);
  const paginatedInventory = filteredInventory.slice((inventoryPage-1)*PER,inventoryPage*PER);
  const paginatedEmployees = filteredEmployees.slice((employeePage-1)*PER,employeePage*PER);

  /* ── render ── */
  return (
    <>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        .bdp-tr:hover{background:#f8fafc!important}
        .bdp-act:hover{background:#f1f5f9!important}
      `}</style>

      <div style={{ padding:"0 0 2rem",fontFamily:"inherit" }}>

        {/* ══ HEADER BANNER ══ */}
        <div style={{
          background:"linear-gradient(135deg,#1a2744 0%,#0f3460 55%,#16213e 100%)",
          borderRadius:"16px",padding:"28px 32px",marginBottom:"20px",
          display:"flex",alignItems:"center",justifyContent:"space-between",
          flexWrap:"wrap",gap:"20px",position:"relative",overflow:"hidden",
        }}>
          <div style={{ position:"absolute",right:"-40px",top:"-40px",width:"200px",height:"200px",borderRadius:"50%",background:"rgba(255,255,255,0.04)" }}/>
          <div style={{ position:"absolute",right:"80px",bottom:"-60px",width:"140px",height:"140px",borderRadius:"50%",background:"rgba(99,179,237,0.07)" }}/>

          <div style={{ display:"flex",alignItems:"center",gap:"16px",position:"relative",zIndex:1 }}>
            <div style={{ width:"54px",height:"54px",borderRadius:"14px",background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
              <Store size={26} color="#fff"/>
            </div>
            <div>
              <p style={{ fontSize:"11px",fontWeight:600,color:"rgba(163,216,255,0.7)",letterSpacing:"1.5px",textTransform:"uppercase",margin:"0 0 4px" }}>
                Branch Management
              </p>
              <h1 style={{ fontSize:"26px",fontWeight:700,color:"#fff",margin:"0 0 4px",letterSpacing:"-0.3px" }}>
                {branch.name}
              </h1>
              <p style={{ fontSize:"12px",color:"rgba(255,255,255,0.45)",margin:0,display:"flex",alignItems:"center",gap:"4px" }}>
                <MapPin size={12}/>{branch.city||"Location not set"}
              </p>
            </div>
          </div>

          <div style={{ display:"flex",gap:"8px",position:"relative",zIndex:1 }}>
            {isAdmin && (
              <button onClick={()=>setShowEditModal(true)} style={{
                display:"flex",alignItems:"center",gap:"7px",background:"#2563eb",color:"#fff",
                border:"none",borderRadius:"10px",padding:"10px 20px",fontSize:"13px",fontWeight:600,cursor:"pointer",
              }}
              onMouseEnter={e=>e.currentTarget.style.background="#1d4ed8"}
              onMouseLeave={e=>e.currentTarget.style.background="#2563eb"}
              >
                <Pencil size={14}/> Edit
              </button>
            )}
            <button onClick={()=>navigate(-1)} style={{
              display:"flex",alignItems:"center",gap:"7px",background:"rgba(255,255,255,0.12)",color:"#fff",
              border:"1px solid rgba(255,255,255,0.2)",borderRadius:"10px",padding:"10px 20px",fontSize:"13px",fontWeight:600,cursor:"pointer",
            }}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.18)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.12)"}
            >
              <ArrowLeft size={14}/> Back
            </button>
          </div>
        </div>

        {/* ══ QUICK INFO CARDS ══ */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"12px",marginBottom:"20px" }}>
          {[
            { label:"Code",    value:branch.code||"N/A",        icon:<Hash size={18}/>,        bg:"#eff6ff", ic:"#2563eb" },
            { label:"Contact", value:branch.contactNumber||"N/A",icon:<Phone size={18}/>,      bg:"#f0fdf4", ic:"#16a34a" },
            { label:"Manager", value:getManagerName(branch.manager),icon:<UserCircle2 size={18}/>, bg:"#f5f3ff", ic:"#7c3aed" },
          ].map(({label,value,icon,bg,ic})=>(
            <Card key={label}>
              <div style={{ padding:"16px 20px",display:"flex",alignItems:"center",gap:"12px" }}>
                <div style={{ width:"38px",height:"38px",borderRadius:"10px",background:bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:ic }}>
                  {icon}
                </div>
                <div style={{ minWidth:0 }}>
                  <p style={{ fontSize:"11px",fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.7px",margin:"0 0 3px" }}>{label}</p>
                  <p style={{ fontSize:"13px",fontWeight:700,color:"#0f172a",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{value}</p>
                </div>
              </div>
            </Card>
          ))}
          <Card>
            <div style={{ padding:"16px 20px",display:"flex",alignItems:"center",gap:"12px" }}>
              <div style={{ width:"38px",height:"38px",borderRadius:"10px",background:branch.isActive?"#f0fdf4":"#fef2f2",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:branch.isActive?"#16a34a":"#dc2626" }}>
                <Building2 size={18}/>
              </div>
              <div>
                <p style={{ fontSize:"11px",fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.7px",margin:"0 0 5px" }}>Status</p>
                <span style={{
                  background:branch.isActive?"#f0fdf4":"#fef2f2",
                  color:branch.isActive?"#15803d":"#dc2626",
                  border:`1px solid ${branch.isActive?"#bbf7d0":"#fecaca"}`,
                  fontSize:"11px",fontWeight:700,padding:"3px 10px",borderRadius:"20px",
                  display:"inline-flex",alignItems:"center",gap:"5px",
                }}>
                  <span style={{ width:"6px",height:"6px",borderRadius:"50%",background:branch.isActive?"#22c55e":"#ef4444",display:"inline-block" }}/>
                  {branch.isActive?"Active":"Inactive"}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* ══ TABS ══ */}
        <div style={{ display:"flex",gap:"2px",background:"rgba(255,255,255,0.6)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.4)",borderRadius:"12px",padding:"4px",marginBottom:"20px",overflowX:"auto",width:"fit-content" }}>
          {[
            {id:"info",      label:"Info",        Icon:Store},
            {id:"inventory", label:"Inventory",   Icon:Package},
            {id:"sales",     label:"Sales",       Icon:Wallet},
            {id:"employees", label:"Employees",   Icon:Users},
            {id:"performance",label:"Performance",Icon:BarChart3},
          ].map(t=>(
            <TabBtn key={t.id} {...t} active={activeTab===t.id} onClick={setActiveTab}/>
          ))}
        </div>

        {/* ══ TAB CONTENT ══ */}

        {/* INFO */}
        {activeTab==="info" && (
          <Card>
            <div style={{ padding:"20px 24px",borderBottom:"1px solid #f1f5f9" }}>
              <h2 style={{ fontSize:"14px",fontWeight:700,color:"#0f172a",margin:0 }}>Branch Information</h2>
              <p style={{ fontSize:"12px",color:"#94a3b8",margin:"2px 0 0" }}>Full details for this branch</p>
            </div>
            <div style={{ padding:"20px 24px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"12px" }}>
              {[
                {label:"Name",    value:branch.name,                     bg:"#eff6ff", ic:"#2563eb",  Icon:Store},
                {label:"Code",    value:branch.code||"N/A",              bg:"#f5f3ff", ic:"#7c3aed",  Icon:Hash},
                {label:"City",    value:branch.city||"N/A",              bg:"#f0fdf4", ic:"#16a34a",  Icon:MapPin},
                {label:"Contact", value:branch.contactNumber||"N/A",     bg:"#fffbeb", ic:"#d97706",  Icon:Phone},
                {label:"Manager", value:getManagerName(branch.manager),   bg:"#f5f3ff", ic:"#7c3aed",  Icon:UserCircle2},
                {label:"Address", value:branch.address||"N/A",           bg:"#fef2f2", ic:"#dc2626",  Icon:MapPin},
              ].map(({label,value,bg,ic,Icon:I})=>(
                <div key={label} style={{ display:"flex",alignItems:"center",gap:"12px",padding:"14px 16px",borderRadius:"12px",border:"1px solid #f1f5f9",background:"rgba(255,255,255,0.6)" }}>
                  <div style={{ width:"38px",height:"38px",borderRadius:"10px",background:bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:ic }}>
                    <I size={17}/>
                  </div>
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontSize:"11px",fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.7px",margin:"0 0 3px" }}>{label}</p>
                    <p style={{ fontSize:"13px",fontWeight:600,color:"#0f172a",margin:0,wordBreak:"break-word" }}>{value}</p>
                  </div>
                </div>
              ))}
              {/* Status field */}
              <div style={{ display:"flex",alignItems:"center",gap:"12px",padding:"14px 16px",borderRadius:"12px",border:"1px solid #f1f5f9",background:"rgba(255,255,255,0.6)" }}>
                <div style={{ width:"38px",height:"38px",borderRadius:"10px",background:branch.isActive?"#f0fdf4":"#fef2f2",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:branch.isActive?"#16a34a":"#dc2626" }}>
                  <Building2 size={17}/>
                </div>
                <div>
                  <p style={{ fontSize:"11px",fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.7px",margin:"0 0 5px" }}>Status</p>
                  <span style={{ background:branch.isActive?"#f0fdf4":"#fef2f2",color:branch.isActive?"#15803d":"#dc2626",border:`1px solid ${branch.isActive?"#bbf7d0":"#fecaca"}`,fontSize:"11px",fontWeight:700,padding:"3px 10px",borderRadius:"20px",display:"inline-flex",alignItems:"center",gap:"5px" }}>
                    <span style={{ width:"6px",height:"6px",borderRadius:"50%",background:branch.isActive?"#22c55e":"#ef4444",display:"inline-block" }}/>
                    {branch.isActive?"Active":"Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* INVENTORY */}
        {activeTab==="inventory" && (
          <div>
            <SectionHeader title="Inventory" sub="Stock levels for this branch">
              <SearchBox value={inventorySearch} onChange={e=>{setInventorySearch(e.target.value);setInventoryPage(1);}} placeholder="Search products…"/>
            </SectionHeader>
            <Card>
              {paginatedInventory.length===0 ? <EmptyState Icon={Package} text={inventorySearch?"No products match your search":"No inventory data for this branch"}/> : (
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%",borderCollapse:"collapse" }}>
                    <THead cols={["Product","Quantity","Price"]}/>
                    <tbody>
                      {paginatedInventory.map((item,i)=>{
                        const av2=getAvatarColor(item.product?.name||"P");
                        return(
                          <tr key={i} className="bdp-tr" style={{ borderBottom:"1px solid #f1f5f9" }}>
                            <td style={{ padding:"14px 20px" }}>
                              <div style={{ display:"flex",alignItems:"center",gap:"10px" }}>
                                <div style={{ width:"32px",height:"32px",borderRadius:"8px",background:av2.bg,color:av2.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:700,flexShrink:0 }}>
                                  {getInitials(item.product?.name||"P")}
                                </div>
                                <span style={{ fontSize:"13px",fontWeight:600,color:"#0f172a" }}>{item.product?.name||"Unknown"}</span>
                              </div>
                            </td>
                            <td style={{ padding:"14px 20px" }}>
                              <span style={{ background:"#eff6ff",color:"#1d4ed8",border:"1px solid #bfdbfe",fontSize:"11px",fontWeight:700,padding:"3px 10px",borderRadius:"20px" }}>
                                {item.quantity}
                              </span>
                            </td>
                            <td style={{ padding:"14px 20px",fontSize:"13px",fontWeight:600,color:"#0f172a" }}>
                              Rs {item.product?.price??"N/A"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
            <Pagination page={inventoryPage} total={filteredInventory.length} perPage={PER} setPage={setInventoryPage}/>
          </div>
        )}

        {/* SALES */}
        {activeTab==="sales" && (
          <div>
            <SectionHeader title="Sales History" sub="Sales recorded for this branch only">
              <div style={{ display:"flex",gap:"8px" }}>
                <button onClick={fetchData} style={{ display:"flex",alignItems:"center",gap:"6px",height:"36px",padding:"0 14px",border:"1px solid #e2e8f0",borderRadius:"10px",background:"rgba(255,255,255,0.8)",color:"#475569",fontSize:"12px",fontWeight:600,cursor:"pointer" }}>
                  <RefreshCcw size={13}/> Refresh
                </button>
                <div style={{ position:"relative" }}>
                  <button onClick={()=>setShowExportPanel(v=>!v)} style={{ display:"flex",alignItems:"center",gap:"6px",height:"36px",padding:"0 14px",border:"none",borderRadius:"10px",background:"#2563eb",color:"#fff",fontSize:"12px",fontWeight:600,cursor:"pointer" }}>
                    <Download size={13}/> Export CSV <ChevronDown size={13} style={{ transform:showExportPanel?"rotate(180deg)":"none",transition:"0.2s" }}/>
                  </button>
                  {showExportPanel && (
                    <>
                      <div style={{ position:"fixed",inset:0,zIndex:10 }} onClick={()=>setShowExportPanel(false)}/>
                      <div style={{ position:"absolute",right:0,top:"44px",width:"280px",background:"#fff",border:"1px solid #e2e8f0",borderRadius:"14px",boxShadow:"0 8px 32px rgba(0,0,0,0.12)",padding:"20px",zIndex:20 }}>
                        <p style={{ fontSize:"11px",fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.8px",margin:"0 0 14px" }}>Export Filters</p>
                        <p style={{ fontSize:"12px",fontWeight:600,color:"#475569",margin:"0 0 8px" }}>Date Range</p>
                        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px",marginBottom:"14px" }}>
                          {EXPORT_PERIODS.map(p=>(
                            <button key={p.id} onClick={()=>setExportPeriod(p.id)} style={{ padding:"7px",borderRadius:"8px",border:"none",fontSize:"11px",fontWeight:600,cursor:"pointer",background:exportPeriod===p.id?"#2563eb":"#f1f5f9",color:exportPeriod===p.id?"#fff":"#475569" }}>
                              {p.label}
                            </button>
                          ))}
                        </div>
                        {exportPeriod==="custom" && (
                          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"14px" }}>
                            {[["Start",exportStartDate,setExportStartDate],["End",exportEndDate,setExportEndDate]].map(([lbl,val,fn])=>(
                              <div key={lbl}>
                                <p style={{ fontSize:"11px",fontWeight:600,color:"#64748b",margin:"0 0 4px",display:"flex",alignItems:"center",gap:"4px" }}><CalendarIcon size={11}/>{lbl}</p>
                                <input type="date" value={val} onChange={e=>fn(e.target.value)} style={{ width:"100%",fontSize:"11px",border:"1px solid #e2e8f0",borderRadius:"8px",padding:"6px 8px",outline:"none",boxSizing:"border-box" }}/>
                              </div>
                            ))}
                          </div>
                        )}
                        <p style={{ fontSize:"12px",fontWeight:600,color:"#475569",margin:"0 0 8px" }}>Payment Method</p>
                        <select value={exportPayment} onChange={e=>setExportPayment(e.target.value)} style={{ width:"100%",fontSize:"12px",border:"1px solid #e2e8f0",borderRadius:"8px",padding:"8px 10px",outline:"none",marginBottom:"16px",background:"#f8fafc" }}>
                          <option value="ALL">All Payment Methods</option>
                          <option value="CASH">Cash</option>
                          <option value="CARD">Card</option>
                          <option value="QR">QR</option>
                        </select>
                        <button onClick={handleDownloadCsv} style={{ width:"100%",background:"#16a34a",color:"#fff",border:"none",borderRadius:"10px",padding:"10px",fontSize:"12px",fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px" }}>
                          <Download size={13}/> Download CSV
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </SectionHeader>

            {/* Stats */}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:"12px",marginBottom:"16px" }}>
              {[
                {label:"Revenue",      value:`Rs.${salesStats.revenue.toLocaleString(undefined,{maximumFractionDigits:0})}`, bg:"#f0fdf4",ic:"#16a34a",Icon:DollarSign},
                {label:"Transactions", value:salesStats.transactions,                                                         bg:"#fffbeb",ic:"#d97706",Icon:BarChart3},
                {label:"Avg. Value",   value:`Rs.${salesStats.avgValue.toLocaleString(undefined,{maximumFractionDigits:0})}`, bg:"#eff6ff",ic:"#2563eb",Icon:DollarSign},
                {label:"Cash/Card/QR", value:`${salesStats.cash}/${salesStats.card}/${salesStats.qr}`,                        bg:"#f5f3ff",ic:"#7c3aed",Icon:CreditCard},
              ].map(({label,value,bg,ic,Icon:I})=>(
                <Card key={label}>
                  <div style={{ padding:"16px 20px" }}>
                    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px" }}>
                      <p style={{ fontSize:"11px",fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.7px",margin:0 }}>{label}</p>
                      <div style={{ width:"30px",height:"30px",borderRadius:"8px",background:bg,display:"flex",alignItems:"center",justifyContent:"center",color:ic }}>
                        <I size={15}/>
                      </div>
                    </div>
                    <p style={{ fontSize:"20px",fontWeight:700,color:"#0f172a",margin:0 }}>{value}</p>
                  </div>
                </Card>
              ))}
            </div>

            {/* Period + payment filters */}
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"10px",marginBottom:"16px" }}>
              <div style={{ display:"flex",gap:"2px",background:"rgba(255,255,255,0.7)",border:"1px solid #e2e8f0",borderRadius:"10px",padding:"3px" }}>
                {SALES_PERIODS.map(p=>(
                  <button key={p.id} onClick={()=>{setSalesPeriod(p.id);setSalesPage(1);}} style={{ padding:"6px 14px",borderRadius:"7px",border:"none",fontSize:"12px",fontWeight:600,cursor:"pointer",background:salesPeriod===p.id?"#2563eb":"transparent",color:salesPeriod===p.id?"#fff":"#64748b",transition:"all 0.15s" }}>
                    {p.label}
                  </button>
                ))}
              </div>
              <select value={paymentFilter} onChange={e=>{setPaymentFilter(e.target.value);setSalesPage(1);}} style={{ height:"36px",padding:"0 12px",border:"1px solid #e2e8f0",borderRadius:"10px",fontSize:"12px",fontWeight:600,color:"#475569",background:"rgba(255,255,255,0.8)",outline:"none" }}>
                <option value="ALL">All Methods</option>
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="QR">QR</option>
              </select>
            </div>

            <Card>
              {filteredSales.length===0 ? <EmptyState Icon={Receipt} text="No sales found for this period"/> : (
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%",borderCollapse:"collapse",minWidth:"700px" }}>
                    <THead cols={["Invoice","Date & Time","Cashier","Amount","Payment","Status","Actions"]}/>
                    <tbody>
                      {paginatedSales.map(sale=>(
                        <tr key={sale._id} className="bdp-tr" style={{ borderBottom:"1px solid #f1f5f9" }}>
                          <td style={{ padding:"13px 20px",fontSize:"12px",fontWeight:700,color:"#0f172a",whiteSpace:"nowrap" }}>{sale.invoiceNumber||"N/A"}</td>
                          <td style={{ padding:"13px 20px",fontSize:"12px",color:"#64748b",whiteSpace:"nowrap" }}>
                            {sale.createdAt?new Date(sale.createdAt).toLocaleString(undefined,{dateStyle:"medium",timeStyle:"short"}):"N/A"}
                          </td>
                          <td style={{ padding:"13px 20px",fontSize:"12px",fontWeight:600,color:"#0f172a",whiteSpace:"nowrap" }}>{getCashierName(sale.cashier)}</td>
                          <td style={{ padding:"13px 20px",fontSize:"13px",fontWeight:700,color:"#0f172a",whiteSpace:"nowrap" }}>
                            Rs.{Number(sale.totalAmount??0).toLocaleString(undefined,{minimumFractionDigits:2})}
                          </td>
                          <td style={{ padding:"13px 20px" }}>
                            <span style={pillStyle(PAYMENT_STYLES,sale.paymentMethod)}>{sale.paymentMethod||"N/A"}</span>
                          </td>
                          <td style={{ padding:"13px 20px" }}>
                            <span style={pillStyle(STATUS_STYLES,sale.status)}>{sale.status||"N/A"}</span>
                          </td>
                          <td style={{ padding:"13px 20px" }}>
                            <button onClick={()=>setSelectedSale(sale)} className="bdp-act" style={{ width:"30px",height:"30px",borderRadius:"7px",border:"1px solid #e2e8f0",background:"#fff",color:"#475569",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }} title="View">
                              <Eye size={14}/>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
            <Pagination page={salesPage} total={filteredSales.length} perPage={PER} setPage={setSalesPage}/>
          </div>
        )}

        {/* EMPLOYEES */}
        {activeTab==="employees" && (
          <div>
            <SectionHeader title="Employees" sub="Staff assigned to this branch">
              <SearchBox value={employeeSearch} onChange={e=>{setEmployeeSearch(e.target.value);setEmployeePage(1);}} placeholder="Search name, role, email…"/>
            </SectionHeader>
            <Card>
              {paginatedEmployees.length===0 ? <EmptyState Icon={Users} text={employeeSearch?"No employees match your search":"No employees assigned to this branch"}/> : (
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%",borderCollapse:"collapse" }}>
                    <THead cols={["Name","Role","Email"]}/>
                    <tbody>
                      {paginatedEmployees.map((emp,i)=>{
                        const av3=getAvatarColor(emp.name||"E");
                        return(
                          <tr key={i} className="bdp-tr" style={{ borderBottom:"1px solid #f1f5f9" }}>
                            <td style={{ padding:"13px 20px" }}>
                              <div style={{ display:"flex",alignItems:"center",gap:"10px" }}>
                                <div style={{ width:"34px",height:"34px",borderRadius:"50%",background:av3.bg,color:av3.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:700,flexShrink:0 }}>
                                  {(emp.name?.charAt(0)||"?").toUpperCase()}
                                </div>
                                <span style={{ fontSize:"13px",fontWeight:600,color:"#0f172a" }}>{emp.name}</span>
                              </div>
                            </td>
                            <td style={{ padding:"13px 20px" }}>
                              <span style={{ background:"#f5f3ff",color:"#5b21b6",border:"1px solid #ddd6fe",fontSize:"11px",fontWeight:700,padding:"3px 10px",borderRadius:"20px" }}>
                                {emp.role}
                              </span>
                            </td>
                            <td style={{ padding:"13px 20px",fontSize:"12px",color:"#64748b" }}>{emp.email}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
            <Pagination page={employeePage} total={filteredEmployees.length} perPage={PER} setPage={setEmployeePage}/>
          </div>
        )}

        {/* PERFORMANCE */}
        {activeTab==="performance" && (
          <div>
            <SectionHeader title="Performance Metrics" sub="Key stats for this branch"/>
            {performance && Object.keys(performance).length>0 ? (
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"12px" }}>
                {Object.entries(performance).map(([key,value],i)=>{
                  const icons=[ShoppingBag,Wallet,Package,Users];
                  const palettes=[{bg:"#eff6ff",ic:"#2563eb"},{bg:"#f0fdf4",ic:"#16a34a"},{bg:"#fffbeb",ic:"#d97706"},{bg:"#f5f3ff",ic:"#7c3aed"}];
                  const Icon=icons[i%icons.length];
                  const {bg,ic}=palettes[i%palettes.length];
                  return(
                    <Card key={key}>
                      <div style={{ padding:"20px" }}>
                        <div style={{ width:"38px",height:"38px",borderRadius:"10px",background:bg,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"12px",color:ic }}>
                          <Icon size={18}/>
                        </div>
                        <p style={{ fontSize:"11px",fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.7px",margin:"0 0 6px" }}>{key}</p>
                        <p style={{ fontSize:"22px",fontWeight:700,color:"#0f172a",margin:0 }}>{value}</p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : <Card><EmptyState Icon={BarChart3} text="No performance data available"/></Card>}
          </div>
        )}

      </div>

      {isAdmin && showEditModal && (
        <EditBranchModal branchId={id} onClose={()=>setShowEditModal(false)} onSuccess={()=>{fetchData();setShowEditModal(false);}}/>
      )}
      {selectedSale && (
        <SaleDetailsModal sale={selectedSale} onClose={()=>setSelectedSale(null)}/>
      )}
    </>
  );
}