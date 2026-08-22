import Skeleton from "./Skeleton.jsx";
import styles from "./StatCard.module.css";

export default function StatCard({ label, value, meta, icon, loading = false }) {
  return (
    <div className={styles.card}>
      <div className={styles.text}>
        <span className={styles.label}>{label}</span>
        {loading ? <Skeleton width={72} height={28} /> : <span className={styles.value}>{value}</span>}
        {meta && !loading && <span className={styles.meta}>{meta}</span>}
      </div>
      {icon && <span className={styles.iconWrap}>{icon}</span>}
    </div>
  );
}
