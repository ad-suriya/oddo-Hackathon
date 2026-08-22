import { useMemo, useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Input from "../../components/ui/Input.jsx";
import Icon from "../../components/ui/Icon.jsx";
import Pagination from "../../components/ui/Pagination.jsx";
import EmployeeTable from "../../components/domain/EmployeeTable.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { employeeService } from "../../services/employeeService.js";
import { attendanceService } from "../../services/attendanceService.js";
import { leaveService } from "../../services/leaveService.js";

const PAGE_SIZE = 20;

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const employeesQuery = useAsync(
    () => employeeService.list({ search: search || undefined, page, limit: PAGE_SIZE }),
    [search, page]
  );
  const attendanceQuery = useAsync(() => attendanceService.list(), []);
  const leaveQuery = useAsync(() => leaveService.list(), []);

  const employees = employeesQuery.data?.items ?? null;

  function handleSearchChange(value) {
    setSearch(value);
    setPage(1); // a new search invalidates the current page
  }

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
          onChange={(e) => handleSearchChange(e.target.value)}
          aria-label="Search employees"
        />
      </div>

      <EmployeeTable
        employees={employees}
        attendanceByEmployeeId={attendanceByEmployeeId}
        leaveStatusByEmployeeId={leaveStatusByEmployeeId}
        loading={employeesQuery.loading}
        error={employeesQuery.error}
        onRetry={employeesQuery.refetch}
      />
      {employeesQuery.data && (
        <Pagination
          page={employeesQuery.data.page}
          limit={employeesQuery.data.limit}
          total={employeesQuery.data.total}
          totalPages={employeesQuery.data.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
