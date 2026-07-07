import { useState, useEffect, useMemo } from "react";
import api from "../../api/axios";
import { imgUrl, videoUrl as buildVideoUrl } from "../../api/fileUrl";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BarChartIcon from "@mui/icons-material/BarChart";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloseIcon from "@mui/icons-material/Close";
import TeacherLessonDetail from "./TeacherLessonDetail";

const PRIMARY = "#7c3aed";
const GRADIENT = `linear-gradient(135deg, ${PRIMARY}, #a855f7)`;
const AVATAR_COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899"];
const MONTH_IDX = { January: 0, February: 1, March: 2, April: 3, May: 4, June: 5, July: 6, August: 7, September: 8, October: 9, November: 10, December: 11 };
const DAY_ABBR = { MONDAY: "Du", TUESDAY: "Se", WEDNESDAY: "Chor", THURSDAY: "Pay", FRIDAY: "Ju", SATURDAY: "Shan", SUNDAY: "Yak" };

const DETAIL_TABS = ["malumotlar", "darsliklari", "akademik"];
const DETAIL_LABELS = { malumotlar: "Ma'lumotlar", darsliklari: "Guruh darsliklari", akademik: "Akademik davomati" };
const DARS_TABS = [
  { key: "uyga_vazifa", label: "Uyga vazifa" },
  { key: "videolar", label: "Videolar" },
  { key: "imtihonlar", label: "Imtihonlar" },
  { key: "jurnal", label: "Jurnal" },
];

