import { useState, useEffect, useRef } from "react";
import api from "../../api/axios";
import { videoUrl as buildVideoUrl, getPhotoUrl } from "../../api/fileUrl";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BarChartIcon from "@mui/icons-material/BarChart";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";
import LinkIcon from "@mui/icons-material/Link";
import StrikethroughSIcon from "@mui/icons-material/StrikethroughS";
import CodeIcon from "@mui/icons-material/Code";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";

const PRIMARY = "#7c3aed";

const TALABALAR_LIST  = ["Ali Valiyev", "Salim Qodirov", "Bobur", "Qodir Salimov"];
const OQITUVCHILAR_LIST = ["Mohirbek", "Jasur", "Dilnoza", "Sarvar", "Bahodir"];
const KUNLAR = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"];
const KURS_LIST = ["Frontend", "Backend", "Full Stack", "Mobile Dev", "Data Science"];
const XONA_LIST = ["Autodesk", "Room 1", "Room 2", "Online", "Main Hall"];
const MAVZU_LIST = ["Html asoslari", "CSS asoslari", "JavaScript", "React", "Node.js", "Kirish", "Takrorlash"];
const AVATAR_COLORS = ["#ef4444", "#f59e0b", "#3b82f6"];

const INIT_GROUPS = [
  { id: 1, active: true,  name: "Bootcamp Full Stack N26",  kurs: "Backend", davomiyligi: "6 oy", vaqt: "09:30", kunlar: ["Du","Se","Chor","Pay","Ju"], xona: "F2 Autodesk", oqituvchi: "Mohirbek", talabalar: 5 },
  { id: 2, active: true,  name: "n105", kurs: "Backend", davomiyligi: "6 oy", vaqt: "16:00", kunlar: ["Se","Pay","Shan"], xona: "Autodesk", oqituvchi: "Mohirbek", talabalar: 4 },
];

const INIT_VIDEOS = [
  { id: 1, fileName: "Bitiruv.mp4", darsNomi: "Nodejs",         status: "Tayyor", darsSana: "14 May, 2026", hajmi: "3.53 MB", qoshilgan: "18 May, 2026" },
  { id: 2, fileName: "Bitiruv.mp4", darsNomi: "Html asoslari",  status: "Tayyor", darsSana: "12 May, 2026", hajmi: "3.53 MB", qoshilgan: "18 May, 2026" },
  { id: 3, fileName: "Bitiruv.mp4", darsNomi: "takrorlash",     status: "Tayyor", darsSana: "19 May, 2026", hajmi: "3.53 MB", qoshilgan: "19 May, 2026" },
  { id: 4, fileName: "Bitiruv.mp4", darsNomi: "State and Props", status: "Tayyor", darsSana: "21 May, 2026", hajmi: "3.53 MB", qoshilgan: "21 May, 2026" },
];

const INIT_HOMEWORKS = [
  { id: 1, mavzu: "Html asoslari",  talabalar: 5, vaqt: 0, bajarildi: 0, berilgan: "13 May, 2026 10:00", tugash: "14 May, 2026 06:00", sana: "12 May, 2026" },
  { id: 2, mavzu: "Kirish",         talabalar: 5, vaqt: 0, bajarildi: 0, berilgan: "13 May, 2026 11:52", tugash: "14 May, 2026 07:52", sana: "9 May, 2026" },
  { id: 3, mavzu: "Nodejs",         talabalar: 5, vaqt: 0, bajarildi: 3, berilgan: "14 May, 2026 09:47", tugash: "15 May, 2026 05:47", sana: "14 May, 2026" },
  { id: 4, mavzu: "takrorlash",     talabalar: 5, vaqt: 0, bajarildi: 0, berilgan: "19 May, 2026 16:22", tugash: "20 May, 2026 12:22", sana: "19 May, 2026" },
];

const JADVAL_DATA = [
  { mentor: "Mohirbek",          kunlar: "Du/Se/Ch/Pa/Ju", vaqt: "09:30 dan - 12:30 gacha", sana: "15 Yan, 2026 - 27 Iyun, 2026", xona: "F2 Autodesk // 18" },
  { mentor: "+++Yusupova Barchinoy", kunlar: "Du/Se/Ch/Pa/Ju", vaqt: "08:00 dan - 09:30 gacha", sana: "15 Yan, 2026 - 27 Iyun, 2026", xona: "F2 Autodesk // 18" },
];

const CALENDAR_DATES = [
  { month: "May", day: 2, past: true }, { month: "May", day: 5, past: true },
  { month: "May", day: 7, past: true }, { month: "May", day: 9, past: true },
  { month: "May", day: 12, past: true }, { month: "May", day: 14, past: true },
  { month: "May", day: 16, past: true }, { month: "May", day: 19, past: false },
  { month: "May", day: 21, past: false }, { month: "May", day: 23, past: false },
  { month: "May", day: 26, past: false }, { month: "May", day: 28, past: false },
  { month: "May", day: 30, past: false },
];

/* ─── Toggle ─── */
/* ─── Grade Slider ─── */
function GradeSlider({ value, onChange }) {
  const pct = value;
  const dots = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  return (
    <div style={{ position: "relative", height: 36, display: "flex", alignItems: "center" }}>
      {/* Track container */}
      <div style={{ position: "absolute", left: 0, right: 0, height: 10, borderRadius: 99, overflow: "visible" }}>
        {/* Gray bg */}
        <div style={{ position: "absolute", inset: 0, borderRadius: 99, background: "#d1d5db" }} />
        {/* Green fill */}
        <div style={{ position: "absolute", top: 0, left: 0, width: `${pct}%`, bottom: 0, borderRadius: 99, background: "linear-gradient(to right, #4ade80, #16a34a)" }} />
        {/* Dots on both portions */}
        {dots.map((d) => (
          <div key={d} style={{
            position: "absolute", top: "50%", left: `${d}%`,
            transform: "translate(-50%, -50%)",
            width: 6, height: 6, borderRadius: "50%",
            background: "rgba(255,255,255,0.85)",
            pointerEvents: "none", zIndex: 1,
          }} />
        ))}
      </div>
      {/* Thumb */}
      <div style={{
        position: "absolute",
        left: `${pct}%`,
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: 24, height: 24,
        borderRadius: "50%",
        background: "#fff",
        boxShadow: "0 2px 10px rgba(0,0,0,.18)",
        border: "2px solid #e5e7eb",
        zIndex: 2,
        pointerEvents: "none",
      }} />
      {/* Hidden native input */}
      <input
        type="range" min={0} max={100} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          opacity: 0, cursor: "pointer", zIndex: 3, margin: 0,
        }}
      />
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <div onClick={onChange} style={{ width: 38, height: 22, borderRadius: 11, background: on ? PRIMARY : "#d1d5db", position: "relative", cursor: "pointer", transition: "background .2s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 3, left: on ? 19 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
    </div>
  );
}

