import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getObservabilityLogs } from "../api/projectApi.js";
import ErrorState from "../components/common/ErrorState.jsx";
import EcsLogsStream from "../components/observability/EcsLogsStream.jsx";
import LogFilterBar from "../components/observability/LogFilterBar.jsx";

export default function ProjectLogs() {
  const { projectId } = useParams();
  const [filters, setFilters] = useState({ limit: 50, stream: "all" });
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  function refresh() {
    setError("");
    getObservabilityLogs(projectId, filters)
      .then((data) => setLogs(data.events || []))
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    refresh();
  }, [projectId]);

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h1>ECS Logs</h1>
          <p className="muted">Sanitized CloudWatch log events and live SSE stream.</p>
        </div>
        <Link className="secondary-button" to={`/projects/${projectId}/observability`}>Overview</Link>
      </div>
      {error ? <ErrorState message={error} /> : null}
      <LogFilterBar filters={filters} onChange={setFilters} onRefresh={refresh} />
      <EcsLogsStream filters={filters} projectId={projectId} />
      <section className="panel">
        <h2>Recent Logs</h2>
        <pre className="log-output">{logs.map((line) => `[${line.timestamp}] ${line.message}`).join("\n")}</pre>
      </section>
    </div>
  );
}
