import Icon from "./Icon.jsx";
import Button from "./Button.jsx";
import styles from "./EmptyState.module.css";

export default function ErrorState({ title = "Something went wrong", description, onRetry, retryLabel = "Try again" }) {
  return (
    <div className={styles.wrap}>
      <span className={styles.icon} style={{ background: "var(--color-danger-50)", color: "var(--color-danger-600)" }}>
        <Icon name="alertTriangle" size={22} />
      </span>
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {onRetry && (
        <div style={{ marginTop: "var(--space-2)" }}>
          <Button variant="secondary" size="sm" onClick={onRetry} leftIcon={<Icon name="arrowLeft" size={14} style={{ transform: "rotate(45deg)" }} />}>
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export function friendlyErrorMessage(error) {
  if (!error) return "An unexpected error occurred.";
  if (error.status === 0) return "Unable to reach the server. Check your connection and try again.";
  if (error.status === 401) return "Your session has expired. Please sign in again.";
  if (error.status === 403) return "You don't have permission to view this.";
  if (error.status === 404) return "We couldn't find what you were looking for.";
  return error.message || "An unexpected error occurred.";
}
