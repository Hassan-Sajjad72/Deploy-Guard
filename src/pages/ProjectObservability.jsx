import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getObservabilityHealth,
  getObservabilityPipelineMetrics,
  getObservabilityRuntimeMetrics,
  getObservabilitySummary,
} from "../api/projectApi.js";
import ErrorState from "../components/common/ErrorState.jsx";
import LoadingState from "../components/common/LoadingState.jsx";
import GitHubActionsDurationCard from "../components/observability/GitHubActionsDurationCard.jsx";
import ObservabilityStatusBanner from "../components/observability/ObservabilityStatusBanner.jsx";
import PipelineMetricsTimeline from "../components/observability/PipelineMetricsTimeline.jsx";
import ServiceHealthCard from "../components/observability/ServiceHealthCard.jsx";
import StageDurationChart from "../components/observability/StageDurationChart.jsx";
import TrivyScanDurationCard from "../components/observability/TrivyScanDurationCard.jsx";

export default function ProjectObservability() {
  const { projectId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getObservabilitySummary(projectId),
      getObservabilityPipelineMetrics(projectId),
      getObservabilityRuntimeMetrics(projectId, { source: "auto", range: "1h" }),
      getObservabilityHealth(projectId),
    ])
      .then(([summary, pipeline, runtime, health]) => {
        if (mounted) setData({ summary, pipeline, runtime, health });
      })
      .catch((err) => mounted && setError(err.message));
    return () => {
      mounted = false;
    };
  }, [projectId]);

  if (error) return <ErrorState message={error} />;
  if (!data) return <LoadingState message="Loading observability..." />;

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h1>Observability</h1>
          <p className="muted">Pipeline timings, runtime telemetry, logs, and health.</p>
        </div>
        <div className="button-row">
          <Link className="secondary-button" to={`/projects/${projectId}/observability/logs`}>Logs</Link>
          <Link className="secondary-button" to={`/projects/${projectId}/observability/metrics`}>Metrics</Link>
        </div>
      </div>
      <ObservabilityStatusBanner summary={data.summary} runtime={data.runtime} />
      <div className="dashboard-grid">
        <GitHubActionsDurationCard workflow={data.pipeline.githubActions} />
        <TrivyScanDurationCard scan={data.pipeline.trivyScan} />
        <ServiceHealthCard health={data.health} />
      </div>
      <StageDurationChart metrics={data.pipeline.stageMetrics || []} />
      <PipelineMetricsTimeline metrics={data.pipeline.stageMetrics || []} />
    </div>
  );
}
