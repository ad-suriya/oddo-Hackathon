import Spinner from "./Spinner.jsx";

export default function FullPageSpinner() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-tertiary)" }}>
      <Spinner size={28} />
    </div>
  );
}
