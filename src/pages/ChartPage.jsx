import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "./HomePage";

const PERIODS = ["7일", "14일", "30일"];

export default function ChartPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("7일");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const periodNum = period.replace("일", "");
        const res = await fetch(`/api/chart?period=${periodNum}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/");
          return;
        }
        if (!res.ok) return;
        const json = await res.json();
        setData(json);
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
    : 0;
  const avgRank = data.length
    ? Math.round(data.reduce((s, d) => s + Number(d.horoscope_rank), 0) / data.length)
    : 0;
  const bestDay = data.length
    ? data.reduce(
        (best, d) => (Number(d.satisfaction) > Number(best.satisfaction) ? d : best),
        data[0],
      )
    : null;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>통계</h1>
        <p style={styles.headerSub}>운세와 감정의 흐름을 확인해요</p>
      </div>

      {/* 기간 선택 */}
      <div style={styles.periodRow}>
        {PERIODS.map((p) => (
          <button
            key={p}
            style={{
              ...styles.periodBtn,
              ...(period === p ? styles.periodActive : {}),
            }}
            onClick={() => setPeriod(p)}
          >
            {p}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {loading ? (
          <p style={styles.loadingText}>데이터 불러오는 중...</p>
        ) : data.length === 0 ? (
          <div style={styles.emptyWrap}>
            <p style={styles.emptyIcon}>📊</p>
            <p style={styles.emptyText}>아직 데이터가 없어요.</p>
            <p style={styles.emptySubText}>일기를 작성하면 통계를 볼 수 있어요!</p>
          </div>
        ) : (
          <>
            {/* 요약 카드 3개 */}
            <div style={styles.summaryRow}>
              <SummaryCard
                label="평균 만족도"
                value={`${avgSatisfaction}점`}
                color="#29ABE2"
              />
              <SummaryCard
                label="평균 운세순위"
                value={`${avgRank}위`}
                color="#FF6B35"
              />
              <SummaryCard
                label="최고의 날"
                value={bestDay ? bestDay.diary_date : "-"}
                color="#9B59B6"
              />
            </div>

            {/* 만족도 그래프 */}
            <Section title="하루 만족도">
              <BarChart
                data={data.map((d) => ({
                  label: d.diary_date,
                  value: Number(d.satisfaction),
                  max: 5,
                }))}
                color="#29ABE2"
                unit="점"
              />
            </Section>

            {/* 운세 순위 그래프 */}
            <Section title="운세 순위 (낮을수록 좋음)">
              <BarChart
                data={data.map((d) => ({
                  label: d.diary_date,
                  value: 13 - Number(d.horoscope_rank),
                  max: 12,
                  display: `${d.horoscope_rank}위`,
                }))}
                color="#FF6B35"
                unit=""
              />
            </Section>

            {/* 상관관계 */}
            <Section title="운세 순위 vs 만족도">
              <CorrelationChart data={data} />
            </Section>
          </>
        )}
      </div>

      <BottomNav current="chart" navigate={navigate} />
    </div>
  );
}

/* ────────── 요약 카드 ────────── */
function SummaryCard({ label, value, color }) {
  return (
    <div style={styles.summaryCard}>
      <p style={styles.summaryLabel}>{label}</p>
      <p style={{ ...styles.summaryValue, color }}>{value}</p>
    </div>
  );
}

/* ────────── 섹션 래퍼 ────────── */
function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <p style={styles.sectionTitle}>{title}</p>
      {children}
    </div>
  );
}

/* ────────── 바 차트 ────────── */
function BarChart({ data, color, unit }) {
  return (
    <div style={styles.barChart}>
      {data.map((d, i) => (
        <div key={i} style={styles.barRow}>
          <span style={styles.barLabel}>{d.label}</span>
          <div style={styles.barBg}>
            <div
              style={{
                ...styles.barFill,
                width: `${Math.round((d.value / d.max) * 100)}%`,
                background: color,
              }}
            />
          </div>
          <span style={styles.barVal}>{d.display ?? `${d.value}${unit}`}</span>
        </div>
      ))}
    </div>
  );
}

/* ────────── 상관관계 산점도 ────────── */
function CorrelationChart({ data }) {
  const W = 300,
    H = 180,
    PAD = 30;

  const points = data.map((d) => ({
    x: PAD + ((Number(d.horoscope_rank) - 1) / 11) * (W - PAD * 2),
    y: PAD + ((5 - Number(d.satisfaction)) / 4) * (H - PAD * 2),
    rank: d.horoscope_rank,
    sat: d.satisfaction,
    date: d.diary_date,
  }));

  return (
    <div>
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        style={{ overflow: "visible" }}
      >
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#ddd" strokeWidth="1" />
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#ddd" strokeWidth="1" />
        <text x={W / 2} y={H - 6} textAnchor="middle" fontSize="10" fill="#aaa">
          운세 순위 →
        </text>
        <text x={PAD - 4} y={PAD + 4} textAnchor="end" fontSize="9" fill="#aaa">
          높음
        </text>
        <text x={PAD - 4} y={H - PAD + 4} textAnchor="end" fontSize="9" fill="#aaa">
          낮음
        </text>
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={6} fill="#29ABE2" fillOpacity={0.75} />
            <text x={p.x} y={p.y - 9} textAnchor="middle" fontSize="9" fill="#888">
              {p.date}
            </text>
          </g>
        ))}
      </svg>
      <p style={styles.correlationHint}>
        왼쪽 위일수록 운세 순위가 좋고 만족도도 높아요
      </p>
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

  periodRow: {
    display: "flex",
    gap: 8,
    padding: "14px 20px",
    borderBottom: "1px solid #eee",
  },
  periodBtn: {
    padding: "6px 16px",
    borderRadius: 20,
    border: "1px solid #ddd",
    background: "none",
    fontSize: 13,
    color: "#888",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  periodActive: {
    background: "#29ABE2",
    color: "white",
    border: "1px solid #29ABE2",
    fontWeight: 600,
  },

  content: { padding: "20px 20px 100px", flex: 1 },
  loadingText: {
    textAlign: "center",
    color: "#888",
    fontSize: 14,
    marginTop: 40,
  },

  emptyWrap: { textAlign: "center", paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: "#555", fontWeight: 600, marginBottom: 6 },
  emptySubText: { fontSize: 13, color: "#aaa" },

  summaryRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
    marginBottom: 24,
  },
  summaryCard: {
    background: "#f8f8f8",
    borderRadius: 12,
    padding: "12px 8px",
    textAlign: "center",
  },
  summaryLabel: { fontSize: 11, color: "#aaa", marginBottom: 4 },
  summaryValue: { fontSize: 18, fontWeight: 700 },

  section: { marginBottom: 28 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#333",
    marginBottom: 12,
  },

  barChart: { display: "flex", flexDirection: "column", gap: 8 },
  barRow: { display: "flex", alignItems: "center", gap: 8 },
  barLabel: { fontSize: 11, color: "#aaa", minWidth: 38 },
  barBg: {
    flex: 1,
    height: 10,
    background: "#f0f0f0",
    borderRadius: 5,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 5, transition: "width 0.5s ease" },
  barVal: { fontSize: 12, color: "#666", minWidth: 28, textAlign: "right" },

  correlationHint: {
    fontSize: 12,
    color: "#aaa",
    textAlign: "center",
    marginTop: 6,
  },
};
