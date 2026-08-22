import Badge from "./Badge.jsx";
import {
  ATTENDANCE_STATUS_LABELS,
  LEAVE_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "../../utils/constants.js";

const ATTENDANCE_TONE = { present: "success", absent: "danger", half_day: "warning", leave: "info" };
const LEAVE_TONE = { pending: "warning", approved: "success", rejected: "danger" };
const PAYMENT_TONE = { paid: "success", processing: "info", pending: "warning" };

export function AttendanceStatusBadge({ status }) {
  return (
    <Badge tone={ATTENDANCE_TONE[status] || "neutral"} dot>
      {ATTENDANCE_STATUS_LABELS[status] || status}
    </Badge>
  );
}

export function LeaveStatusBadge({ status }) {
  return (
    <Badge tone={LEAVE_TONE[status] || "neutral"} dot>
      {LEAVE_STATUS_LABELS[status] || status}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }) {
  return (
    <Badge tone={PAYMENT_TONE[status] || "neutral"} dot>
      {PAYMENT_STATUS_LABELS[status] || status}
    </Badge>
  );
}
