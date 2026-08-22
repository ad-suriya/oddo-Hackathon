import { Link } from "react-router-dom";
import { useState } from "react";
import Avatar from "../ui/Avatar.jsx";
import Icon from "../ui/Icon.jsx";
import ConfirmDialog from "../ui/ConfirmDialog.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import styles from "./SidebarUser.module.css";

export default function SidebarUser({ onNavigate }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  if (!user) return null;
  const name = user.employee?.fullName || user.email;

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      toast.info("Signed out", "You have been logged out.");
    } catch {
      toast.error("Sign out failed", "Please try again.");
    } finally {
      setLoggingOut(false);
      setConfirmOpen(false);
    }
  }

  return (
    <>
      <div className={styles.wrap}>
        <Link to="/profile" onClick={onNavigate} style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
          <Avatar name={name} src={user.employee?.profilePictureUrl} size="sm" />
          <div className={styles.info}>
            <span className={styles.name}>{name}</span>
            <span className={styles.role}>{user.role}</span>
          </div>
        </Link>
        <button type="button" className={styles.logoutButton} onClick={() => setConfirmOpen(true)} aria-label="Log out">
          <Icon name="logout" size={17} />
        </button>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleLogout}
        title="Log out of Dayflow?"
        description="You'll need to sign in again to access your dashboard."
        confirmLabel="Log out"
        variant="danger"
        loading={loggingOut}
      />
    </>
  );
}
