import { useState, useEffect, useRef } from "react";
import api from "../../api/axios";
import { lessonFileUrl } from "../../api/fileUrl";
import { getCurrentUser } from "../../api/auth";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";

const PRIMARY = "#7c3aed";
const ORANGE = "#7c3aed"; // binafsha aksent (referensdek)

const INIT_MY_GROUPS = [
  {
    id: 1,
    active: true,
    name: "n105",
    kurs: "Backend",
    oqituvchi: "Mohirbek",
    boshlash: "2026 M05 1",
    teachers: [
      { name: "Mohirbek", role: "TEACHER", days: "Se, Pa, Sha", time: "16:00 - 18:00" },
    ],
  },
];

// Sana formati skrinshotdek: "2026 M06 11" yoki "2026 M06 11 20:00"
const fmtDate = (d, withTime = false) => {
  if (!d) return "-";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "-";
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const base = `${dt.getFullYear()} M${mm} ${dt.getDate()}`;
  if (!withTime) return base;
  const hh = String(dt.getHours()).padStart(2, "0");
  const mi = String(dt.getMinutes()).padStart(2, "0");
  return `${base} ${hh}:${mi}`;
};

// Uy vazifa holatини backend maydonlaridan aniqlash (himoyalangan — turli nomlarни qamrab oladi)
const STATUS_META = {
  accepted:  { label: "Qabul qilingan", bg: "#16a34a", color: "#fff" },
  returned:  { label: "Qaytarilgan",    bg: "#f59e0b", color: "#fff" },
  failed:    { label: "Bajarilmagan",   bg: "#ef4444", color: "#fff" },
  none:      { label: "Berilmagan",     bg: "#6b7280", color: "#fff" },
};

const deriveStatus = (l) => {
  // 1) To'g'ridan-to'g'ri status satri (talabaning o'z holati)
  const raw = String(l.homeworkStatus ?? l.status ?? l.hwStatus ?? l.homework_status ?? "").toLowerCase();
  if (raw.includes("accept") || raw.includes("qabul")) return STATUS_META.accepted;
  if (raw.includes("reject") || raw.includes("return") || raw.includes("qaytar")) return STATUS_META.returned;
  if (raw.includes("bajarilmagan") || raw.includes("pending") || raw.includes("fail") || raw.includes("undone")) return STATUS_META.failed;
  if (raw.includes("berilmagan") || raw === "none" || raw.includes("notgiven")) return STATUS_META.none;
  // 2) Count / flag ko'rinishlarи
  if ((l.homeworkAccept ?? 0) > 0) return STATUS_META.accepted;
  if ((l.homeworkReject ?? 0) > 0) return STATUS_META.returned;
  if ((l.homeworkPending ?? 0) > 0) return STATUS_META.failed;
  // 3) Uy vazifa mavjudmi?
  const hws = Array.isArray(l.homework) ? l.homework : (l._homeworks ?? []);
  const hasHw = hws.length > 0 || l.homeworkExists || (l.homeworkCount ?? 0) > 0;
  return hasHw ? STATUS_META.failed : STATUS_META.none;
};

// Uy vazifa tugash vaqti (deadline)
const hwDeadline = (l) => {
  const hw = Array.isArray(l.homework) ? l.homework[0] : l.homework;
  return l.homeworkDeadline ?? l.homework_deadline ?? l.deadline ?? l.dueDate ?? l.due_date ??
    hw?.deadline ?? hw?.end_date ?? hw?.due_date ?? null;
};

const videoCount = (l) =>
  l.videoCount ?? l.video_count ?? l.videosCount ??
  (Array.isArray(l.videos) ? l.videos.length : null) ?? l.video ?? l._videoCount ?? 0;

// Video manbaini aniqlash: blob (token bilan yuklangan), YouTube/Vimeo havola yoki to'liq URL
const resolveVideo = (v) => {
  const raw = v.video_url ?? v.file ?? v.url ?? v.video ?? v.link ?? v.path ??
    v.videoUrl ?? v.youtube ?? v.youtubeUrl ?? v.src ?? v.video_link;
  if (!raw) return { type: "none" };
  const s = String(raw).trim();
  const yt = s.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return { type: "iframe", src: `https://www.youtube.com/embed/${yt[1]}` };
  const vm = s.match(/vimeo\.com\/(\d+)/);
  if (vm) return { type: "iframe", src: `https://player.vimeo.com/video/${vm[1]}` };
  if (s.startsWith("http")) return { type: "video", src: s };
  return { type: "video", src: lessonFileUrl(s) }; // fayl — public /files/files/{fayl}
};

