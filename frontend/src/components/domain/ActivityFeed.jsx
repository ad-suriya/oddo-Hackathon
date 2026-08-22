import Icon from "../ui/Icon.jsx";
import EmptyState from "../ui/EmptyState.jsx";
import { SkeletonText } from "../ui/Skeleton.jsx";
import { formatDateTime } from "../../utils/formatters.js";
import styles from "./ActivityFeed.module.css";

export default function ActivityFeed({ items, loading }) {
  if (loading) {
    return (
      <div style={{ padding: "var(--space-5)" }}>
        <SkeletonText lines={4} />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return <EmptyState icon="clock" title="No recent activity." description="Recent check-ins, leave requests, and updates will show up here." />;
  }

  return (
    <div className={styles.list}>
      {items.map((item) => (
        <div key={item.id} className={styles.item}>
          <span className={styles.iconWrap}>
            <Icon name={item.icon} size={15} />
          </span>
          <div className={styles.text}>
            <div className={styles.title}>{item.title}</div>
            <div className={styles.time}>{formatDateTime(item.timestamp)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
