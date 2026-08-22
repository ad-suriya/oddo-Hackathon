import { LeaveStatusBadge } from "../ui/StatusBadge.jsx";
import { formatDate } from "../../utils/formatters.js";
import { LEAVE_TYPES } from "../../utils/constants.js";
import styles from "./LeaveRequestCard.module.css";

function leaveTypeLabel(value) {
  return LEAVE_TYPES.find((t) => t.value === value)?.label || value;
}

export default function LeaveRequestCard({ request }) {
  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <div>
          <div className={styles.type}>{leaveTypeLabel(request.leaveType)}</div>
          <div className={styles.dates}>
            {formatDate(request.startDate)}
            {request.startDate !== request.endDate ? ` – ${formatDate(request.endDate)}` : ""}
          </div>
        </div>
        <LeaveStatusBadge status={request.status} />
      </div>
      {request.remarks && <p className={styles.remarks}>&ldquo;{request.remarks}&rdquo;</p>}
      {request.status !== "pending" && request.reviewerComment && (
        <p className={styles.reviewNote}>
          {request.reviewer?.fullName ? `${request.reviewer.fullName}: ` : ""}
          {request.reviewerComment}
        </p>
      )}
    </div>
  );
}
