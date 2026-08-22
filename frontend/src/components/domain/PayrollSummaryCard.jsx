import { Link } from "react-router-dom";
import Card, { CardHeader, CardBody, CardFooter } from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import { PaymentStatusBadge } from "../ui/StatusBadge.jsx";
import { formatCurrency } from "../../utils/formatters.js";
import styles from "./PayrollSummaryCard.module.css";

export default function PayrollSummaryCard({ payroll, linkTo = "/payroll" }) {
  return (
    <Card>
      <CardHeader title="Payroll Summary" subtitle={payroll ? payroll.payPeriod : undefined} />
      <CardBody>
        {payroll ? (
          <div className={styles.wrap}>
            <div>
              <span className={styles.label}>Net salary</span>
              <span className={styles.amount}>{formatCurrency(payroll.netPay, payroll.currency)}</span>
            </div>
            <PaymentStatusBadge status={payroll.paymentStatus} />
          </div>
        ) : (
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>No payroll information available.</p>
        )}
      </CardBody>
      <CardFooter>
        <Button as={Link} to={linkTo} variant="secondary" size="sm">
          View payroll details
        </Button>
      </CardFooter>
    </Card>
  );
}
