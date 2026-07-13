import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getBackups,
  getProject,
  getProjectStorage,
  getStorageEvents,
  getStorageMountConfig,
  getStorageRecommendation,
  provisionStorage,
  requestBackupRestore,
  updateStorageSettings,
} from "../api/projectApi.js";
import ErrorState from "../components/common/ErrorState.jsx";
import LoadingState from "../components/common/LoadingState.jsx";
import BackupStatusCard from "../components/storage/BackupStatusCard.jsx";
import EfsDetailsCard from "../components/storage/EfsDetailsCard.jsx";
import EfsMountConfigCard from "../components/storage/EfsMountConfigCard.jsx";
import PersistentStorageStatusCard from "../components/storage/PersistentStorageStatusCard.jsx";
import RestoreRequestPanel from "../components/storage/RestoreRequestPanel.jsx";
import StorageEventsTimeline from "../components/storage/StorageEventsTimeline.jsx";
import StorageRecommendationCard from "../components/storage/StorageRecommendationCard.jsx";
import StorageSettingsForm from "../components/storage/StorageSettingsForm.jsx";

export default function ProjectStorage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [storage, setStorage] = useState(null);
  const [events, setEvents] = useState([]);
  const [mountConfig, setMountConfig] = useState(null);
  const [backups, setBackups] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);

  useEffect(() => {
    loadPage();
  }, [projectId]);

  async function loadPage() {
    setError("");
    setIsLoading(true);

    try {
      const [
        projectResponse,
        recommendationResponse,
        storageResponse,
        eventsResponse,
        mountConfigResponse,
        backupsResponse,
      ] = await Promise.all([
        getProject(projectId),
        getStorageRecommendation(projectId),
        getProjectStorage(projectId),
        getStorageEvents(projectId),
        getStorageMountConfig(projectId),
        getBackups(projectId),
      ]);
      setProject(projectResponse.project);
      setRecommendation(recommendationResponse.recommendation || null);
      setStorage(storageResponse.storage || null);
      setEvents(eventsResponse.events || []);
      setMountConfig(mountConfigResponse.mountConfig || null);
      setBackups(backupsResponse.backups || []);
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveSettings(data) {
    setError("");
    setIsSaving(true);

    try {
      await updateStorageSettings(projectId, data);
      await loadPage();
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function queueProvision() {
    setError("");
    setIsProvisioning(true);

    try {
      await provisionStorage(projectId);
      await loadPage();
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setIsProvisioning(false);
    }
  }

  async function createRestoreRequest(data) {
    setError("");

    try {
      await requestBackupRestore(projectId, data);
      await loadPage();
    } catch (caughtError) {
      setError(caughtError.message);
    }
  }

  if (isLoading) {
    return <LoadingState message="Loading storage..." />;
  }

  if (error && !project) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="grid">
      <div className="page-header">
        <div>
          <h1>Persistent Storage</h1>
          <p className="muted">{project?.name || "Project"} EFS and backup settings.</p>
        </div>
        <div className="quick-actions">
          <Link className="secondary-button" to={`/projects/${projectId}`}>
            Project Details
          </Link>
          <Link className="secondary-button" to={`/projects/${projectId}/pipeline`}>
            CI/CD Pipeline
          </Link>
          <Link className="secondary-button" to={`/projects/${projectId}/costs`}>
            Cost Analysis
          </Link>
          <Link className="secondary-button" to={`/projects/${projectId}/state`}>
            State Management
          </Link>
        </div>
      </div>

      {error ? <ErrorState message={error} /> : null}

      <StorageRecommendationCard recommendation={recommendation} />
      <StorageSettingsForm
        canManage={Boolean(project?.canManage)}
        isProvisioning={isProvisioning}
        isSaving={isSaving}
        onProvision={queueProvision}
        onSave={saveSettings}
        storage={storage}
      />
      <PersistentStorageStatusCard storage={storage} />
      <EfsDetailsCard storage={storage} />
      <EfsMountConfigCard mountConfig={mountConfig} />
      <BackupStatusCard backups={backups} storage={storage} />
      <RestoreRequestPanel
        canManage={Boolean(project?.canManage)}
        onRequest={createRestoreRequest}
        storage={storage}
      />
      <StorageEventsTimeline events={events} />
    </div>
  );
}
