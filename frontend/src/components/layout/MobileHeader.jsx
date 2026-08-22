import Icon from "../ui/Icon.jsx";
import styles from "./MobileHeader.module.css";

export default function MobileHeader({ onOpenMenu }) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.logoMark}>D</span>
        Dayflow
      </div>
      <button type="button" className={styles.menuButton} onClick={onOpenMenu} aria-label="Open navigation menu">
        <Icon name="menu" size={22} />
      </button>
    </header>
  );
}
