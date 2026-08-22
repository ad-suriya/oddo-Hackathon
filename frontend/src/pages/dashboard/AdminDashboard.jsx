import { useMemo } from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/ui/Icon.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import Card, { CardHeader, CardBody } from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import ActivityFeed from "../../components/domain/ActivityFeed.jsx";
import EmployeeTable from "../../components/domain/EmployeeTable.jsx";
import { LeaveStatusBadge } from "../../components/ui/StatusBadge.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { employeeService } from "../../services/employeeService.js";
import { attendanceService } from "../../services/attendanceService.js";
import { leaveService } from "../../services/leaveService.js";
import { payrollService } from "../../services/payrollService.js";
import { formatDate, formatLongDate, greetingForNow } from "../../utils/formatters.js";
import styles from "./Dashboard.module.css";

export default function AdminDashboard() {
  const { user } = useAuth();
  const firstName = user?.employee?.fullName?.split(" ")[0] || "there";

  // The dashboard aggregates across the whole org (stat totals, the
  // "employee overview" preview, payroll-processed counts) rather than
  // paging through it, so it asks for the max page size instead of the
  // list pages' default — see EmployeesPage.jsx/AdminPayrollPage.jsx for
  // the paginated table views.
  const employeesQuery = useAsync(() => employeeService.list({ limit: 100 }), []);
  const attendanceQuery = useAsync(() => attendanceService.list(), []);
  const leaveQuery = useAsync(() => leaveService.list(), []);
  const payrollQuery = useAsync(() => payrollService.list({ limit: 100 }), []);

  const attendanceByEmployeeId = useMemo(() => {
    const map = {};
    for (const record of attendanceQuery.data || []) map[record.employeeId] = record.status;
    return map;
  }, [attendanceQuery.data]);

  const leaveStatusByEmployeeId = useMemo(() => {
    const map = {};
    for (const request of leaveQuery.data || []) {
      if (!map[request.employeeId] || new Date(request.createdAt) > new Date(map[request.employeeId].createdAt)) {
        map[request.employeeId] = request;
      }
    }
    return Object.fromEntries(Object.entries(map).map(([id, req]) => [id, req.status]));
  }, [leaveQuery.data]);

  const presentToday = (attendanceQuery.data || []).filter((a) => a.status === "present" || a.status === "half_day").length;
  const onLeaveToday = (attendanceQuery.data || []).filter((a) => a.status === "leave").length;
  const pendingLeave = (leaveQuery.data || []).filter((r) => r.status === "pending");
  // .total is the true org-wide count from the API; payrollProcessed/
  // unconfiguredPayroll below only see the fetched page (limit: 100 above),
  // so they're exact up to 100 employees and an approximation beyond that.
  const totalEmployees = employeesQuery.data?.total ?? null;
  const payrollItems = payrollQuery.data?.items || [];
  const payrollProcessed = payrollItems.filter((p) => p.paymentStatus === "paid").length;

  const absentToday = (attendanceQuery.data || []).filter((a) => a.status === "absent");
  const unconfiguredPayroll = payrollItems.filter((p) => p.paymentStatus !== "paid");

  const loadingCore = employeesQuery.loading || attendanceQuery.loading || leaveQuery.loading || payrollQuery.loading;

  const activity = useMemo(() => buildAdminActivity(leaveQuery.data), [leaveQuery.data]);

  return (
    <div>
      <h1 className={styles.welcomeTitle}>
        {greetingForNow()}, {firstName}
      </h1>
      <p className={styles.welcomeSubtitle}>{formatLongDate()} — here's how Dayflow looks today.</p>

      <div className={styles.statGrid}>
        <StatCard label="Total employees" value={totalEmployees ?? "—"} icon={<Icon name="employees" size={18} />} loading={employeesQuery.loading} />
        <StatCard label="Present today" value={presentToday} meta={totalEmployees ? `of ${totalEmployees}` : undefined} icon={<Icon name="attendance" size={18} />} loading={attendanceQuery.loading} />
        <StatCard label="On leave today" value={onLeaveToday} icon={<Icon name="leave" size={18} />} loading={attendanceQuery.loading} />
        <StatCard label="Pending leave requests" value={pendingLeave.length} icon={<Icon name="clock" size={18} />} loading={leaveQuery.loading} />
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Pending actions</h2>
        <div className={styles.mainGrid}>
          <Card>
            <CardHeader title="Leave requests awaiting review" actions={<Button as={Link} to="/admin/leave" variant="ghost" size="sm">View all</Button>} />
            <CardBody tight>
              {loadingCore ? (
                <div style={{ padding: "var(--space-5)" }} />
              ) : pendingLeave.length === 0 ? (
                <EmptyState icon="checkCircle" title="All caught up." description="No leave requests are waiting for review." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {pendingLeave.slice(0, 5).map((req) => (
                    <div key={req.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "var(--space-3) var(--space-5)", borderBottom: "1px solid var(--border-default)" }}>
                      <div>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>{req.employee?.fullName}</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                          {formatDate(req.startDate)} – {formatDate(req.endDate)}
                        </div>
                      </div>
                      <LeaveStatusBadge status={req.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Attendance & payroll flags" />
            <CardBody tight>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <FlagRow label={`${absentToday.length} employee(s) absent today`} to="/admin/attendance" icon="attendance" />
                <FlagRow label={`${unconfiguredPayroll.length} payroll record(s) need review`} to="/admin/payroll" icon="payroll" />
                <FlagRow label={`${payrollProcessed} of ${payrollQuery.data?.total ?? 0} payroll records processed`} to="/admin/payroll" icon="checkCircle" last />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Employee overview</h2>
        <EmployeeTable
          employees={employeesQuery.data?.items}
          attendanceByEmployeeId={attendanceByEmployeeId}
          leaveStatusByEmployeeId={leaveStatusByEmployeeId}
          loading={employeesQuery.loading}
          error={employeesQuery.error}
          onRetry={employeesQuery.refetch}
        />
      </div>

      <div className={styles.section}>
        <Card>
          <CardHeader title="Recent activity" subtitle="Latest leave requests across the team" />
          <CardBody tight>
            <ActivityFeed items={activity} loading={leaveQuery.loading} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function FlagRow({ label, to, icon, last }) {
  return (
    <Link
      to={to}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "var(--space-3) var(--space-5)",
        borderBottom: last ? "none" : "1px solid var(--border-default)",
        color: "var(--text-primary)",
        fontSize: "var(--text-sm)",
      }}
    >
      <Icon name={icon} size={15} />
      {label}
    </Link>
  );
}

function buildAdminActivity(leaveRequests) {
  if (!leaveRequests) return null;
  return leaveRequests
    .slice()
    .sort((a, b) => new Date(b.reviewedAt || b.createdAt) - new Date(a.reviewedAt || a.createdAt))
    .slice(0, 6)
    .map((req) => ({
      id: req.id,
      icon: req.status === "pending" ? "clock" : req.status === "approved" ? "checkCircle" : "alertCircle",
      title:
        req.status === "pending"
          ? `${req.employee?.fullName} requested ${req.leaveType} leave`
          : `${req.employee?.fullName}'s leave request was ${req.status}${req.reviewer ? ` by ${req.reviewer.fullName}` : ""}`,
      timestamp: req.reviewedAt || req.createdAt,
    }));
}
