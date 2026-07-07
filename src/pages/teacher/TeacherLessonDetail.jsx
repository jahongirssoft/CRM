import { useState, useEffect } from "react";
import api from "../../api/axios";
import { imgUrl } from "../../api/fileUrl";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const PRIMARY = "#7c3aed";
const MONTH_IDX = { January: 0, February: 1, March: 2, April: 3, May: 4, June: 5, July: 6, August: 7, September: 8, October: 9, November: 10, December: 11 };
const MONTH_NUM = { January: "01", February: "02", March: "03", April: "04", May: "05", June: "06", July: "07", August: "08", September: "09", October: "10", November: "11", December: "12" };

export default function TeacherLessonDetail({ group, day: initialDay, schedules = [], darkMode = false, onBack }) {
  const t = darkMode
    ? { card: "#1e293b", border: "#334155", text: "#f1f5f9", textSec: "#cbd5e1", textMuted: "#94a3b8", bg: "#0f172a", divider: "#243045", past: "#243045", input: "#0f172a" }
    : { card: "#ffffff", border: "#e5e7eb", text: "#111827", textSec: "#374151", textMuted: "#6b7280", bg: "#f6f7fb", divider: "#f5f5f5", past: "#f3f4f6", input: "#ffffff" };

  const gid = group?.id;
  const [day, setDay] = useState(initialDay); // {day, month}
  const [loading, setLoading] = useState(true);
  const [lessonId, setLessonId] = useState(null);
  const [mavzu, setMavzu] = useState("");
  const [tavsif, setTavsif] = useState("");
  const [mavzuType, setMavzuType] = useState("boshqa");
  const [rows, setRows] = useState([]); // [{student_id, full_name, photo}]
  const [present, setPresent] = useState({}); // student_id -> bool
  const [attIds, setAttIds] = useState({}); // student_id -> attendance record id
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const YEAR = new Date().getFullYear();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dateStrOf = (d) => `${YEAR}-${MONTH_NUM[d.month] ?? "01"}-${String(d.day).padStart(2, "0")}`;
  const dateObjOf = (d) => new Date(YEAR, MONTH_IDX[d.month] ?? 0, d.day);
  const isFuture = (d) => dateObjOf(d) > today;

  // Tanlangan kun uchun dars + davomatni yuklaymiz
  useEffect(() => {
    if (!gid || !day) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    const dateStr = dateStrOf(day);
    Promise.all([
      api.get(`/groups/${gid}/lesson`, { params: { date: dateStr } }).catch(() => ({ data: {} })),
      api.get("/attendance/all").catch(() => ({ data: [] })),
    ]).then(([lRes, aRes]) => {
      if (cancelled) return;
      const ld = lRes.data?.data ?? lRes.data ?? {};
      const lesson = ld.lesson ?? null;
      const att = Array.isArray(ld.attendance) ? ld.attendance : [];
      setLessonId(lesson?.id ?? null);
      setMavzu(lesson?.topic ?? "");
      setTavsif(lesson?.description ?? "");
      setRows(att.map((a) => ({ student_id: a.student_id, full_name: a.full_name ?? "—", photo: a.photo })));
      const pmap = {};
      att.forEach((a) => { pmap[a.student_id] = !!a.isPresent; });
      setPresent(pmap);
      // attendance record id lar (shu sana bo'yicha) — PATCH uchun
      const all = aRes.data?.data ?? aRes.data ?? [];
      const mi = MONTH_IDX[day.month] ?? 0;
      const idMap = {};
      (Array.isArray(all) ? all : [])
        .filter((r) => Number(r.group_id) === Number(gid))
        .forEach((r) => {
          const rd = new Date(r.created_at);
          if (rd.getUTCDate() === day.day && rd.getUTCMonth() === mi && r.id) idMap[r.student_id] = r.id;
        });
      setAttIds(idMap);
      setLoading(false);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gid, day]);

  const toggle = (sid) => setPresent((p) => ({ ...p, [sid]: !p[sid] }));

  const handleSave = async () => {
    if (!mavzu.trim()) { setError("Mavzuni kiriting"); return; }
    setSaving(true);
    setError("");
    const dateStr = dateStrOf(day);
    try {
      // 1. Dars mavzusi — mavjud bo'lsa yangilash, bo'lmasa yaratish
      let lid = lessonId;
      if (!lid) {
        try {
          const r = await api.post("/lessons", { group_id: gid, topic: mavzu, description: tavsif, date: dateStr });
          lid = (r.data?.data ?? r.data)?.id ?? null;
          if (lid) setLessonId(lid);
        } catch (err) {
          const st = err?.response?.status;
          if (st === 409 || st === 400) {
            try {
              const ex = await api.get(`/groups/${gid}/lesson`, { params: { date: dateStr } });
              lid = ((ex.data?.data ?? ex.data)?.lesson)?.id ?? null;
              if (lid) setLessonId(lid);
            } catch { /* ignore */ }
          } else {
            const msg = err?.response?.data?.message;
            setError(Array.isArray(msg) ? msg.join(", ") : (msg ?? "Dars saqlashda xatolik"));
            setSaving(false);
            return;
          }
        }
      } else {
        try { await api.patch(`/lessons/${lid}`, { topic: mavzu, description: tavsif }); } catch { /* ignore */ }
      }

      // 2. Davomat — mavjud yozuvni PATCH, aks holda POST
      const results = await Promise.allSettled(rows.map((s) => {
        const existId = attIds[s.student_id];
        if (existId) return api.patch(`/attendance/${existId}`, { isPresent: present[s.student_id] === true });
        return api.post("/attendance", { group_id: gid, student_id: s.student_id, isPresent: present[s.student_id] === true, ...(lid ? { lesson_id: lid } : {}) });
      }));
      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length > 0 && failed.length === rows.length) {
        const msg = failed[0].reason?.response?.data?.message;
        setError(Array.isArray(msg) ? msg.join(", ") : (msg ?? "Davomatni saqlashda xatolik"));
        setSaving(false);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(", ") : (msg ?? "Saqlashda xatolik"));
    } finally {
      setSaving(false);
    }
  };

  const presentCount = rows.filter((s) => present[s.student_id]).length;
  const curMonth = schedules.find((m) => m.days?.some((d) => d.month === day.month)) ?? schedules[0];
  const fullDate = `${YEAR} ${(day.month || "").toUpperCase().slice(0, 3)} ${String(day.day).padStart(2, "0")}`;
  const held = mavzu.trim().length > 0 || Object.values(present).some(Boolean);

  return (
    <div style={{ padding: "22px 26px", fontFamily: "'Inter', sans-serif", background: t.bg, minHeight: "100%" }}>
      {/* Back */}
      <button onClick={onBack} style={{ border: "none", background: "none", cursor: "pointer", color: t.textSec, display: "flex", alignItems: "center", gap: 6, padding: "4px 0", marginBottom: 16, fontSize: 13.5, fontWeight: 600 }}>
        <ArrowBackIcon style={{ fontSize: 20 }} /> Orqaga
      </button>

      {/* Kun tanlash (tepada) — kelmagan kunlar bloklangan */}
      <div style={{ background: t.card, borderRadius: 14, padding: "16px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: `1px solid ${t.border}`, marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: t.textMuted, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: 0.4 }}>Dars kunini tanlang</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(curMonth?.days ?? []).map((d, i) => {
            const sel = d.day === day.day && d.month === day.month;
            const future = isFuture(d);
            return (
              <div key={i}
                onClick={future ? undefined : () => setDay({ day: d.day, month: d.month })}
                title={future ? "Dars kelmagan — tanlab bo'lmaydi" : (d.isCompleted ? "O'tilgan dars" : "Dars kuni")}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                  background: sel ? PRIMARY : d.isCompleted ? t.past : t.card,
                  border: `1.5px solid ${sel ? PRIMARY : t.border}`, borderRadius: 8, padding: "6px 12px", minWidth: 46,
                  opacity: future ? 0.4 : 1, cursor: future ? "not-allowed" : "pointer",
                }}>
                <span style={{ fontSize: 10, color: sel ? "rgba(255,255,255,0.85)" : t.textMuted, fontWeight: 500 }}>{d.month}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: sel ? "#fff" : t.text }}>{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {loading ? (
        <p style={{ color: t.textMuted, fontSize: 14, padding: 20 }}>Yuklanmoqda...</p>
      ) : (
        <>
          {/* Ma'lumot */}
          <div style={{ background: t.card, borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: `1px solid ${t.border}`, marginBottom: 20, display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center" }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: t.textMuted }}>Guruh</p>
              <p style={{ margin: "2px 0 0", fontSize: 15, fontWeight: 700, color: t.text }}>{group?.name}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: t.textMuted }}>Dars kuni</p>
              <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 700, color: t.text }}>{fullDate}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: t.textMuted }}>Holat</p>
              <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 600, color: held ? "#16a34a" : t.textMuted }}>{held ? "Dars o'tildi ✓" : "Dars o'tilmagan"}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: t.textMuted }}>Kelganlar</p>
              <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 700, color: "#16a34a" }}>{presentCount} / {rows.length}</p>
            </div>
          </div>

          {/* Yo'qlama va mavzu */}
          <div style={{ background: t.card, borderRadius: 14, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: `1px solid ${t.border}`, marginBottom: 20 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: t.text, margin: "0 0 16px" }}>Yo&apos;qlama va mavzu kiritish</p>

            {/* Radio: reja / boshqa */}
            <div style={{ display: "flex", gap: 24, marginBottom: 18 }}>
              {[{ key: "reja", label: "O'quv reja bo'yicha" }, { key: "boshqa", label: "Boshqa" }].map(({ key, label }) => (
                <label key={key} onClick={() => setMavzuType(key)} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: mavzuType === key ? PRIMARY : t.textMuted, fontWeight: mavzuType === key ? 600 : 400 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${mavzuType === key ? PRIMARY : "#d1d5db"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {mavzuType === key && <div style={{ width: 9, height: 9, borderRadius: "50%", background: PRIMARY }} />}
                  </div>
                  {label}
                </label>
              ))}
            </div>

            {/* Mavzu */}
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#ef4444", margin: "0 0 6px" }}>* Mavzu</p>
              <input value={mavzu} onChange={(e) => setMavzu(e.target.value)} placeholder="Mavzuni kiriting..."
                style={{ width: "100%", padding: "10px 14px", border: `1.5px solid ${t.border}`, borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", color: t.text, background: t.input }}
                onFocus={(e) => (e.target.style.border = `1.5px solid ${PRIMARY}`)} onBlur={(e) => (e.target.style.border = `1.5px solid ${t.border}`)} />
            </div>

            {/* Tavsif */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: t.textSec, margin: "0 0 6px" }}>Tavsif (ixtiyoriy)</p>
              <textarea value={tavsif} onChange={(e) => setTavsif(e.target.value)} placeholder="Dars haqida qo'shimcha ma'lumot..." rows={3}
                style={{ width: "100%", padding: "10px 14px", border: `1.5px solid ${t.border}`, borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", color: t.text, background: t.input, resize: "vertical", fontFamily: "inherit" }}
                onFocus={(e) => (e.target.style.border = `1.5px solid ${PRIMARY}`)} onBlur={(e) => (e.target.style.border = `1.5px solid ${t.border}`)} />
            </div>

            {/* Davomat jadvali */}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1.5px solid ${t.divider}` }}>
                  <th style={{ width: 40, padding: "10px 14px", textAlign: "left", fontSize: 12, color: t.textMuted, fontWeight: 600 }}>#</th>
                  <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, color: PRIMARY, fontWeight: 600 }}>O&apos;quvchi ismi</th>
                  <th style={{ padding: "10px 14px", textAlign: "right", fontSize: 12, color: PRIMARY, fontWeight: 600 }}>Keldi</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={3} style={{ textAlign: "center", padding: 24, color: t.textMuted, fontSize: 14 }}>Talabalar yo&apos;q</td></tr>
                ) : rows.map((s, i) => (
                  <tr key={s.student_id} style={{ borderBottom: `1px solid ${t.divider}` }}>
                    <td style={{ padding: "14px", fontSize: 13, color: t.textMuted }}>{i + 1}</td>
                    <td style={{ padding: "14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#d1d5db", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#6b7280", flexShrink: 0, overflow: "hidden" }}>
                          {s.photo ? <img src={imgUrl(s.photo)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (s.full_name[0] ?? "?")}
                        </div>
                        <span style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{s.full_name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px", textAlign: "right" }}>
                      <div onClick={() => toggle(s.student_id)} style={{ width: 42, height: 24, borderRadius: 12, background: present[s.student_id] ? "#16a34a" : "#d1d5db", position: "relative", cursor: "pointer", transition: "background .2s", marginLeft: "auto" }}>
                        <div style={{ position: "absolute", top: 3, left: present[s.student_id] ? 21 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Save */}
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12 }}>
            {error && <span style={{ fontSize: 13, color: "#ef4444", fontWeight: 500 }}>{error}</span>}
            {saved && <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 500 }}>Dars va davomat saqlandi ✓</span>}
            <button onClick={handleSave} disabled={saving}
              style={{ padding: "11px 32px", border: "none", borderRadius: 10, background: saving ? "#a78bfa" : PRIMARY, color: "#fff", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", boxShadow: "0 3px 12px rgba(124,58,237,0.3)" }}>
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
