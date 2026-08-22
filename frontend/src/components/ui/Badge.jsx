import styles from "./Badge.module.css";

const TONE_CLASS = {
  neutral: styles.neutral,
  success: styles.success,
  warning: styles.warning,
  danger: styles.danger,
  info: styles.info,
  brand: styles.brand,
};

export default function Badge({ tone = "neutral", dot = false, children, className }) {
  return (
    <span className={[styles.badge, TONE_CLASS[tone] || styles.neutral, className].filter(Boolean).join(" ")}>
      {dot && <span className={styles.dot} />}
      {children}
    </span>
  );
}
