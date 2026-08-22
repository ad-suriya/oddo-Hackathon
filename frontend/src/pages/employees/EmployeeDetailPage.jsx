import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Card, { CardHeader, CardBody, CardFooter } from "../../components/ui/Card.jsx";
import Tabs from "../../components/ui/Tabs.jsx";
import Avatar from "../../components/ui/Avatar.jsx";
import Button from "../../components/ui/Button.jsx";
import FormField from "../../components/ui/FormField.jsx";
import Input from "../../components/ui/Input.jsx";
import Textarea from "../../components/ui/Textarea.jsx";
import Alert from "../../components/ui/Alert.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import { SkeletonText } from "../../components/ui/Skeleton.jsx";
import ErrorState, { friendlyErrorMessage } from "../../components/ui/ErrorState.jsx";
import { AttendanceStatusBadge, LeaveStatusBadge, PaymentStatusBadge } from "../../components/ui/StatusBadge.jsx";
import DocumentList from "../../components/domain/DocumentList.jsx";
import PayrollEditModal from "../../components/domain/PayrollEditModal.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { useToast } from "../../context/ToastContext.jsx";
import { employeeService } from "../../services/employeeService.js";
import { attendanceService } from "../../services/attendanceService.js";
import { leaveService } from "../../services/leaveService.js";
import { payrollService } from "../../services/payrollService.js";
import { documentService } from "../../services/documentService.js";
import { formatCurrency, formatDate, formatTime } from "../../utils/formatters.js";
import { validateForm, hasErrors, required, validateMaxLength } from "../../utils/validation.js";
import { LEAVE_TYPES } from "../../utils/constants.js";

const TABS = [
  { value: "profile", label: "Profile" },
  { value: "attendance", label: "Attendance" },
  { value: "leave", label: "Leave" },
  { value: "payroll", label: "Payroll" },
  { value: "documents", label: "Documents" },
];

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const [tab, setTab] = useState("profile");

  const employeeQuery = useAsync(() => employeeService.getById(id), [id]);

  return (
    <div>
      <PageHeader
        backTo="/employees"
        backLabel="All employees"
        title={employeeQuery.data?.fullName || "Employee"}
        description={employeeQuery.data ? `${employeeQuery.data.employeeCode} · ${employeeQuery.data.department || "No department"}` : undefined}
      />

      {employeeQuery.error && <ErrorState description={friendlyErrorMessage(employeeQuery.error)} onRetry={employeeQuery.refetch} />}

      {!employeeQuery.error && (
        <>
          <Tabs tabs={TABS} value={tab} onChange={setTab} />
          {tab === "profile" && <ProfileTab employeeQuery={employeeQuery} />}
          {tab === "attendance" && <AttendanceTab employeeId={id} />}
          {tab === "leave" && <LeaveTab employeeId={id} />}
          {tab === "payroll" && <PayrollTab employeeId={id} />}
          {tab === "documents" && <DocumentsTab employeeId={id} />}
        </>
      )}
    </div>
  );
}

