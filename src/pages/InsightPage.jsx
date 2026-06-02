import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

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
        setInsights(await res.json());
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
      if (!res.ok) { alert(data.message || "인사이트 생성에 실패했습니다."); return; }
      setInsights((prev) => [data, ...prev]);
    } catch {
      alert("서버 연결에 실패했습니다.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={s.root}>
      <Sidebar />
      <main style={s.main}>
        <div style={s.pageHeader}>
          <div>
            <h1 style={s.pageTitle}>AI 인사이트</h1>
            <p style={s.pageSub}>나의 운세와 감정 패턴을 AI가 분석해드려요</p>
          </div>
        </div>

        {/* 생성 카드 */}
        <div style={s.generateCard}>
          <div style={s.generateLeft}>
            <div style={s.generateIconWrap}>✨</div>
            <div>
              <p style={s.generateTitle}>새 인사이트 생성</p>
              <p style={s.generateDesc}>최근 7일간의 운세 순위와 감정 기록을 AI가 분석해서 패턴을 찾아드려요.</p>
            </div>
          </div>
          <button
            style={{ ...s.generateBtn, opacity: generating ? 0.6 : 1 }}
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <span style={s.generatingInner}>
                <DotsLoader />
                분석 중...
              </span>
            ) : "분석하기 →"}
          </button>
        </div>

        {/* 인사이트 목록 */}
        <div style={s.sectionHeader}>
          <p style={s.sectionTitle}>지난 인사이트</p>
          <span style={s.sectionCount}>{insights.length}개</span>
        </div>

        {loading ? (
          <div style={s.centerMsg}><div style={s.loadingSpinner} /></div>
        ) : insights.length === 0 ? (
          <div style={s.emptyWrap}>
            <p style={s.emptyIcon}>🔍</p>
            <p style={s.emptyTitle}>아직 인사이트가 없어요</p>
            <p style={s.emptyDesc}>7일 이상 일기를 기록한 후 분석을 요청해보세요!</p>
          </div>
        ) : (
          <div style={s.insightGrid}>
            {insights.map((item) => (
              <InsightCard key={item.insight_id} item={item} />
            ))}
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce { 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-5px); } }
      `}</style>
    </div>
  );
}

function DotsLoader() {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
      {[0, 0.2, 0.4].map((delay, i) => (
        <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "white", display: "inline-block", animation: `bounce 1.2s ${delay}s infinite` }} />
      ))}
    </span>
  );
}

function InsightCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = item.content.length > 120;
  const displayText = !expanded && isLong ? item.content.slice(0, 120) + "..." : item.content;

  return (
    <div style={s.insightCard}>
      <div style={s.insightTop}>
        <span style={{ ...s.insightTag, background: `${item.tag_color}22`, color: item.tag_color, border: `1px solid ${item.tag_color}44` }}>
          {item.tag}
        </span>
        <span style={s.insightDate}>{item.insight_date}</span>
      </div>
      <p style={s.insightText}>{displayText}</p>
      {isLong && (
        <button style={s.expandBtn} onClick={() => setExpanded(!expanded)}>
          {expanded ? "접기 ▲" : "더 보기 ▼"}
        </button>
      )}
    </div>
  );
}

const s = {
  root: { display: "flex", minHeight: "100vh", background: "#070d1a" },
  main: { marginLeft: 240, flex: 1, padding: "44px 48px" },

  pageHeader: { marginBottom: 32 },
  pageTitle: { fontSize: 28, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 },
  pageSub: { fontSize: 14, color: "#334155" },

  generateCard: {
    background: "linear-gradient(135deg, #0c1e35, #111030)",
    border: "1px solid rgba(129,140,248,0.2)",
    borderRadius: 18,
    padding: "28px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 24,
    marginBottom: 36,
  },
  generateLeft: { display: "flex", alignItems: "center", gap: 20 },
  generateIconWrap: {
    width: 52, height: 52, borderRadius: 14,
    background: "rgba(129,140,248,0.15)", border: "1px solid rgba(129,140,248,0.3)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 24, flexShrink: 0,
  },
  generateTitle: { fontSize: 17, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 },
  generateDesc: { fontSize: 13, color: "#475569", lineHeight: 1.6, maxWidth: 480 },
  generateBtn: {
    padding: "12px 28px",
    background: "linear-gradient(135deg, #6366f1, #818cf8)",
    color: "white", border: "none", borderRadius: 12,
    fontSize: 14, fontWeight: 700, cursor: "pointer",
    whiteSpace: "nowrap", letterSpacing: 0.3, flexShrink: 0,
  },
  generatingInner: { display: "flex", alignItems: "center", gap: 8 },

  sectionHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 18 },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: "#475569", letterSpacing: 0.5 },
  sectionCount: {
    fontSize: 11, background: "rgba(255,255,255,0.06)", color: "#475569",
    padding: "2px 10px", borderRadius: 20, fontWeight: 600,
  },

  centerMsg: { display: "flex", justifyContent: "center", paddingTop: 80 },
  loadingSpinner: { width: 32, height: 32, border: "3px solid rgba(255,255,255,0.08)", borderTop: "3px solid #818cf8", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  emptyWrap: { textAlign: "center", paddingTop: 80 },
  emptyIcon: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 17, color: "#94a3b8", fontWeight: 600, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: "#334155" },

  insightGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 16 },
  insightCard: {
    background: "#0f1928", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16, padding: "22px 24px",
    borderLeft: "3px solid rgba(129,140,248,0.4)",
  },
  insightTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  insightTag: { fontSize: 11, padding: "4px 12px", borderRadius: 20, fontWeight: 700, letterSpacing: 0.3 },
  insightDate: { fontSize: 12, color: "#334155" },
  insightText: { fontSize: 14, color: "#94a3b8", lineHeight: 1.8 },
  expandBtn: {
    background: "none", border: "none", fontSize: 12, color: "#818cf8",
    cursor: "pointer", marginTop: 10, padding: 0, fontWeight: 600,
  },
};
