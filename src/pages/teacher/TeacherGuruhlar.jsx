import { useState, useEffect } from "react";
import api from "../../api/axios";
import RefreshIcon from "@mui/icons-material/Refresh";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const PRIMARY = "#7c3aed";

// Hafta kunlari qisqartmasi (backend: MONDAY... -> Du, Se...)
const DAY_ABBR = {
  MONDAY: "Du", TUESDAY: "Se", WEDNESDAY: "Chor", THURSDAY: "Pay",
  FRIDAY: "Ju", SATURDAY: "Shan", SUNDAY: "Yak",
};
const fmtDays = (arr) =>
  Array.isArray(arr) ? arr.map((d) => DAY_ABBR[String(d).toUpperCase()] ?? d).join(", ") : "";

// "collecting" — yig'ilayotgan (talabalar to'planyapti) guruhlar filtri uchun
export default function TeacherGuruhlar({ darkMode = false, collecting = false }) {
  const t = darkMode
    ? { card: "#1e293b", border: "#334155", text: "#f1f5f9", textSec: "#94a3b8", textMuted: "#94a3b8", head: "#0f172a", hover: "#334155", bg: "#0f172a" }
    : { card: "#ffffff", border: "#eef0f4", text: "#111827", textSec: "#475569", textMuted: "#64748b", head: "#f8fafc", hover: "#faf9ff", bg: "#f6f7fb" };

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isArchive, setIsArchive] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    // Teacher o'z guruhlari; ishlamasa (403/404) — barcha guruhlarga fallback
    const primary = isArchive ? "/teachers/my/groups?archive=true" : "/teachers/my/groups";
    api.get(primary)
      .then((res) => res)
      .catch(() => api.get(isArchive ? "/groups/archive" : "/groups/all"))
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.data ?? res.data ?? [];
        setGroups(Array.isArray(data) ? data : []);
      })
      .catch(() => { if (!cancelled) setGroups([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isArchive, refreshKey]);

  const mapGroup = (g, i) => {
    const studentsCount = g.studentsCount ?? g.students_count ?? g.student_count ??
      (Array.isArray(g.students) ? g.students.length : (g.studentCount ?? 0));
    const teacherName = (Array.isArray(g.teachers) ? g.teachers : [])
      .map((tt) => tt.full_name ?? tt.fullName ?? tt.name).filter(Boolean).join(", ");
    return {
      id: g.id ?? i + 1,
      active: g.active ?? g.is_active ?? !isArchive,
      name: g.name ?? g.groupName ?? `Guruh #${g.id ?? i + 1}`,
      course: g.course?.name ?? g.courseName ?? g.kurs ?? "—",
      duration: g.course?.duration_month ?? g.duration_month ?? g.durationMonth,
      startTime: g.start_time ?? g.startTime ?? "—",
      days: fmtDays(g.week_day ?? g.weekDay ?? g.days),
      room: (typeof g.room === "object" ? g.room?.name : g.room) ?? g.roomName ?? "—",
      teacher: teacherName || (g.oqituvchi ?? "—"),
      students: studentsCount,
      collecting: (studentsCount ?? 0) === 0 || g.status === "collecting" || g.isCollecting,
    };
  };

  const rows = groups.map(mapGroup).filter((g) => (collecting ? g.collecting : true));

  const col = { fontSize: 12.5, color: t.textMuted, fontWeight: 600, padding: "16px 18px", textAlign: "left", whiteSpace: "nowrap" };
  const cell = { fontSize: 13.5, color: t.text, padding: "18px 18px", verticalAlign: "middle" };

  return (
    <div style={{ padding: "24px 28px", fontFamily: "'Inter', sans-serif", background: t.bg, minHeight: "100%" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: t.text, margin: "0 0 20px", letterSpacing: "-0.5px" }}>
        {collecting ? "Yig'ilayotgan guruhlar" : "Guruhlar"}
      </h1>

      {/* Tab: Guruhlar / Arxiv */}
      {!collecting && (
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          <button onClick={() => setIsArchive(false)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, border: `1px solid ${!isArchive ? PRIMARY : t.border}`, background: !isArchive ? PRIMARY : t.card, color: !isArchive ? "#fff" : t.textSec, fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
            Guruhlar
          </button>
          <button onClick={() => setIsArchive(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, border: `1px solid ${isArchive ? PRIMARY : t.border}`, background: isArchive ? PRIMARY : t.card, color: isArchive ? "#fff" : t.textSec, fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
            <Inventory2OutlinedIcon style={{ fontSize: 17 }} /> Arxiv
          </button>
        </div>
      )}

      {/* Jadval */}
      <div style={{ background: t.card, borderRadius: 14, border: `1px solid ${t.border}`, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr style={{ background: t.head, borderBottom: `1px solid ${t.border}` }}>
                <th style={col}>Status</th>
                <th style={col}>Guruh nomi</th>
                <th style={col}>Kurs</th>
                <th style={col}>Davomiyligi</th>
                <th style={col}>Dars vaqti</th>
                <th style={col}>Xona</th>
                <th style={col}>O&apos;qituvchi</th>
                <th style={{ ...col, textAlign: "center" }}>Talabalar</th>
                <th style={{ ...col, textAlign: "right" }}>
                  <button onClick={() => setRefreshKey((k) => k + 1)} style={{ border: "none", background: "none", cursor: "pointer", color: t.textMuted, display: "inline-flex" }}>
                    <RefreshIcon style={{ fontSize: 18 }} />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: "44px", color: t.textMuted, fontSize: 14 }}>Yuklanmoqda...</td></tr>
              )}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: "44px", color: t.textMuted, fontSize: 14 }}>Guruhlar mavjud emas.</td></tr>
              )}
              {!loading && rows.map((g) => (
                <tr key={g.id} style={{ borderTop: `1px solid ${t.border}` }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = t.hover)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  {/* Status */}
                  <td style={cell}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 38, height: 22, borderRadius: 20, background: g.active ? PRIMARY : "#cbd5e1", position: "relative", flexShrink: 0, transition: "background 0.15s" }}>
                        <div style={{ position: "absolute", top: 2, left: g.active ? 18 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.15s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                      </div>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: g.active ? "#16a34a" : t.textMuted, background: g.active ? (darkMode ? "#052e16" : "#dcfce7") : (darkMode ? "#1e293b" : "#f1f5f9"), padding: "3px 9px", borderRadius: 20 }}>
                        {g.active ? "FAOL" : "TUGAGAN"}
                      </span>
                    </div>
                  </td>
                  {/* Guruh nomi */}
                  <td style={{ ...cell, fontWeight: 700 }}>{g.name}</td>
                  {/* Kurs */}
                  <td style={cell}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#a21caf", background: darkMode ? "#3b0764" : "#fdf4ff", padding: "4px 11px", borderRadius: 8 }}>{g.course}</span>
                  </td>
                  {/* Davomiyligi */}
                  <td style={{ ...cell, color: t.textSec }}>{g.duration ? `${g.duration} oy` : "—"}</td>
                  {/* Dars vaqti */}
                  <td style={cell}>
                    <div style={{ fontWeight: 700, color: t.text }}>{g.startTime}</div>
                    <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{g.days}</div>
                  </td>
                  {/* Xona */}
                  <td style={{ ...cell, color: t.textSec }}>{g.room}</td>
                  {/* O'qituvchi */}
                  <td style={{ ...cell, color: t.textSec, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.teacher}</td>
                  {/* Talabalar */}
                  <td style={{ ...cell, textAlign: "center", fontWeight: 700 }}>{g.students}</td>
                  {/* Menu */}
                  <td style={{ ...cell, textAlign: "right" }}>
                    <button style={{ border: "none", background: "none", cursor: "pointer", color: t.textMuted, display: "inline-flex", padding: 4 }}>
                      <MoreVertIcon style={{ fontSize: 20 }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