/* ─── Stat card ─── */
function StatCard({ icon: Icon, label, value, avatars }) {
  return (
    <div style={{ flex: 1, background: "var(--card, #fff)", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,.06)", display: "flex", flexDirection: "column", gap: 6, position: "relative", minWidth: 180 }}>
      <button style={{ position: "absolute", top: 14, right: 14, border: "none", background: "none", cursor: "pointer", color: "var(--text-muted, #9ca3af)", padding: 2 }}>
        <MoreVertIcon style={{ fontSize: 18 }} />
      </button>
      <Icon style={{ fontSize: 26, color: "var(--text-muted, #9ca3af)" }} />
      <span style={{ fontSize: 12, color: "var(--text-muted, #9ca3af)" }}>{label}</span>
      <span style={{ fontSize: 26, fontWeight: 800, color: "var(--text, #111)" }}>{value}</span>
      {avatars && (
        <div style={{ display: "flex", marginTop: 4 }}>
          {avatars.map((c, i) => (
            <div key={i} style={{ width: 24, height: 24, borderRadius: "50%", background: c, border: "2px solid var(--card, #fff)", marginLeft: i === 0 ? 0 : -6, zIndex: avatars.length - i }} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Day checkbox ─── */
function DayCB({ label, checked, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "6px 0" }}>
      <div onClick={onChange} style={{ width: 18, height: 18, borderRadius: 4, border: checked ? "none" : "1.5px solid #d1d5db", backgroundColor: checked ? PRIMARY : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s", cursor: "pointer" }}>
        {checked && <svg width="10" height="10" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
      </div>
      <span style={{ fontSize: 13, color: "#374151" }}>{label}</span>
    </label>
  );
}

function FInput({ label, required, children }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputSx = { width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", color: "var(--text, #111)", background: "var(--input-bg, #fff)" };
const focusBorder = (e) => (e.target.style.border = `1.5px solid ${PRIMARY}`);
const blurBorder  = (e) => (e.target.style.border = "1.5px solid #e5e7eb");

/* ════════════════════ HOMEWORK CREATE ════════════════════ */
function HomeworkCreate({ onBack, groupId }) {
  const fileRef = useRef(null);
  const [lessonId, setLessonId] = useState("");
  const [izoh, setIzoh] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [groupLessons, setGroupLessons] = useState([]);

  useEffect(() => {
    api.get(`/lessons/my/group/${groupId}`)
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setGroupLessons(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
  }, [groupId]);

  const handleFile = (file) => { if (file) setSelectedFile(file); };

  const handleSubmit = async () => {
    if (!lessonId) { setError("Mavzuni tanlang"); return; }
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("lesson_id", lessonId);
      fd.append("group_id", groupId);
      fd.append("title", groupLessons.find((l) => String(l.id) === String(lessonId))?.topic ?? "Uy vazifa");
      if (izoh.trim()) fd.append("description", izoh);
      if (selectedFile) fd.append("file", selectedFile);
      await api.post("/homework", fd, { headers: { "Content-Type": "multipart/form-data" } });
      onBack();
    } catch (err) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(", ") : (msg ?? "Xatolik yuz berdi"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <button onClick={onBack} style={{ border: "none", background: "none", cursor: "pointer", color: "#374151", display: "flex", padding: 4 }}>
          <ArrowBackIcon style={{ fontSize: 22 }} />
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text, #111)", margin: 0, letterSpacing: "-0.4px" }}>Yangi uyga vazifa yaratish</h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 620 }}>
        {/* Mavzu */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text, #111)", display: "block", marginBottom: 8 }}>
            <span style={{ color: "#ef4444" }}>*</span> Mavzu
          </label>
          <div style={{ position: "relative" }}>
            <select value={lessonId} onChange={(e) => setLessonId(e.target.value)}
              style={{ ...inputSx, appearance: "none", WebkitAppearance: "none", paddingRight: 36, cursor: "pointer", fontSize: 14 }}
              onFocus={focusBorder} onBlur={blurBorder}>
              <option value="">Mavzulardan birini tanlang</option>
              {groupLessons.map((l) => <option key={l.id} value={l.id}>{l.topic}</option>)}
            </select>
            <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }}>▼</span>
          </div>
        </div>

        {/* Izoh */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text, #111)", display: "block", marginBottom: 8 }}>
            <span style={{ color: "#ef4444" }}>*</span> Izoh
          </label>
          <textarea
            value={izoh}
            onChange={(e) => setIzoh(e.target.value)}
            placeholder="Vazifa haqida batafsil ma'lumot kiriting..."
            rows={5}
            style={{ ...inputSx, resize: "vertical", fontFamily: "inherit", lineHeight: 1.7 }}
            onFocus={focusBorder}
            onBlur={blurBorder}
          />
        </div>

        {/* File upload */}
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          style={{ border: `2px dashed ${dragOver ? "#16a34a" : "#d1d5db"}`, borderRadius: 12, padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, background: dragOver ? "#f0fdf4" : "#fafafa", transition: "all 0.2s", cursor: "pointer" }}>
          <CloudUploadIcon style={{ fontSize: 38, color: "#7c3aed" }} />
          {selectedFile ? (
            <p style={{ fontSize: 14, fontWeight: 600, color: "#16a34a", margin: 0 }}>{selectedFile.name}</p>
          ) : (
            <p style={{ fontSize: 14, color: "#9ca3af", margin: 0 }}>Faylni tanlash yoki shu yerga tashlang</p>
          )}
        </div>
        <input ref={fileRef} type="file" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />

        {/* Footer buttons */}
        {error && <p style={{ fontSize: 12, color: "#ef4444", margin: 0 }}>{error}</p>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 8 }}>
          <button onClick={onBack} style={{ padding: "10px 28px", border: "1.5px solid #e5e7eb", borderRadius: 8, background: "var(--card, #fff)", fontSize: 13, cursor: "pointer", color: "var(--text, #374151)", fontWeight: 500 }}>
            Bekor qilish
          </button>
          <button onClick={handleSubmit} disabled={saving}
            style={{ padding: "10px 28px", border: "none", borderRadius: 8, background: saving ? "#86efac" : "#16a34a", color: "#fff", fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", boxShadow: "0 3px 10px rgba(22,163,74,0.3)" }}>
            {saving ? "Yuklanmoqda..." : "E'lon qilish"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════ IMTIHON CREATE ════════════════════ */
function ImtihonCreate({ onBack, groupId }) {
  const fileRef = useRef(null);
  const [lessonId, setLessonId] = useState("");
  const [izoh, setIzoh] = useState("");
  const [tugashSana, setTugashSana] = useState("");
  const [tugashVaqt, setTugashVaqt] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [groupLessons, setGroupLessons] = useState([]);

  useEffect(() => {
    api.get(`/lessons/my/group/${groupId}`)
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setGroupLessons(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
  }, [groupId]);

  const handleFile = (file) => { if (file) setSelectedFile(file); };

  const handleSubmit = async () => {
    if (!lessonId) { setError("Mavzuni tanlang"); return; }
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("lesson_id", lessonId);
      fd.append("group_id", groupId);
      fd.append("title", groupLessons.find((l) => String(l.id) === String(lessonId))?.topic ?? "Imtihon");
      if (izoh.trim()) fd.append("description", izoh);
      if (tugashSana) fd.append("deadline", `${tugashSana}T${tugashVaqt || "23:59"}:00`);
      if (selectedFile) fd.append("file", selectedFile);
      await api.post("/homework", fd, { headers: { "Content-Type": "multipart/form-data" } });
      onBack();
    } catch (err) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(", ") : (msg ?? "Xatolik yuz berdi"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <button onClick={onBack} style={{ border: "none", background: "none", cursor: "pointer", color: "#374151", display: "flex", padding: 4 }}>
          <ArrowBackIcon style={{ fontSize: 22 }} />
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text, #111)", margin: 0, letterSpacing: "-0.4px" }}>Imtihon yaratish</h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 620 }}>
        {/* Mavzu */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text, #111)", display: "block", marginBottom: 8 }}>
            <span style={{ color: "#ef4444" }}>*</span> Mavzu
          </label>
          <div style={{ position: "relative" }}>
            <select value={lessonId} onChange={(e) => setLessonId(e.target.value)}
              style={{ ...inputSx, appearance: "none", WebkitAppearance: "none", paddingRight: 36, cursor: "pointer", fontSize: 14 }}
              onFocus={focusBorder} onBlur={blurBorder}>
              <option value="">Mavzulardan birini tanlang</option>
              {groupLessons.map((l) => <option key={l.id} value={l.id}>{l.topic}</option>)}
            </select>
            <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }}>▼</span>
          </div>
        </div>

        {/* Izoh */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text, #111)", display: "block", marginBottom: 8 }}>
            <span style={{ color: "#ef4444" }}>*</span> Izoh
          </label>
          <textarea
            value={izoh}
            onChange={(e) => setIzoh(e.target.value)}
            placeholder="Imtihon haqida batafsil ma'lumot kiriting..."
            rows={5}
            style={{ ...inputSx, resize: "vertical", fontFamily: "inherit", lineHeight: 1.7 }}
            onFocus={focusBorder}
            onBlur={blurBorder}
          />
        </div>

        {/* Tugash sanasi va vaqti */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text, #111)", display: "block", marginBottom: 8 }}>
              <span style={{ color: "#ef4444" }}>*</span> Tugash sanasi
            </label>
            <input type="date" value={tugashSana} onChange={(e) => setTugashSana(e.target.value)}
              style={inputSx} onFocus={focusBorder} onBlur={blurBorder} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text, #111)", display: "block", marginBottom: 8 }}>
              <span style={{ color: "#ef4444" }}>*</span> Tugash vaqti
            </label>
            <input type="time" value={tugashVaqt} onChange={(e) => setTugashVaqt(e.target.value)}
              style={inputSx} onFocus={focusBorder} onBlur={blurBorder} />
          </div>
        </div>

        {/* File upload */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text, #111)", display: "block", marginBottom: 8 }}>Fayllar</label>
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            style={{ border: `2px dashed ${dragOver ? "#16a34a" : "#d1d5db"}`, borderRadius: 12, padding: "28px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, background: dragOver ? "#f0fdf4" : "#fafafa", transition: "all 0.2s", cursor: "pointer" }}>
            <CloudUploadIcon style={{ fontSize: 34, color: "#7c3aed" }} />
            {selectedFile ? (
              <p style={{ fontSize: 14, fontWeight: 600, color: "#16a34a", margin: 0 }}>{selectedFile.name}</p>
            ) : (
              <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Faylni tanlash yoki shu yerga tashlang</p>
            )}
          </div>
          <input ref={fileRef} type="file" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />
        </div>

        {/* Footer */}
        {error && <p style={{ fontSize: 12, color: "#ef4444", margin: 0 }}>{error}</p>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 8 }}>
          <button onClick={onBack} style={{ padding: "10px 28px", border: "1.5px solid #e5e7eb", borderRadius: 8, background: "var(--card, #fff)", fontSize: 13, cursor: "pointer", color: "var(--text, #374151)", fontWeight: 500 }}>
            Bekor qilish
          </button>
          <button onClick={handleSubmit} disabled={saving}
            style={{ padding: "10px 28px", border: "none", borderRadius: 8, background: saving ? "#86efac" : "#16a34a", color: "#fff", fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", boxShadow: "0 3px 10px rgba(22,163,74,0.3)" }}>
            {saving ? "Yuklanmoqda..." : "E'lon qilish"}
          </button>
        </div>
      </div>
    </div>
  );
}

const STUDENTS = [
  { id: 1, name: "Ali Valiyev" },
  { id: 2, name: "Salim Qodirov" },
  { id: 3, name: "Bobur" },
  { id: 4, name: "Qodir Salimov" },
  { id: 5, name: "Salima Qodirova" },
];

/* ════════════════════ LESSON DETAIL ════════════════════ */
function LessonDetail({ date, group, students = [], teachers = [], onBack }) {
  const [activeRole, setActiveRole] = useState("Teacher");
  const [mavzuType, setMavzuType] = useState("boshqa");
  const [mavzu, setMavzu] = useState("");
  const [tavsif, setTavsif] = useState("");
  const [attendance, setAttendance] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  const toggleAttend = (id) => setAttendance((p) => ({ ...p, [id]: !p[id] }));

  const MONTH_NUM = { January:"01", February:"02", March:"03", April:"04", May:"05", June:"06", July:"07", August:"08", September:"09", October:"10", November:"11", December:"12" };

  useEffect(() => {
    const mm = MONTH_NUM[date.month] ?? "01";
    const dd = String(date.day).padStart(2, "0");
    const dateStr = `2026-${mm}-${dd}`;

    // Mavzu va tavsifni yuklash
    api.get(`/groups/${group.id}/lesson`, { params: { date: dateStr } })
      .then((res) => {
        const d = res.data?.data ?? res.data;
        if (d?.topic) setMavzu(d.topic);
        if (d?.description) setTavsif(d.description);
      })
      .catch(() => {});

    // Avvalgi davomat — shu guruhning eng so'nggi yozuvlarini olish
    api.get("/attendance/all")
      .then((res) => {
        const data = res.data?.data ?? res.data;
        if (!Array.isArray(data)) return;
        // Shu guruh uchun barcha yozuvlar, vaqt bo'yicha tartiblash
        const map = {};
        data
          .filter((a) => Number(a.group_id) === Number(group.id))
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          .forEach((a) => {
            // Har talaba uchun oxirgi yozuv ustunlik qiladi
            map[a.student_id] = a.isPresent;
          });
        if (Object.keys(map).length > 0) setAttendance(map);
      })
      .catch(() => {});
  }, [group.id, date.day, date.month]);

  const handleSave = async () => {
    if (!mavzu.trim()) { setSaveError("Mavzuni kiriting"); return; }
    setSaving(true);
    setSaveError("");
    try {
      // 1. Dars mavzusi saqlash
      await api.post("/lessons", {
        group_id: group.id,
        topic: mavzu,
        description: tavsif,
      });

      // 2. Davomat — barcha talabalar uchun (toggle qilinmagan = false)
      if (students.length > 0) {
        const results = await Promise.allSettled(
          students.map((s) =>
            api.post("/attendance", {
              group_id: group.id,
              student_id: s.id,
              isPresent: attendance[s.id] === true,
            })
          )
        );
        const failed = results.filter((r) => r.status === "rejected");
        if (failed.length === students.length) {
          const msg = failed[0].reason?.response?.data?.message;
          setSaveError(Array.isArray(msg) ? msg.join(", ") : "Davomat saqlashda xatolik");
          setSaving(false);
          return;
        }
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      const msg = err?.response?.data?.message;
      setSaveError(Array.isArray(msg) ? msg.join(", ") : (msg ?? "Saqlashda xatolik yuz berdi"));
    } finally {
      setSaving(false);
    }
  };

  const dateLabel = `${date.month} ${date.day}`;
  const fullDate = `2026 ${date.month.toUpperCase().slice(0,3)} ${String(date.day).padStart(2,"0")}`;

  return (
    <div className="page-content">
      {/* Back */}
      <button onClick={onBack} style={{ border: "none", background: "none", cursor: "pointer", color: "#374151", display: "flex", alignItems: "center", gap: 6, padding: "4px 0", marginBottom: 16, fontSize: 13, fontWeight: 500 }}>
        <ArrowBackIcon style={{ fontSize: 20 }} /> Orqaga
      </button>

      {/* Calendar strip */}
      <div style={{ background: "var(--card, #fff)", borderRadius: 14, padding: "16px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <button style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af", display: "flex", padding: 4 }}><ChevronLeftIcon style={{ fontSize: 18 }} /></button>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text, #111)" }}>1-o&apos;quv oyi</span>
          <button style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af", display: "flex", padding: 4 }}><ChevronRightIcon style={{ fontSize: 18 }} /></button>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {CALENDAR_DATES.map((d, i) => {
            const isSelected = d.day === date.day && d.month === date.month;
            return (
              <div key={i} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                background: isSelected ? "#16a34a" : d.past ? "#f3f4f6" : "#fff",
                border: `1.5px solid ${isSelected ? "#16a34a" : "#e5e7eb"}`,
                borderRadius: 8, padding: "6px 10px", minWidth: 44,
                opacity: d.past && !isSelected ? 0.55 : 1, cursor: "pointer",
              }}>
                <span style={{ fontSize: 10, color: isSelected ? "#fff" : "#9ca3af", fontWeight: 500 }}>{d.month}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? "#fff" : d.past ? "#9ca3af" : "#111" }}>{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Role tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #e5e7eb", marginBottom: 20 }}>
        {["Assistant", "Teacher"].map((role) => (
          <button key={role} onClick={() => setActiveRole(role)}
            style={{ padding: "10px 20px", border: "none", borderBottom: activeRole === role ? "2.5px solid #16a34a" : "2.5px solid transparent", background: "none", cursor: "pointer", fontSize: 14, color: activeRole === role ? "#16a34a" : "#6b7280", fontWeight: activeRole === role ? 700 : 500, marginBottom: "-2px" }}>
            {role}
          </button>
        ))}
      </div>

      {/* Ma'lumot card */}
      {(() => {
        const displayTeachers = teachers.length > 0
          ? teachers
          : (group.oqituvchi && group.oqituvchi !== "—" ? [{ full_name: group.oqituvchi }] : []);
        const shown = displayTeachers.filter((t) => activeRole === "Teacher" ? (t.role !== "ASSISTANT") : (t.role === "ASSISTANT"));
        const list = shown.length > 0 ? shown : displayTeachers;
        return (
      <div style={{ background: "var(--card, #fff)", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 20 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text, #111)", marginBottom: 14 }}>Ma&apos;lumot</p>
        {list.length === 0 ? (
          <p style={{ fontSize: 13, color: "#9ca3af" }}>O&apos;qituvchi biriktirilmagan</p>
        ) : list.map((t, ti) => {
          const name = t.fullName ?? t.full_name ?? t.name ?? "—";
          const initial = name[0]?.toUpperCase() ?? "?";
          return (
        <div key={ti} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: ti < list.length - 1 ? 12 : 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
            {initial}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "var(--text, #111)" }}>{name}</p>
            <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>{t.role ?? activeRole}</p>
          </div>
          <div style={{ marginLeft: 32 }}>
            <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>Dars kuni</p>
            <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 700, color: "var(--text, #111)" }}>{fullDate}</p>
          </div>
          <div style={{ marginLeft: 24 }}>
            <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>Holat</p>
            {(() => {
              const isHeld = saved || mavzu.trim().length > 0 || Object.keys(attendance).some((k) => attendance[k]);
              return (
                <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 600, color: isHeld ? "#16a34a" : (date.past ? "#9ca3af" : "#ef4444") }}>
                  {isHeld ? "Dars o’tildi ✓" : (date.past ? "Dars o’tilmagan" : "Dars kelmagan")}
                </p>
              );
            })()}
          </div>
        </div>
        );
        })}
      </div>
        );
      })()}

      {/* Yo'qlama va mavzu */}
      <div style={{ background: "var(--card, #fff)", borderRadius: 14, padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 20 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text, #111)", marginBottom: 16 }}>Yo&apos;qlama va mavzu kiritish</p>

        {/* Radio */}
        <div style={{ display: "flex", gap: 24, marginBottom: 18 }}>
          {[{ key: "reja", label: "O'quv reja bo'yicha" }, { key: "boshqa", label: "Boshqa" }].map(({ key, label }) => (
            <label key={key} onClick={() => setMavzuType(key)}
              style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: mavzuType === key ? "#16a34a" : "#6b7280", fontWeight: mavzuType === key ? 600 : 400 }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${mavzuType === key ? "#16a34a" : "#d1d5db"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {mavzuType === key && <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#16a34a" }} />}
              </div>
              {label}
            </label>
          ))}
        </div>

        {/* Mavzu */}
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#ef4444", marginBottom: 6 }}>* Mavzu</p>
          <input value={mavzu} onChange={(e) => setMavzu(e.target.value)} placeholder="Mavzuni kiriting..."
            style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", color: "var(--text, #111)" }}
            onFocus={(e) => (e.target.style.border = "1.5px solid #16a34a")}
            onBlur={(e) => (e.target.style.border = "1.5px solid #e5e7eb")} />
        </div>

        {/* Tavsif */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Tavsif (ixtiyoriy)</p>
          <textarea value={tavsif} onChange={(e) => setTavsif(e.target.value)} placeholder="Dars haqida qo'shimcha ma'lumot..." rows={3}
            style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", color: "var(--text, #111)", resize: "vertical", fontFamily: "inherit" }}
            onFocus={(e) => (e.target.style.border = "1.5px solid #16a34a")}
            onBlur={(e) => (e.target.style.border = "1.5px solid #e5e7eb")} />
        </div>

        {/* Students attendance table */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1.5px solid #f0f0f0" }}>
              <th style={{ width: 40, padding: "10px 14px", textAlign: "left", fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>#</th>
              <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, color: "#7c3aed", fontWeight: 600 }}>O&apos;quvchi ismi</th>
              <th style={{ padding: "10px 14px", textAlign: "right", fontSize: 12, color: "#7c3aed", fontWeight: 600 }}>Keldi</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                <td style={{ padding: "14px 14px", fontSize: 13, color: "#9ca3af" }}>{i + 1}</td>
                <td style={{ padding: "14px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#d1d5db", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#6b7280", flexShrink: 0 }}>
                      {s.name[0]}
                    </div>
                    <span style={{ fontSize: 14, color: "var(--text, #111)", fontWeight: 500 }}>{s.name}</span>
                  </div>
                </td>
                <td style={{ padding: "14px 14px", textAlign: "right" }}>
                  <div onClick={() => toggleAttend(s.id)}
                    style={{ width: 42, height: 24, borderRadius: 12, background: attendance[s.id] ? "#16a34a" : "#d1d5db", position: "relative", cursor: "pointer", transition: "background .2s", marginLeft: "auto" }}>
                    <div style={{ position: "absolute", top: 3, left: attendance[s.id] ? 21 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Save */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12 }}>
        {saveError && <span style={{ fontSize: 13, color: "#ef4444", fontWeight: 500 }}>{saveError}</span>}
        {saved && <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 500 }}>Dars va davomat saqlandi ✓</span>}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ padding: "11px 32px", border: "none", borderRadius: 10, background: saving ? "#a78bfa" : PRIMARY, color: "#fff", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", boxShadow: "0 3px 12px rgba(124,58,237,0.3)", transition: "background 0.15s" }}>
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </div>
    </div>
  );
}

/* ════════════════════ GROUP DETAIL ════════════════════ */
function GroupDetail({ group: initialGroup, onBack }) {
  const [group, setGroup] = useState(initialGroup);
  const [groupStudents, setGroupStudents] = useState([]);
  const [detailTab, setDetailTab] = useState(() => sessionStorage.getItem("guruhlar_detailTab") || "malumotlar");
  const [darsliklarTab, setDarsliklarTab] = useState(() => sessionStorage.getItem("guruhlar_darsliklarTab") || "uyga_vazifa");

  useEffect(() => { sessionStorage.setItem("guruhlar_detailTab", detailTab); }, [detailTab]);
  useEffect(() => { sessionStorage.setItem("guruhlar_darsliklarTab", darsliklarTab); }, [darsliklarTab]);
  const [showCreate, setShowCreate] = useState(false);
  const [showImtihonCreate, setShowImtihonCreate] = useState(false);
  const [homeworks, setHomeworks] = useState([]);
  const [homeworksLoading, setHomeworksLoading] = useState(false);
  const [hwDrawer, setHwDrawer] = useState(false);
  const [hwForm, setHwForm] = useState({ lesson_id: "", title: "", file: null });
  const [hwSaving, setHwSaving] = useState(false);
  const [hwResultModal, setHwResultModal] = useState({ open: false, hw: null, results: [], loading: false });
  const [hwView, setHwView] = useState(null);
  const [hwStudentView, setHwStudentView] = useState(null);
  const [examList, setExamList]           = useState([]);
  const [examListLoading, setExamListLoading] = useState(false);
  const [examView, setExamView]           = useState(null);
  const [gradeModal, setGradeModal]       = useState(null);
  const [groupFiles, setGroupFiles]       = useState([]);
  const [filesLoading, setFilesLoading]   = useState(false);
  const [uploadLessonId, setUploadLessonId] = useState("");
  const [uploading, setUploading]         = useState(false);
  const [videoPlayer, setVideoPlayer]     = useState(null);

  useEffect(() => {
    if (darsliklarTab !== "uyga_vazifa") return;
    let cancelled = false;
    setHomeworksLoading(true);
    api.get(`/homework/${initialGroup.id}`)
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.data ?? res.data;
        setHomeworks(Array.isArray(data) ? data : []);
        setHomeworksLoading(false);
      })
      .catch(() => { if (!cancelled) setHomeworksLoading(false); });
    return () => { cancelled = true; };
  }, [initialGroup.id, darsliklarTab]);

  useEffect(() => {
    if (darsliklarTab !== "videolar") return;
    let cancelled = false;
    setFilesLoading(true);
    api.get(`/files/${initialGroup.id}`)
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.data ?? res.data;
        setGroupFiles(Array.isArray(data) ? data : []);
        setFilesLoading(false);
      })
      .catch(() => { if (!cancelled) setFilesLoading(false); });
    return () => { cancelled = true; };
  }, [initialGroup.id, darsliklarTab]);

  useEffect(() => {
    if (darsliklarTab !== "imtihonlar") return;
    let cancelled = false;
    setExamListLoading(true);
    api.get("/homework/all")
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.data ?? res.data;
        const filtered = (Array.isArray(data) ? data : []).filter(
          (h) => Number(h.group_id) === Number(initialGroup.id)
        );
        setExamList(filtered);
        setExamListLoading(false);
      })
      .catch(() => { if (!cancelled) setExamListLoading(false); });
    return () => { cancelled = true; };
  }, [initialGroup.id, darsliklarTab]);

  const parseExamStudents = (res, isFiltersiz = false) => {
    const d = res.data?.data ?? res.data;
    if (isFiltersiz) {
      return Array.isArray(d) ? d.map((s) => ({ ...s, name: s.full_name ?? s.name })) : [];
    }
    return Array.isArray(d?.students) ? d.students : Array.isArray(d) ? d : [];
  };

  const openExamDetail = (exam) => {
    // Kutayotganlar: ?status=PENDING
    setExamView({ exam, statusTab: "PENDING", results: [], resultsLoading: true });
    api.get(`/group/${initialGroup.id}/homework/${exam.id}/results`, { params: { status: "PENDING" } })
      .then((res) => {
        setExamView((p) => ({ ...p, results: parseExamStudents(res, false), resultsLoading: false }));
      })
      .catch(() => setExamView((p) => ({ ...p, resultsLoading: false })));
  };

  const fetchExamResults = (status) => {
    setExamView((p) => ({ ...p, statusTab: status, results: [], resultsLoading: true }));

    if (status === "NOT_SUBMITTED") {
      // Bajarilmagan: filtersiz → topshirmaganlar
      api.get(`/group/${initialGroup.id}/homework/${examView?.exam?.id}/results`)
        .then((res) => {
          setExamView((p) => ({ ...p, results: parseExamStudents(res, true), resultsLoading: false }));
        })
        .catch(() => setExamView((p) => ({ ...p, resultsLoading: false })));
    } else {
      api.get(`/group/${initialGroup.id}/homework/${examView?.exam?.id}/results`, { params: { status } })
        .then((res) => {
          setExamView((p) => ({ ...p, results: parseExamStudents(res, false), resultsLoading: false }));
        })
        .catch(() => setExamView((p) => ({ ...p, resultsLoading: false })));
    }
  };

  const handleGrade = async () => {
    if (!gradeModal || !examView) return;
    setGradeModal((p) => ({ ...p, saving: true }));
    try {
      await api.post(`/group/${initialGroup.id}/homework/${examView.exam.id}/check`, {
        grade: gradeModal.score,
        title: gradeModal.comment || "Baholandi",
        homework_answer_id: gradeModal.student?.answer_id ?? gradeModal.student?.homework_answer_id ?? gradeModal.student?.id,
      });
      setGradeModal(null);
      fetchExamResults(examView.statusTab);
    } catch {
      setGradeModal((p) => ({ ...p, saving: false }));
    }
  };

  const handleSaveHw = async () => {
    if (!hwForm.lesson_id || !hwForm.title.trim()) return;
    setHwSaving(true);
    try {
      const fd = new FormData();
      fd.append("lesson_id", hwForm.lesson_id);
      fd.append("group_id", initialGroup.id);
      fd.append("title", hwForm.title);
      if (hwForm.file) fd.append("file", hwForm.file);
      await api.post("/homework", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setHwDrawer(false);
      setHwForm({ lesson_id: "", title: "", file: null });
      setDarsliklarTab("uyga_vazifa");
    } catch {
      // silently ignore
    } finally {
      setHwSaving(false);
    }
  };

  const openHwResults = (hw) => {
    setHwResultModal({ open: true, hw, results: [], loading: true });
    api.get(`/group/${initialGroup.id}/homework/${hw.id}/results`)
      .then((res) => {
        const students = res.data?.data?.students ?? [];
        setHwResultModal((p) => ({ ...p, results: students, loading: false }));
      })
      .catch(() => setHwResultModal((p) => ({ ...p, loading: false })));
  };

  const parseHwStudents = (res, isFiltersiz = false) => {
    const d = res.data?.data ?? res.data;
    if (isFiltersiz) {
      // Filtersiz: [{id, full_name}] — topshirmaganlar (Bajarilmagan)
      return Array.isArray(d) ? d.map((s) => ({ ...s, name: s.full_name ?? s.name })) : [];
    }
    // Status bilan: {students: [...]}
    return Array.isArray(d?.students) ? d.students : Array.isArray(d) ? d : [];
  };

  const openHwView = (hw) => {
    // Kutayotganlar: ?status=PENDING (topshirgan, tekshirilmagan)
    setHwView({ hw, statusTab: "PENDING", results: [], resultsLoading: true });
    const hwId = hw.homework?.[0]?.id ?? hw.id;
    api.get(`/group/${initialGroup.id}/homework/${hwId}/results`, { params: { status: "PENDING" } })
      .then((res) => {
        setHwView((p) => p ? ({ ...p, results: parseHwStudents(res, false), resultsLoading: false }) : null);
      })
      .catch(() => setHwView((p) => p ? ({ ...p, resultsLoading: false }) : null));
  };

  const openHwStudentView = (student) => {
    const hwId = hwView?.hw?.homework?.[0]?.id ?? hwView?.hw?.id;
    const studentId = student.student_id ?? student.id;
    setHwStudentView({ student, hw: hwView?.hw, detail: null, loading: true, score: student.grade ?? 0, comment: "", saving: false, saveError: "" });
    api.get(`/group/${initialGroup.id}/homework/${hwId}/result/${studentId}`)
      .then((res) => {
        const d = res.data?.data;
        setHwStudentView((p) => p ? ({ ...p, detail: d ?? null, loading: false }) : null);
      })
      .catch(() => setHwStudentView((p) => p ? ({ ...p, loading: false, saveError: "Javob ma'lumotlarini yuklashda xatolik" }) : null));
  };

  const submitHwGrade = async () => {
    if (!hwStudentView) return;
    const hwId = hwView?.hw?.homework?.[0]?.id ?? hwView?.hw?.id;
    setHwStudentView((p) => ({ ...p, saving: true, saveError: "" }));

    try {
      // Detail yuklanmagan bo'lsa — qayta yuklash
      let answerId = hwStudentView.detail?.id;
      if (!answerId) {
        const studentId = hwStudentView.student?.student_id ?? hwStudentView.student?.id;
        const res = await api.get(`/group/${initialGroup.id}/homework/${hwId}/result/${studentId}`);
        const d = res.data?.data;
        answerId = d?.id;
        if (d) setHwStudentView((p) => p ? ({ ...p, detail: d }) : null);
      }
      if (!answerId) {
        setHwStudentView((p) => ({ ...p, saving: false, saveError: "Talaba javob topshirmagan" }));
        return;
      }
      await api.post(`/group/${initialGroup.id}/homework/${hwId}/check`, {
        grade: hwStudentView.score,
        title: hwStudentView.comment || "Baholandi",
        homework_answer_id: answerId,
      });
      setHwStudentView(null);
      fetchHwResults(hwView?.statusTab ?? "PENDING");
    } catch (err) {
      const msg = err?.response?.data?.message;
      setHwStudentView((p) => ({
        ...p,
        saving: false,
        saveError: Array.isArray(msg) ? msg.join(", ") : (msg ?? "Xatolik yuz berdi"),
      }));
    }
  };

  const fetchHwResults = (status) => {
    const hwId = hwView?.hw?.homework?.[0]?.id ?? hwView?.hw?.id;
    setHwView((p) => p ? ({ ...p, statusTab: status, results: [], resultsLoading: true }) : null);

    if (status === "NOT_SUBMITTED") {
      // Bajarilmagan: filtersiz → topshirmaganlar [{id, full_name}]
      api.get(`/group/${initialGroup.id}/homework/${hwId}/results`)
        .then((res) => {
          setHwView((p) => p ? ({ ...p, results: parseHwStudents(res, true), resultsLoading: false }) : null);
        })
        .catch(() => setHwView((p) => p ? ({ ...p, resultsLoading: false }) : null));
    } else {
      // PENDING / ACCEPTED / REJECTED: status bilan
      api.get(`/group/${initialGroup.id}/homework/${hwId}/results`, { params: { status } })
        .then((res) => {
          setHwView((p) => p ? ({ ...p, results: parseHwStudents(res, false), resultsLoading: false }) : null);
        })
        .catch(() => setHwView((p) => p ? ({ ...p, resultsLoading: false }) : null));
    }
  };
  const [videos, setVideos] = useState(INIT_VIDEOS);
  const [videoModal, setVideoModal] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const videoFileRef = useRef(null);
  const [showMore, setShowMore] = useState(false);
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [openMentor, setOpenMentor] = useState(true);
  const [openParam, setOpenParam] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [calMonthIdx, setCalMonthIdx] = useState(0);
  const [groupStats, setGroupStats] = useState(null);
  const [addStudentModal, setAddStudentModal] = useState(false);
  const [allStudentsList, setAllStudentsList] = useState([]);
  const [studentModalSearch, setStudentModalSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [addingStudent, setAddingStudent] = useState(false);
  const [groupStudentsRefreshKey, setGroupStudentsRefreshKey] = useState(0);
  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [lessonsRefreshKey, setLessonsRefreshKey] = useState(0);
  const [lessonDrawer, setLessonDrawer] = useState(false);
  const [lessonForm, setLessonForm] = useState({ topic: "", description: "" });
  const [savingLesson, setSavingLesson] = useState(false);
  const [attendance, setAttendance_] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  useEffect(() => {
    if (detailTab !== "malumotlar") return;
    let cancelled = false;
    api.get(`/groups/${initialGroup.id}`)
      .then((res) => {
        if (cancelled) return;
        const d = res.data?.data ?? res.data;
        if (d) setGroupStats(d);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [initialGroup.id, detailTab]);

  useEffect(() => {
    let cancelled = false;
    api.get(`/groups/one/${initialGroup.id}`)
      .then((res) => {
        if (cancelled) return;
        const d = res.data?.data ?? res.data;
        if (d?.id) setGroup(mapGroup(d));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [initialGroup.id]);

  useEffect(() => {
    let cancelled = false;
    api.get(`/groups/one/students/${initialGroup.id}`)
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.data ?? res.data;
        setGroupStudents(
          (Array.isArray(data) ? data : []).map((s) => ({
            id: s.id,
            name: s.fullName ?? s.full_name ?? s.name ?? "—",
          }))
        );
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [initialGroup.id, groupStudentsRefreshKey]);

  useEffect(() => {
    if (detailTab !== "malumotlar") return;
    let cancelled = false;
    api.get(`/groups/${initialGroup.id}/schedules`)
      .then((res) => {
        if (cancelled) return;
        const raw = res.data?.data ?? res.data;
        const obj = Array.isArray(raw) ? raw[0] : raw;
        if (!obj) return;
        const months = Object.keys(obj).sort((a, b) => Number(a) - Number(b));
        setSchedules(
          months.map((key) => ({
            monthIndex: key,
            isActive: obj[key].isActive,
            days: (obj[key].days ?? []).map((d) => ({
              day: d.day,
              month: d.month,
              past: d.isCompleted,
            })),
          }))
        );
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [initialGroup.id, detailTab]);

  useEffect(() => {
    if (detailTab !== "akademik") return;
    let cancelled = false;
    api.get("/attendance/all")
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.data ?? res.data;
        const filtered = (Array.isArray(data) ? data : []).filter(
          (a) => Number(a.group_id) === Number(initialGroup.id)
        );
        setAttendance_(filtered);
        setAttendanceLoading(false);
      })
      .catch(() => { if (!cancelled) setAttendanceLoading(false); });
    return () => { cancelled = true; };
  }, [initialGroup.id, detailTab]);

  useEffect(() => {
    if (darsliklarTab !== "jurnal") return;
    let cancelled = false;
    api.get(`/lessons/my/group/${initialGroup.id}`)
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.data ?? res.data;
        setLessons(Array.isArray(data) ? data : []);
        setLessonsLoading(false);
      })
      .catch(() => { if (!cancelled) setLessonsLoading(false); });
    return () => { cancelled = true; };
  }, [initialGroup.id, darsliklarTab, lessonsRefreshKey]);

  const handleSaveLesson = async () => {
    if (!lessonForm.topic.trim()) return;
    setSavingLesson(true);
    try {
      await api.post("/lessons", { group_id: initialGroup.id, topic: lessonForm.topic, description: lessonForm.description });
      setLessonDrawer(false);
      setLessonForm({ topic: "", description: "" });
      setDarsliklarTab("jurnal");
      setLessonsLoading(true);
      setLessonsRefreshKey((k) => k + 1);
    } catch {
      // silently ignore
    } finally {
      setSavingLesson(false);
    }
  };

  const openAddStudentModal = () => {
    setSelectedStudentId(null);
    setStudentModalSearch("");
    api.get("/students")
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setAllStudentsList(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
    setAddStudentModal(true);
  };

  const handleAddStudent = async () => {
    if (!selectedStudentId) return;
    setAddingStudent(true);
    try {
      await api.post("/student-group", { student_id: selectedStudentId, group_id: initialGroup.id });
      setAddStudentModal(false);
      setGroupStudentsRefreshKey((k) => k + 1);
    } catch {
      // silently ignore
    } finally {
      setAddingStudent(false);
    }
  };

  const DETAIL_TABS = ["malumotlar", "darsliklari", "akademik"];
  const DETAIL_LABELS = { malumotlar: "Ma'lumotlar", darsliklari: "Guruh darsliklari", akademik: "Akademik davomati" };
  const DARS_TABS = [
    { key: "uyga_vazifa", label: "Uyga vazifa" },
    { key: "videolar",    label: "Videolar" },
    { key: "imtihonlar",  label: "Imtihonlar" },
    { key: "jurnal",      label: "Jurnal" },
  ];

  const col = { fontSize: 12, color: "var(--text-muted, #9ca3af)", fontWeight: 600, padding: "10px 16px", textAlign: "left", whiteSpace: "nowrap", letterSpacing: "0.2px" };
  const cell = { fontSize: 13, color: "var(--text, #374151)", padding: "14px 16px", verticalAlign: "middle", borderTop: "1px solid var(--border, #f5f5f5)" };

  const filteredStudentsForModal = allStudentsList.filter((s) => {
    const name = s.fullName ?? s.full_name ?? s.name ?? "";
    return name.toLowerCase().includes(studentModalSearch.toLowerCase());
  });

  if (showCreate) return <HomeworkCreate onBack={() => { setShowCreate(false); setDarsliklarTab("uyga_vazifa"); }} groupId={initialGroup.id} />;
  if (showImtihonCreate) return <ImtihonCreate onBack={() => { setShowImtihonCreate(false); setDarsliklarTab("imtihonlar"); }} groupId={initialGroup.id} />;
  if (selectedDate) return <LessonDetail date={selectedDate} group={group} students={groupStudents} teachers={groupStats?.teachers ?? []} onBack={() => setSelectedDate(null)} />;

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ border: "none", background: "none", cursor: "pointer", color: "#374151", display: "flex", padding: 4, borderRadius: 8 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>
            <ArrowBackIcon style={{ fontSize: 22 }} />
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text, #111)", margin: 0, letterSpacing: "-0.4px" }}>{group.name}</h1>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#16a34a", background: "#dcfce7", padding: "3px 10px", borderRadius: 20 }}>Aktiv</span>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 6, border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "8px 16px", background: "#fff", fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
          <BarChartIcon style={{ fontSize: 17, color: "#9ca3af" }} /> Statistika
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "2px solid #e5e7eb", marginBottom: 24 }}>
        {DETAIL_TABS.map((key) => (
          <button key={key} onClick={() => setDetailTab(key)}
            style={{ padding: "10px 20px", border: "none", borderBottom: detailTab === key ? `2.5px solid ${PRIMARY}` : "2.5px solid transparent", background: "none", cursor: "pointer", fontSize: 14, color: detailTab === key ? PRIMARY : "#6b7280", fontWeight: detailTab === key ? 700 : 500, marginBottom: "-2px", transition: "color 0.15s", whiteSpace: "nowrap" }}>
            {DETAIL_LABELS[key]}
          </button>
        ))}
      </div>

      {/* ── MA'LUMOTLAR ── */}
      {detailTab === "malumotlar" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Guruh mentorlari */}
            <div style={{ background: "var(--card, #fff)", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              <div onClick={() => setOpenMentor((p) => !p)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: `linear-gradient(135deg, ${PRIMARY}, #a855f7)`, cursor: "pointer", userSelect: "none" }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>Guruh mentorlari</span>
                <span style={{ color: "#fff", fontSize: 18, display: "inline-block", transition: "transform 0.25s", transform: openMentor ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
              </div>
              <div style={{ maxHeight: openMentor ? 400 : 0, overflow: "hidden", transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)" }}>
                {groupStats?.teachers?.length > 0 ? (
                  <div style={{ padding: "10px 0" }}>
                    {groupStats.teachers.map((teacher, i) => {
                      const name = (teacher.fullName ?? teacher.full_name ?? `${teacher.first_name ?? ""} ${teacher.last_name ?? ""}`.trim()) || "—";
                      const role = teacher.role ?? "Teacher";
                      const initial = name[0]?.toUpperCase() ?? "?";
                      return (
                        <div key={teacher.id ?? i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 18px", borderBottom: "1px solid #f5f5f5" }}>
                          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ color: "#fff", fontWeight: 700, fontSize: 17 }}>{initial}</span>
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "var(--text, #111)" }}>{name}</p>
                            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#16a34a", fontWeight: 600 }}>{role}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: 18, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    {group.oqituvchi && group.oqituvchi !== "—" ? (
                      <>
                        <div style={{ width: 70, height: 70, borderRadius: "50%", background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ color: "#fff", fontWeight: 700, fontSize: 22 }}>{group.oqituvchi[0]}</span>
                        </div>
                        <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>Teacher</span>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text, #111)" }}>{group.oqituvchi}</span>
                      </>
                    ) : (
                      <p style={{ color: "#9ca3af", fontSize: 13, margin: 0, padding: "8px 0" }}>Mentor biriktirilmagan</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Parametrlar */}
            <div style={{ background: "var(--card, #fff)", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              <div onClick={() => setOpenParam((p) => !p)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: `linear-gradient(135deg, ${PRIMARY}, #a855f7)`, cursor: "pointer", userSelect: "none" }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>Parametrlar</span>
                <span style={{ color: "#fff", fontSize: 18, display: "inline-block", transition: "transform 0.25s", transform: openParam ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
              </div>
              <div style={{ maxHeight: openParam ? 400 : 0, overflow: "hidden", transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)" }}>
                <div style={{ padding: "6px 0" }}>
                  {[
                    { label: "Kurs:", value: group.kurs },
                    { label: "O'rta yosh:", value: groupStats?.averageAge ?? "—" },
                    { label: "O'quvchilar sig'imi:", value: groupStats?.room_capacity ?? "—" },
                    { label: "Mavjud o'quvchilar:", value: groupStats?.student_count ?? group.talabalar },
                    { label: "O'quv oyidagi darslar soni:", value: 20 },
                    { label: "Kurs davomiyligi (oy):", value: groupStats?.course?.duration_month ?? "—" },
                    { label: "Jami darslar soni:", value: 20 },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 18px", borderBottom: "1px solid #f5f5f5" }}>
                      <span style={{ fontSize: 13, color: "#6b7280" }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text, #111)" }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Guruh talabalari */}
          <div style={{ background: "var(--card, #fff)", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: `linear-gradient(135deg, ${PRIMARY}, #a855f7)` }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>Guruh talabalari ({groupStudents.length})</span>
              <button onClick={openAddStudentModal}
                style={{ display: "flex", alignItems: "center", gap: 5, border: "none", background: "rgba(255,255,255,0.25)", color: "#fff", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                <AddIcon style={{ fontSize: 14 }} /> Qo&apos;shish
              </button>
            </div>
            <div>
              {groupStudents.length === 0 ? (
                <p style={{ textAlign: "center", color: "#9ca3af", padding: 24, margin: 0 }}>Talabalar mavjud emas</p>
              ) : (
                groupStudents.map((s, i) => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", borderBottom: "1px solid #f5f5f5" }}>
                    <span style={{ fontSize: 12, color: "#9ca3af", width: 20, flexShrink: 0 }}>{i + 1}</span>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: AVATAR_COLORS[i % AVATAR_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0, overflow: "hidden" }}>
                      {getPhotoUrl(s) ? <img src={getPhotoUrl(s)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : s.name[0]}
                    </div>
                    <span style={{ fontSize: 14, color: "var(--text, #111)", fontWeight: 500 }}>{s.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Dars jadvali */}
          <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", padding: "18px 20px" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text, #111)", margin: "0 0 16px" }}>Dars jadvali</h3>

            {/* Jadval table */}
            <div style={{ overflowX: "auto", marginBottom: 20 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {(showMore ? JADVAL_DATA : JADVAL_DATA.slice(0, 2)).map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={{ padding: "12px 0", width: 200 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: row.mentor.startsWith("+++") ? "#3b82f6" : PRIMARY, cursor: "pointer" }}>{row.mentor}</span>
                      </td>
                      <td style={{ padding: "12px 8px", fontSize: 13, color: "#374151" }}>{row.kunlar}</td>
                      <td style={{ padding: "12px 8px", fontSize: 13, color: "#374151" }}>{row.vaqt}</td>
                      <td style={{ padding: "12px 8px", fontSize: 13, color: "#374151" }}>{row.sana}</td>
                      <td style={{ padding: "12px 0", fontSize: 13, color: "#374151", textAlign: "right" }}>{row.xona}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!showMore && (
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <button onClick={() => setShowMore(true)}
                  style={{ border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "8px 22px", background: "var(--card, #fff)", fontSize: 13, cursor: "pointer", color: "var(--text, #374151)", fontWeight: 500 }}>
                  Yana ko&apos;rsatish ({JADVAL_DATA.length - 2})
                </button>
              </div>
            )}

            {/* All study months */}
            {schedules.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", padding: "12px 0" }}>Jadval ma&apos;lumotlari yuklanmoqda...</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {(showAllMonths ? schedules : schedules.slice(0, 1)).map((month, idx) => (
                  <div key={idx}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text, #111)" }}>{idx + 1}-o&apos;quv oyi</span>
                      {month.isActive && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#16a34a", border: "1.5px solid #16a34a", padding: "2px 10px", borderRadius: 20 }}>Joriy oy</span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {month.days.map((d, i) => {
                        const MONTH_IDX = { January:0,February:1,March:2,April:3,May:4,June:5,July:6,August:7,September:8,October:9,November:10,December:11 };
                        const today = new Date(); today.setHours(0,0,0,0);
                        const dateObj = new Date(today.getFullYear(), MONTH_IDX[d.month] ?? 0, d.day);
                        const isFuture = dateObj > today;
                        const isPast = dateObj <= today; // haqiqatan o'tgan
                        return (
                          <div key={i}
                            onClick={isFuture ? undefined : () => setSelectedDate(d)}
                            title={isFuture ? "Dars kelmagan" : undefined}
                            style={{
                              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                              background: isPast ? "#e8edf5" : "var(--card, #fff)",
                              border: `1.5px solid ${isFuture ? "#f0f0f0" : "#e5e7eb"}`,
                              borderRadius: 10, padding: "8px 12px", minWidth: 52,
                              cursor: isFuture ? "not-allowed" : "pointer",
                              opacity: isFuture ? 0.4 : 1,
                              transition: "border-color 0.15s",
                            }}
                            onMouseEnter={(e) => { if (!isFuture) e.currentTarget.style.borderColor = PRIMARY; }}
                            onMouseLeave={(e) => { if (!isFuture) e.currentTarget.style.borderColor = "#e5e7eb"; }}>
                            <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>{d.month}</span>
                            <span style={{ fontSize: 14, fontWeight: 700, color: isPast ? "#6b7280" : "var(--text, #111)" }}>{d.day}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {schedules.length > 1 && (
                  <div style={{ textAlign: "center" }}>
                    <button
                      onClick={() => setShowAllMonths((p) => !p)}
                      style={{ border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "8px 22px", background: "var(--card, #fff)", fontSize: 13, cursor: "pointer", color: "var(--text, #374151)", fontWeight: 500 }}>
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--text, #111)", margin: 0 }}>Guruh darsliklari</h2>
              {/* Sub tabs */}
              <div style={{ display: "flex", gap: 2, background: "#f3f4f6", borderRadius: 8, padding: 3 }}>
                {DARS_TABS.map(({ key, label }) => (
                  <button key={key} onClick={() => setDarsliklarTab(key)}
                    style={{ padding: "6px 14px", border: "none", borderRadius: 6, fontSize: 13, fontWeight: darsliklarTab === key ? 600 : 400, cursor: "pointer", background: darsliklarTab === key ? "#fff" : "transparent", color: darsliklarTab === key ? "#111" : "#6b7280", boxShadow: darsliklarTab === key ? "0 1px 4px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s", whiteSpace: "nowrap" }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                if (darsliklarTab === "videolar") setVideoModal(true);
                else if (darsliklarTab === "jurnal") { setLessonForm({ topic: "", description: "" }); setLessonDrawer(true); }
                else if (darsliklarTab === "uyga_vazifa") setShowCreate(true);
                else if (darsliklarTab === "imtihonlar") { setExamView(null); setShowImtihonCreate(true); }
                else setShowCreate(true);
              }}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 3px 10px rgba(22,163,74,0.3)" }}>
              <AddIcon style={{ fontSize: 17 }} /> Qo&apos;shish
            </button>
          </div>

          {darsliklarTab === "uyga_vazifa" && !hwView && (
            <div style={{ background: "var(--card, #fff)", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              {homeworksLoading ? (
                <p style={{ textAlign: "center", padding: "32px", color: "#9ca3af", fontSize: 14 }}>Yuklanmoqda...</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "var(--hover-bg, #fafafa)" }}>
                      <th style={{ ...col }}>#</th>
                      <th style={{ ...col }}>Mavzu</th>
                      <th style={{ ...col }}><PersonIcon style={{ fontSize: 15, color: "#9ca3af" }} /></th>
                      <th style={{ ...col }}><AccessTimeIcon style={{ fontSize: 15, color: "#f59e0b" }} /></th>
                      <th style={{ ...col }}><CheckCircleOutlineIcon style={{ fontSize: 15, color: "#16a34a" }} /></th>
                      <th style={{ ...col }}>Berilgan vaqt</th>
                      <th style={{ ...col }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {homeworks.length === 0 ? (
                      <tr><td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "#9ca3af", fontSize: 14 }}>Uy vazifalari mavjud emas</td></tr>
                    ) : homeworks.map((hw, i) => {
                      const hwItem = hw.homework?.[0];
                      return (
                        <tr key={`${hw.id}-${i}`}
                          onClick={() => openHwView(hw)}
                          style={{ cursor: "pointer", borderTop: "1px solid var(--border, #f5f5f5)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover-bg, #fafafa)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--card, #fff)")}>
                          <td style={{ ...cell }}>{i + 1}</td>
                          <td style={{ ...cell, fontWeight: 500, color: "var(--text, #111)" }}>{hw.topic ?? "—"}</td>
                          <td style={{ ...cell }}>{hw.existStudentsIngroup ?? "—"}</td>
                          <td style={{ ...cell, color: "#f59e0b", fontWeight: 600 }}>{hw.homeworkPending ?? 0}</td>
                          <td style={{ ...cell, color: "#16a34a", fontWeight: 600 }}>{hw.homeworkAccept ?? 0}</td>
                          <td style={{ ...cell, fontSize: 12, color: "#6b7280" }}>
                            {hwItem?.created_at ? new Date(hwItem.created_at).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                          </td>
                          <td style={{ ...cell, textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                            <button style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}>
                              <MoreVertIcon style={{ fontSize: 18 }} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {darsliklarTab === "uyga_vazifa" && hwView && !hwStudentView && (
            <div>
              {/* HW detail header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <button onClick={() => setHwView(null)} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text, #374151)", display: "flex", padding: 4 }}>
                  <ArrowBackIcon style={{ fontSize: 20 }} />
                </button>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text, #111)" }}>{hwView.hw?.topic ?? "Uy vazifa"}</h3>
              </div>

              {/* Info card */}
              <div style={{ background: "var(--card, #fff)", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", padding: "16px 20px", marginBottom: 18 }}>
                <div style={{ display: "flex", gap: 48 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>Mavzu</p>
                    <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 700, color: "var(--text, #111)" }}>{hwView.hw?.topic ?? "—"}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>Berilgan vaqt</p>
                    <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 700, color: "var(--text, #111)" }}>
                      {hwView.hw?.homework?.[0]?.created_at
                        ? new Date(hwView.hw.homework[0].created_at).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status tabs */}
              {(() => {
                const HW_STATUS_TABS = [
                  { key: "PENDING",       label: "Kutayotganlar" },
                  { key: "REJECTED",      label: "Qaytarilganlar" },
                  { key: "ACCEPTED",      label: "Qabul qilinganlar" },
                  { key: "NOT_SUBMITTED",label: "Bajarilmagan" },
                ];
                const counts = {
                  PENDING:       hwView.hw?.homeworkPending ?? 0,
                  ACCEPTED:      hwView.hw?.homeworkAccept  ?? 0,
                  REJECTED:      hwView.hw?.homeworkReject  ?? 0,
                  NOT_SUBMITTED: 0,
                };
                return (
                  <div style={{ display: "flex", borderBottom: "2px solid #e5e7eb", marginBottom: 18 }}>
                    {HW_STATUS_TABS.map(({ key, label }) => {
                      const cnt = counts[key];
                      return (
                        <button key={key} onClick={() => fetchHwResults(key)}
                          style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", border: "none", borderBottom: hwView.statusTab === key ? "2.5px solid #16a34a" : "2.5px solid transparent", background: "none", cursor: "pointer", fontSize: 13, color: hwView.statusTab === key ? "#16a34a" : "#6b7280", fontWeight: hwView.statusTab === key ? 700 : 500, marginBottom: "-2px", whiteSpace: "nowrap" }}>
                          {label}
                          {cnt > 0 && (
                            <span style={{ fontSize: 11, fontWeight: 700, background: hwView.statusTab === key ? "#16a34a" : "#f59e0b", color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                              {cnt}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Results table */}
              <div style={{ background: "var(--card, #fff)", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                {hwView.resultsLoading ? (
                  <p style={{ textAlign: "center", padding: "32px", color: "#9ca3af", fontSize: 14 }}>Yuklanmoqda...</p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "var(--hover-bg, #fafafa)" }}>
                        <th style={{ ...col, color: "#9ca3af" }}>O&apos;quvchi ismi</th>
                        <th style={{ ...col, color: "#9ca3af" }}>Uyga vazifa jo&apos;natilgan vaqt</th>
                        <th style={{ ...col, color: "#9ca3af" }}>Ball</th>
                        <th style={{ ...col }} />
                      </tr>
                    </thead>
                    <tbody>
                      {hwView.results.length === 0 ? (
                        <tr><td colSpan={4} style={{ textAlign: "center", padding: "32px", color: "#9ca3af", fontSize: 14 }}>Talabalar topilmadi</td></tr>
                      ) : hwView.results.map((s, i) => {
                        const name = (s.fullName ?? s.full_name ?? s.name ?? `#${s.student_id ?? s.id}`);
                        const submitted = s.submitted_at ?? s.created_at;
                        return (
                          <tr key={i} style={{ borderTop: "1px solid var(--border, #f5f5f5)", cursor: "pointer" }}
                            onClick={() => openHwStudentView(s)}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover-bg, #fafafa)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--card, #fff)")}>
                            <td style={{ ...cell, fontWeight: 500, color: "var(--text, #111)" }}>{name}</td>
                            <td style={{ ...cell, fontSize: 12, color: "#6b7280" }}>
                              {submitted ? new Date(submitted).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                            </td>
                            <td style={{ ...cell }}>
                              {s.grade != null ? (
                                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14, fontWeight: 700, color: "#f59e0b" }}>⚡ {s.grade}</span>
                              ) : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {darsliklarTab === "uyga_vazifa" && hwView && hwStudentView && (
            <div style={{ maxWidth: 680 }}>
              {/* Breadcrumb */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 14 }}>
                <button onClick={() => setHwStudentView(null)} style={{ border: "none", background: "none", cursor: "pointer", fontWeight: 600, color: "var(--text, #111)", padding: 0 }}>
                  {hwView.statusTab === "PENDING" ? "Kutayotganlar" : hwView.statusTab === "REJECTED" ? "Qaytarilganlar" : hwView.statusTab === "ACCEPTED" ? "Qabul qilinganlar" : "Bajarilmagan"}
                </button>
                <span style={{ color: "#9ca3af" }}>›</span>
                <span style={{ color: "#9ca3af" }}>Uyga vazifa</span>
              </div>

              {/* === UY VAZIFASI TOPSHIRIG'I === */}
              <div style={{ background: "var(--card,#fff)", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,.07)", overflow: "hidden", marginBottom: 16 }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border,#f0f0f0)", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: PRIMARY }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text,#111)", letterSpacing: ".1px" }}>Uy vazifasi topshirig&apos;i</span>
                </div>
                <div style={{ padding: "16px 20px" }}>
                  <p style={{ margin: 0, fontSize: 14, color: "var(--text,#374151)", lineHeight: 1.6 }}>
                    {hwStudentView.detail?.description ?? hwView.hw?.description ?? hwView.hw?.topic ?? "—"}
                  </p>
                </div>
              </div>

              {/* === TALABA JAVOBI === */}
              <div style={{ background: "var(--card,#fff)", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,.07)", overflow: "hidden", marginBottom: 16 }}>
                {/* Header */}
                <div style={{ padding: "16px 20px", background: `linear-gradient(135deg,${PRIMARY}22,#a855f722)`, borderBottom: "1px solid var(--border,#f0f0f0)", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg,${PRIMARY},#a855f7)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
                    {(hwStudentView.student?.fullName ?? hwStudentView.student?.full_name ?? hwStudentView.student?.name ?? "T")[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text,#111)" }}>
                      {hwStudentView.student?.fullName ?? hwStudentView.student?.full_name ?? hwStudentView.student?.name ?? "Talaba"}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af" }}>Talaba javobi</p>
                  </div>
                  <div style={{ marginLeft: "auto" }}>
                    {(() => {
                      const st = hwStudentView.student?.status ?? "PENDING";
                      const cfg = st === "ACCEPTED" ? { c: "#16a34a", bg: "#dcfce7", label: "Qabul qilindi" }
                        : st === "REJECTED" ? { c: "#ef4444", bg: "#fee2e2", label: "Qaytarildi" }
                        : { c: "#f59e0b", bg: "#fef3c7", label: "Kutayabti" };
                      return <span style={{ fontSize: 12, fontWeight: 700, color: cfg.c, background: cfg.bg, padding: "4px 12px", borderRadius: 20 }}>{cfg.label}</span>;
                    })()}
                  </div>
                </div>

                {/* Meta info */}
                <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border,#f5f5f5)", display: "flex", gap: 32, flexWrap: "wrap" }}>
                  {[
                    { label: "Topshirilgan vaqt", value: hwStudentView.student?.submitted_at ?? hwStudentView.student?.created_at
                      ? new Date(hwStudentView.student.submitted_at ?? hwStudentView.student.created_at).toLocaleDateString("uz-UZ", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" })
                      : "—" },
                    { label: "Fayllar soni", value: hwStudentView.detail?.files?.length ?? hwStudentView.student?.file_count ?? 0 },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".5px" }}>{label}</p>
                      <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 700, color: "var(--text,#111)" }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Files */}
                {hwStudentView.detail?.files?.length > 0 && (
                  <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border,#f5f5f5)" }}>
                    <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".5px" }}>Fayllar</p>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {hwStudentView.detail.files.map((f, fi) => {
                        const isImg = /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(f.url ?? f.name ?? "");
                        const url = f.url ?? f.path ?? "#";
                        return isImg ? (
                          <a key={fi} href={url} target="_blank" rel="noreferrer">
                            <img src={url} alt="" style={{ width: 100, height: 76, objectFit: "cover", borderRadius: 10, border: "1.5px solid #e5e7eb", transition: "transform .15s" }}
                              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")} />
                          </a>
                        ) : (
                          <a key={fi} href={url} target="_blank" rel="noreferrer"
                            style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: PRIMARY, padding: "8px 14px", border: "1.5px solid #ede9fe", borderRadius: 10, background: "#faf5ff", textDecoration: "none", fontWeight: 500 }}>
                            📎 {f.name ?? `Fayl ${fi + 1}`}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Answer text */}
                {(hwStudentView.detail?.answer ?? hwStudentView.student?.answer) && (
                  <div style={{ padding: "14px 20px" }}>
                    <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".5px" }}>Javob matni</p>
                    <div style={{ padding: "12px 16px", background: "var(--hover-bg,#f9fafb)", borderLeft: "3px solid #7c3aed", borderRadius: "0 10px 10px 0", fontSize: 14, color: "var(--text,#374151)", lineHeight: 1.6 }}>
                      {hwStudentView.detail?.answer ?? hwStudentView.student?.answer}
                    </div>
                  </div>
                )}
                {hwStudentView.loading && <div style={{ padding: "16px 20px", color: "#9ca3af", fontSize: 13 }}>Yuklanmoqda...</div>}
              </div>

              {/* === BAHOLASH === */}
              <div style={{ background: "var(--card,#fff)", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,.07)", overflow: "hidden" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border,#f0f0f0)", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#16a34a" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text,#111)" }}>Baholash</span>
                </div>
                <div style={{ padding: "20px" }}>
                  {/* Info */}
                  <div style={{ background: "#eff6ff", borderRadius: 12, padding: "14px 16px", fontSize: 13, color: "#1d4ed8", marginBottom: 24, display: "flex", gap: 10, alignItems: "flex-start", lineHeight: 1.5 }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>ⓘ</span>
                    <span>60-100 oralig&apos;ida ball qo&apos;yilgan vazifa <b>&apos;Qabul qilingan&apos;</b>, 0-59 oralig&apos;ida ball qo&apos;yilgan vazifa <b>&apos;Qaytarilgan&apos;</b> hisoblanadi.</span>
                  </div>

                  {/* Ball */}
                  <div style={{ marginBottom: 24 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text,#111)", margin: "0 0 16px" }}>Ball</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ flex: 1 }}>
                        <GradeSlider value={hwStudentView.score} onChange={(v) => setHwStudentView((p) => ({ ...p, score: v }))} />
                      </div>
                      <input type="number" min={0} max={100} value={hwStudentView.score}
                        onChange={(e) => setHwStudentView((p) => ({ ...p, score: Math.min(100, Math.max(0, Number(e.target.value))) }))}
                        style={{ width: 72, padding: "8px 10px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 18, fontWeight: 700, textAlign: "center", outline: "none", background: "var(--input-bg,#fff)", color: "var(--text,#111)" }} />
                    </div>
                    <p style={{ margin: "10px 0 0", fontSize: 12, color: "#9ca3af", textAlign: "center" }}>O&apos;tish bali</p>
                  </div>

                  {/* Comment */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ position: "relative" }}>
                      <textarea placeholder="Izohingiz..." value={hwStudentView.comment}
                        onChange={(e) => setHwStudentView((p) => ({ ...p, comment: e.target.value }))}
                        rows={4} style={{ width: "100%", padding: "14px 48px 14px 14px", border: "1.5px solid #e5e7eb", borderRadius: 12, fontSize: 14, outline: "none", boxSizing: "border-box", resize: "none", fontFamily: "inherit", color: "var(--text,#374151)", background: "var(--input-bg,#fff)", lineHeight: 1.6 }}
                        onFocus={(e) => (e.target.style.border = "1.5px solid #16a34a")}
                        onBlur={(e) => (e.target.style.border = "1.5px solid #e5e7eb")} />
                      <button style={{ position: "absolute", right: 10, bottom: 10, width: 32, height: 32, borderRadius: "50%", background: "#16a34a", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V6zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                      </button>
                    </div>
                  </div>

                  {hwStudentView.saveError && (
                    <div style={{ background: "#fee2e2", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: 14, fontWeight: 500 }}>
                      ⚠ {hwStudentView.saveError}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={() => setHwStudentView(null)}
                      style={{ flex: 1, padding: "12px", border: "1.5px solid #e5e7eb", borderRadius: 10, background: "var(--card,#fff)", fontSize: 14, cursor: "pointer", color: "var(--text,#374151)", fontWeight: 600 }}>
                      Bekor qilish
                    </button>
                    <button onClick={submitHwGrade} disabled={hwStudentView.saving || hwStudentView.loading}
                      style={{ flex: 2, padding: "12px", border: "none", borderRadius: 10, background: (hwStudentView.saving || hwStudentView.loading) ? "#86efac" : "#16a34a", color: "#fff", fontSize: 14, fontWeight: 700, cursor: (hwStudentView.saving || hwStudentView.loading) ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(22,163,74,.35)" }}>
                      {hwStudentView.loading ? "Ma'lumot yuklanmoqda..." : hwStudentView.saving ? "Yuborilmoqda..." : `✓ ${hwStudentView.score >= 60 ? "Qabul qilish" : "Qaytarish"} (${hwStudentView.score} ball)`}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {darsliklarTab === "videolar" && (
            <div style={{ background: "var(--card, #fff)", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              {filesLoading ? (
                <p style={{ textAlign: "center", padding: "32px", color: "#9ca3af", fontSize: 14 }}>Yuklanmoqda...</p>
              ) : groupFiles.length === 0 ? (
                <p style={{ textAlign: "center", padding: "48px 24px", color: "#9ca3af", fontSize: 14 }}>Fayllar mavjud emas</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "var(--hover-bg, #fafafa)" }}>
                      <th style={{ ...col }}>#</th>
                      <th style={{ ...col }}>Fayl nomi</th>
                      <th style={{ ...col }}>Turi</th>
                      <th style={{ ...col }}>Hajmi</th>
                      <th style={{ ...col }}>Dars mavzusi</th>
                      <th style={{ ...col }}>Qo&apos;shilgan vaqti</th>
                      <th style={{ ...col }} />
                    </tr>
                  </thead>
                  <tbody>
                    {groupFiles.map((f, i) => {
                      const name = f.originalname ?? f.name ?? f.filename ?? `Fayl ${i + 1}`;
                      const rawExt = (f.video_url ?? name).split(".").pop()?.toLowerCase() ?? "";
                      const ext  = rawExt.toUpperCase();
                      const size = f.size_mb ? `${f.size_mb.toFixed(2)} MB` : "—";
                      const fileUrl = f.video_url ?? f.url ?? null;
                      const isVideo = ["mp4","webm","avi","mkv","mov","mpeg","m4v","ogm"].includes(rawExt);
                      return (
                        <tr key={f.id ?? i} onClick={async () => {
                          setVideoPlayer({ ...f, name, fileUrl, isVideo, blobUrl: null, blobLoading: isVideo });
                          if (isVideo && fileUrl) {
                            try {
                              const token = localStorage.getItem("token");
                              const res = await fetch(
                                buildVideoUrl(fileUrl),
                                { headers: { Authorization: `Bearer ${token}` } }
                              );
                              if (res.ok) {
                                const blob = await res.blob();
                                const blobUrl = URL.createObjectURL(blob);
                                setVideoPlayer((p) => p ? { ...p, blobUrl, blobLoading: false } : null);
                              } else {
                                setVideoPlayer((p) => p ? { ...p, blobLoading: false } : null);
                              }
                            } catch {
                              setVideoPlayer((p) => p ? { ...p, blobLoading: false } : null);
                            }
                          }
                        }}
                          style={{ cursor: "pointer", borderTop: "1px solid var(--border, #f5f5f5)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--card, #fff)")}>
                          <td style={{ ...cell }}>{i + 1}</td>
                          <td style={{ ...cell }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 28, height: 28, borderRadius: "50%", background: isVideo ? "#e0f2fe" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                {isVideo
                                  ? <svg viewBox="0 0 24 24" width="14" height="14" fill="#0891b2"><path d="M8 5v14l11-7z"/></svg>
                                  : <svg viewBox="0 0 24 24" width="14" height="14" fill="#6b7280"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
                                }
                              </div>
                              <span style={{ color: "#0891b2", fontWeight: 500, fontSize: 13 }}>{name}</span>
                            </div>
                          </td>
                          <td style={{ ...cell }}>
                            {ext && <span style={{ fontSize: 11, fontWeight: 600, color: PRIMARY, background: "#ede9fe", padding: "3px 8px", borderRadius: 12 }}>{ext}</span>}
                          </td>
                          <td style={{ ...cell, fontSize: 12 }}>{size}</td>
                          <td style={{ ...cell, fontSize: 12, color: "#374151" }}>{f.lesson?.topic ?? "—"}</td>
                          <td style={{ ...cell, fontSize: 12, color: "#6b7280" }}>
                            {f.created_at ? new Date(f.created_at).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                          </td>
                          <td style={{ ...cell, textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                            <button style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}>
                              <MoreVertIcon style={{ fontSize: 18 }} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {darsliklarTab === "jurnal" && (
            <div style={{ background: "var(--card, #fff)", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              {lessonsLoading ? (
                <p style={{ textAlign: "center", padding: "32px", color: "#9ca3af", fontSize: 14 }}>Yuklanmoqda...</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "var(--hover-bg, #fafafa)" }}>
                      <th style={{ ...col }}>#</th>
                      <th style={{ ...col }}>Mavzu</th>
                      <th style={{ ...col }}>Sana</th>
                      <th style={{ ...col }} />
                    </tr>
                  </thead>
                  <tbody>
                    {lessons.length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: "center", padding: "32px", color: "#9ca3af", fontSize: 14 }}>Darslar mavjud emas</td></tr>
                    ) : lessons.map((lesson, i) => (
                      <tr key={lesson.id}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--card, #fff)")}>
                        <td style={{ ...cell }}>{i + 1}</td>
                        <td style={{ ...cell, fontWeight: 500, color: "var(--text, #111)" }}>{lesson.topic}</td>
                        <td style={{ ...cell, fontSize: 12, color: "#6b7280" }}>
                          {new Date(lesson.created_at).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td style={{ ...cell, textAlign: "right" }}>
                          <button style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}>
                            <MoreVertIcon style={{ fontSize: 18 }} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {darsliklarTab === "imtihonlar" && !examView && (
            <div style={{ background: "var(--card, #fff)", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              {examListLoading ? (
                <p style={{ textAlign: "center", padding: "32px", color: "#9ca3af", fontSize: 14 }}>Yuklanmoqda...</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "var(--hover-bg, #fafafa)" }}>
                      <th style={{ ...col }}>#</th>
                      <th style={{ ...col }}>Mavzu</th>
                      <th style={{ ...col }}>👤</th>
                      <th style={{ ...col, color: "#ef4444" }}>✗</th>
                      <th style={{ ...col }}>Status</th>
                      <th style={{ ...col }}>Berilgan vaqt</th>
                      <th style={{ ...col }}>Tugash vaqti</th>
                      <th style={{ ...col }} />
                    </tr>
                  </thead>
                  <tbody>
                    {examList.length === 0 ? (
                      <tr><td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "#9ca3af", fontSize: 14 }}>Imtihonlar mavjud emas</td></tr>
                    ) : examList.map((ex, i) => {
                      const isActive = ex.status === "active";
                      return (
                        <tr key={ex.id} onClick={() => openExamDetail(ex)} style={{ cursor: "pointer", borderTop: "1px solid var(--border, #f5f5f5)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--card, #fff)")}>
                          <td style={{ ...cell }}>{i + 1}</td>
                          <td style={{ ...cell, fontWeight: 600, color: PRIMARY }}>{ex.topic ?? ex.title ?? "—"}</td>
                          <td style={{ ...cell }}>{ex.student_count ?? "—"}</td>
                          <td style={{ ...cell, color: "#ef4444" }}>0</td>
                          <td style={{ ...cell }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: isActive ? "#16a34a" : "#6b7280", border: `1.5px solid ${isActive ? "#16a34a" : "#d1d5db"}`, padding: "3px 10px", borderRadius: 20 }}>
                              {isActive ? "Faol" : "Tugagan"}
                            </span>
                          </td>
                          <td style={{ ...cell, fontSize: 12, color: "#6b7280" }}>
                            {ex.created_at ? new Date(ex.created_at).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                          </td>
                          <td style={{ ...cell, fontSize: 12, color: "#6b7280" }}>
                            {ex.deadline ? new Date(ex.deadline).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                          </td>
                          <td style={{ ...cell, textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                            <button style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}>
                              <MoreVertIcon style={{ fontSize: 18 }} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {darsliklarTab === "imtihonlar" && examView && (
            <div>
              {/* Exam detail header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button onClick={() => setExamView(null)} style={{ border: "none", background: "none", cursor: "pointer", color: "#374151", display: "flex", padding: 4 }}>
                    <ArrowBackIcon style={{ fontSize: 20 }} />
                  </button>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--text, #111)" }}>{examView.exam.topic ?? "Imtihon"}</h3>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af" }}>
                      {examView.exam.created_at ? new Date(examView.exam.created_at).toLocaleString("uz-UZ") : ""}
                      {examView.exam.deadline ? ` — ${new Date(examView.exam.deadline).toLocaleString("uz-UZ")}` : ""}
                    </p>
                  </div>
                </div>
                <button style={{ padding: "8px 20px", border: "1.5px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
                  E&apos;lon qilish
                </button>
              </div>

              {/* Status tabs */}
              {(() => {
                const STATUS_TABS = [
                  { key: "PENDING",      label: "Kutayotganlar" },
                  { key: "REJECTED",     label: "Qaytarilganlar" },
                  { key: "ACCEPTED",     label: "Qabul qilinganlar" },
                  { key: "NOT_SUBMITTED",label: "Bajarilmagan" },
                ];
                return (
                  <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #e5e7eb", marginBottom: 18 }}>
                    {STATUS_TABS.map(({ key, label }) => (
                      <button key={key} onClick={() => fetchExamResults(key)}
                        style={{ padding: "10px 18px", border: "none", borderBottom: examView.statusTab === key ? "2.5px solid #16a34a" : "2.5px solid transparent", background: "none", cursor: "pointer", fontSize: 13, color: examView.statusTab === key ? "#16a34a" : "#6b7280", fontWeight: examView.statusTab === key ? 700 : 500, marginBottom: "-2px", whiteSpace: "nowrap" }}>
                        {label}
                      </button>
                    ))}
                  </div>
                );
              })()}

              {/* Students table */}
              <div style={{ background: "var(--card, #fff)", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                {examView.resultsLoading ? (
                  <p style={{ textAlign: "center", padding: "32px", color: "#9ca3af", fontSize: 14 }}>Yuklanmoqda...</p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "var(--hover-bg, #fafafa)" }}>
                        <th style={{ ...col }}>O&apos;quvchi ismi</th>
                        <th style={{ ...col }}>Topshirilgan vaqt</th>
                        <th style={{ ...col }}>Tekshirilgan vaqt</th>
                        <th style={{ ...col }}>Ball</th>
                        <th style={{ ...col }} />
                      </tr>
                    </thead>
                    <tbody>
                      {examView.results.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "#9ca3af", fontSize: 14 }}>Talabalar topilmadi</td></tr>
                      ) : examView.results.map((s, i) => {
                        const name = (s.fullName ?? s.full_name ?? s.name ?? `#${s.student_id ?? s.id}`);
                        const submitted = s.submitted_at ?? s.created_at;
                        const reviewed  = s.reviewed_at ?? s.updated_at;
                        return (
                          <tr key={i} style={{ borderTop: "1px solid var(--border, #f5f5f5)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--card, #fff)")}>
                            <td style={{ ...cell, fontWeight: 500, color: "var(--text, #111)" }}>{name}</td>
                            <td style={{ ...cell, fontSize: 12, color: "#6b7280" }}>
                              {submitted ? new Date(submitted).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                            </td>
                            <td style={{ ...cell, fontSize: 12, color: "#6b7280" }}>
                              {reviewed ? new Date(reviewed).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                            </td>
                            <td style={{ ...cell }}>
                              {s.grade != null ? (
                                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14, fontWeight: 700, color: "#f59e0b" }}>
                                  ⚡ {s.grade}
                                </span>
                              ) : "—"}
                            </td>
                            <td style={{ ...cell, textAlign: "right" }}>
                              <button
                                onClick={() => {
                                  const studentId = s.student_id ?? s.id;
                                  setGradeModal({ student: s, score: s.grade ?? 0, comment: "", saving: false, detail: null, detailLoading: true });
                                  api.get(`/group/${initialGroup.id}/homework/${examView.exam.id}/result/${studentId}`)
                                    .then((res) => {
                                      const d = res.data?.data;
                                      setGradeModal((p) => ({ ...p, detail: d, detailLoading: false }));
                                    })
                                    .catch(() => setGradeModal((p) => ({ ...p, detailLoading: false })));
                                }}
                                style={{ border: "1.5px solid #e5e7eb", borderRadius: 6, padding: "5px 12px", background: "#fff", fontSize: 12, cursor: "pointer", color: PRIMARY, fontWeight: 600 }}>
                                Baholash
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {darsliklarTab !== "uyga_vazifa" && darsliklarTab !== "videolar" && darsliklarTab !== "jurnal" && darsliklarTab !== "imtihonlar" && (
            <div style={{ background: "#fff", borderRadius: 14, padding: "48px 24px", textAlign: "center", color: "#9ca3af", fontSize: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#d1d5db", marginBottom: 6 }}>{DARS_TABS.find(t => t.key === darsliklarTab)?.label}</p>
              Bu bo&apos;lim tez orada qo&apos;shiladi
            </div>
          )}

          {/* Video upload modal */}
          {videoModal && (
            <>
              <div onClick={() => setVideoModal(false)} style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(0,0,0,0.35)" }} />
              <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 560, background: "var(--card, #fff)", borderRadius: 16, boxShadow: "0 12px 40px rgba(0,0,0,0.18)", zIndex: 410, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 14px" }}>
                  <p style={{ fontWeight: 700, fontSize: 16, color: "var(--text, #111)", margin: 0 }}>Qo&apos;shish</p>
                  <button onClick={() => setVideoModal(false)} style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af", display: "flex", padding: 4 }}>
                    <CloseIcon style={{ fontSize: 20 }} />
                  </button>
                </div>
                <div style={{ padding: "0 24px 24px" }}>
                  {/* Lesson ID input */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Dars ID</label>
                    <input type="number" placeholder="2" value={uploadLessonId} onChange={(e) => setUploadLessonId(e.target.value)}
                      style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }}
                      onFocus={(e) => (e.target.style.border = "1.5px solid #16a34a")}
                      onBlur={(e) => (e.target.style.border = "1.5px solid #e5e7eb")} />
                  </div>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setSelectedFile(f); }}
                    onClick={() => videoFileRef.current?.click()}
                    style={{ border: `2px dashed ${dragOver ? "#16a34a" : "#d1d5db"}`, borderRadius: 12, padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, background: dragOver ? "#f0fdf4" : "#fafafa", transition: "all 0.2s", cursor: "pointer" }}
                  >
                    <div style={{ width: 56, height: 56, borderRadius: 14, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <CloudUploadIcon style={{ fontSize: 30, color: "#16a34a" }} />
                    </div>
                    {selectedFile ? (
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#16a34a", margin: 0 }}>{selectedFile.name}</p>
                    ) : (
                      <>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text, #111)", margin: 0, textAlign: "center" }}>
                          Faylni yuklash uchun bosing yoki shu yerga olib keling
                        </p>
                        <p style={{ fontSize: 12, color: "#9ca3af", margin: 0, textAlign: "center" }}>
                          Video, rasm, hujjat formatlarini qo&apos;llab-quvvatlaydi
                        </p>
                      </>
                    )}
                  </div>
                  <input ref={videoFileRef} type="file" style={{ display: "none" }} onChange={(e) => setSelectedFile(e.target.files[0])} />
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
                    <button onClick={() => { setVideoModal(false); setSelectedFile(null); setUploadLessonId(""); }}
                      style={{ padding: "9px 24px", border: "none", background: "none", fontSize: 13, cursor: "pointer", color: "#374151", fontWeight: 500 }}>
                      Bekor qilish
                    </button>
                    {selectedFile && (
                      <button
                        disabled={uploading}
                        onClick={async () => {
                          setUploading(true);
                          try {
                            const fd = new FormData();
                            fd.append("file", selectedFile);
                            await api.post(
                              `/files/group/${initialGroup.id}/upload${uploadLessonId ? `?lessonId=${uploadLessonId}` : ""}`,
                              fd,
                              { headers: { "Content-Type": "multipart/form-data" } }
                            );
                            setVideoModal(false);
                            setSelectedFile(null);
                            setUploadLessonId("");
                            const res = await api.get(`/files/${initialGroup.id}`);
                            const data = res.data?.data ?? res.data;
                            setGroupFiles(Array.isArray(data) ? data : []);
                          } catch {
                            // silently ignore
                          } finally {
                            setUploading(false);
                          }
                        }}
                        style={{ padding: "9px 24px", border: "none", borderRadius: 8, background: uploading ? "#86efac" : "#16a34a", color: "#fff", fontSize: 13, fontWeight: 600, cursor: uploading ? "not-allowed" : "pointer", boxShadow: "0 3px 10px rgba(22,163,74,0.3)" }}>
                        {uploading ? "Yuklanmoqda..." : "Yuklash"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── AKADEMIK ── */}
      {detailTab === "akademik" && (
        <div style={{ background: "var(--card, #fff)", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f5f5f5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text, #111)" }}>Akademik davomati</span>
            <span style={{ fontSize: 13, color: "#9ca3af" }}>Jami yozuvlar: {attendance.length}</span>
          </div>
          {attendanceLoading && attendance.length === 0 ? (
            <p style={{ textAlign: "center", padding: "32px", color: "#9ca3af", fontSize: 14 }}>Yuklanmoqda...</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--hover-bg, #fafafa)" }}>
                    <th style={{ ...col }}>#</th>
                    <th style={{ ...col }}>Talaba ID</th>
                    <th style={{ ...col }}>Talaba ismi</th>
                    <th style={{ ...col }}>Holat</th>
                    <th style={{ ...col }}>Sana</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "#9ca3af", fontSize: 14 }}>Davomat ma&apos;lumotlari mavjud emas</td></tr>
                  ) : attendance.map((a, i) => {
                    const student = groupStudents.find((s) => s.id === a.student_id);
                    return (
                      <tr key={a.id}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--card, #fff)")}>
                        <td style={{ ...cell }}>{i + 1}</td>
                        <td style={{ ...cell, color: "#9ca3af", fontSize: 12 }}>#{a.student_id}</td>
                        <td style={{ ...cell, fontWeight: 500, color: "var(--text, #111)" }}>{student?.name ?? "—"}</td>
                        <td style={{ ...cell }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: a.isPresent ? "#16a34a" : "#ef4444", background: a.isPresent ? "#dcfce7" : "#fee2e2", padding: "3px 10px", borderRadius: 20 }}>
                            {a.isPresent ? "Keldi" : "Kelmadi"}
                          </span>
                        </td>
                        <td style={{ ...cell, fontSize: 12, color: "#6b7280" }}>
                          {new Date(a.created_at).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric" })}
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

      {/* Video player modal */}
      {videoPlayer && (
        <>
          <div onClick={() => { if (videoPlayer?.blobUrl) URL.revokeObjectURL(videoPlayer.blobUrl); setVideoPlayer(null); }} style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.8)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(720px, 92vw)", background: "#000", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", zIndex: 510, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#111" }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "80%" }}>
                {videoPlayer.name}
              </p>
              <button onClick={() => { if (videoPlayer?.blobUrl) URL.revokeObjectURL(videoPlayer.blobUrl); setVideoPlayer(null); }} style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af", display: "flex", padding: 4 }}>
                <CloseIcon style={{ fontSize: 20 }} />
              </button>
            </div>
            {videoPlayer.blobLoading ? (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <p style={{ color: "#9ca3af", margin: 0, fontSize: 14 }}>Video yuklanmoqda...</p>
              </div>
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
                  <a href={buildVideoUrl(videoPlayer.fileUrl)}
                    target="_blank" rel="noreferrer"
                    style={{ display: "inline-block", padding: "10px 24px", background: PRIMARY, color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                    Ochish
                  </a>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Grade modal */}
      {gradeModal && (
        <>
          <div onClick={() => setGradeModal(null)} style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.35)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 500, background: "var(--card, #fff)", borderRadius: 16, boxShadow: "0 12px 40px rgba(0,0,0,0.18)", zIndex: 510, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0" }}>
              <p style={{ fontWeight: 700, fontSize: 16, color: "var(--text, #111)", margin: 0 }}>Baholash</p>
              <button onClick={() => setGradeModal(null)} style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af", display: "flex", padding: 4 }}>
                <CloseIcon style={{ fontSize: 20 }} />
              </button>
            </div>

            {/* Student info */}
            <div style={{ padding: "16px 24px", background: "#f9fafb", borderBottom: "1px solid #f0f0f0" }}>
              <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 15, color: "var(--text, #111)" }}>
                {gradeModal.student?.fullName ?? gradeModal.student?.full_name ?? gradeModal.student?.name ?? "Talaba"}
              </p>
              <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
                <div><p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>Fayllar soni</p><p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 600, color: "var(--text, #111)" }}>{gradeModal.student?.file_count ?? 0}</p></div>
                <div><p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>Status</p>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#f59e0b", background: "#fef3c7", padding: "2px 8px", borderRadius: 12 }}>
                    {gradeModal.student?.status ?? "Kutayabti"}
                  </span>
                </div>
              </div>
              {gradeModal.detailLoading && (
                <p style={{ margin: "8px 0 0", fontSize: 12, color: "#9ca3af" }}>Javob yuklanmoqda...</p>
              )}
              {!gradeModal.detailLoading && (gradeModal.detail?.answer ?? gradeModal.student?.answer) && (
                <div style={{ marginTop: 12, padding: "10px 14px", background: "#fff", borderLeft: "3px solid #7c3aed", borderRadius: "0 8px 8px 0", fontSize: 13, color: "#374151" }}>
                  <p style={{ margin: "0 0 4px", fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>Uyga vazifa izohi:</p>
                  {gradeModal.detail?.answer ?? gradeModal.student?.answer}
                </div>
              )}
              {!gradeModal.detailLoading && gradeModal.detail?.files?.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>Fayllar ({gradeModal.detail.files.length}):</p>
                  {gradeModal.detail.files.map((f, i) => (
                    <a key={i} href={f.url ?? f.path ?? "#"} target="_blank" rel="noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: PRIMARY, padding: "3px 0", textDecoration: "none" }}>
                      📎 {f.name ?? f.filename ?? `Fayl ${i + 1}`}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: "20px 24px" }}>
              {/* Info banner */}
              <div style={{ background: "#eff6ff", borderRadius: 12, padding: "14px 16px", fontSize: 13, color: "#1d4ed8", marginBottom: 24, display: "flex", gap: 10, alignItems: "flex-start", lineHeight: 1.5 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>ⓘ</span>
                <span>60-100 oralig&apos;ida ball qo&apos;yilgan vazifa <b>&apos;Qabul qilingan&apos;</b>, 0-59 oralig&apos;ida ball qo&apos;yilgan vazifa <b>&apos;Qaytarilgan&apos;</b> hisoblanadi.</span>
              </div>

              {/* Ball */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text, #111)", margin: "0 0 16px" }}>Ball</p>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ flex: 1 }}>
                    <GradeSlider value={gradeModal.score} onChange={(v) => setGradeModal((p) => ({ ...p, score: v }))} />
                  </div>
                  <input type="number" min={0} max={100} value={gradeModal.score}
                    onChange={(e) => setGradeModal((p) => ({ ...p, score: Math.min(100, Math.max(0, Number(e.target.value))) }))}
                    style={{ width: 76, padding: "10px 8px", border: "1.5px solid #e2e8f0", borderRadius: 12, fontSize: 20, fontWeight: 700, textAlign: "center", outline: "none", background: "#fff", color: "#111", boxShadow: "0 1px 4px rgba(0,0,0,.06)" }} />
                </div>
                <p style={{ margin: "10px 0 0", fontSize: 12, color: "#9ca3af", textAlign: "center" }}>O&apos;tish bali</p>
              </div>

              {/* Comment */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ position: "relative" }}>
                  <textarea placeholder="Izohingiz..." value={gradeModal.comment}
                    onChange={(e) => setGradeModal((p) => ({ ...p, comment: e.target.value }))}
                    rows={4} style={{ width: "100%", padding: "14px 48px 14px 14px", border: "1.5px solid #e5e7eb", borderRadius: 12, fontSize: 14, outline: "none", boxSizing: "border-box", resize: "none", fontFamily: "inherit", color: "var(--text, #374151)", background: "var(--input-bg, #fff)", lineHeight: 1.6 }}
                    onFocus={(e) => (e.target.style.border = "1.5px solid #16a34a")}
                    onBlur={(e) => (e.target.style.border = "1.5px solid #e5e7eb")} />
                  <button style={{ position: "absolute", right: 10, bottom: 10, width: 32, height: 32, borderRadius: "50%", background: "#16a34a", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V6zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setGradeModal(null)} style={{ flex: 1, padding: "12px", border: "1.5px solid #e5e7eb", borderRadius: 10, background: "var(--card, #fff)", fontSize: 14, cursor: "pointer", color: "var(--text, #374151)", fontWeight: 600 }}>Bekor qilish</button>
                <button onClick={handleGrade} disabled={gradeModal.saving}
                  style={{ flex: 2, padding: "12px", border: "none", borderRadius: 10, background: gradeModal.saving ? "#86efac" : "#16a34a", color: "#fff", fontSize: 14, fontWeight: 700, cursor: gradeModal.saving ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(22,163,74,.3)" }}>
                  {gradeModal.saving ? "Yuklanmoqda..." : "Yuborish"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Homework results modal */}
      {hwResultModal.open && (
        <>
          <div onClick={() => setHwResultModal((p) => ({ ...p, open: false }))} style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.35)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 480, maxHeight: "80vh", background: "var(--card, #fff)", borderRadius: 16, boxShadow: "0 12px 40px rgba(0,0,0,0.18)", zIndex: 510, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px 14px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0" }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 16, color: "var(--text, #111)", margin: 0 }}>Uy vazifa natijalari</p>
                <p style={{ fontSize: 12, color: "#9ca3af", margin: "4px 0 0" }}>{hwResultModal.hw?.mavzu}</p>
              </div>
              <button onClick={() => setHwResultModal((p) => ({ ...p, open: false }))} style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af", display: "flex", padding: 4 }}>
                <CloseIcon style={{ fontSize: 20 }} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {hwResultModal.loading ? (
                <p style={{ textAlign: "center", padding: "32px", color: "#9ca3af", fontSize: 14 }}>Yuklanmoqda...</p>
              ) : hwResultModal.results.length === 0 ? (
                <p style={{ textAlign: "center", padding: "32px", color: "#9ca3af", fontSize: 14 }}>Hali natijalar yo&apos;q</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "var(--hover-bg, #fafafa)" }}>
                      <th style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600, padding: "10px 16px", textAlign: "left" }}>#</th>
                      <th style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600, padding: "10px 16px", textAlign: "left" }}>Talaba</th>
                      <th style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600, padding: "10px 16px", textAlign: "left" }}>Holat</th>
                      <th style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600, padding: "10px 16px", textAlign: "left" }}>Ball</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hwResultModal.results.map((s, i) => {
                      const name = s.fullName ?? s.full_name ?? s.name ?? `Talaba #${s.student_id ?? s.id}`;
                      const status = s.status ?? "—";
                      const statusColor = status === "ACCEPTED" ? "#16a34a" : status === "REJECTED" ? "#ef4444" : "#f59e0b";
                      const statusBg   = status === "ACCEPTED" ? "#dcfce7"  : status === "REJECTED" ? "#fee2e2"  : "#fef3c7";
                      return (
                        <tr key={i} style={{ borderTop: "1px solid var(--border, #f5f5f5)" }}>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "#9ca3af" }}>{i + 1}</td>
                          <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 500, color: "var(--text, #111)" }}>{name}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: statusColor, background: statusBg, padding: "3px 10px", borderRadius: 20 }}>{status}</span>
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>{s.grade ?? s.score ?? "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {/* Homework create drawer */}
      {hwDrawer && <div onClick={() => setHwDrawer(false)} style={{ position: "fixed", inset: 0, zIndex: 290, background: "rgba(0,0,0,0.2)" }} />}
      <div className="side-drawer" style={{ right: hwDrawer ? 0 : -420, width: 360, boxShadow: "-6px 0 30px rgba(0,0,0,0.12)", borderRadius: "16px 0 0 16px" }}>
        <div style={{ padding: "20px 24px 14px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 16, color: "var(--text, #111)", margin: 0 }}>Uy vazifa qo&apos;shish</p>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: "4px 0 0" }}>{group.name} guruhiga</p>
          </div>
          <button onClick={() => setHwDrawer(false)} style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af", display: "flex", padding: 4 }}>
            <CloseIcon style={{ fontSize: 20 }} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Dars ID <span style={{ color: "#ef4444" }}>*</span></label>
            <input type="number" placeholder="14" value={hwForm.lesson_id} onChange={(e) => setHwForm((p) => ({ ...p, lesson_id: e.target.value }))}
              style={inputSx} onFocus={focusBorder} onBlur={blurBorder} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Sarlavha <span style={{ color: "#ef4444" }}>*</span></label>
            <input placeholder="HTML asoslari" value={hwForm.title} onChange={(e) => setHwForm((p) => ({ ...p, title: e.target.value }))}
              style={inputSx} onFocus={focusBorder} onBlur={blurBorder} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Fayl (ixtiyoriy)</label>
            <input type="file" onChange={(e) => setHwForm((p) => ({ ...p, file: e.target.files[0] ?? null }))}
              style={{ ...inputSx, padding: "8px 12px", cursor: "pointer" }} />
            {hwForm.file && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#16a34a" }}>📎 {hwForm.file.name}</p>}
          </div>
        </div>
        <div style={{ padding: "14px 24px", borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button onClick={() => setHwDrawer(false)} style={{ padding: "9px 24px", border: "1.5px solid #e5e7eb", borderRadius: 8, background: "var(--card, #fff)", fontSize: 13, cursor: "pointer", color: "var(--text, #374151)", fontWeight: 500 }}>Bekor qilish</button>
          <button onClick={handleSaveHw} disabled={hwSaving} style={{ padding: "9px 24px", border: "none", borderRadius: 8, background: hwSaving ? "#a78bfa" : PRIMARY, color: "#fff", fontSize: 13, fontWeight: 600, cursor: hwSaving ? "not-allowed" : "pointer" }}>
            {hwSaving ? "Saqlanmoqda..." : "E'lon qilish"}
          </button>
        </div>
      </div>

      {/* Lesson create drawer */}
      {lessonDrawer && <div onClick={() => setLessonDrawer(false)} style={{ position: "fixed", inset: 0, zIndex: 290, background: "rgba(0,0,0,0.2)" }} />}
      <div className="side-drawer" style={{ right: lessonDrawer ? 0 : -420, width: 360, boxShadow: "-6px 0 30px rgba(0,0,0,0.12)", borderRadius: "16px 0 0 16px" }}>
        <div style={{ padding: "20px 24px 14px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 16, color: "var(--text, #111)", margin: 0 }}>Dars qo&apos;shish</p>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: "4px 0 0" }}>{group.name} guruhiga yangi dars</p>
          </div>
          <button onClick={() => setLessonDrawer(false)} style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af", display: "flex", padding: 4 }}>
            <CloseIcon style={{ fontSize: 20 }} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Mavzu <span style={{ color: "#ef4444" }}>*</span></label>
            <input placeholder="HTML asoslari" value={lessonForm.topic} onChange={(e) => setLessonForm((p) => ({ ...p, topic: e.target.value }))}
              style={inputSx} onFocus={focusBorder} onBlur={blurBorder} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Tavsif</label>
            <textarea placeholder="Dars haqida qo'shimcha ma'lumot..." value={lessonForm.description} onChange={(e) => setLessonForm((p) => ({ ...p, description: e.target.value }))} rows={3}
              style={{ ...inputSx, resize: "vertical", fontFamily: "inherit" }} onFocus={focusBorder} onBlur={blurBorder} />
          </div>
        </div>
        <div style={{ padding: "14px 24px", borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button onClick={() => setLessonDrawer(false)} style={{ padding: "9px 24px", border: "1.5px solid #e5e7eb", borderRadius: 8, background: "var(--card, #fff)", fontSize: 13, cursor: "pointer", color: "var(--text, #374151)", fontWeight: 500 }}>Bekor qilish</button>
          <button onClick={handleSaveLesson} disabled={savingLesson} style={{ padding: "9px 24px", border: "none", borderRadius: 8, background: savingLesson ? "#a78bfa" : PRIMARY, color: "#fff", fontSize: 13, fontWeight: 600, cursor: savingLesson ? "not-allowed" : "pointer" }}>
            {savingLesson ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
      </div>

      {/* Add student to group modal */}
      {addStudentModal && (
        <>
          <div onClick={() => setAddStudentModal(false)} style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.35)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 340, background: "var(--card, #fff)", borderRadius: 14, boxShadow: "0 12px 40px rgba(0,0,0,0.18)", zIndex: 510, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "20px 20px 12px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 16, color: "var(--text, #111)", margin: 0 }}>Talaba qo&apos;shish</p>
                <p style={{ fontSize: 12, color: "#9ca3af", margin: "4px 0 0" }}>{group.name} guruhiga talaba qo&apos;shish</p>
              </div>
              <button onClick={() => setAddStudentModal(false)} style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af", padding: 2, display: "flex" }}>
                <CloseIcon style={{ fontSize: 20 }} />
              </button>
            </div>
            <div style={{ padding: "0 16px 10px" }}>
              <div style={{ position: "relative" }}>
                <SearchIcon style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#9ca3af" }} />
                <input placeholder="Talaba qidirish..." value={studentModalSearch} onChange={(e) => setStudentModalSearch(e.target.value)} autoFocus
                  style={{ width: "100%", padding: "8px 12px 8px 32px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => (e.target.style.border = `1.5px solid ${PRIMARY}`)} onBlur={(e) => (e.target.style.border = "1.5px solid #e5e7eb")} />
              </div>
            </div>
            <div style={{ maxHeight: 280, overflowY: "auto", borderTop: "1px solid var(--border, #f5f5f5)", borderBottom: "1px solid #f5f5f5" }}>
              {filteredStudentsForModal.length === 0 ? (
                <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "20px 0" }}>Topilmadi</p>
              ) : filteredStudentsForModal.map((s) => {
                const name = s.fullName ?? s.full_name ?? s.name ?? "—";
                const isSelected = selectedStudentId === s.id;
                return (
                  <div key={s.id} onClick={() => setSelectedStudentId(s.id)}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", cursor: "pointer", borderBottom: "1px solid #f9f9f9", background: isSelected ? "#f5f3ff" : "transparent" }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#fafafa"; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: isSelected ? "none" : "1.5px solid #d1d5db", backgroundColor: isSelected ? PRIMARY : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" }}>
                      {isSelected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                    </div>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{name[0]}</div>
                    <span style={{ fontSize: 13.5, color: "var(--text, #111)", fontWeight: isSelected ? 600 : 400 }}>{name}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ padding: "14px 20px", display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setAddStudentModal(false)} style={{ padding: "8px 20px", border: "1.5px solid #e5e7eb", borderRadius: 8, background: "var(--card, #fff)", fontSize: 13, cursor: "pointer", color: "var(--text, #374151)", fontWeight: 500 }}>Bekor qilish</button>
              <button onClick={handleAddStudent} disabled={!selectedStudentId || addingStudent}
                style={{ padding: "8px 20px", border: "none", borderRadius: 8, background: selectedStudentId ? PRIMARY : "#d1d5db", color: "#fff", fontSize: 13, fontWeight: 600, cursor: selectedStudentId ? "pointer" : "not-allowed" }}>
                {addingStudent ? "Qo'shilmoqda..." : "Qo'shish"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const mapGroup = (g) => ({
  id: g.id,
  active: g.isActive ?? g.active ?? true,
  name: g.name ?? "—",
  kurs: g.course?.name ?? g.kurs ?? "—",
  davomiyligi: g.duration_month ? `${g.duration_month} oy` : (g.davomiyligi ?? "—"),
  vaqt: g.start_time ?? g.startTime ?? g.vaqt ?? "—",
  kunlar: Array.isArray(g.days) ? g.days.map((d) => d.slice(0, 2)) : (g.kunlar ?? []),
  xona: g.room?.name ?? g.xona ?? "—",
  oqituvchi: g.teacher?.fullName ?? g.teacher?.full_name ?? g.oqituvchi ?? "—",
  talabalar: g.studentsCount ?? g.students_count ?? g.talabalar ?? 0,
});

/* ════════════════════ MAIN ════════════════════ */
export default function Guruhlar({ darkMode, onGroupSelect }) {
  const [groups, setGroups]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState("guruhlar");
  const [teacherCount, setTeacherCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [coursesList, setCoursesList] = useState([]);
  const [roomsList, setRoomsList] = useState([]);
  const [apiTeachers, setApiTeachers] = useState([]);
  const [apiStudents, setApiStudents] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Refresh da saqlash + URL yangilash
  useEffect(() => {
    if (selectedGroup) {
      sessionStorage.setItem("guruhlar_selected_id", String(selectedGroup.id));
      onGroupSelect?.(selectedGroup.id);
    } else {
      sessionStorage.removeItem("guruhlar_selected_id");
      onGroupSelect?.(null);
    }
  }, [selectedGroup]);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({ name: "", kurs: "", xona: "", kunlar: [], vaqt: "09:00", boshlanish: "", tavsif: "", talabalar: [], oqituvchilar: [] });
  const [editId, setEditId]         = useState(null);
  const [formError, setFormError]   = useState("");
  const [addModal, setAddModal]     = useState(null);
  const [modalSearch, setModalSearch] = useState("");
  const [tempSel, setTempSel]       = useState([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const endpoint = tab === "arxiv" ? "/groups/archive" : "/groups/all";
    api.get(endpoint)
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.data ?? res.data;
        const mapped = (Array.isArray(data) ? data : []).map(mapGroup);
        setGroups(mapped);
        setLoading(false);

        // Refresh: sessionStorage dan guruhni tiklash
        const savedId = sessionStorage.getItem("guruhlar_selected_id");
        if (savedId) {
          const found = mapped.find((g) => String(g.id) === savedId);
          if (found) {
            setSelectedGroup(found);
          } else {
            // Guruh list da yo'q bo'lsa, to'g'ridan fetch
            api.get(`/groups/one/${savedId}`)
              .then((r) => {
                const d = r.data?.data ?? r.data;
                if (d?.id) setSelectedGroup(mapGroup(d));
                else sessionStorage.removeItem("guruhlar_selected_id");
              })
              .catch(() => sessionStorage.removeItem("guruhlar_selected_id"));
          }
        }
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tab]);

  useEffect(() => {
    api.get("/teachers")
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setTeacherCount(Array.isArray(data) ? data.length : 0);
      })
      .catch(() => {});
    api.get("/students")
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setStudentCount(Array.isArray(data) ? data.length : 0);
      })
      .catch(() => {});
  }, []);

  const set   = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const toggleKun = (k) => set("kunlar", form.kunlar.includes(k) ? form.kunlar.filter((x) => x !== k) : [...form.kunlar, k]);

  const openAddModal = (type) => { setTempSel(type === "talaba" ? [...form.talabalar] : [...form.oqituvchilar]); setModalSearch(""); setAddModal(type); };
  const closeAddModal = () => setAddModal(null);
  const toggleTempSel = (item) => setTempSel((p) => p.find((x) => x.id === item.id) ? p.filter((x) => x.id !== item.id) : [...p, item]);
  const confirmModal  = () => { if (addModal === "talaba") set("talabalar", tempSel); if (addModal === "oqituvchi") set("oqituvchilar", tempSel); closeAddModal(); };
  const modalList = () => {
    const raw = addModal === "talaba" ? apiStudents : apiTeachers;
    const list = raw.length > 0
      ? raw.map((x) => ({ id: x.id, name: x.full_name ?? x.name ?? "—" }))
      : (addModal === "talaba" ? TALABALAR_LIST : OQITUVCHILAR_LIST).map((n) => ({ id: n, name: n }));
    return list.filter((x) => x.name.toLowerCase().includes(modalSearch.toLowerCase()));
  };

  const loadDrawerData = () => {
    if (coursesList.length === 0)
      api.get("/courses").then((r) => { const d = r.data?.data ?? r.data; setCoursesList(Array.isArray(d) ? d : []); }).catch(() => {});
    if (roomsList.length === 0)
      api.get("/rooms").then((r) => { const d = r.data?.data ?? r.data; setRoomsList(Array.isArray(d) ? d : []); }).catch(() => {});
    if (apiTeachers.length === 0)
      api.get("/teachers").then((r) => { const d = r.data?.data ?? r.data; setApiTeachers(Array.isArray(d) ? d : []); }).catch(() => {});
    if (apiStudents.length === 0)
      api.get("/students").then((r) => { const d = r.data?.data ?? r.data; setApiStudents(Array.isArray(d) ? d : []); }).catch(() => {});
  };

  const openDrawer     = () => { setEditId(null); setForm({ name: "", kurs: "", xona: "", kunlar: [], vaqt: "09:00", boshlanish: "", tavsif: "", talabalar: [], oqituvchilar: [] }); setDrawerOpen(true); loadDrawerData(); };
  const openEditDrawer = (g) => { setEditId(g.id); setForm({ name: g.name, kurs: "", xona: "", kunlar: [], vaqt: g.vaqt !== "—" ? g.vaqt : "09:00", boshlanish: "", tavsif: "", talabalar: [], oqituvchilar: [] }); setDrawerOpen(true); loadDrawerData(); };
  const closeDrawer    = () => { setDrawerOpen(false); setEditId(null); setFormError(""); };

  const DAY_MAP = {
    "Dushanba": "MONDAY", "Seshanba": "TUESDAY", "Chorshanba": "WEDNESDAY",
    "Payshanba": "THURSDAY", "Juma": "FRIDAY", "Shanba": "SATURDAY", "Yakshanba": "SUNDAY",
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError("Guruh nomi majburiy"); return; }
    setFormError("");

    // Faqat to'ldirilgan maydonlarni yuborish
    const body = { name: form.name, max_student: 20 };
    if (form.tavsif)       body.description  = form.tavsif;
    if (Number(form.kurs)) body.course_id     = Number(form.kurs);
    if (Number(form.xona)) body.room_id       = Number(form.xona);
    if (form.boshlanish)   body.start_date    = form.boshlanish;
    if (form.vaqt)         body.start_time    = form.vaqt;
    if (form.kunlar.length) body.week_day     = form.kunlar.map((k) => DAY_MAP[k] ?? k.toUpperCase());
    const teacherIds = form.oqituvchilar.map((x) => typeof x === "object" ? x.id : Number(x)).filter(Boolean);
    const studentIds = form.talabalar.map((x) => typeof x === "object" ? x.id : Number(x)).filter(Boolean);
    if (teacherIds.length) body.teachers = teacherIds;
    if (studentIds.length) body.students = studentIds;

    try {
      if (editId) {
        await api.patch(`/groups/${editId}`, body);
      } else {
        await api.post("/groups", body);
      }
      closeDrawer();
      setLoading(true);
      api.get("/groups/all")
        .then((res) => {
          const data = res.data?.data ?? res.data;
          setGroups((Array.isArray(data) ? data : []).map(mapGroup));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } catch (err) {
      const msg = err?.response?.data?.message;
      setFormError(Array.isArray(msg) ? msg.join(", ") : (msg ?? "Xatolik yuz berdi"));
    }
  };

  const toggleActive = (id) => setGroups((p) => p.map((g) => g.id === id ? { ...g, active: !g.active } : g));

  const handleDelete = () => {
    if (!deleteId) return;
    api.delete(`/groups/${deleteId}`)
      .then(() => {
        setGroups((p) => p.filter((g) => g.id !== deleteId));
        setDeleteId(null);
      })
      .catch(() => setDeleteId(null));
  };

  const col  = { fontSize: 12, color: "var(--text-muted, #9ca3af)", fontWeight: 500, padding: "10px 14px", textAlign: "left", whiteSpace: "nowrap" };
  const cell = { fontSize: 13, color: "var(--text, #374151)", padding: "14px 14px", verticalAlign: "middle" };

  if (selectedGroup) return <GroupDetail group={selectedGroup} onBack={() => setSelectedGroup(null)} />;

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text, #111)", margin: 0 }}>Guruhlar</h1>
        <button onClick={openDrawer} style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: PRIMARY, color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 3px 10px rgba(124,58,237,0.25)" }}>
          <AddIcon style={{ fontSize: 17 }} /> Guruh qo&apos;shish
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "2px solid #e5e7eb", marginBottom: 20 }}>
        {[{ key: "guruhlar", label: "Guruhlar" }, { key: "arxiv", label: "Arxiv", icon: <CalendarTodayIcon style={{ fontSize: 14 }} /> }].map(({ key, label, icon }) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "9px 18px", border: "none", borderBottom: tab === key ? `2.5px solid ${PRIMARY}` : "2.5px solid transparent", background: "none", cursor: "pointer", fontSize: 13.5, color: tab === key ? PRIMARY : "#6b7280", fontWeight: tab === key ? 600 : 400, marginBottom: "-2px", transition: "color .15s" }}>
            {icon}{label}
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="guruh-stats">
        <StatCard icon={GroupsIcon}         label="Jami guruhlar" value={groups.length} />
        <StatCard icon={PersonOutlineIcon}  label="O'qituvchilar" value={teacherCount} />
        <StatCard icon={SchoolOutlinedIcon} label="O'quvchilar"   value={studentCount} avatars={AVATAR_COLORS} />
      </div>

      {/* Table */}
      <div style={{ background: "var(--card, #fff)", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,.06)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--hover-bg, #fafafa)" }}>
                <th style={{ ...col }}>Status</th>
                <th style={{ ...col }}>Guruh nomi</th>
                <th style={{ ...col }}>Kurs</th>
                <th style={{ ...col }}>Davomiyligi</th>
                <th style={{ ...col }}>Dars vaqti</th>
                <th style={{ ...col }}>Xona</th>
                <th style={{ ...col }}>O&apos;qituvchi</th>
                <th style={{ ...col }}>Talabalar</th>
                <th style={{ ...col, textAlign: "right", paddingRight: 16 }}>
                  <RefreshIcon style={{ fontSize: 16, cursor: "pointer", color: "#9ca3af" }} />
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: "32px", color: "#9ca3af", fontSize: 14 }}>Yuklanmoqda...</td></tr>
              )}
              {!loading && groups.map((g) => (
                <tr key={g.id} style={{ borderTop: "1px solid var(--border, #f5f5f5)", cursor: "pointer" }}
                  onClick={() => setSelectedGroup(g)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--card, #fff)")}>
                  <td style={{ ...cell }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Toggle on={g.active} onChange={() => toggleActive(g.id)} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: g.active ? "#16a34a" : "#9ca3af" }}>{g.active ? "FAOL" : "NOFAOL"}</span>
                    </div>
                  </td>
                  <td style={{ ...cell, fontWeight: 600, color: PRIMARY }}>{g.name}</td>
                  <td style={{ ...cell }}><span style={{ fontSize: 12, fontWeight: 600, color: PRIMARY }}>{g.kurs}</span></td>
                  <td style={{ ...cell }}>{g.davomiyligi}</td>
                  <td style={{ ...cell }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, color: "var(--text, #111)" }}>{g.vaqt}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9ca3af" }}>{g.kunlar.join(", ")}</p>
                    </div>
                  </td>
                  <td style={{ ...cell }}>{g.xona}</td>
                  <td style={{ ...cell }}>{g.oqituvchi}</td>
                  <td style={{ ...cell, fontWeight: 600, color: "var(--text, #111)" }}>{g.talabalar}</td>
                  <td style={{ ...cell, textAlign: "right", paddingRight: 16 }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                      <button onClick={() => openEditDrawer(g)} style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = PRIMARY)}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}>
                        <EditOutlinedIcon style={{ fontSize: 17 }} />
                      </button>
                      <button onClick={() => setDeleteId(g.id)} style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}>
                        <MoreVertIcon style={{ fontSize: 18 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirm */}
      {deleteId && (
        <>
          <div onClick={() => setDeleteId(null)} style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.35)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 360, background: "var(--card, #fff)", borderRadius: 14, boxShadow: "0 12px 40px rgba(0,0,0,0.18)", zIndex: 510, padding: "28px 28px 22px" }}>
            <p style={{ fontWeight: 700, fontSize: 16, color: "var(--text, #111)", margin: "0 0 8px" }}>Guruhni o&apos;chirish</p>
            <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 24px" }}>Haqiqatan ham bu guruhni o&apos;chirmoqchimisiz? Bu amalni bekor qilib bo&apos;lmaydi.</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{ padding: "9px 22px", border: "1.5px solid #e5e7eb", borderRadius: 8, background: "var(--card, #fff)", fontSize: 13, cursor: "pointer", color: "var(--text, #374151)", fontWeight: 500 }}>Bekor qilish</button>
              <button onClick={handleDelete} style={{ padding: "9px 22px", border: "none", borderRadius: 8, background: "#ef4444", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>O&apos;chirish</button>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {addModal && (
        <>
          <div onClick={closeAddModal} style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(0,0,0,0.35)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 320, background: "var(--card, #fff)", borderRadius: 14, boxShadow: "0 12px 40px rgba(0,0,0,0.18)", zIndex: 410, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "20px 20px 12px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 16, color: "var(--text, #111)", margin: 0 }}>{addModal === "talaba" ? "Talaba qo'shish" : "O'qituvchi qo'shish"}</p>
                <p style={{ fontSize: 12, color: "#9ca3af", margin: "4px 0 0" }}>{addModal === "talaba" ? "Bitta yoki bir nechta talabani tanlang" : "Bitta yoki bir nechta o'qituvchini tanlang"}</p>
              </div>
              <button onClick={closeAddModal} style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af", padding: 2, display: "flex" }}><CloseIcon style={{ fontSize: 20 }} /></button>
            </div>
            <div style={{ padding: "0 16px 10px" }}>
              <div style={{ position: "relative" }}>
                <SearchIcon style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#9ca3af" }} />
                <input placeholder={addModal === "talaba" ? "Talaba qidirish..." : "O'qituvchi qidirish..."} value={modalSearch} onChange={(e) => setModalSearch(e.target.value)} autoFocus
                  style={{ width: "100%", padding: "8px 12px 8px 32px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => (e.target.style.border = `1.5px solid ${PRIMARY}`)} onBlur={(e) => (e.target.style.border = "1.5px solid #e5e7eb")} />
              </div>
            </div>
            <div style={{ maxHeight: 260, overflowY: "auto", borderTop: "1px solid var(--border, #f5f5f5)", borderBottom: "1px solid #f5f5f5" }}>
              {modalList().length === 0 ? (
                <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "20px 0" }}>Topilmadi</p>
              ) : modalList().map((item) => {
                const checked = !!tempSel.find((x) => x.id === item.id);
                return (
                  <div key={item.id} onClick={() => toggleTempSel(item)}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", cursor: "pointer", borderBottom: "1px solid #f9f9f9" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, border: checked ? "none" : "1.5px solid #d1d5db", backgroundColor: checked ? PRIMARY : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" }}>
                      {checked && <svg width="10" height="10" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
                    </div>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{item.name[0]}</div>
                    <span style={{ fontSize: 13.5, color: "var(--text, #111)", fontWeight: checked ? 600 : 400 }}>{item.name}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ padding: "14px 20px", display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={closeAddModal} style={{ padding: "8px 20px", border: "1.5px solid #e5e7eb", borderRadius: 8, background: "var(--card, #fff)", fontSize: 13, cursor: "pointer", color: "var(--text, #374151)", fontWeight: 500 }}>Bekor qilish</button>
              <button onClick={confirmModal} style={{ padding: "8px 20px", border: "none", borderRadius: 8, background: PRIMARY, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Saqlash</button>
            </div>
          </div>
        </>
      )}

      {/* Drawer */}
      {drawerOpen && <div onClick={closeDrawer} style={{ position: "fixed", inset: 0, zIndex: 290, background: "rgba(0,0,0,0.2)" }} />}
      <div className="side-drawer" style={{ right: drawerOpen ? 0 : -420, width: 360, boxShadow: "-6px 0 30px rgba(0,0,0,0.12)", borderRadius: "16px 0 0 16px" }}>
        <div style={{ padding: "20px 24px 14px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 16, color: "var(--text, #111)", margin: 0 }}>{editId ? "Guruhni tahrirlash" : "Guruh qo’shish"}</p>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: "4px 0 0" }}>{editId ? "Guruh ma‘lumotlarini yangilang." : "Yangi guruh yaratish uchun quyidagi ma‘lumotlarni kiriting."}</p>
          </div>
          <button onClick={closeDrawer} style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af", display: "flex", padding: 4 }}><CloseIcon style={{ fontSize: 20 }} /></button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <FInput label="Guruh nomi" required><input placeholder="Frontend 2024" value={form.name} onChange={(e) => set("name", e.target.value)} style={inputSx} onFocus={focusBorder} onBlur={blurBorder} /></FInput>
          <FInput label="Kurs" required>
            <div style={{ position: "relative" }}>
              <select value={form.kurs} onChange={(e) => set("kurs", e.target.value)} style={{ ...inputSx, appearance: "none", WebkitAppearance: "none", paddingRight: 36, cursor: "pointer" }} onFocus={focusBorder} onBlur={blurBorder}>
                <option value="">Tanlang</option>
                {coursesList.length > 0
                  ? coursesList.map((c) => <option key={c.id} value={c.id}>{c.name ?? c.title}</option>)
                  : KURS_LIST.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af", fontSize: 12 }}>▼</span>
            </div>
          </FInput>
          <FInput label="Xona" required>
            <div style={{ position: "relative" }}>
              <select value={form.xona} onChange={(e) => set("xona", e.target.value)} style={{ ...inputSx, appearance: "none", WebkitAppearance: "none", paddingRight: 36, cursor: "pointer" }} onFocus={focusBorder} onBlur={blurBorder}>
                <option value="">Tanlang</option>
                {roomsList.length > 0
                  ? roomsList.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)
                  : XONA_LIST.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af", fontSize: 12 }}>▼</span>
            </div>
          </FInput>
          <FInput label="Dars kunlari" required>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px", padding: "4px 0" }}>
              {KUNLAR.map((k) => <DayCB key={k} label={k} checked={form.kunlar.includes(k)} onChange={() => toggleKun(k)} />)}
            </div>
          </FInput>
          <FInput label="Dars vaqti" required><input type="time" value={form.vaqt} onChange={(e) => set("vaqt", e.target.value)} style={inputSx} onFocus={focusBorder} onBlur={blurBorder} /></FInput>
          <FInput label="Boshlanish sanasi" required><input type="date" value={form.boshlanish} onChange={(e) => set("boshlanish", e.target.value)} style={inputSx} onFocus={focusBorder} onBlur={blurBorder} /></FInput>
          <FInput label="Tavsif"><textarea placeholder="Guruh haqida qo'shimcha ma'lumot" value={form.tavsif} onChange={(e) => set("tavsif", e.target.value)} rows={3} style={{ ...inputSx, resize: "vertical", fontFamily: "inherit" }} onFocus={focusBorder} onBlur={blurBorder} /></FInput>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 8 }}>O&apos;qituvchilar</label>
            {form.oqituvchilar.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                {form.oqituvchilar.map((item) => {
                  const label = typeof item === "object" ? item.name : item;
                  const key = typeof item === "object" ? item.id : item;
                  return (
                    <span key={key} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 6, background: "#6d28d9", color: "#fff", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                      {label}<button onClick={() => set("oqituvchilar", form.oqituvchilar.filter((x) => (typeof x === "object" ? x.id : x) !== key))} style={{ border: "none", background: "none", cursor: "pointer", color: "#fff", padding: 0, fontSize: 14, lineHeight: 1 }}>×</button>
                    </span>
                  );
                })}
              </div>
            )}
            <button onClick={() => openAddModal("oqituvchi")} style={{ display: "flex", alignItems: "center", gap: 5, border: "none", background: "none", color: PRIMARY, fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0 }}><AddIcon style={{ fontSize: 16 }} /> Qo&apos;shish</button>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 8 }}>Talabalar</label>
            {form.talabalar.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                {form.talabalar.map((item) => {
                  const label = typeof item === "object" ? item.name : item;
                  const key = typeof item === "object" ? item.id : item;
                  return (
                    <span key={key} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 6, background: "#6d28d9", color: "#fff", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                      {label}<button onClick={() => set("talabalar", form.talabalar.filter((x) => (typeof x === "object" ? x.id : x) !== key))} style={{ border: "none", background: "none", cursor: "pointer", color: "#fff", padding: 0, fontSize: 14, lineHeight: 1 }}>×</button>
                    </span>
                  );
                })}
              </div>
            )}
            <button onClick={() => openAddModal("talaba")} style={{ display: "flex", alignItems: "center", gap: 5, border: "none", background: "none", color: PRIMARY, fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0 }}><AddIcon style={{ fontSize: 16 }} /> Qo&apos;shish</button>
          </div>
        </div>
        <div style={{ padding: "14px 24px", borderTop: "1px solid #f0f0f0" }}>
          {formError && <p style={{ fontSize: 12, color: "#ef4444", margin: "0 0 10px" }}>{formError}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button onClick={closeDrawer} style={{ padding: "9px 24px", border: "1.5px solid #e5e7eb", borderRadius: 8, background: "var(--card, #fff)", fontSize: 13, cursor: "pointer", color: "var(--text, #374151)", fontWeight: 500 }}>Bekor qilish</button>
            <button onClick={handleSave} style={{ padding: "9px 24px", border: "none", borderRadius: 8, background: PRIMARY, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 3px 10px rgba(124,58,237,0.3)" }}>{editId ? "Yangilash" : "Saqlash"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
