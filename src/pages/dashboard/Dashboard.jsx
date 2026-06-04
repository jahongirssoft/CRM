import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useNavigate, useParams } from "react-router-dom";
import { Menu, MenuItem, Divider, ListItemIcon } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import LayersIcon from "@mui/icons-material/Layers";
import PeopleIcon from "@mui/icons-material/People";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import TuneIcon from "@mui/icons-material/Tune";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import RedeemIcon from "@mui/icons-material/Redeem";
import GroupIcon from "@mui/icons-material/Group";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import ReplayIcon from "@mui/icons-material/Replay";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import BadgeIcon from "@mui/icons-material/Badge";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ForwardToInboxIcon from "@mui/icons-material/ForwardToInbox";
import Boshqarish from "../boshqarish/Boshqarish";
import Oqituvchilar from "../oqituvchilar/Oqituvchilar";
import Talabalar from "../talabalar/Talabalar";
import Guruhlar  from "../guruhlar/Guruhlar";

const PRIMARY = "#7c3aed";
const PRIMARY_LIGHT = "#6d28d9";
const PRIMARY_HOVER = "#6d28d9";

const FLYOUT = [
  { label: "Kurslar",        icon: LibraryBooksIcon },
  { label: "Xonalar",        icon: MeetingRoomIcon },
  { label: "Xodimlar",       icon: BadgeIcon },
  { label: "Sabablar",       icon: ListAltIcon },
  { label: "Xabar yuborish", icon: ForwardToInboxIcon },
];

const NAV = [
  { label: "Asosiy", icon: HomeIcon },
  { label: "O'qituvchilar", icon: PersonIcon },
  { label: "Guruhlar", icon: LayersIcon },
  { label: "Talabalar", icon: PeopleIcon },
  { label: "Sovg'alar", icon: CardGiftcardIcon },
  { label: "Boshqarish", icon: TuneIcon },
];

