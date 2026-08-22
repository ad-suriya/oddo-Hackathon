import Icon from "./Icon.jsx";
import styles from "./EmptyState.module.css";

export default function EmptyState({ icon = "documents", title, description, action }) {
  return (
    <div className={styles.wrap}>
      <span className={styles.icon}>
        <Icon name={icon} size={22} />
      </span>
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div style={{ marginTop: "var(--space-2)" }}>{action}</div>}
    </div>
  );
}
