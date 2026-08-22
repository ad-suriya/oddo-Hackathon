import { useMemo, useState } from "react";
import Icon from "../../components/ui/Icon.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import Card, { CardHeader, CardBody } from "../../components/ui/Card.jsx";
import AttendanceCard from "../../components/domain/AttendanceCard.jsx";
import PayrollSummaryCard from "../../components/domain/PayrollSummaryCard.jsx";
import ActivityFeed from "../../components/domain/ActivityFeed.jsx";
import ErrorState, { friendlyErrorMessage } from "../../components/ui/ErrorState.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useAsync, useAction } from "../../hooks/useAsync.js";
import { attendanceService } from "../../services/attendanceService.js";
import { leaveService } from "../../services/leaveService.js";
import { payrollService } from "../../services/payrollService.js";
import { formatLongDate, greetingForNow, todayIso } from "../../utils/formatters.js";
import { summarizeLeave } from "../../utils/leave.js";
import styles from "./Dashboard.module.css";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const firstName = user?.employee?.fullName?.split(" ")[0] || "there";

  const attendanceQuery = useAsync(() => attendanceService.getMine(), []);
  const leaveQuery = useAsync(() => leaveService.getMine(), []);
  const payrollQuery = useAsync(() => payrollService.getMine(), []);

  const checkIn = useAction(() => attendanceService.checkIn());
  const checkOut = useAction(() => attendanceService.checkOut());

  const today = useMemo(() => attendanceQuery.data?.find((a) => a.attendanceDate === todayIso()), [attendanceQuery.data]);
  const leaveSummary = useMemo(() => summarizeLeave(leaveQuery.data || []), [leaveQuery.data]);

  const activity = useMemo(() => buildActivity(attendanceQuery.data, leaveQuery.data), [attendanceQuery.data, leaveQuery.data]);

  async function handleCheckIn() {
    try {
      await checkIn.run();
      await attendanceQuery.refetch();
      toast.success("Checked in", "Have a productive day!");
    } catch (err) {
      toast.error("Check-in failed", friendlyErrorMessage(err));
    }
  }

  async function handleCheckOut() {
    try {
      await checkOut.run();
      await attendanceQuery.refetch();
      toast.success("Checked out", "See you tomorrow!");
    } catch (err) {
      toast.error("Check-out failed", friendlyErrorMessage(err));
    }
  }

  return (
    <div>
      <h1 className={styles.welcomeTitle}>
        {greetingForNow()}, {firstName}
      </h1>
      <p className={styles.welcomeSubtitle}>{formatLongDate()}</p>

      <div className={styles.statGrid}>
        <StatCard label="Available leave" value={leaveSummary.availableDays} meta="paid days remaining" icon={<Icon name="leave" size={18} />} loading={leaveQuery.loading} />
        <StatCard label="Pending requests" value={leaveSummary.pending} meta="awaiting review" icon={<Icon name="clock" size={18} />} loading={leaveQuery.loading} />
        <StatCard label="Approved this year" value={leaveSummary.approved} meta="leave requests" icon={<Icon name="checkCircle" size={18} />} loading={leaveQuery.loading} />
        <StatCard
          label="Net salary"
          value={payrollQuery.data ? formatCurrencyShort(payrollQuery.data) : "—"}
          meta={payrollQuery.data?.payPeriod}
          icon={<Icon name="payroll" size={18} />}
          loading={payrollQuery.loading}
        />
      </div>

      <div className={styles.mainGrid}>
        {attendanceQuery.error ? (
          <ErrorState description={friendlyErrorMessage(attendanceQuery.error)} onRetry={attendanceQuery.refetch} />
        ) : (
          <AttendanceCard
            today={today}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            checkingIn={checkIn.pending}
            checkingOut={checkOut.pending}
          />
        )}
        {payrollQuery.error ? (
          <ErrorState description={friendlyErrorMessage(payrollQuery.error)} onRetry={payrollQuery.refetch} />
        ) : (
          <PayrollSummaryCard payroll={payrollQuery.data} />
        )}
      </div>

      <div className={styles.section}>
        <Card>
          <CardHeader title="Recent activity" subtitle="Your latest attendance and leave updates" />
          <CardBody tight>
            <ActivityFeed items={activity} loading={attendanceQuery.loading || leaveQuery.loading} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function formatCurrencyShort(payroll) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: payroll.currency, maximumFractionDigits: 0 }).format(payroll.netPay);
}

function buildActivity(attendance, leave) {
  if (!attendance || !leave) return null;
  const items = [];
  for (const record of attendance.slice(0, 5)) {
    if (record.checkInAt) {
      items.push({ id: `${record.id}-in`, icon: "attendance", title: `Checked in on ${record.attendanceDate}`, timestamp: record.checkInAt });
    }
    if (record.checkOutAt) {
      items.push({ id: `${record.id}-out`, icon: "logout", title: `Checked out on ${record.attendanceDate}`, timestamp: record.checkOutAt });
    }
  }
  for (const request of leave.slice(0, 5)) {
    items.push({
      id: `${request.id}-leave`,
      icon: "leave",
      title: `Leave request ${request.status} — ${request.startDate} to ${request.endDate}`,
      timestamp: request.reviewedAt || request.createdAt,
    });
  }
  return items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 6);
}
