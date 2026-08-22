import Icon from "../ui/Icon.jsx";
import AuthAbstractVisual from "./AuthAbstractVisual.jsx";
import styles from "./SplitAuthLayout.module.css";

/** Dark split-screen shell shared by the Employee and HR/Admin sign-in
 * pages — same visual system, different left-panel content per portal. */
export default function SplitAuthLayout({ badge, title, subtitle, children, footer }) {
  return (
    <div className={styles.shell}>
      <div className={styles.left}>
        <div className={styles.leftInner}>
          <div className={styles.brand}>
            <span className={styles.logoMark}>D</span>
            <span className={styles.brandName}>Dayflow</span>
          </div>

          {badge && (
            <div className={styles.badge}>
              <Icon name={badge.icon} size={13} />
              {badge.label}
            </div>
          )}

          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}

          {children}

          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
      </div>

      <div className={styles.right} aria-hidden="true">
        <AuthAbstractVisual className={styles.visual} />
      </div>
    </div>
  );
}
