import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  forceReleaseTerraformLock,
  getProject,
  getTerraformState,
  getTerraformStateLocks,
  getTerraformStateValidation,
  getTerraformStateVersions,
  recoverTerraformState,
  validateTerraformState,
} from "../api/projectApi.js";
import ErrorState from "../components/common/ErrorState.jsx";
import LoadingState from "../components/common/LoadingState.jsx";
import DeploymentQueuePanel from "../components/state/DeploymentQueuePanel.jsx";
import OrphanedLockWarningBanner from "../components/state/OrphanedLockWarningBanner.jsx";
import StateLockStatusCard from "../components/state/StateLockStatusCard.jsx";
import StateValidationResultsTable from "../components/state/StateValidationResultsTable.jsx";
import StateVersionsTable from "../components/state/StateVersionsTable.jsx";
import TerraformStateStatusCard from "../components/state/TerraformStateStatusCard.jsx";

export default function ProjectStateManagement() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [state, setState] = useState(null);
  const [lock, setLock] = useState(null);
  const [queue, setQueue] = useState([]);
  const [versions, setVersions] = useState([]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    load();
  }, [projectId]);

  async function load() {
    setError("");
    setIsLoading(true);

    try {
      const [projectResponse, stateResponse, locksResponse, versionsResponse, validationResponse] =
        await Promise.all([
          getProject(projectId),
          getTerraformState(projectId),
          getTerraformStateLocks(projectId),
          getTerraformStateVersions(projectId),
          getTerraformStateValidation(projectId),
        ]);
      setProject(projectResponse.project);
      setState(stateResponse.state);
      setLock(locksResponse.lock);
      setQueue(locksResponse.queue || []);
      setVersions(versionsResponse.versions || []);
      setResults(validationResponse.results || []);
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function validate() {
    try {
      await validateTerraformState(projectId);
      await load();
    } catch (caughtError) {
      setError(caughtError.message);
    }
  }

  async function recover(versionId) {
    try {
      await recoverTerraformState(projectId, versionId, "Restore previous valid state.");
      await load();
    } catch (caughtError) {
      setError(caughtError.message);
    }
  }

  async function forceRelease(lockId) {
    try {
      await forceReleaseTerraformLock(projectId, lockId);
      await load();
    } catch (caughtError) {
      setError(caughtError.message);
    }
  }

  if (isLoading) {
    return <LoadingState message="Loading Terraform state..." />;
  }

  return (
    <div className="grid">
      <div className="page-header">
        <div>
          <h1>State Management</h1>
          <p className="muted">{project?.name || "Project"} Terraform state safety.</p>
        </div>
        <div className="quick-actions">
          <Link className="secondary-button" to={`/projects/${projectId}/pipeline`}>
            Pipeline
          </Link>
          {project?.canManage ? (
            <button className="button" onClick={validate} type="button">
              Validate State
            </button>
          ) : null}
        </div>
      </div>

      {error ? <ErrorState message={error} /> : null}
      <OrphanedLockWarningBanner lock={lock} />
      <div className="grid two-column-grid">
        <TerraformStateStatusCard state={state} />
        <StateLockStatusCard
          canForceRelease={Boolean(project?.canManage)}
          lock={lock}
          onForceRelease={forceRelease}
        />
      </div>
      <DeploymentQueuePanel queue={queue} />
      <StateValidationResultsTable results={results} />
      <StateVersionsTable onRecover={recover} versions={versions} />
    </div>
  );
}