function ProfileTab({ employeeQuery }) {
  const { data: employee, loading, setData } = employeeQuery;
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (employee && !editing) {
      setValues({
        fullName: employee.fullName || "",
        phone: employee.phone || "",
        address: employee.address || "",
        jobTitle: employee.jobTitle || "",
        department: employee.department || "",
        dateJoined: employee.dateJoined || "",
        profilePictureUrl: employee.profilePictureUrl || "",
      });
    }
  }, [employee, editing]);

  function update(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function handleSave(e) {
    e.preventDefault();
    const nextErrors = validateForm(values, {
      fullName: (v) => required(v, "Full name is required."),
      address: (v) => validateMaxLength(v, 240, "Address"),
    });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSaveError(null);
    setSaving(true);
    try {
      const updated = await employeeService.update(employee.id, values);
      setData(updated);
      setEditing(false);
      toast.success("Employee updated", "Changes have been saved.");
    } catch (err) {
      if (err.details) setErrors((e) => ({ ...e, ...err.details }));
      setSaveError(friendlyErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader
        title="Personal information"
        actions={
          !loading && !editing ? (
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
          ) : null
        }
      />
      <CardBody>
        {loading ? (
          <SkeletonText lines={5} />
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <Avatar name={employee.fullName} src={employee.profilePictureUrl} size="lg" />
              <div>
                <div style={{ fontWeight: 600, fontSize: "var(--text-lg)" }}>{employee.fullName}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>{employee.email}</div>
              </div>
            </div>

            {!editing ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Employee ID" value={employee.employeeCode} />
                <Field label="Role" value={employee.role} capitalize />
                <Field label="Job title" value={employee.jobTitle} />
                <Field label="Department" value={employee.department} />
                <Field label="Phone" value={employee.phone} />
                <Field label="Joining date" value={formatDate(employee.dateJoined)} />
                <Field label="Address" value={employee.address} full />
              </div>
            ) : (
              <form onSubmit={handleSave} noValidate>
                {saveError && (
                  <div style={{ marginBottom: 16 }}>
                    <Alert variant="danger">{saveError}</Alert>
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <FormField label="Full name" required error={errors.fullName}>
                    {(props) => <Input {...props} value={values.fullName} onChange={(e) => update("fullName", e.target.value)} />}
                  </FormField>
                  <FormField label="Job title" error={errors.jobTitle}>
                    {(props) => <Input {...props} value={values.jobTitle} onChange={(e) => update("jobTitle", e.target.value)} />}
                  </FormField>
                  <FormField label="Department" error={errors.department}>
                    {(props) => <Input {...props} value={values.department} onChange={(e) => update("department", e.target.value)} />}
                  </FormField>
                  <FormField label="Phone" error={errors.phone}>
                    {(props) => <Input {...props} value={values.phone} onChange={(e) => update("phone", e.target.value)} />}
                  </FormField>
                  <FormField label="Joining date" error={errors.dateJoined}>
                    {(props) => <Input {...props} type="date" value={values.dateJoined} onChange={(e) => update("dateJoined", e.target.value)} />}
                  </FormField>
                  <FormField label="Profile photo URL" error={errors.profilePictureUrl}>
                    {(props) => <Input {...props} value={values.profilePictureUrl} onChange={(e) => update("profilePictureUrl", e.target.value)} />}
                  </FormField>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <FormField label="Address" error={errors.address}>
                      {(props) => <Textarea {...props} value={values.address} onChange={(e) => update("address", e.target.value)} />}
                    </FormField>
                  </div>
                </div>
              </form>
            )}
          </>
        )}
      </CardBody>
      {editing && (
        <CardFooter>
          <Button variant="secondary" onClick={() => setEditing(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving}>
            Save changes
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

function Field({ label, value, full, capitalize }) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : undefined }}>
      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: "var(--text-base)", color: "var(--text-primary)", textTransform: capitalize ? "capitalize" : undefined }}>{value || "—"}</div>
    </div>
  );
}

function AttendanceTab({ employeeId }) {
  const query = useAsync(() => attendanceService.getForEmployee(employeeId), [employeeId]);
  const columns = [
    { key: "date", header: "Date", render: (row) => formatDate(row.attendanceDate) },
    { key: "checkIn", header: "Check-in", render: (row) => formatTime(row.checkInAt) },
    { key: "checkOut", header: "Check-out", render: (row) => formatTime(row.checkOutAt) },
    { key: "status", header: "Status", render: (row) => <AttendanceStatusBadge status={row.status} /> },
  ];
  return (
    <DataTable
      columns={columns}
      rows={query.data}
      loading={query.loading}
      error={query.error}
      onRetry={query.refetch}
      emptyIcon="attendance"
      emptyTitle="No attendance records found."
    />
  );
}

function leaveTypeLabel(value) {
  return LEAVE_TYPES.find((t) => t.value === value)?.label || value;
}

function LeaveTab({ employeeId }) {
  const query = useAsync(() => leaveService.list(), []);
  const rows = useMemo(() => (query.data || []).filter((r) => r.employeeId === employeeId), [query.data, employeeId]);
  const columns = [
    { key: "type", header: "Leave type", render: (row) => leaveTypeLabel(row.leaveType) },
    { key: "dates", header: "Dates", render: (row) => `${formatDate(row.startDate)} – ${formatDate(row.endDate)}` },
    { key: "reason", header: "Reason", render: (row) => row.remarks || "—" },
    { key: "status", header: "Status", render: (row) => <LeaveStatusBadge status={row.status} /> },
  ];
  return (
    <DataTable
      columns={columns}
      rows={rows}
      loading={query.loading}
      error={query.error}
      onRetry={query.refetch}
      emptyIcon="leave"
      emptyTitle="No leave requests found."
    />
  );
}

function PayrollTab({ employeeId }) {
  const toast = useToast();
  // GET /payroll/:employeeId directly, rather than paging through the full
  // (now paginated) list and filtering client-side — that pattern would
  // silently miss this employee whenever they fell outside the first page.
  const query = useAsync(async () => {
    try {
      return await payrollService.getById(employeeId);
    } catch (err) {
      if (err.status === 404) return null;
      throw err;
    }
  }, [employeeId]);
  const [editing, setEditing] = useState(false);
  const record = query.data;

  async function handleSave(values) {
    await payrollService.update(employeeId, values);
    await query.refetch();
    toast.success("Payroll updated", "Salary structure saved.");
    setEditing(false);
  }

  if (query.loading) {
    return (
      <Card>
        <CardBody>
          <SkeletonText lines={4} />
        </CardBody>
      </Card>
    );
  }

  if (query.error) return <ErrorState description={friendlyErrorMessage(query.error)} onRetry={query.refetch} />;

  return (
    <Card>
      <CardHeader
        title="Salary structure"
        subtitle={record?.payPeriod}
        actions={
          <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
            Edit
          </Button>
        }
      />
      <CardBody tight>
        {record ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <PayrollRow label="Basic pay" value={formatCurrency(record.basicPay, record.currency)} />
            <PayrollRow label="Allowances" value={formatCurrency(record.allowances, record.currency)} />
            <PayrollRow label="Deductions" value={formatCurrency(record.deductions, record.currency)} />
            <PayrollRow label="Net pay" value={formatCurrency(record.netPay, record.currency)} strong />
            <div style={{ padding: "var(--space-4) var(--space-5)" }}>
              <PaymentStatusBadge status={record.paymentStatus} />
            </div>
          </div>
        ) : (
          <div style={{ padding: "var(--space-5)", color: "var(--text-secondary)" }}>No payroll record found.</div>
        )}
      </CardBody>
      <PayrollEditModal open={editing} employeeName="this employee" record={record} onClose={() => setEditing(false)} onSave={handleSave} />
    </Card>
  );
}

function PayrollRow({ label, value, strong }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "var(--space-3) var(--space-5)", borderBottom: "1px solid var(--border-default)" }}>
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ fontWeight: strong ? 700 : 500, fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}

function DocumentsTab({ employeeId }) {
  const query = useAsync(() => documentService.getForEmployee(employeeId), [employeeId]);
  return (
    <Card>
      <DocumentList documents={query.data} loading={query.loading} error={query.error} onRetry={query.refetch} />
    </Card>
  );
}
