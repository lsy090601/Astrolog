import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const ZODIAC_MAP = {
  aries:       { name: "양자리",     emoji: "♈" },
  taurus:      { name: "황소자리",   emoji: "♉" },
  gemini:      { name: "쌍둥이자리", emoji: "♊" },
  cancer:      { name: "게자리",     emoji: "♋" },
  leo:         { name: "사자자리",   emoji: "♌" },
  virgo:       { name: "처녀자리",   emoji: "♍" },
  libra:       { name: "천칭자리",   emoji: "♎" },
  scorpio:     { name: "전갈자리",   emoji: "♏" },
  sagittarius: { name: "사수자리",   emoji: "♐" },
  capricorn:   { name: "염소자리",   emoji: "♑" },
  aquarius:    { name: "물병자리",   emoji: "♒" },
  pisces:      { name: "물고기자리", emoji: "♓" },
};

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function HomePage() {
  const navigate = useNavigate();
  const [horoscopes, setHoroscopes] = useState([]);
  const [myZodiac] = useState(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.zodiac_sign || "libra";
  });
  const [loading, setLoading] = useState(true);

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
        if (!res.ok) { setHoroscopes([]); return; }
        setHoroscopes(await res.json());
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
  const top3 = horoscopes.slice(0, 3);
  const d = new Date();

  return (
    <div style={s.root}>
      <Sidebar />
      <main style={s.main}>
        {/* Page header */}
        <div style={s.pageHeader}>
          <div>
            <p style={s.dateText}>{getTodayString()} ({WEEKDAYS[d.getDay()]})</p>
            <h1 style={s.pageTitle}>오늘의 운세</h1>
          </div>
          <button style={s.diaryBtn} onClick={() => navigate("/diary")}>
            ✎ 오늘 일기 쓰기
          </button>
        </div>

        {loading ? (
          <div style={s.loadingWrap}>
            <div style={s.loadingSpinner} />
            <p style={s.loadingText}>운세를 불러오는 중...</p>
          </div>
        ) : horoscopes.length === 0 ? (
          <div style={s.emptyWrap}>
            <p style={s.emptyIcon}>🌙</p>
            <p style={s.emptyTitle}>오늘의 운세가 아직 준비 중이에요</p>
            <p style={s.emptyDesc}>잠시 후 다시 확인해주세요.</p>
          </div>
        ) : (
          <div style={s.grid}>
            {/* Left: my card + top 3 */}
            <div style={s.leftCol}>
              {myData && (
                <div style={s.myCard}>
                  <div style={s.myCardInner}>
                    <div style={s.myBadge}>나의 오늘 운세</div>
                    <div style={s.myZodiac}>
                      <span style={s.myEmoji}>{ZODIAC_MAP[myData.zodiac_sign]?.emoji}</span>
                      <span style={s.myZodiacName}>{ZODIAC_MAP[myData.zodiac_sign]?.name}</span>
                    </div>
                    <div style={s.myRank}>{myData.rank}<span style={s.myRankUnit}>위</span></div>
                    <p style={s.myDesc}>{myData.description}</p>
                  </div>
                  <div style={s.myCardDeco}>
                    {ZODIAC_MAP[myData.zodiac_sign]?.emoji}
                  </div>
                </div>
              )}

              {/* Top 3 */}
              <div style={s.sectionLabel}>✦ 오늘의 TOP 3</div>
              <div style={s.top3Grid}>
                {top3.map((h) => {
                  const z = ZODIAC_MAP[h.zodiac_sign];
                  const rankColors = ["#f59e0b", "#94a3b8", "#fb923c"];
                  return (
                    <div key={h.zodiac_sign} style={{ ...s.top3Card, borderColor: h.zodiac_sign === myZodiac ? "rgba(56,189,248,0.4)" : "rgba(255,255,255,0.06)" }}>
                      <span style={{ ...s.top3Rank, color: rankColors[h.rank - 1] }}>{h.rank}위</span>
                      <span style={s.top3Emoji}>{z?.emoji}</span>
                      <span style={s.top3Name}>{z?.name}</span>
                      {h.zodiac_sign === myZodiac && <span style={s.meBadge}>나</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: full ranking */}
            <div style={s.rightCol}>
              <div style={s.rankCard}>
                <p style={s.rankCardTitle}>전체 순위</p>
                <div style={s.rankList}>
                  {horoscopes.map((h) => {
                    const z = ZODIAC_MAP[h.zodiac_sign];
                    const isMe = h.zodiac_sign === myZodiac;
                    const isTop3 = h.rank <= 3;
                    return (
                      <div
                        key={h.zodiac_sign}
                        style={{ ...s.rankRow, background: isMe ? "rgba(56,189,248,0.06)" : "transparent", borderColor: isMe ? "rgba(56,189,248,0.2)" : "transparent" }}
                      >
                        <span style={{ ...s.rankNum, color: isTop3 ? "#f59e0b" : "#334155" }}>
                          {h.rank}
                        </span>
                        <span style={s.rankEmoji}>{z?.emoji}</span>
                        <div style={s.rankInfo}>
                          <span style={{ ...s.rankName, color: isMe ? "#38bdf8" : "#94a3b8" }}>
                            {z?.name}
                            {isMe && <span style={s.meBadgeInline}> 나</span>}
                          </span>
                          <span style={s.rankDesc} title={h.description}>
                            {h.description?.length > 30 ? h.description.slice(0, 30) + "…" : h.description}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const s = {
  root: { display: "flex", minHeight: "100vh", background: "#070d1a" },
  main: { marginLeft: 240, flex: 1, padding: "44px 48px", maxWidth: "calc(100% - 240px)" },

  pageHeader: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 36,
  },
  dateText: { fontSize: 13, color: "#334155", marginBottom: 6, letterSpacing: 0.5 },
  pageTitle: { fontSize: 28, fontWeight: 700, color: "#f1f5f9" },
  diaryBtn: {
    padding: "10px 20px",
    background: "rgba(56,189,248,0.1)",
    border: "1px solid rgba(56,189,248,0.25)",
    borderRadius: 10,
    color: "#38bdf8",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: 0.2,
  },

  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 120, gap: 16 },
  loadingSpinner: { width: 36, height: 36, border: "3px solid rgba(255,255,255,0.08)", borderTop: "3px solid #38bdf8", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  loadingText: { color: "#334155", fontSize: 14 },

  emptyWrap: { textAlign: "center", paddingTop: 120 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 17, color: "#94a3b8", fontWeight: 600, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: "#334155" },

  grid: { display: "grid", gridTemplateColumns: "1fr 380px", gap: 28, alignItems: "start" },

  leftCol: { display: "flex", flexDirection: "column", gap: 24 },

  myCard: {
    background: "linear-gradient(135deg, #0c2340 0%, #1a1040 100%)",
    border: "1px solid rgba(56,189,248,0.2)",
    borderRadius: 20,
    padding: "32px 36px",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  myCardInner: { flex: 1 },
  myBadge: {
    display: "inline-block",
    padding: "4px 14px",
    background: "rgba(56,189,248,0.15)",
    border: "1px solid rgba(56,189,248,0.3)",
    borderRadius: 20,
    fontSize: 12,
    color: "#38bdf8",
    fontWeight: 600,
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  myZodiac: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 },
  myEmoji: { fontSize: 20 },
  myZodiacName: { fontSize: 15, color: "#94a3b8", fontWeight: 500 },
  myRank: { fontSize: 64, fontWeight: 800, color: "#f1f5f9", lineHeight: 1, marginBottom: 16 },
  myRankUnit: { fontSize: 28, fontWeight: 600, color: "#475569", marginLeft: 4 },
  myDesc: { fontSize: 15, color: "#94a3b8", lineHeight: 1.7, maxWidth: 400 },
  myCardDeco: {
    fontSize: 100,
    opacity: 0.06,
    lineHeight: 1,
    alignSelf: "center",
    flexShrink: 0,
    marginLeft: 16,
  },

  sectionLabel: { fontSize: 13, fontWeight: 700, color: "#334155", letterSpacing: 1 },

  top3Grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 },
  top3Card: {
    background: "#0f1928",
    border: "1px solid",
    borderRadius: 14,
    padding: "20px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    position: "relative",
  },
  top3Rank: { fontSize: 12, fontWeight: 800, letterSpacing: 0.5 },
  top3Emoji: { fontSize: 32, margin: "4px 0" },
  top3Name: { fontSize: 13, color: "#64748b", fontWeight: 500 },
  meBadge: {
    position: "absolute",
    top: 10, right: 10,
    fontSize: 10, background: "#38bdf8", color: "#070d1a",
    padding: "2px 7px", borderRadius: 20, fontWeight: 700,
  },

  rightCol: {},
  rankCard: {
    background: "#0f1928",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: "24px",
    position: "sticky",
    top: 24,
  },
  rankCardTitle: { fontSize: 14, fontWeight: 700, color: "#475569", marginBottom: 16, letterSpacing: 0.5 },
  rankList: { display: "flex", flexDirection: "column", gap: 2 },
  rankRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid transparent",
    transition: "all 0.15s",
  },
  rankNum: { fontSize: 13, fontWeight: 800, minWidth: 20, textAlign: "right" },
  rankEmoji: { fontSize: 18, flexShrink: 0 },
  rankInfo: { flex: 1, display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  rankName: { fontSize: 13, fontWeight: 600 },
  meBadgeInline: {
    fontSize: 10, background: "#38bdf8", color: "#070d1a",
    padding: "1px 6px", borderRadius: 10, fontWeight: 700,
    marginLeft: 4, verticalAlign: "middle",
  },
  rankDesc: { fontSize: 11, color: "#334155", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
};
