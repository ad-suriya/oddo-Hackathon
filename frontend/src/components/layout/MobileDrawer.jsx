import { useEffect } from "react";
import { createPortal } from "react-dom";
import Icon from "../ui/Icon.jsx";
import NavList from "./NavList.jsx";
import SidebarUser from "./SidebarUser.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import styles from "./MobileDrawer.module.css";

export default function MobileDrawer({ open, onClose }) {
  const { user } = useAuth();

  useEffect(() => {
    if (!open) return undefined;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.drawer} role="dialog" aria-modal="true" aria-label="Navigation menu">
        <div className={styles.brandRow}>
          <div className={styles.brand}>
            <span className={styles.logoMark}>D</span>
            Dayflow
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close menu">
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className={styles.navScroll}>
          <NavList role={user?.role} onNavigate={onClose} />
        </div>
        <SidebarUser onNavigate={onClose} />
      </div>
    </div>,
    document.body
  );
}
