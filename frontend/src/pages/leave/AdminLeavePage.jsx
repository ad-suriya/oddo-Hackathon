import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Tabs from "../../components/ui/Tabs.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import Button from "../../components/ui/Button.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Textarea from "../../components/ui/Textarea.jsx";
import FormField from "../../components/ui/FormField.jsx";
import Avatar from "../../components/ui/Avatar.jsx";
import { LeaveStatusBadge } from "../../components/ui/StatusBadge.jsx";
import { useAsync, useAction } from "../../hooks/useAsync.js";
import { useToast } from "../../context/ToastContext.jsx";
import { leaveService } from "../../services/leaveService.js";
import { friendlyErrorMessage } from "../../components/ui/ErrorState.jsx";
import { formatDate } from "../../utils/formatters.js";
import { LEAVE_TYPES } from "../../utils/constants.js";

const TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function leaveTypeLabel(value) {
  return LEAVE_TYPES.find((t) => t.value === value)?.label || value;
}

export default function AdminLeavePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState("pending");
  const leaveQuery = useAsync(() => leaveService.list(), []);
  const reviewAction = useAction((id, action, comment) =>
    action === "approve" ? leaveService.approve(id, { reviewerComment: comment }) : leaveService.reject(id, { reviewerComment: comment })
  );

  const [review, setReview] = useState(null); // { request, action }
  const [comment, setComment] = useState("");

  const rows = useMemo(() => {
    if (!leaveQuery.data) return leaveQuery.data;
    if (tab === "all") return leaveQuery.data;
    return leaveQuery.data.filter((r) => r.status === tab);
  }, [leaveQuery.data, tab]);

  const counts = useMemo(() => {
    const all = leaveQuery.data || [];
    return {
      all: all.length,
      pending: all.filter((r) => r.status === "pending").length,
      approved: all.filter((r) => r.status === "approved").length,
      rejected: all.filter((r) => r.status === "rejected").length,
    };
  }, [leaveQuery.data]);

  function openReview(request, action) {
    setReview({ request, action });
    setComment("");
  }

  async function confirmReview() {
    try {
      await reviewAction.run(review.request.id, review.action, comment);
      await leaveQuery.refetch();
      toast.success(`Request ${review.action === "approve" ? "approved" : "rejected"}`, `${review.request.employee?.fullName}'s leave request was updated.`);
      setReview(null);
    } catch (err) {
      toast.error("Couldn't update request", friendlyErrorMessage(err));
    }
  }

  const columns = [
    {
      key: "employee",
      header: "Employee",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate(`/employees/${row.employee?.id}`)}>
          <Avatar name={row.employee?.fullName} size="sm" />
          <span style={{ fontWeight: 500 }}>{row.employee?.fullName}</span>
        </div>
      ),
    },
    { key: "type", header: "Leave type", render: (row) => leaveTypeLabel(row.leaveType) },
    { key: "dates", header: "Dates", render: (row) => `${formatDate(row.startDate)} – ${formatDate(row.endDate)}` },
    { key: "reason", header: "Reason", render: (row) => <span style={{ color: "var(--text-secondary)" }}>{row.remarks || "—"}</span> },
    { key: "status", header: "Status", render: (row) => <LeaveStatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "",
      render: (row) =>
        row.status === "pending" ? (
          <div style={{ display: "flex", gap: 8 }} onClick={(e) => e.stopPropagation()}>
            <Button size="sm" variant="secondary" onClick={() => openReview(row, "approve")}>
              Approve
            </Button>
            <Button size="sm" variant="dangerGhost" onClick={() => openReview(row, "reject")}>
              Reject
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div>
      <PageHeader title="Leave Management" description="Review and act on employee leave requests." />

      <Tabs tabs={TABS.map((t) => ({ ...t, count: counts[t.value] }))} value={tab} onChange={setTab} />

      <DataTable
        columns={columns}
        rows={rows}
        loading={leaveQuery.loading}
        error={leaveQuery.error}
        onRetry={leaveQuery.refetch}
        emptyIcon="leave"
        emptyTitle="No leave requests found."
        emptyDescription="Requests matching this filter will appear here."
      />

      <Modal
        open={Boolean(review)}
        onClose={() => setReview(null)}
        title={review?.action === "approve" ? "Approve leave request" : "Reject leave request"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setReview(null)} disabled={reviewAction.pending}>
              Cancel
            </Button>
            <Button variant={review?.action === "approve" ? "primary" : "danger"} onClick={confirmReview} loading={reviewAction.pending}>
              {review?.action === "approve" ? "Approve" : "Reject"}
            </Button>
          </>
        }
      >
        {review && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
              {review.request.employee?.fullName} — {leaveTypeLabel(review.request.leaveType)} · {formatDate(review.request.startDate)} to{" "}
              {formatDate(review.request.endDate)}
            </p>
            <FormField label="Comment" hint="Optional note visible to the employee.">
              {(props) => <Textarea {...props} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment (optional)" />}
            </FormField>
          </div>
        )}
      </Modal>
    </div>
  );
}
