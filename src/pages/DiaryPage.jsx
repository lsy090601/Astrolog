import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "./HomePage";

const EMOTIONS = [
  "😊 행복",
  "😌 평온",
  "😤 짜증",
  "😢 슬픔",
  "😰 불안",
  "😴 피곤",
  "🔥 설렘",
  "😐 무감각",
];

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
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
    if (tab !== "history") return undefined;
    async function fetchHistory() {
      setLoadingHistory(true);
      try {
        const res = await fetch("/api/diary/history", {
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
        setRecentDiaries(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingHistory(false);
      }
    }
    fetchHistory();
    return undefined;
  }, [tab, navigate]);

  const handleSave = async () => {
    if (stars === 0) {
      alert("만족도를 선택해주세요.");
      return;
    }
    if (!selectedEmotion) {
      alert("감정을 선택해주세요.");
      return;
    }
    try {
      const res = await fetch("/api/diary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ satisfaction: stars, emotion_text: selectedEmotion, memo }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "저장에 실패했습니다.");
        return;
      }
      setSaved(true);
    } catch (err) {
      console.error(err);
      alert("서버 연결에 실패했습니다.");
    }
  };

  const handleReset = () => {
    setStars(0);
    setSelectedEmotion("");
    setMemo("");
    setSaved(false);
  };

  return (
    <div style={styles.page}>
      {/* 헤더 */}
      <div style={styles.header}>
        <div>
          <p style={styles.headerDate}>{getTodayString()}</p>
          <h1 style={styles.headerTitle}>오늘의 기록</h1>
        </div>
      </div>

      {/* 탭 */}
      <div style={styles.tabRow}>
        <button
          style={{
            ...styles.tabBtn,
            ...(tab === "write" ? styles.tabActive : {}),
          }}
          onClick={() => setTab("write")}
        >
          ✏️ 오늘 기록
        </button>
        <button
          style={{
            ...styles.tabBtn,
            ...(tab === "history" ? styles.tabActive : {}),
          }}
          onClick={() => setTab("history")}
        >
          📋 지난 기록
        </button>
      </div>

      <div style={styles.content}>
        {tab === "write" && (
          <>
            {saved ? (
              <SavedView
                stars={stars}
                emotion={selectedEmotion}
                memo={memo}
                onReset={handleReset}
              />
            ) : (
              <WriteView
                stars={stars}
                setStars={setStars}
                selectedEmotion={selectedEmotion}
                setSelectedEmotion={setSelectedEmotion}
                memo={memo}
                setMemo={setMemo}
                onSave={handleSave}
              />
            )}
          </>
        )}

        {tab === "history" && (
          <HistoryView diaries={recentDiaries} loading={loadingHistory} />
        )}
      </div>

      <BottomNav current="diary" navigate={navigate} />
    </div>
  );
}

/* ────────────────────────────────────────────
   작성 뷰
──────────────────────────────────────────── */
function WriteView({
  stars,
  setStars,
  selectedEmotion,
  setSelectedEmotion,
  memo,
  setMemo,
  onSave,
}) {
  return (
    <>
      {/* 만족도 */}
      <p style={styles.label}>오늘 하루 만족도</p>
      <div style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} style={styles.starBtn} onClick={() => setStars(i)}>
            <span style={{ fontSize: 32, opacity: i <= stars ? 1 : 0.25 }}>
              ⭐
            </span>
          </button>
        ))}
      </div>
      {stars > 0 && (
        <p style={styles.starLabel}>
          {
            [
              "",
              "별로였어요 😞",
              "그저 그랬어요 😐",
              "괜찮았어요 🙂",
              "좋았어요 😊",
              "최고였어요 🔥",
            ][stars]
          }
        </p>
      )}

      {/* 감정 선택 */}
      <p style={{ ...styles.label, marginTop: 20 }}>오늘의 감정</p>
      <div style={styles.emotionGrid}>
        {EMOTIONS.map((e) => (
          <button
            key={e}
            style={{
              ...styles.emotionBtn,
              background: selectedEmotion === e ? "#29ABE2" : "#f5f5f5",
              color: selectedEmotion === e ? "white" : "#333",
              border:
                selectedEmotion === e
                  ? "1.5px solid #29ABE2"
                  : "1px solid #eee",
            }}
            onClick={() => setSelectedEmotion(e)}
          >
            {e}
          </button>
        ))}
      </div>

      {/* 메모 */}
      <p style={{ ...styles.label, marginTop: 20 }}>오늘 하루 한 줄</p>
      <textarea
        style={styles.textarea}
        placeholder="오늘 있었던 일을 간단히 적어보세요..."
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        maxLength={200}
      />
      <p style={styles.charCount}>{memo.length} / 200</p>

      <button style={styles.saveBtn} onClick={onSave}>
        저장하기
      </button>
    </>
  );
}

