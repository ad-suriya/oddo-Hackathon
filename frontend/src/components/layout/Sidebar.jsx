import NavList from "./NavList.jsx";
import SidebarUser from "./SidebarUser.jsx";
import LogoMark from "../ui/LogoMark.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const { user } = useAuth();
  return (
    <aside className={styles.sidebar} aria-label="Primary navigation">
      <div className={styles.brand}>
        <LogoMark size={30} />
        <span className={styles.brandName}>Dayflow</span>
      </div>
      <div className={styles.navScroll}>
        <NavList role={user?.role} />
      </div>
      <SidebarUser />
    </aside>
  );
}
