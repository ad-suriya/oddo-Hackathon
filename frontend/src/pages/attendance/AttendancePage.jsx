import { useMemo, useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Card, { CardHeader, CardBody } from "../../components/ui/Card.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import { AttendanceStatusBadge } from "../../components/ui/StatusBadge.jsx";
import AttendanceCard from "../../components/domain/AttendanceCard.jsx";
import { friendlyErrorMessage } from "../../components/ui/ErrorState.jsx";
import { useAsync, useAction } from "../../hooks/useAsync.js";
import { useToast } from "../../context/ToastContext.jsx";
import { attendanceService } from "../../services/attendanceService.js";
import { formatDate, formatDuration, formatTime, todayIso } from "../../utils/formatters.js";

const columns = [
  { key: "date", header: "Date", render: (row) => formatDate(row.attendanceDate) },
  { key: "checkIn", header: "Check-in", render: (row) => formatTime(row.checkInAt) },
  { key: "checkOut", header: "Check-out", render: (row) => formatTime(row.checkOutAt) },
  { key: "duration", header: "Duration", render: (row) => (row.checkInAt ? formatDuration(row.checkInAt, row.checkOutAt) : "—") },
  { key: "status", header: "Status", render: (row) => <AttendanceStatusBadge status={row.status} /> },
];

export default function AttendancePage() {
  const toast = useToast();
  const [range, setRange] = useState({ from: "", to: "" });
  const attendanceQuery = useAsync(() => attendanceService.getMine(range), [range.from, range.to]);
  const checkIn = useAction(() => attendanceService.checkIn());
  const checkOut = useAction(() => attendanceService.checkOut());

  const today = useMemo(() => attendanceQuery.data?.find((a) => a.attendanceDate === todayIso()), [attendanceQuery.data]);

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
      <PageHeader title="Attendance" description="Check in, check out, and review your attendance history." />

      <div style={{ maxWidth: 420, marginBottom: "var(--space-6)" }}>
        <AttendanceCard today={today} onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} checkingIn={checkIn.pending} checkingOut={checkOut.pending} />
      </div>

      <Card>
        <CardHeader
          title="Attendance history"
          actions={
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <Input type="date" value={range.from} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} style={{ height: 34 }} aria-label="From date" />
              <span style={{ color: "var(--text-tertiary)", fontSize: "var(--text-sm)" }}>to</span>
              <Input type="date" value={range.to} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} style={{ height: 34 }} aria-label="To date" />
              {(range.from || range.to) && (
                <Button variant="ghost" size="sm" onClick={() => setRange({ from: "", to: "" })}>
                  Clear
                </Button>
              )}
            </div>
          }
        />
        <CardBody tight>
          <DataTable
            columns={columns}
            rows={attendanceQuery.data}
            loading={attendanceQuery.loading}
            error={attendanceQuery.error}
            onRetry={attendanceQuery.refetch}
            emptyIcon="attendance"
            emptyTitle="No attendance records found."
            emptyDescription="Your check-in and check-out history will appear here."
          />
        </CardBody>
      </Card>
    </div>
  );
}
