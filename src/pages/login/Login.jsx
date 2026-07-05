import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { resolveRoleFromLogin, setRole, normalizeRole, ROLES } from "../../api/auth";
import PasswordChangeModal from "../../components/PasswordChangeModal";
import {
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  Collapse,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import studyImg from "../../assets/study.svg";
import logoImg from "../../assets/image.png";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Parolni tiklash modali (OTP oqimi qayta ishlatiladigan komponentда)
  const [resetOpen, setResetOpen] = useState(false);

  const redirectByRole = (role) => {
    const r = normalizeRole(role) || ROLES.ADMIN;
    const navLabel = r === ROLES.STUDENT ? "Bosh sahifa" : "Asosiy";
    localStorage.setItem("activePage_nav", navLabel);
    localStorage.setItem("activePage_page", "asosiy");
    navigate("/dashboard");
  };

  const handleTestLogin = (role) => {
    const payload = {
      id: role === "ADMIN" ? 1 : role === "TEACHER" ? 2 : 3,
      email: `${role.toLowerCase()}@najotedu.uz`,
      role: role,
    };
    const token = "mockHeader." + btoa(JSON.stringify(payload)) + ".mockSignature";
    localStorage.setItem("token", token);
    setRole(role);
    redirectByRole(role);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);

    // Dev/demo: telefon o'rniga admin/teacher/student yozilsa — mock rol bilan kirish
    const lowerPhone = phone.trim().toLowerCase();
    if (["admin", "teacher", "student"].includes(lowerPhone)) {
      handleTestLogin(lowerPhone.toUpperCase());
      return;
    }

    setLoading(true);
    try {
      // Telefonni AYNAN yozilganидек yuboramiz — backend "998.." va "+998.." ni
      // turli akkaunt deb biladi, shuning uchun formatni o'zgartirsak boshqa akkauntga kiradi.
      const res = await api.post("/auth/login", { phone: phone.trim(), password });
      const token =
        res.data?.token ||
        res.data?.data?.token ||
        res.data?.accessToken ||
        res.data?.data?.accessToken;
      if (!token) {
        setError(true);
        return;
      }
      localStorage.setItem("token", token);
      // Refresh token bo'lsa saqlaymiz; bo'lmasa eski (boshqa sessiyaдан qolgan)
      // refreshToken'ni ALBATTA o'chiramiz — aks holda keyingi avtomatik yangilашда
      // u ishlatilib, sessiya noto'g'ri rolga (masalan student'ga) aylanib qolishi mumkin.
      const refreshToken =
        res.data?.refreshToken ||
        res.data?.refresh_token ||
        res.data?.data?.refreshToken ||
        res.data?.data?.refresh_token;
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      else localStorage.removeItem("refreshToken");
      // Rolni login javobidan (yoki token'dan) aniqlab, saqlaymiz va mos kabinetga yo'naltiramiz
      const role = resolveRoleFromLogin(res.data, token) || ROLES.ADMIN;
      setRole(role);
      setAlertOpen(true);
      setTimeout(() => redirectByRole(role), 1200);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        display: "flex",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      {/* ── CHAP (ko'k) ── */}
      <div className="login-left">
        <img
          src={studyImg}
          alt="Study"
          style={{ width: "72%", maxWidth: 460, objectFit: "contain" }}
        />
      </div>

      {/* ── O'NG (oq) ── */}
      <div className="login-right">
        {/* Markaziy blok */}
        <div
          style={{
            width: "100%",
            maxWidth: 360,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Universitet nomi */}
          <p
            style={{
              fontSize: 10,
              color: "#777",
              textTransform: "uppercase",
              letterSpacing: 1.1,
              lineHeight: 2,
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            Muhammad al-Xorazmiy nomidagi <br />
            Toshkent axborot texnologiyalari <br />
            universiteti
          </p>

          {/* Logo */}
          <img
            src={logoImg}
            alt="TUIT logo"
            style={{
              width: 82,
              height: 82,
              objectFit: "contain",
              borderRadius: "50%",
              boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
            }}
          />

          {/* Sarlavha */}
          <h1
            style={{
              fontSize: 13.5,
              fontWeight: 700,
              letterSpacing: 2.2,
              color: "#1a1a1a",
              textAlign: "center",
              marginTop: 16,
              marginBottom: 32,
              lineHeight: 1.5,
            }}
          >
            LEARNING MANAGEMENT SYSTEM
          </h1>

          {/* Alert */}
          <div style={{ width: "100%", marginBottom: (alertOpen || error) ? 14 : 0 }}>
            <Collapse in={alertOpen}>
              <Alert severity="success" sx={{ borderRadius: "8px" }}>
                Muvaffaqiyatli kirildi! Yo&apos;naltirilmoqda...
              </Alert>
            </Collapse>
            <Collapse in={error}>
              <Alert severity="error" sx={{ borderRadius: "8px" }}>
                Login yoki parol noto&apos;g&apos;ri!
              </Alert>
            </Collapse>
          </div>

          {/* Forma */}
          <form
            onSubmit={handleSubmit}
            style={{ width: "100%", display: "flex", flexDirection: "column", gap: 18 }}
          >
            <div>
              <p style={{ fontSize: 13, color: "#444", marginBottom: 6 }}>Telefon raqam</p>
              <TextField
                placeholder="975661099"
                size="small"
                fullWidth
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    fontSize: 14,
                  },
                }}
              />
            </div>

            <div>
              <p style={{ fontSize: 13, color: "#444", marginBottom: 6 }}>Parol</p>
              <TextField
                placeholder="Parolni kiriting"
                size="small"
                fullWidth
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword
                          ? <VisibilityOff fontSize="small" />
                          : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    fontSize: 14,
                  },
                }}
              />
            </div>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: "#1c2d6e",
                "&:hover": { backgroundColor: "#162357" },
                borderRadius: "8px",
                textTransform: "none",
                fontSize: 15,
                fontWeight: 600,
                py: 1.3,
                mt: 0.5,
                boxShadow: "0 4px 14px rgba(28,45,110,0.35)",
              }}
              disabled={loading}
            >
              {loading ? "Kirish..." : "Kirish"}
            </Button>
          </form>

          {/* Parolni tiklash havolasi */}
          <button
            type="button"
            onClick={() => setResetOpen(true)}
            style={{
              alignSelf: "flex-end",
              marginTop: 12,
              background: "none",
              border: "none",
              color: "#1c2d6e",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
            }}
          >
            Parolni unutdingizmi?
          </button>
        </div>

        {/* Footer */}
        <p
          style={{
            position: "absolute",
            bottom: 18,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 11,
            color: "#bbb",
          }}
        >
          Copyright &copy; 2021 of Tashkent University of Information Technologies
        </p>
      </div>

      {/* Parolni tiklash modali (OTP oqimi) */}
      <PasswordChangeModal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        initialPhone={phone}
        title="Parolni tiklash"
      />
    </div>
  );
}
