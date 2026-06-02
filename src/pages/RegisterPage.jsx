import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ZODIACS = [
  { name: "양자리",     emoji: "♈", value: "aries" },
  { name: "황소자리",   emoji: "♉", value: "taurus" },
  { name: "쌍둥이자리", emoji: "♊", value: "gemini" },
  { name: "게자리",     emoji: "♋", value: "cancer" },
  { name: "사자자리",   emoji: "♌", value: "leo" },
  { name: "처녀자리",   emoji: "♍", value: "virgo" },
  { name: "천칭자리",   emoji: "♎", value: "libra" },
  { name: "전갈자리",   emoji: "♏", value: "scorpio" },
  { name: "사수자리",   emoji: "♐", value: "sagittarius" },
  { name: "염소자리",   emoji: "♑", value: "capricorn" },
  { name: "물병자리",   emoji: "♒", value: "aquarius" },
  { name: "물고기자리", emoji: "♓", value: "pisces" },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ nickname: "", email: "", password: "", passwordConfirm: "", zodiac_sign: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!form.nickname || !form.email || !form.password) {
      setError("모든 항목을 입력해주세요.");
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (form.password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleRegister = async () => {
    if (!form.zodiac_sign) {
      setError("별자리를 선택해주세요.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: form.nickname, email: form.email, password: form.password, zodiac_sign: form.zodiac_sign }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "회원가입 실패");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.root}>
      {/* Left panel */}
      <div style={s.left}>
        <div style={s.leftContent}>
          <h1 style={s.bigLogo}>ASTROLOG</h1>
          <div style={s.stepInfo}>
            <div style={s.stepRow}>
              <div style={{ ...s.stepCircle, background: "#38bdf8", color: "#070d1a" }}>1</div>
              <div style={{ ...s.stepLine, background: step === 2 ? "#38bdf8" : "rgba(255,255,255,0.1)" }} />
              <div style={{ ...s.stepCircle, background: step === 2 ? "#38bdf8" : "rgba(255,255,255,0.08)", color: step === 2 ? "#070d1a" : "#334155" }}>2</div>
            </div>
            <div style={s.stepLabels}>
              <span style={{ ...s.stepLabel, color: "#38bdf8" }}>기본 정보</span>
              <span style={{ ...s.stepLabel, color: step === 2 ? "#38bdf8" : "#334155" }}>별자리 선택</span>
            </div>
          </div>
          <p style={s.desc}>
            {step === 1
              ? "닉네임, 이메일, 비밀번호를\n입력해주세요."
              : "나의 별자리를 선택해서\n운세를 받아보세요."}
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div style={s.right}>
        <div style={s.card}>
          <h2 style={s.cardTitle}>{step === 1 ? "기본 정보 입력" : "별자리 선택"}</h2>
          <p style={s.cardSub}>
            {step === 1 ? "사용할 계정 정보를 입력하세요" : "회원가입 후 변경이 불가능해요"}
          </p>

          {step === 1 && (
            <form onSubmit={handleStep1} style={s.form}>
              {[
                { name: "nickname", label: "닉네임", type: "text", placeholder: "사용할 닉네임" },
                { name: "email", label: "이메일", type: "email", placeholder: "example@email.com" },
                { name: "password", label: "비밀번호", type: "password", placeholder: "6자 이상" },
                { name: "passwordConfirm", label: "비밀번호 확인", type: "password", placeholder: "비밀번호를 다시 입력" },
              ].map(({ name, label, type, placeholder }) => (
                <div key={name} style={s.fieldGroup}>
                  <label style={s.label}>{label}</label>
                  <input style={s.input} type={type} name={name} placeholder={placeholder} value={form[name]} onChange={handleChange} />
                </div>
              ))}
              {error && <p style={s.error}>{error}</p>}
              <button style={s.btn} type="submit">다음 →</button>
            </form>
          )}

          {step === 2 && (
            <div>
              <div style={s.zodiacGrid}>
                {ZODIACS.map((z) => {
                  const selected = form.zodiac_sign === z.value;
                  return (
                    <button
                      key={z.value}
                      style={{ ...s.zodiacBtn, ...(selected ? s.zodiacBtnActive : {}) }}
                      onClick={() => { setForm({ ...form, zodiac_sign: z.value }); setError(""); }}
                    >
                      <span style={s.zodiacEmoji}>{z.emoji}</span>
                      <span style={s.zodiacName}>{z.name}</span>
                    </button>
                  );
                })}
              </div>
              {error && <p style={s.error}>{error}</p>}
              <button style={{ ...s.btn, opacity: loading ? 0.7 : 1, marginTop: 20 }} onClick={handleRegister} disabled={loading}>
                {loading ? "가입 중..." : "시작하기 ✦"}
              </button>
              <button style={s.backBtn} onClick={() => setStep(1)}>← 이전으로</button>
            </div>
          )}

          <p style={s.switchText}>
            이미 계정이 있으신가요?{" "}
            <span style={s.link} onClick={() => navigate("/")}>로그인</span>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  root: { display: "flex", minHeight: "100vh", background: "#070d1a" },
  left: {
    flex: "0 0 38%",
    background: "linear-gradient(160deg, #0c1525 0%, #0a1020 100%)",
    borderRight: "1px solid rgba(255,255,255,0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
  },
  leftContent: { maxWidth: 320 },
  bigLogo: {
    fontSize: 32,
    fontWeight: 800,
    letterSpacing: 5,
    background: "linear-gradient(135deg, #38bdf8, #818cf8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    marginBottom: 48,
  },
  stepInfo: { marginBottom: 32 },
  stepRow: { display: "flex", alignItems: "center", gap: 0, marginBottom: 12 },
  stepCircle: {
    width: 32, height: 32, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 14, fontWeight: 700, flexShrink: 0, transition: "all 0.3s",
  },
  stepLine: { flex: 1, height: 2, transition: "background 0.3s" },
  stepLabels: { display: "flex", justifyContent: "space-between" },
  stepLabel: { fontSize: 12, fontWeight: 600, transition: "color 0.3s" },
  desc: {
    fontSize: 16, color: "#475569", lineHeight: 1.8,
    whiteSpace: "pre-line",
  },
  right: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 },
  card: { width: "100%", maxWidth: 480 },
  cardTitle: { fontSize: 26, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 },
  cardSub: { fontSize: 14, color: "#475569", marginBottom: 32 },
  form: { display: "flex", flexDirection: "column", gap: 18 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 13, fontWeight: 600, color: "#94a3b8" },
  input: {
    padding: "12px 16px",
    background: "#0f1928",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    fontSize: 14, color: "#f1f5f9", outline: "none",
  },
  error: {
    color: "#f87171", fontSize: 13,
    padding: "10px 14px",
    background: "rgba(248,113,113,0.08)",
    borderRadius: 8,
    border: "1px solid rgba(248,113,113,0.15)",
  },
  btn: {
    width: "100%", padding: "13px",
    background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
    color: "white", border: "none", borderRadius: 10,
    fontSize: 15, fontWeight: 700, cursor: "pointer",
  },
  backBtn: {
    width: "100%", padding: "10px",
    background: "none", border: "none",
    color: "#334155", fontSize: 14, cursor: "pointer", marginTop: 8,
  },
  zodiacGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 8,
  },
  zodiacBtn: {
    padding: "12px 8px",
    borderRadius: 10, cursor: "pointer",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
    background: "#0f1928",
    border: "1px solid rgba(255,255,255,0.07)",
    transition: "all 0.15s", color: "#64748b",
  },
  zodiacBtnActive: {
    background: "rgba(56,189,248,0.1)",
    border: "1px solid rgba(56,189,248,0.4)",
    color: "#38bdf8",
  },
  zodiacEmoji: { fontSize: 22 },
  zodiacName: { fontSize: 11, fontWeight: 500 },
  switchText: { textAlign: "center", fontSize: 13, color: "#334155", marginTop: 24 },
  link: { color: "#38bdf8", fontWeight: 600, cursor: "pointer" },
};
