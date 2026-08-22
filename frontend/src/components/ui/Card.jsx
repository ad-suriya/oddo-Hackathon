import styles from "./Card.module.css";

export default function Card({ className, children, ...rest }) {
  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, actions }) {
  return (
    <div className={styles.header}>
      <div className={styles.headerText}>
        {title && <h3 className={styles.title}>{title}</h3>}
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}

export function CardBody({ tight = false, className, children }) {
  return <div className={[tight ? styles.bodyTight : styles.body, className].filter(Boolean).join(" ")}>{children}</div>;
}

export function CardFooter({ children }) {
  return <div className={styles.footer}>{children}</div>;
}
