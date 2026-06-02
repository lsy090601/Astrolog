import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "로그인 실패");
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
        <div style={s.stars}>
          {["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"].map((z, i) => (
            <span key={i} style={{ ...s.floatSymbol, ...floatPos[i] }}>{z}</span>
          ))}
        </div>
        <div style={s.leftContent}>
          <h1 style={s.bigLogo}>ASTROLOG</h1>
          <p style={s.bigTagline}>아침을 습관으로<br />운세를 기록으로</p>
          <div style={s.features}>
            {["매일 오하아사 별자리 운세", "감정 일기로 하루를 기록", "AI가 분석하는 나의 패턴"].map((f, i) => (
              <div key={i} style={s.featureItem}>
                <span style={s.featureDot}>✦</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={s.right}>
        <div style={s.card}>
          <h2 style={s.cardTitle}>로그인</h2>
          <p style={s.cardSub}>계정에 로그인하세요</p>

          <form onSubmit={handleLogin} style={s.form}>
            <div style={s.fieldGroup}>
              <label style={s.label}>이메일</label>
              <input
                style={s.input}
                type="email"
                name="email"
                placeholder="example@email.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>비밀번호</label>
              <input
                style={s.input}
                type="password"
                name="password"
                placeholder="비밀번호를 입력하세요"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            {error && <p style={s.error}>{error}</p>}

            <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <p style={s.switchText}>
            계정이 없으신가요?{" "}
            <span style={s.link} onClick={() => navigate("/register")}>
              회원가입
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

const floatPos = [
  { top: "8%", left: "12%" }, { top: "15%", left: "72%" },
  { top: "28%", left: "30%" }, { top: "35%", left: "80%" },
  { top: "50%", left: "15%" }, { top: "55%", left: "60%" },
  { top: "65%", left: "40%" }, { top: "72%", left: "85%" },
  { top: "80%", left: "20%" }, { top: "88%", left: "65%" },
  { top: "42%", left: "50%" }, { top: "20%", left: "50%" },
];

const s = {
  root: {
    display: "flex",
    minHeight: "100vh",
    background: "#070d1a",
  },
  left: {
    flex: "0 0 45%",
    background: "linear-gradient(160deg, #0c1525 0%, #0a1020 100%)",
    borderRight: "1px solid rgba(255,255,255,0.05)",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stars: { position: "absolute", inset: 0 },
  floatSymbol: {
    position: "absolute",
    fontSize: 20,
    color: "rgba(129,140,248,0.15)",
    userSelect: "none",
  },
  leftContent: {
    position: "relative",
    zIndex: 1,
    padding: 48,
    maxWidth: 400,
  },
  bigLogo: {
    fontSize: 44,
    fontWeight: 800,
    letterSpacing: 6,
    background: "linear-gradient(135deg, #38bdf8, #818cf8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    marginBottom: 20,
  },
  bigTagline: {
    fontSize: 22,
    color: "#94a3b8",
    lineHeight: 1.6,
    fontWeight: 400,
    marginBottom: 48,
  },
  features: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    color: "#64748b",
    fontSize: 15,
  },
  featureDot: {
    color: "#38bdf8",
    fontSize: 12,
    flexShrink: 0,
  },

  right: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  card: {
    width: "100%",
    maxWidth: 420,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: "#f1f5f9",
    marginBottom: 8,
  },
  cardSub: {
    fontSize: 15,
    color: "#475569",
    marginBottom: 36,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#94a3b8",
    letterSpacing: 0.3,
  },
  input: {
    padding: "13px 16px",
    background: "#0f1928",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    fontSize: 15,
    color: "#f1f5f9",
    outline: "none",
    transition: "border-color 0.2s",
  },
  error: {
    color: "#f87171",
    fontSize: 13,
    padding: "10px 14px",
    background: "rgba(248,113,113,0.08)",
    borderRadius: 8,
    border: "1px solid rgba(248,113,113,0.2)",
  },
  btn: {
    padding: "14px",
    background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 4,
    letterSpacing: 0.3,
  },
  switchText: {
    textAlign: "center",
    fontSize: 14,
    color: "#475569",
    marginTop: 28,
  },
  link: {
    color: "#38bdf8",
    fontWeight: 600,
    cursor: "pointer",
  },
};