/* ────────────────────────────────────────────
   저장 완료 뷰
──────────────────────────────────────────── */
function SavedView({ stars, emotion, memo, onReset }) {
  return (
    <div style={styles.savedWrap}>
      <div style={styles.savedIcon}>✅</div>
      <p style={styles.savedTitle}>오늘의 기록이 저장됐어요!</p>
      <div style={styles.savedCard}>
        <div style={styles.savedRow}>
          <span style={styles.savedKey}>만족도</span>
          <span style={styles.savedVal}>{"⭐".repeat(stars)}</span>
        </div>
        <div style={styles.savedRow}>
          <span style={styles.savedKey}>감정</span>
          <span style={styles.savedVal}>{emotion}</span>
        </div>
        {memo && (
          <div style={{ ...styles.savedRow, alignItems: "flex-start" }}>
            <span style={styles.savedKey}>메모</span>
            <span style={{ ...styles.savedVal, flex: 1, lineHeight: 1.6 }}>
              {memo}
            </span>
          </div>
        )}
      </div>
      <button style={styles.resetBtn} onClick={onReset}>
        다시 작성하기
      </button>
    </div>
  );
}

/* ────────────────────────────────────────────
   지난 기록 뷰
──────────────────────────────────────────── */
function HistoryView({ diaries, loading }) {
  if (loading) return <p style={styles.loadingText}>기록 불러오는 중...</p>;
  if (diaries.length === 0)
    return (
      <p style={styles.emptyText}>아직 기록이 없어요. 오늘부터 시작해보세요!</p>
    );

  return (
    <div style={styles.historyList}>
      {diaries.map((d, i) => (
        <div key={i} style={styles.historyCard}>
          <div style={styles.historyTop}>
            <span style={styles.historyDate}>{d.diary_date}</span>
            <span style={styles.historyRank}>운세 {d.horoscope_rank}위</span>
          </div>
          <div style={styles.historyStars}>{"⭐".repeat(d.satisfaction)}</div>
          <p style={styles.historyEmotion}>{d.emotion_text}</p>
          {d.memo && <p style={styles.historyMemo}>"{d.memo}"</p>}
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────
   스타일
──────────────────────────────────────────── */
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
  headerDate: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    marginBottom: 2,
  },
  headerTitle: { color: "white", fontSize: 20, fontWeight: 700, margin: 0 },

  tabRow: { display: "flex", borderBottom: "1px solid #eee" },
  tabBtn: {
    flex: 1,
    padding: "12px 0",
    background: "none",
    border: "none",
    fontSize: 14,
    color: "#aaa",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  tabActive: {
    color: "#29ABE2",
    fontWeight: 700,
    borderBottom: "2px solid #29ABE2",
  },

  content: { padding: "20px 20px 100px", flex: 1 },

  label: { fontSize: 14, fontWeight: 600, color: "#333", marginBottom: 10 },
  starsRow: { display: "flex", gap: 8, marginBottom: 6 },
  starBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  starLabel: { fontSize: 13, color: "#888", marginBottom: 4 },

  emotionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 8,
  },
  emotionBtn: {
    padding: "10px 12px",
    borderRadius: 10,
    fontSize: 13,
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
    transition: "all 0.15s",
  },

  textarea: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #ddd",
    borderRadius: 10,
    fontSize: 14,
    fontFamily: "inherit",
    resize: "none",
    height: 100,
    outline: "none",
    lineHeight: 1.6,
  },
  charCount: { fontSize: 12, color: "#bbb", textAlign: "right", marginTop: 4 },

  saveBtn: {
    width: "100%",
    padding: 13,
    background: "#29ABE2",
    color: "white",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 16,
    fontFamily: "inherit",
  },

  savedWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: 20,
  },
  savedIcon: { fontSize: 48, marginBottom: 12 },
  savedTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#222",
    marginBottom: 20,
  },
  savedCard: {
    width: "100%",
    background: "#f8f8f8",
    borderRadius: 14,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  savedRow: { display: "flex", alignItems: "center", gap: 12 },
  savedKey: { fontSize: 13, color: "#888", minWidth: 44 },
  savedVal: { fontSize: 14, color: "#222", fontWeight: 500 },
  resetBtn: {
    marginTop: 20,
    padding: "10px 24px",
    background: "none",
    border: "1px solid #ddd",
    borderRadius: 10,
    fontSize: 13,
    color: "#888",
    cursor: "pointer",
    fontFamily: "inherit",
  },

  historyList: { display: "flex", flexDirection: "column", gap: 12 },
  historyCard: { background: "#f8f8f8", borderRadius: 14, padding: 16 },
  historyTop: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  historyDate: { fontSize: 13, color: "#888" },
  historyRank: {
    fontSize: 12,
    background: "#29ABE2",
    color: "white",
    padding: "2px 8px",
    borderRadius: 10,
  },
  historyStars: { fontSize: 16, marginBottom: 4 },
  historyEmotion: {
    fontSize: 14,
    fontWeight: 500,
    color: "#333",
    marginBottom: 4,
  },
  historyMemo: {
    fontSize: 13,
    color: "#888",
    fontStyle: "italic",
    lineHeight: 1.6,
  },

  loadingText: {
    textAlign: "center",
    color: "#888",
    fontSize: 14,
    marginTop: 40,
  },
  emptyText: {
    textAlign: "center",
    color: "#aaa",
    fontSize: 14,
    marginTop: 40,
    lineHeight: 1.8,
  },
};
