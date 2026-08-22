import { useEffect, useState } from "react";
import { apiGet } from "../api/client.js";

export default function HomePage() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiGet("/health").then(setHealth).catch((err) => setError(err.message));
  }, []);

  return (
    <main>
      <h1>Hackathon Project</h1>
      <p>Frontend → backend → database check:</p>
      {error && <p>Error: {error}</p>}
      {!error && !health && <p>Checking backend...</p>}
      {health && (
        <p>
          Backend: {health.status} — Database: {health.database}
        </p>
      )}
    </main>
  );
}
