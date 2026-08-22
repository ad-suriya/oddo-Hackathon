import LogoMark from "../ui/LogoMark.jsx";
import styles from "./AuthLayout.module.css";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <LogoMark size={34} />
          <span className={styles.brandName}>Dayflow</span>
        </div>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {children}
        {footer && <div className={styles.footerLink}>{footer}</div>}
      </div>
    </div>
  );
}
