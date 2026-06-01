import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "./HomePage";

export default function InsightPage() {
  const navigate = useNavigate();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function fetchInsights() {
      setLoading(true);
      try {
        const res = await fetch("/api/insight", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/");
          return;
        }
        if (!res.ok) return;
        const data = await res.json();
        setInsights(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, [navigate]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/insight/generate", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "인사이트 생성에 실패했습니다.");
        return;
      }
      setInsights((prev) => [data, ...prev]);
    } catch (err) {
      console.error(err);
      alert("서버 연결에 실패했습니다.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* 헤더 */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>AI 인사이트</h1>
        <p style={styles.headerSub}>나의 운세와 감정 패턴을 분석해드려요</p>
      </div>

      <div style={styles.content}>
        {/* AI 분석 요청 카드 */}
        <div style={styles.generateCard}>
          <div style={styles.generateLeft}>
            <p style={styles.generateTitle}>✨ 새 인사이트 생성</p>
            <p style={styles.generateDesc}>
              최근 7일 데이터를 AI가 분석해드려요
            </p>
          </div>
          <button
            style={{ ...styles.generateBtn, opacity: generating ? 0.7 : 1 }}
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? "분석 중..." : "분석하기"}
          </button>
        </div>

        {generating && (
          <div style={styles.analyzingWrap}>
            <div style={styles.analyzingDots}>
              <span style={{ ...styles.dot, animationDelay: "0s" }} />
              <span style={{ ...styles.dot, animationDelay: "0.2s" }} />
              <span style={{ ...styles.dot, animationDelay: "0.4s" }} />
            </div>
            <p style={styles.analyzingText}>
              운세와 감정 데이터를 분석하고 있어요...
            </p>
          </div>
        )}

        {/* 인사이트 목록 */}
        <p style={styles.sectionTitle}>지난 인사이트</p>

        {loading ? (
          <p style={styles.loadingText}>인사이트 불러오는 중...</p>
        ) : insights.length === 0 ? (
          <div style={styles.emptyWrap}>
            <p style={styles.emptyIcon}>🔍</p>
            <p style={styles.emptyText}>아직 인사이트가 없어요.</p>
            <p style={styles.emptySubText}>
              7일 이상 기록 후 분석을 요청해보세요!
            </p>
          </div>
        ) : (
          <div style={styles.insightList}>
            {insights.map((item) => (
              <InsightCard key={item.insight_id} item={item} />
            ))}
          </div>
        )}
      </div>

      <BottomNav current="insight" navigate={navigate} />

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

/* ────────── 인사이트 카드 ────────── */
function InsightCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = item.content.length > 80;
  const displayText =
    !expanded && isLong ? item.content.slice(0, 80) + "..." : item.content;

  return (
    <div style={styles.insightCard}>
      <div style={styles.insightTop}>
        <span style={{ ...styles.insightTag, background: item.tag_color }}>
          {item.tag}
        </span>
        <span style={styles.insightDate}>{item.insight_date}</span>
      </div>
      <p style={styles.insightText}>{displayText}</p>
      {isLong && (
        <button style={styles.expandBtn} onClick={() => setExpanded(!expanded)}>
          {expanded ? "접기 ▲" : "더 보기 ▼"}
        </button>
      )}
    </div>
  );
}

/* ────────── 스타일 ────────── */
const styles = {
  page: {
    maxWidth: 390,
    margin: "0 auto",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#fff",
  },

  header: { background: "#29ABE2", padding: "16px 20px" },
  headerTitle: { color: "white", fontSize: 20, fontWeight: 700, margin: 0 },
  headerSub: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 4 },

  content: { padding: "20px 20px 100px", flex: 1 },

  generateCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "linear-gradient(135deg, #29ABE2, #1a8cc4)",
    borderRadius: 14,
    padding: "16px 18px",
    marginBottom: 20,
  },
  generateLeft: {},
  generateTitle: {
    color: "white",
    fontWeight: 700,
    fontSize: 15,
    marginBottom: 4,
  },
  generateDesc: { color: "rgba(255,255,255,0.85)", fontSize: 12 },
  generateBtn: {
    background: "white",
    color: "#29ABE2",
    border: "none",
    borderRadius: 20,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  },

  analyzingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "16px 0",
    marginBottom: 8,
  },
  analyzingDots: { display: "flex", gap: 6, marginBottom: 10 },
  dot: {
    width: 8,
    height: 8,
    background: "#29ABE2",
    borderRadius: "50%",
    display: "inline-block",
    animation: "bounce 1.2s infinite",
  },
  analyzingText: { fontSize: 13, color: "#888" },

  sectionTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#222",
    marginBottom: 12,
  },

  insightList: { display: "flex", flexDirection: "column", gap: 12 },
  insightCard: {
    background: "#f8f8f8",
    borderRadius: 14,
    padding: 16,
    borderLeft: "3px solid #29ABE2",
  },
  insightTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  insightTag: {
    fontSize: 11,
    color: "white",
    padding: "3px 10px",
    borderRadius: 20,
    fontWeight: 600,
  },
  insightDate: { fontSize: 12, color: "#aaa" },
  insightText: { fontSize: 14, color: "#333", lineHeight: 1.7 },
  expandBtn: {
    background: "none",
    border: "none",
    fontSize: 12,
    color: "#29ABE2",
    cursor: "pointer",
    marginTop: 6,
    padding: 0,
    fontFamily: "inherit",
  },

  loadingText: {
    textAlign: "center",
    color: "#888",
    fontSize: 14,
    marginTop: 40,
  },
  emptyWrap: { textAlign: "center", paddingTop: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 15, color: "#555", fontWeight: 600, marginBottom: 6 },
  emptySubText: { fontSize: 13, color: "#aaa", lineHeight: 1.6 },
};
