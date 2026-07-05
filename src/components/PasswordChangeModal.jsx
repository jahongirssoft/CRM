import { useState, useEffect } from "react";
import { TextField, Button, InputAdornment, IconButton, Alert } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { sendOtp, verifyOtp, changePassword } from "../api/auth";

const PRIMARY = "#1c2d6e";

/**
 * OTP orqali parolni o'zgartirish/tiklash modali.
 * Login (parolni unutdim) va Dashboard (parolni o'zgartirish) ikkalasида ishlatiladi.
 */
export default function PasswordChangeModal({ open, onClose, initialPhone = "+998", title = "Parolni o'zgartirish" }) {
  const [step, setStep]         = useState(1); // 1: telefon, 2: kod, 3: yangi parol
  const [phone, setPhone]       = useState(initialPhone);
  const [otp, setOtp]           = useState("");
  const [pass, setPass]         = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [done, setDone]         = useState(false);

  // Har ochilганда holatni tozalaymiz
  useEffect(() => {
    if (!open) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    setStep(1);
    setPhone(initialPhone && initialPhone.trim() ? initialPhone.trim() : "+998");
    setOtp("");
    setPass("");
    setError("");
    setDone(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [open, initialPhone]);

  if (!open) return null;

  const apiErr = (e, fallback) => {
    const m = e?.response?.data?.message;
    return Array.isArray(m) ? m.join(", ") : (m || fallback);
  };

  const handleSendOtp = async () => {
    setError("");
    if (!phone.trim() || phone.trim().length < 7) { setError("Telefon raqamni to'liq kiriting."); return; }
    setLoading(true);
    try { await sendOtp(phone); setStep(2); }
    catch (e) { setError(apiErr(e, "Bu raqam topilmadi yoki kod yuborilmadi.")); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    setError("");
    if (!/^\d{4,6}$/.test(otp.trim())) { setError("Kodni to'g'ri kiriting (4-6 raqam)."); return; }
    setLoading(true);
    try { await verifyOtp(phone, otp); setStep(3); }
    catch (e) { setError(apiErr(e, "Kod noto'g'ri yoki muddati o'tgan.")); }
    finally { setLoading(false); }
  };

  const handleChange = async () => {
    setError("");
    if (pass.length < 4) { setError("Parol kamida 4 belgidan iborat bo'lsin."); return; }
    setLoading(true);
    try { await changePassword(phone, pass); setDone(true); }
    catch (e) { setError(apiErr(e, "Parolni yangilashda xatolik.")); }
    finally { setLoading(false); }
  };

  const btnSx = {
    mt: 2, backgroundColor: PRIMARY, "&:hover": { backgroundColor: "#162357" },
    borderRadius: "8px", textTransform: "none", fontSize: 15, fontWeight: 600, py: 1.2,
  };
  const fieldSx = { "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 14 } };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(15,23,42,0.45)", backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 380, background: "#fff", borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)", padding: "24px 24px 22px",
          fontFamily: "'Segoe UI', sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: 0 }}>{title}</h2>
            <p style={{ fontSize: 12.5, color: "#6b7280", margin: "5px 0 0" }}>
              {done ? "Parol muvaffaqiyatli yangilandi."
                : step === 1 ? "Telefon raqamingizga tasdiqlash kodi yuboriladi."
                : step === 2 ? `${phone} raqamiga yuborilgan kodni kiriting.`
                : "Yangi parolni kiriting."}
            </p>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "#6b7280", fontSize: 22, lineHeight: 1, padding: 0 }}>×</button>
        </div>

        {/* Bosqich indikatori */}
        {!done && (
          <div style={{ display: "flex", gap: 6, margin: "14px 0 18px" }}>
            {[1, 2, 3].map((s) => (
              <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: s <= step ? PRIMARY : "#e5e7eb", transition: "background 0.2s" }} />
            ))}
          </div>
        )}

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "8px", fontSize: 13 }}>{error}</Alert>}

        {done ? (
          <>
            <Alert severity="success" sx={{ mb: 2, borderRadius: "8px", fontSize: 13 }}>
              Yangi parolingiz saqlandi.
            </Alert>
            <Button fullWidth variant="contained" onClick={onClose} sx={{ ...btnSx, mt: 0 }}>Yopish</Button>
          </>
        ) : step === 1 ? (
          <>
            <TextField label="Telefon raqam" size="small" fullWidth value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendOtp()} sx={fieldSx} />
            <Button fullWidth variant="contained" onClick={handleSendOtp} disabled={loading} sx={btnSx}>
              {loading ? "Yuborilmoqda..." : "Kod yuborish"}
            </Button>
          </>
        ) : step === 2 ? (
          <>
            <TextField label="Tasdiqlash kodi" size="small" fullWidth value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
              inputProps={{ inputMode: "numeric", maxLength: 6 }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 14, letterSpacing: 3 } }} />
            <Button fullWidth variant="contained" onClick={handleVerifyOtp} disabled={loading} sx={btnSx}>
              {loading ? "Tekshirilmoqda..." : "Tasdiqlash"}
            </Button>
            <button type="button" onClick={handleSendOtp} disabled={loading}
              style={{ display: "block", margin: "12px auto 0", background: "none", border: "none", color: PRIMARY, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Kodni qayta yuborish
            </button>
          </>
        ) : (
          <>
            <TextField label="Yangi parol" size="small" fullWidth
              type={showPass ? "text" : "password"} value={pass}
              onChange={(e) => setPass(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleChange()}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass(!showPass)} edge="end" size="small">
                      {showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={fieldSx} />
            <Button fullWidth variant="contained" onClick={handleChange} disabled={loading} sx={btnSx}>
              {loading ? "Saqlanmoqda..." : "Parolni saqlash"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
