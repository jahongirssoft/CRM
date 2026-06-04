import { useState, useRef, useEffect } from "react";
import api from "../../api/axios";
import { getPhotoUrl } from "../../api/fileUrl";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DownloadingIcon from "@mui/icons-material/Downloading";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CloseIcon from "@mui/icons-material/Close";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const PRIMARY = "#7c3aed";
const PER_PAGE = 10;

const buildPages = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
};

const LABEL_SETS = [
  ["Label", "Label", "Label", "+4"],
  ["Label"],
  ["Label", "Label"],
  ["Label"],
  ["Label"],
  ["Label", "Label"],
  ["Label"],
  ["Label", "Label", "LabelLabel", "+1"],
  ["Label", "Label"],
  ["Label", "Label", "Label"],
];

const TEACHERS = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: "Qwerty qwert",
  phone: "+998(33)4082808",
  birthDate: "24 Jan 2022",
  createdDate: "24 Jan 2022",
  coin: "123 123",
  labels: LABEL_SETS[i],
}));

function Avatar({ photo, name }) {
  const url = getPhotoUrl({ photo });
  return (
    <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
      {url ? (
        <img src={url} alt={name ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#9ca3af"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
      )}
    </div>
  );
}

function Checkbox({ checked, onChange, indeterminate }) {
  return (
    <div
      onClick={onChange}
      style={{
        width: 18, height: 18, borderRadius: 5, flexShrink: 0, cursor: "pointer",
        border: checked ? "none" : "1.5px solid #d1d5db",
        backgroundColor: checked ? PRIMARY : "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}
    >
      {checked && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      {indeterminate && !checked && <div style={{ width: 8, height: 2, background: "#9ca3af", borderRadius: 1 }} />}
    </div>
  );
}

const initForm = () => ({
  phone: "+998", mail: "", full_name: "", address: "",
  groups: [], groupInput: "",
  photo: null, photoFile: null, showPassword: false,
  password: "", confirmPassword: "",
});

export default function Oqituvchilar() {
  const [selected, setSelected]   = useState(new Set());
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm]           = useState(initForm());
  const [dragOver, setDragOver]   = useState(false);
  const fileRef = useRef(null);
  const [teachers, setTeachers]   = useState(TEACHERS);
  const [loading, setLoading]     = useState(true);
  const [isArchive, setIsArchive] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState("");
  const [detailTeacher, setDetailTeacher] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError]     = useState("");
  const [deleteId, setDeleteId]           = useState(null);
  const [deleteError, setDeleteError]     = useState("");
  const [editId, setEditId]               = useState(null);

  const mapTeacher = (u, i) => ({
    id: u.id || u._id || i + 1,
    name: u.fullName || u.full_name || u.name || "—",
    phone: u.phone || u.phoneNumber || "—",
    email: u.email || "—",
    address: u.address || "—",
    birthDate: u.birthDate || u.birth_date || "—",
    createdDate: u.createdAt || u.created_at ? new Date(u.createdAt || u.created_at).toLocaleDateString() : "—",
    coin: u.coin ?? "0",
    photo: u.photo ?? u.avatar ?? u.image ?? null,
    labels: (u.roles || u.groups || []).map((g) => (typeof g === "object" ? g.name || g.label || "—" : g)),
  });

  const fetchTeachers = (archive = false) => {
    api.get(archive ? "/teachers/archive" : "/teachers")
      .then((res) => {
        console.log("Teachers API response:", res.data);
        const data = res.data?.data || res.data || [];
        setTeachers(Array.isArray(data) ? data.map(mapTeacher) : []);
      })
      .catch((err) => {
        console.error("Teachers API error:", err?.response?.status, err?.response?.data);
        setTeachers([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTeachers(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleArchive = () => {
    const next = !isArchive;
    setIsArchive(next);
    setSelected(new Set());
    setLoading(true);
    fetchTeachers(next);
  };

  const viewTeacher = (id) => {
    setDetailLoading(true);
    setDetailError("");
    setDetailTeacher({});
    api.get(`/teachers/one/${id}`)
      .then((res) => {
        const u = res.data?.data || res.data || {};
        setDetailTeacher({
          id: u.id || id,
          name: u.fullName || u.full_name || u.name || "—",
          phone: u.phone || "—",
          email: u.email || "—",
          birthDate: u.birthDate || u.birth_date || "—",
          address: u.address || "—",
          createdDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—",
          groups: (u.groups || []).map((g) => (typeof g === "object" ? g.name || "—" : g)),
        });
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || "Ma'lumot yuklanmadi.";
        setDetailError(Array.isArray(msg) ? msg.join(", ") : msg);
      })
      .finally(() => setDetailLoading(false));
  };

  const confirmDelete = () => {
    setDeleteError("");
    api.delete(`/teachers/${deleteId}`)
      .then(() => { setTeachers((p) => p.filter((t) => t.id !== deleteId)); setDeleteId(null); })
      .catch((err) => {
        const msg = err?.response?.data?.message || "O'chirishda xatolik.";
        setDeleteError(Array.isArray(msg) ? msg.join(", ") : msg);
      });
  };

  const openDrawer  = () => { setForm(initForm()); setSaveError(""); setEditId(null); setDrawerOpen(true); };
  const openEdit    = (t) => {
    setEditId(t.id);
    setSaveError("");
    setForm({
      ...initForm(),
      full_name: t.name !== "—" ? t.name : "",
      phone: t.phone !== "—" ? t.phone : "+998",
      mail: t.email || "",
      address: t.address || "",
      groups: t.labels || [],
    });
    setDrawerOpen(true);
  };
  const closeDrawer = () => { setDrawerOpen(false); setEditId(null); };

  const handleSave = async () => {
    setSaveError("");
    const { full_name, password, phone, mail, address, groups, photoFile } = form;
    const isEdit = editId !== null;
    if (!full_name || (!isEdit && !password) || !phone || !address) {
      setSaveError("Barcha majburiy maydonlarni to'ldiring.");
      return;
    }
    if (form.confirmPassword && password !== form.confirmPassword) {
      setSaveError("Parollar mos kelmaydi.");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("full_name", full_name);
      if (mail) fd.append("email", mail);
      if (password) fd.append("password", password);
      fd.append("phone", phone);
      fd.append("address", address);
      if (photoFile) fd.append("photo", photoFile);
      if (groups.length) fd.append("groups", groups.join(","));
      if (isEdit) {
        await api.patch(`/teachers/${editId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/teachers", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      closeDrawer();
      setLoading(true);
      fetchTeachers();
    } catch (err) {
      const msg = err?.response?.data?.message || "Xatolik yuz berdi. Qayta urinib ko'ring.";
      setSaveError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setSaving(false);
    }
  };

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const removeGroup = (g) => set("groups", form.groups.filter((x) => x !== g));
  const addGroup    = (e) => {
    if (e.key === "Enter" && form.groupInput.trim()) {
      set("groups", [...form.groups, form.groupInput.trim()]);
      set("groupInput", "");
    }
  };

  const handleFile = (file) => {
    if (file) { set("photo", URL.createObjectURL(file)); set("photoFile", file); }
  };

  const allIds = teachers.map((t) => t.id);
  const allChecked  = allIds.every((id) => selected.has(id));
  const someChecked = allIds.some((id) => selected.has(id)) && !allChecked;

  const toggleAll  = () => setSelected(allChecked ? new Set() : new Set(allIds));
  const toggleRow  = (id) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const filtered   = teachers.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);
  const pages      = buildPages(safePage, totalPages);

  const col = { fontSize: 12, color: "var(--text-muted, #9ca3af)", fontWeight: 500, padding: "10px 12px", textAlign: "left", whiteSpace: "nowrap" };
  const cell = { fontSize: 13, color: "var(--text, #374151)", padding: "13px 12px", verticalAlign: "middle" };

  return (
    <div className="page-content">

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text, #111)", margin: 0 }}>O&apos;qituvchilar</h1>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: "6px 0 0", maxWidth: 600 }}>
            Ushbu sahifada siz o&apos;qituvchilar ro&apos;yxatini va ularning ma&apos;lumotlarini topasiz.
            Har bir o&apos;qituvchining ismi, fanlari va aloqa ma&apos;lumotlari keltirilgan.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button style={{ display: "flex", alignItems: "center", gap: 6, border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "8px 16px", background: "var(--card, #fff)", fontSize: 13, cursor: "pointer", color: "var(--text, #374151)", fontWeight: 500 }}>
            <FileDownloadIcon style={{ fontSize: 17 }} /> Export
          </button>
          <button onClick={openDrawer} style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: PRIMARY, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 3px 10px rgba(124,58,237,0.25)" }}>
            <AddIcon style={{ fontSize: 17 }} /> O&apos;qituvchi qoshish
          </button>
        </div>
      </div>

      {/* White card */}
      <div style={{ background: "var(--card, #fff)", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>

        {/* Filters row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #f5f5f5", flexWrap: "wrap", gap: 10 }}>
          <button style={{ display: "flex", alignItems: "center", gap: 6, border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "7px 14px", background: "var(--card, #fff)", fontSize: 13, cursor: "pointer", color: "var(--text, #374151)" }}>
            <FilterListIcon style={{ fontSize: 16 }} /> Filters
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative" }}>
              <SearchIcon style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 17, color: "#9ca3af" }} />
              <input
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ padding: "7px 12px 7px 34px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", width: 200, color: "var(--text, #111)" }}
                onFocus={(e) => (e.target.style.border = `1.5px solid ${PRIMARY}`)}
                onBlur={(e) => (e.target.style.border = "1.5px solid #e5e7eb")}
              />
            </div>
            <button
              onClick={toggleArchive}
              style={{ display: "flex", alignItems: "center", gap: 6, border: `1.5px solid ${isArchive ? PRIMARY : "#e5e7eb"}`, borderRadius: 8, padding: "7px 14px", background: isArchive ? "#f3eeff" : "#fff", fontSize: 13, cursor: "pointer", color: isArchive ? PRIMARY : "#374151", fontWeight: isArchive ? 600 : 400, transition: "all 0.15s" }}>
              <Inventory2OutlinedIcon style={{ fontSize: 16 }} /> {isArchive ? "Arxivdan chiqish" : "Arxiv"}
            </button>
          </div>
        </div>

        {/* Bulk action row — faqat tanlanganda */}
        {selected.size > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: "#f9f8ff", borderBottom: "1px solid #f0f0f0" }}>
            <span style={{ fontSize: 13, color: "#374151" }}>{selected.size} ta tanlandi</span>
            <button style={{ display: "flex", alignItems: "center", gap: 5, border: "1.5px solid #e5e7eb", borderRadius: 7, padding: "5px 12px", background: "var(--card, #fff)", fontSize: 12, cursor: "pointer", color: "var(--text, #374151)" }}>
              <FileDownloadIcon style={{ fontSize: 15 }} /> Export
            </button>
            <button style={{ display: "flex", alignItems: "center", gap: 5, border: "1.5px solid #fee2e2", borderRadius: 7, padding: "5px 12px", background: "#fff7f7", fontSize: 12, cursor: "pointer", color: "#ef4444" }}>
              <DeleteOutlinedIcon style={{ fontSize: 15 }} /> Delete
            </button>
          </div>
        )}

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                <th style={{ ...col, width: 44, padding: "10px 16px" }}>
                  <Checkbox checked={allChecked} indeterminate={someChecked} onChange={toggleAll} />
                </th>
                <th style={{ ...col }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    Nomi <SwapVertIcon style={{ fontSize: 14 }} />
                  </span>
                </th>
                <th style={{ ...col }}>Guruh</th>
                <th style={{ ...col }}>Telefon raqamlari</th>
                <th style={{ ...col }}>Tug&apos;ilgan sanasi</th>
                <th style={{ ...col }}>Yaratilgan sana</th>
                <th style={{ ...col, width: 160 }} />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "#9ca3af", fontSize: 14 }}>Yuklanmoqda...</td></tr>
              )}
              {!loading && paginated.map((t) => {
                const isSelected = selected.has(t.id);
                return (
                  <tr
                    key={t.id}
                    style={{ borderTop: "1px solid var(--border, #f5f5f5)", background: isSelected ? "#fdf9ff" : "var(--card, #fff)", transition: "background 0.12s" }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "var(--hover-bg, #fafafa)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = isSelected ? "#fdf9ff" : "var(--card, #fff)"; }}
                  >
                    {/* Checkbox */}
                    <td style={{ ...cell, padding: "13px 16px" }}>
                      <Checkbox checked={isSelected} onChange={() => toggleRow(t.id)} />
                    </td>

                    {/* Nomi */}
                    <td style={{ ...cell }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar photo={t.photo ?? t.avatar ?? t.image} name={t.name} />
                        <span style={{ fontWeight: 500, color: "var(--text, #111)" }}>{t.name}</span>
                      </div>
                    </td>

                    {/* Guruh */}
                    <td style={{ ...cell, maxWidth: 220 }}>
                      <div style={{ display: "flex", gap: 4, flexWrap: "nowrap", overflowX: "auto", paddingBottom: 4 }} className="badge-scroll">
                        {t.labels.map((l, li) => (
                          <span key={li} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, border: "1px solid #e5e7eb", color: "#374151", background: "#f9fafb", whiteSpace: "nowrap", flexShrink: 0 }}>
                            {l}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Telefon */}
                    <td style={{ ...cell, color: "#374151" }}>{t.phone}</td>

                    {/* Tug'ilgan */}
                    <td style={{ ...cell }}>{t.birthDate}</td>

                    {/* Yaratilgan */}
                    <td style={{ ...cell }}>{t.createdDate}</td>

                    {/* Actions */}
                    <td style={{ ...cell }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {/* Minus */}
                        <button style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #fee2e2", background: "var(--card, #fff)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", padding: 0 }}>
                          <RemoveIcon style={{ fontSize: 14 }} />
                        </button>
                        {/* Plus */}
                        <button style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #dcfce7", background: "var(--card, #fff)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a", padding: 0 }}>
                          <AddIcon style={{ fontSize: 14 }} />
                        </button>
                        {/* Eye */}
                        <button onClick={() => viewTeacher(t.id)} style={{ width: 24, height: 24, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", padding: 0, transition: "color 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.color = PRIMARY)} onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}>
                          <VisibilityOutlinedIcon style={{ fontSize: 16 }} />
                        </button>
                        {/* Download */}
                        <button style={{ width: 24, height: 24, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", padding: 0, transition: "color 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#0891b2")} onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}>
                          <DownloadingIcon style={{ fontSize: 16 }} />
                        </button>
                        {/* Delete */}
                        <button onClick={() => { setDeleteId(t.id); setDeleteError(""); }} style={{ width: 24, height: 24, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", padding: 0, transition: "color 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")} onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}>
                          <DeleteOutlinedIcon style={{ fontSize: 16 }} />
                        </button>
                        {/* Edit */}
                        <button onClick={() => openEdit(t)} style={{ width: 24, height: 24, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", padding: 0, transition: "color 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.color = PRIMARY)} onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}>
                          <EditOutlinedIcon style={{ fontSize: 16 }} />
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
            style={{ display: "flex", alignItems: "center", gap: 6, border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "7px 14px", background: "var(--card, #fff)", fontSize: 13, cursor: safePage === 1 ? "not-allowed" : "pointer", color: safePage === 1 ? "#d1d5db" : "var(--text, #374151)" }}>
            <ChevronLeftIcon style={{ fontSize: 16 }} /> Previous
          </button>
          <div style={{ display: "flex", gap: 4 }}>
            {pages.map((p, i) => (
              <button key={i} onClick={() => typeof p === "number" && setPage(p)}
                style={{ width: 36, height: 36, borderRadius: 8, border: "none", background: safePage === p ? PRIMARY : "transparent", color: safePage === p ? "#fff" : p === "..." ? "#9ca3af" : "#374151", fontSize: 13, fontWeight: safePage === p ? 600 : 400, cursor: typeof p === "number" ? "pointer" : "default", transition: "all 0.15s" }}>
                {p}
              </button>
            ))}
          </div>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
            style={{ display: "flex", alignItems: "center", gap: 6, border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "7px 14px", background: "var(--card, #fff)", fontSize: 13, cursor: safePage === totalPages ? "not-allowed" : "pointer", color: safePage === totalPages ? "#d1d5db" : "var(--text, #374151)" }}>
            Next <ChevronRightIcon style={{ fontSize: 16 }} />
          </button>
        </div>
        )}
      </div>

      {/* ── DRAWER BACKDROP ── */}
      {drawerOpen && (
        <div onClick={closeDrawer} style={{ position: "fixed", inset: 0, zIndex: 290, background: "rgba(0,0,0,0.22)" }} />
      )}

      {/* ── DRAWER PANEL ── */}
      <div className="side-drawer" style={{ right: drawerOpen ? 0 : -420, width: 380, boxShadow: "-6px 0 32px rgba(0,0,0,0.14)" }}>
        {/* Header */}
        <div style={{ padding: "20px 24px 14px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 17, color: "var(--text, #111)", margin: 0 }}>{editId ? "O‘qituvchini tahrirlash" : "O‘qituvchi qo‘shish"}</p>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: "4px 0 0" }}>Bu yerda siz yangi o&apos;qituvchi qo&apos;shishingiz mumkin.</p>
          </div>
          <button onClick={closeDrawer} style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af", display: "flex", padding: 4 }}>
            <CloseIcon style={{ fontSize: 20 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Telefon */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Telefon raqam</label>
            <input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", color: "var(--text, #111)" }}
              onFocus={(e) => (e.target.style.border = `1.5px solid ${PRIMARY}`)}
              onBlur={(e) => (e.target.style.border = "1.5px solid #e5e7eb")}
            />
          </div>

          {/* Mail */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Mail</label>
            <div style={{ position: "relative" }}>
              <EmailOutlinedIcon style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 17, color: "#9ca3af" }} />
              <input
                placeholder="Elektron pochtani kiriting"
                value={form.mail}
                onChange={(e) => set("mail", e.target.value)}
                style={{ width: "100%", padding: "10px 12px 10px 34px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", color: "var(--text, #111)" }}
                onFocus={(e) => (e.target.style.border = `1.5px solid ${PRIMARY}`)}
                onBlur={(e) => (e.target.style.border = "1.5px solid #e5e7eb")}
              />
            </div>
          </div>

          {/* To'liq ism */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>To&apos;liq ism <span style={{ color: "#ef4444" }}>*</span></label>
            <input
              placeholder="Ism va familiyani kiriting"
              value={form.full_name}
              onChange={(e) => set("full_name", e.target.value)}
              style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", color: "var(--text, #111)" }}
              onFocus={(e) => (e.target.style.border = `1.5px solid ${PRIMARY}`)}
              onBlur={(e) => (e.target.style.border = "1.5px solid #e5e7eb")}
            />
          </div>

          {/* Manzil */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Manzil <span style={{ color: "#ef4444" }}>*</span></label>
            <input
              placeholder="Manzilni kiriting"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", color: "var(--text, #111)" }}
              onFocus={(e) => (e.target.style.border = `1.5px solid ${PRIMARY}`)}
              onBlur={(e) => (e.target.style.border = "1.5px solid #e5e7eb")}
            />
          </div>

          {/* Tug'ilgan sanasi */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Tug&apos;ilgan sanasi</label>
            <div style={{ position: "relative" }}>
              <CalendarTodayIcon style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#9ca3af" }} />
              <input
                type="date"
                value={form.birthDate}
                onChange={(e) => set("birthDate", e.target.value)}
                style={{ width: "100%", padding: "10px 12px 10px 34px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", color: "var(--text, #111)", cursor: "pointer" }}
                onFocus={(e) => (e.target.style.border = `1.5px solid ${PRIMARY}`)}
                onBlur={(e) => (e.target.style.border = "1.5px solid #e5e7eb")}
              />
            </div>
          </div>

          {/* Guruh */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Guruh</label>
            <div
              style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "8px 10px", border: "1.5px solid #e5e7eb", borderRadius: 8, alignItems: "center", cursor: "text" }}
              onClick={() => document.getElementById("groupInput").focus()}
            >
              <SearchIcon style={{ fontSize: 16, color: "#9ca3af", flexShrink: 0 }} />
              {form.groups.map((g) => (
                <span key={g} style={{ display: "flex", alignItems: "center", gap: 4, background: "#6d28d9", color: "#fff", fontSize: 12, fontWeight: 500, padding: "2px 8px", borderRadius: 6 }}>
                  {g}
                  <button onClick={() => removeGroup(g)} style={{ border: "none", background: "none", cursor: "pointer", color: "#fff", padding: 0, display: "flex", fontSize: 14, lineHeight: 1 }}>×</button>
                </span>
              ))}
              <input
                id="groupInput"
                value={form.groupInput}
                onChange={(e) => set("groupInput", e.target.value)}
                onKeyDown={addGroup}
                placeholder={form.groups.length ? "" : "Guruh qo'shish..."}
                style={{ border: "none", outline: "none", fontSize: 13, flex: 1, minWidth: 80, color: "var(--text, #111)" }}
              />
            </div>
          </div>

          {/* Jinsi */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 8 }}>Jinsi</label>
            <div style={{ display: "flex", gap: 20 }}>
              {["Erkak", "Ayol"].map((g) => (
                <label key={g} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#374151" }}>
                  <div
                    onClick={() => set("gender", g)}
                    style={{ width: 18, height: 18, borderRadius: "50%", border: form.gender === g ? `5px solid ${PRIMARY}` : "2px solid #d1d5db", backgroundColor: "#fff", cursor: "pointer", transition: "all 0.15s", flexShrink: 0 }}
                  />
                  {g}
                </label>
              ))}
            </div>
          </div>

          {/* Surati */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Surati</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? PRIMARY : "#e5e7eb"}`,
                borderRadius: 10, padding: "24px 16px",
                textAlign: "center", cursor: "pointer",
                background: dragOver ? "#f3eeff" : "#fafafa",
                transition: "all 0.18s",
              }}
            >
              {form.photo ? (
                <img src={form.photo} alt="preview" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, margin: "0 auto" }} />
              ) : (
                <>
                  <CloudUploadOutlinedIcon style={{ fontSize: 32, color: "#9ca3af", display: "block", margin: "0 auto 8px" }} />
                  <p style={{ fontSize: 13, margin: 0 }}>
                    <span style={{ color: PRIMARY, fontWeight: 600, cursor: "pointer" }}>Click to upload</span>
                    <span style={{ color: "#6b7280" }}> or drag and drop</span>
                  </p>
                  <p style={{ fontSize: 11, color: "#9ca3af", margin: "4px 0 0" }}>JPG or PNG (max. 800x800px)</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />
          </div>

          {/* Parol qo'shish toggle */}
          <button
            onClick={() => set("showPassword", !form.showPassword)}
            style={{ display: "flex", alignItems: "center", gap: 6, border: "none", background: "none", color: PRIMARY, fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0, width: "fit-content" }}
          >
            <LockOutlinedIcon style={{ fontSize: 16 }} />
            {form.showPassword ? "Parolni yashirish" : "+ Parol qoshish"}
          </button>

          {form.showPassword && (
            <>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Parol</label>
                <input
                  type="password" placeholder="Parolni kiriting"
                  value={form.password} onChange={(e) => set("password", e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => (e.target.style.border = `1.5px solid ${PRIMARY}`)}
                  onBlur={(e) => (e.target.style.border = "1.5px solid #e5e7eb")}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Parolni tasdiqlash</label>
                <input
                  type="password" placeholder="Qayta kiriting"
                  value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => (e.target.style.border = `1.5px solid ${PRIMARY}`)}
                  onBlur={(e) => (e.target.style.border = "1.5px solid #e5e7eb")}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid #f0f0f0" }}>
          {saveError && (
            <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 10, marginTop: 0 }}>{saveError}</p>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button onClick={closeDrawer} style={{ padding: "9px 24px", border: "1.5px solid #e5e7eb", borderRadius: 8, background: "var(--card, #fff)", fontSize: 13, cursor: "pointer", color: "var(--text, #374151)", fontWeight: 500 }}>
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
            <p style={{ fontWeight: 700, fontSize: 16, color: "var(--text, #111)", margin: "0 0 8px" }}>O&apos;qituvchini o&apos;chirish</p>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>Bu amalni ortga qaytarib bo&apos;lmaydi. Davom etasizmi?</p>
            {deleteError && <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 12 }}>{deleteError}</p>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{ padding: "8px 20px", border: "1.5px solid #e5e7eb", borderRadius: 8, background: "var(--card, #fff)", fontSize: 13, cursor: "pointer", color: "var(--text, #374151)", fontWeight: 500 }}>Bekor qilish</button>
              <button onClick={confirmDelete} style={{ padding: "8px 20px", border: "none", borderRadius: 8, background: "#ef4444", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>O&apos;chirish</button>
            </div>
          </div>
        </>
      )}

      {/* ── TEACHER DETAIL MODAL ── */}
      {detailTeacher !== null && (
        <>
          <div onClick={() => setDetailTeacher(null)} style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(0,0,0,0.35)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 420, background: "var(--card, #fff)", borderRadius: 16, boxShadow: "0 12px 40px rgba(0,0,0,0.18)", zIndex: 410, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 14px", borderBottom: "1px solid #f0f0f0" }}>
              <p style={{ fontWeight: 700, fontSize: 16, color: "var(--text, #111)", margin: 0 }}>O&apos;qituvchi ma&apos;lumotlari</p>
              <button onClick={() => setDetailTeacher(null)} style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af", display: "flex", padding: 4 }}>
                <CloseIcon style={{ fontSize: 20 }} />
              </button>
            </div>
            <div style={{ padding: "20px 24px 24px" }}>
              {detailLoading ? (
                <p style={{ textAlign: "center", color: "#9ca3af", fontSize: 14, padding: "24px 0" }}>Yuklanmoqda...</p>
              ) : detailError ? (
                <p style={{ textAlign: "center", color: "#ef4444", fontSize: 13, padding: "24px 0" }}>{detailError}</p>
              ) : detailTeacher?.name ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                    <div style={{ width: 52, height: 52, borderRadius: "50%", background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
                      {detailTeacher.name[0]}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: "var(--text, #111)" }}>{detailTeacher.name}</p>
                      <p style={{ margin: "3px 0 0", fontSize: 12, color: "#9ca3af" }}>{detailTeacher.email}</p>
                    </div>
                  </div>
                  {[
                    { label: "Telefon",        value: detailTeacher.phone },
                    { label: "Tug'ilgan sana", value: detailTeacher.birthDate },
                    { label: "Manzil",         value: detailTeacher.address },
                    { label: "Yaratilgan",     value: detailTeacher.createdDate },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f5f5f5" }}>
                      <span style={{ fontSize: 13, color: "#9ca3af" }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text, #111)" }}>{value}</span>
                    </div>
                  ))}
                  {detailTeacher.groups?.length > 0 && (
                    <div style={{ marginTop: 14 }}>
                      <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>Guruhlar</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {detailTeacher.groups.map((g, i) => (
                          <span key={i} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 6, background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb", fontWeight: 500 }}>{g}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p style={{ textAlign: "center", color: "#9ca3af", fontSize: 14, padding: "24px 0" }}>Ma&apos;lumot topilmadi</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
