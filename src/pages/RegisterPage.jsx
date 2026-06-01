import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ZODIACS = [
  { name: "양자리", emoji: "♈", value: "aries" },
  { name: "황소자리", emoji: "♉", value: "taurus" },
  { name: "쌍둥이자리", emoji: "♊", value: "gemini" },
  { name: "게자리", emoji: "♋", value: "cancer" },
  { name: "사자자리", emoji: "♌", value: "leo" },
  { name: "처녀자리", emoji: "♍", value: "virgo" },
  { name: "천칭자리", emoji: "♎", value: "libra" },
  { name: "전갈자리", emoji: "♏", value: "scorpio" },
  { name: "사수자리", emoji: "♐", value: "sagittarius" },
  { name: "염소자리", emoji: "♑", value: "capricorn" },
  { name: "물병자리", emoji: "♒", value: "aquarius" },
  { name: "물고기자리", emoji: "♓", value: "pisces" },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nickname: "",
    email: "",
    password: "",
    passwordConfirm: "",
    zodiac_sign: "",
  });
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
        body: JSON.stringify({
          nickname: form.nickname,
          email: form.email,
          password: form.password,
          zodiac_sign: form.zodiac_sign,
        }),
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
    <div style={styles.container}>
      <div style={styles.logo}>
        <h1 style={styles.logoText}>ASTROLOG</h1>
        <p style={styles.logoSub}>
          {step === 1
            ? "기본 정보를 입력해주세요"
            : "나의 별자리를 선택해주세요"}
        </p>
      </div>

      {/* 스텝 인디케이터 */}
      <div style={styles.stepRow}>
        <div style={{ ...styles.stepDot, background: "#29ABE2" }} />
        <div style={styles.stepLine} />
        <div
          style={{
            ...styles.stepDot,
            background: step === 2 ? "#29ABE2" : "#ddd",
          }}
        />
      </div>

      {step === 1 && (
        <form onSubmit={handleStep1} style={styles.form}>
          <input
            style={styles.input}
            type="text"
            name="nickname"
            placeholder="닉네임"
            value={form.nickname}
            onChange={handleChange}
          />
          <input
            style={styles.input}
            type="email"
            name="email"
            placeholder="이메일"
            value={form.email}
            onChange={handleChange}
          />
          <input
            style={styles.input}
            type="password"
            name="password"
            placeholder="비밀번호 (6자 이상)"
            value={form.password}
            onChange={handleChange}
          />
          <input
            style={styles.input}
            type="password"
            name="passwordConfirm"
            placeholder="비밀번호 확인"
            value={form.passwordConfirm}
            onChange={handleChange}
          />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.btn} type="submit">
            다음
          </button>
        </form>
      )}

      {step === 2 && (
        <div>
          <div style={styles.zodiacGrid}>
            {ZODIACS.map((z) => (
              <button
                key={z.value}
                style={{
                  ...styles.zodiacBtn,
                  background:
                    form.zodiac_sign === z.value ? "#29ABE2" : "#f5f5f5",
                  color: form.zodiac_sign === z.value ? "white" : "#333",
                  border:
                    form.zodiac_sign === z.value
                      ? "1.5px solid #29ABE2"
                      : "1px solid #eee",
                }}
                onClick={() => {
                  setForm({ ...form, zodiac_sign: z.value });
                  setError("");
                }}
              >
                <span style={{ fontSize: 18 }}>{z.emoji}</span>
                <span style={{ fontSize: 12 }}>{z.name}</span>
              </button>
            ))}
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button
            style={styles.btn}
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? "가입 중..." : "시작하기 🚀"}
          </button>
          <button style={styles.backBtn} onClick={() => setStep(1)}>
            ← 이전
          </button>
        </div>
      )}

      <p style={styles.loginLink}>
        이미 계정이 있으신가요?{" "}
        <span style={styles.link} onClick={() => navigate("/")}>
          로그인
        </span>
      </p>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 390,
    margin: "0 auto",
    padding: "50px 24px",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  logo: { textAlign: "center", marginBottom: 28 },
  logoText: {
    fontSize: 32,
    fontWeight: 700,
    color: "#29ABE2",
    letterSpacing: 3,
    margin: 0,
  },
  logoSub: { fontSize: 13, color: "#888", marginTop: 8 },
  stepRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: "50%",
    transition: "background 0.3s",
  },
  stepLine: { width: 60, height: 2, background: "#ddd" },
  form: { display: "flex", flexDirection: "column", gap: 10 },
  input: {
    padding: "12px 14px",
    border: "1px solid #ddd",
    borderRadius: 10,
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
  },
  error: { color: "#e24b4a", fontSize: 13, marginTop: 2 },
  btn: {
    width: "100%",
    padding: 13,
    background: "#29ABE2",
    color: "white",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 6,
    fontFamily: "inherit",
  },
  backBtn: {
    width: "100%",
    padding: 10,
    background: "none",
    color: "#888",
    border: "none",
    fontSize: 14,
    cursor: "pointer",
    marginTop: 4,
    fontFamily: "inherit",
  },
  zodiacGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
    marginBottom: 16,
  },
  zodiacBtn: {
    padding: "10px 4px",
    borderRadius: 10,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    fontFamily: "inherit",
    transition: "all 0.15s",
  },
  loginLink: {
    textAlign: "center",
    fontSize: 13,
    color: "#888",
    marginTop: 20,
  },
  link: { color: "#29ABE2", fontWeight: 500, cursor: "pointer" },
};
