import { useNavigate } from "react-router-dom";
import DataTable from "../ui/DataTable.jsx";
import Avatar from "../ui/Avatar.jsx";
import Badge from "../ui/Badge.jsx";
import { AttendanceStatusBadge } from "../ui/StatusBadge.jsx";
import EmployeeCard from "./EmployeeCard.jsx";
import styles from "./EmployeeTable.module.css";

/**
 * Admin/HR employee overview. Renders a full DataTable on larger screens and
 * a stacked EmployeeCard list on narrow viewports (CSS-driven, no JS
 * breakpoint logic) so long names/departments never force horizontal
 * scrolling on mobile.
 */
export default function EmployeeTable({ employees, attendanceByEmployeeId = {}, leaveStatusByEmployeeId = {}, loading, error, onRetry }) {
  const navigate = useNavigate();

  const columns = [
    {
      key: "employee",
      header: "Employee",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={row.fullName} src={row.profilePictureUrl} size="sm" />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200 }}>{row.fullName}</div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>{row.employeeCode}</div>
          </div>
        </div>
      ),
    },
    { key: "department", header: "Department", render: (row) => row.department || "—" },
    { key: "jobTitle", header: "Role", render: (row) => <Badge tone="neutral">{row.jobTitle || "—"}</Badge> },
    {
      key: "attendance",
      header: "Attendance today",
      render: (row) => (attendanceByEmployeeId[row.id] ? <AttendanceStatusBadge status={attendanceByEmployeeId[row.id]} /> : <Badge tone="neutral">Not marked</Badge>),
    },
    {
      key: "leave",
      header: "Leave status",
      render: (row) => leaveStatusByEmployeeId[row.id] || "—",
    },
  ];

  return (
    <>
      <div className={styles.tableOnly}>
        <DataTable
          columns={columns}
          rows={employees}
          loading={loading}
          error={error}
          onRetry={onRetry}
          onRowClick={(row) => navigate(`/employees/${row.id}`)}
          emptyIcon="employees"
          emptyTitle="No employees found."
          emptyDescription="Employees will appear here once they're added to Dayflow."
        />
      </div>
      <div className={styles.cardsOnly}>
        {employees?.map((row) => (
          <EmployeeCard
            key={row.id}
            employee={row}
            attendanceStatus={attendanceByEmployeeId[row.id]}
            leaveStatus={leaveStatusByEmployeeId[row.id]}
            onClick={() => navigate(`/employees/${row.id}`)}
          />
        ))}
      </div>
    </>
  );
}