const STAT_DEFS = [
  { label: "Sinflar",       Icon: GroupIcon,    bg: "#f0f9ff", color: "#0284c7",  endpoint: "/groups/all",   key: "groups" },
  { label: "Fanlar",        Icon: MenuBookIcon, bg: "#fdf4ff", color: "#a21caf",  endpoint: "/courses",      key: "courses" },
  { label: "Talabalar",     Icon: SchoolIcon,   bg: "#f0fdf4", color: "#16a34a",  endpoint: "/students",     key: "students" },
  { label: "Sovg'alar",     Icon: RedeemIcon,   bg: "#fff7ed", color: "#ea580c",  endpoint: null,            key: "gifts" },
  { label: "O'qituvchilar", Icon: PersonIcon,   bg: "#fef3f2", color: "#dc2626",  endpoint: "/teachers",     key: "teachers" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { page: urlPage, id: urlId } = useParams();

  // URL da group ID bo'lsa, sessionStorage ga yoz (refresh uchun)
  useEffect(() => {
    if (urlPage === "groups" && urlId) {
      sessionStorage.setItem("guruhlar_selected_id", urlId);
    }
  }, [urlPage, urlId]);

  // URL → activePage mapping (English URLs)
  const urlToPage = (p) => {
    const map = {
      "teachers":   "o'qituvchilar",
      "groups":     "guruhlar",
      "students":   "talabalar",
      "gifts":      "sovg'alar",
      "management": "boshqarish",
    };
    return map[p] ?? "asosiy";
  };
  const pageToUrl = (p) => {
    const map = {
      "o'qituvchilar": "teachers",
      "guruhlar":      "groups",
      "talabalar":     "students",
      "sovg'alar":     "gifts",
      "boshqarish":    "management",
    };
    return map[p] ?? "";
  };

  const [active, setActive] = useState(() => localStorage.getItem("activePage_nav") || "Asosiy");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [jadvaliOpen, setJadvaliOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const [profileMenuPos, setProfileMenuPos] = useState({ top: 0, right: 0 });
  const [profileOpen, setProfileOpen] = useState(false);
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const [activePage, setActivePage] = useState(() => urlPage ? urlToPage(urlPage) : (localStorage.getItem("activePage_page") || "asosiy"));
  const [boshqarishTab, setBoshqarishTab] = useState(() => localStorage.getItem("activePage_btab") || "Kurslar");

  // activePage o'zgarganda URL ni yangilash
  useEffect(() => {
    const slug = pageToUrl(activePage);
    const newPath = slug ? `/dashboard/${slug}` : "/dashboard";
    if (window.location.pathname !== newPath) {
      window.history.replaceState(null, "", newPath);
    }
  }, [activePage]);
  const [statCounts, setStatCounts] = useState({ groups: 0, courses: 0, students: 0, gifts: 0, teachers: 0 });

  const currentUser = (() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return { id: payload.id, email: payload.email, role: payload.role };
    } catch { return null; }
  })();

  useEffect(() => {
    STAT_DEFS.forEach(({ endpoint, key }) => {
      if (!endpoint) return;
      api.get(endpoint)
        .then((res) => {
          const data = res.data?.data ?? res.data;
          const count = Array.isArray(data) ? data.length : (data?.total ?? data?.count ?? 0);
          setStatCounts((p) => ({ ...p, [key]: count }));
        })
        .catch(() => {});
    });
  }, []);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("dm") === "1");

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      document.body.classList.add("dark");
      root.style.setProperty("--card",       "#1e293b");
      root.style.setProperty("--bg",         "#0f172a");
      root.style.setProperty("--border",     "#334155");
      root.style.setProperty("--text",       "#f1f5f9");
      root.style.setProperty("--text-muted", "#94a3b8");
      root.style.setProperty("--input-bg",   "#0f172a");
      root.style.setProperty("--sidebar",    "#1e293b");
      root.style.setProperty("--hover-bg",   "#334155");
      root.style.setProperty("--table-head", "#0f172a");
    } else {
      document.body.classList.remove("dark");
      root.style.setProperty("--card",       "#ffffff");
      root.style.setProperty("--bg",         "#f6f7fb");
      root.style.setProperty("--border",     "#e5e7eb");
      root.style.setProperty("--text",       "#111111");
      root.style.setProperty("--text-muted", "#9ca3af");
      root.style.setProperty("--input-bg",   "#ffffff");
      root.style.setProperty("--sidebar",    "#ffffff");
      root.style.setProperty("--hover-bg",   "#fafafa");
      root.style.setProperty("--table-head", "#fafafa");
    }
  }, [darkMode]);

  const toggleDark = () => {
    setDarkMode((prev) => {
      localStorage.setItem("dm", prev ? "0" : "1");
      return !prev;
    });
  };

  const t = darkMode ? {
    bg: "#0f172a", sidebar: "#1e293b", header: "#1e293b",
    card: "#1e293b", border: "#334155", text: "#f1f5f9",
    textSec: "#94a3b8", textMuted: "#64748b", inputBg: "#0f172a",
    bellBg: "#0f172a", subCard: "linear-gradient(135deg,#1e293b,#2d3748)",
    subBorder: "#334155",
  } : {
    bg: "#f6f7fb", sidebar: "#ffffff", header: "#ffffff",
    card: "#ffffff", border: "#f0f0f0", text: "#111111",
    textSec: "#6b7280", textMuted: "#9ca3af", inputBg: "#ffffff",
    bellBg: "#f6f7fb", subCard: "linear-gradient(135deg,#fff7ed,#fef3c7)",
    subBorder: "#fed7aa",
  };

  const handleAvatarClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setProfileMenuPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    setProfileOpen((p) => !p);
  };
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    setProfileOpen(false);
    handleMenuClose();
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleNavClick = (label) => {
    if (label === "Boshqarish") {
      setFlyoutOpen((prev) => !prev);
      setActive("Boshqarish");
      localStorage.setItem("activePage_nav", "Boshqarish");
    } else {
      setFlyoutOpen(false);
      setActive(label);
      setActivePage(label.toLowerCase());
      localStorage.setItem("activePage_nav", label);
      localStorage.setItem("activePage_page", label.toLowerCase());
    }
  };

  const handleFlyoutItem = (label) => {
    setBoshqarishTab(label);
    setActivePage("boshqarish");
    setActive("Boshqarish");
    setFlyoutOpen(false);
    localStorage.setItem("activePage_btab", label);
    localStorage.setItem("activePage_page", "boshqarish");
    localStorage.setItem("activePage_nav", "Boshqarish");
  };

