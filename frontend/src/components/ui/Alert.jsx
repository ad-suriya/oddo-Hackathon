import Icon from "./Icon.jsx";
import styles from "./Alert.module.css";

const TONE = {
  info: { className: "info", icon: "info" },
  success: { className: "success", icon: "checkCircle" },
  warning: { className: "warning", icon: "alertTriangle" },
  danger: { className: "danger", icon: "alertCircle" },
};

export default function Alert({ variant = "info", title, children, className }) {
  const tone = TONE[variant] || TONE.info;
  return (
    <div role={variant === "danger" ? "alert" : "status"} className={[styles.alert, styles[tone.className], className].filter(Boolean).join(" ")}>
      <span className={styles.icon}>
        <Icon name={tone.icon} size={17} />
      </span>
      <div className={styles.text}>
        {title && <span className={styles.title}>{title}</span>}
        {children && <span>{children}</span>}
      </div>
    </div>
  );
}
