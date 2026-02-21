"use client";

import { useState, useEffect } from "react";

// ─── TYPES ───────────────────────────────────────────────────────────────────

type ProjectStatus = "Pending" | "In Progress" | "Awaiting Approval" | "Printing" | "Completed" | "Cancelled";
type ServiceType = "Banners" | "Posters" | "2D|3D Signage" | "Sublimation" | "Plotting & Vinyl" | "Business Cards" | "Heat Press" | "DTF No-Cut";

interface Project {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  service: ServiceType;
  description: string;
  dimension?: string;
  quantity: number;
  totalAmount: number;
  depositPaid: number;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  notes: string;
  artworkUploaded: boolean;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  joinedAt: string;
  totalOrders: number;
  totalSpent: number;
  status: "Active" | "Inactive" | "Blocked";
  lastActive: string;
}

interface Notification {
  id: string;
  message: string;
  type: "order" | "payment" | "alert";
  time: string;
  read: boolean;
}

// ─── SEED DATA ────────────────────────────────────────────────────────────────

const SEED_PROJECTS: Project[] = [
  { id: "PRJ-001", clientName: "Aisha Kamau", clientEmail: "aisha@gmail.com", clientPhone: "+254712345678", service: "Banners", description: "Event banners for Nairobi Marathon 2025", dimension: "8ft × 4ft", quantity: 6, totalAmount: 27000, depositPaid: 13500, status: "In Progress", createdAt: "2025-02-10", updatedAt: "2025-02-14", notes: "Client wants grommets on all four sides. Urgent.", artworkUploaded: true },
  { id: "PRJ-002", clientName: "Brian Otieno", clientEmail: "brian@shopke.com", clientPhone: "+254723456789", service: "2D|3D Signage", description: "Shop front 3D letter signage", dimension: undefined, quantity: 1, totalAmount: 18500, depositPaid: 9250, status: "Awaiting Approval", createdAt: "2025-02-11", updatedAt: "2025-02-13", notes: "Design proof sent. Awaiting client sign-off.", artworkUploaded: true },
  { id: "PRJ-003", clientName: "Cynthia Wanjiku", clientEmail: "cynthia@safaricom.co.ke", clientPhone: "+254734567890", service: "Sublimation", description: "Branded jerseys for corporate team", dimension: undefined, quantity: 50, totalAmount: 45000, depositPaid: 22500, status: "Printing", createdAt: "2025-02-08", updatedAt: "2025-02-15", notes: "Printing underway. 30 done, 20 remaining.", artworkUploaded: true },
  { id: "PRJ-004", clientName: "David Mwangi", clientEmail: "david@startup.io", clientPhone: "+254745678901", service: "Business Cards", description: "Premium spot UV business cards", dimension: undefined, quantity: 500, totalAmount: 4000, depositPaid: 2000, status: "Completed", createdAt: "2025-02-05", updatedAt: "2025-02-09", notes: "Collected by client. Fully paid.", artworkUploaded: true },
  { id: "PRJ-005", clientName: "Fatuma Hassan", clientEmail: "fatuma@events.co.ke", clientPhone: "+254756789012", service: "Posters", description: "A1 concert posters glossy finish", dimension: "A1 (59.4×84.1cm)", quantity: 200, totalAmount: 16000, depositPaid: 8000, status: "Pending", createdAt: "2025-02-15", updatedAt: "2025-02-15", notes: "Awaiting artwork from client.", artworkUploaded: false },
  { id: "PRJ-006", clientName: "George Njoroge", clientEmail: "george@realty.ke", clientPhone: "+254767890123", service: "Plotting & Vinyl", description: "Vehicle wrap — Toyota Prado", dimension: undefined, quantity: 1, totalAmount: 35000, depositPaid: 17500, status: "In Progress", createdAt: "2025-02-12", updatedAt: "2025-02-14", notes: "Surface prep done. Vinyl application tomorrow.", artworkUploaded: true },
  { id: "PRJ-007", clientName: "Helen Kimani", clientEmail: "helen@bakery.com", clientPhone: "+254778901234", service: "Heat Press", description: "Branded aprons and caps", dimension: undefined, quantity: 30, totalAmount: 9000, depositPaid: 4500, status: "Completed", createdAt: "2025-02-03", updatedAt: "2025-02-07", notes: "Client satisfied. Left 5-star review.", artworkUploaded: true },
  { id: "PRJ-008", clientName: "Ibrahim Suleiman", clientEmail: "ibrahim@logistics.ke", clientPhone: "+254789012345", service: "DTF No-Cut", description: "DTF transfers on 100 t-shirts", dimension: undefined, quantity: 100, totalAmount: 25000, depositPaid: 12500, status: "Cancelled", createdAt: "2025-02-01", updatedAt: "2025-02-04", notes: "Client cancelled. Deposit refund processed.", artworkUploaded: false },
];

const SEED_USERS: User[] = [
  { id: "USR-001", fullName: "Aisha Kamau", email: "aisha@gmail.com", phone: "+254712345678", joinedAt: "2024-08-15", totalOrders: 7, totalSpent: 89500, status: "Active", lastActive: "2025-02-15" },
  { id: "USR-002", fullName: "Brian Otieno", email: "brian@shopke.com", phone: "+254723456789", joinedAt: "2024-10-02", totalOrders: 3, totalSpent: 42000, status: "Active", lastActive: "2025-02-13" },
  { id: "USR-003", fullName: "Cynthia Wanjiku", email: "cynthia@safaricom.co.ke", phone: "+254734567890", joinedAt: "2024-06-20", totalOrders: 12, totalSpent: 215000, status: "Active", lastActive: "2025-02-15" },
  { id: "USR-004", fullName: "David Mwangi", email: "david@startup.io", phone: "+254745678901", joinedAt: "2024-11-30", totalOrders: 2, totalSpent: 8500, status: "Active", lastActive: "2025-02-09" },
  { id: "USR-005", fullName: "Fatuma Hassan", email: "fatuma@events.co.ke", phone: "+254756789012", joinedAt: "2024-09-14", totalOrders: 5, totalSpent: 67000, status: "Active", lastActive: "2025-02-15" },
  { id: "USR-006", fullName: "George Njoroge", email: "george@realty.ke", phone: "+254767890123", joinedAt: "2024-07-08", totalOrders: 4, totalSpent: 112000, status: "Active", lastActive: "2025-02-14" },
  { id: "USR-007", fullName: "Helen Kimani", email: "helen@bakery.com", phone: "+254778901234", joinedAt: "2024-12-01", totalOrders: 3, totalSpent: 22500, status: "Inactive", lastActive: "2025-02-07" },
  { id: "USR-008", fullName: "Ibrahim Suleiman", email: "ibrahim@logistics.ke", phone: "+254789012345", joinedAt: "2024-05-10", totalOrders: 1, totalSpent: 0, status: "Blocked", lastActive: "2025-02-04" },
];

