export default function ComingSoonPage() {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>준비 중인 기능이에요</h1>
        <p style={styles.text}>
          이 페이지는 아직 서비스 준비 중입니다. 곧 새로운 기능으로 찾아올게요!
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: 390,
    margin: "0 auto",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    background: "#f8fbff",
  },
  card: {
    width: "100%",
    background: "white",
    borderRadius: 22,
    padding: 28,
    boxShadow: "0 16px 40px rgba(0, 0, 0, 0.08)",
    textAlign: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#29ABE2",
    marginBottom: 12,
  },
  text: {
    fontSize: 15,
    color: "#555",
    lineHeight: 1.7,
  },
};
