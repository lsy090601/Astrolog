import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const PERIODS = [
  { label: "7일", value: 7 },
  { label: "14일", value: 14 },
  { label: "30일", value: 30 },
];

export default function ChartPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState(7);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/chart?period=${period}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/");
          return;
        }
        if (!res.ok) return;
        setData(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [period, navigate]);

  const avgSatisfaction = data.length
    ? (data.reduce((s, d) => s + Number(d.satisfaction), 0) / data.length).toFixed(1)
    : null;
  const avgRank = data.length
    ? Math.round(data.reduce((s, d) => s + Number(d.horoscope_rank), 0) / data.length)
    : null;
  const bestDay = data.length
    ? data.reduce((best, d) => (Number(d.satisfaction) > Number(best.satisfaction) ? d : best), data[0])
    : null;

  return (
    <div style={s.root}>
      <Sidebar />
      <main style={s.main}>
        <div style={s.pageHeader}>
          <div>
            <h1 style={s.pageTitle}>통계</h1>
            <p style={s.pageSub}>운세와 감정의 흐름을 확인해요</p>
          </div>
          <div style={s.periodRow}>
            {PERIODS.map((p) => (
              <button
                key={p.value}
                style={{ ...s.periodBtn, ...(period === p.value ? s.periodBtnActive : {}) }}
                onClick={() => setPeriod(p.value)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={s.centerMsg}>
            <div style={s.loadingSpinner} />
          </div>
        ) : data.length === 0 ? (
          <div style={s.emptyWrap}>
            <p style={s.emptyIcon}>📊</p>
            <p style={s.emptyTitle}>아직 데이터가 없어요</p>
            <p style={s.emptyDesc}>일기를 작성하면 통계를 볼 수 있어요!</p>
          </div>
        ) : (
          <>
            {/* 요약 카드 */}
            <div style={s.summaryRow}>
              <SummaryCard
                label="평균 만족도"
                value={`${avgSatisfaction}점`}
                sub={`최근 ${period}일 기준`}
                color="#38bdf8"
                icon="⭐"
              />
              <SummaryCard
                label="평균 운세순위"
                value={`${avgRank}위`}
                sub="12개 별자리 중"
                color="#818cf8"
                icon="✦"
              />
              <SummaryCard
                label="최고의 날"
                value={bestDay ? bestDay.diary_date : "—"}
                sub={bestDay ? `만족도 ${bestDay.satisfaction}점` : ""}
                color="#fb923c"
                icon="🏆"
              />
            </div>

            {/* 차트 영역 */}
            <div style={s.chartsGrid}>
              <div style={s.chartCard}>
                <p style={s.chartTitle}>하루 만족도</p>
                <BarChart
                  data={data.map((d) => ({ label: d.diary_date, value: Number(d.satisfaction), max: 5, display: `${d.satisfaction}점` }))}
                  color="#38bdf8"
                />
              </div>
              <div style={s.chartCard}>
                <p style={s.chartTitle}>운세 순위 <span style={s.chartHint}>(낮을수록 좋음)</span></p>
                <BarChart
                  data={data.map((d) => ({ label: d.diary_date, value: 13 - Number(d.horoscope_rank), max: 12, display: `${d.horoscope_rank}위` }))}
                  color="#818cf8"
                />
              </div>
            </div>

            <div style={s.chartCard}>
              <p style={s.chartTitle}>운세 순위 vs 만족도 <span style={s.chartHint}>— 왼쪽 위일수록 운세도 좋고 만족도도 높아요</span></p>
              <CorrelationChart data={data} />
            </div>
          </>
        )}
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function SummaryCard({ label, value, sub, color, icon }) {
  return (
    <div style={s.summaryCard}>
      <div style={{ ...s.summaryIcon, background: `${color}18`, color }}>{icon}</div>
      <p style={s.summaryLabel}>{label}</p>
      <p style={{ ...s.summaryValue, color }}>{value}</p>
      {sub && <p style={s.summarySub}>{sub}</p>}
    </div>
  );
}

function BarChart({ data, color }) {
  return (
    <div style={s.barChart}>
      {data.map((d, i) => (
        <div key={i} style={s.barRow}>
          <span style={s.barLabel}>{d.label}</span>
          <div style={s.barBg}>
            <div
              style={{
                ...s.barFill,
                width: `${Math.round((d.value / d.max) * 100)}%`,
                background: color,
              }}
            />
          </div>
          <span style={s.barVal}>{d.display}</span>
        </div>
      ))}
    </div>
  );
}

function CorrelationChart({ data }) {
  const W = 600, H = 260, PAD = 48;
  const points = data.map((d) => ({
    x: PAD + ((Number(d.horoscope_rank) - 1) / 11) * (W - PAD * 2),
    y: PAD + ((5 - Number(d.satisfaction)) / 4) * (H - PAD * 2),
    rank: d.horoscope_rank,
    sat: d.satisfaction,
    date: d.diary_date,
  }));

  const gridX = [1, 4, 7, 10, 12];
  const gridY = [1, 2, 3, 4, 5];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible", marginTop: 12 }}>
      {/* Grid lines */}
      {gridX.map((rank) => {
        const x = PAD + ((rank - 1) / 11) * (W - PAD * 2);
        return <line key={rank} x1={x} y1={PAD} x2={x} y2={H - PAD} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
      })}
      {gridY.map((sat) => {
        const y = PAD + ((5 - sat) / 4) * (H - PAD * 2);
        return <line key={sat} x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
      })}

      {/* Axes */}
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

      {/* Axis labels */}
      <text x={W / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="#334155">운세 순위 →</text>
      {gridX.map((rank) => {
        const x = PAD + ((rank - 1) / 11) * (W - PAD * 2);
        return <text key={rank} x={x} y={H - PAD + 14} textAnchor="middle" fontSize="9" fill="#334155">{rank}위</text>;
      })}
      {gridY.map((sat) => {
        const y = PAD + ((5 - sat) / 4) * (H - PAD * 2);
        return <text key={sat} x={PAD - 8} y={y + 3} textAnchor="end" fontSize="9" fill="#334155">{sat}</text>;
      })}
      <text x={12} y={H / 2} textAnchor="middle" fontSize="11" fill="#334155" transform={`rotate(-90, 12, ${H / 2})`}>만족도 ↑</text>

      {/* Points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={8} fill="#38bdf8" fillOpacity={0.15} />
          <circle cx={p.x} cy={p.y} r={5} fill="#38bdf8" fillOpacity={0.85} />
          <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="9" fill="#475569">{p.date}</text>
        </g>
      ))}
    </svg>
  );
}

const s = {
  root: { display: "flex", minHeight: "100vh", background: "#070d1a" },
  main: { marginLeft: 240, flex: 1, padding: "44px 48px" },

  pageHeader: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36 },
  pageTitle: { fontSize: 28, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 },
  pageSub: { fontSize: 14, color: "#334155" },
  periodRow: { display: "flex", gap: 8 },
  periodBtn: {
    padding: "8px 20px", borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.07)", background: "none",
    color: "#475569", fontSize: 14, cursor: "pointer", fontWeight: 500,
  },
  periodBtnActive: {
    background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.3)",
    color: "#38bdf8", fontWeight: 700,
  },

  centerMsg: { display: "flex", justifyContent: "center", paddingTop: 100 },
  loadingSpinner: { width: 36, height: 36, border: "3px solid rgba(255,255,255,0.08)", borderTop: "3px solid #38bdf8", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  emptyWrap: { textAlign: "center", paddingTop: 100 },
  emptyIcon: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 17, color: "#94a3b8", fontWeight: 600, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: "#334155" },

  summaryRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 },
  summaryCard: {
    background: "#0f1928", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16, padding: "24px 28px",
  },
  summaryIcon: { width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 14 },
  summaryLabel: { fontSize: 12, color: "#475569", fontWeight: 600, letterSpacing: 0.5, marginBottom: 8 },
  summaryValue: { fontSize: 32, fontWeight: 800, marginBottom: 4 },
  summarySub: { fontSize: 12, color: "#334155" },

  chartsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 },
  chartCard: {
    background: "#0f1928", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16, padding: "24px 28px", marginBottom: 0,
  },
  chartTitle: { fontSize: 14, fontWeight: 700, color: "#94a3b8", marginBottom: 20 },
  chartHint: { fontSize: 12, color: "#334155", fontWeight: 400 },

  barChart: { display: "flex", flexDirection: "column", gap: 10 },
  barRow: { display: "flex", alignItems: "center", gap: 10 },
  barLabel: { fontSize: 11, color: "#334155", minWidth: 42, textAlign: "right" },
  barBg: { flex: 1, height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 4, transition: "width 0.6s ease" },
  barVal: { fontSize: 12, color: "#475569", minWidth: 32, textAlign: "right" },
};
