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
    <div style={styles.container}>
      <div style={styles.logo}>
        <h1 style={styles.logoText}>ASTROLOG</h1>
        <p style={styles.logoSub}>아침을 습관으로, 운세를 기록으로</p>
      </div>

      <form onSubmit={handleLogin} style={styles.form}>
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
          placeholder="비밀번호"
          value={form.password}
          onChange={handleChange}
        />

        {error && <p style={styles.error}>{error}</p>}

        <button style={styles.btn} type="submit" disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <p style={styles.registerLink}>
        계정이 없으신가요?{" "}
        <span style={styles.link} onClick={() => navigate("/register")}>
          회원가입
        </span>
      </p>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 390,
    margin: "0 auto",
    padding: "60px 24px",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  logo: { textAlign: "center", marginBottom: 40 },
  logoText: {
    fontSize: 36,
    fontWeight: 700,
    color: "#29ABE2",
    letterSpacing: 3,
    margin: 0,
  },
  logoSub: { fontSize: 13, color: "#888", marginTop: 8 },
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
    padding: 13,
    background: "#29ABE2",
    color: "white",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 4,
    fontFamily: "inherit",
  },
  registerLink: {
    textAlign: "center",
    fontSize: 13,
    color: "#888",
    marginTop: 20,
  },
  link: { color: "#29ABE2", fontWeight: 500, cursor: "pointer" },
};
