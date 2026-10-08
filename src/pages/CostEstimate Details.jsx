import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  approveCostEstimate,
  getCostEstimate,
  getProject,
  rejectCostEstimate,
} from "../api/projectApi.js";
import ErrorState from "../components/common/ErrorState.jsx";
import LoadingState from "../components/common/LoadingState.jsx";
import CostApprovalPanel from "../components/finops/CostApprovalPanel.jsx";
import CostBreakdownTable from "../components/finops/CostBreakdownTable.jsx";
import CostPolicyBanner from "../components/finops/CostPolicyBanner.jsx";
import CostSummaryCard from "../components/finops/CostSummaryCard.jsx";

export default function CostEstimateDetails() {
  const { projectId, estimateId } = useParams();
  const [project, setProject] = useState(null);
  const [estimate, setEstimate] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPage();
  }, [projectId, estimateId]);

  async function loadPage() {
    setError("");
    setIsLoading(true);

    try {
      const [projectResponse, estimateResponse] = await Promise.all([
        getProject(projectId),
        getCostEstimate(projectId, estimateId),
      ]);
      setProject(projectResponse.project);
      setEstimate(estimateResponse.estimate);
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function approve() {
    const response = await approveCostEstimate(projectId, estimateId);
    setEstimate(response.estimate);
  }

  async function reject(reason) {
    const response = await rejectCostEstimate(projectId, estimateId, reason);
    setEstimate(response.estimate);
  }

  if (isLoading) {
    return <LoadingState message="Loading cost estimate..." />;
  }

  if (error && !estimate) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="grid">
      <div className="page-header">
        <div>
          <h1>Cost Estimate Details</h1>
          <p className="muted">{project?.name || "Project"}</p>
        </div>
        <div className="quick-actions">
          <Link className="secondary-button" to={`/projects/${projectId}/costs`}>
            Cost Analysis
          </Link>
          <Link className="secondary-button" to={`/projects/${projectId}/pipeline`}>
            Pipeline
          </Link>
        </div>
      </div>

      {error ? <ErrorState message={error} /> : null}
      <CostPolicyBanner estimate={estimate} />
      <div className="grid two-column-grid">
        <CostSummaryCard estimate={estimate} />
        <CostApprovalPanel
          canManage={Boolean(project?.canManage)}
          estimate={estimate}
          onApprove={approve}
          onReject={reject}
        />
      </div>
      <CostBreakdownTable
        breakdowns={estimate?.breakdowns || []}
        currency={estimate?.currency || "USD"}
      />
    </div>
  );
}
