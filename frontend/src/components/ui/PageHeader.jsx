import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";
import styles from "./PageHeader.module.css";

export default function PageHeader({ title, description, actions, backTo, backLabel = "Back" }) {
  return (
    <div>
      {backTo && (
        <Link to={backTo} className={styles.back}>
          <Icon name="arrowLeft" size={15} />
          {backLabel}
        </Link>
      )}
      <div className={styles.header}>
        <div className={styles.text}>
          <h1 className={styles.title}>{title}</h1>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </div>
  );
}
