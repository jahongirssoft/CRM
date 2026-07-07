import { useState, useEffect, useRef } from "react";
import api from "../../api/axios";
import { getCurrentUser, ROLES } from "../../api/auth";
import { imgUrl, getPhotoUrl } from "../../api/fileUrl";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";

const PRIMARY    = "#7c3aed";
const PER_PAGE = 10;

const buildPages = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
};

const AVATAR_COLORS = ["#7c3aed","#3b82f6","#f59e0b","#16a34a","#ef4444","#0891b2","#db2777"];

const ALL_GROUPS = ["N26", "n105", "A1", "B2", "C3", "IELTS", "Math"];

const INIT_STUDENTS = [
  { id: 1, name: "Ali Valiyev",    phone: "+998976541223", email: "ali@gmail.com",   birthDate: "12.12.2010", address: "Sirdaryo",  createdDate: "12.05.2026", groups: ["N26","n105"] },
  { id: 2, name: "Salim Qodirov", phone: "+998977777777", email: "salim@gmail.com", birthDate: "14.01.2007", address: "Buxoro",    createdDate: "14.05.2026", groups: ["n105"] },
  { id: 3, name: "Bobur",         phone: "+998999999999", email: "bobur@gmail.com", birthDate: "14.03.2002", address: "Toshkent",  createdDate: "14.05.2026", groups: ["n105"] },
  { id: 4, name: "Qodir Salimov", phone: "+998911111111", email: "qodir@gmail.com", birthDate: "29.04.2026", address: "O'zbekcha",createdDate: "14.05.2026", groups: ["n105"] },
];

const initials  = (name) => name.trim().split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const avatarBg  = (id)   => AVATAR_COLORS[(id - 1) % AVATAR_COLORS.length];

/* ── small reusable input ── */
function FInput({ label, placeholder, value, onChange, type = "text", icon: Icon }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>{label}</label>
      <div style={{ position: "relative" }}>
        {Icon && <Icon style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#6b7280" }} />}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{ width: "100%", padding: Icon ? "10px 12px 10px 34px" : "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", color: "var(--text, #111)" }}
          onFocus={(e) => (e.target.style.border = `1.5px solid ${PRIMARY}`)}
          onBlur={(e)  => (e.target.style.border = "1.5px solid #e5e7eb")}
        />
      </div>
    </div>
  );
}

