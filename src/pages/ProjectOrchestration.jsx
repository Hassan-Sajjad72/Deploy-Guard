import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  deployOrchestration,
  getOrchestrationEvents,
  getOrchestrationStatus,
  rollbackOrchestration,
  updateOrchestrationScaling,
} from "../api/projectApi.js";
import ErrorState from "../components/common/ErrorState.jsx";
import LoadingState from "../components/common/LoadingState.jsx";
import AlbHealthStatusCard from "../components/orchestration/AlbHealthStatusCard.jsx";
import AutoScalingPolicyCard from "../components/orchestration/AutoScalingPolicyCard.jsx";
import DeploymentUrlCard from "../components/orchestration/DeploymentUrlCard.jsx";
import EcsDeploymentStatusCard from "../components/orchestration/EcsDeploymentStatusCard.jsx";
import FargateSpotStatusCard from "../components/orchestration/FargateSpotStatusCard.jsx";
import OrchestrationEventsTimeline from "../components/orchestration/OrchestrationEventsTimeline.jsx";
import RollbackPanel from "../components/orchestration/RollbackPanel.jsx";
import SpotInterruptionEventsTable from "../components/orchestration/SpotInterruptionEventsTable.jsx";
import StableReleaseCard from "../components/orchestration/StableReleaseCard.jsx";

export default function ProjectOrchestration() {
  const { projectId } = useParams();
  const [status, setStatus] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    loadPage();
  }, [projectId]);

  async function loadPage() {
    setError("");
    setIsLoading(true);

    try {
      const [statusResponse, eventsResponse] = await Promise.all([
        getOrchestrationStatus(projectId),
        getOrchestrationEvents(projectId),
      ]);
      setStatus(statusResponse);
      setEvents(eventsResponse.events || []);
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function deploy() {
    setError("");
    setIsDeploying(true);

    try {
      await deployOrchestration(projectId);
      await loadPage();
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setIsDeploying(false);
    }
  }

  async function rollback(reason) {
    setError("");

    try {
      await rollbackOrchestration(projectId, reason);
      await loadPage();
    } catch (caughtError) {
      setError(caughtError.message);
    }
  }

  async function updateScaling(data) {
    setError("");

    try {
      await updateOrchestrationScaling(projectId, data);
      await loadPage();
    } catch (caughtError) {
      setError(caughtError.message);
    }
  }

  if (isLoading) {
    return <LoadingState message="Loading orchestration..." />;
  }

  return (
    <div className="grid">
      <div className="page-header">
        <div>
          <h1>Orchestration</h1>
          <p className="muted">ECS Fargate Spot deployment, health, scaling, and rollback.</p>
        </div>
        <div className="quick-actions">
          <Link className="secondary-button" to={`/projects/${projectId}`}>
            Project Details
          </Link>
          <Link className="secondary-button" to={`/projects/${projectId}/pipeline`}>
            Pipeline
          </Link>
          <Link className="secondary-button" to={`/projects/${projectId}/orchestration/releases`}>
            Releases
          </Link>
          <button className="button" disabled={isDeploying || !status?.canManage} onClick={deploy} type="button">
            {isDeploying ? "Queued" : "Deploy"}
          </button>
        </div>
      </div>

      {error ? <ErrorState message={error} /> : null}

      <EcsDeploymentStatusCard deployment={status?.deployment} />
      <DeploymentUrlCard deployment={status?.deployment} />
      <StableReleaseCard release={status?.stableRelease} />
      <AlbHealthStatusCard targetHealth={status?.targetHealth} />
      <FargateSpotStatusCard scaling={status?.scaling} />
      <AutoScalingPolicyCard
        canManage={Boolean(status?.canManage)}
        onUpdate={updateScaling}
        scaling={status?.scaling}
      />
      <RollbackPanel
        canManage={Boolean(status?.canManage)}
        hasRelease={Boolean(status?.stableRelease)}
        onRollback={rollback}
      />
      <SpotInterruptionEventsTable events={status?.spotEvents || []} />
      <OrchestrationEventsTimeline events={events} />
    </div>
  );
}
