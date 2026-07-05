import { useState, useEffect } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloseIcon from "@mui/icons-material/Close";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import api from "../../api/axios";
import { getPhotoUrl } from "../../api/fileUrl";

const PRIMARY = "#7c3aed";
const ACCENT = "#7c3aed"; // binafsha aksent — tab chiziqlari (referensdek)

const TABS = [
  "Kurslar", "Xonalar", "Xodimlar", "Darslar", "Sabablar", "Xabar yuborish",
];

/* ── Kurslar ── */
const CARD_PALETTE = [
  { bg: "#ffffff", border: "#e5e7eb", tag: "#f3f4f6" },
  { bg: "#ffffff", border: "#e5e7eb", tag: "#f3f4f6" },
  { bg: "#fefce8", border: "#fde68a", tag: "#fef08a" },
  { bg: "#f0fdf4", border: "#bbf7d0", tag: "#dcfce7" },
  { bg: "#fdf4ff", border: "#e9d5ff", tag: "#f3e8ff" },
  { bg: "#fff1f2", border: "#fecdd3", tag: "#ffe4e6" },
];


/* ── Xonalar ── */

const DURATIONS = [
  { label: "30 min",  value: 0.5 },
  { label: "45 min",  value: 0.75 },
  { label: "1 soat",  value: 1 },
  { label: "1.5 soat", value: 1.5 },
  { label: "2 soat",  value: 2 },
];
const PERIODS = [
  { label: "1 oy",  value: 1 },
  { label: "2 oy",  value: 2 },
  { label: "3 oy",  value: 3 },
  { label: "6 oy",  value: 6 },
  { label: "12 oy", value: 12 },
];

