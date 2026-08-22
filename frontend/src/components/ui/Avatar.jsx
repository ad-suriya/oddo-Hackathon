import { getInitials } from "../../utils/formatters.js";
import styles from "./Avatar.module.css";

const SIZE_CLASS = { xs: styles.xs, sm: styles.sm, md: styles.md, lg: styles.lg, xl: styles.xl };

export default function Avatar({ name, src, size = "md", className }) {
  return (
    <span className={[styles.avatar, SIZE_CLASS[size] || styles.md, className].filter(Boolean).join(" ")}>
      {src ? <img className={styles.image} src={src} alt="" /> : getInitials(name)}
    </span>
  );
}
