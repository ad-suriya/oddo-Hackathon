import { useMemo, useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import Icon from "../../components/ui/Icon.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import Card, { CardHeader, CardBody } from "../../components/ui/Card.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import ErrorState, { friendlyErrorMessage } from "../../components/ui/ErrorState.jsx";
import { SkeletonCard } from "../../components/ui/Skeleton.jsx";
import LeaveRequestCard from "../../components/domain/LeaveRequestCard.jsx";
import LeaveRequestForm from "../../components/domain/LeaveRequestForm.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { useToast } from "../../context/ToastContext.jsx";
import { leaveService } from "../../services/leaveService.js";
import { summarizeLeave } from "../../utils/leave.js";
import styles from "../dashboard/Dashboard.module.css";

export default function LeavePage() {
  const toast = useToast();
  const leaveQuery = useAsync(() => leaveService.getMine(), []);
  const [formOpen, setFormOpen] = useState(false);

  const summary = useMemo(() => summarizeLeave(leaveQuery.data || []), [leaveQuery.data]);

  async function handleCreate(values) {
    await leaveService.create(values);
    await leaveQuery.refetch();
    setFormOpen(false);
    toast.success("Leave requested", "Your request has been submitted for review.");
  }

  return (
    <div>
      <PageHeader
        title="Leave"
        description="Track your leave balance and manage requests."
        actions={
          <Button leftIcon={<Icon name="plus" size={16} />} onClick={() => setFormOpen(true)}>
            Request leave
          </Button>
        }
      />

      <div className={styles.statGrid} style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <StatCard label="Available leave" value={summary.availableDays} meta="paid days remaining" icon={<Icon name="leave" size={18} />} loading={leaveQuery.loading} />
        <StatCard label="Pending" value={summary.pending} icon={<Icon name="clock" size={18} />} loading={leaveQuery.loading} />
        <StatCard label="Approved" value={summary.approved} icon={<Icon name="checkCircle" size={18} />} loading={leaveQuery.loading} />
        <StatCard label="Rejected" value={summary.rejected} icon={<Icon name="alertCircle" size={18} />} loading={leaveQuery.loading} />
      </div>

      <Card>
        <CardHeader title="Leave history" subtitle="All your leave requests, most recent first" />
        <CardBody>
          {leaveQuery.loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}
          {leaveQuery.error && <ErrorState description={friendlyErrorMessage(leaveQuery.error)} onRetry={leaveQuery.refetch} />}
          {!leaveQuery.loading && !leaveQuery.error && (leaveQuery.data?.length ?? 0) === 0 && (
            <EmptyState
              icon="leave"
              title="No leave requests yet."
              description="When you need time off, submit a request and track its status here."
              action={<Button onClick={() => setFormOpen(true)}>Request leave</Button>}
            />
          )}
          {!leaveQuery.loading && !leaveQuery.error && leaveQuery.data?.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {leaveQuery.data.map((request) => (
                <LeaveRequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <LeaveRequestForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} />
    </div>
  );
}
