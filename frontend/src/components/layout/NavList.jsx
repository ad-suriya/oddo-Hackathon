import { NavLink } from "react-router-dom";
import Icon from "../ui/Icon.jsx";
import { NAV_ITEMS, ADMIN_NAV_ITEMS } from "../../utils/navigation.js";
import { isAdminRole } from "../../utils/constants.js";
import styles from "./NavList.module.css";

export default function NavList({ role, onNavigate }) {
  return (
    <nav>
      <div className={styles.group}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) => [styles.link, isActive ? styles.linkActive : ""].filter(Boolean).join(" ")}
          >
            <span className={styles.icon}>
              <Icon name={item.icon} size={17} />
            </span>
            {item.label}
          </NavLink>
        ))}
      </div>

      {isAdminRole(role) && (
        <div className={styles.group}>
          <p className={styles.groupLabel}>Admin / HR</p>
          {ADMIN_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) => [styles.link, isActive ? styles.linkActive : ""].filter(Boolean).join(" ")}
            >
              <span className={styles.icon}>
                <Icon name={item.icon} size={17} />
              </span>
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