/* ── checkbox ── */
function CB({ checked, onChange }) {
  return (
    <div onClick={onChange} style={{ width: 17, height: 17, borderRadius: 4, border: checked ? "none" : "1.5px solid #d1d5db", backgroundColor: checked ? PRIMARY : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all .15s" }}>
      {checked && <svg width="10" height="10" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
    </div>
  );
}

export default function Talabalar() {
  const currentUser = getCurrentUser();
  const isStudent = currentUser?.role === ROLES.STUDENT;

  const [students, setStudents] = useState(INIT_STUDENTS);
  const [loading,  setLoading]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isArchive, setIsArchive] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [search,   setSearch]   = useState("");
  const [page,     setPage]     = useState(1);
  const [drawerOpen, setDrawerOpen]       = useState(false);
  const [groupModal, setGroupModal]       = useState(false);
  const [groupSearch, setGroupSearch]     = useState("");
  const [tempGroups, setTempGroups]       = useState([]);
  const [detailStudent, setDetailStudent] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleteId, setDeleteId]           = useState(null);
  const [deleteError, setDeleteError]     = useState("");
  const [editId, setEditId]               = useState(null);

  const [form, setForm] = useState({ phone: "+998", mail: "", fio: "", birthDate: "", address: "", password: "", groups: [], groupInput: "", photoFile: null, photoPreview: null });
  const photoInputRef = useRef(null);
  const [studentGroups, setStudentGroups] = useState([]);
  const [allGroups, setAllGroups]         = useState([]);

  useEffect(() => {
    fetchStudents(false);
    api.get("/groups/all")
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setAllGroups(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
  }, []);

  // student-group va groups faqat detail ko'rilganda lazy load qilinadi
  const loadStudentGroupData = () => {
    if (studentGroups.length > 0) return; // allaqachon yuklangan
    api.get("/student-group/all")
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setStudentGroups(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
    if (allGroups.length === 0) {
      api.get("/groups/all")
        .then((res) => {
          const data = res.data?.data ?? res.data;
          setAllGroups(Array.isArray(data) ? data : []);
        })
        .catch(() => {});
    }
  };

  const allIds     = students.map((s) => s.id);
  const allChecked = allIds.every((id) => selected.has(id));
  const someCk     = allIds.some((id) => selected.has(id)) && !allChecked;
  const toggleAll  = () => setSelected(allChecked ? new Set() : new Set(allIds));
  const toggleRow  = (id) => setSelected((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const filtered   = students.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);
  const pages      = buildPages(safePage, totalPages);

  const openDrawer = () => { setForm({ phone: "+998", mail: "", fio: "", birthDate: "", address: "", password: "", groups: [], groupInput: "", photoFile: null, photoPreview: null }); setSaveError(""); setEditId(null); setDrawerOpen(true); };

  // Header'даги "Qo'shish" tugmasidan chaqirilганда qo'shish oynasini ochamiz
  useEffect(() => {
    const trigger = () => {
      if (sessionStorage.getItem("__quickAdd") === "talabalar") {
        sessionStorage.removeItem("__quickAdd");
        openDrawer();
      }
    };
    trigger();
    window.addEventListener("quickadd", trigger);
    return () => window.removeEventListener("quickadd", trigger);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const openEdit   = (s) => {
    setEditId(s.id);
    setSaveError("");
    // Map existing group names to their real IDs
    const matchedGroupIds = (s.groups || []).map(groupName => {
      const found = allGroups.find(g => g.name === groupName);
      return found ? found.id : groupName;
    });
    setForm({ 
      phone: s.phone !== "—" ? s.phone : "+998", 
      mail: s.email !== "—" ? s.email : "", 
      fio: s.name !== "—" ? s.name : "", 
      birthDate: s.birthDate && s.birthDate !== "—" ? String(s.birthDate).slice(0, 10) : "",
      address: s.address !== "—" ? s.address : "", 
      password: "", 
      groups: matchedGroupIds, 
      groupInput: "", 
      photoFile: null, 
      photoPreview: null 
    });
    setDrawerOpen(true);
  };

  const openGroupModal = () => { setTempGroups([...form.groups]); setGroupSearch(""); setGroupModal(true); };
  const closeGroupModal = () => setGroupModal(false);
  const toggleTempGroup = (g) => setTempGroups((p) => p.includes(g) ? p.filter((x) => x !== g) : [...p, g]);
  const confirmGroups = () => { set("groups", tempGroups); closeGroupModal(); };
  const closeDrawer = () => { setDrawerOpen(false); setEditId(null); };

  const addGroup = (e) => {
    if (e.key === "Enter" && form.groupInput.trim()) {
      set("groups", [...form.groups, form.groupInput.trim()]);
      set("groupInput", "");
    }
  };

  const mapStudent = (s, i) => ({
    id: s.id || s._id || i + 1,
    name: s.fullName || s.full_name || s.name || "—",
    phone: s.phone || "—",
    email: s.email || "—",
    birthDate: (s.birthDate || s.birth_date) ? String(s.birthDate || s.birth_date).slice(0, 10) : "—",
    address: s.address || "—",
    createdDate: s.createdAt || s.created_at ? new Date(s.createdAt || s.created_at).toLocaleDateString() : "—",
    groups: (s.groups || []).map((g) => (typeof g === "object" ? g.name || g.label || "—" : g)),
    photo: s.photo ?? s.avatar ?? s.image ?? null,
  });

  const fetchStudents = (archive = false) => {
    setLoading(true);
    // Parametrsiz GET faqat 10 ta qaytaradi — yangi qo'shilganlar (katta ID) ko'rinmaydi.
    // Shuning uchun to'liq ro'yxatni katta limit bilan olamiz.
    api.get(archive ? "/students/archive" : "/students", { params: { page: 1, limit: 1000 } })
      .then((res) => {
        const data = res.data?.data || res.data || [];
        setStudents(Array.isArray(data) ? data.map(mapStudent) : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const toggleArchive = () => {
    const next = !isArchive;
    setIsArchive(next);
    setSelected(new Set());
    fetchStudents(next);
  };

  const handleSave = async () => {
    setSaveError("");
    // Majburiy maydonlarni tekshirish
    if (!form.fio.trim() || !form.phone.trim() || !form.address.trim()) {
      setSaveError("Barcha majburiy maydonlarni to'ldiring.");
      return;
    }
    // Yangi talaba uchun email, parol va tug'ilgan sana majburiy (backend talabi)
    if (!editId && (!form.mail.trim() || !form.password || !form.birthDate)) {
      setSaveError("Email, parol va tug'ilgan sanani kiriting.");
      return;
    }
    setSaving(true);
    try {
      // O'qituvchilar bilan bir xil, ishlaydigan usul: har doim FormData (multipart)
      const fd = new FormData();
      fd.append("full_name", form.fio.trim());
      if (form.mail.trim()) fd.append("email", form.mail.trim());
      if (form.password) fd.append("password", form.password);
      fd.append("phone", form.phone.trim());
      fd.append("address", form.address.trim());
      // birth_date faqat kiritilgan bo'lsa yuboriladi (bo'sh satr validatsiyani buzadi)
      if (form.birthDate) fd.append("birth_date", form.birthDate);
      if (form.photoFile) fd.append("photo", form.photoFile);

      // Guruh nomlarini ID ga aylantirib, vergul bilan yuboramiz (faqat yangi yaratishda)
      const groupIds = form.groups
        .map((g) => {
          const found = allGroups.find(
            (ag) => ag.id === g || ag.name === g || String(ag.id) === String(g)
          );
          return found ? found.id : g;
        })
        .filter((id) => id !== undefined && id !== null && id !== "");
      if (!editId && groupIds.length) fd.append("groups", groupIds.join(","));

      const cfg = { headers: { "Content-Type": "multipart/form-data" } };
      if (editId) {
        await api.patch(`/students/${editId}`, fd, cfg);
      } else {
        await api.post("/students", fd, cfg);
      }
      closeDrawer();
      fetchStudents(isArchive);
    } catch (err) {
      const status = err?.response?.status;
      let msg = err?.response?.data?.message;
      if (Array.isArray(msg)) msg = msg.join(", ");
      // Backend 409 da faqat "Conflict" deydi — tushunarli xabarga aylantiramiz
      if (status === 409 || msg === "Conflict") {
        msg = "Bu email yoki telefon raqam allaqachon ro'yxatdan o'tgan.";
      }
      setSaveError(msg || err?.message || "Xatolik yuz berdi.");
    } finally {
      setSaving(false);
    }
  };

  const viewStudent = (id) => {
    setDetailLoading(true);
    setDetailStudent({});
    loadStudentGroupData();
    api.get(`/students/one/${id}`)
      .then((res) => {
        const s = res.data?.data || res.data || {};
        const apiGroups = (s.groups || []).map((g) => (typeof g === "object" ? g.name || "—" : g));
        const sgGroups = studentGroups
          .filter((sg) => sg.student_id === id)
          .map((sg) => {
            const found = allGroups.find((g) => g.id === sg.group_id);
            return found?.name ?? `Guruh #${sg.group_id}`;
          });
        setDetailStudent({
          id: s.id || id,
          name: s.fullName || s.full_name || s.name || "—",
          phone: s.phone || "—",
          email: s.email || "—",
          birthDate: (s.birthDate || s.birth_date) ? String(s.birthDate || s.birth_date).slice(0, 10) : "—",
          address: s.address || "—",
          createdDate: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—",
          groups: apiGroups.length > 0 ? apiGroups : sgGroups,
        });
      })
      .catch(() => setDetailStudent(null))
      .finally(() => setDetailLoading(false));
  };

  const confirmDelete = () => {
    setDeleteError("");
    api.delete(`/students/${deleteId}`)
      .then(() => {
        setStudents((p) => p.filter((s) => s.id !== deleteId));
        setDeleteId(null);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || "O'chirishda xatolik yuz berdi.";
        setDeleteError(Array.isArray(msg) ? msg.join(", ") : msg);
      });
  };

  const col  = { fontSize: 12, color: "var(--text-muted, #6b7280)", fontWeight: 500, padding: "10px 12px", textAlign: "left", whiteSpace: "nowrap" };
  const cell = { fontSize: 13, color: "var(--text, #374151)", padding: "13px 12px", verticalAlign: "middle" };

  return (
    <div className="page-content">

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text, #111)", margin: 0 }}>Talabalar</h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "6px 0 0", maxWidth: 640 }}>
            Ushbu sahifada siz Talabalar ro&apos;yxatini va ularning ma&apos;lumotlarini topasiz.
            Har bir Talaba ismi, fanlari va aloqa ma&apos;lumotlari keltirilgan.
          </p>
        </div>
        {!isStudent && (
          <button onClick={openDrawer} style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: PRIMARY, color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 3px 10px rgba(124,58,237,0.25)", whiteSpace: "nowrap" }}>
            <AddIcon style={{ fontSize: 17 }} /> Talaba qo&apos;shish
          </button>
        )}
      </div>

      {/* Card */}
      <div style={{ background: "var(--card, #fff)", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>

        {/* Search + filter row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #f5f5f5", flexWrap: "wrap", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <SearchIcon style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 17, color: "#6b7280" }} />
            <input
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: "7px 12px 7px 34px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", width: 220, color: "var(--text, #111)" }}
              onFocus={(e) => (e.target.style.border = `1.5px solid ${PRIMARY}`)}
              onBlur={(e) => (e.target.style.border = "1.5px solid #e5e7eb")}
            />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ display: "flex", alignItems: "center", gap: 6, border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "7px 14px", background: "var(--card, #fff)", fontSize: 13, cursor: "pointer", color: "#374151" }}>
              <FilterListIcon style={{ fontSize: 16 }} /> Filters
            </button>
            {!isStudent && (
              <button
                onClick={toggleArchive}
                style={{ display: "flex", alignItems: "center", gap: 6, border: `1.5px solid ${isArchive ? PRIMARY : "#e5e7eb"}`, borderRadius: 8, padding: "7px 14px", background: isArchive ? "#f3eeff" : "#fff", fontSize: 13, cursor: "pointer", color: isArchive ? PRIMARY : "#374151", fontWeight: isArchive ? 600 : 400, transition: "all 0.15s" }}
              >
                <Inventory2OutlinedIcon style={{ fontSize: 16 }} /> {isArchive ? "Arxivdan chiqish" : "Arxiv"}
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {!isStudent && (
                  <th style={{ ...col, width: 44, padding: "10px 16px" }}>
                    <CB checked={allChecked} onChange={toggleAll} />
                  </th>
                )}
                <th style={{ ...col }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 3 }}>Nomi <SwapVertIcon style={{ fontSize: 14 }} /></span>
                </th>
                <th style={{ ...col }}>Guruh</th>
                <th style={{ ...col }}>Telefon raqamlari</th>
                <th style={{ ...col }}>Email</th>
                <th style={{ ...col }}>Tug&apos;ilgan sanasi</th>
                <th style={{ ...col }}>Manzil</th>
                <th style={{ ...col }}>Yaratilgan sana</th>
                {!isStudent && (
  <th style={{ ...col, textAlign: "right", paddingRight: 20 }}>Amallar</th>
)}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={isStudent ? 8 : 9} style={{ textAlign: "center", padding: "32px", color: "#6b7280", fontSize: 14 }}>Yuklanmoqda...</td></tr>
              )}
              {!loading && paginated.map((s) => {
                const isSel = selected.has(s.id);
                const bg    = avatarBg(s.id);
                return (
                  <tr key={s.id}
                    style={{ borderTop: "1px solid var(--border, #f5f5f5)", background: isSel ? "#fdf9ff" : "var(--card, #fff)", transition: "background .12s" }}
                    onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = "var(--hover-bg, #fafafa)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = isSel ? "#fdf9ff" : "var(--card, #fff)"; }}
                  >
                    {!isStudent && (
                      <td style={{ ...cell, padding: "13px 16px" }}>
                        <CB checked={isSel} onChange={() => toggleRow(s.id)} />
                      </td>
                    )}

                    {/* Nomi */}
                    <td style={{ ...cell }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0, overflow: "hidden" }}>
                          {getPhotoUrl(s) ? <img src={getPhotoUrl(s)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials(s.name)}
                        </div>
                        <span style={{ fontWeight: 500, color: "var(--text, #111)" }}>{s.name}</span>
                      </div>
                    </td>

                    {/* Guruh */}
                    <td style={{ ...cell, maxWidth: 220 }}>
                      <div style={{ display: "flex", gap: 4, flexWrap: "nowrap", overflowX: "auto", paddingBottom: 4 }} className="badge-scroll">
                        {s.groups.map((g, gi) => (
                          <span key={gi} style={{ fontSize: 11, padding: "2px 7px", borderRadius: 6, background: gi === 0 ? "#f0fdf4" : "#f3f4f6", color: gi === 0 ? "#16a34a" : "#374151", border: `1px solid ${gi === 0 ? "#bbf7d0" : "#e5e7eb"}`, fontWeight: 500, whiteSpace: "nowrap", flexShrink: 0 }}>
                            {g}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td style={{ ...cell }}>{s.phone}</td>
                    <td style={{ ...cell, color: "#6b7280" }}>{s.email}</td>
                    <td style={{ ...cell }}>{s.birthDate}</td>
                    <td style={{ ...cell }}>{s.address}</td>
                    <td style={{ ...cell }}>{s.createdDate}</td>

                    {/* Amallar */}
                    <td style={{ ...cell, textAlign: "right", paddingRight: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                        <button onClick={() => viewStudent(s.id)} style={{ border: "none", background: "none", cursor: "pointer", color: "#6b7280", display: "flex", padding: 3, transition: "color .15s" }} onMouseEnter={(e) => (e.currentTarget.style.color = PRIMARY)} onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}>
                          <VisibilityOutlinedIcon style={{ fontSize: 17 }} />
                        </button>
                        <button onClick={() => { setDeleteId(s.id); setDeleteError(""); }} style={{ border: "none", background: "none", cursor: "pointer", color: "#6b7280", display: "flex", padding: 3, transition: "color .15s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")} onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}>
                          <DeleteOutlinedIcon style={{ fontSize: 17 }} />
                        </button>
                        <button onClick={() => openEdit(s)} style={{ border: "none", background: "none", cursor: "pointer", color: "#6b7280", display: "flex", padding: 3, transition: "color .15s" }} onMouseEnter={(e) => (e.currentTarget.style.color = PRIMARY)} onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}>
                          <EditOutlinedIcon style={{ fontSize: 17 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid #f5f5f5", flexWrap: "wrap", gap: 10 }}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}
            style={{ display: "flex", alignItems: "center", gap: 5, border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "7px 14px", background: "var(--card, #fff)", fontSize: 13, cursor: safePage === 1 ? "not-allowed" : "pointer", color: safePage === 1 ? "#d1d5db" : "#374151" }}>
            <ChevronLeftIcon style={{ fontSize: 16 }} /> Previous
          </button>
          <div style={{ display: "flex", gap: 4 }}>
            {pages.map((p, i) => (
              <button key={i} onClick={() => typeof p === "number" && setPage(p)}
                style={{ width: 34, height: 34, borderRadius: 8, border: "none", background: safePage === p ? PRIMARY : "transparent", color: safePage === p ? "#fff" : p === "..." ? "#6b7280" : "#374151", fontSize: 13, fontWeight: safePage === p ? 600 : 400, cursor: typeof p === "number" ? "pointer" : "default", transition: "all .15s" }}>
                {p}
              </button>
            ))}
          </div>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
            style={{ display: "flex", alignItems: "center", gap: 5, border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "7px 14px", background: "var(--card, #fff)", fontSize: 13, cursor: safePage === totalPages ? "not-allowed" : "pointer", color: safePage === totalPages ? "#d1d5db" : "#374151" }}>
            Next <ChevronRightIcon style={{ fontSize: 16 }} />
          </button>
        </div>
        )}
      </div>

      {/* ══ GURUH MODAL ══ */}
      {groupModal && (
        <>
          <div onClick={closeGroupModal} style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(0,0,0,0.35)" }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: 320, background: "var(--card, #fff)", borderRadius: 14,
            boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
            zIndex: 410, display: "flex", flexDirection: "column",
            fontFamily: "'Segoe UI', sans-serif",
            overflow: "hidden",
          }}>
            {/* Modal header */}
            <div style={{ padding: "20px 20px 12px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 16, color: "var(--text, #111)", margin: 0 }}>Guruhga biriktirish</p>
                <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0" }}>Bir yoki bir nechta guruhni tanlang</p>
              </div>
              <button onClick={closeGroupModal} style={{ border: "none", background: "none", cursor: "pointer", color: "#6b7280", padding: 2, display: "flex" }}>
                <CloseIcon style={{ fontSize: 20 }} />
              </button>
            </div>

            {/* Search */}
            <div style={{ padding: "0 16px 10px" }}>
              <div style={{ position: "relative" }}>
                <SearchIcon style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#6b7280" }} />
                <input
                  placeholder="Guruh qidirish..."
                  value={groupSearch}
                  onChange={(e) => setGroupSearch(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px 8px 32px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => (e.target.style.border = `1.5px solid ${PRIMARY}`)}
                  onBlur={(e) => (e.target.style.border = "1.5px solid #e5e7eb")}
                  autoFocus
                />
              </div>
            </div>

            {/* Group list */}
            <div style={{ maxHeight: 240, overflowY: "auto", padding: "0 16px", borderTop: "1px solid #f5f5f5", borderBottom: "1px solid #f5f5f5" }}>
              {allGroups.filter((g) => g.name.toLowerCase().includes(groupSearch.toLowerCase())).map((g) => {
                const checked = tempGroups.includes(g.id);
                return (
                  <div
                    key={g.id}
                    onClick={() => toggleTempGroup(g.id)}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 4px", cursor: "pointer", borderBottom: "1px solid #f9f9f9" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Checkbox */}
                    <div style={{ width: 18, height: 18, borderRadius: 5, border: checked ? "none" : "1.5px solid #d1d5db", backgroundColor: checked ? PRIMARY : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" }}>
                      {checked && <svg width="10" height="10" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
                    </div>
                    <span style={{ fontSize: 14, color: "var(--text, #111)", fontWeight: checked ? 500 : 400 }}>{g.name}</span>
                  </div>
                );
              })}
              {allGroups.filter((g) => g.name.toLowerCase().includes(groupSearch.toLowerCase())).length === 0 && (
                <p style={{ fontSize: 13, color: "#6b7280", textAlign: "center", padding: "20px 0" }}>Guruh topilmadi</p>
              )}
            </div>

            {/* Modal footer */}
            <div style={{ padding: "14px 20px", display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={closeGroupModal} style={{ padding: "8px 20px", border: "1.5px solid #e5e7eb", borderRadius: 8, background: "var(--card, #fff)", fontSize: 13, cursor: "pointer", color: "#374151", fontWeight: 500 }}>
                Bekor qilish
              </button>
              <button onClick={confirmGroups} style={{ padding: "8px 20px", border: "none", borderRadius: 8, background: PRIMARY, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 3px 10px rgba(124,58,237,0.3)" }}>
                Qo&apos;shish
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── BACKDROP ── */}
      {drawerOpen && <div onClick={closeDrawer} style={{ position: "fixed", inset: 0, zIndex: 290, background: "rgba(0,0,0,0.2)" }} />}

      {/* ── DRAWER ── */}
      <div className="side-drawer" style={{ right: drawerOpen ? 0 : -420, width: 360, boxShadow: "-6px 0 30px rgba(0,0,0,0.12)" }}>

        {/* Drawer header */}
        <div style={{ padding: "20px 24px 14px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 16, color: "var(--text, #111)", margin: 0 }}>{editId ? "Talabani tahrirlash" : "Talaba qo'shish"}</p>
            <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0" }}>{editId ? "Talaba ma'lumotlarini yangilang." : "Bu yerda siz yangi Talaba qo'shishingiz mumkin."}</p>
          </div>
          <button onClick={closeDrawer} style={{ border: "none", background: "none", cursor: "pointer", color: "#6b7280", display: "flex", padding: 4 }}>
            <CloseIcon style={{ fontSize: 20 }} />
          </button>
        </div>

        {/* Drawer body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

          <FInput label="Telefon raqam" placeholder="+998" value={form.phone} onChange={(e) => set("phone", e.target.value)} />

          <FInput label="Mail" placeholder="Elektron pochtani kiriting" value={form.mail} onChange={(e) => set("mail", e.target.value)} icon={EmailOutlinedIcon} />

          <FInput label="Talaba FIO" placeholder="Ma'lumotni kiriting" value={form.fio} onChange={(e) => set("fio", e.target.value)} />

          <FInput label="Tug'ilgan sanasi" placeholder="dd/mm/yyyy" value={form.birthDate} onChange={(e) => set("birthDate", e.target.value)} type="date" />

          <FInput label="Manzil" placeholder="Manzilni kiriting" value={form.address} onChange={(e) => set("address", e.target.value)} />

          <FInput label="Parol" placeholder="Parolni kiriting" value={form.password} onChange={(e) => set("password", e.target.value)} type="password" icon={LockOutlinedIcon} />

          {/* Guruh */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 8 }}>Guruh</label>
            {form.groups.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                {form.groups.map((g) => {
                  const groupObj = allGroups.find(x => x.id === g || String(x.id) === String(g));
                  const nameToShow = groupObj ? groupObj.name : g;
                  return (
                    <span key={g} style={{ display: "flex", alignItems: "center", gap: 4, background: "#6d28d9", color: "#fff", fontSize: 12, fontWeight: 500, padding: "3px 10px", borderRadius: 6 }}>
                      {nameToShow}
                      <button onClick={() => set("groups", form.groups.filter((x) => x !== g))} style={{ border: "none", background: "none", cursor: "pointer", color: "#fff", padding: 0, fontSize: 14, lineHeight: 1 }}>×</button>
                    </span>
                  );
                })}
              </div>
            )}
            <button
              onClick={openGroupModal}
              style={{ display: "flex", alignItems: "center", gap: 6, border: "none", background: "none", color: PRIMARY, fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "2px 0" }}
            >
              <PersonAddAltIcon style={{ fontSize: 16 }} /> Guruh qo&apos;shish
            </button>
          </div>

          {/* Surati */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 8 }}>Surati</label>
            <div
              onClick={() => photoInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith("image/")) {
                  set("photoFile", file);
                  set("photoPreview", URL.createObjectURL(file));
                }
              }}
              style={{ border: "2px dashed #d1d5db", borderRadius: 10, padding: "20px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, cursor: "pointer", background: "#fafafa", transition: "border-color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = PRIMARY)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
            >
              {form.photoPreview ? (
                <img src={form.photoPreview} alt="preview" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <>
                  <div style={{ width: 40, height: 40, background: "#f3f4f6", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, textAlign: "center", color: "#374151" }}>
                    <span style={{ color: PRIMARY, fontWeight: 600 }}>Click to upload</span> or drag and drop
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>JPG or PNG (max. 2 MB)</p>
                </>
              )}
            </div>
            <input ref={photoInputRef} type="file" accept="image/jpeg,image/png" style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) { set("photoFile", file); set("photoPreview", URL.createObjectURL(file)); }
              }} />
            {form.photoPreview && (
              <button onClick={() => { set("photoFile", null); set("photoPreview", null); }}
                style={{ marginTop: 6, fontSize: 12, color: "#ef4444", border: "none", background: "none", cursor: "pointer", padding: 0 }}>
                Rasmni o&apos;chirish
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid #f0f0f0" }}>
          {saveError && (
            <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 10, marginTop: 0 }}>{saveError}</p>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button onClick={closeDrawer} style={{ padding: "9px 24px", border: "1.5px solid #e5e7eb", borderRadius: 8, background: "var(--card, #fff)", fontSize: 13, cursor: "pointer", color: "#374151", fontWeight: 500 }}>
              Bekor qilish
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ padding: "9px 24px", border: "none", borderRadius: 8, background: saving ? "#a78bfa" : PRIMARY, color: "#fff", fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", boxShadow: "0 3px 10px rgba(124,58,237,0.3)", transition: "background 0.15s" }}
            >
              {saving ? "Saqlanmoqda..." : editId ? "Yangilash" : "Saqlash"}
            </button>
          </div>
        </div>
      </div>

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteId !== null && (
        <>
          <div onClick={() => setDeleteId(null)} style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(0,0,0,0.35)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 360, background: "var(--card, #fff)", borderRadius: 14, boxShadow: "0 12px 40px rgba(0,0,0,0.18)", zIndex: 410, padding: "28px 28px 22px" }}>
            <p style={{ fontWeight: 700, fontSize: 16, color: "var(--text, #111)", margin: "0 0 8px" }}>Talabani o&apos;chirish</p>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>Bu amalni ortga qaytarib bo&apos;lmaydi. Davom etasizmi?</p>
            {deleteError && <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 12 }}>{deleteError}</p>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{ padding: "8px 20px", border: "1.5px solid #e5e7eb", borderRadius: 8, background: "var(--card, #fff)", fontSize: 13, cursor: "pointer", color: "#374151", fontWeight: 500 }}>Bekor qilish</button>
              <button onClick={confirmDelete} style={{ padding: "8px 20px", border: "none", borderRadius: 8, background: "#ef4444", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>O&apos;chirish</button>
            </div>
          </div>
        </>
      )}

      {/* ── STUDENT DETAIL MODAL ── */}
      {detailStudent !== null && (
        <>
          <div onClick={() => setDetailStudent(null)} style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(0,0,0,0.35)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 420, background: "var(--card, #fff)", borderRadius: 16, boxShadow: "0 12px 40px rgba(0,0,0,0.18)", zIndex: 410, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 14px", borderBottom: "1px solid #f0f0f0" }}>
              <p style={{ fontWeight: 700, fontSize: 16, color: "var(--text, #111)", margin: 0 }}>Talaba ma&apos;lumotlari</p>
              <button onClick={() => setDetailStudent(null)} style={{ border: "none", background: "none", cursor: "pointer", color: "#6b7280", display: "flex", padding: 4 }}>
                <CloseIcon style={{ fontSize: 20 }} />
              </button>
            </div>
            <div style={{ padding: "20px 24px 24px" }}>
              {detailLoading ? (
                <p style={{ textAlign: "center", color: "#6b7280", fontSize: 14, padding: "24px 0" }}>Yuklanmoqda...</p>
              ) : detailStudent.name ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                    <div style={{ width: 52, height: 52, borderRadius: "50%", background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, fontWeight: 700, flexShrink: 0, overflow: "hidden" }}>
                      {getPhotoUrl(detailStudent)
                        ? <img src={getPhotoUrl(detailStudent)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : detailStudent.name[0]}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: "var(--text, #111)" }}>{detailStudent.name}</p>
                      <p style={{ margin: "3px 0 0", fontSize: 12, color: "#6b7280" }}>{detailStudent.email}</p>
                    </div>
                  </div>
                  {[
                    { label: "Telefon",       value: detailStudent.phone },
                    { label: "Tug'ilgan sana", value: detailStudent.birthDate },
                    { label: "Manzil",         value: detailStudent.address },
                    { label: "Yaratilgan",     value: detailStudent.createdDate },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f5f5f5" }}>
                      <span style={{ fontSize: 13, color: "#6b7280" }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text, #111)" }}>{value}</span>
                    </div>
                  ))}
                  {detailStudent.groups?.length > 0 && (
                    <div style={{ marginTop: 14 }}>
                      <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Guruhlar</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {detailStudent.groups.map((g, i) => (
                          <span key={i} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 6, background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb", fontWeight: 500 }}>{g}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p style={{ textAlign: "center", color: "#6b7280", fontSize: 14, padding: "24px 0" }}>Ma&apos;lumot topilmadi</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
