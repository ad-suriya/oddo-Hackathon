import { useMemo, useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Input from "../../components/ui/Input.jsx";
import Icon from "../../components/ui/Icon.jsx";
import EmployeeTable from "../../components/domain/EmployeeTable.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { employeeService } from "../../services/employeeService.js";
import { attendanceService } from "../../services/attendanceService.js";
import { leaveService } from "../../services/leaveService.js";

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const employeesQuery = useAsync(() => employeeService.list({ search: search || undefined }), [search]);
  const attendanceQuery = useAsync(() => attendanceService.list(), []);
  const leaveQuery = useAsync(() => leaveService.list(), []);

  const attendanceByEmployeeId = useMemo(() => {
    const map = {};
    for (const record of attendanceQuery.data || []) map[record.employeeId] = record.status;
    return map;
  }, [attendanceQuery.data]);

  const leaveStatusByEmployeeId = useMemo(() => {
    const latest = {};
    for (const request of leaveQuery.data || []) {
      if (!latest[request.employeeId] || new Date(request.createdAt) > new Date(latest[request.employeeId].createdAt)) {
        latest[request.employeeId] = request;
      }
    }
    return Object.fromEntries(Object.entries(latest).map(([id, req]) => [id, req.status]));
  }, [leaveQuery.data]);

  return (
    <div>
      <PageHeader title="Employees" description="Browse and manage employee records." />

      <div style={{ maxWidth: 320, marginBottom: "var(--space-5)" }}>
        <Input
          placeholder="Search by name, ID, or email"
          leftIcon={<Icon name="search" size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search employees"
        />
      </div>

      <EmployeeTable
        employees={employeesQuery.data}
        attendanceByEmployeeId={attendanceByEmployeeId}
        leaveStatusByEmployeeId={leaveStatusByEmployeeId}
        loading={employeesQuery.loading}
        error={employeesQuery.error}
        onRetry={employeesQuery.refetch}
      />
    </div>
  );
}
