import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ZODIAC_MAP = {
  aries: { name: "양자리", emoji: "♈" },
  taurus: { name: "황소자리", emoji: "♉" },
  gemini: { name: "쌍둥이자리", emoji: "♊" },
  cancer: { name: "게자리", emoji: "♋" },
  leo: { name: "사자자리", emoji: "♌" },
  virgo: { name: "처녀자리", emoji: "♍" },
  libra: { name: "천칭자리", emoji: "♎" },
  scorpio: { name: "전갈자리", emoji: "♏" },
  sagittarius: { name: "사수자리", emoji: "♐" },
  capricorn: { name: "염소자리", emoji: "♑" },
  aquarius: { name: "물병자리", emoji: "♒" },
  pisces: { name: "물고기자리", emoji: "♓" },
};

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [horoscopes, setHoroscopes] = useState([]);
  const [myZodiac] = useState(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.zodiac_sign || "libra";
  });
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function fetchHoroscope() {
      setLoading(true);
      try {
        const res = await fetch("/api/horoscope/today", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/");
          return;
        }
        if (!res.ok) {
          setHoroscopes([]);
          return;
        }
        const data = await res.json();
        setHoroscopes(data);
      } catch (err) {
        console.error(err);
        setHoroscopes([]);
      } finally {
        setLoading(false);
      }
    }
    fetchHoroscope();
  }, [navigate]);

  const myData = horoscopes.find((h) => h.zodiac_sign === myZodiac);
  const visibleList = showAll ? horoscopes : horoscopes.slice(0, 6);

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <p style={styles.loadingText}>✨ 오늘의 운세 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* 헤더 */}
      <div style={styles.header}>
        <div>
          <p style={styles.headerDate}>{getTodayString()}</p>
          <h1 style={styles.headerTitle}>ASTROLOG</h1>
        </div>
        <button
          style={styles.bellBtn}
          onClick={() => alert("알림 설정 준비 중이에요!")}
        >
          🔔
        </button>
      </div>

      <div style={styles.content}>
        {horoscopes.length === 0 ? (
          <div style={styles.emptyWrap}>
            <p style={styles.emptyIcon}>🌙</p>
            <p style={styles.emptyText}>오늘의 운세 데이터가 준비 중이에요.</p>
            <p style={styles.emptySubText}>잠시 후 다시 확인해주세요.</p>
          </div>
        ) : (
          <>
            {/* 내 별자리 카드 */}
            {myData && (
              <div style={styles.myCard}>
                <div style={styles.myCardBadge}>오늘의 내 운세</div>
                <div style={styles.myCardZodiac}>
                  {ZODIAC_MAP[myData.zodiac_sign]?.emoji}{" "}
                  {ZODIAC_MAP[myData.zodiac_sign]?.name}
                </div>
                <div style={styles.myCardRank}>{myData.rank}위</div>
                <p style={styles.myCardDesc}>{myData.description}</p>
              </div>
            )}

            {/* 전체 순위 */}
            <p style={styles.sectionTitle}>전체 순위</p>
            <div style={styles.rankList}>
              {visibleList.map((h) => {
                const z = ZODIAC_MAP[h.zodiac_sign];
                const isMe = h.zodiac_sign === myZodiac;
                return (
                  <div
                    key={h.zodiac_sign}
                    style={{
                      ...styles.rankItem,
                      background: isMe ? "#e8f7fd" : "#f8f8f8",
                    }}
                  >
                    <span
                      style={{
                        ...styles.rankNum,
                        color: h.rank <= 3 ? "#FF6B35" : "#29ABE2",
                      }}
                    >
                      {h.rank}위
                    </span>
                    <span style={styles.rankEmoji}>{z?.emoji}</span>
                    <span style={styles.rankName}>{z?.name}</span>
                    {isMe && <span style={styles.meBadge}>나</span>}
                  </div>
                );
              })}
            </div>

            <button style={styles.showMoreBtn} onClick={() => setShowAll(!showAll)}>
              {showAll ? "접기 ▲" : "전체 보기 ▼"}
            </button>
          </>
        )}
      </div>

      {/* 하단 네비게이션 */}
      <BottomNav current="home" navigate={navigate} />
    </div>
  );
}

export function BottomNav({ current, navigate }) {
  const tabs = [
    { key: "home", label: "홈", icon: "🏠", path: "/home" },
    { key: "diary", label: "일기", icon: "✏️", path: "/diary" },
    { key: "chart", label: "통계", icon: "📊", path: "/chart" },
    { key: "insight", label: "인사이트", icon: "✨", path: "/insight" },
  ];
  return (
    <div style={styles.nav}>
      {tabs.map((t) => (
        <button
          key={t.key}
          style={{
            ...styles.navBtn,
            color: current === t.key ? "#29ABE2" : "#aaa",
          }}
          onClick={() => navigate(t.path)}
        >
          <span style={{ fontSize: 20 }}>{t.icon}</span>
          <span style={{ fontSize: 11 }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

const styles = {
  page: {
    maxWidth: 390,
    margin: "0 auto",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#fff",
  },
  loadingWrap: {
    maxWidth: 390,
    margin: "0 auto",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: { fontSize: 15, color: "#888" },

  header: {
    background: "#29ABE2",
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerDate: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    marginBottom: 2,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: 2,
    margin: 0,
  },
  bellBtn: {
    background: "none",
    border: "none",
    fontSize: 20,
    cursor: "pointer",
  },

  content: { padding: "20px 20px 100px", flex: 1 },

  emptyWrap: { textAlign: "center", paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: "#555", fontWeight: 600, marginBottom: 6 },
  emptySubText: { fontSize: 13, color: "#aaa" },

  myCard: {
    background: "linear-gradient(135deg, #29ABE2, #1a8cc4)",
    borderRadius: 16,
    padding: 20,
    color: "white",
    marginBottom: 20,
  },
  myCardBadge: {
    display: "inline-block",
    background: "rgba(255,255,255,0.25)",
    borderRadius: 20,
    padding: "3px 12px",
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 10,
  },
  myCardZodiac: { fontSize: 14, opacity: 0.9, marginBottom: 4 },
  myCardRank: {
    fontSize: 36,
    fontWeight: 700,
    lineHeight: 1.2,
    marginBottom: 8,
  },
  myCardDesc: { fontSize: 13, lineHeight: 1.7, opacity: 0.9 },

  sectionTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#222",
    marginBottom: 12,
  },
  rankList: { display: "flex", flexDirection: "column", gap: 8 },
  rankItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderRadius: 10,
  },
  rankNum: { fontSize: 14, fontWeight: 700, minWidth: 30 },
  rankEmoji: { fontSize: 18 },
  rankName: { fontSize: 14, fontWeight: 500, color: "#222", flex: 1 },
  meBadge: {
    fontSize: 11,
    background: "#29ABE2",
    color: "white",
    padding: "2px 8px",
    borderRadius: 10,
  },

  showMoreBtn: {
    width: "100%",
    marginTop: 12,
    padding: "10px 0",
    background: "none",
    border: "1px solid #ddd",
    borderRadius: 10,
    fontSize: 13,
    color: "#888",
    cursor: "pointer",
    fontFamily: "inherit",
  },

  nav: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 390,
    display: "flex",
    background: "white",
    borderTop: "1px solid #eee",
  },
  navBtn: {
    flex: 1,
    padding: "10px 0",
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    fontFamily: "inherit",
  },
};