export default function TeacherGroupDetail({ group, darkMode = false, onBack }) {
  const t = darkMode
    ? { card: "#1e293b", border: "#334155", text: "#f1f5f9", textSec: "#94a3b8", textMuted: "#94a3b8", head: "#0f172a", hover: "#0f172a", bg: "#0f172a", divider: "#243045", past: "#243045", sub: "#0f172a" }
    : { card: "#ffffff", border: "#e5e7eb", text: "#111827", textSec: "#374151", textMuted: "#6b7280", head: "#fafafa", hover: "#fafafa", bg: "#f6f7fb", divider: "#f5f5f5", past: "#e8edf5", sub: "#f3f4f6" };

  const gid = group?.id;
  const [detailTab, setDetailTab] = useState("malumotlar");
  const [darsliklarTab, setDarsliklarTab] = useState("uyga_vazifa");
  const [openMentor, setOpenMentor] = useState(true);
  const [openParam, setOpenParam] = useState(true);
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [groupStats, setGroupStats] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [homeworks, setHomeworks] = useState([]);
  const [homeworksLoading, setHomeworksLoading] = useState(false);
  const [hwView, setHwView] = useState(null); // { hw, results, loading }
  const [groupFiles, setGroupFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [videoPlayer, setVideoPlayer] = useState(null);
  const [lessonDay, setLessonDay] = useState(null); // dars/davomat oynasi uchun tanlangan kun
  const [toast, setToast] = useState("");

  const groupStudents = useMemo(
    () => (Array.isArray(group?.students) ? group.students : []).map((s) => ({ id: s.id, name: s.full_name ?? s.name ?? "—", photo: s.photo })),
    [group]
  );

  // Guruh statistikasi (mentorlar, parametrlar)
  useEffect(() => {
    if (!gid) return;
    api.get(`/groups/${gid}`).then((r) => setGroupStats(r.data?.data ?? r.data ?? null)).catch(() => {});
  }, [gid]);

  // Dars jadvali
  useEffect(() => {
    if (!gid) return;
    api.get(`/groups/${gid}/schedules`).then((r) => {
      const raw = r.data?.data ?? r.data ?? [];
      const obj = Array.isArray(raw) ? raw[0] : raw;
      const months = Object.values(obj || {}).filter((m) => m && Array.isArray(m.days)).map((m) => ({ month: m.days[0]?.month, isActive: m.isActive, days: m.days }));
      setSchedules(months);
    }).catch(() => setSchedules([]));
  }, [gid]);

  // Davomat
  useEffect(() => {
    if (!gid || detailTab !== "akademik") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAttendanceLoading(true);
    api.get("/attendance/all").then((r) => {
      const arr = r.data?.data ?? r.data ?? [];
      setAttendance((Array.isArray(arr) ? arr : []).filter((a) => Number(a.group_id) === Number(gid)));
    }).catch(() => setAttendance([])).finally(() => setAttendanceLoading(false));
  }, [gid, detailTab]);

  // Uy vazifalari
  useEffect(() => {
    if (!gid || detailTab !== "darsliklari" || darsliklarTab !== "uyga_vazifa") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHomeworksLoading(true);
    api.get(`/homework/${gid}`).then((r) => {
      const arr = r.data?.data ?? r.data ?? [];
      setHomeworks(Array.isArray(arr) ? arr : []);
    }).catch(() => setHomeworks([])).finally(() => setHomeworksLoading(false));
  }, [gid, detailTab, darsliklarTab]);

  // Darslar (jurnal sub-tab)
  useEffect(() => {
    if (!gid || detailTab !== "darsliklari" || darsliklarTab !== "jurnal") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLessonsLoading(true);
    api.get(`/lessons/my/group/${gid}`).then((r) => {
      const arr = r.data?.data ?? r.data ?? [];
      setLessons(Array.isArray(arr) ? arr : []);
    }).catch(() => setLessons([])).finally(() => setLessonsLoading(false));
  }, [gid, detailTab, darsliklarTab]);

  // Videolar (fayllar)
  useEffect(() => {
    if (!gid || detailTab !== "darsliklari" || darsliklarTab !== "videolar") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilesLoading(true);
    api.get(`/files/${gid}`).then((r) => {
      const raw = r.data?.data ?? r.data ?? [];
      // Backend ba'zан massiv o'rniga {0:{}, 1:{}} raqamli obyekt qaytaradi
      const arr = Array.isArray(raw) ? raw : (raw && typeof raw === "object" ? Object.values(raw) : []);
      setGroupFiles(arr.filter((f) => f && typeof f === "object" && (f.video_url || f.url || f.originalname)));
    }).catch(() => setGroupFiles([])).finally(() => setFilesLoading(false));
  }, [gid, detailTab, darsliklarTab]);

  const openVideo = async (f, i) => {
    const name = f.originalname ?? f.name ?? f.filename ?? `Fayl ${i + 1}`;
    const rawExt = (f.video_url ?? name).split(".").pop()?.toLowerCase() ?? "";
    const fileUrl = f.video_url ?? f.url ?? null;
    const isVideo = ["mp4", "webm", "avi", "mkv", "mov", "mpeg", "m4v", "ogm"].includes(rawExt);
    setVideoPlayer({ ...f, name, fileUrl, isVideo, blobUrl: null, blobLoading: isVideo });
    if (isVideo && fileUrl) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(buildVideoUrl(fileUrl), { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          setVideoPlayer((p) => (p ? { ...p, blobUrl, blobLoading: false } : null));
        } else {
          setVideoPlayer((p) => (p ? { ...p, blobLoading: false } : null));
        }
      } catch {
        setVideoPlayer((p) => (p ? { ...p, blobLoading: false } : null));
      }
    }
  };

  // Uy vazifa natijalarini status bo'yicha yuklaymiz (admin kabi)
  const loadHwResults = (hw, status) => {
    const hwId = hw.homework?.[0]?.id ?? hw.id; // ichki homework id
    setHwView({ hw, statusTab: status, results: [], loading: true });
    const params = status === "NOT_SUBMITTED" ? {} : { status };
    api.get(`/group/${gid}/homework/${hwId}/results`, { params }).then((r) => {
      const d = r.data?.data ?? r.data;
      const arr = Array.isArray(d?.students) ? d.students : (Array.isArray(d) ? d : []);
      setHwView((p) => (p ? { ...p, results: arr, loading: false } : null));
    }).catch(() => setHwView((p) => (p ? { ...p, results: [], loading: false } : null)));
  };
  const openHwView = (hw) => loadHwResults(hw, "PENDING");

  const days = Array.isArray(group?.week_day) ? group.week_day.map((d) => DAY_ABBR[String(d).toUpperCase()] ?? d).join(", ") : "—";
  const mentors = Array.isArray(groupStats?.teachers) ? groupStats.teachers : [];
  // Dars jadvalida standart ravishda joriy (active) oy ko'rsatiladi
  const activeMonthIdx = schedules.findIndex((m) => m.isActive);
  const scheduleDefaultIdx = activeMonthIdx >= 0 ? activeMonthIdx : Math.max(0, schedules.length - 1);

  const col = { fontSize: 12, color: t.textMuted, fontWeight: 600, padding: "12px 18px", textAlign: "left", whiteSpace: "nowrap" };
  const cell = { fontSize: 13.5, color: t.text, padding: "14px 18px", verticalAlign: "middle" };
  const cardStyle = { background: t.card, borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: `1px solid ${t.border}`, overflow: "hidden" };
  const gradHead = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: GRADIENT };
  const todayMidnight = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();

  // Jadvaldan kun tanlansa — dars/davomat oynasini ochamiz (admin LessonDetail kabi)
  if (lessonDay) {
    return <TeacherLessonDetail group={group} day={lessonDay} schedules={schedules} darkMode={darkMode} onBack={() => setLessonDay(null)} />;
  }

  return (
    <div style={{ padding: "22px 26px", fontFamily: "'Inter', sans-serif", background: t.bg, minHeight: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ border: "none", background: "none", cursor: "pointer", color: t.textSec, display: "flex", padding: 4, borderRadius: 8 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = t.hover)} onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>
            <ArrowBackIcon style={{ fontSize: 22 }} />
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: t.text, margin: 0, letterSpacing: "-0.4px" }}>{group?.name}</h1>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#16a34a", background: darkMode ? "#052e16" : "#dcfce7", padding: "3px 10px", borderRadius: 20 }}>Aktiv</span>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 6, border: `1.5px solid ${t.border}`, borderRadius: 8, padding: "8px 16px", background: t.card, fontSize: 13, fontWeight: 600, color: t.textSec, cursor: "pointer" }}>
          <BarChartIcon style={{ fontSize: 17, color: t.textMuted }} /> Statistika
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `2px solid ${t.border}`, marginBottom: 24 }}>
        {DETAIL_TABS.map((key) => (
          <button key={key} onClick={() => setDetailTab(key)}
            style={{ padding: "10px 20px", border: "none", borderBottom: detailTab === key ? `2.5px solid ${PRIMARY}` : "2.5px solid transparent", background: "none", cursor: "pointer", fontSize: 14, color: detailTab === key ? PRIMARY : t.textMuted, fontWeight: detailTab === key ? 700 : 500, marginBottom: "-2px", whiteSpace: "nowrap" }}>
            {DETAIL_LABELS[key]}
          </button>
        ))}
      </div>

      {/* ── MA'LUMOTLAR ── */}
      {detailTab === "malumotlar" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="gd-info-grid">
            {/* Mentorlar */}
            <div style={cardStyle}>
              <div onClick={() => setOpenMentor((p) => !p)} style={{ ...gradHead, cursor: "pointer", userSelect: "none" }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>Guruh mentorlari</span>
                <span style={{ color: "#fff", fontSize: 18, transition: "transform 0.25s", transform: openMentor ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
              </div>
              <div style={{ maxHeight: openMentor ? 600 : 0, overflow: "hidden", transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)" }}>
                {mentors.length === 0 ? (
                  <p style={{ color: t.textMuted, fontSize: 13, margin: 0, padding: 18, textAlign: "center" }}>Mentor biriktirilmagan</p>
                ) : (
                  <div style={{ padding: "10px 0" }}>
                    {mentors.map((m, i) => {
                      const name = m.full_name ?? m.fullName ?? m.name ?? "—";
                      return (
                        <div key={m.id ?? i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 18px", borderBottom: `1px solid ${t.divider}` }}>
                          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {m.photo ? <img src={imgUrl(m.photo)} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : <span style={{ color: "#fff", fontWeight: 700, fontSize: 17 }}>{name[0]?.toUpperCase() ?? "?"}</span>}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: t.text }}>{name}</p>
                            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#16a34a", fontWeight: 600 }}>Teacher</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Parametrlar */}
            <div style={cardStyle}>
              <div onClick={() => setOpenParam((p) => !p)} style={{ ...gradHead, cursor: "pointer", userSelect: "none" }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>Parametrlar</span>
                <span style={{ color: "#fff", fontSize: 18, transition: "transform 0.25s", transform: openParam ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
              </div>
              <div style={{ maxHeight: openParam ? 600 : 0, overflow: "hidden", transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)" }}>
                <div style={{ padding: "6px 0" }}>
                  {[
                    { label: "Kurs:", value: groupStats?.course?.name ?? group?.course?.name ?? "—" },
                    { label: "O'rta yosh:", value: groupStats?.averageAge ?? "—" },
                    { label: "O'quvchilar sig'imi:", value: groupStats?.room_capacity ?? "—" },
                    { label: "Mavjud o'quvchilar:", value: groupStats?.student_count ?? group?.student_count ?? groupStudents.length },
                    { label: "Kurs davomiyligi (oy):", value: groupStats?.course?.duration_month ?? group?.course?.duration_month ?? "—" },
                    { label: "Dars vaqti:", value: `${group?.start_time ?? "—"} · ${days}` },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 18px", borderBottom: `1px solid ${t.divider}` }}>
                      <span style={{ fontSize: 13, color: t.textMuted }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Talabalar */}
          <div style={cardStyle}>
            <div style={gradHead}>
              <span style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>Guruh talabalari ({groupStudents.length})</span>
            </div>
            <div>
              {groupStudents.length === 0 ? (
                <p style={{ textAlign: "center", color: t.textMuted, padding: 24, margin: 0 }}>Talabalar mavjud emas</p>
              ) : groupStudents.map((s, i) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", borderBottom: `1px solid ${t.divider}` }}>
                  <span style={{ fontSize: 12, color: t.textMuted, width: 20, flexShrink: 0 }}>{i + 1}</span>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: AVATAR_COLORS[i % AVATAR_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0, overflow: "hidden" }}>
                    {s.photo ? <img src={imgUrl(s.photo)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : s.name[0]}
                  </div>
                  <span style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{s.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dars jadvali */}
          <div style={{ ...cardStyle, padding: "18px 20px" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: "0 0 16px" }}>Dars jadvali</h3>
            {schedules.length === 0 ? (
              <p style={{ color: t.textMuted, fontSize: 13, textAlign: "center", padding: "12px 0" }}>Jadval ma&apos;lumotlari yuklanmoqda...</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {(showAllMonths ? schedules.map((m, i) => ({ m, i })) : [{ m: schedules[scheduleDefaultIdx], i: scheduleDefaultIdx }]).map(({ m: month, i: idx }) => (
                  <div key={idx}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{idx + 1}-o&apos;quv oyi</span>
                      {month.isActive && <span style={{ fontSize: 11, fontWeight: 600, color: "#16a34a", border: "1.5px solid #16a34a", padding: "2px 10px", borderRadius: 20 }}>Joriy oy</span>}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {month.days.map((d, i) => {
                        const future = new Date(new Date().getFullYear(), MONTH_IDX[d.month] ?? 0, d.day) > todayMidnight;
                        return (
                          <div key={i}
                            onClick={future ? undefined : () => setLessonDay({ day: d.day, month: d.month })}
                            title={future ? "Dars kelmagan — tanlab bo'lmaydi" : d.isCompleted ? "O'tilgan dars" : "Dars kuni"}
                            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: d.isCompleted ? t.past : t.card, border: `1.5px solid ${t.border}`, borderRadius: 10, padding: "8px 12px", minWidth: 52, opacity: future ? 0.4 : 1, cursor: future ? "not-allowed" : "pointer", transition: "border-color 0.15s" }}
                            onMouseEnter={(e) => { if (!future) e.currentTarget.style.borderColor = PRIMARY; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; }}>
                            <span style={{ fontSize: 11, color: t.textMuted, fontWeight: 500 }}>{d.month}</span>
                            <span style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{d.day}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {schedules.length > 1 && (
                  <div style={{ textAlign: "center" }}>
                    <button onClick={() => setShowAllMonths((p) => !p)} style={{ border: `1.5px solid ${t.border}`, borderRadius: 8, padding: "8px 22px", background: t.card, fontSize: 13, cursor: "pointer", color: t.textSec, fontWeight: 500 }}>
                      {showAllMonths ? "Yig'ish" : `Yana ko'rsatish (${schedules.length - 1})`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── GURUH DARSLIKLARI ── */}
      {detailTab === "darsliklari" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: t.text, margin: 0 }}>Guruh darsliklari</h2>
              <div style={{ display: "flex", gap: 2, background: t.sub, borderRadius: 8, padding: 3 }}>
                {DARS_TABS.map(({ key, label }) => (
                  <button key={key} onClick={() => { setDarsliklarTab(key); setHwView(null); }}
                    style={{ padding: "6px 14px", border: "none", borderRadius: 6, fontSize: 13, fontWeight: darsliklarTab === key ? 600 : 400, cursor: "pointer", background: darsliklarTab === key ? t.card : "transparent", color: darsliklarTab === key ? t.text : t.textMuted, boxShadow: darsliklarTab === key ? "0 1px 4px rgba(0,0,0,0.1)" : "none", whiteSpace: "nowrap" }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setToast("Bu amal admin panelida bajariladi")}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 3px 10px rgba(22,163,74,0.3)" }}>
              <AddIcon style={{ fontSize: 17 }} /> Qo&apos;shish
            </button>
          </div>

          {/* Uyga vazifa — ro'yxat */}
          {darsliklarTab === "uyga_vazifa" && !hwView && (
            <div style={cardStyle}>
              {homeworksLoading ? (
                <p style={{ textAlign: "center", padding: 32, color: t.textMuted, fontSize: 14 }}>Yuklanmoqda...</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: t.head }}>
                        <th style={col}>#</th>
                        <th style={col}>Mavzu</th>
                        <th style={col}><PersonIcon style={{ fontSize: 15, color: t.textMuted }} /></th>
                        <th style={col}><AccessTimeIcon style={{ fontSize: 15, color: "#f59e0b" }} /></th>
                        <th style={col}><CheckCircleOutlineIcon style={{ fontSize: 15, color: "#16a34a" }} /></th>
                        <th style={col}>Berilgan vaqt</th>
                        <th style={col}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {homeworks.length === 0 ? (
                        <tr><td colSpan={7} style={{ textAlign: "center", padding: 32, color: t.textMuted, fontSize: 14 }}>Uy vazifalari mavjud emas</td></tr>
                      ) : homeworks.map((hw, i) => {
                        const hwItem = hw.homework?.[0];
                        return (
                          <tr key={`${hw.id}-${i}`} onClick={() => openHwView(hw)} style={{ cursor: "pointer", borderTop: `1px solid ${t.divider}` }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = t.hover)} onMouseLeave={(e) => (e.currentTarget.style.background = t.card)}>
                            <td style={cell}>{i + 1}</td>
                            <td style={{ ...cell, fontWeight: 500 }}>{hw.topic ?? "—"}</td>
                            <td style={cell}>{hw.existStudentsIngroup ?? "—"}</td>
                            <td style={{ ...cell, color: "#f59e0b", fontWeight: 600 }}>{hw.homeworkPending ?? 0}</td>
                            <td style={{ ...cell, color: "#16a34a", fontWeight: 600 }}>{hw.homeworkAccept ?? 0}</td>
                            <td style={{ ...cell, fontSize: 12, color: t.textMuted }}>{hwItem?.created_at ? new Date(hwItem.created_at).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric" }) : "—"}</td>
                            <td style={{ ...cell, textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                              <button style={{ border: "none", background: "none", cursor: "pointer", color: t.textMuted, padding: 4 }}><MoreVertIcon style={{ fontSize: 18 }} /></button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Uyga vazifa — detal (topshirganlar) */}
          {darsliklarTab === "uyga_vazifa" && hwView && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <button onClick={() => setHwView(null)} style={{ border: "none", background: "none", cursor: "pointer", color: t.textSec, display: "flex", padding: 4 }}><ArrowBackIcon style={{ fontSize: 20 }} /></button>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: t.text }}>{hwView.hw?.topic ?? "Uy vazifa"}</h3>
              </div>
              <div style={{ ...cardStyle, padding: "16px 20px", marginBottom: 18, display: "flex", gap: 28, flexWrap: "wrap" }}>
                <div><p style={{ margin: 0, fontSize: 12, color: t.textMuted }}>Talabalar</p><p style={{ margin: "3px 0 0", fontSize: 16, fontWeight: 700, color: t.text }}>{hwView.hw?.existStudentsIngroup ?? "—"}</p></div>
                <div><p style={{ margin: 0, fontSize: 12, color: t.textMuted }}>Kutilmoqda</p><p style={{ margin: "3px 0 0", fontSize: 16, fontWeight: 700, color: "#f59e0b" }}>{hwView.hw?.homeworkPending ?? 0}</p></div>
                <div><p style={{ margin: 0, fontSize: 12, color: t.textMuted }}>Qabul qilingan</p><p style={{ margin: "3px 0 0", fontSize: 16, fontWeight: 700, color: "#16a34a" }}>{hwView.hw?.homeworkAccept ?? 0}</p></div>
                <div><p style={{ margin: 0, fontSize: 12, color: t.textMuted }}>Qaytarilgan</p><p style={{ margin: "3px 0 0", fontSize: 16, fontWeight: 700, color: "#ef4444" }}>{hwView.hw?.homeworkReject ?? 0}</p></div>
              </div>
              {/* Status tab'lari */}
              {(() => {
                const HW_TABS = [
                  { key: "PENDING", label: "Kutayotganlar", color: "#f59e0b" },
                  { key: "REJECTED", label: "Qaytarilganlar", color: "#ef4444" },
                  { key: "ACCEPTED", label: "Qabul qilinganlar", color: "#16a34a" },
                  { key: "NOT_SUBMITTED", label: "Bajarilmagan", color: "#ef4444" },
                ];
                const pend = hwView.hw?.homeworkPending ?? 0, acc = hwView.hw?.homeworkAccept ?? 0, rej = hwView.hw?.homeworkReject ?? 0;
                const counts = { PENDING: pend, REJECTED: rej, ACCEPTED: acc, NOT_SUBMITTED: Math.max(0, (hwView.hw?.existStudentsIngroup ?? 0) - pend - acc - rej) };
                return (
                  <div style={{ display: "flex", borderBottom: `2px solid ${t.border}`, marginBottom: 18, flexWrap: "wrap" }}>
                    {HW_TABS.map(({ key, label, color }) => {
                      const active = hwView.statusTab === key;
                      const cnt = counts[key];
                      return (
                        <button key={key} onClick={() => loadHwResults(hwView.hw, key)}
                          style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", border: "none", borderBottom: active ? `2.5px solid ${PRIMARY}` : "2.5px solid transparent", background: "none", cursor: "pointer", fontSize: 13.5, color: active ? t.text : t.textMuted, fontWeight: active ? 700 : 500, marginBottom: "-2px", whiteSpace: "nowrap" }}>
                          {label}
                          {cnt > 0 && <span style={{ fontSize: 11, fontWeight: 700, background: color, color: "#fff", borderRadius: 20, minWidth: 20, height: 20, padding: "0 6px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{cnt}</span>}
                        </button>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Natijalar jadvali */}
              <div style={cardStyle}>
                {hwView.loading ? (
                  <p style={{ textAlign: "center", padding: 32, color: t.textMuted, fontSize: 14 }}>Yuklanmoqda...</p>
                ) : hwView.results.length === 0 ? (
                  <p style={{ textAlign: "center", padding: 32, color: t.textMuted, fontSize: 14 }}>Talabalar topilmadi</p>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead><tr style={{ background: t.head }}><th style={col}>#</th><th style={col}>O&apos;quvchi ismi</th><th style={col}>Jo&apos;natilgan vaqt</th><th style={col}>Ball</th></tr></thead>
                      <tbody>
                        {hwView.results.map((s, i) => {
                          const name = s.full_name ?? s.fullName ?? s.name ?? `#${s.student_id ?? s.id}`;
                          const submitted = s.submitted_at ?? s.created_at;
                          return (
                            <tr key={s.id ?? i} style={{ borderTop: `1px solid ${t.divider}` }}>
                              <td style={{ ...cell, color: t.textMuted }}>{i + 1}</td>
                              <td style={{ ...cell, fontWeight: 500 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: AVATAR_COLORS[i % AVATAR_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{name[0]?.toUpperCase()}</div>
                                  {name}
                                </div>
                              </td>
                              <td style={{ ...cell, fontSize: 12, color: t.textMuted }}>{submitted ? new Date(submitted).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                              <td style={cell}>{s.grade != null ? <span style={{ fontSize: 14, fontWeight: 700, color: "#f59e0b" }}>⚡ {s.grade}</span> : "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Jurnal — darslar */}
          {darsliklarTab === "jurnal" && (
            <div style={cardStyle}>
              {lessonsLoading ? (
                <p style={{ textAlign: "center", padding: 32, color: t.textMuted, fontSize: 14 }}>Yuklanmoqda...</p>
              ) : lessons.length === 0 ? (
                <p style={{ textAlign: "center", padding: 32, color: t.textMuted, fontSize: 14 }}>Darslar topilmadi.</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr style={{ background: t.head }}><th style={col}>#</th><th style={col}>Mavzu</th><th style={col}>Sana</th></tr></thead>
                    <tbody>
                      {lessons.map((l, i) => (
                        <tr key={l.id ?? i} style={{ borderTop: `1px solid ${t.divider}` }}>
                          <td style={{ ...cell, color: t.textMuted }}>{i + 1}</td>
                          <td style={{ ...cell, fontWeight: 600 }}>{l.topic ?? l.title ?? `Dars ${i + 1}`}</td>
                          <td style={{ ...cell, color: t.textSec, fontSize: 12.5 }}>{l.created_at ? new Date(l.created_at).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric" }) : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Videolar */}
          {darsliklarTab === "videolar" && (
            <div style={cardStyle}>
              {filesLoading ? (
                <p style={{ textAlign: "center", padding: 32, color: t.textMuted, fontSize: 14 }}>Yuklanmoqda...</p>
              ) : groupFiles.length === 0 ? (
                <p style={{ textAlign: "center", padding: "48px 24px", color: t.textMuted, fontSize: 14 }}>Fayllar mavjud emas</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: t.head }}>
                        <th style={col}>#</th>
                        <th style={col}>Fayl nomi</th>
                        <th style={col}>Turi</th>
                        <th style={col}>Hajmi</th>
                        <th style={col}>Dars mavzusi</th>
                        <th style={col}>Qo&apos;shilgan vaqti</th>
                        <th style={col} />
                      </tr>
                    </thead>
                    <tbody>
                      {groupFiles.map((f, i) => {
                        const name = f.originalname ?? f.name ?? f.filename ?? `Fayl ${i + 1}`;
                        const rawExt = (f.video_url ?? name).split(".").pop()?.toLowerCase() ?? "";
                        const ext = rawExt.toUpperCase();
                        const size = f.size_mb ? `${f.size_mb.toFixed(2)} MB` : "—";
                        const isVideo = ["mp4", "webm", "avi", "mkv", "mov", "mpeg", "m4v", "ogm"].includes(rawExt);
                        return (
                          <tr key={f.id ?? i} onClick={() => openVideo(f, i)} style={{ cursor: "pointer", borderTop: `1px solid ${t.divider}` }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = t.hover)} onMouseLeave={(e) => (e.currentTarget.style.background = t.card)}>
                            <td style={cell}>{i + 1}</td>
                            <td style={cell}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 28, height: 28, borderRadius: "50%", background: isVideo ? (darkMode ? "#0c4a6e" : "#e0f2fe") : (darkMode ? "#334155" : "#f3f4f6"), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                  <svg viewBox="0 0 24 24" width="14" height="14" fill={isVideo ? "#0891b2" : t.textMuted}><path d="M8 5v14l11-7z" /></svg>
                                </div>
                                <span style={{ color: "#0891b2", fontWeight: 500, fontSize: 13 }}>{name}</span>
                              </div>
                            </td>
                            <td style={cell}>{ext && <span style={{ fontSize: 11, fontWeight: 600, color: PRIMARY, background: darkMode ? "#2e1065" : "#ede9fe", padding: "3px 8px", borderRadius: 12 }}>{ext}</span>}</td>
                            <td style={{ ...cell, fontSize: 12 }}>{size}</td>
                            <td style={{ ...cell, fontSize: 12, color: t.textSec }}>{f.lesson?.topic ?? "—"}</td>
                            <td style={{ ...cell, fontSize: 12, color: t.textMuted }}>{f.created_at ? new Date(f.created_at).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric" }) : "—"}</td>
                            <td style={{ ...cell, textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                              <button style={{ border: "none", background: "none", cursor: "pointer", color: t.textMuted, padding: 4 }}><MoreVertIcon style={{ fontSize: 18 }} /></button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Imtihonlar — bo'sh holat */}
          {darsliklarTab === "imtihonlar" && (
            <div style={{ ...cardStyle, padding: "48px 20px", textAlign: "center", color: t.textMuted, fontSize: 14 }}>Imtihonlar mavjud emas</div>
          )}
        </div>
      )}

      {/* ── AKADEMIK DAVOMATI ── */}
      {detailTab === "akademik" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ ...cardStyle, padding: "16px 20px", color: t.textMuted, fontSize: 13.5 }}>
            ℹ️ Davomat kiritish uchun <b style={{ color: t.text }}>Ma&apos;lumotlar</b> bo&apos;limidagi jadvaldan o&apos;tilgan <b style={{ color: t.text }}>kun</b>ni tanlang.
          </div>

          <div style={cardStyle}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.divider}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: t.text }}>Akademik davomati</span>
              <span style={{ fontSize: 13, color: t.textMuted }}>Jami yozuvlar: {attendance.length}</span>
            </div>
            {attendanceLoading && attendance.length === 0 ? (
              <p style={{ textAlign: "center", padding: 32, color: t.textMuted, fontSize: 14 }}>Yuklanmoqda...</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ background: t.head }}><th style={col}>#</th><th style={col}>Talaba ID</th><th style={col}>Talaba ismi</th><th style={col}>Holat</th><th style={col}>Sana</th></tr></thead>
                  <tbody>
                    {attendance.length === 0 ? (
                      <tr><td colSpan={5} style={{ textAlign: "center", padding: 32, color: t.textMuted, fontSize: 14 }}>Davomat ma&apos;lumotlari mavjud emas</td></tr>
                    ) : [...attendance].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((a, i) => {
                      const student = groupStudents.find((s) => s.id === a.student_id);
                      return (
                        <tr key={a.id} style={{ borderTop: `1px solid ${t.divider}` }}>
                          <td style={{ ...cell, color: t.textMuted }}>{i + 1}</td>
                          <td style={{ ...cell, color: t.textMuted, fontSize: 12 }}>#{a.student_id}</td>
                          <td style={{ ...cell, fontWeight: 500 }}>{student?.name ?? "—"}</td>
                          <td style={cell}><span style={{ fontSize: 12, fontWeight: 600, color: a.isPresent ? "#16a34a" : "#ef4444", background: a.isPresent ? (darkMode ? "#052e16" : "#dcfce7") : (darkMode ? "#3f1d1d" : "#fee2e2"), padding: "3px 10px", borderRadius: 20 }}>{a.isPresent ? "Keldi" : "Kelmadi"}</span></td>
                          <td style={{ ...cell, fontSize: 12, color: t.textMuted }}>{new Date(a.created_at).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric" })}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video player modal */}
      {videoPlayer && (
        <>
          <div onClick={() => { if (videoPlayer?.blobUrl) URL.revokeObjectURL(videoPlayer.blobUrl); setVideoPlayer(null); }} style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.8)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(720px, 92vw)", background: "#000", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", zIndex: 510, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#111" }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "80%" }}>{videoPlayer.name}</p>
              <button onClick={() => { if (videoPlayer?.blobUrl) URL.revokeObjectURL(videoPlayer.blobUrl); setVideoPlayer(null); }} style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af", display: "flex", padding: 4 }}>
                <CloseIcon style={{ fontSize: 20 }} />
              </button>
            </div>
            {videoPlayer.blobLoading ? (
              <div style={{ padding: "48px 24px", textAlign: "center" }}><p style={{ color: "#9ca3af", margin: 0, fontSize: 14 }}>Video yuklanmoqda...</p></div>
            ) : videoPlayer.isVideo ? (
              videoPlayer.blobUrl ? (
                <video controls autoPlay style={{ width: "100%", maxHeight: "70vh", display: "block", background: "#000" }} src={videoPlayer.blobUrl} />
              ) : (
                <div style={{ padding: "40px 24px", textAlign: "center" }}>
                  <p style={{ color: "#9ca3af", margin: "0 0 12px", fontSize: 14 }}>Video ochilmadi</p>
                  <p style={{ color: "#6b7280", margin: 0, fontSize: 12 }}>{videoPlayer.fileUrl ?? "URL topilmadi"}</p>
                </div>
              )
            ) : (
              <div style={{ padding: "32px 24px", textAlign: "center", background: "#1a1a1a" }}>
                <p style={{ color: "#9ca3af", margin: "0 0 16px", fontSize: 14 }}>Bu video fayl emas</p>
                {videoPlayer.fileUrl && (
                  <a href={buildVideoUrl(videoPlayer.fileUrl)} target="_blank" rel="noreferrer" style={{ display: "inline-block", padding: "10px 24px", background: PRIMARY, color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>Ochish</a>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: toast.includes("xatolik") ? "#ef4444" : "#16a34a", color: "#fff", padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: 2000 }}>{toast}</div>
      )}
    </div>
  );
}
