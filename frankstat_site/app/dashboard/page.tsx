"use client";

import { useState, useRef } from "react";
import Link from "next/link";

// ─── TYPES ───────────────────────────────────────────────────────────────────

type ProjectStatus = "Pending" | "In Progress" | "Awaiting Approval" | "Printing" | "Completed" | "Cancelled";
type Tab = "overview" | "orders" | "track" | "payments" | "profile" | "support";

interface Order {
  id: string;
  service: string;
  serviceIcon: string;
  description: string;
  dimension?: string;
  quantity: number;
  totalAmount: number;
  depositPaid: number;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  artworkUploaded: boolean;
  notes?: string;
  estimatedCompletion?: string;
}

interface PaymentRecord {
  id: string;
  orderId: string;
  type: "Deposit" | "Balance";
  amount: number;
  method: "M-Pesa";
  mpesaRef: string;
  date: string;
  status: "Confirmed" | "Pending" | "Failed";
}

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: "Open" | "Resolved" | "In Review";
  createdAt: string;
  response?: string;
}

// ─── MOCK DATA (linked to admin) ──────────────────────────────────────────────

const USER_ORDERS: Order[] = [
  {
    id: "PRJ-011", service: "Sublimation", serviceIcon: "👕",
    description: "Corporate branded polo shirts — Frankstat Annual Conference",
    quantity: 25, totalAmount: 18750, depositPaid: 9375,
    status: "Printing",
    createdAt: "2026-02-18", updatedAt: "2026-02-22",
    artworkUploaded: true, estimatedCompletion: "2026-02-25",
    notes: "Printing 60% complete. On schedule."
  },
  {
    id: "PRJ-008", service: "Banners", serviceIcon: "🏳️",
    description: "Outdoor event banners for product launch",
    dimension: "8ft × 4ft", quantity: 4, totalAmount: 18000, depositPaid: 9000,
    status: "Completed",
    createdAt: "2026-02-05", updatedAt: "2026-02-10",
    artworkUploaded: true, estimatedCompletion: "2026-02-10",
  },
  {
    id: "PRJ-004", service: "Business Cards", serviceIcon: "💼",
    description: "Premium spot UV business cards — matte black",
    quantity: 500, totalAmount: 4000, depositPaid: 4000,
    status: "Completed",
    createdAt: "2026-01-20", updatedAt: "2026-01-25",
    artworkUploaded: true,
  },
  {
    id: "PRJ-014", service: "Posters", serviceIcon: "🖼️",
    description: "A1 glossy posters for upcoming music event",
    dimension: "A1 (59.4×84.1cm)", quantity: 100, totalAmount: 8000, depositPaid: 4000,
    status: "Awaiting Approval",
    createdAt: "2026-02-20", updatedAt: "2026-02-21",
    artworkUploaded: true, estimatedCompletion: "2026-02-27",
    notes: "Design proof sent. Awaiting your approval to proceed."
  },
  {
    id: "PRJ-016", service: "Heat Press", serviceIcon: "🔥",
    description: "Team hoodies with back print",
    quantity: 15, totalAmount: 6750, depositPaid: 3375,
    status: "Pending",
    createdAt: "2026-02-22", updatedAt: "2026-02-22",
    artworkUploaded: false, estimatedCompletion: "2026-03-01",
    notes: "Awaiting artwork upload to begin production."
  },
  {
    id: "PRJ-002", service: "DTF No-Cut", serviceIcon: "🎨",
    description: "Custom DTF prints on 50 t-shirts",
    quantity: 50, totalAmount: 12500, depositPaid: 6250,
    status: "Cancelled",
    createdAt: "2026-01-10", updatedAt: "2026-01-14",
    artworkUploaded: false,
  },
];

const PAYMENTS: PaymentRecord[] = [
  { id: "PAY-009", orderId: "PRJ-011", type: "Deposit", amount: 9375, method: "M-Pesa", mpesaRef: "RGH7K2MNP4", date: "2026-02-18", status: "Confirmed" },
  { id: "PAY-008", orderId: "PRJ-014", type: "Deposit", amount: 4000, method: "M-Pesa", mpesaRef: "QFT3L9WXB1", date: "2026-02-20", status: "Confirmed" },
  { id: "PAY-007", orderId: "PRJ-016", type: "Deposit", amount: 3375, method: "M-Pesa", mpesaRef: "NCP8E5ZDV7", date: "2026-02-22", status: "Confirmed" },
  { id: "PAY-006", orderId: "PRJ-008", type: "Balance", amount: 9000, method: "M-Pesa", mpesaRef: "MBV2R6YJA3", date: "2026-02-10", status: "Confirmed" },
  { id: "PAY-005", orderId: "PRJ-008", type: "Deposit", amount: 9000, method: "M-Pesa", mpesaRef: "LKT4S1HNQ8", date: "2026-02-05", status: "Confirmed" },
  { id: "PAY-004", orderId: "PRJ-004", type: "Balance", amount: 2000, method: "M-Pesa", mpesaRef: "JWD9P7CMX5", date: "2026-01-25", status: "Confirmed" },
  { id: "PAY-003", orderId: "PRJ-004", type: "Deposit", amount: 2000, method: "M-Pesa", mpesaRef: "HXB5K3FRU2", date: "2026-01-20", status: "Confirmed" },
];

const TICKETS: SupportTicket[] = [
  { id: "TKT-003", subject: "Can I change the artwork for PRJ-011?", message: "Hi, I'd like to make a small adjustment to the logo placement on the polo shirts. Is that still possible?", status: "In Review", createdAt: "2026-02-21", response: "Hi! We've received your request. Since printing is at 60%, minor adjustments to remaining shirts may still be possible. We'll confirm within 2 hours." },
  { id: "TKT-001", subject: "PRJ-008 banner quality question", message: "The banners look great but one has a slight colour shift on the left edge. Is this normal?", status: "Resolved", createdAt: "2026-02-10", response: "Thank you for flagging this. Slight edge variance is within print tolerances, but we'd be happy to reprint that banner at no cost. Please visit our office at your convenience." },
];

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────

const STATUS_META: Record<ProjectStatus, { color: string; bg: string; icon: string; step: number; label: string }> = {
  "Pending":           { color: "#92620A", bg: "#FEF9E7", icon: "🕐", step: 1, label: "Order Received"     },
  "Awaiting Approval": { color: "#7D3C98", bg: "#F5EEF8", icon: "🔍", step: 2, label: "Awaiting Approval"  },
  "In Progress":       { color: "#1A5276", bg: "#EAF4FC", icon: "⚙️", step: 3, label: "In Progress"        },
  "Printing":          { color: "#1A6B3A", bg: "#EAFAF1", icon: "🖨️", step: 4, label: "Printing"           },
  "Completed":         { color: "#155724", bg: "#D4EDDA", icon: "✅", step: 5, label: "Completed"           },
  "Cancelled":         { color: "#922B21", bg: "#FDEDEC", icon: "❌", step: 0, label: "Cancelled"           },
};

const PROGRESS_STEPS = ["Order Received", "Awaiting Approval", "In Progress", "Printing", "Completed"];

const fmt  = (n: number) => `KES ${n.toLocaleString()}`;
const fmtD = (d: string) => new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return <span style={{ display:"inline-block", padding:"0.2rem 0.7rem", borderRadius:"99px", background:bg, color, fontSize:"0.73rem", fontWeight:700, whiteSpace:"nowrap" }}>{label}</span>;
}

function Toast({ msg, type }: { msg: string; type: "success" | "error" | "info" }) {
  const bg = type === "success" ? "#1A6B3A" : type === "error" ? "#922B21" : "#1A5276";
  const icon = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
  return (
    <div style={{ position:"fixed", bottom:"1.5rem", right:"1.5rem", background:bg, color:"#fff", padding:"0.85rem 1.4rem", borderRadius:"10px", fontSize:"0.88rem", fontWeight:500, boxShadow:"0 8px 24px rgba(0,0,0,0.2)", zIndex:9999, display:"flex", alignItems:"center", gap:"0.5rem", animation:"slideToast 0.3s ease" }}>
      {icon} {msg}
    </div>
  );
}

