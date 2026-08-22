import { SkeletonTableRows } from "./Skeleton.jsx";
import EmptyState from "./EmptyState.jsx";
import ErrorState, { friendlyErrorMessage } from "./ErrorState.jsx";
import styles from "./DataTable.module.css";

/**
 * Generic table driven by a `columns` config: [{ key, header, render?, width? }]
 * Handles loading/empty/error states consistently so pages don't reimplement them.
 */
export default function DataTable({
  columns,
  rows,
  getRowKey = (row, i) => row.id ?? i,
  loading = false,
  error = null,
  onRetry,
  emptyTitle = "Nothing here yet.",
  emptyDescription,
  emptyIcon,
  emptyAction,
  onRowClick,
}) {
  const showEmpty = !loading && !error && (!rows || rows.length === 0);

  return (
    <div className={styles.wrap}>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={col.width ? { width: col.width } : undefined}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <SkeletonTableRows rows={5} columns={columns.length} />}
            {!loading &&
              !error &&
              rows?.map((row) => (
                <tr
                  key={getRowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={onRowClick ? styles.clickableRow : undefined}
                >
                  {columns.map((col) => (
                    <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {showEmpty && (
        <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} action={emptyAction} />
      )}
      {error && (
        <ErrorState description={friendlyErrorMessage(error)} onRetry={onRetry} />
      )}
    </div>
  );
}
