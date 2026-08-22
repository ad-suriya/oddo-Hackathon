import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <EmptyState
        icon="alertCircle"
        title="Page not found"
        description="The page you're looking for doesn't exist or may have moved."
        action={
          <Button as={Link} to="/dashboard">
            Back to dashboard
          </Button>
        }
      />
    </div>
  );
}
