import { useNavigate, useLocation } from "react-router-dom";

const ZODIAC_KO = {
  aries: "양자리", taurus: "황소자리", gemini: "쌍둥이자리",
  cancer: "게자리", leo: "사자자리", virgo: "처녀자리",
  libra: "천칭자리", scorpio: "전갈자리", sagittarius: "사수자리",
  capricorn: "염소자리", aquarius: "물병자리", pisces: "물고기자리",
};

const ZODIAC_EMOJI = {
  aries:"♈", taurus:"♉", gemini:"♊", cancer:"♋", leo:"♌", virgo:"♍",
  libra:"♎", scorpio:"♏", sagittarius:"♐", capricorn:"♑", aquarius:"♒", pisces:"♓",
};

const NAV_ITEMS = [
  { key: "home",    label: "오늘의 운세", icon: "✦", path: "/home" },
  { key: "diary",   label: "감정 일기",   icon: "✎", path: "/diary" },
  { key: "chart",   label: "통계",        icon: "◎", path: "/chart" },
  { key: "insight", label: "AI 인사이트", icon: "✨", path: "/insight" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <aside style={s.sidebar}>
      <div style={s.logoWrap}>
        <h1 style={s.logo}>ASTROLOG</h1>
        <p style={s.logoSub}>아침을 습관으로, 운세를 기록으로</p>
      </div>

      {user && (
        <div style={s.userCard}>
          <div style={s.avatar}>{ZODIAC_EMOJI[user.zodiac_sign] || "★"}</div>
          <div>
            <p style={s.userName}>{user.nickname}</p>
            <p style={s.userZodiac}>{ZODIAC_KO[user.zodiac_sign] || user.zodiac_sign}</p>
          </div>
        </div>
      )}

      <nav style={s.nav}>
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.key}
              style={{ ...s.navItem, ...(active ? s.navItemActive : {}) }}
              onClick={() => navigate(item.path)}
            >
              <span style={s.navIcon}>{item.icon}</span>
              {item.label}
              {active && <span style={s.activeDot} />}
            </button>
          );
        })}
      </nav>

      <div style={s.bottom}>
        <button style={s.logoutBtn} onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </aside>
  );
}

const s = {
  sidebar: {
    width: 240,
    minHeight: "100vh",
    background: "#0c1220",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    flexDirection: "column",
    padding: "32px 0",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 100,
  },
  logoWrap: {
    padding: "0 24px 28px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    marginBottom: 24,
  },
  logo: {
    fontSize: 20,
    fontWeight: 800,
    letterSpacing: 4,
    background: "linear-gradient(135deg, #38bdf8, #818cf8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    marginBottom: 6,
  },
  logoSub: {
    fontSize: 11,
    color: "#334155",
    letterSpacing: 0.3,
  },
  userCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 20px 24px",
    marginBottom: 8,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #1e3a5f, #4c1d95)",
    border: "1px solid rgba(129,140,248,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    flexShrink: 0,
  },
  userName: {
    fontSize: 14,
    fontWeight: 600,
    color: "#e2e8f0",
    marginBottom: 3,
  },
  userZodiac: {
    fontSize: 12,
    color: "#475569",
  },
  nav: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "0 12px",
    gap: 2,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "11px 12px",
    borderRadius: 10,
    border: "none",
    background: "none",
    color: "#475569",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.15s",
    position: "relative",
  },
  navItemActive: {
    background: "rgba(56,189,248,0.08)",
    color: "#38bdf8",
    fontWeight: 600,
  },
  navIcon: {
    fontSize: 15,
    width: 20,
    textAlign: "center",
    flexShrink: 0,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: "50%",
    background: "#38bdf8",
    marginLeft: "auto",
  },
  bottom: {
    padding: "20px 16px 0",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    marginTop: 16,
  },
  logoutBtn: {
    width: "100%",
    padding: "9px 0",
    background: "none",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 8,
    color: "#334155",
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.15s",
  },
};