/* ════════════════════════════════════
   KURSLAR TAB
════════════════════════════════════ */
function KurslarTab({ darkMode = false }) {
  const t = darkMode ? { card:"#1e293b", border:"#334155", text:"#f1f5f9", textSec:"#94a3b8", textMuted:"#94a3b8", inputBg:"#0f172a" }
    : { card:"#ffffff", border:"#e5e7eb", text:"#111111", textSec:"#374151", textMuted:"#6b7280", inputBg:"#ffffff" };
  const [courses, setCourses]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [isArchive, setIsArchive]       = useState(false);
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [editCourse, setEditCourse]     = useState(null);
  const [deleteId, setDeleteId]         = useState(null);

  const initForm = () => ({
    title: "", duration: "", period: "", price: "", desc: "",
  });

  const [form, setForm]     = useState(initForm());
  const [errors, setErrors] = useState({});

  const mapCourses = (data) =>
    (Array.isArray(data) ? data : []).map((c) => ({
      id: c.id,
      title: c.name ?? "",
      desc: c.description ?? "",
      duration: c.duration_hours ?? 0,
      period: c.duration_month ?? 0,
      price: c.price ?? 0,
    }));

  const fetchActiveCourses = async () => {
    try {
      const res = await api.get("/courses");
      const data = res.data?.data ?? res.data;
      setCourses(mapCourses(data));
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  };

  const toggleArchive = (val) => {
    setIsArchive(val);
    setCourses([]);
    setLoading(true);
  };

  useEffect(() => {
    let cancelled = false;
    const endpoint = isArchive ? "/courses/archive" : "/courses";
    api.get(endpoint)
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.data ?? res.data;
        setCourses(mapCourses(data));
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isArchive]);

  const openAdd = () => { setEditCourse(null); setForm(initForm()); setErrors({}); setDrawerOpen(true); };
  const openEdit = async (c) => {
    setEditCourse(c);
    setForm({ title: c.title, duration: c.duration, period: c.period, price: c.price, desc: c.desc });
    setErrors({});
    setDrawerOpen(true);
    try {
      const res = await api.get(`/courses/one/${c.id}`);
      const d = res.data?.data ?? res.data;
      setForm({
        title: d.name ?? "",
        desc: d.description ?? "",
        duration: d.duration_hours ?? 0,
        period: d.duration_month ?? 0,
        price: d.price ?? 0,
      });
    } catch {
      // silently ignore — drawer stays open with list data
    }
  };
  const closeDrawer = () => { setDrawerOpen(false); setErrors({}); };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Kurs nomini kiriting";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const body = {
      name: form.title,
      description: form.desc,
      price: Number(form.price) || 0,
      duration_month: Number(form.period) || 0,
      duration_hours: Number(form.duration) || 0,
    };
    try {
      if (editCourse) {
        await api.patch(`/courses/${editCourse.id}`, body);
      } else {
        await api.post("/courses", body);
      }
      await fetchActiveCourses();
      closeDrawer();
    } catch (err) {
      const msg = err?.response?.data?.message;
      setErrors({ _api: Array.isArray(msg) ? msg.join(", ") : (msg ?? "Xatolik yuz berdi") });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/courses/${id}`);
      setCourses((p) => p.filter((c) => c.id !== id));
    } catch {
      // silently ignore
    }
  };

  const inputStyle = (err) => ({
    width: "100%", padding: "10px 12px", boxSizing: "border-box",
    border: err ? "1.5px solid #ef4444" : `1.5px solid ${t.border}`,
    borderRadius: 8, fontSize: 13, outline: "none",
    color: t.text, background: t.inputBg,
  });

  return (
    <>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: t.text }}>Kurslar</span>
          <div style={{ display: "flex", background: t.border, borderRadius: 8, padding: 3, gap: 2 }}>
            <button onClick={() => toggleArchive(false)} style={{ padding: "5px 14px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", background: !isArchive ? PRIMARY : "transparent", color: !isArchive ? "#fff" : t.textSec, transition: "all 0.2s" }}>Faol</button>
            <button onClick={() => toggleArchive(true)}  style={{ padding: "5px 14px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", background: isArchive  ? PRIMARY : "transparent", color: isArchive  ? "#fff" : t.textSec, transition: "all 0.2s" }}>Arxiv</button>
          </div>
        </div>
        {!isArchive && (
          <button onClick={openAdd} style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: PRIMARY, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 3px 10px rgba(124,58,237,0.25)" }}>
            <AddIcon style={{ fontSize: 17 }} /> Kurslar qo&apos;shish
          </button>
        )}
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: t.textMuted, fontSize: 14 }}>Yuklanmoqda...</div>
      ) : (
      <div className="kurslar-grid">
        {courses.map((c, i) => {
          const pal = CARD_PALETTE[i % CARD_PALETTE.length];
          return (
            <div key={c.id} style={{ backgroundColor: darkMode ? t.card : pal.bg, border: `1.5px solid ${darkMode ? t.border : pal.border}`, borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 8, position: "relative" }}>
              {!isArchive && (
              <div style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 4 }}>
                <button onClick={() => setDeleteId(c.id)} style={{ border: "none", background: "none", cursor: "pointer", color: "#d1d5db", padding: 3, display: "flex" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")} onMouseLeave={(e) => (e.currentTarget.style.color = "#d1d5db")}><DeleteOutlineIcon style={{ fontSize: 16 }} /></button>
                <button onClick={() => openEdit(c)} style={{ border: "none", background: "none", cursor: "pointer", color: "#d1d5db", padding: 3, display: "flex" }} onMouseEnter={(e) => (e.currentTarget.style.color = PRIMARY)} onMouseLeave={(e) => (e.currentTarget.style.color = "#d1d5db")}><EditOutlinedIcon style={{ fontSize: 16 }} /></button>
              </div>
              )}
              <p style={{ fontSize: 13.5, fontWeight: 700, color: t.text, marginRight: 48, lineHeight: 1.3 }}>{c.title}</p>
              <p style={{ fontSize: 12, color: t.textSec, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{c.desc}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: "auto" }}>
                {[
                  c.duration ? (DURATIONS.find((d) => d.value === c.duration)?.label ?? `${c.duration}h`) : null,
                  c.period   ? (PERIODS.find((p) => p.value === c.period)?.label   ?? `${c.period} oy`) : null,
                  c.price    ? `${c.price.toLocaleString()} so'm` : null,
                ].filter(Boolean).map((tag, ti) => (
                  <span key={ti} style={{ fontSize: 11, fontWeight: 500, backgroundColor: darkMode ? "#334155" : pal.tag, color: t.textSec, padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap" }}>{tag}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <>
          <div onClick={() => setDeleteId(null)} style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 410, background: "var(--card, #fff)", borderRadius: 16, padding: "32px 32px 24px", width: 340, boxShadow: "0 16px 48px rgba(0,0,0,0.18)", textAlign: "center" }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text, #111)", marginBottom: 10 }}>Kursni o&apos;chirish</p>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>Rostdan ham o&apos;chirishni xohlaysizmi?</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{ padding: "9px 22px", border: "none", borderRadius: 8, background: "none", fontSize: 14, fontWeight: 500, color: "#6b7280", cursor: "pointer" }}>Bekor qilish</button>
              <button onClick={() => { handleDelete(deleteId); setDeleteId(null); }} style={{ padding: "9px 22px", border: "none", borderRadius: 8, background: "#ef4444", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 3px 10px rgba(239,68,68,0.3)" }}>Ha, o&apos;chir</button>
            </div>
          </div>
        </>
      )}

      {/* Backdrop */}
      {drawerOpen && <div onClick={closeDrawer} style={{ position: "fixed", inset: 0, zIndex: 290, background: "rgba(0,0,0,0.25)" }} />}

      {/* Drawer */}
      <div className="side-drawer" style={{ right: drawerOpen ? 0 : -420, width: 400, boxShadow: "-8px 0 40px rgba(0,0,0,0.16)", borderRadius: "16px 0 0 16px", transition: "right 0.3s cubic-bezier(0.34,1.2,0.64,1)" }}>

        {/* Drawer header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "20px 24px 16px", borderBottom: `1px solid ${t.border}`, background: t.card }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 17, color: t.text, margin: 0 }}>{editCourse ? "Kursni tahrirlash" : "Kurs qoshish"}</p>
            <p style={{ fontSize: 12, color: t.textMuted, margin: "4px 0 0" }}>Bu yerda siz yangi Sovg&apos;a qo&apos;shishingiz mumkin.</p>
          </div>
          <button onClick={closeDrawer} style={{ border: "none", background: "none", cursor: "pointer", color: t.textMuted, display: "flex", padding: 4, marginTop: 2 }}><CloseIcon style={{ fontSize: 20 }} /></button>
        </div>

        {/* Drawer body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18, background: t.card }}>

          {/* Nomi */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: t.textSec, display: "block", marginBottom: 6 }}>Nomi</label>
            <input placeholder="HR Manager..." value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              style={inputStyle(errors.title)}
              onFocus={(e) => (e.target.style.border = `1.5px solid ${PRIMARY}`)}
              onBlur={(e) => (e.target.style.border = errors.title ? "1.5px solid #ef4444" : "1.5px solid #e5e7eb")}
            />
            {errors.title && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{errors.title}</p>}
          </div>

          {/* Dars davomiyligi */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: t.textSec, display: "block", marginBottom: 6 }}>Dars davomiyligi</label>
            <div style={{ position: "relative" }}>
              <select value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
                style={{ ...inputStyle(false), appearance: "none", WebkitAppearance: "none", paddingRight: 36, background: t.inputBg, cursor: "pointer" }}>
                <option value="">Tanlang</option>
                {DURATIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: t.textMuted, fontSize: 12 }}>▼</span>
            </div>
          </div>

          {/* Kurs davomiyligi */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: t.textSec, display: "block", marginBottom: 6 }}>Kurs davomiyligi (oylarda)</label>
            <div style={{ position: "relative" }}>
              <select value={form.period} onChange={(e) => setForm((p) => ({ ...p, period: e.target.value }))}
                style={{ ...inputStyle(false), appearance: "none", WebkitAppearance: "none", paddingRight: 36, background: t.inputBg, cursor: "pointer" }}>
                <option value="">Tanlang</option>
                {PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: t.textMuted, fontSize: 12 }}>▼</span>
            </div>
          </div>

          {/* Narx */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: t.textSec, display: "block", marginBottom: 6 }}>Narx</label>
            <div style={{ position: "relative" }}>
              <CreditCardIcon style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: t.textMuted }} />
              <input placeholder="Narxini kiriting" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                style={{ ...inputStyle(false), paddingLeft: 36 }}
                onFocus={(e) => (e.target.style.border = `1.5px solid ${PRIMARY}`)}
                onBlur={(e) => (e.target.style.border = "1.5px solid #e5e7eb")}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: t.textSec, display: "block", marginBottom: 6 }}>Description</label>
            <textarea placeholder="A little about the company and the team that you'll be working with." value={form.desc} onChange={(e) => setForm((p) => ({ ...p, desc: e.target.value }))}
              rows={4}
              style={{ ...inputStyle(false), resize: "vertical", fontFamily: "inherit" }}
              onFocus={(e) => (e.target.style.border = `1.5px solid ${PRIMARY}`)}
              onBlur={(e) => (e.target.style.border = "1.5px solid #e5e7eb")}
            />
            <p style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>This is a hint text to help user.</p>
          </div>

        </div>

        {/* Footer */}
        <div style={{ padding: "14px 24px", borderTop: `1px solid ${t.border}`, background: t.card }}>
          {errors._api && <p style={{ fontSize: 12, color: "#ef4444", margin: "0 0 10px" }}>{errors._api}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button onClick={closeDrawer} style={{ padding: "9px 24px", border: `1.5px solid ${t.border}`, borderRadius: 8, background: t.inputBg, fontSize: 13, cursor: "pointer", color: t.textSec, fontWeight: 500 }}>Bekor qilish</button>
            <button onClick={handleSave} style={{ padding: "9px 24px", border: "none", borderRadius: 8, background: PRIMARY, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 3px 10px rgba(124,58,237,0.3)" }}>Saqlash</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════
   XONALAR TAB
════════════════════════════════════ */
function XonalarTab({ darkMode = false }) {
  const t = darkMode ? { card:"#1e293b", border:"#334155", text:"#f1f5f9", textSec:"#94a3b8", textMuted:"#94a3b8", inputBg:"#0f172a" }
    : { card:"#ffffff", border:"#e5e7eb", text:"#111111", textSec:"#374151", textMuted:"#6b7280", inputBg:"#ffffff" };
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isArchive, setIsArchive] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ name: "", capacity: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let cancelled = false;
    const endpoint = isArchive ? "/rooms/arxive" : "/rooms";
    api.get(endpoint)
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.data ?? res.data;
        setRooms((Array.isArray(data) ? data : []).map((r) => ({ id: r.id, name: r.name ?? "—", capacity: r.capacity ?? 0 })));
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [refreshKey, isArchive]);

  const openAdd = () => {
    setEditRoom(null);
    setForm({ name: "", capacity: "" });
    setErrors({});
    setDrawerOpen(true);
  };

  const openEdit = (room) => {
    setEditRoom(room);
    setForm({ name: room.name, capacity: String(room.capacity) });
    setErrors({});
    setDrawerOpen(true);
    api.get(`/rooms/one/${room.id}`)
      .then((res) => {
        const d = res.data?.data ?? res.data;
        if (d) setForm({ name: d.name ?? room.name, capacity: String(d.capacity ?? room.capacity) });
      })
      .catch(() => {});
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setErrors({});
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Xona nomini kiriting";
    if (!form.capacity || isNaN(form.capacity) || +form.capacity <= 0)
      e.capacity = "Sig'imni kiriting";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const body = { name: form.name.trim(), capacity: +form.capacity };
    try {
      if (editRoom) {
        await api.patch(`/rooms/${editRoom.id}`, body);
      } else {
        await api.post("/rooms", body);
      }
      closeDrawer();
      setRefreshKey((k) => k + 1);
    } catch (err) {
      const msg = err?.response?.data?.message;
      setErrors({ _api: Array.isArray(msg) ? msg.join(", ") : (msg ?? "Xatolik yuz berdi") });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/rooms/${deleteId}`);
      setDeleteId(null);
      setRefreshKey((k) => k + 1);
    } catch {
      setDeleteId(null);
    }
  };

  return (
    <div
      style={{
        background: t.card,
        borderRadius: 14,
        padding: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: t.text }}>Xonalar</span>
          <button style={{ border: "none", background: "none", cursor: "pointer", color: t.textMuted, display: "flex", padding: 4 }} onClick={() => setRefreshKey((k) => k + 1)}>
            <RefreshIcon style={{ fontSize: 18 }} />
          </button>
          <button
            onClick={() => { setIsArchive((p) => !p); setRefreshKey((k) => k + 1); }}
            style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, border: "none", cursor: "pointer", background: isArchive ? "#7c3aed" : "#f3f4f6", color: isArchive ? "#fff" : "#6b7280", transition: "all 0.15s" }}>
            {isArchive ? "Aktiv" : "Arxiv"}
          </button>
        </div>
        <button
          onClick={openAdd}
          disabled={isArchive}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            backgroundColor: PRIMARY,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 18px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 3px 10px rgba(124,58,237,0.25)",
          }}
        >
          <AddIcon style={{ fontSize: 17 }} />
          Xonani qo&apos;shish
        </button>
      </div>

      {/* Rooms grid */}
      {loading && <p style={{ textAlign: "center", color: "#6b7280", padding: "24px 0", fontSize: 14 }}>Yuklanmoqda...</p>}
      <div className="xonalar-grid">
        {!loading && rooms.map((room) => (
          <div
            key={room.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 18px",
              borderRadius: 12,
              border: `1px solid ${t.border}`,
              background: t.card,
              boxShadow: darkMode ? "0 2px 8px rgba(0,0,0,0.25)" : "0 1px 4px rgba(0,0,0,0.05)",
              transition: "box-shadow 0.18s, transform 0.18s, background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = darkMode ? "#334155" : "#fafafa";
              e.currentTarget.style.boxShadow = darkMode ? "0 4px 16px rgba(0,0,0,0.35)" : "0 4px 16px rgba(124,58,237,0.10)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = t.card;
              e.currentTarget.style.boxShadow = darkMode ? "0 2px 8px rgba(0,0,0,0.25)" : "0 1px 4px rgba(0,0,0,0.05)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: t.text, margin: 0, letterSpacing: "-0.2px" }}>
                {room.name}
              </p>
              <p style={{ fontSize: 12, color: t.textMuted, margin: "5px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7c3aed", display: "inline-block", flexShrink: 0 }} />
                Sig&apos;imi: <strong style={{ color: t.textSec }}>{room.capacity}</strong>
              </p>
            </div>
            <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
              <button
                onClick={() => setDeleteId(room.id)}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: "#d1d5db",
                  padding: 4,
                  borderRadius: 6,
                  display: "flex",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#d1d5db")}
              >
                <DeleteOutlineIcon style={{ fontSize: 17 }} />
              </button>
              <button
                onClick={() => openEdit(room)}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: "#d1d5db",
                  padding: 4,
                  borderRadius: 6,
                  display: "flex",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = PRIMARY)}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#d1d5db")}
              >
                <EditOutlinedIcon style={{ fontSize: 17 }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirm modal */}
      {deleteId && (
        <>
          <div onClick={() => setDeleteId(null)} style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            zIndex: 410, background: "var(--card, #fff)", borderRadius: 16, padding: "32px 32px 24px",
            width: 340, boxShadow: "0 16px 48px rgba(0,0,0,0.18)", textAlign: "center",
          }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text, #111)", marginBottom: 10 }}>Xonani o&apos;chirish</p>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>Rostdan ham o&apos;chirishni hohlaysizmi?</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
              <button onClick={() => setDeleteId(null)}
                style={{ padding: "9px 22px", border: "none", borderRadius: 8, background: "none", fontSize: 14, fontWeight: 500, color: "#6b7280", cursor: "pointer" }}>
                Bekor qilish
              </button>
              <button onClick={handleDelete}
                style={{ padding: "9px 22px", border: "none", borderRadius: 8, background: "#ef4444", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 3px 10px rgba(239,68,68,0.3)" }}>
                Ha
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── RIGHT DRAWER ── */}
      {drawerOpen && (
        <div
          onClick={closeDrawer}
          style={{ position: "fixed", inset: 0, zIndex: 290 }}
        />
      )}
      <div className="side-drawer" style={{ top: 0, right: drawerOpen ? 0 : -360, width: 340, boxShadow: "-8px 0 40px rgba(0,0,0,0.16)", borderRadius: "16px 0 0 16px", transition: "right 0.3s cubic-bezier(0.34,1.2,0.64,1)" }}>
        {/* Drawer header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: `1px solid ${t.border}`,
            background: t.card,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 15, color: t.text }}>
            {editRoom ? "Xonani tahrirlash" : "Xonani qo'shish"}
          </span>
          <button
            onClick={closeDrawer}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              color: t.textMuted,
              display: "flex",
              padding: 4,
              borderRadius: 6,
            }}
          >
            <CloseIcon style={{ fontSize: 20 }} />
          </button>
        </div>

        {/* Drawer body */}
        <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", gap: 18, overflowY: "auto", background: t.card }}>
          {/* Nomi */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: t.textSec, display: "block", marginBottom: 6 }}>
              Nomi <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              placeholder="Xona nomi"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              style={{
                width: "100%",
                padding: "9px 12px",
                border: errors.name ? "1.5px solid #ef4444" : `1.5px solid ${t.border}`,
                borderRadius: 8,
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
                color: t.text,
                background: t.inputBg,
                transition: "border 0.15s",
              }}
              onFocus={(e) => (e.target.style.border = `1.5px solid ${PRIMARY}`)}
              onBlur={(e) => (e.target.style.border = errors.name ? "1.5px solid #ef4444" : `1.5px solid ${t.border}`)}
            />
            {errors.name && (
              <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{errors.name}</p>
            )}
          </div>

          {/* Sig'imi */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: t.textSec, display: "block", marginBottom: 6 }}>
              Sig&apos;imi <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              placeholder="Masalan: 20"
              type="number"
              min="1"
              value={form.capacity}
              onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))}
              style={{
                width: "100%",
                padding: "9px 12px",
                border: errors.capacity ? "1.5px solid #ef4444" : `1.5px solid ${t.border}`,
                borderRadius: 8,
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
                color: t.text,
                background: t.inputBg,
                transition: "border 0.15s",
              }}
              onFocus={(e) => (e.target.style.border = `1.5px solid ${PRIMARY}`)}
              onBlur={(e) => (e.target.style.border = errors.capacity ? "1.5px solid #ef4444" : `1.5px solid ${t.border}`)}
            />
            {errors.capacity && (
              <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{errors.capacity}</p>
            )}
          </div>
        </div>

        {/* Drawer footer */}
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${t.border}`, background: t.card }}>
          {errors._api && <p style={{ fontSize: 12, color: "#ef4444", margin: "0 0 10px" }}>{errors._api}</p>}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={closeDrawer} style={{ flex: 1, padding: "9px 0", border: `1.5px solid ${t.border}`, borderRadius: 8, background: t.inputBg, fontSize: 13, cursor: "pointer", color: t.textSec, fontWeight: 500 }}>
              Bekor qilish
            </button>
            <button onClick={handleSave} style={{ flex: 1, padding: "9px 0", border: "none", borderRadius: 8, background: PRIMARY, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 3px 10px rgba(124,58,237,0.3)" }}>
              Saqlash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   XODIMLAR TAB
════════════════════════════════════ */
const INIT_ADMIN_FORM = { first_name: "", last_name: "", password: "", phone: "", email: "", address: "" };

function XodimlarTab({ darkMode = false }) {
  const t = darkMode
    ? { card: "#1e293b", border: "#334155", text: "#f1f5f9", textSec: "#94a3b8", textMuted: "#94a3b8", inputBg: "#0f172a" }
    : { card: "#ffffff", border: "#e5e7eb", text: "#111111", textSec: "#374151", textMuted: "#6b7280", inputBg: "#ffffff" };

  const [admins, setAdmins]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm]           = useState(INIT_ADMIN_FORM);
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api.get("/users/admin/all")
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.data ?? res.data;
        setAdmins(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [refreshKey]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.first_name.trim() || !form.phone.trim()) return;
    setSaving(true);
    setSaveError("");
    try {
      await api.post("/users/admin", form);
      setDrawerOpen(false);
      setForm(INIT_ADMIN_FORM);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      const msg = err?.response?.data?.message;
      setSaveError(Array.isArray(msg) ? msg.join(", ") : (msg ?? "Xatolik yuz berdi"));
    } finally {
      setSaving(false);
    }
  };

  const iSx = { width: "100%", padding: "9px 12px", border: `1.5px solid ${darkMode ? "#334155" : "#e5e7eb"}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", color: t.text, background: t.inputBg };
  const focB = (e) => (e.target.style.border = "1.5px solid #7c3aed");
  const blrB = (e) => (e.target.style.border = `1.5px solid ${darkMode ? "#334155" : "#e5e7eb"}`);

  const col  = { fontSize: 12, color: t.textMuted, fontWeight: 600, padding: "10px 16px", textAlign: "left", whiteSpace: "nowrap" };
  const cell = { fontSize: 13, color: t.textSec, padding: "14px 16px", verticalAlign: "middle", borderTop: `1px solid ${t.border}` };

  return (
    <div style={{ background: t.card, borderRadius: 14, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: t.text }}>Xodimlar</span>
          <button onClick={() => setRefreshKey((k) => k + 1)} style={{ border: "none", background: "none", cursor: "pointer", color: t.textMuted, display: "flex", padding: 4 }}>
            <RefreshIcon style={{ fontSize: 18 }} />
          </button>
        </div>
        <button
          onClick={() => { setForm(INIT_ADMIN_FORM); setDrawerOpen(true); }}
          style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: PRIMARY, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 3px 10px rgba(124,58,237,0.25)" }}>
          <AddIcon style={{ fontSize: 17 }} /> Admin qo&apos;shish
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: darkMode ? "#0f172a" : "#fafafa" }}>
              <th style={col}>#</th>
              <th style={col}>Ism</th>
              <th style={col}>Familiya</th>
              <th style={col}>Email</th>
              <th style={col}>Telefon</th>
              <th style={col}>Rol</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: "32px", color: t.textMuted, fontSize: 14 }}>Yuklanmoqda...</td></tr>
            )}
            {!loading && admins.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: "32px", color: t.textMuted, fontSize: 14 }}>Xodimlar topilmadi</td></tr>
            )}
            {!loading && admins.map((a, i) => (
              <tr key={a.id}
                onMouseEnter={(e) => (e.currentTarget.style.background = darkMode ? "#334155" : "#fafafa")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <td style={cell}>{i + 1}</td>
                <td style={{ ...cell }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {getPhotoUrl(a) ? (
                      <img src={getPhotoUrl(a)} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                        {(a.first_name?.[0] ?? "?").toUpperCase()}
                      </div>
                    )}
                    <span style={{ fontWeight: 600, color: t.text }}>{a.first_name ?? "—"}</span>
                  </div>
                </td>
                <td style={cell}>{a.last_name ?? "—"}</td>
                <td style={cell}>{a.email ?? "—"}</td>
                <td style={cell}>{a.phone ?? "—"}</td>
                <td style={cell}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", background: "#ede9fe", padding: "3px 10px", borderRadius: 20 }}>
                    {a.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drawer backdrop */}
      {drawerOpen && <div onClick={() => setDrawerOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 290, background: "rgba(0,0,0,0.2)" }} />}

      {/* Drawer */}
      <div className="side-drawer" style={{ right: drawerOpen ? 0 : -420, width: 360, boxShadow: "-6px 0 30px rgba(0,0,0,0.12)", borderRadius: "16px 0 0 16px", background: t.card }}>
        <div style={{ padding: "20px 24px 14px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 16, color: t.text, margin: 0 }}>Admin qo&apos;shish</p>
            <p style={{ fontSize: 12, color: t.textMuted, margin: "4px 0 0" }}>Yangi admin ma&apos;lumotlarini kiriting.</p>
          </div>
          <button onClick={() => setDrawerOpen(false)} style={{ border: "none", background: "none", cursor: "pointer", color: t.textMuted, display: "flex", padding: 4 }}>
            <CloseIcon style={{ fontSize: 20 }} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: "Ism", key: "first_name", placeholder: "Ism" },
            { label: "Familiya", key: "last_name", placeholder: "Familiya" },
            { label: "Telefon", key: "phone", placeholder: "+998901234567" },
            { label: "Email", key: "email", placeholder: "example@mail.com", type: "email" },
            { label: "Manzil", key: "address", placeholder: "Manzil" },
            { label: "Parol", key: "password", placeholder: "Parol", type: "password" },
          ].map(({ label, key, placeholder, type = "text" }) => (
            <div key={key}>
              <label style={{ fontSize: 13, fontWeight: 500, color: t.textSec, display: "block", marginBottom: 6 }}>{label}</label>
              <input type={type} placeholder={placeholder} value={form[key]} onChange={(e) => set(key, e.target.value)}
                style={iSx} onFocus={focB} onBlur={blrB} />
            </div>
          ))}
        </div>
        <div style={{ padding: "14px 24px", borderTop: `1px solid ${t.border}` }}>
          {saveError && <p style={{ fontSize: 12, color: "#ef4444", margin: "0 0 10px" }}>{saveError}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button onClick={() => { setDrawerOpen(false); setSaveError(""); }} style={{ padding: "9px 24px", border: `1.5px solid ${t.border}`, borderRadius: 8, background: "transparent", fontSize: 13, cursor: "pointer", color: t.textSec, fontWeight: 500 }}>Bekor qilish</button>
            <button onClick={handleSave} disabled={saving} style={{ padding: "9px 24px", border: "none", borderRadius: 8, background: saving ? "#a78bfa" : PRIMARY, color: "#fff", fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", boxShadow: "0 3px 10px rgba(124,58,237,0.3)" }}>
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   DARSLAR TAB
════════════════════════════════════ */
function DarslarTab({ darkMode = false }) {
  const t = darkMode
    ? { card: "#1e293b", border: "#334155", text: "#f1f5f9", textSec: "#94a3b8", textMuted: "#94a3b8" }
    : { card: "#ffffff", border: "#e5e7eb", text: "#111111", textSec: "#374151", textMuted: "#6b7280" };

  const [lessons, setLessons]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm]         = useState({ group_id: "", topic: "", description: "" });
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get("/lessons")
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.data ?? res.data;
        setLessons(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [refreshKey]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const [saveError, setSaveError] = useState("");

  const handleSave = async () => {
    if (!form.group_id || !form.topic.trim()) { setSaveError("Guruh ID va mavzu majburiy"); return; }
    setSaving(true);
    setSaveError("");
    try {
      await api.post("/lessons", { group_id: Number(form.group_id), topic: form.topic, description: form.description });
      setDrawerOpen(false);
      setForm({ group_id: "", topic: "", description: "" });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      const msg = err?.response?.data?.message;
      setSaveError(Array.isArray(msg) ? msg.join(", ") : (msg ?? "Xatolik yuz berdi"));
    } finally {
      setSaving(false);
    }
  };

  const iSx = { width: "100%", padding: "9px 12px", border: `1.5px solid ${darkMode ? "#334155" : "#e5e7eb"}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", color: t.text, background: darkMode ? "#0f172a" : "#fff" };
  const focB = (e) => (e.target.style.border = "1.5px solid #7c3aed");
  const blrB = (e) => (e.target.style.border = `1.5px solid ${darkMode ? "#334155" : "#e5e7eb"}`);

  const col  = { fontSize: 12, color: t.textMuted, fontWeight: 600, padding: "10px 16px", textAlign: "left", whiteSpace: "nowrap" };
  const cell = { fontSize: 13, color: t.textSec, padding: "14px 16px", verticalAlign: "middle", borderTop: `1px solid ${t.border}` };

  return (
    <div style={{ background: t.card, borderRadius: 14, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: t.text }}>Barcha darslar</span>
          <button onClick={() => setRefreshKey((k) => k + 1)} style={{ border: "none", background: "none", cursor: "pointer", color: t.textMuted, display: "flex", padding: 4 }}>
            <RefreshIcon style={{ fontSize: 18 }} />
          </button>
        </div>
        <button
          onClick={() => { setForm({ group_id: "", topic: "", description: "" }); setDrawerOpen(true); }}
          style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: PRIMARY, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 3px 10px rgba(124,58,237,0.25)" }}>
          <AddIcon style={{ fontSize: 17 }} /> Dars qo&apos;shish
        </button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: darkMode ? "#0f172a" : "#fafafa" }}>
              <th style={col}>#</th>
              <th style={col}>Mavzu</th>
              <th style={col}>Guruh ID</th>
              <th style={col}>Tavsif</th>
              <th style={col}>Status</th>
              <th style={col}>Sana</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: "32px", color: t.textMuted, fontSize: 14 }}>Yuklanmoqda...</td></tr>
            )}
            {!loading && lessons.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: "32px", color: t.textMuted, fontSize: 14 }}>Darslar topilmadi</td></tr>
            )}
            {!loading && lessons.map((l, i) => (
              <tr key={l.id}
                onMouseEnter={(e) => (e.currentTarget.style.background = darkMode ? "#334155" : "#fafafa")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <td style={cell}>{i + 1}</td>
                <td style={{ ...cell, fontWeight: 600, color: t.text }}>{l.topic ?? "—"}</td>
                <td style={cell}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: PRIMARY, background: "#ede9fe", padding: "3px 10px", borderRadius: 20 }}>
                    #{l.group_id}
                  </span>
                </td>
                <td style={{ ...cell, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.description || "—"}</td>
                <td style={cell}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#16a34a", background: "#dcfce7", padding: "3px 10px", borderRadius: 20 }}>
                    {l.status}
                  </span>
                </td>
                <td style={{ ...cell, fontSize: 12 }}>
                  {new Date(l.created_at).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drawer backdrop */}
      {drawerOpen && <div onClick={() => setDrawerOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 290, background: "rgba(0,0,0,0.2)" }} />}

      {/* Drawer */}
      <div className="side-drawer" style={{ right: drawerOpen ? 0 : -420, width: 360, boxShadow: "-6px 0 30px rgba(0,0,0,0.12)", borderRadius: "16px 0 0 16px", background: t.card }}>
        <div style={{ padding: "20px 24px 14px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 16, color: t.text, margin: 0 }}>Dars qo&apos;shish</p>
            <p style={{ fontSize: 12, color: t.textMuted, margin: "4px 0 0" }}>Yangi dars ma&apos;lumotlarini kiriting.</p>
          </div>
          <button onClick={() => setDrawerOpen(false)} style={{ border: "none", background: "none", cursor: "pointer", color: t.textMuted, display: "flex", padding: 4 }}>
            <CloseIcon style={{ fontSize: 20 }} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: "Guruh ID", key: "group_id", placeholder: "33", type: "number" },
            { label: "Mavzu", key: "topic", placeholder: "HTML asoslari" },
          ].map(({ label, key, placeholder, type = "text" }) => (
            <div key={key}>
              <label style={{ fontSize: 13, fontWeight: 500, color: t.textSec, display: "block", marginBottom: 6 }}>{label}</label>
              <input type={type} placeholder={placeholder} value={form[key]} onChange={(e) => set(key, e.target.value)}
                style={iSx} onFocus={focB} onBlur={blrB} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: t.textSec, display: "block", marginBottom: 6 }}>Tavsif</label>
            <textarea placeholder="Dars haqida qo'shimcha ma'lumot..." value={form.description} onChange={(e) => set("description", e.target.value)} rows={3}
              style={{ ...iSx, resize: "vertical", fontFamily: "inherit" }} onFocus={focB} onBlur={blrB} />
          </div>
        </div>
        <div style={{ padding: "14px 24px", borderTop: `1px solid ${t.border}` }}>
          {saveError && <p style={{ fontSize: 12, color: "#ef4444", margin: "0 0 10px" }}>{saveError}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button onClick={() => { setDrawerOpen(false); setSaveError(""); }} style={{ padding: "9px 24px", border: `1.5px solid ${t.border}`, borderRadius: 8, background: "transparent", fontSize: 13, cursor: "pointer", color: t.textSec, fontWeight: 500 }}>Bekor qilish</button>
            <button onClick={handleSave} disabled={saving} style={{ padding: "9px 24px", border: "none", borderRadius: 8, background: saving ? "#a78bfa" : PRIMARY, color: "#fff", fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", boxShadow: "0 3px 10px rgba(124,58,237,0.3)" }}>
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Boshqarish({ initialTab = "Xonalar", darkMode = false }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const t = darkMode ? {
    bg: "#0f172a", card: "#1e293b", border: "#334155",
    text: "#f1f5f9", textSec: "#94a3b8", textMuted: "#94a3b8",
  } : {
    bg: "#f6f7fb", card: "#ffffff", border: "#f0f0f0",
    text: "#111111", textSec: "#6b7280", textMuted: "#6b7280",
  };

  return (
    <div className="page-content" style={{ background: t.bg, minHeight: "100%" }}>
      {/* Page title */}
      <h1 style={{ fontSize: 22, fontWeight: 800, color: t.text, marginBottom: 6, letterSpacing: "-0.5px" }}>
        Boshqarish
      </h1>
      <p style={{ fontSize: 13, color: t.textMuted, marginBottom: 20, maxWidth: 640, lineHeight: 1.6 }}>
        Ushbu sahifada kurslar, xonalar va boshqaruv bo&apos;limlarini boshqarish imkoniyatiga ega bo&apos;lasiz.
      </p>

      {/* Horizontal tabs */}
      <div className="boshqarish-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 18px",
              border: "none",
              borderBottom: activeTab === tab ? `2.5px solid ${ACCENT}` : "2.5px solid transparent",
              background: "none",
              cursor: "pointer",
              fontSize: 13.5,
              color: activeTab === tab ? ACCENT : t.textSec,
              fontWeight: activeTab === tab ? 700 : 500,
              whiteSpace: "nowrap",
              letterSpacing: "-0.1px",
              transition: "color 0.15s",
              marginBottom: "-1.5px",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "Kurslar" ? (
        <KurslarTab darkMode={darkMode} />
      ) : activeTab === "Xonalar" ? (
        <XonalarTab darkMode={darkMode} />
      ) : activeTab === "Xodimlar" ? (
        <XodimlarTab darkMode={darkMode} />
      ) : activeTab === "Darslar" ? (
        <DarslarTab darkMode={darkMode} />
      ) : (
        <div
          style={{
            background: t.card,
            borderRadius: 14,
            padding: "48px 24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            textAlign: "center",
            color: t.textMuted,
            fontSize: 14,
          }}
        >
          <p style={{ fontSize: 15, fontWeight: 600, color: "#d1d5db", marginBottom: 6 }}>
            {activeTab}
          </p>
          Bu bo&apos;lim tez orada qo&apos;shiladi
        </div>
      )}
    </div>
  );
}
