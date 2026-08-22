import styles from "./Tabs.module.css";

export default function Tabs({ tabs, value, onChange }) {
  return (
    <div className={styles.list} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={value === tab.value}
          className={[styles.tab, value === tab.value ? styles.tabActive : ""].filter(Boolean).join(" ")}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
          {typeof tab.count === "number" && <span className={styles.count}>{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}
