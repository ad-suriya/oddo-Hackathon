import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Card, { CardHeader, CardBody } from "../../components/ui/Card.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import Input from "../../components/ui/Input.jsx";
import Avatar from "../../components/ui/Avatar.jsx";
import { AttendanceStatusBadge } from "../../components/ui/StatusBadge.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { attendanceService } from "../../services/attendanceService.js";
import { formatDate, formatTime, todayIso } from "../../utils/formatters.js";

export default function AdminAttendancePage() {
  const navigate = useNavigate();
  const [date, setDate] = useState(todayIso());
  const attendanceQuery = useAsync(() => attendanceService.list({ date }), [date]);

  const columns = [
    {
      key: "employee",
      header: "Employee",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={row.employee?.fullName} size="sm" />
          <div>
            <div style={{ fontWeight: 500 }}>{row.employee?.fullName || "—"}</div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>{row.employee?.department}</div>
          </div>
        </div>
      ),
    },
    { key: "date", header: "Date", render: (row) => formatDate(row.attendanceDate) },
    { key: "checkIn", header: "Check-in", render: (row) => formatTime(row.checkInAt) },
    { key: "checkOut", header: "Check-out", render: (row) => formatTime(row.checkOutAt) },
    { key: "status", header: "Status", render: (row) => <AttendanceStatusBadge status={row.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Attendance Management" description="Review employee attendance across the organization." />

      <Card>
        <CardHeader
          title="Attendance for"
          actions={<Input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ height: 34 }} aria-label="Select date" />}
        />
        <CardBody tight>
          <DataTable
            columns={columns}
            rows={attendanceQuery.data}
            loading={attendanceQuery.loading}
            error={attendanceQuery.error}
            onRetry={attendanceQuery.refetch}
            onRowClick={(row) => row.employee && navigate(`/employees/${row.employee.id}`)}
            emptyIcon="attendance"
            emptyTitle="No attendance records for this date."
            emptyDescription="Try selecting a different date."
          />
        </CardBody>
      </Card>
    </div>
  );
}
