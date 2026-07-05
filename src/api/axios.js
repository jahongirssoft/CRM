import axios from "axios";

const BASE = "https://najot-edu.softwareengineer.uz/api/v1";

const api = axios.create({ baseURL: BASE });

// Tokenning tugash vaqtini (exp) o'qib, tez orada tugaydimi tekshirish.
const REFRESH_MARGIN = 120; // sekund: shuncha qolganда oldindan yangilaymiz
function expiresSoon(token) {
  try {
    const p = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    if (!p.exp) return false;
    return p.exp - Math.floor(Date.now() / 1000) < REFRESH_MARGIN;
  } catch {
    return false;
  }
}

// refresh-token endpointi FAQAT hali amal qiladigan token bilan ishlaydi
// (muddati o'tган token 500 beradi), shuning uchun oldindan (proaktiv) yangilaymiz.
// Interceptorlarga tushmaslik uchun toza axios ishlatamiz (rekursiyaning oldini oladi).
let proactivePromise = null;
function proactiveRefresh() {
  if (!proactivePromise) {
    // MUHIM: refresh token (7 kunlik) yuboramiz — access token bo'lsa muddati o'tganda
    // refresh-token 500 beradi. refreshToken bo'lmasa (eski sessiya) — access token bilan urinamiz.
    const refreshTok = localStorage.getItem("refreshToken") || localStorage.getItem("token");
    proactivePromise = axios
      .post(`${BASE}/auth/refresh-token`, { token: refreshTok })
      .then((r) => {
        const d = r.data ?? {};
        const nt = d.accessToken || d.token || d.data?.accessToken;
        const nr = d.refreshToken || d.refresh_token || d.data?.refreshToken;
        if (nt) {
          localStorage.setItem("token", nt);
          if (nr) localStorage.setItem("refreshToken", nr);
          return nt;
        }
        return null;
      })
      .catch(() => null)
      .finally(() => { proactivePromise = null; });
  }
  return proactivePromise;
}

const forceLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  window.location.href = "/";
};

api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem("token");
  const isAuthCall = (config.url || "").includes("/auth/");
  // Proaktiv: token tez orada tugasa-yu, hali amal qilsa — oldindan yangilaymiz
  if (token && !token.startsWith("mock") && !isAuthCall && expiresSoon(token)) {
    token = (await proactiveRefresh()) || token;
  }
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Reaktiv zaxira: 401 bo'lsa, refresh token (agar bo'lsa) bilan bir marta yangilash ──
let isRefreshing = false;
let waitQueue = [];
const flushQueue = (newToken) => {
  waitQueue.forEach(({ resolve, reject }) => (newToken ? resolve(newToken) : reject()));
  waitQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config || {};
    const status = err?.response?.status;
    const token = localStorage.getItem("token");
    const isAuthCall = (original.url || "").includes("/auth/");

    const canRefresh = status === 401 && token && !token.startsWith("mock") && !isAuthCall;
    if (!canRefresh) return Promise.reject(err);

    // Bir marta yangilanган, lekin yana 401 — refresh yordam bermadi, chiqaramiz
    if (original._retry) {
      forceLogout();
      return Promise.reject(err);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        waitQueue.push({
          resolve: (newToken) => {
            original.headers.Authorization = `Bearer ${newToken}`;
            original._retry = true;
            resolve(api(original));
          },
          reject: () => reject(err),
        });
      });
    }

    original._retry = true;
    isRefreshing = true;
    try {
      // Alohida refresh token bo'lsa undан, bo'lmasa mavjud token bilan urinib ko'ramiz
      const refreshTok = localStorage.getItem("refreshToken") || token;
      const r = await axios.post(`${BASE}/auth/refresh-token`, { token: refreshTok });
      const d = r.data ?? {};
      const newAccess = d.accessToken || d.token || d.data?.accessToken;
      const newRefresh = d.refreshToken || d.refresh_token || d.data?.refreshToken;
      if (!newAccess) throw new Error("no access token in refresh response");

      localStorage.setItem("token", newAccess);
      if (newRefresh) localStorage.setItem("refreshToken", newRefresh);
      flushQueue(newAccess);

      original.headers.Authorization = `Bearer ${newAccess}`;
      return api(original);
    } catch {
      flushQueue(null);
      forceLogout();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
