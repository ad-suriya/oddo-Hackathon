import Icon from "../ui/Icon.jsx";
import EmptyState from "../ui/EmptyState.jsx";
import ErrorState, { friendlyErrorMessage } from "../ui/ErrorState.jsx";
import { SkeletonCard } from "../ui/Skeleton.jsx";
import { formatDate } from "../../utils/formatters.js";
import styles from "./DocumentList.module.css";

function formatFileSize(bytes) {
  if (!bytes) return "—";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function iconForType(fileType) {
  if (fileType?.startsWith("image/")) return "camera";
  return "documents";
}

export default function DocumentList({ documents, loading, error, onRetry }) {
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return <ErrorState description={friendlyErrorMessage(error)} onRetry={onRetry} />;
  }

  if (!documents || documents.length === 0) {
    return <EmptyState icon="documents" title="No documents available." description="Documents shared by HR will appear here." />;
  }

  return (
    <div className={styles.list}>
      {documents.map((doc) => (
        <div className={styles.row} key={doc.id}>
          <span className={styles.iconWrap}>
            <Icon name={iconForType(doc.fileType)} size={18} />
          </span>
          <div className={styles.info}>
            <div className={styles.name}>{doc.fileName}</div>
            <div className={styles.meta}>
              {formatDate(doc.createdAt)} · {formatFileSize(doc.fileSizeBytes)}
              {doc.uploadedByName ? ` · Uploaded by ${doc.uploadedByName}` : ""}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
