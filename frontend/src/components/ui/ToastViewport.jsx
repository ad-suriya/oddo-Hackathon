import { createPortal } from "react-dom";
import Icon from "./Icon.jsx";
import styles from "./ToastViewport.module.css";

const ICON = { success: "checkCircle", danger: "alertCircle", info: "info" };

export default function ToastViewport({ toasts, onDismiss }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className={styles.viewport} aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <div key={t.id} className={[styles.toast, styles[t.variant] || styles.info].join(" ")} role="status">
          <span className={styles.icon}>
            <Icon name={ICON[t.variant] || "info"} size={16} />
          </span>
          <div className={styles.text}>
            {t.title && <div className={styles.title}>{t.title}</div>}
            {t.description && <div className={styles.description}>{t.description}</div>}
          </div>
          <button type="button" className={styles.close} onClick={() => onDismiss(t.id)} aria-label="Dismiss notification">
            <Icon name="close" size={14} />
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}
