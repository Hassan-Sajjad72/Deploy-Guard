export default function StartPipelineForm({
  canManage,
  isStarting,
  onStart,
}) {
  return (
    <section className="panel">
      <div className="page-header">
        <div>
          <h2>Start Pipeline</h2>
          <p className="muted">
            {canManage
              ? "Queue a CI/CD run for the selected project branch."
              : "Readonly users can view pipeline history."}
          </p>
        </div>
        {canManage ? (
          <button
            className="button"
            disabled={isStarting}
            onClick={onStart}
            type="button"
          >
            {isStarting ? "Queueing..." : "Start Pipeline"}
          </button>
        ) : null}
      </div>

      <div className="option-grid">
        {[
          "GitHub Actions",
          "Docker build",
          "Trivy scan",
          "ECR push",
          "ECR lifecycle policy",
          "Terraform stage",
        ].map((stage) => (
          <div className="check-row" key={stage}>
            <span>{stage}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
