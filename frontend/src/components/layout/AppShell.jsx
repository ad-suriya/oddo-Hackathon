import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import MobileHeader from "./MobileHeader.jsx";
import MobileDrawer from "./MobileDrawer.jsx";
import styles from "./AppShell.module.css";

export default function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.main}>
        <MobileHeader onOpenMenu={() => setDrawerOpen(true)} />
        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
