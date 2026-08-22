import Button from "./Button.jsx";
import Icon from "./Icon.jsx";
import styles from "./Pagination.module.css";

/**
 * Paired with the backend's paginated envelope ({page, limit, total,
 * totalPages}) returned by GET /employees and GET /payroll — see
 * docs/API.md §6/§9. Renders nothing for a single page so it's safe to
 * drop at the bottom of any list unconditionally.
 */
export default function Pagination({ page, limit, total, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className={styles.wrap}>
      <span className={styles.summary}>
        Showing {from}–{to} of {total}
      </span>
      <div className={styles.controls}>
        <Button
          variant="secondary"
          size="sm"
          iconOnly
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <Icon name="chevronLeft" size={16} />
        </Button>
        <span className={styles.pageLabel}>
          Page {page} of {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          iconOnly
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <Icon name="chevronRight" size={16} />
        </Button>
      </div>
    </div>
  );
}
