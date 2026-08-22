import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import Button from "../../components/ui/Button.jsx";
import Avatar from "../../components/ui/Avatar.jsx";
import Icon from "../../components/ui/Icon.jsx";
import { PaymentStatusBadge } from "../../components/ui/StatusBadge.jsx";
import PayrollEditModal from "../../components/domain/PayrollEditModal.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { useToast } from "../../context/ToastContext.jsx";
import { payrollService } from "../../services/payrollService.js";
import { formatCurrency } from "../../utils/formatters.js";

export default function AdminPayrollPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const payrollQuery = useAsync(() => payrollService.list(), []);
  const [editing, setEditing] = useState(null);

  async function handleSave(values) {
    await payrollService.update(editing.employeeId, values);
    await payrollQuery.refetch();
    toast.success("Payroll updated", `${editing.employee?.fullName}'s salary structure was saved.`);
    setEditing(null);
  }

  const columns = [
    {
      key: "employee",
      header: "Employee",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate(`/employees/${row.employeeId}`)}>
          <Avatar name={row.employee?.fullName} size="sm" />
          <div>
            <div style={{ fontWeight: 500 }}>{row.employee?.fullName}</div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>{row.employee?.employeeCode}</div>
          </div>
        </div>
      ),
    },
    { key: "basicPay", header: "Basic pay", render: (row) => formatCurrency(row.basicPay, row.currency) },
    { key: "allowances", header: "Allowances", render: (row) => formatCurrency(row.allowances, row.currency) },
    { key: "deductions", header: "Deductions", render: (row) => formatCurrency(row.deductions, row.currency) },
    { key: "netPay", header: "Net pay", render: (row) => <strong>{formatCurrency(row.netPay, row.currency)}</strong> },
    { key: "status", header: "Status", render: (row) => <PaymentStatusBadge status={row.paymentStatus} /> },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <Button
          size="sm"
          variant="secondary"
          leftIcon={<Icon name="edit" size={14} />}
          onClick={(e) => {
            e.stopPropagation();
            setEditing(row);
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Payroll Management" description="Review and update employee salary structures." />

      <DataTable
        columns={columns}
        rows={payrollQuery.data}
        loading={payrollQuery.loading}
        error={payrollQuery.error}
        onRetry={payrollQuery.refetch}
        emptyIcon="payroll"
        emptyTitle="No payroll records found."
      />

      <PayrollEditModal
        open={Boolean(editing)}
        employeeName={editing?.employee?.fullName}
        record={editing}
        onClose={() => setEditing(null)}
        onSave={handleSave}
      />
    </div>
  );
}
