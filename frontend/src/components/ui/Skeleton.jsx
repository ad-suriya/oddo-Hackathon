import styles from "./Skeleton.module.css";

export default function Skeleton({ width = "100%", height = 14, radius, className, style }) {
  return (
    <span
      className={[styles.skeleton, className].filter(Boolean).join(" ")}
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}

export function SkeletonText({ lines = 3, lastLineWidth = "60%" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? lastLineWidth : "100%"} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className={styles.card}>
      <Skeleton width="40%" height={12} />
      <Skeleton width="60%" height={26} />
      <Skeleton width="80%" height={12} />
    </div>
  );
}

export function SkeletonTableRows({ rows = 5, columns = 4 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: columns }).map((__, c) => (
            <td key={c} style={{ padding: "12px 16px" }}>
              <Skeleton height={12} width={c === 0 ? "80%" : "60%"} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
