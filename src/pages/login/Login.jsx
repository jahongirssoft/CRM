import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const res = await api.post("/auth/login", { phone, password });
      const token = res.data?.token || res.data?.data?.token || res.data?.accessToken;
      if (token) localStorage.setItem("token", token);
      setAlertOpen(true);
      setTimeout(() => {
        setAlertOpen(false);
        navigate("/dashboard");
      }, 1500);
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
    </div>
  );
}
