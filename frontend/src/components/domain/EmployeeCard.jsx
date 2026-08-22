import Avatar from "../ui/Avatar.jsx";
import Badge from "../ui/Badge.jsx";
import { AttendanceStatusBadge } from "../ui/StatusBadge.jsx";
import styles from "./EmployeeCard.module.css";

export default function EmployeeCard({ employee, attendanceStatus, leaveStatus, onClick }) {
  return (
    <button type="button" className={styles.card} onClick={onClick} style={{ textAlign: "left", width: "100%" }}>
      <Avatar name={employee.fullName} src={employee.profilePictureUrl} />
      <div className={styles.info}>
        <div className={styles.name}>{employee.fullName}</div>
        <div className={styles.meta}>
          {employee.employeeCode} · {employee.department || "No department"}
        </div>
      </div>
      <div className={styles.badges}>
        {attendanceStatus ? <AttendanceStatusBadge status={attendanceStatus} /> : <Badge tone="neutral">Not marked</Badge>}
        {leaveStatus && <Badge tone="neutral">{leaveStatus}</Badge>}
      </div>
    </button>
  );
}
