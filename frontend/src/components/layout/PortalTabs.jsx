import { Link } from "react-router-dom";
import { LOGIN_PORTALS } from "../../utils/navigation.js";
import styles from "./PortalTabs.module.css";

/** Segmented control letting a visitor switch between the Employee / Admin+HR login pages. */
export default function PortalTabs({ activeKey }) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="Choose sign-in portal">
      {LOGIN_PORTALS.map((portal) => (
        <Link
          key={portal.key}
          to={portal.path}
          role="tab"
          aria-selected={portal.key === activeKey}
          className={[styles.tab, portal.key === activeKey ? styles.tabActive : ""].filter(Boolean).join(" ")}
        >
          {portal.label}
        </Link>
      ))}
    </div>
  );
}