function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(14,10,7,0.55)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem", backdropFilter:"blur(4px)" }} onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:"16px", width:"100%", maxWidth: wide ? "700px" : "520px", maxHeight:"92vh", overflowY:"auto", boxShadow:"0 24px 60px rgba(0,0,0,0.22)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"1.4rem 2rem", borderBottom:"1px solid #F0E8DC", position:"sticky", top:0, background:"#fff", zIndex:1, borderRadius:"16px 16px 0 0" }}>
          <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", fontWeight:800, color:"#1C1410" }}>{title}</h3>
          <button onClick={onClose} style={{ background:"#F5EFE6", border:"none", borderRadius:"8px", width:"30px", height:"30px", cursor:"pointer", fontSize:"1rem", display:"flex", alignItems:"center", justifyContent:"center", color:"#5C4A38" }}>✕</button>
        </div>
        <div style={{ padding:"1.8rem 2rem" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── PROGRESS TRACKER ─────────────────────────────────────────────────────────

function ProgressTracker({ order }: { order: Order }) {
  const meta = STATUS_META[order.status];
  const currentStep = meta.step;
  const isCancelled = order.status === "Cancelled";

  return (
    <div style={{ background:"#fff", border:"1px solid #F0E8DC", borderRadius:"14px", padding:"1.8rem", marginBottom:"1.2rem" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"0.6rem", marginBottom:"1.6rem" }}>
        <div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.05rem", fontWeight:800, color:"#1C1410" }}>{order.id}</div>
          <div style={{ fontSize:"0.85rem", color:"#7A6050", marginTop:"0.2rem" }}>{order.serviceIcon} {order.service} · {order.description}</div>
        </div>
        <Badge label={`${meta.icon} ${order.status}`} color={meta.color} bg={meta.bg} />
      </div>

      {isCancelled ? (
        <div style={{ background:"#FDEDEC", border:"1.5px solid #FADBD8", borderRadius:"10px", padding:"1rem 1.2rem", textAlign:"center" }}>
          <div style={{ fontSize:"1.5rem", marginBottom:"0.4rem" }}>❌</div>
          <div style={{ fontWeight:700, color:"#922B21", fontSize:"0.9rem" }}>This order was cancelled.</div>
          <div style={{ fontSize:"0.82rem", color:"#A57070", marginTop:"0.25rem" }}>Any deposits paid will be processed according to our refund policy.</div>
        </div>
      ) : (
        <>
          {/* Step bar */}
          <div style={{ display:"flex", alignItems:"center", marginBottom:"1.2rem", position:"relative" }}>
            {PROGRESS_STEPS.map((step, i) => {
              const stepNum = i + 1;
              const done = currentStep >= stepNum;
              const active = currentStep === stepNum;
              return (
                <div key={step} style={{ display:"flex", alignItems:"center", flex: i < PROGRESS_STEPS.length - 1 ? 1 : "none" }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"0.4rem" }}>
                    <div style={{
                      width:"32px", height:"32px", borderRadius:"50%",
                      background: done ? (active ? "#C19A4A" : "#1C1410") : "#F0E8DC",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:"0.75rem", fontWeight:800,
                      color: done ? "#fff" : "#C8B89A",
                      boxShadow: active ? "0 0 0 4px rgba(193,154,74,0.25)" : "none",
                      transition:"all 0.3s", flexShrink:0,
                    }}>
                      {done && !active ? "✓" : stepNum}
                    </div>
                    <div style={{ fontSize:"0.65rem", fontWeight:600, color: done ? "#1C1410" : "#C8B89A", textAlign:"center", width:"64px", lineHeight:1.3, whiteSpace:"normal" }}>
                      {step}
                    </div>
                  </div>
                  {i < PROGRESS_STEPS.length - 1 && (
                    <div style={{ flex:1, height:"3px", background: currentStep > stepNum ? "#1C1410" : "#F0E8DC", borderRadius:"99px", margin:"0 4px 20px" }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Details row */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(130px, 1fr))", gap:"0.8rem" }}>
            {[
              { label:"Quantity", value: String(order.quantity) },
              { label:"Total", value: fmt(order.totalAmount) },
              { label:"Deposit Paid", value: fmt(order.depositPaid) },
              { label:"Balance Due", value: fmt(order.totalAmount - order.depositPaid), highlight: (order.totalAmount - order.depositPaid) > 0 },
              ...(order.estimatedCompletion ? [{ label:"Est. Ready", value: fmtD(order.estimatedCompletion) }] : []),
              { label:"Last Update", value: fmtD(order.updatedAt) },
            ].map(d => (
              <div key={d.label} style={{ background:"#FAF6F1", borderRadius:"8px", padding:"0.7rem 0.9rem" }}>
                <div style={{ fontSize:"0.68rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#A89070", marginBottom:"0.2rem" }}>{d.label}</div>
                <div style={{ fontSize:"0.9rem", fontWeight:700, color: "highlight" in d && d.highlight ? "#C0392B" : "#1C1410" }}>{d.value}</div>
              </div>
            ))}
          </div>

          {/* Admin note */}
          {order.notes && (
            <div style={{ marginTop:"1rem", background:"#FFFBF4", border:"1.5px solid #F0D98C", borderRadius:"8px", padding:"0.8rem 1rem", display:"flex", gap:"0.6rem", alignItems:"flex-start" }}>
              <span style={{ fontSize:"1rem" }}>💬</span>
              <div>
                <div style={{ fontSize:"0.72rem", fontWeight:700, color:"#8B6914", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"0.2rem" }}>Note from Frankstat</div>
                <div style={{ fontSize:"0.85rem", color:"#5C4A38", lineHeight:1.6 }}>{order.notes}</div>
              </div>
            </div>
          )}

          {/* Artwork warning */}
          {!order.artworkUploaded && (
            <div style={{ marginTop:"0.8rem", background:"#FDEDEC", border:"1.5px solid #FADBD8", borderRadius:"8px", padding:"0.8rem 1rem", display:"flex", gap:"0.6rem", alignItems:"center" }}>
              <span>⚠️</span>
              <div style={{ fontSize:"0.85rem", color:"#922B21", fontWeight:600 }}>Artwork not yet uploaded. Please send your design file to hello@frankstat.co.ke or WhatsApp +254 700 000 000 to avoid delays.</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────

export default function UserDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  const [orderDetailModal, setOrderDetailModal] = useState<Order | null>(null);
  const [paymentDetailModal, setPaymentDetailModal] = useState<PaymentRecord | null>(null);
  const [supportModal, setSupportModal] = useState(false);
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [changePassModal, setChangePassModal] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>(TICKETS);
  const [orderFilter, setOrderFilter] = useState<ProjectStatus | "All">("All");
  const [orderSearch, setOrderSearch] = useState("");
  const avatarRef = useRef<HTMLInputElement>(null);

  // Profile state
  const [profile, setProfile] = useState({ fullName:"Aisha Kamau", email:"aisha@gmail.com", phone:"+254712345678", company:"Aisha Events Ltd", city:"Nairobi", bio:"Event organiser and brand manager.", avatar:"A" });
  const [profileDraft, setProfileDraft] = useState({ ...profile });

  // Password state
  const [passForm, setPassForm] = useState({ current:"", newP:"", confirm:"" });
  const [showPass, setShowPass] = useState({ current:false, newP:false, confirm:false });

  // Support form
  const [ticketForm, setTicketForm] = useState({ subject:"", message:"", orderId:"" });

  const showToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Derived
  const activeOrders = USER_ORDERS.filter(o => !["Completed","Cancelled"].includes(o.status));
  const completedOrders = USER_ORDERS.filter(o => o.status === "Completed");
  const totalSpent = PAYMENTS.filter(p => p.status === "Confirmed").reduce((s,p) => s + p.amount, 0);
  const pendingBalance = USER_ORDERS.filter(o => !["Completed","Cancelled"].includes(o.status)).reduce((s,o) => s + (o.totalAmount - o.depositPaid), 0);

  const filteredOrders = USER_ORDERS.filter(o => {
    const matchFilter = orderFilter === "All" || o.status === orderFilter;
    const matchSearch = o.id.toLowerCase().includes(orderSearch.toLowerCase()) || o.service.toLowerCase().includes(orderSearch.toLowerCase()) || o.description.toLowerCase().includes(orderSearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  // Most recent active order for quick track widget
  const latestActive = activeOrders.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

  const NAV_ITEMS: { id: Tab; icon: string; label: string }[] = [
    { id:"overview",  icon:"◈",  label:"Overview"     },
    { id:"orders",    icon:"🗂️", label:"My Orders"    },
    { id:"track",     icon:"📍", label:"Track Order"  },
    { id:"payments",  icon:"💳", label:"Payments"     },
    { id:"support",   icon:"💬", label:"Support"      },
    { id:"profile",   icon:"👤", label:"My Profile"   },
  ];

  const handleSaveProfile = () => {
    setProfile({ ...profileDraft });
    setEditProfileModal(false);
    showToast("Profile updated successfully");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passForm.current) { showToast("Enter your current password", "error"); return; }
    if (passForm.newP.length < 8) { showToast("New password must be at least 8 characters", "error"); return; }
    if (passForm.newP !== passForm.confirm) { showToast("Passwords don't match", "error"); return; }
    setPassForm({ current:"", newP:"", confirm:"" });
    setChangePassModal(false);
    showToast("Password changed successfully");
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.subject.trim() || !ticketForm.message.trim()) { showToast("Fill in all fields", "error"); return; }
    const newTicket: SupportTicket = {
      id: `TKT-${String(Math.floor(Math.random()*900)+100)}`,
      subject: ticketForm.subject,
      message: ticketForm.message,
      status: "Open",
      createdAt: new Date().toISOString().slice(0,10),
    };
    setTickets(ts => [newTicket, ...ts]);
    setTicketForm({ subject:"", message:"", orderId:"" });
    setSupportModal(false);
    showToast("Support ticket submitted! We'll respond within 2 hours.");
  };

  const passStrength = (() => {
    const p = passForm.newP;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const passStrengthLabel = ["", "Weak", "Fair", "Good", "Strong"][passStrength];
  const passStrengthColor = ["", "#C0392B", "#E09A52", "#C19A4A", "#1A6B3A"][passStrength];

  const inputSt: React.CSSProperties = { width:"100%", background:"#F9F6F2", border:"1.5px solid #E2D5C3", borderRadius:"8px", padding:"0.7rem 0.9rem", fontFamily:"'DM Sans',sans-serif", fontSize:"0.9rem", color:"#1C1410", outline:"none", boxSizing:"border-box" };
  const labelSt: React.CSSProperties = { display:"block", fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase" as const, color:"#7A6050", marginBottom:"0.35rem" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
        html, body { height:100%; }
        body { font-family:'DM Sans',sans-serif; background:#F5EFE6; color:#1C1410; overflow-x:hidden; }
        input,select,textarea { font-family:'DM Sans',sans-serif; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:#F0E8DC; }
        ::-webkit-scrollbar-thumb { background:#D9CAAF; border-radius:99px; }

        @keyframes slideToast { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

        .dash-shell { display:flex; min-height:100vh; }

        /* ── SIDEBAR */
        .sidebar {
          width:240px; min-height:100vh; background:#1C1410;
          display:flex; flex-direction:column;
          position:fixed; top:0; left:0; bottom:0; z-index:50;
          transition:width 0.25s ease; overflow:hidden;
        }
        .sidebar.closed { width:66px; }
        .sb-logo {
          padding:1.3rem 1.4rem 1rem;
          border-bottom:1px solid rgba(255,255,255,0.07);
          display:flex; align-items:center; gap:0.5rem;
          font-family:'Playfair Display',serif; font-size:1.25rem; font-weight:900; color:#fff; white-space:nowrap; text-decoration:none;
        }
        .sb-logo .gold { color:#C19A4A; }
        .sb-logo .pill { font-family:'DM Sans',sans-serif; font-size:0.58rem; font-weight:700; letter-spacing:0.12em; background:rgba(193,154,74,0.18); color:#C19A4A; border-radius:4px; padding:2px 7px; }
        .sb-nav { flex:1; padding:0.6rem 0; overflow-y:auto; }
        .nav-item {
          display:flex; align-items:center; gap:0.85rem;
          padding:0.72rem 1.4rem; cursor:pointer;
          border-left:3px solid transparent; white-space:nowrap;
          transition:background 0.15s;
        }
        .nav-item:hover { background:rgba(255,255,255,0.05); }
        .nav-item.active { background:rgba(193,154,74,0.12); border-left-color:#C19A4A; }
        .nav-icon { font-size:1.05rem; min-width:20px; text-align:center; }
        .nav-label { font-size:0.87rem; font-weight:500; color:#C8B89A; }
        .nav-item.active .nav-label { color:#E8C97A; font-weight:600; }
        .sb-footer {
          padding:1rem 1.4rem; border-top:1px solid rgba(255,255,255,0.07);
        }
        .user-chip { display:flex; align-items:center; gap:0.7rem; }
        .u-avatar {
          width:36px; height:36px; border-radius:50%; flex-shrink:0;
          background:linear-gradient(135deg,#C19A4A,#8B5E3C);
          display:flex; align-items:center; justify-content:center;
          font-family:'Playfair Display',serif; font-size:0.9rem; font-weight:700; color:#fff;
          cursor:pointer;
        }
        .u-name { font-size:0.82rem; font-weight:600; color:#E8C97A; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; }
        .u-tag { font-size:0.7rem; color:#8B7355; white-space:nowrap; }

        /* ── MAIN */
        .main { margin-left:240px; flex:1; min-height:100vh; transition:margin-left 0.25s ease; display:flex; flex-direction:column; }
        .main.closed { margin-left:66px; }

        /* ── TOPBAR */
        .topbar {
          background:#fff; height:60px; border-bottom:1px solid #F0E8DC;
          display:flex; align-items:center; padding:0 1.8rem; gap:0.8rem;
          position:sticky; top:0; z-index:40;
        }
        .collapse-btn { background:none; border:none; cursor:pointer; font-size:1.1rem; color:#8B7355; padding:4px; transition:color 0.15s; }
        .collapse-btn:hover { color:#1C1410; }
        .topbar-title { font-family:'Playfair Display',serif; font-size:1.15rem; font-weight:900; color:#1C1410; flex:1; }
        .topbar-actions { display:flex; align-items:center; gap:0.6rem; }
        .icon-btn { width:36px; height:36px; border-radius:8px; background:#F5EFE6; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:0.95rem; transition:background 0.15s; position:relative; }
        .icon-btn:hover { background:#EDE3D4; }
        .notif-badge { position:absolute; top:-3px; right:-3px; background:#C0392B; color:#fff; border-radius:99px; font-size:0.58rem; font-weight:700; min-width:15px; height:15px; display:flex; align-items:center; justify-content:center; padding:0 2px; border:2px solid #fff; }
        .notif-panel { position:absolute; top:46px; right:0; background:#fff; border:1px solid #F0E8DC; border-radius:12px; width:320px; box-shadow:0 12px 40px rgba(28,20,16,0.15); z-index:100; overflow:hidden; }
        .notif-hdr { padding:0.85rem 1.2rem; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #F0E8DC; }
        .notif-hdr-title { font-family:'Playfair Display',serif; font-size:0.9rem; font-weight:800; color:#1C1410; }
        .notif-item { padding:0.8rem 1.2rem; border-bottom:1px solid #FAF6F1; display:flex; gap:0.7rem; }
        .notif-dot { width:7px; height:7px; border-radius:50%; margin-top:4px; flex-shrink:0; }

        /* ── CONTENT */
        .content { padding:1.8rem; flex:1; animation:fadeIn 0.3s ease; }

        /* ── STAT CARDS */
        .stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:1.1rem; margin-bottom:1.8rem; }
        .stat-card { background:#fff; border:1px solid #F0E8DC; border-radius:14px; padding:1.3rem 1.5rem; position:relative; overflow:hidden; }
        .stat-card::after { content:''; position:absolute; top:-20px; right:-20px; width:80px; height:80px; border-radius:50%; opacity:0.1; }
        .stat-icon { font-size:1.5rem; margin-bottom:0.6rem; }
        .stat-lbl { font-size:0.68rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#A89070; margin-bottom:0.25rem; }
        .stat-val { font-family:'Playfair Display',serif; font-size:1.7rem; font-weight:900; color:#1C1410; line-height:1; }
        .stat-sub { font-size:0.75rem; color:#A89070; margin-top:0.3rem; }

        /* ── SECTION HEADER */
        .sec-hdr { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; }
        .sec-title { font-family:'Playfair Display',serif; font-size:1rem; font-weight:900; color:#1C1410; }
        .sec-link { font-size:0.78rem; font-weight:600; color:#C19A4A; background:none; border:none; cursor:pointer; }
        .sec-link:hover { opacity:0.75; }

        /* ── TABLES */
        .tbl-wrap { background:#fff; border:1px solid #F0E8DC; border-radius:14px; overflow:hidden; margin-bottom:1.5rem; }
        .tbl-bar { padding:1rem 1.5rem; border-bottom:1px solid #F0E8DC; display:flex; gap:0.7rem; flex-wrap:wrap; align-items:center; }
        .srch-wrap { position:relative; flex:1; min-width:160px; }
        .srch-icon { position:absolute; left:0.8rem; top:50%; transform:translateY(-50%); font-size:0.82rem; opacity:0.4; pointer-events:none; }
        .srch-inp { width:100%; background:#F9F6F2; border:1.5px solid #E2D5C3; border-radius:8px; padding:0.58rem 1rem 0.58rem 2.2rem; font-family:'DM Sans',sans-serif; font-size:0.86rem; color:#1C1410; outline:none; }
        .srch-inp:focus { border-color:#C19A4A; }
        .flt-sel { background:#F9F6F2; border:1.5px solid #E2D5C3; border-radius:8px; padding:0.58rem 0.85rem; font-family:'DM Sans',sans-serif; font-size:0.84rem; color:#1C1410; cursor:pointer; outline:none; }
        table { width:100%; border-collapse:collapse; }
        thead th { text-align:left; padding:0.8rem 1.2rem; font-size:0.68rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#A89070; background:#FAF6F1; border-bottom:1px solid #F0E8DC; white-space:nowrap; }
        tbody td { padding:0.85rem 1.2rem; font-size:0.86rem; color:#1C1410; border-bottom:1px solid #FAF6F1; vertical-align:middle; }
        tbody tr:last-child td { border-bottom:none; }
        tbody tr:hover td { background:#FFFBF5; cursor:pointer; }
        .tbl-foot { padding:0.7rem 1.5rem; background:#FAF6F1; font-size:0.75rem; color:#A89070; border-top:1px solid #F0E8DC; }

        /* ── ACTION BTNS */
        .act-btn { padding:0.28rem 0.6rem; border-radius:6px; font-size:0.73rem; font-weight:600; border:1.5px solid transparent; cursor:pointer; font-family:'DM Sans',sans-serif; transition:background 0.15s; white-space:nowrap; }
        .act-view { background:#EAF4FC; color:#1A5276; border-color:#D6EAF8; }
        .act-view:hover { background:#D6EAF8; }

        /* ── TWO COL */
        .two-col { display:grid; grid-template-columns:1.3fr 1fr; gap:1.4rem; margin-bottom:1.5rem; }

        /* ── QUICK ORDER CARD */
        .q-order { background:#fff; border:1px solid #F0E8DC; border-radius:14px; padding:1.5rem; transition:box-shadow 0.2s; }
        .q-order:hover { box-shadow:0 4px 20px rgba(28,20,16,0.1); }

        /* ── PAYMENT PILL */
        .pay-type-dep { background:#EAF4FC; color:#1A5276; }
        .pay-type-bal { background:#EAFAF1; color:#1A6B3A; }
        .pay-conf { background:#EAFAF1; color:#1A6B3A; }
        .pay-pend { background:#FEF9E7; color:#92620A; }

        /* ── SUPPORT */
        .ticket-card { background:#fff; border:1px solid #F0E8DC; border-radius:12px; padding:1.3rem 1.5rem; margin-bottom:0.9rem; transition:box-shadow 0.2s; }
        .ticket-card:hover { box-shadow:0 4px 16px rgba(28,20,16,0.08); }

        /* ── PROFILE PAGE */
        .profile-shell { display:grid; grid-template-columns:280px 1fr; gap:1.5rem; }
        .profile-card { background:#fff; border:1px solid #F0E8DC; border-radius:16px; padding:2rem 1.5rem; text-align:center; }
        .profile-avatar-big { width:80px; height:80px; border-radius:50%; background:linear-gradient(135deg,#C19A4A,#8B5E3C); display:flex; align-items:center; justify-content:center; font-family:'Playfair Display',serif; font-size:2rem; font-weight:900; color:#fff; margin:0 auto 0.8rem; cursor:pointer; position:relative; }
        .avatar-edit-overlay { position:absolute; inset:0; border-radius:50%; background:rgba(28,20,16,0.45); display:flex; align-items:center; justify-content:center; font-size:1.1rem; opacity:0; transition:opacity 0.2s; }
        .profile-avatar-big:hover .avatar-edit-overlay { opacity:1; }
        .profile-name { font-family:'Playfair Display',serif; font-size:1.2rem; font-weight:900; color:#1C1410; }
        .profile-email { font-size:0.82rem; color:#A89070; margin-top:0.2rem; }
        .profile-badge { display:inline-block; background:#D5F5E3; color:#155724; border-radius:99px; font-size:0.72rem; font-weight:700; padding:0.2rem 0.7rem; margin-top:0.6rem; }
        .profile-stat-row { display:flex; gap:0; margin-top:1.2rem; border:1px solid #F0E8DC; border-radius:10px; overflow:hidden; }
        .profile-stat { flex:1; padding:0.7rem 0.5rem; text-align:center; border-right:1px solid #F0E8DC; }
        .profile-stat:last-child { border-right:none; }
        .profile-stat-num { font-family:'Playfair Display',serif; font-size:1.1rem; font-weight:900; color:#1C1410; }
        .profile-stat-lbl { font-size:0.65rem; color:#A89070; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; margin-top:1px; }
        .profile-actions { margin-top:1.2rem; display:flex; flex-direction:column; gap:0.6rem; }
        .prof-btn { width:100%; padding:0.7rem; border-radius:8px; font-family:'DM Sans',sans-serif; font-size:0.85rem; font-weight:600; cursor:pointer; border:1.5px solid #E2D5C3; background:#F9F6F2; color:#3D2B1A; transition:background 0.15s; }
        .prof-btn:hover { background:#EDE3D4; }
        .prof-btn.primary { background:#1C1410; color:#fff; border-color:#1C1410; }
        .prof-btn.primary:hover { background:#3D2B1A; }

        .profile-details { background:#fff; border:1px solid #F0E8DC; border-radius:16px; padding:1.8rem; }
        .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:0 1.5rem; }
        .info-item { padding:0.9rem 0; border-bottom:1px solid #FAF6F1; }
        .info-item:last-child, .info-item:nth-last-child(2):nth-child(odd) { border-bottom:none; }
        .info-item label { font-size:0.68rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#A89070; display:block; margin-bottom:0.2rem; }
        .info-item span { font-size:0.92rem; color:#1C1410; font-weight:500; }

        /* ── QUICK ACTIONS */
        .quick-actions { display:grid; grid-template-columns:repeat(4,1fr); gap:0.9rem; margin-bottom:1.5rem; }
        .qa-btn { background:#fff; border:1px solid #F0E8DC; border-radius:12px; padding:1.1rem 0.8rem; text-align:center; cursor:pointer; transition:box-shadow 0.2s, border-color 0.2s; }
        .qa-btn:hover { box-shadow:0 4px 16px rgba(28,20,16,0.1); border-color:#C19A4A; }
        .qa-icon { font-size:1.5rem; margin-bottom:0.4rem; }
        .qa-label { font-size:0.78rem; font-weight:600; color:#5C4A38; }

        /* ── MOBILE */
        @media (max-width:1024px) { .stats-row { grid-template-columns:1fr 1fr; } .two-col { grid-template-columns:1fr; } .quick-actions { grid-template-columns:repeat(2,1fr); } .profile-shell { grid-template-columns:1fr; } }
        @media (max-width:768px) { .sidebar { width:66px; } .main { margin-left:66px; } .nav-label,.u-name,.u-tag,.sb-logo .pill,.sb-logo .sb-txt { display:none; } .stats-row { grid-template-columns:1fr 1fr; } .content { padding:1rem; } .tbl-bar { flex-direction:column; } .srch-wrap { width:100%; } .info-grid { grid-template-columns:1fr; } }
        @media (max-width:480px) { .stats-row { grid-template-columns:1fr; } .quick-actions { grid-template-columns:1fr 1fr; } }
      `}</style>

      <div className="dash-shell">

        {/* ══ SIDEBAR ══ */}
        <aside className={`sidebar${sidebarOpen ? "" : " closed"}`}>
          <Link href="/" className="sb-logo">
            <span>F<span className="gold">S</span></span>
            {sidebarOpen && <><span className="sb-txt">FRANKSTAT</span><span className="pill">MY ACCOUNT</span></>}
          </Link>

          <nav className="sb-nav">
            {NAV_ITEMS.map(item => (
              <div key={item.id} className={`nav-item${tab === item.id ? " active" : ""}`} onClick={() => setTab(item.id)}>
                <span className="nav-icon">{item.icon}</span>
                {sidebarOpen && <span className="nav-label">{item.label}</span>}
              </div>
            ))}
          </nav>

          <div className="sb-footer">
            <div className="user-chip">
              <div className="u-avatar" onClick={() => setTab("profile")} title="View profile">{profile.avatar}</div>
              {sidebarOpen && <div><div className="u-name">{profile.fullName}</div><div className="u-tag">Member</div></div>}
            </div>
          </div>
        </aside>

        {/* ══ MAIN ══ */}
        <div className={`main${sidebarOpen ? "" : " closed"}`}>

          {/* TOPBAR */}
          <header className="topbar">
            <button className="collapse-btn" onClick={() => setSidebarOpen(o => !o)}>{sidebarOpen ? "◀" : "▶"}</button>
            <div className="topbar-title">
              { tab === "overview"  && `Good day, ${profile.fullName.split(" ")[0]} 👋`}
              { tab === "orders"    && "My Orders"}
              { tab === "track"     && "Track My Order"}
              { tab === "payments"  && "Payment History"}
              { tab === "support"   && "Support & Help"}
              { tab === "profile"   && "My Profile"}
            </div>
            <div className="topbar-actions">
              <div style={{ position:"relative" }}>
                <button className="icon-btn" onClick={() => setNotifOpen(o => !o)}>
                  🔔<span className="notif-badge">2</span>
                </button>
                {notifOpen && (
                  <div className="notif-panel">
                    <div className="notif-hdr">
                      <span className="notif-hdr-title">Notifications</span>
                      <button style={{ fontSize:"0.75rem", fontWeight:600, color:"#C19A4A", background:"none", border:"none", cursor:"pointer" }} onClick={() => setNotifOpen(false)}>Close</button>
                    </div>
                    {[
                      { dot:"#C19A4A", msg:"PRJ-011 is now Printing — 60% complete.", time:"2 hrs ago" },
                      { dot:"#7D3C98", msg:"PRJ-014 awaiting your approval. Check your design proof!", time:"Yesterday" },
                      { dot:"#1A5276", msg:"Support reply received for TKT-003.", time:"Feb 21" },
                      { dot:"#1A6B3A", msg:"Deposit confirmed for PRJ-016 — KES 3,375.", time:"Feb 22" },
                    ].map((n,i) => (
                      <div key={i} className="notif-item">
                        <div className="notif-dot" style={{ background:n.dot }} />
                        <div>
                          <div style={{ fontSize:"0.82rem", color:"#3D2B1A", lineHeight:1.4 }}>{n.msg}</div>
                          <div style={{ fontSize:"0.72rem", color:"#A89070", marginTop:"2px" }}>{n.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Link href="/" style={{ textDecoration:"none" }}>
                <button className="icon-btn" title="Back to site">🏠</button>
              </Link>
              <div className="u-avatar" style={{ width:"34px", height:"34px", cursor:"pointer" }} onClick={() => setTab("profile")}>{profile.avatar}</div>
            </div>
          </header>

          <div className="content">

            {/* ══════════ OVERVIEW ══════════ */}
            {tab === "overview" && (
              <>
                {/* Stats */}
                <div className="stats-row">
                  <div className="stat-card" style={{ borderTop:"3px solid #C19A4A" }}>
                    <div className="stat-icon">🗂️</div>
                    <div className="stat-lbl">Total Orders</div>
                    <div className="stat-val">{USER_ORDERS.length}</div>
                    <div className="stat-sub">{activeOrders.length} active</div>
                  </div>
                  <div className="stat-card" style={{ borderTop:"3px solid #1A6B3A" }}>
                    <div className="stat-icon">✅</div>
                    <div className="stat-lbl">Completed</div>
                    <div className="stat-val">{completedOrders.length}</div>
                    <div className="stat-sub">Projects done</div>
                  </div>
                  <div className="stat-card" style={{ borderTop:"3px solid #1A5276" }}>
                    <div className="stat-icon">💰</div>
                    <div className="stat-lbl">Total Paid</div>
                    <div className="stat-val" style={{ fontSize:"1.3rem" }}>{fmt(totalSpent)}</div>
                    <div className="stat-sub">Across all orders</div>
                  </div>
                  <div className="stat-card" style={{ borderTop:"3px solid #C0392B" }}>
                    <div className="stat-icon">⏳</div>
                    <div className="stat-lbl">Pending Balance</div>
                    <div className="stat-val" style={{ fontSize:"1.3rem", color: pendingBalance > 0 ? "#C0392B" : "#1A6B3A" }}>{fmt(pendingBalance)}</div>
                    <div className="stat-sub">Balance on active orders</div>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="sec-hdr"><div className="sec-title">Quick Actions</div></div>
                <div className="quick-actions">
                  {[
                    { icon:"📦", label:"Place New Order", action: () => window.open("/","_blank") },
                    { icon:"📍", label:"Track Order",     action: () => setTab("track")     },
                    { icon:"💬", label:"Get Support",     action: () => { setTab("support"); setSupportModal(true); } },
                    { icon:"👤", label:"Edit Profile",    action: () => { setTab("profile"); setEditProfileModal(true); } },
                  ].map(q => (
                    <div key={q.label} className="qa-btn" onClick={q.action}>
                      <div className="qa-icon">{q.icon}</div>
                      <div className="qa-label">{q.label}</div>
                    </div>
                  ))}
                </div>

                {/* Active order tracker */}
                {latestActive && (
                  <div style={{ marginBottom:"1.5rem" }}>
                    <div className="sec-hdr">
                      <div className="sec-title">Currently Active Order</div>
                      <button className="sec-link" onClick={() => setTab("track")}>See all active →</button>
                    </div>
                    <ProgressTracker order={latestActive} />
                  </div>
                )}

                {/* Recent orders mini */}
                <div className="two-col">
                  <div>
                    <div className="sec-hdr">
                      <div className="sec-title">Recent Orders</div>
                      <button className="sec-link" onClick={() => setTab("orders")}>View all →</button>
                    </div>
                    <div className="tbl-wrap">
                      <table>
                        <thead>
                          <tr><th>Order</th><th>Service</th><th>Amount</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                          {USER_ORDERS.slice(0,5).map(o => (
                            <tr key={o.id} onClick={() => setOrderDetailModal(o)}>
                              <td><span style={{ fontFamily:"monospace", fontSize:"0.78rem", color:"#8B7355" }}>{o.id}</span></td>
                              <td>{o.serviceIcon} {o.service}</td>
                              <td style={{ fontWeight:700 }}>{fmt(o.totalAmount)}</td>
                              <td><Badge label={STATUS_META[o.status].icon + " " + o.status} color={STATUS_META[o.status].color} bg={STATUS_META[o.status].bg} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Recent payments */}
                  <div>
                    <div className="sec-hdr">
                      <div className="sec-title">Recent Payments</div>
                      <button className="sec-link" onClick={() => setTab("payments")}>View all →</button>
                    </div>
                    <div className="tbl-wrap">
                      {PAYMENTS.slice(0,5).map((p, i) => (
                        <div key={p.id} style={{ padding:"0.8rem 1.2rem", borderBottom: i < 4 ? "1px solid #FAF6F1":"none", display:"flex", justifyContent:"space-between", alignItems:"center", gap:"0.5rem", cursor:"pointer" }} onClick={() => setPaymentDetailModal(p)}>
                          <div>
                            <div style={{ fontWeight:600, fontSize:"0.85rem", color:"#1C1410" }}>{p.type} — {p.orderId}</div>
                            <div style={{ fontSize:"0.75rem", color:"#A89070", marginTop:"1px" }}>{fmtD(p.date)} · {p.mpesaRef}</div>
                          </div>
                          <div style={{ fontWeight:800, fontSize:"0.9rem", color: p.type === "Deposit" ? "#1A5276" : "#1A6B3A", flexShrink:0 }}>{fmt(p.amount)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ══════════ ORDERS ══════════ */}
            {tab === "orders" && (
              <div className="tbl-wrap">
                <div className="tbl-bar">
                  <div className="srch-wrap">
                    <span className="srch-icon">🔍</span>
                    <input className="srch-inp" placeholder="Search orders…" value={orderSearch} onChange={e => setOrderSearch(e.target.value)} />
                  </div>
                  <select className="flt-sel" value={orderFilter} onChange={e => setOrderFilter(e.target.value as any)}>
                    <option value="All">All Statuses</option>
                    {(["Pending","In Progress","Awaiting Approval","Printing","Completed","Cancelled"] as ProjectStatus[]).map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ overflowX:"auto" }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Service</th>
                        <th>Description</th>
                        <th>Qty</th>
                        <th>Total</th>
                        <th>Deposit</th>
                        <th>Balance</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length === 0 ? (
                        <tr><td colSpan={10} style={{ textAlign:"center", padding:"2.5rem", color:"#A89070" }}>No orders found.</td></tr>
                      ) : filteredOrders.map(o => (
                        <tr key={o.id} onClick={() => setOrderDetailModal(o)}>
                          <td><span style={{ fontFamily:"monospace", fontSize:"0.8rem", color:"#8B7355", fontWeight:700 }}>{o.id}</span></td>
                          <td><span style={{ whiteSpace:"nowrap" }}>{o.serviceIcon} {o.service}</span></td>
                          <td style={{ maxWidth:"200px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:"0.82rem", color:"#5C4A38" }}>{o.description}</td>
                          <td style={{ textAlign:"center" }}>{o.quantity}</td>
                          <td style={{ fontWeight:700 }}>{fmt(o.totalAmount)}</td>
                          <td style={{ color:"#1A6B3A", fontWeight:600 }}>{fmt(o.depositPaid)}</td>
                          <td style={{ color: o.totalAmount - o.depositPaid > 0 ? "#C0392B" : "#1A6B3A", fontWeight:600 }}>{fmt(o.totalAmount - o.depositPaid)}</td>
                          <td><Badge label={STATUS_META[o.status].icon + " " + o.status} color={STATUS_META[o.status].color} bg={STATUS_META[o.status].bg} /></td>
                          <td style={{ color:"#A89070", fontSize:"0.8rem", whiteSpace:"nowrap" }}>{fmtD(o.createdAt)}</td>
                          <td onClick={e => e.stopPropagation()}><button className="act-btn act-view" onClick={() => setOrderDetailModal(o)}>View</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="tbl-foot">{filteredOrders.length} of {USER_ORDERS.length} orders · Click any row for details</div>
              </div>
            )}

            {/* ══════════ TRACK ══════════ */}
            {tab === "track" && (
              <>
                <p style={{ fontSize:"0.88rem", color:"#7A6050", marginBottom:"1.5rem", lineHeight:1.7 }}>
                  Live progress of all your active orders, updated by the Frankstat team in real time. Nothing here is editable — contact support if you have questions.
                </p>

                {activeOrders.length === 0 ? (
                  <div style={{ background:"#fff", border:"1px solid #F0E8DC", borderRadius:"14px", padding:"3rem", textAlign:"center", color:"#A89070" }}>
                    <div style={{ fontSize:"2.5rem", marginBottom:"0.8rem" }}>📭</div>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", fontWeight:700, marginBottom:"0.4rem", color:"#1C1410" }}>No active orders</div>
                    <p style={{ fontSize:"0.85rem" }}>All your orders have been completed or cancelled.</p>
                    <button style={{ marginTop:"1.2rem", background:"#1C1410", color:"#fff", border:"none", borderRadius:"8px", padding:"0.7rem 1.5rem", fontFamily:"'DM Sans',sans-serif", fontWeight:700, cursor:"pointer" }} onClick={() => window.open("/","_blank")}>Place a New Order</button>
                  </div>
                ) : (
                  activeOrders
                    .sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                    .map(o => <ProgressTracker key={o.id} order={o} />)
                )}

                {/* Completed orders compact */}
                {completedOrders.length > 0 && (
                  <div style={{ marginTop:"0.5rem" }}>
                    <div className="sec-hdr" style={{ marginBottom:"0.8rem" }}>
                      <div className="sec-title">Recently Completed</div>
                    </div>
                    {completedOrders.map(o => (
                      <div key={o.id} style={{ background:"#fff", border:"1px solid #F0E8DC", borderRadius:"12px", padding:"1.2rem 1.5rem", marginBottom:"0.8rem", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"0.5rem", cursor:"pointer" }} onClick={() => setOrderDetailModal(o)}>
                        <div>
                          <span style={{ fontFamily:"monospace", fontSize:"0.8rem", color:"#8B7355", marginRight:"0.7rem" }}>{o.id}</span>
                          <span style={{ fontWeight:600, fontSize:"0.88rem" }}>{o.serviceIcon} {o.service}</span>
                          <span style={{ fontSize:"0.8rem", color:"#A89070", marginLeft:"0.6rem" }}>· {fmtD(o.updatedAt)}</span>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:"0.8rem" }}>
                          <span style={{ fontWeight:700, fontSize:"0.88rem" }}>{fmt(o.totalAmount)}</span>
                          <Badge label="✅ Completed" color="#155724" bg="#D4EDDA" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ══════════ PAYMENTS ══════════ */}
            {tab === "payments" && (
              <>
                {/* Summary cards */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.1rem", marginBottom:"1.5rem" }}>
                  {[
                    { label:"Total Paid", value: fmt(totalSpent), icon:"💳", color:"#1A6B3A" },
                    { label:"No. of Transactions", value: String(PAYMENTS.length), icon:"📋", color:"#1A5276" },
                    { label:"Pending Balance", value: fmt(pendingBalance), icon:"⏳", color: pendingBalance > 0 ? "#C0392B" : "#1A6B3A" },
                  ].map(s => (
                    <div key={s.label} className="stat-card" style={{ borderTop:`3px solid ${s.color}` }}>
                      <div className="stat-icon">{s.icon}</div>
                      <div className="stat-lbl">{s.label}</div>
                      <div className="stat-val" style={{ fontSize:"1.4rem", color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                <div className="tbl-wrap">
                  <div style={{ padding:"1rem 1.5rem", borderBottom:"1px solid #F0E8DC", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"0.95rem", fontWeight:800, color:"#1C1410" }}>All Transactions</span>
                    <span style={{ fontSize:"0.78rem", color:"#A89070" }}>Read-only · All payments via M-Pesa</span>
                  </div>
                  <div style={{ overflowX:"auto" }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Ref ID</th>
                          <th>Order</th>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>M-Pesa Ref</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {PAYMENTS.map(p => (
                          <tr key={p.id} onClick={() => setPaymentDetailModal(p)}>
                            <td><span style={{ fontFamily:"monospace", fontSize:"0.78rem", color:"#8B7355" }}>{p.id}</span></td>
                            <td><span style={{ fontFamily:"monospace", fontSize:"0.8rem", color:"#1A5276", fontWeight:600 }}>{p.orderId}</span></td>
                            <td><span className={`act-btn ${p.type === "Deposit" ? "pay-type-dep" : "pay-type-bal"}`}>{p.type}</span></td>
                            <td style={{ fontWeight:800, fontSize:"0.92rem" }}>{fmt(p.amount)}</td>
                            <td><code style={{ fontSize:"0.78rem", background:"#F5EFE6", padding:"2px 6px", borderRadius:"4px", color:"#5C4A38" }}>{p.mpesaRef}</code></td>
                            <td style={{ color:"#A89070", fontSize:"0.82rem" }}>{fmtD(p.date)}</td>
                            <td><span className={`act-btn ${p.status === "Confirmed" ? "pay-conf" : "pay-pend"}`}>{p.status === "Confirmed" ? "✓ " : "⏳ "}{p.status}</span></td>
                            <td onClick={e => e.stopPropagation()}><button className="act-btn act-view" onClick={() => setPaymentDetailModal(p)}>Receipt</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="tbl-foot">All M-Pesa transactions are automatically confirmed. Contact support for any discrepancies.</div>
                </div>
              </>
            )}

            {/* ══════════ SUPPORT ══════════ */}
            {tab === "support" && (
              <>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1.5rem" }}>
                  {[
                    { icon:"📞", title:"Call Us", desc:"Mon–Sat, 8am–7pm", action:"+254 700 000 000" },
                    { icon:"💬", title:"WhatsApp", desc:"Quick replies, send artwork", action:"wa.me/254700000000" },
                    { icon:"📧", title:"Email", desc:"hello@frankstat.co.ke", action:"mailto:hello@frankstat.co.ke" },
                    { icon:"📍", title:"Visit Us", desc:"Westlands, Nairobi", action:"#" },
                  ].map(c => (
                    <div key={c.title} style={{ background:"#fff", border:"1px solid #F0E8DC", borderRadius:"12px", padding:"1.2rem 1.4rem", display:"flex", gap:"0.9rem", alignItems:"center" }}>
                      <div style={{ width:"44px", height:"44px", borderRadius:"10px", background:"#F5EFE6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.3rem", flexShrink:0 }}>{c.icon}</div>
                      <div><div style={{ fontWeight:700, fontSize:"0.9rem", color:"#1C1410" }}>{c.title}</div><div style={{ fontSize:"0.8rem", color:"#A89070", marginTop:"1px" }}>{c.desc}</div></div>
                    </div>
                  ))}
                </div>

                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
                  <div className="sec-title">My Support Tickets</div>
                  <button style={{ background:"#1C1410", color:"#fff", border:"none", borderRadius:"8px", padding:"0.58rem 1.2rem", fontFamily:"'DM Sans',sans-serif", fontSize:"0.84rem", fontWeight:700, cursor:"pointer" }} onClick={() => setSupportModal(true)}>
                    + New Ticket
                  </button>
                </div>

                {tickets.length === 0 ? (
                  <div style={{ background:"#fff", border:"1px solid #F0E8DC", borderRadius:"12px", padding:"2.5rem", textAlign:"center", color:"#A89070" }}>
                    <div style={{ fontSize:"2rem", marginBottom:"0.5rem" }}>💬</div>
                    <p>No support tickets yet. We're here if you need help!</p>
                  </div>
                ) : tickets.map(t => (
                  <div key={t.id} className="ticket-card">
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"0.5rem", marginBottom:"0.5rem" }}>
                      <div>
                        <span style={{ fontFamily:"monospace", fontSize:"0.75rem", color:"#8B7355", marginRight:"0.6rem" }}>{t.id}</span>
                        <span style={{ fontWeight:700, fontSize:"0.9rem", color:"#1C1410" }}>{t.subject}</span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                        <Badge
                          label={t.status}
                          color={ t.status === "Resolved" ? "#155724" : t.status === "In Review" ? "#7D3C98" : "#92620A" }
                          bg={ t.status === "Resolved" ? "#D4EDDA" : t.status === "In Review" ? "#F5EEF8" : "#FEF9E7" }
                        />
                        <span style={{ fontSize:"0.75rem", color:"#A89070" }}>{fmtD(t.createdAt)}</span>
                      </div>
                    </div>
                    <p style={{ fontSize:"0.84rem", color:"#5C4A38", lineHeight:1.6, marginBottom: t.response ? "0.8rem" : 0 }}>{t.message}</p>
                    {t.response && (
                      <div style={{ background:"#F0FAF4", border:"1px solid #C8E6D4", borderRadius:"8px", padding:"0.8rem 1rem", display:"flex", gap:"0.6rem" }}>
                        <span>💬</span>
                        <div>
                          <div style={{ fontSize:"0.68rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#1A6B3A", marginBottom:"0.2rem" }}>Frankstat Response</div>
                          <div style={{ fontSize:"0.83rem", color:"#2D5A3D", lineHeight:1.6 }}>{t.response}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            {/* ══════════ PROFILE ══════════ */}
            {tab === "profile" && (
              <div className="profile-shell">
                {/* Left card */}
                <div className="profile-card">
                  <div className="profile-avatar-big" onClick={() => avatarRef.current?.click()}>
                    {profile.avatar}
                    <div className="avatar-edit-overlay">📷</div>
                  </div>
                  <input ref={avatarRef} type="file" accept="image/*" style={{ display:"none" }} onChange={() => showToast("Profile photo updated (demo)", "info")} />
                  <div className="profile-name">{profile.fullName}</div>
                  <div className="profile-email">{profile.email}</div>
                  <div className="profile-badge">✓ Verified Member</div>

                  <div className="profile-stat-row">
                    <div className="profile-stat">
                      <div className="profile-stat-num">{USER_ORDERS.length}</div>
                      <div className="profile-stat-lbl">Orders</div>
                    </div>
                    <div className="profile-stat">
                      <div className="profile-stat-num">{completedOrders.length}</div>
                      <div className="profile-stat-lbl">Done</div>
                    </div>
                    <div className="profile-stat">
                      <div className="profile-stat-num">{PAYMENTS.length}</div>
                      <div className="profile-stat-lbl">Pays</div>
                    </div>
                  </div>

                  <div className="profile-actions">
                    <button className="prof-btn primary" onClick={() => setEditProfileModal(true)}>✏️ Edit Profile</button>
                    <button className="prof-btn" onClick={() => setChangePassModal(true)}>🔒 Change Password</button>
                    <button className="prof-btn" onClick={() => showToast("Notifications preferences saved", "info")}>🔔 Notification Settings</button>
                    <button className="prof-btn" style={{ color:"#922B21", borderColor:"#FADBD8" }} onClick={() => showToast("Logged out (demo)", "info")}>↩ Sign Out</button>
                  </div>
                </div>

                {/* Right: details */}
                <div>
                  <div className="profile-details" style={{ marginBottom:"1.2rem" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.2rem", paddingBottom:"0.8rem", borderBottom:"1px solid #F0E8DC" }}>
                      <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:"1rem", color:"#1C1410" }}>Personal Information</div>
                      <button className="sec-link" onClick={() => setEditProfileModal(true)}>Edit →</button>
                    </div>
                    <div className="info-grid">
                      {[
                        { label:"Full Name",    value: profile.fullName  },
                        { label:"Email",        value: profile.email     },
                        { label:"Phone",        value: profile.phone     },
                        { label:"Company",      value: profile.company || "—" },
                        { label:"City",         value: profile.city      },
                        { label:"Member Since", value: "Aug 2024"        },
                      ].map(f => (
                        <div key={f.label} className="info-item">
                          <label>{f.label}</label>
                          <span>{f.value}</span>
                        </div>
                      ))}
                    </div>
                    {profile.bio && (
                      <div style={{ marginTop:"0.8rem", paddingTop:"0.8rem", borderTop:"1px solid #FAF6F1" }}>
                        <div style={{ fontSize:"0.68rem", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#A89070", marginBottom:"0.35rem" }}>Bio</div>
                        <p style={{ fontSize:"0.88rem", color:"#5C4A38", lineHeight:1.7 }}>{profile.bio}</p>
                      </div>
                    )}
                  </div>

                  {/* Security section */}
                  <div className="profile-details">
                    <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:"1rem", color:"#1C1410", marginBottom:"1.2rem", paddingBottom:"0.8rem", borderBottom:"1px solid #F0E8DC" }}>Security</div>
                    {[
                      { label:"Password", value:"••••••••••", action:"Change", fn:() => setChangePassModal(true) },
                      { label:"Two-Factor Auth", value:"Not enabled", action:"Enable", fn:() => showToast("2FA setup coming soon", "info") },
                      { label:"Login Sessions", value:"1 active session", action:"Manage", fn:() => showToast("Session management coming soon", "info") },
                    ].map(s => (
                      <div key={s.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.85rem 0", borderBottom:"1px solid #FAF6F1" }}>
                        <div>
                          <div style={{ fontWeight:600, fontSize:"0.88rem", color:"#1C1410" }}>{s.label}</div>
                          <div style={{ fontSize:"0.78rem", color:"#A89070" }}>{s.value}</div>
                        </div>
                        <button onClick={s.fn} style={{ background:"#F5EFE6", border:"1.5px solid #E2D5C3", borderRadius:"6px", padding:"0.4rem 0.9rem", fontFamily:"'DM Sans',sans-serif", fontSize:"0.8rem", fontWeight:600, color:"#5C4A38", cursor:"pointer" }}>{s.action}</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ══════════ MODALS ══════════ */}

      {/* Order Detail */}
      {orderDetailModal && (
        <Modal title={`${orderDetailModal.id} — Order Details`} onClose={() => setOrderDetailModal(null)} wide>
          <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap", marginBottom:"1.2rem" }}>
            <Badge label={STATUS_META[orderDetailModal.status].icon + " " + orderDetailModal.status} color={STATUS_META[orderDetailModal.status].color} bg={STATUS_META[orderDetailModal.status].bg} />
            <Badge label={orderDetailModal.serviceIcon + " " + orderDetailModal.service} color="#5C4A38" bg="#F0E8DC" />
            {!orderDetailModal.artworkUploaded && <Badge label="⚠️ No Artwork" color="#922B21" bg="#FDEDEC" />}
          </div>

          {/* Progress tracker inside modal */}
          {!["Completed","Cancelled"].includes(orderDetailModal.status) && (
            <div style={{ marginBottom:"1.2rem" }}>
              <ProgressTracker order={orderDetailModal} />
            </div>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.6rem 1.5rem", marginBottom:"1.2rem" }}>
            {[
              { l:"Order ID",      v: orderDetailModal.id },
              { l:"Service",       v: `${orderDetailModal.serviceIcon} ${orderDetailModal.service}` },
              ...(orderDetailModal.dimension ? [{ l:"Dimension", v: orderDetailModal.dimension }] : []),
              { l:"Quantity",      v: String(orderDetailModal.quantity) },
              { l:"Total Amount",  v: fmt(orderDetailModal.totalAmount) },
              { l:"Deposit Paid",  v: fmt(orderDetailModal.depositPaid) },
              { l:"Balance Due",   v: fmt(orderDetailModal.totalAmount - orderDetailModal.depositPaid) },
              { l:"Artwork",       v: orderDetailModal.artworkUploaded ? "✅ Uploaded" : "❌ Pending" },
              { l:"Date Placed",   v: fmtD(orderDetailModal.createdAt) },
              { l:"Last Updated",  v: fmtD(orderDetailModal.updatedAt) },
              ...(orderDetailModal.estimatedCompletion ? [{ l:"Est. Ready", v: fmtD(orderDetailModal.estimatedCompletion) }] : []),
            ].map(d => (
              <div key={d.l} style={{ paddingBottom:"0.6rem", borderBottom:"1px solid #FAF6F1" }}>
                <div style={{ fontSize:"0.68rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#A89070", marginBottom:"0.15rem" }}>{d.l}</div>
                <div style={{ fontSize:"0.9rem", fontWeight:600, color:"#1C1410" }}>{d.v}</div>
              </div>
            ))}
          </div>

          <div style={{ background:"#FAF6F1", borderRadius:"8px", padding:"0.85rem 1rem", marginBottom:"1rem" }}>
            <div style={{ fontSize:"0.68rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#A89070", marginBottom:"0.3rem" }}>Description</div>
            <p style={{ fontSize:"0.88rem", color:"#3D2B1A", lineHeight:1.65 }}>{orderDetailModal.description}</p>
          </div>

          {orderDetailModal.notes && (
            <div style={{ background:"#FFFBF4", border:"1.5px solid #F0D98C", borderRadius:"8px", padding:"0.85rem 1rem", marginBottom:"1rem", display:"flex", gap:"0.5rem" }}>
              <span>💬</span>
              <div>
                <div style={{ fontSize:"0.68rem", fontWeight:700, color:"#8B6914", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"0.2rem" }}>Note from Frankstat</div>
                <p style={{ fontSize:"0.85rem", color:"#5C4A38", lineHeight:1.6 }}>{orderDetailModal.notes}</p>
              </div>
            </div>
          )}

          <div style={{ display:"flex", gap:"0.7rem", marginTop:"0.5rem" }}>
            <button onClick={() => { setOrderDetailModal(null); setTab("support"); setSupportModal(true); setTicketForm(f => ({ ...f, subject:`Question about ${orderDetailModal.id}`, orderId:orderDetailModal.id })); }}
              style={{ flex:1, padding:"0.75rem", background:"#F5EFE6", border:"1.5px solid #E2D5C3", borderRadius:"8px", cursor:"pointer", fontWeight:600, color:"#5C4A38", fontFamily:"'DM Sans',sans-serif" }}>
              💬 Contact Support
            </button>
            <button onClick={() => setOrderDetailModal(null)} style={{ flex:1, padding:"0.75rem", background:"#1C1410", border:"none", borderRadius:"8px", cursor:"pointer", fontWeight:700, color:"#fff", fontFamily:"'DM Sans',sans-serif" }}>
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Payment Receipt */}
      {paymentDetailModal && (
        <Modal title="Payment Receipt" onClose={() => setPaymentDetailModal(null)}>
          <div style={{ textAlign:"center", marginBottom:"1.5rem" }}>
            <div style={{ width:"60px", height:"60px", borderRadius:"50%", background:"#D4EDDA", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.8rem", margin:"0 auto 0.8rem" }}>✅</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.6rem", fontWeight:900, color:"#1C1410" }}>{fmt(paymentDetailModal.amount)}</div>
            <div style={{ fontSize:"0.84rem", color:"#A89070", marginTop:"0.3rem" }}>Payment Confirmed</div>
          </div>
          <div style={{ background:"#FAF6F1", borderRadius:"12px", padding:"1.2rem 1.4rem" }}>
            {[
              { label:"Reference ID",    value: paymentDetailModal.id },
              { label:"Order",           value: paymentDetailModal.orderId },
              { label:"Payment Type",    value: paymentDetailModal.type },
              { label:"Method",          value: "📱 M-Pesa" },
              { label:"M-Pesa Code",     value: paymentDetailModal.mpesaRef },
              { label:"Date & Time",     value: fmtD(paymentDetailModal.date) },
              { label:"Status",          value: paymentDetailModal.status },
            ].map(r => (
              <div key={r.label} style={{ display:"flex", justifyContent:"space-between", padding:"0.55rem 0", borderBottom:"1px solid #F0E8DC", fontSize:"0.85rem" }}>
                <span style={{ color:"#7A6050", fontWeight:500 }}>{r.label}</span>
                <span style={{ color:"#1C1410", fontWeight:700, fontFamily: r.label === "M-Pesa Code" ? "monospace" : "inherit" }}>{r.value}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize:"0.78rem", color:"#A89070", textAlign:"center", marginTop:"1rem", lineHeight:1.6 }}>
            Keep this reference for your records. For any payment queries, quote your M-Pesa code to our team.
          </p>
          <button onClick={() => setPaymentDetailModal(null)} style={{ width:"100%", marginTop:"1rem", padding:"0.8rem", background:"#1C1410", border:"none", borderRadius:"8px", color:"#fff", fontFamily:"'DM Sans',sans-serif", fontWeight:700, cursor:"pointer" }}>Done</button>
        </Modal>
      )}

      {/* Edit Profile */}
      {editProfileModal && (
        <Modal title="Edit Profile" onClose={() => setEditProfileModal(false)}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 1rem" }}>
            {[
              { label:"Full Name",    key:"fullName", type:"text",  placeholder:"Your full name"    },
              { label:"Email",        key:"email",    type:"email", placeholder:"you@example.com"   },
              { label:"Phone",        key:"phone",    type:"tel",   placeholder:"+2547XXXXXXXX"     },
              { label:"Company",      key:"company",  type:"text",  placeholder:"Your company/org"  },
              { label:"City",         key:"city",     type:"text",  placeholder:"e.g. Nairobi"      },
            ].map(f => (
              <div key={f.key} style={{ marginBottom:"1.1rem" }}>
                <label style={labelSt}>{f.label}</label>
                <input style={inputSt} type={f.type} placeholder={f.placeholder}
                  value={(profileDraft as any)[f.key]}
                  onChange={e => setProfileDraft(d => ({ ...d, [f.key]: e.target.value }))} />
              </div>
            ))}
          </div>
          <div style={{ marginBottom:"1.1rem" }}>
            <label style={labelSt}>Bio / Short Description</label>
            <textarea style={{ ...inputSt, resize:"vertical", minHeight:"70px" }} placeholder="A brief description about yourself or your business"
              value={profileDraft.bio}
              onChange={e => setProfileDraft(d => ({ ...d, bio: e.target.value }))} />
          </div>
          <div style={{ display:"flex", gap:"0.7rem" }}>
            <button onClick={() => setEditProfileModal(false)} style={{ flex:1, padding:"0.75rem", background:"#F5EFE6", border:"1.5px solid #E2D5C3", borderRadius:"8px", cursor:"pointer", fontWeight:600, color:"#5C4A38", fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
            <button onClick={handleSaveProfile} style={{ flex:2, padding:"0.75rem", background:"#1C1410", border:"none", borderRadius:"8px", cursor:"pointer", fontWeight:700, color:"#fff", fontFamily:"'DM Sans',sans-serif" }}>Save Changes</button>
          </div>
        </Modal>
      )}

      {/* Change Password */}
      {changePassModal && (
        <Modal title="Change Password" onClose={() => setChangePassModal(false)}>
          <form onSubmit={handleChangePassword}>
            {([
              { label:"Current Password", key:"current", show: showPass.current, toggle: () => setShowPass(s=>({...s, current:!s.current})) },
              { label:"New Password",     key:"newP",    show: showPass.newP,    toggle: () => setShowPass(s=>({...s, newP:!s.newP})) },
              { label:"Confirm Password", key:"confirm", show: showPass.confirm, toggle: () => setShowPass(s=>({...s, confirm:!s.confirm})) },
            ] as { label:string; key:"current"|"newP"|"confirm"; show:boolean; toggle:()=>void }[]).map(f => (
              <div key={f.key} style={{ marginBottom:"1.1rem" }}>
                <label style={labelSt}>{f.label}</label>
                <div style={{ position:"relative" }}>
                  <input style={{ ...inputSt, paddingRight:"2.8rem" }} type={f.show ? "text" : "password"} placeholder="••••••••"
                    value={passForm[f.key]}
                    onChange={e => setPassForm(p => ({ ...p, [f.key]: e.target.value }))} />
                  <button type="button" onClick={f.toggle} style={{ position:"absolute", right:"0.9rem", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:"1rem", opacity:0.5 }}>{f.show ? "🙈" : "👁️"}</button>
                </div>
                {f.key === "newP" && passForm.newP && (
                  <>
                    <div style={{ display:"flex", gap:"3px", marginTop:"0.4rem" }}>
                      {[1,2,3,4].map(i => <div key={i} style={{ flex:1, height:"3px", borderRadius:"99px", background: i <= passStrength ? passStrengthColor : "#E2D5C3" }} />)}
                    </div>
                    <div style={{ fontSize:"0.72rem", fontWeight:700, color:passStrengthColor, marginTop:"2px" }}>{passStrengthLabel}</div>
                  </>
                )}
                {f.key === "confirm" && passForm.confirm && passForm.newP === passForm.confirm && (
                  <div style={{ fontSize:"0.72rem", color:"#1A6B3A", fontWeight:600, marginTop:"3px" }}>✓ Passwords match</div>
                )}
              </div>
            ))}
            <div style={{ background:"#F5EFE6", borderRadius:"8px", padding:"0.7rem 0.9rem", marginBottom:"1rem", fontSize:"0.8rem", color:"#7A6050" }}>
              🔑 Use 8+ characters with uppercase, numbers, and symbols for a strong password.
            </div>
            <div style={{ display:"flex", gap:"0.7rem" }}>
              <button type="button" onClick={() => setChangePassModal(false)} style={{ flex:1, padding:"0.75rem", background:"#F5EFE6", border:"1.5px solid #E2D5C3", borderRadius:"8px", cursor:"pointer", fontWeight:600, color:"#5C4A38", fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
              <button type="submit" style={{ flex:2, padding:"0.75rem", background:"#1C1410", border:"none", borderRadius:"8px", cursor:"pointer", fontWeight:700, color:"#fff", fontFamily:"'DM Sans',sans-serif" }}>Update Password</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Support Ticket */}
      {supportModal && (
        <Modal title="New Support Ticket" onClose={() => setSupportModal(false)}>
          <form onSubmit={handleSubmitTicket}>
            <div style={{ marginBottom:"1.1rem" }}>
              <label style={labelSt}>Related Order (optional)</label>
              <select style={{ ...inputSt, cursor:"pointer" }} value={ticketForm.orderId} onChange={e => setTicketForm(f => ({ ...f, orderId: e.target.value }))}>
                <option value="">— Select an order —</option>
                {USER_ORDERS.map(o => <option key={o.id} value={o.id}>{o.id} · {o.service}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:"1.1rem" }}>
              <label style={labelSt}>Subject *</label>
              <input style={inputSt} required placeholder="Brief description of your issue" value={ticketForm.subject} onChange={e => setTicketForm(f => ({ ...f, subject: e.target.value }))} />
            </div>
            <div style={{ marginBottom:"1.1rem" }}>
              <label style={labelSt}>Message *</label>
              <textarea style={{ ...inputSt, resize:"vertical", minHeight:"100px" }} required placeholder="Describe your issue in detail. The more info you give, the faster we can help!" value={ticketForm.message} onChange={e => setTicketForm(f => ({ ...f, message: e.target.value }))} />
            </div>
            <div style={{ background:"#EAF4FC", borderRadius:"8px", padding:"0.7rem 0.9rem", marginBottom:"1rem", fontSize:"0.8rem", color:"#1A5276" }}>
              ⚡ We typically respond within <strong>2 hours</strong> during business hours (Mon–Sat, 8am–7pm).
            </div>
            <div style={{ display:"flex", gap:"0.7rem" }}>
              <button type="button" onClick={() => setSupportModal(false)} style={{ flex:1, padding:"0.75rem", background:"#F5EFE6", border:"1.5px solid #E2D5C3", borderRadius:"8px", cursor:"pointer", fontWeight:600, color:"#5C4A38", fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
              <button type="submit" style={{ flex:2, padding:"0.75rem", background:"#1C1410", border:"none", borderRadius:"8px", cursor:"pointer", fontWeight:700, color:"#fff", fontFamily:"'DM Sans',sans-serif" }}>Submit Ticket</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  );
}
