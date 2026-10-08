import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  createCostEstimate,
  getCostEstimates,
  getCostSettings,
  getProject,
  updateCostSettings,
} from "../api/projectApi.js";
import EmptyState from "../components/common/EmptyState.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import LoadingState from "../components/common/LoadingState.jsx";
import CostPolicyBanner from "../components/finops/CostPolicyBanner.jsx";
import CostSettingsForm from "../components/finops/CostSettingsForm.jsx";
import CostSummaryCard from "../components/finops/CostSummaryCard.jsx";

function formatDate(value) {
  return value
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "-";
}

function money(value, currency = "USD") {
  return new Intl.NumberFormat(undefined, {
    currency,
    style: "currency",
  }).format(Number(value || 0));
}

export default function ProjectCost() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [estimates, setEstimates] = useState([]);
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    loadPage();
  }, [projectId]);

  async function loadPage() {
    setError("");
    setIsLoading(true);

    try {
      const [projectResponse, estimatesResponse, settingsResponse] = await Promise.all([
        getProject(projectId),
        getCostEstimates(projectId),
        getCostSettings(projectId),
      ]);
      setProject(projectResponse.project);
      setEstimates(estimatesResponse.estimates || []);
      setSettings(settingsResponse.settings);
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function generateEstimate() {
    setError("");
    setIsGenerating(true);

    try {
      const response = await createCostEstimate(projectId);
      setEstimates((current) => [response.estimate, ...current]);
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setIsGenerating(false);
    }
  }

  async function saveSettings(nextSettings) {
    setError("");
    setIsSavingSettings(true);

    try {
      const response = await updateCostSettings(projectId, nextSettings);
      setSettings(response.settings);
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setIsSavingSettings(false);
    }
  }

  if (isLoading) {
    return <LoadingState message="Loading cost analysis..." />;
  }

  if (error && !project) {
    return <ErrorState message={error} />;
  }

  const latestEstimate = estimates[0] || null;

  return (
    <div className="grid">
      <div className="page-header">
        <div>
          <h1>Cost Analysis</h1>
          <p className="muted">{project?.name || "Project"} monthly cloud estimate.</p>
        </div>
        <div className="quick-actions">
          <Link className="secondary-button" to={`/projects/${projectId}`}>
            Project Details
          </Link>
          <Link className="secondary-button" to={`/projects/${projectId}/pipeline`}>
            Pipeline
          </Link>
          {project?.canManage ? (
            <button
              className="button"
              disabled={isGenerating}
              onClick={generateEstimate}
              type="button"
            >
              {isGenerating ? "Generating..." : "Generate Estimate"}
            </button>
          ) : null}
        </div>
      </div>

      {error ? <ErrorState message={error} /> : null}
      <CostPolicyBanner estimate={latestEstimate} />
      <CostSummaryCard estimate={latestEstimate} />
      <CostSettingsForm
        canManage={Boolean(project?.canManage)}
        isSaving={isSavingSettings}
        onSave={saveSettings}
        settings={settings}
      />

      {estimates.length === 0 ? (
        <EmptyState message="No cost estimates have been generated yet." />
      ) : null}

      <section className="panel">
        <h2>Estimate History</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Source</th>
                <th>Total</th>
                <th>Tier</th>
                <th>Pipeline Run</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {estimates.map((estimate) => (
                <tr key={estimate.id}>
                  <td>
                    <Link
                      className="ghost-button"
                      to={`/projects/${projectId}/costs/${estimate.id}`}
                    >
                      {estimate.status?.replaceAll("_", " ")}
                    </Link>
                  </td>
                  <td>{estimate.source}</td>
                  <td>{money(estimate.totalMonthlyCost, estimate.currency)}</td>
                  <td>{estimate.subscriptionTier}</td>
                  <td className="wrap-cell">{estimate.pipelineRunId || "-"}</td>
                  <td>{formatDate(estimate.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