const SEED_NOTIFICATIONS: Notification[] = [
  { id: "N1", message: "New order PRJ-009 received from Jane Waweru", type: "order", time: "2 min ago", read: false },
  { id: "N2", message: "Deposit payment confirmed for PRJ-006 — KES 17,500", type: "payment", time: "18 min ago", read: false },
  { id: "N3", message: "PRJ-005 artwork still pending — follow up with Fatuma Hassan", type: "alert", time: "1 hr ago", read: false },
  { id: "N4", message: "PRJ-003 printing 60% complete", type: "order", time: "3 hrs ago", read: true },
  { id: "N5", message: "Balance payment received for PRJ-004 — KES 2,000", type: "payment", time: "6 hrs ago", read: true },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const STATUS_META: Record<ProjectStatus, { color: string; bg: string; icon: string }> = {
  "Pending":           { color: "#8B6914", bg: "#FEF9E7", icon: "🕐" },
  "In Progress":       { color: "#1A5276", bg: "#EAF4FC", icon: "⚙️" },
  "Awaiting Approval": { color: "#7D3C98", bg: "#F5EEF8", icon: "🔍" },
  "Printing":          { color: "#1E8449", bg: "#EAFAF1", icon: "🖨️" },
  "Completed":         { color: "#1E8449", bg: "#D5F5E3", icon: "✅" },
  "Cancelled":         { color: "#922B21", bg: "#FDEDEC", icon: "❌" },
};

const USER_STATUS_META: Record<string, { color: string; bg: string }> = {
  "Active":   { color: "#1E8449", bg: "#D5F5E3" },
  "Inactive": { color: "#8B6914", bg: "#FEF9E7" },
  "Blocked":  { color: "#922B21", bg: "#FDEDEC" },
};

const SERVICE_ICONS: Record<string, string> = {
  "Banners": "🏳️", "Posters": "🖼️", "2D|3D Signage": "📌",
  "Sublimation": "👕", "Plotting & Vinyl": "✂️",
  "Business Cards": "💼", "Heat Press": "🔥", "DTF No-Cut": "🎨",
};

const fmt = (n: number) => `KES ${n.toLocaleString()}`;
const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

// ─── MODAL ────────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(14,10,7,0.6)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem", backdropFilter:"blur(4px)" }}
      onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:"16px", width:"100%", maxWidth:"640px", maxHeight:"90vh", overflowY:"auto", boxShadow:"0 24px 60px rgba(0,0,0,0.25)" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"1.5rem 2rem", borderBottom:"1px solid #F0E8DC", position:"sticky", top:0, background:"#fff", zIndex:1, borderRadius:"16px 16px 0 0" }}>
          <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.2rem", fontWeight:800, color:"#1C1410" }}>{title}</h3>
          <button onClick={onClose} style={{ background:"#F5EFE6", border:"none", borderRadius:"8px", width:"32px", height:"32px", cursor:"pointer", fontSize:"1.1rem", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>
        <div style={{ padding:"2rem" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── CONFIRM DIALOG ───────────────────────────────────────────────────────────

function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(14,10,7,0.65)", zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
      <div style={{ background:"#fff", borderRadius:"12px", padding:"2rem", maxWidth:"380px", width:"100%", boxShadow:"0 16px 48px rgba(0,0,0,0.22)", textAlign:"center" }}>
        <div style={{ fontSize:"2.5rem", marginBottom:"0.8rem" }}>🗑️</div>
        <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", fontWeight:700, color:"#1C1410", marginBottom:"0.5rem" }}>Are you sure?</p>
        <p style={{ fontSize:"0.88rem", color:"#7A6050", marginBottom:"1.5rem", lineHeight:1.6 }}>{message}</p>
        <div style={{ display:"flex", gap:"0.75rem" }}>
          <button onClick={onCancel} style={{ flex:1, padding:"0.75rem", background:"#F5EFE6", border:"none", borderRadius:"8px", cursor:"pointer", fontWeight:600, color:"#5C4A38", fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex:1, padding:"0.75rem", background:"#C0392B", border:"none", borderRadius:"8px", cursor:"pointer", fontWeight:700, color:"#fff", fontFamily:"'DM Sans',sans-serif" }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── FORM FIELD COMPONENT ─────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom:"1.1rem" }}>
      <label style={{ display:"block", fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#7A6050", marginBottom:"0.4rem" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width:"100%", background:"#F9F6F2", border:"1.5px solid #E2D5C3",
  borderRadius:"8px", padding:"0.7rem 0.9rem", fontFamily:"'DM Sans',sans-serif",
  fontSize:"0.92rem", color:"#1C1410", outline:"none", boxSizing:"border-box",
};

const selectStyle: React.CSSProperties = { ...inputStyle, cursor:"pointer" };

// ─── PROJECT FORM ─────────────────────────────────────────────────────────────

function ProjectForm({ initial, onSave, onClose }: { initial?: Partial<Project>; onSave: (p: Project) => void; onClose: () => void }) {
  const blank: Project = {
    id: `PRJ-${String(Math.floor(Math.random()*900)+100)}`,
    clientName:"", clientEmail:"", clientPhone:"",
    service:"Banners", description:"", dimension:"",
    quantity:1, totalAmount:0, depositPaid:0,
    status:"Pending", createdAt: new Date().toISOString().slice(0,10),
    updatedAt: new Date().toISOString().slice(0,10),
    notes:"", artworkUploaded:false,
  };
  const [form, setForm] = useState<Project>({ ...blank, ...initial } as Project);
  const set = (k: keyof Project, v: any) => setForm(f => ({ ...f, [k]: v, updatedAt: new Date().toISOString().slice(0,10) }));

  const SERVICES: ServiceType[] = ["Banners","Posters","2D|3D Signage","Sublimation","Plotting & Vinyl","Business Cards","Heat Press","DTF No-Cut"];
  const STATUSES: ProjectStatus[] = ["Pending","In Progress","Awaiting Approval","Printing","Completed","Cancelled"];

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); onClose(); }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 1rem" }}>
        <Field label="Client Name">
          <input style={inputStyle} required value={form.clientName} onChange={e => set("clientName", e.target.value)} placeholder="Full name" />
        </Field>
        <Field label="Client Email">
          <input style={inputStyle} type="email" value={form.clientEmail} onChange={e => set("clientEmail", e.target.value)} placeholder="email@example.com" />
        </Field>
        <Field label="Phone Number">
          <input style={inputStyle} value={form.clientPhone} onChange={e => set("clientPhone", e.target.value)} placeholder="+2547XXXXXXXX" />
        </Field>
        <Field label="Service">
          <select style={selectStyle} value={form.service} onChange={e => set("service", e.target.value as ServiceType)}>
            {SERVICES.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        {(form.service === "Banners" || form.service === "Posters") && (
          <Field label="Dimension / Size">
            <input style={inputStyle} value={form.dimension ?? ""} onChange={e => set("dimension", e.target.value)} placeholder="e.g. 8ft × 4ft" />
          </Field>
        )}
        <Field label="Quantity">
          <input style={inputStyle} type="number" min={1} value={form.quantity} onChange={e => set("quantity", parseInt(e.target.value)||1)} />
        </Field>
        <Field label="Total Amount (KES)">
          <input style={inputStyle} type="number" min={0} value={form.totalAmount} onChange={e => set("totalAmount", parseFloat(e.target.value)||0)} />
        </Field>
        <Field label="Deposit Paid (KES)">
          <input style={inputStyle} type="number" min={0} value={form.depositPaid} onChange={e => set("depositPaid", parseFloat(e.target.value)||0)} />
        </Field>
        <Field label="Status">
          <select style={selectStyle} value={form.status} onChange={e => set("status", e.target.value as ProjectStatus)}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Artwork Uploaded">
          <select style={selectStyle} value={form.artworkUploaded ? "yes" : "no"} onChange={e => set("artworkUploaded", e.target.value === "yes")}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </Field>
      </div>
      <Field label="Project Description">
        <textarea style={{ ...inputStyle, resize:"vertical", minHeight:"70px" }} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Describe the project..." />
      </Field>
      <Field label="Internal Notes">
        <textarea style={{ ...inputStyle, resize:"vertical", minHeight:"60px" }} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Notes visible only to admin..." />
      </Field>
      <div style={{ display:"flex", gap:"0.75rem", marginTop:"0.5rem" }}>
        <button type="button" onClick={onClose} style={{ flex:1, padding:"0.8rem", background:"#F5EFE6", border:"none", borderRadius:"8px", cursor:"pointer", fontWeight:600, color:"#5C4A38", fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
        <button type="submit" style={{ flex:2, padding:"0.8rem", background:"#1C1410", border:"none", borderRadius:"8px", cursor:"pointer", fontWeight:700, color:"#fff", fontFamily:"'DM Sans',sans-serif" }}>Save Project</button>
      </div>
    </form>
  );
}

// ─── USER FORM ────────────────────────────────────────────────────────────────

function UserForm({ initial, onSave, onClose }: { initial?: Partial<User>; onSave: (u: User) => void; onClose: () => void }) {
  const blank: User = {
    id: `USR-${String(Math.floor(Math.random()*900)+100)}`,
    fullName:"", email:"", phone:"",
    joinedAt: new Date().toISOString().slice(0,10),
    totalOrders:0, totalSpent:0, status:"Active",
    lastActive: new Date().toISOString().slice(0,10),
  };
  const [form, setForm] = useState<User>({ ...blank, ...initial } as User);
  const set = (k: keyof User, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); onClose(); }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 1rem" }}>
        <Field label="Full Name">
          <input style={inputStyle} required value={form.fullName} onChange={e => set("fullName", e.target.value)} placeholder="Full name" />
        </Field>
        <Field label="Email">
          <input style={inputStyle} type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="email@example.com" />
        </Field>
        <Field label="Phone">
          <input style={inputStyle} value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+2547XXXXXXXX" />
        </Field>
        <Field label="Account Status">
          <select style={selectStyle} value={form.status} onChange={e => set("status", e.target.value as User["status"])}>
            <option>Active</option>
            <option>Inactive</option>
            <option>Blocked</option>
          </select>
        </Field>
        <Field label="Total Orders">
          <input style={inputStyle} type="number" min={0} value={form.totalOrders} onChange={e => set("totalOrders", parseInt(e.target.value)||0)} />
        </Field>
        <Field label="Total Spent (KES)">
          <input style={inputStyle} type="number" min={0} value={form.totalSpent} onChange={e => set("totalSpent", parseFloat(e.target.value)||0)} />
        </Field>
      </div>
      <div style={{ display:"flex", gap:"0.75rem", marginTop:"0.5rem" }}>
        <button type="button" onClick={onClose} style={{ flex:1, padding:"0.8rem", background:"#F5EFE6", border:"none", borderRadius:"8px", cursor:"pointer", fontWeight:600, color:"#5C4A38", fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
        <button type="submit" style={{ flex:2, padding:"0.8rem", background:"#1C1410", border:"none", borderRadius:"8px", cursor:"pointer", fontWeight:700, color:"#fff", fontFamily:"'DM Sans',sans-serif" }}>Save User</button>
      </div>
    </form>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, accent }: { icon: string; label: string; value: string; sub: string; accent: string }) {
  return (
    <div style={{ background:"#fff", border:"1px solid #F0E8DC", borderRadius:"14px", padding:"1.4rem 1.6rem", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, right:0, width:"80px", height:"80px", background:accent, borderRadius:"0 14px 0 80px", opacity:0.12 }} />
      <div style={{ fontSize:"1.6rem", marginBottom:"0.8rem" }}>{icon}</div>
      <div style={{ fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#A89070", marginBottom:"0.3rem" }}>{label}</div>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.9rem", fontWeight:900, color:"#1C1410", lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:"0.78rem", color:"#A89070", marginTop:"0.4rem" }}>{sub}</div>
    </div>
  );
}

// ─── BADGE ────────────────────────────────────────────────────────────────────

function Badge({ status, meta }: { status: string; meta: { color: string; bg: string; icon?: string } }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:"0.3rem", padding:"0.2rem 0.65rem", borderRadius:"99px", background:meta.bg, color:meta.color, fontSize:"0.75rem", fontWeight:700, whiteSpace:"nowrap" }}>
      {meta.icon && <span style={{ fontSize:"0.7rem" }}>{meta.icon}</span>}
      {status}
    </span>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────

type Tab = "overview" | "projects" | "users" | "financials" | "activity";

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [projects, setProjects] = useState<Project[]>(SEED_PROJECTS);
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [notifications, setNotifications] = useState<Notification[]>(SEED_NOTIFICATIONS);
  const [showNotif, setShowNotif] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Project modals
  const [projectModal, setProjectModal] = useState<"add" | "edit" | "view" | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [confirmDeleteProject, setConfirmDeleteProject] = useState<Project | null>(null);
  const [projectSearch, setProjectSearch] = useState("");
  const [projectStatusFilter, setProjectStatusFilter] = useState<ProjectStatus | "All">("All");

  // User modals
  const [userModal, setUserModal] = useState<"add" | "edit" | "view" | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<User | null>(null);
  const [userSearch, setUserSearch] = useState("");

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Project CRUD
  const saveProject = (p: Project) => {
    setProjects(ps => ps.find(x => x.id === p.id) ? ps.map(x => x.id === p.id ? p : x) : [p, ...ps]);
    showToast(`Project ${p.id} saved successfully`);
  };
  const deleteProject = (p: Project) => {
    setProjects(ps => ps.filter(x => x.id !== p.id));
    showToast(`Project ${p.id} deleted`, "error");
    setConfirmDeleteProject(null);
  };

  // ── User CRUD
  const saveUser = (u: User) => {
    setUsers(us => us.find(x => x.id === u.id) ? us.map(x => x.id === u.id ? u : x) : [u, ...us]);
    showToast(`User ${u.fullName} saved`);
  };
  const deleteUser = (u: User) => {
    setUsers(us => us.filter(x => x.id !== u.id));
    showToast(`User ${u.fullName} removed`, "error");
    setConfirmDeleteUser(null);
  };

  // ── Quick status update
  const quickStatus = (id: string, status: ProjectStatus) => {
    setProjects(ps => ps.map(p => p.id === id ? { ...p, status, updatedAt: new Date().toISOString().slice(0,10) } : p));
    showToast(`Status updated to "${status}"`);
  };

  // ── Filtered lists
  const filteredProjects = projects.filter(p => {
    const matchSearch = p.clientName.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.service.toLowerCase().includes(projectSearch.toLowerCase());
    const matchStatus = projectStatusFilter === "All" || p.status === projectStatusFilter;
    return matchSearch && matchStatus;
  });

  const filteredUsers = users.filter(u =>
    u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.phone.includes(userSearch)
  );

  // ── Stats
  const totalRevenue = projects.filter(p => p.status === "Completed").reduce((s, p) => s + p.totalAmount, 0);
  const pendingRevenue = projects.filter(p => !["Completed","Cancelled"].includes(p.status)).reduce((s, p) => s + (p.totalAmount - p.depositPaid), 0);
  const activeProjects = projects.filter(p => !["Completed","Cancelled"].includes(p.status)).length;
  const unread = notifications.filter(n => !n.read).length;

  const NAV_ITEMS: { id: Tab; icon: string; label: string }[] = [
    { id: "overview",   icon: "◈",  label: "Overview"    },
    { id: "projects",   icon: "🗂️", label: "Projects"    },
    { id: "users",      icon: "👥", label: "Clients"     },
    { id: "financials", icon: "💰", label: "Financials"  },
    { id: "activity",   icon: "📋", label: "Activity Log" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }
        body { font-family: 'DM Sans', sans-serif; background: #F5EFE6; color: #1C1410; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #F0E8DC; }
        ::-webkit-scrollbar-thumb { background: #D9CAAF; border-radius: 99px; }
        input, select, textarea { font-family: 'DM Sans', sans-serif; }

        .dash-shell { display: flex; min-height: 100vh; }

        /* ── SIDEBAR */
        .sidebar {
          width: 240px; min-height: 100vh;
          background: #1C1410;
          display: flex; flex-direction: column;
          position: fixed; top: 0; left: 0; bottom: 0;
          z-index: 50; transition: width 0.25s ease;
          overflow: hidden;
        }
        .sidebar.collapsed { width: 68px; }
        .sidebar-logo {
          padding: 1.4rem 1.4rem 1rem;
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem; font-weight: 900;
          color: #fff; white-space: nowrap;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; gap: 0.6rem;
        }
        .sidebar-logo span { color: #C19A4A; }
        .sidebar-logo-small {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem; font-weight: 900; color: #fff;
        }
        .sidebar-logo-small span { color: #C19A4A; }
        .sidebar-nav { flex: 1; padding: 0.8rem 0; }
        .nav-item {
          display: flex; align-items: center; gap: 0.9rem;
          padding: 0.75rem 1.4rem;
          cursor: pointer; transition: background 0.15s;
          white-space: nowrap; border-left: 3px solid transparent;
          text-decoration: none;
        }
        .nav-item:hover { background: rgba(255,255,255,0.05); }
        .nav-item.active {
          background: rgba(193,154,74,0.12);
          border-left-color: #C19A4A;
        }
        .nav-icon { font-size: 1.1rem; min-width: 20px; text-align: center; }
        .nav-label { font-size: 0.88rem; font-weight: 500; color: #C8B89A; }
        .nav-item.active .nav-label { color: #E8C97A; font-weight: 600; }
        .sidebar-footer {
          padding: 1rem 1.4rem;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .admin-chip {
          display: flex; align-items: center; gap: 0.7rem;
        }
        .admin-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg, #C19A4A, #8B5E3C);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif;
          font-size: 0.85rem; font-weight: 700; color: #fff; flex-shrink: 0;
        }
        .admin-name { font-size: 0.82rem; font-weight: 600; color: #E8C97A; white-space: nowrap; }
        .admin-role { font-size: 0.7rem; color: #8B7355; white-space: nowrap; }

        /* ── MAIN */
        .main { margin-left: 240px; flex: 1; min-height: 100vh; transition: margin-left 0.25s ease; }
        .main.collapsed { margin-left: 68px; }

        /* ── TOPBAR */
        .topbar {
          background: #fff; height: 62px;
          border-bottom: 1px solid #F0E8DC;
          display: flex; align-items: center;
          padding: 0 2rem; gap: 1rem;
          position: sticky; top: 0; z-index: 40;
        }
        .topbar-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.2rem; font-weight: 900; color: #1C1410;
          flex: 1;
        }
        .topbar-actions { display: flex; align-items: center; gap: 0.75rem; }
        .icon-btn {
          width: 38px; height: 38px; border-radius: 8px;
          background: #F5EFE6; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem; transition: background 0.15s; position: relative;
        }
        .icon-btn:hover { background: #EDE3D4; }
        .notif-badge {
          position: absolute; top: -4px; right: -4px;
          background: #C0392B; color: #fff;
          border-radius: 99px; font-size: 0.6rem; font-weight: 700;
          min-width: 16px; height: 16px;
          display: flex; align-items: center; justify-content: center;
          padding: 0 3px; border: 2px solid #fff;
        }
        .collapse-btn {
          background: none; border: none; cursor: pointer;
          font-size: 1.2rem; color: #8B7355; padding: 4px;
          transition: color 0.15s;
        }
        .collapse-btn:hover { color: #1C1410; }

        /* ── CONTENT */
        .content { padding: 2rem; }

        /* ── NOTIF PANEL */
        .notif-panel {
          position: absolute; top: 50px; right: 0;
          background: #fff; border: 1px solid #F0E8DC;
          border-radius: 12px; width: 340px;
          box-shadow: 0 12px 40px rgba(28,20,16,0.15);
          z-index: 100; overflow: hidden;
        }
        .notif-header {
          padding: 0.9rem 1.2rem;
          display: flex; justify-content: space-between; align-items: center;
          border-bottom: 1px solid #F0E8DC;
        }
        .notif-title { font-family: 'Playfair Display', serif; font-size: 0.95rem; font-weight: 800; color: #1C1410; }
        .notif-clear { font-size: 0.75rem; color: #C19A4A; cursor: pointer; font-weight: 600; background: none; border: none; }
        .notif-item {
          padding: 0.85rem 1.2rem;
          border-bottom: 1px solid #FAF6F1;
          display: flex; gap: 0.7rem; align-items: flex-start;
          transition: background 0.15s;
        }
        .notif-item:hover { background: #FAF6F1; }
        .notif-item.unread { background: #FFFBF5; }
        .notif-dot { width: 7px; height: 7px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
        .notif-msg { font-size: 0.82rem; color: #3D2B1A; line-height: 1.4; }
        .notif-time { font-size: 0.72rem; color: #A89070; margin-top: 2px; }

        /* ── TABLE */
        .table-wrap { background: #fff; border: 1px solid #F0E8DC; border-radius: 14px; overflow: hidden; }
        .table-toolbar {
          padding: 1.2rem 1.5rem;
          display: flex; gap: 0.75rem; align-items: center;
          border-bottom: 1px solid #F0E8DC; flex-wrap: wrap;
        }
        .search-input {
          flex: 1; min-width: 180px;
          background: #F9F6F2; border: 1.5px solid #E2D5C3;
          border-radius: 8px; padding: 0.6rem 1rem 0.6rem 2.4rem;
          font-family: 'DM Sans', sans-serif; font-size: 0.88rem; color: #1C1410;
          outline: none; transition: border-color 0.2s;
        }
        .search-input:focus { border-color: #C19A4A; }
        .search-wrap { position: relative; flex: 1; min-width: 180px; }
        .search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); font-size: 0.85rem; opacity: 0.5; pointer-events: none; }
        .filter-select {
          background: #F9F6F2; border: 1.5px solid #E2D5C3;
          border-radius: 8px; padding: 0.6rem 0.9rem;
          font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
          color: #1C1410; cursor: pointer; outline: none;
        }
        .filter-select:focus { border-color: #C19A4A; }
        .add-btn {
          background: #1C1410; color: #fff; border: none;
          border-radius: 8px; padding: 0.6rem 1.2rem;
          font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 700;
          cursor: pointer; transition: background 0.15s; white-space: nowrap;
          display: flex; align-items: center; gap: 0.4rem;
        }
        .add-btn:hover { background: #8B5E3C; }
        table { width: 100%; border-collapse: collapse; }
        thead th {
          text-align: left; padding: 0.85rem 1.2rem;
          font-size: 0.72rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #A89070; background: #FAF6F1;
          border-bottom: 1px solid #F0E8DC; white-space: nowrap;
        }
        tbody td {
          padding: 0.9rem 1.2rem;
          font-size: 0.88rem; color: #1C1410;
          border-bottom: 1px solid #FAF6F1; vertical-align: middle;
        }
        tbody tr:last-child td { border-bottom: none; }
        tbody tr:hover td { background: #FFFBF5; }
        .action-btns { display: flex; gap: 0.4rem; align-items: center; }
        .act-btn {
          padding: 0.3rem 0.65rem; border-radius: 6px;
          font-size: 0.75rem; font-weight: 600;
          border: 1.5px solid transparent; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all 0.15s;
          white-space: nowrap;
        }
        .act-view  { background: #EAF4FC; color: #1A5276; border-color: #D6EAF8; }
        .act-edit  { background: #FEF9E7; color: #8B6914; border-color: #FCF3CF; }
        .act-del   { background: #FDEDEC; color: #922B21; border-color: #FADBD8; }
        .act-view:hover  { background: #D6EAF8; }
        .act-edit:hover  { background: #FCF3CF; }
        .act-del:hover   { background: #FADBD8; }
        .empty-state {
          text-align: center; padding: 3rem 1rem; color: #A89070;
        }
        .empty-state-icon { font-size: 2.5rem; margin-bottom: 0.6rem; }

        /* ── GRID LAYOUTS */
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.2rem; margin-bottom: 2rem; }
        .two-col { display: grid; grid-template-columns: 1.4fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
        .section-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 1rem;
        }
        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.05rem; font-weight: 900; color: #1C1410;
        }
        .see-all-btn {
          font-size: 0.78rem; font-weight: 600; color: #C19A4A;
          background: none; border: none; cursor: pointer;
          transition: opacity 0.15s;
        }
        .see-all-btn:hover { opacity: 0.7; }

        /* ── MINI TABLE (overview) */
        .mini-table { width: 100%; border-collapse: collapse; }
        .mini-table th {
          text-align: left; padding: 0.6rem 0.9rem;
          font-size: 0.68rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #A89070; background: #FAF6F1;
        }
        .mini-table td {
          padding: 0.75rem 0.9rem; font-size: 0.84rem;
          border-top: 1px solid #FAF6F1; vertical-align: middle;
        }

        /* ── STATUS KANBAN MINI */
        .kanban-row { display: flex; gap: 0.7rem; flex-wrap: wrap; margin-bottom: 2rem; }
        .kanban-card {
          flex: 1; min-width: 130px;
          background: #fff; border: 1px solid #F0E8DC;
          border-radius: 10px; padding: 1rem 1.1rem;
        }
        .kanban-count { font-family: 'Playfair Display', serif; font-size: 1.7rem; font-weight: 900; color: #1C1410; line-height: 1; }
        .kanban-label { font-size: 0.75rem; color: #A89070; margin-top: 0.25rem; }

        /* ── FINANCIALS */
        .fin-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.2rem; margin-bottom: 2rem; }
        .fin-card {
          background: #fff; border: 1px solid #F0E8DC;
          border-radius: 14px; padding: 1.5rem;
        }
        .fin-label { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #A89070; margin-bottom: 0.5rem; }
        .fin-value { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 900; color: #1C1410; }
        .fin-sub { font-size: 0.8rem; color: #A89070; margin-top: 0.4rem; }
        .service-row { display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0; border-bottom: 1px solid #FAF6F1; }
        .service-row:last-child { border-bottom: none; }
        .service-bar-wrap { flex: 1; margin: 0 0.8rem; height: 6px; background: #F0E8DC; border-radius: 99px; overflow: hidden; }
        .service-bar-fill { height: 100%; border-radius: 99px; background: #C19A4A; }

        /* ── ACTIVITY LOG */
        .activity-item {
          display: flex; gap: 1rem; padding: 1rem 0;
          border-bottom: 1px solid #FAF6F1;
        }
        .activity-item:last-child { border-bottom: none; }
        .activity-line-wrap { display: flex; flex-direction: column; align-items: center; }
        .activity-dot {
          width: 10px; height: 10px; border-radius: 50%;
          flex-shrink: 0; margin-top: 4px;
        }
        .activity-line { flex: 1; width: 2px; background: #F0E8DC; margin-top: 4px; }
        .activity-body { flex: 1; }
        .activity-msg { font-size: 0.88rem; color: #1C1410; line-height: 1.5; }
        .activity-time { font-size: 0.75rem; color: #A89070; margin-top: 2px; }

        /* ── VIEW DETAIL */
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem 1.5rem; margin-bottom: 1.2rem; }
        .detail-item label { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #A89070; display: block; margin-bottom: 0.2rem; }
        .detail-item span { font-size: 0.9rem; color: #1C1410; font-weight: 500; }
        .detail-full { margin-bottom: 1rem; }
        .detail-full label { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #A89070; display: block; margin-bottom: 0.3rem; }
        .detail-full p { font-size: 0.88rem; color: #3D2B1A; line-height: 1.65; background: #FAF6F1; border-radius: 8px; padding: 0.75rem; }

        /* ── QUICK STATUS */
        .status-dropdown {
          background: none; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem; padding: 0;
        }

        /* ── TOAST */
        .toast {
          position: fixed; bottom: 1.5rem; right: 1.5rem;
          background: #1C1410; color: #fff;
          padding: 0.85rem 1.4rem; border-radius: 10px;
          font-size: 0.88rem; font-weight: 500;
          box-shadow: 0 8px 24px rgba(0,0,0,0.22);
          z-index: 9999; display: flex; align-items: center; gap: 0.5rem;
          animation: slideToast 0.3s ease;
        }
        .toast.error { background: #922B21; }
        @keyframes slideToast {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── RESPONSIVE */
        @media (max-width: 1100px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .two-col { grid-template-columns: 1fr; }
          .fin-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .sidebar { width: 68px; }
          .main { margin-left: 68px; }
          .sidebar-logo > span:not(.sidebar-logo-small) { display: none; }
          .nav-label { display: none; }
          .admin-name, .admin-role { display: none; }
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .fin-grid { grid-template-columns: 1fr; }
          .content { padding: 1rem; }
          .table-toolbar { flex-direction: column; }
          .search-wrap { width: 100%; }
          .detail-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dash-shell">

        {/* ── SIDEBAR ────────────────────────────────────── */}
        <aside className={`sidebar${sidebarOpen ? "" : " collapsed"}`}>
          <div className="sidebar-logo">
            {sidebarOpen
              ? <><span style={{color:"#fff"}}>FRANK</span><span>STAT</span><span style={{fontSize:"0.6rem",background:"rgba(193,154,74,0.2)",color:"#C19A4A",borderRadius:"4px",padding:"1px 6px",fontFamily:"'DM Sans',sans-serif",fontWeight:700,letterSpacing:"0.1em",marginLeft:"2px"}}>ADMIN</span></>
              : <span className="sidebar-logo-small">F<span>S</span></span>
            }
          </div>

          <nav className="sidebar-nav">
            {NAV_ITEMS.map(item => (
              <div key={item.id} className={`nav-item${tab === item.id ? " active" : ""}`} onClick={() => setTab(item.id)}>
                <span className="nav-icon">{item.icon}</span>
                {sidebarOpen && <span className="nav-label">{item.label}</span>}
              </div>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="admin-chip">
              <div className="admin-avatar">A</div>
              {sidebarOpen && (
                <div>
                  <div className="admin-name">Admin</div>
                  <div className="admin-role">Frankstat HQ</div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ── MAIN ───────────────────────────────────────── */}
        <div className={`main${sidebarOpen ? "" : " collapsed"}`}>

          {/* TOPBAR */}
          <header className="topbar">
            <button className="collapse-btn" onClick={() => setSidebarOpen(o => !o)} title="Toggle sidebar">
              {sidebarOpen ? "◀" : "▶"}
            </button>
            <div className="topbar-title">
              {tab === "overview" && "Dashboard Overview"}
              {tab === "projects" && "Projects"}
              {tab === "users" && "Clients"}
              {tab === "financials" && "Financials"}
              {tab === "activity" && "Activity Log"}
            </div>
            <div className="topbar-actions">
              <div style={{ position:"relative" }}>
                <button className="icon-btn" onClick={() => setShowNotif(o => !o)} title="Notifications">
                  🔔
                  {unread > 0 && <span className="notif-badge">{unread}</span>}
                </button>
                {showNotif && (
                  <div className="notif-panel">
                    <div className="notif-header">
                      <span className="notif-title">Notifications</span>
                      <button className="notif-clear" onClick={() => { setNotifications(ns => ns.map(n => ({...n, read:true}))); }}>Mark all read</button>
                    </div>
                    {notifications.map(n => (
                      <div key={n.id} className={`notif-item${n.read ? "" : " unread"}`} onClick={() => setNotifications(ns => ns.map(x => x.id === n.id ? {...x, read:true} : x))}>
                        <div className="notif-dot" style={{ background: n.type === "order" ? "#C19A4A" : n.type === "payment" ? "#1E8449" : "#C0392B" }} />
                        <div>
                          <div className="notif-msg">{n.message}</div>
                          <div className="notif-time">{n.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ width:"34px", height:"34px", borderRadius:"50%", background:"linear-gradient(135deg, #C19A4A, #8B5E3C)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Playfair Display',serif", fontSize:"0.85rem", fontWeight:700, color:"#fff", cursor:"pointer" }}>A</div>
            </div>
          </header>

          <div className="content">

            {/* ══════════════════════ OVERVIEW ══════════════════════ */}
            {tab === "overview" && (
              <>
                {/* Stats */}
                <div className="stats-grid">
                  <StatCard icon="🗂️" label="Active Projects" value={String(activeProjects)} sub={`${projects.filter(p=>p.status==="Completed").length} completed`} accent="#C19A4A" />
                  <StatCard icon="💰" label="Revenue (Completed)" value={`KES ${(totalRevenue/1000).toFixed(0)}K`} sub="From completed jobs" accent="#1E8449" />
                  <StatCard icon="⏳" label="Pending Balance" value={`KES ${(pendingRevenue/1000).toFixed(0)}K`} sub="Balances on active jobs" accent="#8B6914" />
                  <StatCard icon="👥" label="Total Clients" value={String(users.length)} sub={`${users.filter(u=>u.status==="Active").length} active`} accent="#1A5276" />
                </div>

                {/* Status kanban */}
                <div className="section-header">
                  <div className="section-title">Project Pipeline</div>
                </div>
                <div className="kanban-row">
                  {(["Pending","In Progress","Awaiting Approval","Printing","Completed","Cancelled"] as ProjectStatus[]).map(s => {
                    const count = projects.filter(p => p.status === s).length;
                    const m = STATUS_META[s];
                    return (
                      <div key={s} className="kanban-card" style={{ borderTop: `3px solid ${m.color}` }}>
                        <div className="kanban-count" style={{ color: m.color }}>{count}</div>
                        <div className="kanban-label">{s}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="two-col">
                  {/* Recent projects */}
                  <div>
                    <div className="section-header">
                      <div className="section-title">Recent Projects</div>
                      <button className="see-all-btn" onClick={() => setTab("projects")}>See all →</button>
                    </div>
                    <div className="table-wrap">
                      <table className="mini-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Client</th>
                            <th>Service</th>
                            <th>Status</th>
                            <th>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projects.slice(0,6).map(p => (
                            <tr key={p.id} style={{ cursor:"pointer" }} onClick={() => { setSelectedProject(p); setProjectModal("view"); }}>
                              <td><span style={{ fontSize:"0.78rem", fontFamily:"monospace", color:"#8B7355" }}>{p.id}</span></td>
                              <td style={{ fontWeight:600 }}>{p.clientName}</td>
                              <td><span style={{ fontSize:"0.8rem" }}>{SERVICE_ICONS[p.service]} {p.service}</span></td>
                              <td><Badge status={p.status} meta={STATUS_META[p.status]} /></td>
                              <td style={{ fontWeight:600 }}>{fmt(p.totalAmount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Top clients */}
                  <div>
                    <div className="section-header">
                      <div className="section-title">Top Clients</div>
                      <button className="see-all-btn" onClick={() => setTab("users")}>See all →</button>
                    </div>
                    <div className="table-wrap" style={{ padding:"0.5rem 0" }}>
                      {users.sort((a,b) => b.totalSpent - a.totalSpent).slice(0,6).map((u, i) => (
                        <div key={u.id} style={{ display:"flex", alignItems:"center", gap:"0.8rem", padding:"0.7rem 1.2rem", borderBottom: i < 5 ? "1px solid #FAF6F1" : "none", cursor:"pointer" }}
                          onClick={() => { setSelectedUser(u); setUserModal("view"); }}>
                          <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:"linear-gradient(135deg, #C19A4A44, #8B5E3C44)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Playfair Display',serif", fontSize:"0.85rem", fontWeight:700, color:"#8B5E3C", flexShrink:0 }}>
                            {u.fullName[0]}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontWeight:600, fontSize:"0.88rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.fullName}</div>
                            <div style={{ fontSize:"0.75rem", color:"#A89070" }}>{u.totalOrders} orders</div>
                          </div>
                          <div style={{ fontWeight:700, fontSize:"0.85rem", color:"#1C1410", whiteSpace:"nowrap" }}>{fmt(u.totalSpent)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ══════════════════════ PROJECTS ══════════════════════ */}
            {tab === "projects" && (
              <>
                <div className="table-wrap">
                  <div className="table-toolbar">
                    <div className="search-wrap">
                      <span className="search-icon">🔍</span>
                      <input className="search-input" placeholder="Search by client, ID, service…" value={projectSearch} onChange={e => setProjectSearch(e.target.value)} />
                    </div>
                    <select className="filter-select" value={projectStatusFilter} onChange={e => setProjectStatusFilter(e.target.value as any)}>
                      <option value="All">All Statuses</option>
                      {(["Pending","In Progress","Awaiting Approval","Printing","Completed","Cancelled"] as ProjectStatus[]).map(s => <option key={s}>{s}</option>)}
                    </select>
                    <button className="add-btn" onClick={() => { setSelectedProject(null); setProjectModal("add"); }}>
                      + New Project
                    </button>
                  </div>
                  {filteredProjects.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">🗂️</div>
                      <p>No projects found</p>
                    </div>
                  ) : (
                    <div style={{ overflowX:"auto" }}>
                      <table>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Client</th>
                            <th>Service</th>
                            <th>Qty</th>
                            <th>Total</th>
                            <th>Deposit</th>
                            <th>Balance</th>
                            <th>Status</th>
                            <th>Artwork</th>
                            <th>Updated</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProjects.map(p => (
                            <tr key={p.id}>
                              <td><span style={{ fontFamily:"monospace", fontSize:"0.8rem", color:"#8B7355" }}>{p.id}</span></td>
                              <td>
                                <div style={{ fontWeight:600 }}>{p.clientName}</div>
                                <div style={{ fontSize:"0.75rem", color:"#A89070" }}>{p.clientPhone}</div>
                              </td>
                              <td><span style={{ fontSize:"0.85rem" }}>{SERVICE_ICONS[p.service]} {p.service}</span></td>
                              <td style={{ textAlign:"center" }}>{p.quantity}</td>
                              <td style={{ fontWeight:600 }}>{fmt(p.totalAmount)}</td>
                              <td style={{ color:"#1E8449", fontWeight:600 }}>{fmt(p.depositPaid)}</td>
                              <td style={{ color: p.totalAmount - p.depositPaid > 0 ? "#C0392B" : "#1E8449", fontWeight:600 }}>
                                {fmt(p.totalAmount - p.depositPaid)}
                              </td>
                              <td>
                                <select className="status-dropdown" value={p.status}
                                  onChange={e => quickStatus(p.id, e.target.value as ProjectStatus)}
                                  style={{ padding:"0.25rem 0.4rem", borderRadius:"6px", border:"none", background: STATUS_META[p.status].bg, color: STATUS_META[p.status].color, fontWeight:700, fontSize:"0.75rem", cursor:"pointer" }}>
                                  {(["Pending","In Progress","Awaiting Approval","Printing","Completed","Cancelled"] as ProjectStatus[]).map(s => <option key={s}>{s}</option>)}
                                </select>
                              </td>
                              <td style={{ textAlign:"center" }}>{p.artworkUploaded ? "✅" : "❌"}</td>
                              <td style={{ color:"#A89070", fontSize:"0.8rem" }}>{fmtDate(p.updatedAt)}</td>
                              <td>
                                <div className="action-btns">
                                  <button className="act-btn act-view" onClick={() => { setSelectedProject(p); setProjectModal("view"); }}>View</button>
                                  <button className="act-btn act-edit" onClick={() => { setSelectedProject(p); setProjectModal("edit"); }}>Edit</button>
                                  <button className="act-btn act-del" onClick={() => setConfirmDeleteProject(p)}>Delete</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div style={{ padding:"0.8rem 1.5rem", background:"#FAF6F1", fontSize:"0.78rem", color:"#A89070", borderTop:"1px solid #F0E8DC" }}>
                    Showing {filteredProjects.length} of {projects.length} projects
                  </div>
                </div>
              </>
            )}

            {/* ══════════════════════ USERS ══════════════════════ */}
            {tab === "users" && (
              <div className="table-wrap">
                <div className="table-toolbar">
                  <div className="search-wrap">
                    <span className="search-icon">🔍</span>
                    <input className="search-input" placeholder="Search by name, email, phone…" value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                  </div>
                  <button className="add-btn" onClick={() => { setSelectedUser(null); setUserModal("add"); }}>
                    + Add Client
                  </button>
                </div>
                {filteredUsers.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <p>No clients found</p>
                  </div>
                ) : (
                  <div style={{ overflowX:"auto" }}>
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Client</th>
                          <th>Phone</th>
                          <th>Joined</th>
                          <th>Orders</th>
                          <th>Total Spent</th>
                          <th>Last Active</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map(u => (
                          <tr key={u.id}>
                            <td><span style={{ fontFamily:"monospace", fontSize:"0.8rem", color:"#8B7355" }}>{u.id}</span></td>
                            <td>
                              <div style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
                                <div style={{ width:"30px", height:"30px", borderRadius:"50%", background:"linear-gradient(135deg,#C19A4A44,#8B5E3C44)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Playfair Display',serif", fontSize:"0.82rem", fontWeight:700, color:"#8B5E3C", flexShrink:0 }}>{u.fullName[0]}</div>
                                <div>
                                  <div style={{ fontWeight:600 }}>{u.fullName}</div>
                                  <div style={{ fontSize:"0.75rem", color:"#A89070" }}>{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td>{u.phone}</td>
                            <td style={{ color:"#A89070", fontSize:"0.82rem" }}>{fmtDate(u.joinedAt)}</td>
                            <td style={{ textAlign:"center", fontWeight:600 }}>{u.totalOrders}</td>
                            <td style={{ fontWeight:700 }}>{fmt(u.totalSpent)}</td>
                            <td style={{ color:"#A89070", fontSize:"0.82rem" }}>{fmtDate(u.lastActive)}</td>
                            <td><Badge status={u.status} meta={USER_STATUS_META[u.status]} /></td>
                            <td>
                              <div className="action-btns">
                                <button className="act-btn act-view" onClick={() => { setSelectedUser(u); setUserModal("view"); }}>View</button>
                                <button className="act-btn act-edit" onClick={() => { setSelectedUser(u); setUserModal("edit"); }}>Edit</button>
                                <button className="act-btn act-del" onClick={() => setConfirmDeleteUser(u)}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div style={{ padding:"0.8rem 1.5rem", background:"#FAF6F1", fontSize:"0.78rem", color:"#A89070", borderTop:"1px solid #F0E8DC" }}>
                  {filteredUsers.length} clients · {users.filter(u=>u.status==="Active").length} active · {users.filter(u=>u.status==="Blocked").length} blocked
                </div>
              </div>
            )}

            {/* ══════════════════════ FINANCIALS ══════════════════════ */}
            {tab === "financials" && (
              <>
                <div className="fin-grid">
                  <div className="fin-card">
                    <div className="fin-label">Total Revenue (Completed)</div>
                    <div className="fin-value">{fmt(totalRevenue)}</div>
                    <div className="fin-sub">{projects.filter(p=>p.status==="Completed").length} completed projects</div>
                  </div>
                  <div className="fin-card">
                    <div className="fin-label">Total Deposits Collected</div>
                    <div className="fin-value">{fmt(projects.reduce((s,p) => s + p.depositPaid, 0))}</div>
                    <div className="fin-sub">Across all projects</div>
                  </div>
                  <div className="fin-card">
                    <div className="fin-label">Pending Balances</div>
                    <div className="fin-value" style={{ color:"#C19A4A" }}>{fmt(pendingRevenue)}</div>
                    <div className="fin-sub">Outstanding on active projects</div>
                  </div>
                  <div className="fin-card">
                    <div className="fin-label">Pipeline Value</div>
                    <div className="fin-value">{fmt(projects.filter(p=>!["Completed","Cancelled"].includes(p.status)).reduce((s,p)=>s+p.totalAmount,0))}</div>
                    <div className="fin-sub">Total value of active work</div>
                  </div>
                  <div className="fin-card">
                    <div className="fin-label">Lost (Cancelled)</div>
                    <div className="fin-value" style={{ color:"#922B21" }}>{fmt(projects.filter(p=>p.status==="Cancelled").reduce((s,p)=>s+p.totalAmount,0))}</div>
                    <div className="fin-sub">{projects.filter(p=>p.status==="Cancelled").length} cancelled orders</div>
                  </div>
                  <div className="fin-card">
                    <div className="fin-label">Avg. Order Value</div>
                    <div className="fin-value">{fmt(Math.round(projects.reduce((s,p)=>s+p.totalAmount,0) / (projects.length||1)))}</div>
                    <div className="fin-sub">Across {projects.length} total orders</div>
                  </div>
                </div>

                <div className="two-col">
                  {/* Revenue by service */}
                  <div>
                    <div className="section-header"><div className="section-title">Revenue by Service</div></div>
                    <div className="table-wrap" style={{ padding:"1rem 1.5rem" }}>
                      {(Object.keys(SERVICE_ICONS) as ServiceType[]).map(svc => {
                        const rev = projects.filter(p => p.service === svc && p.status === "Completed").reduce((s,p)=>s+p.totalAmount,0);
                        const maxRev = Math.max(...(Object.keys(SERVICE_ICONS) as ServiceType[]).map(s => projects.filter(p=>p.service===s&&p.status==="Completed").reduce((x,p)=>x+p.totalAmount,0)), 1);
                        return (
                          <div key={svc} className="service-row">
                            <span style={{ fontSize:"0.84rem", minWidth:"160px" }}>{SERVICE_ICONS[svc]} {svc}</span>
                            <div className="service-bar-wrap">
                              <div className="service-bar-fill" style={{ width:`${(rev/maxRev)*100}%` }} />
                            </div>
                            <span style={{ fontSize:"0.82rem", fontWeight:700, minWidth:"90px", textAlign:"right" }}>{fmt(rev)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recent transactions */}
                  <div>
                    <div className="section-header"><div className="section-title">Recent Transactions</div></div>
                    <div className="table-wrap">
                      <table className="mini-table">
                        <thead>
                          <tr>
                            <th>Project</th>
                            <th>Client</th>
                            <th>Deposit</th>
                            <th>Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projects.slice(0,8).map(p => (
                            <tr key={p.id}>
                              <td><span style={{ fontFamily:"monospace", fontSize:"0.78rem", color:"#8B7355" }}>{p.id}</span></td>
                              <td style={{ fontSize:"0.82rem" }}>{p.clientName}</td>
                              <td style={{ color:"#1E8449", fontWeight:600, fontSize:"0.82rem" }}>{fmt(p.depositPaid)}</td>
                              <td style={{ color: p.totalAmount-p.depositPaid>0 ? "#C0392B" : "#1E8449", fontWeight:600, fontSize:"0.82rem" }}>{fmt(p.totalAmount-p.depositPaid)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ══════════════════════ ACTIVITY ══════════════════════ */}
            {tab === "activity" && (
              <div style={{ maxWidth:"700px" }}>
                <div className="section-header" style={{ marginBottom:"1.5rem" }}>
                  <div className="section-title">Activity Log</div>
                  <span style={{ fontSize:"0.78rem", color:"#A89070" }}>All system events</span>
                </div>
                <div className="table-wrap" style={{ padding:"0 1.5rem" }}>
                  {[
                    { dot:"#C19A4A", msg:"New project PRJ-001 created for Aisha Kamau — Banners × 6", time:"Today, 09:14 AM" },
                    { dot:"#1E8449", msg:"Deposit of KES 13,500 received for PRJ-001 via M-Pesa", time:"Today, 09:15 AM" },
                    { dot:"#1A5276", msg:"PRJ-001 status updated to In Progress", time:"Today, 11:30 AM" },
                    { dot:"#C19A4A", msg:"New project PRJ-002 created for Brian Otieno — 3D Signage", time:"Yesterday, 02:10 PM" },
                    { dot:"#7D3C98", msg:"PRJ-002 status updated to Awaiting Approval — proof sent to client", time:"Yesterday, 04:55 PM" },
                    { dot:"#C19A4A", msg:"New project PRJ-003 created for Cynthia Wanjiku — Sublimation × 50", time:"Feb 08, 10:00 AM" },
                    { dot:"#1E8449", msg:"PRJ-003 status updated to Printing — 30/50 units done", time:"Feb 14, 03:22 PM" },
                    { dot:"#1E8449", msg:"PRJ-004 marked Completed — balance KES 2,000 collected", time:"Feb 09, 05:00 PM" },
                    { dot:"#C0392B", msg:"PRJ-008 cancelled by Ibrahim Suleiman — deposit refund processed", time:"Feb 04, 01:15 PM" },
                    { dot:"#8B6914", msg:"PRJ-005 artwork still pending — follow-up required for Fatuma Hassan", time:"Feb 15, 08:00 AM" },
                  ].map((a, i, arr) => (
                    <div key={i} className="activity-item">
                      <div className="activity-line-wrap">
                        <div className="activity-dot" style={{ background: a.dot }} />
                        {i < arr.length - 1 && <div className="activity-line" />}
                      </div>
                      <div className="activity-body">
                        <div className="activity-msg">{a.msg}</div>
                        <div className="activity-time">{a.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>{/* /content */}
        </div>{/* /main */}
      </div>{/* /dash-shell */}

      {/* ══════════════ MODALS ══════════════ */}

      {/* Project: Add */}
      {projectModal === "add" && (
        <Modal title="New Project" onClose={() => setProjectModal(null)}>
          <ProjectForm onSave={saveProject} onClose={() => setProjectModal(null)} />
        </Modal>
      )}

      {/* Project: Edit */}
      {projectModal === "edit" && selectedProject && (
        <Modal title={`Edit ${selectedProject.id}`} onClose={() => setProjectModal(null)}>
          <ProjectForm initial={selectedProject} onSave={saveProject} onClose={() => setProjectModal(null)} />
        </Modal>
      )}

      {/* Project: View */}
      {projectModal === "view" && selectedProject && (
        <Modal title={`${selectedProject.id} — ${selectedProject.clientName}`} onClose={() => setProjectModal(null)}>
          <div style={{ display:"flex", gap:"0.6rem", marginBottom:"1.2rem" }}>
            <Badge status={selectedProject.status} meta={STATUS_META[selectedProject.status]} />
            <Badge status={selectedProject.service} meta={{ color:"#5C4A38", bg:"#F0E8DC" }} />
            {!selectedProject.artworkUploaded && <Badge status="No Artwork" meta={{ color:"#922B21", bg:"#FDEDEC" }} />}
          </div>
          <div className="detail-grid">
            <div className="detail-item"><label>Client</label><span>{selectedProject.clientName}</span></div>
            <div className="detail-item"><label>Email</label><span>{selectedProject.clientEmail}</span></div>
            <div className="detail-item"><label>Phone</label><span>{selectedProject.clientPhone}</span></div>
            <div className="detail-item"><label>Service</label><span>{SERVICE_ICONS[selectedProject.service]} {selectedProject.service}</span></div>
            {selectedProject.dimension && <div className="detail-item"><label>Dimension</label><span>{selectedProject.dimension}</span></div>}
            <div className="detail-item"><label>Quantity</label><span>{selectedProject.quantity}</span></div>
            <div className="detail-item"><label>Total Amount</label><span style={{ fontWeight:700 }}>{fmt(selectedProject.totalAmount)}</span></div>
            <div className="detail-item"><label>Deposit Paid</label><span style={{ color:"#1E8449", fontWeight:700 }}>{fmt(selectedProject.depositPaid)}</span></div>
            <div className="detail-item"><label>Balance</label><span style={{ color: selectedProject.totalAmount - selectedProject.depositPaid > 0 ? "#C0392B" : "#1E8449", fontWeight:700 }}>{fmt(selectedProject.totalAmount - selectedProject.depositPaid)}</span></div>
            <div className="detail-item"><label>Created</label><span>{fmtDate(selectedProject.createdAt)}</span></div>
            <div className="detail-item"><label>Last Updated</label><span>{fmtDate(selectedProject.updatedAt)}</span></div>
            <div className="detail-item"><label>Artwork</label><span>{selectedProject.artworkUploaded ? "✅ Uploaded" : "❌ Pending"}</span></div>
          </div>
          <div className="detail-full">
            <label>Description</label>
            <p>{selectedProject.description || "—"}</p>
          </div>
          <div className="detail-full">
            <label>Internal Notes</label>
            <p>{selectedProject.notes || "—"}</p>
          </div>
          <div style={{ display:"flex", gap:"0.75rem", marginTop:"0.5rem" }}>
            <button onClick={() => { setProjectModal("edit"); }} style={{ flex:1, padding:"0.75rem", background:"#FEF9E7", border:"1.5px solid #FCF3CF", borderRadius:"8px", cursor:"pointer", fontWeight:700, color:"#8B6914", fontFamily:"'DM Sans',sans-serif" }}>Edit Project</button>
            <button onClick={() => { setProjectModal(null); setConfirmDeleteProject(selectedProject); }} style={{ padding:"0.75rem 1.2rem", background:"#FDEDEC", border:"1.5px solid #FADBD8", borderRadius:"8px", cursor:"pointer", fontWeight:700, color:"#922B21", fontFamily:"'DM Sans',sans-serif" }}>Delete</button>
          </div>
        </Modal>
      )}

      {/* User: Add */}
      {userModal === "add" && (
        <Modal title="Add New Client" onClose={() => setUserModal(null)}>
          <UserForm onSave={saveUser} onClose={() => setUserModal(null)} />
        </Modal>
      )}

      {/* User: Edit */}
      {userModal === "edit" && selectedUser && (
        <Modal title={`Edit — ${selectedUser.fullName}`} onClose={() => setUserModal(null)}>
          <UserForm initial={selectedUser} onSave={saveUser} onClose={() => setUserModal(null)} />
        </Modal>
      )}

      {/* User: View */}
      {userModal === "view" && selectedUser && (
        <Modal title={selectedUser.fullName} onClose={() => setUserModal(null)}>
          <div style={{ display:"flex", gap:"0.6rem", marginBottom:"1.2rem" }}>
            <Badge status={selectedUser.status} meta={USER_STATUS_META[selectedUser.status]} />
          </div>
          <div className="detail-grid">
            <div className="detail-item"><label>User ID</label><span style={{ fontFamily:"monospace" }}>{selectedUser.id}</span></div>
            <div className="detail-item"><label>Email</label><span>{selectedUser.email}</span></div>
            <div className="detail-item"><label>Phone</label><span>{selectedUser.phone}</span></div>
            <div className="detail-item"><label>Joined</label><span>{fmtDate(selectedUser.joinedAt)}</span></div>
            <div className="detail-item"><label>Total Orders</label><span style={{ fontWeight:700 }}>{selectedUser.totalOrders}</span></div>
            <div className="detail-item"><label>Total Spent</label><span style={{ fontWeight:700, color:"#1C1410" }}>{fmt(selectedUser.totalSpent)}</span></div>
            <div className="detail-item"><label>Last Active</label><span>{fmtDate(selectedUser.lastActive)}</span></div>
            <div className="detail-item"><label>Account Status</label><span><Badge status={selectedUser.status} meta={USER_STATUS_META[selectedUser.status]} /></span></div>
          </div>
          <div style={{ background:"#FAF6F1", borderRadius:"10px", padding:"1rem 1.2rem", marginBottom:"1rem" }}>
            <div style={{ fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#A89070", marginBottom:"0.5rem" }}>Their Projects</div>
            {projects.filter(p => p.clientEmail === selectedUser.email).length === 0
              ? <p style={{ fontSize:"0.85rem", color:"#A89070" }}>No projects found for this client.</p>
              : projects.filter(p => p.clientEmail === selectedUser.email).map(p => (
                <div key={p.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.4rem 0", borderBottom:"1px solid #F0E8DC", fontSize:"0.84rem" }}>
                  <span style={{ fontFamily:"monospace", color:"#8B7355" }}>{p.id}</span>
                  <span>{p.service}</span>
                  <Badge status={p.status} meta={STATUS_META[p.status]} />
                  <span style={{ fontWeight:600 }}>{fmt(p.totalAmount)}</span>
                </div>
              ))
            }
          </div>
          <div style={{ display:"flex", gap:"0.75rem" }}>
            <button onClick={() => setUserModal("edit")} style={{ flex:1, padding:"0.75rem", background:"#FEF9E7", border:"1.5px solid #FCF3CF", borderRadius:"8px", cursor:"pointer", fontWeight:700, color:"#8B6914", fontFamily:"'DM Sans',sans-serif" }}>Edit Client</button>
            <button onClick={() => { setUserModal(null); setConfirmDeleteUser(selectedUser); }} style={{ padding:"0.75rem 1.2rem", background:"#FDEDEC", border:"1.5px solid #FADBD8", borderRadius:"8px", cursor:"pointer", fontWeight:700, color:"#922B21", fontFamily:"'DM Sans',sans-serif" }}>Remove</button>
          </div>
        </Modal>
      )}

      {/* Confirm delete — project */}
      {confirmDeleteProject && (
        <ConfirmDialog
          message={`This will permanently delete project ${confirmDeleteProject.id} for ${confirmDeleteProject.clientName}. This cannot be undone.`}
          onConfirm={() => deleteProject(confirmDeleteProject)}
          onCancel={() => setConfirmDeleteProject(null)}
        />
      )}

      {/* Confirm delete — user */}
      {confirmDeleteUser && (
        <ConfirmDialog
          message={`This will permanently remove ${confirmDeleteUser.fullName} from the system. All their data will be lost.`}
          onConfirm={() => deleteUser(confirmDeleteUser)}
          onCancel={() => setConfirmDeleteUser(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast${toast.type === "error" ? " error" : ""}`}>
          {toast.type === "success" ? "✅" : "🗑️"} {toast.msg}
        </div>
      )}
    </>
  );
}
