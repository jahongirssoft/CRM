import { useState, useEffect } from "react";
import api from "../../api/axios";
import { imgUrl } from "../../api/fileUrl";
import MailOutlineIcon from "@mui/icons-material/MailOutlined";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import GroupsIcon from "@mui/icons-material/Groups";

const PRIMARY = "#7c3aed";
const GRADIENT = `linear-gradient(135deg, ${PRIMARY}, #a855f7)`;

const fmtDate = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  if (isNaN(d)) return "—";
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getUTCDate())}.${p(d.getUTCMonth() + 1)}.${d.getUTCFullYear()}`;
};

export default function TeacherProfil({ darkMode = false }) {
  const t = darkMode
    ? { card: "#1e293b", border: "#334155", text: "#f1f5f9", textSec: "#94a3b8", textMuted: "#94a3b8", bg: "#0f172a", divider: "#243045", chipBg: "#2e1065", chipText: "#c4b5fd", iconBg: "#0f172a" }
    : { card: "#ffffff", border: "#eef0f4", text: "#111827", textSec: "#475569", textMuted: "#94a3b8", bg: "#f6f7fb", divider: "#f1f2f5", chipBg: "#f3efff", chipText: PRIMARY, iconBg: "#f5f3ff" };

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.get("/teachers/my/profile")
      .then((r) => { if (!cancelled) setProfile(r.data?.data ?? r.data ?? null); })
      .catch(() => { if (!cancelled) setProfile(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const groups = Array.isArray(profile?.groups) ? profile.groups : [];

  const infoItems = [
    { Icon: MailOutlineIcon, label: "Email", value: profile?.email ?? "—" },
    { Icon: LocalPhoneOutlinedIcon, label: "Telefon raqam", value: profile?.phone ?? "—" },
    { Icon: LocationOnOutlinedIcon, label: "Manzil", value: profile?.address ?? "—" },
    { Icon: CalendarTodayOutlinedIcon, label: "Ro'yxatdan o'tgan sana", value: fmtDate(profile?.created_at) },
  ];

  return (
    <div style={{ padding: "24px 28px", fontFamily: "'Inter', sans-serif", background: t.bg, minHeight: "100%" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: t.text, margin: "0 0 22px", letterSpacing: "-0.5px" }}>Profil</h1>

      {loading ? (
        <p style={{ color: t.textMuted, fontSize: 14 }}>Yuklanmoqda...</p>
      ) : (
        <div style={{ display: "flex", gap: 20, alignItems: "stretch", flexWrap: "wrap" }}>
          {/* CHAP: avatar kartochka */}
          <div style={{ width: 210, flexShrink: 0, background: t.card, borderRadius: 18, border: `1px solid ${t.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ height: 96, background: GRADIENT }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px 22px", marginTop: -56 }}>
              {profile?.photo ? (
                <img src={imgUrl(profile.photo)} alt="" style={{ width: 112, height: 112, borderRadius: "50%", objectFit: "cover", border: `4px solid ${t.card}`, boxShadow: "0 2px 10px rgba(0,0,0,0.12)" }} />
              ) : (
                <div style={{ width: 112, height: 112, borderRadius: "50%", border: `4px solid ${t.card}`, background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 40, fontWeight: 700, boxShadow: "0 2px 10px rgba(0,0,0,0.12)" }}>
                  {profile?.full_name?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              <p style={{ margin: "14px 0 0", fontSize: 19, fontWeight: 800, color: t.text, textAlign: "center", letterSpacing: "-0.3px" }}>{profile?.full_name ?? "—"}</p>
              <p style={{ margin: "4px 0 0", fontSize: 13.5, color: t.textMuted, fontWeight: 500 }}>O&apos;qituvchi</p>
            </div>
          </div>

          {/* O'NG: ma'lumotlar kartochka */}
          <div style={{ flex: 1, minWidth: 320, background: t.card, borderRadius: 18, border: `1px solid ${t.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", padding: "26px 28px" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: t.text, margin: "0 0 22px" }}>Shaxsiy ma&apos;lumotlar</h2>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "22px 40px" }}>
              {infoItems.map(({ Icon, label, value }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 200 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: t.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon style={{ fontSize: 20, color: PRIMARY }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 12.5, color: t.textMuted, fontWeight: 500 }}>{label}</p>
                    <p style={{ margin: "3px 0 0", fontSize: 14.5, color: t.text, fontWeight: 700, wordBreak: "break-word" }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ height: 1, background: t.divider, margin: "24px 0" }} />

            <h3 style={{ fontSize: 16, fontWeight: 800, color: t.text, margin: "0 0 14px" }}>Guruhlar</h3>
            {groups.length === 0 ? (
              <p style={{ fontSize: 13.5, color: t.textMuted, margin: 0 }}>Guruh biriktirilmagan.</p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {groups.map((g, i) => (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: t.chipBg, color: t.chipText, padding: "7px 14px", borderRadius: 20, fontSize: 13.5, fontWeight: 700 }}>
                    <GroupsIcon style={{ fontSize: 16 }} />
                    {typeof g === "object" ? (g.name ?? g.groupName ?? "—") : g}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
