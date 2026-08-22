import Card, { CardHeader, CardBody } from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import Icon from "../ui/Icon.jsx";
import { AttendanceStatusBadge } from "../ui/StatusBadge.jsx";
import { formatDuration, formatTime } from "../../utils/formatters.js";
import styles from "./AttendanceCard.module.css";

export default function AttendanceCard({ today, onCheckIn, onCheckOut, checkingIn, checkingOut }) {
  const hasCheckedIn = Boolean(today?.checkInAt);
  const hasCheckedOut = Boolean(today?.checkOutAt);

  return (
    <Card>
      <CardHeader
        title="Today's Attendance"
        subtitle="Track your check-in and check-out for today"
        actions={today ? <AttendanceStatusBadge status={today.status} /> : null}
      />
      <CardBody>
        <div className={styles.grid}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Check-in</span>
            <span className={styles.statValue}>{formatTime(today?.checkInAt)}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Check-out</span>
            <span className={styles.statValue}>{formatTime(today?.checkOutAt)}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Duration</span>
            <span className={styles.statValue}>
              {hasCheckedIn ? formatDuration(today.checkInAt, today.checkOutAt) : "—"}
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            variant={hasCheckedIn ? "secondary" : "primary"}
            leftIcon={<Icon name="clock" size={16} />}
            onClick={onCheckIn}
            disabled={hasCheckedIn}
            loading={checkingIn}
            fullWidth
          >
            {hasCheckedIn ? "Checked in" : "Check in"}
          </Button>
          <Button
            variant={hasCheckedOut || !hasCheckedIn ? "secondary" : "primary"}
            leftIcon={<Icon name="logout" size={16} />}
            onClick={onCheckOut}
            disabled={!hasCheckedIn || hasCheckedOut}
            loading={checkingOut}
            fullWidth
          >
            {hasCheckedOut ? "Checked out" : "Check out"}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