const sidebarW = collapsed ? 64 : 230;

  const sidebarClasses = [
    "dashboard-sidebar",
    collapsed ? "collapsed" : "",
    mobileOpen ? "mobile-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        backgroundColor: t.bg,
        fontFamily: "'Inter', sans-serif",
        overflow: "hidden",
        "--card": t.card,
        "--sidebar": t.sidebar,
      }}
    >
      {/* ── Backdrop (mobile) ── */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop visible"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ══════════ SIDEBAR ══════════ */}
      <div className="sidebar-wrapper" style={{ width: sidebarW }}>
      <aside className={sidebarClasses} style={{ width: sidebarW, height: "100%", background: t.sidebar, boxShadow: flyoutOpen ? "4px 0 24px rgba(0,0,0,0.14)" : "none", transition: "box-shadow 0.28s ease" }}>
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: collapsed ? "14px 0" : "14px 18px",
            justifyContent: collapsed ? "center" : "flex-start",
            borderBottom: `1px solid ${t.border}`,
            minHeight: 64,
          }}
        >
          {/* Icon box */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              background: `linear-gradient(145deg, ${PRIMARY} 0%, #a855f7 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: `0 6px 16px rgba(124,58,237,0.40)`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(145deg, rgba(255,255,255,0.18) 0%, transparent 60%)",
              borderRadius: 14,
            }} />
            <AutoStoriesIcon style={{ color: "#fff", fontSize: 21, position: "relative" }} />
          </div>

          {/* Text */}
          {!collapsed && (
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: 16,
                  background: `linear-gradient(135deg, ${PRIMARY} 30%, #a855f7 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  whiteSpace: "nowrap",
                  letterSpacing: "-0.5px",
                  lineHeight: 1.1,
                }}
              >
                Najot Edu
              </span>
              <span style={{
                fontSize: 10,
                color: "#a78bfa",
                fontWeight: 600,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}>
                LMS Platform
              </span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 0" }}>
          {NAV.map(({ label, icon: Icon }) => {
            const isActive = active === label;
            return (
              <button
                key={label}
                onClick={() => { handleNavClick(label); setMobileOpen(false); }}
                className={`nav-item ${isActive ? "nav-active" : ""}`}
                style={{
                  padding: collapsed ? "11px 0" : "11px 16px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  margin: collapsed ? "2px 8px" : "2px 10px",
                  borderRadius: 10,
                  backgroundColor: isActive ? PRIMARY : "transparent",
                  color: isActive ? "#fff" : t.textSec,
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 13.5,
                  transition: "all 0.15s ease",
                  width: collapsed ? "auto" : "calc(100% - 20px)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = darkMode ? "#334155" : "#f0eeff";
                    e.currentTarget.style.color = PRIMARY;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = t.textSec;
                  }
                }}
              >
                <Icon
                  style={{
                    fontSize: 19,
                    color: isActive ? "#fff" : t.textMuted,
                    flexShrink: 0,
                  }}
                />
                {!collapsed && label}
              </button>
            );
          })}
        </nav>

        {/* Subscription card */}
        {!collapsed && (
          <div
            style={{
              margin: "0 14px 18px",
              background: t.subCard,
              borderRadius: 12,
              padding: "14px",
              border: `1px solid ${t.subBorder}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "#f97316",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CardMembershipIcon style={{ color: "#fff", fontSize: 20 }} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: t.text }}>Obuna</p>
                <p style={{ fontSize: 11, color: "#f97316" }}>Obunangiz tugagan</p>
              </div>
            </div>
            <button
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "9px 0",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                boxShadow: "0 3px 10px rgba(239,68,68,0.3)",
              }}
            >
              <ReplayIcon style={{ fontSize: 14 }} />
              Obunani yangilash
            </button>
          </div>
        )}

      </aside>

        {/* Collapse btn — wrapper ichida, aside tashqarida */}
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: "absolute",
            top: 22,
            right: -14,
            width: 28,
            height: 28,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `linear-gradient(135deg, ${PRIMARY}, #a855f7)`,
            border: "2.5px solid #fff",
            boxShadow: `0 3px 10px rgba(124,58,237,0.4)`,
            cursor: "pointer",
            zIndex: 200,
            padding: 0,
            color: "#fff",
            transition: "transform 0.18s, box-shadow 0.18s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.15)";
            e.currentTarget.style.boxShadow = `0 5px 16px rgba(124,58,237,0.55)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = `0 3px 10px rgba(124,58,237,0.4)`;
          }}
        >
          {collapsed
            ? <ChevronRightIcon style={{ fontSize: 16 }} />
            : <ChevronLeftIcon style={{ fontSize: 16 }} />}
        </button>
      </div>


      {/* ══════════ FLYOUT ══════════ */}
      {flyoutOpen && <div onClick={() => setFlyoutOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 140 }} />}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: sidebarW,
          bottom: 0,
          width: 210,
          backgroundColor: t.sidebar,
          boxShadow: "none",
          zIndex: 150,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          borderRadius: 0,
          transform: flyoutOpen ? "translateX(0)" : "translateX(-100%)",
          opacity: flyoutOpen ? 1 : 0,
          pointerEvents: flyoutOpen ? "auto" : "none",
          transition: "transform 0.28s cubic-bezier(0.34,1.2,0.64,1), opacity 0.2s ease",
          borderLeft: `1px solid ${t.border}`,
        }}
      >
        {/* Header */}
        <div style={{ padding: "18px 16px 14px", borderBottom: `1px solid ${t.border}` }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: t.text }}>Menu</span>
        </div>

        {/* Items */}
        {FLYOUT.map(({ label, icon: Icon }) => {
          const isSelected = boshqarishTab === label && activePage === "boshqarish";
          return (
            <button
              key={label}
              onClick={() => handleFlyoutItem(label)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "11px 16px", border: "none",
                background: isSelected ? PRIMARY_LIGHT : "transparent",
                color: isSelected ? "#fff" : t.textSec,
                fontSize: 13.5, fontWeight: isSelected ? 600 : 400,
                cursor: "pointer", textAlign: "left",
                transition: "background 0.15s, color 0.15s",
                borderRadius: 0,
              }}
              onMouseEnter={(e) => { if (!isSelected) { e.currentTarget.style.background = darkMode ? "#334155" : "#f5f3ff"; e.currentTarget.style.color = PRIMARY; } }}
              onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = t.textSec; } }}
            >
              <Icon style={{ fontSize: 18, color: "inherit", flexShrink: 0 }} />
              {label}
            </button>
          );
        })}
      </div>

      {/* ══════════ MAIN ══════════ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* HEADER */}
        <header
          style={{
            height: 64,
            backgroundColor: t.header,
            borderBottom: `1px solid ${t.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            gap: 12,
            flexShrink: 0,
            position: "sticky",
            top: 0,
            zIndex: 50,
            backdropFilter: "blur(8px)",
          }}
        >
          {/* Hamburger (mobile only) */}
          <button
            className="hamburger-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              padding: 6,
              color: "#374151",
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {mobileOpen
              ? <CloseIcon style={{ fontSize: 22 }} />
              : <MenuIcon style={{ fontSize: 22 }} />}
          </button>

          {/* Left actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
            {/* Calendar */}
            <button style={{
              border: `1px solid ${t.border}`,
              background: t.inputBg,
              borderRadius: 8,
              padding: "7px 10px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              color: t.textSec,
            }}>
              <CalendarMonthIcon style={{ fontSize: 19 }} />
            </button>

            {/* Qo'shish */}
            <button style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: PRIMARY,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "7px 14px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 3px 10px rgba(124,58,237,0.28)",
            }}>
              <AddIcon style={{ fontSize: 17 }} />
              Qo&apos;shish
              <KeyboardArrowDownIcon style={{ fontSize: 17, marginLeft: 2 }} />
            </button>

            {/* Search */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: `1px solid ${t.border}`,
              borderRadius: 8,
              padding: "7px 12px",
              background: t.inputBg,
              minWidth: 180,
            }}>
              <SearchIcon style={{ fontSize: 17, color: t.textMuted, flexShrink: 0 }} />
              <input
                placeholder="Qidirish..."
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 13,
                  color: t.text,
                  width: "100%",
                }}
              />
            </div>
          </div>

          {/* Language */}
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              border: `1px solid ${t.border}`,
              borderRadius: 8,
              padding: "6px 12px",
              background: t.inputBg,
              fontSize: 13,
              cursor: "pointer",
              color: t.textSec,
              whiteSpace: "nowrap",
            }}
          >
            O&apos;zbekcha
            <KeyboardArrowDownIcon style={{ fontSize: 16 }} />
          </button>

          {/* Bell */}
          <button
            style={{
              border: "none",
              background: t.bellBg,
              cursor: "pointer",
              padding: 8,
              color: t.textSec,
              display: "flex",
              borderRadius: 10,
            }}
          >
            <NotificationsNoneIcon style={{ fontSize: 20 }} />
          </button>

          {/* Dark mode */}
          <button
            onClick={toggleDark}
            style={{
              border: "none",
              background: darkMode ? "#7c3aed" : "#1e293b",
              borderRadius: 20,
              padding: "6px 10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              color: "#fff",
              transition: "background 0.2s",
            }}
          >
            {darkMode
              ? <LightModeIcon style={{ fontSize: 17 }} />
              : <DarkModeIcon style={{ fontSize: 17 }} />}
          </button>

          {/* Avatar + dropdown */}
          <div style={{ position: "relative" }}>
            <div
              onClick={() => setProfileOpen((p) => !p)}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${PRIMARY}, #a855f7)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                flexShrink: 0,
                boxShadow: profileOpen ? `0 0 0 3px ${PRIMARY_LIGHT}` : "none",
                transition: "box-shadow 0.18s",
              }}
            >
              {currentUser?.email?.[0]?.toUpperCase() ?? "A"}
            </div>

            {profileOpen && (
              <>
                <div onClick={() => setProfileOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 998 }} />
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 10px)",
                  right: 0,
                  zIndex: 999,
                  width: 230,
                  background: "#fff",
                  borderRadius: 14,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.16)",
                  border: "1px solid #f0f0f0",
                  overflow: "hidden",
                }}>
                  {/* Arrow */}
                  <div style={{ position: "absolute", top: -7, right: 10, width: 13, height: 13, background: "#fff", transform: "rotate(45deg)", borderTop: "1px solid #f0f0f0", borderLeft: "1px solid #f0f0f0", zIndex: 1 }} />

                  {/* User info */}
                  <div style={{ padding: "18px 16px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, borderBottom: "1px solid #f5f5f5" }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg, ${PRIMARY}, #a855f7)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22, fontWeight: 700 }}>
                      {currentUser?.email?.[0]?.toUpperCase() ?? "A"}
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#111", margin: 0 }}>
                        {currentUser?.email?.split("@")[0] ?? "Admin"}
                      </p>
                      <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>
                        {currentUser?.email ?? ""}
                      </p>
                      <span style={{ fontSize: 11, fontWeight: 600, color: PRIMARY, background: "#ede9fe", padding: "2px 10px", borderRadius: 20, display: "inline-block", marginTop: 6 }}>
                        {currentUser?.role ?? "ADMIN"}
                      </span>
                    </div>
                  </div>

                  {/* Profil */}
                  <button onClick={() => setProfileOpen(false)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", border: "none", background: "transparent", cursor: "pointer", fontSize: 14, color: "#374151", borderBottom: "1px solid #f5f5f5" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f3ff")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <AccountCircleIcon style={{ fontSize: 18, color: "#9ca3af" }} />
                    Profil
                  </button>

                  {/* Chiqish */}
                  <button onClick={handleLogout}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", border: "none", background: "transparent", cursor: "pointer", fontSize: 14, color: "#ef4444" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <LogoutIcon style={{ fontSize: 18, color: "#ef4444" }} />
                    Chiqish
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* CONTENT */}
        <main style={{ flex: 1, overflowY: "auto" }}>
          {activePage === "boshqarish" ? (
            <Boshqarish initialTab={boshqarishTab} key={boshqarishTab} darkMode={darkMode} />
          ) : activePage === "o'qituvchilar" ? (
            <Oqituvchilar darkMode={darkMode} />
          ) : activePage === "talabalar" ? (
            <Talabalar darkMode={darkMode} />
          ) : activePage === "guruhlar" ? (
            <Guruhlar darkMode={darkMode}
              onGroupSelect={(id) => {
                const newPath = id ? `/dashboard/groups/${id}` : "/dashboard/groups";
                if (window.location.pathname !== newPath)
                  window.history.replaceState(null, "", newPath);
              }}
            />
          ) : (
            <div style={{ padding: "28px 24px" }}>
              {/* Welcome */}
              <h1 style={{ fontSize: 24, fontWeight: 800, color: t.text, marginBottom: 4, letterSpacing: "-0.6px" }}>
                Salom, creator! 👋
              </h1>
              <p style={{ fontSize: 13.5, color: t.textMuted, marginBottom: 28, lineHeight: 1.6 }}>
                Najot Edu platformasiga xush kelibsiz!
              </p>

              {/* Stat cards */}
              <div className="stats-grid">
                {STAT_DEFS.map(({ label, Icon, bg, color, key }) => (
                  <div key={label} className="stat-card">
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon style={{ color, fontSize: 26 }} />
                    </div>
                    <span style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>{label}</span>
                    <span style={{ fontSize: 26, fontWeight: 800, color: t.text, lineHeight: 1.1 }}>
                      {statCounts[key] ?? 0}
                    </span>
                  </div>
                ))}
              </div>

              {/* Dars Jadvali */}
              <div
                style={{
                  backgroundColor: t.card,
                  borderRadius: 14,
                  boxShadow: darkMode ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.06)",
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => setJadvaliOpen(!jadvaliOpen)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "18px 22px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 15,
                    fontWeight: 600,
                    color: t.text,
                  }}
                >
                  Dars Jadvali
                  <ExpandMoreIcon
                    style={{
                      fontSize: 22,
                      color: "#9ca3af",
                      transform: jadvaliOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.22s",
                    }}
                  />
                </button>
                {jadvaliOpen && (
                  <div
                    style={{
                      padding: "4px 22px 22px",
                      fontSize: 14,
                      color: t.textMuted,
                      borderTop: `1px solid ${t.border}`,
                    }}
                  >
                    Hozircha dars jadvali mavjud emas.
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
