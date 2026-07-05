// Markazlashgan autentifikatsiya / rol yordamchilari.
// Rol haqiqiy JWT token ichidan olinadi (backend'da alohida /me endpoint yo'q).

import api from "./axios";

export const ROLES = {
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
};

// JWT payload (2-qism) ni xavfsiz dekod qilish.
// base64url va UTF-8 belgilarni ham to'g'ri o'qiydi, mock tokenlar bilan ham ishlaydi.
export function decodeToken(token) {
  try {
    const part = (token || "").split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Eslatma: telefon raqam ATAYIN normallashtirilmaydi — backend "998.." va "+998.."
// ni turli akkaunt deb biladi, shuning uchun foydalanuvchi yozган format aynан yuboriladi.

// Backend'dan kelishi mumkin bo'lgan turli rol ko'rinishlarini bitta standartga keltirish.
// Qabul qiladi: "admin", ["ADMIN"], { role: "admin" }, { name: "Teacher" } va h.k.
export function normalizeRole(raw) {
  if (!raw) return null;
  let r = raw;
  if (Array.isArray(r)) r = r[0];
  if (r && typeof r === "object") r = r.role ?? r.name ?? r.type ?? r.slug;
  if (!r) return null;
  r = String(r).toUpperCase().trim();

  if (["ADMIN", "SUPER_ADMIN", "SUPERADMIN", "OWNER"].includes(r)) return ROLES.ADMIN;
  if (["TEACHER", "MENTOR", "USTOZ"].includes(r)) return ROLES.TEACHER;
  if (["STUDENT", "TALABA", "USER"].includes(r)) return ROLES.STUDENT;
  return r; // noma'lum bo'lsa, borligicha (uppercase) qaytariladi
}

// Login javobidan (yoki token'dan) rolni aniqlash — turli backend shakllarini qamrab oladi.
// AVVAL token tekshiriladi (avtorizatsiya manbai — Dashboard ham shundан o'qiydi),
// shunda redirect va menyu doim bir xil rolni ishlatadi. Token'да rol bo'lmasa — body'дан.
export function resolveRoleFromLogin(resData, token) {
  const p = decodeToken(token);
  if (p) {
    const r = normalizeRole(p.role ?? p.roles ?? p.type ?? p.user_type ?? p.userType);
    if (r) return r;
  }
  const body = resData?.data ?? resData ?? {};
  const candidates = [
    body.role, body.roles, body.type, body.user_type, body.userType,
    body.user?.role, body.user?.roles, body.user?.type,
    body.admin?.role, body.profile?.role,
  ];
  for (const c of candidates) {
    const r = normalizeRole(c);
    if (r) return r;
  }
  return null;
}

// Rolni saqlash (token ichida rol bo'lmasa ham dashboard to'g'ri ishlashi uchun).
export function setRole(role) {
  const r = normalizeRole(role);
  if (r) localStorage.setItem("role", r);
}

// Joriy foydalanuvchini token'dan (yoki saqlangan roldan) o'qish.
export function getCurrentUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  const p = decodeToken(token);
  if (!p) return null;
  const tokenRole = normalizeRole(p.role ?? p.roles ?? p.type ?? p.user_type ?? p.userType);
  return {
    id: p.id ?? p.sub ?? p.userId ?? null,
    email: p.email ?? "",
    phone: p.phone ?? "",
    role: tokenRole ?? normalizeRole(localStorage.getItem("role")) ?? ROLES.ADMIN,
  };
}

export function getUserRole() {
  return getCurrentUser()?.role ?? ROLES.ADMIN;
}

export function isAuthenticated() {
  return !!localStorage.getItem("token");
}

// ── Parolni tiklash (OTP) oqimi ──
// Telefon AYNAN yozilганидек yuboriladi — backend "998.." va "+998.." ni turli
// akkaunt deb biladi, formatni o'zgartirsak boshqa akkauntга OTP ketishi mumkin.
// 1) telefonga OTP kod yuborish
export function sendOtp(phone) {
  return api.post("/auth/send-otp", { phone: String(phone).trim() });
}
// 2) kelgan kodni tekshirish (backend otp'ni "number string" ko'rinishida kutadi)
export function verifyOtp(phone, otp) {
  return api.post("/auth/verify-otp", { phone: String(phone).trim(), otp: String(otp).trim() });
}
// 3) yangi parolni o'rnatish
export function changePassword(phone, password) {
  return api.put("/auth/change-password", { phone: String(phone).trim(), password });
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("role");
  localStorage.removeItem("activePage_nav");
  localStorage.removeItem("activePage_page");
  localStorage.removeItem("activePage_btab");
}