export default function Guruhlarim({ darkMode }) {
  const [tab, setTab] = useState("faol");
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState(INIT_MY_GROUPS);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);

  // Detail (uy vazifa statusi) ko'rinishi
  const [detailGroup, setDetailGroup] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Barchasi");

  // Dars detali modali (video + uy vazifa + javob yuborish)
  const [lessonModal, setLessonModal] = useState(null); // tanlangan dars
  const [videos, setVideos] = useState([]);
  const [homeworks, setHomeworks] = useState([]);
  const [lessonDetailLoading, setLessonDetailLoading] = useState(false);
  const [answerTitle, setAnswerTitle] = useState("");
  const [answerFile, setAnswerFile] = useState(null);
  const [answerHwId, setAnswerHwId] = useState(null);
  const [hwSubmitted, setHwSubmitted] = useState(false); // bu vazifага javob yuborilганmi (lokal)
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");
  const answerFileRef = useRef(null);

  const openTeacherModal = (g) => { setSelectedGroup(g); setTeacherModalOpen(true); };
  const closeTeacherModal = () => setTeacherModalOpen(false);

  // Darsга bosilganда — video va uy vazifasini yuklaymiz
  const openLessonModal = (lesson) => {
    setLessonModal(lesson);
    setVideos([]);
    setHomeworks([]);
    setHwSubmitted(false);
    setAnswerTitle("");
    setAnswerFile(null);
    setAnswerHwId(null);
    setSubmitMsg("");
    setLessonDetailLoading(true);
    const gid = detailGroup?.groupId ?? detailGroup?.id;
    const lid = lesson.id;
    Promise.allSettled([
      api.get(`/groups/${gid}/lessons/${lid}/videos`),
      api.get(`/homework/own/${lid}`),
    ]).then(([vRes, hRes]) => {
      if (vRes.status === "fulfilled") {
        const d = vRes.value.data?.data ?? vRes.value.data ?? [];
        setVideos(Array.isArray(d) ? d : []);
      }
      if (hRes.status === "fulfilled") {
        const d = hRes.value.data?.data ?? hRes.value.data ?? [];
        const list = Array.isArray(d) ? d : [];
        setHomeworks(list);
        if (list[0]) {
          setAnswerHwId(list[0].id);
          // Backend student javobини qaytarmaydi — lokal belgи orqali eslaymiz
          const sid = getCurrentUser()?.id;
          setHwSubmitted(!!localStorage.getItem(`hw_sub_${sid}_${list[0].id}`));
        }
      }
    }).finally(() => setLessonDetailLoading(false));
  };
  const closeLessonModal = () => setLessonModal(null);

  // Uy vazifaга javob yuborish
  const submitAnswer = async () => {
    setSubmitMsg("");
    if (!answerHwId) { setSubmitMsg("Bu darsда topshiriladigan vazifa yo'q."); return; }
    if (!answerTitle.trim() && !answerFile) { setSubmitMsg("Izoh yoki fayl kiriting."); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      if (answerTitle.trim()) fd.append("title", answerTitle.trim());
      if (answerFile) fd.append("file", answerFile);
      // Content-Type ni QO'LDA qo'ymaymiz — brauzer multipart boundary'ни o'zi qo'yadi
      await api.post(`/students/homeworkAnswer/${answerHwId}`, fd);
      setSubmitMsg("✓ Javob muvaffaqiyatli yuborildi!");
      setAnswerTitle("");
      setAnswerFile(null);
      // Backend student javobини qaytarmaydi — lokal belgi qo'yamiz
      const sid = getCurrentUser()?.id;
      localStorage.setItem(`hw_sub_${sid}_${answerHwId}`, "1");
      setHwSubmitted(true);
    } catch (err) {
      const m = err?.response?.data?.message;
      const msg = Array.isArray(m) ? m.join(", ") : (m || "");
      if (/already exists/i.test(msg) || err?.response?.status === 409) {
        setSubmitMsg("Siz bu vazifага allaqачon javob yuborgansiz (har vazifага bitta javob).");
        const sid = getCurrentUser()?.id;
        localStorage.setItem(`hw_sub_${sid}_${answerHwId}`, "1");
        setHwSubmitted(true);
      } else {
        setSubmitMsg(msg || "Yuborishda xatolik.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openDetail = (g) => {
    setDetailGroup(g);
    setStatusFilter("Barchasi");
    setLessons([]);
    setLessonsLoading(true);
    const gid = g.groupId ?? g.id;
    // Bitta chaqiruvда hammasını beradigan endpoint (video, holat, muddat, sana)
    api.get(`/groups/${gid}/lessons/all`)
      .then((res) => {
        const d = res.data?.data ?? res.data ?? [];
        setLessons(Array.isArray(d) ? d : []);
      })
      .catch(() => {
        // Fallback: sodda endpoint
        return api.get(`/groups/${gid}/lessons`)
          .then((res) => {
            const d = res.data?.data ?? res.data ?? [];
            setLessons(Array.isArray(d) ? d : []);
          })
          .catch(() => setLessons([]));
      })
      .finally(() => setLessonsLoading(false));
  };
  const closeDetail = () => { setDetailGroup(null); setLessons([]); };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    api.get("/students/my/groups")
      .then((res) => {
        const data = res.data?.data || res.data;
        if (Array.isArray(data) && data.length > 0) {
          const tName = (tt) =>
            (tt?.name ?? tt?.fullName ?? tt?.full_name ??
            [tt?.first_name, tt?.last_name].filter(Boolean).join(" ")) || "";
          const mapped = data.map((g, i) => {
            const tList = Array.isArray(g.teachers) ? g.teachers : [];
            const firstName = tList.map(tName).find(Boolean) || "";
            const count = g.teachersCount ?? tList.length;
            return {
              id: g.id ?? i + 1,
              groupId: g.groupId ?? g.group_id ?? g.id,
              active: g.active ?? true,
              name: g.groupName ?? g.name ?? `Guruh #${g.groupId ?? i + 1}`,
              kurs: g.courseName ?? g.kurs ?? g.course?.name ?? "—",
              // Ism bo'lsa ism, bo'lmasa "N o'qituvchi"
              oqituvchi: firstName || (count > 0 ? `${count} o'qituvchi` : "—"),
              teacherCount: count,
              boshlash: g.startDate ? fmtDate(g.startDate) : (g.boshlash ?? "—"),
              teachers: (tList.length ? tList : []).map((tt) => ({
                name: tName(tt) || "—",
                role: tt.role ?? "TEACHER",
                days: tt.days ?? "—",
                time: tt.time ?? "—",
              })),
            };
          });
          setGroups(mapped);
        }
      })
      .catch(() => setGroups(INIT_MY_GROUPS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = groups.filter((g) => (tab === "faol" ? g.active : !g.active));

  const t = darkMode ? {
    card: "#1e293b", border: "#334155", text: "#f1f5f9", textMuted: "#94a3b8",
    bgHover: "#334155", tableHead: "#0f172a", bg: "#0f172a",
  } : {
    card: "#ffffff", border: "#f0f0f0", text: "#111111", textMuted: "#6b7280",
    bgHover: "#fafafa", tableHead: "#fafafa", bg: "#f6f7fb",
  };

  const col = { fontSize: 12, color: t.textMuted, fontWeight: 700, padding: "16px 20px", textAlign: "left", whiteSpace: "nowrap", borderBottom: `1px solid ${t.border}` };
  const cell = { fontSize: 13, color: t.text, padding: "16px 20px", verticalAlign: "middle", borderBottom: `1px solid ${t.border}` };

  // ══════════ TO'LIQ SAHIFA: DARS DETALI (video + vazifa + darslar ro'yxati) ══════════
  if (lessonModal) {
    const dl = hwDeadline(lessonModal) ?? homeworks[0]?.deadline ?? homeworks[0]?.end_date;
    return (
      <div className="page-content" style={{ padding: "24px", fontFamily: "'Inter', sans-serif" }}>
        {/* Orqaga */}
        <button onClick={closeLessonModal}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, border: `1px solid ${t.border}`, background: t.card, color: t.text, borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer", fontWeight: 500, marginBottom: 18 }}>
          <ArrowBackIcon style={{ fontSize: 17 }} /> Orqaga
        </button>

        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* ── CHAP: ASOSIY ── */}
          <div style={{ flex: "1 1 560px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
            {lessonDetailLoading ? (
              <div style={{ background: t.card, borderRadius: 12, border: `1px solid ${t.border}`, padding: 40, textAlign: "center", color: t.textMuted }}>Yuklanmoqda...</div>
            ) : (
              <>
                {/* Video */}
                <div style={{ background: t.card, borderRadius: 12, border: `1px solid ${t.border}`, overflow: "hidden" }}>
                  {videos.length === 0 ? (
                    <div style={{ padding: "56px 24px", textAlign: "center" }}>
                      <svg width="150" height="118" viewBox="0 0 150 118" fill="none" stroke="#c2a06a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 20 }}>
                        <path d="M75 12 L128 62" />
                        <path d="M75 12 L22 62" />
                        <path d="M75 33 L110 66" />
                        <path d="M75 33 L40 66" />
                        <path d="M75 54 L97 75" />
                        <path d="M75 54 L53 75" />
                        <path d="M75 58 L99 87 L75 116 L51 87 Z" />
                      </svg>
                      <p style={{ fontSize: 21, fontWeight: 800, color: t.text, margin: 0, letterSpacing: "-0.3px" }}>Video mavjud emas</p>
                    </div>
                  ) : (
                    videos.map((v, i) => {
                      const vid = resolveVideo(v);
                      return (
                        <div key={v.id ?? i}>
                          {vid.type === "iframe" ? (
                            <div style={{ position: "relative", paddingTop: "56.25%", background: "#000" }}>
                              <iframe src={vid.src} title={v.title || "video"} allowFullScreen
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
                            </div>
                          ) : vid.src ? (
                            <video controls src={vid.src} preload="metadata" style={{ width: "100%", maxHeight: 460, background: "#000", display: "block" }} />
                          ) : (
                            <p style={{ padding: 20, color: t.textMuted, fontSize: 13 }}>Video manzili topilmadi.</p>
                          )}
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", gap: 10, flexWrap: "wrap" }}>
                            <p style={{ fontSize: 14, fontWeight: 600, color: t.text, margin: 0 }}>
                              {v.title ?? lessonModal.topic ?? "Dars videosi"}
                            </p>
                            {vid.type === "video" && vid.src && (
                              <a href={vid.src} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, color: PRIMARY, fontWeight: 600, textDecoration: "none" }}>
                                Yangi oynada ochish ↗
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Vazifalar */}
                <div style={{ background: t.card, borderRadius: 12, border: `1px solid ${t.border}`, padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${t.border}`, paddingBottom: 12, marginBottom: 16 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: ORANGE, borderBottom: `2.5px solid ${ORANGE}`, paddingBottom: 12, marginBottom: -14 }}>Vazifalar</span>
                    <span style={{ fontSize: 13, color: t.textMuted, fontWeight: 600 }}>Ball: 0</span>
                  </div>

                  {homeworks.length === 0 ? (
                    <p style={{ fontSize: 13.5, color: t.textMuted, margin: "8px 0" }}>Bu darsда uy vazifa berilmagan.</p>
                  ) : (
                    homeworks.map((h, i) => (
                      <div key={h.id ?? i} style={{ background: darkMode ? "#0f172a" : "#faf7f2", borderRadius: 10, padding: 18, marginBottom: 14 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                          <span style={{ fontSize: 16, fontWeight: 700, color: t.text }}>{h.title ?? "Uyga vazifa"}</span>
                          {dl && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#ef4444", color: "#fff", fontSize: 13, fontWeight: 600, padding: "8px 14px", borderRadius: 8 }}>
                              ⏱ Uyga vazifa muddati: {fmtDate(dl, true)}
                            </span>
                          )}
                          <span style={{ fontSize: 13, color: t.textMuted, fontWeight: 600 }}>Fayllar soni: {h.file ? 1 : 0}</span>
                        </div>
                        {h.file && (
                          <a href={lessonFileUrl(h.file)} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: PRIMARY, fontWeight: 600, textDecoration: "none" }}>
                            📎 Vazifa faylini yuklab olish
                          </a>
                        )}
                        <div style={{ textAlign: "right", fontSize: 12.5, color: t.textMuted, marginTop: 10 }}>
                          {fmtDate(h.created_at ?? lessonModal.created_at, true)}
                        </div>
                      </div>
                    ))
                  )}

                  {/* Mening jo'natmalarim */}
                  {homeworks.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: t.text }}>Mening jo&apos;natmalarim</span>
                        <span style={{ fontSize: 13, color: t.textMuted, fontWeight: 600 }}>Fayllar soni: {answerFile ? 1 : 0}</span>
                      </div>

                      {hwSubmitted ? (
                        /* Javob yuborilган — student javobини ko'rsatadi (backend uni qaytarmaydi) */
                        <div style={{ background: darkMode ? "#0f221a" : "#f0fdf4", border: `1px solid ${darkMode ? "#14532d" : "#bbf7d0"}`, borderRadius: 10, padding: 16, display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 20 }}>✅</span>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: darkMode ? "#4ade80" : "#16a34a", margin: 0 }}>Javobingiz yuborilган</p>
                            <p style={{ fontSize: 12.5, color: t.textMuted, margin: "2px 0 0" }}>O&apos;qituvchi tekshiradi. (Har vazifага bitta javob yuboriladi.)</p>
                          </div>
                        </div>
                      ) : (
                      <>
                      {/* Biriktirilган fayl ko'rsatkichи */}
                      {answerFile && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: t.text, marginBottom: 8 }}>
                          <AttachFileIcon style={{ fontSize: 16, color: PRIMARY }} />
                          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{answerFile.name}</span>
                          <button onClick={() => setAnswerFile(null)} style={{ border: "none", background: "none", cursor: "pointer", color: "#ef4444", fontSize: 16, lineHeight: 1 }}>×</button>
                        </div>
                      )}
                      {submitMsg && <p style={{ fontSize: 12.5, margin: "0 0 8px", color: submitMsg.startsWith("✓") ? "#16a34a" : "#ef4444" }}>{submitMsg}</p>}

                      {/* Chat uslubидаги input: izoh + fayl + yuborish */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1.5px solid ${t.border}`, borderRadius: 12, padding: "6px 6px 6px 16px", background: darkMode ? "#0f172a" : "#fff" }}>
                        <input
                          placeholder="Fayl biriktiring va izoh qoldiring"
                          value={answerTitle}
                          maxLength={1000}
                          onChange={(e) => setAnswerTitle(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter" && !submitting) submitAnswer(); }}
                          style={{ flex: 1, border: "none", outline: "none", fontSize: 14, background: "transparent", color: t.text }}
                        />
                        <button onClick={() => answerFileRef.current?.click()} title="Fayl biriktirish"
                          style={{ border: "none", background: "none", cursor: "pointer", color: t.textMuted, display: "flex", padding: 8, borderRadius: 8 }}>
                          <AttachFileIcon style={{ fontSize: 20 }} />
                        </button>
                        <button onClick={submitAnswer} disabled={submitting} title="Yuborish"
                          style={{ border: "none", background: submitting ? "#a78bfa" : PRIMARY, cursor: submitting ? "not-allowed" : "pointer", color: "#fff", display: "flex", padding: 9, borderRadius: 9 }}>
                          <SendIcon style={{ fontSize: 18 }} />
                        </button>
                      </div>
                      <input ref={answerFileRef} type="file" style={{ display: "none" }} onChange={(e) => setAnswerFile(e.target.files[0] || null)} />
                      <div style={{ textAlign: "right", fontSize: 12, color: t.textMuted, marginTop: 6 }}>{answerTitle.length} / 1000</div>
                      </>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ── O'NG: DARSLAR RO'YXATI ── */}
          <div style={{ flex: "0 0 320px", width: 320, maxHeight: "calc(100vh - 130px)", overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
            {lessons.map((l, i) => {
              const isActive = l.id === lessonModal.id;
              return (
                <button key={l.id ?? i} onClick={() => openLessonModal(l)}
                  style={{ textAlign: "left", background: t.card, border: `1.5px solid ${isActive ? ORANGE : t.border}`, borderRadius: 12, padding: "16px 18px", cursor: "pointer", transition: "border 0.15s" }}>
                  <p style={{ fontSize: 14.5, fontWeight: 700, color: isActive ? ORANGE : t.text, margin: "0 0 6px", lineHeight: 1.3 }}>{l.topic ?? "Dars"}</p>
                  <p style={{ fontSize: 12.5, color: t.textMuted, margin: 0 }}>Dars sanasi: {fmtDate(l.created_at ?? l.date)}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ══════════ DETAIL: UY VAZIFA STATUSI ══════════
  if (detailGroup) {
    const rows = lessons.map((l) => ({ ...l, _status: deriveStatus(l) }));
    const shown = statusFilter === "Barchasi" ? rows : rows.filter((r) => r._status.label === statusFilter);
    const filterOptions = ["Barchasi", "Qabul qilingan", "Qaytarilgan", "Bajarilmagan", "Berilmagan"];

    return (
      <div className="page-content" style={{ padding: "24px", fontFamily: "'Inter', sans-serif" }}>
        {/* Sarlavha + orqaga */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <button onClick={closeDetail}
            style={{ display: "flex", alignItems: "center", gap: 6, border: `1px solid ${t.border}`, background: t.card, color: t.text, borderRadius: 8, padding: "7px 12px", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
            <ArrowBackIcon style={{ fontSize: 17 }} /> Orqaga
          </button>
          <span style={{ fontSize: 15, fontWeight: 600, color: t.textMuted }}>{detailGroup.name}</span>
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 600, color: t.textMuted, margin: "18px 0 14px" }}>Uy vazifa statusi</h2>

        {/* Status filtri */}
        <div style={{ position: "relative", width: 260, marginBottom: 18 }}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: "100%", appearance: "none", WebkitAppearance: "none", padding: "12px 14px", paddingRight: 36, border: `1.5px solid ${ORANGE}`, borderRadius: 8, fontSize: 14, color: t.text, background: t.card, cursor: "pointer", outline: "none" }}>
            {filterOptions.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <KeyboardArrowDownIcon style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: t.textMuted }} />
        </div>

        {/* Jadval */}
        <div style={{ background: t.card, borderRadius: 10, border: `1px solid ${t.border}`, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: t.tableHead }}>
                  <th style={col}>Mavzular</th>
                  <th style={{ ...col, textAlign: "center" }}>Video</th>
                  <th style={col}>Uyga vazifa Holati</th>
                  <th style={col}>Uyga vazifa tugash vaqti</th>
                  <th style={col}>Dars sanasi</th>
                </tr>
              </thead>
              <tbody>
                {lessonsLoading && (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: "40px", color: t.textMuted, fontSize: 14 }}>Yuklanmoqda...</td></tr>
                )}
                {!lessonsLoading && shown.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: "40px", color: t.textMuted, fontSize: 14 }}>Darslar mavjud emas.</td></tr>
                )}
                {!lessonsLoading && shown.map((l, i) => {
                  const st = l._status;
                  const dl = hwDeadline(l);
                  return (
                    <tr key={l.id ?? i} style={{ borderTop: `1px solid ${t.border}`, cursor: "pointer" }}
                      onClick={() => openLessonModal(l)}
                      onMouseEnter={(e) => (e.currentTarget.style.background = t.bgHover)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <td style={{ ...cell, fontWeight: 500 }}>{l.topic ?? l.name ?? "—"}</td>
                      <td style={{ ...cell, textAlign: "center" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 30, height: 30, borderRadius: "50%", border: `1.5px solid ${PRIMARY}`, color: PRIMARY, fontSize: 12, fontWeight: 600 }}>
                          {videoCount(l)}
                        </span>
                      </td>
                      <td style={cell}>
                        <span style={{ display: "inline-block", background: st.bg, color: st.color, fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 6 }}>
                          {st.label}
                        </span>
                      </td>
                      <td style={{ ...cell, color: t.textMuted }}>{dl ? fmtDate(dl, true) : "-"}</td>
                      <td style={{ ...cell, color: t.textMuted }}>{fmtDate(l.created_at ?? l.date ?? l.lesson_date)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ══════════ RO'YXAT ══════════
  return (
    <div className="page-content" style={{ padding: "24px", fontFamily: "'Inter', sans-serif" }}>
      {/* Tab navigatsiyasi */}
      <div style={{ display: "flex", gap: 24, borderBottom: `1px solid ${t.border}`, marginBottom: 20 }}>
        {[{ key: "faol", label: "Faol" }, { key: "tugagan", label: "Tugagan" }].map(({ key, label }) => {
          const isActive = tab === key;
          return (
            <button key={key} onClick={() => setTab(key)}
              style={{ padding: "12px 10px", border: "none", borderBottom: isActive ? `2.5px solid ${ORANGE}` : "2.5px solid transparent", background: "none", cursor: "pointer", fontSize: 14, color: isActive ? ORANGE : t.textMuted, fontWeight: isActive ? 700 : 500, marginBottom: "-1.5px", transition: "all 0.15s ease" }}>
              {label}
            </button>
          );
        })}
      </div>

      {/* Jadval kartasi */}
      <div style={{ background: t.card, borderRadius: 8, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", overflow: "hidden", border: `1px solid ${t.border}` }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: t.tableHead }}>
                <th style={{ ...col, width: 60 }}>#</th>
                <th style={col}>Guruh nomi</th>
                <th style={col}>Yo&apos;nalishi</th>
                <th style={col}>O&apos;qituvchi</th>
                <th style={col}>Boshlash vaqti</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "40px", color: t.textMuted, fontSize: 14 }}>Yuklanmoqda...</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "40px", color: t.textMuted, fontSize: 14 }}>Guruhlar mavjud emas.</td></tr>
              )}
              {!loading && filtered.map((g, idx) => (
                <tr key={g.id}
                  onClick={() => openDetail(g)}
                  style={{ transition: "background .15s ease", borderTop: `1px solid ${t.border}`, cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = t.bgHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ ...cell, fontWeight: 700 }}>{idx + 1}</td>
                  <td style={{ ...cell, fontWeight: 500 }}>{g.name}</td>
                  <td style={{ ...cell, color: t.textMuted }}>{g.kurs}</td>
                  <td style={{ ...cell }}
                    onClick={(e) => { e.stopPropagation(); openTeacherModal(g); }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: ORANGE, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, boxShadow: "0 2px 5px rgba(124,58,237,0.3)" }}>
                        {(g.oqituvchi?.[0] ?? "M").toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 500, color: PRIMARY }}>{g.oqituvchi}</span>
                    </div>
                  </td>
                  <td style={{ ...cell }}>{g.boshlash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* O'qituvchilar Modali */}
      {teacherModalOpen && selectedGroup && (
        <>
          <div onClick={closeTeacherModal} style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(0,0,0,0.35)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "100%", maxWidth: "750px", background: t.card, borderRadius: "8px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", overflow: "hidden", border: `1px solid ${t.border}`, padding: "40px", zIndex: 410 }}
            onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: "26px", fontWeight: 700, color: t.text, margin: "0 0 12px 0" }}>{selectedGroup.name}</h2>
            <p style={{ fontSize: "15px", fontWeight: 500, color: selectedGroup.active ? "#4b5563" : t.textMuted, margin: "0 0 32px 0" }}>{selectedGroup.active ? "Faol" : "Tugagan"}</p>
            <div style={{ border: `1.5px solid ${t.border}`, borderRadius: "6px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: t.tableHead }}>
                    <th style={{ ...col, padding: "14px 20px" }}>O&apos;qituvchi</th>
                    <th style={{ ...col, padding: "14px 20px" }}>Roli</th>
                    <th style={{ ...col, padding: "14px 20px" }}>Dars kunlari</th>
                    <th style={{ ...col, padding: "14px 20px" }}>Dars vaqti</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedGroup.teachers.length === 0 && (
                    <tr><td colSpan={4} style={{ ...cell, padding: "20px", textAlign: "center", color: t.textMuted }}>
                      {selectedGroup.teacherCount > 0 ? `${selectedGroup.teacherCount} ta o'qituvchi (ma'lumot mavjud emas)` : "O'qituvchi biriktirilmagan"}
                    </td></tr>
                  )}
                  {selectedGroup.teachers.map((teacher, idx) => (
                    <tr key={idx} style={{ borderTop: `1.5px solid ${t.border}` }}>
                      <td style={{ ...cell, padding: "14px 20px", fontWeight: 500 }}>{teacher.name}</td>
                      <td style={{ ...cell, padding: "14px 20px" }}>{teacher.role}</td>
                      <td style={{ ...cell, padding: "14px 20px" }}>{teacher.days}</td>
                      <td style={{ ...cell, padding: "14px 20px" }}>{teacher.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
