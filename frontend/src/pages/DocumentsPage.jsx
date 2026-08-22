import PageHeader from "../components/ui/PageHeader.jsx";
import Card from "../components/ui/Card.jsx";
import DocumentList from "../components/domain/DocumentList.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { documentService } from "../services/documentService.js";

export default function DocumentsPage() {
  const { data, loading, error, refetch } = useAsync(() => documentService.getMine(), []);

  return (
    <div>
      <PageHeader title="Documents" description="Files and records shared with you by HR." />
      <Card>
        <DocumentList documents={data} loading={loading} error={error} onRetry={refetch} />
      </Card>
    </div>
  );
}
