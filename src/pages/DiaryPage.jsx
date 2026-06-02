import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const EMOTIONS = [
  { label: "행복", emoji: "😊" },
  { label: "평온", emoji: "😌" },
  { label: "짜증", emoji: "😤" },
  { label: "슬픔", emoji: "😢" },
  { label: "불안", emoji: "😰" },
  { label: "피곤", emoji: "😴" },
  { label: "설렘", emoji: "🔥" },
  { label: "무감각", emoji: "😐" },
];

const STAR_LABELS = ["", "별로였어요", "그저 그랬어요", "괜찮았어요", "좋았어요", "최고였어요"];

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function DiaryPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("write");
  const [stars, setStars] = useState(0);
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [memo, setMemo] = useState("");
  const [saved, setSaved] = useState(false);
  const [recentDiaries, setRecentDiaries] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (tab !== "history") return;
    async function fetchHistory() {
      setLoadingHistory(true);
      try {
        const res = await fetch("/api/diary/history", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.status === 401) { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/"); return; }
        if (!res.ok) return;
        setRecentDiaries(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingHistory(false);
      }
    }
    fetchHistory();
  }, [tab, navigate]);

  const handleSave = async () => {
    if (stars === 0) { alert("만족도를 선택해주세요."); return; }
    if (!selectedEmotion) { alert("감정을 선택해주세요."); return; }
    try {
      const res = await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ satisfaction: stars, emotion_text: selectedEmotion, memo }),
      });
      if (!res.ok) { const d = await res.json(); alert(d.message || "저장 실패"); return; }
      setSaved(true);
    } catch { alert("서버 연결에 실패했습니다."); }
  };

  const handleReset = () => { setStars(0); setSelectedEmotion(""); setMemo(""); setSaved(false); };

  return (
    <div style={s.root}>
      <Sidebar />
      <main style={s.main}>
        <div style={s.pageHeader}>
          <div>
            <p style={s.dateText}>{getTodayString()}</p>
            <h1 style={s.pageTitle}>감정 일기</h1>
          </div>
          <div style={s.tabs}>
            {[{ key: "write", label: "✎ 오늘 기록" }, { key: "history", label: "📋 지난 기록" }].map(({ key, label }) => (
              <button key={key} style={{ ...s.tab, ...(tab === key ? s.tabActive : {}) }} onClick={() => setTab(key)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {tab === "write" && (
          saved
            ? <SavedView stars={stars} emotion={selectedEmotion} memo={memo} onReset={handleReset} navigate={navigate} />
            : <WriteView stars={stars} setStars={setStars} selectedEmotion={selectedEmotion} setSelectedEmotion={setSelectedEmotion} memo={memo} setMemo={setMemo} onSave={handleSave} />
        )}

        {tab === "history" && (
          <HistoryView diaries={recentDiaries} loading={loadingHistory} />
        )}
      </main>
    </div>
  );
}

function WriteView({ stars, setStars, selectedEmotion, setSelectedEmotion, memo, setMemo, onSave }) {
  return (
    <div style={s.writeGrid}>
      <div style={s.writeLeft}>
        {/* 만족도 */}
        <div style={s.section}>
          <p style={s.sectionTitle}>오늘 하루 만족도</p>
          <div style={s.starsRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} style={s.starBtn} onClick={() => setStars(i)}>
                <span style={{ fontSize: 40, opacity: i <= stars ? 1 : 0.15, transition: "opacity 0.15s" }}>★</span>
              </button>
            ))}
          </div>
          {stars > 0 && <p style={s.starLabel}>{STAR_LABELS[stars]}</p>}
        </div>

        {/* 감정 */}
        <div style={s.section}>
          <p style={s.sectionTitle}>오늘의 감정</p>
          <div style={s.emotionGrid}>
            {EMOTIONS.map(({ label, emoji }) => {
              const val = `${emoji} ${label}`;
              const active = selectedEmotion === val;
              return (
                <button
                  key={label}
                  style={{ ...s.emotionBtn, ...(active ? s.emotionBtnActive : {}) }}
                  onClick={() => setSelectedEmotion(val)}
                >
                  <span style={{ fontSize: 24 }}>{emoji}</span>
                  <span style={{ fontSize: 13, fontWeight: active ? 600 : 400 }}>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={s.writeRight}>
        <div style={s.section}>
          <p style={s.sectionTitle}>오늘 하루 한 줄</p>
          <textarea
            style={s.textarea}
            placeholder="오늘 있었던 일을 자유롭게 적어보세요..."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            maxLength={200}
          />
          <p style={s.charCount}>{memo.length} / 200</p>
        </div>

        <div style={s.previewCard}>
          <p style={s.previewTitle}>기록 미리보기</p>
          <div style={s.previewRow}>
            <span style={s.previewKey}>만족도</span>
            <span style={s.previewVal}>
              {stars > 0 ? "★".repeat(stars) + "☆".repeat(5 - stars) : "—"}
            </span>
          </div>
          <div style={s.previewRow}>
            <span style={s.previewKey}>감정</span>
            <span style={s.previewVal}>{selectedEmotion || "—"}</span>
          </div>
          {memo && (
            <div style={{ ...s.previewRow, alignItems: "flex-start" }}>
              <span style={s.previewKey}>메모</span>
              <span style={{ ...s.previewVal, flex: 1, lineHeight: 1.6 }}>{memo}</span>
            </div>
          )}
        </div>

        <button style={s.saveBtn} onClick={onSave}>저장하기</button>
      </div>
    </div>
  );
}

function SavedView({ stars, emotion, memo, onReset, navigate }) {
  return (
    <div style={s.savedWrap}>
      <div style={s.savedCard}>
        <div style={s.savedIconWrap}>✦</div>
        <h2 style={s.savedTitle}>오늘의 기록이 저장됐어요!</h2>
        <div style={s.savedDetails}>
          <div style={s.savedRow}>
            <span style={s.savedKey}>만족도</span>
            <span style={s.savedVal}>{"★".repeat(stars)}{"☆".repeat(5 - stars)}</span>
          </div>
          <div style={s.savedRow}>
            <span style={s.savedKey}>감정</span>
            <span style={s.savedVal}>{emotion}</span>
          </div>
          {memo && (
            <div style={{ ...s.savedRow, alignItems: "flex-start" }}>
              <span style={s.savedKey}>메모</span>
              <span style={{ ...s.savedVal, flex: 1, lineHeight: 1.7 }}>{memo}</span>
            </div>
          )}
        </div>
        <div style={s.savedActions}>
          <button style={s.savedResetBtn} onClick={onReset}>다시 작성하기</button>
          <button style={s.savedChartBtn} onClick={() => navigate("/chart")}>통계 보기 →</button>
        </div>
      </div>
    </div>
  );
}

function HistoryView({ diaries, loading }) {
  if (loading) return <div style={s.centerMsg}><div style={s.loadingSpinner} /></div>;
  if (diaries.length === 0) return (
    <div style={s.emptyWrap}>
      <p style={s.emptyIcon}>📋</p>
      <p style={s.emptyTitle}>아직 기록이 없어요</p>
      <p style={s.emptyDesc}>오늘부터 감정 일기를 시작해보세요!</p>
    </div>
  );
  return (
    <div style={s.historyGrid}>
      {diaries.map((d, i) => (
        <div key={i} style={s.historyCard}>
          <div style={s.historyTop}>
            <span style={s.historyDate}>{d.diary_date}</span>
            <span style={s.historyRankBadge}>운세 {d.horoscope_rank}위</span>
          </div>
          <div style={s.historyStars}>{"★".repeat(d.satisfaction)}{"☆".repeat(5 - d.satisfaction)}</div>
          <p style={s.historyEmotion}>{d.emotion_text}</p>
          {d.memo && <p style={s.historyMemo}>"{d.memo}"</p>}
        </div>
      ))}
    </div>
  );
}

const s = {
  root: { display: "flex", minHeight: "100vh", background: "#070d1a" },
  main: { marginLeft: 240, flex: 1, padding: "44px 48px" },

  pageHeader: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36 },
  dateText: { fontSize: 13, color: "#334155", marginBottom: 6 },
  pageTitle: { fontSize: 28, fontWeight: 700, color: "#f1f5f9" },
  tabs: { display: "flex", gap: 8 },
  tab: {
    padding: "9px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)",
    background: "none", color: "#475569", fontSize: 14, fontWeight: 500, cursor: "pointer",
  },
  tabActive: {
    background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.3)",
    color: "#38bdf8", fontWeight: 700,
  },

  writeGrid: { display: "grid", gridTemplateColumns: "1fr 380px", gap: 28, alignItems: "start" },
  writeLeft: { display: "flex", flexDirection: "column", gap: 24 },
  writeRight: { display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: 24 },

  section: {
    background: "#0f1928", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16, padding: "24px 28px",
  },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: "#94a3b8", marginBottom: 20, letterSpacing: 0.3 },

  starsRow: { display: "flex", gap: 8, marginBottom: 12 },
  starBtn: { background: "none", border: "none", cursor: "pointer", padding: 0, color: "#f59e0b" },
  starLabel: { fontSize: 14, color: "#64748b", fontWeight: 500 },

  emotionGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 },
  emotionBtn: {
    padding: "14px 8px", borderRadius: 12, cursor: "pointer",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
    background: "#101929", border: "1px solid rgba(255,255,255,0.07)",
    color: "#64748b", transition: "all 0.15s",
  },
  emotionBtnActive: {
    background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.35)", color: "#38bdf8",
  },

  textarea: {
    width: "100%", padding: "16px", background: "#101929",
    border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12,
    fontSize: 14, color: "#f1f5f9", outline: "none", resize: "none",
    height: 140, lineHeight: 1.7,
  },
  charCount: { fontSize: 12, color: "#334155", textAlign: "right", marginTop: 6 },

  previewCard: {
    background: "#0f1928", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 14, padding: "20px 24px",
  },
  previewTitle: { fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 14, letterSpacing: 0.5 },
  previewRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 10 },
  previewKey: { fontSize: 12, color: "#475569", minWidth: 40 },
  previewVal: { fontSize: 14, color: "#94a3b8", fontWeight: 500 },

  saveBtn: {
    width: "100%", padding: "14px",
    background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
    color: "white", border: "none", borderRadius: 12,
    fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: 0.3,
  },

  savedWrap: { display: "flex", justifyContent: "center", paddingTop: 40 },
  savedCard: {
    background: "#0f1928", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 20, padding: "48px", maxWidth: 500, width: "100%", textAlign: "center",
  },
  savedIconWrap: {
    fontSize: 40, color: "#38bdf8", marginBottom: 20,
    background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)",
    width: 72, height: 72, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px",
  },
  savedTitle: { fontSize: 20, color: "#f1f5f9", fontWeight: 700, marginBottom: 28 },
  savedDetails: {
    background: "#101929", borderRadius: 12, padding: "20px 24px",
    display: "flex", flexDirection: "column", gap: 14, textAlign: "left", marginBottom: 28,
  },
  savedRow: { display: "flex", alignItems: "center", gap: 12 },
  savedKey: { fontSize: 13, color: "#475569", minWidth: 44 },
  savedVal: { fontSize: 14, color: "#94a3b8", fontWeight: 500 },
  savedActions: { display: "flex", gap: 12 },
  savedResetBtn: {
    flex: 1, padding: "11px", background: "none",
    border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10,
    color: "#475569", fontSize: 14, cursor: "pointer",
  },
  savedChartBtn: {
    flex: 1, padding: "11px",
    background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.25)",
    borderRadius: 10, color: "#38bdf8", fontSize: 14, fontWeight: 600, cursor: "pointer",
  },

  historyGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 },
  historyCard: {
    background: "#0f1928", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 14, padding: "20px 22px",
  },
  historyTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  historyDate: { fontSize: 13, color: "#475569" },
  historyRankBadge: {
    fontSize: 11, background: "rgba(56,189,248,0.1)",
    border: "1px solid rgba(56,189,248,0.2)", color: "#38bdf8",
    padding: "3px 10px", borderRadius: 20, fontWeight: 600,
  },
  historyStars: { fontSize: 16, color: "#f59e0b", marginBottom: 8 },
  historyEmotion: { fontSize: 14, fontWeight: 600, color: "#94a3b8", marginBottom: 6 },
  historyMemo: { fontSize: 13, color: "#475569", fontStyle: "italic", lineHeight: 1.6 },

  centerMsg: { display: "flex", justifyContent: "center", alignItems: "center", paddingTop: 80 },
  loadingSpinner: { width: 32, height: 32, border: "3px solid rgba(255,255,255,0.08)", borderTop: "3px solid #38bdf8", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  emptyWrap: { textAlign: "center", paddingTop: 100 },
  emptyIcon: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 17, color: "#94a3b8", fontWeight: 600, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: "#334155" },
};
