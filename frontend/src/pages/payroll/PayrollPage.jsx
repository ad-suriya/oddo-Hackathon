import PageHeader from "../../components/ui/PageHeader.jsx";
import Card, { CardHeader, CardBody } from "../../components/ui/Card.jsx";
import { PaymentStatusBadge } from "../../components/ui/StatusBadge.jsx";
import { SkeletonText } from "../../components/ui/Skeleton.jsx";
import ErrorState, { friendlyErrorMessage } from "../../components/ui/ErrorState.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { payrollService } from "../../services/payrollService.js";
import { formatCurrency } from "../../utils/formatters.js";
import styles from "./PayrollPage.module.css";

export default function PayrollPage() {
  const { data: payroll, loading, error, refetch } = useAsync(() => payrollService.getMine(), []);

  return (
    <div>
      <PageHeader title="Payroll" description="Your current salary structure and payment status." />

      {error && <ErrorState description={friendlyErrorMessage(error)} onRetry={refetch} />}

      {!error && loading && (
        <Card>
          <CardBody>
            <SkeletonText lines={4} />
          </CardBody>
        </Card>
      )}

      {!error && !loading && payroll && (
        <>
          <div className={styles.summary}>
            <div>
              <div className={styles.netLabel}>Net salary — {payroll.payPeriod}</div>
              <div className={styles.netValue}>{formatCurrency(payroll.netPay, payroll.currency)}</div>
            </div>
            <PaymentStatusBadge status={payroll.paymentStatus} />
          </div>

          <Card>
            <CardHeader title="Salary breakdown" subtitle="Current structure on file" />
            <CardBody tight>
              <div className={styles.breakdown}>
                <div className={styles.row}>
                  <span className={styles.rowLabel}>Basic pay</span>
                  <span className={styles.rowValue}>{formatCurrency(payroll.basicPay, payroll.currency)}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.rowLabel}>Allowances</span>
                  <span className={styles.rowValue}>{formatCurrency(payroll.allowances, payroll.currency)}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.rowLabel}>Deductions</span>
                  <span className={[styles.rowValue, styles.deduction].join(" ")}>
                    − {formatCurrency(payroll.deductions, payroll.currency)}
                  </span>
                </div>
                <div className={styles.row}>
                  <span className={styles.rowLabel}>Net salary</span>
                  <span className={styles.rowValue}>{formatCurrency(payroll.netPay, payroll.currency)}</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
